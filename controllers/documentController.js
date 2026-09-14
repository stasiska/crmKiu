const documentService = require('../services/documentService');
const db = require('../db');

// POST /api/groups/:groupId/documents/generate - Генерация документа
exports.generateDocument = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { templateType, orderNumber, deputyDirectorName } = req.body;

    let buffer;
    let filename;

    switch (templateType) {
      case 'enrollment_order':
        buffer = await documentService.generateEnrollmentOrder(parseInt(groupId, 10), { orderNumber });
        filename = `Приказ_о_зачислении_${orderNumber || Date.now()}.docx`;
        break;

      case 'diploma_order':
        buffer = await documentService.generateDiplomaOrder(parseInt(groupId, 10), {
          orderNumber,
          deputyDirectorName
        });
        filename = `Приказ_о_выдаче_документов_${orderNumber || Date.now()}.docx`;
        break;

      case 'diploma_order_kazan':
        buffer = await documentService.generateDiplomaOrderKazan(parseInt(groupId, 10), {
          orderNumber
        });
        filename = `Приказ_о_выдаче_документов_Казань_${orderNumber || Date.now()}.docx`;
        break;

      default:
        return res.status(400).json({ error: 'Неизвестный тип шаблона' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:groupId/documents/attach - Прикрепить сгенерированный документ к группе
exports.attachDocument = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { templateType, orderNumber, deputyDirectorName } = req.body;

    let buffer;
    let filename;
    let documentType;

    switch (templateType) {
      case 'enrollment_order':
        buffer = await documentService.generateEnrollmentOrder(parseInt(groupId, 10), { orderNumber });
        filename = `Приказ_о_зачислении_${orderNumber || Date.now()}.docx`;
        documentType = 'Приказ о зачислении';
        break;

      case 'diploma_order':
        buffer = await documentService.generateDiplomaOrder(parseInt(groupId, 10), {
          orderNumber,
          deputyDirectorName
        });
        filename = `Приказ_о_выдаче_документов_${orderNumber || Date.now()}.docx`;
        documentType = 'Приказ о выдаче документов';
        break;

      case 'diploma_order_kazan':
        buffer = await documentService.generateDiplomaOrderKazan(parseInt(groupId, 10), {
          orderNumber
        });
        filename = `Приказ_о_выдаче_документов_Казань_${orderNumber || Date.now()}.docx`;
        documentType = 'Приказ о выдаче документов (Казань)';
        break;

      default:
        return res.status(400).json({ error: 'Неизвестный тип шаблона' });
    }

    const documentId = await db.createGroupDocument({
      group_id: parseInt(groupId, 10),
      document_type: documentType,
      filename,
      file_data: buffer,
      created_by: req.user?.id
    });

    const document = await db.getGroupDocumentById(documentId);
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:groupId/documents - Список документов группы
exports.getGroupDocuments = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const documents = await db.getGroupDocuments(parseInt(groupId, 10));
    res.json(documents);
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:groupId/documents/:documentId/download - Скачать документ
exports.downloadDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const document = await db.getGroupDocumentById(parseInt(documentId, 10));

    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.filename)}"`);
    res.send(document.file_data);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:groupId/documents/:documentId - Удалить документ
exports.deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await db.getGroupDocumentById(parseInt(documentId, 10));
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    await db.deleteGroupDocument(parseInt(documentId, 10));
    res.json({ message: 'Документ удалён' });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:groupId/documents/upload - Загрузить произвольный документ
exports.uploadDocument = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const documentId = await db.createGroupDocument({
      group_id: parseInt(groupId, 10),
      document_type: req.body.document_type || 'Загруженный документ',
      filename: req.file.originalname,
      file_data: req.file.buffer,
      created_by: req.user?.id
    });

    const document = await db.getGroupDocumentById(documentId);
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
};
