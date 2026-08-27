const nodemailer = require('nodemailer');
const db = require('../db');
const config = require('../config');
const { EventEmitter } = require('events');

class EmailService extends EventEmitter {
  constructor() {
    super();
    this.isSending = false;
    this.shouldStop = false;
  }

  // Очистка шаблона от лишних экранирований
  cleanTemplate(str) {
    if (!str) return '';
    return str
      .replace(/\\n/g, '\n')   // заменяем литералы \n на реальные переносы строк
      .replace(/\\"/g, '"')    // заменяем экранированные двойные кавычки
      .replace(/\\'/g, "'")   // заменяем экранированные одинарные кавычки
      .replace(/\\t/g, '\t')  // табуляция (если есть)
      .replace(/\\r/g, '');   // убираем \r
  }

  async sendBatch({ senderId, recipients, subject, bodyTemplate, onProgress, userId }) {
    this.isSending = true;
    this.shouldStop = false;

    console.log(`🚀 Отправка для пользователя ${userId}, получателей: ${recipients.length}`);

    const sender = await db.getSender(senderId, userId);
    if (!sender) {
      throw new Error(`Отправитель с id ${senderId} не найден`);
    }

    // Проверяем SMTP-соединение
    const transporter = nodemailer.createTransport({
      host: sender.host,
      port: sender.port,
      secure: !!sender.secure,
      auth: { user: sender.email, pass: sender.password },
    });

    try {
      await transporter.verify();
      console.log('✅ SMTP соединение успешно');
    } catch (err) {
      console.error('❌ Ошибка SMTP соединения:', err.message);
      throw new Error(`SMTP соединение не удалось: ${err.message}`);
    }

    // Очищаем шаблон один раз
    const cleanedTemplate = this.cleanTemplate(bodyTemplate);

    let sentCount = 0;
    let errorCount = 0;
    const total = recipients.length;
    const windowSeconds = config.rateLimitWindow / 1000;

    for (let i = 0; i < total; i++) {
      if (this.shouldStop) break;

      const recipient = recipients[i];

      // Проверка лимита (с await)
      const recent = await db.getRecentCount(senderId, windowSeconds);
      if (recent >= config.rateLimitCount) {
        const logs = await db.getLogs({ sender_id: senderId, limit: 1000 });
        const sentLogs = logs
          .filter(l => l.status === 'sent')
          .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
        const oldest = sentLogs[config.rateLimitCount - 1];
        if (oldest) {
          const oldestTime = new Date(oldest.sent_at).getTime();
          const waitMs = config.rateLimitWindow - (Date.now() - oldestTime) + 1000;
          if (waitMs > 0) {
            this.emit('paused', { waitMs, remaining: total - i, userId });
            await new Promise(resolve => setTimeout(resolve, waitMs));
            if (this.shouldStop) break;
          }
        }
      }

      // Персонализация с очищенным шаблоном
      const html = cleanedTemplate.replace(/\{([^}]+)\}/g, (match, key) => {
        return recipient[key] || match;
      });
      const subjectPersonalized = subject.replace(/\{([^}]+)\}/g, (match, key) => {
        return recipient[key] || match;
      });

      try {
        const info = await transporter.sendMail({
          from: sender.email,
          to: recipient.email,
          subject: subjectPersonalized,
          html,
        });
        await db.addLog({
          recipient_email: recipient.email,
          sender_id: senderId,
          subject: subjectPersonalized,
          body_preview: html.slice(0, 200),
          status: 'sent',
        });
        sentCount++;
        this.emit('progress', {
          index: i + 1,
          total,
          email: recipient.email,
          status: 'sent',
          senderEmail: sender.email,
          userId,
        });
        if (onProgress) onProgress({ index: i + 1, total, email: recipient.email, status: 'sent' });
      } catch (err) {
        console.error('❌ SMTP ошибка:', err.message);
        await db.addLog({
          recipient_email: recipient.email,
          sender_id: senderId,
          subject: subjectPersonalized,
          body_preview: html.slice(0, 200),
          status: 'error',
          error_message: err.message,
        });
        errorCount++;
        this.emit('progress', {
          index: i + 1,
          total,
          email: recipient.email,
          status: 'error',
          error: err.message,
          senderEmail: sender.email,
          userId,
        });
        if (onProgress) onProgress({ index: i + 1, total, email: recipient.email, status: 'error', error: err.message });
      }

      // Задержка между письмами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.isSending = false;
    this.emit('done', { status: 'done', sentCount, errorCount, userId });
    return { sentCount, errorCount };
  }

  stop() {
    this.shouldStop = true;
  }
}

module.exports = new EmailService();