# Project page text (English) for the official submission

Updated 15 Nov 2026 after the competitive audit (`docs/auditoria_competitiva/`). Every claim matches what the app does today. Only a few items still need a human: they are marked **[TODO]**. Before submitting, search this file for "[" and replace each one.

---

## Project Name

YvyShift

## High-Level Project Summary

YvyShift helps farmers in eastern Paraguay compare crop rotations against 25 seasons of NASA POWER data, weighted by their own priorities. It separates what NASA data decide (water, heat and frost) from what the farmer decides (soil cover, a second harvest), so nobody mistakes a value judgment for a satellite result. Tested against 23 real soybean harvests, the model's driest seasons include four of the five worst years since 2002, and NASA's MODIS satellite sees the same dry seasons as less green fields.

## Link to Project Demo

[TODO: public link to the 30-second video or the 7 slides, opened in a private window to check it plays without signing in]

## Link to Final Project

[TODO: public URL of the app, for example the Netlify or GitHub Pages address] · Source code: [TODO: public repository URL]

## Detailed Project Description

### The problem

Soybean is the backbone of farming in eastern Paraguay: about 3 million hectares in the Eastern Region (2022 National Agricultural Census), and producers expect to sow about 3.6 million hectares nationwide in 2025/26 (Paraguayan Soybean Producers Association, September 2025). In the 2021–22 drought, national soybean output fell by half, from 10.5 to 5.2 million tonnes (FAO). NASA POWER data for Itapúa show that season had the highest reference evapotranspiration (1,604 mm) and the most days at or above 35 °C (76) since 2001. During the soybean cycle, rain was 369 mm against an estimated crop demand of 729 mm.

Every year a farmer decides what to do in winter and when to sow: leave the field fallow, grow wheat, grow a black oat cover crop, or sow soybean early and follow with second-crop maize. Each option trades water, heat and frost exposure, soil cover and the number of harvests. There is no simple way to see how each option would have behaved across the good and bad years of the farmer's own area.

### What YvyShift does

YvyShift ("yvy" means land in Guaraní) is a free web app that works on a phone and offline. A farmer or extension technician:

1. Picks an area: eight soybean areas of Paraguay stored offline, or any point on a world map downloaded live from NASA POWER, or a field outlined on 30 m imagery.
2. Picks a climate scenario: a typical year, a 1-in-5 bad year, El Niño or La Niña seasons, or a specific season such as 2021–22.
3. Picks a soil type (how much water it stores) and ticks the crops they cannot grow.
4. Sets priorities: water, heat at flowering and frost come from NASA data; soil cover, crop diversity and harvests per year come from the rotation calendar.

The app ranks four local rotations (plus one the farmer builds), shows how many points of each score come from NASA climate data and how many from the calendar, and lists where the farmer's own judgment matters most: near ties, results that change if sowing moves 10 days, and what the tool cannot see.

### The NASA lens: our most honest feature

One button, "Show NASA data only", sets the calendar dimensions to zero. With NASA climate data alone, soybean plus winter fallow ranks first in 13 to 17 of 25 seasons in all eight areas, because a winter crop uses water. With balanced priorities, fallow never ranks first. We show this on screen instead of hiding it. NASA data show what each extra crop costs in water; how much soil cover and a second harvest are worth is the farmer's call. The challenge asks for a tool that complements local expertise, and this is where that line is drawn.

### Does the model match reality?

We checked the model against data it never used. Paraguay's national soybean yield (FAO, 2002–2024, technology trend removed) falls when the model says soybean lacked water: correlation −0.83 over 23 seasons. In each of the eight areas separately, it stays between −0.59 and −0.86. Without any tuning, the model's five driest seasons include four of the five worst real harvests (2021–22, 2011–12, 2008–09, 2005–06); the chance of that at random is about 0.3 %. NASA POWER rainfall agrees with the independent ERA5 reanalysis (correlation 0.74 and 0.85).

### A satellite check, not only a model

NASA POWER is a reanalysis, so we also checked the model against a direct satellite observation. We downloaded MODIS/Terra NDVI (MOD13Q1, 250 m) for early January, when soybean is at full canopy, for every season from 2001–02 to 2025–26 around the Itapúa and Alto Paraná points (ORNL DAAC MODIS web service). January greenness falls in the seasons the model flags as dry: correlation −0.76 in Itapúa and −0.51 in Alto Paraná over 25 seasons. In both areas the least green January was the 2021–22 drought. In Itapúa, four of the five least green Januaries are among the five worst real harvests. The weaker result in Alto Paraná is probably due to earlier sowing, which puts part of the soybean at maturity by January; the app reports it as a partial match.

### Built around the farmer

Constraints as well as priorities: the farmer can rule out crops with no buyer or no time to sow. A rainfall slider (−30 % to +30 %) recomputes everything and is clearly labelled as a simulation. The map draws the NASA POWER cell behind each point, about 56 × 62 km in Itapúa, so it is clear the climate is regional, not field-level. Field views compare two dates of NASA HLS imagery at 30 m. Field DNA, Climate Replay, Adaptive Monitor and a printable Resilience Passport reuse the same numbers. The interface is in Spanish, English, Guaraní, Portuguese, Japanese and Hindi (Guaraní still needs review by a native speaker).

### Science and thresholds

Reference evapotranspiration uses Hargreaves (FAO-56 eq. 52) with radiation from NASA POWER; crop demand uses FAO-56 Table 12 crop coefficients and a soil water bucket with FAO-56 Table 19 soil classes. Heat at flowering counts days at or above 35 °C, following Salem et al. (2007), who found soybean reproduction sensitive to temperatures above 35 °C. Frost counts days at or below 2 °C at 2 m, between the meteorological (0 °C) and agrometeorological (3 °C) frost definitions of Argentina's National Weather Service. The soybean calendar falls inside the published window. Known gap, shown in the app: the second-crop maize cycle is cut on 30 April, while FAO reports the local harvest between June and August, so frost risk for rotation D is underestimated.

### What it is not

It is not an agronomic recommendation, a yield forecast or a field measurement. It does not include costs or prices. Sowing calendars and thresholds still need validation by a local agronomist. Soil classes are generic FAO-56 values.

### How we built it

A static web app (HTML, CSS and JavaScript, no framework, no server, no API key) with a pure calculation engine covered by 25 automated tests. It installs as a Progressive Web App and works offline from a cached copy of the NASA data, which matters in rural areas with poor coverage. [TODO: two or three sentences on the team process, difficulties, and what each member did]

### Next steps

Validate calendars and thresholds with agronomists from IPTA and producer cooperatives; extend the maize cycle past April; add SMAP soil moisture and GPM IMERG rainfall as numeric inputs; add costs per rotation; test with farmers in Itapúa and Alto Paraná. The project is aligned with the interest of the Paraguayan Space Agency (AEP), a 2026 Space Agency Partner, in applying Earth observation to agriculture; it is not endorsed by the AEP.

## Use of Super Intelligence (SI)

The team defined the problem, chose the challenge and the idea, and decided the method and the validation. We used Claude (Anthropic), a large language model, as a development assistant to research methods and sources, write and test code, write documentation, and draft translations. AI-assisted code is acknowledged in a header comment in each source file and in the app footer. All data are real downloads from NASA and the other sources below; formulas are cited and covered by automated tests; the team reviewed the results. Every number is computed on the user's device. The assistant has an optional local AI (beta, off by default): a small open model (Llama 3.2 1B, run in the browser with WebLLM) that only picks the topic of the farmer's question from a closed list, forced by a grammar. It never writes the answer: answers come from the calculation or from fixed, reviewed texts that show their source, and the chat says the assistant can make mistakes. No AI-generated images or video are used.

## NASA Data

- NASA POWER Daily API (LaRC), AG community: PRECTOTCORR, T2M, T2M_MAX, T2M_MIN, TOA_SW_DWN, GWETROOT, May 2001 to October 2026. Core of every calculation. https://power.larc.nasa.gov/
- MODIS/Terra Vegetation Indices 16-day 250 m (MOD13Q1), via NASA GIBS/Worldview as images and via the ORNL DAAC MODIS web service as numeric values. Numeric January NDVI for 25 seasons in two areas is used to validate the model's water deficit (r = −0.76 and −0.51).
- Harmonized Landsat and Sentinel-2 (HLS) 30 m true-colour imagery via NASA GIBS: field view, visual only.
- Blue Marble via NASA GIBS: base map, visual only.

## Space Agency Partner Data and Other References

- NOAA Climate Prediction Center, Oceanic Niño Index (ONI), used to group seasons. https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt
- FAO, FAOSTAT soybean yield and production for Paraguay, via Our World in Data, used only for validation. https://ourworldindata.org/grapher/soybean-yields
- ERA5 reanalysis (ECMWF, Copernicus) via Open-Meteo, used only for validation. https://open-meteo.com/en/docs/historical-weather-api
- FAO GIEWS country brief, Paraguay (crop calendars). https://www.fao.org/giews/countrybrief/country.jsp?code=PRY
- Allen, R.G., Pereira, L.S., Raes, D., Smith, M. (1998). Crop evapotranspiration. FAO Irrigation and Drainage Paper 56. https://www.fao.org/4/x0490e/x0490e0b.htm
- Hargreaves, G.H., Samani, Z.A. (1985). Reference crop evapotranspiration from temperature. Applied Engineering in Agriculture 1(2): 96–99.
- Salem, M.A., Kakani, V.G., Koti, S., Reddy, K.R. (2007). Pollen-based screening of soybean genotypes for high temperatures. Crop Science 47(1): 219–231. https://doi.org/10.2135/cropsci2006.07.0443
- Servicio Meteorológico Nacional (Argentina), frost definitions. https://www.argentina.gob.ar/node/397275
- farmdoc daily (21 Apr 2026), Paraguay's role in the global soybean market. https://farmdocdaily.illinois.edu/2026/04/paraguays-role-in-the-global-soybean-market.html
- Última Hora, 2022 National Agricultural Census soybean area. https://www.ultimahora.com/la-soja-tuvo-minimo-impacto-en-cambio-de-uso-de-suelos
- La Nación (7 Sep 2025), soybean producers expect 3.6 million hectares in 2025/26. https://www.lanacion.com.py/negocios_edicion_impresa/2025/09/07/los-sojeros-preven-una-siembra-de-36-millones-de-hectareas/
- Esri World Imagery tiles and OpenStreetMap contributors (map base).
- Home background photo of a field at sunset: 4kwallpapers.org. [TODO: confirm the licence allows this use, or replace it with a team photo before submitting]
- Claude (Anthropic), development assistant (see "Use of Super Intelligence").
