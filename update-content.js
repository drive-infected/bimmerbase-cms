const fs = require('fs');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff';

const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));

// Поля, которые нужно заполнить для каждой коллекции (все RichText)
const contentFields = {
  series: ['description'],
  generations: ['description', 'lci_info'],
  'engine-families': ['description', 'features'],
  engines: [], // у engines нет RichText-полей, только числовые и строки
  modifications: [],
  articles: ['content'],
  'special-versions': ['description', 'differences'],
  'trim-groups': ['description'],
  // для model-codes, bodies, markets и т.д. контентных полей нет
};

const lookupField = {
  series: 'slug',
  generations: 'slug',
  engines: 'slug',
  'engine-families': 'slug',
  modifications: 'slug',
  articles: 'slug',
  'article-categories': 'slug',
  'special-versions': 'slug',
  'trim-groups': 'slug',
  options: 'sa_code',
  'option-categories': 'slug',
  bodies: 'title',
  markets: 'title',
  transmissions: 'title',
  steerings: 'code',
  'model-codes': 'code',
  'user-cars': 'name',
  packages: 'title',
  individuals: 'title',
  'equipment-codes': 'code',
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function updateContent(collection, entry) {
  const fields = contentFields[collection];
  if (!fields || fields.length === 0) return;

  const keyField = lookupField[collection];
  if (!keyField) return;
  const keyValue = entry[keyField];
  if (!keyValue) return;

  // Найти запись в API
  const searchUrl = `${API}/${collection}?filters[${keyField}][$eq]=${encodeURIComponent(keyValue)}`;
  const searchRes = await fetch(searchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const searchData = await searchRes.json();
  const existing = searchData.data?.[0];
  if (!existing) {
    console.error(`  ❌ ${collection} ${keyValue} not found`);
    return;
  }

  // Собрать только контентные поля
  const payload = {};
  for (const field of fields) {
    if (entry[field] !== undefined && entry[field] !== null) {
      payload[field] = entry[field];
    }
  }
  if (Object.keys(payload).length === 0) return;

  // PUT-запрос
  const updateUrl = `${API}/${collection}/${existing.documentId}`;
  const res = await fetch(updateUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ data: payload }),
  });

  if (res.ok) {
    console.log(`  📝 ${collection} ${keyValue} content updated`);
  } else {
    const err = await res.json();
    console.error(`  ❌ ${collection} ${keyValue}: ${JSON.stringify(err)}`);
  }
}

(async () => {
  for (const collection of Object.keys(data)) {
    const entries = data[collection];
    if (!entries || !entries.length) continue;
    console.log(`\n--- Updating content for ${entries.length} items in ${collection} ---`);
    for (const entry of entries) {
      await updateContent(collection, entry);
      await delay(50);
    }
  }
  console.log('\n✅ Content update finished!');
})();