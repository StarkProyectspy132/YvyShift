# Risks and limitations

## Claims we do not make (in the app, the project page, the demo or the pitch)

- "Recommends what to sow" → we say "compares and explores".
- "Your field's data" → "data for your area (a NASA POWER cell of about 56 × 62 km in Itapúa)".
- "Predicts yield" or "raises profit by X %" → we do not calculate that.
- "A satellite measures your soil moisture" → POWER is a reanalysis/model.
- "Predicts the weather" → the app compares with historical data; it does not forecast.
- "Validated by the Ministry of Agriculture" → there is no institutional validation.
- "Unique in the world".

## Risks

| Risk | Mitigation |
|---|---|
| Wrong calendars change the ranking | Calendars are shown in the app; validation form in `AGRONOMIST_VALIDATION.md` |
| Internet fails during the demo | Offline cache; the app works from `app/index.html` |
| The local AI gets a question wrong | Answers are labelled, show their source, and sentences with unknown numbers are removed (see `LOCAL_AI.md`) |

## Known limitations (updated 15 Nov 2026)

| Limitation | What we did | Status |
|---|---|---|
| The ranking is decided by the calendar, not by climate (with NASA data alone, fallow ranks first in 13 to 17 of 25 seasons) | NASA lens and "Show NASA data only" button in Rotation Lab; the pitch says it openly | Shown in the app |
| The second-crop maize harvest falls outside the model window (the model cuts on 30 April; FAO GIEWS describes the harvest still under way in July and August) | Warning in "Where your judgment matters most" when maize is compared | Shown in the app; full fix pending (a cycle that crosses the agricultural year) |
| Heat threshold 35 °C | Source: Salem et al. 2007, Crop Science 47:219 (soybean). For wheat and maize it is still an assumption | Cited in the app |
| Frost threshold 2 °C at 2 m | Sits between meteorological frost (below 0 °C) and agrometeorological frost (below 3 °C), both at 1.5 m, as cited by INTA's Instituto de Clima y Agua (Argentina) | Cited in the app; agronomist check pending |
| The field "greenness" is a colour index on an image, not NDVI | Labelled "Visual greenness index (not NDVI)" | Done |
| Scale: 30 m field images, about 56 × 62 km climate cell | Fixed sentence in the app footer; the map draws the cell | Done |
| Calendars not validated locally | Form ready in `AGRONOMIST_VALIDATION.md` | Pending |
| No costs or prices | Out of scope for the event | Pending |
| Guaraní not reviewed by a native speaker | | Pending |
| Some newer texts appear in English in Portuguese, Guaraní, Japanese and Hindi | Missing translations | Minor, pending |
| The local AI does not run on phones whose GPU offers less than 32 KB of compute workgroup memory | The app says it is not available on that phone; the guided assistant keeps working | By design of the WebLLM library |
