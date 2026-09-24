const fs = require('fs');
const path = require('path');
const db = require('../db');

async function uploadTemplate() {
  try {
    const templatePath = path.join(__dirname, '..', 'docs', 'listener_application.docx');

    // Проверяем существование файла
    if (!fs.existsSync(templatePath)) {
      console.error('Ошибка: Файл listener_application.docx не найден в папке docs/');
      console.log('Путь:', templatePath);
      process.exit(1);
    }

    // Читаем файл
    const fileBuffer = fs.readFileSync(templatePath);
    console.log('Файл прочитан, размер:', fileBuffer.length, 'байт');

    // Проверяем, существует ли уже такой шаблон
    const existing = await db.getDocumentTemplate('listener_application');

    if (existing) {
      console.log('Шаблон listener_application уже существует. Обновляем...');
      await db.updateDocumentTemplate(existing.id, {
        name: 'Заявление слушателя о зачислении',
        description: 'Шаблон заявления для зачисления слушателя на программу повышения квалификации',
        file_data: fileBuffer
      });
      console.log('✓ Шаблон успешно обновлен');
    } else {
      console.log('Создаем новый шаблон listener_application...');
      await db.createDocumentTemplate({
        code: 'listener_application',
        type: 'listener_application',
        name: 'Заявление слушателя о зачислении',
        description: 'Шаблон заявления для зачисления слушателя на программу повышения квалификации',
        file_data: fileBuffer,
        category: 'listener'
      });
      console.log('✓ Шаблон успешно создан');
    }

    process.exit(0);
  } catch (err) {
    console.error('Ошибка загрузки шаблона:', err);
    process.exit(1);
  }
}

uploadTemplate();
