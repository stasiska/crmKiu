const XLSX = require('xlsx');

function parseExcel(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return rows.map((row) => {
    const normalizedRow = {};
    for (const [key, value] of Object.entries(row)) {
      normalizedRow[key.trim().toLowerCase()] = value;
    }
    return normalizedRow;
  });
}

function buildGroupsExcel(rows) {
  const data = rows.map((group) => ({
    'Наименование курса': group.course_name || '',
    'Статус': group.status || 'набор',
    'Количество часов': group.hours ?? '',
    'Период обучения': [group.start_date, group.end_date]
      .map((date) => date ? new Date(date).toLocaleDateString('ru-RU') : '—')
      .join(' — '),
    'Аудитория/Дистант': group.auditorium || group.format || '',
    'Количество слушателей': Number(group.listeners_count || 0),
    'Менеджер': group.manager_name || '',
    'Подразделение': group.branch || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 30 }, { wch: 14 }, { wch: 18 }, { wch: 25 },
    { wch: 20 }, { wch: 24 }, { wch: 24 }, { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Группы');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { parseExcel, buildGroupsExcel };
