/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). La app no usa IA en ejecución. */
/* YvyShift · Mapa mundial: elegir un punto en cualquier lugar del planeta y delimitar una parcela o área.
 * Sin librerías: mosaico Web Mercator propio. Base: OpenStreetMap (orientación). Satélite: NASA GIBS
 * (Blue Marble a escala global; HLS Landsat + Sentinel-2 de 30 m, por fecha, al acercarse).
 * No calcula clima: entrega el punto o el contorno a app.js (window.RL), que descarga NASA POWER y analiza. */
(function () {
  'use strict';
  var RL = window.RL; if (!RL) return;
  var E = RL.E;
  var $ = function (id) { return document.getElementById(id); };
  var box = $('worldMap'); if (!box) return;
  var tilesEl = $('wmTiles'), svg = $('wmSvg');
  function L() { return RL.lang(); }
  function tx(es, en) { return L() === 'en' ? (RL.tr ? RL.tr(en) : en) : es; }
  function esc(s) { return RL.esc(s); }

  var TS = 256, ZMIN = 2, ZMAX = 17;
  var st = { lat: -25.5, lon: -56.5, z: 6, sat: false, draw: false, pts: [], date: null };
  var live = {}; // teselas en pantalla: clave -> <img>

  // ---------- Proyección Web Mercator ----------
  function worldSize(z) { return TS * Math.pow(2, z); }
  function project(lat, lon, z) {
    var s = worldSize(z), r = Math.max(-85.05, Math.min(85.05, lat)) * Math.PI / 180;
    return { x: (lon + 180) / 360 * s, y: (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * s };
  }
  function unproject(x, y, z) {
    var s = worldSize(z), n = Math.PI - 2 * Math.PI * y / s;
    return { lat: 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))), lon: x / s * 360 - 180 };
  }
  function size() { return { w: box.clientWidth, h: box.clientHeight }; }
  function origin() { var c = project(st.lat, st.lon, st.z), s = size(); return { x: c.x - s.w / 2, y: c.y - s.h / 2 }; }
  function toScreen(lat, lon) { var p = project(lat, lon, st.z), o = origin(); return { x: p.x - o.x, y: p.y - o.y }; }
  function toLatLon(px, py) { var o = origin(); return unproject(o.x + px, o.y + py, st.z); }

  // ---------- Capas ----------
  var ORG = 20037508.342789244;
  function iso(d) { return d.toISOString().slice(0, 10); }
  function shift(date, n) { var d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
  function hlsUrl(z, x, y, date, fmt, px) {
    var n = Math.pow(2, z), res = 2 * ORG / n, minx = -ORG + x * res, maxy = ORG - y * res;
    return 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0' +
      '&LAYERS=HLS_L30_Nadir_BRDF_Adjusted_Reflectance,HLS_S30_Nadir_BRDF_Adjusted_Reflectance&CRS=EPSG:3857&BBOX=' +
      [minx, maxy - res, minx + res, maxy].join(',') + '&WIDTH=' + (px || 256) + '&HEIGHT=' + (px || 256) +
      '&FORMAT=' + (fmt || 'image/png') + '&TRANSPARENT=true&TIME=' + date;
  }
  function layers() {
    // Con satélite: Blue Marble (NASA) hasta el nivel 8; más cerca, imagen satelital con HLS de 30 m encima.
    if (st.sat && st.z <= 8) return [{ id: 'bm', url: function (z, x, y) { return 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/' + z + '/' + y + '/' + x + '.jpeg'; } }];
    // Mapa base: Esri World Street Map (sin clave). tile.openstreetmap.org y CARTO bloquean o piden clave a apps como esta.
    // Si una tesela falla, se prueba Esri World Topo Map.
    // Con satélite, de cerca: imagen satelital de Esri de fondo (en vez de calles) y la imagen NASA HLS de 30 m encima donde exista.
    var out = [st.sat ? { id: 'esri-img', url: function (z, x, y) { return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + z + '/' + y + '/' + x; },
      alt: function (z, x, y) { return 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + z + '/' + y + '/' + x; } } :
      { id: 'base', url: function (z, x, y) { return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/' + z + '/' + y + '/' + x; },
      alt: function (z, x, y) { return 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/' + z + '/' + y + '/' + x; } }];
    if (st.sat) out.push({ id: 'hls' + st.date, url: function (z, x, y) { return hlsUrl(z, x, y, st.date); } });
    return out;
  }

  // ---------- Dibujo ----------
  var raf = null;
  function render() { if (raf) return; raf = requestAnimationFrame(function () { raf = null; draw(); }); }
  function draw() {
    var s = size(); if (!s.w || !s.h) return;
    var o = origin(), n = Math.pow(2, st.z), want = {};
    layers().forEach(function (ly, li) {
      for (var ty = Math.floor(o.y / TS); ty <= Math.floor((o.y + s.h) / TS); ty++) {
        if (ty < 0 || ty >= n) continue;
        for (var tx_ = Math.floor(o.x / TS); tx_ <= Math.floor((o.x + s.w) / TS); tx_++) {
          var wx = ((tx_ % n) + n) % n, key = ly.id + '/' + st.z + '/' + tx_ + '/' + ty;
          want[key] = true;
          var img = live[key];
          if (!img) {
            img = document.createElement('img');
            img.alt = ''; img.draggable = false; img.decoding = 'async'; img.style.zIndex = li;
            if (ly.alt) img.dataset.alt = ly.alt(st.z, wx, ty);
            img.onerror = function () { if (this.dataset.alt) { var u = this.dataset.alt; delete this.dataset.alt; this.src = u; return; } this.style.visibility = 'hidden'; box.classList.add('wm-neterr'); };
            img.onload = function () { box.classList.remove('wm-neterr'); };
            img.src = ly.url(st.z, wx, ty);
            tilesEl.appendChild(img); live[key] = img;
          }
          img.style.transform = 'translate(' + Math.round(tx_ * TS - o.x) + 'px,' + Math.round(ty * TS - o.y) + 'px)';
        }
      }
    });
    Object.keys(live).forEach(function (k) { if (!want[k]) { live[k].remove(); delete live[k]; } });
    drawOverlay(s);
  }
  function ptStr(pts) { return pts.map(function (p) { var q = toScreen(p[0], p[1]); return q.x.toFixed(1) + ',' + q.y.toFixed(1); }).join(' '); }
  function drawOverlay(s) {
    var h = '', cur = RL.loc(), D = RL.datasets;
    svg.setAttribute('viewBox', '0 0 ' + s.w + ' ' + s.h);
    // Celda de NASA POWER de la zona elegida: lo que representa el dato climático.
    var d = D[cur];
    if (d) {
      var c = E.powerCell(d.lat, d.lon), a = toScreen(c.north, c.west), b = toScreen(c.south, c.east);
      if (b.x - a.x > 6) h += '<rect class="wm-cell" x="' + a.x.toFixed(1) + '" y="' + a.y.toFixed(1) + '" width="' + (b.x - a.x).toFixed(1) + '" height="' + (b.y - a.y).toFixed(1) + '"/>';
      if (d.poly && !st.pts.length) h += '<polygon class="wm-poly" points="' + ptStr(d.poly) + '"/>';
    }
    Object.keys(D).forEach(function (k) {
      var q = toScreen(D[k].lat, D[k].lon);
      if (q.x < -20 || q.y < -20 || q.x > s.w + 20 || q.y > s.h + 20) return;
      var name = RL.placeLabel(D[k]).split(' (')[0], flip = q.x > s.w - 130;
      h += '<g class="wm-mk' + (k === cur ? ' on' : '') + '" data-k="' + esc(k) + '"><circle cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="7"/>' +
        '<text x="' + (q.x + (flip ? -12 : 12)).toFixed(1) + '" y="' + (q.y + 4).toFixed(1) + '"' + (flip ? ' text-anchor="end"' : '') + '>' + esc(name) + '</text></g>';
    });
    // Punto elegido a mano (todavía sin descargar).
    var la = +$('lat').value, lo = +$('lon').value;
    if (pendingShown && isFinite(la) && isFinite(lo)) { var p = toScreen(la, lo); h += '<circle class="wm-pend" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="8"/>'; }
    // Parcela en dibujo.
    if (st.pts.length) {
      h += (st.pts.length >= 3 ? '<polygon class="wm-poly draft" points="' : '<polyline class="wm-poly draft" points="') + ptStr(st.pts) + '"/>';
      st.pts.forEach(function (pt, i) { var q = toScreen(pt[0], pt[1]); h += '<circle class="wm-vx" cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="5"><title>' + (i + 1) + '</title></circle>'; });
    }
    svg.innerHTML = h;
  }
  var pendingShown = false;

  // ---------- Navegación ----------
  function setView(lat, lon, z) {
    st.lat = Math.max(-80, Math.min(80, lat)); st.lon = ((lon + 540) % 360) - 180;
    if (z != null) st.z = Math.max(ZMIN, Math.min(ZMAX, Math.round(z)));
    $('wmIn').disabled = st.z >= ZMAX; $('wmOut').disabled = st.z <= ZMIN;
    render();
  }
  function zoomAt(dz, px, py) {
    var s = size(), z2 = Math.max(ZMIN, Math.min(ZMAX, st.z + dz)); if (z2 === st.z) return;
    if (px == null) { px = s.w / 2; py = s.h / 2; }
    var g = toLatLon(px, py); st.z = z2;
    var p = project(g.lat, g.lon, st.z), c = unproject(p.x - px + s.w / 2, p.y - py + s.h / 2, st.z);
    setView(c.lat, c.lon, st.z);
  }
  function fit(pts, maxZ) {
    var bb = E.polygonBBox(pts), s = size(), z = ZMAX;
    for (; z > ZMIN; z--) {
      var a = project(bb.n, bb.w, z), b = project(bb.s, bb.e, z);
      if (b.x - a.x <= s.w * 0.6 && b.y - a.y <= s.h * 0.6) break;
    }
    setView((bb.s + bb.n) / 2, (bb.w + bb.e) / 2, Math.min(z, maxZ || ZMAX));
  }
  function fitCurrent() {
    var d = RL.datasets[RL.loc()]; if (!d) return;
    if (st.pts.length >= 2) return fit(st.pts);
    if (d.poly) return fit(d.poly, 16);
    setView(d.lat, d.lon, 8);
  }

  // Arrastre con el puntero; un toque sin arrastre es un clic.
  var drag = null, moved = false;
  box.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.zm-ctrl, .wm-attr')) return;
    drag = { x: e.clientX, y: e.clientY, c: project(st.lat, st.lon, st.z) }; moved = false;
    try { box.setPointerCapture(e.pointerId); } catch (err) { /* navegador antiguo */ }
  });
  box.addEventListener('pointermove', function (e) {
    var r = box.getBoundingClientRect(), g = toLatLon(e.clientX - r.left, e.clientY - r.top);
    $('wmCoord').textContent = g.lat.toFixed(4) + ', ' + g.lon.toFixed(4);
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
    if (!moved) return;
    box.classList.add('dragging');
    var c = unproject(drag.c.x - dx, drag.c.y - dy, st.z); setView(c.lat, c.lon);
  });
  function endDrag(e) {
    if (!drag) return;
    var wasMoved = moved; drag = null; box.classList.remove('dragging');
    if (wasMoved || e.type === 'pointercancel') return;
    var mk = e.target.closest && e.target.closest('.wm-mk');
    if (mk && !st.draw) { RL.selectLoc(mk.getAttribute('data-k')); return; }
    var r = box.getBoundingClientRect(), g = toLatLon(e.clientX - r.left, e.clientY - r.top);
    if (st.draw) { addVertex(g.lat, g.lon); return; }
    // Clic simple: elige un punto y lo deja listo para descargar.
    $('lat').value = g.lat.toFixed(4); $('lon').value = g.lon.toFixed(4);
    pendingShown = true;
    $('lat').dispatchEvent(new Event('input', { bubbles: true }));
    render();
  }
  box.addEventListener('pointerup', endDrag); box.addEventListener('pointercancel', endDrag);
  box.addEventListener('dblclick', function (e) {
    if (st.draw || e.target.closest('.zm-ctrl')) return;
    e.preventDefault(); var r = box.getBoundingClientRect(); zoomAt(1, e.clientX - r.left, e.clientY - r.top);
  });
  // La rueda acerca solo con Ctrl (o con el gesto de pellizco del panel táctil), para no secuestrar el desplazamiento de la página.
  box.addEventListener('wheel', function (e) {
    if (!e.ctrlKey) return;
    e.preventDefault(); var r = box.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1 : -1, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  box.addEventListener('keydown', function (e) {
    var step = 80, c = project(st.lat, st.lon, st.z), k = e.key;
    if (k === '+' || k === '=') zoomAt(1); else if (k === '-') zoomAt(-1);
    else if (k === 'ArrowLeft') c.x -= step; else if (k === 'ArrowRight') c.x += step;
    else if (k === 'ArrowUp') c.y -= step; else if (k === 'ArrowDown') c.y += step; else return;
    e.preventDefault();
    if (k.indexOf('Arrow') === 0) { var g = unproject(c.x, c.y, st.z); setView(g.lat, g.lon); }
  });
  $('wmIn').addEventListener('click', function () { zoomAt(1); });
  $('wmOut').addEventListener('click', function () { zoomAt(-1); });
  $('wmFit').addEventListener('click', fitCurrent);

  // ---------- Parcela ----------
  function status(html, warn) { var el = $('wmStatus'); el.innerHTML = html || ''; el.classList.toggle('sim', !!warn); }
  function fmtHa(ha) { return ha >= 100 ? RL.num(Math.round(ha)) : RL.num(ha, ha >= 10 ? 1 : 2); }
  function drawState() {
    var n = st.pts.length, ha = n >= 3 ? E.polygonAreaHa(st.pts) : 0, bad = n >= 4 && E.polygonSelfIntersects(st.pts);
    $('wmDraw').setAttribute('aria-pressed', String(st.draw));
    box.classList.toggle('drawing', st.draw);
    $('wmUndo').disabled = !n; $('wmClear').disabled = !n;
    $('wmParcelBox').hidden = !(n >= 3 && !bad && ha <= 200000);
    $('wmExport').disabled = !(n >= 3 || (RL.datasets[RL.loc()] || {}).poly);
    if (st.draw || n) {
      if (n < 3) status(tx('Toca el mapa para marcar los vértices de la parcela (' + n + ' de 3 como mínimo). Arrastra para mover el mapa.', 'Tap the map to mark the field’s corners (' + n + ' of at least 3). Drag to move the map.'));
      else if (bad) status(tx('Los lados de la parcela se cruzan. Deshaz el último punto.', 'The field’s sides cross each other. Undo the last point.'), true);
      else if (ha > 200000) status(tx('El área mide ' + fmtHa(ha) + ' ha: es más grande que la celda de clima (unas 300.000 ha). Delimita un área menor.', 'The area is ' + fmtHa(ha) + ' ha: larger than the climate cell (about 300,000 ha). Outline a smaller area.'), true);
      else status(tx('Área: <b>' + fmtHa(ha) + ' ha</b> · ' + n + ' vértices. Ponle un nombre y analízala, o sigue marcando puntos.', 'Area: <b>' + fmtHa(ha) + ' ha</b> · ' + n + ' corners. Name it and analyse it, or keep adding points.') +
        (ha < 3 ? ' ' + tx('Es chica para las imágenes de 30 m (menos de 30 píxeles).', 'It is small for 30 m images (fewer than 30 pixels).') : ''));
    }
    render();
  }
  function addVertex(lat, lon) {
    if (st.pts.length >= 200) return;
    st.pts.push([+lat.toFixed(6), +lon.toFixed(6)]); drawState();
  }
  $('wmDraw').addEventListener('click', function () {
    st.draw = !st.draw;
    if (st.draw && st.z < 11) status(tx('Acércate más para ver los lotes antes de marcar (botón + o doble clic).', 'Zoom in to see the fields before marking (+ button or double click).'));
    drawState();
  });
  // La lista «Zona» de Rotation Lab abre el mapa en modo dibujo con esto.
  RL.startDraw = function () {
    if (!st.draw) { st.draw = true; drawState(); }
    if (st.z < 11) { var d = RL.datasets[RL.loc()]; if (d) setView(d.lat, d.lon, 13); }
    status(tx('Marca los vértices de tu parcela sobre el mapa. Después ponle un nombre y toca «Analizar parcela»: aparecerá en la lista «Zona».', 'Mark the corners of your field on the map. Then give it a name and tap "Analyse field": it will appear in the "Area" list.'));
    setTimeout(function () { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60);
  };
  $('wmUndo').addEventListener('click', function () { st.pts.pop(); drawState(); });
  $('wmClear').addEventListener('click', function () { st.pts = []; st.draw = false; status(''); drawState(); });
  $('wmAnalyze').addEventListener('click', function () {
    var pts = st.pts.slice(), name = $('wmName').value, btn = $('wmAnalyze');
    btn.disabled = true;
    status(tx('Descargando de NASA POWER el clima de la celda que contiene la parcela… puede tardar hasta un minuto.', 'Downloading from NASA POWER the climate of the cell containing the field… it can take up to a minute.'));
    RL.analyzeParcel(name, pts).then(function () {
      st.pts = []; st.draw = false; $('wmName').value = '';
      var d = RL.datasets[RL.loc()];
      drawState(); fit(d.poly, 16);
      status(tx('Parcela <b>' + esc(d.label) + '</b> lista: ' + fmtHa(d.ha) + ' ha, hemisferio ' + (d.hemi === 'N' ? 'norte' : 'sur') + '. Quedó guardada en «Mis parcelas» (solo en este dispositivo). Mira abajo las imágenes de 30 m, o abre Field DNA, Rotation Lab o el Resilience Passport.',
        'Field <b>' + esc(d.label) + '</b> ready: ' + fmtHa(d.ha) + ' ha, ' + (d.hemi === 'N' ? 'northern' : 'southern') + ' hemisphere. Saved in "My fields" (this device only). See the 30 m images below, or open Field DNA, Rotation Lab or the Resilience Passport.'));
    }, function (e) {
      status(tx('No se pudo analizar: ', 'Could not analyse: ') + esc(e.message) + '. ' + tx('Hace falta conexión para descargar NASA POWER.', 'A connection is needed to download NASA POWER.'), true);
    }).then(function () { btn.disabled = false; });
  });

  // ---------- GeoJSON ----------
  function firstRing(g) {
    if (!g || typeof g !== 'object') return null;
    if (g.type === 'FeatureCollection' && Array.isArray(g.features)) { for (var i = 0; i < g.features.length; i++) { var r = firstRing(g.features[i]); if (r) return r; } return null; }
    if (g.type === 'Feature') { var rr = firstRing(g.geometry); if (rr && g.properties && typeof g.properties.name === 'string') rr.name = g.properties.name; return rr; }
    if (g.type === 'Polygon' && Array.isArray(g.coordinates)) return { ring: g.coordinates[0] };
    if (g.type === 'MultiPolygon' && Array.isArray(g.coordinates) && g.coordinates[0]) return { ring: g.coordinates[0][0] };
    return null;
  }
  $('wmFile').addEventListener('change', function () {
    var f = this.files && this.files[0]; this.value = '';
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { status(tx('El archivo pesa más de 2 MB.', 'The file is larger than 2 MB.'), true); return; }
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var r = firstRing(JSON.parse(String(rd.result)));
        if (!r || !Array.isArray(r.ring)) throw new Error('x');
        var pts = r.ring.map(function (c) { return [+c[1], +c[0]]; }); // GeoJSON guarda [longitud, latitud]
        if (pts.length > 3 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
        if (!RL.validPoly(pts)) throw new Error('x');
        st.pts = pts.map(function (p) { return [+p[0].toFixed(6), +p[1].toFixed(6)]; }); st.draw = false;
        if (r.name) $('wmName').value = r.name.slice(0, 40);
        fit(st.pts, 16); drawState();
      } catch (e) { status(tx('No pude leer un polígono en ese archivo. Tiene que ser GeoJSON con un Polygon (coordenadas en grados, WGS84) de 3 a 200 vértices.', 'I could not read a polygon in that file. It must be GeoJSON with a Polygon (coordinates in degrees, WGS84) of 3 to 200 corners.'), true); }
    };
    rd.readAsText(f);
  });
  $('wmExport').addEventListener('click', function () {
    var d = RL.datasets[RL.loc()] || {}, pts = st.pts.length >= 3 ? st.pts : d.poly; if (!pts) return;
    var ring = pts.map(function (p) { return [p[1], p[0]]; }); ring.push(ring[0]);
    var gj = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { name: st.pts.length >= 3 ? ($('wmName').value || 'parcela') : d.label, area_ha: +E.polygonAreaHa(pts).toFixed(2), source: 'YvyShift' }, geometry: { type: 'Polygon', coordinates: [ring] } }] };
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(gj, null, 1)], { type: 'application/geo+json' }));
    a.download = 'parcela.geojson'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });

  // ---------- Satélite NASA ----------
  function satState() {
    $('wmSat').setAttribute('aria-pressed', String(st.sat));
    $('wmDateBox').hidden = !st.sat;
    $('wmDate').value = st.date; $('wmDate').max = iso(new Date());
    render();
  }
  $('wmSat').addEventListener('click', function () {
    st.sat = !st.sat;
    if (st.sat && st.z > 8) status(tx('Imagen NASA HLS (Landsat + Sentinel-2, 30 m) del ' + st.date + '. Cada satélite pasa cada pocos días y puede haber nubes: usa ◀ ▶ o «Buscar imagen».', 'NASA HLS image (Landsat + Sentinel-2, 30 m) for ' + st.date + '. Each satellite passes every few days and there may be clouds: use ◀ ▶ or "Find image".'));
    satState();
  });
  function setDate(d) { var today = iso(new Date()); st.date = d > today ? today : (d < '2015-12-01' ? '2015-12-01' : d); satState(); }
  $('wmDate').addEventListener('change', function () { if (this.value) setDate(this.value); });
  $('wmPrev').addEventListener('click', function () { setDate(shift(st.date, -1)); });
  $('wmNext').addEventListener('click', function () { setDate(shift(st.date, 1)); });
  // Busca hacia atrás (hasta 24 días) la fecha más reciente con imagen en el centro del mapa. Sondeo de 128 px.
  $('wmFind').addEventListener('click', function () {
    var z = Math.max(9, Math.min(13, st.z)), c = project(st.lat, st.lon, z), x = Math.floor(c.x / TS), y = Math.floor(c.y / TS), btn = this;
    var dates = []; for (var i = 0; i < 24; i++) dates.push(shift(st.date, -i));
    btn.disabled = true; status(tx('Buscando la imagen más reciente…', 'Looking for the most recent image…'));
    Promise.all(dates.map(function (d) {
      return fetch(hlsUrl(z, x, y, d, 'image/jpeg', 128)).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) { return b && b.size > 1500 ? d : null; }).catch(function () { return null; });
    })).then(function (r) {
      var hit = r.filter(Boolean)[0];
      if (hit) { setDate(hit); status(tx('Imagen del ' + hit + '. Si hay nubes, prueba fechas anteriores con ◀.', 'Image from ' + hit + '. If it is cloudy, try earlier dates with ◀.')); }
      else status(tx('No encontré imágenes en los 24 días anteriores al ' + st.date + '. Prueba otra fecha.', 'No images found in the 24 days before ' + st.date + '. Try another date.'), true);
    }).then(function () { btn.disabled = false; });
  });

  // ---------- Ejemplos en el mundo (puntos aproximados de regiones agrícolas, solo para ubicar el mapa) ----------
  var EXAMPLES = [
    ['Itapúa, Paraguay', -27.08, -55.65], ['Mato Grosso, Brasil', -12.55, -55.72], ['Pampa, Argentina', -33.9, -60.57],
    ['Iowa, EE. UU.', 42.0, -93.5], ['Punyab, India', 30.9, 75.85], ['Poltava, Ucrania', 49.6, 34.55], ['Nueva Gales del Sur, Australia', -35.1, 147.4]
  ];
  $('wmExamples').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]'); if (!b) return;
    var x = EXAMPLES[+b.dataset.i];
    setView(x[1], x[2], 9);
    $('lat').value = x[1]; $('lon').value = x[2]; pendingShown = true;
    $('lat').dispatchEvent(new Event('input', { bubbles: true }));
  });

  // ---------- Textos e inicio ----------
  function labels() {
    $('wmH').textContent = tx('Mapa mundial · elige un punto o delimita tu parcela', 'World map · pick a point or outline your field');
    $('wmIntro').textContent = tx('Funciona en cualquier lugar del mundo. Toca el mapa para elegir un punto, o usa «Dibujar parcela» y marca sus vértices. El clima sale de la celda de NASA POWER (recuadro punteado, unos 50 km); las imágenes de la parcela son de 30 m.', 'It works anywhere in the world. Tap the map to pick a point, or use "Draw field" and mark its corners. Climate comes from the NASA POWER cell (dotted box, about 50 km); field images are 30 m.');
    $('wmDraw').textContent = tx('Dibujar parcela', 'Draw field'); $('wmUndo').textContent = tx('Deshacer punto', 'Undo point'); $('wmClear').textContent = tx('Borrar dibujo', 'Clear drawing');
    $('wmSat').textContent = tx('Satélite NASA', 'NASA satellite'); $('wmFind').textContent = tx('Buscar imagen', 'Find image');
    $('wmNameL').textContent = tx('Nombre de la parcela', 'Field name'); $('wmAnalyze').textContent = tx('Analizar parcela', 'Analyse field');
    $('wmName').placeholder = tx('Lote norte', 'North field');
    $('wmImportL').textContent = tx('Importar GeoJSON', 'Import GeoJSON'); $('wmExport').textContent = tx('Exportar GeoJSON', 'Export GeoJSON');
    $('wmExL').textContent = tx('Ir a:', 'Go to:');
    $('pyMapL').textContent = tx('Mapa sin conexión de Paraguay (MODIS, 8 zonas guardadas)', 'Offline map of Paraguay (MODIS, 8 stored areas)');
    $('wmIn').setAttribute('aria-label', tx('Acercar', 'Zoom in')); $('wmOut').setAttribute('aria-label', tx('Alejar', 'Zoom out')); $('wmFit').setAttribute('aria-label', tx('Centrar en la zona elegida', 'Centre on the selected area'));
    box.setAttribute('aria-label', tx('Mapa mundial. Flechas para mover, más y menos para acercar.', 'World map. Arrow keys to move, plus and minus to zoom.'));
    $('wmExamples').innerHTML = EXAMPLES.map(function (x, i) { return '<button type="button" data-i="' + i + '">' + esc(x[0]) + '</button>'; }).join('');
    drawState();
  }
  st.date = shift(iso(new Date()), -6);
  var lastLoc = null;
  document.addEventListener('rl:render', function () {
    var k = RL.loc();
    if (k !== lastLoc) { lastLoc = k; pendingShown = false; if (!st.pts.length) fitCurrent(); }
    render();
  });
  document.addEventListener('rl:view', function (e) { if (e.detail === 'field') setTimeout(function () { if (!lastSized) { lastSized = true; fitCurrent(); } render(); }, 30); });
  var lastSized = false;
  window.addEventListener('resize', render);
  ['lat', 'lon'].forEach(function (id) { $(id).addEventListener('input', function () { pendingShown = true; render(); }); });
  new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  labels(); satState(); fitCurrent();
})();
