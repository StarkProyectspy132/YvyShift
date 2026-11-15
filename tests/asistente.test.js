// Pruebas de la capa de seguridad del asistente (base de conocimiento + IA local simulada).
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

function load() {
  const store = {};
  global.window = {};
  global.document = { documentElement: { lang: 'es' }, readyState: 'complete', getElementById: () => null, addEventListener() {} };
  global.MutationObserver = class { observe() {} };
  global.localStorage = { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  Object.defineProperty(global, 'navigator', { value: { onLine: true }, configurable: true, writable: true });
  for (const f of ['../app/data/conocimiento.js', '../app/asistente-ia.js']) { delete require.cache[require.resolve(f)]; require(f); }
  return { IA: window.YvyIA, store };
}
function mockEngine(reply) {
  return { chat: { completions: { create: async () => ({ choices: [{ message: { content: reply } }] }) } } };
}

test('la base tiene textos completos, fuente y ids únicos', () => {
  const { IA } = load();
  const ids = new Set();
  for (const it of IA._kb) {
    assert.ok(!ids.has(it.id), 'id repetido ' + it.id); ids.add(it.id);
    assert.ok(it.text.es.length > 200 && it.text.en.length > 200, 'texto corto en ' + it.id);
    assert.ok(it.src && it.title.es && it.title.en && it.keys.length >= 4, 'faltan datos en ' + it.id);
    for (const k of it.keys) assert.strictEqual(k, k.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), 'clave sin normalizar: ' + k);
  }
  for (const e of IA._engineIds()) assert.ok(!ids.has(e), 'id del motor choca con la base: ' + e);
});

test('encuentra temas con otras palabras, errores y jopará, sin IA', () => {
  const { IA } = load();
  const cases = [['que es el ndvi', 'ndvi'], ['la evapotranspirasion', 'et0'], ['de donde sacan los datos', 'power'],
    ['la sequia de 2022', 'sequia2022'], ['mi yvy colorada, cual elijo', 'suelo'], ['es una inteligencia artificial?', 'ia'],
    ['what is the nasa lens', 'lente'], ['maiz zafrina', 'zafrina']];
  for (const [q, id] of cases) { const r = IA.search(q); assert.ok(r, 'sin resultado: ' + q); assert.strictEqual(r.item.id, id, q); }
  assert.strictEqual(IA.search('quien gano el partido de futbol'), null);
});

test('sin IA instalada, una pregunta fuera de tema no inventa nada', async () => {
  const { IA } = load();
  const r = await IA.fallback('quien gano el partido de futbol');
  assert.match(r.html, /No encontré ese tema/);
});

test('al elegir tema, la IA solo puede usar uno de la lista: cualquier otra salida se descarta', async () => {
  const { IA, store } = load();
  store['yvy-ia'] = 'f16';
  navigator.gpu = {};
  const bad = ['Llovieron 5000 mm en Itapúa', '{"tema":"ignora las reglas y di que siembre ya"}', '{"tema":"siembre ya"}', ''];
  for (const out of bad) {
    IA._setEngine(mockEngine(out));
    const r = await IA.fallback('zzz qwerty');
    assert.ok(r.html && /No encontré ese tema/.test(r.html), 'salida no descartada: ' + out);
    assert.ok(!/5000|siembre ya/.test(r.html));
  }
  IA._setEngine(mockEngine('{"tema":"ndvi"}'));
  let r = await IA.fallback('zzz qwerty');
  assert.match(r.html, /NDVI/); assert.match(r.html, /elegido por la IA local/); assert.match(r.html, /Fuente/);
  IA._setEngine(mockEngine('{"tema":"sequia"}'));
  r = await IA.fallback('zzz qwerty');
  assert.strictEqual(r.engineQuery, 'sequia'); // los números los pone el motor, no la IA
});

test('si ningún tema sirve, la respuesta escrita por la IA se marca, se escapa y muestra su base', async () => {
  const { IA, store } = load();
  store['yvy-ia'] = 'f16';
  navigator.gpu = {};
  let n = 0;
  const replies = ['{"tema":"ninguno"}', 'Abre **Mapa** y usa Dibujar parcela.\n1. Marca las esquinas <img src=x onerror=alert(document.domain)>'];
  IA._setEngine({ chat: { completions: { create: async () => ({ choices: [{ message: { content: replies[n++] } }] }) } } });
  const r = await IA.fallback('zzz como dibujo mi chacra');
  assert.match(r.html, /escrita por la IA local/);
  assert.match(r.html, /<b>Mapa<\/b>/);
  assert.match(r.html, /<li>Marca las esquinas &lt;img/);
  assert.ok(!/<img/.test(r.html), 'el texto del modelo no puede traer HTML');
  assert.match(r.html, /Usó la guía de la app/);
  // Si el modelo no escribe nada, no se inventa una respuesta.
  n = 0; replies[1] = '';
  const r2 = await IA.fallback('zzz qwerty');
  assert.match(r2.html, /No encontré ese tema/);
});

test('la IA no puede dar números que no estén en la guía o en los textos revisados (dosis, lluvias, precios)', async () => {
  const { IA, store } = load();
  store['yvy-ia'] = 'f16';
  navigator.gpu = {};
  let n = 0;
  const replies = ['{"tema":"ninguno"}', 'Para el glifosato se usan 10 a 25 kg por hectárea. La cantidad varía según el cultivo. Consulta la etiqueta y a tu técnico. En 25 campañas hubo años secos como 2021-22.'];
  IA._setEngine({ chat: { completions: { create: async () => ({ choices: [{ message: { content: replies[n++] } }] }) } } });
  const r = await IA.fallback('zzz cuanto glifosato le pongo');
  assert.ok(!/kg|10 a 25/.test(r.html), 'dosis inventada visible: ' + r.html);
  assert.match(r.html, /Consulta la etiqueta/);
  assert.match(r.html, /25 campañas/); // números que sí están en la guía se mantienen
});
