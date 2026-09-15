const { Pool } = require('pg');
const config = require('../config');
const fs = require('fs');
const path = require('path');

async function addExpulsionOrderTemplate() {
  const pool = new Pool(config.db);

  try {
    console.log('Добавление шаблона "Приказ об отчислении"...');

    // Проверяем существование файла шаблона
    const templatePath = path.join(__dirname, '..', 'docs', 'expulsion_order.docx');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Файл шаблона не найден: ${templatePath}`);
    }

    // Читаем файл
    const fileData = fs.readFileSync(templatePath);
    console.log(`✓ Файл прочитан: ${fileData.length} байт`);

    // Проверяем, существует ли уже шаблон
    const existing = await pool.query(
      'SELECT id FROM document_templates WHERE code = $1',
      ['expulsion_order']
    );

    if (existing.rows.length > 0) {
      // Обновляем существующий шаблон
      await pool.query(
        `UPDATE document_templates
         SET file_data = $1,
             file_name = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE code = $3`,
        [fileData, 'expulsion_order.docx', 'expulsion_order']
      );
      console.log('✓ Шаблон "expulsion_order" обновлён');
    } else {
      // Создаём новый шаблон
      await pool.query(
        `INSERT INTO document_templates (code, name, description, file_data, file_name, is_active)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [
          'expulsion_order',
          'Приказ об отчислении',
          'Шаблон приказа об отчислении слушателей в связи с успешным окончанием обучения',
          fileData,
          'expulsion_order.docx'
        ]
      );
      console.log('✓ Шаблон "expulsion_order" добавлен в базу данных');
    }

    console.log('\nГотово! Шаблон доступен для использования.');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addExpulsionOrderTemplate();
