const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function login(email, password) {
  const user = await db.getUserByEmail(email);
  if (!user) throw new Error('Пользователь не найден');
  // Используем правильное имя поля — password_hash
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new Error('Неверный пароль');
  const token = generateToken(user);
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { login, verifyToken };