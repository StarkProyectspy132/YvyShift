# Handoff para Claude B

**Fecha:** sáb 14-nov-2026 ~15:00 PY. **De:** Claude A. **Rama esperada:** `claude-b` (cuando exista el repo, T-02). Hasta entonces, trabajar en la carpeta local sin tocar los archivos de Claude A.

## Qué está hecho
- Idea elegida: **Rotation Lab** (ver `PROJECT_CHARTER.md`, `IDEA_SELECTION.md`).
- `app/engine.js`: motor completo v0. `app/data/power_cache.js`: datos reales POWER 2001–2026 de 2 puntos.
- `tests/engine.test.js`: 13/13 pasan → `node --test tests/engine.test.js`.
- UI ES/EN en `app/` (abrir `app/index.html`).

## Tu alcance (eres dueño de engine.js, data/, tests/)
1. **T-05** Umbrales de calor y helada con referencias (reemplazar 35 °C / 2 °C si la bibliografía lo justifica; documentar en `SCIENTIFIC_VALIDATION.md`).
2. **T-06** Contrastar la lluvia POWER 2021–22 y la mediana con GPM IMERG (o estación DMH). Registrar diferencia en %.
3. ~~**T-07**~~ **Hecho por Claude A** (ver SCIENTIFIC_VALIDATION §3). Pendiente para ti: profundidad de raíces por cultivo y suelo real de la zona. Texto original: Balance hídrico simple con capacidad de agua disponible (CAD, mm) por textura: `almacenamiento = clamp(almac + P − ETc, 0, CAD)`; déficit = demanda no cubierta. CAD como entrada del usuario con valor por defecto citado. Mantener el déficit climático como opción.
4. **T-08 (P2)** Ya hay evidencia visual MODIS NDVI (ene-2022 vs ene-2024) en la app. Si hay cuenta Earthdata (T-16): SMAP L4 humedad de zona radicular oct–ene 2021–22 vs mediana en los 2 puntos, como valores numéricos. La API ORNL de subconjuntos MODIS no respondió desde el equipo: no depender de ella.
5. Integrar los calendarios de Compañero 1 (`data/crop_parameters.csv`) en `ROTATIONS`.

## Reglas
- No cambiar contratos de `ARCHITECTURE.md` sin anotarlo en `DECISION_LOG.md` y avisar.
- Cada número nuevo con fuente, unidad y fecha. Datos sintéticos solo en pruebas y marcados "TEST".
- Añade pruebas para todo lo nuevo. No subas claves.
- Al terminar cada bloque, actualiza esta sección "Entrega de Claude B" abajo.

## Entrega de Claude B
(completar: qué hiciste, archivos, commit, cómo probar, qué falta, riesgos)
