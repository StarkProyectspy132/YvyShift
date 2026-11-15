/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). La app no usa IA en ejecución. */
/*
 * Motor de comparación de rotaciones — Field Shift (NASA Space Apps 2026)
 * Transparente y testeable. Sin dependencias. Funciona en navegador y Node.
 *
 * Datos: NASA POWER (LaRC), API diaria por punto, comunidad AG.
 *   T2M_MAX, T2M_MIN, T2M (°C), PRECTOTCORR (mm/día), TOA_SW_DWN (MJ/m²/día),
 *   GWETROOT (0–1, humedad relativa de zona radicular, modelo MERRA-2 / GMAO).
 * ET0: Hargreaves-Samani (FAO-56, ecuación 52) con Ra = TOA_SW_DWN de POWER.
 * Kc: FAO-56 (Allen et al., 1998), Tabla 12. Etapas: fracciones fijas (supuesto).
 * Calendarios de cultivo: SUPUESTOS PENDIENTES DE VALIDACIÓN LOCAL (ver docs/).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var POWER_FILL = -999;
  // Año agrícola: dekada 0 = 1–10 de mayo ... dekada 35 = 21–30 de abril.
  var AG_YEAR_START_MONTH = 5;
  // Alcance mundial: el año agrícola empieza en mayo en el hemisferio sur y en noviembre en el norte (6 meses después).
  // Así la dekada 16 es siempre "mitad de primavera" (11-oct en el sur, 11-abr en el norte) y los calendarios,
  // que se expresan en dekadas desde el inicio del año agrícola, se trasladan solos de un hemisferio al otro.
  var MONTH_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  function dekadLabels(startMonth) {
    var sm = startMonth || AG_YEAR_START_MONTH, out = [];
    for (var i = 0; i < 12; i++) for (var d = 0; d < 3; d++) out.push(MONTH_ABBR[(sm - 1 + i) % 12] + ' ' + ['1–10', '11–20', '21–fin'][d]);
    return out;
  }
  var DEKAD_LABELS = dekadLabels(AG_YEAR_START_MONTH);
  // Hemisferio y mes de inicio del año agrícola de un punto. Entre 10°S y 10°N las estaciones dependen
  // de las lluvias más que del calendario: se marca como tropical para avisarlo en la interfaz.
  function hemisphereOf(lat) {
    var north = lat >= 0;
    return { hemi: north ? 'N' : 'S', startMonth: north ? 11 : 5, tropical: Math.abs(lat) < 10 };
  }

  // ---------- 1. ET0 Hargreaves-Samani (FAO-56 ec. 52) ----------
  // ra_mj: radiación extraterrestre (MJ/m²/día). 0.408 convierte a mm/día equivalentes.
  function et0Hargreaves(tmax, tmin, tmean, ra_mj) {
    if ([tmax, tmin, tmean, ra_mj].some(function (v) { return v == null || v === POWER_FILL || isNaN(v); })) return null;
    var dt = Math.max(tmax - tmin, 0);
    var v = 0.0023 * 0.408 * ra_mj * (tmean + 17.8) * Math.sqrt(dt);
    return Math.max(v, 0);
  }

  // ---------- 2. Agregación diaria POWER -> dekadas por año agrícola ----------
  function dekadOf(month, day, startMonth) {
    var mi = (month - (startMonth || AG_YEAR_START_MONTH) + 12) % 12;
    var d = day <= 10 ? 0 : day <= 20 ? 1 : 2;
    return mi * 3 + d;
  }
  function agYearOf(year, month, startMonth) { return month >= (startMonth || AG_YEAR_START_MONTH) ? year : year - 1; }

  // params: objeto "properties.parameter" de la respuesta JSON de POWER.
  // thresholds: { heat: °C, frost: °C }. opts.startMonth: mes de inicio del año agrícola (5 sur, 11 norte).
  function aggregateDaily(params, thresholds, opts) {
    var th = thresholds || { heat: 35, frost: 2 };
    var sm = (opts && opts.startMonth) || AG_YEAR_START_MONTH;
    var dates = Object.keys(params.T2M_MAX).sort();
    var years = {};
    dates.forEach(function (ds) {
      var y = +ds.slice(0, 4), m = +ds.slice(4, 6), d = +ds.slice(6, 8);
      var ay = agYearOf(y, m, sm), k = dekadOf(m, d, sm);
      if (!years[ay]) {
        years[ay] = [];
        for (var i = 0; i < 36; i++) years[ay].push({ n: 0, nP: 0, nE: 0, nG: 0, p: 0, et0: 0, heat: 0, frost: 0, gwr: 0 });
      }
      var c = years[ay][k];
      c.n++;
      var p = params.PRECTOTCORR[ds], tx = params.T2M_MAX[ds], tn = params.T2M_MIN[ds], tm = params.T2M[ds];
      var ra = params.TOA_SW_DWN ? params.TOA_SW_DWN[ds] : null;
      var g = params.GWETROOT ? params.GWETROOT[ds] : null;
      if (p != null && p !== POWER_FILL) { c.p += p; c.nP++; }
      var e = et0Hargreaves(tx, tn, tm, ra);
      if (e != null) { c.et0 += e; c.nE++; }
      if (tx != null && tx !== POWER_FILL && tx >= th.heat) c.heat++;
      if (tn != null && tn !== POWER_FILL && tn <= th.frost) c.frost++;
      if (g != null && g !== POWER_FILL) { c.gwr += g; c.nG++; }
    });
    var out = {};
    Object.keys(years).forEach(function (ay) {
      out[ay] = years[ay].map(function (c) {
        return {
          n: c.n,
          p: round(c.p, 1),
          et0: round(c.et0, 1),
          heat: c.heat,
          frost: c.frost,
          gwr: c.nG ? round(c.gwr / c.nG, 3) : null,
          complete: c.n > 0 && c.nP === c.n && c.nE === c.n
        };
      });
    });
    return out;
  }

  // Formato compacto de la caché: [n, p, et0, heat, frost, gwr, complete(0/1)]
  function toCompact(agg) {
    var out = {};
    Object.keys(agg).forEach(function (ay) {
      out[ay] = agg[ay].map(function (c) { return [c.n, c.p, c.et0, c.heat, c.frost, c.gwr, c.complete ? 1 : 0]; });
    });
    return out;
  }
  function fromCompact(comp) {
    var out = {};
    Object.keys(comp).forEach(function (ay) {
      out[ay] = comp[ay].map(function (a) { return { n: a[0], p: a[1], et0: a[2], heat: a[3], frost: a[4], gwr: a[5], complete: a[6] === 1 }; });
    });
    return out;
  }

  // ---------- 3. Cultivos (Kc FAO-56 Tabla 12) ----------
  var CROPS = {
    // frostStages: la soja cuenta helada en la etapa inicial (emergencia/plántula). SUPUESTO a validar:
    // sin esto, adelantar la siembra a septiembre no tendría ningún costo en el modelo.
    soja: { name: 'Soja', kc: [0.4, 1.15, 0.5], grain: true, sensitive: 'heat+frost', frostStages: ['inicial'], family: 'leguminosa',
      ref: 'FAO-56 Tabla 12 (soybeans)' },
    maiz: { name: 'Maíz zafriña', kc: [0.3, 1.2, 0.6], grain: true, sensitive: 'heat+frost', family: 'gramínea',
      ref: 'FAO-56 Tabla 12 (maize, grain)' },
    trigo: { name: 'Trigo', kc: [0.3, 1.15, 0.4], grain: true, sensitive: 'frost', family: 'gramínea',
      ref: 'FAO-56 Tabla 12 (wheat, spring; Kc end 0.4 cosecha a mano/alta humedad, 0.25 seco)' },
    avena: { name: 'Avena negra (cobertura)', kc: [0.3, 1.15, 0.25], grain: false, sensitive: 'none', family: 'gramínea',
      ref: 'FAO-56 Tabla 12 (oats) — usado como aproximación para avena negra' },
    // Cultivos adicionales para "Arma tu propia rotación". generic: true = sin calendario local ni validación;
    // Kc mid y end verificados en FAO-56 Tabla 12 (14-nov-2026); cuando la tabla da un rango se usa el punto medio.
    // Kc ini por grupo de cultivo (oleaginosas 0,35; cereales 0,3; leguminosas 0,4): SUPUESTO, en la web de FAO es una imagen.
    // len: dekadas, de la duración total de FAO-56 Tabla 11 (regiones no sudamericanas).
    girasol: { name: 'Girasol', kc: [0.35, 1.075, 0.35], grain: true, sensitive: 'heat', family: 'asterácea', len: 13, generic: true,
      ref: 'FAO-56 Tabla 12 (sunflower: Kc mid 1,0–1,15, Kc end 0,35); Tabla 11: 130 días (Mediterráneo, California)' },
    canola: { name: 'Canola', kc: [0.35, 1.075, 0.35], grain: true, sensitive: 'frost', family: 'brasicácea', len: 13, generic: true,
      ref: 'FAO-56 Tabla 12 (rapeseed, canola: Kc mid 1,0–1,15, Kc end 0,35); sin fila en Tabla 11: 130 días SUPUESTO' },
    sorgo: { name: 'Sorgo granífero', kc: [0.3, 1.05, 0.55], grain: true, sensitive: 'heat', family: 'gramínea', len: 13, generic: true,
      ref: 'FAO-56 Tabla 12 (sorghum grain: Kc mid 1,00–1,10, Kc end 0,55); Tabla 11: 20-35-40-30 días' },
    sesamo: { name: 'Sésamo', kc: [0.35, 1.10, 0.25], grain: true, sensitive: 'heat', family: 'pedaliácea', len: 11, generic: true,
      ref: 'FAO-56 Tabla 12 (sesame: Kc mid 1,10, Kc end 0,25); Tabla 11: 20-30-40-20 días (China)' },
    poroto: { name: 'Poroto', kc: [0.4, 1.15, 0.35], grain: true, sensitive: 'heat', family: 'leguminosa', len: 11, generic: true,
      ref: 'FAO-56 Tabla 12 (beans, dry: 0,4 / 1,15 / 0,35); Tabla 11: 110 días (climas continentales)' }
  };
  // Fracciones de etapa (inicial, desarrollo, media, final) — SUPUESTO simplificado.
  // FAO-56 Tabla 11 da duraciones por región; aquí se usa una proporción genérica.
  var STAGE_FRACTIONS = [0.15, 0.25, 0.40, 0.20];

  // Kc de cada dekada de un cultivo con FAO-56 (curva lineal en desarrollo y final).
  function kcCurve(crop, length) {
    var kc = crop.kc, f = STAGE_FRACTIONS;
    var b1 = f[0] * length, b2 = b1 + f[1] * length, b3 = b2 + f[2] * length;
    var out = [];
    for (var i = 0; i < length; i++) {
      var t = i + 0.5, v, stage;
      if (t <= b1) { v = kc[0]; stage = 'inicial'; }
      else if (t <= b2) { v = kc[0] + (kc[1] - kc[0]) * (t - b1) / (b2 - b1); stage = 'desarrollo'; }
      else if (t <= b3) { v = kc[1]; stage = 'media'; }
      else { v = kc[1] + (kc[2] - kc[1]) * (t - b3) / (length - b3); stage = 'final'; }
      out.push({ kc: round(v, 3), stage: stage });
    }
    return out;
  }

  // ---------- 4. Rotaciones (calendarios = SUPUESTOS a validar) ----------
  // start: dekada del año agrícola (0 = 1 de mayo). len: dekadas.
  var ROTATIONS = [
    { id: 'A', name: 'Base: Soja + barbecho invernal', baseline: true,
      crops: [{ crop: 'soja', start: 16, len: 12 }] },
    { id: 'B', name: 'Soja + Trigo', crops: [{ crop: 'trigo', start: 2, len: 14 }, { crop: 'soja', start: 16, len: 12 }] },
    { id: 'C', name: 'Soja + Avena negra (cultivo de cobertura)', crops: [{ crop: 'avena', start: 0, len: 12 }, { crop: 'soja', start: 16, len: 12 }] },
    { id: 'D', name: 'Soja temprana + Maíz zafriña', crops: [{ crop: 'soja', start: 13, len: 12 }, { crop: 'maiz', start: 25, len: 11 }] }
  ];

  // labels: nombres de las dekadas del hemisferio del punto (opcional; por defecto, hemisferio sur).
  function validateRotation(rot, labels) {
    var used = {};
    var errors = [];
    var LB = labels || DEKAD_LABELS;
    rot.crops.forEach(function (c) {
      if (!CROPS[c.crop]) errors.push('Cultivo desconocido: ' + c.crop);
      if (c.start < 0 || c.len < 1 || c.start + c.len > 36) errors.push(c.crop + ': calendario fuera del año agrícola');
      for (var k = c.start; k < c.start + c.len; k++) {
        if (used[k]) errors.push('Superposición de cultivos en ' + LB[k]);
        used[k] = true;
      }
    });
    return errors;
  }

  // ---------- 5. Indicadores por rotación y año agrícola ----------
  // ---------- 5b. Suelos (FAO-56 Tabla 19: agua disponible total, punto medio del rango) ----------
  // cad = (θFC − θWP) × profundidad radicular. Profundidad 1,0 m para todos los cultivos: SUPUESTO.
  var ROOT_DEPTH_M = 1.0;
  var SOILS = {
    none:   { name: 'Sin suelo (déficit climático)', taw: null },
    arenoso:{ name: 'Arenoso', taw: 0.08, ref: 'FAO-56 Tabla 19, sand: θFC−θWP 0,05–0,11' },
    franco: { name: 'Franco', taw: 0.155, ref: 'FAO-56 Tabla 19, loam: θFC−θWP 0,13–0,18' },
    arcilloso: { name: 'Arcilloso', taw: 0.16, ref: 'FAO-56 Tabla 19, clay: θFC−θWP 0,12–0,20' }
  };
  function soilCapacityMm(soilId) {
    var s = SOILS[soilId] || SOILS.none;
    return s.taw == null ? null : round(1000 * s.taw * ROOT_DEPTH_M, 0);
  }
  // Kc del barbecho (suelo sin cultivo, con rastrojo de siembra directa): SUPUESTO a validar.
  var KC_FALLOW = 0.3;

  // Mapa dekada -> {crop, kc, stage} para una rotación.
  function rotationMap(rot) {
    var map = [];
    rot.crops.forEach(function (c) {
      kcCurve(CROPS[c.crop], c.len).forEach(function (s, i) { map[c.start + i] = { crop: c.crop, kc: s.kc, stage: s.stage }; });
    });
    return map;
  }

  // ---------- 5. Indicadores por rotación y año agrícola ----------
  // cad: capacidad de agua del suelo (mm) o null para déficit climático. s0: agua inicial (mm).
  function evaluateYear(rot, dekads, cad, s0) {
    var deficit = 0, cropWater = 0, rain = 0, heatDays = 0, frostDays = 0, cover = 0, complete = true;
    var grain = rot.crops.filter(function (c) { return CROPS[c.crop].grain; }).length;
    // Diversidad: familias botánicas distintas en la rotación (leguminosa, gramínea). Sale del calendario, no del clima.
    var fams = {};
    rot.crops.forEach(function (c) { fams[CROPS[c.crop].family] = true; });
    var families = Object.keys(fams).length;
    var useSoil = cad != null;
    var S = useSoil ? (s0 == null ? cad : s0) : null;
    var map = rotationMap(rot), detail = [];
    for (var k = 0; k < 36; k++) {
      var dk = dekads[k], m = map[k];
      if (!dk || !dk.complete) { if (m) complete = false; continue; }
      var kc = m ? m.kc : (useSoil ? KC_FALLOW : 0);
      var etc = kc * dk.et0, def;
      if (useSoil) {
        var avail = Math.min(cad, S + dk.p);
        var use = Math.min(etc, avail);
        def = etc - use;
        S = avail - use;
      } else {
        def = Math.max(etc - dk.p, 0);
      }
      if (!m) continue; // el barbecho consume agua del suelo pero su "déficit" no cuenta
      var crop = CROPS[m.crop];
      deficit += def; cropWater += etc; rain += dk.p; cover++;
      if (m.stage === 'media' && crop.sensitive.indexOf('heat') >= 0) heatDays += dk.heat;
      if ((crop.frostStages || ['media']).indexOf(m.stage) >= 0 && crop.sensitive.indexOf('frost') >= 0) frostDays += dk.frost;
      detail.push({ dekad: k, label: DEKAD_LABELS[k], crop: m.crop, stage: m.stage, kc: m.kc, et0: dk.et0, etc: round(etc, 1), p: dk.p, deficit: round(def, 1), soil: useSoil ? round(S, 1) : null });
    }
    return {
      complete: complete,
      waterDeficit: round(deficit, 1),        // mm de demanda no cubierta, menor es mejor
      cropWaterDemand: round(cropWater, 1),   // mm
      rainInSeason: round(rain, 1),           // mm
      heatDays: heatDays,                      // días, menor es mejor
      frostDays: frostDays,                    // días, menor es mejor
      coverPct: round(100 * cover / 36, 0),    // % del año con cultivo vivo, mayor es mejor
      grainHarvests: grain,                    // cosechas comerciales/año, mayor es mejor
      cropFamilies: families,                  // familias de cultivos distintas, mayor es mejor (salud del suelo)
      soilEnd: useSoil ? round(S, 1) : null,
      detail: detail
    };
  }

  // Serie continua: el agua del suelo pasa de una campaña a la siguiente.
  // Si una campaña está incompleta, la siguiente arranca con el suelo lleno (supuesto).
  function evaluateAllYears(rot, aggregated, soilId) {
    var cad = soilCapacityMm(soilId || 'none');
    var res = {}, S = cad;
    Object.keys(aggregated).sort().forEach(function (ay) {
      var r = evaluateYear(rot, aggregated[ay], cad, S);
      res[ay] = r;
      S = (cad != null && r.complete) ? r.soilEnd : cad;
    });
    return res;
  }

  // ---------- 6. Escenarios ----------
  // 'median' : mediana de todos los años agrícolas completos
  // 'p80'    : año desfavorable (percentil 80 de déficit/calor/helada; percentil 20 de lo "mayor es mejor")
  // número   : un año agrícola concreto (p. ej. 2021 = may-2021 a abr-2022)
  var DIMENSIONS = [
    { key: 'waterDeficit', label: 'Déficit hídrico (demanda no cubierta)', unit: 'mm', better: 'lower' },
    { key: 'heatDays', label: 'Días de calor (≥ umbral) en floración', unit: 'días', better: 'lower' },
    { key: 'frostDays', label: 'Días de helada (≤ umbral) en etapa sensible', unit: 'días', better: 'lower' },
    { key: 'coverPct', label: 'Suelo cubierto con cultivo vivo', unit: '%', better: 'higher' },
    { key: 'grainHarvests', label: 'Cosechas comerciales por año', unit: 'n', better: 'higher' },
    // Va al final para que los enlaces compartidos anteriores (5 pesos) sigan funcionando.
    { key: 'cropFamilies', label: 'Diversidad: familias de cultivos en la rotación', unit: 'n', better: 'higher' }
  ];

  function percentile(arr, q) {
    var a = arr.slice().sort(function (x, y) { return x - y; });
    if (!a.length) return null;
    var pos = (a.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return a[lo] + (a[hi] - a[lo]) * (pos - lo);
  }

  function completeYears(byYear) {
    return Object.keys(byYear).filter(function (y) { return byYear[y].complete; });
  }

  function scenarioValues(byYear, scenario) {
    if (typeof scenario === 'number' || /^\d{4}$/.test(String(scenario))) {
      var y = byYear[String(scenario)];
      if (!y || !y.complete) return null;
      var o = {}; DIMENSIONS.forEach(function (d) { o[d.key] = y[d.key]; }); o.years = [String(scenario)];
      return o;
    }
    var ys = completeYears(byYear);
    if (!ys.length) return null;
    var out = { years: ys };
    DIMENSIONS.forEach(function (d) {
      var vals = ys.map(function (y) { return byYear[y][d.key]; });
      var q = scenario === 'p80' ? (d.better === 'lower' ? 0.8 : 0.2) : 0.5;
      out[d.key] = round(percentile(vals, q), 1);
    });
    return out;
  }

  // ---------- 7. Comparación ponderada y explicable ----------
  // weights: { waterDeficit: 0..5, ... }. Normalización proporcional al máximo entre rotaciones comparadas.
  function compare(rotResults, weights) {
    var ids = Object.keys(rotResults).filter(function (id) { return rotResults[id]; });
    var totalW = DIMENSIONS.reduce(function (s, d) { return s + (weights[d.key] || 0); }, 0);
    var rows = ids.map(function (id) {
      var v = rotResults[id];
      var contrib = {};
      var score = 0;
      DIMENSIONS.forEach(function (d) {
        var vals = ids.map(function (j) { return rotResults[j][d.key]; });
        var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
        // Normalización proporcional al máximo (no min-max): diferencias pequeñas en valores
        // grandes dan diferencias pequeñas de puntaje. 1 = la mejor del grupo.
        var norm = mx === mn || mx <= 0 ? 1 : (d.better === 'lower' ? 1 - (v[d.key] - mn) / mx : v[d.key] / mx);
        var w = totalW ? (weights[d.key] || 0) / totalW : 0;
        contrib[d.key] = { value: v[d.key], normalized: round(norm, 3), weight: round(w, 3), points: round(100 * w * norm, 1) };
        score += 100 * w * norm;
      });
      return { id: id, score: round(score, 1), contributions: contrib };
    });
    rows.sort(function (a, b) { return b.score - a.score; });
    return rows;
  }

  // Campaña por campaña: qué rotación queda primera con estos pesos y suelo.
  // Devuelve { seasons: [{year, winner, scores:{id:score}}], wins: {id:n}, beatsBaseline: {id:n}, n }
  // rotations: lista opcional (por defecto ROTATIONS); permite rotaciones propias o desplazadas.
  function seasonWins(aggregated, soilId, weights, rotations) {
    var ROTS = rotations || ROTATIONS;
    var byRot = {};
    ROTS.forEach(function (r) { byRot[r.id] = evaluateAllYears(r, aggregated, soilId); });
    var base = ROTS.filter(function (r) { return r.baseline; })[0];
    var wins = {}, beats = {}, seasons = [];
    ROTS.forEach(function (r) { wins[r.id] = 0; beats[r.id] = 0; });
    Object.keys(aggregated).sort().forEach(function (y) {
      if (!ROTS.every(function (r) { return byRot[r.id][y].complete; })) return;
      var res = {};
      ROTS.forEach(function (r) { res[r.id] = scenarioValues(byRot[r.id], +y); });
      var rows = compare(res, weights), scores = {};
      rows.forEach(function (x) { scores[x.id] = x.score; });
      wins[rows[0].id]++;
      ROTS.forEach(function (r) { if (base && r.id !== base.id && scores[r.id] > scores[base.id]) beats[r.id]++; });
      seasons.push({ year: y, winner: rows[0].id, scores: scores });
    });
    return { seasons: seasons, wins: wins, beatsBaseline: beats, n: seasons.length };
  }

  // ---------- 7c. Sensibilidad a la fecha de siembra ----------
  // Desplaza todos los cultivos de una rotación `shift` dekadas (1 dekada ≈ 10 días).
  // Un cultivo que se saldría del año agrícola o pisaría a otro queda sin mover (se informa en `kept`).
  function shiftRotation(rot, shift) {
    var kept = [];
    var crops = rot.crops.map(function (c) {
      var st = c.start + shift;
      if (st < 0 || st + c.len > 36) { kept.push(c.crop); return { crop: c.crop, start: c.start, len: c.len }; }
      return { crop: c.crop, start: st, len: c.len };
    });
    var out = { id: rot.id, name: rot.name, baseline: rot.baseline, crops: crops, kept: kept };
    if (validateRotation(out).length) { out.crops = rot.crops.map(function (c) { return { crop: c.crop, start: c.start, len: c.len }; }); out.kept = rot.crops.map(function (c) { return c.crop; }); }
    return out;
  }
  // ¿Cambia el resultado si todas las siembras se adelantan o atrasan ~10 días?
  function sowingSensitivity(aggregated, soilId, weights, rotations, shifts) {
    var ROTS = rotations || ROTATIONS;
    return (shifts || [-1, 0, 1]).map(function (sh) {
      var rots = ROTS.map(function (r) { return shiftRotation(r, sh); });
      var w = seasonWins(aggregated, soilId, weights, rots);
      var mx = Math.max.apply(null, Object.keys(w.wins).map(function (k) { return w.wins[k]; }));
      var top = Object.keys(w.wins).filter(function (k) { return w.wins[k] === mx; }); // puede haber empate
      return { shift: sh, days: sh * 10, wins: w.wins, n: w.n, top: top };
    });
  }

  // ---------- 7d. Control de coherencia con GWETROOT ----------
  function pearson(a, b) {
    var n = Math.min(a.length, b.length);
    if (n < 3) return null;
    var ma = 0, mb = 0, i;
    for (i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
    ma /= n; mb /= n;
    var sab = 0, saa = 0, sbb = 0;
    for (i = 0; i < n; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) * (a[i] - ma); sbb += (b[i] - mb) * (b[i] - mb); }
    return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : null;
  }
  // Compara, dekada por dekada con cultivo, la fracción de agua del balde (S / CAD) con GWETROOT de POWER
  // (humedad de zona radicular, modelo MERRA-2). NO es validación independiente: ambos usan la misma lluvia.
  // byYear: salida de evaluateAllYears con suelo. Devuelve { n, r, series: { año: [{dekad, label, model, gwr}] } } o null sin suelo.
  function soilCoherence(byYear, aggregated, cad) {
    if (cad == null) return null;
    var a = [], g = [], series = {};
    Object.keys(byYear).sort().forEach(function (y) {
      var r = byYear[y];
      if (!r.complete) return;
      series[y] = [];
      r.detail.forEach(function (d) {
        var gw = aggregated[y][d.dekad].gwr;
        if (gw == null || d.soil == null) return;
        var f = d.soil / cad;
        a.push(f); g.push(gw);
        series[y].push({ dekad: d.dekad, label: d.label, model: round(f, 3), gwr: gw });
      });
    });
    var r = pearson(a, g);
    return { n: a.length, r: r == null ? null : round(r, 2), series: series };
  }

  // ---------- 7h. Validación externa con rendimientos reales ----------
  // aggs: series de una o más zonas; yields: { añoCosecha: t/ha } (FAO). Campaña ay -> cosecha del año ay+1.
  // Indicador del modelo: déficit hídrico de la soja (rotación base, suelo indicado), promedio de las zonas.
  // Al rendimiento se le quita la tendencia tecnológica (recta por mínimos cuadrados) y se usa la anomalía en %.
  // El modelo NO se ajustó con estos datos: sus parámetros salen de FAO-56 y de los supuestos ya declarados.
  function yieldValidation(aggs, yields, soilId) {
    var bys = aggs.map(function (a) { return evaluateAllYears(ROTATIONS[0], a, soilId || 'arcilloso'); });
    var rows = [];
    Object.keys(bys[0]).sort().forEach(function (ay) {
      var fy = +ay + 1;
      if (yields[fy] == null || !bys.every(function (b) { return b[ay] && b[ay].complete; })) return;
      var m = function (k) { return bys.reduce(function (s, b) { return s + b[ay][k]; }, 0) / bys.length; };
      rows.push({ ay: +ay, fy: fy, y: yields[fy], def: m('waterDeficit'), heat: m('heatDays') });
    });
    var n = rows.length;
    if (n < 5) return null;
    var mx = rows.reduce(function (s, r) { return s + r.fy; }, 0) / n, my = rows.reduce(function (s, r) { return s + r.y; }, 0) / n;
    var b = rows.reduce(function (s, r) { return s + (r.fy - mx) * (r.y - my); }, 0) / rows.reduce(function (s, r) { return s + (r.fy - mx) * (r.fy - mx); }, 0);
    rows.forEach(function (r) { var tr = my + b * (r.fy - mx); r.anom = round(100 * (r.y - tr) / tr, 1); r.def = round(r.def, 0); });
    var worstY = rows.slice().sort(function (p, q) { return p.anom - q.anom; }).slice(0, 5).map(function (r) { return r.ay; });
    var worstM = rows.slice().sort(function (p, q) { return q.def - p.def; }).slice(0, 5).map(function (r) { return r.ay; });
    var hit = worstM.filter(function (a) { return worstY.indexOf(a) >= 0; }).length;
    // Probabilidad de acertar al menos `hit` de 5 eligiendo 5 campañas al azar (hipergeométrica).
    var C = function (a, k) { var r = 1; for (var i = 0; i < k; i++) r = r * (a - i) / (i + 1); return r; };
    var p = 0; for (var x = hit; x <= 5; x++) p += C(5, x) * C(n - 5, 5 - x) / C(n, 5);
    return {
      n: n, trend: round(b, 4), rows: rows, worstYield: worstY, worstModel: worstM, hits: hit, pChance: round(p, 4),
      rDeficit: round(pearson(rows.map(function (r) { return r.def; }), rows.map(function (r) { return r.anom; })), 2),
      rHeat: round(pearson(rows.map(function (r) { return r.heat; }), rows.map(function (r) { return r.anom; })), 2)
    };
  }

  // ---------- 7g. Celda de la meteorología de POWER ----------
  // Rejilla MERRA-2: centros cada 0,5° de latitud (desde −90) y 0,625° de longitud (desde −180).
  // Devuelve la celda que contiene el punto y su tamaño aproximado en km. Sirve para dibujar en el mapa
  // qué área representa un punto: es regional, no una parcela. APROXIMADA: POWER combina varias fuentes.
  function powerCell(lat, lon) {
    var dLat = 0.5, dLon = 0.625;
    var latC = Math.round(lat / dLat) * dLat;
    var lonC = Math.round((lon + 180) / dLon) * dLon - 180;
    return {
      latC: round(latC, 3), lonC: round(lonC, 4),
      south: round(latC - dLat / 2, 4), north: round(latC + dLat / 2, 4), west: round(lonC - dLon / 2, 4), east: round(lonC + dLon / 2, 4),
      kmNS: round(dLat * 111.32, 0), kmEW: round(dLon * 111.32 * Math.cos(latC * Math.PI / 180), 0)
    };
  }

  // ---------- 7f. Escenario hipotético de lluvia ----------
  // Devuelve una copia de la serie con la lluvia de cada dekada multiplicada por `factor` (0,8 = 20 % menos).
  // Es una simulación "¿y si...?": NO son datos observados. Temperatura, ET0, calor y heladas no cambian.
  function scaleRain(aggregated, factor) {
    var out = {};
    Object.keys(aggregated).forEach(function (ay) {
      out[ay] = aggregated[ay].map(function (d) {
        return { n: d.n, p: round(d.p * factor, 1), et0: d.et0, heat: d.heat, frost: d.frost, gwr: d.gwr, complete: d.complete };
      });
    });
    return out;
  }

  // ---------- 7e. Fase ENSO de una campaña ----------
  // anom: anomalía ONI (°C) del trimestre NDJ de la campaña. Umbral ±0,5 °C sobre un solo trimestre: SUPUESTO simple
  // (NOAA exige 5 trimestres seguidos para declarar un episodio). Devuelve 'nino' | 'nina' | 'neutral' | null.
  function ensoPhase(anom, threshold) {
    if (anom == null || isNaN(anom)) return null;
    var th = threshold == null ? 0.5 : threshold;
    return anom >= th ? 'nino' : anom <= -th ? 'nina' : 'neutral';
  }

  // Explicación textual de por qué A supera a B (las 2 dimensiones con mayor diferencia de puntos).
  function explain(winner, other) {
    var diffs = DIMENSIONS.map(function (d) {
      return { d: d, diff: winner.contributions[d.key].points - other.contributions[d.key].points };
    }).sort(function (a, b) { return b.diff - a.diff; });
    return diffs.filter(function (x) { return x.diff > 0.05; }).slice(0, 2).map(function (x) { return x.d.label; });
  }

  // Confianza: siempre 'exploratorio' en este prototipo; razones explícitas. ctx.lang: 'es' | 'en'.
  function confidence(ctx) {
    var c = ctx || {}, en = c.lang === 'en', withSoil = c.soil && c.soil !== 'none';
    var reasons = en ? [
      'Regional NASA POWER cell (~0.5° × 0.625° for MERRA-2 meteorology): it does not represent an individual field.',
      withSoil ? 'Generic soil class (FAO-56 Table 19) with 1 m rooting depth: not a soil analysis of your field.' : 'No soil: the deficit is climatic (rain − crop demand), not water available in the soil.',
      'Generic FAO-56 Kc coefficients and simplified growth-stage fractions.',
      'Sowing calendars and heat/frost thresholds are assumptions pending validation with local sources (MAG/IPTA) or a technician.'
    ] : [
      'Celda POWER regional (~0,5° × 0,625° para meteorología MERRA-2): no representa una parcela individual.',
      withSoil ? 'Suelo genérico (FAO-56 Tabla 19) con 1 m de raíces: no es un análisis de suelo de tu lote.' : 'Sin suelo: el déficit es climático (lluvia − demanda del cultivo), no agua disponible en el suelo.',
      'Coeficientes Kc genéricos de FAO-56 y fracciones de etapa simplificadas.',
      'Calendarios de siembra y umbrales de calor y helada: supuestos pendientes de validación con fuentes locales (MAG/IPTA) o un técnico.'
    ];
    // Fuera de la zona calibrada (Región Oriental de Paraguay) las rotaciones fijas son una plantilla trasladada.
    if (c.template) reasons.push(en
      ? 'Outside Paraguay the four fixed rotations are a template: Paraguay’s calendar moved to this hemisphere, not a local calendar. The climate indicators (rain, heat, frost, water demand) are computed the same way anywhere.'
      : 'Fuera de Paraguay las cuatro rotaciones fijas son una plantilla: el calendario de Paraguay trasladado a este hemisferio, no un calendario local. Los indicadores de clima (lluvia, calor, heladas, demanda de agua) se calculan igual en cualquier lugar.');
    if (c.tropical) reasons.push(en
      ? 'Near the equator the seasons follow the rains more than the calendar: the hemisphere-based calendar is especially rough here.'
      : 'Cerca del ecuador las estaciones dependen de las lluvias más que del calendario: el calendario por hemisferio es especialmente grueso aquí.');
    if (c.nYears < 15) reasons.push(en ? 'Fewer than 15 complete seasons in the series.' : 'Menos de 15 campañas completas en la serie.');
    if (c.source === 'cache') reasons.push(en ? 'Data read from the local cache (downloaded from POWER on the date shown).' : 'Datos leídos de la caché local (descargados de POWER en la fecha indicada).');
    return { label: en ? 'exploratory' : 'exploratorio', reasons: reasons };
  }

  // ---------- 9. Parcelas: geometría sobre la esfera ----------
  // pts: [[lat, lon], ...] en grados, sin repetir el primer punto. Radio medio de la Tierra (IUGG).
  var EARTH_R = 6371008.8;
  // Área de un polígono sobre la esfera, en hectáreas (fórmula del exceso esférico por trapecios; válida para parcelas
  // y regiones que no cruzan el antimeridiano ni un polo).
  function polygonAreaHa(pts) {
    if (!pts || pts.length < 3) return 0;
    var s = 0, rad = Math.PI / 180;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      s += (b[1] - a[1]) * rad * (2 + Math.sin(a[0] * rad) + Math.sin(b[0] * rad));
    }
    return Math.abs(s * EARTH_R * EARTH_R / 2) / 10000;
  }
  function polygonBBox(pts) {
    var la = pts.map(function (p) { return p[0]; }), lo = pts.map(function (p) { return p[1]; });
    return { s: Math.min.apply(null, la), n: Math.max.apply(null, la), w: Math.min.apply(null, lo), e: Math.max.apply(null, lo) };
  }
  // Centroide de área (plano local; suficiente para parcelas). Si el polígono es degenerado, promedio de vértices.
  function polygonCentroid(pts) {
    var A = 0, cx = 0, cy = 0, n = pts.length;
    for (var i = 0; i < n; i++) {
      var p = pts[i], q = pts[(i + 1) % n], f = p[1] * q[0] - q[1] * p[0];
      A += f; cx += (p[1] + q[1]) * f; cy += (p[0] + q[0]) * f;
    }
    if (Math.abs(A) < 1e-14) return [pts.reduce(function (s, p) { return s + p[0]; }, 0) / n, pts.reduce(function (s, p) { return s + p[1]; }, 0) / n];
    return [cy / (3 * A), cx / (3 * A)];
  }
  // ¿El punto está dentro del polígono? (trazado de rayos)
  function pointInPolygon(lat, lon, pts) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var yi = pts[i][0], xi = pts[i][1], yj = pts[j][0], xj = pts[j][1];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // ¿El polígono se cruza a sí mismo? (dos lados no vecinos que se cortan)
  function polygonSelfIntersects(pts) {
    var n = pts.length;
    if (n < 4) return false;
    var o = function (a, b, c) { return (b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]); };
    var cross = function (a, b, c, d) { return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
      if (j === i || (j + 1) % n === i || (i + 1) % n === j) continue;
      if (cross(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return true;
    }
    return false;
  }

  // ---------- 10. Verdor visible de una parcela en una imagen en color real ----------
  // rgba: arreglo de píxeles (R,G,B,A por píxel) de una imagen w × h. inside(x, y): ¿el píxel cae dentro de la parcela?
  // Índice: coordenada cromática verde, GCC = G / (R + G + B), usada en fenología con cámaras. NO es NDVI:
  // sale de una imagen JPEG en color real (8 bits), sin banda infrarroja. Sirve para comparar dos fechas del mismo lugar.
  // Se descartan los píxeles sin dato (casi negros) y los muy claros y sin color (nubes).
  function greenStats(rgba, w, h, inside) {
    var n = 0, valid = 0, cloud = 0, nodata = 0, sum = 0;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (inside && !inside(x, y)) continue;
      n++;
      var i = (y * w + x) * 4, r = rgba[i], g = rgba[i + 1], b = rgba[i + 2], t = r + g + b;
      if (t < 30) { nodata++; continue; }
      if (Math.min(r, g, b) > 190 && Math.max(r, g, b) - Math.min(r, g, b) < 40) { cloud++; continue; }
      valid++; sum += g / t;
    }
    return { pixels: n, valid: valid, cloud: cloud, nodata: nodata, validPct: n ? round(100 * valid / n, 0) : 0, gcc: valid ? round(sum / valid, 4) : null };
  }

  function round(v, n) { if (v == null || isNaN(v)) return v; var f = Math.pow(10, n); return Math.round(v * f) / f; }

  return {
    dekadLabels: dekadLabels, hemisphereOf: hemisphereOf, MONTH_ABBR: MONTH_ABBR,
    polygonAreaHa: polygonAreaHa, polygonBBox: polygonBBox, polygonCentroid: polygonCentroid, pointInPolygon: pointInPolygon,
    polygonSelfIntersects: polygonSelfIntersects, greenStats: greenStats,
    POWER_FILL: POWER_FILL, DEKAD_LABELS: DEKAD_LABELS, CROPS: CROPS, ROTATIONS: ROTATIONS, DIMENSIONS: DIMENSIONS,
    STAGE_FRACTIONS: STAGE_FRACTIONS,
    toCompact: toCompact, fromCompact: fromCompact,
    et0Hargreaves: et0Hargreaves, dekadOf: dekadOf, agYearOf: agYearOf, aggregateDaily: aggregateDaily,
    SOILS: SOILS, KC_FALLOW: KC_FALLOW, ROOT_DEPTH_M: ROOT_DEPTH_M, soilCapacityMm: soilCapacityMm, rotationMap: rotationMap,
    kcCurve: kcCurve, validateRotation: validateRotation, evaluateYear: evaluateYear, evaluateAllYears: evaluateAllYears,
    pearson: pearson, soilCoherence: soilCoherence, ensoPhase: ensoPhase, scaleRain: scaleRain, powerCell: powerCell, yieldValidation: yieldValidation,
    seasonWins: seasonWins, shiftRotation: shiftRotation, sowingSensitivity: sowingSensitivity, scenarioValues: scenarioValues, compare: compare, explain: explain, confidence: confidence, percentile: percentile, round: round
  };
});
