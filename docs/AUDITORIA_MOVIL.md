# Auditoría de uso en el celular · YvyShift v17

Fecha: 15-nov-2026. Responde a las sugerencias de `New Text Document.txt` (UX agrícola) y al pedido de auditar cómo se ve y se siente la app en el teléfono.

## Cómo se midió

Chromium con emulación de un Pixel 7 (412 × 915 px, pantalla táctil, densidad 2,6), red externa bloqueada para medir el peor caso (sin señal en el campo). Se recorrieron las nueve vistas antes y después de los cambios. En cada vista un script contó:

- **Áreas táctiles chicas:** botones, enlaces, listas desplegables y plegables visibles con menos de 44 × 44 px (mínimo de Apple y de WCAG 2.5.5).
- **Texto chico:** elementos visibles con texto de menos de 13 px.
- **Desborde lateral:** si la página obliga a desplazarse de costado.
- **Letra serif en texto corrido:** párrafos, celdas y etiquetas con fuente serif.
- **Contraste mínimo en modo sol:** la peor relación de contraste entre texto y fondo en la portada y la barra.

No se probó en un teléfono físico ni al sol real: eso queda para Compañero 2 con la URL publicada (punto M-4 del plan).

## Resultados

| Vista | Áreas táctiles chicas (antes → después) | Textos de menos de 13 px (antes → después) |
|---|---|---|
| Inicio | 9 → 1 | 2 → 0 |
| Field Monitor (mapa) | 35 → 8 | 12 → 2 |
| Field DNA | 3 → 0 | 12 → 3 |
| Rotation Lab | 29 → 8 | 16 → 6 |
| Climate Replay | 3 → 0 | 8 → 0 |
| Resilience Passport | 3 → 0 | 8 → 1 |
| Adaptive Monitor (alertas) | 3 → 0 | 9 → 0 |
| Mis parcelas | 3 → 0 | 1 → 0 |
| Sensores y riego | 3 → 0 | 2 → 0 |
| **Total** | **91 → 17** | **70 → 12** |

Desborde lateral: ninguno, antes ni después. Errores de JavaScript: 0. Elementos de texto con letra serif en el celular: 15 → 0. Contraste mínimo en la portada con modo sol: 6,8 : 1 (WCAG AA pide 4,5 : 1 y AAA pide 7 : 1).

Lo que sigue chico, y por qué se dejó: los marcadores de zona sobre el mapa (18 × 44 px, se tocan también desde la lista de zonas), las casillas de verificación dentro de etiquetas que ya miden 44 px de alto, los enlaces dentro de un párrafo (WCAG los exceptúa) y los números de los gráficos SVG y la atribución del mapa (10 a 12 px).

## Cómo se ve y se siente (antes)

La primera impresión era buena: diseño cuidado, sin desborde, botones principales grandes. Pero el uso en el campo tenía cinco roces:

1. **La barra inferior tenía 9 accesos en una tira que se desplazaba de costado.** En pantalla se veían 6 (Inicio, Monitor, DNA, Rotación, Replay, Alertas). Pasaporte, Mis parcelas y Sensores quedaban escondidos a la derecha, sin ninguna pista de que existían. Las etiquetas eran nombres de producto en inglés («Monitor», «DNA», «Replay») y medían 11 px.
2. **La portada hablaba de tecnología, no de decisiones**: «Explora el futuro de tu campo con el pasado observado de la Tierra». Un productor no sabe qué tocar a partir de esa frase.
3. **Títulos serif en cursiva** de 34 a 60 px: bonitos en escritorio, más lentos de leer en un celular con reflejo.
4. **No había un modo para el sol.** El tema claro existía, pero con fondo crema, grises suaves y la portada siempre oscura con degradados: con brillo alto y sol directo, el contraste baja mucho.
5. **Controles chicos en las pantallas de trabajo**: 34 a 36 px de alto en las herramientas del mapa, plegables de 28 px en Rotation Lab, casillas de 18 px.

## Cómo se ve y se siente (después)

- **Barra inferior de 5 botones fijos**, sin desplazamiento: Inicio, Mapa, Rotaciones, Alertas y **Más**. «Más» abre una hoja desde abajo con Field DNA, Climate Replay, Resilience Passport, Mis parcelas y Sensores, cada uno con su descripción, en botones de 60 px. El botón «Más» queda marcado cuando uno de esos módulos está abierto. Se cierra con «Cerrar», tocando afuera o con Escape.
- **Portada en el idioma del productor**: «¿Qué siembro este invierno para aguantar un año seco?», con botones «Ver mi zona en el mapa» y «Comparar qué sembrar», y cuatro **preguntas rápidas** que llevan directo a la respuesta (por ejemplo «¿Cuánto nos golpeó la sequía 2021–22?» abre Rotation Lab con esa campaña elegida).
- **Modo sol** (botón ☀ «Sol» en la barra superior): fondo blanco puro, texto casi negro, bordes de 2 px, sin foto, sin animación ni degradados, letra 17 px, botones de 48 px, toda la tipografía sin serifa. Se recuerda en el teléfono y arranca solo si el sistema pide más contraste.
- **En el celular toda la letra es sin serifa**, incluidos títulos y números. En escritorio se mantienen los títulos serif del diseño v4.
- **Mínimos de 44 px y 13 px** aplicados a botones, listas, plegables, zoom del mapa, casillas (22 px dentro de etiquetas de 44 px) y etiquetas chicas.
- **Fondo de la portada**: foto de un campo al atardecer detrás del texto, con un velo verde oscuro para que el texto se lea. En computadora se desplaza suavemente con el mouse (hasta 22 px). En el celular queda quieta, porque un fondo que se mueve con el giroscopio distrae y gasta batería.

Capturas en `docs/auditoria_movil/` (antes y después, normal y modo sol).

## Pendientes

- Probar en dos o tres teléfonos reales, a pleno sol, con la URL publicada. Anotar qué no se entiende (punto 4.4 del plan).
- El guaraní de los textos nuevos: solo se tradujeron «Sol» (Kuarahy) y «Mapa». El resto aparece en inglés hasta que lo revise un hablante nativo. El portugués quedó completo.
- Japonés e hindi muestran los textos nuevos en inglés.
- El chat y las tarjetas de la portada podrían acortarse en el celular. La portada mide unos 3.460 px de alto, unas cuatro pantallas.
