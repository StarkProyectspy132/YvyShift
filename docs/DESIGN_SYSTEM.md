# TERRA-SHIFT · Sistema de diseño

Versión 2026-11-15 (app `rl-v15`). Identidad: la del diseño agrícola v4, ordenada con una escala. Las reglas nuevas viven al final de `app/styles.css`, en el bloque "v14 · Pulido profesional".

## Principios

1. El mapa y el dato van primero; la decoración queda en la portada.
2. El color significa algo. No se usa para adornar.
3. Cada cifra lleva su fuente, su resolución y su límite a la vista.
4. Un componente nuevo usa los tokens; no inventa valores.

## Color (tokens existentes en `:root`)

| Uso | Token | Significado |
|---|---|---|
| Fondo de página | `--bg` | crema en claro, verde muy oscuro en oscuro |
| Superficie | `--panel`, `--soft` | paneles y zonas secundarias |
| Texto | `--ink`, `--muted` | principal y secundario |
| Borde | `--line` | separadores y contornos |
| Vegetación, estado correcto, selección | `--leaf`, `--leaf-soft` | verde |
| Aviso, acción principal | `--amber`, `--amber-btn`, `--amber-soft` | trigo y ámbar |
| Crítico | `--red` | solo alertas |
| Agua | `--c-water` | lluvia, humedad |
| Calor | `--c-heat` | días de calor, sequía |
| Helada | `--c-frost` | días de helada |

El ámbar relleno se reserva para una acción principal por pantalla. El verde relleno marca lo seleccionado.

## Tipografía

- Títulos de marca y de portada: serif (`--display`). Texto e interfaz: sans (`--font`).
- Escala: 12 (metadatos), 13.5 (notas y controles compactos), 15 (texto y títulos de panel), 18 (cifra de tarjeta), 22 a 26 (título de pantalla), 36 o más solo en la portada y en el puntaje ganador.
- Cifras, coordenadas y tablas: `font-variant-numeric: tabular-nums`. En español, coma decimal en todos los números (función `num`).

## Espacio, radio y sombra

- Espaciado en múltiplos de 2: 4, 8, 10, 12, 14, 18.
- Radios: `--r-s` 6 px (controles compactos, etiquetas del mapa), `--r-m` 10 px (mapa, tarjetas internas, avisos), `--r-l` 14 px (paneles). Píldora (999 px) solo en filtros conmutables y botones de la portada.
- Sombra: una sola, `0 1px 2px rgba(27,42,31,.06)`, en paneles. Lo demás se separa con borde `--line`.

## Componentes

- **Barra de pantalla:** etiqueta del módulo en mayúsculas pequeñas y título de 22 a 26 px. Sin barra decorativa.
- **Panel:** borde, radio `--r-l`, relleno 18 px. Sin paneles dentro de paneles: dentro se usan franjas con separadores (`.am-grid`).
- **Botones:** primario relleno ámbar; secundario con borde; de texto para acciones menores. En el mapa, altura 34 px y radio `--r-s`.
- **Mapa:** ocupa la altura disponible (`clamp(460px, 100vh − 250px, 820px)`), barra de herramientas encima, zoom abajo a la derecha, coordenadas arriba a la derecha, atribución abajo a la izquierda.
- **Tablas:** encabezado en mayúsculas pequeñas, filas con separador, mejor valor en verde.
- **Avisos:** `callout` con borde lateral; ámbar para revisar, verde para normal. El texto distingue dato observado de interpretación.
- **Estados vacíos:** los mensajes vacíos no ocupan espacio (`:empty`).

## Movimiento

Solo en la portada: cultivo, polen y luz en `life.js`, a unos 30 cuadros por segundo. Se detiene fuera de la portada, con la pestaña oculta y con `prefers-reduced-motion`. En las pantallas de trabajo no hay animación decorativa.

## Temas e idiomas

Claro y oscuro con los mismos tokens. Seis idiomas; todo texto nuevo pasa por el diccionario.
