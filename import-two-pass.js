const fs = require('fs');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // Full access токен

const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));

// Порядок коллекций для первого прохода (независимые раньше)
const order = [
  'series', 'engine-families', 'bodies', 'markets', 'steerings', 'transmissions',
  'engines', 'modifications', 'generations', 'model-codes',
  'articles', 'article-categories', 'special-versions', 'trim-groups',
  'options', 'option-categories', 'packages', 'individuals', 'equipment-codes',
  'standard-equipments', 'engine-versions', 'technical-specs', 'user-cars', 'service-logs'
];

// Вспомогательная функция для задержки (чтобы не заспамить API)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Проверяет, является ли поле связью (массив или объект с id)
function isRelationField(value) {
  if (Array.isArray(value)) return true;
  if (value && typeof value === 'object' && value.id) return true;
  return false;
}

// Первый проход: создание записей без связей
async function firstPass() {
  for (const collection of order) {
    const entries = data[collection];
    if (!entries || !entries.length) continue;
    console.log(`[1/2] Creating ${entries.length} items in ${collection}...`);
    for (const entry of entries) {
      // Удаляем системные и виртуальные поля
      delete entry.id;
      delete entry.documentId;
      delete entry.createdAt;
      delete entry.updatedAt;
      delete entry.publishedAt;
      delete entry.locale;
      delete entry.localizations;

      // Удаляем все поля-связи (массивы и объекты с id)
      for (const key of Object.keys(entry)) {
        if (isRelationField(entry[key])) {
          delete entry[key];
        }
      }

      // Отправляем запрос на создание
      const res = await fetch(`${API}/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ data: entry }),
      });

      if (res.ok) {
        const json = await res.json();
        // Сохраняем documentId созданной записи, чтобы использовать во втором проходе
        entry._createdDocumentId = json.data.documentId;
        console.log(`  ✅ ${collection} ${entry.slug || entry.title || ''}`);
      } else {
        const err = await res.json();
        console.error(`  ❌ ${collection} ${entry.slug || entry.title || ''}: ${JSON.stringify(err)}`);
      }

      await delay(100); // небольшая пауза
    }
  }
}

// Второй проход: обновление связей
async function secondPass() {
  for (const collection of order) {
    const entries = data[collection];
    if (!entries || !entries.length) continue;
    console.log(`[2/2] Updating relations for ${collection}...`);
    for (const originalEntry of entries) {
      // Находим оригинальные поля-связи из backup.json
      const originalData = data[collection].find(
        e => e.slug === originalEntry.slug || e.title === originalEntry.title
      );
      if (!originalData) continue;

      // Собираем связи, которые нужно обновить
      const relationsToUpdate = {};
      for (const key of Object.keys(originalData)) {
        if (isRelationField(originalData[key])) {
          const relationValue = originalData[key];
          if (Array.isArray(relationValue)) {
            // many-to-many или one-to-many: массив объектов с documentId
            relationsToUpdate[key] = {
              connect: relationValue
                .filter(item => item.documentId)
                .map(item => ({ documentId: item.documentId }))
            };
          } else if (relationValue && relationValue.documentId) {
            // many-to-one: одиночный объект с documentId
            relationsToUpdate[key] = {
              connect: [{ documentId: relationValue.documentId }]
            };
          }
        }
      }

      if (Object.keys(relationsToUpdate).length === 0) continue;

      const docId = originalEntry._createdDocumentId;
      if (!docId) continue;

      // PUT-запрос для обновления только связей
      const res = await fetch(`${API}/${collection}/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ data: relationsToUpdate }),
      });

      if (res.ok) {
        console.log(`  🔄 Updated relations for ${collection} ${originalEntry.slug || originalEntry.title}`);
      } else {
        const err = await res.json();
        console.error(`  ❌ Failed to update relations for ${collection} ${originalEntry.slug || originalEntry.title}: ${JSON.stringify(err)}`);
      }

      await delay(100);
    }
  }
}

(async () => {
  console.log('Starting two-pass import...');
  await firstPass();
  console.log('First pass completed. Starting second pass...');
  await secondPass();
  console.log('Import finished! Check admin panel.');
})();