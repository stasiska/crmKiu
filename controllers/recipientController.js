const db = require('../db');
const config = require('../config');
const { parseExcel } = require('../services/excelService');

async function createRecipient(req, res) {
  try {
    const recipient = await db.createRecipient(req.body);
    res.status(201).json(recipient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteRecipient(req, res) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await db.deleteRecipient(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Получатель не найден' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function importRecipients(req, res) {
  try {
    const rows = parseExcel(req.file.buffer);
    const count = await db.addRecipients(rows);
    res.json({ imported: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRecipients(req, res) {
  try {
    const filters = {
      city: req.query.city,
      specialization: req.query.specialization,
      organization: req.query.organization,
      search: req.query.search,
    };
    const recipients = await db.getRecipients(filters);
    const result = await Promise.all(recipients.map(async (r) => {
      const sent = await db.checkDuplicate(r.email, config.duplicateDays);
      const lastSentAt = await db.getLastSentDate(r.email);
      return { ...r, hasSent: sent, last_sent_at: lastSentAt };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Единый метод для всех опций фильтров
async function getFiltersOptions(req, res) {
  try {
    const organizations = await db.getDistinctOrganizations();
    res.json({ organizations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Метод для организаций (если нужен отдельный эндпоинт)
async function getDistinctOrganizations(req, res) {
  try {
    const orgs = await db.getDistinctOrganizations();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function countRecipients(req, res) {
  try {
    const count = await db.countRecipients();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createRecipient,
  deleteRecipient,
  importRecipients,
  getRecipients,
  getFiltersOptions,
  getDistinctOrganizations,
  countRecipients,
};