/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). La app no usa IA en ejecución. */
/* YvyShift: módulos Field Monitor (lista de zonas), Field DNA, Climate Replay, Adaptive Monitor y Resilience Passport.
 * Solo lee datos y funciones que app.js expone en window.RL y el motor (engine.js). No cambia ningún cálculo existente.
 * Todo número sale de NASA POWER (caché o descarga en vivo) o del motor; los criterios de cada episodio se muestran en pantalla. */
(function () {
  'use strict';
  var RL = window.RL; if (!RL) return;
  var E = RL.E;
  var $ = function (id) { return document.getElementById(id); };
  function L() { return RL.lang(); }
  function tx(es, en) { return L() === 'en' ? RL.tr(en) : es; }
  function txp(es, en, a) { return tx(es, en).replace(/\{(\d)\}/g, function (m, i) { return a[+i]; }); }
  function esc(s) { return RL.esc(s); }
  function n0(v) { return RL.num(Math.round(v)); }
  function n1(v) { return RL.num(E.round(v, 1), 1); }
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function med(a) { return a.length ? E.percentile(a, 0.5) : null; }
  function pctRank(v, arr) { var below = arr.filter(function (x) { return x < v; }).length, eq = arr.filter(function (x) { return x === v; }).length; return Math.round(100 * (below + eq / 2) / arr.length); }
  function season(y) { return y + '–' + String(+y + 1).slice(2); }
  var MON = { es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
  // El mes de cada dekada depende del hemisferio de la zona (el año agrícola empieza en mayo en el sur y en noviembre en el norte).
  function dkStart(k) { return { m: RL.monthIdx(k), d: [1, 11, 21][k % 3] }; }
  function dkEnd(k) { var m = RL.monthIdx(k); return { m: m, d: [10, 20, [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]][k % 3] }; }
  function fd(x) { return x.d + ' ' + MON[L()][x.m]; }

  // Ciclo de la soja de la rotación base (mismo calendario supuesto que usa Rotation Lab).
  var SOY = E.ROTATIONS[0].crops[0], SOY_A = SOY.start, SOY_B = SOY.start + SOY.len - 1;
  var HOT_A = 15, HOT_B = 32;   // oct–mar
  var COLD_A = 0, COLD_B = 14;  // may–sep

  function ds() { return RL.datasets[RL.loc()]; }
  function sliceSum(dk, a, b, key) { var s = 0; for (var k = a; k <= b; k++) s += dk[k][key]; return s; }
  function sliceMean(dk, a, b, key) { return sliceSum(dk, a, b, key) / (b - a + 1); }

  // ---------- Perfil por campaña (Field DNA) ----------
  var profCache = {};
  function profile(d) {
    var key = RL.loc() + '|' + RL.soil() + '|' + (d.fetched || '');
    if (profCache[key]) return profCache[key];
    var ys = RL.fullYears(d.agg);
    var byA = E.evaluateAllYears(E.ROTATIONS[0], d.agg, RL.soil());
    var rows = ys.map(function (y) {
      var dk = d.agg[y];
      return {
        y: y, rain: sliceSum(dk, 0, 35, 'p'), soyRain: sliceSum(dk, SOY_A, SOY_B, 'p'),
        soyDemand: byA[y].cropWaterDemand, deficit: byA[y].waterDeficit,
        heat: sliceSum(dk, HOT_A, HOT_B, 'heat'), frost: sliceSum(dk, COLD_A, COLD_B, 'frost'),
        gwr: sliceMean(dk, SOY_A, SOY_B, 'gwr')
      };
    });
    var col = function (k) { return rows.map(function (r) { return r[k]; }); };
    var out = { ys: ys, rows: rows, col: col, byA: byA };
    profCache = {}; profCache[key] = out;
    return out;
  }

  // ---------- Field Monitor: lista de zonas (estilo lista de lotes) ----------
  function spark(vals, w, h) {
    var mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), n = vals.length;
    var pts = vals.map(function (v, i) { return (i * w / (n - 1)).toFixed(1) + ',' + (h - 2 - (v - mn) / ((mx - mn) || 1) * (h - 4)).toFixed(1); });
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><polyline points="' + pts.join(' ') + '"/></svg>';
  }
  function renderZones() {
    var box = $('fmZones'); if (!box) return;
    var cur = RL.loc();
    box.innerHTML = Object.keys(RL.datasets).map(function (k) {
      var d = RL.datasets[k], ys = RL.fullYears(d.agg);
      var soy = ys.map(function (y) { return sliceSum(d.agg[y], SOY_A, SOY_B, 'p'); });
      var name = RL.placeLabel(d).split(' (')[0];
      return '<button type="button" class="zone' + (k === cur ? ' on' : '') + '" data-zone="' + esc(k) + '" aria-pressed="' + (k === cur) + '">' +
        '<span class="z-top"><b>' + esc(name) + '</b><em>' + d.lat + ', ' + d.lon + '</em></span>' +
        '<span class="z-mid">' + spark(soy, 120, 28) + '<span class="z-val">' + n0(med(soy)) + ' mm</span></span>' +
        '<span class="z-cap">' + tx('lluvia del ciclo de soja, mediana de ', 'soybean-season rain, median of ') + ys.length + tx(' campañas', ' seasons') + '</span></button>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-zone]'); if (!b) return;
    var sel = $('loc'); if (!sel || sel.value === b.dataset.zone) return;
    sel.value = b.dataset.zone; sel.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // ---------- Field DNA ----------
  function kpi(label, value, sub, tone) {
    return '<div class="kpi' + (tone ? ' ' + tone : '') + '"><span class="k-l">' + label + '</span><b>' + value + '</b><span class="k-s">' + sub + '</span></div>';
  }
  function mix(a, b, t) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return 'rgb(' + pa.map(function (v, i) { return Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, t))); }).join(',') + ')';
  }
  function stripeRow(label, unit, rows, key, lo, mid, hi, invert) {
    var vals = rows.map(function (r) { return r[key]; }), m = med(vals), mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    var sel = RL.scenario();
    var cells = rows.map(function (r) {
      var v = r[key], t = v >= m ? 0.5 + 0.5 * (v - m) / ((mx - m) || 1) : 0.5 * (v - mn) / ((m - mn) || 1);
      if (invert) t = 1 - t;
      var c = t < 0.5 ? mix(lo, mid, t * 2) : mix(mid, hi, (t - 0.5) * 2);
      var shown = key === 'gwr' ? Math.round(v * 100) + ' %' : n0(v) + ' ' + unit;
      return '<i style="background:' + c + '"' + (r.y === sel ? ' class="sel"' : '') + ' title="' + season(r.y) + ': ' + shown + '"></i>';
    }).join('');
    var mShown = key === 'gwr' ? Math.round(m * 100) + ' %' : n0(m) + ' ' + unit;
    return '<div class="st-row"><span class="st-l">' + label + '<small>' + tx('lo normal: ', 'normal: ') + mShown + '</small></span><div class="st-cells">' + cells + '</div></div>';
  }
  function renderDNA() {
    if (!$('dnaCards')) return;
    var d = ds(), P = profile(d), rows = P.rows, col = P.col;
    if (!rows.length) { $('dnaCards').innerHTML = ''; return; }
    var dry = rows.slice().sort(function (a, b) { return a.soyRain - b.soyRain; })[0];
    var short = rows.filter(function (r) { return r.soyRain < r.soyDemand; }).length;
    var place = esc(String(RL.placeLabel(d)).split(' (')[0]), normal = n0(med(col('soyRain')));
    // Primero la historia en una frase; los detalles técnicos van después y más chicos.
    $('dnaSub').innerHTML = '<span class="lead">' + (short === 0
      ? txp('En {0}, en las últimas {1} campañas la lluvia siempre alcanzó para la soja. La más seca fue <b>{2}</b>, con {3} mm.', 'In {0}, over the last {1} seasons rain was always enough for soybean. The driest was <b>{2}</b>, with {3} mm.', [place, rows.length, season(dry.y), n0(dry.soyRain)])
      : txp('En {0}, a la soja le faltó lluvia en <b>{1} de las últimas {2} campañas</b>. La más seca fue <b>{3}</b>: llovieron {4} mm, cuando lo normal son unos {5}.', 'In {0}, soybean was short of rain in <b>{1} of the last {2} seasons</b>. The driest was <b>{3}</b>: {4} mm fell, when about {5} is normal.', [place, short, rows.length, season(dry.y), n0(dry.soyRain), normal])) +
      '</span><span class="lead-note">' + txp('Datos de la NASA para un área de unos 50 km alrededor de este punto ({0}, {1}). No es tu lote exacto.', 'NASA data for an area of about 50 km around this point ({0}, {1}). Not your exact field.', [d.lat, d.lon]) + '</span>';
    $('dnaCards').innerHTML =
      kpi(tx('Lluvia en un año normal', 'Rain in a normal year'), n0(med(col('rain'))) + '<small> mm</small>', txp('el año más seco {0}, el más lluvioso {1}', 'driest year {0}, wettest {1}', [n0(Math.min.apply(null, col('rain'))), n0(Math.max.apply(null, col('rain')))])) +
      kpi(tx('Lluvia mientras crece la soja', 'Rain while soybean grows'), n0(med(col('soyRain'))) + '<small> mm</small>', txp('del {0} al {1}, en un año normal', 'from {0} to {1}, in a normal year', [fd(dkStart(SOY_A)), fd(dkEnd(SOY_B))])) +
      kpi(tx('Campañas en que faltó lluvia', 'Seasons short of rain'), short + '<small>' + tx(' de ', ' of ') + rows.length + '</small>', tx('llovió menos de lo que la soja pide', 'less rain than soybean asks for'), short > rows.length / 3 ? 'warn' : '') +
      kpi(tx('La campaña más seca', 'The driest season'), season(dry.y), n0(dry.soyRain) + tx(' mm mientras crecía la soja', ' mm while soybean was growing'), 'warn') +
      kpi(tx('Días de mucho calor', 'Very hot days'), n0(med(col('heat'))), tx('35 °C o más, de oct a mar, en un año normal', '35 °C or more, Oct to Mar, in a normal year'), 'heat') +
      kpi(tx('Días con riesgo de helada', 'Days with frost risk'), n0(med(col('frost'))), tx('2 °C o menos, de may a sep, en un año normal', '2 °C or less, May to Sep, in a normal year'), 'cold');
    var labels = rows.map(function (r, i) { return '<span>' + (i % 3 === 0 || i === rows.length - 1 ? String(r.y).slice(2) + '/' + String(+r.y + 1).slice(2) : '') + '</span>'; }).join('');
    $('dnaStripes').innerHTML =
      stripeRow(tx('Lluvia mientras crece la soja', 'Rain while soybean grows'), 'mm', rows, 'soyRain', '#8A5A2B', '#D8CFA6', '#2F8F5B') +
      stripeRow(tx('Agua que faltó a la soja', 'Water soybean lacked'), 'mm', rows, 'deficit', '#2F8F5B', '#D8CFA6', '#8A5A2B') +
      stripeRow(tx('Humedad en la raíz', 'Moisture at root depth'), '', rows, 'gwr', '#8A5A2B', '#D8CFA6', '#2F8F5B') +
      stripeRow(tx('Días de mucho calor', 'Very hot days'), tx('días', 'days'), rows, 'heat', '#F2EBDD', '#F0B24A', '#C2410C') +
      stripeRow(tx('Días con riesgo de helada', 'Days with frost risk'), tx('días', 'days'), rows, 'frost', '#F2EBDD', '#93C5FD', '#1D4ED8') +
      '<div class="st-row st-axis"><span class="st-l"></span><div class="st-cells lbls">' + labels + '</div></div>' +
      '<p class="mod-note">' + tx('Cada cuadrito es una campaña, de mayo a abril. Verde: hubo más agua que lo normal. Marrón: hubo menos. Naranja y rojo: más calor. Azul: más heladas. Toca un cuadrito para ver el número. El que tiene borde es la campaña que elegiste. La humedad en la raíz la estima un modelo de la NASA (GWETROOT); no es una medición en tu suelo.',
        'Each square is one season, May to April. Green: more water than normal. Brown: less. Orange and red: more heat. Blue: more frost. Tap a square to see the number. The outlined one is the season you picked. Moisture at root depth is estimated by a NASA model (GWETROOT); it is not a measurement in your soil.') + '</p>';
    renderRecovery(d, P);
    renderQuality(d, P);
  }

  // Firma de recuperación: humedad de zona radicular (GWETROOT) después del episodio más seco. Experimental.
  function recovery(d, P) {
    var sc = RL.scenario(), ys = P.ys;
    var ep = /^\d{4}$/.test(sc) && ys.indexOf(sc) >= 0 ? sc : P.rows.slice().sort(function (a, b) { return a.soyRain - b.soyRain; })[0].y;
    var next = String(+ep + 1);
    if (!d.agg[next]) return { ep: ep, ok: false, why: 'next' };
    var clim = [];
    for (var k = 0; k < 36; k++) {
      var v = ys.filter(function (y) { return y !== ep; }).map(function (y) { return d.agg[y][k].gwr; });
      clim.push({ p25: E.percentile(v, 0.25), p50: E.percentile(v, 0.5), p75: E.percentile(v, 0.75) });
    }
    var ser = [];
    [ep, next].forEach(function (y) { d.agg[y].forEach(function (x, k) { ser.push({ y: y, k: k, v: x.complete ? x.gwr : null, c: clim[k] }); }); });
    var onset = -1, trough = -1, rec = -1;
    for (var i = 0; i < 36; i++) if (ser[i].v != null && ser[i].v < ser[i].c.p25) { onset = i; break; }
    if (onset < 0) return { ep: ep, ok: false, why: 'none', ser: ser };
    var minV = Infinity;
    for (i = onset; i < 36; i++) if (ser[i].v != null && ser[i].v < minV) { minV = ser[i].v; trough = i; }
    for (i = trough + 1; i < ser.length - 2; i++) {
      if ([0, 1, 2].every(function (j) { return ser[i + j].v != null && ser[i + j].v >= ser[i + j].c.p25; })) { rec = i; break; }
    }
    return { ep: ep, ok: true, ser: ser, onset: onset, trough: trough, rec: rec, minV: minV };
  }
  function renderRecovery(d, P) {
    var R = recovery(d, P), box = $('dnaRecovery');
    if (!R.ser) { box.innerHTML = '<p class="mod-note">' + txp('No hay datos suficientes después de la campaña {0} para calcularla.', 'There is not enough data after the {0} season to compute it.', [season(R.ep)]) + '</p>'; return; }
    var W = 560, H = 170, pl = 30, pb = 22, pt = 8, n = R.ser.length;
    var x = function (i) { return pl + i * (W - pl - 8) / (n - 1); }, yv = function (v) { return pt + (H - pt - pb) * (1 - v); };
    var band = R.ser.map(function (s, i) { return x(i) + ',' + yv(s.c.p75); }).join(' ') + ' ' + R.ser.slice().reverse().map(function (s, j) { return x(n - 1 - j) + ',' + yv(s.c.p25); }).join(' ');
    var line = '', seg = [];
    R.ser.forEach(function (s, i) { if (s.v == null) { if (seg.length) { line += '<polyline class="rc-line" points="' + seg.join(' ') + '"/>'; seg = []; } } else seg.push(x(i) + ',' + yv(s.v)); });
    if (seg.length) line += '<polyline class="rc-line" points="' + seg.join(' ') + '"/>';
    var mk = '';
    if (R.ok) {
      mk += '<line class="rc-mk" x1="' + x(R.trough) + '" x2="' + x(R.trough) + '" y1="' + pt + '" y2="' + (H - pb) + '"/><circle class="rc-dot" cx="' + x(R.trough) + '" cy="' + yv(R.minV) + '" r="4"/>';
      if (R.rec >= 0) mk += '<line class="rc-mk ok" x1="' + x(R.rec) + '" x2="' + x(R.rec) + '" y1="' + pt + '" y2="' + (H - pb) + '"/><rect class="rc-span" x="' + x(R.trough) + '" y="' + (H - pb - 6) + '" width="' + (x(R.rec) - x(R.trough)) + '" height="4" rx="2"/>';
    }
    var ax = '<text x="' + x(0) + '" y="' + (H - 6) + '">' + tx('may ', 'May ') + R.ep + '</text><text x="' + x(36) + '" y="' + (H - 6) + '">' + tx('may ', 'May ') + (+R.ep + 1) + '</text><text x="' + (x(n - 1) - 40) + '" y="' + (H - 6) + '">' + tx('abr ', 'Apr ') + (+R.ep + 3) + '</text>' +
      [0, .5, 1].map(function (v) { return '<text x="2" y="' + (yv(v) + 4) + '">' + Math.round(v * 100) + '</text>'; }).join('');
    var svg = '<svg class="rc" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="GWETROOT"><polygon class="rc-band" points="' + band + '"/>' + line + mk + ax + '</svg>';
    var msg;
    if (!R.ok) msg = txp('En {0} la humedad radicular no bajó del rango habitual (percentil 25), así que no hay recuperación que medir.', 'In {0} root-zone wetness did not fall below the usual range (25th percentile), so there is no recovery to measure.', [season(R.ep)]);
    else {
      var lo = fd(dkStart(R.trough % 36)) + ' ' + R.ser[R.trough].y.replace(/^(\d+)$/, function (y) { return R.trough % 36 >= 24 ? +y + 1 : y; });
      msg = R.rec >= 0
        ? txp('<b>{0} días</b> aproximados desde el punto más seco ({1}) hasta que la humedad radicular volvió al rango habitual y se mantuvo 30 días.', '<b>About {0} days</b> from the driest point ({1}) until root-zone wetness returned to the usual range and stayed there for 30 days.', [(R.rec - R.trough) * 10, lo])
        : txp('Después del punto más seco ({0}) la humedad radicular no volvió al rango habitual dentro de los datos disponibles.', 'After the driest point ({0}) root-zone wetness did not return to the usual range within the available data.', [lo]);
    }
    box.innerHTML = '<p class="rc-msg">' + tx('Episodio: campaña ', 'Episode: season ') + '<b>' + season(R.ep) + '</b>. ' + msg + '</p>' + svg +
      '<div class="legend small"><span><i class="lg-line"></i>' + tx('Humedad radicular de esa campaña y la siguiente', 'Root-zone wetness in that season and the next') + '</span><span><i class="lg-band"></i>' + tx('Rango habitual (percentiles 25–75 de las demás campañas)', 'Usual range (25th–75th percentile of the other seasons)') + '</span></div>' +
      '<p class="mod-note">' + tx('GWETROOT es una estimación del modelo MERRA-2 para una celda de unos 50 km, no una medición del suelo de una parcela. La firma de vegetación con NDVI de NASA HLS por fecha es el siguiente paso; hoy las imágenes HLS solo se muestran.', 'GWETROOT is a MERRA-2 model estimate for a cell of about 50 km, not a measurement of a field’s soil. The vegetation signature from date-by-date NASA HLS NDVI is the next step; today HLS images are only displayed.') + '</p>';
  }
  function renderQuality(d, P) {
    var tot = 0, ok = 0;
    Object.keys(d.agg).forEach(function (y) { d.agg[y].forEach(function (x) { if (x.n > 0) { tot++; if (x.complete) ok++; } }); });
    var rows = [
      ['NASA POWER (PRECTOTCORR, T2M, T2M_MAX, T2M_MIN, TOA_SW_DWN, GWETROOT)', tx('celda ~0,5° × 0,625° (unos 50 km)', '~0.5° × 0.625° cell (about 50 km)'), tx('diaria → dekadas', 'daily → dekads'), tx('cálculo', 'scoring')],
      ['MODIS/Terra NDVI (MOD13)', '250 m', tx('16 días · enero', '16-day · January'), tx('solo contexto', 'context only')],
      ['NASA HLS (Landsat + Sentinel-2)', '30 m', tx('por fecha', 'per date'), tx('solo contexto', 'context only')],
      ['NOAA ONI', tx('índice del Pacífico', 'Pacific index'), tx('trimestral', 'quarterly'), tx('agrupar campañas', 'grouping seasons')],
      ['FAO-56', tx('coeficientes', 'coefficients'), '—', tx('demanda de agua', 'water demand')]
    ];
    $('dnaQuality').innerHTML = '<div class="q-top"><div><b>' + P.ys.length + '</b><span>' + tx('campañas completas', 'complete seasons') + '</span></div><div><b>' + Math.round(100 * ok / (tot || 1)) + ' %</b><span>' + tx('dekadas completas', 'complete dekads') + '</span></div><div><b>' + String(d.fetched).slice(0, 10) + '</b><span>' + tx('descarga', 'downloaded') + '</span></div></div>' +
      '<table class="q-tab"><thead><tr><th>' + tx('Fuente', 'Source') + '</th><th>' + tx('Resolución', 'Resolution') + '</th><th>' + tx('Frecuencia', 'Frequency') + '</th><th>' + tx('Uso', 'Use') + '</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' +
      '<p class="mod-note">' + tx('Cada capa conserva su propia resolución: una imagen de 30 m no convierte la lluvia de una celda de 50 km en un dato de 30 m.', 'Each layer keeps its own resolution: a 30 m image does not turn rainfall from a 50 km cell into 30 m data.') + '</p>';
  }

  // ---------- Climate Replay ----------
  function episodes(d) {
    var P = profile(d), rows = P.rows; if (rows.length < 5) return [];
    var soy = P.col('soyRain'), heat = rows.map(function (r) { return P.byA[r.y].heatDays; });
    var p20 = E.percentile(soy, 0.2), h80 = E.percentile(heat, 0.8);
    var out = [{ id: 'median', kind: 'base', title: tx('Año típico', 'Typical year'), big: n0(med(soy)) + ' mm', crit: txp('Mediana de las {0} campañas en cada indicador', 'Median of the {0} seasons for each indicator', [rows.length]) },
      { id: 'p80', kind: 'base', title: tx('Año desfavorable (1 de cada 5)', 'Bad year (1 in 5)'), big: 'p80', crit: tx('Percentil 80 de cada riesgo: no es una campaña real, combina lo peor de varias', '80th percentile of each risk: not a real season, it combines the worst of several') }];
    rows.slice().sort(function (a, b) { return a.soyRain - b.soyRain; }).filter(function (r) { return r.soyRain <= p20; }).slice(0, 3).forEach(function (r) {
      out.push({ id: r.y, kind: 'dry', title: season(r.y) + tx(' · seca', ' · dry'), big: n0(r.soyRain) + ' mm',
        crit: txp('Lluvia del ciclo de soja en el 20 % más bajo (umbral {0} mm). Percentil {1}.', 'Soybean-season rain in the lowest 20% (threshold {0} mm). Percentile {1}.', [n0(p20), pctRank(r.soyRain, soy)]) });
    });
    rows.map(function (r) { return { y: r.y, h: P.byA[r.y].heatDays }; }).sort(function (a, b) { return b.h - a.h; }).filter(function (r) { return r.h >= h80 && r.h > 0; }).slice(0, 2).forEach(function (r) {
      if (out.some(function (o) { return o.id === r.y; })) return;
      out.push({ id: r.y, kind: 'hot', title: season(r.y) + tx(' · calor', ' · heat'), big: r.h + tx(' días', ' days'),
        crit: txp('Días ≥ 35 °C en la floración de la soja en el 20 % más alto (umbral {0} días).', 'Days ≥ 35 °C at soybean flowering in the top 20% (threshold {0} days).', [n0(h80)]) });
    });
    var wet = rows.slice().sort(function (a, b) { return b.soyRain - a.soyRain; })[0];
    out.push({ id: wet.y, kind: 'wet', title: season(wet.y) + tx(' · lluviosa', ' · wet'), big: n0(wet.soyRain) + ' mm', crit: tx('La campaña con más lluvia en el ciclo de la soja.', 'The season with the most soybean-season rain.') });
    ['nino', 'nina'].forEach(function (ph) {
      var ys = P.ys.filter(function (y) { return RL.phaseOf(y) === ph; });
      if (ys.length >= 3) out.push({ id: ph, kind: ph, title: ph === 'nino' ? 'El Niño' : 'La Niña', big: ys.length + tx(' campañas', ' seasons'),
        crit: txp('Mediana de las campañas con ONI de NOAA {0} en nov–ene. Análisis histórico, no pronóstico.', 'Median of the seasons with NOAA ONI {0} in Nov–Jan. Historical analysis, not a forecast.', [ph === 'nino' ? (L() === 'es' ? '≥ +0,5' : '≥ +0.5') : (L() === 'es' ? '≤ −0,5' : '≤ −0.5')]) });
    });
    return out;
  }
  function stress(d, eps) {
    var list = RL.rots(), W = RL.weights(), soil = RL.soil();
    var by = {}; list.forEach(function (r) { by[r.id] = E.evaluateAllYears(r, d.agg, soil); });
    return eps.map(function (ep) {
      var res = {}; list.forEach(function (r) { res[r.id] = RL.scenVals(by[r.id], ep.id); });
      if (list.some(function (r) { return !res[r.id]; })) return null;
      var rows = E.compare(res, W), rank = {}, score = {};
      rows.forEach(function (x, i) { rank[x.id] = i + 1; score[x.id] = x.score; });
      return { ep: ep, rank: rank, score: score, top: rows[0].id };
    }).filter(Boolean);
  }
  var KIND_IC = { base: '', dry: '', hot: '', wet: '', nino: '', nina: '' }; // el color del borde ya indica el tipo; sin glifos que dependan de la fuente del sistema
  function renderReplay() {
    if (!$('rpCards')) return;
    var d = ds(), eps = episodes(d), sc = RL.scenario();
    $('rpCards').innerHTML = eps.map(function (ep) {
      return '<button type="button" class="ep ' + ep.kind + (String(ep.id) === sc ? ' on' : '') + '" data-replay="' + ep.id + '">' +
        '<span class="ep-k"><i aria-hidden="true">' + KIND_IC[ep.kind] + '</i>' + esc(ep.title) + '</span><b>' + ep.big + '</b><span class="ep-c">' + esc(ep.crit) + '</span>' +
        '</button>';
    }).join('') + '<p class="ep-hint">' + tx('Toca un episodio para reproducirlo en Rotation Lab.', 'Tap an episode to replay it in Rotation Lab.') + '</p>';
    var S = stress(d, eps), list = RL.rots();
    $('rpTestSrc').textContent = tx('suelo: ', 'soil: ') + RL.soilName(RL.soil()) + ' · ' + tx('tus prioridades', 'your priorities');
    var head = '<tr><th>' + tx('Rotación', 'Rotation') + '</th>' + S.map(function (s) { return '<th>' + esc(s.ep.title) + '</th>'; }).join('') + '<th>' + tx('Primera en', 'First in') + '</th><th>' + tx('Peor puesto', 'Worst rank') + '</th></tr>';
    var body = list.map(function (r) {
      var firsts = S.filter(function (s) { return s.top === r.id; }).length, worst = Math.max.apply(null, S.map(function (s) { return s.rank[r.id]; }));
      return '<tr><td><span class="chip win-' + r.id + '">' + r.id + '</span> ' + esc(RL.rotName(r)) + '</td>' + S.map(function (s) {
        return '<td class="' + (s.rank[r.id] === 1 ? 'r1' : s.rank[r.id] === list.length ? 'rl' : '') + '"><b>' + RL.num(s.score[r.id]) + '</b><small>#' + s.rank[r.id] + '</small></td>';
      }).join('') + '<td><b>' + firsts + '</b>/' + S.length + '</td><td>#' + worst + '</td></tr>';
    }).join('');
    $('rpMatrix').innerHTML = '<table class="stress"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
    var firstsAll = list.map(function (r) { return { id: r.id, f: S.filter(function (s) { return s.top === r.id; }).length }; }).sort(function (a, b) { return b.f - a.f; });
    $('rpNote').innerHTML = tx('Ninguna rotación es la mejor en todos los escenarios: ', 'No rotation is best in every scenario: ') +
      firstsAll.filter(function (x) { return x.f; }).map(function (x) { return '<b>' + x.id + '</b> ' + tx('primera en ', 'first in ') + x.f; }).join(', ') + '. ' +
      tx('Puntaje de 0 a 100 entre las rotaciones de cada columna, con tus prioridades. Lluvia observada, sin la lluvia hipotética.', 'Score from 0 to 100 among the rotations in each column, with your priorities. Observed rain, without the hypothetical rain setting.');
    return S;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-replay]'); if (!b) return;
    var sel = $('scenario'), v = b.dataset.replay;
    if (!Array.prototype.some.call(sel.options, function (o) { return o.value === v; })) return;
    sel.value = v; sel.dispatchEvent(new Event('change', { bubbles: true }));
    RL.showView('compare');
  });

  // ---------- Adaptive Monitor ----------
  function renderMonitor() {
    if (!$('amNow')) return;
    var d = ds(), ys = Object.keys(d.agg).sort(), full = RL.fullYears(d.agg);
    var cur = ys.filter(function (y) { return full.indexOf(y) < 0; }).pop();
    if (!cur) { $('amTitle').textContent = tx('Campaña en curso', 'Current season'); $('amNow').innerHTML = '<p class="mod-note">' + tx('No hay una campaña en curso en estos datos.', 'There is no ongoing season in this data.') + '</p>'; return; }
    var K = []; d.agg[cur].forEach(function (x, k) { if (x.complete) K.push(k); });
    if (!K.length) { $('amNow').innerHTML = ''; return; }
    var last = K[K.length - 1], miss = []; for (var k = 0; k <= last; k++) if (K.indexOf(k) < 0) miss.push(k);
    var lastYear = Math.floor(last / 3) >= 13 - RL.sm() ? +cur + 1 : +cur; // la dekada cae después de diciembre
    $('amTitle').textContent = tx('Campaña ', 'Season ') + season(cur) + ' · ' + txp('del {0} al {1}', '{0} to {1}', [fd(dkStart(0)) + ' ' + cur, fd(dkEnd(last)) + ' ' + lastYear]);
    var acc = function (y, key) { return K.reduce(function (s, k) { return s + d.agg[y][k][key]; }, 0); };
    var rain = acc(cur, 'p'), rainH = full.map(function (y) { return acc(y, 'p'); }), pr = pctRank(rain, rainH);
    var heat = acc(cur, 'heat'), heatH = full.map(function (y) { return acc(y, 'heat'); });
    var frost = acc(cur, 'frost'), frostH = full.map(function (y) { return acc(y, 'frost'); });
    var g = d.agg[cur][last].gwr, gH = full.map(function (y) { return d.agg[y][last].gwr; }), gp = pctRank(g, gH);
    var day = fd(dkEnd(last));
    // "Más que en 18 de 25 años" se entiende mejor que "percentil 72".
    var rank = function (v, arr) {
      var below = arr.filter(function (x) { return x < v; }).length, above = arr.filter(function (x) { return x > v; }).length, n = arr.length;
      if (below === 0 && above === 0) return tx('Igual que todos los años', 'Same as every year');
      if (above === 0) return txp('El valor más alto en {0} años', 'The highest in {0} years', [n + 1]);
      if (below === 0 && v > 0) return txp('El valor más bajo en {0} años', 'The lowest in {0} years', [n + 1]);
      if (below === 0) return txp('Como en {0} de {1} años', 'As in {0} of {1} years', [n - above, n]);
      return below >= above ? txp('Más que en {0} de {1} años', 'More than in {0} of {1} years', [below, n]) : txp('Menos que en {0} de {1} años', 'Less than in {0} of {1} years', [above, n]);
    };
    var items = [
      { v: tx('Lluvia desde el ', 'Rain since ') + fd(dkStart(0)), now: n0(rain) + ' mm', ref: tx('lo normal a esta fecha: ', 'normal by this date: ') + n0(med(rainH)) + ' mm', p: pr, rk: rank(rain, rainH), alert: pr <= 20, hi: pr >= 80, th: tx('está entre los años más secos a esta fecha', 'it is among the driest years by this date') },
      { v: tx('Humedad en la raíz', 'Moisture at root depth'), now: Math.round(g * 100) + ' %', ref: tx('lo normal al ', 'normal on ') + day + ': ' + Math.round(med(gH) * 100) + ' %', p: gp, rk: rank(g, gH), alert: gp <= 20, hi: gp >= 80, th: tx('está entre los valores más bajos para la fecha; es un modelo de la NASA, no una medición', 'it is among the lowest values for the date; it is a NASA model, not a measurement') },
      { v: tx('Días de mucho calor', 'Very hot days'), now: String(heat), ref: tx('35 °C o más · lo normal: ', '35 °C or more · normal: ') + n0(med(heatH)), p: pctRank(heat, heatH), rk: rank(heat, heatH), alert: heat > E.percentile(heatH, 0.8) && heat > 0, th: tx('hubo más que en 4 de cada 5 años', 'more than in 4 out of 5 years') },
      { v: tx('Días con riesgo de helada', 'Days with frost risk'), now: String(frost), ref: tx('2 °C o menos · lo normal: ', '2 °C or less · normal: ') + n0(med(frostH)), p: pctRank(frost, frostH), rk: rank(frost, frostH), alert: frost > E.percentile(frostH, 0.8) && frost > 0, th: tx('hubo más que en 4 de cada 5 años', 'more than in 4 out of 5 years') }
    ];
    var alerts = items.filter(function (i) { return i.alert; });
    // Una frase que cuenta cómo viene la campaña, antes de los números.
    var rainWord = pr >= 65 ? tx('más de lo normal', 'more than normal') : pr <= 35 ? tx('menos de lo normal', 'less than normal') : tx('lo normal', 'about the normal amount');
    var lead = txp('Hasta el {0} llovió <b>{1}</b> ({2} mm).', 'Up to {0} it has rained <b>{1}</b> ({2} mm).', [day, rainWord, n0(rain)]) + ' ' +
      (alerts.length ? txp('Hay algo para mirar de cerca: <b>{0}</b>.', 'One thing to look at closely: <b>{0}</b>.', [alerts.map(function (i) { return i.v.toLowerCase(); }).join(tx(' y ', ' and '))])
        : tx('Calor, heladas y humedad vienen dentro de lo normal para la fecha.', 'Heat, frost and moisture are within the normal range for the date.'));
    $('amNow').innerHTML = '<p class="lead">' + lead + '</p><div class="am-grid">' + items.map(function (i) {
      var st = i.alert ? 'warn' : 'ok';
      return '<div class="am ' + st + '"><span class="am-v">' + i.v + '</span><b>' + i.now + '</b><span class="am-r">' + i.ref + '</span>' +
        '<div class="am-bar" aria-hidden="true"><i style="left:' + i.p + '%"></i></div><div class="am-ends" aria-hidden="true"><span>' + tx('menos', 'less') + '</span><span>' + tx('normal', 'normal') + '</span><span>' + tx('más', 'more') + '</span></div>' +
        '<span class="am-p">' + i.rk + '</span>' +
        '<span class="am-s">' + (i.alert ? tx('Para mirar de cerca', 'Worth a closer look') : tx('Normal para la fecha', 'Normal for the date')) + '</span></div>';
    }).join('') + '</div>' +
      (alerts.length ? '<div class="am-alert"><b>' + tx('Qué se sale de lo normal', 'What is out of the ordinary') + '</b><p>' +
        alerts.map(function (i) { return i.v + ' (' + i.now + '): ' + i.th; }).join('; ') + '. ' +
        tx('Antes de cambiar algo, date una vuelta por el lote, mira en qué etapa está el cultivo y háblalo con tu técnico.', 'Before changing anything, walk the field, check the crop stage and talk it over with your technician.') + '</p></div>'
        : '<div class="am-alert ok"><b>' + tx('Todo viene normal', 'Everything looks normal') + '</b><p>' + tx('Lluvia, humedad, calor y heladas están dentro de lo que suele pasar a esta fecha.', 'Rain, moisture, heat and frost are within what usually happens by this date.') + '</p></div>') +
      '<p class="mod-note">' + txp('Se compara con las mismas fechas de {0} campañas anteriores. Datos de NASA POWER (área de unos 50 km), bajados el {1}.', 'Compared with the same dates in {0} earlier seasons. NASA POWER data (area of about 50 km), downloaded on {1}.', [full.length, String(d.fetched).slice(0, 10)]) + ' ' +
      (miss.length ? tx('No se contaron por datos incompletos: ', 'Left out for incomplete data: ') + miss.map(function (k) { return fd(dkStart(k)) + '–' + fd(dkEnd(k)); }).join(', ') + '. ' : '') +
      tx('Estos avisos no te dicen qué hacer: te avisan cuándo conviene mirar con más atención.', 'These notices do not tell you what to do: they tell you when to look more closely.') + '</p>';
  }

  // ---------- Inicio: tarjetas de módulos ----------
  var MODS = [
    ['field', 'Field Monitor', ['Mapa, zonas e imágenes de satélite', 'Map, areas and satellite images']],
    ['dna', 'Field DNA', ['25 campañas de clima de tu zona', '25 seasons of your area’s climate']],
    ['compare', 'Rotation Lab', ['Qué rotación equilibra tus prioridades', 'Which rotation balances your priorities']],
    ['replay', 'Climate Replay', ['Vuelve a jugar los años difíciles', 'Replay the tough years']],
    ['agenda', 'Adaptive Monitor', ['Cómo va la campaña actual', 'How the current season is going']],
    ['passport', 'Resilience Passport', ['Informe con fuentes, listo para imprimir', 'Report with sources, ready to print']]
  ];
  function renderHome() {
    var box = $('homeFlow'); if (!box) return;
    box.innerHTML = MODS.map(function (m, i) {
      var ic = document.querySelector('.nav-i[data-view="' + m[0] + '"] svg');
      return '<button type="button" class="fc" data-go="' + m[0] + '"><span class="fc-n">0' + (i + 1) + '</span>' + (ic ? ic.outerHTML : '') + '<b>' + m[1] + '</b><span>' + (L() === 'en' ? RL.tr(m[2][1]) : m[2][0]) + '</span></button>';
    }).join('');
  }

  // ---------- Resilience Passport ----------
  function renderPassport() {
    var box = $('passport'); if (!box) return;
    var d = ds(), P = profile(d), rows = P.rows, W = RL.weights(), dims = RL.dims();
    if (!rows.length) { box.innerHTML = ''; return; }
    var scSel = $('scenario'), scTxt = scSel.options[scSel.selectedIndex] ? scSel.options[scSel.selectedIndex].text : '';
    var eps = episodes(d), S = stress(d, eps), list = RL.rots();
    var conf = E.confidence({ nYears: P.ys.length, source: d.source, soil: RL.soil(), lang: L(), template: !d.local, tropical: !!d.tropical });
    var parcelLine = d.poly ? '<p>' + tx('Parcela delimitada de ', 'Outlined field of ') + '<b>' + RL.num(d.ha, 1) + ' ha</b>. ' + tx('El clima es el de la celda regional de NASA POWER (unos 50 km) que contiene su centro; las imágenes satelitales son de 30 m.', 'Climate is that of the regional NASA POWER cell (about 50 km) containing its centre; satellite images are 30 m.') + '</p>' : '';
    var V = RL.valNumbers();
    var ms = RL.monthStats(d.agg), mon = MON[L()];
    var R = recovery(d, P);
    var sec = function (n, title, body) { return '<section class="pp-sec"><h3><span>' + n + '</span>' + title + '</h3>' + body + '</section>'; };
    var dry = rows.slice().sort(function (a, b) { return a.soyRain - b.soyRain; })[0];
    var typ = S.filter(function (s) { return s.ep.id === 'median'; })[0], bad = S.filter(function (s) { return s.ep.id === 'p80'; })[0];
    var rn = function (id) { var r = list.filter(function (x) { return x.id === id; })[0]; return r ? id + ' · ' + esc(RL.rotName(r)) : id; };
    box.innerHTML =
      '<header class="pp-head"><div><p class="pp-k">YvyShift · Resilience Passport</p><h3>' + esc(RL.placeLabel(d)) + '</h3><p>' + d.lat + ', ' + d.lon + ' · ' + tx('suelo ', 'soil ') + esc(RL.soilName(RL.soil())) + ' · ' + tx('escenario: ', 'scenario: ') + esc(scTxt) + '</p>' + parcelLine + '</div>' +
      '<div class="pp-meta"><span>' + tx('Generado ', 'Generated ') + new Date().toISOString().slice(0, 10) + '</span><span>' + tx('Datos NASA POWER del ', 'NASA POWER data from ') + String(d.fetched).slice(0, 10) + '</span><span class="pp-badge">' + esc(L() === 'en' ? RL.tr(conf.label) : conf.label) + '</span></div></header>' +
      sec(1, 'Field DNA', '<div class="kpis sm">' + $('dnaCards').innerHTML + '</div>') +
      sec(2, tx('Historia climática', 'Climate history'), '<ul class="pp-list">' + eps.filter(function (e) { return e.kind !== 'base'; }).map(function (e) { return '<li><b>' + esc(e.title) + '</b> · ' + e.big + ' · ' + esc(e.crit) + '</li>'; }).join('') + '</ul>') +
      sec(3, tx('Recuperación de la humedad (experimental)', 'Moisture recovery (experimental)'), '<p>' + ($('dnaRecovery').querySelector('.rc-msg') || { innerHTML: '' }).innerHTML + '</p><p class="mod-note">' + tx('Humedad de zona radicular del modelo MERRA-2 (GWETROOT), celda regional. No es la recuperación del suelo de una parcela.', 'MERRA-2 model root-zone wetness (GWETROOT), regional cell. Not the recovery of a field’s soil.') + '</p>') +
      sec(4, tx('Prueba de estrés de las rotaciones', 'Rotation stress test'), '<div class="table-wrap">' + $('rpMatrix').innerHTML + '</div><p class="mod-note">' + tx('Prioridades usadas: ', 'Priorities used: ') + Object.keys(W).map(function (k) { return dims[k] + ' ' + W[k]; }).join(' · ') + '</p>') +
      sec(5, tx('Perfil de riesgo mes a mes', 'Month-by-month risk profile'), '<div class="table-wrap"><table class="pp-risk"><thead><tr><th></th>' + ms.map(function (m) { return '<th>' + mon[m.m] + '</th>'; }).join('') + '</tr></thead><tbody>' +
        '<tr><td>' + tx('Lluvia mediana (mm)', 'Median rain (mm)') + '</td>' + ms.map(function (m) { return '<td>' + m.rain + '</td>'; }).join('') + '</tr>' +
        '<tr><td>' + tx('Años con helada', 'Years with frost') + '</td>' + ms.map(function (m) { return '<td' + (m.frost / m.n >= 0.3 ? ' class="cold"' : '') + '>' + m.frost + '/' + m.n + '</td>'; }).join('') + '</tr>' +
        '<tr><td>' + tx('Años con ≥ 35 °C', 'Years with ≥ 35 °C') + '</td>' + ms.map(function (m) { return '<td' + (m.heat / m.n >= 0.5 ? ' class="hot"' : '') + '>' + m.heat + '/' + m.n + '</td>'; }).join('') + '</tr></tbody></table></div>') +
      sec(6, tx('Confianza', 'Confidence'), '<ul class="pp-list">' + conf.reasons.map(function (x) { return '<li>' + (L() === 'en' ? RL.tr(x) : x) + '</li>'; }).join('') + '</ul>' +
        (V ? '<p>' + (d.local ? '' : tx('Validado solo en Paraguay. ', 'Validated in Paraguay only. ')) + tx('Validación con datos que el modelo no usó: el agua que le faltó a la soja según el modelo frente al rendimiento real de Paraguay (FAO), r = ', 'Validation with data the model did not use: modelled soybean water shortfall against Paraguay’s real yield (FAO), r = ') + RL.num(V.rDeficit) + '.</p>' : '')) +
      sec(7, tx('Alternativas evaluadas y por qué', 'Alternatives assessed and why'), '<ul class="pp-list">' +
        (typ ? '<li>' + tx('En un año típico queda primera ', 'In a typical year the top one is ') + '<b>' + rn(typ.top) + '</b>.</li>' : '') +
        (bad ? '<li>' + tx('En un año desfavorable (1 de cada 5) queda primera ', 'In a bad year (1 in 5) the top one is ') + '<b>' + rn(bad.top) + '</b>.</li>' : '') +
        '<li>' + txp('En la campaña más seca ({0}) ', 'In the driest season ({0}) ', [season(dry.y)]) + '<b>' + rn((S.filter(function (s) { return s.ep.id === dry.y; })[0] || {}).top || '—') + '</b>.</li>' +
        '<li>' + tx('Esto compara compromisos con tus prioridades; no es una recomendación de siembra ni un pronóstico de rendimiento. Las fechas de siembra son supuestas y conviene validarlas con un técnico.', 'This compares trade-offs given your priorities; it is not a sowing recommendation or a yield forecast. Sowing dates are assumptions and should be checked with a technician.') + '</li></ul>') +
      sec(8, tx('Procedencia de los datos', 'Data provenance'), $('dnaQuality').querySelector('table').outerHTML + '<p class="mod-note">' + tx('Métodos: ET0 Hargreaves-Samani (FAO-56 ec. 52), Kc FAO-56 Tabla 12, balance de agua con capacidad del suelo FAO-56 Tabla 19. Umbrales: calor ≥ 35 °C, helada ≤ 2 °C (supuestos a validar).', 'Methods: Hargreaves-Samani ET0 (FAO-56 eq. 52), FAO-56 Table 12 Kc, soil water balance with FAO-56 Table 19 capacity. Thresholds: heat ≥ 35 °C, frost ≤ 2 °C (assumptions to validate).') + '</p>');
  }

  // ---------- Ciclo de vida ----------
  var view = 'home';
  function renderAll() {
    try { renderZones(); renderDNA(); renderReplay(); renderMonitor(); renderHome(); if (view === 'passport') renderPassport(); }
    catch (e) { if (window.console) console.error(e); }
  }
  document.addEventListener('rl:render', function () { profCache = {}; renderAll(); });
  document.addEventListener('rl:view', function (e) {
    view = e.detail;
    if (view === 'passport') { try { renderPassport(); } catch (err) { if (window.console) console.error(err); } }
    window.dispatchEvent(new Event('resize'));
  });
  var pp = $('ppPrint'); if (pp) pp.addEventListener('click', function () { renderPassport(); window.print(); });
  window.addEventListener('beforeprint', function () { if (view === 'passport') renderPassport(); });
  new MutationObserver(function () { renderHome(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  renderAll();
})();
