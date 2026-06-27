const fs = require('fs');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = '6095b5449e13632bb5998a31c91fc6ad44629666142ee3a492c48bbedf53724e92d06c4537ff1bf52a502f52ee0856e57389b129eebfa0f164da999d815fbfc1d999ef09bc922089244e7f44266b56a15d92926e9ae6a3a3344f3af7d682c6f0d0924313d8d454b64359d355957369ee1afdfb7ffabe30cd6c1547cd42f31e22'; // Full access

const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));

// Порядок важен: сначала независимые коллекции, потом зависимые
const order = [
  'engine-families', 'bodies', 'markets', 'steerings', 'transmissions',
  'series', 'generations', 'engines', 'modifications', 'model-codes',
  'articles', 'article-categories', 'special-versions', 'trim-groups',
  'options', 'option-categories', 'packages', 'individuals', 'equipment-codes',
  'standard-equipments', 'engine-versions', 'technical-specs', 'user-cars', 'service-logs'
];

async function postEntry(collection, entry) {
  // Удаляем системные и виртуальные поля, которые Strapi не принимает
  delete entry.id;
  delete entry.documentId;
  delete entry.createdAt;
  delete entry.updatedAt;
  delete entry.publishedAt;
  delete entry.localizations;   // виртуальное поле
  delete entry.locale;          // Strapi сам назначит, если нужно

  // Для series убираем generations (поколения ещё не созданы)
  if (collection === 'series') {
    delete entry.generations;
  }

  const url = `${API}/${collection}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ data: entry }),
  });
  if (!res.ok) {
    const err = await res.json();
    // Не прерываем весь процесс, просто логируем ошибку
    console.error(`  ❌ ${collection} ${entry.slug || entry.title || ''}: ${JSON.stringify(err)}`);
  } else {
    console.log(`  ✅ ${collection} ${entry.slug || entry.title || ''}`);
  }
}

(async () => {
  for (const col of order) {
    const entries = data[col];
    if (!entries || !entries.length) continue;
    console.log(`Importing ${entries.length} items to ${col}...`);
    for (const entry of entries) {
      await postEntry(col, entry);
    }
  }
  console.log('Import finished. Check admin panel.');
})();