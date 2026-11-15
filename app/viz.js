/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). */
/*
 * YvyShift v20 · Dibujos de los datos (solo diseño).
 * Este archivo solo DIBUJA: lee los mismos datos que ya muestran app.js y terra.js y agrega gráficos SVG
 * dentro de contenedores que ya existen. No cambia cálculos, textos, IDs ni funciones.
 * Escritorio (maqueta B): relato sin recuadros, barras de 25 campañas y regla de humedad.
 * Celular (maqueta A): cada dato dibujado como lo que es (pluviómetro, puntos, calendario, copos, corte de suelo).
 */
(function () {
  'use strict';
  var RL = window.RL; if (!RL) return;
  var E = RL.E;
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';
  function en() { return RL.lang() === 'en'; }
  function tx(es, eng) { return en() ? eng : es; }
  function season(y) { return y + '–' + String(+y + 1).slice(2); }
  function n0(v) { return RL.num(Math.round(v)); }
  function sum(dk, a, b, k) { var s = 0; for (var i = a; i <= b; i++) s += dk[i][k]; return s; }
  function mean(dk, a, b, k) { return sum(dk, a, b, k) / (b - a + 1); }
  function med(a) { return a.length ? E.percentile(a, 0.5) : 0; }
  function svg(vb, cls, body, label) {
    return '<svg xmlns="' + NS + '" viewBox="' + vb + '" class="' + cls + '"' + (label ? ' role="img" aria-label="' + RL.esc(label) + '"' : ' aria-hidden="true" focusable="false"') + '>' + body + '</svg>';
  }

  // Mismo ciclo y ventanas que terra.js (soja de la rotación base; calor oct–mar; helada may–sep).
  var SOY = E.ROTATIONS[0].crops[0], SOY_A = SOY.start, SOY_B = SOY.start + SOY.len - 1;
  var HOT_A = 15, HOT_B = 32, COLD_A = 0, COLD_B = 14;

  function rows() {
    var d = RL.datasets[RL.loc()]; if (!d) return [];
    var ys = Object.keys(d.agg).filter(function (y) { return d.agg[y].every(function (x) { return x.complete; }); }).sort();
    var byA = E.evaluateAllYears(E.ROTATIONS[0], d.agg, RL.soil());
    return ys.map(function (y) {
      var dk = d.agg[y];
      return { y: y, soyRain: sum(dk, SOY_A, SOY_B, 'p'), soyDemand: byA[y].cropWaterDemand, rain: sum(dk, 0, 35, 'p'),
        heat: sum(dk, HOT_A, HOT_B, 'heat'), frost: sum(dk, COLD_A, COLD_B, 'frost'), gwr: mean(dk, SOY_A, SOY_B, 'gwr') };
    });
  }

  // ---------- Íconos (trazos simples, heredan el color del tema) ----------
  var IC = {
    rain: '<path d="M12 3c3.5 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.4 6-11z"/>',
    gauge: '<path d="M8 3h8M9 3v15a3 3 0 0 0 6 0V3"/><path d="M9 11h6M9 15h6"/>',
    dots: '<circle cx="6" cy="7" r="2"/><circle cx="12" cy="7" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="6" cy="14" r="2"/><circle cx="12" cy="14" r="2"/><circle cx="18" cy="14" r="2"/>',
    crack: '<path d="M3 18h18M6 18l2-5 3 2 2-6 3 4 2-3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    flake: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5"/>',
    soil: '<path d="M3 9h18"/><path d="M12 3v6M12 9v4l-3 3M12 13l3 4M12 16v4"/><path d="M5 9c1-2 2-2 3 0M16 9c1-2 2-2 3 0"/>',
    sensor: '<path d="M10 3h4v9h-4z"/><path d="M12 12v9M9 21h6M7 6.5a6 6 0 0 0 0 4M17 6.5a6 6 0 0 1 0 4"/>',
    station: '<path d="M12 22V8M8 22h8M12 8l-5-3M12 8l5-3M12 8V3"/><circle cx="12" cy="3" r="1"/><path d="M5 12h4M15 12h4"/>',
    valve: '<path d="M3 15h7M14 15h7M10 12h4v6h-4z"/><path d="M12 12V8M9 8h6"/><path d="M18 19c0 1.1-.9 2-2 2"/>',
    field: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>'
  };
  function icon(name, cls) { return svg('0 0 24 24', 'vz-ic ' + (cls || ''), IC[name]); }

  // ---------- Field DNA ----------
  function dnaBars(R, dry, wet) {
    var W = 1000, H = 250, pl = 6, pr = 6, pt = 46, pb = 26, n = R.length, bw = (W - pl - pr) / n;
    var mx = Math.max.apply(null, R.map(function (r) { return Math.max(r.soyRain, r.soyDemand); })) * 1.04;
    var y = function (v) { return pt + (H - pt - pb) * (1 - v / mx); };
    var need = med(R.map(function (r) { return r.soyDemand; }));
    var out = '<line class="vb-need" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(need).toFixed(1) + '" y2="' + y(need).toFixed(1) + '"/>';
    R.forEach(function (r, i) {
      var x = pl + i * bw + bw * 0.14, w = bw * 0.72, h = (H - pb) - y(r.soyRain), short = r.soyRain < r.soyDemand;
      out += '<rect class="vb ' + (short ? 'vb-short' : 'vb-ok') + (r.y === RL.scenario() ? ' vb-sel' : '') + '" x="' + x.toFixed(1) + '" y="' + y(r.soyRain).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(1, h).toFixed(1) + '" rx="3"><title>' +
        season(r.y) + ': ' + n0(r.soyRain) + ' mm · ' + tx('pedía ', 'needed ') + n0(r.soyDemand) + ' mm</title></rect>';
      if (i % 4 === 0 || i === n - 1) out += '<text class="vb-x" x="' + (x + w / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + String(r.y).slice(2) + '/' + String(+r.y + 1).slice(2) + '</text>';
    });
    [[dry, tx('la seca grande', 'the big drought'), 'vb-tag-dry'], [wet, tx('la más lluviosa', 'the wettest'), 'vb-tag-wet']].forEach(function (t) {
      if (!t[0]) return;
      var i = R.indexOf(t[0]), cx = pl + i * bw + bw / 2, top = y(t[0].soyRain), anchor = cx > W / 2 ? 'end' : 'start';
      var ty = t[2] === 'vb-tag-wet' ? 14 : 34;
      out += '<line class="vb-lead ' + t[2] + '" x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="' + (ty + 5) + '" y2="' + (top - 3).toFixed(1) + '"/>' +
        '<text class="vb-tag ' + t[2] + '" x="' + cx.toFixed(1) + '" y="' + ty + '" text-anchor="' + anchor + '"><tspan font-weight="700">' + season(t[0].y) + '</tspan> · ' + t[1] + '</text>';
    });
    var short = R.filter(function (r) { return r.soyRain < r.soyDemand; }).length;
    return svg('0 0 ' + W + ' ' + H, 'vz-bars', out, tx('Lluvia en el ciclo de la soja, 25 campañas. ', 'Rain in the soybean cycle, 25 seasons. ') + short + tx(' campañas con falta de agua.', ' seasons short of water.')) +
      '<p class="vz-key"><span class="k-short"></span>' + tx('a la soja le faltó agua', 'soybean was short of water') + '<span class="k-ok"></span>' + tx('le alcanzó', 'it was enough') + '<span class="k-need"></span>' + tx('lo que pide la soja en un año normal: ', 'what soybean asks for in a normal year: ') + n0(med(R.map(function (r) { return r.soyDemand; }))) + ' mm</p>';
  }
  function dnaRuler(R, dry) {
    var W = 1000, H = 92, pl = 20, pr = 20, vals = R.map(function (r) { return r.gwr; });
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), m = med(vals);
    var x = function (v) { return pl + (W - pl - pr) * (v - mn) / ((mx - mn) || 1); };
    var out = '<line class="vr-axis" x1="' + pl + '" x2="' + (W - pr) + '" y1="46" y2="46"/>' +
      '<line class="vr-med" x1="' + x(m).toFixed(1) + '" x2="' + x(m).toFixed(1) + '" y1="30" y2="62"/>' +
      '<text class="vr-t" x="' + x(m).toFixed(1) + '" y="22" text-anchor="middle">' + tx('lo normal ', 'normal ') + Math.round(m * 100) + ' %</text>' +
      '<text class="vr-t vr-end" x="' + pl + '" y="84">' + tx('más seco ', 'drier ') + Math.round(mn * 100) + ' %</text>' +
      '<text class="vr-t vr-end" x="' + (W - pr) + '" y="84" text-anchor="end">' + tx('más húmedo ', 'wetter ') + Math.round(mx * 100) + ' %</text>';
    R.forEach(function (r) {
      out += '<circle class="vr-dot' + (r === dry ? ' vr-dry' : '') + (r.y === RL.scenario() ? ' vr-sel' : '') + '" cx="' + x(r.gwr).toFixed(1) + '" cy="46" r="' + (r === dry ? 9 : 7) + '"><title>' + season(r.y) + ': ' + Math.round(r.gwr * 100) + ' %</title></circle>';
    });
    return svg('0 0 ' + W + ' ' + H, 'vz-ruler', out, tx('Humedad en la raíz durante la soja, un punto por campaña.', 'Root-zone moisture during soybean, one dot per season.'));
  }
  // Dibujos de celular (maqueta A), uno por tarjeta.
  function pluvio(v, max, cls) {
    var f = Math.max(0.04, Math.min(1, v / max)), top = 10 + 76 * (1 - f);
    return svg('0 0 60 100', 'vz-draw ' + cls,
      '<path class="pv-glass" d="M14 6h32M18 6v80a12 12 0 0 0 24 0V6"/>' +
      '<path class="pv-water" d="M19 ' + top.toFixed(1) + 'h22v' + (86 - top).toFixed(1) + 'a11 11 0 0 1-22 0z"/>' +
      [26, 46, 66].map(function (yy) { return '<path class="pv-tick" d="M42 ' + yy + 'h6"/>'; }).join(''));
  }
  function dots25(R) {
    var out = '';
    R.forEach(function (r, i) {
      var short = r.soyRain < r.soyDemand, cx = 10 + (i % 5) * 20, cy = 10 + Math.floor(i / 5) * 20;
      out += '<circle class="' + (short ? 'dt-short' : 'dt-ok') + '" cx="' + cx + '" cy="' + cy + '" r="7"><title>' + season(r.y) + '</title></circle>';
    });
    return svg('0 0 100 100', 'vz-draw dt', out);
  }
  function dryBars(dry, normal) {
    var mx = Math.max(dry, normal), h = function (v) { return 70 * v / mx; };
    return svg('0 0 100 100', 'vz-draw db',
      '<rect class="db-n" x="14" y="' + (86 - h(normal)).toFixed(1) + '" width="28" height="' + h(normal).toFixed(1) + '" rx="4"/>' +
      '<rect class="db-d" x="58" y="' + (86 - h(dry)).toFixed(1) + '" width="28" height="' + h(dry).toFixed(1) + '" rx="4"/>' +
      '<path class="db-base" d="M6 87h88"/>');
  }
  function summerCal(days) {
    // Oct a mar: 6 meses de unas 4 semanas; se marcan tantos días como el número del dato (no son fechas reales).
    var out = '', n = Math.min(days, 168), c = 0;
    for (var m = 0; m < 6; m++) for (var w = 0; w < 4; w++) for (var d = 0; d < 7; d++) {
      var on = ((c * 7919) % 168) < n; c++;
      out += '<rect class="' + (on ? 'cal-on' : 'cal-off') + '" x="' + (m * 16 + d * 2.1 + 1).toFixed(1) + '" y="' + (w * 12 + 30) + '" width="1.7" height="9" rx=".6"/>';
    }
    return svg('0 0 98 82', 'vz-draw cal', out + ['o', 'n', 'd', 'e', 'f', 'm'].map(function (l, i) { return '<text class="cal-m" x="' + (i * 16 + 8) + '" y="22" text-anchor="middle">' + l.toUpperCase() + '</text>'; }).join(''));
  }
  function flakes(k) {
    var out = '', n = Math.min(Math.max(k, 0), 12);
    for (var i = 0; i < 12; i++) {
      var cx = 14 + (i % 4) * 24, cy = 18 + Math.floor(i / 4) * 28, on = i < n;
      out += '<g class="' + (on ? 'fl-on' : 'fl-off') + '" transform="translate(' + cx + ' ' + cy + ') scale(.42)"><path d="M0-14V14M-12-7L12 7M-12 7L12-7M-4-10L0-6 4-10M-4 10L0 6 4 10"/></g>';
    }
    return svg('0 0 100 90', 'vz-draw fl', out);
  }
  function soilCut(v, m) {
    var lvl = 18 + 66 * (1 - Math.max(0, Math.min(1, v)));
    return svg('0 0 120 100', 'vz-draw sc',
      '<rect class="sc-dry" x="0" y="18" width="120" height="82" rx="8"/>' +
      '<rect class="sc-wet" x="0" y="' + lvl.toFixed(1) + '" width="120" height="' + (100 - lvl).toFixed(1) + '"/>' +
      '<path class="sc-top" d="M0 18h120"/>' +
      '<path class="sc-plant" d="M60 18V4M60 10c-6-6-12-4-14-2M60 8c6-6 12-4 14-2"/>' +
      '<path class="sc-root" d="M60 18v40M60 30l-12 14M60 34l14 16M60 46l-8 16M60 50l7 18"/>' +
      '<path class="sc-norm" d="M4 ' + (18 + 66 * (1 - m)).toFixed(1) + 'h112"/>');
  }

  function decorateDNA() {
    var box = $('vzDna'), cards = $('dnaCards'); if (!box || !cards) return;
    var R = rows(); if (!R.length) { box.innerHTML = ''; return; }
    var dry = R.slice().sort(function (a, b) { return a.soyRain - b.soyRain; })[0];
    var wet = R.slice().sort(function (a, b) { return b.soyRain - a.soyRain; })[0];
    var gm = med(R.map(function (r) { return r.gwr; }));
    box.innerHTML =
      '<figure class="vz-fig vz-pc">' + dnaBars(R, dry, wet) + '</figure>' +
      '<figure class="vz-fig vz-pc vz-hum"><figcaption>' + icon('soil') + tx('Humedad en la raíz mientras crece la soja: un punto por campaña', 'Root-zone moisture while soybean grows: one dot per season') + '</figcaption>' + dnaRuler(R, dry) +
        '<p class="vz-foot">' + tx('Estimación de un modelo de la NASA (GWETROOT), no una medición en tu suelo.', 'Estimate from a NASA model (GWETROOT), not a measurement in your soil.') + '</p></figure>';
    var ks = cards.querySelectorAll('.kpi');
    var draw = [
      ['gauge', 'pv', function () { return pluvio(med(R.map(function (r) { return r.rain; })), Math.max.apply(null, R.map(function (r) { return r.rain; })), 'pv'); }],
      ['rain', 'pv2', function () { return pluvio(med(R.map(function (r) { return r.soyRain; })), Math.max.apply(null, R.map(function (r) { return r.soyRain; })), 'pv'); }],
      ['dots', 'dts', function () { return dots25(R); }],
      ['crack', 'dry', function () { return dryBars(dry.soyRain, med(R.map(function (r) { return r.soyRain; }))); }],
      ['sun', 'hot', function () { return summerCal(Math.round(med(R.map(function (r) { return r.heat; })))); }],
      ['flake', 'cold', function () { return flakes(Math.round(med(R.map(function (r) { return r.frost; })))); }]
    ];
    Array.prototype.forEach.call(ks, function (k, i) {
      if (!draw[i] || k.querySelector('.vz-ic')) return;
      k.classList.add('vz-k', 'vz-' + draw[i][1]);
      k.insertAdjacentHTML('afterbegin', icon(draw[i][0], 'vz-kic'));
      k.insertAdjacentHTML('beforeend', '<span class="vz-kdraw" aria-hidden="true">' + draw[i][2]() + '</span>');
    });
    // Celular: la humedad como un corte de suelo con raíz (tarjeta propia, solo dibujo + dato que ya muestra la franja).
    if (!cards.querySelector('.vz-soilcard')) {
      cards.insertAdjacentHTML('beforeend', '<div class="kpi vz-k vz-soil vz-soilcard">' + icon('soil', 'vz-kic') + '<span class="k-l">' + tx('Humedad en la raíz', 'Moisture at root depth') + '</span><b>' + Math.round(gm * 100) + '<small> %</small></b>' +
        '<span class="k-s">' + tx('lo normal mientras crece la soja; en ', 'normal while soybean grows; in ') + season(dry.y) + ': ' + Math.round(dry.gwr * 100) + ' %</span><span class="vz-kdraw" aria-hidden="true">' + soilCut(dry.gwr, gm) + '</span></div>');
    }
  }

  // ---------- Climate Replay: línea de tiempo de los episodios ----------
  function decorateReplay() {
    var box = $('vzReplay'), cards = $('rpCards'); if (!box || !cards) return;
    var R = rows(); if (!R.length) { box.innerHTML = ''; return; }
    var eps = Array.prototype.map.call(cards.querySelectorAll('.ep'), function (b) {
      var kind = ['dry', 'hot', 'wet', 'nino', 'nina', 'base'].filter(function (c) { return b.classList.contains(c); })[0] || 'base';
      return { id: b.getAttribute('data-replay'), kind: kind, on: b.classList.contains('on'), title: (b.querySelector('.ep-k') || b).textContent.trim() };
    });
    var W = 1000, H = 150, pl = 8, pr = 8, n = R.length, bw = (W - pl - pr) / n, mx = Math.max.apply(null, R.map(function (r) { return r.soyRain; }));
    var out = '<line class="tl-axis" x1="' + pl + '" x2="' + (W - pr) + '" y1="112" y2="112"/>';
    var nino = eps.some(function (e) { return e.id === 'nino'; });
    R.forEach(function (r, i) {
      var x = pl + i * bw + bw / 2, h = 70 * r.soyRain / mx, ph = RL.phaseOf ? RL.phaseOf(r.y) : null;
      out += '<rect class="tl-bar' + (ph === 'nino' ? ' tl-nino' : ph === 'nina' ? ' tl-nina' : '') + '" x="' + (x - bw * 0.3).toFixed(1) + '" y="' + (110 - h).toFixed(1) + '" width="' + (bw * 0.6).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2"><title>' + season(r.y) + ': ' + n0(r.soyRain) + ' mm</title></rect>';
      if (i % 4 === 0 || i === n - 1) out += '<text class="tl-x" x="' + x.toFixed(1) + '" y="132" text-anchor="middle">' + String(r.y).slice(2) + '/' + String(+r.y + 1).slice(2) + '</text>';
    });
    eps.forEach(function (e) {
      var i = -1; R.forEach(function (r, j) { if (r.y === e.id) i = j; }); if (i < 0) return;
      var x = pl + i * bw + bw / 2, h = 70 * R[i].soyRain / mx;
      out += '<g class="tl-ep tl-' + e.kind + (e.on ? ' tl-on' : '') + '"><line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="22" y2="' + (110 - h - 4).toFixed(1) + '"/><circle cx="' + x.toFixed(1) + '" cy="18" r="' + (e.on ? 9 : 7) + '"/></g>';
    });
    box.innerHTML = '<figure class="vz-fig">' + svg('0 0 ' + W + ' ' + H, 'vz-tl', out, tx('Línea de tiempo de 25 campañas con los episodios marcados.', 'Timeline of 25 seasons with the episodes marked.')) +
      '<p class="vz-key">' + [['dry', tx('seca', 'dry')], ['hot', tx('calor', 'heat')], ['wet', tx('lluviosa', 'wet')]].filter(function (k) { return eps.some(function (e) { return e.kind === k[0]; }); }).map(function (k) { return '<span class="k-' + k[0] + '"></span>' + k[1]; }).join('') +
      (nino ? '<span class="k-nino"></span>El Niño<span class="k-nina"></span>La Niña' : '') + '<span class="k-bar"></span>' + tx('lluvia en el ciclo de la soja', 'rain in the soybean cycle') + '</p></figure>';
    var IKIND = { dry: 'crack', hot: 'sun', wet: 'rain', nino: 'rain', nina: 'rain', base: 'dots' };
    Array.prototype.forEach.call(cards.querySelectorAll('.ep'), function (b, i) {
      var k = cards.querySelectorAll('.ep-k i')[i];
      if (k && !k.firstChild) k.innerHTML = icon(IKIND[eps[i].kind] || 'dots');
    });
  }

  // ---------- Adaptive Monitor ----------
  function decorateMonitor() {
    var g = document.querySelector('#amNow .am-grid'); if (!g) return;
    var names = ['rain', 'soil', 'sun', 'flake'], cls = ['am-rain', 'am-soil', 'am-heat', 'am-cold'];
    Array.prototype.forEach.call(g.querySelectorAll('.am'), function (a, i) {
      if (a.querySelector('.vz-ic')) return;
      a.classList.add(cls[i] || 'am-x');
      a.insertAdjacentHTML('afterbegin', icon(names[i] || 'dots', 'vz-aic'));
    });
    var al = document.querySelector('#amNow .am-alert');
    if (al && !al.querySelector('.vz-ic')) al.insertAdjacentHTML('afterbegin', icon(al.classList.contains('ok') ? 'field' : 'sun', 'vz-alic'));
  }

  // ---------- Informe: ícono por sección ----------
  var PP_IC = ['dots', 'rain', 'soil', 'crack', 'sun', 'flake', 'field', 'gauge'];
  function decoratePassport() {
    Array.prototype.forEach.call(document.querySelectorAll('#passport .pp-sec > h3 > span:first-child'), function (s, i) {
      if (s.parentNode.querySelector('.vz-ic')) return;
      s.insertAdjacentHTML('afterend', icon(PP_IC[i % PP_IC.length], 'vz-ppic'));
    });
  }

  // ---------- Mis parcelas y sensores ----------
  function decorateParcels() {
    var ul = $('pList'); if (!ul) return;
    Array.prototype.forEach.call(ul.children, function (li) {
      if (li.querySelector('.vz-ic') || li.classList.contains('muted')) return;
      li.insertAdjacentHTML('afterbegin', '<span class="vz-plot" aria-hidden="true">' + icon('field') + '</span>');
    });
  }
  function decorateDevices() {
    var dts = document.querySelectorAll('#v-devices .dev-list dt'), names = ['sensor', 'station', 'valve'];
    Array.prototype.forEach.call(dts, function (dt, i) {
      if (dt.querySelector('.vz-ic')) return;
      dt.classList.add('vz-dev', 'vz-dev' + i);
      dt.insertAdjacentHTML('afterbegin', icon(names[i] || 'sensor', 'vz-devic'));
    });
  }

  function all() {
    [decorateDNA, decorateReplay, decorateMonitor, decoratePassport, decorateParcels, decorateDevices].forEach(function (f) {
      try { f(); } catch (e) { if (window.console) console.error('viz', e); }
    });
  }
  // terra.js y app.js vuelven a dibujar en cada cambio; los dibujos se agregan después.
  document.addEventListener('rl:render', function () { setTimeout(all, 0); });
  document.addEventListener('rl:view', function () { setTimeout(all, 0); });
  var pl = $('pList'); if (pl) new MutationObserver(decorateParcels).observe(pl, { childList: true });
  new MutationObserver(function () { setTimeout(all, 0); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  all();
})();
