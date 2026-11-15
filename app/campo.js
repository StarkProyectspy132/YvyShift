/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). La app no usa IA en ejecución. */
/* YvyShift · capa de uso en el campo (v17, 15-nov-2026).
 * 1. Modo sol: alto contraste para leer al aire libre (botón ☀ de la barra superior; se recuerda en el dispositivo).
 * 2. Barra inferior en el celular: 4 accesos (Inicio, Mapa, Rotaciones, Alertas) + «Más» con el resto de los módulos.
 * 3. Preguntas rápidas en la portada, en el idioma del productor, que llevan directo a la pantalla que responde.
 * 4. Fondo de la portada que se desplaza con el mouse (paralaje suave). En celulares y con «menos movimiento» queda quieto.
 * No calcula nada: los números siguen saliendo de engine.js y app.js. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  var es = function () { return !window.RL || RL.lang() === 'es'; };
  var tr = function (s) { return window.RL ? RL.tr(s) : s; };
  var txt = function (a, b) { return es() ? a : tr(b); };

  // ---------- 1. Modo sol ----------
  var sunBtn = $('sunBtn');
  function setSun(on, save) {
    if (on) root.dataset.sun = '1'; else delete root.dataset.sun;
    if (sunBtn) {
      sunBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      sunBtn.title = on ? txt('Salir del modo sol', 'Leave sun mode') : txt('Modo sol: alto contraste para leer al aire libre', 'Sun mode: high contrast for reading outdoors');
      sunBtn.setAttribute('aria-label', sunBtn.title);
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', on ? '#FFFFFF' : '#10261A');
    if (save) { try { localStorage.setItem('yvy-sun', on ? '1' : '0'); } catch (e) { /* almacenamiento bloqueado */ } }
  }
  var savedSun = null;
  try { savedSun = localStorage.getItem('yvy-sun'); } catch (e) { /* idem */ }
  // Si el sistema pide más contraste, el modo sol arranca encendido (el productor lo puede apagar).
  var wantsContrast = window.matchMedia && matchMedia('(prefers-contrast: more)').matches;
  setSun(savedSun === '1' || (savedSun === null && wantsContrast), false);
  if (sunBtn) sunBtn.addEventListener('click', function () { setSun(root.dataset.sun !== '1', true); });

  // ---------- 2. «Más» en la barra inferior del celular ----------
  var moreBtn = $('navMore'), sheet = $('moreSheet');
  var MORE = ['dna', 'replay', 'passport', 'parcels', 'devices'];
  function fillSheet() {
    if (!sheet) return;
    var list = sheet.querySelector('.ms-list');
    list.innerHTML = '';
    MORE.forEach(function (v) {
      var src = document.querySelector('.side .nav-i[data-view="' + v + '"]'); if (!src) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ms-i'; b.dataset.target = v;
      var svg = src.querySelector('svg'), name = src.querySelector('.lbl > span'), sub = src.querySelector('.lbl small');
      b.innerHTML = (svg ? svg.outerHTML : '') + '<span><b>' + (name ? name.textContent : v) + '</b>' + (sub ? '<small>' + sub.textContent + '</small>' : '') + '</span>';
      if (src.getAttribute('aria-current') === 'page') b.setAttribute('aria-current', 'page');
      list.appendChild(b);
    });
    sheet.querySelector('.ms-h').textContent = txt('Más módulos', 'More modules');
    sheet.querySelector('.ms-close').textContent = txt('Cerrar', 'Close');
  }
  function openSheet() { fillSheet(); sheet.hidden = false; moreBtn.setAttribute('aria-expanded', 'true'); var f = sheet.querySelector('.ms-i'); if (f) f.focus(); }
  function closeSheet(focusBack) { if (!sheet || sheet.hidden) return; sheet.hidden = true; moreBtn.setAttribute('aria-expanded', 'false'); if (focusBack) moreBtn.focus(); }
  if (moreBtn && sheet) {
    moreBtn.addEventListener('click', function () { if (sheet.hidden) openSheet(); else closeSheet(true); });
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet || e.target.closest('.ms-close')) { closeSheet(true); return; }
      var b = e.target.closest('.ms-i'); if (!b) return;
      closeSheet(false);
      var nav = document.querySelector('.side .nav-i[data-view="' + b.dataset.target + '"]'); if (nav) nav.click();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(true); });
    // «Más» queda marcado cuando la vista abierta es una de las que viven en la hoja.
    document.addEventListener('rl:view', function (e) {
      closeSheet(false);
      if (MORE.indexOf(e.detail) >= 0) moreBtn.setAttribute('aria-current', 'page'); else moreBtn.removeAttribute('aria-current');
    });
  }

  // ---------- 3. Preguntas rápidas de la portada ----------
  var QS = [
    { go: 'compare', scen: '2021', es: '¿Cuánto nos golpeó la sequía 2021–22?', en: 'How hard did the 2021–22 drought hit us?' },
    { go: 'compare', scen: 'p80', es: '¿Qué rotación aguanta un año malo?', en: 'Which rotation holds up in a bad year?' },
    { go: 'agenda', es: '¿Cómo viene esta campaña?', en: 'How is this season going?' },
    { go: 'field', es: '¿Cómo se ve mi lote desde el satélite?', en: 'What does my field look like from space?' }
  ];
  function renderQuick() {
    var box = $('quickQs'); if (!box) return;
    box.innerHTML = '<p class="qq-h">' + txt('Preguntas rápidas', 'Quick questions') + '</p><div class="qq-list">' + QS.map(function (q, i) {
      return '<button type="button" class="qq" data-q="' + i + '"><span>' + txt(q.es, q.en) + '</span><span aria-hidden="true">→</span></button>';
    }).join('') + '</div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.qq'); if (!b) return;
    var q = QS[+b.dataset.q]; if (!q) return;
    if (q.scen) {
      var sel = $('scenario');
      if (sel && Array.prototype.some.call(sel.options, function (o) { return o.value === q.scen; })) {
        sel.value = q.scen; sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    var nav = document.querySelector('.side .nav-i[data-view="' + q.go + '"]'); if (nav) nav.click();
  });
  renderQuick();
  // Al cambiar de idioma se redibujan los textos propios de esta capa.
  var ls = $('langSel'); if (ls) ls.addEventListener('change', function () { setTimeout(function () { renderQuick(); setSun(root.dataset.sun === '1', false); if (sheet && !sheet.hidden) fillSheet(); }, 0); });

  // ---------- 4. Fondo con paralaje en la portada ----------
  var home = $('v-home'), bg = $('heroBg');
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (home && bg && !calm && finePointer) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, MAX = 22; // desplazamiento máximo en píxeles
    var tick = function () {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      bg.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0) scale(1.08)';
      raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(tick) : null;
    };
    home.addEventListener('pointermove', function (e) {
      var r = home.getBoundingClientRect();
      tx = -((e.clientX - r.left) / r.width - 0.5) * 2 * MAX;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 2 * MAX * 0.6;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    home.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
  }
})();
