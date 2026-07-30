const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // замените на реальный

const families = require('./families-new.json');
const engines = require('./engines-new.json');
const versions = require('./versions-new.json');

async function main() {
  // 1. Создаём/обновляем семейства
  const familyDocIds = {};
  for (const fam of families) {
    // Проверяем, существует ли семейство
    const res = await fetch(`${API_URL}/engine-families?filters[slug][$eq]=${fam.slug}`);
    const data = await res.json();
    const existing = data.data?.[0];
    const docId = existing?.documentId;

    // Английская локаль (дефолтная)
    const enBody = {
      data: {
        title: fam.title,
        slug: fam.slug,
        subtitle: fam.subtitle?.en || '',
        description: fam.description?.en || null,
        features: fam.features?.en || null,
        technical_update: fam.technical_update?.en || null,
        layout: fam.layout,
        fuel_type: fam.fuel_type,
        configuration: fam.configuration,
        cylinder_count: fam.cylinder_count,
        v_angle_deg: fam.v_angle_deg || null,
        aspiration: fam.aspiration,
        valvetrain: fam.valvetrain,
        timing_system: fam.timing_system,
        block_material: fam.block_material,
        head_material: fam.head_material,
        valves_per_cylinder: fam.valves_per_cylinder,
        production_start: fam.production_start,
        production_end: fam.production_end,
      },
    };

    let currentDocId;
    if (docId) {
      // обновляем существующее
      await fetch(`${API_URL}/engine-families/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(enBody),
      });
      currentDocId = docId;
    } else {
      // создаём новое
      const createRes = await fetch(`${API_URL}/engine-families`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
        body: JSON.stringify(enBody),
      });
      const createData = await createRes.json();
      currentDocId = createData.data?.documentId;
    }
    familyDocIds[fam.slug] = currentDocId;
    console.log(`✅ Семейство ${fam.title} (docId: ${currentDocId})`);

    // Русская локаль – всегда через PUT, Strapi создаст локаль, если её нет
    const ruBody = {
      data: {
        title: fam.title,
        slug: fam.slug,
        subtitle: fam.subtitle?.ru || '',
        description: fam.description?.ru || null,
        features: fam.features?.ru || null,
        technical_update: fam.technical_update?.ru || null,
        layout: fam.layout,
        fuel_type: fam.fuel_type,
        configuration: fam.configuration,
        cylinder_count: fam.cylinder_count,
        v_angle_deg: fam.v_angle_deg || null,
        aspiration: fam.aspiration,
        valvetrain: fam.valvetrain,
        timing_system: fam.timing_system,
        block_material: fam.block_material,
        head_material: fam.head_material,
        valves_per_cylinder: fam.valves_per_cylinder,
        production_start: fam.production_start,
        production_end: fam.production_end,
      },
    };
    const ruRes = await fetch(`${API_URL}/engine-families/${currentDocId}?locale=ru`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
      body: JSON.stringify(ruBody),
    });
    if (!ruRes.ok) {
      const errText = await ruRes.text();
      console.log(`⚠️ Ошибка русской локали для ${fam.slug}: ${errText}`);
    } else {
      console.log(`   Русская локаль обновлена`);
    }
  }

  // 2. Связи предшественник/преемник
  for (const fam of families) {
    if (fam.predecessor_slug || fam.successor_slug) {
      const update = {};
      if (fam.predecessor_slug && familyDocIds[fam.predecessor_slug]) {
        update.predecessor = familyDocIds[fam.predecessor_slug];
      }
      if (fam.successor_slug && familyDocIds[fam.successor_slug]) {
        update.successor = familyDocIds[fam.successor_slug];
      }
      if (Object.keys(update).length > 0) {
        await fetch(`${API_URL}/engine-families/${familyDocIds[fam.slug]}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
          body: JSON.stringify({ data: update }),
        });
      }
    }
  }

  // 3. Создаём двигатели
  const engineDocIds = {};
  for (const eng of engines) {
    const familyId = familyDocIds[eng.engine_family];
    if (!familyId) {
      console.log(`Семейство ${eng.engine_family} не найдено`);
      continue;
    }
    const body = {
      data: {
        title: eng.title,
        slug: eng.slug,
        engine_family: familyId,
        displacement_cc: eng.displacement_cc,
        bore_mm: eng.bore_mm,
        stroke_mm: eng.stroke_mm,
        firing_order: eng.firing_order,
        oil_capacity: eng.oil_capacity,
        coolant_capacity: eng.coolant_capacity,
        engine_mass_kg: eng.engine_mass_kg,
        production_start: eng.production_start,
        production_end: eng.production_end,
        oil_type: null,
        coolant_type: null,
      },
    };
    const res = await fetch(`${API_URL}/engines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (res.ok) {
      engineDocIds[eng.slug] = result.data.documentId;
      console.log(`✅ Двигатель ${eng.title}`);
    } else {
      console.log(`❌ Двигатель ${eng.title}: ${result.error?.message}`);
    }
  }

  // 4. Создаём версии
  for (const ver of versions) {
    const engineId = engineDocIds[ver.engine];
    if (!engineId) {
      console.log(`Двигатель ${ver.engine} не найден для версии ${ver.title}`);
      continue;
    }
    const body = {
      data: {
        code: ver.code,
        title: ver.title,
        engine: engineId,
        power_hp: ver.power_hp,
        power_kw: ver.power_kw,
        torque_nm: ver.torque_nm,
        power_rpm: ver.power_rpm,
        torque_rpm: ver.torque_rpm,
        compression_ratio: ver.compression_ratio,
        fuel_system: ver.fuel_system,
        ecu_code: ver.ecu_code,
        catalyst: ver.catalyst,
        dpf: ver.dpf,
        emissions_standard: ver.emissions_standard,
        fuel_grade: ver.fuel_grade,
        market: ver.market,
        production_start: ver.production_start,
        production_end: ver.production_end,
      },
    };
    const res = await fetch(`${API_URL}/engine-versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (res.ok) {
      console.log(`✅ Версия ${ver.title}`);
    } else {
      console.log(`❌ Версия ${ver.title}: ${result.error?.message}`);
    }
  }
}

main().catch(console.error);