const db = require('../db');
const organizationValidator = require('../validators/organizationValidator');

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
    // Реквизиты и контактные лица принадлежат организации, а не сотруднику КИУ.
    ['manager_id', 'department', 'okpo', 'okved', 'okfs', 'okopf', 'okato'].forEach((field) => {
      delete req.body[field];
    });

    const { error, value } = organizationValidator.organizationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((detail) => detail.message).join('; ') });
    }

    const id = await db.createOrganization(value);
    const linked = await db.autoLinkRecipientsByInn(req.user.id, id);
    const organization = await db.getOrganizationById(id);
    res.status(201).json({ ...organization, linkedRecipients: linked.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateOrganization(req, res) {
  try {
    const id = parseInt(req.params.id);

    const existing = await db.getOrganizationById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Организация не найдена' });
    }

    ['manager_id', 'department', 'okpo', 'okved', 'okfs', 'okopf', 'okato'].forEach((field) => {
      delete req.body[field];
    });

    const { error, value } = organizationValidator.updateOrganizationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map((detail) => detail.message).join('; ') });
    }

    const ok = await db.updateOrganization(id, value);
    if (!ok) {
      return res.status(500).json({ error: 'Не удалось обновить организацию' });
    }

    const linked = await db.autoLinkRecipientsByInn(req.user.id, id);
    const organization = await db.getOrganizationById(id);
    res.json({ ...organization, linkedRecipients: linked.length });
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
