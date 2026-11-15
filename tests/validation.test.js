// Pruebas de la validación externa (FAO y satélite MODIS) y de la lente NASA (hallazgo N-1).
// Ejecutar: node --test tests/validation.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const E = require('../app/engine.js');

function load(file, key) {
  const src = fs.readFileSync(path.join(__dirname, '../app/data/', file), 'utf8');
  const window = {};
  new Function('window', src)(window);
  return window[key];
}
const C = load('power_cache.js', 'POWER_CACHE');
const V = load('validation.js', 'VALIDATION');
const NASA_W = { waterDeficit: 3, heatDays: 2, frostDays: 2, coverPct: 0, grainHarvests: 0, cropFamilies: 0 };
const DEF_W = { waterDeficit: 3, heatDays: 2, frostDays: 2, coverPct: 3, grainHarvests: 2, cropFamilies: 2 };

test('MODIS NDVI de enero: 25 campañas por zona, valores de NDVI plausibles', () => {
  for (const k of ['itapua', 'altoparana']) {
    const nd = V.modis.ndvi[k];
    assert.equal(Object.keys(nd).length, 25);
    for (const v of Object.values(nd)) assert.ok(v > 0.3 && v < 0.95, k + ' ' + v);
  }
});

test('MODIS NDVI coincide con el déficit del modelo (Itapúa r < −0,7; Alto Paraná r < −0,4)', () => {
  const r = {};
  for (const k of ['itapua', 'altoparana']) {
    const ev = E.evaluateAllYears(E.ROTATIONS[0], E.fromCompact(C.locations[k].dekads), 'arcilloso');
    const nd = V.modis.ndvi[k];
    const ys = Object.keys(nd).filter((y) => ev[y] && ev[y].complete);
    r[k] = E.pearson(ys.map((y) => nd[y]), ys.map((y) => ev[y].waterDeficit));
    // El enero menos verde es el de la sequía 2021–22 en las dos zonas.
    assert.equal(ys.slice().sort((a, b) => nd[a] - nd[b])[0], '2021');
  }
  assert.ok(r.itapua < -0.7, 'Itapúa ' + r.itapua);
  assert.ok(r.altoparana < -0.4, 'Alto Paraná ' + r.altoparana);
});

test('Lente NASA (N-1): con solo datos NASA la base gana 13 a 17 de 25; con pesos por defecto, 0', () => {
  for (const k of Object.keys(C.locations)) {
    const agg = E.fromCompact(C.locations[k].dekads);
    const n = E.seasonWins(agg, 'arcilloso', NASA_W).wins.A;
    const d = E.seasonWins(agg, 'arcilloso', DEF_W).wins.A;
    assert.ok(n >= 13 && n <= 17, k + ' solo NASA: ' + n);
    assert.equal(d, 0, k + ' por defecto: ' + d);
  }
});
