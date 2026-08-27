// ---- Глобальные переменные ----
let selectedSenderId = null;
let eventSource = null;
let isSending = false;
let sseTimeout = null;

// ---- DOM элементы ----
const sendersContainer = document.getElementById('sendersContainer');
const recipientsTable = document.getElementById('recipientsTable');
const filterCity = document.getElementById('filterCity');
const filterOrg = document.getElementById('filterOrg');
const filterSpec = document.getElementById('filterSpec');
const searchInput = document.getElementById('searchInput');
const selectAll = document.getElementById('selectAll');
const excelFile = document.getElementById('excelFile');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const countLabel = document.getElementById('countLabel');
const subjectInput = document.getElementById('subjectInput');
const bodyInput = document.getElementById('bodyInput');
const sendBtn = document.getElementById('sendBtn');
const stopBtn = document.getElementById('stopBtn');
const sendStatus = document.getElementById('sendStatus');
const progressLog = document.getElementById('progressLog');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('../middleware/auth');
const { login } = require('../services/authService');

// ---- Публичные маршруты ----
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ---- Защищённые маршруты (все остальные) ----
router.use(authMiddleware); // все маршруты ниже требуют авторизации

// ... все остальные маршруты (senders, recipients, send, templates, logs, clear-database)
// они уже есть, просто убедитесь, что они расположены после router.use(authMiddleware)


// ---- Загрузка отправителей ----
async function loadSenders() {
  try {
    const res = await fetch('/api/senders');
    const senders = await res.json();
    sendersContainer.innerHTML = '';
    if (!senders.length) {
      sendersContainer.innerHTML = '<div class="alert alert-warning">Нет добавленных отправителей. Добавьте их в панели управления (⚙️).</div>';
      return;
    }

    senders.forEach(s => {
      const card = document.createElement('div');
      card.className = 'sender-card';
      card.dataset.id = s.id;

      // Статус
      const status = s.status;
      const isAllowed = status.allowed;
      const dotClass = isAllowed ? 'green' : 'red';
      const statusText = isAllowed ? 'Доступно' : 
        (status.reason === 'rate_limit' ? 'Лимит 10/10мин' : 'Суточный лимит');

      card.innerHTML = `
        <strong>${s.name}sdsd</strong><br>
        <small>${s.email}</small>
        <div class="sender-status">
          <span class="status-dot ${dotClass}"></span>
          <span class="status-text ${dotClass}">${statusText}</span>
        </div>
        <div class="sender-stats">
          <span>📤 ${status.recent}/${status.limit} за 10мин</span>
          <span>📅 ${status.daily}/${status.dailyLimit} за день</span>
        </div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.sender-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedSenderId = s.id;
      });

      sendersContainer.appendChild(card);
    });

    // Выбираем первого по умолчанию (если он доступен, иначе ищем доступного)
    const firstCard = document.querySelector('.sender-card');
    if (firstCard) {
      // Проверяем, есть ли доступный отправитель
      const availableCard = Array.from(document.querySelectorAll('.sender-card')).find(
        card => card.querySelector('.status-dot.green')
      );
      const targetCard = availableCard || firstCard;
      targetCard.classList.add('active');
      selectedSenderId = parseInt(targetCard.dataset.id);
    }
  } catch (e) {
    console.error('Ошибка загрузки отправителей:', e);
  }
}

// ---- Загрузка фильтров ----
async function loadFilters() {
  try {
    // Загружаем города
    const citiesRes = await fetch('/api/recipients/filters');
    const { cities } = await citiesRes.json();
    filterCity.innerHTML = '<option value="">Все города</option>' + cities.map(c => `<option value="${c.city}">${c.city}</option>`).join('');
  } catch (e) {
    console.error('Ошибка загрузки городов:', e);
  }

  try {
    // Загружаем специализации
    const specsRes = await fetch('/api/recipients/filters');
    const { specializations } = await specsRes.json();
    filterSpec.innerHTML = '<option value="">Все специализации</option>' + specializations.map(s => `<option value="${s.specialization}">${s.specialization}</option>`).join('');
  } catch (e) {
    console.error('Ошибка загрузки специализаций:', e);
  }

  try {
    // Загружаем организации
    const orgsRes = await fetch('/api/recipients/organizations');
    const orgs = await orgsRes.json();
    filterOrg.innerHTML = '<option value="">Все организации</option>' + orgs.map(o => `<option value="${o.organization}">${o.organization}</option>`).join('');
  } catch (e) {
    console.error('Ошибка загрузки организаций:', e);
  }
}
loadFilters();

// ---- Загрузка получателей ----
async function loadRecipients() {
  try {
    const params = new URLSearchParams({
      city: filterCity.value,
      specialization: filterSpec.value,
      organization: filterOrg.value,
      search: searchInput.value,
    });
    const res = await fetch('/api/recipients?' + params);
    const data = await res.json();
    renderTable(data);
    updateCount(data.length);
  } catch (e) {
    console.error('Ошибка загрузки получателей:', e);
  }
}
function renderTable(recipients) {
  if (!recipients.length) {
    recipientsTable.innerHTML = '<tr><td colspan="9" class="text-center">Нет получателей</td></tr>';
    return;
  }
  recipientsTable.innerHTML = recipients.map(r => {
    const rowClass = r.hasSent ? 'table-warning' : '';
    const lastSent = r.last_sent_at ? new Date(r.last_sent_at).toLocaleString() : '—';
    const comment = r.comment || '';
    return `
      <tr class="${rowClass}">
        <td><input type="checkbox" class="recipient-checkbox" data-id="${r.id}"></td>
        <td>${r.email}</td>
        <td>${r.name || ''}</td>
        <td>${r.phone || ''}</td>
        <td>${r.city || ''}</td>
        <td>${r.organization || ''}</td>
        <td>${r.specialization || ''}</td>
        <td class="comment-cell" data-id="${r.id}" data-comment="${comment}">${comment}</td>
        <td>${lastSent}</td>
      </tr>
    `;
  }).join('');

  // ---- Обработчики двойного клика для комментариев ----
  document.querySelectorAll('.comment-cell').forEach(cell => {
    // Удаляем старые обработчики, чтобы избежать дублирования
    cell.removeEventListener('dblclick', cell._dblClickHandler);
    const handler = function() {
      const id = parseInt(this.dataset.id);
      const currentComment = this.dataset.comment || '';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.value = currentComment;
      input.className = 'form-control form-control-sm';
      input.style.width = '100%';
      
      this.innerHTML = '';
      this.appendChild(input);
      input.focus();
      input.select();

      const save = async () => {
        const newComment = input.value.trim();
        await saveComment(id, newComment);
      };

      input.addEventListener('blur', save);
      input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          await save();
        }
        if (e.key === 'Escape') {
          this.textContent = currentComment || '';
          this.dataset.comment = currentComment;
        }
      });
    };
    cell._dblClickHandler = handler;
    cell.addEventListener('dblclick', handler);
  });
}

function updateCount(count) {
  countLabel.textContent = `Всего: ${count}`;
}

filterCity.addEventListener('change', loadRecipients);
filterSpec.addEventListener('change', loadRecipients);
filterOrg.addEventListener('change', loadRecipients);
searchInput.addEventListener('input', loadRecipients);

selectAll.addEventListener('change', (e) => {
  document.querySelectorAll('.recipient-checkbox').forEach(cb => cb.checked = e.target.checked);
});

// ---- Импорт Excel ----
uploadBtn.addEventListener('click', async () => {
  const file = excelFile.files[0];
  if (!file) return alert('Выберите файл');
  const formData = new FormData();
  formData.append('file', file);
  uploadStatus.textContent = 'Загрузка...';
  try {
    const res = await fetch('/api/recipients/import', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    uploadStatus.textContent = `Импортировано: ${result.imported} записей`;
    loadRecipients();
  } catch (e) {
    uploadStatus.textContent = 'Ошибка импорта';
    console.error(e);
  }
});

// ---- Отправка ----
sendBtn.addEventListener('click', async () => {
  if (isSending) return;
  if (!selectedSenderId) {
    alert('Выберите отправителя (нажмите на карточку)');
    return;
  }
  const checked = document.querySelectorAll('.recipient-checkbox:checked');
  if (!checked.length) {
    alert('Выберите хотя бы одного получателя');
    return;
  }
  const recipientIds = Array.from(checked).map(cb => parseInt(cb.dataset.id));
  const subject = subjectInput.value.trim();
  const body = bodyInput.value.trim();
  if (!subject || !body) {
    alert('Заполните тему и тело письма');
    return;
  }

  // Блокируем UI
  isSending = true;
  sendBtn.disabled = true;
  stopBtn.style.display = 'inline-block';
  sendStatus.textContent = 'Отправка...';
  progressLog.innerHTML = '<div class="text-info">⏳ Подключение к серверу...</div>';

  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  if (sseTimeout) {
    clearTimeout(sseTimeout);
    sseTimeout = null;
  }
  const ignoreDuplicate = document.getElementById('ignoreDuplicate').checked;

  connectSSE();

  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: selectedSenderId,
        recipientIds,
        subject,
        body,
        ignoreDuplicate,
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Ошибка отправки');
    }
    // Ждём события от SSE
  } catch (e) {
    alert(e.message);
    resetUI('Ошибка');
  }
});

// ---- Сброс UI после завершения ----
function resetUI(message) {
  isSending = false;
  sendBtn.disabled = false;
  stopBtn.style.display = 'none';
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  if (sseTimeout) {
    clearTimeout(sseTimeout);
    sseTimeout = null;
  }
  if (message) {
    sendStatus.textContent = message;
  }
}

// ---- SSE ----
function connectSSE() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  eventSource = new EventSource('/api/send/progress');
  
  // Таймаут на случай, если SSE зависнет без завершения
  sseTimeout = setTimeout(() => {
    if (isSending) {
      progressLog.innerHTML += '<div class="text-danger">⏱️ Превышено время ожидания ответа от сервера</div>';
      resetUI('Таймаут');
    }
  }, 120000); // 2 минуты

  eventSource.onopen = () => {
    progressLog.innerHTML += '<div class="text-success">✅ Соединение установлено</div>';
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('SSE событие:', data);

      if (data.status === 'done') {
        let msg = `✅ Готово! Отправлено: ${data.sentCount}, ошибок: ${data.errorCount}`;
        if (data.error) {
          msg += ` (фатальная ошибка: ${data.error})`;
        }
        sendStatus.textContent = msg;
        progressLog.innerHTML += `<div class="text-success fw-bold">🏁 ${msg}</div>`;
        resetUI();
        loadRecipients(); // обновляем подсветку
        loadSenders(); // обновляем статистику отправителя
      } else if (data.status === 'sent') {
        progressLog.innerHTML += `<div class="text-success">✅ ${data.email} (от: ${data.senderEmail}) ${data.index}/${data.total}</div>`;
        progressLog.scrollTop = progressLog.scrollHeight;
        sendStatus.textContent = `Отправка: ${data.index}/${data.total}`;
      } else if (data.status === 'error') {
        progressLog.innerHTML += `<div class="text-danger">❌ ${data.email} (от: ${data.senderEmail}) - ${data.error || 'Ошибка'}</div>`;
        progressLog.scrollTop = progressLog.scrollHeight;
        sendStatus.textContent = `Ошибка на ${data.email}`;
      } else if (data.waitMs) {
        const seconds = Math.round(data.waitMs / 1000);
        progressLog.innerHTML += `<div class="text-warning">⏳ Пауза ${seconds} сек (осталось ${data.remaining} писем)</div>`;
        progressLog.scrollTop = progressLog.scrollHeight;
        sendStatus.textContent = `Пауза ${seconds} сек...`;
      }
    } catch (e) {
      console.error('Ошибка парсинга SSE:', e);
    }
  };

  eventSource.onerror = (err) => {
    console.error('SSE ошибка:', err);
    // Если ошибка произошла, но мы всё ещё ждём завершения, пробуем переподключиться
    // или сбрасываем UI, если это фатально.
    if (isSending) {
      progressLog.innerHTML += '<div class="text-danger">❌ Потеря соединения с сервером</div>';
      resetUI('Ошибка соединения');
    }
  };
}

// ---- Остановка ----
stopBtn.addEventListener('click', async () => {
  if (!isSending) return;
  try {
    await fetch('/api/send/stop', { method: 'POST' });
    sendStatus.textContent = '⏹ Остановлено пользователем';
    progressLog.innerHTML += '<div class="text-warning">⏹ Остановлено пользователем</div>';
    resetUI('Остановлено');
  } catch (e) {
    console.error(e);
    resetUI('Ошибка при остановке');
  }
});


// ---- Очистка истории ----
document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
  if (!confirm('Вы уверены, что хотите удалить всю историю отправок? Это позволит повторно отправлять письма тем же получателям.')) return;
  try {
    const res = await fetch('/api/logs', { method: 'DELETE' });
    if (res.ok) {
      alert('История очищена');
      loadRecipients(); // обновить таблицу
    } else {
      alert('Ошибка при очистке');
    }
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
});

// ---- Обновление счётчика доступных (неотправленных) ----
function updateAvailableCount() {
  const rows = document.querySelectorAll('#recipientsTable tr');
  let available = 0;
  rows.forEach(row => {
    if (!row.classList.contains('table-warning')) {
      available++;
    }
  });
  const el = document.getElementById('availableCount');
  if (el) el.textContent = `Доступно: ${available}`;
}

// ---- Выбор первых N неотправленных ----
function selectFirstN(n) {
  const rows = document.querySelectorAll('#recipientsTable tr');
  const availableRows = [];
  rows.forEach(row => {
    if (!row.classList.contains('table-warning')) {
      availableRows.push(row);
    }
  });
  // Снимаем все выделения
  document.querySelectorAll('.recipient-checkbox').forEach(cb => cb.checked = false);
  // Отмечаем первые n (или сколько есть)
  const count = Math.min(n, availableRows.length);
  for (let i = 0; i < count; i++) {
    const cb = availableRows[i].querySelector('.recipient-checkbox');
    if (cb) cb.checked = true;
  }
  // Обновляем состояние "Выбрать всех"
  updateSelectAllState();
  updateAvailableCount();
}

// ---- Обновление состояния чекбокса "Выбрать всех" ----
function updateSelectAllState() {
  const checkboxes = document.querySelectorAll('.recipient-checkbox');
  const checked = document.querySelectorAll('.recipient-checkbox:checked');
  const selectAll = document.getElementById('selectAll');
  if (checkboxes.length === 0) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
    return;
  }
  if (checked.length === checkboxes.length) {
    selectAll.checked = true;
    selectAll.indeterminate = false;
  } else if (checked.length === 0) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  } else {
    selectAll.checked = false;
    selectAll.indeterminate = true;
  }
}

// ---- Обработчики кнопок ----
document.getElementById('select10').addEventListener('click', () => selectFirstN(10));
document.getElementById('select20').addEventListener('click', () => selectFirstN(20));
document.getElementById('select30').addEventListener('click', () => selectFirstN(30));

// ---- Обновление счетчика при изменении чекбоксов ----
document.getElementById('recipientsTable').addEventListener('change', (e) => {
  if (e.target.classList.contains('recipient-checkbox')) {
    updateSelectAllState();
    updateAvailableCount();
  }
});

// ---- Переопределяем обработчик "Выбрать всех", чтобы обновлять счётчик ----
document.getElementById('selectAll').addEventListener('change', (e) => {
  document.querySelectorAll('.recipient-checkbox').forEach(cb => cb.checked = e.target.checked);
  updateSelectAllState();
  updateAvailableCount();
});

// async function loadSenders() {
//   try {
//     const [sendersRes, statsRes] = await Promise.all([
//       fetch('/api/senders'),
//       fetch('/api/senders/stats')
//     ]);
//     const senders = await sendersRes.json();
//     const stats = await statsRes.json();
//     sendersContainer.innerHTML = '';
//     if (!senders.length) {
//       sendersContainer.innerHTML = '<div class="alert alert-warning">Нет добавленных отправителей. Добавьте их вручную в data/db.json</div>';
//       return;
//     }
//     senders.forEach(s => {
//       const stat = stats.find(st => st.id === s.id);
//       const dailyCount = stat ? stat.dailyCount : 0;
//       const card = document.createElement('div');
//       card.className = 'sender-card';
//       card.dataset.id = s.id;
//       card.innerHTML = `
//         <strong>${s.name}</strong><br>
//         <small>${s.email}</small><br>
//         <small class="text-muted">Сегодня: ${dailyCount} писем</small>
//       `;
//       card.addEventListener('click', () => {
//         document.querySelectorAll('.sender-card').forEach(c => c.classList.remove('active'));
//         card.classList.add('active');
//         selectedSenderId = s.id;
//       });
//       sendersContainer.appendChild(card);
//     });
//     const firstCard = document.querySelector('.sender-card');
//     if (firstCard) {
//       firstCard.classList.add('active');
//       selectedSenderId = senders[0].id;
//     }
//   } catch (e) {
//     console.error('Ошибка загрузки отправителей:', e);
//   }
// }

// ---- Шаблоны ----
async function loadTemplates() {
  try {
    const res = await fetch('/api/templates');
    const templates = await res.json();
    const select = document.getElementById('templateSelect');
    // Очищаем опции, оставляя первую
    select.innerHTML = '<option value="">-- Ручной ввод --</option>';
    templates.forEach(t => {
      const option = document.createElement('option');
      option.value = t.id;
      option.textContent = t.name;
      select.appendChild(option);
    });
  } catch (e) {
    console.error('Ошибка загрузки шаблонов:', e);
  }
}

// При выборе шаблона
document.getElementById('templateSelect').addEventListener('change', async (e) => {
  const id = e.target.value;
  if (!id) return;
  try {
    const res = await fetch(`/api/templates/${id}`);
    const template = await res.json();
    document.getElementById('subjectInput').value = template.subject || '';
    document.getElementById('bodyInput').value = template.body || '';
  } catch (err) {
    console.error('Ошибка загрузки шаблона:', err);
  }
});

// ============================================================
//  НАСТРОЙКИ (панель управления)
// ============================================================

const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const settingsClose = document.getElementById('settingsClose');
const overlay = document.createElement('div');
overlay.className = 'settings-overlay';
document.body.appendChild(overlay);

// Открыть/закрыть панель
function openPanel() {
  settingsPanel.classList.add('open');
  overlay.classList.add('open');
}
function closePanel() {
  settingsPanel.classList.remove('open');
  overlay.classList.remove('open');
}
settingsToggle.addEventListener('click', openPanel);
settingsClose.addEventListener('click', closePanel);
overlay.addEventListener('click', closePanel);

// Переключение вкладок
document.querySelectorAll('.settings-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.settings-tab-pane').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('tab-' + this.dataset.tab).classList.add('active');
    // при переключении обновляем списки
    if (this.dataset.tab === 'senders') loadSenderList();
    else loadTemplateList();
  });
});

// --------------------------------------------
//  ОТПРАВИТЕЛИ
// --------------------------------------------

const senderForm = document.getElementById('senderForm');
const senderSubmitBtn = document.getElementById('senderSubmitBtn');
const senderCancelBtn = document.getElementById('senderCancelBtn');
let senderEditId = null;

// Загрузить список отправителей в панель
async function loadSenderList() {
  const res = await fetch('/api/senders');
  const senders = await res.json();
  const container = document.getElementById('senderList');
  if (!senders.length) {
    container.innerHTML = '<p class="text-muted" style="padding:10px;">Нет отправителей</p>';
    return;
  }
  container.innerHTML = senders.map(s => `
    <div class="settings-item" data-id="${s.id}">
      <div class="item-info">
        <strong>${s.name}</strong>
        <small>${s.email}</small>
      </div>
      <div class="item-actions">
        <button class="edit-btn" title="Редактировать">✏️</button>
        <button class="delete-btn" title="Удалить">🗑️</button>
      </div>
    </div>
  `).join('');

  // Обработчики для кнопок
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.closest('.settings-item').dataset.id);
      editSender(id);
    });
  });
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.closest('.settings-item').dataset.id);
      if (confirm('Удалить отправителя?')) deleteSender(id);
    });
  });
}

// Добавление/обновление отправителя
senderForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('senderName').value,
    email: document.getElementById('senderEmail').value,
    host: document.getElementById('senderHost').value,
    port: parseInt(document.getElementById('senderPort').value),
    secure: parseInt(document.getElementById('senderSecure').value),
    password: document.getElementById('senderPassword').value,
  };
  const editId = document.getElementById('senderEditId').value;
  let url = '/api/senders';
  let method = 'POST';
  if (editId) {
    url += '/' + editId;
    method = 'PUT';
  }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    resetSenderForm();
    loadSenderList();
    loadSenders(); // обновить карточки на главной
  } else {
    alert('Ошибка сохранения');
  }
});

function resetSenderForm() {
  senderForm.reset();
  document.getElementById('senderEditId').value = '';
  senderSubmitBtn.textContent = 'Добавить';
  senderCancelBtn.style.display = 'none';
  senderEditId = null;
}

async function editSender(id) {
  const res = await fetch('/api/senders/' + id);
  const sender = await res.json();
  document.getElementById('senderEditId').value = id;
  document.getElementById('senderName').value = sender.name;
  document.getElementById('senderEmail').value = sender.email;
  document.getElementById('senderHost').value = sender.host;
  document.getElementById('senderPort').value = sender.port;
  document.getElementById('senderSecure').value = sender.secure;
  document.getElementById('senderPassword').value = sender.password;
  senderSubmitBtn.textContent = 'Обновить';
  senderCancelBtn.style.display = 'inline-block';
  senderEditId = id;
}

senderCancelBtn.addEventListener('click', resetSenderForm);

async function deleteSender(id) {
  const res = await fetch('/api/senders/' + id, { method: 'DELETE' });
  if (res.ok) {
    loadSenderList();
    loadSenders(); // обновить главную
  } else {
    alert('Ошибка удаления');
  }
}

// --------------------------------------------
//  ШАБЛОНЫ
// --------------------------------------------

const templateForm = document.getElementById('templateForm');
const templateSubmitBtn = document.getElementById('templateSubmitBtn');
const templateCancelBtn = document.getElementById('templateCancelBtn');
let templateEditId = null;

async function loadTemplateList() {
  const res = await fetch('/api/templates');
  const templates = await res.json();
  const container = document.getElementById('templateList');
  if (!templates.length) {
    container.innerHTML = '<p class="text-muted" style="padding:10px;">Нет шаблонов</p>';
    return;
  }
  container.innerHTML = templates.map(t => `
    <div class="settings-item" data-id="${t.id}">
      <div class="item-info">
        <strong>${t.name}</strong>
        <small>${t.subject}</small>
      </div>
      <div class="item-actions">
        <button class="edit-btn" title="Редактировать">✏️</button>
        <button class="delete-btn" title="Удалить">🗑️</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.closest('.settings-item').dataset.id);
      editTemplate(id);
    });
  });
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.closest('.settings-item').dataset.id);
      if (confirm('Удалить шаблон?')) deleteTemplate(id);
    });
  });
}

templateForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('templateName').value,
    subject: document.getElementById('templateSubject').value,
    body: document.getElementById('templateBody').value,
  };
  const editId = document.getElementById('templateEditId').value;
  let url = '/api/templates';
  let method = 'POST';
  if (editId) {
    url += '/' + editId;
    method = 'PUT';
  }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    resetTemplateForm();
    loadTemplateList();
    loadTemplates(); // обновить выпадающий список на главной
  } else {
    alert('Ошибка сохранения');
  }
});

function resetTemplateForm() {
  templateForm.reset();
  document.getElementById('templateEditId').value = '';
  templateSubmitBtn.textContent = 'Добавить';
  templateCancelBtn.style.display = 'none';
  templateEditId = null;
}

async function editTemplate(id) {
  const res = await fetch('/api/templates/' + id);
  const template = await res.json();
  document.getElementById('templateEditId').value = id;
  document.getElementById('templateName').value = template.name;
  document.getElementById('templateSubject').value = template.subject;
  document.getElementById('templateBody').value = template.body;
  templateSubmitBtn.textContent = 'Обновить';
  templateCancelBtn.style.display = 'inline-block';
  templateEditId = id;
}

templateCancelBtn.addEventListener('click', resetTemplateForm);

async function deleteTemplate(id) {
  const res = await fetch('/api/templates/' + id, { method: 'DELETE' });
  if (res.ok) {
    loadTemplateList();
    loadTemplates(); // обновить выпадающий список
  } else {
    alert('Ошибка удаления');
  }
}

// --------------------------------------------
//  ИНИЦИАЛИЗАЦИЯ
// --------------------------------------------
// Загружаем списки в панель при первом открытии (по умолчанию активна вкладка "Отправители")
// Но панель ещё не открыта, поэтому загрузим при первом открытии.
// Добавим слушатель на открытие панели, чтобы подгрузить данные.
const originalOpen = openPanel;
openPanel = function() {
  originalOpen();
  // Если ещё не загружены списки, загружаем
  if (!document.querySelector('#senderList .settings-item')) {
    loadSenderList();
  }
  // шаблоны загрузим при переключении вкладки
};
// Также при переключении вкладки уже вызывается loadSenderList / loadTemplateList.

// ---- Очистка базы данных ----
document.getElementById('clearDatabaseBtn').addEventListener('click', async function() {
  if (!confirm('⚠️ Вы уверены, что хотите удалить ВСЕХ получателей и историю отправок?\nЭто действие нельзя отменить!')) return;
  if (!confirm('Подтвердите ещё раз: удалить все контакты и логи?')) return;
  try {
    const res = await fetch('/api/clear-database', { method: 'DELETE' });
    if (res.ok) {
      alert('✅ База данных очищена');
      // Обновляем главную страницу
      loadRecipients();
      loadSenders(); // обновить статистику (обнулится)
      // Закрываем панель (опционально)
      closePanel();
    } else {
      alert('❌ Ошибка при очистке');
    }
  } catch (e) {
    alert('❌ Ошибка: ' + e.message);
  }
});

loadSenders();
// ---- Первоначальная загрузка ----
loadRecipients();

// Вызов загрузки шаблонов при инициализации
loadTemplates();

async function saveComment(id, comment) {
  try {
    const res = await fetch(`/api/recipients/${id}/comment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment })
    });
    if (!res.ok) throw new Error('Ошибка сохранения');
    // Обновляем таблицу, чтобы отобразить новый комментарий
    loadRecipients();
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
}