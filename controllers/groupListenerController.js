const db = require('../db');

// GET /api/groups/:groupId/listeners - Получить слушателей группы
exports.getListeners = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { page, limit } = req.query;

    // Проверка существования группы
    const group = await db.getGroupById(parseInt(groupId, 10));
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    const filters = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20
    };

    const result = await db.getGroupListeners(parseInt(groupId, 10), filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:groupId/listeners - Добавить слушателей в группу
exports.addListeners = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { listenerIds } = req.body;

    // Проверка существования группы
    const group = await db.getGroupById(parseInt(groupId, 10));
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    // Проверка что все слушатели существуют
    const existingIds = await db.checkListenersExist(listenerIds);
    const missingIds = listenerIds.filter(id => !existingIds.includes(id));

    if (missingIds.length > 0) {
      return res.status(400).json({
        error: 'Некоторые слушатели не найдены',
        missingIds
      });
    }

    // Добавление слушателей (дубликаты игнорируются)
    const addedCount = await db.addListenersToGroup(parseInt(groupId, 10), listenerIds);

    res.json({
      message: `Добавлено слушателей: ${addedCount}`,
      addedCount,
      totalRequested: listenerIds.length
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:groupId/listeners/:listenerId - Удалить слушателя из группы
exports.removeListener = async (req, res, next) => {
  try {
    const { groupId, listenerId } = req.params;

    // Проверка существования группы
    const group = await db.getGroupById(parseInt(groupId, 10));
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    const success = await db.removeListenerFromGroup(
      parseInt(groupId, 10),
      parseInt(listenerId, 10)
    );

    if (!success) {
      return res.status(404).json({ error: 'Слушатель не найден в группе' });
    }

    res.json({ message: 'Слушатель удалён из группы' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:groupId/listeners - Удалить всех слушателей из группы
exports.clearListeners = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // Проверка существования группы
    const group = await db.getGroupById(parseInt(groupId, 10));
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    const deletedCount = await db.clearGroupListeners(parseInt(groupId, 10));

    res.json({
      message: 'Все слушатели удалены из группы',
      deletedCount
    });
  } catch (err) {
    next(err);
  }
};
