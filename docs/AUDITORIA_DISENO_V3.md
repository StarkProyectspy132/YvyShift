# Auditoría de diseño y rediseño v3

Fecha: 14-nov-2026, noche (PY). Alcance: `app/index.html`, `app/styles.css`, `app/app.js` (solo textos), `app/ui.js` (nuevo), `app/sw.js`. El motor (`engine.js`) no se tocó: 22 de 22 pruebas pasan.

## Medición antes y después

| Pantalla | Antes | Después |
|---|---|---|
| Comparar rotaciones, palabras a la vista | 3.032 | 453 |
| Comparar rotaciones, alto en teléfono | 16.704 px | 3.360 px |
| Distancia hasta ver el resultado en teléfono | unos 2.600 px | unos 650 px |
| Inicio, palabras | 240 | 216, con imagen satelital y dos botones de acción |

Todo el contenido sigue en la app. Lo que cambió es que queda a un toque en lugar de estar siempre a la vista.

## Hallazgos de la auditoría

| # | Gravedad | Hallazgo | Arreglo |
|---|---|---|---|
| 1 | 🔴 | "Comparar" mostraba 3.000 palabras y siete secciones abiertas a la vez | Las secciones 3 a 7 son tarjetas plegables con icono y una línea que dice qué hay adentro |
| 2 | 🔴 | En teléfono el productor pasaba mapa, seis controles, limitaciones y lluvia antes de ver un resultado | Arriba quedan zona, escenario, suelo y cuatro atajos de prioridad. Mapa, ajuste fino, limitaciones, lluvia y rotación propia son plegables |
| 3 | 🔴 | La portada era un chat con un párrafo y cinco cajas de texto: no mostraba el producto | Titular grande, dos botones de acción y la comparación satelital real (NASA HLS, enero 2022 frente a enero 2024) con deslizador |
| 4 | 🔴 | El interruptor "Entender mis frases con IA" se veía siempre, aunque debía estar oculto, y contradecía "sin inteligencia artificial" | Corregido: el atributo `hidden` se respeta en toda la app |
| 5 | 🟡 | Al cambiar de módulo aparecía un recuadro naranja alrededor del título | Quitado (el foco sigue yendo al título para lectores de pantalla) |
| 6 | 🟡 | El icono de tema se veía como un símbolo roto | Icono dibujado en SVG |
| 7 | 🟡 | En teléfono, el menú estaba escondido detrás de un botón | Barra inferior con los seis módulos, como en una app |
| 8 | 🟡 | "Agenda y clima" se desbordaba a lo ancho en teléfono (826 px en una pantalla de 390) | Corregido |
| 9 | 🟡 | Notas metodológicas largas en gris bajo cada gráfico | Quedan detrás de un botón "Más detalle" (13 notas) |
| 10 | 🟡 | El veredicto competía con todo lo demás | Franja de veredicto a todo el ancho con el puntaje grande; barras del ranking más limpias |
| 11 | 🟢 | Agenda: lista de cajas iguales | Línea de tiempo con puntos de color según siembra, etapa sensible o cosecha |
| 12 | 🟢 | Textos de las cifras de portada demasiado largos | Acortados, en español e inglés |

## Qué no se cambió

- Ningún cálculo ni número. Los textos de método y las advertencias siguen completos dentro de los plegables.
- El modo con IA sigue apagado (`config.js` vacío).
- Al imprimir se abren todos los plegables para que el PDF salga completo.

## Qué falta en diseño

- Probar en un teléfono real (solo se probó en navegador a 390 px y 1280 px, tema claro y oscuro, español e inglés).
- Logo definitivo del equipo.
- Los módulos "Mis parcelas" y "Sensores y riego" son los más flojos visualmente: "Sensores" es una pantalla informativa sin función y conviene decidir si se muestra en la demo.
- Si la app ya estaba instalada en un teléfono, hay que cerrarla y abrirla dos veces para que tome la versión nueva (el archivo `sw.js` pasó a `rl-v3`).

## Cómo volver atrás

Los cuatro archivos anteriores están en `_work/backup_pre_rediseno_v3/`. Para deshacer, copiarlos sobre `app/` y borrar `app/ui.js`.

## Ambientación de campo (v4, 14-nov 20:15 PY)

Pedido: que la página se sienta agrícola y cómoda, en la línea de farmminerals.com, seed.com y boweryfarming.com, sin cambiar textos ni propósito.

- Paleta: verde bosque, crema y trigo en lugar de azul marino. Tema oscuro también en verde.
- Titulares con serifa (fuentes del sistema, sin descargas, para que siga funcionando sin conexión).
- Botones y controles en píldora, tarjetas color papel con textura suave.
- Portada: la imagen real de NASA dentro de una forma orgánica y un paisaje de lomas con surcos al pie. Mismo paisaje en el pie de las demás pantallas.
- Mapas e imágenes de satélite con marco de foto, etiquetas crema y puntos verdes.
- Franja de veredicto con trama de surcos. Iconos de la app regenerados en verde.

El paisaje es una ilustración vectorial hecha a mano en el código, decorativa. No se usaron imágenes generadas por IA: las únicas fotos son las de satélite de NASA. No pude ver los tres sitios de referencia desde aquí (la red los bloquea), así que la dirección sale de lo que se conoce de su estilo. Respaldo de la versión anterior: `_work/backup_pre_ambientacion_v4/`.

## v5 · Integración TERRA-SHIFT (14-nov, 23:30 PY)

Fuente: `idea 1/TERRA_SHIFT_Propuesta_Innovacion.md`. Se adaptó sobre la app existente, sin reescribirla. Respaldo de la v4 en `_work/backup_pre_terrashift_v5/`.

| Módulo | Qué hay | Datos |
|---|---|---|
| Field Monitor | Lista de zonas con mini gráfico de lluvia + mapa MODIS al centro + barra de capas con resolución + comparador HLS | Reales (POWER, MODIS 250 m, HLS 30 m) |
| Field DNA | 6 tarjetas de métricas, franjas de 25 campañas, calidad de la evidencia | Reales (POWER) |
| Recuperación de la humedad | Días desde el punto más seco hasta volver al rango p25–p75 | **Experimental**: GWETROOT de modelo, celda de 50 km, no suelo de parcela |
| Rotation Lab | El comparador existente | Sin cambios en el motor |
| Climate Replay | Episodios con criterio explícito (secos ≤ p20, calor ≥ p80, más lluvioso, Niño/Niña) y prueba de estrés | Reales; no es pronóstico |
| Adaptive Monitor | Campaña en curso frente a las mismas fechas de 25 campañas; alertas con variable, umbral, fuente y fecha, sin ordenar acciones | Reales; décadas incompletas excluidas y listadas |
| Resilience Passport | Informe de 8 secciones, imprimible o PDF | Reúne lo anterior con fuentes |

Estética: oscura, minimalista y técnica por defecto (fondo #0A0C0B, bordes de 1 px, acento verde #4ADE80, tipografía sans y mono para datos). El botón de tema da una variante clara.

No implementado (y no se afirma): dibujar polígonos, subir GeoJSON, serie NDVI por parcela (Vegetation Recovery Time), frontera de Pareto, NISAR. Sin rendimientos, ingresos ni IA.

Pruebas: 9 vistas en escritorio y teléfono, oscuro/claro, ES/EN, sin errores JS y sin desborde horizontal; clic en zona, en episodio (va a Rotation Lab con el escenario puesto) y pasaporte verificados; 22/22 pruebas del motor.
