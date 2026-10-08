const db = require('../db');
const { buildGroupsExcel } = require('../services/excelService');

function parseGroupFilters(query) {
  return {
    search: query.search,
    manager_id: query.manager_id ? parseInt(query.manager_id, 10) : undefined,
    status: query.status,
    format: query.format,
    hours_min: query.hours_min !== undefined && query.hours_min !== '' ? parseInt(query.hours_min, 10) : undefined,
    hours_max: query.hours_max !== undefined && query.hours_max !== '' ? parseInt(query.hours_max, 10) : undefined,
  };
}

exports.getGroups = async (req, res, next) => {
  try {
    const filters = parseGroupFilters(req.query);
    filters.page = req.query.page ? parseInt(req.query.page, 10) : 1;
    filters.limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    res.json(await db.getGroups(filters));
  } catch (err) {
    next(err);
  }
};

exports.exportGroups = async (req, res, next) => {
  try {
    const rows = await db.getGroupsForExport(parseGroupFilters(req.query));
    const buffer = buildGroupsExcel(rows);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="groups_${date}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

exports.getGroup = async (req, res, next) => {
  try {
    const group = await db.getGroupById(parseInt(req.params.id, 10));
    if (!group) return res.status(404).json({ error: 'Группа не найдена' });
    res.json(group);
  } catch (err) {
    next(err);
  }
};

exports.createGroup = async (req, res, next) => {
  try {
    ['manager_id', 'auditorium', 'branch', 'hours', 'start_date', 'end_date', 'manager_name', 'course_price'].forEach((field) => {
      if (req.body[field] === '') req.body[field] = null;
    });
    const { manager_id, auditorium, branch, course_name, status, hours, start_date, end_date, format, manager_name, course_price } = req.body;
    if (manager_id && !await db.getUserById(manager_id)) {
      return res.status(400).json({ error: 'Менеджер с указанным ID не найден' });
    }
    const id = await db.createGroup({ manager_id, auditorium, branch, course_name, status, hours, start_date, end_date, format, manager_name, course_price });
    res.status(201).json(await db.getGroupById(id));
  } catch (err) {
    next(err);
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    ['manager_id', 'auditorium', 'branch', 'hours', 'start_date', 'end_date', 'manager_name', 'course_price'].forEach((field) => {
      if (req.body[field] === '') req.body[field] = null;
    });
    if (!await db.getGroupById(id)) return res.status(404).json({ error: 'Группа не найдена' });
    if (req.body.manager_id && !await db.getUserById(req.body.manager_id)) {
      return res.status(400).json({ error: 'Менеджер с указанным ID не найден' });
    }
    if (!await db.updateGroup(id, req.body)) return res.status(400).json({ error: 'Нет полей для обновления' });
    res.json(await db.getGroupById(id));
  } catch (err) {
    next(err);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!await db.getGroupById(id)) return res.status(404).json({ error: 'Группа не найдена' });
    await db.deleteGroup(id);
    res.json({ message: 'Группа удалена' });
  } catch (err) {
    next(err);
  }
};

exports.updateGroupListener = async (req, res, next) => {
  try {
    const { groupId, listenerId } = req.params;
    const updates = req.body;
    ['contract_amount', 'paid_amount', 'payment_type', 'comment'].forEach((field) => {
      if (updates[field] === '') updates[field] = null;
    });
    const success = await db.updateGroupListener(parseInt(groupId, 10), parseInt(listenerId, 10), updates);
    if (!success) return res.status(404).json({ error: 'Слушатель не найден в группе' });
    res.json({ message: 'Финансовые данные обновлены' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGroups: exports.getGroups,
  exportGroups: exports.exportGroups,
  getGroup: exports.getGroup,
  createGroup: exports.createGroup,
  updateGroup: exports.updateGroup,
  deleteGroup: exports.deleteGroup,
  updateGroupListener: exports.updateGroupListener,
};
