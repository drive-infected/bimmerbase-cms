const fs = require('fs');

const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));
let sql = '';

const escape = (val) => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
};

for (const [collection, entries] of Object.entries(data)) {
  if (!entries.length) continue;

  // Определяем столбцы из первой записи, исключаем только автоинкрементный id
  const sample = entries[0];
  const columns = Object.keys(sample).filter(k => k !== 'id');

  for (const entry of entries) {
    const values = columns.map(k => escape(entry[k]));
    sql += `INSERT INTO "${collection}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
  }
}

fs.writeFileSync('import.sql', sql);
console.log('import.sql generated successfully.');