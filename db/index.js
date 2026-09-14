const { Pool } = require('pg');
const { runMigrations } = require('./migrations');
const config = require('../config');
const { encrypt, decrypt } = require('../services/encryptionService');

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
const ALLOWED_USER_FIELDS = ['name', 'role', 'password_hash', 'branch']; // при необходимости можно добавить 'email'

// ---- Senders ----

async function getSenders(userId) {
  const res = await query('SELECT * FROM senders WHERE user_id = $1', [userId]);
  return res.rows;
}

async function getSender(id, userId) {
  const res = await query('SELECT * FROM senders WHERE id = $1 AND user_id = $2', [id, userId]);
  if (res.rows[0]) {
    // Расшифровываем пароль при чтении
    res.rows[0].password = decrypt(res.rows[0].password);
  }
  return res.rows[0] || null;
}

async function addSender(sender, userId) {
  const { name, email, host, port, secure, password } = sender;
  // Шифруем пароль перед сохранением
  const encryptedPassword = encrypt(password);
  const res = await query(
    `INSERT INTO senders (name, email, host, port, secure, password, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [name, email, host, port, secure, encryptedPassword, userId]
  );
  return res.rows[0].id;
}

async function updateSender(id, userId, updates) {
  // Фильтруем только разрешённые поля
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_SENDER_FIELDS.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});

  // Шифруем пароль, если он обновляется
  if (filtered.password) {
    filtered.password = encrypt(filtered.password);
  }

  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(filtered)) {
    // Валидация имени поля - только буквы и подчеркивания
    if (!/^[a-z_]+$/.test(key)) {
      throw new Error(`Invalid field name: ${key}`);
    }
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = row.email || row['e-mail'] || row['почта'] || '';
      if (!email) continue;

      // Проверяем существование
      const exists = await client.query('SELECT id FROM recipients WHERE email = $1', [email]);
      if (exists.rows.length > 0) continue;

      const name = row.name || row.имя || row.фио || '';
      const city = row.city || row.город || row.округ || row.регион || '';
      const specialization = row.specialization || row.специализация || row.профессия || row.role || '';
      const organization = row.organization || row.организация || row.company || row.компания || row.org || '';
      const phone = row.phone || row.телефон || '';
      const comment = row.comment || row.комментарий || '';
      const extra = JSON.stringify(row);

      const res = await client.query(
        `INSERT INTO recipients (email, name, city, specialization, organization, phone, comment, extra)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [email, name, city, specialization, organization, phone, comment, extra]
      );
      inserted.push({ id: res.rows[0].id, email });
    }
    await client.query('COMMIT');
    return inserted.length;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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
    // Валидация имени поля - только буквы и подчеркивания
    if (!/^[a-z_]+$/.test(key)) {
      throw new Error(`Invalid field name: ${key}`);
    }
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
  const { email, passwordHash, name, role, branch } = user;
  const res = await query(
    `INSERT INTO users (email, password_hash, name, role, branch) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [email, passwordHash, name || '', role || 'user', branch || null]
  );
  return { id: res.rows[0].id, email, name, role, branch };
}

async function getAllUsers() {
  const res = await query('SELECT id, email, name, role, branch FROM users');
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
    // Валидация имени поля - только буквы и подчеркивания
    if (!/^[a-z_]+$/.test(key)) {
      throw new Error(`Invalid field name: ${key}`);
    }
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
    // Валидация имени поля - только буквы и подчеркивания
    if (!/^[a-z_]+$/.test(key)) {
      throw new Error(`Invalid field name: ${key}`);
    }
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
    // Валидация имени поля - только буквы и подчеркивания
    if (!/^[a-z_]+$/.test(key)) {
      throw new Error(`Invalid field name: ${key}`);
    }
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

// ---- Organizations ----

async function getOrganizations(filters = {}) {
  let sql = 'SELECT o.*, u.name as manager_name FROM organizations o LEFT JOIN users u ON o.manager_id = u.id WHERE 1=1';
  const values = [];
  let idx = 1;

  if (filters.search) {
    sql += ` AND o.name ILIKE $${idx}`;
    values.push(`%${filters.search}%`);
    idx++;
  }

  // Пагинация
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const offset = (page - 1) * limit;

  // Подсчет общего количества
  const countSql = sql.replace('SELECT o.*, u.name as manager_name', 'SELECT COUNT(*) as count');
  const countRes = await query(countSql, values);
  const total = parseInt(countRes.rows[0].count);

  sql += ` ORDER BY o.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
  values.push(limit, offset);

  const res = await query(sql, values);
  return { data: res.rows, total, page, limit };
}

async function getOrganizationById(id) {
  const res = await query(
    `SELECT o.*, u.name as manager_name
     FROM organizations o
     LEFT JOIN users u ON o.manager_id = u.id
     WHERE o.id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function createOrganization(org) {
  const { name, address, email, phone, contact_person, manager_id, department, ogrn, okpo, okved, okfs, okopf, okato, inn, kpp } = org;
  const res = await query(
    `INSERT INTO organizations (name, address, email, phone, contact_person, manager_id, department, ogrn, okpo, okved, okfs, okopf, okato, inn, kpp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
    [
      name,
      address || null,
      email || null,
      phone || null,
      contact_person || null,
      manager_id || null,
      department || null,
      ogrn || null,
      okpo || null,
      okved || null,
      okfs || null,
      okopf || null,
      okato || null,
      inn || null,
      kpp || null
    ]
  );
  return res.rows[0].id;
}

const ALLOWED_ORGANIZATION_FIELDS = [
  'name', 'address', 'email', 'phone', 'contact_person', 'manager_id', 'department',
  'ogrn', 'okpo', 'okved', 'okfs', 'okopf', 'okato', 'inn', 'kpp'
];

async function updateOrganization(id, updates) {
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_ORGANIZATION_FIELDS.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});

  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(filtered)) {
    if (!/^[a-z_]+$/.test(key)) {
      throw new Error(`Invalid field name: ${key}`);
    }
    fields.push(`${key} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return false;
  values.push(id);
  const sql = `UPDATE organizations SET ${fields.join(', ')} WHERE id = $${idx}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteOrganization(id) {
  const res = await query('DELETE FROM organizations WHERE id = $1', [id]);
  return res.rowCount > 0;
}

async function getOrganizationsOptions() {
  const res = await query('SELECT id, name FROM organizations ORDER BY name');
  return res.rows;
}

async function checkOrganizationHasListeners(orgId) {
  const res = await query('SELECT COUNT(*) as count FROM listeners WHERE organization_id = $1', [orgId]);
  return parseInt(res.rows[0].count) > 0;
}

// ---- Listeners ----

async function getListeners(filters = {}) {
  // Базовый WHERE для всех запросов
  let whereClauses = ['1=1'];
  const values = [];
  let idx = 1;

  if (filters.search) {
    whereClauses.push(`(l.last_name ILIKE $${idx} OR l.first_name ILIKE $${idx} OR l.middle_name ILIKE $${idx})`);
    values.push(`%${filters.search}%`);
    idx++;
  }

  if (filters.organization_id) {
    whereClauses.push(`l.organization_id = $${idx}`);
    values.push(filters.organization_id);
    idx++;
  }

  if (filters.gender) {
    whereClauses.push(`l.gender = $${idx}`);
    values.push(filters.gender);
    idx++;
  }

  if (filters.education_level) {
    whereClauses.push(`l.education_level = $${idx}`);
    values.push(filters.education_level);
    idx++;
  }

  const whereClause = whereClauses.join(' AND ');

  // Пагинация
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const offset = (page - 1) * limit;

  // Подсчет общего количества
  const countSql = `SELECT COUNT(*) as count FROM listeners l WHERE ${whereClause}`;
  const countRes = await query(countSql, values);
  const total = parseInt(countRes.rows[0].count);

  // Основной запрос с JOIN
  const sql = `SELECT l.*,
    CONCAT(l.last_name, ' ', l.first_name, COALESCE(' ' || l.middle_name, '')) as full_name,
    o.name as organization_name,
    u.name as manager_name
    FROM listeners l
    LEFT JOIN organizations o ON l.organization_id = o.id
    LEFT JOIN users u ON l.manager_id = u.id
    WHERE ${whereClause}
    ORDER BY l.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;

  values.push(limit, offset);

  const res = await query(sql, values);
  return { data: res.rows, total, page, limit };
}

async function getListenerById(id) {
  const res = await query(
    `SELECT l.*,
     CONCAT(l.last_name, ' ', l.first_name, COALESCE(' ' || l.middle_name, '')) as full_name,
     o.name as organization_name,
     u.name as manager_name
     FROM listeners l
     LEFT JOIN organizations o ON l.organization_id = o.id
     LEFT JOIN users u ON l.manager_id = u.id
     WHERE l.id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function createListener(listener) {
  const {
    last_name, first_name, middle_name, birth_date, gender, citizenship,
    identity_document, document_series, document_number, issued_by, snils,
    residence_address, registration_address, phone, email, education_level,
    education_series, education_number, organization_id, manager_id, department
  } = listener;

  const res = await query(
    `INSERT INTO listeners (
      last_name, first_name, middle_name, birth_date, gender, citizenship,
      identity_document, document_series, document_number, issued_by, snils,
      residence_address, registration_address, phone, email, education_level,
      education_series, education_number, organization_id, manager_id, department
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    RETURNING id`,
    [
      last_name, first_name, middle_name || null, birth_date || null, gender || null, citizenship || null,
      identity_document || null, document_series || null, document_number || null, issued_by || null, snils || null,
      residence_address || null, registration_address || null, phone || null, email || null, education_level || null,
      education_series || null, education_number || null, organization_id || null, manager_id || null, department || null
    ]
  );
  return res.rows[0].id;
}

const ALLOWED_LISTENER_FIELDS = [
  'last_name', 'first_name', 'middle_name', 'birth_date', 'gender', 'citizenship',
  'identity_document', 'document_series', 'document_number', 'issued_by', 'snils',
  'residence_address', 'registration_address', 'phone', 'email', 'education_level',
  'education_series', 'education_number', 'organization_id', 'manager_id', 'department'
];

async function updateListener(id, updates) {
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_LISTENER_FIELDS.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});

  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(filtered)) {
    if (!/^[a-z_]+$/.test(key)) {
      throw new Error(`Invalid field name: ${key}`);
    }
    fields.push(`${key} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return false;
  values.push(id);
  const sql = `UPDATE listeners SET ${fields.join(', ')} WHERE id = $${idx}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteListener(id) {
  const res = await query('DELETE FROM listeners WHERE id = $1', [id]);
  return res.rowCount > 0;
}

async function getListenersOptions() {
  const res = await query(
    `SELECT id, CONCAT(last_name, ' ', first_name, COALESCE(' ' || middle_name, '')) as full_name
     FROM listeners ORDER BY last_name, first_name`
  );
  return res.rows;
}

async function checkListenerEmailExists(email, excludeId = null) {
  let sql = 'SELECT COUNT(*) as count FROM listeners WHERE email = $1';
  const values = [email];
  if (excludeId) {
    sql += ' AND id != $2';
    values.push(excludeId);
  }
  const res = await query(sql, values);
  return parseInt(res.rows[0].count) > 0;
}

// ---- Organization Notes ----

async function getOrganizationNotes(organizationId, filters = {}) {
  let sql = `SELECT n.*,
    u_creator.name as creator_name,
    u_executor.name as executor_name
    FROM organization_notes n
    LEFT JOIN users u_creator ON n.creator_id = u_creator.id
    LEFT JOIN users u_executor ON n.executor_id = u_executor.id
    WHERE n.organization_id = $1`;

  const values = [organizationId];
  let idx = 2;

  if (filters.type) {
    sql += ` AND n.type = $${idx}`;
    values.push(filters.type);
    idx++;
  }

  sql += ' ORDER BY COALESCE(n.date, n.created_at) DESC';

  const res = await query(sql, values);
  return res.rows;
}

async function getOrganizationNoteById(id, organizationId) {
  const res = await query(
    `SELECT n.*,
     u_creator.name as creator_name,
     u_executor.name as executor_name
     FROM organization_notes n
     LEFT JOIN users u_creator ON n.creator_id = u_creator.id
     LEFT JOIN users u_executor ON n.executor_id = u_executor.id
     WHERE n.id = $1 AND n.organization_id = $2`,
    [id, organizationId]
  );
  return res.rows[0] || null;
}

async function createOrganizationNote(data, userId) {
  const { organization_id, type, date, note, executor_id, file_link } = data;
  const res = await query(
    `INSERT INTO organization_notes (organization_id, type, date, note, executor_id, creator_id, file_link)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      organization_id,
      type,
      date || null,
      note,
      executor_id || null,
      userId,
      file_link || null
    ]
  );
  return res.rows[0].id;
}

const ALLOWED_NOTE_FIELDS = ['type', 'date', 'note', 'executor_id', 'file_link'];

async function updateOrganizationNote(id, organizationId, updates) {
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_NOTE_FIELDS.includes(key))
    .reduce((obj, key) => { obj[key] = updates[key]; return obj; }, {});

  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(filtered)) {
    if (!/^[a-z_]+$/.test(key)) {
      throw new Error(`Invalid field name: ${key}`);
    }
    fields.push(`${key} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return false;
  values.push(id, organizationId);
  const sql = `UPDATE organization_notes SET ${fields.join(', ')} WHERE id = $${idx} AND organization_id = $${idx+1}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteOrganizationNote(id, organizationId) {
  const res = await query('DELETE FROM organization_notes WHERE id = $1 AND organization_id = $2', [id, organizationId]);
  return res.rowCount > 0;
}

// ===== GROUPS =====

async function getGroups(filters = {}) {
  const { page = 1, limit = 20, search, manager_id, status, hours_min, hours_max } = filters;
  const offset = (page - 1) * limit;

  const whereClauses = [];
  const values = [];
  let paramIndex = 1;

  if (search) {
    whereClauses.push(`(g.name ILIKE $${paramIndex} OR g.course_name ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (manager_id) {
    whereClauses.push(`g.manager_id = $${paramIndex}`);
    values.push(manager_id);
    paramIndex++;
  }

  if (status) {
    whereClauses.push(`g.status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  if (hours_min) {
    whereClauses.push(`g.hours >= $${paramIndex}`);
    values.push(parseInt(hours_min, 10));
    paramIndex++;
  }

  if (hours_max) {
    whereClauses.push(`g.hours <= $${paramIndex}`);
    values.push(parseInt(hours_max, 10));
    paramIndex++;
  }

  const whereClause = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // Count total
  const countRes = await query(
    `SELECT COUNT(*) as count FROM groups g ${whereClause}`,
    values
  );
  const total = parseInt(countRes.rows[0]?.count || 0, 10);

  // Get data with manager name and listeners count
  const dataRes = await query(
    `SELECT g.*,
     u.name as manager_name,
     (SELECT COUNT(*) FROM group_listeners gl WHERE gl.group_id = g.id) as listeners_count
     FROM groups g
     LEFT JOIN users u ON g.manager_id = u.id
     ${whereClause}
     ORDER BY g.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  );

  return {
    data: dataRes.rows,
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
}

async function getGroupById(id) {
  const res = await query(
    `SELECT g.*,
     u.name as manager_name,
     (SELECT COUNT(*) FROM group_listeners gl WHERE gl.group_id = g.id) as listeners_count
     FROM groups g
     LEFT JOIN users u ON g.manager_id = u.id
     WHERE g.id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function createGroup(data) {
  const {
    manager_id, auditorium, branch,
    course_name, status, hours, start_date, end_date, format
  } = data;
  const res = await query(
    `INSERT INTO groups (manager_id, auditorium, branch, course_name, status, hours, start_date, end_date, format)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [
      manager_id || null,
      auditorium || null,
      branch || null,
      course_name,
      status || 'набор',
      hours || null,
      start_date || null,
      end_date || null,
      format || 'аудитория'
    ]
  );
  return res.rows[0].id;
}

const ALLOWED_GROUP_FIELDS = [
  'manager_id', 'auditorium', 'branch',
  'course_name', 'status', 'hours', 'start_date', 'end_date', 'format'
];

async function updateGroup(id, updates) {
  const filtered = Object.keys(updates)
    .filter(key => ALLOWED_GROUP_FIELDS.includes(key))
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
  values.push(id);

  const sql = `UPDATE groups SET ${fields.join(', ')} WHERE id = $${idx}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteGroup(id) {
  const res = await query('DELETE FROM groups WHERE id = $1', [id]);
  return res.rowCount > 0;
}

async function getGroupListeners(groupId, filters = {}) {
  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  // Count total
  const countRes = await query(
    `SELECT COUNT(*) as count FROM group_listeners gl WHERE gl.group_id = $1`,
    [groupId]
  );
  const total = parseInt(countRes.rows[0]?.count || 0, 10);

  // Get data
  const dataRes = await query(
    `SELECT l.*, gl.joined_at,
     o.name as organization_name,
     u.name as manager_name
     FROM group_listeners gl
     JOIN listeners l ON gl.listener_id = l.id
     LEFT JOIN organizations o ON l.organization_id = o.id
     LEFT JOIN users u ON l.manager_id = u.id
     WHERE gl.group_id = $1
     ORDER BY gl.joined_at DESC
     LIMIT $2 OFFSET $3`,
    [groupId, limit, offset]
  );

  return {
    data: dataRes.rows,
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
}

async function addListenersToGroup(groupId, listenerIds) {
  if (!listenerIds || listenerIds.length === 0) return 0;

  // Use INSERT ... ON CONFLICT DO NOTHING to ignore duplicates
  const values = listenerIds.map((lid, idx) =>
    `($1, $${idx + 2})`
  ).join(', ');

  const res = await query(
    `INSERT INTO group_listeners (group_id, listener_id)
     VALUES ${values}
     ON CONFLICT (group_id, listener_id) DO NOTHING`,
    [groupId, ...listenerIds]
  );

  return res.rowCount;
}

async function removeListenerFromGroup(groupId, listenerId) {
  const res = await query(
    'DELETE FROM group_listeners WHERE group_id = $1 AND listener_id = $2',
    [groupId, listenerId]
  );
  return res.rowCount > 0;
}

async function clearGroupListeners(groupId) {
  const res = await query('DELETE FROM group_listeners WHERE group_id = $1', [groupId]);
  return res.rowCount;
}

async function checkListenersExist(listenerIds) {
  if (!listenerIds || listenerIds.length === 0) return [];

  const placeholders = listenerIds.map((_, idx) => `$${idx + 1}`).join(', ');
  const res = await query(
    `SELECT id FROM listeners WHERE id IN (${placeholders})`,
    listenerIds
  );

  return res.rows.map(r => r.id);
}

// ===== BRANCHES =====

async function getBranches() {
  const res = await query('SELECT * FROM branches ORDER BY name');
  return res.rows;
}

async function getBranchById(id) {
  const res = await query('SELECT * FROM branches WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function getBranchByName(name) {
  // Ищем по полному названию, городу или коду
  const res = await query(
    'SELECT * FROM branches WHERE name = $1 OR city = $1 OR code = $1 LIMIT 1',
    [name]
  );
  return res.rows[0] || null;
}

async function createBranch(data) {
  const { code, name, director_name, city } = data;
  const res = await query(
    `INSERT INTO branches (code, name, director_name, city)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [code, name, director_name || null, city || null]
  );
  return res.rows[0].id;
}

async function updateBranch(id, updates) {
  const allowed = ['name', 'director_name', 'city'];
  const filtered = Object.keys(updates)
    .filter(key => allowed.includes(key))
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
  const sql = `UPDATE branches SET ${fields.join(', ')} WHERE id = $${idx}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

// ===== BRANCHES =====

async function getBranches() {
  const res = await query('SELECT * FROM branches ORDER BY name');
  return res.rows;
}

async function getBranchById(id) {
  const res = await query('SELECT * FROM branches WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function getBranchByName(name) {
  // Ищем по полному названию, городу или коду
  const res = await query(
    'SELECT * FROM branches WHERE name = $1 OR city = $1 OR code = $1 LIMIT 1',
    [name]
  );
  return res.rows[0] || null;
}

async function createBranch(data) {
  const { code, name, director_name, city } = data;
  const res = await query(
    `INSERT INTO branches (code, name, director_name, city)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [code, name, director_name || null, city || null]
  );
  return res.rows[0].id;
}

async function updateBranch(id, updates) {
  const allowed = ['name', 'director_name', 'city'];
  const filtered = Object.keys(updates)
    .filter(key => allowed.includes(key))
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
  const sql = `UPDATE branches SET ${fields.join(', ')} WHERE id = $${idx}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteBranch(id) {
  const res = await query('DELETE FROM branches WHERE id = $1', [id]);
  return res.rowCount > 0;
}

// ===== DOCUMENT TEMPLATES =====

async function getDocumentTemplates() {
  const res = await query(
    `SELECT id, code, name, description, file_name, is_active, created_by, created_at, updated_at
     FROM document_templates ORDER BY name`
  );
  return res.rows;
}

async function getDocumentTemplate(code) {
  const res = await query('SELECT * FROM document_templates WHERE code = $1 AND is_active = true', [code]);
  return res.rows[0] || null;
}

async function getDocumentTemplateById(id) {
  const res = await query('SELECT * FROM document_templates WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function createDocumentTemplate(data, userId) {
  const { code, name, description, file_data, file_name } = data;
  const res = await query(
    `INSERT INTO document_templates (code, name, description, file_data, file_name, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [code, name, description || null, file_data, file_name, userId]
  );
  return res.rows[0].id;
}

async function updateDocumentTemplate(id, updates) {
  const allowed = ['name', 'description', 'file_data', 'file_name', 'is_active'];
  const filtered = Object.keys(updates)
    .filter(key => allowed.includes(key))
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
  values.push(id);

  const sql = `UPDATE document_templates SET ${fields.join(', ')} WHERE id = $${idx}`;
  const res = await query(sql, values);
  return res.rowCount > 0;
}

async function deleteDocumentTemplate(id) {
  const res = await query('DELETE FROM document_templates WHERE id = $1', [id]);
  return res.rowCount > 0;
}

// ===== GROUP DOCUMENTS =====

async function getGroupDocuments(groupId) {
  const res = await query(
    `SELECT gd.*, u.name as creator_name
     FROM group_documents gd
     LEFT JOIN users u ON gd.created_by = u.id
     WHERE gd.group_id = $1
     ORDER BY gd.created_at DESC`,
    [groupId]
  );
  return res.rows;
}

async function getGroupDocumentById(id) {
  const res = await query(
    'SELECT * FROM group_documents WHERE id = $1',
    [id]
  );
  return res.rows[0] || null;
}

async function createGroupDocument(data) {
  const { group_id, document_type, filename, file_data, created_by } = data;
  const res = await query(
    `INSERT INTO group_documents (group_id, document_type, filename, file_data, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [group_id, document_type, filename, file_data, created_by || null]
  );
  return res.rows[0].id;
}

async function deleteGroupDocument(id) {
  const res = await query('DELETE FROM group_documents WHERE id = $1', [id]);
  return res.rowCount > 0;
}

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

  // Organizations
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationsOptions,
  checkOrganizationHasListeners,

  // Listeners
  getListeners,
  getListenerById,
  createListener,
  updateListener,
  deleteListener,
  getListenersOptions,
  checkListenerEmailExists,

  // Organization Notes
  getOrganizationNotes,
  getOrganizationNoteById,
  createOrganizationNote,
  updateOrganizationNote,
  deleteOrganizationNote,

  // Groups
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupListeners,
  addListenersToGroup,
  removeListenerFromGroup,
  clearGroupListeners,
  checkListenersExist,

  // Branches
  getBranches,
  getBranchById,
  getBranchByName,
  createBranch,
  updateBranch,
  deleteBranch,

  // Document Templates
  getDocumentTemplates,
  getDocumentTemplate,
  getDocumentTemplateById,
  createDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate,

  // Group Documents
  getGroupDocuments,
  getGroupDocumentById,
  createGroupDocument,
  deleteGroupDocument,

  // Clear
  clearDatabase,
};