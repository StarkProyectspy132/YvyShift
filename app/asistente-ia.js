/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). */
/*
 * Asistente de YvyShift: base de conocimiento + IA local opcional (beta).
 *
 * Capa de seguridad (por qué el asistente no puede inventar):
 *  1. Primero responde el asistente guiado de app.js (números del motor, engine.js).
 *  2. Si no entendió, se busca en la base de conocimiento fija (data/conocimiento.js), sin IA.
 *  3. Solo si eso tampoco alcanza y el usuario instaló la IA local, el modelo primero ELIGE un tema
 *     de una lista cerrada (salida forzada por gramática a uno de esos "id" o "ninguno").
 *  4. Si eligió "ninguno", el modelo escribe una respuesta corta sobre agricultura o el uso de la app,
 *     con la guía de la app y los textos revisados más cercanos. Esa respuesta se marca siempre como
 *     escrita por la IA (puede equivocarse), se muestra como texto plano y nunca trae números de la zona.
 *  5. Si el modelo falla, tarda o devuelve algo fuera de la lista, se responde "no entendí" con la lista de temas.
 * Todo corre en el dispositivo. Después de instalar, funciona sin internet.
 */
(function () {
  'use strict';
  var KB = (window.YVY_KB && window.YVY_KB.items) || [];
  var LIB = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.88/+esm';
  // Qwen 2.5 de 1.500 millones de parámetros: entiende y escribe bien en español (Llama 3.2 1B no seguía la guía).
  var MODELS = { f16: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', f32: 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC' };
  var SIZE = { f16: '≈ 0,9 GB', f32: '≈ 1,1 GB' };
  var FLAG = 'yvy-ia';
  // La primera pregunta en una PC con gráficos integrados puede tardar más de un minuto (se preparan los sombreadores).
  var TIMEOUT_MS = 120000;

  // Preguntas que ya sabe contestar el motor: el modelo puede elegirlas y se pasan con una frase que app.js reconoce.
  var ENGINE = {
    sequia: { q: 'sequia', es: 'Falta de agua en tu zona (cálculo)', en: 'Water shortage in your area (calculation)' },
    helada_zona: { q: 'helada', es: 'Heladas en tu zona (cálculo)', en: 'Frost in your area (calculation)' },
    calor_zona: { q: 'calor', es: 'Calor en tu zona (cálculo)', en: 'Heat in your area (calculation)' },
    comparar: { q: 'comparar rotaciones', es: 'Qué rotación conviene en tu zona', en: 'Which rotation suits your area' },
    calendario: { q: 'calendario', es: 'Calendario de siembra y cosecha', en: 'Sowing and harvest calendar' },
    por_que: { q: 'por que gano', es: 'Por qué quedó primera una rotación', en: 'Why a rotation ranked first' },
    confianza: { q: 'que tan seguro', es: 'Qué tan seguro es el resultado', en: 'How sure the result is' },
    satelite: { q: 'imagen satelital', es: 'Ver el campo desde el satélite', en: 'See the field from space' },
    registrar: { q: 'registrar mi parcela', es: 'Registrar una parcela', en: 'Register a field' }
  };

  // Palabras guaraníes y de jopará frecuentes en el campo (sin tildes, como las deja norm()).
  var JOPARA = { ama: 'lluvia', amane: 'lluvia', 'ro\'y': 'helada', roy: 'helada', haku: 'calor', yvy: 'suelo', kokue: 'chacra', nemity: 'siembra', avati: 'maiz', 'mba\'e': 'que', mbae: 'que', 'ara': 'clima', 'ndaipori': 'no hay', 'oiko': 'pasa' };

  function L() { var l = document.documentElement.lang || 'es'; return (l === 'es' || l === 'pt' || l === 'gn') ? 'es' : 'en'; }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:()"]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(id) { return document.getElementById(id); }

  var TXT = {
    es: {
      warn: 'El asistente puede equivocarse al entender tu pregunta. Revisa el tema y la fuente de cada respuesta, y consulta a tu técnico antes de decidir.',
      install: 'Instalar IA local (beta)', remove: 'Quitar IA local', why: '¿Qué es esto?',
      whyTxt: 'Un modelo chico (Qwen 2.5, 1.500 millones de parámetros) que corre en tu dispositivo. Entiende preguntas escritas con otras palabras o en jopará y, si no hay un texto revisado, escribe una respuesta corta sobre agricultura o sobre cómo usar la app. Puede equivocarse: los números de tu zona siempre salen del cálculo. Se descarga una vez y después funciona sin internet.',
      noGpu: 'Este navegador no tiene WebGPU, que hace falta para la IA local. El asistente sigue funcionando sin IA. Prueba Chrome actualizado en Android o en una computadora.',
      weakGpu: 'IA local no disponible en este teléfono (su tarjeta gráfica es muy limitada). El asistente guiado funciona igual, sin IA y sin internet. La IA local sí anda en computadoras.',
      retrying: function (n) { return 'Se cortó la descarga. Reintentando (' + n + ' de 3), lo ya bajado no se pierde…'; },
      cell: function (sz) { return 'Estás con datos móviles o en ahorro de datos. La descarga pesa ' + sz + '. ¿Descargar igual? Mejor hacerlo con wifi.'; },
      yes: 'Descargar igual', no: 'Cancelar',
      space: function (sz) { return 'Puede que no haya espacio libre suficiente (' + sz + ' necesarios). Libera espacio e intenta de nuevo.'; },
      loading: 'Preparando la IA local…', dl: function (p, mb) { return 'Descargando IA local: ' + p + ' %' + (mb ? ' (' + mb + ' MB)' : ''); },
      opening: function (p) { return 'Abriendo la IA local: ' + p + ' %'; },
      cancel: 'Cancelar', canceled: 'Descarga cancelada. Puedes volver a intentarlo cuando quieras.',
      writing: 'La IA local está escribiendo…',
      aiTag: 'Respuesta escrita por la IA local. Puede equivocarse: confírmala con tu técnico antes de decidir.',
      based: 'Usó la guía de la app',
      ready: 'IA local lista. Funciona sin internet.', off: 'IA local no instalada. El asistente funciona igual, sin IA.',
      fail: function (m) { return 'No se pudo instalar la IA local (' + m + '). El asistente sigue funcionando sin IA.'; },
      removed: 'IA local quitada. Se liberó el espacio.',
      offline: 'Sin conexión: la IA local se puede instalar cuando haya internet.',
      netFail: 'se cortó la descarga; revisa la conexión o si un bloqueador frena cdn.jsdelivr.net o huggingface.co, y vuelve a intentar',
      thinking: 'La IA local está leyendo tu pregunta…',
      picked: function (t, via) { return 'Tema: <b>' + t + '</b> · ' + via; },
      jop: function (j) { return 'Leí las palabras en guaraní como: «' + j + '»'; },
      viaKb: 'elegido por coincidencia de palabras', viaIa: 'elegido por la IA local',
      src: 'Fuente', rev: 'Revisado', other: '¿No era eso? Elige un tema:',
      none: 'No encontré ese tema en la información guardada. Estos son los temas que conozco:'
    },
    en: {
      warn: 'The assistant can make mistakes understanding your question. Check the topic and source of each answer, and ask your technician before deciding.',
      install: 'Install local AI (beta)', remove: 'Remove local AI', why: 'What is this?',
      whyTxt: 'A small model (Qwen 2.5, 1.5 billion parameters) that runs on your device. It understands questions written in other words or in Jopará and, when there is no reviewed text, writes a short answer about farming or about how to use the app. It can make mistakes: the numbers for your area always come from the calculation. It downloads once and then works offline.',
      noGpu: 'This browser has no WebGPU, which the local AI needs. The assistant keeps working without AI. Try an up-to-date Chrome on Android or a computer.',
      weakGpu: 'Local AI is not available on this phone (its graphics chip is too limited). The guided assistant works the same, without AI and without internet. The local AI does work on computers.',
      retrying: function (n) { return 'The download was cut. Retrying (' + n + ' of 3); what was already downloaded is kept…'; },
      cell: function (sz) { return 'You are on mobile data or data saver. The download is ' + sz + '. Download anyway? Wi-Fi is better.'; },
      yes: 'Download anyway', no: 'Cancel',
      space: function (sz) { return 'There may not be enough free space (' + sz + ' needed). Free some space and try again.'; },
      loading: 'Preparing the local AI…', dl: function (p, mb) { return 'Downloading local AI: ' + p + ' %' + (mb ? ' (' + mb + ' MB)' : ''); },
      opening: function (p) { return 'Opening the local AI: ' + p + ' %'; },
      cancel: 'Cancel', canceled: 'Download cancelled. You can try again whenever you want.',
      writing: 'The local AI is writing…',
      aiTag: 'Answer written by the local AI. It can make mistakes: check it with your technician before deciding.',
      based: 'Used the app guide',
      ready: 'Local AI ready. Works offline.', off: 'Local AI not installed. The assistant works the same, without AI.',
      fail: function (m) { return 'Could not install the local AI (' + m + '). The assistant keeps working without AI.'; },
      removed: 'Local AI removed. Space freed.',
      offline: 'Offline: the local AI can be installed when there is internet.',
      netFail: 'the download was cut; check the connection or whether a blocker stops cdn.jsdelivr.net or huggingface.co, and try again',
      thinking: 'The local AI is reading your question…',
      picked: function (t, via) { return 'Topic: <b>' + t + '</b> · ' + via; },
      jop: function (j) { return 'I read the Guaraní words as: “' + j + '”'; },
      viaKb: 'picked by word match', viaIa: 'picked by the local AI',
      src: 'Source', rev: 'Reviewed', other: 'Not that? Pick a topic:',
      none: 'I did not find that topic in the stored information. These are the topics I know:'
    }
  };
  function t() { return TXT[L()]; }

  // ---------- 1. Búsqueda en la base de conocimiento (sin IA) ----------
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) d[i] = [i];
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function jopara(s) {
    return s.split(' ').map(function (w) { return JOPARA[w] || w; }).join(' ');
  }
  var STOP = /^(que|es|el|la|los|las|de|del|un|una|y|o|en|por|para|como|mi|me|se|lo|al|con|the|is|a|an|of|what|how|my|to|in|and|or)$/;
  function rank(raw) {
    var s = jopara(norm(raw)), words = s.split(' ').filter(function (w) { return w && !STOP.test(w); });
    var all = [];
    KB.forEach(function (it) {
      var sc = 0;
      it.keys.forEach(function (k) {
        if (k.indexOf(' ') > 0) { if ((' ' + s + ' ').indexOf(' ' + k + ' ') >= 0) sc += 3; return; }
        if (STOP.test(k)) return;
        words.forEach(function (w) {
          if (w === k) sc += 2;
          else if (k.length >= 5 && w.length >= 5 && lev(w, k) <= (k.length >= 9 ? 2 : 1)) sc += 1.5;
        });
      });
      if (sc > 0) all.push({ item: it, score: sc });
    });
    return all.sort(function (a, b) { return b.score - a.score; });
  }
  function search(raw) { var best = rank(raw)[0]; return best && best.score >= 2 ? best : null; }
  function byId(id) { for (var i = 0; i < KB.length; i++) if (KB[i].id === id) return KB[i]; return null; }

  function kbHtml(it, via) {
    var l = L(), T = t();
    return '<p class="kb-tag">' + T.picked(esc(it.title[l]), via) + '</p>' + it.text[l] +
      '<p class="kb-src">' + T.src + ': ' + esc(it.src) + (it.rev ? ' · ' + T.rev + ': ' + esc(it.rev) : '') + '</p>';
  }
  function topicChips() { var l = L(); return KB.map(function (it) { return it.title[l]; }); }
  function byTitle(txt) { var l = L(); for (var i = 0; i < KB.length; i++) if (KB[i].title[l] === txt) return KB[i]; return null; }

  // ---------- 2. IA local (WebLLM, en un worker si se puede) ----------
  var engine = null, loadingP = null, variant = null, listeners = [], run = 0, stopLoad = null, busy = Promise.resolve();
  function stored() { try { return localStorage.getItem(FLAG); } catch (e) { return null; } }
  function store(v) { try { if (v) localStorage.setItem(FLAG, v); else localStorage.removeItem(FLAG); } catch (e) { /* bloqueado */ } }
  var gpuWhy = '';
  function gpuVariant() {
    gpuWhy = '';
    if (!navigator.gpu) return Promise.resolve(null);
    return navigator.gpu.requestAdapter().then(function (a) {
      if (!a) return null;
      // WebLLM pide 32 KB de memoria de trabajo en la GPU; muchos celulares dan solo 16 KB y no pueden correr el modelo.
      if (a.limits && a.limits.maxComputeWorkgroupStorageSize < 32768) { gpuWhy = 'weak'; return null; }
      return a.features && a.features.has('shader-f16') ? 'f16' : 'f32';
    }, function () { return null; });
  }
  function status(msg, pct) { listeners.forEach(function (f) { f(msg, pct); }); }
  function cancelled() { var e = new Error('cancelled'); e.cancelled = true; return e; }
  // Un pedido al modelo por vez (el motor no atiende dos a la vez).
  function queue(fn) { var p = busy.then(fn, fn); busy = p.catch(function () {}); return p; }

  // El modelo se guarda en IndexedDB: la caché normal del navegador (Cache.add) falla con los
  // servidores nuevos de Hugging Face y la descarga se quedaba parada en pocos por ciento.
  function appConfig(webllm) { return Object.assign({}, webllm.prebuiltAppConfig, { cacheBackend: 'indexeddb' }); }

  function load(v) {
    if (engine) return Promise.resolve(engine);
    if (loadingP) return loadingP;
    variant = v;
    var my = ++run, first = !stored();
    loadingP = import(LIB).then(function (webllm) {
      if (my !== run) throw cancelled();
      var cfg = {
        appConfig: appConfig(webllm),
        initProgressCallback: function (r) {
          if (my !== run) return; // una descarga cancelada no vuelve a escribir en pantalla
          var p = Math.round((r.progress || 0) * 100), txt = r.text || '', mb = txt.match(/(\d+)\s*MB/);
          if (/shader|webgpu/i.test(txt) || p >= 100) status(t().loading, null);
          else status(first ? t().dl(p, mb && mb[1]) : t().opening(p), p);
        }
      };
      function main() {
        if (my !== run) throw cancelled();
        var e = new webllm.MLCEngine(cfg);
        stopLoad = function () { try { e.unload(); } catch (x) { /* ya cerrado */ } };
        return e.reload(MODELS[v]).then(function () { return e; });
      }
      // Abierta como archivo (file://) el navegador no deja crear el worker: se usa la página.
      var w = null;
      if (location.protocol !== 'file:') { try { w = new Worker('ia-worker.js', { type: 'module' }); } catch (e) { w = null; } }
      if (!w) return main();
      stopLoad = function () { try { w.terminate(); } catch (x) { /* ya cerrado */ } };
      return webllm.CreateWebWorkerMLCEngine(w, MODELS[v], cfg).catch(function (err) {
        try { w.terminate(); } catch (x) { /* ya cerrado */ }
        if (my !== run) throw cancelled();
        if (window.console) console.warn('IA local: el worker falló, se intenta en la página.', err);
        return main();
      });
    }).then(function (e) {
      if (my !== run) { try { e.unload(); } catch (x) { /* nada */ } throw cancelled(); }
      engine = e; loadingP = null; stopLoad = null; status(t().ready, 100); prime(); return e;
    }, function (err) {
      if (my === run) { loadingP = null; stopLoad = null; }
      throw (my === run ? err : cancelled());
    });
    status(t().loading, null);
    return loadingP;
  }
  // Cancelar: se corta el worker (o se descarga el motor) y se ignora todo lo que llegue después.
  function cancel() { run++; var f = stopLoad; stopLoad = null; loadingP = null; if (f) f(); }
  // Primer uso en segundo plano: el motor prepara sus sombreadores antes de que llegue la primera pregunta.
  function prime() { if (!engine || !engine.chat) return; queue(function () { return engine.chat.completions.create({ messages: [{ role: 'user', content: 'hola' }], max_tokens: 1, temperature: 0 }); }).catch(function () {}); }

  var SYS = 'Eres un clasificador de preguntas de productores agrícolas de Paraguay. ' +
    'Pueden escribir en español, inglés, portugués, guaraní o jopará, con errores. ' +
    'Tu única tarea es elegir el id del tema que mejor responde la pregunta, de esta lista. ' +
    'Si ninguno sirve, elige "ninguno". No respondas la pregunta.';
  function topicList() {
    var lines = KB.map(function (it) { return it.id + ': ' + it.title.es; });
    Object.keys(ENGINE).forEach(function (k) { lines.push(k + ': ' + ENGINE[k].es); });
    return lines.join('\n');
  }
  var SHOTS = [
    ['mba\'éichapa la ama ko año', 'sequia'], ['q es eso del indice verde', 'ndvi'], ['ro\'y oiko pa julio pe', 'helada_zona'],
    ['cuanto se le va el agua a la planta por el sol', 'et0'], ['cuál me conviene plantar', 'comparar'], ['quien gano el partido', 'ninguno'],
    ['esto me dice si va a llover mañana', 'limites'], ['mi tierra es colorada cual pongo', 'suelo'], ['como dibujo mi chacra en el mapa', 'ninguno']
  ];
  function ids() { return KB.map(function (it) { return it.id; }).concat(Object.keys(ENGINE), ['ninguno']); }
  function timeout(p) {
    var id;
    var late = new Promise(function (res) { id = setTimeout(function () { res(null); }, TIMEOUT_MS); });
    return Promise.race([p, late]).then(function (v) { clearTimeout(id); return v; });
  }

  // Devuelve un id válido, "ninguno", o null (salida inválida, error o demora).
  function classify(text) {
    var valid = ids();
    var msgs = [{ role: 'system', content: SYS + '\n\nTemas:\n' + topicList() + '\n\nResponde solo JSON: {"tema":"<id>"}' }];
    SHOTS.forEach(function (x) { msgs.push({ role: 'user', content: x[0] }); msgs.push({ role: 'assistant', content: '{"tema":"' + x[1] + '"}' }); });
    msgs.push({ role: 'user', content: String(text).slice(0, 300) });
    var schema = JSON.stringify({ type: 'object', properties: { tema: { type: 'string', enum: valid } }, required: ['tema'] });
    var req = { messages: msgs, temperature: 0, max_tokens: 24, response_format: { type: 'json_object', schema: schema } };
    return timeout(queue(function () {
      return engine.chat.completions.create(req).catch(function () {
        // Sin gramática (navegador sin soporte): igual se valida la salida contra la lista.
        delete req.response_format; return engine.chat.completions.create(req);
      });
    }).then(function (r) {
      var out = (r && r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) || '';
      var id = null;
      try { id = JSON.parse(out).tema; } catch (e) { var m = out.match(/"tema"\s*:\s*"([a-z0-9_]+)"/); id = m && m[1]; }
      return valid.indexOf(id) >= 0 ? id : null; // capa de seguridad: nada fuera de la lista
    }, function () { return null; }));
  }

  // ---------- 2b. Respuesta escrita por la IA (solo cuando ningún tema de la lista sirve) ----------
  var GUIDE = {
    es: 'Guía de la app (menú de la izquierda; en el celular, menú de abajo):\n' +
      '- Inicio y "Rotation Lab" (Rotaciones): elegir zona, escenario climático, tipo de suelo y qué te importa más; compara 4 rotaciones en 25 campañas, muestra cuál equilibra mejor tus prioridades y el calendario de siembra.\n' +
      '- "Field Monitor" (Mapa): mapa con imágenes de satélite de la NASA. Toca el mapa para elegir un punto, o usa "Dibujar parcela" y marca las esquinas. También se puede importar o exportar un GeoJSON, comparar dos fechas y descargar datos.\n' +
      '- "Field DNA": memoria climática de la zona en 25 campañas: lluvia para la soja, calor, heladas y humedad del suelo.\n' +
      '- "Climate Replay": los años difíciles (sequía 2021-22, El Niño, La Niña) y la prueba de estrés de las rotaciones.\n' +
      '- "Adaptive Monitor" (Alertas): cómo viene esta campaña, fechas clave, riesgo mes por mes y El Niño ahora.\n' +
      '- "Resilience Passport" (Informe): informe con evidencias; botón "Imprimir o guardar como PDF".\n' +
      '- "Mis parcelas": guardar la configuración actual y volver a abrirla.\n' +
      '- "Sensores y riego": qué aportaría cada sensor o equipo de riego.\n' +
      '- Arriba: idioma, tema claro u oscuro y Modo sol (alto contraste al aire libre). Funciona sin internet una vez abierta.',
    en: 'App guide (menu on the left; on a phone, menu at the bottom):\n' +
      '- Home and "Rotation Lab": pick area, climate scenario, soil type and what matters most to you; it compares 4 rotations over 25 seasons, shows which one best balances your priorities and the sowing calendar.\n' +
      '- "Field Monitor" (Map): map with NASA satellite images. Tap the map to pick a point, or use "Draw field" and mark the corners. You can also import or export GeoJSON, compare two dates and download data.\n' +
      '- "Field DNA": climate memory of the area over 25 seasons: rain for soy, heat, frost and soil moisture.\n' +
      '- "Climate Replay": the hard years (2021-22 drought, El Niño, La Niña) and the rotation stress test.\n' +
      '- "Adaptive Monitor": how this season is going, key dates, month-by-month risk and El Niño now.\n' +
      '- "Resilience Passport" (Report): report with evidence; "Print or save as PDF" button.\n' +
      '- "My fields": save the current setup and open it again.\n' +
      '- "Sensors and irrigation": what each sensor or irrigation device would add.\n' +
      '- At the top: language, light or dark theme and Sun mode (high contrast outdoors). Works offline once opened.'
  };
  var WRITE = {
    es: 'Eres el asistente de YvyShift, una app que ayuda a productores a comparar rotaciones de cultivos con 25 campañas de datos de clima de la NASA. Sirve en todo el mundo y está validada en Paraguay. ' +
      'Respondes preguntas de agricultura (suelo, cultivos, rotaciones, clima, agua) y de cómo usar la app. Responde en español sencillo, en 2 a 4 frases cortas, como un técnico agrícola amable. ' +
      'Si preguntan cómo usar la app, di en qué sección está y qué tocar, según la guía. Usa la información revisada cuando sirva. ' +
      'No inventes números, fechas ni precios, y nunca des dosis ni cantidades de agroquímicos, fertilizantes o semillas: para los números de su zona, indica la sección de la app; para dosis, que lea la etiqueta y consulte a su técnico. ' +
      'Si la pregunta no es de agricultura, clima o la app, di en una frase que solo ayudas con eso.',
    en: 'You are the assistant of YvyShift, an app that helps farmers compare crop rotations with 25 seasons of NASA climate data. It works worldwide and is validated in Paraguay. ' +
      'You answer questions about farming (soil, crops, rotations, climate, water) and about how to use the app. Answer in plain English, in 2 to 4 short sentences, like a friendly farm advisor. ' +
      'If asked how to use the app, say which section and what to tap, following the guide. Use the reviewed information when it helps. ' +
      'Do not make up numbers, dates or prices, and never give doses or amounts of agrochemicals, fertilizers or seed: for numbers about their area, point to the app section; for doses, tell them to read the label and ask their technician. ' +
      'If the question is not about farming, climate or the app, say in one sentence that you only help with that.'
  };
  function plain(html) {
    return String(html).replace(/<li>/g, '\n- ').replace(/<\/p>/g, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
  }
  function zoneName() { var s = $('loc'); var o = s && s.options && s.options[s.selectedIndex]; return o ? o.textContent.trim() : ''; }
  // Texto del modelo -> HTML seguro: se escapa todo y solo se arman párrafos, listas y negritas.
  function fmt(txt) {
    var out = '', list = false;
    esc(String(txt).trim()).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').split(/\n+/).forEach(function (ln) {
      var m = ln.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/);
      if (m) { if (!list) { out += '<ul>'; list = true; } out += '<li>' + m[1] + '</li>'; return; }
      if (list) { out += '</ul>'; list = false; }
      if (ln.trim()) out += '<p>' + ln.trim() + '</p>';
    });
    return out + (list ? '</ul>' : '');
  }
  // Capa de seguridad: se quita toda frase con un número que no esté en la guía o en los textos revisados
  // (así no puede aparecer una dosis, un precio o una lluvia inventada). Se aplica también mientras escribe.
  function nums(s) { return String(s).match(/\d+(?:[.,]\d+)?/g) || []; }
  function keepKnown(txt, known) {
    return String(txt).split('\n').map(function (ln) {
      var mk = (ln.match(/^\s*(?:[-*•]|\d+[.)])\s+/) || [''])[0], body = ln.slice(mk.length); // "1." de una lista no cuenta
      var keep = (body.match(/[^.!?]+[.!?]*\s*/g) || []).filter(function (f) {
        return nums(f).every(function (x) { return known.indexOf(x) >= 0; });
      }).join('').replace(/\s+$/, '');
      return keep ? mk + keep : '';
    }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  function aiHtml(txt, ctx) {
    var l = L(), T = t();
    return '<p class="kb-tag">' + esc(T.aiTag) + '</p>' + fmt(txt) +
      '<p class="kb-src">' + esc(T.based) + (ctx.length ? ' · ' + ctx.map(function (it) { return esc(it.title[l]); }).join(' · ') : '') + '</p>';
  }
  function write(raw, ctx, onText) {
    var l = L(), z = zoneName();
    var sys = WRITE[l] + '\n\n' + GUIDE[l] +
      (ctx.length ? '\n\n' + (l === 'es' ? 'Información revisada:' : 'Reviewed information:') + '\n' + ctx.map(function (it) { return '## ' + it.title[l] + '\n' + plain(it.text[l]).slice(0, 900); }).join('\n\n') : '') +
      (z ? '\n\n' + (l === 'es' ? 'Zona elegida en la app: ' : 'Area chosen in the app: ') + z : '');
    var known = nums(sys + ' ' + raw);
    var req = { messages: [{ role: 'system', content: sys }, { role: 'user', content: String(raw).slice(0, 400) }], temperature: 0.3, max_tokens: 220 };
    if (onText) req.stream = true;
    return timeout(queue(function () {
      return engine.chat.completions.create(req).then(function (r) {
        if (!req.stream || !r || !r[Symbol.asyncIterator]) return (r && r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) || '';
        var it = r[Symbol.asyncIterator](), acc = '';
        function pump() {
          return it.next().then(function (s) {
            if (s.done) return acc;
            var d = s.value && s.value.choices && s.value.choices[0] && s.value.choices[0].delta;
            acc += (d && d.content) || ''; onText(keepKnown(acc, known)); return pump();
          });
        }
        return pump();
      });
    }).then(function (txt) { return keepKnown(txt, known); }, function () { return ''; }));
  }

  // ---------- 3. Lo que llama app.js cuando el asistente guiado no entendió ----------
  // Devuelve null (no hay nada mejor), {html, chips} (respuesta de la base o de la IA) o {engineQuery} (repreguntar al motor).
  function fallback(raw, showThinking) {
    var T = t();
    var hit = byTitle(String(raw).trim());
    if (hit) return Promise.resolve({ html: kbHtml(hit, T.viaKb), chips: topicChips().slice(0, 6) });
    var j = jopara(norm(raw));
    if (j !== norm(raw)) {
      // La frase traía palabras guaraníes: se reintenta con el asistente guiado, sin IA.
      var k0 = search(raw);
      if (k0 && k0.score >= 3) return Promise.resolve({ html: kbHtml(k0.item, T.viaKb), chips: topicChips().slice(0, 6) });
      return Promise.resolve({ engineQuery: j, tag: T.jop(esc(j)) });
    }
    var k = search(raw);
    if (k && (k.score >= 3 || !stored())) return Promise.resolve({ html: kbHtml(k.item, T.viaKb), chips: topicChips().slice(0, 6) });
    if (!stored() || !(navigator.gpu)) return Promise.resolve(k ? { html: kbHtml(k.item, T.viaKb), chips: topicChips().slice(0, 6) } : none());
    var done = showThinking ? showThinking(T.thinking) : function () {};
    var kbOr = function () { return k ? { html: kbHtml(k.item, T.viaKb), chips: topicChips().slice(0, 6) } : none(); };
    return load(stored()).then(function () { return classify(raw); }).then(function (id) {
      if (!id) { done(); return kbOr(); }
      if (ENGINE[id]) { done(); return { engineQuery: ENGINE[id].q, tag: T.picked(esc(ENGINE[id][L()]), T.viaIa) }; }
      if (id !== 'ninguno') { done(); return { html: kbHtml(byId(id), T.viaIa), chips: topicChips().slice(0, 6) }; }
      // Ningún tema sirve: la IA escribe una respuesta corta con la guía de la app y los textos revisados más cercanos.
      var ctx = rank(raw).slice(0, 2).map(function (x) { return x.item; });
      var log = $('chatLog'), bub = log && log.lastElementChild;
      if (!bub || !/typing/.test(bub.className)) bub = null;
      if (bub) bub.innerHTML = '<p>' + esc(T.writing) + '</p>';
      return write(raw, ctx, bub ? function (txt) { bub.innerHTML = '<p class="kb-tag">' + esc(T.writing) + '</p>' + fmt(txt); log.scrollTop = log.scrollHeight; } : null).then(function (txt) {
        done();
        return txt && txt.trim() ? { html: aiHtml(txt, ctx), chips: topicChips().slice(0, 6) } : kbOr();
      });
    }, function () { done(); return kbOr(); });
  }
  function none() { return { html: '<p>' + t().none + '</p>', chips: topicChips() }; }

  // ---------- 4. Interfaz: aviso fijo + instalar/quitar/cancelar ----------
  function ui() {
    var box = $('iaBox'); if (!box) return;
    var T = t(), on = !!stored();
    $('chatWarn').textContent = T.warn;
    box.innerHTML =
      '<div class="ia-row"><button type="button" class="ghost ia-btn" id="iaToggle">' + (on ? T.remove : T.install) + '</button>' +
      '<button type="button" class="ghost ia-why" id="iaWhy" aria-expanded="false">' + T.why + '</button></div>' +
      '<p class="ia-st" id="iaSt" role="status">' + (engine ? T.ready : on ? T.ready : T.off) + '</p>' +
      '<div class="ia-prog" id="iaProg" hidden><div class="ia-bar" id="iaBar"><span></span></div>' +
      '<button type="button" class="ia-cancel" id="iaCancel">' + T.cancel + '</button></div>' +
      '<p class="ia-more" id="iaMore" hidden>' + T.whyTxt + '</p>' +
      '<div class="ia-ask" id="iaAsk" hidden></div>';
    $('iaWhy').onclick = function () { var m = $('iaMore'); m.hidden = !m.hidden; this.setAttribute('aria-expanded', String(!m.hidden)); };
    $('iaToggle').onclick = function () { stored() ? uninstall() : install(false); };
    $('iaCancel').onclick = function () { cancel(); var b = $('iaToggle'); if (b) b.disabled = false; setSt(t().canceled); };
    if (loadingP && !stored()) { $('iaToggle').disabled = true; setSt(T.loading, 0); }
  }
  // pct: número = barra con ese avance y botón Cancelar; null = trabajando sin porcentaje; undefined = sin barra.
  function setSt(msg, pct) {
    var st = $('iaSt'), pr = $('iaProg'), bar = $('iaBar'); if (!st) return;
    st.textContent = msg;
    var on = pct === null || (pct != null && pct < 100);
    if (pr) pr.hidden = !(on && loadingP);
    if (bar && on) { bar.className = 'ia-bar' + (pct === null ? ' ia-wait' : ''); bar.firstChild.style.width = (pct === null ? 100 : pct) + '%'; }
  }
  listeners.push(setSt);

  function install(force) {
    var T = t();
    if (!navigator.onLine) { setSt(T.offline); return; }
    gpuVariant().then(function (v) {
      if (!v) { setSt(gpuWhy === 'weak' ? T.weakGpu : T.noGpu); return; }
      var c = navigator.connection || {};
      if (!force && (c.saveData || c.type === 'cellular' || /2g|3g/.test(c.effectiveType || ''))) {
        var ask = $('iaAsk'); ask.hidden = false;
        ask.innerHTML = '<p>' + T.cell(SIZE[v]) + '</p><button type="button" id="iaYes">' + T.yes + '</button> <button type="button" class="ghost" id="iaNo">' + T.no + '</button>';
        $('iaYes').onclick = function () { ask.hidden = true; install(true); };
        $('iaNo').onclick = function () { ask.hidden = true; };
        return;
      }
      var est = navigator.storage && navigator.storage.estimate ? navigator.storage.estimate() : Promise.resolve(null);
      return est.then(function (e) {
        var need = v === 'f16' ? 1.0e9 : 1.25e9;
        if (e && e.quota && e.quota - (e.usage || 0) < need) { setSt(T.space(SIZE[v])); return; }
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
        // Restos de la versión anterior (caché normal, modelo Llama): se borran para no ocupar espacio.
        if (window.caches && caches.keys) caches.keys().then(function (ks) { ks.filter(function (k) { return /^webllm/.test(k); }).forEach(function (k) { caches.delete(k); }); }).catch(function () {});
        $('iaToggle').disabled = true;
        var NET = /dynamically imported module|Failed to fetch|NetworkError|network error|Load failed|Failed to store/i;
        // Una descarga cortada se reintenta sola: WebLLM guarda cada pedazo bajado y sigue donde quedó.
        function attempt(n) {
          return load(v).catch(function (err) {
            if (err && err.cancelled) throw err;
            var m = String((err && err.message) || err);
            if (!NET.test(m) || n >= 3 || !navigator.onLine) throw err;
            if (window.console) console.warn('IA local: reintento ' + n, err);
            setSt(T.retrying(n), null);
            return new Promise(function (res) { setTimeout(res, 1500 * n); }).then(function () { return attempt(n + 1); });
          });
        }
        attempt(1).then(function () { store(v); ui(); setSt(T.ready); },
          function (err) {
            if (err && err.cancelled) return; // el usuario canceló: ya se mostró el aviso
            var b = $('iaToggle'); if (b) b.disabled = false;
            var m = String((err && err.message) || err);
            if (window.console) console.error('IA local:', err);
            // Se muestra la causa real (corta) para poder diagnosticar; el mensaje largo solo explica qué hacer.
            setSt(T.fail(NET.test(m) ? T.netFail + ' · ' + m.replace(/https?:\/\/\S+/g, function (u) { return u.replace(/^https?:\/\/([^/]+).*/, '$1'); }).slice(0, 110) : m.slice(0, 160)));
          });
      });
    }).catch(function (err) { setSt(T.fail(String((err && err.message) || err).slice(0, 160))); });
  }
  function uninstall() {
    var v = stored();
    store(null);
    cancel();
    var drop = engine ? Promise.resolve(engine.unload && engine.unload()).catch(function () {}) : Promise.resolve();
    engine = null;
    drop.then(function () { return import(LIB).then(function (w) { return w.deleteModelAllInfoInCache(MODELS[v], appConfig(w)); }); })
      .catch(function () { /* si la librería no está, se borran las cachés a mano */ })
      .then(function () {
        if (!window.caches) return;
        return caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return /^webllm/.test(k); }).map(function (k) { return caches.delete(k); })); });
      }).catch(function () {}).then(function () { ui(); setSt(t().removed); });
  }

  // Si ya está instalada, se carga en segundo plano cuando la persona toca la caja de texto (ahorra batería).
  function warm() { var v = stored(); if (v && !engine && !loadingP && navigator.gpu) load(v).catch(function (e) { if (!(e && e.cancelled)) setSt(t().off); }); }

  window.YvyIA = { fallback: fallback, isTitle: function (x) { return !!byTitle(String(x).trim()); }, search: search, ui: ui, warm: warm, installed: function () { return !!stored(); }, _kb: KB, _engineIds: function () { return Object.keys(ENGINE); }, _setEngine: function (e) { engine = e; }, _fmt: fmt, cancel: cancel, _jopara: function (s) { return jopara(norm(s)); } };

  document.addEventListener('DOMContentLoaded', ui);
  if (document.readyState !== 'loading') ui();
  var inp = $('chatIn'); if (inp) inp.addEventListener('focus', warm, { once: true });
  // Volver a dibujar los textos al cambiar de idioma.
  new MutationObserver(ui).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
