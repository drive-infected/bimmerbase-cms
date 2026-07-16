const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff';  // <-- замените на реальный токен из Strapi (Settings → API Tokens)

const engines = require('./new-engines.json');

async function importEngines() {
  for (const engine of engines) {
    // Находим семейство по slug (engine_family)
    const familySlug = engine.engine_family;
    const famRes = await fetch(`${API_URL}/engine-families?filters[slug][$eq]=${familySlug}`);
    const famData = await famRes.json();
    const family = famData.data?.[0];
    if (!family) {
      console.log(`❌ Семейство ${familySlug} не найдено, пропускаем ${engine.index}`);
      continue;
    }

    // Формируем тело запроса
    const body = {
      data: {
        index: engine.index,
        engine_family: family.documentId,
        fuel_type: engine.fuel_type,
        displacement: engine.displacement,
        bore_stroke: engine.bore_stroke || null,
        compression_ratio: engine.compression_ratio || null,
        power_hp: engine.power_hp,
        torque_nm: engine.torque_nm,
        max_rpm: engine.max_rpm || null,
        ecu: engine.ecu || null,
        injection: engine.injection || null,
        aspiration: engine.aspiration || null,
        valves_per_cylinder: engine.valves_per_cylinder || null,
        timing_drive: engine.timing_drive || null,
        vvt: engine.vvt || null,
        oil_type: engine.oil_type || null,
        oil_capacity: engine.oil_capacity || null,
        coolant_type: engine.coolant_type || null,
        coolant_capacity: engine.coolant_capacity || null,
      },
    };

    const res = await fetch(`${API_URL}/engines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      console.log(`✅ ${engine.index} добавлен`);
    } else {
      const err = await res.json();
      console.log(`❌ ${engine.index}: ${err.error?.message}`);
    }
  }
}

importEngines();