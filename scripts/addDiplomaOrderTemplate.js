const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

async function addDiplomaOrderTemplate() {
  try {
    const templatePath = path.join(__dirname, '..', 'docs', 'diploma_order.docx');

    if (!fs.existsSync(templatePath)) {
      console.error(`Файл шаблона не найден: ${templatePath}`);
      console.log('Создайте файл docs/diploma_order.docx с полями:');
      console.log('- {order_date_formatted}');
      console.log('- {city}');
      console.log('- {order_number}');
      console.log('- {protocol_date_formatted}');
      console.log('- {course_name}');
      console.log('- {hours}');
      console.log('- {start_date_ru}');
      console.log('- {end_date_ru}');
      console.log('- {listeners_numbered_list}');
      console.log('- {director_name}');
      console.log('- {deputy_director_name}');
      process.exit(1);
    }

    const fileBuffer = fs.readFileSync(templatePath);

    const result = await pool.query(
      `INSERT INTO document_templates (code, name, description, file_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (code) DO UPDATE
       SET file_data = EXCLUDED.file_data, updated_at = NOW()
       RETURNING id`,
      [
        'diploma_order',
        'Приказ о выдаче документов',
        'Шаблон приказа о выдаче дипломов о профессиональной переподготовке',
        fileBuffer
      ]
    );

    console.log('✓ Шаблон "Приказ о выдаче документов" успешно добавлен/обновлён (ID:', result.rows[0].id, ')');

    await pool.end();
  } catch (error) {
    console.error('Ошибка при добавлении шаблона:', error);
    process.exit(1);
  }
}

addDiplomaOrderTemplate();
