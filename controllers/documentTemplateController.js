const db = require('../db');
const multer = require('multer');

// Настройка multer для загрузки в память
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 МБ
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только файлы .docx'));
    }
  }
});

// GET /api/document-templates - Список шаблонов
exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await db.getDocumentTemplates();
    res.json(templates);
  } catch (err) {
    next(err);
  }
};

// GET /api/document-templates/:id - Получить шаблон по ID (без бинарных данных)
exports.getTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const template = await db.getDocumentTemplateById(parseInt(id, 10));

    if (!template) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }

    // Возвращаем без file_data
    const { file_data, ...templateData } = template;
    res.json(templateData);
  } catch (err) {
    next(err);
  }
};

// POST /api/document-templates - Загрузить новый шаблон (только admin)
exports.createTemplate = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      const { code, name, description } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
      }

      if (!code || !name) {
        return res.status(400).json({ error: 'Необходимы code и name' });
      }

      // Проверка уникальности кода
      const existing = await db.getDocumentTemplate(code);
      if (existing) {
        return res.status(400).json({ error: 'Шаблон с таким кодом уже существует' });
      }

      const id = await db.createDocumentTemplate({
        code,
        name,
        description,
        file_data: req.file.buffer,
        file_name: req.file.originalname
      }, req.user.id);

      const template = await db.getDocumentTemplateById(id);
      const { file_data, ...templateData } = template;

      res.status(201).json(templateData);
    } catch (err) {
      next(err);
    }
  }
];

// PUT /api/document-templates/:id - Обновить шаблон (только admin)
exports.updateTemplate = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const template = await db.getDocumentTemplateById(parseInt(id, 10));
      if (!template) {
        return res.status(404).json({ error: 'Шаблон не найден' });
      }

      const updates = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (is_active !== undefined) updates.is_active = is_active === 'true' || is_active === true;

      // Если загружен новый файл
      if (req.file) {
        updates.file_data = req.file.buffer;
        updates.file_name = req.file.originalname;
      }

      const success = await db.updateDocumentTemplate(parseInt(id, 10), updates);
      if (!success) {
        return res.status(400).json({ error: 'Нет полей для обновления' });
      }

      const updatedTemplate = await db.getDocumentTemplateById(parseInt(id, 10));
      const { file_data, ...templateData } = updatedTemplate;

      res.json(templateData);
    } catch (err) {
      next(err);
    }
  }
];

// DELETE /api/document-templates/:id - Удалить шаблон (только admin)
exports.deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await db.getDocumentTemplateById(parseInt(id, 10));
    if (!template) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }

    await db.deleteDocumentTemplate(parseInt(id, 10));
    res.json({ message: 'Шаблон удалён' });
  } catch (err) {
    next(err);
  }
};

// Экспорт middleware для использования в routes
exports.uploadMiddleware = upload;
