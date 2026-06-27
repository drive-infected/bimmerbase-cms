const fs = require('fs');

// Соответствие: имя коллекции в API -> реальное имя таблицы в Supabase
const tableMap = {
  series: 'serie',
  generations: 'generation',
  engines: 'engine',
  'engine-families': 'engine-family',
  modifications: 'modification',
  articles: 'article',
  'article-categories': 'article-category',
  'article-tags': 'article-tag',
  options: 'option',
  'option-categories': 'option-category',
  'special-versions': 'special-version',
  'trim-groups': 'trim-group',
  bodies: 'body',
  transmissions: 'transmission',
  steerings: 'steering',
  markets: 'market',
  'model-codes': 'model-code',
  'user-cars': 'user-car',
  'service-logs': 'service-log',
  packages: 'package',
  individuals: 'individual',
  'equipment-codes': 'equipment-code',
  'standard-equipments': 'standard-equipment',
  'engine-versions': 'engine-version',
  'technical-specs': 'technical-spec',
};

let sql = fs.readFileSync('import.sql', 'utf-8');

// Заменяем каждое имя коллекции на правильное имя таблицы
for (const [oldName, newName] of Object.entries(tableMap)) {
  // Ищем INSERT INTO "старое_имя" и заменяем на "новое_имя"
  const regex = new RegExp(`INSERT INTO "${oldName}"`, 'g');
  sql = sql.replace(regex, `INSERT INTO "${newName}"`);
}

fs.writeFileSync('import-fixed.sql', sql);
console.log('import-fixed.sql created with corrected table names.');