const db = require('../db');
const fs = require('fs/promises');
const path = require('path');

async function getTrainingInvitation(req, res) {
  try {
    const body = await fs.readFile(path.join(__dirname, '..', 'templates', 'training-invitation.html'), 'utf8');
    res.json({ name: 'Приглашение на обучение', subject: 'Приглашение на обучение', body });
  } catch (err) {
    res.status(500).json({ error: 'Не удалось загрузить шаблон письма' });
  }
}

async function getTemplates(req, res) {
  try {
    const templates = await db.getTemplates();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTemplate(req, res) {
  try {
    const id = parseInt(req.params.id);
    const template = await db.getTemplate(id);
    if (!template) return res.status(404).json({ error: 'Шаблон не найден' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addTemplate(req, res) {
  try {
    const id = await db.addTemplate(req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateTemplate(req, res) {
  try {
    const id = parseInt(req.params.id);
    const ok = await db.updateTemplate(id, req.body);
    if (!ok) return res.status(404).json({ error: 'Шаблон не найден' });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteTemplate(req, res) {
  try {
    const id = parseInt(req.params.id);
    const ok = await db.deleteTemplate(id);
    if (!ok) return res.status(404).json({ error: 'Шаблон не найден' });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getTemplates, getTemplate, getTrainingInvitation, addTemplate, updateTemplate, deleteTemplate };