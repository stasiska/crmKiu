const db = require('../db');
const listenerValidator = require('../validators/listenerValidator');

async function getListeners(req, res) {
  try {
    const filters = {
      search: req.query.search,
      organization_id: req.query.organization_id,
      gender: req.query.gender,
      education_level: req.query.education_level,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await db.getListeners(filters);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getListener(req, res) {
  try {
    const id = parseInt(req.params.id);
    const listener = await db.getListenerById(id);
    if (!listener) {
      return res.status(404).json({ error: 'Слушатель не найден' });
    }
    res.json(listener);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createListener(req, res) {
  try {
    // Преобразование пустых строк в null для необязательных полей
    const nullableFields = ['organization_id', 'birth_date', 'middle_name',
      'gender', 'citizenship', 'identity_document', 'document_series', 'document_number',
      'issued_by', 'snils', 'residence_city', 'residence_street', 'residence_house', 'residence_apartment',
      'registration_city', 'registration_street', 'registration_house', 'registration_apartment',
      'phone', 'email', 'education_level', 'education_series', 'education_number'];

    nullableFields.forEach(field => {
      if (req.body[field] === '') req.body[field] = null;
    });

    // Автоматически устанавливаем менеджера и подразделение из авторизованного пользователя
    req.body.manager_id = req.user.id;
    req.body.department = req.user.department || null;

    // Валидация данных
    const { error, value } = listenerValidator.listenerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message).join('; ');
      return res.status(400).json({ error: messages });
    }

    // Проверка существования organization_id
    if (value.organization_id) {
      const organization = await db.getOrganizationById(value.organization_id);
      if (!organization) {
        return res.status(400).json({ error: 'Организация с указанным ID не найдена' });
      }
    }

    // Проверка уникальности email
    if (value.email) {
      const emailExists = await db.checkListenerEmailExists(value.email);
      if (emailExists) {
        return res.status(400).json({ error: 'Слушатель с таким email уже существует' });
      }
    }

    const id = await db.createListener(value);
    const listener = await db.getListenerById(id);
    res.status(201).json(listener);
  } catch (err) {
    // Обработка ошибки уникальности email на уровне БД
    if (err.code === '23505' && err.constraint === 'listeners_email_key') {
      return res.status(400).json({ error: 'Слушатель с таким email уже существует' });
    }
    res.status(500).json({ error: err.message });
  }
}

async function updateListener(req, res) {
  try {
    const id = parseInt(req.params.id);

    // Проверка существования слушателя
    const existing = await db.getListenerById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Слушатель не найден' });
    }

    // Преобразование пустых строк в null для необязательных полей
    const nullableFields = ['organization_id', 'birth_date', 'middle_name',
      'gender', 'citizenship', 'identity_document', 'document_series', 'document_number',
      'issued_by', 'snils', 'residence_city', 'residence_street', 'residence_house', 'residence_apartment',
      'registration_city', 'registration_street', 'registration_house', 'registration_apartment',
      'phone', 'email', 'education_level', 'education_series', 'education_number'];

    nullableFields.forEach(field => {
      if (req.body[field] === '') req.body[field] = null;
    });

    // Запрещаем изменять менеджера и подразделение
    delete req.body.manager_id;
    delete req.body.department;

    // Валидация данных
    const { error, value } = listenerValidator.updateListenerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message).join('; ');
      return res.status(400).json({ error: messages });
    }

    // Проверка существования organization_id
    if (value.organization_id) {
      const organization = await db.getOrganizationById(value.organization_id);
      if (!organization) {
        return res.status(400).json({ error: 'Организация с указанным ID не найдена' });
      }
    }

    // Проверка уникальности email (исключая текущего слушателя)
    if (value.email) {
      const emailExists = await db.checkListenerEmailExists(value.email, id);
      if (emailExists) {
        return res.status(400).json({ error: 'Слушатель с таким email уже существует' });
      }
    }

    const ok = await db.updateListener(id, value);
    if (!ok) {
      return res.status(500).json({ error: 'Не удалось обновить слушателя' });
    }

    const listener = await db.getListenerById(id);
    res.json(listener);
  } catch (err) {
    // Обработка ошибки уникальности email на уровне БД
    if (err.code === '23505' && err.constraint === 'listeners_email_key') {
      return res.status(400).json({ error: 'Слушатель с таким email уже существует' });
    }
    res.status(500).json({ error: err.message });
  }
}

async function deleteListener(req, res) {
  try {
    const id = parseInt(req.params.id);

    // Проверка существования слушателя
    const existing = await db.getListenerById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Слушатель не найден' });
    }

    const ok = await db.deleteListener(id);
    if (!ok) {
      return res.status(500).json({ error: 'Не удалось удалить слушателя' });
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getListenersOptions(req, res) {
  try {
    const options = await db.getListenersOptions();
    res.json(options);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getListeners,
  getListener,
  createListener,
  updateListener,
  deleteListener,
  getListenersOptions,
};
