# Sources and traceability

Every number or claim shown in YvyShift or in the report is listed here with where it comes from and how it was checked. Audit date: 15 November 2026.

Status key: **Recomputed** = recalculated from the data stored in this repository. **Read** = the source page was opened and read. **Corrected** = the wording was wrong or unsupported and was fixed on 15 Nov. **Open** = not verified.

## How to recompute

```
node docs/verify_figures.js "$(pwd)"
node docs/auditoria_competitiva/verificar_n1.js "$(pwd)"
```

The first script prints every statistic quoted below from `app/data/power_cache.js` and `app/data/validation.js`. The second reproduces the "NASA lens" comparison.

## Register

| Figure | Value | Source | Status |
|---|---|---|---|
| Model deficit vs yield anomaly | r = −0.83, n = 23 | power_cache.js, validation.js | Recomputed |
| Heat days at flowering vs anomaly | r = −0.77 | same | Recomputed |
| Without 2021–22 | r = −0.77 (−0.75 if refitted) | same | Recomputed |
| Worst real seasons found among driest model seasons | 4 of 5, p = 0.27 % | same | Recomputed |
| Same test in eight areas | −0.59 (Misiones) to −0.86 (Alto Paraná) | same | Recomputed |
| FAO national soybean | 10,537,080 → 5,219,684 t; 2.895 → 1.475 t/ha | FAOSTAT via Our World in Data, stored on 14 Nov | Stored values checked; CSV not re-read |
| Itapúa 2021–22 | rain 368.8 mm, crop demand 729.1 mm, ET0 1,603.6 mm, 76 hot days (whole agricultural year) | NASA POWER cache | Recomputed |
| ERA5 rain agreement | r = 0.743 and 0.847 | Open-Meteo archive, stored | Recomputed |
| MODIS NDVI vs model | r = −0.756 and −0.514; NDVI vs yield r = +0.692 | ORNL DAAC MOD13Q1, stored | Recomputed |
| NASA lens | defaults: A wins 13–17 seasons of 17 against 0 | verificar_n1.js | Recomputed |
| Context | 3,009,608 ha soybean (2022 census); 3.6 M ha expected 2025/26; 3.9 % of world exports | Última Hora, La Nación, farmdoc daily | Read |
| Smallholders | about 39,000 farms, about 20 % of soybean area | UGP, August 2017 | Corrected (it is area, not production) |
| Frost definitions | below 0 °C and 3 °C at 1.5 m | INTA, Instituto de Clima y Agua, via argentina.gob.ar, 7 Sep 2023 | Corrected (was attributed to the SMN) |
| Second-crop maize harvest | still under way July–August | FAO GIEWS: still under way in July and August | Corrected (the "June to August" wording was removed) |
| ENSO phase | Nov–Jan, ±0.5 | NOAA ONI, single Nov–Jan trimester at ±0.5 | Simplification of NOAA's five-trimester rule, stated in the app |
| POWER funding | n/a | NASA Applied Sciences Program, Earth Science Division | Corrected |
| Soil water | midpoint of Table 19 ranges | Allen et al. (1998) | Read (chapter 6 only) |

## Corrections made on 15 Nov

- Removed an IMERG mention, the USDA and CAPECO production figures and a claim about no-till adoption that had no source.
- Changed the frost source, the maize harvest wording and the smallholder share as listed above.
- ENSO text now says Nov–Jan (NDJ).

## Open items

- Salem et al. (2007) and the 35 °C pollen threshold: the DOI page could not be opened.
- FAO-56 chapter numbers for equation 52 and Table 19: only chapter 6 was verified.
- FAO values: the Our World in Data CSV was not downloaded again on 15 Nov.
- The Space Apps challenge URL could not be fetched (robots block).
- (Resolved 15 Nov) The home background photo of unconfirmed licence was replaced by a NASA astronaut photograph of Asunción (STS-72, images.nasa.gov ID sts072-730-079).
