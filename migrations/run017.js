const { query } = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/017_create_listener_documents.sql'),
      'utf8'
    );

    await query(sql);
    console.log('✅ Миграция 017_create_listener_documents.sql выполнена успешно');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка выполнения миграции:', err);
    process.exit(1);
  }
}

runMigration();
