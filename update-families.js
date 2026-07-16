const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // замените на реальный токен

const updates = require('./update-families.json');

async function updateFamilies() {
  for (const item of updates) {
    // Находим семейство по slug (или code)
    const slug = item.data.slug || item.code.toLowerCase();
    const res = await fetch(`${API_URL}/engine-families?filters[slug][$eq]=${slug}`);
    const famData = await res.json();
    const family = famData.data?.[0];
    if (!family) {
      console.log(`Семейство ${item.code} (slug: ${slug}) не найдено`);
      continue;
    }
    // PUT-запрос с обновлёнными полями
    const putRes = await fetch(`${API_URL}/engine-families/${family.documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify({ data: item.data }),
    });
    if (putRes.ok) {
      console.log(`✅ ${item.code} обновлён`);
    } else {
      const err = await putRes.json();
      console.log(`❌ ${item.code}: ${err.error?.message}`);
    }
  }
}

updateFamilies();