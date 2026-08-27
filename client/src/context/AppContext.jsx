import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchSenders,
  fetchRecipients,
  fetchFiltersOptions,
  fetchOrganizations,
  fetchTemplates,
  fetchTemplate,
  sendEmails,
  stopSending,
  clearLogs,
  updateRecipientComment,
} from '../api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // состояния
  const [senders, setSenders] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [filters, setFilters] = useState({ city: '', specialization: '', organization: '', search: '' });
  const [filtersOptions, setFiltersOptions] = useState({ cities: [], specializations: [] });
  const [organizations, setOrganizations] = useState([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]);
  const [sendStatus, setSendStatus] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  const [sendError, setSendError] = useState(null);

  const eventSourceRef = useRef(null);

  // загрузка отправителей
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

  // загрузка получателей с фильтрами
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

  // загрузка фильтров (города, специализации)
  const loadFiltersOptions = useCallback(async () => {
    try {
      const data = await fetchFiltersOptions();
      setFiltersOptions(data);
    } catch (e) {
      console.error('Ошибка загрузки фильтров:', e);
    }
  }, []);

  // загрузка организаций
  const loadOrganizations = useCallback(async () => {
    try {
      const data = await fetchOrganizations();
      setOrganizations(data);
    } catch (e) {
      console.error('Ошибка загрузки организаций:', e);
    }
  }, []);

  // загрузка шаблонов
  const loadTemplates = useCallback(async () => {
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (e) {
      console.error('Ошибка загрузки шаблонов:', e);
    }
  }, []);

  // применение шаблона
  const applyTemplate = useCallback(async (templateId) => {
    console.log('applyTemplate вызван с id:', templateId);
    if (!templateId) {
      setSubject('');
      setBody('');
      return;
    }
    try {
      const template = await fetchTemplate(templateId);
      console.log('Шаблон получен:', template);
      setSubject(template.subject || '');
      setBody(template.body || '');
    } catch (e) {
      console.error('Ошибка загрузки шаблона:', e);
    }
  }, []);

  // SSE для прогресса
  const connectProgressSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const token = localStorage.getItem('token');
    const eventSource = new EventSource(`/api/send/progress?token=${token}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setProgressLogs(prev => [...prev, { type: 'info', message: 'Соединение установлено' }]);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE:', data);
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

  // отправка
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
  }, [selectedSenderId, selectedRecipientIds, ignoreDuplicate, subject, body, connectProgressSSE]);

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

  // первоначальная загрузка
  useEffect(() => {
    loadSenders();
    loadFiltersOptions();
    loadOrganizations();
    loadTemplates();
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

  const value = {
    senders,
    selectedSenderId,
    setSelectedSenderId,
    recipients,
    filters,
    setFilters,
    filtersOptions,
    organizations,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};