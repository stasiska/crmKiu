const db = require('../db');

// GET /api/branches - Список филиалов
exports.getBranches = async (req, res, next) => {
  try {
    const branches = await db.getBranches();
    res.json(branches);
  } catch (err) {
    next(err);
  }
};

// GET /api/branches/:id - Получить филиал по ID
exports.getBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const branch = await db.getBranchById(parseInt(id, 10));

    if (!branch) {
      return res.status(404).json({ error: 'Филиал не найден' });
    }

    res.json(branch);
  } catch (err) {
    next(err);
  }
};

// POST /api/branches - Создать филиал (только admin)
exports.createBranch = async (req, res, next) => {
  try {
    const { code, name, director_name, city } = req.body;

    const id = await db.createBranch({ code, name, director_name, city });
    const branch = await db.getBranchById(id);

    res.status(201).json(branch);
  } catch (err) {
    next(err);
  }
};

// PUT /api/branches/:id - Обновить филиал (только admin)
exports.updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const branch = await db.getBranchById(parseInt(id, 10));
    if (!branch) {
      return res.status(404).json({ error: 'Филиал не найден' });
    }

    const success = await db.updateBranch(parseInt(id, 10), updates);
    if (!success) {
      return res.status(400).json({ error: 'Нет полей для обновления' });
    }

    const updatedBranch = await db.getBranchById(parseInt(id, 10));
    res.json(updatedBranch);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/branches/:id - Удалить филиал (только admin)
exports.deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;

    const branch = await db.getBranchById(parseInt(id, 10));
    if (!branch) {
      return res.status(404).json({ error: 'Филиал не найден' });
    }

    await db.deleteBranch(parseInt(id, 10));
    res.json({ message: 'Филиал удалён' });
  } catch (err) {
    next(err);
  }
};
