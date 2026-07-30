const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // замените

async function main() {
  const res = await fetch(`${API_URL}/engine-families?pagination[pageSize]=100`);
  const data = await res.json();
  const families = data.data || [];

  for (const family of families) {
    const docId = family.documentId;
    const ruRes = await fetch(`${API_URL}/engine-families/${docId}?locale=ru`);
    const ruData = await ruRes.json();
    const ruExists = !!ruData.data;

    const body = {
      data: {
        slug: family.slug,
        title: family.title,
        layout: family.layout,
        fuel_type: family.fuel_type,
        configuration: family.configuration,
        cylinder_count: family.cylinder_count,
        aspiration: family.aspiration,
        valvetrain: family.valvetrain,
        timing_system: family.timing_system,
        block_material: family.block_material,
        head_material: family.head_material,
        valves_per_cylinder: family.valves_per_cylinder,
        production_start: family.production_start,
        production_end: family.production_end,
        v_angle_deg: family.v_angle_deg,
      },
    };

    if (ruExists) {
      await fetch(`${API_URL}/engine-families/${docId}?locale=ru`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(body),
      });
      console.log(`✅ Обновлена русская локаль: ${family.slug}`);
    } else {
      await fetch(`${API_URL}/engine-families/${docId}/localizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify({ locale: 'ru', ...body }),
      });
      console.log(`✅ Создана русская локаль: ${family.slug}`);
    }
  }
}

main().catch(console.error);