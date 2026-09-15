const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const petrovich = require('petrovich');
const db = require('../db');

/**
 * Генерация приказа о зачислении
 */
async function generateEnrollmentOrder(groupId, options) {
  const group = await db.getGroupById(groupId);
  if (!group) throw new Error('Группа не найдена');

  const listeners = await db.getGroupListeners(groupId, { limit: 10000 });
  const branch = await db.getBranchByName(group.branch);
  const template = await db.getDocumentTemplate('enrollment_order');
  if (!template) throw new Error('Шаблон "enrollment_order" не найден');

  const data = buildEnrollmentOrderData(group, listeners.data, branch, options);
  return renderTemplate(template.file_data, data);
}

/**
 * Генерация приказа о выдаче документов
 */
async function generateDiplomaOrder(groupId, options) {
  const group = await db.getGroupById(groupId);
  if (!group) throw new Error('Группа не найдена');

  const listeners = await db.getGroupListeners(groupId, { limit: 10000 });
  const branch = await db.getBranchByName(group.branch);
  const template = await db.getDocumentTemplate('diploma_order');
  if (!template) throw new Error('Шаблон "diploma_order" не найден');

  const data = buildDiplomaOrderData(group, listeners.data, branch, options);
  return renderTemplate(template.file_data, data);
}

/**
 * Генерация приказа о выдаче документов для Казани
 */
async function generateDiplomaOrderKazan(groupId, options) {
  const group = await db.getGroupById(groupId);
  if (!group) throw new Error('Группа не найдена');

  const listeners = await db.getGroupListeners(groupId, { limit: 10000 });
  const branch = await db.getBranchByName(group.branch);
  const template = await db.getDocumentTemplate('diploma_order_kazan');
  if (!template) throw new Error('Шаблон "diploma_order_kazan" не найден');

  const data = buildDiplomaOrderKazanData(group, listeners.data, branch, options);
  return renderTemplate(template.file_data, data);
}

/**
 * Генерация приказа об отчислении
 */
async function generateExpulsionOrder(groupId, options) {
  const group = await db.getGroupById(groupId);
  if (!group) throw new Error('Группа не найдена');

  const listeners = await db.getGroupListeners(groupId, { limit: 10000 });
  const branch = await db.getBranchByName(group.branch);
  const template = await db.getDocumentTemplate('expulsion_order');
  if (!template) throw new Error('Шаблон "expulsion_order" не найден');

  const data = buildExpulsionOrderData(group, listeners.data, branch, options);
  return renderTemplate(template.file_data, data);
}

/**
 * Генерация приказа о выдаче документов с разделением по образованию
 */
async function generateDiplomaOrderSplit(groupId, options) {
  const group = await db.getGroupById(groupId);
  if (!group) throw new Error('Группа не найдена');

  const listeners = await db.getGroupListeners(groupId, { limit: 10000 });
  const branch = await db.getBranchByName(group.branch);
  const template = await db.getDocumentTemplate('diploma_order_split');
  if (!template) throw new Error('Шаблон "diploma_order_split" не найден');

  const data = buildDiplomaOrderSplitData(group, listeners.data, branch, options);
  return renderTemplate(template.file_data, data);
}

function buildEnrollmentOrderData(group, listeners, branch, options) {
  return {
    order_date_formatted: formatDate(group.start_date),
    city: branch?.city || '',
    order_number: options.orderNumber || '',
    branch: group.branch || '',
    course_name: group.course_name || '',
    hours: group.hours || '',
    start_date_ru: formatDateRu(group.start_date),
    end_date_ru: formatDateRu(group.end_date),
    listeners_numbered_list: buildNumberedList(listeners),
    director_name: branch?.director_name || '',
    manager_name: group.manager_name || '',
  };
}

function buildDiplomaOrderData(group, listeners, branch, options) {
  // order_date_formatted = дата окончания курса (end_date)
  // end_date_ru = дата окончания курса (end_date)
  const orderDate = group.end_date;

  return {
    order_date_formatted: formatDate(orderDate),
    city: branch?.city || '',
    order_number: options.orderNumber || '',
    protocol_date_formatted: formatDateWithQuotes(options.protocolDate || orderDate),
    course_name: group.course_name || '',
    hours: group.hours || '',
    start_date_ru: formatDateRu(group.start_date),
    end_date_ru: formatDateRu(orderDate),
    listeners_numbered_list: buildDativeNumberedList(listeners),
    director_name: branch?.director_name || '',
    deputy_director_name: group.manager_name || '',
  };
}

function buildDiplomaOrderKazanData(group, listeners, branch, options) {
  // order_date_formatted = дата окончания курса (end_date)
  // end_date_ru = дата окончания курса (end_date)
  // manager_name = ответственный за направление (менеджер группы)
  const orderDate = group.end_date;

  return {
    order_date_formatted: formatDate(orderDate),
    city: branch?.city || '',
    order_number: options.orderNumber || '',
    protocol_date_formatted: formatDateWithQuotes(options.protocolDate || orderDate),
    course_name: group.course_name || '',
    hours: group.hours || '',
    start_date_ru: formatDateRu(group.start_date),
    end_date_ru: formatDateRu(orderDate),
    listeners_numbered_list: buildDativeNumberedList(listeners),
    director_name: branch?.director_name || '',
    manager_name: group.manager_name || '',
  };
}

function buildExpulsionOrderData(group, listeners, branch, options) {
  // order_date_formatted = дата окончания курса (end_date)
  // end_date_ru = дата окончания курса (end_date)
  const orderDate = group.end_date;

  return {
    order_date_formatted: formatDate(orderDate),
    city: branch?.city || '',
    order_number: options.orderNumber || '',
    branch: group.branch || '',
    course_name: group.course_name || '',
    hours: group.hours || '',
    start_date_ru: formatDateRu(group.start_date),
    end_date_ru: formatDateRu(orderDate),
    listeners_numbered_list: buildNumberedList(listeners),
    director_name: branch?.director_name || '',
    deputy_director_name: group.manager_name || '',
  };
}

function buildDiplomaOrderSplitData(group, listeners, branch, options) {
  // Разделяем слушателей по наличию высшего образования
  // education_level = 'higher' - высшее образование (дипломы)
  // education_level = 'secondary' или другое - среднее образование (справки)
  const withHigherEd = listeners.filter(l => l.education_level === 'higher');
  const withoutHigherEd = listeners.filter(l => l.education_level !== 'higher');

  const orderDate = group.end_date;

  return {
    order_date_formatted: formatDate(orderDate),
    city: branch?.city || '',
    order_number: options.orderNumber || '',
    protocol_date_formatted: formatDateWithQuotes(options.protocolDate || orderDate),
    course_name: group.course_name || '',
    hours: group.hours || '',
    start_date_ru: formatDateRu(group.start_date),
    end_date_ru: formatDateRu(orderDate),
    listeners_with_higher_ed: buildDativeNumberedList(withHigherEd),
    listeners_without_higher_ed: buildDativeNumberedList(withoutHigherEd),
    director_name: branch?.director_name || '',
    deputy_director_name: group.manager_name || '',
  };
}

function buildNumberedList(listeners) {
  return listeners
    .map((l, i) => `${i + 1}. ${getAccusativeName(l)}`)
    .join('\n');
}

function buildDativeNumberedList(listeners) {
  return listeners
    .map((l, i) => `${i + 1}.\t${getDativeName(l)}`)
    .join('\n');
}

function getAccusativeName(listener) {
  if (listener.name_accusative) return listener.name_accusative;
  try {
    const gender = listener.gender === 'женский' ? 'female' : 'male';
    const lastName = listener.last_name ? petrovich(listener.last_name, 'lastName', 'accusative', gender) : '';
    const firstName = listener.first_name ? petrovich(listener.first_name, 'firstName', 'accusative', gender) : '';
    const middleName = listener.middle_name ? petrovich(listener.middle_name, 'middleName', 'accusative', gender) : '';
    return [lastName, firstName, middleName].filter(Boolean).join(' ');
  } catch (e) {
    return [listener.last_name, listener.first_name, listener.middle_name].filter(Boolean).join(' ');
  }
}

function getDativeName(listener) {
  if (listener.name_dative) return listener.name_dative;
  try {
    const gender = listener.gender === 'женский' ? 'female' : 'male';
    const lastName = listener.last_name ? petrovich(listener.last_name, 'lastName', 'dative', gender) : '';
    const firstName = listener.first_name ? petrovich(listener.first_name, 'firstName', 'dative', gender) : '';
    const middleName = listener.middle_name ? petrovich(listener.middle_name, 'middleName', 'dative', gender) : '';
    return [lastName, firstName, middleName].filter(Boolean).join(' ');
  } catch (e) {
    return [listener.last_name, listener.first_name, listener.middle_name].filter(Boolean).join(' ');
  }
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatDateWithQuotes(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const year = d.getFullYear();
  return `«${day}» ${months[d.getMonth()]} ${year} года`;
}

function formatDateRu(isoDate) {
  if (!isoDate) return '';
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const d = new Date(isoDate);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} года`;
}

function renderTemplate(templateBuffer, data) {
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  doc.render(data);
  return doc.getZip().generate({ type: 'nodebuffer' });
}

module.exports = {
  generateEnrollmentOrder,
  generateDiplomaOrder,
  generateDiplomaOrderKazan,
  generateExpulsionOrder,
  generateDiplomaOrderSplit,
};
