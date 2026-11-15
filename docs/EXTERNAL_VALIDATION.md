# External validation of the model (without an agronomist)

Date: 14 Nov 2026. Everything was computed with the app's cached data and with public sources read that day. Data in `app/data/validation.js`; calculation in `engine.yieldValidation()`, covered by an automated test. The app shows it in section 5, "How sure is this".

## 1. The model against real soybean yields (the strongest test)

**Question:** does the water the model says soybean lacked match the years when Paraguay's soybean yield was poor?

**Data:** Paraguay's national soybean yield, 2002–2024 (FAO, FAOSTAT; downloaded through Our World in Data because FAOSTAT was not responding). The technology trend (+0.029 t/ha per year) was removed and the anomaly in % was used. The model indicator is the soybean water deficit (baseline rotation, clay soil), averaged over one point in each of the 5 departments with the most soybean (Alto Paraná, Canindeyú, Itapúa, San Pedro, Caaguazú). **The model was not tuned with these data.**

| Result | Value |
|---|---|
| Correlation model deficit vs yield anomaly | **r = −0.83** (23 seasons) |
| Correlation heat days at flowering vs anomaly | r = −0.77 |
| Without the 2021–22 drought | r = −0.77 |
| The 5 worst real seasons | 2021–22, 2011–12, 2008–09, 2005–06, 2003–04 |
| The 5 driest according to the model | 2021–22, 2011–12, 2008–09, 2005–06, 2022–23 |
| Matches | **4 of 5** (probability of getting this at random: 0.3 %) |
| The same test in each of the 8 areas | r between −0.59 (Misiones) and −0.86 (Alto Paraná) |

With only Itapúa and Alto Paraná (the first version) the result was r = −0.81.

Pitch line: *"With no tuning, the model finds 4 of the 5 worst Paraguayan soybean years since 2002."*

## 2. NASA POWER rainfall against another source

ERA5 (ECMWF, Copernicus) through Open-Meteo, same two points, rainfall over the soybean cycle (11 Oct to 10 Feb), 24 seasons.

| Area | Correlation | 2021–22 drought: POWER / ERA5 |
|---|---|---|
| Itapúa | r = 0.74 | 369 / 381 mm |
| Alto Paraná | r = 0.85 | 408 / 313 mm |

ERA5 is another reanalysis from another centre: independent of NASA, but not a station measurement.

## 3. Calendars against published sources

| Crop | Result |
|---|---|
| Soybean (11 Oct and 11 Sep) | ✅ Inside the published window: sowing from late August to early November, harvest from late December to March ([farmdoc daily, 21 Apr 2026](https://farmdocdaily.illinois.edu/2026/04/paraguays-role-in-the-global-soybean-market.html)) |
| Wheat | 🟡 Harvest starts in September ([FAO GIEWS, 25 Sep 2026](https://www.fao.org/giews/countrybrief/country.jsp?code=PRY)); the model harvests by 10 Oct. No source for sowing |
| Second-crop maize | ⚠️ FAO reports the harvest between June and August; the model cuts the cycle on 30 Apr. **It does not count May and June frosts on maize, so it may underestimate the risk of rotation D.** The app says so |
| Black oat | No published calendar found. **Not shown in the app** (team decision, 14 Nov): the comparison table only lists what could be checked. The calendar stays marked as an assumption in the confidence section |

The USDA (IPAD) crop calendar page has been retired and could not be used.

## 3b. Satellite validation (added 15 Nov 2026)

January MODIS NDVI (MOD13Q1) against the model's deficit: **r = −0.76 in Itapúa** and **r = −0.51 in Alto Paraná**, 25 seasons; the least green January in both areas was the 2021–22 drought. Details in [`SATELLITE_VALIDATION_MODIS.md`](SATELLITE_VALIDATION_MODIS.md).

## 4. Impact figures with sources

| Figure | Source |
|---|---|
| Soybean production fell **50 %** in the drought: from 10.5 to 5.2 million t; yield from 2.89 to 1.47 t/ha | FAO, FAOSTAT (through Our World in Data) |
| **3,009,608 ha** of soybean in the Eastern Region in 2022; more than 87 % in Alto Paraná, Canindeyú, Itapúa, San Pedro and Caaguazú | 2022 National Agricultural Census, cited by [Última Hora](https://www.ultimahora.com/la-soja-tuvo-minimo-impacto-en-cambio-de-uso-de-suelos) |
| Almost **39,000 smallholders** (farms under 20 ha) plant 20 % of the soybean | UGP, August 2017, cited by [Última Hora](https://www.ultimahora.com/casi-39000-pequenos-productores-plantan-el-20-del-total-la-soja-n1103857). Old figure: always quote it with its year |
| Farmers expect to sow about **3.6 million ha** of soybean in 2025/26 | Soybean Growers Association, cited by [La Nación, 7 Sep 2025](https://www.lanacion.com.py/negocios_edicion_impresa/2025/09/07/los-sojeros-preven-una-siembra-de-36-millones-de-hectareas/) |
| Paraguay has supplied on average **3.9 %** of world soybean exports since 2000 | [farmdoc daily, 21 Apr 2026](https://farmdocdaily.illinois.edu/2026/04/paraguays-role-in-the-global-soybean-market.html) |

Other estimates of the 2021–22 harvest are lower (USDA 3.9 Mt; CAPECO estimated as low as 2.97 Mt). The app uses the FAO figure.

## Limits

- The yield is national; the model uses points in the soybean core area.
- 23 seasons; correlation is not causation. Using the anomaly from the trend reduces, but does not remove, the effect of prices, pests and technology.
- This validates the soybean climate indicator, not the score of each rotation: there are no public yield data per rotation.
- The calendars still lack a full local validation; this replaces it in part, not completely.

## How to repeat it

The downloaded data and the scripts are kept in the team's working folder (`_work/validacion/`) and are not published in this repository. From the project folder:

```
node _work/validacion/yieldval.js . _work/validacion/owid_soy_yield.csv
node _work/validacion/rainval.js . _work/validacion
node _work/validacion/makeval.js . _work/validacion
```

The last one regenerates `app/data/validation.js` without the impact figures and the calendars, which were added by hand at the end of the file.
