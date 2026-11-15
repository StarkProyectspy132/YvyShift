# TERRA-SHIFT · Auditoría de diseño

Fecha: 2026-11-15, 07:40 PY. Versión auditada: `app/` en D: (sw `rl-v13`).

## Cómo se hizo

Se abrió la app real en Chromium a 1366 × 768 y 390 × 820, en español, y se capturaron las nueve pantallas. Las cifras de esta auditoría (tamaños, conteos) se midieron con un script sobre el DOM y sobre `styles.css`. Solo se listan problemas verificados en pantalla o en el código. La comparación con OneSoil, EOSDA, Copernicus Browser y EO Browser se hace de memoria: esos sitios no son accesibles desde el entorno de trabajo.

## Qué es el producto (inventario)

- PWA estática sin framework: `index.html`, `styles.css` (99 KB), `app.js`, `terra.js`, `ui.js`, `worldmap.js`, `engine.js` (25 tests). Sin dependencias externas de código.
- Nueve vistas: Inicio, Field Monitor, Field DNA, Rotation Lab, Climate Replay, Adaptive Monitor, Resilience Passport, Mis parcelas, Sensores y riego.
- Mapa propio (`worldmap.js`): teselas Esri, capa NASA GIBS (Blue Marble y HLS 30 m), dibujo de parcela, GeoJSON.
- Datos reales: NASA POWER 2001–2026 (8 zonas en caché y descarga en vivo), NOAA ONI, FAO (validación), imágenes HLS y MODIS. Simulado: nada en el producto. Experimental y rotulado: recuperación con GWETROOT. No disponible: NDVI por parcela en serie, sensores reales (la vista Sensores es una calculadora manual).
- Tema claro y oscuro, seis idiomas.

## Hallazgos

Prioridad: C = crítica, A = alta, M = media, B = baja.

### Estructura y mapa

| # | Pantalla | Problema verificado | Por qué importa | Solución propuesta | P |
|---|---|---|---|---|---|
| 1 | Field Monitor | El mapa mide 758 × 430 px en una pantalla de 1366 × 768 y empieza a 383 px del borde superior: antes hay un título de 44 px y la introducción. Ocupa un 31 % del área visible. | En un producto geoespacial el mapa es la herramienta. Aquí parece una ilustración dentro de una tarjeta. | Diseño "mapa primero": mapa a toda la altura disponible, lista de zonas como panel lateral compacto, controles flotantes sobre el mapa. | C |
| 2 | Field Monitor | La página mide 2708 px de alto y apila tres visores: mapa mundial, mapa sin conexión de Paraguay y comparador HLS A/B. | El usuario no sabe cuál es "el mapa". Hay que desplazarse tres pantallas. | Un solo espacio de trabajo: mapa principal arriba, comparador de fechas como pestaña o panel inferior, mapa sin conexión plegado (ya lo está). | A |
| 3 | Field Monitor | Capa, fecha y satélite son botones tipo píldora en una fila encima del mapa, mezclados con "Dibujar", "Deshacer" y "Borrar". No hay leyenda ni metadatos de la imagen visibles sobre el mapa. | No se distingue qué controla la vista y qué edita la parcela. | Dos grupos sobre el mapa: capas y fecha a un lado, herramientas de dibujo al otro. Franja de metadatos (fuente, fecha, resolución). | A |
| 4 | Inicio | Es una página de aterrizaje dentro de la app: titular de seis líneas, dos botones, seis tarjetas de módulos que repiten el menú lateral. | Repite la navegación y no muestra el estado de ningún campo. | Mantener el titular, más corto, y convertir el bloque inferior en un resumen real de la zona elegida. | M |
| 5 | Todas | El ancho del contenido cambia entre pantallas: Adaptive Monitor y Rotation Lab usan una columna de unos 790 px; Field DNA y Climate Replay usan 1096 px. | La app parece hecha de plantillas distintas. | Una sola rejilla de contenido con ancho máximo común. | A |
| 6 | Todas las vistas internas | Paisaje ilustrado con sol de unos 250 px de alto al pie de cada pantalla operativa. | Decoración que no informa y alarga cada página. | Dejarlo solo en Inicio, donde va el fondo con vida. | M |

### Aspecto genérico

| # | Pantalla | Problema verificado | Por qué importa | Solución propuesta | P |
|---|---|---|---|---|---|
| 7 | Hoja de estilos | 14 radios de borde distintos (2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 22, 26 px, 50 %, 999 px); 44 sombras; 17 degradados; 75 colores hexadecimales distintos; 24 tamaños de letra. | Sin escala, cada componente decide por su cuenta. Es la causa principal del aspecto "generado". | Tokens: 3 radios, 2 sombras, escala de 7 tamaños, paleta con significado. | C |
| 8 | Todas las vistas internas | Título de página en serif de 44 px en todas las pantallas operativas. | Gasta la zona más valiosa de la pantalla. | Título de 22 a 24 px en una barra de página con el contexto (zona, escenario) a la derecha. | A |
| 9 | Field Monitor, Rotation Lab | 28 y 22 controles tipo píldora visibles a la vez. | Todo parece igual de importante; no hay jerarquía de botones. | Tres niveles: primario, secundario, de texto. Píldora solo para filtros conmutables. | A |
| 10 | Adaptive Monitor | Cuatro tarjetas de indicador dentro de otra tarjeta, y debajo otra caja verde. Tres niveles de contenedor. | Ruido visual; el dato se pierde entre bordes. | Franja de indicadores con separadores, sin tarjetas anidadas. | M |
| 11 | Climate Replay | Ocho tarjetas idénticas, cada una con el mismo enlace "Reproducir en Rotation Lab". Glifos ☀ y ☂ como iconos. | Repetición y símbolos que dependen de la fuente del sistema. | Línea de tiempo de 25 campañas con los episodios marcados; una sola acción. Iconos SVG propios. | A |
| 12 | Rotation Lab | Cinco acordeones con el mismo diseño, cada uno con icono en círculo. | Cinco bloques iguales no comunican qué es evidencia y qué es ayuda. | Pestañas: Resultado, Evidencia, Método. | M |
| 13 | Inicio | Emoji 🎤 en el botón de dictado. | Único emoji de la interfaz; se ve distinto en cada sistema. | Icono SVG. | B |

### Tipografía y datos

| # | Pantalla | Problema verificado | Por qué importa | Solución propuesta | P |
|---|---|---|---|---|---|
| 14 | Rotation Lab, Climate Replay | En español los puntajes usan punto decimal ("95.6", "91.4") y el resto de la app usa coma ("3,0 M ha", "−0,83"). | Inconsistencia en los números: lo primero que mira un evaluador técnico. | Pasar todos los puntajes por el mismo formateador. | A |
| 15 | Tablas | Las cifras no usan numerales tabulares; las columnas no alinean por dígito. | Dificulta comparar valores. | `font-variant-numeric: tabular-nums` en tablas y métricas. | M |
| 16 | Field DNA | El gráfico de recuperación de humedad mide unos 130 px de alto dentro de una tarjeta de 550 px; el resto es texto y espacio vacío. | El gráfico, que es la evidencia, es lo más pequeño de la tarjeta. | Gráfico más alto y nota compacta. | M |
| 17 | Navegación | Módulos con nombre en inglés y subtítulo en español en dos líneas. | Es la terminología del producto; funciona, pero el subtítulo duplica el título de la página. | Mantener nombres; revisar que subtítulo y título no digan lo mismo. | B |

### Lo que funciona y no se toca

- La franja de 25 campañas de Field DNA: densa, legible, con leyenda.
- La tabla de estrés de Climate Replay y la tabla de calidad de la evidencia.
- Fuentes, resoluciones y límites visibles junto a cada dato.
- Sin desborde horizontal a 390 px en ninguna vista; sin errores de JavaScript.
- Motor, datos, idiomas y flujo de parcela propia.

## Conflicto a resolver antes de rediseñar

El 14 de noviembre se descartó el tema oscuro tipo Linear y se fijó el diseño agrícola v4 (verde bosque, crema, trigo, títulos en serif). El encargo nuevo sugiere una interfaz oscura de grafito. Son direcciones opuestas. La propuesta de esta auditoría es conservar la identidad v4, que ya distingue al producto de OneSoil y EOSDA, y aplicar sobre ella las correcciones de estructura (1 a 6), el sistema de tokens (7) y la jerarquía (8 a 12).

## Higgsfield

El conector de Higgsfield disponible en este proyecto solo permite ver generaciones existentes; no puede crear imágenes ni video. La cuenta no tiene generaciones guardadas. El fondo con vida se hará con código (animación propia) y con las imágenes reales de NASA que ya están en la app. Si el equipo genera un video o imagen en Higgsfield, se puede integrar después.
