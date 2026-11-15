# Prompt: rediseño visual de YvyShift (v20, solo diseño)

Estoy trabajando en **YvyShift**, una app web estática (HTML, CSS y JavaScript, sin framework ni servidor) para productores agrícolas de Itapúa, Paraguay. Está hecha para el concurso NASA Space Apps 2026. Los datos vienen de NASA POWER (clima diario de 25 campañas) y el cálculo está en `app/engine.js`. La carpeta de trabajo es `D:\Nasa Space challenge apps\app`.

**Tu tarea es solo de diseño visual.** Quiero que las secciones con bloques de texto y cifras dejen de verse como "texto encerrado en un recuadro" y tengan más vida, con gráficos o dibujos sencillos que representen los datos. **No cambies la funcionalidad, los cálculos, los textos, los IDs del DOM, las funciones ni los datos.** Solo HTML y CSS, y el JavaScript únicamente para dibujar gráficos (SVG) dentro de los contenedores que ya existen.

## Qué cambiar, por versión

1. **Versión de escritorio (PC):** usá el estilo de la **maqueta B**: un relato sin recuadros. Arriba va la frase principal en tamaño grande, y debajo un gráfico de barras con los 25 años (marrón = a la soja le faltó agua, verde = le alcanzó). Marcá "2021–22" como "la seca grande" y "2023–24" como "la más lluviosa". Abajo, el calor y las heladas van como frases con un ícono, sin tarjetas. Los datos de humedad van en una regla horizontal con un punto por año.

2. **Versión de celular:** usá el estilo de la **maqueta A**: cada dato dibujado como lo que es. La lluvia como un pluviómetro, las campañas de falta de lluvia como 25 puntos, el calor como un calendario de verano con los días marcados, las heladas como copos, y la humedad como un corte de suelo con raíz. Cada tarjeta tiene su color por tema.

## Secciones que hay que rediseñar (las que tienen columnas de texto)

- **Memoria climática de la zona** (`#v-dna`): cabecera con la frase principal, las tarjetas de KPI (`#dnaCards`) y el gráfico de 25 campañas (`#dnaStripes`).
- **Vuelve a jugar los años difíciles** (`#v-replay`): la línea de tiempo del episodio.
- **Cómo viene esta campaña** (`#v-agenda` / `#amNow`): las cuatro tarjetas de monitoreo (`.am-grid`) y el resumen (`.am-alert`).
- **Informe con evidencias** (`#v-passport`): las secciones del informe.
- **Mis parcelas** (`#v-parcels`): la lista de parcelas.
- **Sensores y riego** (`#v-devices`): las tarjetas de sensores.

## Reglas de estilo

- Usá los colores de `:root` y `[data-theme="dark"]` en `app/styles.css`. Fondo `#0D1F15`, panel `#152C1E`, texto `#F1ECDD`, ámbar `#F0B24A`, verde `#7FD09D`, azul `#6FA8E8`, naranja `#F07A4A`, marrón `#B07A45`.
- Tipografía: `--font` (sans-serif). No uses serifas para cuerpo de texto ni etiquetas en mayúsculas espaciadas.
- Respetá el modo Sol (`:root[data-sun="1"]`): fondos blancos, texto negro, bordes de 2 px.
- Mínimo 44 px de alto para áreas táctiles y 13 px de texto.
- Probá en 375 px (celular) y 1440 px (escritorio), en claro, oscuro y modo Sol.

## Cómo verificar

Ejecutá `node --test tests/engine.test.js tests/validation.test.js tests/asistente.test.js`; deben pasar 32 pruebas. Después abrí `app/index.html` con un servidor local (`python -m http.server`) y revisá las secciones con Playwright o en el navegador. No hagas commit sin que te lo pida.

## Entrega

Dejá los cambios en la carpeta `app`, subí la versión del service worker en `app/sw.js` (de `yvy-v19` a `yvy-v20`) y mostrame las capturas antes de dar por terminado.
