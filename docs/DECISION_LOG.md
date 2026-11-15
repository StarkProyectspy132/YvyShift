# Decision log

| Date (PY) | Decision | Why | Alternatives discarded | Who |
|---|---|---|---|---|
| 3 Nov | Challenge: Field Shift | Agriculture is central to Paraguay; NASA data are plentiful | The other 13 challenges | Team |
| 14 Nov 14:40 | Venue: Asunción (virtual) | Confirmed by the team lead | Encarnación | Team |
| 14 Nov 14:50 | Idea: Rotation Lab (rotation comparison with climate scenarios) | Highest score in the team's idea ranking (40/50) | SMAP alert (29), AI chatbot (24) | Team, with Claude |
| 14 Nov 14:50 | Pilot area Itapúa + Alto Paraná | Soybean core area; where the 2021–22 drought hit hard | Chaco (a different production system) | Team, with Claude |
| 14 Nov 14:55 | Base data: NASA POWER daily 2001–2026 | Public API with no key, CORS, 25 years; works in the browser | Earthdata (requires login; heavy for a 30-hour event) | Team, with Claude |
| 14 Nov 14:55 | ET0 Hargreaves with Ra from POWER | Needs only reliable POWER variables; FAO-56 accepts it when data are missing | Penman-Monteith (more variables, reanalysis wind and humidity) | Team, with Claude |
| 14 Nov 15:00 | 100 % static app with offline cache | Demo fallback, free hosting | Python backend | Team, with Claude |
| 14 Nov 15:00 | Add MODIS NDVI through GIBS as visual evidence (no login) | A Resources dataset; shows the 2022 drought against 2024 on the map; robust offline | ORNL subsets (did not respond at the time), SMAP (requires login) | Team, with Claude |
| 14 Nov 15:30 | Water balance with soil (FAO-56 Table 19), clay by default | Without soil, more crops always means more deficit; with soil, it shows that cover crops dry the profile before soybean | Climate-only deficit (kept as an option) | Team, with Claude |
| 14 Nov 15:30 | Normalisation proportional to the maximum | Min-max exaggerated small differences | Min-max | Team, with Claude |
| 14 Nov 16:00 | Do not reuse the logic of a teammate's earlier weather app | It contained no AI or NASA data (OpenWeather and random values as a "forecast") | Port its fixed recommendations | Team, with Claude |
| 14 Nov 15:00 | Confidence always labelled "exploratory" | No field soil data, regional cell, calendars not validated | "High" label | Team, with Claude |
| 15 Nov 09:40 | Unique name: **YvyShift** ("yvy" = land in Guaraní + "Shift" from the challenge) | Six teams named like "TerraShift" and one "RotationLab" were registered in Field Shift. "Rotation Lab" stays only as the comparison module's name | TERRA-SHIFT Paraguay, Kokue, Arandu Fields, Tierra Colorada | Team |
| 15 Nov 09:40 | Remove the cloud AI mode (Gemini) from the app completely | It needed a key and a server and contradicted "the app does not send your data anywhere". Future plan: optional, installable local AI | Leave it switched off | Team |
| 15 Nov 09:40 | Demo as a 30-second video with an English script ([`DEMO_SCRIPT_30S_EN.md`](DEMO_SCRIPT_30S_EN.md)) | Official limit of 30 s or 7 slides; a 90-second script is not eligible | 7 slides (kept as plan B) | Team |
| 15 Nov 10:30 | NASA lens in Rotation Lab ("Show NASA data only" button) | Turns the finding that fallow wins on climate data alone into the core message instead of hiding it | Hide the finding | Team, with Claude |
| 15 Nov 10:30 | Keep "56 × 62 km" as the cell size in Itapúa | `engine.powerCell(-27.08, -55.65)` gives 56 × 62 (0.625° × 111.32 km × cos 27.5°); a review had suggested 56 × 52 | 56 × 52 | Claude |
| 15 Nov 13:00 | v17 "field use": Sun mode, 5-button bottom bar with "More", quick questions, home page in farmers' language, sans-serif text on phones | Agricultural UX suggestions from the team and a mobile audit: small touch targets 91 → 17, small texts 70 → 12 | Keep the strip of 9 scrolling icons | Team, with Claude |
| 15 Nov 13:00 | Home background photo that moves with the mouse (parallax); still on phones and with "reduce motion" | Team request. On phones the movement distracts and drains the battery | Gyroscope parallax | Team |

## 15 Nov 2026 · Assistant with knowledge base and optional local AI (v18)

- **Decision:** the chat adds a base of 18 fixed texts with their sources and an optional local AI running in the browser through WebLLM, which picks a topic from a closed list.
- **Why:** the team asked for a chatbot of about 1 GB that works on a phone without a connection, with a layer that stops it from inventing.
- **Safety:** constrained output plus validation in code; topic and source visible in every answer; a "may be wrong" notice next to the chat.
- **Accepted risk:** it may pick the wrong topic. Off by default.

## 15 Nov 2026 · Local AI v21

- **Decision:** switch the local model from Llama 3.2 1B to Qwen2.5-1.5B-Instruct (about 0.9 GB); store the model in IndexedDB; add a cancel button and automatic retries for the download; when no topic fits, let the model write a short answer, clearly labelled as written by the AI, and remove any sentence with a number that is not in the app's own texts.
- **Why:** the 1B model answered poorly; the download got stuck with the browser's Cache API; the team asked that the AI download reliably, can be cancelled, and knows agriculture and the whole app.
- **Phones:** WebLLM needs a GPU limit (`maxComputeWorkgroupStorageSize`) of 32768; many phones offer 16384. On those phones the app says the local AI is not available on this phone, and the rest of the app works the same. The team chose not to build a phone workaround.
- Details in [`LOCAL_AI.md`](LOCAL_AI.md).
