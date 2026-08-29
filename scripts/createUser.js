const bcrypt = require('bcryptjs');
const db = require('../db');

const email = 'admin@example.com';
const password = 'admin123';
const name = 'Администратор';
const role = 'admin';

const existing = db.getUserByEmail(email);
if (existing) {
  //console.log('Пользователь уже существует');
  process.exit(0);
}

const passwordHash = bcrypt.hashSync(password, 10);
db.createUser({ email, passwordHash, name, role });
//console.log(`✅ Пользователь ${email} создан с ролью ${role}`);