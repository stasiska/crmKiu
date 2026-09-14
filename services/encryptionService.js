const crypto = require('crypto');
const config = require('../config');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(config.encryptionKey, 'hex'); // 32 байта
const IV_LENGTH = 16; // AES block size

/**
 * Шифрует текст (например, SMTP пароль)
 * @param {string} text - Исходный текст
 * @returns {string} - Зашифрованный текст в формате iv:encrypted
 */
function encrypt(text) {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Возвращаем iv + зашифрованные данные, разделенные двоеточием
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Расшифровывает текст
 * @param {string} text - Зашифрованный текст в формате iv:encrypted
 * @returns {string} - Расшифрованный текст
 */
function decrypt(text) {
  if (!text) return text;

  // Если текст не содержит ":", значит это старый незашифрованный пароль
  if (!text.includes(':')) {
    console.warn('⚠️ Обнаружен незашифрованный пароль в БД. Рекомендуется пересохранить.');
    return text;
  }

  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = { encrypt, decrypt };
