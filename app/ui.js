/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). La app no usa IA en ejecución. */
/* Capa de interfaz de YvyShift: plegables, portada con imagen satelital y ayudas de lectura.
 * No calcula nada: los números salen de engine.js y app.js. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  function lang() { return root.lang === 'es' ? 'es' : 'en'; }

  // Botones de la portada que llevan a un módulo.
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b) return;
    var nav = document.querySelector('.nav-i[data-view="' + b.dataset.go + '"]'); if (nav) nav.click();
  });

  // Portada: deslizador entre las dos imágenes NASA HLS de Itapúa.
  var range = $('hvRange'), topImg = $('hvTop'), line = $('hvLine');
  function setSplit(v) {
    if (!topImg) return;
    topImg.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
    line.style.left = v + '%';
  }
  if (range) {
    range.addEventListener('input', function () { stopDemo(); setSplit(+range.value); });
    setSplit(+range.value);
    // Movimiento de presentación: se detiene al primer toque o si el sistema pide menos movimiento.
    var demo = null, t0 = null;
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var stopDemo = function () { if (demo) { cancelAnimationFrame(demo); demo = null; } };
    if (!calm && window.requestAnimationFrame) {
      var step = function (ts) {
        if (t0 == null) t0 = ts;
        var s = (ts - t0) / 1000;
        if (s > 6) { demo = null; range.value = 55; setSplit(55); return; }
        var v = 55 + 30 * Math.sin(s * Math.PI / 1.5) * Math.exp(-s / 4);
        range.value = v; setSplit(v);
        demo = requestAnimationFrame(step);
      };
      demo = requestAnimationFrame(step);
      ['pointerdown', 'keydown'].forEach(function (ev) { range.addEventListener(ev, stopDemo); });
    }
  }

  // Abrir los plegables que contienen un elemento (para enlaces, el asistente y la impresión).
  function openAncestors(el) {
    for (var n = el; n && n !== document.body; n = n.parentElement) if (n.tagName === 'DETAILS') n.open = true;
  }
  var nativeSIV = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function () { openAncestors(this); return nativeSIV.apply(this, arguments); };
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#s-"], a[href^="#fd-"]'); if (!a) return;
    var t = document.querySelector(a.getAttribute('href')); if (t) openAncestors(t);
  });
  // El mapa calcula su tamaño cuando se vuelve visible.
  document.querySelectorAll('details').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) window.dispatchEvent(new Event('resize')); });
  });
  var before = [];
  window.addEventListener('beforeprint', function () {
    before = [];
    document.querySelectorAll('#v-compare details').forEach(function (d) { before.push([d, d.open]); d.open = true; });
  });
  window.addEventListener('afterprint', function () { before.forEach(function (x) { x[0].open = x[1]; }); });

  // Notas largas: quedan a un toque, detrás de "Más detalle".
  var KEEP = { wNote: 1, limIntro: 1, evidenceText: 1, mapIntro: 1, agMonthsNote: 1, fIntro: 1, pIntro: 1 };
  var LBL = { es: 'Más detalle', en: 'More detail' };
  var notes = [];
  document.querySelectorAll('#v-compare p.muted[data-i18n], #v-field .panel p.muted[data-i18n]').forEach(function (p) {
    if (KEEP[p.dataset.i18n] || p.closest('.note')) return;
    var d = document.createElement('details'); d.className = 'note';
    var s = document.createElement('summary'); s.innerHTML = '<i aria-hidden="true">i</i><span></span>';
    p.parentNode.insertBefore(d, p); d.appendChild(s); d.appendChild(p);
    notes.push(s.lastChild);
  });
  function labelNotes() { notes.forEach(function (n) { n.textContent = lang() === 'es' ? LBL.es : (window.RL && RL.tr ? RL.tr(LBL.en) : LBL.en); }); }
  labelNotes();
  new MutationObserver(labelNotes).observe(root, { attributes: true, attributeFilter: ['lang'] });

  // Resumen de lo elegido junto a cada plegable de configuración.
  function badge(id, txt) {
    var d = $(id); if (!d) return;
    var b = d.querySelector('summary .fold-badge');
    if (!b) { b = document.createElement('span'); b.className = 'fold-badge'; d.querySelector('summary').insertBefore(b, d.querySelector('summary .chev')); }
    b.textContent = txt; b.hidden = !txt;
  }
  function syncBadges() {
    var n = document.querySelectorAll('#limits input:checked').length;
    badge('fd-lim', n ? String(n) : '');
    var r = $('rain'); badge('fd-rain', r && +r.value ? (+r.value > 0 ? '+' : '') + r.value + ' %' : '');
  }
  document.addEventListener('change', syncBadges); document.addEventListener('input', syncBadges);
  setTimeout(syncBadges, 0);
})();

// Relleno verde de los controles deslizantes (variable CSS --rp con el porcentaje)
(function () {
  function fill(el) { var mn = +el.min || 0, mx = +el.max || 100; el.style.setProperty('--rp', ((el.value - mn) / (mx - mn) * 100) + '%'); }
  function all() { document.querySelectorAll('input[type=range]').forEach(fill); }
  document.addEventListener('input', function (e) { if (e.target && e.target.type === 'range') fill(e.target); });
  document.addEventListener('rl:render', all); document.addEventListener('rl:view', all);
  window.addEventListener('load', all); setTimeout(all, 300);
})();
