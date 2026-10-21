# Контекст проекта CRM

## Проект

CRM на Node.js/Express/PostgreSQL с клиентом React/Vite. Основные разделы — рассылки и ДПО.

## Рассылки

- Получатели загружаются из Excel одним действием или добавляются вручную.
- Импорт обновляет данные существующего получателя по email и автоматически привязывает его к организации по ИНН.
- Оператор выбирает получателей, составляет письмо и отправляет его через SMTP.
- Сохранённые шаблоны писем доступны только для ручного выбора в форме отправки: они подставляют тему и тело письма, но не связаны с получателями или импортом.
- В таблице получателей доступны фильтры по организации и поиску.

## Основные файлы

- `db/migrations.js` — миграции, включая реквизиты получателей и слушателей.
- `db/index.js` — логика получателей, импорта, организаций и истории изменений.
- `controllers/recipientController.js` — HTTP endpoints обычного импорта Excel и получателей.
- `routes/api.js` — API-маршруты.
- `client/src/api/index.js` — API-клиент.
- `client/src/context/AppContext.jsx` — состояние рассылки и ручное применение шаблонов.
- `client/src/pages/MailingPage/components/ImportArea.jsx` — одностадийный импорт Excel.
- `client/src/pages/MailingPage/components/Filters.jsx` — фильтры получателей.
- `client/src/pages/MailingPage/components/RecipientsTable.jsx` — таблица получателей.
- `client/src/pages/MailingPage/components/AddRecipientModal.jsx` — ручное создание получателя.
- `client/src/pages/MailingPage/components/EmailForm.jsx` — форма письма и ручной выбор сохранённого шаблона.

## Проверки

```bash
npm --prefix client run build
node --check controllers/recipientController.js
node --check db/index.js
node --check db/migrations.js
node --check services/excelService.js
git diff --check
```

Реальная отправка, импорт и миграции на рабочей БД не запускаются без отдельного запроса.

## Важные ограничения

- В рабочем дереве могут быть незакоммиченные изменения: не откатывать и не перезаписывать их без явного запроса.
- Не выполнять реальные операции с БД без явного запроса.
- Не создавать/редактировать DOCX и не загружать DOCX-шаблоны в БД без отдельного запроса.
- Не коммитить и не отправлять изменения без явного запроса.
