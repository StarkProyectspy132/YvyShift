// Ejecutar: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const E = require('../app/engine.js');

function loadCache() {
  const src = fs.readFileSync(path.join(__dirname, '../app/data/power_cache.js'), 'utf8');
  const window = {};
  new Function('window', src)(window);
  return window.POWER_CACHE;
}

test('ET0 Hargreaves: valor conocido y entradas inválidas', () => {
  // Tmax 30, Tmin 18, Tmean 24, Ra 40 MJ/m²/día -> 0.0023*0.408*40*41.8*sqrt(12) = 5.43 mm/día
  assert.ok(Math.abs(E.et0Hargreaves(30, 18, 24, 40) - 5.434) < 0.01);
  assert.equal(E.et0Hargreaves(-999, 18, 24, 40), null);
  assert.equal(E.et0Hargreaves(30, 18, null, 40), null);
  assert.equal(E.et0Hargreaves(10, 12, 11, 40), 0); // Tmax < Tmin -> amplitud 0
});

test('Dekadas y año agrícola (inicio 1 de mayo)', () => {
  assert.equal(E.dekadOf(5, 1), 0);
  assert.equal(E.dekadOf(5, 31), 2);
  assert.equal(E.dekadOf(4, 30), 35);
  assert.equal(E.dekadOf(10, 11), 16);
  assert.equal(E.agYearOf(2022, 3), 2021);
  assert.equal(E.agYearOf(2021, 5), 2021);
});

test('Agregación diaria: suma lluvia, cuenta calor/helada, ignora -999', () => {
  const p = { T2M_MAX: {}, T2M_MIN: {}, T2M: {}, PRECTOTCORR: {}, TOA_SW_DWN: {}, GWETROOT: {} };
  ['20210501', '20210502', '20210503'].forEach((d, i) => {
    p.T2M_MAX[d] = [36, 20, 25][i]; p.T2M_MIN[d] = [20, 1, 10][i]; p.T2M[d] = [28, 10, 17][i];
    p.PRECTOTCORR[d] = [10, -999, 5][i]; p.TOA_SW_DWN[d] = 25; p.GWETROOT[d] = 0.5;
  });
  const a = E.aggregateDaily(p, { heat: 35, frost: 2 });
  const c = a['2021'][0];
  assert.equal(c.n, 3); assert.equal(c.p, 15); assert.equal(c.heat, 1); assert.equal(c.frost, 1);
  assert.equal(c.complete, false, 'un día sin lluvia => dekada incompleta');
  assert.deepEqual(E.fromCompact(E.toCompact(a))['2021'][0], c);
});

test('Curva Kc FAO-56: empieza en Kc ini, alcanza Kc mid, termina cerca de Kc end', () => {
  const k = E.kcCurve(E.CROPS.soja, 12);
  assert.equal(k.length, 12);
  assert.equal(k[0].kc, 0.4);
  assert.ok(k.some(s => s.kc === 1.15 && s.stage === 'media'));
  assert.ok(k[11].kc < 0.7 && k[11].stage === 'final');
});

test('Rotaciones predefinidas sin superposición y dentro del año', () => {
  E.ROTATIONS.forEach(r => assert.deepEqual(E.validateRotation(r), [], r.id));
  assert.ok(E.validateRotation({ crops: [{ crop: 'soja', start: 10, len: 12 }, { crop: 'trigo', start: 15, len: 5 }] }).length > 0);
});

test('Indicadores con clima sintético controlado (TEST, no datos reales)', () => {
  const dk = Array.from({ length: 36 }, () => ({ n: 10, p: 0, et0: 40, heat: 1, frost: 1, gwr: 0.5, complete: true }));
  const base = E.evaluateYear(E.ROTATIONS[0], dk);
  const cover = E.evaluateYear(E.ROTATIONS[2], dk);
  assert.equal(base.coverPct, Math.round(100 * 12 / 36));
  assert.ok(cover.coverPct > base.coverPct, 'cobertura invernal aumenta el % de suelo cubierto');
  assert.ok(cover.waterDeficit > base.waterDeficit, 'sin lluvia, más cultivo = más demanda');
  // 12 dekadas de soja: etapa inicial = 15 % = dekadas con t<=1.8 -> 2 dekadas, 1 helada cada una
  assert.equal(base.frostDays, 2, 'la soja cuenta helada solo en la etapa inicial (emergencia)');
  assert.ok(E.evaluateYear(E.ROTATIONS[1], dk).frostDays > 0, 'el trigo sí');
  dk[20].complete = false;
  assert.equal(E.evaluateYear(E.ROTATIONS[0], dk).complete, false);
});

test('Diversidad: cuenta familias de cultivos distintas, no cultivos', () => {
  const dk = Array.from({ length: 36 }, () => ({ n: 10, p: 50, et0: 40, heat: 0, frost: 0, gwr: 0.5, complete: true }));
  assert.equal(E.evaluateYear(E.ROTATIONS[0], dk).cropFamilies, 1, 'soja sola: una familia');
  assert.equal(E.evaluateYear(E.ROTATIONS[1], dk).cropFamilies, 2, 'trigo + soja: gramínea y leguminosa');
  const dosGramineas = { id: 'X', name: 'TEST', crops: [{ crop: 'avena', start: 0, len: 12 }, { crop: 'maiz', start: 25, len: 11 }] };
  assert.equal(E.evaluateYear(dosGramineas, dk).cropFamilies, 1, 'dos gramíneas son una sola familia');
  assert.ok(E.DIMENSIONS.some(d => d.key === 'cropFamilies' && d.better === 'higher'));
});

test('Control de coherencia con GWETROOT: correlación y casos sin datos', () => {
  assert.ok(Math.abs(E.pearson([1, 2, 3, 4], [2, 4, 6, 8]) - 1) < 1e-9);
  assert.ok(Math.abs(E.pearson([1, 2, 3, 4], [8, 6, 4, 2]) + 1) < 1e-9);
  assert.equal(E.pearson([1, 2], [1, 2]), null, 'menos de 3 pares no se informa');
  assert.equal(E.pearson([1, 1, 1], [1, 2, 3]), null, 'sin variación no hay correlación');
  const agg = E.fromCompact(loadCache().locations.itapua.dekads);
  assert.equal(E.soilCoherence(E.evaluateAllYears(E.ROTATIONS[0], agg, 'none'), agg, null), null, 'sin suelo no aplica');
  const c = E.soilCoherence(E.evaluateAllYears(E.ROTATIONS[0], agg, 'arcilloso'), agg, 160);
  assert.equal(c.n, 300, '25 campañas × 12 dekadas de soja (dato real)');
  assert.ok(c.r > 0 && c.r <= 1, 'el balance y GWETROOT se mueven en la misma dirección: r = ' + c.r);
  assert.equal(c.series['2021'].length, 12);
  assert.ok(c.series['2021'].every(p => p.model >= 0 && p.model <= 1 && p.gwr >= 0 && p.gwr <= 1));
});

test('Lluvia hipotética: escala solo la lluvia, no toca el original y menos lluvia nunca baja el déficit', () => {
  const agg = E.fromCompact(loadCache().locations.itapua.dekads);
  const before = agg['2021'][20].p;
  const dry = E.scaleRain(agg, 0.8), wet = E.scaleRain(agg, 1.2);
  assert.equal(agg['2021'][20].p, before, 'la serie original no se modifica');
  assert.equal(dry['2021'][20].et0, agg['2021'][20].et0);
  assert.equal(dry['2021'][20].heat, agg['2021'][20].heat);
  assert.ok(Math.abs(dry['2021'][20].p - before * 0.8) < 0.06);
  assert.deepEqual(E.scaleRain(agg, 1)['2010'].map(d => d.p), agg['2010'].map(d => d.p));
  const def = a => E.evaluateAllYears(E.ROTATIONS[0], a, 'arcilloso');
  const d0 = def(agg), d1 = def(dry), d2 = def(wet);
  Object.keys(d0).filter(y => d0[y].complete).forEach(y => {
    assert.ok(d1[y].waterDeficit >= d0[y].waterDeficit - 0.5, 'menos lluvia, no menos déficit: ' + y);
    assert.ok(d2[y].waterDeficit <= d0[y].waterDeficit + 0.5, 'más lluvia, no más déficit: ' + y);
  });
});

test('Celda POWER: contiene el punto, mide 0,5° × 0,625° y es regional', () => {
  for (const [lat, lon] of [[-27.08, -55.65], [-25.79, -55.09], [-19.3, -62.9], [-28, -54]]) {
    const c = E.powerCell(lat, lon);
    assert.ok(c.south <= lat && lat <= c.north && c.west <= lon && lon <= c.east, `la celda contiene ${lat}, ${lon}`);
    assert.ok(Math.abs((c.north - c.south) - 0.5) < 1e-6 && Math.abs((c.east - c.west) - 0.625) < 1e-6);
    assert.ok(c.kmNS > 50 && c.kmNS < 60 && c.kmEW > 55 && c.kmEW < 70, 'decenas de km, no una parcela');
  }
  assert.equal(E.powerCell(-27.08, -55.65).latC, -27);
  assert.equal(E.powerCell(-27.08, -55.65).lonC, -55.625);
});

test('Validación externa: el déficit del modelo explica la caída de rendimiento de la soja (FAO, dato real)', () => {
  const w = {};
  new Function('window', fs.readFileSync(path.join(__dirname, '..', 'app', 'data', 'validation.js'), 'utf8'))(w);
  const V = w.VALIDATION, cache = loadCache();
  const aggs = ['itapua', 'altoparana'].map(k => E.fromCompact(cache.locations[k].dekads));
  const v = E.yieldValidation(aggs, V.fao.yield_t_ha, 'arcilloso');
  assert.equal(v.n, 23);
  assert.ok(v.rDeficit < -0.6, 'más déficit, menos rendimiento: r = ' + v.rDeficit);
  assert.ok(v.hits >= 3 && v.pChance < 0.05, 'acierta los años malos más que el azar: ' + v.hits + ' de 5, p = ' + v.pChance);
  assert.equal(v.worstYield[0], 2021, 'la peor campaña FAO es 2021–22');
  assert.equal(v.worstModel[0], 2021, 'y también la peor del modelo');
  // Datos sintéticos: sin relación, no tiene que inventar una correlación fuerte.
  const flat = {}; Object.keys(V.fao.yield_t_ha).forEach((y, i) => { flat[y] = 2.5 + (i % 2 ? 0.1 : -0.1); });
  assert.ok(Math.abs(E.yieldValidation(aggs, flat, 'arcilloso').rDeficit) < 0.5, 'TEST: rendimiento sin señal');
});

test('Cultivos adicionales: válidos, con Kc de FAO-56 y evaluables con datos reales', () => {
  const extra = Object.keys(E.CROPS).filter(k => E.CROPS[k].generic);
  assert.deepEqual(extra.sort(), ['canola', 'girasol', 'poroto', 'sesamo', 'sorgo']);
  const agg = E.fromCompact(loadCache().locations.caaguazu.dekads);
  extra.forEach(k => {
    const c = E.CROPS[k];
    assert.ok(c.kc[1] >= 1 && c.kc[1] <= 1.2 && c.kc[2] <= 0.6 && c.len >= 10 && c.len <= 14, k);
    const rot = { id: 'E', name: 'TEST', crops: [{ crop: k, start: 16, len: c.len }] };
    assert.deepEqual(E.validateRotation(rot), []);
    Object.values(E.evaluateAllYears(rot, agg, 'franco')).filter(y => y.complete).forEach(y => assert.ok(Number.isFinite(y.waterDeficit)));
  });
  // Diversidad: canola (brasicácea) + soja (leguminosa) = 2 familias.
  const dk = Array.from({ length: 36 }, () => ({ n: 10, p: 50, et0: 40, heat: 0, frost: 0, gwr: 0.5, complete: true }));
  assert.equal(E.evaluateYear({ id: 'X', crops: [{ crop: 'canola', start: 0, len: 13 }, { crop: 'soja', start: 16, len: 12 }] }, dk).cropFamilies, 2);
});

test('La caché tiene 8 zonas completas de la Región Oriental', () => {
  const C = loadCache();
  assert.deepEqual(Object.keys(C.locations).sort(), ['altoparana', 'amambay', 'caaguazu', 'caazapa', 'canindeyu', 'itapua', 'misiones', 'sanpedro']);
  Object.values(C.locations).forEach(L => {
    const agg = E.fromCompact(L.dekads);
    assert.ok(Object.keys(agg).filter(y => agg[y].every(d => d.complete)).length >= 25, L.label);
    assert.ok(L.lat <= -22 && L.lat >= -28 && L.lon >= -59 && L.lon <= -54, 'dentro de la Región Oriental');
  });
});

test('Alcance mundial: el año agrícola del hemisferio norte empieza 6 meses después', () => {
  assert.deepEqual(E.hemisphereOf(-27), { hemi: 'S', startMonth: 5, tropical: false });
  assert.deepEqual(E.hemisphereOf(42), { hemi: 'N', startMonth: 11, tropical: false });
  assert.equal(E.hemisphereOf(-3).tropical, true);
  // La dekada 16 es mitad de primavera en los dos hemisferios: 11-oct en el sur, 11-abr en el norte.
  assert.equal(E.dekadOf(10, 11), 16);
  assert.equal(E.dekadOf(4, 11, 11), 16);
  assert.equal(E.dekadLabels(5)[16], 'Oct 11–20');
  assert.equal(E.dekadLabels(11)[16], 'Abr 11–20');
  assert.deepEqual(E.dekadLabels(5), E.DEKAD_LABELS, 'el hemisferio sur no cambia');
  assert.equal(E.agYearOf(2022, 4, 11), 2021, 'abril de 2022 pertenece a la campaña 2021–22 del norte');
  assert.equal(E.agYearOf(2021, 11, 11), 2021);
  // Mismo día a día, agregado con cada calendario (TEST: datos sintéticos).
  const P = { T2M_MAX: {}, T2M_MIN: {}, T2M: {}, PRECTOTCORR: {}, TOA_SW_DWN: {} };
  for (let d = new Date(Date.UTC(2020, 10, 1)); d < new Date(Date.UTC(2021, 10, 1)); d.setUTCDate(d.getUTCDate() + 1)) {
    const k = d.toISOString().slice(0, 10).replace(/-/g, ''), jul = d.getUTCMonth() === 6;
    P.T2M_MAX[k] = jul ? 36 : 20; P.T2M_MIN[k] = 10; P.T2M[k] = 15; P.PRECTOTCORR[k] = 1; P.TOA_SW_DWN[k] = 30;
  }
  const north = E.aggregateDaily(P, { heat: 35, frost: 2 }, { startMonth: 11 });
  assert.deepEqual(Object.keys(north), ['2020'], 'nov-2020 a oct-2021 es una sola campaña en el norte');
  assert.ok(north['2020'].every(d => d.complete));
  assert.equal(north['2020'].slice(24, 27).reduce((s, d) => s + d.heat, 0), 31, 'julio cae en las dekadas 24–26 del norte');
  assert.equal(Object.keys(E.aggregateDaily(P)).length, 2, 'con el calendario del sur, esos mismos días se parten en dos campañas');
  const c = E.confidence({ nYears: 25, source: 'live', soil: 'franco', lang: 'es', template: true, tropical: true });
  assert.ok(c.reasons.some(r => /plantilla/.test(r)) && c.reasons.some(r => /ecuador/.test(r)));
  assert.ok(!E.confidence({ nYears: 25, source: 'cache', soil: 'franco', lang: 'es' }).reasons.some(r => /plantilla/.test(r)));
});

test('Parcelas: área, centroide, punto dentro y cruce de lados', () => {
  // Cuadrado de 0,01° en el ecuador: 1111,95 m de lado ≈ 123,6 ha.
  const sq = [[0, 0], [0, 0.01], [0.01, 0.01], [0.01, 0]];
  assert.ok(Math.abs(E.polygonAreaHa(sq) - 123.64) < 0.5, 'área ' + E.polygonAreaHa(sq));
  // A 60° de latitud, el mismo cuadrado en grados mide la mitad de ancho.
  const hi = [[60, 0], [60, 0.01], [60.01, 0.01], [60.01, 0]];
  assert.ok(Math.abs(E.polygonAreaHa(hi) / E.polygonAreaHa(sq) - 0.5) < 0.01);
  assert.equal(E.polygonAreaHa(sq.slice().reverse()).toFixed(3), E.polygonAreaHa(sq).toFixed(3), 'no depende del sentido de giro');
  assert.equal(E.polygonAreaHa([[0, 0], [1, 1]]), 0);
  const c = E.polygonCentroid(sq);
  assert.ok(Math.abs(c[0] - 0.005) < 1e-9 && Math.abs(c[1] - 0.005) < 1e-9);
  assert.deepEqual(E.polygonBBox(sq), { s: 0, n: 0.01, w: 0, e: 0.01 });
  assert.equal(E.pointInPolygon(0.005, 0.005, sq), true);
  assert.equal(E.pointInPolygon(0.02, 0.005, sq), false);
  const L = [[0, 0], [0, 2], [1, 2], [1, 1], [2, 1], [2, 0]]; // forma de L
  assert.equal(E.pointInPolygon(1.5, 1.5, L), false, 'el hueco de la L queda fuera');
  assert.equal(E.pointInPolygon(1.5, 0.5, L), true);
  assert.equal(E.polygonSelfIntersects(sq), false);
  assert.equal(E.polygonSelfIntersects([[0, 0], [1, 1], [0, 1], [1, 0]]), true, 'un moño se cruza');
});

test('Verdor visible (GCC): promedia solo dentro de la parcela y descarta nubes y vacíos (TEST)', () => {
  const w = 4, h = 1, px = [[40, 120, 40], [120, 100, 60], [250, 250, 250], [0, 0, 0]]; // verde, suelo, nube, sin dato
  const data = new Uint8ClampedArray(px.flatMap(p => [...p, 255]));
  const all = E.greenStats(data, w, h, null);
  assert.deepEqual([all.pixels, all.valid, all.cloud, all.nodata, all.validPct], [4, 2, 1, 1, 50]);
  assert.ok(Math.abs(all.gcc - (120 / 200 + 100 / 280) / 2) < 1e-3);
  const only = E.greenStats(data, w, h, (x) => x === 0);
  assert.equal(only.pixels, 1); assert.equal(only.gcc, 0.6);
  assert.equal(E.greenStats(data, w, h, (x) => x >= 2).gcc, null, 'sin píxeles válidos no inventa un valor');
});

test('ENSO: fases por umbral y archivo ONI de NOAA completo para las campañas de la caché', () => {
  assert.equal(E.ensoPhase(0.5), 'nino');
  assert.equal(E.ensoPhase(-0.5), 'nina');
  assert.equal(E.ensoPhase(0.49), 'neutral');
  assert.equal(E.ensoPhase(undefined), null);
  const window = {};
  new Function('window', fs.readFileSync(path.join(__dirname, '..', 'app', 'data', 'enso_oni.js'), 'utf8'))(window);
  const O = window.ENSO_ONI;
  const agg = E.fromCompact(loadCache().locations.itapua.dekads);
  const full = Object.keys(agg).filter(y => agg[y].every(d => d.complete));
  full.forEach(y => assert.ok(Number.isFinite(O.ndj[y]), 'falta ONI NDJ de ' + y));
  assert.equal(E.ensoPhase(O.ndj[2021], O.threshold), 'nina', 'la sequía 2021–22 fue campaña La Niña (ONI NDJ −0,83)');
  assert.equal(E.ensoPhase(O.ndj[2015], O.threshold), 'nino');
});

test('Comparación: pesos cambian el orden y las contribuciones suman el puntaje', () => {
  const res = {
    A: { waterDeficit: 100, heatDays: 5, frostDays: 0, coverPct: 33, grainHarvests: 1, cropFamilies: 1 },
    C: { waterDeficit: 150, heatDays: 5, frostDays: 0, coverPct: 67, grainHarvests: 1, cropFamilies: 1 }
  };
  const w1 = { waterDeficit: 5, heatDays: 0, frostDays: 0, coverPct: 1, grainHarvests: 0 };
  const w2 = { waterDeficit: 1, heatDays: 0, frostDays: 0, coverPct: 5, grainHarvests: 0 };
  assert.equal(E.compare(res, w1)[0].id, 'A');
  assert.equal(E.compare(res, w2)[0].id, 'C');
  const top = E.compare(res, w2)[0];
  const sum = Object.values(top.contributions).reduce((s, c) => s + c.points, 0);
  assert.ok(Math.abs(sum - top.score) < 0.5);
  assert.deepEqual(E.explain(E.compare(res, w2)[0], E.compare(res, w2)[1]), ['Suelo cubierto con cultivo vivo']);
});

test('Escenarios: mediana, desfavorable (p80) y año concreto', () => {
  const by = {
    '2001': { complete: true, waterDeficit: 10, heatDays: 1, frostDays: 0, coverPct: 33, grainHarvests: 1, cropFamilies: 1 },
    '2002': { complete: true, waterDeficit: 20, heatDays: 2, frostDays: 0, coverPct: 33, grainHarvests: 1, cropFamilies: 1 },
    '2003': { complete: true, waterDeficit: 90, heatDays: 9, frostDays: 0, coverPct: 33, grainHarvests: 1, cropFamilies: 1 },
    '2004': { complete: false, waterDeficit: 999, heatDays: 99, frostDays: 0, coverPct: 33, grainHarvests: 1, cropFamilies: 1 }
  };
  assert.equal(E.scenarioValues(by, 'median').waterDeficit, 20);
  assert.ok(E.scenarioValues(by, 'p80').waterDeficit > 20);
  assert.equal(E.scenarioValues(by, 2003).heatDays, 9);
  assert.equal(E.scenarioValues(by, 2004), null, 'año incompleto no se usa');
});

test('Datos reales en caché (NASA POWER): estructura y plausibilidad', () => {
  const cache = loadCache();
  const loc = cache.locations.itapua;
  assert.equal(loc.units.PRECTOTCORR, 'mm/day');
  const agg = E.fromCompact(loc.dekads);
  const full = Object.keys(agg).filter(y => agg[y].every(d => d.complete));
  assert.ok(full.length >= 20, 'al menos 20 años agrícolas completos');
  full.forEach(y => {
    const P = agg[y].reduce((s, d) => s + d.p, 0), ET = agg[y].reduce((s, d) => s + d.et0, 0);
    assert.ok(P > 500 && P < 4000, `lluvia anual plausible ${y}: ${P}`);
    assert.ok(ET > 800 && ET < 2200, `ET0 anual plausible ${y}: ${ET}`);
  });
});

test('Año seco 2021-22 vs mediana en Itapúa: más déficit para la soja base (dato real)', () => {
  const agg = E.fromCompact(loadCache().locations.itapua.dekads);
  const by = E.evaluateAllYears(E.ROTATIONS[0], agg);
  const med = E.scenarioValues(by, 'median');
  assert.ok(by['2021'].waterDeficit > med.waterDeficit);
  assert.ok(by['2021'].heatDays > med.heatDays);
});

test('Balance con suelo: capacidad FAO-56 y agua que pasa de una dekada a otra (TEST)', () => {
  assert.equal(E.soilCapacityMm('arcilloso'), 160);
  assert.equal(E.soilCapacityMm('none'), null);
  // 36 dekadas: lluvia fuerte en mayo (llena el suelo), luego sin lluvia.
  const dk = Array.from({ length: 36 }, (_, k) => ({ n: 10, p: k === 0 ? 500 : 0, et0: 40, heat: 0, frost: 0, gwr: 0.5, complete: true }));
  const clim = E.evaluateYear(E.ROTATIONS[0], dk, null);
  const soil = E.evaluateYear(E.ROTATIONS[0], dk, 160, 0);
  assert.ok(soil.waterDeficit <= clim.waterDeficit, 'el suelo guarda agua y reduce el déficit');
  // Con cobertura invernal el suelo llega más seco a la soja: más déficit en la soja.
  const base = E.evaluateYear(E.ROTATIONS[0], dk, 160, 0).detail.filter(d => d.crop === 'soja');
  const cov = E.evaluateYear(E.ROTATIONS[2], dk, 160, 0).detail.filter(d => d.crop === 'soja');
  const sum = a => a.reduce((s, d) => s + d.deficit, 0);
  assert.ok(sum(cov) >= sum(base), 'la avena consume agua antes de la soja');
  dk.forEach(d => { d.p = 1000; });
  assert.equal(E.evaluateYear(E.ROTATIONS[1], dk, 160, 160).waterDeficit, 0, 'sin déficit si llueve mucho');
});

test('Serie continua con suelo usa datos reales y da valores finitos', () => {
  const agg = E.fromCompact(loadCache().locations.itapua.dekads);
  E.ROTATIONS.forEach(r => {
    const by = E.evaluateAllYears(r, agg, 'arcilloso');
    Object.values(by).filter(y => y.complete).forEach(y => {
      assert.ok(Number.isFinite(y.waterDeficit) && y.waterDeficit >= 0);
      assert.ok(y.soilEnd >= 0 && y.soilEnd <= 160);
    });
  });
});

test('Campaña por campaña: los conteos suman el total y dependen de los pesos (datos reales)', () => {
  const agg = E.fromCompact(loadCache().locations.itapua.dekads);
  const W = { waterDeficit: 3, heatDays: 2, frostDays: 2, coverPct: 3, grainHarvests: 2, cropFamilies: 2 };
  const sw = E.seasonWins(agg, 'arcilloso', W);
  assert.equal(sw.n, 25);
  assert.equal(Object.values(sw.wins).reduce((a, b) => a + b, 0), 25);
  assert.ok(Object.values(sw.beatsBaseline).every(n => n >= 0 && n <= 25));
  const onlyWater = E.seasonWins(agg, 'arcilloso', { waterDeficit: 5, heatDays: 0, frostDays: 0, coverPct: 0, grainHarvests: 0 });
  assert.notDeepEqual(onlyWater.wins, sw.wins);
});

test('Sensibilidad a la siembra: desplazar ±1 dekada mantiene rotaciones válidas', () => {
  for (const sh of [-1, 1]) {
    for (const r of E.ROTATIONS) {
      const s = E.shiftRotation(r, sh);
      assert.deepEqual(E.validateRotation(s), []);
      assert.equal(s.crops.length, r.crops.length);
    }
  }
  const d = E.shiftRotation(E.ROTATIONS[3], 1); // el maíz termina en la dekada 36: no se puede atrasar
  assert.ok(d.kept.indexOf('maiz') >= 0);
  assert.equal(E.shiftRotation(E.ROTATIONS[0], -1).crops[0].start, 15);
});
