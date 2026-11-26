const nodemailer = require('nodemailer');
const db = require('../db');
const config = require('../config');
const { EventEmitter } = require('events');
const { decrypt } = require('./encryptionService');
const he = require('he');
const path = require('path');

const inlineImages = [
  { cid: 'ibo-logo', filename: 'top-logo-ibo.png' },
  { cid: 'mnipi-logo', filename: 'top-logo-mnipi.png' },
  { cid: 'training-image', filename: '50dd1d75-faa9-48f1-811a-5906ed954c5f.jpg' },
];

function personalize(template, recipient, escapeHtml = false) {
  return template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, key) => {
    let value;
    if (key === 'manager_greeting') {
      const fullName = String(recipient.manager_name || '').trim();
      const nameWithoutSurname = fullName.split(/\s+/).slice(1).join(' ');
      value = nameWithoutSurname ? `Добрый день, ${nameWithoutSurname}.` : 'Добрый день, коллеги.';
    } else if (key === 'manager_name' && !String(recipient.manager_name || '').trim()) {
      value = 'руководителю';
    } else if (Object.prototype.hasOwnProperty.call(recipient, key) && recipient[key] != null && recipient[key] !== '') {
      value = String(recipient[key]);
    } else {
      return match;
    }
    return escapeHtml ? he.encode(value) : value;
  });
}

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

  async sendBatch({ senderId, recipients, subject, bodyTemplate, attachments, onProgress, userId }) {
    this.isSending = true;
    this.shouldStop = false;

    //console.log(`🚀 Отправка для пользователя ${userId}, получателей: ${recipients.length}`);

    const sender = await db.getSender(senderId, userId);
    if (!sender) {
      throw new Error(`Отправитель с id ${senderId} не найден`);
    }

    // Получаем имя пользователя для логирования
    const user = await db.getUserById(userId);
    const userName = user ? user.name : 'Пользователь';

    // Пароль уже расшифрован в db.getSender()
    // Проверяем SMTP-соединение
    const transporter = nodemailer.createTransport({
      host: sender.host,
      port: sender.port,
      secure: !!sender.secure,
      auth: { user: sender.email, pass: sender.password },
    });

    try {
      await transporter.verify();
      //console.log('✅ SMTP соединение успешно');
    } catch (err) {
      console.error('❌ Ошибка SMTP соединения:', err.message);
      throw new Error(`SMTP соединение не удалось: ${err.message}`);
    }

    // Очищаем шаблон один раз
    const cleanedTemplate = this.cleanTemplate(bodyTemplate);

    let sentCount = 0;
    let errorCount = 0;
    const total = recipients.length;
    const windowSeconds = config.rateLimit.windowMs / 1000;

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

      const html = personalize(cleanedTemplate, recipient, true);
      const subjectPersonalized = personalize(subject, recipient);

      try {
        const mailOptions = {
          from: sender.email,
          to: recipient.email,
          subject: subjectPersonalized,
          html,
        };

        const embeddedImages = inlineImages
          .filter(image => html.includes(`cid:${image.cid}`))
          .map(image => ({
            filename: image.filename,
            path: path.join(__dirname, '..', 'images', image.filename),
            cid: image.cid,
          }));
        if (embeddedImages.length || attachments?.length) {
          mailOptions.attachments = [...(attachments || []), ...embeddedImages];
        }

        const info = await transporter.sendMail(mailOptions);
        await db.addLog({
          recipient_email: recipient.email,
          sender_id: senderId,
          subject: subjectPersonalized,
          body_preview: html.slice(0, 200),
          status: 'sent',
        });

        // Автоматически добавляем комментарий об отправке
        const sendDate = new Date().toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        const commentText = `Отправлено письмо от ${sender.email} в ${sendDate} пользователем ${userName}. Тема: "${subjectPersonalized}"`;
        await db.addComment(recipient.id, userId, commentText);

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