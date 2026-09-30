const fs = require('fs');
const path = require('path');
const db = require('../db');

async function uploadTemplate() {
  try {
    const templatePath = path.join(__dirname, '..', 'docs', 'listener_personal_data_distribution_consent.docx');
    if (!fs.existsSync(templatePath)) {
      console.error('Файл шаблона не найден:', templatePath);
      process.exit(1);
    }

    const fileBuffer = fs.readFileSync(templatePath);
    const code = 'listener_personal_data_distribution_consent';
    const name = 'Согласие слушателя на распространение персональных данных';
    const description = 'Заявление о согласии на обработку персональных данных, разрешенных для распространения';
    const file_name = path.basename(templatePath);
    const existing = (await db.getDocumentTemplates()).find(template => template.code === code);

    if (existing) {
      await db.updateDocumentTemplate(existing.id, { name, description, file_data: fileBuffer, file_name, is_active: true });
      console.log('Шаблон согласия на распространение обновлён');
    } else {
      await db.createDocumentTemplate({ code, name, description, file_data: fileBuffer, file_name });
      console.log('Шаблон согласия на распространение добавлен');
    }
    process.exit(0);
  } catch (err) {
    console.error('Ошибка загрузки шаблона:', err);
    process.exit(1);
  }
}

uploadTemplate();
