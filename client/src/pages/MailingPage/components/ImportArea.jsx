import React, { useState, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { importRecipients } from '../../../api';

const ImportArea = () => {
  const { loadRecipients, recipients } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0] || null);
    setUploadStatus('');
  };

  const handleImport = async () => {
    if (!file) return alert('Выберите файл');

    setIsLoading(true);
    setUploadStatus('Импортирование...');
    try {
      const result = await importRecipients(file);
      setUploadStatus(`Добавлено: ${result.imported}; обновлено: ${result.updated}; пропущено: ${result.skipped}; привязано по ИНН: ${result.linked}`);
      if (result.linked > 0) alert(`Автоматически привязано по ИНН: ${result.linked} записей. История синхронизирована.`);
      await loadRecipients();
      setFile(null);
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
            <button className="btn btn-kiu" onClick={handleImport} disabled={isLoading || !file} style={{ padding: '8px 15px', background: '#1557a6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' }}>
              {isLoading ? 'Импортирование...' : 'Импортировать'}
            </button>
          </div>
          <span style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginTop: '8px' }}>{uploadStatus}</span>
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
