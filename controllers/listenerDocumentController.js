const documentService = require('../services/documentService');
const db = require('../db');
const path = require('path');
const fs = require('fs').promises;

// POST /api/listeners/:id/documents/contract - генерация и скачивание
exports.generateContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { group_id, contract_date, customer_full_name } = req.body;

    if (!group_id) {
      return res.status(400).json({ error: 'Требуется group_id' });
    }

    const buffer = await documentService.generateListenerContract(
      parseInt(id, 10),
      parseInt(group_id, 10),
      {
        contractDate: contract_date,
        customerFullName: customer_full_name
      }
    );

    // Возвращаем файл для скачивания (БЕЗ сохранения в БД)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="contract_${id}_${Date.now()}.docx"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// POST /api/listeners/:id/documents/upload - загрузка готового документа
exports.uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { group_id, contract_date, customer_full_name, document_type = 'contract' } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const originalExt = path.extname(req.file.originalname);
    const fileName = `${document_type}_${id}_${group_id || 'no_group'}_${timestamp}${originalExt}`;
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'listener_documents');

    // Создаем директорию если не существует
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    const relativeFilePath = path.join('uploads', 'listener_documents', fileName);

    // Сохраняем файл на диск
    await fs.writeFile(filePath, req.file.buffer);

    // Сохраняем запись в базу данных
    const documentId = await db.createListenerDocument({
      listener_id: parseInt(id, 10),
      group_id: group_id ? parseInt(group_id, 10) : null,
      document_type: document_type,
      file_name: req.file.originalname,
      file_path: relativeFilePath,
      file_size: req.file.size,
      contract_date: contract_date || null,
      customer_full_name: customer_full_name || null,
      created_by: req.user?.id || null
    });

    res.json({
      success: true,
      documentId,
      message: 'Документ успешно загружен'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/listeners/:id/documents
exports.getDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { document_type } = req.query;

    const result = await db.getListenerDocuments(parseInt(id, 10), {
      document_type,
      limit: 100
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/listeners/:id/documents/:docId/download
exports.downloadDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const document = await db.getListenerDocumentById(parseInt(docId, 10));
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    const filePath = path.join(__dirname, '..', document.file_path);

    // Проверяем существование файла
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: 'Файл не найден на диске' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/listeners/:id/documents/:docId
exports.deleteDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const document = await db.getListenerDocumentById(parseInt(docId, 10));
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    // Удаляем файл с диска
    const filePath = path.join(__dirname, '..', document.file_path);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Ошибка удаления файла:', err);
      // Продолжаем даже если файл не удалось удалить
    }

    // Удаляем запись из БД
    await db.deleteListenerDocument(parseInt(docId, 10));

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
