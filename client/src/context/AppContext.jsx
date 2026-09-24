import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchSenders,
  fetchRecipients,
  fetchFiltersOptions,
  fetchRecipientOrganizations,  // переименовано
  fetchOrganizations,           // для новой таблицы
  fetchListeners,               // для слушателей
  fetchTemplates,
  fetchTemplate,
  sendEmails,
  stopSending,
  clearLogs,
  updateRecipientComment,
  fetchUsers,
  fetchGroups,
} from '../api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ... внутри AppProvider
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState(null);
  const [groupsPagination, setGroupsPagination] = useState({ page: 1, limit: 20, total: 0 });

  // ===== Состояния для рассылки =====
  const [senders, setSenders] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [filters, setFilters] = useState({ city: '', specialization: '', organization: '', search: '' });
  const [filtersOptions, setFiltersOptions] = useState({ cities: [], specializations: [] });
  const [recipientOrganizations, setRecipientOrganizations] = useState([]); // переименовано
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]);
  const [sendStatus, setSendStatus] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  const [sendError, setSendError] = useState(null);

  // ===== Новые состояния для организаций (таблица) =====
  const [orgs, setOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState(null);
  const [orgsPagination, setOrgsPagination] = useState({ page: 1, limit: 20, total: 0 });

  // ===== Новые состояния для слушателей =====
  const [listeners, setListeners] = useState([]);
  const [listenersLoading, setListenersLoading] = useState(false);
  const [listenersError, setListenersError] = useState(null);
  const [listenersPagination, setListenersPagination] = useState({ page: 1, limit: 20, total: 0 });

  // ===== Состояния для пользователей (нужны в модальных окнах) =====
  const [users, setUsers] = useState([]);

  const eventSourceRef = useRef(null);

  // ===== Загрузка отправителей =====
  const loadSenders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSenders();
      if (Array.isArray(data)) {
        setSenders(data);
        if (data.length && !selectedSenderId) setSelectedSenderId(data[0].id);
      } else {
        setSenders([]);
      }
    } catch (e) {
      setError('Ошибка загрузки отправителей: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSenderId]);

  // ===== Загрузка получателей с фильтрами =====
  const loadRecipients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecipients(filters);
      setRecipients(data);
    } catch (e) {
      setError('Ошибка загрузки получателей: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ===== Загрузка фильтров (города, специализации) =====
  const loadFiltersOptions = useCallback(async () => {
    try {
      const data = await fetchFiltersOptions();
      setFiltersOptions(data);
    } catch (e) {
      console.error('Ошибка загрузки фильтров:', e);
    }
  }, []);

  // ===== Загрузка организаций для получателей (старый метод) =====
  const loadRecipientOrganizations = useCallback(async () => {
    try {
      const data = await fetchRecipientOrganizations();
      setRecipientOrganizations(data);
    } catch (e) {
      console.error('Ошибка загрузки организаций для получателей:', e);
    }
  }, []);

  // ===== Загрузка шаблонов =====
  const loadTemplates = useCallback(async () => {
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (e) {
      console.error('Ошибка загрузки шаблонов:', e);
    }
  }, []);

  // ===== Применение шаблона =====
  const applyTemplate = useCallback(async (templateId) => {
    if (!templateId) {
      setSubject('');
      setBody('');
      return;
    }
    try {
      const template = await fetchTemplate(templateId);
      setSubject(template.subject || '');
      setBody(template.body || '');
    } catch (e) {
      console.error('Ошибка загрузки шаблона:', e);
    }
  }, []);

  // ===== SSE для прогресса =====
  const connectProgressSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const eventSource = new EventSource('/api/send/progress');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setProgressLogs(prev => [...prev, { type: 'info', message: 'Соединение установлено' }]);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'done') {
          const msg = `Отправка завершена. Успешно: ${data.sentCount}, ошибок: ${data.errorCount}`;
          setProgressLogs(prev => [...prev, { type: 'done', message: msg }]);
          setSendStatus(msg);
          setIsSending(false);
          eventSource.close();
          eventSourceRef.current = null;
          loadRecipients();
          loadSenders();
        } else if (data.status === 'sent') {
          setProgressLogs(prev => [...prev, { type: 'sent', message: `${data.email} (${data.index}/${data.total}) от: ${data.senderEmail || '—'}` }]);
          setSendStatus(`Отправка: ${data.index}/${data.total}`);
        } else if (data.status === 'error') {
          setProgressLogs(prev => [...prev, { type: 'error', message: `${data.email} — ${data.error || 'Ошибка'}` }]);
          setSendStatus(`Ошибка на ${data.email}`);
        } else if (data.waitMs) {
          const seconds = Math.round(data.waitMs / 1000);
          setProgressLogs(prev => [...prev, { type: 'pause', message: `Пауза ${seconds} сек (осталось ${data.remaining} писем)` }]);
          setSendStatus(`Пауза ${seconds} сек...`);
        }
      } catch (e) {
        console.error('Ошибка SSE:', e);
      }
    };

    eventSource.onerror = () => {
      if (isSending) {
        setProgressLogs(prev => [...prev, { type: 'error', message: 'Потеря соединения с сервером' }]);
        setSendStatus('Ошибка соединения');
        setIsSending(false);
        eventSource.close();
        eventSourceRef.current = null;
      }
    };
  }, [isSending, loadRecipients, loadSenders]);

  // ===== Отправка писем =====
  const handleSend = useCallback(async () => {
    if (!selectedSenderId) { alert('Выберите отправителя'); return; }
    if (!selectedRecipientIds.length) { alert('Выберите получателей'); return; }
    if (!subject.trim() || !body.trim()) { alert('Заполните тему и тело письма'); return; }

    setIsSending(true);
    setProgressLogs([]);
    setSendStatus('Отправка...');
    setSendError(null);
    connectProgressSSE();

    try {
      await sendEmails({
        senderId: selectedSenderId,
        recipientIds: selectedRecipientIds,
        subject: subject.trim(),
        body: body.trim(),
        ignoreDuplicate,
        attachments,
      });
    } catch (e) {
      const errorMessage = e.response?.data?.error || e.message || 'Ошибка отправки';
      setSendError(errorMessage);
      setIsSending(false);
      setSendStatus('Ошибка');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setTimeout(() => setSendError(null), 5000);
    }
  }, [selectedSenderId, selectedRecipientIds, ignoreDuplicate, subject, body, attachments, connectProgressSSE]);

  const handleStop = useCallback(async () => {
    try {
      await stopSending();
      setIsSending(false);
      setSendStatus('Остановлено');
      setProgressLogs(prev => [...prev, { type: 'info', message: 'Остановлено пользователем' }]);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    } catch (e) {
      console.error('Ошибка остановки:', e);
    }
  }, []);

  const handleClearLogs = useCallback(async () => {
    if (!confirm('Очистить историю?')) return;
    try {
      await clearLogs();
      alert('История очищена');
      loadRecipients();
    } catch (e) {
      alert('Ошибка: ' + e.message);
    }
  }, [loadRecipients]);

  const updateComment = useCallback(async (id, comment) => {
    try {
      await updateRecipientComment(id, comment);
      loadRecipients();
    } catch (e) {
      alert('Ошибка сохранения комментария: ' + e.message);
    }
  }, [loadRecipients]);

  // ===== Новые методы: загрузка организаций (таблица) =====
  const loadOrgs = useCallback(async (filters = {}) => {
    setOrgsLoading(true);
    try {
      const params = { page: filters.page || 1, limit: filters.limit || 20 };
      if (filters.search) params.search = filters.search;
      const res = await fetchOrganizations(params);
      setOrgs(res.data);
      setOrgsPagination({ page: res.page, limit: res.limit, total: res.total });
      setOrgsError(null);
    } catch (err) {
      setOrgsError(err.message);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  // ===== Новые методы: загрузка слушателей =====
  const loadListeners = useCallback(async (filters = {}) => {
    setListenersLoading(true);
    try {
      const params = { page: filters.page || 1, limit: filters.limit || 20 };
      if (filters.search) params.search = filters.search;
      if (filters.organization_id) params.organization_id = filters.organization_id;
      if (filters.gender) params.gender = filters.gender;
      if (filters.education_level) params.education_level = filters.education_level;
      const res = await fetchListeners(params);
      setListeners(res.data);
      setListenersPagination({ page: res.page, limit: res.limit, total: res.total });
      setListenersError(null);
    } catch (err) {
      setListenersError(err.message);
    } finally {
      setListenersLoading(false);
    }
  }, []);

  // ===== Загрузка групп =====
  const loadGroups = useCallback(async (filters = {}) => {
    setGroupsLoading(true);
    try {
      const params = { page: filters.page || 1, limit: filters.limit || 20 };
      if (filters.search) params.search = filters.search;
      if (filters.manager_id) params.manager_id = filters.manager_id;
      if (filters.status) params.status = filters.status;
      if (filters.hours_min) params.hours_min = filters.hours_min;
      if (filters.hours_max) params.hours_max = filters.hours_max;
      const res = await fetchGroups(params);
      setGroups(res.data || []);
      setGroupsPagination({ page: res.page, limit: res.limit, total: res.total });
      setGroupsError(null);
    } catch (err) {
      setGroupsError(err.message);
    } finally {
      setGroupsLoading(false);
    }
  }, []);
  // ===== Загрузка пользователей =====
  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
    }
  }, []);

  // ===== Первоначальная загрузка =====
  useEffect(() => {
    loadSenders();
    loadFiltersOptions();
    loadRecipientOrganizations();  // переименовано
    loadTemplates();
    loadUsers();  // добавлено
    loadOrgs({ limit: 1000 }); // загружаем все организации для селектов
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    loadRecipients();
  }, [filters]);

  // ===== Значения для провайдера =====
  const value = {
    groups,
    groupsLoading,
    groupsError,
    groupsPagination,
    loadGroups,
    // Рассылка
    senders,
    selectedSenderId,
    setSelectedSenderId,
    recipients,
    filters,
    setFilters,
    filtersOptions,
    recipientOrganizations,        // переименовано
    selectedRecipientIds,
    setSelectedRecipientIds,
    isSending,
    progressLogs,
    sendStatus,
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    subject,
    setSubject,
    body,
    setBody,
    attachments,
    setAttachments,
    loading,
    error,
    sendError,
    setSendError,
    ignoreDuplicate,
    setIgnoreDuplicate,
    loadSenders,
    loadRecipients,
    loadTemplates,
    applyTemplate,
    handleSend,
    handleStop,
    handleClearLogs,
    updateComment,

    // Новые: организации (таблица)
    orgs,
    orgsLoading,
    orgsError,
    orgsPagination,
    loadOrgs,

    // Новые: слушатели
    listeners,
    listenersLoading,
    listenersError,
    listenersPagination,
    loadListeners,

    // Пользователи (для модальных окон)
    users,
    loadUsers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};