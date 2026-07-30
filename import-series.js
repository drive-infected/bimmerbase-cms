const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // замените на реальный

const seriesList = require('./series.json');

async function importSeries() {
  for (const series of seriesList) {
    const res = await fetch(`${API_URL}/series?filters[slug][$eq]=${series.slug}`);
    const data = await res.json();
    const existing = data.data?.[0];
    let docId = existing?.documentId;

    const body = {
      data: {
        title: series.title,
        slug: series.slug,
      },
    };

    if (docId) {
      const putRes = await fetch(`${API_URL}/series/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(body),
      });
      if (putRes.ok) {
        console.log(`✅ Обновлена серия ${series.title}`);
      } else {
        const err = await putRes.json();
        console.log(`❌ Ошибка обновления ${series.title}: ${err.error?.message}`);
        continue;
      }
    } else {
      const createRes = await fetch(`${API_URL}/series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(body),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        console.log(`❌ Ошибка создания ${series.title}: ${err.error?.message}`);
        continue;
      }
      const createData = await createRes.json();
      docId = createData.data?.documentId;
      if (!docId) {
        console.log(`❌ Не удалось получить documentId для ${series.title}`);
        continue;
      }
      console.log(`✅ Создана серия ${series.title} (docId: ${docId})`);
    }

    // Русская локаль (только title и slug)
    const ruBody = { data: { title: series.title, slug: series.slug } };
    await fetch(`${API_URL}/series/${docId}?locale=ru`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
      body: JSON.stringify(ruBody),
    });
    console.log(`   Русская локаль обновлена`);
  }
}

importSeries().catch(console.error);