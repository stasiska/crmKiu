const db = require('../db');
const config = require('../config');
const { parseExcel } = require('../services/excelService');

function parseMailingTemplateId(value) {
  if (value === undefined || value === null || value === '' || value === 'manual') return null;
  const id = parseInt(value, 10);
  if (!Number.isInteger(id) || id < 1) throw new Error('Некорректный вид рассылки');
  return id;
}

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
    const rows = parseExcel(req.file.buffer);
    res.json(await db.addRecipients(rows, req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function previewImportRecipients(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Выберите Excel-файл' });
    const mailingTemplateId = parseMailingTemplateId(req.body.template_id);
    if (mailingTemplateId !== null && !await db.getTemplate(mailingTemplateId)) {
      return res.status(400).json({ error: 'Выбранный шаблон не найден' });
    }
    const rows = parseExcel(req.file.buffer);
    const preview = await db.createRecipientImportDraft(rows, req.user.id, req.file.originalname, mailingTemplateId);
    res.json({ ...preview, fileName: req.file.originalname, mailingTemplateId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function confirmImportRecipients(req, res) {
  try {
    const draftId = parseInt(req.body.draft_id, 10);
    if (!Number.isInteger(draftId)) return res.status(400).json({ error: 'Не указан черновик импорта' });
    const decisions = req.body.decisions && typeof req.body.decisions === 'object' ? req.body.decisions : {};
    res.json(await db.confirmRecipientImport(draftId, req.user.id, decisions));
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
      search: req.query.search,
      mailing_template_id: req.query.mailing_template_id,
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
    res.json({ organizations: await db.getDistinctOrganizations() });
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
  previewImportRecipients,
  confirmImportRecipients,
  getRecipients,
  getFiltersOptions,
  getDistinctOrganizations,
  countRecipients,
};
