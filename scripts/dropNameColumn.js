const { Pool } = require('pg');
const config = require('../config');

async function dropNameColumn() {
  const pool = new Pool(config.db);

  try {
    // Удаляем колонку name из groups
    await pool.query('ALTER TABLE groups DROP COLUMN IF EXISTS name;');
    console.log('✓ Колонка name успешно удалена из таблицы groups');

  } catch (error) {
    console.error('Ошибка при удалении колонки:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

dropNameColumn();
