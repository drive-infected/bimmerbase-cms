const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // замените
const content = require('./populate-family-content.json');

async function main() {
  for (const item of content) {
    const res = await fetch(`${API_URL}/engine-families?filters[slug][$eq]=${item.slug}`);
    const data = await res.json();
    const family = data.data?.[0];
    if (!family) {
      console.log(`❌ ${item.slug} не найден`);
      continue;
    }
    const docId = family.documentId;

    // Английская локаль
    const enBody = { data: {} };
    if (item.subtitle?.en) enBody.data.subtitle = item.subtitle.en;
    if (item.description?.en) enBody.data.description = item.description.en;
    if (item.features?.en) enBody.data.features = item.features.en;
    if (item.technical_update?.en) enBody.data.technical_update = item.technical_update.en;
    if (Object.keys(enBody.data).length > 0) {
      await fetch(`${API_URL}/engine-families/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(enBody),
      });
    }

    // Русская локаль
    const ruBody = { data: {} };
    if (item.subtitle?.ru) ruBody.data.subtitle = item.subtitle.ru;
    if (item.description?.ru) ruBody.data.description = item.description.ru;
    if (item.features?.ru) ruBody.data.features = item.features.ru;
    if (item.technical_update?.ru) ruBody.data.technical_update = item.technical_update.ru;
    if (Object.keys(ruBody.data).length > 0) {
      await fetch(`${API_URL}/engine-families/${docId}?locale=ru`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(ruBody),
      });
    }

    console.log(`✅ ${item.slug}`);
  }
}

main().catch(console.error);