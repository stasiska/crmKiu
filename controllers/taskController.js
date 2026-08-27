const db = require('../db');

async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const tasks = await db.getTasks(userId, status);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTask(req, res) {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const task = await db.getTask(id, userId);
    if (!task) return res.status(404).json({ error: 'Задача не найдена' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createTask(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, status, assignedTo, deadline } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Название задачи обязательно' });
    }

    let assignedToId = null;
    if (assignedTo) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Только администратор может назначать ответственного' });
      }
      const user = await db.getUserById(parseInt(assignedTo));
      if (!user) {
        return res.status(400).json({ error: 'Указанный пользователь не найден' });
      }
      assignedToId = parseInt(assignedTo);
    }

    const task = await db.addTask(
      {
        title,
        description,
        status: status || 'todo',
        assignedTo: assignedToId,
        deadline: deadline || null,
      },
      userId
    );
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateTask(req, res) {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const { title, description, status, assignedTo, deadline } = req.body;

    let updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (deadline !== undefined) updates.deadline = deadline;

    if (assignedTo !== undefined) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Только администратор может назначать ответственного' });
      }
      if (assignedTo !== null) {
        const user = await db.getUserById(parseInt(assignedTo));
        if (!user) {
          return res.status(400).json({ error: 'Указанный пользователь не найден' });
        }
        updates.assignedTo = parseInt(assignedTo);
      } else {
        updates.assignedTo = null;
      }
    }

    const ok = await db.updateTask(id, userId, updates);
    if (!ok) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    // Если статус изменился на 'done', отправляем уведомление администратору
    if (status === 'done') {
      const task = await db.getTask(id, userId); // получаем обновлённую задачу
      if (task) {
        await db.addNotification(
          1, // ID администратора (можно сделать конфигурируемым)
          'task_done',
          `Задача "${task.title}" выполнена`,
          '/app/dashboard'
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка обновления задачи:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteTask(req, res) {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const ok = await db.deleteTask(id, userId);
    if (!ok) return res.status(404).json({ error: 'Задача не найдена' });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };