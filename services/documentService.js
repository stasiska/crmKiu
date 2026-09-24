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

/**
 * Генерация договора для слушателя
 */
async function generateListenerContract(listenerId, groupId, options) {
  const listener = await db.getListenerById(listenerId);
  if (!listener) throw new Error('Слушатель не найден');

  const group = await db.getGroupById(groupId);
  if (!group) throw new Error('Группа не найдена');

  // Получаем финансовые данные из связи слушатель-группа
  const groupListenerData = await db.getGroupListenerData(groupId, listenerId);

  const template = await db.getDocumentTemplate('listener_contract');
  if (!template) throw new Error('Шаблон "listener_contract" не найден');

  const data = buildListenerContractData(listener, group, groupListenerData, options);
  return renderTemplate(template.file_data, data);
}

/**
 * Генерация заявления о зачислении слушателя
 */
async function generateListenerApplication(listenerId, groupId) {
  const listener = await db.getListenerById(listenerId);
  if (!listener) throw new Error('Слушатель не найден');

  const group = await db.getGroupById(groupId);
  if (!group) throw new Error('Группа не найдена');

  const template = await db.getDocumentTemplate('listener_application');
  if (!template) throw new Error('Шаблон "listener_application" не найден');

  const data = buildListenerApplicationData(listener, group);
  return renderTemplate(template.file_data, data);
}

function buildListenerApplicationData(listener, group) {
  const currentDate = new Date();

  // Вычисление возраста
  let age = '';
  if (listener.birth_date) {
    const birthDate = new Date(listener.birth_date);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  // Форматирование даты рождения
  const birthDate = listener.birth_date ? new Date(listener.birth_date) : null;
  const birthDateFormatted = birthDate ?
    `${birthDate.getDate().toString().padStart(2, '0')}.${(birthDate.getMonth() + 1).toString().padStart(2, '0')}.${birthDate.getFullYear()}` : '';

  // Форматирование пола
  const gender = listener.gender === 'male' ? 'М' : listener.gender === 'female' ? 'Ж' : '';

  return {
    // ФИО
    last_name: listener.last_name || '',
    first_name: listener.first_name || '',
    middle_name: listener.middle_name || '',
    full_name: `${listener.last_name || ''} ${listener.first_name || ''} ${listener.middle_name || ''}`.trim(),

    // Личные данные
    birth_date: birthDateFormatted,
    age: age.toString(),
    birth_place: listener.birth_place || '',
    gender: gender,
    citizenship: listener.citizenship || '',

    // Контакты
    phone: listener.phone || '',
    email: listener.email || '',

    // Адреса
    residence_address: listener.residence_address || '',
    registration_address: listener.registration_address || '',

    // Образование
    education_level: listener.education_level || '',
    education_series: listener.education_series || '',
    education_number: listener.education_number || '',

    // Работа
    snils: listener.snils || '',

    // Курс
    course_name: group.course_name || '',
    course_hours: group.hours || '',

    // Текущая дата
    current_date: `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`
  };
}

function buildListenerContractData(listener, group, groupListenerData, options) {
  const contractDate = options.contractDate ? new Date(options.contractDate) : new Date();
  const startDate = group.start_date ? new Date(group.start_date) : new Date();
  const endDate = group.end_date ? new Date(group.end_date) : new Date();

  const price = groupListenerData?.contract_amount || group.course_price || 0;

  // Преобразование формата обучения
  const studyForm = formatStudyForm(group.format);

  return {
    contract_number: options.contractNumber || '',
    contract_day: contractDate.getDate(),
    contract_month: getMonthNameGenitive(contractDate.getMonth()),
    contract_year: contractDate.getFullYear(),

    customer_full_name: options.customerFullName || `${listener.last_name || ''} ${listener.first_name || ''} ${listener.middle_name || ''}`.trim(),
    customer_passport: options.customerPassport || '',

    listener_full_name: `${listener.last_name || ''} ${listener.first_name || ''} ${listener.middle_name || ''}`.trim(),

    study_form: studyForm,
    course_name: group.course_name || '',
    hours: group.hours || '',

    start_day: startDate.getDate(),
    start_month: getMonthNameGenitive(startDate.getMonth()),
    start_year: startDate.getFullYear(),

    end_day: endDate.getDate(),
    end_month: getMonthNameGenitive(endDate.getMonth()),
    end_year: endDate.getFullYear(),

    course_price: parseFloat(price).toFixed(2),
    course_price_words: numberToWords(price),
  };
}

function formatStudyForm(format) {
  if (!format) return '';

  const formatLower = format.toLowerCase();

  // Если содержит "аудитория" или "очн" - очная
  if (formatLower.includes('аудитория') || formatLower.includes('очн')) {
    return 'очная';
  }

  // Если содержит "дистант" или "заочн" - заочная
  if (formatLower.includes('дистант') || formatLower.includes('заочн')) {
    return 'заочная';
  }

  // Если содержит "онлайн" - заочная с применением дистанционных технологий
  if (formatLower.includes('онлайн')) {
    return 'заочная с применением дистанционных образовательных технологий';
  }

  // По умолчанию возвращаем как есть
  return format;
}

function getMonthNameGenitive(monthIndex) {
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return months[monthIndex] || '';
}

function numberToWords(num) {
  // Упрощенная функция для преобразования числа в слова
  // Для полноценной реализации можно использовать библиотеку rubles
  const n = Math.floor(num);
  if (n === 0) return 'ноль';

  // Базовая реализация для чисел до 1000000
  const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

  if (n < 10) return ones[n];
  if (n < 20) {
    const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать',
                   'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    return teens[n - 10];
  }
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o > 0 ? ' ' + ones[o] : '');
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return hundreds[h] + (rest > 0 ? ' ' + numberToWords(rest) : '');
  }

  // Для больших чисел - упрощенный вариант
  return n.toString();
}

function renderTemplate(templateBuffer, data) {
  try {
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '' // Заменяет null/undefined на пустую строку
    });
    doc.render(data);
    return doc.getZip().generate({ type: 'nodebuffer' });
  } catch (error) {
    // Детальная информация об ошибке
    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors.map((err) => {
        return `Ошибка в поле: ${err.properties.id || 'неизвестно'}, тип: ${err.name}`;
      }).join('; ');
      throw new Error(`Ошибка генерации документа: ${errorMessages}`);
    }
    throw error;
  }
}

module.exports = {
  generateEnrollmentOrder,
  generateDiplomaOrder,
  generateDiplomaOrderKazan,
  generateExpulsionOrder,
  generateDiplomaOrderSplit,
  generateListenerContract,
  generateListenerApplication,
};
