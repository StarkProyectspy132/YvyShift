# Traspaso para preparar la presentación de Rotation Lab

Escrito el 14-nov-2026 (noche, hora de Paraguay) por la sesión de Claude que auditó y amplió el proyecto. Destinatario: la sesión de Claude que va a armar la presentación (pitch, video, diapositivas y página del proyecto).

**Cómo usar este documento:** es el resumen. El detalle está en los documentos enlazados. Antes de citar un número en la presentación, compruébalo en la app o en el documento fuente: si alguien cambia calendarios o umbrales, los números cambian.

---

## 1. Contexto en tres líneas

- **Competencia:** NASA Space Apps Challenge 2026, reto *Field Shift: Adapting Farms with NASA Data*, sede Asunción. Entrega interna dom 15-nov 22:00; la plataforma cierra 23:59. Congelamiento de funciones: dom 15:00.
- **Producto:** Rotation Lab, una web estática (HTML, CSS y JavaScript, sin servidor ni clave) que compara rotaciones de cultivos de Paraguay con 25 campañas de datos diarios de NASA POWER, según las prioridades y limitaciones del productor, y explica por qué gana cada opción y qué tan seguro es el resultado.
- **Criterios del jurado:** Impacto, Creatividad, Validez, Relevancia, Presentación (tarjeta oficial en el chat; sin pesos publicados). Jurados y su lente probable en `docs/JUDGING_STRATEGY.md`.

## 2. Estado al cerrar esta sesión

| Parte | Estado |
|---|---|
| App funcional en español e inglés, tema claro y oscuro, móvil y escritorio | ✅ |
| Pruebas del motor (`node --test tests/engine.test.js`) | ✅ 22 de 22 |
| Revisión en navegador | ✅ a 375 px y 1280 px, sin errores de consola |
| Probada en un teléfono real | ❌ |
| URL pública (GitHub Pages o Netlify) | ❌ ver `docs/PUBLICAR.md` |
| Video, diapositivas | ❌ |
| Página del proyecto | 🟡 `docs/PROJECT_PAGE_EN.md` actualizada, pero con corchetes sin llenar (equipo, proceso, fuentes locales) |
| Validación con un agrónomo | ❌ ficha lista en `docs/VALIDACION_AGRONOMO.md` |
| Inspiraciones del equipo, nombres, logo definitivo | ❌ solo el equipo puede aportarlo |

Peso de la app: 944 KB (incluye la caché de 8 zonas y 6 imágenes).

## 3. Qué hace la app hoy (para el guion de la demo)

Barra lateral con seis módulos:

| Módulo | Qué muestra |
|---|---|
| **Inicio** | Pantalla oscura minimalista con un **asistente guiado sin IA**. Se escribe o se dicta ("quiero registrar mi parcela de tomates en San Lorenzo"). Reconoce unos 30 lugares, suelos, 9 cultivos, limitaciones ("no siembro trigo") y prioridades ("quiero cuidar el agua"). Responde con los números del cálculo. Debajo, cinco cifras: 25 campañas, 369 mm, −50 %, 3,0 M ha, r = −0,83 |
| **Comparar rotaciones** | Siete secciones numeradas: 1 Configura (zona, escenario, suelo, mapa de la Región Oriental, prioridades con atajos, limitaciones, lluvia hipotética, rotación propia), 2 Resultado (tarjeta de veredicto, ranking con desglose "clima NASA · calendario", tabla), 3 ¿Se sostiene? (25 campañas una por una, siembra ±10 días, calendario), 4 Evidencia NASA (lluvia frente a demanda, El Niño y La Niña, control de coherencia con GWETROOT, NDVI de MODIS de cualquier enero), 5 Confianza (exploratorio, datos que faltan, **validación con datos independientes**), 6 Preguntas guiadas, 7 Método |
| **Ver el campo** | Imágenes **NASA HLS de 30 m** (Landsat y Sentinel-2) de un recuadro de ~16 × 14 km, dos fechas comparadas con un **deslizador**. Por defecto, Itapúa 24-ene-2022 (sequía, lotes marrones) frente a 3-ene-2024 (verde) |
| **Agenda y clima** | Fechas clave de la rotación (marcadas como supuestas), cada etapa sensible con su riesgo histórico observado, riesgo de helada y calor mes por mes, El Niño ahora |
| **Mis parcelas** | Guardar y volver a cargar zona, suelo y limitaciones (solo en el dispositivo) |
| **Sensores y riego** | Panel informativo: qué aportaría cada dispositivo. Sin datos simulados |

**Cobertura:** 8 zonas sin conexión (Itapúa, Alto Paraná, Canindeyú, San Pedro, Caaguazú, Caazapá, Amambay, Misiones); cualquier otro punto de Paraguay se descarga en vivo. 4 rotaciones fijas (A base soja + barbecho, B soja + trigo, C soja + avena negra, D soja temprana + maíz zafriña) y 9 cultivos para armar una propia (5 de ellos con parámetros FAO-56 genéricos: girasol, canola, sorgo, sésamo, poroto).

## 4. Lo que se hizo en esta sesión, por tema

1. **Auditoría y rediseño de la interfaz.** Portada con cifras, tarjeta de veredicto, ranking legible, secciones numeradas con navegación, leyendas, accesibilidad, logo SVG. Detalle: `docs/AUDIT.md`, sección "Auditoría de diseño".
2. **Auditoría contra los criterios** reescrita y actualizada varias veces. Estado final en `docs/AUDIT.md`, sección "Verificación contra los criterios oficiales".
3. **Hallazgo N-1 (clave para el mensaje):** la mitad del peso por defecto viene del calendario de cada rotación, no de datos NASA. Con solo las dimensiones climáticas, el barbecho gana 17 de 25 campañas. La app lo muestra debajo de cada barra.
4. **Indicador de salud del suelo:** diversidad de cultivos (familias botánicas).
5. **Control de coherencia** del balance de agua con GWETROOT de NASA POWER (r = 0,61 y 0,58). Mostró que el balance simple reacciona más fuerte que NASA en años secos: el déficit de 348 mm de 2021–22 puede estar exagerado.
6. **El Niño / La Niña** con el índice ONI de NOAA, como análisis histórico, no como pronóstico.
7. **Ayuda guiada sin IA** ("Pregúntale a tus datos") y, después, **asistente conversacional sin IA** en Inicio.
8. **Limitaciones del productor, avisos de criterio humano, lluvia hipotética, selector de año satelital, mapa** (respuesta a las "Potential Considerations" del reto, copiadas en `docs/CHALLENGE_TEXT.md`).
9. **Barra lateral con módulos**, agenda, parcelas, sensores.
10. **Cálculo del peso de agregar IA:** `docs/IA_TAMANO.md`. Decisión: asistente por reglas (0,6 MB) en lugar de un modelo local (140 MB a 1,15 GB) o en la nube (servidor, costo, datos fuera del teléfono).
11. **Validación externa sin agrónomo** contra rendimientos reales de la FAO y lluvia ERA5. Detalle: `docs/VALIDACION_EXTERNA.md`.
12. **De 2 a 8 zonas, de 4 a 9 cultivos, módulo "Ver el campo"** con HLS, a partir de la propuesta del PDF del equipo (`nasa.pdf`).
13. **Material para el equipo:** `docs/PITCH_SCRIPT.md` (guion nuevo), `docs/VALIDACION_AGRONOMO.md`, `docs/PUBLICAR.md`.

## 5. Números verificados para la presentación

Todos salen de la app o de las fuentes citadas. Fecha de cálculo: 14-nov-2026.

### Problema e impacto

| Dato | Valor | Fuente |
|---|---|---|
| Lluvia para la soja en la sequía 2021–22, Itapúa | **369 mm frente a 729 mm** que pedía el cultivo | NASA POWER + FAO-56 (app) |
| Esa campaña en Itapúa | ET0 más alta (1.604 mm) y más días ≥ 35 °C (76) desde 2001 | NASA POWER (app) |
| Caída de la producción nacional de soja 2021–22 | **−50 %**: de 10,5 a 5,2 millones de t; rendimiento de 2,89 a 1,47 t/ha | FAO (vía Our World in Data). USDA y CAPECO dan cifras más bajas |
| Soja en la Región Oriental | **3.009.608 ha** (2022); más del 87 % en Alto Paraná, Canindeyú, Itapúa, San Pedro y Caaguazú | Censo Agropecuario Nacional 2022, citado por Última Hora |
| Pequeños productores | Casi **39.000** (fincas de menos de 20 ha) plantan el 20 % de la soja | UGP, **2017**, citado por Última Hora. Decir el año |
| Peso de Paraguay en el comercio mundial | **3,9 %** de las exportaciones de soja, promedio desde 2000 | farmdoc daily, Universidad de Illinois, abr-2026 |

### Validez (lo más fuerte del proyecto)

| Dato | Valor |
|---|---|
| Correlación entre el agua que faltó según el modelo y la anomalía del rendimiento real de soja (FAO, 23 campañas, 5 departamentos) | **r = −0,83** |
| Peores años detectados | **4 de los 5 peores** (2021–22, 2011–12, 2008–09, 2005–06); probabilidad al azar **0,3 %** |
| Sin la sequía 2021–22 | r = −0,77 |
| En cada una de las 8 zonas por separado | r entre −0,59 y −0,86 |
| Lluvia NASA POWER frente a ERA5 (otra fuente) | r = 0,74 (Itapúa) y 0,85 (Alto Paraná); 2021–22 en Itapúa: 369 frente a 381 mm |
| Calendario de soja | Dentro de la ventana publicada (farmdoc daily) |
| Calendario de maíz zafriña | **No coincide**: la FAO reporta cosecha junio–agosto, el modelo lo corta el 30 de abril. Puede subestimar el riesgo de helada de la rotación D. Está dicho en la app |
| El modelo no se ajustó con los datos de la FAO | Sus parámetros salen de FAO-56 y de los supuestos declarados |

**Frase sugerida:** *"Sin ajustar nada, el modelo encuentra 4 de los 5 peores años de la soja paraguaya desde 2002."*

### Resultados del comparador (pesos por defecto, suelo arcilloso, Itapúa)

| Dato | Valor |
|---|---|
| Campaña por campaña | D primera en 12 de 25, B en 7, C en 6, A en 0. Alto Paraná: B 10, D 10, C 5 |
| Año típico | C 91,4 · B 85,3 · D 82,4 · A 74,1 |
| Sequía 2021–22 | D primera con 96,4; su soja temprana tuvo 27 días de calor en floración frente a 38 |
| Solo dimensiones climáticas | El barbecho (A) gana 17 de 25 |
| Siembra ±10 días | El liderazgo cambia: las fechas reales importan |
| Con 20 % menos de lluvia (simulación) | D sigue primera más veces: 10 de 25 (B 8, C 7) |

### El Niño (análisis histórico, no pronóstico)

| Dato | Valor |
|---|---|
| Itapúa, campañas con La Niña (10) | Mediana 614 mm de lluvia para la soja; faltó agua en 6 de 10 |
| Itapúa, campañas con El Niño (9) | Mediana 848 mm; faltó agua en 1 de 9 |
| Rangos | Se superponen (369–902 frente a 637–1.141 mm): la fase inclina la balanza, no decide |
| Último ONI publicado por NOAA al 14-nov | ago–oct 2026 = **+2,46** (El Niño). **Verificar en la fuente antes de grabar** |

### Asistente e IA

App con asistente por reglas: 0,6 MB. Con IA local: ~140 MB (clasificador) a ~505 MB (modelo que conversa, 0,5 mil millones de parámetros). Detalle: `docs/IA_TAMANO.md`.

## 6. Mensaje recomendado para la presentación

1. **No es un tablero de clima: compara decisiones.** El productor pone prioridades y limitaciones; la herramienta muestra compromisos, no da órdenes.
2. **Dice de dónde sale cada punto.** Debajo de cada barra se ve cuánto viene de datos NASA y cuánto del calendario. Mensaje honesto sobre el hallazgo N-1: *"Los datos de NASA muestran cuánta agua cuesta cada cultivo extra, campaña por campaña. Rotation Lab pone ese costo al lado de lo que el productor gana a cambio: suelo cubierto y otra cosecha."*
3. **Está validado contra la realidad** sin ajustar nada (r = −0,83, 4 de 5 peores años).
4. **Dice dónde puede fallar:** muestra la diferencia con GWETROOT, el calendario del maíz que no coincide y cuándo el resultado es casi un empate.
5. **Funciona donde está el productor:** sin conexión, en el teléfono, sin clave, en español e inglés.

### Lo que no hay que decir

Lista completa en `docs/RISKS_AND_LIMITATIONS.md`. Las más importantes:
- **"Inteligencia artificial" o "IA".** La app dice de sí misma que no usa IA. Decir "asistente guiado".
- "Recomienda qué sembrar" → decir "compara y explora".
- "Predice el clima" o "pronostica El Niño" → es análisis histórico.
- "Datos de tu parcela" → la celda de NASA POWER mide unos 50 km. Las imágenes HLS sí son de 30 m, pero son color real, no un índice, y no entran en el puntaje.
- "Validado por el MAG" o "por agrónomos" → no lo está.
- "Controla tus sensores o tu riego" → no se conecta a ningún dispositivo.

## 7. Recorrido de demo sugerido (90 s)

1. **Gancho:** "NOAA mide hoy un El Niño de +2,46. ¿Qué pasó en Paraguay las otras veces?" (verificar el valor).
2. **Inicio:** escribir en el asistente "quiero registrar mi parcela en Itapúa, suelo arcilloso"; se ve que entiende y responde con números.
3. **Comparar rotaciones**, campaña 2021–22: tarjeta de veredicto (D primera) y desglose "clima NASA · calendario" bajo la barra.
4. Atajo **"Cuidar el suelo"**: cambia la ganadora.
5. **Ver el campo:** deslizar entre enero de 2022 (marrón) y enero de 2024 (verde). Funciona sin conexión en Itapúa.
6. **Sección 5, validación:** el gráfico de puntos con 21/22, 11/12, 08/09, 05/06 marcados; "4 de 5, r = −0,83".
7. Botón **English**.

Plan B sin internet: abrir `app/index.html` con doble clic. Todo funciona salvo la descarga de zonas nuevas y las imágenes satelitales de otras fechas o zonas.

## 8. Preguntas probables del jurado

Respuestas en `docs/PITCH_SCRIPT.md`, tabla final. Las nuevas:
- **¿Cómo saben que acierta?** FAO, r = −0,83, 4 de 5 peores años, sin ajustar.
- **¿Por qué solo esas rotaciones?** Las 4 fijas tienen calendario contrastado con fuentes; se pueden armar otras con 9 cultivos, marcadas como genéricas.
- **¿Por qué no usan IA?** Cada número tiene que poder rastrearse; una IA local pesaría cientos de MB y podría inventar cifras.
- **¿Por qué no SMAP o IMERG?** Requieren cuenta Earthdata; está como siguiente paso. Sí se contrastó la lluvia con ERA5.
- **¿El modelo tiene errores conocidos?** Sí, y la app los muestra: el balance exagera la sequedad en años secos y el calendario del maíz zafriña es corto.

## 9. Lo que falta y quién lo hace

| Pendiente | Quién |
|---|---|
| Publicar la URL (`docs/PUBLICAR.md`, 2 minutos con Netlify) | Equipo |
| 20 minutos con un agrónomo (`docs/VALIDACION_AGRONOMO.md`) | Equipo |
| Inspiraciones, dificultades, nombres y roles para la página y el video | Equipo |
| Texto completo del reto (Objectives y otros bloques) en `docs/CHALLENGE_TEXT.md` | Equipo |
| Prueba en un teléfono real | Equipo |
| Video y diapositivas | Equipo + Claude de presentación |
| Completar corchetes de `docs/PROJECT_PAGE_EN.md` | Equipo + Claude de presentación |

Criterios con hueco al cerrar (detalle en `docs/AUDIT.md`): **Impacto** "¿inspira?" (falta voz humana), **Validez** (calendarios sin validación local completa), **Presentación** (página, video, inspiraciones, URL).

## 10. Mapa de archivos

| Archivo | Para qué |
|---|---|
| `docs/AUDIT.md` | Auditoría completa, verificación de criterios, decisiones de diseño, ideas evaluadas (chatbot, domótica, etc.), posibilidades de ganar |
| `docs/VALIDACION_EXTERNA.md` | Validación con FAO y ERA5, cifras de impacto con fuente |
| `docs/PITCH_SCRIPT.md` | Guion de 30 s, 90 s y 3 min, y respuestas al jurado |
| `docs/PROJECT_PAGE_EN.md` | Borrador de la página del proyecto en inglés |
| `docs/IA_TAMANO.md` | Cálculo del peso de agregar IA |
| `docs/SCIENTIFIC_VALIDATION.md` | Fórmulas, supuestos, resultados del motor |
| `docs/JUDGING_STRATEGY.md` | Jurados y criterios |
| `docs/RISKS_AND_LIMITATIONS.md` | Afirmaciones prohibidas |
| `docs/CHALLENGE_TEXT.md` | Texto del reto disponible |
| `docs/VALIDACION_AGRONOMO.md`, `docs/PUBLICAR.md` | Fichas para el equipo |
| `app/` | La aplicación (`engine.js` motor, `app.js` interfaz, `data/` cachés y datos de validación) |
| `tests/engine.test.js` | 22 pruebas |
| `_work/validacion/` | Scripts y datos descargados para repetir la validación y ampliar zonas (no se suben al repositorio) |
| `_work/backup_pre_rediseno/` | Archivos originales antes del rediseño |

## 11. Fuentes externas usadas

- NASA POWER Daily API — https://power.larc.nasa.gov/
- NASA GIBS (MODIS NDVI y HLS) — https://gibs.earthdata.nasa.gov/ · NASA Worldview — https://worldview.earthdata.nasa.gov/
- NOAA CPC, ONI — https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt
- FAO, FAOSTAT (vía Our World in Data) — https://ourworldindata.org/grapher/soybean-yields
- FAO-56, tablas 11 y 12 — https://www.fao.org/4/x0490e/x0490e0b.htm
- FAO GIEWS, Paraguay — https://www.fao.org/giews/countrybrief/country.jsp?code=PRY
- ERA5 vía Open-Meteo — https://open-meteo.com/en/docs/historical-weather-api
- farmdoc daily, 21-abr-2026 — https://farmdocdaily.illinois.edu/2026/04/paraguays-role-in-the-global-soybean-market.html
- Última Hora (CAN 2022) — https://www.ultimahora.com/la-soja-tuvo-minimo-impacto-en-cambio-de-uso-de-suelos
- Última Hora (UGP 2017) — https://www.ultimahora.com/casi-39000-pequenos-productores-plantan-el-20-del-total-la-soja-n1103857

Qué es dato descargado, qué es leído en una página y qué es supuesto: ver el apartado "Fuentes" de `docs/VALIDACION_EXTERNA.md` y la sección 5 de este documento.
