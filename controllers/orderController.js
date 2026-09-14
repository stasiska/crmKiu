const db = require('../db');
const documentService = require('../services/documentService');

// Вспомогательная функция для проверки обязательных полей группы
function validateGroupForOrder(group) {
  const missingFields = [];
  if (!group.course_name) missingFields.push('Наименование курса');
  if (!group.branch) missingFields.push('Подразделение (филиал)');
  if (!group.hours) missingFields.push('Часы');
  if (!group.start_date) missingFields.push('Дата начала');
  if (!group.end_date) missingFields.push('Дата окончания');
  if (!group.manager_id) missingFields.push('Менеджер');

  return missingFields;
}

// POST /api/groups/:groupId/orders/generate - Генерация приказа (предпросмотр, не сохраняется)
exports.generateOrder = async (req, res, next) => {
  try {
    console.log('[ORDER] Generate request received:', { groupId: req.params.groupId, body: req.body });
    const { groupId } = req.params;
    const { templateCode, orderNumber } = req.body;

    if (!templateCode || !orderNumber) {
      console.log('[ORDER] Missing templateCode or orderNumber');
      return res.status(400).json({ error: 'Необходимы templateCode и orderNumber' });
    }

    // Проверка существования группы
    console.log('[ORDER] Fetching group:', groupId);
    const group = await db.getGroupById(parseInt(groupId, 10));
    if (!group) {
      console.log('[ORDER] Group not found:', groupId);
      return res.status(404).json({ error: 'Группа не найдена' });
    }
    console.log('[ORDER] Group found:', JSON.stringify(group, null, 2));

    // Проверка заполненности обязательных полей
    console.log('[ORDER] Validating group fields...');
    const missingFields = validateGroupForOrder(group);
    if (missingFields.length > 0) {
      console.log('[ORDER] Missing fields:', missingFields);
      return res.status(400).json({
        error: `Для генерации приказа необходимо заполнить следующие поля группы: ${missingFields.join(', ')}`
      });
    }
    console.log('[ORDER] Group validation passed');

    let buffer;

    // Генерация документа в зависимости от типа
    console.log('[ORDER] Generating document, templateCode:', templateCode);
    if (templateCode === 'enrollment_order') {
      buffer = await documentService.generateEnrollmentOrder(parseInt(groupId, 10), { orderNumber });
      console.log('[ORDER] Document generated, buffer length:', buffer.length);
    } else {
      console.log('[ORDER] Unsupported template code:', templateCode);
      return res.status(400).json({ error: 'Неподдерживаемый тип приказа' });
    }

    // Возврат документа для скачивания
    // Создаем ASCII-безопасное имя файла для заголовка
    const timestamp = Date.now();
    const asciiFileName = `order_${templateCode}_${timestamp}.docx`;
    const originalFileName = `order_${templateCode}_${orderNumber.replace(/[\/\\:*?"<>|]/g, '-')}.docx`;
    const encodedFileName = encodeURIComponent(originalFileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`);
    console.log('[ORDER] Sending document, filename:', originalFileName);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:groupId/orders - Прикрепить сгенерированный приказ к группе
exports.attachOrder = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { templateCode, orderNumber } = req.body;

    if (!templateCode || !orderNumber) {
      return res.status(400).json({ error: 'Необходимы templateCode и orderNumber' });
    }

    // Проверка существования группы
    const group = await db.getGroupById(parseInt(groupId, 10));
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    // Проверка заполненности обязательных полей
    const missingFields = validateGroupForOrder(group);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Для генерации приказа необходимо заполнить следующие поля группы: ${missingFields.join(', ')}`
      });
    }

    let buffer;
    let fileName;

    // Генерация документа
    if (templateCode === 'enrollment_order') {
      buffer = await documentService.generateEnrollmentOrder(parseInt(groupId, 10), { orderNumber });
      fileName = `order_enrollment_${orderNumber.replace(/\//g, '-')}.docx`;
    } else {
      return res.status(400).json({ error: 'Неподдерживаемый тип приказа' });
    }

    // Сохранение в БД
    const docId = await db.createGroupDocument({
      group_id: parseInt(groupId, 10),
      template_code: templateCode,
      order_number: orderNumber,
      file_data: buffer,
      file_name: fileName,
      is_uploaded: false
    }, req.user.id);

    res.status(201).json({
      id: docId,
      file_name: fileName,
      message: 'Приказ сохранён'
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:groupId/orders/upload - Загрузить свой вариант приказа
exports.uploadOrder = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { templateCode, orderNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    if (!templateCode || !orderNumber) {
      return res.status(400).json({ error: 'Необходимы templateCode и orderNumber' });
    }

    // Проверка MIME-типа
    if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return res.status(400).json({ error: 'Разрешены только файлы .docx' });
    }

    // Проверка существования группы
    const group = await db.getGroupById(parseInt(groupId, 10));
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    // Сохранение в БД
    const docId = await db.createGroupDocument({
      group_id: parseInt(groupId, 10),
      template_code: templateCode,
      order_number: orderNumber,
      file_data: req.file.buffer,
      file_name: req.file.originalname,
      is_uploaded: true
    }, req.user.id);

    res.status(201).json({
      id: docId,
      file_name: req.file.originalname,
      message: 'Документ загружен'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:groupId/orders - Список приказов группы
exports.getGroupOrders = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // Проверка существования группы
    const group = await db.getGroupById(parseInt(groupId, 10));
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    const documents = await db.getGroupDocuments(parseInt(groupId, 10));

    // Возвращаем без бинарных данных
    const result = documents.map(doc => ({
      id: doc.id,
      template_code: doc.template_code,
      order_number: doc.order_number,
      file_name: doc.file_name,
      is_uploaded: doc.is_uploaded,
      creator_name: doc.creator_name,
      created_at: doc.created_at
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:groupId/orders/:orderId/download - Скачать приказ
exports.downloadOrder = async (req, res, next) => {
  try {
    const { groupId, orderId } = req.params;

    const doc = await db.getGroupDocumentById(parseInt(orderId, 10), parseInt(groupId, 10));

    if (!doc) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);
    res.send(doc.file_data);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:groupId/orders/:orderId - Удалить приказ
exports.deleteOrder = async (req, res, next) => {
  try {
    const { groupId, orderId } = req.params;

    const doc = await db.getGroupDocumentById(parseInt(orderId, 10), parseInt(groupId, 10));

    if (!doc) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    await db.deleteGroupDocument(parseInt(orderId, 10), parseInt(groupId, 10));

    res.json({ message: 'Документ удалён' });
  } catch (err) {
    next(err);
  }
};
