const db = require('../db');

// GET /api/listeners/:id/notes
exports.getListenerNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    const filters = {};
    if (type) filters.type = type;

    const notes = await db.getListenerNotes(parseInt(id, 10), filters);
    res.json({ data: notes });
  } catch (err) {
    next(err);
  }
};

// POST /api/listeners/:id/notes
exports.createListenerNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, date, note, executor_id, file_link } = req.body;

    if (!note || !type) {
      return res.status(400).json({ error: 'Заметка и тип обязательны' });
    }

    const noteId = await db.createListenerNote({
      listener_id: parseInt(id, 10),
      type,
      date: date || null,
      note,
      executor_id: executor_id || null,
      creator_id: req.user?.id,
      file_link: file_link || null
    });

    const created = await db.getListenerNoteById(noteId);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// PUT /api/listeners/:id/notes/:noteId
exports.updateListenerNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const updates = req.body;

    const success = await db.updateListenerNote(parseInt(noteId, 10), updates);
    if (!success) {
      return res.status(404).json({ error: 'Заметка не найдена' });
    }

    const updated = await db.getListenerNoteById(parseInt(noteId, 10));
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/listeners/:id/notes/:noteId
exports.deleteListenerNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const success = await db.deleteListenerNote(parseInt(noteId, 10));
    if (!success) {
      return res.status(404).json({ error: 'Заметка не найдена' });
    }

    res.json({ message: 'Заметка удалена' });
  } catch (err) {
    next(err);
  }
};

// GET /api/listeners/:id/groups - история групп слушателя
exports.getListenerGroupHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.getListenerGroupHistory(parseInt(id, 10));
    res.json(result);
  } catch (err) {
    next(err);
  }
};
