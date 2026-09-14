const emailService = require('../services/emailService');
const db = require('../db');
const config = require('../config');

async function startSend(senderId, recipientIds, subject, bodyTemplate, ignoreDuplicate = false, userId) {
  const recipients = await db.getRecipientsByIds(recipientIds);

  if (recipients.length === 0) {
    throw new Error('Не найдено ни одного получателя с указанными ID');
  }

  let uniqueRecipients = recipients;

  // ВСЕГДА проверяем дубликаты, независимо от флага
  const duplicateChecks = await Promise.all(
    recipients.map(r => db.checkDuplicate(r.email, config.duplicateDays || 1))
  );

  const duplicates = recipients.filter((_, index) => duplicateChecks[index]);
  const nonDuplicates = recipients.filter((_, index) => !duplicateChecks[index]);

  // Если есть дубликаты и флаг ignoreDuplicate НЕ установлен - выбрасываем ошибку
  if (duplicates.length > 0 && !ignoreDuplicate) {
    const duplicateEmails = duplicates.map(r => r.email).join(', ');
    throw new Error(
      `Обнаружены получатели, которым уже отправлялись письма за последние ${config.duplicateDays || 1} дн.: ${duplicateEmails}. ` +
      `Всего дубликатов: ${duplicates.length} из ${recipients.length}. ` +
      `Установите флаг "Игнорировать дубликаты" для повторной отправки.`
    );
  }

  // Если флаг ignoreDuplicate установлен, отправляем всем
  if (ignoreDuplicate) {
    uniqueRecipients = recipients;
  } else {
    uniqueRecipients = nonDuplicates;
  }

  // Проверка, что после фильтрации остались получатели
  if (uniqueRecipients.length === 0) {
    throw new Error('После проверки дубликатов не осталось получателей для отправки');
  }

  return emailService.sendBatch({
    senderId,
    recipients: uniqueRecipients,
    subject,
    bodyTemplate,
    userId,
  });
}

function stopSend() {
  emailService.stop();
}

module.exports = { startSend, stopSend };