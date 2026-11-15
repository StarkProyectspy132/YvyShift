# TERRA-SHIFT · Informe del rediseño

Fecha: 2026-11-15. Dirección elegida por Miguel: mantener la identidad v4 y profesionalizarla. Versión: `rl-v15`. Respaldo previo: `_work\backup_pre_pulido_v14\`.

## Qué cambió

| Hallazgo de la auditoría | Estado | Cambio |
|---|---|---|
| 1. Mapa chico en Field Monitor | Resuelto | El mapa pasó de 758 × 430 px a ocupar la altura disponible (unos 520 px en 1366 × 768, hasta 820 px en pantallas grandes) y empieza a 270 px en vez de 383. Lista de zonas más angosta, barra de herramientas compacta. |
| 3. Controles del mapa | Parcial | Botones compactos y rectos. Falta separar capas y dibujo en dos grupos y añadir leyenda sobre el mapa. |
| 5. Anchos distintos | Resuelto | Un ancho común: 1320 px en pantallas de análisis, 1120 px en las de lectura. |
| 6. Paisaje al pie de cada pantalla | Resuelto | Queda solo en la portada. |
| 7. Sin sistema de tokens | Parcial | Escala de radios y sombra definida y aplicada a paneles, mapa, Climate Replay y Adaptive Monitor. El resto de la hoja de estilos conserva valores antiguos. |
| 8. Títulos de 44 px | Resuelto | 22 a 26 px, sin barra decorativa. |
| 10. Tarjetas dentro de tarjetas en Adaptive Monitor | Resuelto | Franja de cuatro indicadores con separadores. |
| 11. Climate Replay repetitivo | Parcial | Tarjetas compactas, sin el enlace repetido ocho veces ni glifos; una sola indicación. No se hizo la línea de tiempo. |
| 13. Emoji del micrófono | Resuelto | Icono SVG. |
| 14. Punto y coma decimal mezclados | Resuelto | Puntajes con coma en español en Rotation Lab y Climate Replay. |
| 15. Numerales tabulares | Resuelto | En tablas y métricas. |
| 16. Gráfico de recuperación chico | Parcial | Altura mínima de 200 px. |
| Fondo con vida | Hecho | Portada con cultivo que se mueve con el viento, polen y luz (`life.js`, dibujo propio). |

## Lo que no se hizo

- 2: Field Monitor sigue teniendo el comparador de fechas debajo del mapa en la misma página.
- 4: la portada sigue siendo de presentación; no muestra un resumen de la zona.
- 9 y 12: jerarquía de botones y pestañas en Rotation Lab.
- 17: sin cambios.
- Normalizar toda la hoja de estilos a los tokens.

## Funcionalidad conservada

Motor y datos sin tocar (25 de 25 tests). Idiomas, parcela propia, mapa mundial, tema oscuro y modo sin conexión siguen funcionando.

## Verificación

- Chromium a 1366 × 768 y 390 × 820: nueve pantallas en español, inglés e hindi, sin errores de JavaScript y sin desborde horizontal.
- Flujo de dibujar, analizar y recargar una parcela: correcto.
- Tema oscuro revisado en Field Monitor.

## Límites de la verificación

- El entorno de pruebas no tiene acceso a NASA ni a Esri: las pruebas usaron respuestas simuladas, así que el mapa con teselas reales y el fondo animado no se vieron en la PC del equipo.
- La comparación con OneSoil, EOSDA, Copernicus Browser y EO Browser se hizo de memoria.
- Higgsfield no permite generar desde este proyecto; no se usó ningún recurso generado.
- No se probó en Safari ni Firefox.
