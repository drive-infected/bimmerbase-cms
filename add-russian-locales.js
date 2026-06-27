const fs = require('fs');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // Full access

// Локализованные коллекции (те, где включена i18n)
const collections = [
  'series', 'generations', 'engine-families', 'articles', 'article-categories',
  'special-versions', 'trim-groups', 'options', 'option-categories'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function addRussianLocale(collection) {
  // 1. Получаем все записи с locale='en'
  const url = `${API}/${collection}?locale=en&pagination[pageSize]=100`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const data = await res.json();
  const entries = data.data || [];
  console.log(`Found ${entries.length} English entries in ${collection}`);

  for (const entry of entries) {
    // 2. Проверяем, есть ли уже русская локаль у этой записи
    //    (Strapi отдаёт localizations в populate, но проще проверить отдельным запросом)
    const checkUrl = `${API}/${collection}/${entry.documentId}?locale=ru`;
    const checkRes = await fetch(checkUrl, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (checkRes.ok) {
      console.log(`  ⏭️  ${collection} ${entry.slug || entry.title || entry.code} already has Russian locale`);
      continue;
    }

    // 3. Готовим данные для русской версии (копируем все поля, кроме системных и связей)
    const payload = { ...entry };
    delete payload.id;
    delete payload.documentId;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.publishedAt;
    delete payload.locale;
    delete payload.localizations;

    // 4. Связи оставляем как есть (Strapi скопирует их автоматически)
    //    При необходимости можно явно указать connect, но не требуется.

    // 5. Отправляем PUT-запрос с указанием locale=ru
    const updateUrl = `${API}/${collection}/${entry.documentId}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ locale: 'ru', data: payload }),
    });

    if (updateRes.ok) {
      console.log(`  ✅ ${collection} ${entry.slug || entry.title || entry.code} → Russian locale added`);
    } else {
      const err = await updateRes.json();
      console.error(`  ❌ ${collection} ${entry.slug || entry.title || entry.code}: ${JSON.stringify(err)}`);
    }

    await delay(100); // небольшая пауза
  }
}

(async () => {
  for (const col of collections) {
    console.log(`\n--- Processing ${col} ---`);
    await addRussianLocale(col);
  }
  console.log('\n✅ All Russian locales added!');
})();