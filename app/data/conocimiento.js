/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). */
/*
 * Base de conocimiento del asistente de YvyShift.
 * Son las ÚNICAS respuestas largas que puede dar el asistente (con o sin IA local).
 * La IA local nunca escribe texto para el productor: solo elige uno de estos "id".
 * Reglas para editar:
 *  - Cada texto debe poder defenderse con la fuente de "src". Si no hay fuente, no va.
 *  - Los números de un lugar concreto NO se escriben aquí: salen del motor (engine.js).
 *    Aquí solo van cifras fijas y citadas (por ejemplo, la validación ya publicada).
 *  - "keys" son palabras ya normalizadas (minúsculas, sin tildes). Incluir sinónimos, jopará y errores comunes.
 *  - "rev": quién revisó el texto y cuándo. Lo agronómico queda "pendiente agrónomo" hasta que lo revise.
 */
window.YVY_KB = {
  version: '2026-11-15',
  items: [
    {
      id: 'et0',
      keys: ['evapotranspiracion', 'evapo', 'et0', 'eto', 'hargreaves', 'cuanta agua usa', 'cuanta agua pierde', 'agua que se evapora', 'evaporacion', 'evapotranspiration', 'how much water does the crop use'],
      title: { es: 'Evapotranspiración (ET0)', en: 'Evapotranspiration (ET0)' },
      text: {
        es: '<p>La evapotranspiración es el agua que sale del campo hacia el aire: una parte se evapora del suelo y otra la transpira la planta. La ET0 es la de un pasto de referencia bien regado; sirve como "demanda del clima".</p><p>YvyShift la calcula con el método de Hargreaves, que recomienda la FAO (manual FAO-56) cuando solo hay temperatura máxima y mínima confiables y la radiación en el tope de la atmósfera. Las tres vienen a diario de NASA POWER para cada lugar.</p><p>En días de calor y sol fuerte la ET0 sube, y el cultivo necesita más lluvia para no sufrir. Por eso un verano caluroso con la misma lluvia puede ser peor que uno fresco.</p>',
        en: '<p>Evapotranspiration is the water that leaves the field into the air: part evaporates from the soil and part is transpired by the plant. ET0 is the value for a well-watered reference grass; it works as the "demand of the weather".</p><p>YvyShift computes it with the Hargreaves method, which FAO (manual FAO-56) recommends when only reliable maximum and minimum temperature are available plus top-of-atmosphere radiation. All three come daily from NASA POWER for each place.</p><p>On hot, sunny days ET0 rises and the crop needs more rain to avoid stress. That is why a hot summer with the same rain can be worse than a cool one.</p>'
      },
      src: 'FAO-56 (Allen et al., 1998), capítulo 3, ecuación 52 · NASA POWER', rev: 'equipo, 15-nov-2026'
    },
    {
      id: 'kc',
      keys: ['kc', 'coeficiente de cultivo', 'coeficiente', 'etapa del cultivo', 'etapas', 'crop coefficient', 'growth stage'],
      title: { es: 'Coeficiente de cultivo (Kc)', en: 'Crop coefficient (Kc)' },
      text: {
        es: '<p>El Kc dice cuánta agua pide un cultivo comparado con el pasto de referencia. Cambia con la etapa: al inicio la planta es chica y pide poco; en floración y llenado de grano pide más que el pasto; al final baja otra vez.</p><p>La demanda del cultivo (ETc) es ET0 × Kc. YvyShift usa los valores tabulados de la FAO para soja, trigo, maíz y avena, repartidos en etapas inicial, desarrollo, media y final.</p><p>Son valores generales. Una variedad o una fecha de siembra distinta pueden cambiarlos; por eso el resultado sirve para comparar rotaciones, no para planificar riego.</p>',
        en: '<p>Kc tells how much water a crop asks for compared with the reference grass. It changes with the stage: at the start the plant is small and asks little; at flowering and grain fill it asks more than the grass; at the end it drops again.</p><p>Crop demand (ETc) is ET0 × Kc. YvyShift uses FAO tabulated values for soybean, wheat, maize and oats, split into initial, development, mid and late stages.</p><p>These are general values. A different variety or sowing date can change them, so the result is for comparing rotations, not for planning irrigation.</p>'
      },
      src: 'FAO-56, capítulo 6, Tabla 12', rev: 'equipo, 15-nov-2026 · pendiente agrónomo'
    },
    {
      id: 'deficit',
      keys: ['deficit', 'falta de agua', 'faltante', 'balance hidrico', 'balance de agua', 'agua del suelo', 'cuanta agua falto', 'mm', 'milimetros', 'water deficit', 'water balance', 'shortage'],
      title: { es: 'Déficit de agua y balance del suelo', en: 'Water deficit and soil balance' },
      text: {
        es: '<p>El déficit es el agua que el cultivo pidió y no recibió, en milímetros. YvyShift lo calcula de diez en diez días (décadas): suma la lluvia, resta la demanda del cultivo (ET0 × Kc) y lleva la cuenta del agua guardada en el suelo.</p><p>El suelo funciona como un tanque. Un suelo arcilloso guarda unos 160 mm por metro de raíz; uno franco, unos 155 mm; uno arenoso, unos 80 mm (valores medios de la FAO). Con suelo arenoso el tanque se vacía antes y el déficit aparece más rápido.</p><p>Es una clase de suelo general, no un análisis de tu lote. Si tienes un análisis de suelo, tu técnico puede ajustar este valor.</p>',
        en: '<p>The deficit is the water the crop asked for and did not get, in millimetres. YvyShift computes it every ten days (dekads): it adds rain, subtracts crop demand (ET0 × Kc) and keeps track of the water stored in the soil.</p><p>The soil works like a tank. A clay soil holds about 160 mm per metre of roots; a loam about 155 mm; a sandy soil about 80 mm (FAO average values). With sandy soil the tank empties sooner and the deficit shows up faster.</p><p>It is a general soil class, not an analysis of your field. If you have a soil test, your technician can adjust this value.</p>'
      },
      src: 'FAO-56, capítulo 8 y Tabla 19 · engine.js (SOILS)', rev: 'equipo, 15-nov-2026'
    },
    {
      id: 'power',
      keys: ['nasa power', 'power', 'de donde salen los datos', 'de donde sacan', 'fuente de datos', 'datos de nasa', 'que datos usa', 'merra', 'celda', 'resolucion', 'data source', 'where does the data come from'],
      title: { es: 'De dónde salen los datos del clima', en: 'Where the weather data comes from' },
      text: {
        es: '<p>Los datos diarios de lluvia, temperatura y radiación vienen de NASA POWER, un servicio gratuito de la NASA que combina satélites y modelos (el reanálisis MERRA-2 y la lluvia IMERG, entre otros).</p><p>Cada dato es el promedio de una celda de 0,5° × 0,625°. En Itapúa eso es un cuadro de unos 56 × 62 km. No es la lluvia exacta de tu lote: una tormenta local puede no aparecer.</p><p>La app trae guardados 25 años (2001 a 2026) de 8 zonas, así funciona sin internet. Para otro lugar descarga los datos en vivo desde NASA POWER cuando hay conexión.</p>',
        en: '<p>Daily rain, temperature and radiation come from NASA POWER, a free NASA service that blends satellites and models (the MERRA-2 reanalysis and IMERG rainfall, among others).</p><p>Each value is the average of a 0.5° × 0.625° cell. In Itapúa that is a square of about 56 × 62 km. It is not the exact rain of your field: a local storm may not show up.</p><p>The app stores 25 years (2001 to 2026) for 8 areas, so it works offline. For another place it downloads the data live from NASA POWER when there is a connection.</p>'
      },
      src: 'power.larc.nasa.gov (documentación de la API diaria) · engine.js powerCell', rev: 'equipo, 15-nov-2026'
    },
    {
      id: 'ndvi',
      keys: ['ndvi', 'verdor', 'que tan verde', 'indice verde', 'indice de vegetacion', 'modis', 'vegetacion', 'greenness', 'vegetation index'],
      title: { es: 'NDVI: qué tan verde está el campo', en: 'NDVI: how green the field is' },
      text: {
        es: '<p>El NDVI es un número entre −1 y 1 que el satélite calcula con la luz roja y la infrarroja que refleja la planta. Un cultivo sano y tupido da valores altos (0,7 o más); suelo desnudo o planta seca da valores bajos.</p><p>YvyShift muestra imágenes MODIS de la NASA (250 m, una cada 16 días) y HLS (30 m, satélites Landsat y Sentinel-2) para ver el mismo campo en un año seco y en uno normal.</p><p>También se usó el NDVI para comprobar el modelo: en Itapúa, los eneros con más déficit de agua calculado fueron los menos verdes (correlación −0,76; en Alto Paraná −0,51). Enero de 2022, en plena sequía, fue el menos verde de la serie.</p>',
        en: '<p>NDVI is a number between −1 and 1 that the satellite computes from the red and infrared light the plant reflects. A healthy, dense crop gives high values (0.7 or more); bare soil or dry plants give low values.</p><p>YvyShift shows NASA MODIS images (250 m, one every 16 days) and HLS (30 m, Landsat and Sentinel-2 satellites) to see the same field in a dry year and a normal one.</p><p>NDVI was also used to check the model: in Itapúa, the Januaries with the largest computed water deficit were the least green (correlation −0.76; Alto Paraná −0.51). January 2022, in the middle of the drought, was the least green of the series.</p>'
      },
      src: 'ORNL DAAC, MOD13Q1 · docs/VALIDACION_SATELITAL_MODIS.md', rev: 'equipo, 15-nov-2026'
    },
    {
      id: 'validacion',
      keys: ['validacion', 'validado', 'se comprobo', 'es real', 'funciona de verdad', 'prueba', 'correlacion', 'rendimiento', 'fao', 'cosecha real', 'validation', 'is it accurate', 'yield'],
      title: { es: 'Cómo se comprobó el modelo', en: 'How the model was checked' },
      text: {
        es: '<p>Se comparó el déficit de agua que calcula YvyShift para la soja con el rendimiento real de soja de Paraguay publicado por la FAO, en 23 campañas. Los años con más déficit calculado fueron los de peor rendimiento: correlación −0,83 (sin la tendencia de mejora tecnológica).</p><p>Las tres peores campañas de la serie FAO coinciden con sequías conocidas: 2008-09 (1,50 t/ha), 2011-12 (1,49 t/ha) y 2021-22 (1,48 t/ha). En 2021-22 la producción cayó de 10,5 a 5,2 millones de toneladas.</p><p>Además, la lluvia de NASA POWER se contrastó con ERA5, otro reanálisis independiente (de Europa), y el déficit con el verdor MODIS. Esto muestra que el modelo ordena bien los años malos y buenos. No predice el rendimiento de tu lote.</p>',
        en: '<p>The soybean water deficit computed by YvyShift was compared with Paraguay\'s actual soybean yield published by FAO over 23 seasons. Years with more computed deficit had worse yields: correlation −0.83 (after removing the technology trend).</p><p>The three worst seasons of the FAO series match known droughts: 2008-09 (1.50 t/ha), 2011-12 (1.49 t/ha) and 2021-22 (1.48 t/ha). In 2021-22 production fell from 10.5 to 5.2 million tonnes.</p><p>NASA POWER rain was also checked against ERA5, an independent European reanalysis, and the deficit against MODIS greenness. This shows the model ranks bad and good years well. It does not predict the yield of your field.</p>'
      },
      src: 'FAOSTAT vía Our World in Data · ERA5 vía Open-Meteo · docs/VALIDACION_EXTERNA.md', rev: 'equipo, 15-nov-2026'
    },
    {
      id: 'sequia2022',
      keys: ['2022', '2021', 'sequia 2022', 'sequia de 2022', 'zafra 2021', 'campana 2021', 'ano seco', 'peor ano', 'la seca', 'sequia grande', 'drought 2022', 'worst year'],
      title: { es: 'La sequía de la campaña 2021-22', en: 'The 2021-22 drought' },
      text: {
        es: '<p>La campaña de soja 2021-22 fue la más seca de los 25 años que guarda la app. En Itapúa, según ERA5, llovieron unos 381 mm entre el 11 de octubre y el 10 de febrero; un año húmedo como 2023-24 pasó de 1.000 mm.</p><p>Coincidió con La Niña, fase que en el sur de Sudamérica suele traer menos lluvia en primavera y verano. La FAO registró 1,48 t/ha de soja para Paraguay, casi la mitad del año anterior.</p><p>En la app es el ejemplo del "año malo": sirve para ver qué rotación aguantó mejor y cómo se veía el campo desde el satélite en enero de 2022.</p>',
        en: '<p>The 2021-22 soybean season was the driest of the 25 years stored in the app. In Itapúa, according to ERA5, about 381 mm fell between 11 October and 10 February; a wet year like 2023-24 had more than 1,000 mm.</p><p>It coincided with La Niña, a phase that in southern South America often brings less rain in spring and summer. FAO recorded 1.48 t/ha of soybean for Paraguay, almost half of the previous year.</p><p>In the app it is the "bad year" example: it shows which rotation held up best and what the field looked like from space in January 2022.</p>'
      },
      src: 'ERA5 vía Open-Meteo · FAOSTAT · NOAA ONI · data/validation.js', rev: 'equipo, 15-nov-2026'
    },
    {
      id: 'enso',
      keys: ['nino', 'nina', 'enso', 'oni', 'fenomeno', 'corriente del nino', 'pronostico del ano', 'el nino', 'la nina', 'el nino y la nina'],
      title: { es: 'El Niño y La Niña', en: 'El Niño and La Niña' },
      text: {
        es: '<p>El Niño y La Niña son cambios en la temperatura del océano Pacífico que alteran las lluvias en muchas regiones. La NOAA los mide con el índice ONI: arriba de +0,5 es El Niño; abajo de −0,5 es La Niña.</p><p>En el este de Paraguay, El Niño suele asociarse a más lluvia y La Niña a menos, sobre todo en primavera y verano. No pasa siempre igual: hay años de La Niña sin sequía fuerte.</p><p>YvyShift agrupa las 25 campañas por fase con el ONI de octubre a diciembre y muestra cómo le fue a cada rotación en cada grupo. No pronostica la próxima campaña: para eso consulta el pronóstico oficial (Dirección de Meteorología e Hidrología).</p>',
        en: '<p>El Niño and La Niña are changes in Pacific Ocean temperature that shift rainfall in many regions. NOAA measures them with the ONI index: above +0.5 is El Niño; below −0.5 is La Niña.</p><p>In eastern Paraguay, El Niño is often linked to more rain and La Niña to less, especially in spring and summer. It is not always the same: some La Niña years have no strong drought.</p><p>YvyShift groups the 25 seasons by phase using the October–December ONI and shows how each rotation did in each group. It does not forecast the next season: for that, check the official forecast (Dirección de Meteorología e Hidrología).</p>'
      },
      src: 'NOAA CPC, índice ONI · data/enso_oni.js', rev: 'equipo, 15-nov-2026 · pendiente agrónomo'
    },
    {
      id: 'lente',
      keys: ['lente nasa', 'lente', 'solo clima', 'solo datos de nasa', 'por que gana la base', 'pesos', 'ponderacion', 'nasa lens', 'climate only', 'weights'],
      title: { es: 'La "lente NASA": solo el clima', en: 'The "NASA lens": weather only' },
      text: {
        es: '<p>La comparación normal suma varios criterios: agua, calor, heladas y también beneficios del suelo, como cobertura o rotar cultivos. La lente NASA apaga todo lo que no sale de los datos del satélite y deja solo déficit de agua, días de calor y días de helada.</p><p>Con solo clima, la soja con barbecho invernal (la rotación base) gana en 13 a 17 de las 25 campañas, según la zona: no tiene cultivo de invierno que sufra. Con los criterios completos no gana ninguna.</p><p>Esto muestra con honestidad qué parte de la recomendación viene de los datos de la NASA y qué parte de conocimiento agronómico sobre el suelo.</p>',
        en: '<p>The normal comparison adds several criteria: water, heat, frost and also soil benefits such as cover or rotating crops. The NASA lens switches off everything that does not come from satellite data and keeps only water deficit, heat days and frost days.</p><p>With weather only, soybean with winter fallow (the baseline) wins 13 to 17 of the 25 seasons, depending on the area: it has no winter crop to suffer. With the full criteria it wins none.</p><p>This shows honestly which part of the recommendation comes from NASA data and which part from agronomic knowledge about the soil.</p>'
      },
      src: 'tests/validation.test.js · app.js (NASA_W)', rev: 'equipo, 15-nov-2026'
    },
    {
      id: 'rotaciones',
      keys: ['que rotaciones', 'rotaciones', 'opciones', 'soja trigo', 'soja maiz', 'avena negra', 'barbecho', 'cuales compara', 'which rotations', 'options'],
      title: { es: 'Las cuatro rotaciones que compara', en: 'The four rotations it compares' },
      text: {
        es: '<p>YvyShift compara cuatro rotaciones comunes en el este de Paraguay:</p><ul><li><b>A, base:</b> soja en verano y barbecho (campo sin cultivo) en invierno.</li><li><b>B:</b> trigo en invierno y soja en verano.</li><li><b>C:</b> avena negra como cultivo de cobertura en invierno y soja en verano.</li><li><b>D:</b> soja temprana y después maíz zafriña.</li></ul><p>Para cada una calcula, en las 25 campañas, el agua que faltó, los días de calor en floración y los días de helada en las etapas sensibles. Las fechas de siembra son supuestos generales que conviene revisar con tu técnico.</p>',
        en: '<p>YvyShift compares four rotations common in eastern Paraguay:</p><ul><li><b>A, baseline:</b> soybean in summer and fallow (no crop) in winter.</li><li><b>B:</b> wheat in winter and soybean in summer.</li><li><b>C:</b> black oat as a winter cover crop and soybean in summer.</li><li><b>D:</b> early soybean followed by second-crop (zafriña) maize.</li></ul><p>For each one it computes, over 25 seasons, the missing water, heat days at flowering and frost days in sensitive stages. Sowing dates are general assumptions to review with your technician.</p>'
      },
      src: 'engine.js (ROTATIONS)', rev: 'equipo, 15-nov-2026 · pendiente agrónomo'
    },
    {
      id: 'cobertura',
      keys: ['cobertura', 'abono verde', 'avena', 'nabo', 'paja', 'rastrojo', 'siembra directa', 'erosion', 'suelo desnudo', 'proteger el suelo', 'cover crop', 'no till', 'erosion'],
      title: { es: 'Cultivos de cobertura y siembra directa', en: 'Cover crops and no-till' },
      text: {
        es: '<p>Un cultivo de cobertura (como avena negra o nabo forrajero) se siembra en invierno no para cosechar, sino para que el suelo no quede desnudo. Sus raíces y su paja protegen contra la erosión por lluvias fuertes, ayudan a que el agua entre al suelo y dejan materia orgánica.</p><p>Paraguay es uno de los países con más adopción de siembra directa: se siembra sobre el rastrojo, sin arar. La cobertura de invierno es parte de ese sistema.</p><p>El satélite no mide estos beneficios directamente; por eso en YvyShift entran como criterios agronómicos, separados del clima (ver la lente NASA). Las especies y fechas convienen definirlas con un técnico o con el IPTA.</p>',
        en: '<p>A cover crop (such as black oat or forage radish) is sown in winter not for harvest but so the soil is not left bare. Its roots and straw protect against erosion from heavy rain, help water soak in and add organic matter.</p><p>Paraguay is one of the countries with the highest adoption of no-till: crops are sown over the previous straw, without ploughing. Winter cover is part of that system.</p><p>Satellites do not measure these benefits directly, so in YvyShift they are agronomic criteria kept apart from weather (see the NASA lens). Species and dates are best chosen with a technician or with IPTA.</p>'
      },
      src: 'FAO, Agricultura de Conservación · IPTA', rev: 'equipo, 15-nov-2026 · pendiente agrónomo'
    },
    {
      id: 'zafrina',
      keys: ['zafrina', 'zafrinha', 'safrinha', 'maiz zafrina', 'segunda siembra', 'maiz despues de soja', 'maiz de segunda', 'second crop maize'],
      title: { es: 'Maíz zafriña', en: 'Second-crop (zafriña) maize' },
      text: {
        es: '<p>El maíz zafriña se siembra después de cosechar una soja temprana, en verano tardío, y se cosecha en otoño o invierno. Permite dos cosechas en el año.</p><p>Su riesgo principal con el clima es doble: si la soja temprana se siembra con poca lluvia, sufre al inicio; y si el maíz se siembra tarde, puede encontrar heladas o falta de agua en su llenado de grano.</p><p>En YvyShift es la rotación D. La app cuenta, para cada campaña, los días de helada y el déficit en las etapas sensibles del maíz. Para la fecha de siembra de tu zona consulta el calendario del MAG o de tu cooperativa.</p>',
        en: '<p>Zafriña maize is sown after harvesting an early soybean, in late summer, and harvested in autumn or winter. It allows two harvests a year.</p><p>Its main weather risk is twofold: if early soybean is sown with little rain, it suffers at the start; and if maize is sown late, it can meet frost or lack of water during grain fill.</p><p>In YvyShift it is rotation D. For each season the app counts frost days and deficit in maize\'s sensitive stages. For your area\'s sowing date check the MAG or your cooperative\'s calendar.</p>'
      },
      src: 'engine.js (ROTATIONS, CROPS) · MAG', rev: 'equipo, 15-nov-2026 · pendiente agrónomo'
    },
    {
      id: 'helada',
      keys: ['helada', 'heladas', 'escarcha', 'frio', 'temperatura minima', 'cuando hiela', 'frost', 'cold'],
      title: { es: 'Heladas', en: 'Frost' },
      text: {
        es: '<p>YvyShift cuenta un "día de helada" cuando la temperatura mínima del aire a 2 m llega a 2 °C o menos. A esa temperatura del aire, en el suelo o en la hoja ya puede haber helada.</p><p>En el este de Paraguay suelen darse entre junio y agosto. Son un riesgo para el trigo en floración y para el maíz zafriña sembrado tarde.</p><p>El dato viene de una celda de unos 50 km: en un bajo o al lado de un arroyo puede helar más que lo que muestra la app. El umbral de 2 °C es un supuesto que conviene validar con un técnico.</p>',
        en: '<p>YvyShift counts a "frost day" when the minimum air temperature at 2 m reaches 2 °C or less. At that air temperature there can already be frost on the ground or on leaves.</p><p>In eastern Paraguay frosts usually occur between June and August. They are a risk for wheat at flowering and for late-sown second-crop maize.</p><p>The data comes from a cell of about 50 km: in a low spot or next to a stream it can freeze more than the app shows. The 2 °C threshold is an assumption to validate with a technician.</p>'
      },
      src: 'engine.js (umbral frost: 2 °C)', rev: 'equipo, 15-nov-2026 · pendiente agrónomo'
    },
    {
      id: 'calor',
      keys: ['calor', 'ola de calor', 'temperatura maxima', 'mucho calor', 'golpe de calor', '35 grados', 'heat', 'heatwave', 'hot'],
      title: { es: 'Días de calor', en: 'Heat days' },
      text: {
        es: '<p>YvyShift cuenta un "día de calor" cuando la temperatura máxima llega a 35 °C o más. Lo cuenta sobre todo en la etapa media del cultivo (floración y llenado de grano), que es cuando más daño hace.</p><p>El calor fuerte, además, sube la evapotranspiración: el cultivo pide más agua el mismo día. Calor y falta de lluvia juntos son la peor combinación para la soja.</p><p>El umbral de 35 °C es un supuesto general; un técnico puede ajustarlo según el cultivo y la variedad.</p>',
        en: '<p>YvyShift counts a "heat day" when the maximum temperature reaches 35 °C or more. It counts it mainly in the crop\'s mid stage (flowering and grain fill), when it does the most damage.</p><p>Strong heat also raises evapotranspiration: the crop asks for more water that same day. Heat plus lack of rain is the worst combination for soybean.</p><p>The 35 °C threshold is a general assumption; a technician can adjust it for the crop and variety.</p>'
      },
      src: 'engine.js (umbral heat: 35 °C)', rev: 'equipo, 15-nov-2026 · pendiente agrónomo'
    },
    {
      id: 'suelo',
      keys: ['tipo de suelo', 'suelo', 'tierra colorada', 'tierra roja', 'arcilloso', 'arenoso', 'franco', 'que suelo elijo', 'mi suelo', 'soil type', 'which soil'],
      title: { es: 'Qué tipo de suelo elegir', en: 'Which soil type to choose' },
      text: {
        es: '<p>La app ofrece tres clases de suelo: arcilloso, franco y arenoso. La "tierra colorada" típica de Itapúa y Alto Paraná suele ser arcillosa; si no sabes, la app usa arcilloso.</p><p>La clase cambia cuánta agua guarda el suelo: arcilloso unos 160 mm por metro, franco unos 155 mm y arenoso unos 80 mm. En suelo arenoso el déficit aparece antes.</p><p>Es una aproximación de la FAO. Un análisis de suelo de tu lote es más preciso: consulta a tu técnico o al laboratorio de tu cooperativa.</p>',
        en: '<p>The app offers three soil classes: clay, loam and sandy. The typical "red soil" of Itapúa and Alto Paraná is usually clayey; if you are not sure, the app uses clay.</p><p>The class changes how much water the soil holds: clay about 160 mm per metre, loam about 155 mm and sandy about 80 mm. In sandy soil the deficit shows up sooner.</p><p>It is an FAO approximation. A soil test of your field is more accurate: ask your technician or your cooperative\'s laboratory.</p>'
      },
      src: 'FAO-56 Tabla 19 · engine.js (SOILS)', rev: 'equipo, 15-nov-2026 · pendiente agrónomo'
    },
    {
      id: 'limites',
      keys: ['limites', 'que no hace', 'no hace', 'reemplaza', 'pronostico', 'va a llover', 'lluvia de manana', 'precio', 'rendimiento de mi lote', 'what it does not do', 'forecast'],
      title: { es: 'Lo que YvyShift no hace', en: 'What YvyShift does not do' },
      text: {
        es: '<ul><li>No pronostica el clima de mañana ni de la próxima campaña: mira 25 años pasados.</li><li>No predice el rendimiento de tu lote ni precios.</li><li>No ve tu lote exacto: el clima es de una celda de unos 50 km.</li><li>No reemplaza a un ingeniero agrónomo: las fechas de siembra y los umbrales son supuestos generales.</li></ul><p>Sí sirve para comparar, con datos de la NASA, qué rotación aguantó mejor los años malos en tu zona, y llevar esa conversación a tu técnico.</p>',
        en: '<ul><li>It does not forecast tomorrow\'s weather or the next season: it looks at 25 past years.</li><li>It does not predict your field\'s yield or prices.</li><li>It does not see your exact field: weather is for a cell of about 50 km.</li><li>It does not replace an agronomist: sowing dates and thresholds are general assumptions.</li></ul><p>It does help compare, with NASA data, which rotation held up best in bad years in your area, and bring that conversation to your technician.</p>'
      },
      src: 'docs/RISKS_AND_LIMITATIONS.md', rev: 'equipo, 15-nov-2026'
    },
    {
      id: 'offline',
      keys: ['sin internet', 'sin conexion', 'sin senal', 'offline', 'instalar', 'descargar la app', 'en el celular', 'en el telefono', 'mis datos', 'privacidad', 'install', 'privacy', 'no signal'],
      title: { es: 'Usar sin internet y en el celular', en: 'Using it offline and on the phone' },
      text: {
        es: '<p>YvyShift es una aplicación web que se puede instalar: en Chrome del celular, abre el menú y elige "Agregar a la pantalla principal" o "Instalar app". Después de la primera visita funciona sin señal, con las 8 zonas y 25 años guardados.</p><p>Las parcelas y ajustes se guardan solo en tu teléfono; no hay cuentas ni servidor propio. Sin conexión no se pueden bajar datos de un lugar nuevo ni las imágenes satelitales en vivo.</p><p>El modo Sol sube el contraste para leer a pleno sol.</p>',
        en: '<p>YvyShift is an installable web app: in Chrome on your phone, open the menu and choose "Add to Home screen" or "Install app". After the first visit it works without signal, with the 8 areas and 25 years stored.</p><p>Fields and settings are saved only on your phone; there are no accounts and no server of our own. Offline it cannot download data for a new place or live satellite images.</p><p>Sun mode raises contrast for reading in full sunlight.</p>'
      },
      src: 'app/sw.js · app/manifest.webmanifest', rev: 'equipo, 15-nov-2026'
    },
    {
      id: 'ia',
      keys: ['inteligencia artificial', 'ia', 'chatgpt', 'modelo de lenguaje', 'como funciona el asistente', 'el asistente inventa', 'es una ia', 'artificial intelligence', 'ai', 'how does the assistant work'],
      title: { es: 'Cómo funciona este asistente', en: 'How this assistant works' },
      text: {
        es: '<p>El asistente responde de dos formas, y ninguna escribe números por su cuenta:</p><ul><li>Las preguntas sobre tu zona (lluvia, rotaciones, heladas) las contesta el cálculo de la app con los datos de la NASA.</li><li>Las preguntas generales las contesta con textos fijos, escritos y revisados por el equipo, que siempre muestran su fuente.</li></ul><p>Si instalas la IA local (opcional, unos 900 MB), un modelo chico que corre en tu propio teléfono ayuda a <b>entender</b> preguntas escritas con otras palabras o en jopará. Primero intenta elegir uno de los temas de esta lista. Si ninguno sirve, escribe una respuesta corta sobre agricultura o sobre cómo usar la app, marcada como <b>escrita por la IA</b>. Puede equivocarse: por eso cada respuesta dice de dónde salió, y los números de tu zona siempre los pone el cálculo.</p>',
        en: '<p>The assistant answers in two ways, and neither writes numbers on its own:</p><ul><li>Questions about your area (rain, rotations, frost) are answered by the app\'s calculation with NASA data.</li><li>General questions are answered with fixed texts, written and reviewed by the team, which always show their source.</li></ul><p>If you install the local AI (optional, about 900 MB), a small model running on your own phone helps <b>understand</b> questions written in other words or in Jopará. It first tries to pick one of the topics in this list. If none fits, it writes a short answer about farming or about how to use the app, marked as <b>written by the AI</b>. It can make mistakes, so every answer says where it came from, and the numbers for your area always come from the calculation.</p>'
      },
      src: 'app/asistente-ia.js · docs/MODO_IA.md', rev: 'equipo, 15-nov-2026'
    }
  ]
};
