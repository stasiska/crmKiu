const XLSX = require('xlsx');

function parseExcel(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const normalizedRows = rows.map(row => {
    const newRow = {};
    for (const [key, value] of Object.entries(row)) {
      // Приводим ключ к нижнему регистру и убираем лишние пробелы
      const lowerKey = key.trim().toLowerCase();
      newRow[lowerKey] = value;
    }
    // Логируем первую строку для отладки
    if (rows.indexOf(row) === 0) {
      //console.log('📄 Первая строка Excel после нормализации:', newRow);
    }
    return newRow;
  });

  return normalizedRows;
}

module.exports = { parseExcel };