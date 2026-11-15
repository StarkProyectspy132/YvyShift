/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). La IA local es opcional y solo elige un tema (ver asistente-ia.js). */
/* Interfaz de YvyShift (módulo Rotation Lab y vistas comunes). Lógica de cálculo en engine.js. */
(function () {
  'use strict';
  var E = window.Engine;
  var CACHE = window.POWER_CACHE;
  var DIM_COLORS = { waterDeficit: 'var(--c-water)', heatDays: 'var(--c-heat)', frostDays: 'var(--c-frost)', coverPct: 'var(--c-cover)', grainHarvests: 'var(--c-grain)', cropFamilies: 'var(--c-div)' };
  var lang = 'es';
  // Índice ONI de NOAA para agrupar campañas por fase ENSO (opcional: si falta el archivo, la app sigue funcionando).
  var ONI = window.ENSO_ONI || null;
  function phaseOf(y) { return ONI ? E.ensoPhase(ONI.ndj[y], ONI.threshold) : null; }
  function isPhase(s) { return s === 'nina' || s === 'nino'; }
  // Valores del escenario; para 'nina' / 'nino' es la mediana de las campañas de esa fase.
  function scenVals(by, scen) {
    if (!isPhase(scen)) return E.scenarioValues(by, scen);
    var f = {};
    Object.keys(by).forEach(function (y) { if (phaseOf(y) === scen) f[y] = by[y]; });
    return E.scenarioValues(f, 'median');
  }
  var helpQ = 'why', helpCtx = null;

  var T = {
    es: {
      dims: { waterDeficit: 'Agua (menos déficit)', heatDays: 'Calor en floración', frostDays: 'Heladas', coverPct: 'Suelo cubierto', grainHarvests: 'Cosechas por año', cropFamilies: 'Diversidad de cultivos' },
      units: { waterDeficit: 'mm', heatDays: 'días', frostDays: 'días', coverPct: '%', grainHarvests: '', cropFamilies: 'familias' },
      scen: { median: 'Año típico (mediana 2001–2025)', p80: 'Año desfavorable (peor quinto de cada indicador)', year: 'Campaña ' },
      best: function (n, s, why) { return '<b>' + n + '</b> es la que mejor equilibra tus prioridades en este escenario' + (why.length ? ', sobre todo por ' + why.join(' y ').toLowerCase() : '') + '.'; },
      rotation: 'Rotación', score: 'Puntaje',
      ev: function (o) { return 'En la campaña ' + o.y + ' la soja recibió <b>' + o.p + ' mm</b> de lluvia y demandó <b>' + o.etc + ' mm</b>; déficit acumulado <b>' + o.def + ' mm</b> y <b>' + o.heat + '</b> días ≥ 35 °C en floración. Mediana 2001–2025: déficit ' + o.mdef + ' mm, ' + o.mheat + ' días de calor.'; },
      cell: 'Punto', fetched: 'descargado', live: 'Descargando de NASA POWER…', ok: 'Listo: datos reales descargados.', fail: 'No se pudo descargar: ', yearsLbl: 'años usados',
      vEyebrow: 'Mejor equilibrio en este escenario',
      vWhy: function (id2, diff, why) { return 'Supera a la segunda opción (' + id2 + ') por ' + diff + ' puntos' + (why.length ? ', sobre todo por ' + why.join(' y ').toLowerCase() : '') + '.'; },
      vTie: 'Con estas prioridades no hay diferencia con la segunda opción.',
      vRobust: function (w, n) { return 'Queda primera en ' + w + ' de ' + n + ' campañas con estas prioridades'; },
      climate: 'clima (datos NASA)', calendarPts: 'calendario de la rotación', grpClimate: 'Clima (datos NASA):', grpSoil: 'Salud del suelo (calendario):', grpProd: 'Producción (calendario):',
      presets: { balanced: 'Equilibrado', water: 'Cuidar el agua', soil: 'Cuidar el suelo', harvest: 'Más cosechas' },
      presetsLbl: 'Prioridades rápidas', firstIn: 'primera en',
      stat1: 'campañas de datos de NASA en esta zona',
      stat2: function (etc) { return 'de lluvia en la sequía 2021–22. La soja pedía ' + etc + ' mm'; },
      stat3: 'rotaciones comparadas según seis prioridades que tú eliges',
      chartAria: function (n, y, p, etc) { return 'Gráfico de ' + n + ' campañas: lluvia en el ciclo de la soja y demanda del cultivo.' + (y ? ' En ' + y + ': ' + p + ' mm de lluvia y ' + etc + ' mm de demanda.' : ''); },
      cohText: function (o) { return 'En ' + o.n + ' períodos de 10 días con soja (' + o.ny + ' campañas), la correlación entre las dos series es <b>r = ' + o.r + '</b> (1 sería idéntico, 0 sin relación). El gráfico muestra la campaña ' + o.y + '. <b>No es una validación independiente:</b> las dos series parten de la misma lluvia de MERRA-2. Sirve para comprobar que el balance se mueve en la misma dirección que el modelo de NASA; falta contrastarlo con SMAP o con una estación.'; },
      cohRange: function (o) { return 'En esta campaña nuestro balance va de ' + o.m0 + ' % a ' + o.m1 + ' %; GWETROOT, de ' + o.g0 + ' % a ' + o.g1 + ' %.'; },
      cohStrong: 'Nuestro balance simple reacciona mucho más fuerte que el modelo de NASA: es otra razón para leer el déficit de agua como exploratorio.',
      cohNoSoil: 'Elige un tipo de suelo para ver este control: con «solo clima» el modelo no calcula agua almacenada.',
      cohNoData: 'Esta ubicación no tiene datos de GWETROOT suficientes para el control.',
      cohAria: function (y) { return 'Gráfico de la campaña ' + y + ': agua del suelo del modelo y humedad de zona radicular de NASA POWER, por períodos de 10 días.'; },
      mapAlt: 'Mapa del sudeste de Paraguay con los puntos disponibles',
      mapPicked: 'Punto elegido. Pulsa "Descargar datos" para traer sus campañas de NASA POWER.',
      mapCell: function (c, pend) { return (pend ? 'Punto nuevo, todavía sin descargar. ' : '') + 'El recuadro naranja es la celda aproximada de NASA POWER que representa este punto (centro ' + c.latC + ', ' + c.lonC + '): unos ' + c.kmNS + ' × ' + c.kmEW + ' km. Los resultados valen para todo ese recuadro, no para una parcela.'; },
      simTag: function (a) { return 'Simulación (lluvia ' + (a > 0 ? '+' : '') + a + ' %):'; },
      simNote: function (a) { return 'Simulación: lluvia ' + (a > 0 ? '+' : '') + a + ' % respecto de lo observado en cada campaña. Estos números no son datos observados de NASA. La temperatura no cambia.'; },
      jTitle: 'Dónde pesa más tu criterio',
      jClose: function (d, id) { return 'La diferencia con la segunda opción (' + id + ') es de solo ' + d + ' puntos: es casi un empate y decide tu experiencia.'; },
      jFew: function (w, n) { return 'Queda primera en ' + w + ' de ' + n + ' campañas: menos de la mitad.'; },
      jSow: 'El resultado cambia si la siembra se corre 10 días: mandan tus fechas reales.',
      jMaize: 'Alcance del modelo: cada rotación se evalúa en un año agrícola completo, del 1 de mayo al 30 de abril. En D, el maíz zafriña se evalúa hasta el 30 de abril; su tramo final (mayo a julio, según FAO GIEWS) queda fuera de esta versión y está en la hoja de ruta. Por eso el riesgo de helada de D puede ser algo mayor que el mostrado.',
      jAlways: 'La herramienta no ve tu lote, tus máquinas, plagas y enfermedades, precios ni contratos. Eso lo saben tú y tu técnico.',
      exclNote: function (l) { return 'Fuera de la comparación por tus limitaciones: ' + l + '. Los puntajes se recalculan solo entre las que quedan.'; },
      limits: { trigo: 'Trigo', maiz: 'Maíz zafriña', avena: 'Avena negra', early: 'Soja en septiembre (siembra temprana)' },
      janOf: function (y) { return 'Ene ' + y; }, satLoading: 'Cargando desde NASA GIBS…',
      satFail: 'No se pudo cargar: hace falta conexión. Vuelve la imagen guardada.',
      satAlt: function (y) { return 'NDVI de MODIS, 1 al 16 de enero de ' + y + ', sudeste de Paraguay'; },
      satCap: function (o) { return 'Campaña ' + o.y + ' en la zona elegida: ' + o.p + ' mm de lluvia para la soja frente a ' + o.etc + ' mm de demanda (NASA POWER)' + (o.ph ? ' · ' + o.ph : '') + '.'; },
      outOfRange: 'Coordenadas no válidas. Usa una latitud entre −60 y 75 y una longitud entre −180 y 180.',
      tplNote: function (o) { return '<b>Estás fuera de Paraguay' + (o.hemi === 'N' ? ', en el hemisferio norte' : '') + '.</b> Las cuatro rotaciones fijas son una plantilla: el calendario de Paraguay' + (o.hemi === 'N' ? ' corrido seis meses (la soja se siembra el 11 de abril en lugar del 11 de octubre)' : '') + ', no un calendario local. El clima de la zona (lluvia, calor, heladas, demanda de agua) sí se calcula igual que en Paraguay. Para tu calendario real usa «Armar mi rotación».' + (o.tropical ? ' Cerca del ecuador las estaciones siguen a las lluvias más que al calendario.' : ''); },
      scenEnso: { nina: function (n) { return 'Campañas con La Niña (mediana de ' + n + ')'; }, nino: function (n) { return 'Campañas con El Niño (mediana de ' + n + ')'; } },
      phase: { nina: 'La Niña', neutral: 'Neutro', nino: 'El Niño' },
      ensoKey: '▲ campaña con El Niño · ▼ campaña con La Niña · sin marca: neutra (índice ONI de NOAA, trimestre nov–ene).',
      ensoCols: ['Fase', 'Campañas', 'Lluvia para la soja, mediana (mm)', 'Rango (mm)', 'Lluvia menor que la demanda', 'Agua que faltó, mediana (mm)', 'Días de calor en floración, mediana', 'Primera más veces'],
      ensoText: function (o) { return 'En esta zona, las campañas con La Niña dejaron una mediana de <b>' + o.nina.rain + ' mm</b> de lluvia en el ciclo de la soja; las de El Niño, <b>' + o.nino.rain + ' mm</b>. Pero los rangos se pisan (' + o.nina.rainMin + '–' + o.nina.rainMax + ' frente a ' + o.nino.rainMin + '–' + o.nino.rainMax + ' mm): la fase inclina la balanza, no decide la campaña.'; },
      ensoLatest: function (v, ph) { return 'Último valor publicado por NOAA: ONI ' + v + ' (' + ph + '). Es lo observado, no un pronóstico.'; },
      help: {
        q: { why: '¿Por qué quedó primera esta rotación?', enso: '¿Qué pasa aquí con El Niño y La Niña?', water: '¿Cada cuánto le falta agua a la soja?', trust: '¿Puedo confiar en este resultado?', rotate: '¿Por qué rotar y cubrir el suelo?', terms: '¿Qué significan los términos?', limits: '¿Qué no me dice esta herramienta?' },
        a: {
          why: function (c) {
            var a = c.rows[0], v = c.results[a.id], b = c.rows[1];
            return '<p><b>' + c.name(a.id) + '</b> queda primera con ' + String(a.score).replace('.', ',') + ' puntos' + (b ? ', ' + c.diff + ' más que ' + c.name(b.id) : '') + '.' + (c.why.length ? ' Donde más ventaja saca: ' + c.why.join(' y ').toLowerCase() + '.' : '') + '</p>' +
              '<p>Sus números en este escenario: ' + v.waterDeficit + ' mm de agua que faltó, ' + v.heatDays + ' días de calor en floración, ' + v.frostDays + ' días de helada, ' + v.coverPct + ' % del año con suelo cubierto, ' + v.grainHarvests + ' cosecha(s) y ' + v.cropFamilies + ' familia(s) de cultivos.</p>' +
              '<p>El orden depende de tus prioridades: prueba los atajos de la sección 1 y mira cómo cambia.</p>';
          },
          enso: function (c) {
            var e = c.enso;
            return '<p>Con La Niña (' + e.nina.n + ' campañas): mediana de ' + e.nina.rain + ' mm de lluvia para la soja, y la lluvia fue menor que la demanda en ' + e.nina.short + ' de ' + e.nina.n + '. Con El Niño (' + e.nino.n + ' campañas): ' + e.nino.rain + ' mm, y faltó en ' + e.nino.short + ' de ' + e.nino.n + '.</p>' +
              '<p>Con tus prioridades, en La Niña quedó primera más veces ' + e.nina.top.join(' = ') + ' (' + e.nina.topN + ' de ' + e.nina.n + '); en El Niño, ' + e.nino.top.join(' = ') + ' (' + e.nino.topN + ' de ' + e.nino.n + ').</p>' +
              '<p>' + (e.latest ? 'Último valor de NOAA: ONI ' + e.latest + '. ' : '') + 'Esto describe lo que pasó, no pronostica la próxima campaña. Puedes elegir "Campañas con La Niña" o "con El Niño" como escenario en la sección 1.</p>';
          },
          water: function (c) {
            var s = c.soy;
            return '<p>En ' + s.short + ' de ' + s.n + ' campañas, la lluvia del ciclo de la soja (' + monthSpan(16, 27) + ') fue menor que lo que el cultivo pedía.</p>' +
              '<p>La peor fue ' + s.worst.y + '–' + String(+s.worst.y + 1).slice(2) + ': ' + s.worst.p + ' mm de lluvia frente a ' + s.worst.etc + ' mm de demanda. En una campaña típica llueven ' + s.rain + ' mm en ese período.</p>' +
              '<p>Son datos regionales de NASA POWER (celda de unos 50 km), no de tu lote.</p>';
          },
          trust: function (c) {
            var a = c.rows[0];
            return '<p>Es un resultado <b>exploratorio</b>. ' + c.name(a.id) + ' queda primera en ' + c.sw.wins[a.id] + ' de ' + c.sw.n + ' campañas con estas prioridades, no en todas.</p>' +
              '<p>' + (c.sensChanged ? 'Si la siembra se corre 10 días, la rotación que más veces queda primera cambia.' : 'Si la siembra se corre 10 días, la rotación que más veces queda primera se mantiene.') + ' Las fechas de siembra y los umbrales de calor y helada son supuestos sin validar todavía.</p>' +
              '<p>Lo que más puede cambiarlo: las fechas reales de tu zona y el suelo de tu lote. Úsalo para conversar con un técnico, no para reemplazarlo.</p>';
          },
          rotate: function (c) {
            return '<p>La FAO resume la agricultura de conservación en tres principios: mover el suelo lo menos posible, mantenerlo cubierto todo el año y diversificar los cultivos. Esta herramienta mide el segundo y el tercero.</p>' +
              '<p>En tus rotaciones: ' + c.rows.map(function (r) { var v = c.results[r.id]; return r.id + ' cubre el suelo el ' + v.coverPct + ' % del año con ' + v.cropFamilies + ' familia(s) de cultivos'; }).join('; ') + '.</p>' +
              '<p>El costo también se ve en los datos: un cultivo más en invierno usa agua que después puede faltarle a la soja. Por eso la herramienta muestra las dos cosas juntas. Fuente de los principios: <a href="https://www.fao.org/conservation-agriculture/es/" target="_blank" rel="noopener">FAO, Agricultura de Conservación</a>.</p>';
          },
          terms: function () {
            return '<dl><dt>Agua que faltó (déficit)</dt><dd>Milímetros que el cultivo pedía y que ni la lluvia ni el agua guardada en el suelo cubrieron.</dd>' +
              '<dt>Demanda del cultivo (ETc)</dt><dd>Agua que el cultivo necesita según el calor, el sol y su etapa. Se calcula con el método FAO-56.</dd>' +
              '<dt>Calor en floración</dt><dd>Días con máxima de 35 °C o más en la etapa media del cultivo. Umbral tomado de Salem et al. (2007, Crop Science 47:219), que encontraron que la reproducción de la soja es sensible a más de 35 °C; para trigo y maíz es un supuesto.</dd>' +
              '<dt>Helada</dt><dd>Días con mínima de 2 °C o menos a 2 m. Es un umbral intermedio entre la helada meteorológica (0 °C a 1,5 m) y la agrometeorológica (3 °C a 1,5 m) que cita el INTA (Instituto de Clima y Agua, Argentina); falta validarlo con un agrónomo local.</dd>' +
              '<dt>Suelo cubierto</dt><dd>Parte del año con un cultivo vivo en el lote.</dd>' +
              '<dt>Diversidad</dt><dd>Familias de cultivos distintas en la rotación: leguminosas (soja) y gramíneas (trigo, avena, maíz).</dd>' +
              '<dt>Zafriña</dt><dd>Segundo cultivo sembrado enseguida después de la soja temprana.</dd>' +
              '<dt>El Niño y La Niña (ONI)</dt><dd>Calentamiento o enfriamiento del Pacífico ecuatorial que mide NOAA. Cambia las probabilidades de lluvia en la región.</dd></dl>';
          },
          limits: function () {
            return '<p>No calcula costos, precios ni ganancias. No predice rendimientos. No pronostica el clima: compara con lo que ya pasó desde 2001.</p>' +
              '<p>No conoce tu lote: usa una celda regional de NASA POWER y un tipo de suelo genérico. No se conecta a sensores ni a equipos de riego.</p>' +
              '<p>No recomienda qué sembrar: muestra compromisos para que decidas mejor informado.</p>';
          }
        }
      },
      langBtn: 'English', langAria: 'Switch to English', themeAria: 'Cambiar tema claro u oscuro'
    },
    en: {
      dims: { waterDeficit: 'Water (less deficit)', heatDays: 'Heat at flowering', frostDays: 'Frost', coverPct: 'Soil covered', grainHarvests: 'Harvests per year', cropFamilies: 'Crop diversity' },
      units: { waterDeficit: 'mm', heatDays: 'days', frostDays: 'days', coverPct: '%', grainHarvests: '', cropFamilies: 'families' },
      scen: { median: 'Typical year (median 2001–2025)', p80: 'Bad year (worst fifth of each indicator)', year: 'Season ' },
      best: function (n, s, why) { return '<b>' + n + '</b> best balances your priorities in this scenario' + (why.length ? ', mainly due to ' + why.join(' and ').toLowerCase() : '') + '.'; },
      rotation: 'Rotation', score: 'Score',
      ev: function (o) { return 'In the ' + o.y + ' season soybean received <b>' + o.p + ' mm</b> of rain and needed <b>' + o.etc + ' mm</b>; cumulative deficit <b>' + o.def + ' mm</b> and <b>' + o.heat + '</b> days ≥ 35 °C at flowering. 2001–2025 median: deficit ' + o.mdef + ' mm, ' + o.mheat + ' heat days.'; },
      cell: 'Point', fetched: 'downloaded', live: 'Downloading from NASA POWER…', ok: 'Done: real data downloaded.', fail: 'Download failed: ', yearsLbl: 'years used',
      vEyebrow: 'Best balance in this scenario',
      vWhy: function (id2, diff, why) { return 'It beats the second option (' + id2 + ') by ' + diff + ' points' + (why.length ? ', mainly due to ' + why.join(' and ').toLowerCase() : '') + '.'; },
      vTie: 'With these priorities there is no difference with the second option.',
      vRobust: function (w, n) { return 'Ranks first in ' + w + ' of ' + n + ' seasons with these priorities'; },
      climate: 'climate (NASA data)', calendarPts: 'rotation calendar', grpClimate: 'Climate (NASA data):', grpSoil: 'Soil health (calendar):', grpProd: 'Production (calendar):',
      presets: { balanced: 'Balanced', water: 'Protect water', soil: 'Protect the soil', harvest: 'More harvests' },
      presetsLbl: 'Quick priorities', firstIn: 'first in',
      stat1: 'seasons of NASA data for this area',
      stat2: function (etc) { return 'of rain in the 2021–22 drought. Soybean needed ' + etc + ' mm'; },
      stat3: 'rotations compared on six priorities you choose',
      chartAria: function (n, y, p, etc) { return 'Chart of ' + n + ' seasons: rain during the soybean cycle and crop water demand.' + (y ? ' In ' + y + ': ' + p + ' mm of rain and ' + etc + ' mm of demand.' : ''); },
      cohText: function (o) { return 'Over ' + o.n + ' ten-day periods with soybean (' + o.ny + ' seasons), the correlation between the two series is <b>r = ' + o.r + '</b> (1 would be identical, 0 unrelated). The chart shows the ' + o.y + ' season. <b>This is not an independent validation:</b> both series start from the same MERRA-2 rainfall. It checks that our balance moves in the same direction as NASA’s model; a comparison with SMAP or a ground station is still pending.'; },
      cohRange: function (o) { return 'In this season our balance ranges from ' + o.m0 + '% to ' + o.m1 + '%; GWETROOT, from ' + o.g0 + '% to ' + o.g1 + '%.'; },
      cohStrong: 'Our simple balance reacts much more strongly than NASA’s model: one more reason to read the water deficit as exploratory.',
      cohNoSoil: 'Pick a soil type to see this check: with the pure climate baseline the model does not compute stored water.',
      cohNoData: 'This location does not have enough GWETROOT data for the check.',
      cohAria: function (y) { return 'Chart of the ' + y + ' season: model soil water and NASA POWER root-zone wetness, by ten-day period.'; },
      mapAlt: 'Map of southeastern Paraguay with the available points',
      mapPicked: 'Point selected. Press "Download data" to fetch its NASA POWER seasons.',
      mapCell: function (c, pend) { return (pend ? 'New point, not downloaded yet. ' : '') + 'The orange box is the approximate NASA POWER cell that represents this point (centre ' + c.latC + ', ' + c.lonC + '): about ' + c.kmNS + ' × ' + c.kmEW + ' km. Results apply to that whole box, not to a single field.'; },
      simTag: function (a) { return 'Simulation (rain ' + (a > 0 ? '+' : '') + a + '%):'; },
      simNote: function (a) { return 'Simulation: rain ' + (a > 0 ? '+' : '') + a + '% relative to what was observed in each season. These numbers are not observed NASA data. Temperature does not change.'; },
      jTitle: 'Where your judgment matters most',
      jClose: function (d, id) { return 'The gap to the second option (' + id + ') is only ' + d + ' points: nearly a tie, so your experience decides.'; },
      jFew: function (w, n) { return 'It ranks first in ' + w + ' of ' + n + ' seasons: fewer than half.'; },
      jSow: 'The result changes if sowing moves by 10 days: your real dates rule.',
      jMaize: 'Model scope: every rotation is evaluated over one full farming year, 1 May to 30 April. In D, second-crop maize is evaluated up to 30 April; its last stretch (May to July, per FAO GIEWS) is outside this version and is on the roadmap. So the frost risk of D may be somewhat higher than shown.',
      jAlways: 'The tool cannot see your field, your machinery, pests and diseases, prices or contracts. You and your technician know those.',
      exclNote: function (l) { return 'Left out of the comparison because of your constraints: ' + l + '. Scores are recalculated among the remaining ones only.'; },
      limits: { trigo: 'Wheat', maiz: 'Second-crop maize', avena: 'Black oat', early: 'Soybean in September (early sowing)' },
      janOf: function (y) { return 'Jan ' + y; }, satLoading: 'Loading from NASA GIBS…',
      satFail: 'Could not load: a connection is needed. Back to the stored image.',
      satAlt: function (y) { return 'MODIS NDVI, 1–16 January ' + y + ', southeastern Paraguay'; },
      satCap: function (o) { return o.y + ' season in the selected area: ' + o.p + ' mm of rain for soybean against ' + o.etc + ' mm of demand (NASA POWER)' + (o.ph ? ' · ' + o.ph : '') + '.'; },
      outOfRange: 'Invalid coordinates. Use a latitude between −60 and 75 and a longitude between −180 and 180.',
      tplNote: function (o) { return '<b>You are outside Paraguay' + (o.hemi === 'N' ? ', in the northern hemisphere' : '') + '.</b> The four fixed rotations are a template: Paraguay’s calendar' + (o.hemi === 'N' ? ' shifted by six months (soybean sown on 11 April instead of 11 October)' : '') + ', not a local calendar. The area’s climate (rain, heat, frost, water demand) is computed exactly as in Paraguay. For your real calendar use "Build my rotation".' + (o.tropical ? ' Near the equator the seasons follow the rains more than the calendar.' : ''); },
      scenEnso: { nina: function (n) { return 'La Niña seasons (median of ' + n + ')'; }, nino: function (n) { return 'El Niño seasons (median of ' + n + ')'; } },
      phase: { nina: 'La Niña', neutral: 'Neutral', nino: 'El Niño' },
      ensoKey: '▲ El Niño season · ▼ La Niña season · no mark: neutral (NOAA ONI index, Nov–Jan quarter).',
      ensoCols: ['Phase', 'Seasons', 'Rain for soybean, median (mm)', 'Range (mm)', 'Rain below demand', 'Water shortfall, median (mm)', 'Heat days at flowering, median', 'First most often'],
      ensoText: function (o) { return 'In this area, La Niña seasons had a median of <b>' + o.nina.rain + ' mm</b> of rain during the soybean cycle; El Niño seasons, <b>' + o.nino.rain + ' mm</b>. But the ranges overlap (' + o.nina.rainMin + '–' + o.nina.rainMax + ' against ' + o.nino.rainMin + '–' + o.nino.rainMax + ' mm): the phase tilts the odds, it does not decide the season.'; },
      ensoLatest: function (v, ph) { return 'Latest value published by NOAA: ONI ' + v + ' (' + ph + '). This is observed, not a forecast.'; },
      help: {
        q: { why: 'Why did this rotation rank first?', enso: 'What happens here with El Niño and La Niña?', water: 'How often is soybean short of water?', trust: 'Can I trust this result?', rotate: 'Why rotate crops and cover the soil?', terms: 'What do the terms mean?', limits: 'What does this tool not tell me?' },
        a: {
          why: function (c) {
            var a = c.rows[0], v = c.results[a.id], b = c.rows[1];
            return '<p><b>' + c.name(a.id) + '</b> ranks first with ' + a.score + ' points' + (b ? ', ' + c.diff + ' more than ' + c.name(b.id) : '') + '.' + (c.why.length ? ' Its biggest advantages: ' + c.why.join(' and ').toLowerCase() + '.' : '') + '</p>' +
              '<p>Its numbers in this scenario: ' + v.waterDeficit + ' mm of water shortfall, ' + v.heatDays + ' heat days at flowering, ' + v.frostDays + ' frost days, ' + v.coverPct + '% of the year with soil cover, ' + v.grainHarvests + ' harvest(s) and ' + v.cropFamilies + ' crop family(ies).</p>' +
              '<p>The order depends on your priorities: try the shortcuts in section 1 and watch it change.</p>';
          },
          enso: function (c) {
            var e = c.enso;
            return '<p>With La Niña (' + e.nina.n + ' seasons): median of ' + e.nina.rain + ' mm of rain for soybean, and rain was below demand in ' + e.nina.short + ' of ' + e.nina.n + '. With El Niño (' + e.nino.n + ' seasons): ' + e.nino.rain + ' mm, and it fell short in ' + e.nino.short + ' of ' + e.nino.n + '.</p>' +
              '<p>With your priorities, the rotation first most often under La Niña was ' + e.nina.top.join(' = ') + ' (' + e.nina.topN + ' of ' + e.nina.n + '); under El Niño, ' + e.nino.top.join(' = ') + ' (' + e.nino.topN + ' of ' + e.nino.n + ').</p>' +
              '<p>' + (e.latest ? 'Latest NOAA value: ONI ' + e.latest + '. ' : '') + 'This describes what happened; it does not forecast the next season. You can pick "La Niña seasons" or "El Niño seasons" as the scenario in section 1.</p>';
          },
          water: function (c) {
            var s = c.soy;
            return '<p>In ' + s.short + ' of ' + s.n + ' seasons, rain during the soybean cycle (' + monthSpan(16, 27) + ') was below what the crop needed.</p>' +
              '<p>The worst was ' + s.worst.y + '–' + String(+s.worst.y + 1).slice(2) + ': ' + s.worst.p + ' mm of rain against ' + s.worst.etc + ' mm of demand. A typical season brings ' + s.rain + ' mm in that period.</p>' +
              '<p>These are regional NASA POWER data (a cell about 50 km wide), not your field.</p>';
          },
          trust: function (c) {
            var a = c.rows[0];
            return '<p>This is an <b>exploratory</b> result. ' + c.name(a.id) + ' ranks first in ' + c.sw.wins[a.id] + ' of ' + c.sw.n + ' seasons with these priorities, not in all of them.</p>' +
              '<p>' + (c.sensChanged ? 'If sowing moves by 10 days, the rotation that ranks first most often changes.' : 'If sowing moves by 10 days, the rotation that ranks first most often stays the same.') + ' Sowing dates and heat and frost thresholds are assumptions not yet validated.</p>' +
              '<p>What could change it most: the real dates in your area and the soil in your field. Use it to talk with a technician, not to replace one.</p>';
          },
          rotate: function (c) {
            return '<p>FAO sums up conservation agriculture in three principles: disturb the soil as little as possible, keep it covered all year, and diversify crops. This tool measures the second and the third.</p>' +
              '<p>In your rotations: ' + c.rows.map(function (r) { var v = c.results[r.id]; return r.id + ' covers the soil ' + v.coverPct + '% of the year with ' + v.cropFamilies + ' crop family(ies)'; }).join('; ') + '.</p>' +
              '<p>The cost also shows in the data: one more crop in winter uses water that soybean may lack later. That is why the tool shows both together. Source for the principles: <a href="https://www.fao.org/conservation-agriculture/en/" target="_blank" rel="noopener">FAO, Conservation Agriculture</a>.</p>';
          },
          terms: function () {
            return '<dl><dt>Water shortfall (deficit)</dt><dd>Millimetres the crop needed that neither rain nor water stored in the soil covered.</dd>' +
              '<dt>Crop demand (ETc)</dt><dd>Water the crop needs given heat, sun and growth stage. Computed with the FAO-56 method.</dd>' +
              '<dt>Heat at flowering</dt><dd>Days with a maximum of 35 °C or more during the crop’s mid stage. Threshold from Salem et al. (2007, Crop Science 47:219), who found soybean reproduction sensitive to temperatures above 35 °C; for wheat and maize it is an assumption.</dd>' +
              '<dt>Frost</dt><dd>Days with a minimum of 2 °C or less at 2 m. It sits between the meteorological frost (0 °C at 1.5 m) and the agrometeorological frost (3 °C at 1.5 m) cited by INTA (Instituto de Clima y Agua, Argentina); still to be checked with a local agronomist.</dd>' +
              '<dt>Soil cover</dt><dd>Share of the year with a living crop on the field.</dd>' +
              '<dt>Diversity</dt><dd>Different crop families in the rotation: legumes (soybean) and grasses (wheat, oat, maize).</dd>' +
              '<dt>Second-crop maize (zafriña)</dt><dd>A second crop sown right after early soybean.</dd>' +
              '<dt>El Niño and La Niña (ONI)</dt><dd>Warming or cooling of the equatorial Pacific measured by NOAA. It shifts the odds of rain in the region.</dd></dl>';
          },
          limits: function () {
            return '<p>It does not compute costs, prices or profit. It does not predict yields. It does not forecast the weather: it compares against what has happened since 2001.</p>' +
              '<p>It does not know your field: it uses a regional NASA POWER cell and a generic soil type. It does not connect to sensors or irrigation equipment.</p>' +
              '<p>It does not recommend what to sow: it shows trade-offs so you can decide better informed.</p>';
          }
        }
      },
      langBtn: 'Español', langAria: 'Cambiar a español', themeAria: 'Switch light or dark theme'
    }
  };
  var STATIC_EN = {
    tagline: 'Which crop rotation holds up best in a tough year? Test it with NASA data.',
    explore: 'Exploratory tool.', exploreText: 'Not a substitute for an agronomist. Results are regional (~50 km cell), not field-level.',
    skip: 'Skip to content',
    lead: 'Compare soybean, wheat, black oat and second-crop maize rotations against 25 seasons of daily NASA POWER data. You set the priorities; the tool shows which option holds up best, why, and how sure the answer is.',
    cta1: 'Compare rotations', cta2: 'See the NASA evidence',
    nav1: 'Set up', nav2: 'Result', nav3: 'Does it hold?', nav4: 'NASA evidence', nav5: 'Confidence', nav6: 'Method',
    setup: 'Your area, your scenario, your priorities', location: 'Area', scenario: 'Climate scenario',
    latL: 'Latitude', lonL: 'Longitude',
    customLoc: 'Another location (live download from NASA POWER)', fetch: 'Download data', priorities: 'What matters most to you? (0 = nothing, 5 = a lot)',
    results: 'Which rotation best balances your priorities', evidence: 'NASA evidence',
    splitNote: 'Water, heat and frost come from NASA POWER data. Soil cover, crop diversity (legume and grass families) and harvests come from each rotation’s calendar. Under each bar you can see how many points come from each source.',
    tableH: 'The numbers behind the score', tableNote: 'In green and bold: the best value in each column. When no rotation had frost, all of them get the maximum for that dimension, which raises every score equally.',
    robustH: 'Does the result hold?',
    evidenceH: 'Rain against soybean water demand, season by season',
    evidenceText: 'When the line runs above the bar, rain did not cover what the crop needed. The scenario season is highlighted.',
    lgRain: 'Rain during the soybean cycle, mm', lgEtc: 'Crop demand (ETc = Kc × ET0), mm',
    mapH: 'Or pick your area on the map',
    mapIntro: 'Tap a marked point to switch area instantly. Tap anywhere else to choose a new point, then download its NASA POWER data (needs a connection and takes up to a minute).',
    mapNote: 'The map shows Paraguay’s Eastern Region (28°S–22°S, 59°W–54°W) over a MODIS greenness image from January 2024. The 8 marked points work offline.',
    limH: 'Is there anything you cannot or will not grow?', limIntro: 'For lack of a buyer, equipment or time. Whatever you tick is left out of the comparison.',
    rainH: 'What if it rained differently?', rainL: 'Rain relative to what was observed in each season',
    rainNote: 'This is a simulation to explore: it multiplies the rain of every season. It is not a forecast. Temperature does not change, because the cache stores heat days already counted.',
    satPick: 'Pick any January since 2002 on each side to compare. Years marked ↓ are downloaded from NASA GIBS and need a connection; 2022 and 2024 are stored.',
    satYearL: 'January',
    nav7: 'Questions', helpH: 'Ask your data',
    helpIntro: 'Pick a question. Answers are built from the numbers for your area, your scenario and your priorities. There is no artificial intelligence: every answer comes from the same calculation shown above and works offline.',
    ensoH: 'El Niño and La Niña in your area’s data',
    ensoIntro: 'We group seasons by NOAA’s Oceanic Niño Index (ONI) during the soybean cycle (Nov–Jan quarter). Rain, shortfall and heat come from NASA POWER; the index is only used for grouping and does not enter the score.',
    cohH: 'Consistency check: the model’s soil water against NASA POWER’s',
    cohIntro: 'We compare the water our balance leaves in the soil during the soybean cycle with the root-zone wetness published by NASA POWER (GWETROOT, MERRA-2 model). They are different quantities: what matters is whether they rise and fall together.',
    lgModel: 'Our balance: available soil water (% of capacity)', lgGwr: 'NASA POWER GWETROOT: root-zone wetness (%)',
    ndviLow: 'less active vegetation', ndviHigh: 'more active vegetation',
    confWhy: 'Why it is exploratory',
    f1t: 'NASA data', f1: 'Daily POWER since 2001: rain, temperature, radiation',
    f2t: 'Indicators', f2: 'Water shortfall, heat at flowering, frost',
    f3t: 'Your priorities', f3: 'Six controls that you move',
    f4t: 'Explored decision', f4: 'Explained ranking, evidence and confidence',
    footNote: 'Exploratory tool: it compares and explores; it does not recommend or predict yields.',
    confidence: 'How sure is this', missing: 'Missing data that would change the result',
    m1: 'Water-holding capacity of your field (texture, depth).', m2: 'Real sowing and harvest dates for your area and variety.', m3: 'Costs and prices: the model does not compute income.',
    how: 'How it works', how1: 'We download daily NASA POWER data (2001–today): rainfall, temperature and top-of-atmosphere radiation.',
    how2: 'We compute reference evapotranspiration (ET0, Hargreaves, FAO-56) and each crop’s demand with FAO-56 Kc coefficients.',
    how3: 'For each rotation we run a soil water balance (water stored by your soil type carries over from one season to the next) and measure: unmet water demand, heat days at flowering, frost at sensitive stages, share of the year with soil cover, crop diversity (botanical families in the rotation) and harvests per year.',
    how4: 'Your priorities weight those dimensions. We show how much each one contributes to the score, no black boxes.',
    sat: 'From space: vegetation greenness in January',
    satText: 'MODIS/Terra NDVI (16-day, 250 m), southeastern Paraguay. January 2022, in the middle of the drought, shows yellow and brown patches in the soybean belt; January 2024, a wet season, is evenly green.',
    dry: 'drought', wet: 'wet season', jan22: 'Jan 2022', jan24: 'Jan 2024',
    satNote: 'Context image (NASA GIBS / Worldview, layer MODIS_Terra_L3_NDVI_16Day, area 28°S–24.5°S, 57°W–54°W). Circles mark the Itapúa and Alto Paraná points. Not used in the score.',
    robust: 'Who ranks first, season by season',
    soil: 'Soil type (water it stores)', calendar: 'Calendar of each rotation (assumed, to be validated with local sources)',
    sensTitle: 'What if sowing dates are off by 10 days?',
    baseNote: 'The baseline (A) has one harvest and bare soil in winter: if your priorities value soil cover or harvests, it cannot rank first. It is the reference the others are compared against. Frost: wheat and maize count frost at mid-season, soybean at emergence (assumption).',
    build: 'Build your own rotation', bcrop1: 'Crop 1', bcrop2: 'Crop 2', bsow: 'Sowing', buildBtn: 'Compare my rotation', buildClear: 'Remove',
    print: 'Print or save as PDF', share: 'Copy link to this result',
    sources: 'Sources', export: 'Export data cache', credit: 'Data: NASA Langley Research Center POWER Project.'
  };
  // ---------- Idiomas adicionales (guaraní, portugués, japonés, hindi) ----------
  // Los textos del código están en español e inglés. Los otros cuatro idiomas traducen el INGLÉS: cada archivo
  // lang/<código>.js aporta un diccionario s (frase en inglés -> traducción) y f (funciones con datos).
  // Lo que no tenga traducción se muestra en inglés.
  var EXTRA_LANGS = ['gn', 'pt', 'ja', 'hi'];
  var uiLang = 'es', xl = null, T_EN0 = null, ORIG = null;
  function tr(s) { return xl && xl.s && xl.s[s] !== undefined ? xl.s[s] : s; }
  function tp(en, a) { return tr(en).replace(/\{(\d)\}/g, function (m, i) { return a[+i]; }); }
  function xmap(o, path) {
    if (typeof o === 'string') return tr(o);
    if (typeof o === 'function') return (xl.f && xl.f[path]) || o;
    if (Array.isArray(o)) return o.map(function (x, i) { return xmap(x, path + '[' + i + ']'); });
    if (o && typeof o === 'object') { var r = {}; Object.keys(o).forEach(function (k) { r[k] = (k === 'bot' && path === '') ? o[k] : xmap(o[k], path ? path + '.' + k : k); }); return r; }
    return o;
  }
  var STATIC_ES = {};
  document.querySelectorAll('[data-i18n]').forEach(function (el) { STATIC_ES[el.dataset.i18n] = el.textContent; });

  var ROT_NAMES_EN = { A: 'Baseline: Soybean + winter fallow', B: 'Soybean + Wheat', C: 'Soybean + Black oat (cover crop)', D: 'Early soybean + Second-crop maize' };
  // Rotación propia del usuario (id 'E'), opcional.
  var custom = null;
  var DEFAULT_LEN = { soja: 12, trigo: 14, avena: 12, maiz: 11 }; // mismas duraciones (dekadas) que las rotaciones fijas: SUPUESTO
  Object.keys(E.CROPS).forEach(function (k) { if (E.CROPS[k].len) DEFAULT_LEN[k] = E.CROPS[k].len; }); // cultivos adicionales: FAO-56 Tabla 11
  function allRots() { return custom ? E.ROTATIONS.concat([custom]) : E.ROTATIONS; }
  // Limitaciones del productor: cultivos que no puede o no quiere sembrar. 'early' = soja sembrada antes de octubre.
  var excluded = {};
  var LIMITS = ['trigo', 'maiz', 'avena', 'early'];
  function rotBlocked(r) { return r.crops.some(function (c) { return excluded[c.crop] || (excluded.early && c.crop === 'soja' && c.start < 15); }); }
  // Rotaciones que entran en la comparación. La base nunca se quita: es la referencia.
  function rots() { return allRots().filter(function (r) { return r.baseline || !rotBlocked(r); }); }
  // Lluvia hipotética en % respecto de lo observado (0 = datos reales).
  var rainAdj = 0;
  function rotName(r) { if (r.id === 'E') return lang === 'en' ? tr('Your rotation') : 'Tu rotación'; return lang === 'en' ? ROT_NAMES_EN[r.id] : r.name; }

  var DEFAULT_W = { waterDeficit: 3, heatDays: 2, frostDays: 2, coverPct: 3, grainHarvests: 2, cropFamilies: 2 };
  var weights = Object.assign({}, DEFAULT_W);
  var datasets = {}; // id -> {label, lat, lon, agg, source, fetched}

  Object.keys(CACHE.locations).forEach(function (k) {
    var L = CACHE.locations[k];
    datasets[k] = { label: L.label, lat: L.lat, lon: L.lon, agg: E.fromCompact(L.dekads), source: 'cache', fetched: CACHE.fetched_utc, meta: L, sm: 5, hemi: 'S', local: true };
  });

  var $ = function (id) { return document.getElementById(id); };

  // ---- Alcance mundial ----
  // Cada conjunto de datos lleva su mes de inicio del año agrícola (sm: 5 en el sur, 11 en el norte) y si está en la
  // zona donde se calibraron las rotaciones fijas (local: Paraguay). Fuera de ella, las rotaciones son una plantilla.
  function inParaguay(lat, lon) { return lat >= -28 && lat <= -19 && lon >= -63 && lon <= -54; }
  function curDs() { var s = document.getElementById('loc'); return (s && datasets[s.value]) || datasets.itapua || {}; }
  function curSm() { return curDs().sm || 5; }
  function monthIdx(k, sm) { return ((sm || curSm()) - 1 + Math.floor(k / 3)) % 12; }
  function dekLabel(k) { return MONTHS[lang][monthIdx(k)] + ' ' + ['1–10', '11–20', lang === 'en' ? '21–end' : '21–fin'][k % 3]; }
  // Ventana de un tramo de dekadas en meses, p. ej. "oct–feb" (sur) o "abr–ago" (norte).
  function monthSpan(a, b) { return MONTHS[lang][monthIdx(a)] + '–' + MONTHS[lang][monthIdx(b)]; }

  function fullYears(agg) { return Object.keys(agg).filter(function (y) { return agg[y].every(function (d) { return d.complete; }); }).sort(); }

  // Lista «Zona» en tres grupos: parcelas propias (dibujadas en el mapa), puntos elegidos y zonas guardadas de Paraguay.
  // Valores especiales: '__draw' abre el mapa para dibujar; 'p:<id>' carga una parcela guardada que aún no se descargó.
  function fillLocations(sel) {
    var es = lang === 'es', mine = [], pts = [], py = [];
    function opt(k, d) { return '<option value="' + k + '">' + esc(placeLabel(d)) + (d.poly && d.ha ? ' · ' + num(d.ha, d.ha >= 10 ? 0 : 1) + ' ha' : ' (' + d.lat + ', ' + d.lon + ')') + '</option>'; }
    Object.keys(datasets).forEach(function (k) {
      var d = datasets[k];
      (d.poly ? mine : d.source === 'live' ? pts : py).push(opt(k, d));
    });
    var loaded = {}; Object.keys(datasets).forEach(function (k) { if (datasets[k].poly) loaded[datasets[k].lat + ',' + datasets[k].lon] = true; });
    loadParcels().forEach(function (p) {
      if (!validPoly(p.poly) || datasets[p.loc] && datasets[p.loc].poly) return;
      mine.push('<option value="p:' + esc(p.id) + '">' + esc(p.name) + (p.ha ? ' · ' + num(p.ha, p.ha >= 10 ? 0 : 1) + ' ha' : '') + (es ? ' (guardada)' : tr(' (saved)')) + '</option>');
    });
    mine.push('<option value="__draw">' + (es ? '＋ Dibujar mi parcela en el mapa…' : tr('+ Draw my field on the map…')) + '</option>');
    $('loc').innerHTML = '<optgroup label="' + (es ? 'Mi parcela' : tr('My field')) + '">' + mine.join('') + '</optgroup>' +
      (pts.length ? '<optgroup label="' + (es ? 'Puntos elegidos en el mapa' : tr('Points picked on the map')) + '">' + pts.join('') + '</optgroup>' : '') +
      '<optgroup label="' + (es ? 'Zonas de Paraguay (validadas)' : tr('Paraguay areas (validated)')) + '">' + py.join('') + '</optgroup>';
    if (sel) $('loc').value = sel;
    locPrev = $('loc').value;
  }
  var locPrev = null;
  function fillScenarios() {
    var t = T[lang], ds = datasets[$('loc').value], prev = $('scenario').value || '2021';
    var ys = fullYears(ds.agg);
    var html = '<option value="median">' + t.scen.median + '</option><option value="p80">' + t.scen.p80 + '</option>';
    ['nina', 'nino'].forEach(function (p) {
      var n = ys.filter(function (y) { return phaseOf(y) === p; }).length;
      if (n >= 3) html += '<option value="' + p + '">' + t.scenEnso[p](n) + '</option>';
    });
    ys.slice().reverse().forEach(function (y) { html += '<option value="' + y + '">' + t.scen.year + y + '–' + String(+y + 1).slice(2) + (y === '2021' && ds.source === 'cache' ? (lang === 'es' ? ' (sequía)' : ' (' + tr('drought') + ')') : '') + '</option>'; });
    $('scenario').innerHTML = html;
    $('scenario').value = Array.prototype.some.call($('scenario').options, function (o) { return o.value === prev; }) ? prev : 'median';
  }
  var SOIL_EN = { none: 'Pure climate baseline (ignore soil water)', arenoso: 'Sandy', franco: 'Loam', arcilloso: 'Clay' };
  var CROP_EN = { soja: 'Soybean', trigo: 'Wheat', avena: 'Black oat', maiz: 'Second-crop maize', girasol: 'Sunflower', canola: 'Canola', sorgo: 'Grain sorghum', sesamo: 'Sesame', poroto: 'Dry beans' };
  function fillSoils() {
    var prev = $('soil').value || 'arcilloso';
    $('soil').innerHTML = Object.keys(E.SOILS).map(function (k) {
      var mm = E.soilCapacityMm(k);
      return '<option value="' + k + '">' + (lang === 'en' ? SOIL_EN[k] : E.SOILS[k].name) + (mm ? ' (~' + mm + ' mm)' : '') + '</option>';
    }).join('');
    $('soil').value = prev;
  }
  function renderCalendar() {
    var months = []; for (var mi = 0; mi < 12; mi++) months.push(lang === 'en' ? tr(MONTHS[lang][monthIdx(mi * 3)]) : MONTHS[lang][monthIdx(mi * 3)]);
    var head = '<tr><th></th>' + months.map(function (m) { return '<th colspan="3">' + m + '</th>'; }).join('') + '</tr>';
    var body = rots().map(function (r) {
      var map = E.rotationMap(r), cells = '';
      for (var k = 0; k < 36; k++) {
        var m = map[k];
        cells += '<td class="c' + (m ? ' cal-' + m.crop : '') + '" title="' + dekLabel(k) + (m ? ' · ' + (lang === 'en' ? CROP_EN[m.crop] : E.CROPS[m.crop].name) + ' · ' + m.stage + ' · Kc ' + m.kc : '') + '"></td>';
      }
      return '<tr><td>' + r.id + '</td>' + cells + '</tr>';
    }).join('');
    $('calendar').innerHTML = '<thead>' + head + '</thead><tbody>' + body + '</tbody>';
    var leg = document.getElementById('calLegend');
    if (!leg) { leg = document.createElement('div'); leg.id = 'calLegend'; leg.className = 'cal-legend'; $('calendar').parentNode.after(leg); }
    var present = [];
    rots().forEach(function (r) { r.crops.forEach(function (c) { if (present.indexOf(c.crop) < 0) present.push(c.crop); }); });
    leg.innerHTML = present.map(function (c) { return '<span><i class="cal-' + c + '"></i>' + (lang === 'en' ? CROP_EN[c] : E.CROPS[c].name) + '</span>'; }).join('') + '<span>' + (lang === 'en' ? 'blank = fallow' : 'vacío = barbecho') + '</span>';
  }
  // Atajos de prioridades: solo cambian los pesos, el cálculo es el mismo.
  // Lente NASA: solo las tres dimensiones que salen de los datos NASA POWER (agua, calor, heladas).
  var NASA_W = { waterDeficit: 3, heatDays: 2, frostDays: 2, coverPct: 0, grainHarvests: 0, cropFamilies: 0 };
  var savedW = null;
  function nasaOnly() { return E.DIMENSIONS.every(function (d) { return weights[d.key] === NASA_W[d.key]; }); }
  var PRESETS = {
    balanced: DEFAULT_W,
    water: { waterDeficit: 5, heatDays: 3, frostDays: 1, coverPct: 1, grainHarvests: 1, cropFamilies: 1 },
    soil: { waterDeficit: 2, heatDays: 1, frostDays: 1, coverPct: 5, grainHarvests: 1, cropFamilies: 4 },
    harvest: { waterDeficit: 1, heatDays: 1, frostDays: 1, coverPct: 1, grainHarvests: 5, cropFamilies: 1 }
  };
  function renderPresets() {
    var t = T[lang];
    $('presets').setAttribute('aria-label', t.presetsLbl);
    $('presets').innerHTML = Object.keys(PRESETS).map(function (k) {
      var on = E.DIMENSIONS.every(function (d) { return weights[d.key] === PRESETS[k][d.key]; });
      return '<button type="button" data-p="' + k + '" aria-pressed="' + on + '">' + t.presets[k] + '</button>';
    }).join('');
    $('presets').querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { weights = Object.assign({}, PRESETS[b.dataset.p]); buildWeights(); render(); });
    });
  }
  function buildWeights() {
    var t = T[lang];
    $('weights').innerHTML = E.DIMENSIONS.map(function (d) {
      return '<label><span class="wl"><i style="background:' + DIM_COLORS[d.key] + '"></i>' + t.dims[d.key] +
        '<output id="o-' + d.key + '">' + weights[d.key] + '</output></span><input type="range" min="0" max="5" step="1" value="' + weights[d.key] + '" data-k="' + d.key + '" aria-label="' + t.dims[d.key] + '"></label>';
    }).join('');
    $('weights').querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('input', function () { weights[inp.dataset.k] = +inp.value; $('o-' + inp.dataset.k).textContent = inp.value; renderPresets(); render(); });
    });
    renderPresets();
    var sw = function (d) { return '<span><i style="background:' + DIM_COLORS[d.key] + '"></i>' + t.dims[d.key] + '</span>'; };
    var isSoil = function (d) { return d.key === 'coverPct' || d.key === 'cropFamilies'; };
    $('legend').innerHTML = '<span class="grp">' + t.grpClimate + '</span>' + E.DIMENSIONS.filter(isClimate).map(sw).join('') +
      '<span class="grp">' + t.grpSoil + '</span>' + E.DIMENSIONS.filter(isSoil).map(sw).join('') +
      '<span class="grp">' + t.grpProd + '</span>' + E.DIMENSIONS.filter(function (d) { return !isClimate(d) && !isSoil(d); }).map(sw).join('');
  }
  // Dimensiones que dependen de los datos NASA (clima) frente a las que salen del calendario de la rotación.
  function isClimate(d) { return d.key === 'waterDeficit' || d.key === 'heatDays' || d.key === 'frostDays'; }

  function render() {
    var t = T[lang], ds = datasets[$('loc').value];
    var sc = $('scenario').value; var scen = /^\d{4}$/.test(sc) ? +sc : sc;
    var results = {}, byYearAll = {};
    // AGG: serie usada en el cálculo. Con lluvia hipotética es una copia escalada; los datos observados no se tocan.
    var AGG = rainAdj ? E.scaleRain(ds.agg, 1 + rainAdj / 100) : ds.agg;
    rots().forEach(function (r) {
      byYearAll[r.id] = E.evaluateAllYears(r, AGG, $('soil').value);
      results[r.id] = scenVals(byYearAll[r.id], scen);
    });
    var rows = E.compare(results, weights);
    var rot = function (id) { return rots().filter(function (r) { return r.id === id; })[0]; };
    var why = rows.length > 1 ? E.explain(rows[0], rows[1]).map(function (lbl) {
      var d = E.DIMENSIONS.filter(function (x) { return x.label === lbl; })[0]; return t.dims[d.key];
    }) : [];
    var sw = E.seasonWins(AGG, $('soil').value, weights, rots());
    var top = rows[0], diff = rows.length > 1 ? E.round(top.score - rows[1].score, 1) : 0;
    $('verdict').innerHTML = '<div><span class="v-eyebrow">' + t.vEyebrow + '</span>' +
      '<div class="v-name"><span class="chip win-' + top.id + '">' + top.id + '</span>' + rotName(rot(top.id)) + '</div>' +
      '<p class="v-why">' + (rows.length > 1 ? (diff > 0 ? t.vWhy(rows[1].id, num(diff), why) : t.vTie) : '') + '</p></div>' +
      '<div class="v-side"><div class="v-score">' + num(top.score) + '<small> /100</small></div>' +
      '<div class="v-meta">' + t.vRobust(sw.wins[top.id], sw.n) + '</div></div>';

    $('ranking').innerHTML = rows.map(function (r, i) {
      var R = rot(r.id), clim = 0, cal = 0;
      var segs = E.DIMENSIONS.map(function (d) {
        var c = r.contributions[d.key];
        if (isClimate(d)) clim += c.points; else cal += c.points;
        return '<span title="' + t.dims[d.key] + ': ' + c.points + ' pts (' + c.value + ' ' + t.units[d.key] + ')" style="width:' + c.points + '%;background:' + DIM_COLORS[d.key] + '"></span>';
      }).join('');
      var aria = E.DIMENSIONS.map(function (d) { return t.dims[d.key] + ' ' + r.contributions[d.key].points; }).join(', ');
      return '<div class="row' + (i === 0 ? ' first' : '') + '"><div class="rank">' + (i + 1) + '</div>' +
        '<div class="name"><span class="chip win-' + R.id + '">' + R.id + '</span><span>' + rotName(R) + (R.baseline ? '<small>' + (lang === 'es' ? 'línea base' : tr('baseline')) + '</small>' : '') + '</span></div>' +
        '<div class="bar" role="img" aria-label="' + aria + '">' + segs + '</div><div class="score">' + num(r.score) + '</div>' +
        '<div class="split">' + num(E.round(clim, 1)) + ' ' + t.climate + ' · ' + num(E.round(cal, 1)) + ' ' + t.calendarPts + '</div></div>';
    }).join('');


    // Lente NASA: qué dice el clima solo y qué cambia el criterio del productor (hallazgo N-1).
    var swN = E.seasonWins(AGG, $('soil').value, NASA_W, rots());
    var nOrder = rots().map(function (r) { return r.id; }).sort(function (p, q) { return swN.wins[q] - swN.wins[p]; });
    var nTop = nOrder[0], on = nasaOnly();
    var baseId = (rots().filter(function (r) { return r.baseline; })[0] || {}).id;
    // Con la lente activa, la comparación es contra las prioridades que el productor tenía antes.
    var swU = on ? E.seasonWins(AGG, $('soil').value, savedW || DEFAULT_W, rots()) : sw;
    var uTop = on ? rots().map(function (r) { return r.id; }).sort(function (p, q) { return swU.wins[q] - swU.wins[p]; })[0] : top.id;
    var lensTxt = lang === 'es'
      ? (on ? '<b>Estás viendo solo los datos NASA</b> (agua, calor y heladas; suelo cubierto, cosechas y diversidad en 0). '
            : '<b>Lente NASA.</b> Si miras solo lo que dicen los datos NASA (agua, calor y heladas), ')
        + '<b>' + nTop + '</b> queda primera en ' + swN.wins[nTop] + ' de ' + swN.n + ' campañas' + (baseId && nTop !== baseId ? ' y la base (' + baseId + ') en ' + swN.wins[baseId] : '') + '. '
        + (on ? 'Con tus prioridades de antes, ' + uTop + ' quedaba primera en ' + swU.wins[uTop] + '. ' : 'Con tus prioridades, ' + uTop + ' queda primera en ' + swU.wins[uTop] + '. ')
        + 'Los datos NASA muestran cuánta agua cuesta cada cultivo extra; cuánto vale cubrir el suelo y cosechar dos veces lo decides tú.'
      : (on ? tp('<b>You are seeing NASA data only</b> (water, heat and frost; soil cover, harvests and diversity set to 0). ', [])
            : tp('<b>NASA lens.</b> Looking only at what NASA data say (water, heat and frost), ', []))
        + tp('<b>{0}</b> ranks first in {1} of {2} seasons', [nTop, swN.wins[nTop], swN.n]) + (baseId && nTop !== baseId ? tp(' and the baseline ({0}) in {1}', [baseId, swN.wins[baseId]]) : '') + '. '
        + (on ? tp('With your previous priorities, {0} ranked first in {1}. ', [uTop, swU.wins[uTop]]) : tp('With your priorities, {0} ranks first in {1}. ', [uTop, swU.wins[uTop]]))
        + tr('NASA data show what each extra crop costs in water; how much soil cover and a second harvest are worth is your call.');
    var lensBtn = on ? (lang === 'es' ? 'Volver a mis prioridades' : tr('Back to my priorities')) : (lang === 'es' ? 'Ver solo los datos NASA' : tr('Show NASA data only'));
    $('nasaLens').innerHTML = '<p>' + lensTxt + '</p><button type="button" class="ghost" id="nasaLensBtn" aria-pressed="' + on + '">' + lensBtn + '</button>';
    $('nasaLensBtn').addEventListener('click', function () {
      if (nasaOnly()) { weights = Object.assign({}, savedW || DEFAULT_W); savedW = null; }
      else { savedW = Object.assign({}, weights); weights = Object.assign({}, NASA_W); }
      buildWeights(); render();
    });

    var ids = rots().map(function (r) { return r.id; });
    var head = '<tr><th>' + t.rotation + '</th>' + E.DIMENSIONS.map(function (d) { return '<th>' + t.dims[d.key] + (t.units[d.key] ? ' (' + t.units[d.key] + ')' : '') + '</th>'; }).join('') + '<th>' + t.score + '</th></tr>';
    var body = ids.map(function (id) {
      var v = results[id], sc2 = rows.filter(function (x) { return x.id === id; })[0].score;
      return '<tr><td>' + id + ' · ' + rotName(rot(id)) + '</td>' + E.DIMENSIONS.map(function (d) {
        var vals = ids.map(function (j) { return results[j][d.key]; });
        var best = d.better === 'lower' ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
        return '<td' + (v[d.key] === best ? ' class="best"' : '') + '>' + v[d.key] + '</td>';
      }).join('') + '<td>' + sc2 + '</td></tr>';
    }).join('');
    $('table').innerHTML = '<thead>' + head + '</thead><tbody>' + body + '</tbody>';

    $('wins').innerHTML = sw.seasons.map(function (s) {
      var lbl = s.year + '–' + String(+s.year + 1).slice(2) + ': ' + rots().map(function (r) { return r.id + ' ' + s.scores[r.id]; }).join(' · ');
      var ph = phaseOf(s.year);
      if (ph && ph !== 'neutral') lbl += ' · ' + t.phase[ph];
      return '<div role="listitem" class="win-' + s.winner + (String(scen) === s.year || (isPhase(scen) && ph === scen) ? ' sel' : '') + '" title="' + lbl + '" aria-label="' + lbl + '"><b>' + s.winner + '</b>' + String(s.year).slice(2) + '/' + String(+s.year + 1).slice(2) + '<u>' + (ph === 'nino' ? '▲' : ph === 'nina' ? '▼' : '') + '</u></div>';
    }).join('');
    $('ensoKey').textContent = ONI ? t.ensoKey : '';
    $('winsLegend').innerHTML = rots().map(function (r) {
      return '<span><span class="chip win-' + r.id + '">' + r.id + '</span>' + rotName(r) + ' · ' + t.firstIn + ' ' + sw.wins[r.id] + '</span>';
    }).join('');
    var order = rots().map(function (r) { return r.id; }).sort(function (p, q) { return sw.wins[q] - sw.wins[p]; });
    $('winsText').textContent = (lang === 'es' ? 'Con tus prioridades y este suelo, en ' + sw.n + ' campañas: ' : tp('With your priorities and this soil, over {0} seasons: ', [sw.n])) +
      order.filter(function (id) { return sw.wins[id] > 0; }).map(function (id) { return id + (lang === 'es' ? ' queda primera en ' + sw.wins[id] : tp(' ranks first in {0}', [sw.wins[id]])); }).join(', ') + '. ' +
      rots().filter(function (r) { return !r.baseline; }).map(function (r) { return r.id + (lang === 'es' ? ' supera a la base en ' + sw.beatsBaseline[r.id] : tp(' beats the baseline in {0}', [sw.beatsBaseline[r.id]])); }).join(', ') + '.';
    var sens = E.sowingSensitivity(AGG, $('soil').value, weights, rots());
    var sLbl = lang === 'es' ? { '-10': 'Siembra 10 días antes', '0': 'Calendario supuesto', '10': 'Siembra 10 días después', h: 'Campañas en que queda primera', lead: 'Lidera' }
      : { '-10': tr('Sowing 10 days earlier'), '0': tr('Assumed calendar'), '10': tr('Sowing 10 days later'), h: tr('Seasons ranked first'), lead: tr('Leader') };
    $('sens').innerHTML = '<thead><tr><th>' + sLbl.h + '</th>' + rots().map(function (r) { return '<th>' + r.id + '</th>'; }).join('') + '<th>' + sLbl.lead + '</th></tr></thead><tbody>' +
      sens.map(function (x) {
        return '<tr><td>' + sLbl[String(x.days)] + '</td>' + rots().map(function (r) { return '<td' + (x.top.indexOf(r.id) >= 0 ? ' class="best"' : '') + '>' + x.wins[r.id] + '</td>'; }).join('') + '<td>' + x.top.join(' = ') + '</td></tr>';
      }).join('') + '</tbody>';
    var baseTop = sens.filter(function (x) { return x.shift === 0; })[0].top.join('=');
    var changed = sens.filter(function (x) { return x.top.join('=') !== baseTop; });
    $('sensText').textContent = changed.length
      ? (lang === 'es' ? 'Atención: el liderazgo cambia si la siembra se mueve 10 días (' + changed.map(function (x) { return (x.days > 0 ? '+' : '') + x.days + ' días: ' + x.top.join(' = '); }).join('; ') + '). Por eso las fechas reales de tu zona importan.'
        : tp('Note: the leader changes if sowing moves by 10 days ({0}). This is why real local sowing dates matter.', [changed.map(function (x) { return (x.days > 0 ? '+' : '') + x.days + ' ' + tr('days') + ': ' + x.top.join(' = '); }).join('; ')]))
      : (lang === 'es' ? 'El liderazgo se mantiene aunque la siembra se mueva 10 días antes o después.' : tr('The leader stays the same when sowing moves 10 days earlier or later.'));
    // Dónde pesa más el criterio del productor: avisos armados con el propio resultado.
    var flags = [];
    if (rows.length > 1 && diff < 3) flags.push(t.jClose(diff, rows[1].id));
    if (sw.wins[top.id] * 2 < sw.n) flags.push(t.jFew(sw.wins[top.id], sw.n));
    if (changed.length) flags.push(t.jSow);
    if (rots().some(function (r) { return r.crops.some(function (c) { return c.crop === 'maiz'; }); })) flags.push(t.jMaize);
    $('judgment').innerHTML = '<b>' + t.jTitle + '</b><ul>' + flags.concat([t.jAlways]).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
    var blocked = allRots().filter(function (r) { return !r.baseline && rotBlocked(r); });
    $('exclNote').textContent = blocked.length ? t.exclNote(blocked.map(function (r) { return r.id + ' (' + rotName(r) + ')'; }).join(', ')) : '';
    document.querySelectorAll('.simNote').forEach(function (el) { el.style.display = rainAdj ? '' : 'none'; el.textContent = rainAdj ? t.simNote(rainAdj) : ''; });
    $('rainOut').textContent = (rainAdj > 0 ? '+' : '') + rainAdj + ' %';
    var realA = rainAdj ? E.evaluateAllYears(E.ROTATIONS[0], ds.agg, $('soil').value) : byYearAll.A;
    renderHero(ds, realA);
    renderSat(realA);
    renderMap();
    renderChart(ds, byYearAll.A, scen);
    renderCoherence(ds, byYearAll.A, scen);
    var enso = renderEnso(byYearAll.A, sw);
    helpCtx = { rows: rows, results: results, why: why, diff: diff, sw: sw, enso: enso, soy: soyStats(byYearAll.A, sw.seasons.map(function (s) { return s.year; })),
      sensChanged: changed.length > 0, name: function (id) { return rotName(rot(id)); } };
    renderHelp();
    renderAgenda(ds);
    renderParcelInfo();
    renderValidation();
    renderField();
    var conf = E.confidence({ nYears: fullYears(ds.agg).length, source: ds.source, soil: $('soil').value, lang: lang, template: !ds.local, tropical: !!ds.tropical });
    // Aviso de plantilla fuera de Paraguay (se muestra en Rotation Lab, junto al resultado).
    document.querySelectorAll('.tplNote').forEach(function (el) { el.hidden = !!ds.local; el.innerHTML = ds.local ? '' : t.tplNote({ hemi: ds.hemi, tropical: ds.tropical }); });
    renderCalendar();
    $('confLabel').textContent = lang === 'en' ? tr(conf.label) : conf.label;
    $('confReasons').innerHTML = conf.reasons.map(function (x) { return '<li>' + (lang === 'en' ? tr(x) : x) + '</li>'; }).join('') +
      '<li>' + t.cell + ' ' + ds.lat + ', ' + ds.lon + ' · ' + t.fetched + ' ' + String(ds.fetched).slice(0, 10) + ' · ' + fullYears(ds.agg).length + ' ' + t.yearsLbl + '</li>';
    try { document.dispatchEvent(new CustomEvent('rl:render')); } catch (e) { /* navegador antiguo */ }
    $('sourcesLine').textContent = 'NASA POWER Daily API v2 (MERRA-2, GEOS-IT, CERES SYN1deg/FLASHFlux): PRECTOTCORR, T2M, T2M_MAX, T2M_MIN, TOA_SW_DWN · Allen et al. (1998) FAO-56 · Hargreaves & Samani (1985) · NDVI: MODIS/Terra MOD13, NASA GIBS.';
  }

  // Cifras de la portada: siempre con los datos observados de la zona (nunca con la lluvia hipotética) y nunca escritas a mano.
  function renderHero(ds, realA) {
    var t = T[lang], n = fullYears(ds.agg).length, y = realA['2021'], d21 = null;
    if (y && y.complete && ds.source === 'cache') {
      var det = y.detail.filter(function (d) { return d.crop === 'soja'; });
      d21 = { p: det.reduce(function (s, d) { return s + d.p; }, 0), etc: det.reduce(function (s, d) { return s + d.etc; }, 0) };
    }
    var v = valNumbers(), I = VAL && VAL.impact;
    $('heroStats').innerHTML = '<div class="stat"><b>' + n + '</b><span>' + t.stat1 + '</span></div>' +
      (d21 ? '<div class="stat"><b>' + Math.round(d21.p) + ' mm</b><span>' + t.stat2(Math.round(d21.etc)) + '</span></div>' : '') +
      (v && v.drop ? '<div class="stat"><b>' + num(v.drop.pct) + ' %</b><span>' + t.statDrop(num(v.drop.from / 1e6, 1), num(v.drop.to / 1e6, 1)) + '</span></div>' : '') +
      (I ? '<div class="stat"><b>' + num(I.areaOriental.value / 1e6, 1) + ' M ha</b><span><a href="' + I.areaOriental.url + '" target="_blank" rel="noopener">' + t.statArea + '</a></span></div>' : '') +
      (v ? '<div class="stat"><b>r = ' + num(v.rDeficit) + '</b><span>' + t.statVal + '</span></div>' : '');
  }
  // Imágenes NDVI de enero: dos años a elegir. 2022 y 2024 están en la caché; el resto se pide a NASA GIBS (sin clave).
  var SAT_LOCAL = { 2022: 'data/img/modis_ndvi_2022-01-01.jpg', 2024: 'data/img/modis_ndvi_2024-01-01.jpg' };
  var satYears = [2022, 2024];
  function satUrl(y) {
    return SAT_LOCAL[y] || 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=MODIS_Terra_L3_NDVI_16Day&CRS=EPSG:4326&BBOX=-28,-57,-24.5,-54&WIDTH=600&HEIGHT=700&FORMAT=image/jpeg&TIME=' + y + '-01-01';
  }
  function renderSat(realA) {
    var t = T[lang];
    var years = Object.keys(realA).filter(function (y) { return realA[y].complete; }).map(function (y) { return +y + 1; });
    [0, 1].forEach(function (i) {
      if (years.indexOf(satYears[i]) < 0) satYears[i] = [2022, 2024][i];
      var Y = satYears[i], camp = String(Y - 1), sel = $('satYear' + i), img = $('sat' + i);
      sel.innerHTML = years.slice().reverse().map(function (y) { return '<option value="' + y + '"' + (y === Y ? ' selected' : '') + '>' + t.janOf(y) + (SAT_LOCAL[y] ? '' : ' ↓') + '</option>'; }).join('');
      if (img.dataset.y !== String(Y)) { img.dataset.y = String(Y); $('satMsg' + i).textContent = SAT_LOCAL[Y] ? '' : t.satLoading; img.src = satUrl(Y); }
      img.alt = t.satAlt(Y);
      var ph = phaseOf(camp), by = realA[camp], cap = '';
      if (by && by.complete) {
        var det = by.detail.filter(function (d) { return d.crop === 'soja'; });
        cap = t.satCap({ y: camp + '–' + String(Y).slice(2), p: Math.round(det.reduce(function (s, d) { return s + d.p; }, 0)), etc: Math.round(det.reduce(function (s, d) { return s + d.etc; }, 0)), ph: ph ? t.phase[ph] : '' });
      }
      $('satTag' + i).textContent = t.janOf(Y) + (ph && ph !== 'neutral' ? ' · ' + t.phase[ph] : '');
      $('satCap' + i).textContent = cap;
    });
  }

  // Mapa para elegir la zona: imagen NDVI del sudeste de Paraguay con los puntos disponibles y la celda de POWER.
  var MAPB = { n: -22, s: -28, w: -59, e: -54 };
  var pending = null; // punto tocado o escrito que todavía no se descargó
  function mapPos(lat, lon) { return { x: (lon - MAPB.w) / (MAPB.e - MAPB.w) * 100, y: (MAPB.n - lat) / (MAPB.n - MAPB.s) * 100 }; }
  function inMap(lat, lon) { return lat <= MAPB.n && lat >= MAPB.s && lon >= MAPB.w && lon <= MAPB.e; }
  function renderMap() {
    var t = T[lang], cur = $('loc').value, focus = pending || datasets[cur];
    var c = E.powerCell(focus.lat, focus.lon), a = mapPos(c.north, c.west), b = mapPos(c.south, c.east);
    var html = '<div class="cell" style="left:' + a.x + '%;top:' + a.y + '%;width:' + (b.x - a.x) + '%;height:' + (b.y - a.y) + '%"></div>';
    Object.keys(datasets).forEach(function (k) {
      var d = datasets[k]; if (!inMap(d.lat, d.lon)) return;
      var p = mapPos(d.lat, d.lon), name = d.label.split(' (')[0];
      html += '<button type="button" class="mp" data-k="' + k + '" data-x="' + p.x + '" aria-pressed="' + (!pending && k === cur) + '" aria-label="' + name + ' (' + d.lat + ', ' + d.lon + ')" style="left:' + p.x + '%;top:' + p.y + '%"><em>' + name + '</em></button>';
    });
    if (pending && inMap(pending.lat, pending.lon)) { var q = mapPos(pending.lat, pending.lon); html += '<i class="pending" style="left:' + q.x + '%;top:' + q.y + '%"></i>'; }
    setTimeout(zmFlip, 0);
    $('mapLayer').innerHTML = html;
    $('zoneMap').querySelector('img').alt = t.mapAlt;
    $('mapCell').textContent = t.mapCell(c, !!pending);
  }
  // Acercar y alejar el mapa: escala y desplazamiento del contenido; los puntos mantienen su tamaño.
  var ZM = { z: 1, tx: 0, ty: 0, min: 1, max: 4 };
  function zmApply() {
    var box = $('zoneMap'), W = box.clientWidth, H = box.clientHeight;
    ZM.tx = Math.min(0, Math.max(W - W * ZM.z, ZM.tx));
    ZM.ty = Math.min(0, Math.max(H - H * ZM.z, ZM.ty));
    $('zmInner').style.transform = 'translate(' + ZM.tx + 'px,' + ZM.ty + 'px) scale(' + ZM.z + ')';
    box.style.setProperty('--z', ZM.z);
    box.classList.toggle('zoomed', ZM.z > 1);
    $('zmIn').disabled = ZM.z >= ZM.max; $('zmOut').disabled = ZM.z <= ZM.min; $('zmReset').disabled = ZM.z === 1;
    zmFlip();
  }
  function zmZoom(f, cx, cy) {
    var box = $('zoneMap'), z2 = Math.max(ZM.min, Math.min(ZM.max, ZM.z * f));
    if (cx == null) { cx = box.clientWidth / 2; cy = box.clientHeight / 2; }
    ZM.tx = cx - (cx - ZM.tx) * z2 / ZM.z; ZM.ty = cy - (cy - ZM.ty) * z2 / ZM.z; ZM.z = z2;
    zmApply();
  }
  // Una etiqueta que no entraría a la derecha del punto pasa a la izquierda, para que no se corte.
  function zmFlip() {
    var box = $('zoneMap'), W = box.clientWidth;
    if (!W) return;
    box.querySelectorAll('button.mp').forEach(function (b) {
      var sx = ZM.tx + (+b.dataset.x / 100) * W * ZM.z, em = b.querySelector('em');
      var need = (em ? em.offsetWidth : 90) + 28;
      b.classList.toggle('flip', sx + need > W && sx - need > 0);
    });
  }
  function setPending(lat, lon) {
    pending = { lat: lat, lon: lon };
    $('fetchStatus').textContent = T[lang].mapPicked;
    renderMap();
  }

  function renderChart(ds, byYear, scen) {
    var t = T[lang];
    var ys = fullYears(ds.agg);
    var data = ys.map(function (y) {
      var det = byYear[y].detail.filter(function (d) { return d.crop === 'soja'; });
      return { y: y, p: det.reduce(function (s, d) { return s + d.p; }, 0), etc: det.reduce(function (s, d) { return s + d.etc; }, 0), def: byYear[y].waterDeficit, heat: byYear[y].heatDays };
    });
    var W = 760, H = 240, pl = 40, pb = 28, pt = 10, pr = 10;
    var max = Math.max.apply(null, data.map(function (d) { return Math.max(d.p, d.etc); })) * 1.08;
    var bw = (W - pl - pr) / data.length;
    var yS = function (v) { return pt + (H - pt - pb) * (1 - v / max); };
    var sel = typeof scen === 'number' ? String(scen) : null;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-label="chart">';
    [0, 250, 500, 750, 1000, 1250].filter(function (v) { return v < max; }).forEach(function (v) {
      s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yS(v) + '" y2="' + yS(v) + '" stroke="var(--line)"/><text x="' + (pl - 4) + '" y="' + (yS(v) + 4) + '" text-anchor="end">' + v + '</text>';
    });
    data.forEach(function (d, i) {
      var x = pl + i * bw;
      var hl = d.y === sel;
      s += '<rect x="' + (x + 2) + '" y="' + yS(d.p) + '" width="' + (bw - 4) + '" height="' + (H - pb - yS(d.p)) + '" rx="2" fill="var(--c-water)" opacity="' + (hl ? 1 : (sel ? 0.35 : 0.75)) + '"><title>' + d.y + ': ' + Math.round(d.p) + ' mm / ETc ' + Math.round(d.etc) + ' mm</title></rect>';
      var nearSel = sel && Math.abs(ys.indexOf(sel) - i) === 1;
      if ((i % 3 === 0 && !nearSel) || hl) s += '<text x="' + (x + bw / 2) + '" y="' + (H - 10) + '" text-anchor="middle"' + (hl ? ' style="font-weight:700;fill:var(--ink)"' : '') + '>' + String(d.y).slice(2) + '/' + String(+d.y + 1).slice(2) + '</text>';
    });
    s += '<polyline fill="none" stroke="var(--c-heat)" stroke-width="2.5" points="' + data.map(function (d, i) { return (pl + i * bw + bw / 2) + ',' + yS(d.etc); }).join(' ') + '"/>';
    s += '<text x="' + pl + '" y="' + (pt + 8) + '">mm</text></svg>';
    $('chart').innerHTML = s;
    var med = function (k) { var a = data.map(function (d) { return d[k]; }); return Math.round(E.percentile(a, 0.5)); };
    var pick = data.filter(function (d) { return d.y === (sel || '2021'); })[0];
    $('chart').setAttribute('aria-label', t.chartAria(data.length, pick ? pick.y + '–' + String(+pick.y + 1).slice(2) : '', pick ? Math.round(pick.p) : 0, pick ? Math.round(pick.etc) : 0));
    $('evidenceCard').innerHTML = pick ? (rainAdj ? '<b>' + t.simTag(rainAdj) + '</b> ' : '') + t.ev({ y: pick.y + '–' + String(+pick.y + 1).slice(2), p: Math.round(pick.p), etc: Math.round(pick.etc), def: Math.round(pick.def), heat: pick.heat, mdef: med('def'), mheat: med('heat') }) +
      ' <span class="muted">(' + (lang === 'es' ? 'NASA POWER, celda regional; ET0 Hargreaves; Kc FAO-56' : tr('NASA POWER, regional cell; Hargreaves ET0; FAO-56 Kc')) + ')</span>' : '';
  }

  // Lluvia y demanda de la soja (rotación base) en un grupo de campañas.
  function soyStats(byA, years) {
    var rows = years.map(function (y) {
      var det = byA[y].detail.filter(function (d) { return d.crop === 'soja'; });
      return { y: y, p: det.reduce(function (s, d) { return s + d.p; }, 0), etc: det.reduce(function (s, d) { return s + d.etc; }, 0), def: byA[y].waterDeficit, heat: byA[y].heatDays };
    });
    if (!rows.length) return null;
    var col = function (k) { return rows.map(function (r) { return r[k]; }); };
    var worst = rows.slice().sort(function (a, b) { return (a.p - a.etc) - (b.p - b.etc); })[0];
    return { n: rows.length, rain: Math.round(E.percentile(col('p'), 0.5)), rainMin: Math.round(Math.min.apply(null, col('p'))), rainMax: Math.round(Math.max.apply(null, col('p'))),
      def: Math.round(E.percentile(col('def'), 0.5)), heat: E.round(E.percentile(col('heat'), 0.5), 1),
      short: rows.filter(function (r) { return r.p < r.etc; }).length, worst: { y: worst.y, p: Math.round(worst.p), etc: Math.round(worst.etc) } };
  }
  // El Niño / La Niña: mismas campañas de NASA POWER, agrupadas con el ONI de NOAA.
  function renderEnso(byA, sw) {
    var t = T[lang];
    if (!ONI) { $('ensoTable').innerHTML = ''; $('ensoText').textContent = ''; return null; }
    var out = {};
    var body = ['nina', 'neutral', 'nino'].map(function (p) {
      var ss = sw.seasons.filter(function (s) { return phaseOf(s.year) === p; });
      var st = soyStats(byA, ss.map(function (s) { return s.year; }));
      if (!st) return '';
      var w = {}; ss.forEach(function (s) { w[s.winner] = (w[s.winner] || 0) + 1; });
      var mx = Math.max.apply(null, Object.keys(w).map(function (k) { return w[k]; }));
      st.top = Object.keys(w).filter(function (k) { return w[k] === mx; }); st.topN = mx;
      out[p] = st;
      return '<tr><td>' + t.phase[p] + '</td><td>' + st.n + '</td><td>' + st.rain + '</td><td>' + st.rainMin + '–' + st.rainMax + '</td><td>' + st.short + ' / ' + st.n + '</td><td>' + st.def + '</td><td>' + st.heat + '</td><td>' + st.top.join(' = ') + ' (' + mx + ')</td></tr>';
    }).join('');
    $('ensoTable').innerHTML = '<thead><tr>' + t.ensoCols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + body + '</tbody>';
    var num = function (v) { return (v > 0 ? '+' : '') + String(v).replace('.', lang === 'es' ? ',' : '.'); };
    out.latest = ONI.latest ? ONI.latest.season + ' ' + ONI.latest.year + ' = ' + num(ONI.latest.anom) : '';
    out.latestPhase = ONI.latest ? E.ensoPhase(ONI.latest.anom, ONI.threshold) : null;
    $('ensoText').innerHTML = (out.nina && out.nino ? t.ensoText(out) : '') + (ONI.latest ? ' ' + t.ensoLatest(out.latest, t.phase[out.latestPhase]) : '') +
      ' <a href="' + ONI.url + '" target="_blank" rel="noopener">NOAA CPC ONI</a>';
    return out;
  }
  // Ayuda guiada sin IA: cada respuesta se arma con los resultados ya calculados.
  function renderHelp() {
    var t = T[lang], c = helpCtx;
    if (!c) return;
    var qs = Object.keys(t.help.q).filter(function (k) { return k !== 'enso' || (c.enso && c.enso.nina && c.enso.nino); });
    if (qs.indexOf(helpQ) < 0) helpQ = qs[0];
    $('helpQs').innerHTML = qs.map(function (k) { return '<button type="button" data-q="' + k + '" aria-pressed="' + (k === helpQ) + '">' + t.help.q[k] + '</button>'; }).join('');
    $('helpQs').querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { helpQ = b.dataset.q; renderHelp(); }); });
    $('helpA').innerHTML = t.help.a[helpQ](c);
  }

  // Control de coherencia: balde del modelo (rotación base, suelo elegido) frente a GWETROOT de POWER.
  function renderCoherence(ds, byYear, scen) {
    var t = T[lang], cad = E.soilCapacityMm($('soil').value);
    var c = E.soilCoherence(byYear, ds.agg, cad);
    var show = function (on) { $('cohChart').style.display = on ? '' : 'none'; $('cohLegend').style.display = on ? '' : 'none'; };
    if (!c || c.r == null) { show(false); $('cohChart').innerHTML = ''; $('cohText').textContent = c ? t.cohNoData : t.cohNoSoil; return; }
    var y = typeof scen === 'number' && c.series[String(scen)] ? String(scen) : (c.series['2021'] ? '2021' : Object.keys(c.series).pop());
    var pts = c.series[y] || [];
    show(pts.length > 1);
    var W = 760, H = 200, pl = 40, pb = 28, pt = 10, pr = 10;
    var xS = function (i) { return pl + (W - pl - pr) * (pts.length > 1 ? i / (pts.length - 1) : 0.5); };
    var yS = function (v) { return pt + (H - pt - pb) * (1 - v); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '">';
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yS(v) + '" y2="' + yS(v) + '" stroke="var(--line)"/><text x="' + (pl - 4) + '" y="' + (yS(v) + 4) + '" text-anchor="end">' + Math.round(v * 100) + '%</text>';
    });
    pts.forEach(function (p, i) {
      if (p.dekad % 3 === 1) s += '<text x="' + xS(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + MONTHS[lang][monthIdx(p.dekad, ds.sm)] + '</text>';
    });
    var line = function (k, col) {
      return '<polyline fill="none" stroke="' + col + '" stroke-width="2.5" stroke-linejoin="round" points="' + pts.map(function (p, i) { return xS(i) + ',' + yS(p[k]); }).join(' ') + '"/>' +
        pts.map(function (p, i) { return '<circle cx="' + xS(i) + '" cy="' + yS(p[k]) + '" r="3" fill="' + col + '"><title>' + dekLabel(p.dekad) + ': ' + Math.round(p[k] * 100) + '%</title></circle>'; }).join('');
    };
    s += line('gwr', 'var(--c-cover)') + line('model', 'var(--c-water)') + '</svg>';
    $('cohChart').innerHTML = s;
    var yl = y + '–' + String(+y + 1).slice(2);
    $('cohChart').setAttribute('aria-label', t.cohAria(yl));
    var pc = function (k, f) { return Math.round(100 * f.apply(null, pts.map(function (p) { return p[k]; }))); };
    var rg = { m0: pc('model', Math.min), m1: pc('model', Math.max), g0: pc('gwr', Math.min), g1: pc('gwr', Math.max) };
    $('cohText').innerHTML = t.cohText({ r: String(c.r).replace('.', lang === 'es' ? ',' : '.'), n: c.n, y: yl, ny: Object.keys(c.series).length }) +
      ' ' + t.cohRange(rg) + (rg.m1 - rg.m0 > 2 * (rg.g1 - rg.g0) ? ' ' + t.cohStrong : '');
  }

  // --- Descarga en vivo desde NASA POWER (sin clave API) ---
  // Descarga un punto y lo deja elegido. Devuelve una promesa con el id del conjunto de datos.
  // extra: datos de la parcela (poly, ha) u otros campos que se guardan con el conjunto de datos.
  function fetchPoint(lat, lon, label, extra) {
    var t = T[lang];
    // Cualquier punto con tierra cultivable del mundo. Fuera de Paraguay las rotaciones fijas son una plantilla (se avisa en pantalla).
    if (!(isFinite(lat) && isFinite(lon) && lat >= -60 && lat <= 75 && lon >= -180 && lon <= 180)) { var err = new Error(t.outOfRange); err.range = true; return Promise.reject(err); }
    lat = +(+lat).toFixed(4); lon = +(+lon).toFixed(4);
    var id = 'live_' + lat + '_' + lon;
    var H = E.hemisphereOf(lat);
    if (datasets[id]) { if (extra) Object.assign(datasets[id], extra); if (label) datasets[id].label = label; pending = null; fillLocations(id); fillScenarios(); fillBuilder(); render(); return Promise.resolve(id); }
    var end = new Date(); end.setDate(end.getDate() - 7);
    var endS = end.toISOString().slice(0, 10).replace(/-/g, '');
    var url = 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,TOA_SW_DWN,GWETROOT&community=AG&longitude=' + lon + '&latitude=' + lat + '&start=20010501&end=' + endS + '&format=JSON';
    var ctrl = new AbortController(); var to = setTimeout(function () { ctrl.abort(); }, 90000);
    busy(1);
    return fetch(url, { signal: ctrl.signal }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) {
      // Se deja repintar la pantalla con el aviso antes del cálculo, para que no parezca congelada.
      busy(2);
      return new Promise(function (res) { setTimeout(function () { res(j); }, 40); });
    }).then(function (j) {
      var P = j.properties && j.properties.parameter;
      if (!P || !P.T2M_MAX) throw new Error(lang === 'es' ? 'respuesta sin datos' : tr('empty response'));
      var agg = E.aggregateDaily(P, { heat: 35, frost: 2 }, { startMonth: H.startMonth });
      if (fullYears(agg).length < 5) throw new Error(lang === 'es' ? 'menos de 5 años completos' : tr('fewer than 5 complete years'));
      datasets[id] = Object.assign({ label: label || (lang === 'es' ? 'Punto elegido' : tr('Selected point')), lat: lat, lon: lon, agg: agg, source: 'live', fetched: new Date().toISOString(),
        sm: H.startMonth, hemi: H.hemi, tropical: H.tropical, local: inParaguay(lat, lon),
        meta: { units: Object.fromEntries(Object.entries(j.parameters || {}).map(function (e) { return [e[0], e[1].units]; })), sources: j.header && j.header.sources, power_api: j.header && j.header.api } }, extra || {});
      pending = null;
      fillLocations(id); fillScenarios(); fillBuilder(); render();
      return id;
    }).catch(function (e) { throw netError(e); }).finally(function () { clearTimeout(to); busy(0); });
  }
  // Aviso visible mientras se descarga y se calcula un punto nuevo (0 = ocultar, 1 = descargando, 2 = calculando).
  var busyTimer = null;
  function busy(stage) {
    var el = $('nasaBusy');
    if (!el) { el = document.createElement('div'); el.id = 'nasaBusy'; el.className = 'nasa-busy'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); el.hidden = true; document.body.appendChild(el); }
    clearInterval(busyTimer);
    if (!stage) { el.hidden = true; return; }
    var es = lang === 'es';
    var steps = stage === 2 ? [es ? 'Calculando evapotranspiración y balance de agua FAO-56…' : tr('Computing FAO-56 evapotranspiration and water balance…')] : (es ?
      ['Conectando con la API de NASA POWER…', 'Descargando 25 años de datos diarios: lluvia, temperatura y radiación…', 'NASA POWER sigue preparando unos 9.000 días de datos. Puede tardar hasta un minuto…'] :
      [tr('Connecting to the NASA POWER API…'), tr('Downloading 25 years of daily data: rain, temperature and radiation…'), tr('NASA POWER is still preparing about 9,000 days of data. It can take up to a minute…')]);
    var i = 0; el.textContent = steps[0]; el.hidden = false;
    if (steps.length > 1) busyTimer = setInterval(function () { if (i < steps.length - 1) el.textContent = steps[++i]; }, 6000);
  }
  // Traduce los errores crudos del navegador ("Failed to fetch", AbortError) a un mensaje que el productor entienda.
  function netError(e) {
    if (e && e.range) return e;
    var m = String(e && e.message || '');
    var es = lang === 'es', out;
    if (e && e.name === 'AbortError') out = es ? 'NASA POWER tardó más de 90 segundos en responder. Prueba de nuevo en un rato. Mientras tanto, elige una de las 8 zonas guardadas (por ejemplo Itapúa) para ver resultados al instante.' : tr('NASA POWER took more than 90 seconds to answer. Try again later. Meanwhile, pick one of the 8 stored areas (for example Itapúa) to see results instantly.');
    else if (/^HTTP /.test(m)) out = es ? 'NASA POWER está ocupado o respondió con un error (' + m + '). Prueba de nuevo en un rato. Mientras tanto, elige una de las 8 zonas guardadas (por ejemplo Itapúa) para ver resultados al instante.' : tp('NASA POWER is busy or answered with an error ({0}). Try again later. Meanwhile, pick one of the 8 stored areas (for example Itapúa) to see results instantly.', [m]);
    else if (e instanceof TypeError || navigator.onLine === false) out = es ? 'no hay conexión con NASA POWER. Revisa internet y prueba de nuevo. Mientras tanto, elige una de las 8 zonas guardadas (por ejemplo Itapúa) para ver resultados al instante.' : tr('there is no connection to NASA POWER. Check your internet and try again. Meanwhile, pick one of the 8 stored areas (for example Itapúa) to see results instantly.');
    else return e;
    var err = new Error(out); err.friendly = true; return err;
  }
  function fetchLive() {
    var t = T[lang];
    $('fetchStatus').textContent = t.live; $('fetchBtn').disabled = true;
    fetchPoint(+$('lat').value, +$('lon').value).then(function () { $('fetchStatus').textContent = t.ok; },
      function (e) { $('fetchStatus').textContent = e.range ? e.message : t.fail + e.message; }).then(function () { $('fetchBtn').disabled = false; });
  }

  function exportCache() {
    var out = { fetched_utc: new Date().toISOString(), provider: 'NASA POWER (LaRC) Daily API, community AG', locations: {} };
    Object.keys(datasets).forEach(function (k) {
      var d = datasets[k];
      out.locations[k] = Object.assign({}, d.meta, { label: d.label, lat: d.lat, lon: d.lon, fetched: d.fetched, thresholds: { heat_c: 35, frost_c: 2 }, dekads: E.toCompact(d.agg) });
    });
    var blob = new Blob(['window.POWER_CACHE = ' + JSON.stringify(out) + ';\n'], { type: 'text/javascript' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'power_cache.js'; a.click();
  }

  // --- Rotación propia ---
  function fillBuilder() {
    var crops = [''].concat(Object.keys(E.CROPS));
    var gen = lang === 'en' ? tr(' · generic FAO-56') : ' · FAO-56 genérico';
    ['1', '2'].forEach(function (n) {
      var pc = $('bc' + n).value, ps = $('bs' + n).value;
      $('bc' + n).innerHTML = crops.map(function (c) { return '<option value="' + c + '">' + (c ? (lang === 'en' ? CROP_EN[c] : E.CROPS[c].name) + (E.CROPS[c].generic ? gen : '') : '—') + '</option>'; }).join('');
      $('bs' + n).innerHTML = E.DEKAD_LABELS.map(function (l, i) { return '<option value="' + i + '">' + dekLabel(i) + '</option>'; }).join('');
      $('bc' + n).value = pc || (n === '1' ? 'avena' : 'soja'); $('bs' + n).value = ps || (n === '1' ? '1' : '15');
    });
  }
  function applyCustom() {
    var crops = [];
    ['1', '2'].forEach(function (n) { var c = $('bc' + n).value; if (c) crops.push({ crop: c, start: +$('bs' + n).value, len: DEFAULT_LEN[c] }); });
    if (!crops.length) { $('buildStatus').textContent = lang === 'es' ? 'Elige al menos un cultivo.' : tr('Pick at least one crop.'); return; }
    var cand = { id: 'E', name: 'Tu rotación', crops: crops };
    var errs = E.validateRotation(cand, E.dekadLabels(curSm()));
    if (errs.length) { $('buildStatus').textContent = lang === 'es' ? 'No se puede: ' + errs[0] + '. Cambia la fecha de siembra.' : tr('Not possible: crops overlap or run past the end of the farming year. Change a sowing date.'); return; }
    custom = cand;
    var gens = crops.filter(function (c) { return E.CROPS[c.crop].generic; }).map(function (c) { return lang === 'en' ? CROP_EN[c.crop] : E.CROPS[c.crop].name; });
    $('buildStatus').textContent = (lang === 'es' ? 'Tu rotación (E) ya está en la comparación. Soja, trigo, avena y maíz duran lo mismo que en las rotaciones fijas (supuesto).' : tr('Your rotation (E) is now in the comparison. Soybean, wheat, oat and maize last as long as in the fixed rotations (assumption).')) +
      (gens.length ? (lang === 'es' ? ' Atención: ' + gens.join(', ') + ' usa coeficientes y duración genéricos de FAO-56, sin calendario de Paraguay; elige tú la fecha de siembra.' : tp(' Note: {0} uses generic FAO-56 coefficients and length, with no Paraguay calendar; you choose the sowing date.', [gens.join(', ')])) : '');
    render();
  }
  function removeCustom() { custom = null; $('buildStatus').textContent = ''; render(); }

  // --- Compartir: el estado viaja en el enlace (#...) ---
  function stateHash() {
    var p = ['l=' + $('loc').value, 's=' + $('scenario').value, 'o=' + $('soil').value, 'w=' + E.DIMENSIONS.map(function (d) { return weights[d.key]; }).join(','), 'g=' + uiLang];
    if (rainAdj) p.push('r=' + rainAdj);
    var ex = LIMITS.filter(function (k) { return excluded[k]; });
    if (ex.length) p.push('x=' + ex.join(','));
    if (custom) p.push('c=' + custom.crops.map(function (c) { return c.crop + '.' + c.start; }).join('-'));
    return '#' + p.join('&');
  }
  function loadHash() {
    var o = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) o[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
    if (o.w) o.w.split(',').forEach(function (v, i) { var d = E.DIMENSIONS[i]; if (d && +v >= 0 && +v <= 5) weights[d.key] = Math.round(+v); });
    if (o.r && +o.r >= -30 && +o.r <= 30) rainAdj = Math.round(+o.r / 10) * 10;
    if (o.x) o.x.split(',').forEach(function (k) { if (LIMITS.indexOf(k) >= 0) excluded[k] = true; });
    if (o.c) {
      var crops = o.c.split('-').map(function (x) { var a = x.split('.'); return { crop: a[0], start: +a[1], len: DEFAULT_LEN[a[0]] }; });
      var cand = { id: 'E', name: 'Tu rotación', crops: crops };
      if (crops.every(function (c) { return E.CROPS[c.crop] && c.start >= 0; }) && !E.validateRotation(cand).length) custom = cand;
    }
    return o;
  }
  function share() {
    var url = location.href.split('#')[0] + stateHash();
    var done = function (ok) { $('shareStatus').textContent = ok ? (lang === 'es' ? 'Enlace copiado.' : tr('Link copied.')) : url; };
    try { history.replaceState(null, '', stateHash()); } catch (e) { /* file:// en algunos navegadores */ }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
    else done(false);
  }

  function setLang(l) {
    var extra = EXTRA_LANGS.indexOf(l) >= 0;
    xl = extra ? (window.I18N && window.I18N[l]) || null : null;
    if (extra && !xl) { l = 'en'; extra = false; }
    uiLang = l; lang = l === 'es' ? 'es' : 'en';
    if (!T_EN0) T_EN0 = T.en;
    if (!ORIG) ORIG = { crop: Object.assign({}, CROP_EN), soil: Object.assign({}, SOIL_EN), rot: Object.assign({}, ROT_NAMES_EN), m: MONTHS.en.slice(), mf: MONTHS_FULL.en.slice() };
    T.en = xl ? xmap(T_EN0, '') : T_EN0;
    [['crop', CROP_EN], ['soil', SOIL_EN], ['rot', ROT_NAMES_EN]].forEach(function (p) { Object.keys(ORIG[p[0]]).forEach(function (k) { p[1][k] = tr(ORIG[p[0]][k]); }); });
    MONTHS.en = ORIG.m.map(tr); MONTHS_FULL.en = ORIG.mf.map(tr);
    document.documentElement.lang = l;
    var sel = $('langSel'); if (sel) sel.value = l;
    try { localStorage.setItem('rl-lang', l); } catch (e) { /* almacenamiento bloqueado */ }
    $('themeBtn').setAttribute('aria-label', tr('Switch light or dark theme'));
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.dataset.i18n; el.textContent = l === 'es' ? STATIC_ES[k] : tr(STATIC_EN[k] || STATIC_ES[k]);
    });
    var keep = $('loc').value; fillLocations(keep); renderLimits(); buildWeights(); fillSoils(); fillScenarios(); fillBuilder(); render();
  }

  function renderLimits() {
    var t = T[lang];
    $('limits').innerHTML = LIMITS.map(function (k) { return '<label><input type="checkbox" data-x="' + k + '"' + (excluded[k] ? ' checked' : '') + '>' + t.limits[k] + '</label>'; }).join('');
    $('limits').querySelectorAll('input').forEach(function (c) { c.addEventListener('change', function () { excluded[c.dataset.x] = c.checked; render(); }); });
  }

  // =====================================================================
  // Vistas, agenda, parcelas y asistente guiado (sin IA)
  // =====================================================================
  var MONTHS = {
    es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  var MONTHS_FULL = {
    es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function soilName(k) { return lang === 'en' ? SOIL_EN[k] : E.SOILS[k].name; }
  function cropName(k) { return lang === 'en' ? CROP_EN[k] : E.CROPS[k].name; }
  function placeLabel(ds) { return lang === 'en' ? String(ds.label).replace('zona', tr('area')) : ds.label; }

  Object.assign(STATIC_EN, {
    mHome: 'Home', mCompare: 'Compare rotations', mAgenda: 'Planner & climate', mParcels: 'My fields', mDevices: 'Sensors & irrigation', mCollapse: 'Collapse',
    homeH: 'Hi. What do you want to know about your field?',
    homeLead: 'Type or dictate the way you would talk to a technician. I use 25 seasons of NASA data to compare soybean, wheat, black oat and second-crop maize rotations in your area.',
    chatLbl: 'Your message', send: 'Send',
    chatNote: 'Guided assistant: every number comes from the tool’s own calculation with NASA data, and general answers come from reviewed texts with their source. Works offline.',
    exploreText2: 'Not a substitute for an agronomist. Results are regional (a cell about 50 km wide), not field-level.',
    agH: 'Planner & climate', agWarnT: 'Assumed dates.',
    agWarn: 'They come from the rotation calendar and still need to be validated with a technician in your area. They are not a sowing recommendation. The risk notes, however, are observed NASA POWER data since 2001.',
    agEventsH: 'Key dates for the rotation', agRotL: 'Rotation',
    agMonthsH: 'Historical climate risk, month by month',
    agMonthsNote: 'What happened in your area in the seasons since 2001 (NASA POWER, regional cell). This is not a forecast.',
    agEnsoH: 'El Niño now',
    pH: 'My fields', pIntro: 'Save the area, soil and what you cannot grow for each field, to compare it again with one tap. Saved on this device only.',
    pSaveH: 'Save the current settings', pName: 'Field name', pSave: 'Save field', pListH: 'Saved fields',
    dH: 'Sensors & irrigation', dStatus: 'No devices connected',
    dWhy: 'This version does not connect to sensors or irrigation equipment. We do not show simulated data as if it were measured, and switching irrigation on remotely needs safety confirmations that do not exist yet.',
    dAddH: 'What each device would add',
    d1t: 'Soil moisture sensor', d1: 'It would replace the generic soil with a measurement from your field and make it possible to check the model’s water balance.',
    d2t: 'On-farm weather station', d2: 'It would compare the rain and frost of the NASA POWER cell (about 50 km) with what happens in your field.',
    d3t: 'Irrigation controller', d3: 'Only makes sense on irrigated fields. Any switch-on would have to be confirmed by a person.',
    dTechH: 'Technologies to research',
    dTech: 'Capacitive soil moisture sensors, compact weather stations, long-range (LoRaWAN) or cellular communication, and valve controllers. Pending: survey what farmers in the area use today and at what cost.'
  });

  var X = {
    es: {
      placeholder: 'Escribe aquí… por ejemplo: mi campo está en Caaguazú',
      micTitle: 'Dictar. Usa el reconocimiento de voz del navegador, que puede enviar el audio a su proveedor.',
      micStop: 'Detener el dictado', menuOpen: 'Abrir menú', menuClose: 'Cerrar menú', collapse: 'Contraer menú', expand: 'Expandir menú',
      agTop: ' (la que mejor equilibra ahora)',
      agZone: function (l, la, lo) { return 'Zona: ' + l + ' (' + la + ', ' + lo + '), celda regional de NASA POWER.'; },
      agSow: function (c) { return 'Siembra de ' + c; },
      agHeat: function (c) { return 'Floración de ' + c + ': etapa sensible al calor'; },
      agHeatRisk: function (n, of) { return 'Hubo al menos un día de 35 °C o más en esta ventana en ' + n + ' de ' + of + ' campañas.'; },
      agFrost: function (c, st) { return (st === 'inicial' ? 'Emergencia de ' : 'Floración de ') + c + ': etapa sensible a la helada'; },
      agFrostRisk: function (n, of) { return 'Hubo al menos un día de 2 °C o menos en esta ventana en ' + n + ' de ' + of + ' campañas.'; },
      agHarv: function (c, grain) { return grain ? 'Cosecha aproximada de ' + c : 'Fin del ciclo de ' + c; },
      agRows: ['Lluvia, mediana (mm)', 'Años con helada (≤ 2 °C)', 'Años con calor (≥ 35 °C)'],
      agEnso: function (o) { return 'Último valor publicado por NOAA: ONI ' + o.latest + ' (' + o.phase + '). ' + (o.nino ? 'En esta zona, las ' + o.nino.n + ' campañas con El Niño dejaron una mediana de ' + o.nino.rain + ' mm de lluvia para la soja, y la lluvia fue menor que la demanda en ' + o.nino.short + ' de ' + o.nino.n + '. ' : '') + 'Es lo que pasó antes, no un pronóstico.'; },
      pUse: 'Usar', pDel: 'Borrar', pEmpty: 'Todavía no guardaste ninguna parcela. Puedes hacerlo aquí o desde el asistente de Inicio.',
      pDelQ: function (n) { return '¿Borrar la parcela «' + n + '» de este dispositivo? No se puede deshacer.'; },
      pCurrent: function (d) { return 'Configuración actual: ' + d + '.'; },
      pSaved: function (n) { return 'Parcela «' + n + '» guardada en este dispositivo.'; },
      pFail: 'No se pudo guardar: este navegador no permite guardar datos.',
      pLoading: 'Descargando los datos de esta parcela desde NASA POWER…',
      pDesc: function (o) { return o.place + ' · suelo ' + o.soil + (o.excl ? ' · sin ' + o.excl : ''); },
      bot: {
        hello: '<p>¡Hola! Soy el asistente de YvyShift. Cuéntame dónde está tu campo y qué te preocupa.</p><p>Por ejemplo: «Quiero registrar mi parcela en Itapúa, suelo arcilloso» o «¿Qué pasa en mi zona con El Niño?».</p>',
        chipsStart: ['Registrar mi parcela', '¿Qué pasó en la sequía 2021–22?', '¿Qué pasa con El Niño?', '¿Cuándo hay heladas?', 'Comparar rotaciones en Alto Paraná'],
        chipsNext: ['¿Por qué ganó esa rotación?', '¿Puedo confiar en esto?', '¿Qué pasa con El Niño?', 'Ver mi agenda'],
        typing: 'Calculando…',
        fetching: function (l) { return 'Descargando las campañas de NASA POWER para ' + l + '. Puede tardar hasta un minuto.'; },
        fetchFail: function (l, m) { return '<p>No pude descargar los datos de ' + l + ' (' + m + ').</p><p>Sin conexión solo tengo guardados Itapúa y Alto Paraná.</p>'; },
        zone: function (o) { return '<p>Listo: <b>' + o.place + '</b>.</p><p>En ' + o.short + ' de ' + o.n + ' campañas, la lluvia del ciclo de la soja fue menor que lo que pedía el cultivo. La peor fue ' + o.worst + ': ' + o.p + ' mm frente a ' + o.etc + ' mm.</p><p>Con las prioridades actuales, la rotación que mejor equilibra es <b>' + o.name + '</b>, primera en ' + o.w + ' de ' + o.n + ' campañas.</p>'; },
        otherCrop: function (c) { return '<p>YvyShift trabaja con soja, trigo, avena negra y maíz zafriña, y en «Arma tu propia rotación» también con girasol, canola, sorgo, sésamo y poroto. Para ' + c + ' no tengo coeficientes de cultivo, y no voy a inventarlos.</p><p>Sí puedo mostrarte la lluvia, el calor y las heladas de tu zona desde 2001.</p>'; },
        genericCrop: function (c) { return '<p>Puedes probar ' + c + ' en «Arma tu propia rotación», dentro de Comparar rotaciones. Uso los coeficientes y la duración genéricos de la FAO (FAO-56), sin un calendario de Paraguay: la fecha de siembra la eliges tú.</p>'; },
        chaco: '<p>El Chaco tiene otro sistema productivo, y los calendarios de esta herramienta son de la Región Oriental. Prefiero no darte una comparación que no aplica.</p><p>Si igual quieres ver el clima de un punto, elígelo en el mapa o escribe las coordenadas.</p>',
        placeSet: function (l) { return 'Zona: ' + l + ' (datos de NASA POWER listos).'; },
        otherShort: function (c) { return 'Anoto la parcela, pero aviso: para ' + c + ' no tengo calendario ni coeficientes; la comparación es solo de soja, trigo, avena negra y maíz zafriña.'; },
        nowBest: function (n, w, of) { return 'Con esto, la rotación que mejor equilibra es <b>' + n + '</b>, primera en ' + w + ' de ' + of + ' campañas.'; },
        placeNotFound: 'No reconozco ese lugar: por nombre solo conozco ciudades y departamentos de Paraguay. Para cualquier otro lugar del mundo, márcalo en el mapa.',
        askPlace: '¿Dónde queda tu parcela? Escribe la ciudad o el departamento, o elígela en el mapa.',
        askSoil: '¿Cómo es el suelo? Si no lo sabes, uso arcilloso y lo marco como supuesto.',
        askLimits: '¿Hay algo que no puedas o no quieras sembrar? Por ejemplo trigo, maíz, avena o soja en septiembre. Si no hay nada, escribe «nada».',
        chipsPlace: function (cur) { return ['Usar ' + cur, 'Itapúa', 'Alto Paraná', 'Caaguazú']; },
        chipsSoil: ['Arenoso', 'Franco', 'Arcilloso', 'No sé'],
        chipsLimits: ['Nada', 'No siembro trigo', 'No siembro maíz', 'No siembro soja en septiembre'],
        soilSet: function (s) { return 'Suelo: ' + s + '.'; },
        soilAssumed: 'Uso suelo arcilloso como supuesto. Puedes cambiarlo cuando quieras.',
        limitsSet: function (l) { return 'Saqué de la comparación lo que incluye ' + l + '.'; },
        limitsBack: function (l) { return 'Volví a incluir ' + l + '.'; },
        limitsNone: 'Sin limitaciones: comparo todas las rotaciones.',
        soyExcl: 'Todas las rotaciones de esta herramienta incluyen soja, así que no puedo sacarla. Sí puedo mostrarte el clima de tu zona.',
        prioSet: function (n) { return 'Cambié las prioridades a «' + n + '».'; },
        saved: function (n, d) { return '<p>Guardé tu parcela <b>' + n + '</b> en este dispositivo: ' + d + '.</p>'; },
        saveFail: '<p>No pude guardarla: este navegador no permite guardar datos. La configuración sí quedó aplicada.</p>',
        agenda: function (n) { return '<p>Armé tu agenda con las fechas de la rotación <b>' + n + '</b>. Son fechas supuestas, a validar con tu técnico; los avisos de riesgo salen de datos observados.</p>'; },
        frost: function (list, n) { return list ? '<p>En tu zona, en los ' + n + ' años con datos, hubo al menos un día con mínima de 2 °C o menos en: ' + list + '.</p><p>Las heladas importan sobre todo para el trigo y el maíz en floración y para la soja recién emergida. Es la celda regional: tu lote puede ser más frío o más templado.</p>' : '<p>En la celda de tu zona no hubo días de 2 °C o menos desde 2001. Una celda de unos 50 km puede no ver las heladas de un bajo.</p>'; },
        heat: function (list, n) { return '<p>En tu zona, en los ' + n + ' años con datos, hubo al menos un día de 35 °C o más en: ' + list + '.</p><p>El calor pega más fuerte si coincide con la floración de la soja o el maíz.</p>'; },
        devices: '<p>Esta versión no se conecta a sensores ni a riego: no muestro datos simulados como si fueran mediciones.</p><p>En «Sensores y riego» explico qué aportaría cada dispositivo.</p>',
        thanks: '¡De nada! ¿Algo más?',
        help: '<p>Todavía entiendo frases simples. Puedo:</p><ul><li>registrar tu parcela (zona, suelo y lo que no puedes sembrar)</li><li>contarte qué pasó en tu zona con la sequía, El Niño, las heladas o el calor</li><li>comparar rotaciones y armar tu agenda</li></ul>',
        helpAI: '<p>La IA local está lista: pregúntame con tus palabras sobre agricultura o sobre cómo usar la app. También puedo:</p><ul><li>registrar tu parcela (zona, suelo y lo que no puedes sembrar)</li><li>contarte qué pasó en tu zona con la sequía, El Niño, las heladas o el calor</li><li>comparar rotaciones y armar tu agenda</li></ul>',
        notUnderstood: '<p>No te entendí bien.</p>',
        field: '<p>En «Ver el campo» comparas dos fechas de imágenes NASA HLS de 30 m sobre tu zona, con un deslizador. Por defecto: enero de 2022, en plena sequía, frente a enero de 2024.</p>',
        acts: { compare: 'Ver la comparación', field: 'Ver el campo', agenda: 'Ver agenda y clima', parcels: 'Mis parcelas', devices: 'Sensores y riego', map: 'Elegir en el mapa' }
      }
    },
    en: {
      placeholder: 'Type here… for example: my field is in Caaguazú',
      micTitle: 'Dictate. Uses the browser’s speech recognition, which may send the audio to its provider.',
      micStop: 'Stop dictation', menuOpen: 'Open menu', menuClose: 'Close menu', collapse: 'Collapse menu', expand: 'Expand menu',
      agTop: ' (current best balance)',
      agZone: function (l, la, lo) { return 'Area: ' + l + ' (' + la + ', ' + lo + '), regional NASA POWER cell.'; },
      agSow: function (c) { return 'Sowing ' + c; },
      agHeat: function (c) { return c + ' flowering: heat-sensitive stage'; },
      agHeatRisk: function (n, of) { return 'At least one day of 35 °C or more in this window in ' + n + ' of ' + of + ' seasons.'; },
      agFrost: function (c, st) { return c + (st === 'inicial' ? ' emergence' : ' flowering') + ': frost-sensitive stage'; },
      agFrostRisk: function (n, of) { return 'At least one day of 2 °C or less in this window in ' + n + ' of ' + of + ' seasons.'; },
      agHarv: function (c, grain) { return grain ? 'Approximate ' + c + ' harvest' : 'End of the ' + c + ' cycle'; },
      agRows: ['Rain, median (mm)', 'Years with frost (≤ 2 °C)', 'Years with heat (≥ 35 °C)'],
      agEnso: function (o) { return 'Latest value published by NOAA: ONI ' + o.latest + ' (' + o.phase + '). ' + (o.nino ? 'In this area, the ' + o.nino.n + ' El Niño seasons had a median of ' + o.nino.rain + ' mm of rain for soybean, and rain fell below demand in ' + o.nino.short + ' of ' + o.nino.n + '. ' : '') + 'This is what happened before, not a forecast.'; },
      pUse: 'Use', pDel: 'Delete', pEmpty: 'No fields saved yet. You can save one here or from the assistant on Home.',
      pDelQ: function (n) { return 'Delete the field "' + n + '" from this device? This cannot be undone.'; },
      pCurrent: function (d) { return 'Current settings: ' + d + '.'; },
      pSaved: function (n) { return 'Field "' + n + '" saved on this device.'; },
      pFail: 'Could not save: this browser does not allow storing data.',
      pLoading: 'Downloading this field’s data from NASA POWER…',
      pDesc: function (o) { return o.place + ' · ' + o.soil + ' soil' + (o.excl ? ' · without ' + o.excl : ''); },
      bot: {
        hello: '<p>Hi! I am the YvyShift assistant. Tell me where your field is and what worries you.</p><p>For example: "Register my field in Itapúa, clay soil" or "What happens in my area with El Niño?".</p>',
        chipsStart: ['Register my field', 'What happened in the 2021–22 drought?', 'What about El Niño?', 'When is there frost?', 'Compare rotations in Alto Paraná'],
        chipsNext: ['Why did that rotation win?', 'Can I trust this?', 'What about El Niño?', 'Show my planner'],
        typing: 'Calculating…',
        fetching: function (l) { return 'Downloading NASA POWER seasons for ' + l + '. It can take up to a minute.'; },
        fetchFail: function (l, m) { return '<p>I could not download the data for ' + l + ' (' + m + ').</p><p>Offline I only have Itapúa and Alto Paraná stored.</p>'; },
        zone: function (o) { return '<p>Done: <b>' + o.place + '</b>.</p><p>In ' + o.short + ' of ' + o.n + ' seasons, rain during the soybean cycle was below what the crop needed. The worst was ' + o.worst + ': ' + o.p + ' mm against ' + o.etc + ' mm.</p><p>With the current priorities, the rotation with the best balance is <b>' + o.name + '</b>, first in ' + o.w + ' of ' + o.n + ' seasons.</p>'; },
        otherCrop: function (c) { return '<p>YvyShift works with soybean, wheat, black oat and second-crop maize, and in "Build your own rotation" also with sunflower, canola, sorghum, sesame and dry beans. For ' + c + ' I have no crop coefficients, and I will not make them up.</p><p>I can show you your area’s rain, heat and frost since 2001.</p>'; },
        genericCrop: function (c) { return '<p>You can try ' + c + ' in "Build your own rotation", inside Compare rotations. I use generic FAO coefficients and crop length (FAO-56), with no Paraguay calendar: you choose the sowing date.</p>'; },
        chaco: '<p>The Chaco has a different farming system, and this tool’s calendars are for the Eastern Region. I would rather not give you a comparison that does not apply.</p><p>If you still want a point’s climate, pick it on the map or type the coordinates.</p>',
        placeSet: function (l) { return 'Area: ' + l + ' (NASA POWER data ready).'; },
        otherShort: function (c) { return 'I will register the field, but note: for ' + c + ' I have no calendar or coefficients; the comparison only covers soybean, wheat, black oat and second-crop maize.'; },
        nowBest: function (n, w, of) { return 'With that, the rotation with the best balance is <b>' + n + '</b>, first in ' + w + ' of ' + of + ' seasons.'; },
        placeNotFound: 'I do not recognise that place: by name I only know cities and departments in Paraguay. For anywhere else in the world, mark it on the map.',
        askPlace: 'Where is your field? Type the city or department, or pick it on the map.',
        askSoil: 'What is the soil like? If you do not know, I will use clay and mark it as an assumption.',
        askLimits: 'Is there anything you cannot or will not grow? For example wheat, maize, oat or soybean in September. If nothing, type "nothing".',
        chipsPlace: function (cur) { return ['Use ' + cur, 'Itapúa', 'Alto Paraná', 'Caaguazú']; },
        chipsSoil: ['Sandy', 'Loam', 'Clay', 'Not sure'],
        chipsLimits: ['Nothing', 'No wheat', 'No maize', 'No soybean in September'],
        soilSet: function (s) { return 'Soil: ' + s + '.'; },
        soilAssumed: 'Using clay soil as an assumption. You can change it any time.',
        limitsSet: function (l) { return 'I removed the rotations that include ' + l + '.'; },
        limitsBack: function (l) { return 'I included ' + l + ' again.'; },
        limitsNone: 'No constraints: comparing all rotations.',
        soyExcl: 'Every rotation in this tool includes soybean, so I cannot remove it. I can show you your area’s climate.',
        prioSet: function (n) { return 'Priorities changed to "' + n + '".'; },
        saved: function (n, d) { return '<p>Saved your field <b>' + n + '</b> on this device: ' + d + '.</p>'; },
        saveFail: '<p>I could not save it: this browser does not allow storing data. The settings were applied anyway.</p>',
        agenda: function (n) { return '<p>I built your planner with the dates of the <b>' + n + '</b> rotation. The dates are assumptions to check with your technician; the risk notes come from observed data.</p>'; },
        frost: function (list, n) { return list ? '<p>In your area, over ' + n + ' years of data, there was at least one day with a minimum of 2 °C or less in: ' + list + '.</p><p>Frost matters most for wheat and maize at flowering and for newly emerged soybean. This is the regional cell: your field may be colder or milder.</p>' : '<p>Your area’s cell had no days of 2 °C or less since 2001. A cell about 50 km wide may miss frost in low spots.</p>'; },
        heat: function (list, n) { return '<p>In your area, over ' + n + ' years of data, there was at least one day of 35 °C or more in: ' + list + '.</p><p>Heat hurts most when it hits soybean or maize flowering.</p>'; },
        devices: '<p>This version does not connect to sensors or irrigation: I do not show simulated data as if it were measured.</p><p>"Sensors & irrigation" explains what each device would add.</p>',
        thanks: 'You are welcome! Anything else?',
        help: '<p>I still understand simple sentences. I can:</p><ul><li>register your field (area, soil and what you cannot grow)</li><li>tell you what happened in your area with drought, El Niño, frost or heat</li><li>compare rotations and build your planner</li></ul>',
        helpAI: '<p>The local AI is ready: ask me in your own words about farming or about how to use the app. I can also:</p><ul><li>register your field (area, soil and what you cannot grow)</li><li>tell you what happened in your area with drought, El Niño, frost or heat</li><li>compare rotations and build your planner</li></ul>',
        notUnderstood: '<p>I did not quite understand.</p>',
        field: '<p>In "Field view" you compare two dates of 30 m NASA HLS images over your area with a slider. By default: January 2022, in the middle of the drought, against January 2024.</p>',
        acts: { compare: 'See the comparison', field: 'Field view', agenda: 'Planner & climate', parcels: 'My fields', devices: 'Sensors & irrigation', map: 'Pick on the map' }
      }
    }
  };
  Object.assign(T.es, X.es); Object.assign(T.en, X.en);
  Object.assign(STATIC_EN, {
    valH: 'Validation against data the model did not use',
    valIntro: 'The model was built only from NASA POWER and the FAO-56 formulas. Here we compare it with what actually happened on Paraguay’s farms.',
    valLg: 'Each dot is a season: water the soybean lacked according to the model (horizontal axis) against how Paraguay’s soybean yield did compared with what was expected (vertical axis, FAO)',
    valChecksH: 'Other checks', valLimitsH: 'Limits of this validation'
  });
  Object.assign(STATIC_EN, {
    install: 'Install app',
    netOff: 'No connection: you are using the data stored on your device. New satellite images and new areas need internet.',
    mField: 'Field view', fH: 'See the field from space',
    fIntro: 'NASA HLS images (harmonized Landsat and Sentinel-2, 30 m per pixel): individual fields are visible. Pick two dates and slide to compare them.',
    fDateA: 'Date A', fDateB: 'Date B', fSlider: 'Slide between A and B',
    fNote: 'This is true colour, not a vegetation index: NASA GIBS does not publish HLS NDVI. Clouds and their shadows show as they are; if a date is cloudy or empty, try nearby days or the other satellite. These images do not enter the score.',
    fWorldview: 'Open this area in NASA Worldview'
  });
  Object.assign(T.es, {
    fInfo: function (l, la, lo, ns, ew) { return 'Zona: ' + l + '. Recuadro de unos ' + ns + ' × ' + ew + ' km centrado en ' + la + ', ' + lo + ' (el círculo). Para cambiar de zona o delimitar una parcela, usa el mapa de arriba.'; },
    fInfoPoly: function (l, ha, ns, ew) { return 'Parcela: ' + l + ' · ' + ha + ' ha. Recuadro de unos ' + ns + ' × ' + ew + ' km alrededor de la parcela (línea amarilla).'; },
    fGreen: function (o) {
      var one = function (s, g) { return g && g.gcc != null ? '<b>' + s + '</b> (' + g.date + '): <b>' + o.f(g.gcc) + '</b>, ' + g.validPct + ' % de la parcela visible' : '<b>' + s + '</b>: ' + (g ? 'sin píxeles válidos (nubes o sin imagen)' : 'sin medir'); };
      return '<h4>Índice de verdor visual dentro de la parcela (no es NDVI)</h4><p>' + one('A', o.A) + ' · ' + one('B', o.B) + (o.diff != null ? ' · cambio de A a B: <b>' + (o.diff > 0 ? '+' : '') + o.diff + ' %</b>' : '') + '.</p>' +
        '<p class="muted small">Índice GCC = verde ÷ (rojo + verde + azul), medido sobre la imagen NASA HLS en color real dentro del contorno. Más alto = más verde. No es NDVI ni mide rendimiento: sirve para comparar dos fechas del mismo lote. La parcela (' + o.f(o.ha).replace(/[.,]\d+$/, '') + ' ha) equivale a unos ' + o.n30 + ' píxeles de 30 m' + (o.n30 < 30 ? '; es chica para esta resolución y el valor es poco confiable' : '') + '. Se descartan nubes y zonas sin dato.</p>';
    },
    fAlt: function (s, d, l) { return 'Imagen NASA HLS en color real, fecha ' + s + ' (' + d + '), ' + l; },
    fLoading: function (s) { return 'Descargando la imagen ' + s + ' de NASA GIBS…'; },
    fEmpty: function (s, d) { return 'No hay imagen ' + s + ' para el ' + d + ': ese día el satélite no pasó por aquí. Prueba los días vecinos o el otro satélite.'; },
    fFail: function (s) { return 'No se pudo descargar la imagen ' + s + ': hace falta conexión.'; },
    fSearching: function (s, d) { return 'No hay imagen ' + s + ' el ' + d + '. Buscando la fecha más cercana…'; },
    fMoved: function (s, o, n, sat) { return 'Imagen ' + s + ': ' + sat + ' no tenía imagen el ' + o + '; mostré la más cercana, ' + n + '.'; },
    fNone: function (s, d, sat) { return 'Imagen ' + s + ': ' + sat + ' no tiene imágenes cerca del ' + d + ' (8 días antes o después). Prueba con el otro satélite o con otra fecha.'; },
    statDrop: function (a, b) { return 'cayó la cosecha de soja de Paraguay en esa sequía (FAO)'; },
    statArea: 'de soja en la Región Oriental (Censo 2022)',
    statVal: 'el agua que faltó según el modelo frente al rendimiento real (FAO)',
    valC1: 'correlación entre el agua que faltó según el modelo, en los 5 departamentos con más soja, y el rendimiento real de la soja (−1 sería perfecta)',
    valC2: 'de las peores campañas reales que el modelo también marca como las más secas',
    valC3: 'correlación de la lluvia de NASA POWER con ERA5, otra fuente (Itapúa · Alto Paraná)',
    valX: 'agua que faltó según el modelo (mm)',
    valTip: function (d, a, y) { return d + ' mm de déficit · rendimiento ' + a + ' % respecto de la tendencia (' + y + ' t/ha)'; },
    valAria: function (n, r) { return 'Gráfico de dispersión de ' + n + ' campañas: déficit de agua del modelo frente a la anomalía del rendimiento de soja de Paraguay. Correlación ' + r + '.'; },
    valText: function (o) { return 'En ' + o.n + ' campañas, cuanta más agua le faltó a la soja según el modelo, peor rindió la soja en Paraguay: <b>r = ' + o.r + '</b> (con los días de calor, r = ' + o.rh + '). Las 5 peores campañas reales fueron ' + o.worst + '; el modelo marca como las 5 más secas ' + o.model + ': <b>coinciden ' + o.hits + '</b>. Acertar eso al azar tiene una probabilidad de ' + o.p + ' %. Sin la sequía 2021–22, que pesa mucho, la correlación es r = ' + o.r21 + '. Repetida en cada una de las ' + o.zn + ' zonas por separado, da entre ' + o.zmax + ' y ' + o.zmin + ': el resultado no depende de una sola zona.'; },
    valCols: ['Qué se contrasta', 'Resultado', 'Estado', 'Fuente'],
    valSt: { ok: 'Coincide', partial: 'Coincide en parte', warn: 'Diferencia', none: 'Sin fuente' },
    valRainRow: function (z) { return 'Lluvia del ciclo de la soja, ' + z; },
    valC4: 'correlación entre el verdor que midió el satélite MODIS de NASA en enero y el agua que faltó según el modelo (Itapúa · Alto Paraná); negativa = coinciden',
    valSatRow: function (z) { return 'Satélite MODIS (NDVI de enero), ' + z; },
    valSatRes: function (r, n, low, v) { return 'r = ' + r + ' con el déficit del modelo en ' + n + ' campañas. El enero menos verde fue ' + low + ' (NDVI ' + v + '). El satélite mide otra cosa que POWER: es una prueba independiente.'; },
    valRainRes: function (r, p, e, n) { return 'r = ' + r + ' en ' + n + ' campañas. Sequía 2021–22: NASA POWER ' + p + ' mm, ERA5 ' + e + ' mm.'; },
    valCalRow: function (c) { return 'Calendario de ' + c.toLowerCase(); },
    valCal: {
      soja: 'El modelo siembra el 11 de octubre (y el 11 de septiembre la soja temprana) y cosecha en enero o febrero. Publicado: siembra de fines de agosto a inicios de noviembre, cosecha de fines de diciembre a marzo.',
      trigo: 'El modelo cosecha hasta el 10 de octubre; la FAO dice que la cosecha empieza en septiembre. La fecha de siembra no se pudo contrastar.',
      maiz: 'Alcance del modelo: el año agrícola va del 1 de mayo al 30 de abril, así que el maíz zafriña de D se evalúa hasta el 30 de abril. FAO GIEWS describe su cosecha todavía en marcha en julio y agosto; ese tramo final queda fuera de esta versión y está en la hoja de ruta, por lo que el riesgo de helada de D puede ser algo mayor que el mostrado.',
      avena: 'No encontramos un calendario publicado de avena negra para Paraguay.'
    },
    valLimits: function (r21) { return [
      'El rendimiento de la FAO es nacional; el modelo usa un punto por departamento en los cinco que concentran más del 87 % de la soja (Alto Paraná, Canindeyú, Itapúa, San Pedro y Caaguazú).',
      'Son 23 campañas. Una correlación no prueba causa: el rendimiento también depende de precios, plagas y tecnología. Por eso usamos la anomalía respecto de la tendencia.',
      'La sequía 2021–22 pesa mucho en el resultado; sin ella, r = ' + r21 + '.',
      'ERA5 es otro reanálisis, de otro centro (ECMWF): es independiente de NASA, pero no es una medición de estación.',
      'Se valida el indicador de clima de la soja, no el puntaje de cada rotación: no hay datos públicos de rendimiento por rotación.'
    ]; },
    valSrc: 'Rendimiento y producción de soja:'
  });
  Object.assign(T.en, {
    fInfo: function (l, la, lo, ns, ew) { return 'Area: ' + l + '. A box of about ' + ns + ' × ' + ew + ' km centred on ' + la + ', ' + lo + ' (the circle). To change area or outline a field, use the map above.'; },
    fInfoPoly: function (l, ha, ns, ew) { return 'Field: ' + l + ' · ' + ha + ' ha. A box of about ' + ns + ' × ' + ew + ' km around the field (yellow line).'; },
    fGreen: function (o) {
      var one = function (s, g) { return g && g.gcc != null ? '<b>' + s + '</b> (' + g.date + '): <b>' + o.f(g.gcc) + '</b>, ' + g.validPct + '% of the field visible' : '<b>' + s + '</b>: ' + (g ? 'no valid pixels (clouds or no image)' : 'not measured'); };
      return '<h4>Visual greenness index inside the field (not NDVI)</h4><p>' + one('A', o.A) + ' · ' + one('B', o.B) + (o.diff != null ? ' · change from A to B: <b>' + (o.diff > 0 ? '+' : '') + o.diff + '%</b>' : '') + '.</p>' +
        '<p class="muted small">GCC index = green ÷ (red + green + blue), measured on the NASA HLS true-colour image inside the outline. Higher = greener. It is not NDVI and does not measure yield: it compares two dates of the same field. The field (' + o.f(o.ha).replace(/[.,]\d+$/, '') + ' ha) is about ' + o.n30 + ' pixels of 30 m' + (o.n30 < 30 ? '; it is small for this resolution and the value is unreliable' : '') + '. Clouds and no-data areas are discarded.</p>';
    },
    fAlt: function (s, d, l) { return 'NASA HLS true-colour image, date ' + s + ' (' + d + '), ' + l; },
    fLoading: function (s) { return 'Downloading image ' + s + ' from NASA GIBS…'; },
    fEmpty: function (s, d) { return 'No image ' + s + ' for ' + d + ': the satellite did not pass over this area that day. Try nearby days or the other satellite.'; },
    fFail: function (s) { return 'Could not download image ' + s + ': a connection is needed.'; },
    fSearching: function (s, d) { return 'No image ' + s + ' on ' + d + '. Looking for the nearest date…'; },
    fMoved: function (s, o, n, sat) { return 'Image ' + s + ': ' + sat + ' had no image on ' + o + '; showing the nearest one, ' + n + '.'; },
    fNone: function (s, d, sat) { return 'Image ' + s + ': ' + sat + ' has no images near ' + d + ' (8 days before or after). Try the other satellite or another date.'; },
    statDrop: function (a, b) { return 'drop in Paraguay’s soybean harvest in that drought (FAO)'; },
    statArea: 'of soybean in the Eastern Region (2022 Census)',
    statVal: 'modelled water shortfall against real yield (FAO)',
    valC1: 'correlation between the model’s water shortfall in the 5 top soybean departments and real soybean yield (−1 would be perfect)',
    valC2: 'of the worst real seasons that the model also flags as the driest',
    valC3: 'correlation of NASA POWER rain with ERA5, another source (Itapúa · Alto Paraná)',
    valX: 'water shortfall according to the model (mm)',
    valTip: function (d, a, y) { return d + ' mm deficit · yield ' + a + '% vs. trend (' + y + ' t/ha)'; },
    valAria: function (n, r) { return 'Scatter plot of ' + n + ' seasons: the model’s water deficit against Paraguay’s soybean yield anomaly. Correlation ' + r + '.'; },
    valText: function (o) { return 'Over ' + o.n + ' seasons, the more water soybean lacked according to the model, the worse Paraguay’s soybean yielded: <b>r = ' + o.r + '</b> (with heat days, r = ' + o.rh + '). The 5 worst real seasons were ' + o.worst + '; the model flags as the 5 driest ' + o.model + ': <b>' + o.hits + ' match</b>. The chance of matching that many at random is ' + o.p + '%. Without the 2021–22 drought, which weighs heavily, the correlation is r = ' + o.r21 + '. Repeated in each of the ' + o.zn + ' areas separately, it ranges from ' + o.zmax + ' to ' + o.zmin + ': the result does not hinge on a single area.'; },
    valCols: ['What is checked', 'Result', 'Status', 'Source'],
    valSt: { ok: 'Matches', partial: 'Partly matches', warn: 'Differs', none: 'No source' },
    valRainRow: function (z) { return 'Rain during the soybean cycle, ' + z; },
    valC4: 'correlation between the greenness NASA’s MODIS satellite measured in January and the model’s water shortfall (Itapúa · Alto Paraná); negative = they agree',
    valSatRow: function (z) { return 'MODIS satellite (January NDVI), ' + z; },
    valSatRes: function (r, n, low, v) { return 'r = ' + r + ' with the model’s deficit over ' + n + ' seasons. The least green January was ' + low + ' (NDVI ' + v + '). The satellite measures something other than POWER: it is an independent check.'; },
    valRainRes: function (r, p, e, n) { return 'r = ' + r + ' over ' + n + ' seasons. 2021–22 drought: NASA POWER ' + p + ' mm, ERA5 ' + e + ' mm.'; },
    valCalRow: function (c) { return c + ' calendar'; },
    valCal: {
      soja: 'The model sows on 11 October (11 September for early soybean) and harvests in January or February. Published: sowing from late August to early November, harvest from late December to March.',
      trigo: 'The model harvests by 10 October; FAO says harvest starts in September. The sowing date could not be checked.',
      maiz: 'Model scope: the farming year runs from 1 May to 30 April, so the second-crop maize in D is evaluated up to 30 April. FAO GIEWS describes its harvest as still under way in July and August; that last stretch is outside this version and is on the roadmap, so the frost risk of D may be somewhat higher than shown.',
      avena: 'We found no published black oat calendar for Paraguay.'
    },
    valLimits: function (r21) { return [
      'FAO yield is national; the model uses one point per department in the five that hold more than 87% of the soybean area (Alto Paraná, Canindeyú, Itapúa, San Pedro and Caaguazú).',
      'There are 23 seasons. A correlation does not prove cause: yield also depends on prices, pests and technology. That is why we use the anomaly from the trend.',
      'The 2021–22 drought weighs heavily on the result; without it, r = ' + r21 + '.',
      'ERA5 is another reanalysis from another centre (ECMWF): it is independent of NASA, but it is not a station measurement.',
      'This validates the soybean climate indicator, not each rotation’s score: there is no public yield data by rotation.'
    ]; },
    valSrc: 'Soybean yield and production:'
  });

  // ---------- Validación externa e impacto ----------
  var VAL = window.VALIDATION || null, valCache = null;
  function valNumbers() {
    if (valCache || !VAL) return valCache;
    // Los cinco departamentos con más soja (más del 87 % de la Región Oriental, CAN 2022).
    var TOP5 = ['altoparana', 'canindeyu', 'itapua', 'sanpedro', 'caaguazu'].filter(function (k) { return datasets[k] && datasets[k].source === 'cache'; });
    var v = E.yieldValidation(TOP5.map(function (k) { return datasets[k].agg; }), VAL.fao.yield_t_ha, 'arcilloso');
    if (!v) return null;
    v.nZones = TOP5.length;
    // Robustez: la misma prueba en cada zona guardada por separado.
    var per = Object.keys(datasets).filter(function (k) { return datasets[k].source === 'cache'; }).map(function (k) { var w = E.yieldValidation([datasets[k].agg], VAL.fao.yield_t_ha, 'arcilloso'); return w ? w.rDeficit : null; }).filter(function (x) { return x != null; });
    v.zoneR = { n: per.length, min: Math.min.apply(null, per), max: Math.max.apply(null, per) };
    var no21 = v.rows.filter(function (r) { return r.ay !== 2021; });
    v.rNo2021 = E.round(E.pearson(no21.map(function (r) { return r.def; }), no21.map(function (r) { return r.anom; })), 2);
    v.rain = ['itapua', 'altoparana'].filter(function (k) { return datasets[k] && VAL.era5.soyRain_mm[k]; }).map(function (k) {
      var agg = datasets[k].agg, er = VAL.era5.soyRain_mm[k], ys = fullYears(agg).filter(function (y) { return er[y] != null; });
      var pw = ys.map(function (y) { return agg[y].slice(16, 28).reduce(function (s, d) { return s + d.p; }, 0); });
      return { k: k, n: ys.length, r: E.round(E.pearson(pw, ys.map(function (y) { return er[y]; })), 2), p21: Math.round(pw[ys.indexOf('2021')]), e21: er['2021'] };
    });
    // Satélite: NDVI MODIS de enero (pico de la soja) frente al déficit del modelo, rotación base y suelo arcilloso.
    v.sat = VAL.modis ? ['itapua', 'altoparana'].filter(function (k) { return datasets[k] && VAL.modis.ndvi[k]; }).map(function (k) {
      var ev = E.evaluateAllYears(E.ROTATIONS[0], datasets[k].agg, 'arcilloso'), nd = VAL.modis.ndvi[k];
      var ys = Object.keys(nd).filter(function (y) { return ev[y] && ev[y].complete; });
      var low = ys.slice().sort(function (a, b) { return nd[a] - nd[b]; })[0];
      return { k: k, n: ys.length, r: E.round(E.pearson(ys.map(function (y) { return nd[y]; }), ys.map(function (y) { return ev[y].waterDeficit; })), 2), low: +low, lowV: nd[low] };
    }) : [];
    var P = VAL.fao.production_t;
    v.drop = P[2021] && P[2022] ? { from: P[2021], to: P[2022], pct: Math.round(100 * (P[2022] - P[2021]) / P[2021]) } : null;
    valCache = v;
    return v;
  }
  function num(v, d) { return (d == null ? String(v) : v.toFixed(d)).replace('.', lang === 'es' ? ',' : '.').replace(/^-/, '−'); }
  function renderValidation() {
    var t = T[lang], v = valNumbers();
    if (!v) { $('valCards').innerHTML = ''; $('valText').textContent = ''; return; }
    var camp = function (a) { return a + '–' + String(a + 1).slice(2); };
    $('valCards').innerHTML = [
      ['r = ' + num(v.rDeficit), t.valC1],
      [v.hits + ' / 5', t.valC2],
      [v.rain.map(function (x) { return num(x.r); }).join(' · '), t.valC3]
    ].concat(v.sat.length ? [[v.sat.map(function (x) { return num(x.r); }).join(' · '), t.valC4]] : []).concat([
    ]).map(function (c) { return '<div class="val-card"><b>' + c[0] + '</b><span>' + c[1] + '</span></div>'; }).join('');
    // Dispersión: déficit del modelo (x) frente a anomalía de rendimiento FAO (y).
    var W = 760, H = 296, pl = 46, pr = 14, pt = 12, pb = 50;
    var xs = v.rows.map(function (r) { return r.def; }), ys = v.rows.map(function (r) { return r.anom; });
    var xM = Math.ceil(Math.max.apply(null, xs) / 50) * 50, yLo = Math.floor(Math.min.apply(null, ys) / 10) * 10, yHi = Math.ceil(Math.max.apply(null, ys) / 10) * 10;
    var X = function (x) { return pl + (W - pl - pr) * x / xM; }, Y = function (y) { return pt + (H - pt - pb) * (yHi - y) / (yHi - yLo); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '">';
    for (var gy = yLo; gy <= yHi; gy += 10) s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(gy) + '" y2="' + Y(gy) + '" stroke="var(--line)"' + (gy === 0 ? ' stroke-width="2"' : '') + '/><text x="' + (pl - 6) + '" y="' + (Y(gy) + 4) + '" text-anchor="end">' + (gy > 0 ? '+' : '') + gy + '%</text>';
    for (var gx = 0; gx <= xM; gx += 50) s += '<text x="' + X(gx) + '" y="' + (H - pb + 18) + '" text-anchor="middle">' + gx + '</text>';
    s += '<text x="' + (W - pr) + '" y="' + (H - 4) + '" text-anchor="end" style="font-weight:600">' + t.valX + '</text>';
    v.rows.forEach(function (r) {
      var hl = v.worstYield.indexOf(r.ay) >= 0;
      s += '<circle cx="' + X(r.def) + '" cy="' + Y(r.anom) + '" r="' + (hl ? 7 : 5) + '" fill="var(--c-water)"' + (hl ? ' class="hl"' : '') + ' opacity=".9"><title>' + camp(r.ay) + ': ' + t.valTip(r.def, num(r.anom), num(r.y, 2)) + '</title></circle>';
      if (hl) s += '<text x="' + (X(r.def) + 10) + '" y="' + (Y(r.anom) + 4) + '" style="fill:var(--ink);font-weight:600">' + String(r.ay).slice(2) + '/' + String(r.ay + 1).slice(2) + '</text>';
    });
    $('valChart').innerHTML = s + '</svg>';
    $('valChart').setAttribute('aria-label', t.valAria(v.n, num(v.rDeficit)));
    $('valText').innerHTML = t.valText({ n: v.n, r: num(v.rDeficit), rh: num(v.rHeat), hits: v.hits, p: num(v.pChance * 100, 1), worst: v.worstYield.map(camp).join(', '), model: v.worstModel.map(camp).join(', '), r21: num(v.rNo2021), zn: v.zoneR.n, zmin: num(v.zoneR.min), zmax: num(v.zoneR.max) });
    var st = function (k) { return '<span class="st-' + (k === 'partial' ? 'ok' : k) + '">' + t.valSt[k] + '</span>'; };
    var link = function (src, url) { return src ? '<a href="' + url + '" target="_blank" rel="noopener">' + src + '</a>' : '—'; };
    var rowsH = v.rain.map(function (x) {
      return '<tr><td>' + t.valRainRow(x.k === 'itapua' ? 'Itapúa' : 'Alto Paraná') + '</td><td>' + t.valRainRes(num(x.r), x.p21, x.e21, x.n) + '</td><td>' + st(x.r >= 0.7 ? 'ok' : 'warn') + '</td><td>' + link('ERA5 / Open-Meteo', VAL.era5.url) + '</td></tr>';
    }).concat(v.sat.map(function (x) {
      return '<tr><td>' + t.valSatRow(x.k === 'itapua' ? 'Itapúa' : 'Alto Paraná') + '</td><td>' + t.valSatRes(num(x.r), x.n, camp(x.low), num(x.lowV, 2)) + '</td><td>' + st(x.r <= -0.6 ? 'ok' : 'partial') + '</td><td>' + link('MODIS MOD13Q1 / ORNL DAAC', VAL.modis.url) + '</td></tr>';
    })).concat((VAL.calendars || []).map(function (c) {
      return '<tr><td>' + t.valCalRow(cropName(c.crop)) + '</td><td>' + t.valCal[c.crop] + '</td><td>' + st(c.status) + '</td><td>' + link(c.source, c.url) + '</td></tr>';
    }));
    $('valTable').innerHTML = '<thead><tr>' + t.valCols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + rowsH.join('') + '</tbody>';
    $('valLimits').innerHTML = t.valLimits(num(v.rNo2021)).map(function (x) { return '<li>' + x + '</li>'; }).join('') +
      '<li>' + t.valSrc + ' <a href="' + VAL.fao.url + '" target="_blank" rel="noopener">FAO / Our World in Data</a>.</li>';
  }

  // ---------- Ver el campo: NASA HLS (30 m) vía GIBS, sin clave ----------
  // Dos fechas sobre el mismo recuadro, comparadas con un deslizador. Por defecto: sequía (24-ene-2022, Landsat)
  // frente a campaña lluviosa (3-ene-2024, Sentinel-2). Para Itapúa esas dos están guardadas y funcionan sin conexión.
  var FV = { A: { date: '2022-01-24', src: 'L30' }, B: { date: '2024-01-03', src: 'S30' } };
  var FV_LOCAL = { 'itapua|2022-01-24|L30': 'data/img/hls_itapua_2022-01-24_L30.jpg', 'itapua|2024-01-03|S30': 'data/img/hls_itapua_2024-01-03_S30.jpg' };
  var FV_HALF = 0.07; // medio lado del recuadro en grados (~15 km de lado)
  var fvUrls = {}, fvNotes = { A: '', B: '' }, fvMissing = { A: false, B: false }, fvSeq = 0, fvKey = '';
  function fvBox() {
    var k = $('loc').value, ds = datasets[k];
    if (ds.poly && ds.poly.length >= 3) {
      // Parcela delimitada: recuadro cuadrado en el terreno alrededor de ella, con 35 % de margen y al menos ~1 km de lado.
      var bb = E.polygonBBox(ds.poly), cLat = (bb.s + bb.n) / 2, cLon = (bb.w + bb.e) / 2, cosL = Math.max(Math.cos(cLat * Math.PI / 180), 0.05);
      var half = Math.max((bb.n - bb.s) / 2, (bb.e - bb.w) / 2 * cosL, 0.0045) * 1.35;
      return { k: k, ds: ds, s: cLat - half, n: cLat + half, w: cLon - half / cosL, e: cLon + half / cosL, poly: ds.poly };
    }
    return { k: k, ds: ds, s: ds.lat - FV_HALF, n: ds.lat + FV_HALF, w: ds.lon - FV_HALF, e: ds.lon + FV_HALF };
  }
  // Fechas por defecto fuera de Paraguay: pleno verano del hemisferio (mitad del ciclo de la soja de la plantilla),
  // último año completo frente al anterior. En Paraguay se conservan la sequía de 2022 y enero de 2024.
  var fvDsKey = null;
  function fvDefaults(b) {
    if (fvDsKey === b.k) return;
    fvDsKey = b.k;
    if (b.ds.local) { if (!FV._user) { FV.A = { date: '2022-01-24', src: 'L30' }; FV.B = { date: '2024-01-03', src: 'S30' }; } return; }
    var now = new Date(), y = now.getUTCFullYear(), md = b.ds.hemi === 'N' ? '-07-10' : '-01-10';
    var last = (y + md) <= now.toISOString().slice(0, 10) ? y : y - 1;
    FV.A = { date: (last - 1) + md, src: 'S30' }; FV.B = { date: last + md, src: 'S30' }; FV._user = false;
  }
  // Verdor visible dentro de la parcela, medido sobre la imagen ya cargada (ver engine.greenStats).
  var fvGreen = { A: null, B: null };
  function fvMeasure(s) {
    var b = fvBox(), img = $('fv' + s);
    fvGreen[s] = null;
    if (b.poly && img.complete && img.naturalWidth) {
      try {
        var N = 256, c = document.createElement('canvas'); c.width = c.height = N;
        var cx = c.getContext('2d'); cx.drawImage(img, 0, 0, N, N);
        var px = cx.getImageData(0, 0, N, N).data;
        fvGreen[s] = E.greenStats(px, N, N, function (x, y) { return E.pointInPolygon(b.n - (y + 0.5) / N * (b.n - b.s), b.w + (x + 0.5) / N * (b.e - b.w), b.poly); });
        fvGreen[s].date = FV[s].date;
      } catch (e) { fvGreen[s] = null; } // p. ej. página abierta como archivo local: el navegador no deja leer los píxeles
    }
    fvShowGreen();
  }
  function fvShowGreen() {
    var t = T[lang], b = fvBox(), box = $('fvGreen');
    if (!b.poly) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    var A = fvGreen.A, B = fvGreen.B, ha = b.ds.ha || E.polygonAreaHa(b.poly);
    box.innerHTML = t.fGreen({ A: A, B: B, ha: ha, n30: Math.round(ha / 0.09), f: function (v) { return num(v, 3); },
      diff: A && B && A.gcc != null && B.gcc != null ? Math.round(100 * (B.gcc - A.gcc) / A.gcc) : null });
  }
  function fvUrl(b, f) {
    return 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=HLS_' + f.src +
      '_Nadir_BRDF_Adjusted_Reflectance&CRS=EPSG:4326&BBOX=' + [b.s, b.w, b.n, b.e].map(function (x) { return x.toFixed(4); }).join(',') +
      '&WIDTH=512&HEIGHT=512&FORMAT=image/jpeg&TIME=' + f.date;
  }
  function fvShowNotes() {
    $('fvMsg').textContent = [fvNotes.A, fvNotes.B].filter(Boolean).join(' ');
    // Si falta una imagen, el motivo se escribe dentro del recuadro y no solo debajo.
    var miss = ['A', 'B'].filter(function (s) { return fvMissing[s]; }).map(function (s) { return fvNotes[s]; });
    $('fvEmpty').hidden = !miss.length; $('fvEmpty').textContent = miss.join(' ');
  }
  function isoShift(date, d) { var x = new Date(date + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); }
  // Sondeo barato (128 px): una imagen vacía de GIBS pesa unos 380 bytes y una real, más de 4.000.
  function fvProbe(b, src, date) {
    var u = fvUrl(b, { src: src, date: date }).replace('WIDTH=512&HEIGHT=512', 'WIDTH=128&HEIGHT=128');
    return fetch(u).then(function (r) { return r.ok ? r.blob() : null; }).then(function (bl) { return !!bl && bl.size > 1000; }).catch(function () { return false; });
  }
  // Fecha con imagen más cercana (hasta 8 días antes o después; Landsat vuelve a pasar cada 16 días).
  function fvNearest(b, src, date) {
    var today = new Date().toISOString().slice(0, 10), cands = [];
    for (var d = 1; d <= 8; d++) [-d, d].forEach(function (k) { var x = isoShift(date, k); if (x >= '2015-12-01' && x <= today) cands.push(x); });
    return Promise.all(cands.map(function (x) { return fvProbe(b, src, x).then(function (ok) { return ok ? x : null; }); }))
      .then(function (r) { r = r.filter(Boolean); return r.length ? r[0] : null; }); // ordenadas por cercanía; a igual distancia, la anterior
  }
  function fvLoad(b, s, seq, t) {
    var f = FV[s], img = $('fv' + s), satName = f.src === 'L30' ? 'Landsat' : 'Sentinel-2';
    var get = function (date) { return fetch(fvUrl(b, { src: f.src, date: date })).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); }); };
    var show = function (bl, date) {
      if (fvUrls[s]) URL.revokeObjectURL(fvUrls[s]);
      fvUrls[s] = URL.createObjectURL(bl); img.alt = t.fAlt(s, date, placeLabel(b.ds)); img.src = fvUrls[s]; fvMissing[s] = false;
    };
    var missing = function (note) { img.removeAttribute('src'); img.alt = ''; fvMissing[s] = true; fvNotes[s] = note; fvGreen[s] = null; fvShowGreen(); };
    return get(f.date).then(function (bl) {
      if (seq !== fvSeq) return;
      if (bl.size >= 3000) { show(bl, f.date); fvNotes[s] = ''; return; }
      fvNotes[s] = t.fSearching(s, f.date); fvShowNotes();
      return fvNearest(b, f.src, f.date).then(function (near) {
        if (seq !== fvSeq) return;
        if (!near) { missing(t.fNone(s, f.date, satName)); return; }
        return get(near).then(function (bl2) {
          if (seq !== fvSeq) return;
          var orig = f.date; f.date = near;
          fvKey = fvKeyOf(b); // la fecha cambió sola: no volver a descargar
          $('fvDate' + s).value = near; $('fvTag' + s).textContent = s + ' · ' + near + ' · ' + satName;
          show(bl2, near); fvNotes[s] = t.fMoved(s, orig, near, satName);
        });
      });
    }).catch(function () { if (seq === fvSeq) missing(t.fFail(s)); }).then(function () { if (seq === fvSeq) fvShowNotes(); });
  }
  function fvSetSlider(p) {
    p = Math.max(0, Math.min(100, p));
    $('fvSlider').value = p;
    $('fvTop').style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
    $('fvLine').style.left = p + '%';
  }
  function fvKeyOf(b) { return [b.k, b.s.toFixed(5), b.w.toFixed(5), b.n.toFixed(5), FV.A.date + FV.A.src, FV.B.date + FV.B.src].join('|'); }
  function renderField(force) {
    if (view !== 'field' && !force) return; // solo se descarga cuando la vista está abierta
    var t = T[lang], b = fvBox();
    fvDefaults(b);
    // Contorno de la parcela sobre las dos imágenes.
    var sv = $('fvPoly');
    if (b.poly) {
      sv.innerHTML = '<polygon points="' + b.poly.map(function (p) { return ((p[1] - b.w) / (b.e - b.w) * 100).toFixed(2) + ',' + ((b.n - p[0]) / (b.n - b.s) * 100).toFixed(2); }).join(' ') + '"/>';
      sv.style.display = '';
    } else { sv.innerHTML = ''; sv.style.display = 'none'; }
    $('fvSwipe').classList.toggle('has-poly', !!b.poly);
    ['A', 'B'].forEach(function (s) {
      $('fvDate' + s).value = FV[s].date; $('fvSrc' + s).value = FV[s].src;
      $('fvTag' + s).textContent = s + ' · ' + FV[s].date + ' · ' + (FV[s].src === 'L30' ? 'Landsat' : 'Sentinel-2');
    });
    $('fvDateA').max = $('fvDateB').max = new Date().toISOString().slice(0, 10);
    var kmNSr = (b.n - b.s) * 111.32, kmEWr = (b.e - b.w) * 111.32 * Math.cos((b.n + b.s) / 2 * Math.PI / 180);
    var kmf = function (v) { return v >= 5 ? String(Math.round(v)) : num(Math.round(v * 10) / 10, 1); };
    $('fvInfo').textContent = b.poly ? t.fInfoPoly(placeLabel(b.ds), num(b.ds.ha || E.polygonAreaHa(b.poly), 1), kmf(kmNSr), kmf(kmEWr))
      : t.fInfo(placeLabel(b.ds), b.ds.lat, b.ds.lon, kmf(kmNSr), kmf(kmEWr));
    fvShowGreen();
    $('fvWorldview').href = 'https://worldview.earthdata.nasa.gov/?v=' + [b.w, b.s, b.e, b.n].map(function (x) { return x.toFixed(3); }).join(',') +
      '&l=HLS_S30_Nadir_BRDF_Adjusted_Reflectance,HLS_L30_Nadir_BRDF_Adjusted_Reflectance&t=' + FV.B.date + '-T00:00:00Z';
    var key = fvKeyOf(b);
    if (key === fvKey) { fvShowNotes(); return; }
    fvKey = key;
    var seq = ++fvSeq;
    ['A', 'B'].forEach(function (s) {
      var f = FV[s], img = $('fv' + s), local = b.poly ? null : FV_LOCAL[b.k + '|' + f.date + '|' + f.src];
      img.alt = t.fAlt(s, f.date, placeLabel(b.ds));
      fvMissing[s] = false;
      if (local) { img.src = local; fvNotes[s] = ''; return; }
      fvNotes[s] = t.fLoading(s);
      fvLoad(b, s, seq, t);
    });
    fvShowNotes();
  }

  // ---------- Vistas y barra lateral ----------
  var VIEWS = ['home', 'field', 'dna', 'compare', 'replay', 'agenda', 'passport', 'parcels', 'devices'], view = 'home';
  function showView(v, noFocus) {
    if (VIEWS.indexOf(v) < 0) v = 'home';
    view = v;
    if (v === 'field') renderField(true);
    if (v === 'field' || v === 'compare') setTimeout(zmApply, 0); // el mapa recién tiene tamaño cuando la vista es visible
    VIEWS.forEach(function (x) { $('v-' + x).hidden = x !== v; });
    document.querySelectorAll('.nav-i[data-view]').forEach(function (b) {
      if (b.dataset.view === v) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    closeMenu();
    window.scrollTo(0, 0);
    if (!noFocus) { var h = $('v-' + v).querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    try { document.dispatchEvent(new CustomEvent('rl:view', { detail: v })); } catch (e) { /* idem */ }
  }
  function closeMenu() { $('side').classList.remove('open'); $('menuBtn').setAttribute('aria-expanded', 'false'); $('menuBtn').setAttribute('aria-label', T[lang].menuOpen); }
  function setCollapsed(c) {
    $('shell').classList.toggle('collapsed', c);
    $('sideCollapse').setAttribute('aria-label', c ? T[lang].expand : T[lang].collapse);
    try { localStorage.setItem('rl-side', c ? '1' : '0'); } catch (e) { /* almacenamiento bloqueado */ }
  }

  // ---------- Agenda y clima ----------
  // Dekada k del año agrícola (0 = 1–10 de mayo) -> fecha de inicio o de fin.
  // El mes sale del hemisferio de la zona elegida (mayo en el sur, noviembre en el norte).
  function dekStart(k) { return { m: monthIdx(k), d: [1, 11, 21][k % 3] }; }
  function dekEnd(k) { var m = monthIdx(k); return { m: m, d: [10, 20, [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]][k % 3] }; }
  function fmtD(x) { return x.d + ' ' + MONTHS[lang][x.m]; }
  // Campañas en que hubo al menos un día con `key` (calor o helada) entre las dekadas a y b. Datos observados.
  function riskYears(agg, a, b, key) {
    var ys = fullYears(agg), n = 0;
    ys.forEach(function (y) { for (var k = a; k <= b; k++) if (agg[y][k][key] > 0) { n++; return; } });
    return { n: n, of: ys.length };
  }
  // Resumen mes por mes (mayo a abril) de los años completos.
  function monthStats(agg) {
    var ys = fullYears(agg), out = [];
    for (var mi = 0; mi < 12; mi++) {
      var rain = [], fr = 0, ht = 0;
      ys.forEach(function (y) {
        var d = agg[y].slice(mi * 3, mi * 3 + 3);
        rain.push(d.reduce(function (s, x) { return s + x.p; }, 0));
        if (d.some(function (x) { return x.frost > 0; })) fr++;
        if (d.some(function (x) { return x.heat > 0; })) ht++;
      });
      out.push({ m: monthIdx(mi * 3), rain: Math.round(E.percentile(rain, 0.5)), frost: fr, heat: ht, n: ys.length });
    }
    return out;
  }
  var agRotSel = null;
  function renderAgenda(ds) {
    var t = T[lang], list = rots(), top = helpCtx && helpCtx.rows[0] ? helpCtx.rows[0].id : list[0].id;
    if (!agRotSel || !list.some(function (r) { return r.id === agRotSel; })) agRotSel = top;
    $('agRot').innerHTML = list.map(function (r) { return '<option value="' + r.id + '"' + (r.id === agRotSel ? ' selected' : '') + '>' + r.id + ' · ' + rotName(r) + (r.id === top ? t.agTop : '') + '</option>'; }).join('');
    $('agZone').textContent = t.agZone(placeLabel(ds), ds.lat, ds.lon);
    var R = list.filter(function (r) { return r.id === agRotSel; })[0], ev = [];
    R.crops.forEach(function (c) {
      var crop = E.CROPS[c.crop], name = cropName(c.crop), curve = E.kcCurve(crop, c.len);
      var win = function (stage) { var a = -1, b = -1; curve.forEach(function (s, i) { if (s.stage === stage) { if (a < 0) a = i; b = i; } }); return a < 0 ? null : [c.start + a, c.start + b]; };
      var dates = function (w) { return fmtD(dekStart(w[0])) + ' – ' + fmtD(dekEnd(w[1])); };
      ev.push({ k: c.start, cls: 'sow', date: fmtD(dekStart(c.start)), what: t.agSow(name) });
      if (crop.sensitive.indexOf('heat') >= 0) {
        var wh = win('media');
        if (wh) { var rh = riskYears(ds.agg, wh[0], wh[1], 'heat'); ev.push({ k: wh[0], cls: 'crit', date: dates(wh), what: t.agHeat(name), risk: t.agHeatRisk(rh.n, rh.of), hi: rh.n * 2 >= rh.of }); }
      }
      if (crop.sensitive.indexOf('frost') >= 0) {
        (crop.frostStages || ['media']).forEach(function (st) {
          var wf = win(st);
          if (wf) { var rf = riskYears(ds.agg, wf[0], wf[1], 'frost'); ev.push({ k: wf[0] + 0.1, cls: 'crit', date: dates(wf), what: t.agFrost(name, st), risk: t.agFrostRisk(rf.n, rf.of), hi: rf.n * 2 >= rf.of }); }
        });
      }
      ev.push({ k: c.start + c.len - 0.5, cls: 'harv', date: fmtD(dekEnd(c.start + c.len - 1)), what: t.agHarv(name, crop.grain) });
    });
    ev.sort(function (a, b) { return a.k - b.k; });
    $('agEvents').innerHTML = ev.map(function (e) {
      return '<li class="' + e.cls + '"><span class="ag-date">' + e.date + '</span><span class="ag-what">' + e.what + '</span>' + (e.risk ? '<span class="ag-risk' + (e.hi ? ' hi' : '') + '">' + e.risk + '</span>' : '') + '</li>';
    }).join('');
    var ms = monthStats(ds.agg);
    $('agMonths').innerHTML = '<thead><tr><th></th>' + ms.map(function (x) { return '<th>' + MONTHS[lang][x.m] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      '<tr><td>' + t.agRows[0] + '</td>' + ms.map(function (x) { return '<td>' + x.rain + '</td>'; }).join('') + '</tr>' +
      '<tr><td>' + t.agRows[1] + '</td>' + ms.map(function (x) { return '<td' + (x.frost * 4 >= x.n ? ' class="cold"' : '') + '>' + x.frost + '/' + x.n + '</td>'; }).join('') + '</tr>' +
      '<tr><td>' + t.agRows[2] + '</td>' + ms.map(function (x) { return '<td' + (x.heat * 2 >= x.n ? ' class="hot"' : '') + '>' + x.heat + '/' + x.n + '</td>'; }).join('') + '</tr></tbody>';
    var en = helpCtx && helpCtx.enso;
    $('agEnso').textContent = ONI && en ? t.agEnso({ latest: en.latest, phase: t.phase[en.latestPhase], nino: en.nino }) : '';
  }

  // ---------- Mis parcelas (solo en este dispositivo) ----------
  var PKEY = 'rl-parcels';
  function loadParcels() { try { var a = JSON.parse(localStorage.getItem(PKEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function saveParcels(a) { try { localStorage.setItem(PKEY, JSON.stringify(a)); return true; } catch (e) { return false; } }
  function currentConfig() {
    var k = $('loc').value, ds = datasets[k];
    var c = { loc: k, label: ds.label, lat: ds.lat, lon: ds.lon, soil: $('soil').value, excl: LIMITS.filter(function (x) { return excluded[x]; }) };
    if (ds.poly) { c.poly = ds.poly; c.ha = ds.ha; }
    return c;
  }
  function describeConfig(p) {
    var t = T[lang];
    return t.pDesc({ place: placeLabel(p) + ' (' + p.lat + ', ' + p.lon + ')' + (p.poly && p.ha ? ' · ' + num(p.ha, 1) + ' ha' : ''), soil: E.SOILS[p.soil] ? soilName(p.soil).toLowerCase() : p.soil,
      excl: (p.excl || []).map(function (k) { return t.limits[k] ? t.limits[k].toLowerCase() : k; }).join(', ') });
  }
  function addParcel(name, cfg) {
    var a = loadParcels();
    a.push(Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name, created: new Date().toISOString() }, cfg));
    var ok = saveParcels(a); renderParcels(); return ok;
  }
  function renderParcelInfo() { $('pCurrent').textContent = T[lang].pCurrent(describeConfig(currentConfig())); }
  function renderParcels() {
    var t = T[lang], a = loadParcels();
    $('pList').innerHTML = a.length ? a.map(function (p) {
      return '<li><div><b>' + esc(p.name) + '</b><br><span class="muted small">' + esc(describeConfig(p)) + '</span></div><div class="p-actions"><button type="button" data-use="' + esc(p.id) + '">' + t.pUse + '</button><button type="button" class="ghost" data-del="' + esc(p.id) + '">' + t.pDel + '</button></div></li>';
    }).join('') : '<li class="muted">' + t.pEmpty + '</li>';
    if ($('loc').options.length) fillLocations($('loc').value);
  }
  function applyConfig(p) {
    excluded = {}; (p.excl || []).forEach(function (k) { if (LIMITS.indexOf(k) >= 0) excluded[k] = true; }); renderLimits();
    if (E.SOILS[p.soil]) $('soil').value = p.soil;
    var extra = validPoly(p.poly) ? { poly: p.poly, ha: E.polygonAreaHa(p.poly) } : null;
    if (datasets[p.loc]) { if (extra) Object.assign(datasets[p.loc], extra); pending = null; $('loc').value = p.loc; fillScenarios(); fillBuilder(); render(); return Promise.resolve(p.loc); }
    return fetchPoint(+p.lat, +p.lon, p.label, extra);
  }
  // Un contorno guardado o importado se acepta solo si son 3 a 200 vértices con coordenadas válidas.
  function validPoly(poly) {
    return Array.isArray(poly) && poly.length >= 3 && poly.length <= 200 && poly.every(function (q) {
      return Array.isArray(q) && q.length === 2 && isFinite(q[0]) && isFinite(q[1]) && Math.abs(q[0]) <= 90 && Math.abs(q[1]) <= 180;
    });
  }
  // Analizar una parcela delimitada: clima de la celda de NASA POWER que contiene su centro + imágenes de 30 m de su contorno.
  function analyzeParcel(name, poly) {
    if (!validPoly(poly)) return Promise.reject(new Error(lang === 'es' ? 'contorno no válido' : 'invalid outline'));
    var c = E.polygonCentroid(poly), ha = E.polygonAreaHa(poly);
    var label = String(name || '').trim().slice(0, 40) || (lang === 'es' ? 'Mi parcela' : 'My field');
    return fetchPoint(c[0], c[1], label, { poly: poly.map(function (q) { return [+(+q[0]).toFixed(6), +(+q[1]).toFixed(6)]; }), ha: ha, parcel: true }).then(function (id) {
      addParcel(label, currentConfig());
      return id;
    });
  }

  // ---------- Asistente guiado (reglas, sin IA) ----------
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function has(s, w) { return new RegExp('(^|[^a-z])' + w + '([^a-z]|$)').test(s); }
  // Coordenadas aproximadas del centro de cada ciudad (la celda de POWER mide unos 50 km). k = punto guardado en la caché.
  var GAZ = [
    { n: ['itapua', 'hohenau', 'obligado', 'bella vista'], label: 'Itapúa', k: 'itapua' },
    { n: ['alto parana', 'santa rita'], label: 'Alto Paraná', k: 'altoparana' },
    { n: ['encarnacion'], label: 'Encarnación', lat: -27.33, lon: -55.87 },
    { n: ['ciudad del este', 'cde'], label: 'Ciudad del Este', lat: -25.51, lon: -54.61 },
    { n: ['hernandarias'], label: 'Hernandarias', lat: -25.40, lon: -54.64 },
    { n: ['asuncion'], label: 'Asunción', lat: -25.28, lon: -57.63 },
    { n: ['san lorenzo'], label: 'San Lorenzo', lat: -25.34, lon: -57.51 },
    { n: ['luque'], label: 'Luque', lat: -25.27, lon: -57.49 },
    { n: ['capiata'], label: 'Capiatá', lat: -25.36, lon: -57.44 },
    { n: ['central'], label: 'Central (San Lorenzo)', lat: -25.34, lon: -57.51 },
    { n: ['cordillera', 'caacupe'], label: 'Caacupé (Cordillera)', lat: -25.39, lon: -57.14 },
    { n: ['paraguari'], label: 'Paraguarí', lat: -25.62, lon: -57.15 },
    { n: ['coronel oviedo'], label: 'Coronel Oviedo', lat: -25.45, lon: -56.44 },
    { n: ['caaguazu'], label: 'Caaguazú', k: 'caaguazu' },
    { n: ['villarrica', 'guaira'], label: 'Villarrica (Guairá)', lat: -25.78, lon: -56.45 },
    { n: ['caazapa'], label: 'Caazapá', k: 'caazapa' },
    { n: ['misiones'], label: 'Misiones', k: 'misiones' },
    { n: ['san juan bautista'], label: 'San Juan Bautista (Misiones)', lat: -26.67, lon: -57.15 },
    { n: ['pilar', 'neembucu'], label: 'Pilar (Ñeembucú)', lat: -26.86, lon: -58.30 },
    { n: ['concepcion'], label: 'Concepción', lat: -23.41, lon: -57.43 },
    { n: ['san pedro'], label: 'San Pedro', k: 'sanpedro' },
    { n: ['amambay'], label: 'Amambay', k: 'amambay' },
    { n: ['pedro juan caballero'], label: 'Pedro Juan Caballero (Amambay)', lat: -22.55, lon: -55.73 },
    { n: ['canindeyu'], label: 'Canindeyú', k: 'canindeyu' },
    { n: ['salto del guaira'], label: 'Salto del Guairá (Canindeyú)', lat: -24.06, lon: -54.31 },
    { n: ['chaco', 'filadelfia', 'loma plata', 'neuland', 'boqueron', 'presidente hayes', 'villa hayes', 'alto paraguay'], label: 'Chaco', occ: true }
  ];
  var GAZ_NAMES = [];
  GAZ.forEach(function (g) { g.n.forEach(function (n) { GAZ_NAMES.push({ n: n, g: g }); }); });
  GAZ_NAMES.sort(function (a, b) { return b.n.length - a.n.length; }); // "salto del guaira" antes que "guaira"
  function findPlace(s) { for (var i = 0; i < GAZ_NAMES.length; i++) if (has(s, GAZ_NAMES[i].n)) return GAZ_NAMES[i].g; return null; }
  var CROPW = { soja: ['soja', 'soya', 'soybean', 'soybeans', 'soy'], trigo: ['trigo', 'wheat'], maiz: ['maiz', 'zafrina', 'zafrinha', 'maize', 'corn'], avena: ['avena', 'oat', 'oats'],
    girasol: ['girasol', 'sunflower'], canola: ['canola', 'colza', 'rapeseed'], sorgo: ['sorgo', 'sorghum'], sesamo: ['sesamo', 'sesame'], poroto: ['poroto', 'porotos', 'frijol', 'frejol', 'beans'] };
  var OTHER = ['tomate', 'tomates', 'mandioca', 'algodon', 'cana', 'chia', 'arroz', 'yerba', 'hortaliza', 'hortalizas', 'frutilla', 'naranja', 'banana', 'locote', 'cebolla', 'papa', 'tomato', 'tomatoes', 'cassava', 'cotton', 'sugarcane', 'rice', 'vegetables'];
  var NEG = /(^|[^a-z])(no|sin|nunca|ni|without|not|cant|cannot|dont)([^a-z]|$)/;
  // Cultivos nombrados, separando los negados ("no siembro trigo") de los afirmados.
  function findCrops(s) {
    var out = { pos: [], neg: [] };
    Object.keys(CROPW).forEach(function (k) {
      CROPW[k].forEach(function (w) {
        var re = new RegExp('(^|[^a-z])' + w + '([^a-z]|$)', 'g'), m;
        while ((m = re.exec(s))) {
          var before = s.slice(Math.max(0, m.index - 30), m.index + 1).split(/[.,;!?]| y | and | pero | but /).pop();
          var list = NEG.test(before) ? out.neg : out.pos;
          if (list.indexOf(k) < 0) list.push(k);
        }
      });
    });
    out.early = /(no|sin|not|cant|dont)[^.,;]{0,30}(septiembre|temprana|temprano|september|early)/.test(s);
    return out;
  }
  function findOther(s) { return OTHER.filter(function (w) { return has(s, w); }); }
  function findSoil(s) {
    if (/(^|[^a-z])(arena|arenos[oa]|sandy|sand)/.test(s)) return 'arenoso';
    if (/(^|[^a-z])(franco|loam)/.test(s)) return 'franco';
    if (/(^|[^a-z])(arcill|clay)/.test(s)) return 'arcilloso';
    return null;
  }
  function findPrio(s) {
    if (!/(cuidar|importa|priori|prefiero|me preocupa mas|protect|priority|matters|care about)/.test(s)) return null;
    if (/(agua|water)/.test(s)) return 'water';
    if (/(suelo|soil)/.test(s)) return 'soil';
    if (/(cosech|harvest|rinde|plata|money)/.test(s)) return 'harvest';
    return null;
  }
  function findIntent(s, prioUsed) {
    var tests = [
      ['why', /(por que (gano|gana|quedo|queda|salio)|why did|why does)/],
      ['enso', /(^|[^a-z])(nino|nina|enso|oni)([^a-z]|$)/],
      ['rotate', /(por que rotar|para que rotar|cubrir el suelo|cultivo de cobertura|why rotate|cover crop)/],
      ['frost', /(helada|frio|frost|cold)/],
      ['heat', /(calor|ola de calor|temperatura alta|heat)/],
      ['agenda', /(agenda|calendario|cuando (siembr|sembr|cosech)|fechas|planner|calendar|when (to|should i) sow|show my planner)/],
      ['devices', /(sensor|riego|regar|bomba|domotic|dispositiv|irrigat|pump|device)/],
      ['field', /(ver (mi|el) campo|imagen satelital|imagenes satelitales|satelite|desde el espacio|field view|satellite)/],
      ['trust', /(confi|que tan segur|es segur|trust|how sure)/],
      ['terms', /(que significa|glosario|terminos|what does .* mean|glossary)/],
      ['limitsQ', /(que no (me )?dice|que no hace|what does .* not)/],
      ['drought', prioUsed ? /(sequia|seca|drought)/ : /(sequia|seca|falta de agua|agua|lluvia|llueve|drought|rain|water)/],
      ['compare', /(compar|rotacion|conviene|que siembr|que sembr|mejor opcion|recomend|rotation|which crop|best option)/],
      ['thanks', /(gracias|thank)/],
      ['help', /(ayuda|que puedes|que haces|help|what can you)/],
      ['greet', /^(hola|buen|buenas|hello|hi|hey)([^a-z]|$)/]
    ];
    for (var i = 0; i < tests.length; i++) if (tests[i][1].test(s)) return tests[i][0];
    return null;
  }
  function monthList(key) {
    var ds = datasets[$('loc').value], ms = monthStats(ds.agg);
    return { n: ms[0].n, list: ms.filter(function (x) { return x[key] > 0; }).map(function (x) { return MONTHS_FULL[lang][x.m] + ' (' + x[key] + ' de ' + x.n + ')'; }).join(', ').replace(/ de /g, lang === 'en' ? ' of ' : ' de ') };
  }
  function zoneSummary() {
    var c = helpCtx, t = T[lang];
    if (!c || !c.soy) return '';
    var top = c.rows[0], w = c.soy.worst;
    return t.bot.zone({ place: esc(placeLabel(datasets[$('loc').value])), short: c.soy.short, n: c.soy.n, worst: w.y + '–' + String(+w.y + 1).slice(2), p: w.p, etc: w.etc, name: c.name(top.id), w: c.sw.wins[top.id] }) +
      (rainAdj ? '<p>' + t.simNote(rainAdj) + '</p>' : '');
  }

  var reg = null; // registro de parcela en curso: { place, soil, limits, step }
  function chatAdd(who, html, acts) {
    var d = document.createElement('div');
    d.className = 'msg ' + who;
    d.innerHTML = html + (acts && acts.length ? '<div class="acts">' + acts.map(function (a) { return '<button type="button" class="ghost" data-act="' + a + '">' + T[lang].bot.acts[a] + '</button>'; }).join('') + '</div>' : '');
    $('chatLog').appendChild(d);
    $('chatLog').scrollTop = $('chatLog').scrollHeight;
    return d;
  }
  function setChips(list) {
    $('chatChips').innerHTML = (list || []).map(function (c) { return '<button type="button">' + esc(c) + '</button>'; }).join('');
  }
  function chatGreet() { $('chatLog').innerHTML = ''; reg = null; chatAdd('bot', T[lang].bot.hello); setChips(T[lang].bot.chipsStart); }

  function askNext(out) {
    var b = T[lang].bot;
    if (!reg.place) { reg.step = 'place'; out.push(b.askPlace); return { acts: ['map'], chips: b.chipsPlace(placeLabel(datasets[$('loc').value]).split(' (')[0]) }; }
    if (!reg.soil) { reg.step = 'soil'; out.push(b.askSoil); return { chips: b.chipsSoil }; }
    if (!reg.limits) { reg.step = 'limits'; out.push(b.askLimits); return { chips: b.chipsLimits }; }
    var cfg = currentConfig(), name = String(cfg.label).split(' (')[0] + ' · ' + soilName(cfg.soil).toLowerCase();
    var ok = addParcel(name, cfg);
    reg = null;
    out.push(ok ? b.saved(esc(name), esc(describeConfig(cfg))) : b.saveFail);
    out.push(zoneSummary());
    return { acts: ['compare', 'agenda', 'parcels'], chips: b.chipsNext };
  }

  function answer(raw) {
    var t = T[lang], b = t.bot, s = norm(raw), out = [];
    var place = findPlace(s), crops = findCrops(s), other = findOther(s), soil = findSoil(s), prio = findPrio(s);
    if (/(registr|guardar|anotar|agregar|register|save my|save the)/.test(s) && !reg) reg = {};
    var changed = false;
    // 1. Datos que el productor menciona: suelo, limitaciones y prioridades.
    if (soil) { $('soil').value = soil; out.push(b.soilSet(soilName(soil))); changed = true; if (reg) reg.soil = true; }
    if (reg && reg.step === 'soil' && !soil && /(no se|no lo se|ni idea|not sure|dont know|no idea)/.test(s)) { $('soil').value = 'arcilloso'; reg.soil = true; out.push(b.soilAssumed); changed = true; }
    var ex = crops.neg.filter(function (k) { return LIMITS.indexOf(k) >= 0; });
    if (crops.early) ex.push('early');
    if (ex.length) { ex.forEach(function (k) { excluded[k] = true; }); renderLimits(); changed = true; out.push(b.limitsSet(ex.map(function (k) { return t.limits[k].toLowerCase(); }).join(', '))); if (reg) reg.limits = true; }
    var back = crops.pos.filter(function (k) { return LIMITS.indexOf(k) >= 0 && excluded[k]; });
    if (back.length && !ex.length) { back.forEach(function (k) { excluded[k] = false; }); renderLimits(); changed = true; out.push(b.limitsBack(back.map(function (k) { return t.limits[k].toLowerCase(); }).join(', '))); }
    if (crops.neg.indexOf('soja') >= 0 && !crops.early) out.push(b.soyExcl);
    if (reg && reg.step === 'limits' && !ex.length && /^(nada|ninguno|ninguna|no|nothing|none|no thanks)([^a-z]|$)/.test(s)) { reg.limits = true; out.push(b.limitsNone); }
    if (prio) { weights = Object.assign({}, PRESETS[prio]); buildWeights(); changed = true; out.push(b.prioSet(t.presets[prio])); }
    if (reg && reg.step === 'place' && /(zona actual|esta zona|^usar |current area|this area|^use )/.test(s) && !place) reg.place = true;
    var intent = findIntent(s, !!prio);

    // 2. Lugar: de la caché al instante, o descarga en vivo de NASA POWER.
    if (place && place.occ) { if (changed) render(); return Promise.resolve({ html: out.concat([b.chaco]), acts: ['map'], chips: b.chipsStart }); }
    var p;
    if (place && place.k) { pending = null; $('loc').value = place.k; fillScenarios(); render(); p = Promise.resolve(true); }
    else if (place) {
      if (changed) render();
      var wait = chatAdd('bot typing', b.fetching(esc(place.label)));
      p = fetchPoint(place.lat, place.lon, place.label).then(function () { wait.remove(); return true; }, function (e) { wait.remove(); out.push(b.fetchFail(esc(place.label), esc(e.message))); return false; });
    } else { if (changed) render(); p = Promise.resolve(false); }

    return p.then(function (placeOk) {
      var res = { acts: [], chips: null };
      // Una pregunta a mitad del registro se responde, y después se retoma la pregunta pendiente.
      var QUESTIONS = ['why', 'enso', 'rotate', 'frost', 'heat', 'agenda', 'devices', 'trust', 'terms', 'limitsQ', 'drought', 'field'];
      var flowQuestion = !!reg && !place && !soil && !ex.length && !prio && QUESTIONS.indexOf(intent) >= 0;
      if (reg && !flowQuestion) {
        if (placeOk) { reg.place = true; out.unshift(b.placeSet(esc(placeLabel(datasets[$('loc').value])))); }
        if (other.length) out.unshift(b.otherShort(esc(other.join(', '))));
        if (reg.step === 'place' && !place && !reg.place) { out.push(b.placeNotFound); res.acts = ['map']; return Object.assign(res, { html: out }); }
        var nx = askNext(out);
        return Object.assign(res, nx, { html: out });
      }
      if (other.length && !crops.pos.length) { out.push(b.otherCrop(esc(other.join(', ')))); res.acts = ['agenda']; res.chips = b.chipsNext; return Object.assign(res, { html: out }); }
      var gen = crops.pos.filter(function (k) { return E.CROPS[k] && E.CROPS[k].generic; });
      if (gen.length && !intent) { out.push(b.genericCrop(gen.map(cropName).join(', ').toLowerCase())); res.acts = ['compare']; res.chips = b.chipsNext; return Object.assign(res, { html: out }); }
      var c = helpCtx, A = t.help.a;
      switch (intent) {
        case 'why': out.push(A.why(c)); res.acts = ['compare']; break;
        case 'enso': out.push(c.enso && c.enso.nina && c.enso.nino ? A.enso(c) : zoneSummary()); res.acts = ['agenda']; break;
        case 'rotate': out.push(A.rotate(c)); res.acts = ['compare']; break;
        case 'frost': var f = monthList('frost'); out.push(b.frost(f.list, f.n)); res.acts = ['agenda']; break;
        case 'heat': var h = monthList('heat'); out.push(b.heat(h.list, h.n)); res.acts = ['agenda']; break;
        case 'agenda': out.push(b.agenda(c.name(agRotSel || c.rows[0].id))); res.acts = ['agenda']; break;
        case 'devices': out.push(b.devices); res.acts = ['devices']; break;
        case 'field': out.push(b.field); res.acts = ['field']; break;
        case 'trust': out.push(A.trust(c)); res.acts = ['compare']; break;
        case 'terms': out.push(A.terms(c)); break;
        case 'limitsQ': out.push(A.limits(c)); break;
        case 'drought': out.push(A.water(c)); res.acts = ['compare']; break;
        case 'compare': out.push(zoneSummary()); res.acts = ['compare', 'agenda']; break;
        case 'thanks': out.push(b.thanks); break;
        case 'help': case 'greet': out.push(window.YvyIA && window.YvyIA.installed() && b.helpAI ? b.helpAI : b.help); res.chips = b.chipsStart; break;
        default:
          if (placeOk) { out.push(zoneSummary()); res.acts = ['compare', 'agenda']; }
          else if (prio || changed) { out.push(b.nowBest(c.name(c.rows[0].id), c.sw.wins[c.rows[0].id], c.sw.n)); res.acts = ['compare']; }
          else if (!out.length) { out.push(b.notUnderstood + b.help); res.chips = b.chipsStart; res.unknown = true; }
      }
      if (flowQuestion && reg) { var nx2 = askNext(out); res.acts = (res.acts || []).concat(nx2.acts || []); res.chips = nx2.chips; }
      if (!res.chips) res.chips = b.chipsNext;
      return Object.assign(res, { html: out });
    });
  }
  function chatShow(r, tag) {
    var html = r.html.filter(Boolean).map(function (h) { return /^<(p|ul|dl)/.test(h) ? h : '<p>' + h + '</p>'; }).join('');
    chatAdd('bot', (tag ? '<p class="kb-tag">' + tag + '</p>' : '') + html, r.acts);
    setChips(r.chips);
  }
  // Si el asistente guiado no entendió, se prueba la base de conocimiento y, si está instalada, la IA local
  // (asistente-ia.js). La IA solo elige un tema de una lista cerrada; nunca escribe la respuesta.
  function chatFallback(text, r, wait) {
    var IA = window.YvyIA;
    if (!IA) { wait.remove(); chatShow(r); return; }
    var thinking = null;
    return IA.fallback(text, function (msg) { wait.remove(); thinking = chatAdd('bot typing', '<p>' + esc(msg) + '</p>'); return function () { if (thinking) thinking.remove(); }; })
      .then(function (f) {
        if (wait.parentNode) wait.remove();
        if (!f) { chatShow(r); return; }
        if (f.html) { chatAdd('bot', f.html); setChips(f.chips || T[lang].bot.chipsNext); return; }
        return answer(f.engineQuery).then(function (r2) {
          if (r2.unknown) { chatShow(r); return; }
          chatShow(r2, f.tag);
        });
      }, function () { if (wait.parentNode) wait.remove(); chatShow(r); });
  }
  function chatSend(text) {
    text = String(text || '').trim();
    if (!text) return;
    chatAdd('user', '<p>' + esc(text) + '</p>');
    $('chatIn').value = '';
    var wait = chatAdd('bot typing', T[lang].bot.typing);
    // Pequeña pausa para que el mensaje del usuario se vea antes de la respuesta.
    setTimeout(function () {
      // Un tema de la base tocado como botón va directo a su texto guardado.
      if (window.YvyIA && window.YvyIA.isTitle(text)) { chatFallback(text, { html: [], chips: null }, wait); return; }
      Promise.resolve(text).then(answer).then(function (r) {
        if (r.unknown) return chatFallback(text, r, wait);
        wait.remove();
        chatShow(r);
      }).catch(function () { if (wait.parentNode) wait.remove(); chatAdd('bot', T[lang].bot.notUnderstood + T[lang].bot.help); setChips(T[lang].bot.chipsStart); });
    }, 150);
  }

  // Textos del rediseño (interfaz compacta).
  Object.assign(STATIC_EN, {
    homeH: 'Which crop rotation holds up best in a tough year?',
    rlLead: 'Pick your area and what matters most to you. Below you will see which rotation held up best over 25 seasons, and why.',
    homeLead: 'Compare crop rotations in your area with 25 seasons of NASA data.',
    ctaCompare: 'Compare rotations', ctaField: 'See the field from space',
    hvA: 'January 2022 · drought', hvB: 'January 2024', hvL: 'Slide to compare the two dates',
    hvCap: 'The same fields in Itapúa seen by NASA (HLS, 30 m). Slide.',
    chatH: 'Or ask the assistant', chatNote: 'Guided assistant: numbers come from the calculation, general answers from reviewed texts. Works offline.',
    setup: 'Your field', priorities: 'What matters most to you?', wNote: '0 = I don’t care, 5 = I care a lot.',
    fdWeights: 'Fine-tune', mapH: 'Pick on the map', limH: 'Crops I don’t grow', rainH: 'What if rainfall were different?', build: 'Build my rotation',
    tableH: 'See the numbers',
    tz3: '25 seasons, one by one', tz4: 'Rain, El Niño and satellite', tz5: 'Checked against real harvests', tz6: 'Answers with your numbers', tz7: 'From data to decision',
    mHomeS: 'Home', mCompareS: 'Compare', mFieldS: 'Field', mAgendaS: 'Planner', mParcelsS: 'Fields', mDevicesS: 'Sensors'
  });

  // YvyShift v5: textos en inglés de los módulos nuevos
  Object.assign(STATIC_EN, {
    navMods: 'Modules', navMore: 'More', mHome: 'Home',
    mField: 'Field Monitor', mFieldD: 'Map and satellite', mFieldS: 'Map',
    mDna: 'Field DNA', mDnaD: 'Memory of the area', mDnaS: 'DNA',
    footScale: 'Scale: climate comes from a NASA POWER cell of about 56 × 62 km; field images are 30 m. A sharp image does not make the climate data sharp.',
    footAI: 'Built with assistance from Claude (Anthropic) for code, text and translations. Every number is computed on your device. The assistant’s local AI is optional, runs on your device and labels its answers; it can make mistakes.',
    mCompare: 'Rotation Lab', mCompareD: 'Compare rotations', mCompareS: 'Rotations',
    mReplay: 'Climate Replay', mReplayD: 'Past hard years', mReplayS: 'Replay',
    mAgenda: 'Adaptive Monitor', mAgendaD: 'Current season and alerts', mAgendaS: 'Alerts',
    mPassport: 'Resilience Passport', mPassportD: 'Report with evidence', mPassportS: 'Report',
    homeH: 'What should I plant this winter to get through a dry year?',
    homeEy: 'NASA Space Apps 2026 · Made in Paraguay for farmers',
    footBg: 'Background image: Asunción seen from the Space Shuttle (STS-72 mission, 1996), courtesy of the NASA Image and Video Library (sts072-730-079).',
    pf1: 'Real NASA POWER data: 25 seasons per area, and any point in the world live.',
    pf2: 'Checked against real harvests: the model’s water deficit tracks soybean yield losses (r = −0.83, 23 seasons).',
    pf3: 'Works offline, with no account, in 6 languages.',
    demoIowa: 'Try another country: Iowa, USA (soybean belt)',
    homeLead: 'See how your area did over the last 25 seasons (droughts, heat and frost) and compare which rotation holds up best, with NASA data. Works offline.',
    ctaStart: 'See my area on the map', ctaCompare: 'Compare what to plant', sunLbl: 'Sun', mMoreS: 'More',
    fH: 'Map and satellite', fmListH: 'Areas', rlH: 'Compare rotations', agH: 'How this season is going',
    dnaH: 'Climate memory of the area', dnaStripesH: 'Year by year: 25 seasons at a glance', dnaRecH: 'Moisture recovery', exp: 'Experimental', dnaQualH: 'Quality of the evidence',
    rpH: 'Replay the hard years', rpSub: 'Real episodes from your area, picked with an explicit rule. Tap one to see how each rotation would have fared. This is not a forecast.', rpTestH: 'Rotation stress test',
    ppH: 'Report with evidence', ppSub: 'Everything the tool concludes about this area, with its sources and limits. It can be printed or saved as PDF.', ppPrint: 'Print or save as PDF'
  });
  var H0 = loadHash();
  renderLimits();
  $('rain').value = rainAdj;
  $('rain').addEventListener('input', function () { rainAdj = +$('rain').value; render(); });
  [0, 1].forEach(function (i) {
    $('satYear' + i).addEventListener('change', function () { satYears[i] = +$('satYear' + i).value; render(); });
    $('sat' + i).addEventListener('load', function () { $('satMsg' + i).textContent = ''; });
    $('sat' + i).addEventListener('error', function () {
      var fb = [2022, 2024][i];
      if (satYears[i] === fb) return;
      satYears[i] = fb; render(); $('satMsg' + i).textContent = T[lang].satFail;
    });
  });
  fillLocations(datasets[H0.l] ? H0.l : 'itapua');
  $('loc').addEventListener('change', function () {
    var v = $('loc').value;
    if (v === '__draw' || v.indexOf('p:') === 0) {
      $('loc').value = datasets[locPrev] ? locPrev : Object.keys(datasets)[0];
      if (v === '__draw') { showView('field'); setTimeout(function () { if (window.RL && RL.startDraw) RL.startDraw(); }, 80); return; }
      var p = loadParcels().filter(function (x) { return 'p:' + x.id === v; })[0]; if (!p) return;
      var st = $('buildStatus'); st.textContent = T[lang].live;
      applyConfig(p).then(function () { st.textContent = ''; fillLocations($('loc').value); }, function (e) { st.textContent = T[lang].fail + e.message; });
      return;
    }
    locPrev = v; pending = null; $('fetchStatus').textContent = ''; fillScenarios(); fillBuilder(); render();
  });
  // Zoom y arrastre del mapa.
  var zmDrag = null, zmMoved = false;
  $('zmIn').addEventListener('click', function () { zmZoom(1.5); });
  $('zmOut').addEventListener('click', function () { zmZoom(1 / 1.5); });
  $('zmReset').addEventListener('click', function () { ZM.z = 1; ZM.tx = 0; ZM.ty = 0; zmApply(); });
  $('zoneMap').addEventListener('pointerdown', function (e) {
    zmMoved = false;
    if (ZM.z <= 1 || e.target.closest('.zm-ctrl, button.mp')) return;
    zmDrag = { x: e.clientX, y: e.clientY, tx: ZM.tx, ty: ZM.ty };
    $('zoneMap').classList.add('dragging');
  });
  window.addEventListener('pointermove', function (e) {
    if (!zmDrag) return;
    var dx = e.clientX - zmDrag.x, dy = e.clientY - zmDrag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) zmMoved = true;
    ZM.tx = zmDrag.tx + dx; ZM.ty = zmDrag.ty + dy; zmApply();
  });
  window.addEventListener('pointerup', function () { zmDrag = null; $('zoneMap').classList.remove('dragging'); });
  $('zoneMap').addEventListener('dblclick', function (e) {
    if (e.target.closest('.zm-ctrl, button.mp')) return;
    e.preventDefault(); var r = $('zoneMap').getBoundingClientRect(); zmZoom(1.5, e.clientX - r.left, e.clientY - r.top);
  });
  window.addEventListener('resize', zmApply);
  zmApply();
  $('zoneMap').addEventListener('click', function (e) {
    if (e.target.closest('.zm-ctrl')) return;
    if (zmMoved) { zmMoved = false; return; } // fue un arrastre, no un clic
    var b = e.target.closest('button[data-k]');
    if (b) { pending = null; $('fetchStatus').textContent = ''; $('loc').value = b.dataset.k; fillScenarios(); render(); return; }
    var r = $('zmInner').getBoundingClientRect(); // incluye el zoom y el desplazamiento
    var lon = MAPB.w + (e.clientX - r.left) / r.width * (MAPB.e - MAPB.w), lat = MAPB.n - (e.clientY - r.top) / r.height * (MAPB.n - MAPB.s);
    $('lat').value = lat.toFixed(2); $('lon').value = lon.toFixed(2);
    setPending(+lat.toFixed(2), +lon.toFixed(2));
  });
  ['lat', 'lon'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      var la = +$('lat').value, lo = +$('lon').value;
      if ($('lat').value !== '' && $('lon').value !== '' && isFinite(la) && isFinite(lo)) setPending(la, lo);
    });
  });
  $('scenario').addEventListener('change', render);
  $('soil').addEventListener('change', render);
  $('fetchBtn').addEventListener('click', fetchLive);
  $('exportBtn').addEventListener('click', exportCache);
  $('langSel').addEventListener('change', function () { setLang($('langSel').value); });
  $('buildBtn').addEventListener('click', applyCustom);
  $('buildClear').addEventListener('click', removeCustom);
  $('printBtn').addEventListener('click', function () { window.print(); });
  // Tema claro/oscuro: por defecto sigue al sistema; el botón lo fija.
  (function () {
    var root = document.documentElement, saved = null;
    try { saved = localStorage.getItem('rl-theme'); } catch (e) { /* almacenamiento bloqueado */ }
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
    $('themeBtn').addEventListener('click', function () {
      var dark = root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('rl-theme', root.dataset.theme); } catch (e) { /* idem */ }
    });
  })();
  $('shareBtn').addEventListener('click', share);
  fillSoils(); if (H0.o && E.SOILS[H0.o]) $('soil').value = H0.o;
  buildWeights(); fillScenarios(); fillBuilder();
  $('scenario').value = H0.s && Array.prototype.some.call($('scenario').options, function (o) { return o.value === H0.s; }) ? H0.s : '2021';
  // ---------- Eventos de vistas, asistente, agenda y parcelas ----------
  document.querySelectorAll('.nav-i[data-view]').forEach(function (b) { b.addEventListener('click', function () { showView(b.dataset.view); }); });
  $('brandLink').addEventListener('click', function (e) { e.preventDefault(); showView('home'); });
  $('menuBtn').addEventListener('click', function () {
    var open = !$('side').classList.contains('open');
    $('side').classList.toggle('open', open);
    $('menuBtn').setAttribute('aria-expanded', String(open));
    $('menuBtn').setAttribute('aria-label', open ? T[lang].menuClose : T[lang].menuOpen);
    if (open) $('side').querySelector('.nav-i').focus();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('side').classList.contains('open')) { closeMenu(); $('menuBtn').focus(); } });
  // En el teléfono, tocar fuera del menú lo cierra.
  document.addEventListener('click', function (e) { if ($('side').classList.contains('open') && !$('side').contains(e.target) && !$('menuBtn').contains(e.target)) closeMenu(); });
  $('sideCollapse').addEventListener('click', function () { setCollapsed(!$('shell').classList.contains('collapsed')); });
  try { if (localStorage.getItem('rl-side') === '1') $('shell').classList.add('collapsed'); } catch (e) { /* almacenamiento bloqueado */ }

  $('chatForm').addEventListener('submit', function (e) { e.preventDefault(); chatSend($('chatIn').value); });
  $('chatChips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) chatSend(b.textContent); });
  $('chatLog').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var a = b.dataset.act;
    if (a === 'map') { showView('field', true); var m = $('zoneMap'); m.scrollIntoView({ block: 'center' }); return; }
    showView(a);
  });
  (function () {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
    if (!SR) return;
    var mic = $('micBtn');
    mic.hidden = false;
    mic.addEventListener('click', function () {
      if (rec) { rec.stop(); return; }
      rec = new SR();
      rec.lang = { es: 'es-PY', en: 'en-US', gn: 'es-PY', pt: 'pt-BR', ja: 'ja-JP', hi: 'hi-IN' }[uiLang] || 'en-US';
      rec.interimResults = false;
      rec.onresult = function (e) { var tx = e.results[0][0].transcript; chatSend(tx); };
      rec.onend = function () { rec = null; mic.setAttribute('aria-pressed', 'false'); mic.setAttribute('aria-label', T[lang].micTitle); };
      rec.onerror = function () { /* sin permiso o sin conexión: el usuario puede escribir */ };
      try { rec.start(); mic.setAttribute('aria-pressed', 'true'); mic.setAttribute('aria-label', T[lang].micStop); } catch (err) { rec = null; }
    });
  })();
  ['A', 'B'].forEach(function (s) {
    $('fvDate' + s).addEventListener('change', function () { if ($('fvDate' + s).value) { FV[s].date = $('fvDate' + s).value; FV._user = true; renderField(); } });
    $('fvSrc' + s).addEventListener('change', function () { FV[s].src = $('fvSrc' + s).value; FV._user = true; renderField(); });
    $('fv' + s).addEventListener('load', function () { fvMeasure(s); });
  });
  document.querySelectorAll('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = b.dataset.step, d = new Date(FV[s].date + 'T12:00:00Z');
      d.setUTCDate(d.getUTCDate() + +b.dataset.d);
      var iso = d.toISOString().slice(0, 10);
      if (iso > new Date().toISOString().slice(0, 10) || iso < '2015-12-01') return;
      FV[s].date = iso; FV._user = true; renderField();
    });
  });
  $('fvSlider').addEventListener('input', function () { fvSetSlider(+$('fvSlider').value); });
  (function () {
    var dragging = false, sw = $('fvSwipe');
    var move = function (e) { var r = sw.getBoundingClientRect(); fvSetSlider(100 * (e.clientX - r.left) / r.width); };
    sw.addEventListener('pointerdown', function (e) { dragging = true; move(e); });
    window.addEventListener('pointermove', function (e) { if (dragging) move(e); });
    window.addEventListener('pointerup', function () { dragging = false; });
  })();
  fvSetSlider(50);
  $('agRot').addEventListener('change', function () { agRotSel = $('agRot').value; renderAgenda(datasets[$('loc').value]); });
  $('pForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('pName').value.trim(); if (!name) return;
    var ok = addParcel(name, currentConfig());
    $('pStatus').textContent = ok ? T[lang].pSaved(name) : T[lang].pFail;
    if (ok) $('pName').value = '';
  });
  $('pList').addEventListener('click', function (e) {
    var t = T[lang], use = e.target.closest('button[data-use]'), del = e.target.closest('button[data-del]'), a = loadParcels();
    if (use) {
      var p = a.filter(function (x) { return x.id === use.dataset.use; })[0]; if (!p) return;
      if (!datasets[p.loc]) $('pStatus').textContent = t.pLoading;
      applyConfig(p).then(function () { $('pStatus').textContent = ''; showView('compare'); }, function (err) { $('pStatus').textContent = t.fail + err.message; });
    }
    if (del) {
      var q = a.filter(function (x) { return x.id === del.dataset.del; })[0]; if (!q) return;
      if (!window.confirm(t.pDelQ(q.name))) return;
      saveParcels(a.filter(function (x) { return x.id !== q.id; })); renderParcels();
    }
  });
  // ---- Demo global a un clic: descarga NASA POWER para Iowa (EE. UU.) y abre la comparación ----
  if ($('demoIowa')) $('demoIowa').addEventListener('click', function () {
    var btn = this, st = $('demoSt'), es = lang === 'es';
    btn.disabled = true; st.textContent = '';
    fetchPoint(42.03, -93.62, es ? 'Iowa, EE. UU. (demo)' : tr('Iowa, USA (demo)')).then(function () { showView('compare'); },
      function (e) { st.textContent = e.message; }).then(function () { btn.disabled = false; });
  });
  // ---- App instalable (PWA): guarda la app en el dispositivo y la deja usar sin conexión ----
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* sin PWA: la web sigue funcionando */ }); });
  }
  var installEvt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; $('installBtn').hidden = false; });
  $('installBtn').addEventListener('click', function () {
    if (!installEvt) return;
    installEvt.prompt();
    installEvt.userChoice.then(function () { installEvt = null; $('installBtn').hidden = true; });
  });
  window.addEventListener('appinstalled', function () { $('installBtn').hidden = true; });
  function syncNet() { $('netBanner').hidden = navigator.onLine !== false; }
  window.addEventListener('online', syncNet); window.addEventListener('offline', syncNet); syncNet();

  function i18nDynamic() {
    var t = T[lang];
    $('chatIn').placeholder = t.placeholder;
    $('micBtn').setAttribute('aria-label', t.micTitle); $('micBtn').title = t.micTitle;
    $('menuBtn').setAttribute('aria-label', $('side').classList.contains('open') ? t.menuClose : t.menuOpen);
    var zl = lang === 'en' ? ['Zoom in', 'Zoom out', 'Show the whole map'].map(tr) : ['Acercar', 'Alejar', 'Ver todo el mapa'];
    ['zmIn', 'zmOut', 'zmReset'].forEach(function (id, i) { $(id).setAttribute('aria-label', zl[i]); $(id).title = zl[i]; });
    $('sideCollapse').setAttribute('aria-label', $('shell').classList.contains('collapsed') ? t.expand : t.collapse);
    // Si la conversación todavía no empezó, el saludo cambia de idioma.
    if ($('chatLog').children.length <= 1) chatGreet();
    renderParcels();
  }
  window.RL = { T: T, STATIC_EN: STATIC_EN, STATIC_ES: STATIC_ES, CROP_EN: CROP_EN, SOIL_EN: SOIL_EN, ROT_NAMES_EN: ROT_NAMES_EN, MONTHS: MONTHS, MONTHS_FULL: MONTHS_FULL, tr: tr, tp: tp, ui: function () { return uiLang; }, xlOn: function () { return !!xl; },
    E: E, datasets: datasets, fullYears: fullYears, rots: rots, rotName: rotName, scenVals: scenVals, phaseOf: phaseOf,
    monthStats: monthStats, soyStats: soyStats, valNumbers: valNumbers, num: num, esc: esc, placeLabel: placeLabel, soilName: soilName,
    cropName: cropName, DIM_COLORS: DIM_COLORS, isClimate: isClimate, showView: function (v) { showView(v); },
    lang: function () { return lang; }, weights: function () { return weights; }, rainAdj: function () { return rainAdj; },
    loc: function () { return $('loc').value; }, soil: function () { return $('soil').value; }, scenario: function () { return $('scenario').value; },
    dims: function () { return T[lang].dims; }, units: function () { return T[lang].units; },
    // Alcance mundial y parcelas (usado por worldmap.js y terra.js)
    sm: curSm, monthIdx: monthIdx, monthSpan: monthSpan, fetchPoint: fetchPoint, analyzeParcel: analyzeParcel, validPoly: validPoly,
    selectLoc: function (k) { if (!datasets[k]) return; pending = null; $('loc').value = k; fillScenarios(); fillBuilder(); render(); },
    view: function () { return view; }
  };
  var setLangBase = setLang;
  setLang = function (l) { setLangBase(l); i18nDynamic(); };

  var savedLang = null; try { savedLang = localStorage.getItem('rl-lang'); } catch (e) { /* idem */ }
  var startLang = H0.g || savedLang;
  if (startLang && startLang !== 'es' && (startLang === 'en' || EXTRA_LANGS.indexOf(startLang) >= 0)) setLang(startLang); else { render(); i18nDynamic(); }
  showView(H0.l ? 'compare' : 'home', true);
})();
