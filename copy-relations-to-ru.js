const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // замените

async function main() {
  const res = await fetch(`${API_URL}/engine-families?pagination[pageSize]=100&populate=*`);
  const data = await res.json();
  const families = data.data || [];

  for (const family of families) {
    const ruRes = await fetch(`${API_URL}/engine-families/${family.documentId}?locale=ru`);
    const ruData = await ruRes.json();
    if (!ruData.data) {
      console.log(`Русская локаль отсутствует для ${family.slug}, создайте её сначала (скриптом sync-localized-fields)`);
      continue;
    }

    const engines = family.engines?.map(e => e.documentId) || [];
    const predecessor = family.predecessor?.documentId || null;
    const successor = family.successor?.documentId || null;

    const updateBody = { data: {} };
    if (engines.length > 0) updateBody.data.engines = engines;
    if (predecessor) updateBody.data.predecessor = predecessor;
    if (successor) updateBody.data.successor = successor;

    if (Object.keys(updateBody.data).length > 0) {
      const putRes = await fetch(`${API_URL}/engine-families/${family.documentId}?locale=ru`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(updateBody),
      });
      console.log(putRes.ok ? `✅ Связи скопированы для ${family.slug}` : `❌ ${family.slug}: ${(await putRes.json()).error?.message}`);
    }
  }
}

main().catch(console.error);