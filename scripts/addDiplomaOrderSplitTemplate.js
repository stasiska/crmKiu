const { Pool } = require('pg');
const config = require('../config');
const fs = require('fs');
const path = require('path');

async function addDiplomaOrderSplitTemplate() {
  const pool = new Pool(config.db);

  try {
    console.log('Добавление шаблона "Приказ о выдаче документов (раздельный)"...');

    // Проверяем существование файла шаблона
    const templatePath = path.join(__dirname, '..', 'docs', 'diploma_order_split.docx');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Файл шаблона не найден: ${templatePath}`);
    }

    // Читаем файл
    const fileData = fs.readFileSync(templatePath);
    console.log(`✓ Файл прочитан: ${fileData.length} байт`);

    // Проверяем, существует ли уже шаблон
    const existing = await pool.query(
      'SELECT id FROM document_templates WHERE code = $1',
      ['diploma_order_split']
    );

    if (existing.rows.length > 0) {
      // Обновляем существующий шаблон
      await pool.query(
        `UPDATE document_templates
         SET file_data = $1,
             file_name = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE code = $3`,
        [fileData, 'diploma_order_split.docx', 'diploma_order_split']
      );
      console.log('✓ Шаблон "diploma_order_split" обновлён');
    } else {
      // Создаём новый шаблон
      await pool.query(
        `INSERT INTO document_templates (code, name, description, file_data, file_name, is_active)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [
          'diploma_order_split',
          'Приказ о выдаче документов (раздельный)',
          'Шаблон приказа о выдаче документов с разделением слушателей по наличию высшего образования (дипломы и справки)',
          fileData,
          'diploma_order_split.docx'
        ]
      );
      console.log('✓ Шаблон "diploma_order_split" добавлен в базу данных');
    }

    console.log('\nГотово! Шаблон доступен для использования.');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addDiplomaOrderSplitTemplate();
