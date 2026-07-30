const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff';

async function main() {
  const slugs = [
    '1-series',
    '3-series',
    '5-series',
    '6-series',
    '7-series',
    '8-series',
    'x3',
    'x5',
    'z3',
    'z4',
  ];

  const result = {};

  for (const slug of slugs) {
    const res = await fetch(`${API_URL}/series?filters[slug][$eq]=${slug}`);
    const data = await res.json();
    const doc = data.data?.[0];
    if (doc) {
      result[slug] = doc.documentId;
      console.log(`${slug}: ${doc.documentId}`);
    } else {
      console.log(`${slug}: не найдена`);
    }
  }

  // Сохраняем в файл для дальнейшего использования
  require('fs').writeFileSync('series-docids.json', JSON.stringify(result, null, 2));
  console.log('Сохранено в series-docids.json');
}

main().catch(console.error);