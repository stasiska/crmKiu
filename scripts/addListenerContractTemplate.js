const fs = require('fs');
const path = require('path');
const db = require('../db');

async function addListenerContractTemplate() {
  try {
    const templatePath = path.join(__dirname, '../docs/listener_contract.docx');

    if (!fs.existsSync(templatePath)) {
      console.error('Файл шаблона не найден:', templatePath);
      console.log('Создайте файл listener_contract.docx в папке docs/');
      process.exit(1);
    }

    const fileBuffer = fs.readFileSync(templatePath);

    const existing = await db.getDocumentTemplate('listener_contract');
    if (existing) {
      console.log('Шаблон "listener_contract" уже существует. Обновляю...');
      await db.updateDocumentTemplate(existing.id, {
        name: 'Договор на обучение (слушатель)',
        description: 'Договор на обучение по дополнительным профессиональным программам',
        file_data: fileBuffer
      });
      console.log('Шаблон обновлен успешно');
    } else {
      console.log('Добавляю новый шаблон "listener_contract"...');
      await db.createDocumentTemplate({
        code: 'listener_contract',
        name: 'Договор на обучение (слушатель)',
        description: 'Договор на обучение по дополнительным профессиональным программам',
        file_data: fileBuffer
      });
      console.log('Шаблон добавлен успешно');
    }

    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err);
    process.exit(1);
  }
}

addListenerContractTemplate();
