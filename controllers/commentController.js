const db = require('../db');

async function getComments(req, res) {
  try {
    const recipientId = parseInt(req.params.recipientId);
    const comments = await db.getComments(recipientId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addComment(req, res) {
  try {
    const recipientId = parseInt(req.params.recipientId);
    const userId = req.user.id;
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ error: 'Текст комментария обязателен' });
    await db.addComment(recipientId, userId, comment);
    await db.updateRecipientLastComment(recipientId, comment);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getComments, addComment };