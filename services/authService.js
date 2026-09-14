const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '1d' }
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
    return jwt.verify(token, config.jwtSecret);
  } catch (e) {
    return null;
  }
}

module.exports = { login, verifyToken };