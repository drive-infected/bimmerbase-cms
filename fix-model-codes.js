const fs = require('fs');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff';

const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));
const modelCodes = data['model-codes'] || [];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Получить documentId по коллекции и значению ключа
async function getDocumentId(collection, key, value) {
  const url = `${API}/${collection}?filters[${key}][$eq]=${encodeURIComponent(value)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const json = await res.json();
  return json.data?.[0]?.documentId || null;
}

async function fixModelCode(entry) {
  const code = entry.code;
  if (!code) return;

  // Найти текущий documentId model-code
  const currentDocId = await getDocumentId('model-codes', 'code', code);
  if (!currentDocId) {
    console.error(`  ❌ Model code ${code} not found`);
    return;
  }

  const relations = {};

  // Проставляем каждую связь, ища целевой документ по ключу
  if (entry.generation && entry.generation.documentId) {
    const genId = await getDocumentId('generations', 'slug', entry.generation.slug);
    if (genId) relations.generation = { connect: [{ documentId: genId }] };
  }
  if (entry.modification && entry.modification.documentId) {
    const modId = await getDocumentId('modifications', 'slug', entry.modification.slug);
    if (modId) relations.modification = { connect: [{ documentId: modId }] };
  }
  if (entry.body && entry.body.documentId) {
    const bodyId = await getDocumentId('bodies', 'title', entry.body.title);
    if (bodyId) relations.body = { connect: [{ documentId: bodyId }] };
  }
  if (entry.engine && entry.engine.documentId) {
    const engId = await getDocumentId('engines', 'slug', entry.engine.slug);
    if (engId) relations.engine = { connect: [{ documentId: engId }] };
  }
  if (entry.steering && entry.steering.documentId) {
    const steerId = await getDocumentId('steerings', 'code', entry.steering.code);
    if (steerId) relations.steering = { connect: [{ documentId: steerId }] };
  }
  if (entry.market && entry.market.documentId) {
    const marketId = await getDocumentId('markets', 'title', entry.market.title);
    if (marketId) relations.market = { connect: [{ documentId: marketId }] };
  }

  if (Object.keys(relations).length === 0) return;

  const updateUrl = `${API}/model-codes/${currentDocId}`;
  const res = await fetch(updateUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ data: relations }),
  });

  if (res.ok) {
    console.log(`  🔗 Model code ${code} updated`);
  } else {
    const err = await res.json();
    console.error(`  ❌ Model code ${code}: ${JSON.stringify(err)}`);
  }
}

(async () => {
  console.log(`--- Fixing ${modelCodes.length} model codes ---`);
  for (const entry of modelCodes) {
    await fixModelCode(entry);
    await delay(50);
  }
  console.log('✅ Model codes fixed!');
})();