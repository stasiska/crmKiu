const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const db = require('../db');

const {
  validate,
  loginSchema,
  senderSchema,
  updateSenderSchema,
  commentSchema,
  templateSchema,
  updateTemplateSchema,
  createUserSchema,
  updateUserSchema,
  reminderSchema,
  updateReminderSchema,
  taskSchema,
  updateTaskSchema,
} = require('../validators');

const recipientCtrl = require('../controllers/recipientController');
const senderCtrl = require('../controllers/senderController');
const logCtrl = require('../controllers/logController');
const sendCtrl = require('../controllers/sendController');
const { canSend } = require('../services/rateLimiter');
const { login, verifyToken } = require('../services/authService');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// ---- Публичные маршруты ----
router.post('/auth/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ---- SSE для прогресса ----
const sseClients = [];
router.get('/send/progress', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: 'Токен не передан' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Недействительный токен' });
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res, userId: decoded.id };
  sseClients.push(newClient);

  req.on('close', () => {
    const index = sseClients.findIndex(c => c.id === clientId);
    if (index > -1) sseClients.splice(index, 1);
  });
});

// ---- Защита всех остальных маршрутов ----
router.use(authMiddleware);

// ---- Получатели ----
router.post('/recipients/import', upload.single('file'), recipientCtrl.importRecipients);
router.get('/recipients', recipientCtrl.getRecipients);
router.get('/recipients/filters', recipientCtrl.getFiltersOptions);
router.get('/recipients/organizations', recipientCtrl.getDistinctOrganizations);
router.get('/recipients/count', recipientCtrl.countRecipients);

// ---- Отправители ----
router.get('/senders', senderCtrl.getAllSenders);
router.post('/senders', validate(senderSchema), senderCtrl.createSender);
router.get('/senders/:id', senderCtrl.getSender);
router.put('/senders/:id', validate(updateSenderSchema), senderCtrl.updateSender);
router.delete('/senders/:id', senderCtrl.deleteSender);

// ---- Статистика отправителя ----
router.get('/senders/:id/stats', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const daily = await db.getDailyCount(id);
    res.json({ daily });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Пользователь (auth/me) ----
router.get('/auth/me', async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Логи ----
router.get('/logs', logCtrl.getLogs);
router.delete('/logs', logCtrl.clearLogs);

// ---- Отправка писем ----
router.post('/send', async (req, res) => {
  const { senderId, recipientIds, subject, body, ignoreDuplicate } = req.body;
  if (!senderId || !recipientIds || !recipientIds.length || !subject || !body) {
    return res.status(400).json({ error: 'Не все поля заполнены' });
  }
  const limitCheck = await canSend(senderId);
  if (!limitCheck.allowed) {
    return res.status(429).json({ error: `Лимит превышен: ${limitCheck.reason}` });
  }
  try {
    const result = await sendCtrl.startSend(
      senderId,
      recipientIds,
      subject,
      body,
      ignoreDuplicate,
      req.user.id
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Остановка отправки ----
router.post('/send/stop', (req, res) => {
  sendCtrl.stopSend();
  res.sendStatus(200);
});

// ---- Функция для SSE ----
function emitProgress(data) {
  const { userId } = data;
  sseClients.forEach(client => {
    if (client.userId === userId) {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });
}
const emailService = require('../services/emailService');
emailService.on('progress', emitProgress);
emailService.on('paused', emitProgress);
emailService.on('done', emitProgress);

// ---- Шаблоны ----
const templateCtrl = require('../controllers/templateController');
router.get('/templates', templateCtrl.getTemplates);
router.get('/templates/:id', templateCtrl.getTemplate);
router.post('/templates', validate(templateSchema), isAdmin, templateCtrl.addTemplate);
router.put('/templates/:id', validate(updateTemplateSchema), isAdmin, templateCtrl.updateTemplate);
router.delete('/templates/:id', isAdmin, templateCtrl.deleteTemplate);

// ---- Очистка базы ----
router.delete('/clear-database', isAdmin, async (req, res) => {
  try {
    await db.clearDatabase();
    res.json({ success: true, message: 'База данных очищена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Комментарий (обновление в recipients) ----
router.put('/recipients/:id/comment', validate(commentSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { comment } = req.body;
    const ok = await db.updateRecipientComment(id, comment);
    if (!ok) return res.status(404).json({ error: 'Получатель не найден' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Напоминания ----
const reminderCtrl = require('../controllers/reminderController');
router.get('/reminders/due-count', reminderCtrl.getDueCount);
router.post('/reminders', validate(reminderSchema), reminderCtrl.createReminder);
router.get('/reminders', reminderCtrl.getReminders);
router.get('/reminders/:id', reminderCtrl.getReminder);
router.put('/reminders/:id', validate(updateReminderSchema), reminderCtrl.updateReminder);
router.delete('/reminders/:id', reminderCtrl.deleteReminder);

// ---- Задачи (Tasks) ----
const taskCtrl = require('../controllers/taskController');
router.get('/tasks', taskCtrl.getTasks);
router.get('/tasks/:id', taskCtrl.getTask);
router.post('/tasks', validate(taskSchema), taskCtrl.createTask);
router.put('/tasks/:id', validate(updateTaskSchema), taskCtrl.updateTask);
router.delete('/tasks/:id', taskCtrl.deleteTask);

// ---- Пользователи ----
const userCtrl = require('../controllers/userController');
router.get('/users', userCtrl.getUsers);
router.post('/users', validate(createUserSchema), isAdmin, userCtrl.createUser);
router.put('/users/:id', validate(updateUserSchema), isAdmin, userCtrl.updateUser);
router.delete('/users/:id', isAdmin, userCtrl.deleteUser);

// ---- Уведомления ----
const notificationCtrl = require('../controllers/notificationController');
router.get('/notifications', notificationCtrl.getNotifications);
router.get('/notifications/unread-count', notificationCtrl.getUnreadCount);
router.put('/notifications/:id/read', notificationCtrl.markAsRead);
router.get('/unread-total', notificationCtrl.getUnreadTotal);

// ---- Комментарии (история) ----
const commentCtrl = require('../controllers/commentController');
router.get('/recipients/:recipientId/comments', commentCtrl.getComments);
router.post('/recipients/:recipientId/comments', validate(commentSchema), commentCtrl.addComment);

module.exports = router;