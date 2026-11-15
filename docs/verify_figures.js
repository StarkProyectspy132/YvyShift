// Recomputes every number the report and the app quote from the stored NASA POWER cache and validation data.
// Run from the repository folder:  node docs/verify_figures.js "$(pwd)"
const fs = require('fs');
const root = process.argv[2] || '.';
const E = require(root + '/app/engine.js');
function load(file, key) { const w = {}; new Function('window', fs.readFileSync(root + '/app/data/' + file, 'utf8'))(w); return w[key]; }
const C = load('power_cache.js', 'POWER_CACHE'), V = load('validation.js', 'VALIDATION');
const agg = (k) => E.fromCompact(C.locations[k].dekads);
const f = (x, d = 2) => (typeof x === 'number' ? x.toFixed(d) : x);
const out = (label, value) => console.log(label.padEnd(62), value);

console.log('== Yield validation (FAO national soybean yield vs model water deficit) ==');
const five = ['altoparana', 'canindeyu', 'itapua', 'sanpedro', 'caaguazu'];
const yv = E.yieldValidation(five.map(agg), V.fao.yield_t_ha, 'arcilloso');
out('seasons (n)', yv.n);
out('r, deficit vs yield anomaly', yv.rDeficit);
out('r, heat days vs yield anomaly', yv.rHeat);
const no21 = yv.rows.filter((r) => r.ay !== 2021);
out('r without 2021-22 (anomalies from the full fit)', f(E.pearson(no21.map((r) => r.def), no21.map((r) => r.anom))));
const y2 = Object.assign({}, V.fao.yield_t_ha); delete y2[2022];
out('r without 2021-22 (trend refitted)', E.yieldValidation(five.map(agg), y2, 'arcilloso').rDeficit);
out('five worst real seasons', yv.worstYield.join(', '));
out('five driest seasons in the model', yv.worstModel.join(', '));
out('matches / chance probability', yv.hits + ' of 5 / ' + yv.pChance);
Object.keys(C.locations).forEach((k) => out('r per area: ' + k, E.yieldValidation([agg(k)], V.fao.yield_t_ha, 'arcilloso').rDeficit));

console.log('\n== FAO production and yield stored in app/data/validation.js ==');
out('production 2021, 2022 (t)', V.fao.production_t[2021] + ' -> ' + V.fao.production_t[2022]);
out('yield 2021, 2022 (t/ha)', V.fao.yield_t_ha[2021] + ' -> ' + V.fao.yield_t_ha[2022]);

console.log('\n== Itapua facts ==');
const A = agg('itapua'), ev = E.evaluateAllYears(E.ROTATIONS[0], A, 'arcilloso');
out('2021-22 rain in the soybean cycle (mm)', f(ev[2021].rainInSeason, 1));
out('2021-22 soybean water demand (mm)', f(ev[2021].cropWaterDemand, 1));
const yrs = [];
Object.keys(A).forEach((y) => { const d = A[y]; if (d.length === 36 && d.every((x) => x && x.complete)) yrs.push({ y: +y, p: d.reduce((s, x) => s + x.p, 0), et0: d.reduce((s, x) => s + x.et0, 0), heat: d.reduce((s, x) => s + x.heat, 0) }); });
const top = (k) => yrs.reduce((b, r) => (r[k] > b[k] ? r : b), yrs[0]);
out('highest annual ET0 (mm) and year', f(top('et0').et0, 1) + ' in ' + top('et0').y);
out('most days >= 35 C in an agricultural year, and year', top('heat').heat + ' in ' + top('heat').y);
out('annual rain range (mm)', f(Math.min(...yrs.map((r) => r.p)), 0) + ' to ' + f(Math.max(...yrs.map((r) => r.p)), 0));
out('annual ET0 range (mm)', f(Math.min(...yrs.map((r) => r.et0)), 0) + ' to ' + f(Math.max(...yrs.map((r) => r.et0)), 0));
const soy = Object.keys(ev).filter((y) => ev[y].complete).map((y) => [y, ev[y].rainInSeason]);
const rs = soy.map((x) => x[1]).sort((a, b) => a - b);
out('median soybean-cycle rain (mm)', f(rs[Math.floor(rs.length / 2)], 1));
out('wettest soybean cycle (year, mm)', soy.slice().sort((a, b) => b[1] - a[1])[0].map((x) => (typeof x === 'number' ? f(x, 1) : x)).join(', '));
out('POWER cell size, km (N-S x E-W)', E.powerCell(-27.08, -55.65).kmNS + ' x ' + E.powerCell(-27.08, -55.65).kmEW);

console.log('\n== ERA5 and MODIS ==');
['itapua', 'altoparana'].forEach((k) => {
  const e = E.evaluateAllYears(E.ROTATIONS[0], agg(k), 'arcilloso'), era = V.era5.soyRain_mm[k];
  const ys = Object.keys(era).filter((y) => e[y] && e[y].complete);
  out('ERA5 vs POWER rain, r (' + k + ', n=' + ys.length + ')', f(E.pearson(ys.map((y) => e[y].rainInSeason), ys.map((y) => era[y])), 3));
  out('2021-22 rain POWER / ERA5 (mm) ' + k, f(e[2021].rainInSeason, 0) + ' / ' + era[2021]);
  const nd = V.modis.ndvi[k], ns = Object.keys(nd).filter((y) => e[y] && e[y].complete);
  out('January NDVI vs deficit, r (' + k + ', n=' + ns.length + ')', f(E.pearson(ns.map((y) => nd[y]), ns.map((y) => e[y].waterDeficit)), 3));
  out('NDVI 2021-22 and 2023-24 (' + k + ')', nd[2021] + ' and ' + nd[2023]);
  out('five least green Januaries (' + k + ')', Object.entries(nd).sort((a, b) => a[1] - b[1]).slice(0, 5).map((x) => x[0]).join(', '));
});
const ps = yv.rows.filter((r) => V.modis.ndvi.itapua[r.ay] != null);
out('January NDVI (Itapua) vs yield anomaly, r (n=' + ps.length + ')', f(E.pearson(ps.map((r) => V.modis.ndvi.itapua[r.ay]), ps.map((r) => r.anom)), 3));

console.log('\n== NASA lens: seasons won by A (fallow) and D, per area ==');
const NASA_W = { waterDeficit: 3, heatDays: 2, frostDays: 2, coverPct: 0, grainHarvests: 0, cropFamilies: 0 };
const DEF_W = { waterDeficit: 3, heatDays: 2, frostDays: 2, coverPct: 3, grainHarvests: 2, cropFamilies: 2 };
Object.keys(C.locations).forEach((k) => {
  const n = E.seasonWins(agg(k), 'arcilloso', NASA_W).wins, d = E.seasonWins(agg(k), 'arcilloso', DEF_W).wins;
  out(k, 'NASA data only: A=' + n.A + ' | default weights: A=' + d.A + ', D=' + d.D);
});

console.log('\n== Driest soybean cycle per area ==');
Object.keys(C.locations).forEach((k) => {
  const e = E.evaluateAllYears(E.ROTATIONS[0], agg(k), 'arcilloso');
  const s = Object.keys(e).filter((y) => e[y].complete).map((y) => [y, e[y].rainInSeason]).sort((a, b) => a[1] - b[1])[0];
  out(k, s[0] + ' (' + f(s[1], 0) + ' mm)');
});
