const db = require('../db');
const { encrypt } = require('../services/encryptionService');

async function encryptExistingPasswords() {
  try {
    console.log('🔐 Начинаю шифрование существующих SMTP паролей...');

    // Получаем все записи senders напрямую через pool
    const result = await db.pool.query('SELECT id, password FROM senders');
    const senders = result.rows;

    if (senders.length === 0) {
      console.log('✅ Нет отправителей в базе данных.');
      process.exit(0);
    }

    let encryptedCount = 0;
    let skippedCount = 0;

    for (const sender of senders) {
      // Проверяем, не зашифрован ли уже пароль (зашифрованные содержат ":")
      if (sender.password && !sender.password.includes(':')) {
        // Шифруем пароль
        const encryptedPassword = encrypt(sender.password);

        // Обновляем в базе
        await db.pool.query(
          'UPDATE senders SET password = $1 WHERE id = $2',
          [encryptedPassword, sender.id]
        );

        encryptedCount++;
        console.log(`✓ Зашифрован пароль для sender ID ${sender.id}`);
      } else {
        skippedCount++;
        console.log(`- Пропущен sender ID ${sender.id} (уже зашифрован или пустой)`);
      }
    }

    console.log('\n📊 Результаты миграции:');
    console.log(`   Всего отправителей: ${senders.length}`);
    console.log(`   Зашифровано: ${encryptedCount}`);
    console.log(`   Пропущено: ${skippedCount}`);
    console.log('\n✅ Миграция завершена успешно!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при шифровании паролей:', err);
    process.exit(1);
  }
}

// Запуск
encryptExistingPasswords();
