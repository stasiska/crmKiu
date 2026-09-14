const db = require('../db');

async function getOrganizations(req, res) {
  try {
    const filters = {
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await db.getOrganizations(filters);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrganization(req, res) {
  try {
    const id = parseInt(req.params.id);
    const organization = await db.getOrganizationById(id);
    if (!organization) {
      return res.status(404).json({ error: 'Организация не найдена' });
    }
    res.json(organization);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createOrganization(req, res) {
  try {
    // Преобразование пустых строк в null для необязательных полей
    const nullableFields = [
      'manager_id', 'address', 'email', 'phone', 'contact_person', 'department',
      'ogrn', 'okpo', 'okved', 'okfs', 'okopf', 'okato', 'inn', 'kpp'
    ];
    nullableFields.forEach(field => {
      if (req.body[field] === '') req.body[field] = null;
    });

    // Проверка существования manager_id
    if (req.body.manager_id) {
      const manager = await db.getUserById(req.body.manager_id);
      if (!manager) {
        return res.status(400).json({ error: 'Менеджер с указанным ID не найден' });
      }
    }

    const id = await db.createOrganization(req.body);
    const organization = await db.getOrganizationById(id);
    res.status(201).json(organization);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateOrganization(req, res) {
  try {
    const id = parseInt(req.params.id);

    // Проверка существования организации
    const existing = await db.getOrganizationById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Организация не найдена' });
    }

    // Преобразование пустых строк в null для необязательных полей
    const nullableFields = [
      'manager_id', 'address', 'email', 'phone', 'contact_person', 'department',
      'ogrn', 'okpo', 'okved', 'okfs', 'okopf', 'okato', 'inn', 'kpp'
    ];
    nullableFields.forEach(field => {
      if (req.body[field] === '') req.body[field] = null;
    });

    // Проверка существования manager_id
    if (req.body.manager_id) {
      const manager = await db.getUserById(req.body.manager_id);
      if (!manager) {
        return res.status(400).json({ error: 'Менеджер с указанным ID не найден' });
      }
    }

    const ok = await db.updateOrganization(id, req.body);
    if (!ok) {
      return res.status(500).json({ error: 'Не удалось обновить организацию' });
    }

    const organization = await db.getOrganizationById(id);
    res.json(organization);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteOrganization(req, res) {
  try {
    const id = parseInt(req.params.id);

    // Проверка существования организации
    const existing = await db.getOrganizationById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Организация не найдена' });
    }

    // Проверка наличия привязанных слушателей
    const hasListeners = await db.checkOrganizationHasListeners(id);
    if (hasListeners) {
      return res.status(409).json({
        error: 'Невозможно удалить организацию, к ней привязаны слушатели'
      });
    }

    const ok = await db.deleteOrganization(id);
    if (!ok) {
      return res.status(500).json({ error: 'Не удалось удалить организацию' });
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrganizationsOptions(req, res) {
  try {
    const options = await db.getOrganizationsOptions();
    res.json(options);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationsOptions,
};
