# Architecture

```
NASA POWER API ──(fetch, no key)──► aggregateDaily() ──► 10-day periods per season
        │                                                     │
        └─ offline cache app/data/power_cache.js ─────────────┘
                                                              ▼
           ROTATIONS + CROPS (FAO-56 Kc, calendars) ─► evaluateYear() ─► indicators per season
                                                              ▼
                       scenario (median | 1-in-5 | one season | ENSO phase) ─► scenarioValues()
                                                              ▼
                              user weights ─► compare() + explain() + confidence()
                                                              ▼
              UI: app.js (Rotation Lab), terra.js and viz.js (Field DNA, Replay, Monitor, Passport),
                  worldmap.js (map), asistente-ia.js (assistant)
```

**Decision:** 100 % static (HTML + JavaScript, no dependencies, no build step). Reasons: it works offline, it can be published for free, it needs no keys, and a judge can open it in one click. Rejected: a Python/Flask backend (more points of failure, hosting).

## Modules

| File | Content |
|---|---|
| `app/engine.js` | Pure calculation, no screen code. UMD: runs in the browser and in Node |
| `app/app.js`, `index.html`, `styles.css` | Interface, Spanish/English texts, Rotation Lab, guided assistant |
| `app/terra.js`, `app/viz.js` | Field DNA, Climate Replay, Adaptive Monitor, Resilience Passport; SVG drawings of the climate data |
| `app/worldmap.js` | Map viewer with NASA GIBS and Esri tiles, drawn fields, GeoJSON import and export |
| `app/asistente-ia.js`, `app/ia-worker.js`, `app/data/conocimiento.js` | Knowledge base and optional local AI (see `LOCAL_AI.md`) |
| `app/lang/*.js` | Guaraní, Portuguese, Japanese and Hindi texts (English is the fallback) |
| `app/sw.js`, `app/manifest.webmanifest` | Offline cache and installation (PWA) |
| `app/data/power_cache.js` | Generated NASA POWER cache; never edited by hand |
| `tests/` | Automated tests with `node:test` |

## Contracts

**10-day period** (compact cache format): `[n, p_mm, et0_mm, heat_days, frost_days, gwetroot_mean, complete(0/1)]`; in memory `{n, p, et0, heat, frost, gwr, complete}`. Agricultural year = key `"2021"` → May 2021 to April 2022 in the southern hemisphere (November to October in the northern hemisphere); index 0 = 1–10 May.

**Rotation:** `{ id, name, baseline?, crops: [{ crop: 'soja'|'trigo'|'avena'|'maiz', start: 0..35, len }] }`.

**Scenario result:** `{ waterDeficit, heatDays, frostDays, coverPct, grainHarvests, years[] }`.

**compare() →** `[{ id, score, contributions: { <dimension>: { value, normalized, weight, points } } }]`, sorted from best to worst.

To add a dimension (for example SMAP): add a field to the 10-day period, to `evaluateYear` and an entry in `DIMENSIONS`; the interface picks it up by itself (only its colour and texts need adding in `app.js`).
