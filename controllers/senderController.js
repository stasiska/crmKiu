const db = require('../db');
const config = require('../config');

async function getAllSenders(req, res) {
  try {
    const userId = req.user.id;
    const senders = await db.getSenders(userId);
    const windowSeconds = config.rateLimitWindow / 1000;
    const result = await Promise.all(senders.map(async (s) => {
      const daily = await db.getDailyCount(s.id);
      const recent = await db.getRecentCount(s.id, windowSeconds);
      const allowed = !(recent >= config.rateLimitCount || daily >= config.maxDailySent);
      let reason = null;
      if (recent >= config.rateLimitCount) reason = 'rate_limit';
      else if (daily >= config.maxDailySent) reason = 'daily_limit';
      return {
        ...s,
        status: { allowed, reason, recent, daily, limit: config.rateLimitCount, dailyLimit: config.maxDailySent }
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSender(req, res) {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const sender = await db.getSender(id, userId);
    if (!sender) return res.status(404).json({ error: 'Не найден' });
    res.json(sender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createSender(req, res) {
  try {
    const userId = req.user.id;
    const id = await db.addSender(req.body, userId);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateSender(req, res) {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const ok = await db.updateSender(id, userId, req.body);
    if (!ok) return res.status(404).json({ error: 'Не найден' });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteSender(req, res) {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const ok = await db.deleteSender(id, userId);
    if (!ok) return res.status(404).json({ error: 'Не найден' });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllSenders,
  getSender,
  createSender,
  updateSender,
  deleteSender,
};