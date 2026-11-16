# YvyShift · The field that remembers

**NASA Space Apps Challenge 2026 · Challenge: Field Shift: Adapting Farms with NASA Data · Local event: Asunción, Paraguay (virtual)**

> "Yvy" means land in Guaraní. YvyShift compares real Paraguayan crop rotations (soybean, wheat, black oat, second-crop maize) against 25 seasons of daily NASA POWER data, weighted by the farmer's own priorities. On screen it separates what NASA data decide (water, heat, frost) from what the farmer decides (soil cover, a second harvest).

Core message: *NASA data show what each extra crop costs in water. We checked it against 23 real harvests. The farmer decides what that water is worth.*

Earlier working names were TERRA-SHIFT and Rotation Lab. "Rotation Lab" is now only the name of the comparison module inside the app.

## Links

- Live app: https://yvyshift.web.app
- Source code: https://github.com/StarkProyectspy132/YvyShift
- Project description for the judges: [`docs/PROJECT_PAGE_EN.md`](docs/PROJECT_PAGE_EN.md)

## What it does

A farmer or extension technician picks an area (eight Paraguayan soybean areas stored offline, any point in the world downloaded live from NASA POWER, or a field drawn on the map), a climate scenario, a soil type and their priorities. YvyShift replays four local rotations, plus one the farmer builds, over 25 seasons and shows which one best balances those priorities, how many points come from NASA climate data and how many from the crop calendar, and where the farmer's own judgment matters most.

| Module | What it shows |
|---|---|
| Rotation Lab | Ranking, the reason behind it, sowing calendar, the NASA lens and a rainfall simulation slider |
| Field Monitor | World map with NASA GIBS imagery, the NASA POWER cell behind each point, HLS 30 m images of two dates, drawn fields |
| Field DNA | 25 seasons in one picture: water for soybean, heat, frost and root-zone soil moisture |
| Climate Replay | The hard seasons (2021–22 drought, El Niño, La Niña) and a stress test of every rotation |
| Adaptive Monitor | The current season against the area's history, key dates and month-by-month risk |
| Resilience Passport | Printable report with the evidence, for an agronomist, a cooperative or a bank |
| My fields · Sensors and irrigation | Saved setups on the device; what each sensor or irrigation device would add |
| Assistant | Answers with the app's own numbers and reviewed texts with their source; optional local AI |

## Current status (15 Nov 2026)

| Part | Status |
|---|---|
| Real NASA POWER data 2001–2026 for 8 areas of Paraguay | ✅ cached in `app/data/power_cache.js` |
| Transparent comparison engine (`app/engine.js`) | ✅ covered by automated tests |
| NASA lens: "Show NASA data only" button in Rotation Lab | ✅ |
| Validation against FAO soybean yields (r = −0.83, 23 seasons; 4 of the 5 worst years) and ERA5 rainfall | ✅ [`docs/EXTERNAL_VALIDATION.md`](docs/EXTERNAL_VALIDATION.md) |
| Satellite validation: January MODIS NDVI (MOD13Q1) against the model's water deficit | ✅ [`docs/SATELLITE_VALIDATION_MODIS.md`](docs/SATELLITE_VALIDATION_MODIS.md) |
| Sourced thresholds: heat 35 °C (Salem et al. 2007), frost 2 °C | ✅ cited in the app |
| Second-crop maize limit (model cuts the cycle on 30 April) shown on screen | ✅ |
| Installable app that works offline (PWA), 6 languages | ✅ |
| Field use: Sun mode (high contrast), bottom navigation bar, 44 px touch targets on phones | ✅ |
| Optional local AI in the assistant (Qwen2.5-1.5B via WebLLM) | ✅ works on computers; not available on phones whose GPU is too limited ([`docs/LOCAL_AI.md`](docs/LOCAL_AI.md)) |
| Calendars validated by a local agronomist | ⏳ form ready: [`docs/AGRONOMIST_VALIDATION.md`](docs/AGRONOMIST_VALIDATION.md) |
| SMAP and GPM IMERG as numeric inputs | ⏳ need an Earthdata account; after the event |

## Use of AI in development

The team defined the problem, chose the challenge and the idea, and decided the method and the validation. We used Claude (Anthropic) as a development assistant to research methods and sources, write and test code, design the interface, write documentation and draft translations. Each source file says so in a header comment, and the app says so in its footer. **Every number is computed on the user's device by the calculation engine.**

The app includes an **optional** local AI (off until the user installs it): the open model Qwen2.5-1.5B-Instruct, running in the browser with WebLLM. It first tries to match the question to a topic from a closed list, so the answer comes from the calculation or from reviewed texts with their source. Only when no topic fits does it write a short answer, labelled as written by the AI, and any sentence with a number not found in the app's own texts is removed. See [`docs/LOCAL_AI.md`](docs/LOCAL_AI.md). No AI-generated images or video are used.

## How to run it

Nothing to install and no API keys.

1. Open `app/index.html` in a browser. It works offline with the included cache.
2. For another location, pick a point on the map (Field Monitor) and download the data (public NASA POWER API).
3. To publish it, see [`docs/DEPLOY.md`](docs/DEPLOY.md). The app is static: the `app/` folder is the whole site.

Tests (Node 18 or newer):

```
node --test tests/engine.test.js tests/validation.test.js tests/asistente.test.js
node docs/auditoria_competitiva/verificar_n1.js "$(pwd)"
```

The second command checks the NASA lens result (how often fallow ranks first with climate data only, "clima", against the default weights, "def") in all eight areas.

## Repository structure

```
app/          Static web app (index.html, styles.css, app.js, engine.js, terra.js, viz.js, worldmap.js, asistente-ia.js…)
app/data/     NASA POWER cache by 10-day period, NOAA ONI, validation data (FAO, ERA5, MODIS), knowledge base, images
app/lang/     Interface translations (Guaraní, Portuguese, Japanese, Hindi; Spanish and English are built in)
tests/        Automated tests (node:test)
docs/         Architecture, data, science, validation, limits, decisions, demo script and project page
data/         Source manifest and raw MODIS NDVI values used for validation
```

## Data and method (summary)

- **NASA POWER** Daily API (LaRC), AG community: `PRECTOTCORR`, `T2M`, `T2M_MAX`, `T2M_MIN`, `TOA_SW_DWN`, `GWETROOT`. A regional cell of 0.5° × 0.625° (about 56 × 62 km in Itapúa), not a field.
- **MODIS/Terra NDVI** (MOD13Q1, 250 m, 16 days): images through NASA GIBS and numeric values through the ORNL DAAC MODIS web service, used to validate the model.
- **HLS** (Landsat + Sentinel-2, 30 m) through NASA GIBS: field view, visual only.
- **ET0** Hargreaves-Samani (FAO-56 eq. 52) with Ra = `TOA_SW_DWN`. **Crop demand** ETc = Kc × ET0, Kc from FAO-56 Table 12. Soil water balance with FAO-56 Table 19 soil classes.
- **Indicators per rotation and season:** water deficit, days ≥ 35 °C at flowering, days ≤ 2 °C at the sensitive stage (from NASA data); share of the year with covered soil, harvests per year, crop families (from the calendar).
- **Scenarios:** typical year (median), bad year (1 in 5), El Niño or La Niña seasons (NOAA ONI), or one specific season.
- **Score:** each indicator is normalised against the best rotation and multiplied by the user's weights; the app shows how many points come from climate and how many from the calendar.

Details in [`docs/NASA_DATA_RESEARCH.md`](docs/NASA_DATA_RESEARCH.md), [`docs/SCIENTIFIC_VALIDATION.md`](docs/SCIENTIFIC_VALIDATION.md) and [`docs/EXTERNAL_VALIDATION.md`](docs/EXTERNAL_VALIDATION.md). Limits in [`docs/RISKS_AND_LIMITATIONS.md`](docs/RISKS_AND_LIMITATIONS.md). Decisions in [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md).

## Credits

Data: NASA POWER Project (team at NASA Langley Research Center), funded through the NASA Applied Sciences Program, Earth Science Division; MODIS (NASA LP DAAC) through ORNL DAAC and NASA GIBS; HLS and Blue Marble through NASA GIBS. Method: Allen et al. (1998) FAO-56; Hargreaves & Samani (1985); Salem et al. (2007). Local AI: WebLLM (MLC AI) and Qwen2.5-1.5B-Instruct (Alibaba Cloud), both Apache 2.0. Base map: Esri.

Home background image (`app/data/img/fondo-campo-*.webp`): Asunción seen from the Space Shuttle (STS-72 mission, January 1996), NASA Johnson Space Center, from the NASA Image and Video Library (images.nasa.gov, ID sts072-730-079). It replaced on 15 Nov a photo whose licence could not be confirmed.

Team: [names and roles, added by the team].
