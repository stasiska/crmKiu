const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB лимит
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только Excel файлы (.xls, .xlsx) разрешены'));
    }
  }
});

const uploadDocx = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB лимит
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только Word файлы (.docx) разрешены'));
    }
  }
});

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
  organizationSchema,
  updateOrganizationSchema,
  listenerSchema,
  updateListenerSchema,
  noteSchema,
  updateNoteSchema,
  groupSchema,
  updateGroupSchema,
  addListenersSchema,
} = require('../validators');

const recipientCtrl = require('../controllers/recipientController');
const senderCtrl = require('../controllers/senderController');
const logCtrl = require('../controllers/logController');
const sendCtrl = require('../controllers/sendController');
const { canSend } = require('../services/rateLimiter');
const { login, verifyToken } = require('../services/authService');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// ---- Rate Limiter для login ----
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток
  message: { error: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Не считаем успешные попытки
});

// ---- Публичные маршруты ----
router.post('/auth/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    // Устанавливаем httpOnly cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // только HTTPS в продакшене
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 день
    });
    // Возвращаем токен в теле (для клиента, который использует заголовок)
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ---- SSE для прогресса ----
const sseClients = [];
router.get('/send/progress', (req, res) => {
   const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Токен не передан' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
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

  // Валидация recipientIds
  if (!senderId || !recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
    return res.status(400).json({ error: 'Не передан senderId или recipientIds (должен быть массив чисел)' });
  }
  // Проверка, что все элементы – числа
  if (!recipientIds.every(id => Number.isInteger(id))) {
    return res.status(400).json({ error: 'recipientIds должен содержать только целые числа' });
  }

  if (!subject || !body) {
    return res.status(400).json({ error: 'Тема и тело письма обязательны' });
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

// ---- Организации ----
const organizationCtrl = require('../controllers/organizationController');
router.get('/organizations', organizationCtrl.getOrganizations);
router.get('/organizations/options', organizationCtrl.getOrganizationsOptions);
router.get('/organizations/:id', organizationCtrl.getOrganization);
router.post('/organizations', validate(organizationSchema), organizationCtrl.createOrganization);
router.put('/organizations/:id', validate(updateOrganizationSchema), organizationCtrl.updateOrganization);
router.delete('/organizations/:id', organizationCtrl.deleteOrganization);

// ---- Слушатели ----
const listenerCtrl = require('../controllers/listenerController');
router.get('/listeners', listenerCtrl.getListeners);
router.get('/listeners/options', listenerCtrl.getListenersOptions);
router.get('/listeners/:id', listenerCtrl.getListener);
router.post('/listeners', validate(listenerSchema), listenerCtrl.createListener);
router.put('/listeners/:id', validate(updateListenerSchema), listenerCtrl.updateListener);
router.delete('/listeners/:id', listenerCtrl.deleteListener);

// ---- Заметки организаций ----
const noteCtrl = require('../controllers/organizationNoteController');
router.get('/organizations/:organizationId/notes', noteCtrl.getNotes);
router.get('/organizations/:organizationId/notes/:id', noteCtrl.getNote);
router.post('/organizations/:organizationId/notes', validate(noteSchema), noteCtrl.createNote);
router.put('/organizations/:organizationId/notes/:id', validate(updateNoteSchema), noteCtrl.updateNote);
router.delete('/organizations/:organizationId/notes/:id', noteCtrl.deleteNote);

// ===== Группы =====
const groupCtrl = require('../controllers/groupController');
router.get('/groups', groupCtrl.getGroups);
router.get('/groups/:id', groupCtrl.getGroup);
router.post('/groups', validate(groupSchema), groupCtrl.createGroup);
router.put('/groups/:id', validate(updateGroupSchema), groupCtrl.updateGroup);
router.delete('/groups/:id', groupCtrl.deleteGroup);

// ===== Участники групп =====
const groupListenerCtrl = require('../controllers/groupListenerController');
router.get('/groups/:groupId/listeners', groupListenerCtrl.getListeners);
router.post('/groups/:groupId/listeners', validate(addListenersSchema), groupListenerCtrl.addListeners);
router.delete('/groups/:groupId/listeners/:listenerId', groupListenerCtrl.removeListener);
router.delete('/groups/:groupId/listeners', groupListenerCtrl.clearListeners);
router.put('/groups/:groupId/listeners/:listenerId', groupCtrl.updateGroupListener);

// ===== Заметки слушателей =====
const listenerNoteCtrl = require('../controllers/listenerNoteController');
router.get('/listeners/:id/notes', listenerNoteCtrl.getListenerNotes);
router.post('/listeners/:id/notes', validate(noteSchema), listenerNoteCtrl.createListenerNote);
router.put('/listeners/:id/notes/:noteId', validate(updateNoteSchema), listenerNoteCtrl.updateListenerNote);
router.delete('/listeners/:id/notes/:noteId', listenerNoteCtrl.deleteListenerNote);

// ===== История групп слушателя =====
router.get('/listeners/:id/groups', listenerNoteCtrl.getListenerGroupHistory);

// ===== Приказы (документы групп) =====
const orderCtrl = require('../controllers/orderController');
const { generateOrderSchema, attachOrderSchema, uploadOrderSchema } = require('../validators/orderValidator');
const multerOrders = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только файлы .docx'));
    }
  }
});
router.post('/groups/:groupId/orders/generate', validate(generateOrderSchema), orderCtrl.generateOrder);
router.post('/groups/:groupId/orders', validate(attachOrderSchema), orderCtrl.attachOrder);
router.post('/groups/:groupId/orders/upload', multerOrders.single('file'), validate(uploadOrderSchema), orderCtrl.uploadOrder);
router.get('/groups/:groupId/orders', orderCtrl.getGroupOrders);
router.get('/groups/:groupId/orders/:orderId/download', orderCtrl.downloadOrder);
router.delete('/groups/:groupId/orders/:orderId', orderCtrl.deleteOrder);

// ===== Филиалы =====
const branchCtrl = require('../controllers/branchController');
const { createBranchSchema, updateBranchSchema } = require('../validators/branchValidator');
router.get('/branches', branchCtrl.getBranches);
router.get('/branches/:id', branchCtrl.getBranch);
router.post('/branches', isAdmin, validate(createBranchSchema), branchCtrl.createBranch);
router.put('/branches/:id', isAdmin, validate(updateBranchSchema), branchCtrl.updateBranch);
router.delete('/branches/:id', isAdmin, branchCtrl.deleteBranch);

// ===== Шаблоны документов =====
const docTemplateCtrl = require('../controllers/documentTemplateController');
router.get('/document-templates', isAdmin, docTemplateCtrl.getTemplates);
router.get('/document-templates/:id', isAdmin, docTemplateCtrl.getTemplate);
router.post('/document-templates', isAdmin, docTemplateCtrl.createTemplate);
router.put('/document-templates/:id', isAdmin, docTemplateCtrl.updateTemplate);
router.delete('/document-templates/:id', isAdmin, docTemplateCtrl.deleteTemplate);

// Document generation and management
const documentCtrl = require('../controllers/documentController');
router.post('/groups/:groupId/documents/generate', authMiddleware, documentCtrl.generateDocument);
router.post('/groups/:groupId/documents/attach', authMiddleware, documentCtrl.attachDocument);
router.get('/groups/:groupId/documents', authMiddleware, documentCtrl.getGroupDocuments);
router.get('/groups/:groupId/documents/:documentId/download', authMiddleware, documentCtrl.downloadDocument);
router.delete('/groups/:groupId/documents/:documentId', authMiddleware, documentCtrl.deleteDocument);
router.post('/groups/:groupId/documents/upload', authMiddleware, uploadDocx.single('file'), documentCtrl.uploadDocument);

module.exports = router;