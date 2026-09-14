const db = require('../db');

async function getNotes(req, res) {
  try {
    const organizationId = parseInt(req.params.organizationId);

    // Проверка существования организации
    const organization = await db.getOrganizationById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Организация не найдена' });
    }

    const filters = {
      type: req.query.type, // 'note' или 'plan'
    };

    const notes = await db.getOrganizationNotes(organizationId, filters);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getNote(req, res) {
  try {
    const id = parseInt(req.params.id);
    const organizationId = parseInt(req.params.organizationId);

    const note = await db.getOrganizationNoteById(id, organizationId);
    if (!note) {
      return res.status(404).json({ error: 'Заметка не найдена' });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createNote(req, res) {
  try {
    const organizationId = parseInt(req.params.organizationId);

    // Проверка существования организации
    const organization = await db.getOrganizationById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Организация не найдена' });
    }

    // Преобразование пустых строк в null для необязательных полей
    if (req.body.date === '') req.body.date = null;
    if (req.body.executor_id === '') req.body.executor_id = null;
    if (req.body.file_link === '') req.body.file_link = null;

    // Проверка существования executor_id
    if (req.body.executor_id) {
      const executor = await db.getUserById(req.body.executor_id);
      if (!executor) {
        return res.status(400).json({ error: 'Исполнитель с указанным ID не найден' });
      }
    }

    const noteData = {
      organization_id: organizationId,
      type: req.body.type,
      date: req.body.date,
      note: req.body.note,
      executor_id: req.body.executor_id,
      file_link: req.body.file_link,
    };

    const id = await db.createOrganizationNote(noteData, req.user.id);
    const note = await db.getOrganizationNoteById(id, organizationId);
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateNote(req, res) {
  try {
    const id = parseInt(req.params.id);
    const organizationId = parseInt(req.params.organizationId);

    // Проверка существования заметки
    const existing = await db.getOrganizationNoteById(id, organizationId);
    if (!existing) {
      return res.status(404).json({ error: 'Заметка не найдена' });
    }

    // Преобразование пустых строк в null для необязательных полей
    if (req.body.date === '') req.body.date = null;
    if (req.body.executor_id === '') req.body.executor_id = null;
    if (req.body.file_link === '') req.body.file_link = null;

    // Проверка существования executor_id
    if (req.body.executor_id) {
      const executor = await db.getUserById(req.body.executor_id);
      if (!executor) {
        return res.status(400).json({ error: 'Исполнитель с указанным ID не найден' });
      }
    }

    const ok = await db.updateOrganizationNote(id, organizationId, req.body);
    if (!ok) {
      return res.status(500).json({ error: 'Не удалось обновить заметку' });
    }

    const note = await db.getOrganizationNoteById(id, organizationId);
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteNote(req, res) {
  try {
    const id = parseInt(req.params.id);
    const organizationId = parseInt(req.params.organizationId);

    // Проверка существования заметки
    const existing = await db.getOrganizationNoteById(id, organizationId);
    if (!existing) {
      return res.status(404).json({ error: 'Заметка не найдена' });
    }

    const ok = await db.deleteOrganizationNote(id, organizationId);
    if (!ok) {
      return res.status(500).json({ error: 'Не удалось удалить заметку' });
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
