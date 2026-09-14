const fs = require('fs');
const path = require('path');
const db = require('../db');

async function uploadTemplate() {
  try {
    const templatePath = path.join(__dirname, '..', 'docs', 'enrollment_order.docx');

    if (!fs.existsSync(templatePath)) {
      console.error('❌ Файл шаблона не найден:', templatePath);
      process.exit(1);
    }

    const fileData = fs.readFileSync(templatePath);

    // Проверяем, существует ли уже шаблон
    const existing = await db.getDocumentTemplate('enrollment_order');

    if (existing) {
      console.log('⚠️  Шаблон "enrollment_order" уже существует в базе данных');
      console.log('Если хотите обновить, удалите старый через API');
      process.exit(0);
    }

    // Создаем шаблон (userId = 1 - администратор)
    const templateId = await db.createDocumentTemplate({
      code: 'enrollment_order',
      name: 'Приказ о зачислении',
      description: 'Шаблон приказа о зачислении слушателей на курсы профессиональной переподготовки',
      file_data: fileData,
      file_name: 'enrollment_order.docx'
    }, 1);

    console.log('✅ Шаблон успешно загружен в базу данных с ID:', templateId);
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка загрузки шаблона:', err);
    process.exit(1);
  }
}

uploadTemplate();
