const fs = require('fs');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // Full access

const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));

const lookupField = {
  series: 'slug', generations: 'slug', engines: 'slug', 'engine-families': 'slug',
  modifications: 'slug', articles: 'slug', 'article-categories': 'slug',
  'special-versions': 'slug', 'trim-groups': 'slug', options: 'sa_code',
  'option-categories': 'slug', bodies: 'title', markets: 'title',
  transmissions: 'title', steerings: 'code', 'model-codes': 'code',
  'user-cars': 'name', packages: 'title', individuals: 'title',
  'equipment-codes': 'code', 'standard-equipments': null, 'engine-versions': null,
  'technical-specs': null
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function updateEntry(collection, entry) {
  const field = lookupField[collection];
  if (!field) return;
  const lookupValue = entry[field];
  if (!lookupValue) return;

  const searchUrl = `${API}/${collection}?filters[${field}][$eq]=${encodeURIComponent(lookupValue)}`;
  const searchRes = await fetch(searchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const searchData = await searchRes.json();
  const existing = searchData.data?.[0];
  if (!existing) {
    console.error(`  ❌ ${collection} ${lookupValue} not found`);
    return;
  }

  // Копируем только простые поля, удаляем связи и системные поля
  const payload = { ...entry };
  delete payload.id; delete payload.documentId; delete payload.createdAt;
  delete payload.updatedAt; delete payload.publishedAt; delete payload.localizations;

  // Удаляем все поля-связи (массивы и объекты с documentId)
  for (const key of Object.keys(payload)) {
    const val = payload[key];
    if (Array.isArray(val) || (val && typeof val === 'object' && val.documentId)) {
      delete payload[key];
    }
  }

  const updateUrl = `${API}/${collection}/${existing.documentId}`;
  const res = await fetch(updateUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ data: payload }),
  });

  if (res.ok) {
    console.log(`  ✅ ${collection} ${lookupValue}`);
  } else {
    const err = await res.json();
    console.error(`  ❌ ${collection} ${lookupValue}: ${JSON.stringify(err)}`);
  }
}

(async () => {
  for (const collection of Object.keys(data)) {
    const entries = data[collection];
    if (!entries || !entries.length) continue;
    console.log(`\n--- Filling fields for ${entries.length} items in ${collection} ---`);
    for (const entry of entries) {
      await updateEntry(collection, entry);
      await delay(50);
    }
  }
  console.log('\n✅ Fields update finished!');
})();