/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). La app no usa IA en ejecución. */
/* YvyShift · fondo con vida de la portada.
 * Dibujo propio en <canvas>: cultivo que se mueve con ráfagas de viento, polen en el aire y luz que cruza el campo.
 * Es decoración, no datos. Se detiene si la portada no está a la vista o si el sistema pide menos movimiento. */
(function () {
  'use strict';
  var cv = document.getElementById('lifeBg'); if (!cv || !cv.getContext) return;
  var home = document.getElementById('v-home'), ctx = cv.getContext('2d');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, blades = [], motes = [], lights = [], raf = null, last = 0;
  var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  function build() {
    var r = cv.getBoundingClientRect(); if (!r.width || !r.height) return false;
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed = 11; blades = []; motes = []; lights = [];
    // Tres franjas de cultivo: lejos (bajas, apagadas), medio y cerca (altas, con espiga color trigo).
    var rows = [{ y: H - 26, h: 13, n: W / 7, c: '#2C5E3C', a: .5, tip: 0 }, { y: H - 12, h: 22, n: W / 6, c: '#3F8A56', a: .7, tip: .3 }, { y: H + 4, h: 34, n: W / 5, c: '#57A46B', a: .85, tip: .5 }];
    rows.forEach(function (row, li) {
      for (var i = 0; i < row.n; i++) blades.push({ x: (i + rnd()) * (W / row.n), y: row.y + rnd() * 8, h: row.h * (.7 + rnd() * .6), w: 1 + li * .5, c: row.c, a: row.a * (.7 + rnd() * .3), ph: rnd() * 6.28, st: .6 + rnd() * .8, tip: rnd() < row.tip, li: li });
    });
    for (var m = 0; m < Math.max(18, W / 34); m++) motes.push({ x: rnd() * W, y: rnd() * H * .9, r: .8 + rnd() * 1.8, vx: 6 + rnd() * 14, vy: -2 - rnd() * 5, ph: rnd() * 6.28, a: .25 + rnd() * .45 });
    for (var l = 0; l < 3; l++) lights.push({ x: rnd() * W, y: H * (.25 + rnd() * .5), rx: W * (.25 + rnd() * .2), ry: H * (.16 + rnd() * .1), v: 8 + rnd() * 10, a: .05 + rnd() * .04 });
    return true;
  }

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    // Luz que cruza el campo, como claros entre nubes.
    lights.forEach(function (L) {
      var x = ((L.x + L.v * t) % (W + 2 * L.rx)) - L.rx;
      var g = ctx.createRadialGradient(x, L.y, 0, x, L.y, L.rx);
      g.addColorStop(0, 'rgba(240,178,74,' + L.a + ')'); g.addColorStop(1, 'rgba(240,178,74,0)');
      ctx.save(); ctx.translate(0, L.y); ctx.scale(1, L.ry / L.rx); ctx.translate(0, -L.y); ctx.fillStyle = g; ctx.fillRect(x - L.rx, L.y - L.rx, 2 * L.rx, 2 * L.rx); ctx.restore();
    });
    // Polen: sube despacio y deriva con el viento.
    motes.forEach(function (m) {
      var x = (m.x + m.vx * t) % (W + 20) - 10, y = ((m.y + m.vy * t) % (H * .9) + H * .9) % (H * .9) + Math.sin(t * .7 + m.ph) * 8;
      ctx.globalAlpha = m.a * (.6 + .4 * Math.sin(t * 1.3 + m.ph)); ctx.fillStyle = '#F6DFA8';
      ctx.beginPath(); ctx.arc(x, y, m.r, 0, 6.2832); ctx.fill();
    });
    // Cultivo: cada tallo se inclina con una ráfaga que recorre el campo de izquierda a derecha.
    ctx.lineCap = 'round';
    blades.forEach(function (b) {
      var gust = Math.sin(b.x * .012 - t * 1.1) * .5 + Math.sin(b.x * .004 - t * .45 + 1.7) * .5;
      var lean = (gust * .9 + Math.sin(t * 2.1 + b.ph) * .25) * b.st * b.h * .32 + b.h * .12;
      var tx = b.x + lean, ty = b.y - b.h;
      ctx.globalAlpha = b.a; ctx.strokeStyle = b.c; ctx.lineWidth = b.w;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.quadraticCurveTo(b.x + lean * .25, b.y - b.h * .6, tx, ty); ctx.stroke();
      if (b.tip) { ctx.strokeStyle = '#E3B95A'; ctx.lineWidth = b.w + 1.4; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + lean * .12, ty - 5 - b.li * 2); ctx.stroke(); }
    });
    ctx.globalAlpha = 1;
  }

  function loop(ms) {
    raf = requestAnimationFrame(loop);
    if (ms - last < 33) return; last = ms; // unos 30 cuadros por segundo
    frame(ms / 1000);
  }
  function start() {
    stop();
    if (home.hidden || document.hidden || !build()) return;
    if (still) { frame(3); return; }
    raf = requestAnimationFrame(loop);
  }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  document.addEventListener('rl:view', function () { setTimeout(start, 40); });
  document.addEventListener('visibilitychange', start);
  var rt = null; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(start, 150); });
  new MutationObserver(start).observe(home, { attributes: true, attributeFilter: ['hidden'] });
  start();
})();
