# YvyShift · Field Shift Paraguay

**NASA Space Apps Challenge 2026 · Reto: Field Shift: Adapting Farms with NASA Data · Sede: Asunción (virtual)**

> «Yvy» es tierra en guaraní. YvyShift compara rotaciones reales de Paraguay (soja, trigo, avena negra, maíz zafriña) con 25 campañas de datos diarios de NASA POWER, según las prioridades del productor, y separa en pantalla lo que deciden los datos NASA (agua, calor, heladas) de lo que decide el productor (suelo cubierto, segunda cosecha).

Mensaje central: *NASA data show what each extra crop costs in water. We checked it against 23 real harvests. The farmer decides what that water is worth.*

Antes se llamó TERRA-SHIFT y Rotation Lab. «Rotation Lab» queda solo como nombre del módulo de comparación dentro de la app.

## Estado real (15-nov-2026, 11:00 PY)

| Parte | Estado |
|---|---|
| Datos NASA POWER reales 2001–2026, 8 zonas de Paraguay | ✅ en caché (`app/data/power_cache.js`) |
| Motor de comparación transparente (`app/engine.js`) | ✅ 25 pruebas pasan (`node --test tests/engine.test.js`) |
| **Lente NASA**: botón «Ver solo los datos NASA» en Rotation Lab (hallazgo N-1 de la auditoría) | ✅ nuevo |
| Validación contra rendimientos FAO (r = −0,83, 23 campañas; 4 de los 5 peores años) y lluvia ERA5 | ✅ `docs/VALIDACION_EXTERNA.md` |
| **Validación con satélite**: NDVI MODIS (MOD13Q1) de enero frente al déficit del modelo | ✅ nuevo, ver `docs/VALIDACION_SATELITAL_MODIS.md` |
| Umbrales con fuente: calor 35 °C (Salem et al. 2007), helada 2 °C (entre 0 °C y 3 °C del SMN) | ✅ citados en la app |
| Límite del maíz zafriña (el modelo corta el 30-abr) avisado en pantalla | ✅ |
| Índice de verdor de la parcela rotulado «no es NDVI» | ✅ |
| Mensaje claro si falla la descarga de NASA POWER (antes: «Failed to fetch») | ✅ |
| Pie con escala (celda de unos 56 × 62 km, imágenes de 30 m) y declaración de uso de IA | ✅ |
| **Uso en el campo (v17)**: modo sol de alto contraste, barra inferior de 5 botones con «Más», preguntas rápidas en la portada, letra sin serifa y áreas táctiles de 44 px en el celular | ✅ nuevo, ver `docs/AUDITORIA_MOVIL.md` |
| Fondo de portada con foto de campo que se mueve con el mouse | ✅ nuevo; ⚠️ confirmar la licencia de la foto (ver abajo) |
| Modo con IA (Gemini) | ❌ quitado por completo el 15-nov (ver `docs/MODO_IA.md`) |
| App instalable que funciona sin conexión (PWA), 6 idiomas | ✅; falta probar en teléfono real con la URL publicada |
| Mapa mundial, parcelas dibujadas, imágenes HLS de 30 m, El Niño / La Niña, asistente guiado con base de conocimiento (sin IA) | ✅ |
| IA local opcional (beta): solo elige un tema de una lista cerrada; no redacta respuestas | 🧪 Sin probar en teléfonos reales |
| URL pública | ⏳ Miguel: Netlify Drop con `entrega/yvyshift-app.zip` (ver `docs/PUBLICAR.md`) |
| Video de demo de 30 s en inglés | ⏳ guion listo: `docs/DEMO_SCRIPT_30S_EN.md` |
| Página del proyecto en inglés | ⏳ texto listo: `docs/PROJECT_PAGE_EN.md` (faltan 4 enlaces/datos del equipo) |
| Calendarios validados con agrónomo | ⏳ Compañero 1 (`docs/VALIDACION_AGRONOMO.md`) |
| SMAP / IMERG numéricos | ⏳ requieren cuenta Earthdata; para después del envío |

## Uso de IA en el desarrollo (AI use)

El equipo definió el problema, eligió el reto y la idea, y decidió el método y la validación. Usamos Claude (Anthropic) como asistente de desarrollo para investigar métodos y fuentes, escribir y probar código, escribir documentación y preparar traducciones. Cada archivo de código lo reconoce en un comentario de cabecera, y la app lo dice en el pie. **Todos los números se calculan en el dispositivo del usuario.** La app trae una IA local **opcional** (beta, Llama 3.2 1B vía WebLLM, se instala con un botón): solo elige el tema de la pregunta de una lista cerrada; las respuestas salen del cálculo o de textos fijos revisados con su fuente. Ver `docs/MODO_IA.md`. No se usaron imágenes ni videos generados con IA.

*The team defined the problem, chose the challenge and the idea, and decided the method and validation. We used Claude (Anthropic) as a development assistant for research, code, documentation and translations. Every number is computed on the user's device. An optional local AI (beta, Llama 3.2 1B via WebLLM, off by default) only picks the topic of a question from a closed list; it never writes the answer.*

## Cómo ejecutar

No necesita instalar nada ni claves API.

1. Abrir `app/index.html` en el navegador (doble clic). Funciona sin internet con la caché incluida (plan B de la demo).
2. Para otra ubicación: elegir un punto en el mapa (Field Monitor) o escribir latitud y longitud → «Descargar datos» (API pública de NASA POWER).
3. Para publicar: `docs/PUBLICAR.md` (Netlify Drop o GitHub Pages; la app es estática).

Pruebas (requiere Node 18+):

```
node --test tests/engine.test.js
node docs/auditoria_competitiva/verificar_n1.js "<ruta de la carpeta del proyecto>"
```

## Estructura

```
app/            Aplicación web estática (index.html, styles.css, app.js, engine.js, terra.js, worldmap.js…)
app/data/       Caché NASA POWER por dekada, ONI de NOAA y datos de validación (FAO, ERA5, MODIS)
tests/          Pruebas del motor (node:test)
docs/           Decisiones, arquitectura, datos, validación, guion, página del proyecto y auditoría
data/           Manifiesto de fuentes
entrega/        Paquete listo para publicar (yvyshift-app.zip)
Prompts/ Skills/ Jurados/   Material original del equipo (no modificar, no publicar)
```

No se publican: `server/ai-proxy/`, `tests/aiproxy.test.js`, `app/config.js`, `docs/PUBLICAR_GOOGLE_CLOUD.md` (restos del modo IA retirado), `_work/`, `Jurados/`, el video `.mp4` ni la transcripción de la reunión.

## Datos y método (resumen)

- **NASA POWER** Daily API (LaRC), comunidad AG: `PRECTOTCORR`, `T2M`, `T2M_MAX`, `T2M_MIN`, `TOA_SW_DWN`, `GWETROOT`. Celda regional de 0,5° × 0,625° (unos 56 × 62 km en Itapúa), no parcela.
- **MODIS/Terra NDVI** (MOD13Q1, 250 m, 16 días): imágenes vía NASA GIBS y valores numéricos vía el servicio web MODIS de ORNL DAAC, usados para validar el modelo.
- **HLS** (Landsat + Sentinel-2, 30 m) vía NASA GIBS: vista de la parcela, solo visual.
- **ET0** Hargreaves-Samani (FAO-56 ec. 52) con Ra = `TOA_SW_DWN`. **Demanda del cultivo** ETc = Kc × ET0, Kc de FAO-56 Tabla 12. Balance de agua con clases de suelo FAO-56 Tabla 19.
- **Indicadores por rotación y campaña:** déficit hídrico, días ≥ 35 °C en floración, días ≤ 2 °C en etapa sensible (de los datos NASA); % del año con suelo cubierto, cosechas por año, familias de cultivo (del calendario).
- **Escenarios:** año típico (mediana), año desfavorable (1 de cada 5), fases de El Niño / La Niña (ONI de NOAA) o una campaña concreta.
- **Puntaje:** normalización proporcional al máximo entre rotaciones × pesos del usuario; se muestra cuántos puntos vienen del clima y cuántos del calendario.

Detalle en `docs/NASA_DATA_RESEARCH.md`, `docs/SCIENTIFIC_VALIDATION.md` y `docs/VALIDACION_EXTERNA.md`. Límites en `docs/RISKS_AND_LIMITATIONS.md`. Respuesta punto por punto a la auditoría en `docs/auditoria_competitiva/10_RESPUESTA_A_LA_AUDITORIA.md`.

## Créditos

Datos: NASA Langley Research Center (LaRC) POWER Project, financiado por el programa NASA Earth Science/Applied Science; MODIS (NASA LP DAAC) vía ORNL DAAC y NASA GIBS. Método: Allen et al. (1998) FAO-56; Hargreaves & Samani (1985); Salem et al. (2007).
Foto de fondo de la portada (`app/data/img/fondo-campo-*.webp`): tomada de 4kwallpapers.org (lleva su marca de agua). **Licencia sin confirmar**: antes de publicar, confirmar que se puede usar o reemplazarla por una foto propia del equipo con el mismo nombre de archivo.
Equipo: [completar nombres y roles].
