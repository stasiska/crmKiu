const db = require('../db');
const bcrypt = require('bcryptjs');

async function getUsers(req, res) {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createUser(req, res) {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      email,
      passwordHash,
      name: name || '',
      role: role || 'user'
    });
    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const { role, name } = req.body;
    // Нельзя менять роль последнего администратора? Пока пропустим.
    // Получаем пользователя
    const user = await db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (name !== undefined) updates.name = name;
    // в db/index.js нет функции updateUser, создадим её
    const ok = await db.updateUser(userId, updates);
    if (!ok) return res.status(500).json({ error: 'Не удалось обновить' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;
    if (userId === currentUser.id) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }
    const ok = await db.deleteUser(userId);
    if (!ok) return res.status(404).json({ error: 'Пользователь не найден' });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getUsers, createUser, updateUser, deleteUser };