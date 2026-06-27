const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // Full access

// Локализованные коллекции
const collections = [
  'series', 'generations', 'engine-families', 'articles', 'article-categories',
  'special-versions', 'trim-groups'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Получить документ по documentId в нужной локали
async function getDocument(collection, documentId, locale) {
  const url = `${API}/${collection}/${documentId}?locale=${locale}&populate=*`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

// Извлечь связи из данных записи
function extractRelations(data) {
  const relations = {};
  for (const [key, value] of Object.entries(data)) {
    // Пропускаем системные поля
    if (['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'locale', 'localizations'].includes(key)) continue;
    if (Array.isArray(value)) {
      // Массив связанных сущностей
      if (value.length > 0 && value[0].documentId) {
        relations[key] = value.map(item => ({ documentId: item.documentId }));
      }
    } else if (value && typeof value === 'object' && value.documentId) {
      // Одиночная связь
      relations[key] = { documentId: value.documentId };
    }
  }
  return relations;
}

async function copyRelations(collection) {
  // Получаем все английские записи
  const url = `${API}/${collection}?locale=en&populate=*&pagination[pageSize]=100`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const data = await res.json();
  const enEntries = data.data || [];
  console.log(`Processing ${enEntries.length} entries in ${collection}`);

  for (const enEntry of enEntries) {
    // Проверяем наличие русской версии
    const ruEntry = await getDocument(collection, enEntry.documentId, 'ru');
    if (!ruEntry) {
      console.log(`  ⏭️  ${collection} ${enEntry.slug || enEntry.title || enEntry.code}: no Russian locale`);
      continue;
    }

    // Извлекаем связи из английской версии
    const relations = extractRelations(enEntry);
    if (Object.keys(relations).length === 0) {
      console.log(`  ⏭️  ${collection} ${enEntry.slug || enEntry.title || enEntry.code}: no relations to copy`);
      continue;
    }

    // PUT-запрос к русской версии (передаём только связи)
    const updateUrl = `${API}/${collection}/${ruEntry.documentId}?locale=ru`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ data: relations }),
    });

    if (updateRes.ok) {
      console.log(`  ✅ ${collection} ${enEntry.slug || enEntry.title || enEntry.code}: relations copied`);
    } else {
      const err = await updateRes.json();
      console.error(`  ❌ ${collection} ${enEntry.slug || enEntry.title || enEntry.code}: ${JSON.stringify(err)}`);
    }

    await delay(100);
  }
}

(async () => {
  for (const col of collections) {
    console.log(`\n--- Copying relations for ${col} ---`);
    await copyRelations(col);
  }
  console.log('\n✅ Relations copied to Russian locales!');
})();