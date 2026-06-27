// export-data.js
// Сохраняет все коллекции в файл backup.json
const fs = require('fs');
const { execSync } = require('child_process');

const API = 'https://bimmerbase-api.onrender.com/api';
const TOKEN = 'a77965dd86efcc8ab097e93a6a2476df521de9f988cd1c5280825cfe1e1711da4168678aba25090d834eb2cde070e4f2933f47167e8dd99db46618fdab910c0b1e22e78587536c6f015d16f37e6819ea8957fae2be65be4595327b7c4a6372f9a06e62161b35fbaf7d0240e4b09aa91b5c5049b3c77dd524894c1604e6c48c35'; // Full access token

const collections = [
  'series', 'generations', 'engines', 'engine-families', 'modifications',
  'articles', 'article-categories', 'options', 'option-categories',
  'special-versions', 'trim-groups', 'bodies', 'transmissions',
  'steerings', 'markets', 'model-codes', 'user-cars', 'service-logs',
  'packages', 'individuals', 'equipment-codes', 'standard-equipments',
  'engine-versions', 'technical-specs'
];

async function fetchAll(collection) {
  let all = [];
  let page = 1;
  while (true) {
    const url = `${API}/${collection}?pagination[pageSize]=100&pagination[page]=${page}&populate=*`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const json = await res.json();
    const data = json.data;
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 100) break;
    page++;
  }
  return all;
}

(async () => {
  const backup = {};
  for (const col of collections) {
    console.log(`Exporting ${col}...`);
    backup[col] = await fetchAll(col);
  }
  fs.writeFileSync('backup.json', JSON.stringify(backup, null, 2));
  console.log('backup.json saved.');
})();