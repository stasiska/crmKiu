const db = require('../db');
const config = require('../config');
const { parseExcel } = require('../services/excelService');

async function createRecipient(req, res) {
  try {
    const recipient = await db.createRecipient(req.body, req.user.id);
    res.status(201).json(recipient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteRecipient(req, res) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await db.deleteRecipient(id);
    if (!deleted) return res.status(404).json({ error: 'Получатель не найден' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function importRecipients(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Выберите Excel-файл' });
    const rows = parseExcel(req.file.buffer);
    res.json(await db.addRecipients(rows, req.user.id));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getRecipients(req, res) {
  try {
    const filters = {
      city: req.query.city,
      specialization: req.query.specialization,
      organization: req.query.organization,
      direction: req.query.direction,
      search: req.query.search,
    };
    const linked = await db.autoLinkRecipientsByInn(req.user.id);
    const linksByRecipient = new Map(linked.map(link => [link.recipientId, link]));
    const recipients = await db.getRecipients(filters);
    const result = await Promise.all(recipients.map(async (r) => {
      const sent = await db.checkDuplicate(r.email, config.duplicateDays);
      const lastSentAt = await db.getLastSentDate(r.email);
      return { ...r, hasSent: sent, last_sent_at: lastSentAt, organizationLink: linksByRecipient.get(r.id) || null };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getFiltersOptions(req, res) {
  try {
    res.json({
      organizations: await db.getDistinctOrganizations(),
      directions: await db.getDistinctDirections(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDistinctOrganizations(req, res) {
  try {
    res.json(await db.getDistinctOrganizations());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function countRecipients(req, res) {
  try {
    res.json({ count: await db.countRecipients() });
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
