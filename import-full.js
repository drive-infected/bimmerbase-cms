const fs = require('fs');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = '6095b5449e13632bb5998a31c91fc6ad44629666142ee3a492c48bbedf53724e92d06c4537ff1bf52a502f52ee0856e57389b129eebfa0f164da999d815fbfc1d999ef09bc922089244e7f44266b56a15d92926e9ae6a3a3344f3af7d682c6f0d0924313d8d454b64359d355957369ee1afdfb7ffabe30cd6c1547cd42f31e22';

const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));

// Порядок коллекций (независимые раньше)
const order = [
  'series', 'engine-families', 'bodies', 'markets', 'steerings', 'transmissions',
  'engines', 'modifications', 'generations', 'model-codes',
  'articles', 'article-categories', 'special-versions', 'trim-groups',
  'options', 'option-categories', 'packages', 'individuals', 'equipment-codes',
  'standard-equipments', 'engine-versions', 'technical-specs', 'user-cars', 'service-logs'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Определяет, является ли значение связью (массив объектов с documentId или одиночный объект)
function isRelation(value) {
  if (Array.isArray(value)) {
    return value.length > 0 && value[0]?.documentId;
  }
  if (value && typeof value === 'object' && value.documentId) {
    return true;
  }
  return false;
}

// Преобразует значение связи в формат connect
function toConnect(value) {
  if (Array.isArray(value)) {
    return { connect: value.map(item => ({ documentId: item.documentId })) };
  }
  // Одиночный объект
  return { connect: [{ documentId: value.documentId }] };
}

// Создаёт запись, затем обновляет её полными данными
async function createAndUpdate(collection, entry) {
  // Удаляем системные поля и связи для первого запроса
  delete entry.id;
  delete entry.documentId;
  delete entry.createdAt;
  delete entry.updatedAt;
  delete entry.publishedAt;
  delete entry.locale;
  delete entry.localizations;

  // Сохраняем связи для последующего обновления
  const relations = {};
  for (const key of Object.keys(entry)) {
    if (isRelation(entry[key])) {
      relations[key] = entry[key];
      delete entry[key]; // временно убираем из первого запроса
    }
  }

  // Шаг 1: создаём запись без связей
  const createRes = await fetch(`${API}/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ data: entry }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    console.error(`  ❌ Create ${collection} ${entry.slug || entry.title || ''}: ${JSON.stringify(err)}`);
    return;
  }

  const created = await createRes.json();
  const docId = created.data.documentId;
  console.log(`  ✅ Created ${collection} ${entry.slug || entry.title || ''}`);

  // Шаг 2: обновляем запись, добавляя связи и восстанавливая все поля
  const updatePayload = { ...entry, ...relations };
  // Преобразуем связи в формат connect
  for (const key of Object.keys(updatePayload)) {
    if (isRelation(updatePayload[key])) {
      updatePayload[key] = toConnect(updatePayload[key]);
    }
  }

  const updateRes = await fetch(`${API}/${collection}/${docId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ data: updatePayload }),
  });

  if (!updateRes.ok) {
    const err = await updateRes.json();
    console.error(`  ❌ Update ${collection} ${entry.slug || entry.title || ''}: ${JSON.stringify(err)}`);
  } else {
    console.log(`  🔄 Updated ${collection} ${entry.slug || entry.title || ''}`);
  }
}

(async () => {
  for (const collection of order) {
    const entries = data[collection];
    if (!entries || !entries.length) continue;
    console.log(`\n--- Processing ${entries.length} items in ${collection} ---`);
    for (const entry of entries) {
      await createAndUpdate(collection, entry);
      await delay(50); // минимальная пауза, чтобы не перегружать API
    }
  }
  console.log('\n🎉 Import finished! Check admin panel.');
})();