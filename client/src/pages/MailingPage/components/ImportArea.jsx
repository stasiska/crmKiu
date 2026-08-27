import React, { useState, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { importRecipients } from '../../../api';

const ImportArea = () => {
  const { loadRecipients, recipients } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setUploadStatus('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Выберите файл');
      return;
    }

    setIsLoading(true);
    setUploadStatus('Загрузка...');

    try {
      const result = await importRecipients(file);
      setUploadStatus(`Импортировано: ${result.imported} записей`);
      await loadRecipients();
      setFile(null);
      document.getElementById('excelFile').value = '';
    } catch (err) {
      setUploadStatus('Ошибка импорта: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="import-area" style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="upload-box" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', border: '1px dashed #b9c8da', borderRadius: '10px', background: '#fafcff', flex: 1 }}>
        <div className="upload-icon" style={{ fontSize: '24px' }}>↑</div>
        <div className="upload-content" style={{ flex: 1 }}>
          <strong>Импорт контактов</strong>
          <span style={{ display: 'block', fontSize: '12px', color: '#6b7280' }}>Поддерживаются файлы XLS и XLSX</span>
          <div className="upload-controls" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <input
              type="file"
              id="excelFile"
              accept=".xlsx,.xls"
              className="form-control"
              onChange={handleFileChange}
              disabled={isLoading}
              style={{ maxWidth: '300px' }}
            />
            <button
              className="btn btn-kiu"
              onClick={handleUpload}
              disabled={isLoading || !file}
              style={{ padding: '8px 15px', background: '#1557a6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' }}
            >
              {isLoading ? 'Загрузка...' : 'Загрузить в базу'}
            </button>
            <span style={{ fontSize: '12px', color: '#4b5563' }}>{uploadStatus}</span>
          </div>
        </div>
      </div>

      <div className="database-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="count-card" style={{ minWidth: '135px', padding: '12px 16px', background: '#eaf3ff', borderRadius: '9px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '11px', color: '#6b7280' }}>Контактов в базе</span>
          <strong style={{ display: 'block', fontSize: '22px', color: '#1557a6' }}>{recipients.length}</strong>
        </div>
        {/* Позже добавим кнопку очистки истории */}
      </div>
    </div>
  );
};

export default ImportArea;