const db = require('../db');

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await db.getNotifications(userId);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const ok = await db.markNotificationAsRead(id, userId);
    if (!ok) return res.status(404).json({ error: 'Уведомление не найдено' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const count = await db.getUnreadNotificationCount(userId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUnreadTotal(req, res) {
  try {
    const userId = req.user.id;
    const [notifsCount, remindersCount] = await Promise.all([
      db.getUnreadNotificationCount(userId),
      db.getDueRemindersCount(userId)
    ]);
    res.json({ total: notifsCount + remindersCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getNotifications,getUnreadTotal, markAsRead, getUnreadCount };