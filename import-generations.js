const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // замените

const generations = require('./generations.json');

async function importGenerations() {
  for (const gen of generations) {
    // Проверяем существование
    const res = await fetch(`${API_URL}/generations?filters[slug][$eq]=${gen.slug}&locale=en`);
    const data = await res.json();
    const existing = data.data?.[0];
    let docId = existing?.documentId;

    // Английская локаль
    const enBody = {
      data: {
        title: gen.title,
        slug: gen.slug,
        series: gen.series,
        production_start: gen.production_start || null,
        production_end: gen.production_end || null,
        description: gen.description?.en || null,
        lci_info: gen.lci_info?.en || null,
        general_info: gen.general_info?.en || null,
      },
    };

    if (docId) {
      const putRes = await fetch(`${API_URL}/generations/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(enBody),
      });
      if (putRes.ok) {
        console.log(`✅ Обновлено поколение ${gen.title}`);
      } else {
        const err = await putRes.json();
        console.log(`❌ Ошибка обновления ${gen.title}: ${err.error?.message}`);
        continue;
      }
    } else {
      const createRes = await fetch(`${API_URL}/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(enBody),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        console.log(`❌ Ошибка создания ${gen.title}: ${err.error?.message}`);
        continue;
      }
      const createData = await createRes.json();
      docId = createData.data?.documentId;
      if (!docId) {
        console.log(`❌ Не удалось получить documentId для ${gen.title}`);
        continue;
      }
      console.log(`✅ Создано поколение ${gen.title} (docId: ${docId})`);
    }

    // Русская локаль
    const ruBody = {
      data: {
        title: gen.title,
        slug: gen.slug,
        series: gen.series,
        production_start: gen.production_start || null,
        production_end: gen.production_end || null,
        description: gen.description?.ru || null,
        lci_info: gen.lci_info?.ru || null,
        general_info: gen.general_info?.ru || null,
      },
    };
    const ruRes = await fetch(`${API_URL}/generations/${docId}?locale=ru`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
      body: JSON.stringify(ruBody),
    });
    if (!ruRes.ok) {
      const errText = await ruRes.text();
      console.log(`   ⚠️ Русская локаль: ${errText}`);
    } else {
      console.log(`   Русская локаль обновлена`);
    }
  }
}

importGenerations().catch(console.error);