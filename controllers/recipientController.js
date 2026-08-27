const db = require('../db');
const config = require('../config');
const { parseExcel } = require('../services/excelService');

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
    const [cities, specializations, organizations] = await Promise.all([
      db.getDistinctCities(),
      db.getDistinctSpecializations(),
      db.getDistinctOrganizations(),
    ]);
    res.json({ cities, specializations, organizations });
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
  importRecipients,
  getRecipients,
  getFiltersOptions,
  getDistinctOrganizations,
  countRecipients,
};