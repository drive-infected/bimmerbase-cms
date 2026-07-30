const API_URL = 'https://bimmerbase-api.onrender.com/api';
const JWT = 'be2ae1e69c9f5f022ff20dea8a5578719075ac9eb12cf9fe13e4ffb22fe753ca1a646c13ead0a3294a56b6a91a9454bdff317c9fbaa3c2eb02c2eecc2f8fd31dc23ebdbaedbe3e5c8844cf23cb079ced5e70e6975311ef0e6e20ccffd698fff8910f8fdbef56660d7960272a3859f5027ebe24ab94cdff3e4b8b9f32fe6d23ff'; // замените на реальный

async function main() {
  // 1. M67 (documentId из вашей таблицы)
  const m67docId = 'ddmh3316oklu7hap5r07yf3z';

  // Обновляем английскую (дефолтную) локаль
  await fetch(`${API_URL}/engine-families/${m67docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
    body: JSON.stringify({
      data: {
        title: 'M67',
        slug: 'm67',
        subtitle: 'Turbocharged V8 Diesel engine by BMW, 1998–2008',
        description: [
          { type: 'paragraph', children: [ { text: 'The BMW M67 is a turbocharged V8 diesel engine produced from 1998 to 2008. It powered flagship models like the E38 740d, E65/E66 745d, and E53 X5. The engine had a cast iron 90° V8 block, aluminium DOHC heads, and timing chains. Displacement 3.9 or 4.4 litres, power up to 300 hp (M67D44), torque up to 700 Nm. It featured Bosch Common Rail injection (up to 1800 bar) and variable geometry turbochargers on later versions. The engine was noted for its massive torque, smoothness, and low noise. Weak points include piezo injectors (later versions), turbochargers, DPF, and occasional timing chain issues. With proper maintenance, the M67 can exceed 300,000 km without major overhaul.', type: 'text' } ] }
        ],
        features: [
          { type: 'paragraph', children: [ { text: '• Turbocharged V8: massive torque\n• Common Rail system (from 1998)\n• Timing chain\n• High smoothness and low noise levels', type: 'text' } ] }
        ],
        // технические поля
        layout: 'longitudinal',
        fuel_type: 'diesel',
        configuration: 'v',
        cylinder_count: 8,
        v_angle_deg: 90,
        aspiration: 'turbocharged',
        valvetrain: 'DOHC',
        timing_system: 'chain',
        block_material: 'cast_iron',
        head_material: 'aluminium',
        valves_per_cylinder: 4,
        production_start: '1998-01-01',
        production_end: '2008-12-31',
      },
    }),
  }).then(r => r.json()).then(console.log);

  // Русская локаль для M67
  await fetch(`${API_URL}/engine-families/${m67docId}?locale=ru`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
    body: JSON.stringify({
      data: {
        title: 'M67',
        slug: 'm67',
        subtitle: 'Турбированный V-образный 8-цилиндровый дизельный двигатель BMW 1998–2008 годов',
        description: [
          { type: 'paragraph', children: [ { text: 'BMW M67 — V-образный восьмицилиндровый дизельный двигатель с турбонаддувом, выпускавшийся с 1998 по 2008 год. Устанавливался на флагманские модели E38 740d, E65/E66 745d, а также E53 X5 3.0d (версии с M67). Двигатель имел чугунный блок с углом развала 90°, алюминиевые головки с двумя распредвалами в каждой (DOHC) и цепной привод ГРМ. Объём 3,9 или 4,4 литра, мощность до 300 л.с. (M67D44), крутящий момент до 700 Нм. Оснащался системой непосредственного впрыска Common Rail Bosch (давление до 1800 бар) и турбокомпрессорами с изменяемой геометрией (на поздних версиях). Двигатель отличался впечатляющей тягой, плавностью работы и низкой шумностью. Слабые места: пьезофорсунки (на поздних версиях), турбокомпрессоры, сажевый фильтр и иногда цепь ГРМ. При должном обслуживании M67 способен пройти более 300 000 км без капитального ремонта.', type: 'text' } ] }
        ],
        features: [
          { type: 'paragraph', children: [ { text: '• V8 с турбонаддувом: огромный крутящий момент\n• Система Common Rail (с 1998 года)\n• Цепной привод ГРМ\n• Высокая плавность работы и низкий уровень шума', type: 'text' } ] }
        ],
        layout: 'longitudinal',
        fuel_type: 'diesel',
        configuration: 'v',
        cylinder_count: 8,
        v_angle_deg: 90,
        aspiration: 'turbocharged',
        valvetrain: 'DOHC',
        timing_system: 'chain',
        block_material: 'cast_iron',
        head_material: 'aluminium',
        valves_per_cylinder: 4,
        production_start: '1998-01-01',
        production_end: '2008-12-31',
      },
    }),
  }).then(r => r.json()).then(console.log);

  // 2. M72 (documentId: xrtgl7ws4yvaju8i1wj4q4w1)
  const m72docId = 'xrtgl7ws4yvaju8i1wj4q4w1';

  await fetch(`${API_URL}/engine-families/${m72docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
    body: JSON.stringify({
      data: {
        title: 'M72',
        slug: 'm72',
        subtitle: 'Naturally aspirated V12 Petrol engine by BMW, 1989–1989',
        description: [
          { type: 'paragraph', children: [ { text: 'The BMW M72 is a very rare V12 petrol engine built in limited numbers in 1989 for the E31 850CSi prototype. It was essentially a transitional model between the M70 and S70. The engine had an aluminium block and heads, DOHC per bank, and a displacement of 5.4 litres, producing up to 360 hp. Only a few dozen units were made, making the M72 a collector\'s rarity. Reliability data is scarce due to low production numbers, but it is structurally close to the proven M70 and S70. The M72 was an important step in the development of high-performance V12s for BMW M.', type: 'text' } ] }
        ],
        features: [
          { type: 'paragraph', children: [ { text: '• Very rare engine, limited production\n• DOHC, 4 valves per cylinder\n• Increased 5.4 L displacement\n• Exclusive transitional model between M70 and S70', type: 'text' } ] }
        ],
        layout: 'longitudinal',
        fuel_type: 'petrol',
        configuration: 'v',
        cylinder_count: 12,
        v_angle_deg: 60,
        aspiration: 'naturally_aspirated',
        valvetrain: 'DOHC',
        timing_system: 'chain',
        block_material: 'aluminium',
        head_material: 'aluminium',
        valves_per_cylinder: 4,
        production_start: '1989-01-01',
        production_end: '1989-12-31',
      },
    }),
  }).then(r => r.json()).then(console.log);

  // Русская локаль для M72
  await fetch(`${API_URL}/engine-families/${m72docId}?locale=ru`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}` },
    body: JSON.stringify({
      data: {
        title: 'M72',
        slug: 'm72',
        subtitle: 'Атмосферный V-образный 12-цилиндровый бензиновый двигатель BMW 1989–1989 годов',
        description: [
          { type: 'paragraph', children: [ { text: 'BMW M72 — очень редкий V-образный 12-цилиндровый бензиновый двигатель, выпущенный ограниченной партией в 1989 году для прототипа E31 850CSi. По сути являлся переходной моделью между M70 и S70. Двигатель имел алюминиевый блок и головку, два верхних распредвала в каждой головке (DOHC) и увеличенный до 5,4 литра объём. Мощность достигала 360 л.с. Всего было произведено несколько десятков экземпляров, что делает M72 коллекционной редкостью. Информация о надёжности ограничена из-за малого тиража, но конструктивно двигатель близок к проверенным M70 и S70. М72 стал важным шагом в развитии высокофорсированных V12 для BMW M.', type: 'text' } ] }
        ],
        features: [
          { type: 'paragraph', children: [ { text: '• Очень редкий двигатель, ограниченный выпуск\n• DOHC, 4 клапана на цилиндр\n• Увеличенный до 5,4 л объём\n• Эксклюзивная переходная модель между M70 и S70', type: 'text' } ] }
        ],
        layout: 'longitudinal',
        fuel_type: 'petrol',
        configuration: 'v',
        cylinder_count: 12,
        v_angle_deg: 60,
        aspiration: 'naturally_aspirated',
        valvetrain: 'DOHC',
        timing_system: 'chain',
        block_material: 'aluminium',
        head_material: 'aluminium',
        valves_per_cylinder: 4,
        production_start: '1989-01-01',
        production_end: '1989-12-31',
      },
    }),
  }).then(r => r.json()).then(console.log);
}

main().catch(console.error);