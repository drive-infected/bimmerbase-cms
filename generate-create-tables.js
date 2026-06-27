const fs = require('fs');
const path = require('path');

// Папка с API коллекциями
const apiDir = path.join(__dirname, 'src', 'api');
let sql = '';

// Вспомогательная функция для превращения типа поля Strapi в тип PostgreSQL
function strapiTypeToSQL(attribute) {
  switch (attribute.type) {
    case 'uid':
    case 'string':
    case 'text':
    case 'richtext':
    case 'enumeration':
      return 'TEXT';
    case 'integer':
    case 'biginteger':
      return 'INTEGER';
    case 'decimal':
    case 'float':
      return 'NUMERIC';
    case 'boolean':
      return 'BOOLEAN';
    case 'date':
    case 'datetime':
      return 'TIMESTAMPTZ';
    case 'json':
      return 'JSONB';
    case 'email':
    case 'password':
      return 'TEXT';
    default:
      return 'TEXT';
  }
}

// Читаем все коллекции
const collections = fs.readdirSync(apiDir);
for (const col of collections) {
  const schemaPath = path.join(apiDir, col, 'content-types', col, 'schema.json');
  if (!fs.existsSync(schemaPath)) continue;

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const tableName = col; // Strapi использует имя коллекции как имя таблицы
  const attributes = schema.attributes || {};

  // Пропускаем коллекции без атрибутов
  if (Object.keys(attributes).length === 0) continue;

  // Начинаем CREATE TABLE
  let createSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
  const columns = [];

  // Добавляем системные поля
  columns.push('  "id" SERIAL PRIMARY KEY');
  columns.push('  "documentId" TEXT UNIQUE NOT NULL');
  columns.push('  "createdAt" TIMESTAMPTZ DEFAULT NOW()');
  columns.push('  "updatedAt" TIMESTAMPTZ DEFAULT NOW()');
  columns.push('  "publishedAt" TIMESTAMPTZ');

  // Добавляем поля из атрибутов
  for (const [name, attr] of Object.entries(attributes)) {
    if (name === 'localizations') continue; // Это виртуальное поле, не нужно в таблице
    let colDef = `  "${name}" ${strapiTypeToSQL(attr)}`;
    if (attr.unique) colDef += ' UNIQUE';
    if (attr.required) colDef += ' NOT NULL';
    columns.push(colDef);
  }

  createSQL += columns.join(',\n');
  createSQL += '\n);\n\n';
  sql += createSQL;
}

fs.writeFileSync('create-tables.sql', sql);
console.log('create-tables.sql generated successfully.');