const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff';

const families = require('./families.json');
const engines = require('./engines.json');
const versions = require('./versions.json');

async function deleteAll(collection) {
  let page = 1;
  while (true) {
    const res = await fetch(`${API_URL}/${collection}?pagination[pageSize]=100&pagination[page]=${page}`);
    const data = await res.json();
    if (!data.data || data.data.length === 0) break;
    for (const item of data.data) {
      await fetch(`${API_URL}/${collection}/${item.documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${JWT}` },
      });
    }
    if (data.data.length < 100) break;
    page++;
  }
}

async function main() {
  // 1. Удаляем все Engine и Engine Version (семейства не трогаем)
  console.log('Удаление старых двигателей и версий...');
  await deleteAll('engines');
  await deleteAll('engine-versions');

  // 2. Создаём/обновляем семейства
  console.log('Обработка семейств...');
  const familyDocIds = {};
  for (const fam of families) {
    const { data: existing } = await fetch(`${API_URL}/engine-families?filters[slug][$eq]=${fam.slug}`).then(r => r.json());
    const documentId = existing?.[0]?.documentId;

    const body = {
      data: {
        title: fam.title,
        slug: fam.slug,
        subtitle: fam.subtitle || '',
        fuel_type: fam.fuel_type,
        configuration: fam.configuration,
        cylinder_count: fam.cylinder_count,
        aspiration: fam.aspiration,
        valvetrain: fam.valvetrain,
        timing_system: fam.timing_system,
        block_material: fam.block_material,
        head_material: fam.head_material,
        valves_per_cylinder: fam.valves_per_cylinder,
        layout: fam.layout || 'longitudinal',
        v_angle_deg: fam.v_angle_deg || null,
        production_start: fam.production_start,
        production_end: fam.production_end,
        // не трогаем description, features, technical_update, image
      },
    };

    let res;
    if (documentId) {
      res = await fetch(`${API_URL}/engine-families/${documentId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${JWT}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`${API_URL}/engine-families`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${JWT}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    const result = await res.json();
    const newDocId = result.data?.documentId || documentId;
    familyDocIds[fam.slug] = newDocId;
    console.log(res.ok ? `✅ Family ${fam.title}` : `❌ Family ${fam.title}: ${result.error?.message}`);
  }

  // 3. Связи предшественник/преемник
  console.log('Обновление связей predecessor/successor...');
  for (const fam of families) {
    if (fam.predecessor_slug || fam.successor_slug) {
      const updateBody = { data: {} };
      if (fam.predecessor_slug && familyDocIds[fam.predecessor_slug]) {
        updateBody.data.predecessor = familyDocIds[fam.predecessor_slug];
      }
      if (fam.successor_slug && familyDocIds[fam.successor_slug]) {
        updateBody.data.successor = familyDocIds[fam.successor_slug];
      }
      if (Object.keys(updateBody.data).length > 0) {
        await fetch(`${API_URL}/engine-families/${familyDocIds[fam.slug]}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${JWT}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(updateBody),
        });
      }
    }
  }

  // 4. Создаём двигатели
  console.log('Создание двигателей...');
  const engineDocIds = {};
  for (const eng of engines) {
    const famDocId = familyDocIds[eng.engine_family];
    if (!famDocId) {
      console.log(`Семейство ${eng.engine_family} не найдено для ${eng.title}`);
      continue;
    }

    const body = {
      data: {
        title: eng.title,
        slug: eng.slug,
        engine_family: famDocId,
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
      headers: { Authorization: `Bearer ${JWT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (res.ok) {
      engineDocIds[eng.slug] = result.data.documentId;
      console.log(`✅ Engine ${eng.title}`);
    } else {
      console.log(`❌ Engine ${eng.title}: ${result.error?.message}`);
    }
  }

  // 5. Создаём версии двигателей
  console.log('Создание версий...');
  for (const ver of versions) {
    const engineDocId = engineDocIds[ver.engine];
    if (!engineDocId) {
      console.log(`Двигатель ${ver.engine} не найден для версии ${ver.title}`);
      continue;
    }

    const body = {
      data: {
        code: ver.code,
        title: ver.title,
        engine: engineDocId,
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
        // model_codes пока не заполняем
      },
    };

    const res = await fetch(`${API_URL}/engine-versions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${JWT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (res.ok) {
      console.log(`✅ Version ${ver.title}`);
    } else {
      console.log(`❌ Version ${ver.title}: ${result.error?.message}`);
    }
  }

  console.log('Импорт завершён!');
}

main().catch(console.error);