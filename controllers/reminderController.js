const db = require('../db');

async function createReminder(req, res) {
  try {
    const { recipientId, recipientEmail, reminderDate, message } = req.body;
    if (!recipientId || !reminderDate) {
      return res.status(400).json({ error: 'Необходимы recipientId и reminderDate' });
    }
    const reminder = await db.createReminder({
      recipientId,
      recipientEmail: recipientEmail || '',
      reminderDate,
      message: message || '',
      userId: req.user.id,
    });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getReminders(req, res) {
  try {
    const { recipientId, isCompleted, upcoming } = req.query;
    const filters = {};
    if (recipientId) filters.recipientId = parseInt(recipientId);
    if (isCompleted !== undefined) filters.isCompleted = isCompleted === 'true';
    if (upcoming !== undefined) filters.upcoming = upcoming === 'true';
    const reminders = await db.getReminders(filters);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getReminder(req, res) {
  try {
    const id = parseInt(req.params.id);
    const reminder = await db.getReminder(id);
    if (!reminder) return res.status(404).json({ error: 'Напоминание не найдено' });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateReminder(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { reminderDate, message, isCompleted } = req.body;
    const updates = {};
    if (reminderDate !== undefined) updates.reminderDate = reminderDate;
    if (message !== undefined) updates.message = message;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;
    const ok = await db.updateReminder(id, updates);
    if (!ok) return res.status(404).json({ error: 'Напоминание не найдено' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteReminder(req, res) {
  try {
    const id = parseInt(req.params.id);
    const ok = await db.deleteReminder(id);
    if (!ok) return res.status(404).json({ error: 'Напоминание не найдено' });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDueCount(req, res) {
  try {
    const due = await db.getDueReminders();
    res.json({ count: due.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDueCount,
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
};