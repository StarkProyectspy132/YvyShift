# YvyShift · Project page text for the official submission

Everything the NASA Space Apps submission form asks for, ready to copy. All fields must be in English. Before submitting, replace each **[TODO]** and open every link in a private browser window to check it works without signing in.

---

## Project Name

YvyShift

## Team

[TODO: team name] · Asunción, Paraguay · Challenge: Field Shift: Adapting Farms with NASA Data (https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/)

## High-Level Project Summary

YvyShift is a free web app that lets farmers and extension technicians compare crop rotations against 25 seasons of daily NASA POWER climate data for their own area, weighted by their own priorities. It separates what NASA data decide (water, heat and frost) from what the farmer decides (soil cover, a second harvest), so nobody mistakes a value judgment for a satellite result. Checked against 23 real soybean harvests, the model's driest seasons include four of the five worst years since 2002, and NASA's MODIS satellite sees those same seasons as less green fields. It works on a phone, offline, in six languages including Guaraní.

---

## 2. Project Links

### Link to Project Demo (7 slides)

[TODO: full public link to the 7-slide PDF, for example `https://drive.google.com/file/d/.../view?usp=sharing` with "Anyone with the link can view", or `https://github.com/StarkProyectspy132/YvyShift/blob/main/docs/YvyShift_demo.pdf`]

### Link to Final Project

- Live app: https://yvyshift.web.app
- Source code: https://github.com/StarkProyectspy132/YvyShift

---

## 3. Project Details

### What it does and how it works

#### The problem

Soybean is the backbone of farming in eastern Paraguay: about 3 million hectares in the Eastern Region (2022 National Agricultural Census), and producers expected to sow about 3.6 million hectares nationwide in 2025/26 (Paraguayan Soybean Producers Association, September 2025). In the 2021–22 drought, national soybean output fell by half, from 10.5 to 5.2 million tonnes (FAO). NASA POWER data for Itapúa show that season had the highest reference evapotranspiration (1,604 mm) and the most days at or above 35 °C (76 over the agricultural year) since 2001. During the soybean cycle, rain was 369 mm against an estimated crop demand of 729 mm.

Every year a farmer decides what to do in winter and when to sow: leave the field fallow, grow wheat, grow a black oat cover crop, or sow soybean early and follow it with second-crop maize. Each option trades water, heat and frost exposure, soil cover and the number of harvests. Until now there was no simple way to see how each option would have behaved across the good and bad years of the farmer's own area.

#### What YvyShift does

YvyShift ("yvy" means land in Guaraní) is a free web app. A farmer or extension technician:

1. **Picks an area.** Eight soybean areas of Paraguay are stored offline. Any other point in the world is downloaded live from NASA POWER. A farmer can also draw their own field on the map or import it as GeoJSON.
2. **Picks a climate scenario.** The options are a typical year, a 1-in-5 bad year, El Niño or La Niña seasons, or a specific real season such as 2021–22.
3. **Picks a soil type** (how much water it stores) and ticks the crops they cannot grow, for example because there is no buyer.
4. **Sets priorities from 0 to 5.**
   - Water, heat at flowering and frost come from NASA data.
   - Soil cover, crop diversity and harvests per year come from the rotation calendar.

The app replays four local rotations, plus one the farmer builds, across 25 seasons (2001–02 to 2025–26).
- **Ranking:** it shows which rotation best balances the farmer's priorities.
- **Split score:** for each rotation it shows how many points come from NASA climate data and how many from the calendar.
- **Where judgment matters:** it lists the places where the farmer's own call decides the result, such as near ties, results that change if sowing moves 10 days, and what the tool cannot see.

#### The modules

- **Rotation Lab:** the ranking, the explanation of why each rotation ranks where it does, the sowing and harvest calendar, and a rainfall slider (−30 % to +30 %) clearly labelled as a simulation.
- **Field Monitor:** a world map with NASA GIBS imagery. It draws the NASA POWER cell behind each point (about 56 × 62 km in Itapúa), so it is clear the climate is regional, not field-level. It also compares two dates of NASA HLS 30 m imagery of the same fields, for example the 2022 drought against 2024.
- **Field DNA:** the climate memory of the area in one picture. One bar per season shows whether soybean got enough water (brown when it lacked water, green when it was enough). It marks the big drought and the wettest season, and shows heat days, frost days and root-zone soil moisture (NASA POWER GWETROOT).
- **Climate Replay:** replays the hard seasons (2021–22 drought, El Niño and La Niña years) and runs a stress test of every rotation against them.
- **Adaptive Monitor:** shows how the current season is going against the area's history, key dates of the chosen rotation, month-by-month climate risk and the current ENSO phase.
- **Resilience Passport:** a printable report with the evidence behind the choice, to take to an agronomist, a cooperative or a bank.
- **My fields:** saves a configuration on the device.
- **Sensors and irrigation:** explains what each type of field sensor or irrigation device would add.
- **Assistant:** a chat that answers questions about the farmer's area with the app's own numbers, and general questions with reviewed texts that always show their source. An optional local AI is described in "Use of Super Intelligence" below.

#### The NASA lens: our most honest feature

One button, "Show NASA data only", sets the calendar dimensions to zero.
- With NASA climate data alone, soybean plus winter fallow ranks first in 13 to 17 of 25 seasons in all eight areas, because any winter crop uses water.
- With balanced priorities, fallow never ranks first.

We show this on screen instead of hiding it. NASA data show what each extra crop costs in water; how much soil cover and a second harvest are worth is the farmer's call. The challenge asks for a tool that complements local expertise, and this is exactly where that line is drawn.

#### Does the model match reality?

We checked the model against data it never used.
- **Real harvests:** Paraguay's national soybean yield (FAO, 2002–2024, technology trend removed) falls when the model says soybean lacked water. The correlation is −0.83 over 23 seasons. In each of the eight areas separately, it stays between −0.59 and −0.86.
- **Worst years:** without any tuning, the model's five driest seasons include four of the five worst real harvests (2021–22, 2011–12, 2008–09 and 2005–06). The chance of that at random is about 0.3 %.
- **Independent rainfall:** NASA POWER rainfall agrees with the independent ERA5 reanalysis (correlation 0.74 and 0.85).

#### A satellite check, not only a model

NASA POWER is a reanalysis, so we also checked the model against a direct satellite observation.
- **Data:** we downloaded MODIS/Terra NDVI (MOD13Q1, 250 m) for early January, when soybean is at full canopy. It covers every season from 2001–02 to 2025–26 around the Itapúa and Alto Paraná points, from the ORNL DAAC MODIS web service.
- **Result:** January greenness falls in the seasons the model flags as dry. The correlation is −0.76 in Itapúa and −0.51 in Alto Paraná over 25 seasons.
- **The drought:** in both areas the least green January was the 2021–22 drought. In Itapúa, four of the five least green Januaries are among the five worst real harvests.
- **The weaker area:** the result in Alto Paraná is probably weaker because sowing there is earlier, which puts part of the soybean at maturity by January. The app reports it as a partial match.

#### Science and thresholds

- **Water demand:** reference evapotranspiration uses Hargreaves (FAO-56 eq. 52) with radiation from NASA POWER. Crop demand uses FAO-56 Table 12 crop coefficients and a soil water bucket with FAO-56 Table 19 soil classes. The calculation runs in 10-day steps.
- **Heat at flowering:** counts days at or above 35 °C, following Salem et al. (2007), who found soybean reproduction is sensitive to temperatures above 35 °C.
- **Frost:** counts days at or below 2 °C at 2 m. This sits between the meteorological (below 0 °C) and agrometeorological (below 3 °C) frost definitions, both measured at 1.5 m, cited by INTA's Instituto de Clima y Agua (Argentina).
- **Sowing calendar:** the soybean calendar falls inside the published window.
- **Known gap, shown in the app:** the second-crop maize cycle is cut on 30 April, while FAO GIEWS describes the zafriña harvest as still under way in July and August, so frost risk for that rotation is underestimated.

#### What it is not

It is not an agronomic recommendation, a yield forecast or a field measurement. It does not include costs or prices. Sowing calendars and thresholds still need validation by a local agronomist. Soil classes are generic FAO-56 values.

### Benefits and expected impact

- **Better winter decisions with evidence.** A farmer or technician sees in minutes how each rotation would have behaved across 25 real seasons in their area, including the 2021–22 drought, instead of relying on memory of the last two or three years.
- **Honest about what data can and cannot decide.** The NASA lens makes visible the trade-off between water (what NASA data measure) and soil cover or a second harvest (what the farmer values). It supports the farmer's judgment instead of replacing it.
- **Lower risk in dry years.** Knowing which rotation holds up in the 1-in-5 bad year, or in La Niña seasons, helps reduce losses like the 2021–22 harvest, when Paraguay lost half its soybean.
- **Soil health.** By showing the water cost and the benefits of cover crops side by side, it helps farmers decide when a winter cover such as black oat makes sense for their area.
- **Reaches rural users.** It is free, needs no account, installs on a phone, works with no signal after the first visit, and speaks Spanish, Guaraní, Portuguese, English, Japanese and Hindi.
- **Useful for extension and finance.** The Resilience Passport gives technicians, cooperatives and banks a shared, printable record of the evidence behind a decision.
- **Global, validated locally.** Any point in the world can be analysed with live NASA POWER data. Paraguay is the validated case: eight areas stored offline and checked against real harvests and MODIS. Outside Paraguay the four rotations are a template the user should adapt.
- **Who it serves:** about 3.6 million hectares of soybean in Paraguay, most of it in the Eastern Region that the eight stored areas cover, plus the extension services and cooperatives that advise those farmers.

### Tools, languages, hardware and software

- **Languages:** JavaScript (no framework), HTML5 and CSS3. Node.js runs the automated tests and the validation check script.
- **Architecture:** a static web app with no backend server, no database and no API key.
  - **Calculation engine:** `app/engine.js` is pure, with no screen code, and runs both in the browser and in Node.js.
  - **Data flow:** daily NASA POWER data are grouped into 10-day steps per season, run through a FAO-56 water balance per crop and rotation, summarised per scenario and weighted by the user's priorities.
  - **Charts:** the climate drawings (Field DNA, Climate Replay) are inline SVG generated in the browser.
- **Progressive Web App:** a web manifest plus a service worker (`app/sw.js`) let the app install on a phone and work offline from a cached copy of the app and of the NASA data for eight areas.
- **Automated tests:** 34 automated tests run with Node.js (`node:test`) and cover the engine, the external validation and the assistant's safety rules.
- **Maps and imagery:**
  - NASA GIBS (WMS/WMTS) for MODIS, HLS and Blue Marble layers.
  - Esri World Street Map, World Imagery and World Topo tiles as the base map.
  - A custom lightweight map viewer, with no map library.
- **Data sources:** NASA POWER Daily API, MODIS MOD13Q1 via the ORNL DAAC web service, NOAA CPC ONI, FAO yields via Our World in Data, and ERA5 via Open-Meteo (validation only).
- **Local AI (optional):**
  - Runs in the browser with WebLLM 0.2.88 on WebGPU.
  - Uses the open model Qwen2.5-1.5B-Instruct (4-bit, about 0.9 GB), downloaded once from Hugging Face and stored in the browser's IndexedDB.
  - It runs on the user's device; nothing is sent to a server.
  - It needs a GPU with WebGPU and at least 32 KB of compute workgroup memory: most computers have this, but many phones do not. On those phones the app says it is not available and the assistant keeps working without AI.
- **Hardware:** no special hardware. It runs in any modern phone or computer browser. We tested it on a Windows laptop and an Android phone.
- **Development tools:** Git and GitHub, Chrome, Playwright for screenshots and interface checks, and Claude (Anthropic) as a development assistant (see below). [TODO: add the editor and any other tools the team used]
- **Translations:** Spanish and English are complete. Guaraní, Portuguese, Japanese and Hindi cover the interface. Guaraní still needs review by a native speaker.

### Creativity and the factors we considered

- **The farmer's real choice.** We designed around the decision a Paraguayan farmer actually makes every winter: fallow, wheat, black oat cover, or early soybean followed by second-crop maize. We did not start from a generic crop map. The four rotations and their calendars come from local practice and the FAO GIEWS crop calendar.
- **Separating data from values.** The most creative decision was to show where the data stop. Most decision tools hide the weights. YvyShift splits every score into a NASA-climate part and a calendar part. Its NASA lens openly shows that, on climate alone, fallow wins most seasons. We turned the tool's biggest limitation into its clearest message.
- **Constraints, not only preferences.** Real farms have constraints, so the farmer can rule out crops with no buyer or no time to sow.
- **Making climate memory visible.** Field DNA draws 25 seasons as one picture a farmer can read in seconds: brown bars when soybean lacked water, green when it had enough. "The big drought" and "the wettest season" are marked, and heat, frost and soil moisture are shown with simple drawings instead of tables. The design uses little text, large numbers and a high-contrast "Sun mode" for reading outdoors.
- **Being clear about scale.** The map draws the roughly 56 × 62 km NASA POWER cell, and the field images are labelled as 30 m. Farmers do not mistake regional climate for field data.
- **Validation as a design requirement.** We tested the model against real harvests, an independent reanalysis and a direct satellite measurement before putting any claim in the app. Every number in the app has a source on screen.
- **Rural reality.** We prioritised offline use, phones, no accounts, no API keys and Guaraní, because many farmers in eastern Paraguay have weak coverage and speak Guaraní or Jopará. The assistant understands common Guaraní farm words such as ama (rain), ro'y (frost) and kokue (field).
- **Safety of the AI.**
  - The optional AI first tries to pick a topic from a closed list, forced by a grammar, so the answer comes from reviewed text or from the calculation.
  - Only when no topic fits does it write a short answer about farming or how to use the app. That answer is clearly labelled as written by the AI.
  - Any sentence with a number that does not appear in the app's own texts is removed, so it cannot invent a dose, a price or a rainfall figure. We added this after a test where the model invented a herbicide dose.
- **Global with local proof.** The engine works for any point in the world and adapts to the southern or northern hemisphere. We validated it where we could check it against reality: Paraguay.

### Next steps

- Validate calendars and thresholds with agronomists from IPTA and producer cooperatives.
- Extend the maize cycle past April.
- Add SMAP soil moisture and GPM IMERG rainfall as numeric inputs.
- Add costs per rotation.
- Test with farmers in Itapúa and Alto Paraná.

The project is aligned with the interest of the Paraguayan Space Agency (AEP), a 2026 Space Agency Partner, in applying Earth observation to agriculture. It is not endorsed by the AEP.

### How we built it (team)

[TODO: two or three sentences on the team process and difficulties, and one line per member on what they did]

---

## Use of Super Intelligence (SI)

**Who did what**
- The team defined the problem, chose the challenge and the idea, and decided the method and the validation.
- We used Claude (Anthropic), a large language model, as a development assistant to research methods and sources, write and test code, design the interface, write documentation and draft translations.
- AI-assisted code is acknowledged in a header comment in each source file, in the app footer and in this description.

**Data and numbers**
- All data are real downloads from NASA and the other sources listed below.
- Formulas are cited and covered by automated tests, and the team reviewed the results.
- Every number in the app is computed on the user's device by the calculation engine, not by an AI.

**The optional local AI in the assistant**
- It is off until the user installs it.
- It uses the open model Qwen2.5-1.5B-Instruct, which runs on the device with WebLLM.
- It first tries to match the question to a topic from a closed list; answers then come from the calculation or from fixed, reviewed texts that show their source.
- If no topic fits, it writes a short answer about farming or about using the app, labelled "written by the local AI, it can make mistakes".
- Any sentence with a number not found in the app's own texts is removed.

No AI-generated images or video are used.

## NASA Data

- **NASA POWER Daily API (LaRC), AG community:** the core of every calculation. https://power.larc.nasa.gov/
  - Parameters: PRECTOTCORR, T2M, T2M_MAX, T2M_MIN, TOA_SW_DWN and GWETROOT.
  - Period: May 2001 to October 2026.
- **MODIS/Terra Vegetation Indices 16-day 250 m (MOD13Q1):**
  - Shown as images through NASA GIBS and Worldview.
  - Numeric values from the ORNL DAAC MODIS web service: January NDVI for 25 seasons in two areas validates the model's water deficit (r = −0.76 and −0.51).
- **Harmonized Landsat and Sentinel-2 (HLS) 30 m true-colour imagery via NASA GIBS:** field view, visual only.
- **Blue Marble via NASA GIBS:** base map, visual only.

## Space Agency Partner Data and Other References

- NOAA Climate Prediction Center, Oceanic Niño Index (ONI), used to group seasons. https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt
- FAO, FAOSTAT soybean yield and production for Paraguay, via Our World in Data, used only for validation. https://ourworldindata.org/grapher/soybean-yields
- ERA5 reanalysis (ECMWF, Copernicus) via Open-Meteo, used only for validation. https://open-meteo.com/en/docs/historical-weather-api
- FAO GIEWS country brief, Paraguay (crop calendars). https://www.fao.org/giews/countrybrief/country.jsp?code=PRY
- Allen, R.G., Pereira, L.S., Raes, D., Smith, M. (1998). Crop evapotranspiration. FAO Irrigation and Drainage Paper 56. https://www.fao.org/4/x0490e/x0490e0b.htm
- Hargreaves, G.H., Samani, Z.A. (1985). Reference crop evapotranspiration from temperature. Applied Engineering in Agriculture 1(2): 96–99.
- Salem, M.A., Kakani, V.G., Koti, S., Reddy, K.R. (2007). Pollen-based screening of soybean genotypes for high temperatures. Crop Science 47(1): 219–231. https://doi.org/10.2135/cropsci2006.07.0443
- Argentina.gob.ar (7 Sep 2023), "Primavera, época para estar atentos a las heladas": frost definitions given by a meteorologist of INTA's Instituto de Clima y Agua. https://www.argentina.gob.ar/noticias/primavera-epoca-para-estar-atentos-las-heladas
- farmdoc daily (21 Apr 2026), Paraguay's role in the global soybean market. https://farmdocdaily.illinois.edu/2026/04/paraguays-role-in-the-global-soybean-market.html
- Última Hora, 2022 National Agricultural Census soybean area. https://www.ultimahora.com/la-soja-tuvo-minimo-impacto-en-cambio-de-uso-de-suelos
- La Nación (7 Sep 2025), soybean producers expect 3.6 million hectares in 2025/26. https://www.lanacion.com.py/negocios_edicion_impresa/2025/09/07/los-sojeros-preven-una-siembra-de-36-millones-de-hectareas/
- Esri World Street Map, World Imagery and World Topo Map tiles (base map).
- WebLLM (MLC AI, Apache 2.0) and Qwen2.5-1.5B-Instruct (Alibaba Cloud, Apache 2.0), optional local AI.
- Home background image: Asunción seen from the Space Shuttle (STS-72 mission, January 1996), NASA Johnson Space Center, from the NASA Image and Video Library (images.nasa.gov, ID sts072-730-079). NASA imagery is generally not subject to copyright in the United States.
- Claude (Anthropic), development assistant (see "Use of Super Intelligence").
