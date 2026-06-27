const fs = require('fs');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // Full access

const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));

// Коллекции, где locale не используется
const nonLocalized = [
  'markets', 'steerings', 'transmissions', 'bodies', 'model-codes',
  'user-cars', 'packages', 'individuals', 'equipment-codes',
  'standard-equipments', 'engine-versions', 'technical-specs',
  'modifications'
];

// Поля для поиска документов
const lookupField = {
  series: 'slug', generations: 'slug', engines: 'slug', 'engine-families': 'slug',
  modifications: 'slug', articles: 'slug', 'article-categories': 'slug',
  'special-versions': 'slug', 'trim-groups': 'slug', options: 'sa_code',
  'option-categories': 'slug', bodies: 'title', markets: 'title',
  transmissions: 'title', steerings: 'code', 'model-codes': 'code',
  'user-cars': 'name', packages: 'title', individuals: 'title',
  'equipment-codes': 'code'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Получить documentId по коллекции и значению ключа
async function getDocumentId(collection, key, value) {
  const url = `${API}/${collection}?filters[${key}][$eq]=${encodeURIComponent(value)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const json = await res.json();
  return json.data?.[0]?.documentId || null;
}

// Преобразовать массив/объект старых связей в массив новых documentId
async function resolveRelations(collection, field, value) {
  if (!value) return null;
  const items = Array.isArray(value) ? value : [value];
  const newDocIds = [];
  for (const item of items) {
    if (!item || !item[lookupField[field]]) continue;
    const docId = await getDocumentId(field, lookupField[field], item[lookupField[field]]);
    if (docId) newDocIds.push({ documentId: docId });
  }
  return newDocIds.length ? { connect: newDocIds } : null;
}

async function updateEntry(collection, entry) {
  const field = lookupField[collection];
  if (!field) return;
  const lookupValue = entry[field];
  if (!lookupValue) return;

  // Получаем текущий documentId записи
  const currentDocId = await getDocumentId(collection, field, lookupValue);
  if (!currentDocId) {
    console.error(`  ❌ ${collection} ${lookupValue} not found`);
    return;
  }

  // Собираем связи из backup-записи
  const relations = {};
  for (const [key, val] of Object.entries(entry)) {
    if (key === 'id' || key === 'documentId' || key === 'createdAt' || key === 'updatedAt' || key === 'publishedAt' || key === 'localizations' || key === 'locale') continue;
    // Ищем целевые коллекции: для массивов и одиночных объектов
    if (Array.isArray(val) && val.length > 0 && val[0]?.documentId) {
      // предполагаем, что это связь many-to-many
      const targetCollection = key; // например, 'engines', 'generations'
      const connect = await resolveRelations(targetCollection, targetCollection, val);
      if (connect) relations[key] = connect;
    } else if (val && typeof val === 'object' && val.documentId) {
      // одиночная связь
      const targetCollection = key;
      const connect = await resolveRelations(targetCollection, targetCollection, [val]);
      if (connect) relations[key] = connect;
    }
  }

  if (Object.keys(relations).length === 0) return;

  const updateUrl = `${API}/${collection}/${currentDocId}`;
  const res = await fetch(updateUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ data: relations }),
  });

  if (res.ok) {
    console.log(`  🔗 ${collection} ${lookupValue}`);
  } else {
    const err = await res.json();
    console.error(`  ❌ ${collection} ${lookupValue}: ${JSON.stringify(err)}`);
  }
}

(async () => {
  for (const collection of Object.keys(data)) {
    const entries = data[collection];
    if (!entries || !entries.length) continue;
    console.log(`\n--- Linking relations for ${entries.length} items in ${collection} ---`);
    for (const entry of entries) {
      await updateEntry(collection, entry);
      await delay(100);
    }
  }
  console.log('\n✅ Relations updated with correct documentIds!');
})();