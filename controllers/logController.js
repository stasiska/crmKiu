const db = require('../db');

async function getLogs(req, res) {
  try {
    const filters = { email: req.query.email };
    const logs = await db.getLogs(filters);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function clearLogs(req, res) {
  try {
    await db.clearLogs();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getLogs, clearLogs };