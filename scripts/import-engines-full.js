const axios = require('axios');
require('dotenv').config();

const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = 'b8a5881ac0f529c6a67d5b35de26d38ee812e99f905e662d79491b78d06bcde4dac44fc588538d8b3c30d670155f89ff6207f82d1b2ea674b8c101aac7fc95a95c52c38edca0e71e6e7f16d93628c2a95df733cc9180e96b85f77c4b42c3b33b3e75aeaeed3c15903a6e4190d11045e4a05063ffcde04d4029d48815a85a8ec7';

const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

async function createEntry(collection, data) {
  try {
    const res = await api.post(`/${collection}`, { data });
    return res.data.data;
  } catch (err) {
    console.error(`❌ ${collection} ${data.slug || data.code || data.title}:`);
    if (err.response) {
      console.error('  Status:', err.response.status);
      console.error('  Data:', JSON.stringify(err.response.data, null, 2).slice(0, 500));
    } else {
      console.error('  Error:', err.message);
    }
    return null;
  }
}

async function updateLocalization(collection, id, locale, data) {
  try {
    await api.put(`/${collection}/${id}?locale=${locale}`, { data });
    console.log(`🌐 ${locale} updated for ${collection} id=${id}`);
  } catch (err) {
    console.error(`❌ Failed to update ${locale} for ${collection} ${id}:`, err.response?.data?.error?.message);
  }
}

function featuresToRichText(featuresArray) {
  if (!featuresArray || !Array.isArray(featuresArray)) return null;
  return featuresArray.map(text => ({
    type: 'list-item',
    format: 'unordered',
    children: [{ type: 'text', text }]
  }));
}

function generateSubtitleEn(fam) {
  const startYear = new Date(fam.production_start).getFullYear();
  const endYear = fam.production_end ? new Date(fam.production_end).getFullYear() : 'present';
  const aspiration = fam.aspiration === 'naturally_aspirated' ? 'Naturally aspirated' :
                     fam.aspiration === 'turbocharged' ? 'Turbocharged' : 'Supercharged';
  const layout = fam.configuration === 'inline' ? 'inline' :
                 fam.configuration === 'v' ? 'V' : 'flat';
  const fuel = fam.fuel_type.charAt(0).toUpperCase() + fam.fuel_type.slice(1);
  return `${aspiration} ${layout}-${fam.cylinder_count} ${fuel} engine by BMW, ${startYear}–${endYear}`;
}

// ====== ДАННЫЕ ======
const families = [
  { slug: 'm10', title: 'M10', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 4, fuel_type: 'petrol', valvetrain: 'SOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 2, production_start: '1961-01-01', production_end: '1988-12-31', predecessor_slug: null, successor_slug: 'm40' },
  { slug: 'm40', title: 'M40', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 4, fuel_type: 'petrol', valvetrain: 'SOHC', timing_system: 'belt', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1987-01-01', production_end: '1994-12-31', predecessor_slug: 'm10', successor_slug: 'm43' },
  { slug: 'm42', title: 'M42', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 4, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1989-01-01', production_end: '1996-12-31', predecessor_slug: null, successor_slug: 'm44' },
  { slug: 'm43', title: 'M43', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 4, fuel_type: 'petrol', valvetrain: 'SOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1993-01-01', production_end: '2000-12-31', predecessor_slug: 'm40', successor_slug: 'n42' },
  { slug: 'm44', title: 'M44', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 4, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1996-01-01', production_end: '2001-12-31', predecessor_slug: 'm42', successor_slug: 'n42' },
  { slug: 'n42', title: 'N42', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 4, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '2001-01-01', production_end: '2006-12-31', predecessor_slug: 'm44', successor_slug: 'n46' },
  { slug: 'n46', title: 'N46', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 4, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '2004-01-01', production_end: '2012-12-31', predecessor_slug: 'n42', successor_slug: null },
  { slug: 'm20', title: 'M20', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 6, fuel_type: 'petrol', valvetrain: 'SOHC', timing_system: 'belt', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 2, production_start: '1977-01-01', production_end: '1993-12-31', predecessor_slug: null, successor_slug: 'm50' },
  { slug: 'm30', title: 'M30', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 6, fuel_type: 'petrol', valvetrain: 'SOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 2, production_start: '1968-01-01', production_end: '1994-12-31', predecessor_slug: null, successor_slug: null },
  { slug: 'm50', title: 'M50', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 6, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1989-01-01', production_end: '1998-12-31', predecessor_slug: 'm20', successor_slug: 'm52' },
  { slug: 'm52', title: 'M52', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 6, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1994-01-01', production_end: '2001-12-31', predecessor_slug: 'm50', successor_slug: 'm54' },
  { slug: 'm54', title: 'M54', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 6, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '2000-01-01', production_end: '2006-12-31', predecessor_slug: 'm52', successor_slug: 'n52' },
  { slug: 's38', title: 'S38', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 6, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1985-01-01', production_end: '1996-12-31', predecessor_slug: null, successor_slug: null },
  { slug: 's50', title: 'S50', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 6, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1995-01-01', production_end: '2000-12-31', predecessor_slug: null, successor_slug: 's54' },
  { slug: 's52', title: 'S52', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 6, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1996-01-01', production_end: '2000-12-31', predecessor_slug: null, successor_slug: null },
  { slug: 's54', title: 'S54', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'inline', cylinder_count: 6, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '2000-01-01', production_end: '2006-12-31', predecessor_slug: 's50', successor_slug: null },
  { slug: 'm60', title: 'M60', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'v', cylinder_count: 8, v_angle_deg: 90, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1992-01-01', production_end: '1996-12-31', predecessor_slug: null, successor_slug: 'm62' },
  { slug: 'm62', title: 'M62', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'v', cylinder_count: 8, v_angle_deg: 90, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1996-01-01', production_end: '2005-12-31', predecessor_slug: 'm60', successor_slug: 'n62' },
  { slug: 's62', title: 'S62', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'v', cylinder_count: 8, v_angle_deg: 90, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1998-01-01', production_end: '2003-12-31', predecessor_slug: null, successor_slug: null },
  { slug: 'm70', title: 'M70', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'v', cylinder_count: 12, v_angle_deg: 60, fuel_type: 'petrol', valvetrain: 'SOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 2, production_start: '1987-01-01', production_end: '1994-12-31', predecessor_slug: null, successor_slug: 'm73' },
  { slug: 'm73', title: 'M73', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'v', cylinder_count: 12, v_angle_deg: 60, fuel_type: 'petrol', valvetrain: 'SOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 2, production_start: '1994-01-01', production_end: '2002-12-31', predecessor_slug: 'm70', successor_slug: null },
  { slug: 's70', title: 'S70', subtitle: '', aspiration: 'naturally_aspirated', configuration: 'v', cylinder_count: 12, v_angle_deg: 60, fuel_type: 'petrol', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1993-01-01', production_end: '1996-12-31', predecessor_slug: null, successor_slug: null },
  { slug: 'm21', title: 'M21', subtitle: '', aspiration: 'turbocharged', configuration: 'inline', cylinder_count: 6, fuel_type: 'diesel', valvetrain: 'SOHC', timing_system: 'belt', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 2, production_start: '1983-01-01', production_end: '1991-12-31', predecessor_slug: null, successor_slug: 'm51' },
  { slug: 'm51', title: 'M51', subtitle: '', aspiration: 'turbocharged', configuration: 'inline', cylinder_count: 6, fuel_type: 'diesel', valvetrain: 'SOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 2, production_start: '1991-01-01', production_end: '2000-12-31', predecessor_slug: 'm21', successor_slug: 'm57' },
  { slug: 'm41', title: 'M41', subtitle: '', aspiration: 'turbocharged', configuration: 'inline', cylinder_count: 4, fuel_type: 'diesel', valvetrain: 'SOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 2, production_start: '1994-01-01', production_end: '2000-12-31', predecessor_slug: null, successor_slug: 'm47' },
  { slug: 'm47', title: 'M47', subtitle: '', aspiration: 'turbocharged', configuration: 'inline', cylinder_count: 4, fuel_type: 'diesel', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1999-01-01', production_end: '2007-12-31', predecessor_slug: 'm41', successor_slug: null },
  { slug: 'm57', title: 'M57', subtitle: '', aspiration: 'turbocharged', configuration: 'inline', cylinder_count: 6, fuel_type: 'diesel', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'cast_iron', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '1998-01-01', production_end: '2005-12-31', predecessor_slug: 'm51', successor_slug: 'n57' },
  { slug: 'n57', title: 'N57', subtitle: '', aspiration: 'turbocharged', configuration: 'inline', cylinder_count: 6, fuel_type: 'diesel', valvetrain: 'DOHC', timing_system: 'chain', block_material: 'aluminium', head_material: 'aluminium', valves_per_cylinder: 4, production_start: '2008-01-01', production_end: '2013-12-31', predecessor_slug: 'm57', successor_slug: null }
];

const engines = [
  { slug: 'm10b18', title: 'M10B18', engine_family: 'm10', displacement_cc: 1766, bore_mm: 89, stroke_mm: 71, firing_order: '1-3-4-2', oil_capacity: 4.0, coolant_capacity: 7.0, engine_mass_kg: 115, production_start: '1961-01-01', production_end: '1988-12-31' },
  { slug: 'm10b20', title: 'M10B20', engine_family: 'm10', displacement_cc: 1990, bore_mm: 89, stroke_mm: 80, firing_order: '1-3-4-2', oil_capacity: 4.0, coolant_capacity: 7.0, engine_mass_kg: 118, production_start: '1968-01-01', production_end: '1988-12-31' },
  { slug: 'm20b20', title: 'M20B20', engine_family: 'm20', displacement_cc: 1990, bore_mm: 80, stroke_mm: 66, firing_order: '1-5-3-6-2-4', oil_capacity: 5.75, coolant_capacity: 10.5, engine_mass_kg: 155, production_start: '1977-01-01', production_end: '1993-12-31' },
  { slug: 'm20b23', title: 'M20B23', engine_family: 'm20', displacement_cc: 2316, bore_mm: 80, stroke_mm: 76.8, firing_order: '1-5-3-6-2-4', oil_capacity: 5.75, coolant_capacity: 10.5, engine_mass_kg: 160, production_start: '1978-01-01', production_end: '1992-12-31' },
  { slug: 'm20b25', title: 'M20B25', engine_family: 'm20', displacement_cc: 2494, bore_mm: 84, stroke_mm: 75, firing_order: '1-5-3-6-2-4', oil_capacity: 5.75, coolant_capacity: 10.5, engine_mass_kg: 165, production_start: '1985-01-01', production_end: '1993-12-31' },
  { slug: 'm20b27', title: 'M20B27', engine_family: 'm20', displacement_cc: 2693, bore_mm: 84, stroke_mm: 81, firing_order: '1-5-3-6-2-4', oil_capacity: 5.75, coolant_capacity: 10.5, engine_mass_kg: 165, production_start: '1983-01-01', production_end: '1991-12-31' },
  { slug: 'm30b25', title: 'M30B25', engine_family: 'm30', displacement_cc: 2494, bore_mm: 86, stroke_mm: 71.6, firing_order: '1-5-3-6-2-4', oil_capacity: 5.8, coolant_capacity: 10.5, engine_mass_kg: 175, production_start: '1968-01-01', production_end: '1992-12-31' },
  { slug: 'm30b28', title: 'M30B28', engine_family: 'm30', displacement_cc: 2788, bore_mm: 86, stroke_mm: 80, firing_order: '1-5-3-6-2-4', oil_capacity: 5.8, coolant_capacity: 10.5, engine_mass_kg: 180, production_start: '1968-01-01', production_end: '1993-12-31' },
  { slug: 'm30b30', title: 'M30B30', engine_family: 'm30', displacement_cc: 2986, bore_mm: 89, stroke_mm: 80, firing_order: '1-5-3-6-2-4', oil_capacity: 5.8, coolant_capacity: 10.5, engine_mass_kg: 185, production_start: '1971-01-01', production_end: '1994-12-31' },
  { slug: 'm30b35', title: 'M30B35', engine_family: 'm30', displacement_cc: 3430, bore_mm: 92, stroke_mm: 86, firing_order: '1-5-3-6-2-4', oil_capacity: 5.8, coolant_capacity: 10.5, engine_mass_kg: 190, production_start: '1978-01-01', production_end: '1994-12-31' },
  { slug: 'm40b16', title: 'M40B16', engine_family: 'm40', displacement_cc: 1596, bore_mm: 84, stroke_mm: 72, firing_order: '1-3-4-2', oil_capacity: 4.0, coolant_capacity: 7.0, engine_mass_kg: 110, production_start: '1987-01-01', production_end: '1994-12-31' },
  { slug: 'm40b18', title: 'M40B18', engine_family: 'm40', displacement_cc: 1796, bore_mm: 84, stroke_mm: 81, firing_order: '1-3-4-2', oil_capacity: 4.0, coolant_capacity: 7.0, engine_mass_kg: 112, production_start: '1987-01-01', production_end: '1994-12-31' },
  { slug: 'm42b18', title: 'M42B18', engine_family: 'm42', displacement_cc: 1796, bore_mm: 84, stroke_mm: 81, firing_order: '1-3-4-2', oil_capacity: 5.0, coolant_capacity: 7.0, engine_mass_kg: 115, production_start: '1989-01-01', production_end: '1996-12-31' },
  { slug: 'm43b16', title: 'M43B16', engine_family: 'm43', displacement_cc: 1596, bore_mm: 84, stroke_mm: 72, firing_order: '1-3-4-2', oil_capacity: 4.0, coolant_capacity: 7.0, engine_mass_kg: 110, production_start: '1993-01-01', production_end: '2000-12-31' },
  { slug: 'm43b18', title: 'M43B18', engine_family: 'm43', displacement_cc: 1796, bore_mm: 84, stroke_mm: 81, firing_order: '1-3-4-2', oil_capacity: 4.0, coolant_capacity: 7.0, engine_mass_kg: 112, production_start: '1993-01-01', production_end: '2000-12-31' },
  { slug: 'm43b19', title: 'M43B19', engine_family: 'm43', displacement_cc: 1895, bore_mm: 85, stroke_mm: 83.5, firing_order: '1-3-4-2', oil_capacity: 4.0, coolant_capacity: 7.0, engine_mass_kg: 113, production_start: '1995-01-01', production_end: '2000-12-31' },
  { slug: 'm44b19', title: 'M44B19', engine_family: 'm44', displacement_cc: 1895, bore_mm: 85, stroke_mm: 83.5, firing_order: '1-3-4-2', oil_capacity: 5.0, coolant_capacity: 7.0, engine_mass_kg: 118, production_start: '1996-01-01', production_end: '2001-12-31' },
  { slug: 'n42b18', title: 'N42B18', engine_family: 'n42', displacement_cc: 1796, bore_mm: 84, stroke_mm: 81, firing_order: '1-3-4-2', oil_capacity: 4.25, coolant_capacity: 7.0, engine_mass_kg: 120, production_start: '2001-01-01', production_end: '2006-12-31' },
  { slug: 'n42b20', title: 'N42B20', engine_family: 'n42', displacement_cc: 1995, bore_mm: 84, stroke_mm: 90, firing_order: '1-3-4-2', oil_capacity: 4.25, coolant_capacity: 7.0, engine_mass_kg: 122, production_start: '2001-01-01', production_end: '2006-12-31' },
  { slug: 'n46b18', title: 'N46B18', engine_family: 'n46', displacement_cc: 1796, bore_mm: 84, stroke_mm: 81, firing_order: '1-3-4-2', oil_capacity: 4.25, coolant_capacity: 7.0, engine_mass_kg: 120, production_start: '2004-01-01', production_end: '2012-12-31' },
  { slug: 'n46b20', title: 'N46B20', engine_family: 'n46', displacement_cc: 1995, bore_mm: 84, stroke_mm: 90, firing_order: '1-3-4-2', oil_capacity: 4.25, coolant_capacity: 7.0, engine_mass_kg: 122, production_start: '2004-01-01', production_end: '2012-12-31' },
  { slug: 'm50b20', title: 'M50B20', engine_family: 'm50', displacement_cc: 1991, bore_mm: 80, stroke_mm: 66, firing_order: '1-5-3-6-2-4', oil_capacity: 5.75, coolant_capacity: 10.5, engine_mass_kg: 145, production_start: '1990-01-01', production_end: '1998-12-31' },
  { slug: 'm50b25', title: 'M50B25', engine_family: 'm50', displacement_cc: 2494, bore_mm: 84, stroke_mm: 75, firing_order: '1-5-3-6-2-4', oil_capacity: 5.75, coolant_capacity: 10.5, engine_mass_kg: 165, production_start: '1990-01-01', production_end: '1998-12-31' },
  { slug: 'm52b20', title: 'M52B20', engine_family: 'm52', displacement_cc: 1991, bore_mm: 80, stroke_mm: 66, firing_order: '1-5-3-6-2-4', oil_capacity: 6.5, coolant_capacity: 10.5, engine_mass_kg: 140, production_start: '1994-01-01', production_end: '2001-12-31' },
  { slug: 'm52b25', title: 'M52B25', engine_family: 'm52', displacement_cc: 2494, bore_mm: 84, stroke_mm: 75, firing_order: '1-5-3-6-2-4', oil_capacity: 6.5, coolant_capacity: 10.5, engine_mass_kg: 152, production_start: '1994-01-01', production_end: '2001-12-31' },
  { slug: 'm52b28', title: 'M52B28', engine_family: 'm52', displacement_cc: 2793, bore_mm: 84, stroke_mm: 84, firing_order: '1-5-3-6-2-4', oil_capacity: 6.5, coolant_capacity: 10.5, engine_mass_kg: 160, production_start: '1995-01-01', production_end: '2001-12-31' },
  { slug: 'm54b22', title: 'M54B22', engine_family: 'm54', displacement_cc: 2171, bore_mm: 80, stroke_mm: 72, firing_order: '1-5-3-6-2-4', oil_capacity: 6.5, coolant_capacity: 10.5, engine_mass_kg: 148, production_start: '2000-01-01', production_end: '2006-12-31' },
  { slug: 'm54b25', title: 'M54B25', engine_family: 'm54', displacement_cc: 2494, bore_mm: 84, stroke_mm: 75, firing_order: '1-5-3-6-2-4', oil_capacity: 6.5, coolant_capacity: 10.5, engine_mass_kg: 152, production_start: '2000-01-01', production_end: '2006-12-31' },
  { slug: 'm54b30', title: 'M54B30', engine_family: 'm54', displacement_cc: 2979, bore_mm: 84, stroke_mm: 89.6, firing_order: '1-5-3-6-2-4', oil_capacity: 6.5, coolant_capacity: 10.5, engine_mass_kg: 160, production_start: '2000-01-01', production_end: '2006-12-31' },
  { slug: 's38b36', title: 'S38B36', engine_family: 's38', displacement_cc: 3535, bore_mm: 93.4, stroke_mm: 86, firing_order: '1-5-3-6-2-4', oil_capacity: 6.0, coolant_capacity: 10.5, engine_mass_kg: 195, production_start: '1988-01-01', production_end: '1993-12-31' },
  { slug: 's38b38', title: 'S38B38', engine_family: 's38', displacement_cc: 3795, bore_mm: 94.6, stroke_mm: 90, firing_order: '1-5-3-6-2-4', oil_capacity: 6.0, coolant_capacity: 10.5, engine_mass_kg: 200, production_start: '1991-01-01', production_end: '1996-12-31' },
  { slug: 's50b30', title: 'S50B30', engine_family: 's50', displacement_cc: 2990, bore_mm: 86, stroke_mm: 85.8, firing_order: '1-5-3-6-2-4', oil_capacity: 6.0, coolant_capacity: 10.5, engine_mass_kg: 185, production_start: '1995-01-01', production_end: '1999-12-31' },
  { slug: 's50b32', title: 'S50B32', engine_family: 's50', displacement_cc: 3201, bore_mm: 86.4, stroke_mm: 91, firing_order: '1-5-3-6-2-4', oil_capacity: 6.0, coolant_capacity: 10.5, engine_mass_kg: 190, production_start: '1996-01-01', production_end: '2000-12-31' },
  { slug: 's52b32', title: 'S52B32', engine_family: 's52', displacement_cc: 3152, bore_mm: 86.4, stroke_mm: 89.6, firing_order: '1-5-3-6-2-4', oil_capacity: 6.5, coolant_capacity: 10.5, engine_mass_kg: 175, production_start: '1996-01-01', production_end: '2000-12-31' },
  { slug: 's54b32', title: 'S54B32', engine_family: 's54', displacement_cc: 3246, bore_mm: 87, stroke_mm: 91, firing_order: '1-5-3-6-2-4', oil_capacity: 6.0, coolant_capacity: 10.5, engine_mass_kg: 185, production_start: '2000-01-01', production_end: '2006-12-31' },
  { slug: 'm60b30', title: 'M60B30', engine_family: 'm60', displacement_cc: 2997, bore_mm: 84, stroke_mm: 67.6, firing_order: '1-5-4-8-6-3-7-2', oil_capacity: 7.5, coolant_capacity: 12.5, engine_mass_kg: 185, production_start: '1992-01-01', production_end: '1996-12-31' },
  { slug: 'm60b40', title: 'M60B40', engine_family: 'm60', displacement_cc: 3982, bore_mm: 89, stroke_mm: 80, firing_order: '1-5-4-8-6-3-7-2', oil_capacity: 7.5, coolant_capacity: 12.5, engine_mass_kg: 195, production_start: '1992-01-01', production_end: '1996-12-31' },
  { slug: 'm62b35', title: 'M62B35', engine_family: 'm62', displacement_cc: 3498, bore_mm: 84, stroke_mm: 78.9, firing_order: '1-5-4-8-6-3-7-2', oil_capacity: 7.5, coolant_capacity: 12.5, engine_mass_kg: 190, production_start: '1996-01-01', production_end: '2005-12-31' },
  { slug: 'm62b44', title: 'M62B44', engine_family: 'm62', displacement_cc: 4398, bore_mm: 92, stroke_mm: 82.7, firing_order: '1-5-4-8-6-3-7-2', oil_capacity: 7.5, coolant_capacity: 12.5, engine_mass_kg: 200, production_start: '1996-01-01', production_end: '2005-12-31' },
  { slug: 's62b50', title: 'S62B50', engine_family: 's62', displacement_cc: 4941, bore_mm: 94, stroke_mm: 89, firing_order: '1-5-4-8-6-3-7-2', oil_capacity: 7.0, coolant_capacity: 12.5, engine_mass_kg: 210, production_start: '1998-01-01', production_end: '2003-12-31' },
  { slug: 'm70b50', title: 'M70B50', engine_family: 'm70', displacement_cc: 4988, bore_mm: 84, stroke_mm: 75, firing_order: '1-7-5-11-3-9-6-12-2-8-4-10', oil_capacity: 8.5, coolant_capacity: 14.0, engine_mass_kg: 250, production_start: '1987-01-01', production_end: '1994-12-31' },
  { slug: 'm73b54', title: 'M73B54', engine_family: 'm73', displacement_cc: 5379, bore_mm: 85, stroke_mm: 79, firing_order: '1-7-5-11-3-9-6-12-2-8-4-10', oil_capacity: 8.5, coolant_capacity: 14.0, engine_mass_kg: 260, production_start: '1994-01-01', production_end: '2002-12-31' },
  { slug: 's70b56', title: 'S70B56', engine_family: 's70', displacement_cc: 5576, bore_mm: 86, stroke_mm: 80, firing_order: '1-7-5-11-3-9-6-12-2-8-4-10', oil_capacity: 8.5, coolant_capacity: 14.0, engine_mass_kg: 265, production_start: '1993-01-01', production_end: '1996-12-31' },
  { slug: 'm21d24', title: 'M21D24', engine_family: 'm21', displacement_cc: 2443, bore_mm: 80, stroke_mm: 81, firing_order: '1-5-3-6-2-4', oil_capacity: 5.75, coolant_capacity: 10.5, engine_mass_kg: 185, production_start: '1983-01-01', production_end: '1991-12-31' },
  { slug: 'm51d25', title: 'M51D25', engine_family: 'm51', displacement_cc: 2497, bore_mm: 80, stroke_mm: 82.8, firing_order: '1-5-3-6-2-4', oil_capacity: 6.5, coolant_capacity: 10.5, engine_mass_kg: 190, production_start: '1991-01-01', production_end: '2000-12-31' },
  { slug: 'm51d25tu', title: 'M51D25TU', engine_family: 'm51', displacement_cc: 2497, bore_mm: 80, stroke_mm: 82.8, firing_order: '1-5-3-6-2-4', oil_capacity: 6.5, coolant_capacity: 10.5, engine_mass_kg: 190, production_start: '1996-01-01', production_end: '2000-12-31' },
  { slug: 'm41d17', title: 'M41D17', engine_family: 'm41', displacement_cc: 1665, bore_mm: 80, stroke_mm: 82.8, firing_order: '1-3-4-2', oil_capacity: 5.0, coolant_capacity: 7.0, engine_mass_kg: 130, production_start: '1994-01-01', production_end: '2000-12-31' },
  { slug: 'm47d20', title: 'M47D20', engine_family: 'm47', displacement_cc: 1951, bore_mm: 84, stroke_mm: 88, firing_order: '1-3-4-2', oil_capacity: 5.5, coolant_capacity: 7.0, engine_mass_kg: 145, production_start: '1999-01-01', production_end: '2007-12-31' },
  { slug: 'm47d20tu', title: 'M47D20TU', engine_family: 'm47', displacement_cc: 1995, bore_mm: 84, stroke_mm: 90, firing_order: '1-3-4-2', oil_capacity: 5.5, coolant_capacity: 7.0, engine_mass_kg: 148, production_start: '2001-01-01', production_end: '2007-12-31' },
  { slug: 'm57d25', title: 'M57D25', engine_family: 'm57', displacement_cc: 2497, bore_mm: 80, stroke_mm: 82.8, firing_order: '1-5-3-6-2-4', oil_capacity: 7.0, coolant_capacity: 12.0, engine_mass_kg: 185, production_start: '1998-01-01', production_end: '2005-12-31' },
  { slug: 'm57d30', title: 'M57D30', engine_family: 'm57', displacement_cc: 2926, bore_mm: 84, stroke_mm: 88, firing_order: '1-5-3-6-2-4', oil_capacity: 7.0, coolant_capacity: 12.0, engine_mass_kg: 190, production_start: '1998-01-01', production_end: '2005-12-31' },
  { slug: 'm57d30tu', title: 'M57D30TU', engine_family: 'm57', displacement_cc: 2993, bore_mm: 84, stroke_mm: 90, firing_order: '1-5-3-6-2-4', oil_capacity: 7.0, coolant_capacity: 12.0, engine_mass_kg: 195, production_start: '2002-01-01', production_end: '2005-12-31' },
  { slug: 'n57d30', title: 'N57D30', engine_family: 'n57', displacement_cc: 2993, bore_mm: 84, stroke_mm: 90, firing_order: '1-5-3-6-2-4', oil_capacity: 7.2, coolant_capacity: 12.0, engine_mass_kg: 190, production_start: '2008-01-01', production_end: '2013-12-31' },
  { slug: 'n57d30tu', title: 'N57D30TU', engine_family: 'n57', displacement_cc: 2993, bore_mm: 84, stroke_mm: 90, firing_order: '1-5-3-6-2-4', oil_capacity: 7.2, coolant_capacity: 12.0, engine_mass_kg: 192, production_start: '2010-01-01', production_end: '2013-12-31' }
];

const versions = require('./versions.json');
const familyContent = require('./family-content.json');

async function importAll() {
  const familyIdBySlug = {};

  for (const fam of families) {
    const { predecessor_slug, successor_slug, ...data } = fam;
    data.subtitle = generateSubtitleEn(fam);
    const created = await createEntry('engine-families', data);
    if (created) {
      familyIdBySlug[fam.slug] = created.id;
      const content = familyContent.find(c => c.slug === fam.slug);
      if (content) {
        await updateLocalization('engine-families', created.id, 'en', {
          description: content.description_en,
          features: featuresToRichText(content.features_en),
          technical_update: content.technical_update_en
        });
        await updateLocalization('engine-families', created.id, 'ru', {
          subtitle: content.subtitle_ru,
          description: content.description_ru,
          features: featuresToRichText(content.features_ru),
          technical_update: content.technical_update_ru
        });
      }
    }
  }

  const engineIdBySlug = {};
  for (const eng of engines) {
    const familyId = familyIdBySlug[eng.engine_family];
    if (!familyId) {
      console.error(`❌ Family not found for engine ${eng.slug}`);
      continue;
    }
    const { engine_family, ...rest } = eng;
    const created = await createEntry('engines', { ...rest, engine_family: familyId });
    if (created) engineIdBySlug[eng.slug] = created.id;
  }

  for (const ver of versions) {
    const engineId = engineIdBySlug[ver.engine];
    if (!engineId) {
      console.error(`❌ Engine not found for version ${ver.code}`);
      continue;
    }
    const { engine, ...rest } = ver;
    await createEntry('engine-versions', { ...rest, engine: engineId });
  }

  console.log('🎉 Import finished!');
}

importAll().catch(err => {
  console.error('🔥 Fatal error:', err);
  process.exit(1);
});