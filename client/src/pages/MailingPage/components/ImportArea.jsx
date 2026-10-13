import React, { useMemo, useState, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { confirmRecipientImport, previewRecipientImport } from '../../../api';

const MANUAL_TEMPLATE = 'manual';

const ImportArea = () => {
  const { loadRecipients, recipients, templates } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [templateId, setTemplateId] = useState(MANUAL_TEMPLATE);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [decisions, setDecisions] = useState({});

  const templateName = useMemo(() => {
    if (templateId === MANUAL_TEMPLATE) return 'Ручной ввод';
    return templates.find((template) => String(template.id) === String(templateId))?.name || 'Выбранный шаблон';
  }, [templateId, templates]);

  const guessTemplate = (fileName) => {
    const lowerName = fileName.toLowerCase();
    const guessed = templates.find((template) => lowerName.includes(String(template.name).toLowerCase()));
    setTemplateId(guessed ? String(guessed.id) : MANUAL_TEMPLATE);
  };

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(null);
      setDecisions({});
      setUploadStatus('');
      guessTemplate(selected.name);
    }
  };

  const handlePreview = async () => {
    if (!file) return alert('Выберите файл');
    setIsLoading(true);
    setUploadStatus('Проверка совпадений...');
    try {
      const result = await previewRecipientImport(file, templateId);
      setPreview(result);
      const initial = {};
      result.conflicts.forEach((conflict) => { initial[conflict.email] = 'skip'; });
      setDecisions(initial);
      const duplicateInfo = result.duplicateRows ? ` Повторяющиеся строки в файле: ${result.duplicateRows}; оставлена последняя.` : '';
      setUploadStatus(`Найдено конфликтов: ${result.conflicts.length}. Новый вид: ${templateName}.${duplicateInfo}`);
    } catch (err) {
      setUploadStatus('Ошибка проверки: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const setAllDecisions = (decision) => {
    if (!preview) return;
    const next = {};
    preview.conflicts.forEach((conflict) => { next[conflict.email] = decision; });
    setDecisions(next);
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setIsLoading(true);
    setUploadStatus('Импортирование...');
    try {
      const result = await confirmRecipientImport(preview.id, decisions);
      setUploadStatus(`Добавлено: ${result.imported}; обновлено: ${result.updated}; пропущено: ${result.skipped}; привязано по ИНН: ${result.linked}`);
      if (result.linked > 0) alert(`Автоматически привязано по ИНН: ${result.linked} записей. История синхронизирована.`);
      await loadRecipients();
      setFile(null);
      setPreview(null);
      setDecisions({});
      const input = document.getElementById('excelFile');
      if (input) input.value = '';
    } catch (err) {
      setUploadStatus('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="import-area" style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div className="upload-box" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '18px', border: '1px dashed #b9c8da', borderRadius: '10px', background: '#fafcff', flex: 1 }}>
        <div className="upload-icon" style={{ fontSize: '24px' }}>↑</div>
        <div className="upload-content" style={{ flex: 1 }}>
          <strong>Импорт контактов</strong>
          <span style={{ display: 'block', fontSize: '12px', color: '#6b7280' }}>Поддерживаются файлы XLS и XLSX</span>
          <div className="upload-controls" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <input type="file" id="excelFile" accept=".xlsx,.xls" className="form-control" onChange={handleFileChange} disabled={isLoading} style={{ maxWidth: '300px' }} />
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)} disabled={isLoading || Boolean(preview)} className="form-control" style={{ maxWidth: '230px' }}>
              <option value={MANUAL_TEMPLATE}>Ручной ввод</option>
              {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
            </select>
            {!preview ? (
              <button className="btn btn-kiu" onClick={handlePreview} disabled={isLoading || !file} style={{ padding: '8px 15px', background: '#1557a6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' }}>
                {isLoading ? 'Проверка...' : 'Проверить и импортировать'}
              </button>
            ) : (
              <button className="btn btn-kiu" onClick={handleConfirm} disabled={isLoading} style={{ padding: '8px 15px', background: '#16845b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' }}>
                {isLoading ? 'Импортирование...' : 'Подтвердить импорт'}
              </button>
            )}
          </div>
          <span style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginTop: '8px' }}>{uploadStatus}</span>

          {preview && preview.conflicts.length > 0 && (
            <div style={{ marginTop: '14px', padding: '12px', border: '1px solid #f1c40f', background: '#fffaf0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <strong>Совпадающие email: выберите действие</strong>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => setAllDecisions('skip')}>Пропустить все</button>
                  <button type="button" onClick={() => setAllDecisions('replace_template')}>Заменить все</button>
                </div>
              </div>
              {preview.conflicts.map((conflict) => (
                <div key={conflict.email} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) 180px', gap: '8px', alignItems: 'center', padding: '6px 0', borderTop: '1px solid #f3e8b0' }}>
                  <span>{conflict.email}</span>
                  <span>{conflict.currentTemplateName}</span>
                  <span>{templateName}</span>
                  <select value={decisions[conflict.email] || 'skip'} onChange={(event) => setDecisions((current) => ({ ...current, [conflict.email]: event.target.value }))}>
                    <option value="skip">Пропустить</option>
                    <option value="replace_template">Заменить шаблон</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="database-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="count-card" style={{ minWidth: '135px', padding: '12px 16px', background: '#eaf3ff', borderRadius: '9px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '11px', color: '#6b7280' }}>Контактов в базе</span>
          <strong style={{ display: 'block', fontSize: '22px', color: '#1557a6' }}>{recipients.length}</strong>
        </div>
      </div>
    </div>
  );
};

export default ImportArea;
