const db = require('../db');

// GET /api/groups - Список групп с фильтрами и пагинацией
exports.getGroups = async (req, res, next) => {
  try {
    const { page, limit, search, manager_id, status, hours_min, hours_max } = req.query;
    const filters = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      manager_id: manager_id ? parseInt(manager_id, 10) : undefined,
      status,
      hours_min: hours_min ? parseInt(hours_min, 10) : undefined,
      hours_max: hours_max ? parseInt(hours_max, 10) : undefined
    };

    const result = await db.getGroups(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id - Получить группу по ID
exports.getGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await db.getGroupById(parseInt(id, 10));

    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    res.json(group);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups - Создать группу
exports.createGroup = async (req, res, next) => {
  try {
    // Преобразование пустых строк в null
    if (req.body.manager_id === '') req.body.manager_id = null;
    if (req.body.auditorium === '') req.body.auditorium = null;
    if (req.body.branch === '') req.body.branch = null;
    if (req.body.hours === '') req.body.hours = null;
    if (req.body.start_date === '') req.body.start_date = null;
    if (req.body.end_date === '') req.body.end_date = null;
    if (req.body.manager_name === '') req.body.manager_name = null;
    if (req.body.course_price === '') req.body.course_price = null;

    const {
      manager_id,
      auditorium,
      branch,
      course_name,
      status,
      hours,
      start_date,
      end_date,
      format,
      manager_name,
      course_price
    } = req.body;

    // Проверка существования менеджера, если указан
    if (manager_id) {
      const manager = await db.getUserById(manager_id);
      if (!manager) {
        return res.status(400).json({ error: 'Менеджер с указанным ID не найден' });
      }
    }

    const id = await db.createGroup({
      manager_id,
      auditorium,
      branch,
      course_name,
      status,
      hours,
      start_date,
      end_date,
      format,
      manager_name,
      course_price
    });
    const group = await db.getGroupById(id);
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
};

// PUT /api/groups/:id - Обновить группу
exports.updateGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Преобразование пустых строк в null
    if (req.body.manager_id === '') req.body.manager_id = null;
    if (req.body.auditorium === '') req.body.auditorium = null;
    if (req.body.branch === '') req.body.branch = null;
    if (req.body.hours === '') req.body.hours = null;
    if (req.body.start_date === '') req.body.start_date = null;
    if (req.body.end_date === '') req.body.end_date = null;
    if (req.body.manager_name === '') req.body.manager_name = null;
    if (req.body.course_price === '') req.body.course_price = null;

    const updates = req.body;

    // Проверка существования группы
    const group = await db.getGroupById(parseInt(id, 10));
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    // Проверка существования менеджера, если указан
    if (updates.manager_id) {
      const manager = await db.getUserById(updates.manager_id);
      if (!manager) {
        return res.status(400).json({ error: 'Менеджер с указанным ID не найден' });
      }
    }

    const success = await db.updateGroup(parseInt(id, 10), updates);
    if (!success) {
      return res.status(400).json({ error: 'Нет полей для обновления' });
    }

    const updatedGroup = await db.getGroupById(parseInt(id, 10));
    res.json(updatedGroup);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id - Удалить группу
exports.deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await db.getGroupById(parseInt(id, 10));
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    await db.deleteGroup(parseInt(id, 10));
    res.json({ message: 'Группа удалена' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/groups/:groupId/listeners/:listenerId - Обновить финансовые данные слушателя в группе
exports.updateGroupListener = async (req, res, next) => {
  try {
    const { groupId, listenerId } = req.params;
    const updates = req.body;

    // Преобразование пустых строк в null
    if (updates.contract_amount === '') updates.contract_amount = null;
    if (updates.paid_amount === '') updates.paid_amount = null;
    if (updates.payment_type === '') updates.payment_type = null;
    if (updates.comment === '') updates.comment = null;

    const success = await db.updateGroupListener(
      parseInt(groupId, 10),
      parseInt(listenerId, 10),
      updates
    );

    if (!success) {
      return res.status(404).json({ error: 'Слушатель не найден в группе' });
    }

    res.json({ message: 'Финансовые данные обновлены' });
  } catch (err) {
    next(err);
  }
};
