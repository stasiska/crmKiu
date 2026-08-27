const emailService = require('../services/emailService');
const db = require('../db');
const config = require('../config'); // <-- добавить импорт config

async function startSend(senderId, recipientIds, subject, bodyTemplate, ignoreDuplicate = false, userId) {
  const recipients = await db.getRecipientsByIds(recipientIds);

  let uniqueRecipients = recipients;
  if (!ignoreDuplicate) {
    // Используем db.checkDuplicate напрямую, асинхронно
    const checks = await Promise.all(
      recipients.map(r => db.checkDuplicate(r.email, config.duplicateDays))
    );
    uniqueRecipients = recipients.filter((_, index) => !checks[index]);
    if (uniqueRecipients.length === 0) {
      throw new Error('Все выбранные получатели уже получали письма в течение заданного периода');
    }
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