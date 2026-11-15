# Arquitectura

```
NASA POWER API ──(fetch, sin clave)──► aggregateDaily() ──► dekadas por campaña
        │                                                     │
        └─ caché offline app/data/power_cache.js ─────────────┘
                                                              ▼
           ROTATIONS + CROPS (Kc FAO-56, calendarios) ─► evaluateYear() ─► indicadores por campaña
                                                              ▼
                       escenario (mediana | p80 | año) ─► scenarioValues()
                                                              ▼
                              pesos del usuario ─► compare() + explain() + confidence()
                                                              ▼
                                       UI (app.js): ranking, tabla, evidencia, confianza
```

**Decisión:** 100 % estático (HTML + JS sin dependencias). Motivos: funciona offline (plan B), se publica gratis (GitHub Pages), cero claves, el jurado lo abre en un clic. Descartado: backend Python/Flask (más puntos de falla, hosting).

## Módulos
| Archivo | Responsable | Contenido |
|---|---|---|
| `app/engine.js` | Claude B (dueño desde ahora) | Cálculo puro, sin DOM. UMD: navegador y Node |
| `app/app.js`, `index.html`, `styles.css` | Claude A | Interfaz, i18n ES/EN, gráfico SVG |
| `app/data/power_cache.js` | Claude B | Caché generada; nunca a mano |
| `tests/` | Claude B | Pruebas `node:test` |

## Contratos (no cambiar sin anotar en DECISION_LOG)
**Dekada** (formato compacto en caché): `[n, p_mm, et0_mm, dias_calor, dias_helada, gwetroot_media, completa(0/1)]`; en memoria `{n,p,et0,heat,frost,gwr,complete}`. Año agrícola = clave `"2021"` → mayo-2021 a abril-2022; índice 0 = 1–10 mayo.

**Rotación:** `{ id, name, baseline?, crops: [{ crop: 'soja'|'trigo'|'avena'|'maiz', start: 0..35, len }] }`.

**Resultado de escenario:** `{ waterDeficit, heatDays, frostDays, coverPct, grainHarvests, years[] }`.

**compare() →** `[{ id, score, contributions: { <dim>: { value, normalized, weight, points } } }]` ordenado desc.

Para añadir una dimensión (p. ej. SMAP): agregar campo a la dekada, a `evaluateYear` y una entrada en `DIMENSIONS`; la UI la toma sola (falta solo color y textos en `app.js`).
