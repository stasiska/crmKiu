const { Pool } = require('pg');
const { runMigrations } = require('./migrations');
const config = require('../config');

// --- Конфигурация ---
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: 20,
  idleTimeoutMillis: 30000,
});

// --- Миграция при первом запуске ---
(async () => {
  await runMigrations(pool);
})();

// ---- Вспомогательная функция для выполнения запросов ----
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('DB Error:', err);
    throw err;
  }
}

// ---- Вспомогательные белые списки для обновлений ----
const ALLOWED_SENDER_FIELDS = ['name', 'email', 'host', 'port', 'secure', 'password'];
const ALLOWED_TEMPLATE_FIELDS = ['name', 'subject', 'body'];
const ALLOWED_REMINDER_FIELDS = ['reminder_date', 'message', 'is_completed'];
const ALLOWED_TASK_FIELDS = ['title', 'description', 'status', 'assigned_to', 'deadline'];
const ALLOWED_USER_FIELDS = ['name', 'role', 'password_hash']; // при необходимости можно добавить 'email'

// ---- Senders ----

async function getSenders(userId) {
  const res = await query('SELECT * FROM senders WHERE user_id = $1', [userId]);
  return res.rows;
}

async function getSender(id, userId) {
  const res = await query('SELECT * FROM senders WHERE id = $1 AND user_id = $2', [id, userId]);
  return res.rows[0] || null;
}

async function addSender(sender, userId) {
  const { name, email, host, port, secure, password } = sender;
  const res = await query(
    `INSERT INTO senders (name, email, host, port, secure, password, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [name, email, host, port, secure, password, userId]
  );
  return res.rows[0].id;
}

async function updateSender(id, userId, updates) {
  // Фильтруем только разрешённые поля
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_SENDER_FIELDS.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});
  
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(filtered)) {
    fields.push(`${key} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return false;
  values.push(id, userId);
  const sql = `UPDATE senders SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx+1}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteSender(id, userId) {
  const res = await query('DELETE FROM senders WHERE id = $1 AND user_id = $2', [id, userId]);
  return res.rowCount > 0;
}

// ---- Recipients ----

async function getRecipients(filters = {}) {
  let sql = 'SELECT * FROM recipients WHERE 1=1';
  const values = [];
  let idx = 1;
  if (filters.city) {
    sql += ` AND city = $${idx}`;
    values.push(filters.city);
    idx++;
  }
  if (filters.specialization) {
    sql += ` AND specialization = $${idx}`;
    values.push(filters.specialization);
    idx++;
  }
  if (filters.organization) {
    sql += ` AND organization = $${idx}`;
    values.push(filters.organization);
    idx++;
  }
  if (filters.search) {
    sql += ` AND (email ILIKE $${idx} OR name ILIKE $${idx})`;
    values.push(`%${filters.search}%`);
    idx++;
  }
  sql += ' ORDER BY imported_at DESC';
  const res = await query(sql, values);
  return res.rows;
}

async function addRecipients(rows) {
  const inserted = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = row.email || row['e-mail'] || row['почта'] || '';
    if (!email) continue;

    // Проверяем существование
    const exists = await query('SELECT id FROM recipients WHERE email = $1', [email]);
    if (exists.rows.length > 0) continue;

    const name = row.name || row.имя || row.фио || '';
    const city = row.city || row.город || row.округ || row.регион || '';
    const specialization = row.specialization || row.специализация || row.профессия || row.role || '';
    const organization = row.organization || row.организация || row.company || row.компания || row.org || '';
    const phone = row.phone || row.телефон || '';
    const comment = row.comment || row.комментарий || '';
    const extra = JSON.stringify(row);

    const res = await query(
      `INSERT INTO recipients (email, name, city, specialization, organization, phone, comment, extra)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [email, name, city, specialization, organization, phone, comment, extra]
    );
    inserted.push({ id: res.rows[0].id, email });
  }
  return inserted.length;
}

async function getRecipientsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i+1}`).join(',');
  const res = await query(`SELECT * FROM recipients WHERE id IN (${placeholders})`, ids);
  return res.rows;
}

async function getDistinctCities() {
  const res = await query('SELECT DISTINCT city FROM recipients WHERE city IS NOT NULL AND city != \'\'');
  return res.rows.map(r => ({ city: r.city }));
}

async function getDistinctSpecializations() {
  const res = await query('SELECT DISTINCT specialization FROM recipients WHERE specialization IS NOT NULL AND specialization != \'\'');
  return res.rows.map(r => ({ specialization: r.specialization }));
}

async function getDistinctOrganizations() {
  const res = await query('SELECT DISTINCT organization FROM recipients WHERE organization IS NOT NULL AND organization != \'\'');
  return res.rows.map(r => ({ organization: r.organization }));
}

async function countRecipients() {
  const res = await query('SELECT COUNT(*) as count FROM recipients');
  return parseInt(res.rows[0].count);
}

async function updateRecipientComment(id, comment) {
  const res = await query('UPDATE recipients SET comment = $1 WHERE id = $2', [comment, id]);
  return res.rowCount > 0;
}

// ---- Logs ----

async function addLog(entry) {
  const { recipient_email, sender_id, subject, body_preview, status, error_message } = entry;
  const res = await query(
    `INSERT INTO send_logs (recipient_email, sender_id, subject, body_preview, status, error_message, sent_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING id`,
    [recipient_email, sender_id, subject, body_preview, status, error_message || null]
  );
  return res.rows[0].id;
}

async function getLogs(filters = {}) {
  let sql = 'SELECT * FROM send_logs WHERE 1=1';
  const values = [];
  let idx = 1;
  if (filters.email) {
    sql += ` AND recipient_email = $${idx}`;
    values.push(filters.email);
    idx++;
  }
  if (filters.sender_id) {
    sql += ` AND sender_id = $${idx}`;
    values.push(filters.sender_id);
    idx++;
  }
  sql += ' ORDER BY sent_at DESC';
  if (filters.limit) {
    sql += ` LIMIT $${idx}`;
    values.push(filters.limit);
  }
  const res = await query(sql, values);
  return res.rows;
}

async function clearLogs() {
  await query('DELETE FROM send_logs');
  return true;
}

// ---- Статистика ----

async function getRecentCount(senderId, windowSeconds) {
  // Используем параметризованный запрос для интервала
  const res = await query(
    `SELECT COUNT(*) as count FROM send_logs
     WHERE sender_id = $1 AND status = 'sent'
     AND sent_at > NOW() - INTERVAL '1 second' * $2`,
    [senderId, windowSeconds]
  );
  return parseInt(res.rows[0].count);
}

async function getDailyCount(senderId) {
  const res = await query(
    `SELECT COUNT(*) as count FROM send_logs
     WHERE sender_id = $1 AND status = 'sent' AND sent_at >= CURRENT_DATE`,
    [senderId]
  );
  return parseInt(res.rows[0].count);
}

async function checkDuplicate(email, days) {
  // Используем параметризованный запрос
  const res = await query(
    `SELECT COUNT(*) as count FROM send_logs
     WHERE recipient_email = $1 AND status = 'sent'
     AND sent_at > NOW() - INTERVAL '1 day' * $2`,
    [email, days]
  );
  return parseInt(res.rows[0].count) > 0;
}

async function getLastSentDate(email) {
  const res = await query(
    `SELECT sent_at FROM send_logs
     WHERE recipient_email = $1 AND status = 'sent'
     ORDER BY sent_at DESC LIMIT 1`,
    [email]
  );
  return res.rows[0] ? res.rows[0].sent_at : null;
}

// ---- Templates ----

async function getTemplates() {
  const res = await query('SELECT * FROM templates ORDER BY id');
  return res.rows;
}

async function getTemplate(id) {
  const res = await query('SELECT * FROM templates WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function addTemplate(template) {
  const { name, subject, body } = template;
  const res = await query(
    `INSERT INTO templates (name, subject, body) VALUES ($1, $2, $3) RETURNING id`,
    [name, subject, body]
  );
  return res.rows[0].id;
}

async function updateTemplate(id, updates) {
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_TEMPLATE_FIELDS.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});
  
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(filtered)) {
    fields.push(`${key} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return false;
  values.push(id);
  const sql = `UPDATE templates SET ${fields.join(', ')} WHERE id = $${idx}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteTemplate(id) {
  const res = await query('DELETE FROM templates WHERE id = $1', [id]);
  return res.rowCount > 0;
}

// ---- Users ----

async function getUserByEmail(email) {
  const res = await query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

async function getUserById(id) {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function createUser(user) {
  const { email, passwordHash, name, role } = user;
  const res = await query(
    `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    [email, passwordHash, name || '', role || 'user']
  );
  return { id: res.rows[0].id, email, name, role };
}

async function getAllUsers() {
  const res = await query('SELECT id, email, name, role FROM users');
  return res.rows;
}

async function updateUser(id, updates) {
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_USER_FIELDS.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});
  
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(filtered)) {
    fields.push(`${key} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return false;
  values.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteUser(id) {
  const res = await query('DELETE FROM users WHERE id = $1', [id]);
  return res.rowCount > 0;
}

// ---- Reminders ----

async function createReminder(data) {
  const { recipientId, recipientEmail, reminderDate, message, userId } = data;
  const res = await query(
    `INSERT INTO reminders (recipient_id, recipient_email, reminder_date, message, user_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [recipientId, recipientEmail, reminderDate, message || '', userId]
  );
  return { id: res.rows[0].id, ...data };
}

async function getReminders(filters = {}) {
  let sql = 'SELECT * FROM reminders WHERE 1=1';
  const values = [];
  let idx = 1;
  if (filters.recipientId) {
    sql += ` AND recipient_id = $${idx}`;
    values.push(filters.recipientId);
    idx++;
  }
  if (filters.isCompleted !== undefined) {
    sql += ` AND is_completed = $${idx}`;
    values.push(filters.isCompleted);
    idx++;
  }
  if (filters.upcoming) {
    sql += ` AND reminder_date >= NOW() AND is_completed = false`;
  }
  sql += ' ORDER BY reminder_date ASC';
  const res = await query(sql, values);
  return res.rows;
}

async function getReminder(id) {
  const res = await query('SELECT * FROM reminders WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function updateReminder(id, updates) {
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_REMINDER_FIELDS.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});
  
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(filtered)) {
    fields.push(`${key} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return false;
  values.push(id);
  const sql = `UPDATE reminders SET ${fields.join(', ')} WHERE id = $${idx}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteReminder(id) {
  const res = await query('DELETE FROM reminders WHERE id = $1', [id]);
  return res.rowCount > 0;
}

async function getDueReminders() {
  const res = await query(`
    SELECT * FROM reminders 
    WHERE reminder_date <= CURRENT_TIMESTAMP AT TIME ZONE 'UTC' 
    AND is_completed = false
  `);
  return res.rows;
}

// ---- Notifications ----
async function addNotification(userId, type, message, link = null) {
  const res = await query(
    `INSERT INTO notifications (user_id, type, message, link)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, type, message, link]
  );
  return res.rows[0].id;
}

async function getNotifications(userId, limit = 50) {
  const res = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows;
}

async function getUnreadNotificationCount(userId) {
  const res = await query(
    `SELECT COUNT(*) as count FROM notifications
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return parseInt(res.rows[0].count);
}

async function markNotificationAsRead(id, userId) {
  const res = await query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return res.rowCount > 0;
}

// ---- Tasks ----

async function getTasks(userId, status = null) {
  let sql = 'SELECT * FROM tasks WHERE user_id = $1';
  const values = [userId];
  let idx = 2;
  if (status) {
    sql += ` AND status = $${idx}`;
    values.push(status);
    idx++;
  }
  sql += ' ORDER BY created_at DESC';
  const res = await query(sql, values);
  return res.rows;
}

async function getTask(id, userId) {
  const res = await query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
  return res.rows[0] || null;
}

async function addTask(taskData, userId) {
  const { title, description, status, assignedTo, deadline } = taskData;
  const res = await query(
    `INSERT INTO tasks (title, description, status, assigned_to, deadline, user_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [title, description || '', status || 'todo', assignedTo || null, deadline || null, userId]
  );
  return { id: res.rows[0].id, ...taskData, userId };
}

async function getDueRemindersCount(userId) {
  const res = await query(
    `SELECT COUNT(*) as count FROM reminders
     WHERE user_id = $1 AND reminder_date <= CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
     AND is_completed = false`,
    [userId]
  );
  return parseInt(res.rows[0].count);
}

async function updateTask(id, userId, updates) {
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_TASK_FIELDS.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});
  
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(filtered)) {
    fields.push(`${key} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return false;
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id, userId);
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx+1}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteTask(id, userId) {
  const res = await query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
  return res.rowCount > 0;
}

// ---- Clear database (danger) ----

async function clearDatabase() {
  await query('DELETE FROM send_logs');
  await query('DELETE FROM recipients');
  return true;
}

// ---- Comments ----
async function getComments(recipientId) {
  const res = await query(
    `SELECT c.*, u.name as author_name
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.recipient_id = $1
     ORDER BY c.created_at DESC`,
    [recipientId]
  );
  return res.rows;
}

async function addComment(recipientId, userId, comment) {
  const res = await query(
    `INSERT INTO comments (recipient_id, user_id, comment)
     VALUES ($1, $2, $3) RETURNING id`,
    [recipientId, userId, comment]
  );
  return res.rows[0].id;
}

async function updateRecipientLastComment(recipientId, comment) {
  const res = await query(
    `UPDATE recipients SET comment = $1 WHERE id = $2`,
    [comment, recipientId]
  );
  return res.rowCount > 0;
}

// ---- Экспорт объекта с методами ----

module.exports = {
  // Comments
  getComments,
  addComment,
  updateRecipientLastComment,

  // Senders
  getSenders,
  getSender,
  addSender,
  updateSender,
  deleteSender,

  // Recipients
  getRecipients,
  addRecipients,
  getRecipientsByIds,
  getDistinctCities,
  getDistinctSpecializations,
  getDistinctOrganizations,
  countRecipients,
  updateRecipientComment,

  // Logs
  addLog,
  getLogs,
  clearLogs,
  getRecentCount,
  getDailyCount,
  checkDuplicate,
  getLastSentDate,

  // Templates
  getTemplates,
  getTemplate,
  addTemplate,
  updateTemplate,
  deleteTemplate,

  // Users
  getUserByEmail,
  getUserById,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,

  // Reminders
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  getDueReminders,
  getDueRemindersCount,

  // Tasks
  getTasks,
  getTask,
  addTask,
  updateTask,
  deleteTask,

  // Notifications
  addNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,

  // Utils
  clearDatabase,
  pool,
};