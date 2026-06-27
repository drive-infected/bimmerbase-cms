const fs = require('fs');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // Full access

const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));

// Коллекции, которые НЕ поддерживают локализацию (locale не нужен)
const nonLocalized = [
  'markets', 'steerings', 'transmissions', 'bodies', 'model-codes',
  'user-cars', 'packages', 'individuals', 'equipment-codes',
  'standard-equipments', 'engine-versions', 'technical-specs',
  'modifications' // у modifications locale всегда null, коллекция не локализована
];

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

function toConnect(value) {
  if (Array.isArray(value)) {
    const items = value.filter(Boolean).map(item => ({ documentId: item.documentId }));
    return items.length ? { connect: items } : null;
  }
  if (value && value.documentId) {
    return { connect: [{ documentId: value.documentId }] };
  }
  return null;
}

async function updateRelations(collection, entry) {
  const field = lookupField[collection];
  if (!field) return;
  const lookupValue = entry[field];
  if (!lookupValue) return;

  // Ищем запись в Strapi
  const searchUrl = `${API}/${collection}?filters[${field}][$eq]=${encodeURIComponent(lookupValue)}`;
  const searchRes = await fetch(searchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const searchData = await searchRes.json();
  const existing = searchData.data?.[0];
  if (!existing) {
    console.error(`  ❌ ${collection} ${lookupValue} not found in API`);
    return;
  }

  // Удаляем системные и недопустимые поля
  delete entry.id; delete entry.documentId; delete entry.createdAt;
  delete entry.updatedAt; delete entry.publishedAt;
  delete entry.localizations;   // ключевое исправление
  if (nonLocalized.includes(collection)) {
    delete entry.locale;        // для нелокализованных коллекций
  }

  // Собираем только связи
  const relations = {};
  for (const key of Object.keys(entry)) {
    const val = entry[key];
    if (Array.isArray(val) || (val && typeof val === 'object' && val.documentId)) {
      const connect = toConnect(val);
      if (connect) relations[key] = connect;
    }
  }
  if (Object.keys(relations).length === 0) return;

  // PUT-запрос с обновлением связей
  const updateUrl = `${API}/${collection}/${existing.documentId}`;
  const res = await fetch(updateUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ data: relations }),
  });

  if (res.ok) {
    console.log(`  🔗 ${collection} ${lookupValue}`);
  } else {
    const err = await res.json();
    // Если ошибка из-за отсутствия связанного документа — просто предупреждаем
    if (err?.error?.message?.includes('not found')) {
      console.warn(`  ⚠️  ${collection} ${lookupValue}: missing related document, skipping some relations`);
    } else {
      console.error(`  ❌ ${collection} ${lookupValue}: ${JSON.stringify(err)}`);
    }
  }
}

(async () => {
  for (const collection of Object.keys(data)) {
    const entries = data[collection];
    if (!entries || !entries.length) continue;
    console.log(`\n--- Linking relations for ${entries.length} items in ${collection} ---`);
    for (const entry of entries) {
      await updateRelations(collection, entry);
      await delay(50);
    }
  }
  console.log('\n✅ Relations update finished!');
})();