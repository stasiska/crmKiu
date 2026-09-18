import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // ✅ Используем HttpOnly cookies
});

// ===== ПУБЛИЧНЫЕ МЕТОДЫ =====
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

export const fetchMe = () => api.get('/auth/me').then(r => r.data);



// ===== ОТПРАВИТЕЛИ =====
export const fetchSenders = () => api.get('/senders').then(r => r.data);
export const createSender = (data) => api.post('/senders', data).then(r => r.data);
export const updateSender = (id, data) => api.put(`/senders/${id}`, data).then(r => r.data);
export const deleteSender = (id) => api.delete(`/senders/${id}`).then(r => r.data);

// ===== ПОЛУЧАТЕЛИ =====
export const fetchRecipients = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.specialization) params.append('specialization', filters.specialization);
  if (filters.organization) params.append('organization', filters.organization);
  if (filters.search) params.append('search', filters.search);
  const url = `/recipients?${params.toString()}`;
  return api.get(url).then(r => r.data);
};
export const importRecipients = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/recipients/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};
export const fetchFiltersOptions = () => api.get('/recipients/filters').then(r => r.data);
export const fetchRecipientOrganizations = () => api.get('/recipients/organizations').then(r => r.data);
export const updateRecipientComment = (id, comment) =>
  api.put(`/recipients/${id}/comment`, { comment }).then(r => r.data);

// ===== ШАБЛОНЫ =====
export const fetchTemplates = () => api.get('/templates').then(r => r.data);
export const fetchTemplate = (id) => api.get(`/templates/${id}`).then(r => r.data);
export const createTemplate = (data) => api.post('/templates', data).then(r => r.data);
export const updateTemplate = (id, data) => api.put(`/templates/${id}`, data).then(r => r.data);
export const deleteTemplate = (id) => api.delete(`/templates/${id}`).then(r => r.data);

// ===== ЛОГИ =====
export const clearLogs = () => api.delete('/logs').then(r => r.data);

// ===== ОТПРАВКА =====
export const sendEmails = (payload) => api.post('/send', payload).then(r => r.data);
export const stopSending = () => api.post('/send/stop').then(r => r.data);

// ===== ОЧИСТКА БАЗЫ =====
export const clearDatabase = () => api.delete('/clear-database').then(r => r.data);


// ==== Уведомления =====
export const createReminder = (data) => api.post('/reminders', data).then(r => r.data);
export const fetchReminders = (params) => api.get('/reminders', { params }).then(r => r.data);
export const updateReminder = (id, data) => api.put(`/reminders/${id}`, data).then(r => r.data);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`).then(r => r.data);
export const fetchDueCount = () => api.get('/reminders/due-count').then(r => r.data);

// ===== Организации =====
export const fetchOrganizations = (params) => api.get('/organizations', { params }).then(r => r.data);
export const fetchOrganizationOptions = () => api.get('/organizations/options').then(r => r.data);
export const fetchOrganization = (id) => api.get(`/organizations/${id}`).then(r => r.data);
export const createOrganization = (data) => api.post('/organizations', data).then(r => r.data);
export const updateOrganization = (id, data) => api.put(`/organizations/${id}`, data).then(r => r.data);
export const deleteOrganization = (id) => api.delete(`/organizations/${id}`).then(r => r.data);

// ===== Слушатели =====
export const fetchListeners = (params) => api.get('/listeners', { params }).then(r => r.data);
export const fetchListenerOptions = () => api.get('/listeners/options').then(r => r.data);
export const fetchListener = (id) => api.get(`/listeners/${id}`).then(r => r.data);
export const createListener = (data) => api.post('/listeners', data).then(r => r.data);
export const updateListener = (id, data) => api.put(`/listeners/${id}`, data).then(r => r.data);
export const deleteListener = (id) => api.delete(`/listeners/${id}`).then(r => r.data);

// ===== Группы =====
export const fetchGroups = (params) => api.get('/groups', { params }).then(r => r.data);
export const fetchGroup = (id) => api.get(`/groups/${id}`).then(r => r.data);
export const createGroup = (data) => api.post('/groups', data).then(r => r.data);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data).then(r => r.data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`).then(r => r.data);

// ===== Участники групп =====
export const fetchGroupListeners = (groupId, params) =>
  api.get(`/groups/${groupId}/listeners`, { params }).then(r => r.data);
export const addListenersToGroup = (groupId, listenerIds) =>
  api.post(`/groups/${groupId}/listeners`, { listenerIds }).then(r => r.data);
export const removeListenerFromGroup = (groupId, listenerId) =>
  api.delete(`/groups/${groupId}/listeners/${listenerId}`).then(r => r.data);
export const updateGroupListener = (groupId, listenerId, data) =>
  api.put(`/groups/${groupId}/listeners/${listenerId}`, data).then(r => r.data);
export const clearGroupListeners = (groupId) =>
  api.delete(`/groups/${groupId}/listeners`).then(r => r.data);

// ===== Заметки организаций =====
export const fetchOrganizationNotes = (orgId, params) =>
  api.get(`/organizations/${orgId}/notes`, { params }).then(r => r.data);
export const fetchOrganizationNote = (orgId, noteId) =>
  api.get(`/organizations/${orgId}/notes/${noteId}`).then(r => r.data);
export const createOrganizationNote = (orgId, data) =>
  api.post(`/organizations/${orgId}/notes`, data).then(r => r.data);
export const updateOrganizationNote = (orgId, noteId, data) =>
  api.put(`/organizations/${orgId}/notes/${noteId}`, data).then(r => r.data);
export const deleteOrganizationNote = (orgId, noteId) =>
  api.delete(`/organizations/${orgId}/notes/${noteId}`).then(r => r.data);

// ===== Заметки слушателей =====
export const fetchListenerNotes = (listenerId, params) =>
  api.get(`/listeners/${listenerId}/notes`, { params }).then(r => r.data);
export const fetchListenerNote = (listenerId, noteId) =>
  api.get(`/listeners/${listenerId}/notes/${noteId}`).then(r => r.data);
export const createListenerNote = (listenerId, data) =>
  api.post(`/listeners/${listenerId}/notes`, data).then(r => r.data);
export const updateListenerNote = (listenerId, noteId, data) =>
  api.put(`/listeners/${listenerId}/notes/${noteId}`, data).then(r => r.data);
export const deleteListenerNote = (listenerId, noteId) =>
  api.delete(`/listeners/${listenerId}/notes/${noteId}`).then(r => r.data);

// ===== История групп слушателя =====
export const fetchListenerGroupHistory = (listenerId, params) =>
  api.get(`/listeners/${listenerId}/groups`, { params }).then(r => r.data);

// ===== Документы слушателя =====
export const generateListenerContract = (listenerId, data) =>
  api.post(`/listeners/${listenerId}/documents/contract`, data, { responseType: 'blob' }).then(r => r.data);

// === Таски =====
export const fetchTasks = (status) => {
  const url = status ? `/tasks?status=${status}` : '/tasks';
  return api.get(url).then(r => r.data);
};
export const createTask = (data) => api.post('/tasks', data).then(r => r.data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data).then(r => r.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then(r => r.data);
export const fetchUsers = () => api.get('/users').then(r => r.data);
export const fetchUnreadTotal = () => api.get('/unread-total').then(r => r.data);
export const fetchNotifications = () => api.get('/notifications').then(r => r.data);
export const fetchUnreadCount = () => api.get('/notifications/unread-count').then(r => r.data);
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`).then(r => r.data);
export const createUser = (data) => api.post('/users', data).then(r => r.data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data).then(r => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then(r => r.data);

export const fetchComments = (recipientId) => api.get(`/recipients/${recipientId}/comments`).then(r => r.data);
export const addComment = (recipientId, comment) => api.post(`/recipients/${recipientId}/comments`, { comment }).then(r => r.data);

export default api;