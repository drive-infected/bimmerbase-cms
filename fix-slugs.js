const fs = require('fs');

// Читаем исходный backup.json
const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));

// Проходим по всем коллекциям и записям
for (const [collection, entries] of Object.entries(data)) {
  for (const entry of entries) {
    // Если есть поле locale и slug, модифицируем slug
    if (entry.locale && entry.slug && !entry.slug.endsWith(`-${entry.locale}`)) {
      entry.slug = `${entry.slug}-${entry.locale}`;
    }
  }
}

// Сохраняем исправленный файл
fs.writeFileSync('backup-fixed.json', JSON.stringify(data, null, 2));
console.log('Fixed slugs saved to backup-fixed.json');