# NASA and scientific data

## In use (verified with a real download on 14 Nov 2026, 17:45 UTC)

| Field | NASA POWER Daily API |
|---|---|
| Source | NASA LaRC POWER Project, https://power.larc.nasa.gov/ (API v2.10.3, "POWER Daily API") |
| Eligibility | Listed in the challenge Resources tab ("NASA POWER: Agroclimatology & Meteorological Data") |
| Variables | `PRECTOTCORR` corrected precipitation (mm/day); `T2M`, `T2M_MAX`, `T2M_MIN` air temperature at 2 m (°C); `TOA_SW_DWN` top-of-atmosphere radiation (MJ/m²/day); `GWETROOT` root-zone soil wetness (0–1) |
| Internal sources | MERRA-2, GEOS-IT, CERES SYN1deg, FLASHFlux (from the response header) |
| Data type | Reanalysis/model plus satellite products; **not** a station or a field observation |
| Resolution | Meteorology about 0.5° × 0.625° (MERRA-2); daily; local standard time |
| Period used | 1 May 2001 → 31 Oct 2026 (25 complete seasons, 2001–02 to 2025–26) |
| Points | Eight soybean areas of Paraguay stored offline (for example Itapúa −27.08, −55.65; Alto Paraná −25.79, −55.09); any other point downloaded live |
| Method | Public REST API with no key; aggregated into 10-day periods per agricultural year (May–April) |
| Quality | Fill value −999 → the 10-day period is marked incomplete and that season is not used |
| Use in the app | ET0, crop demand, deficit, heat and frost days, root-zone moisture, charts |
| Credit in the app | "Data: NASA Langley Research Center POWER Project" |

## Plausibility check (Itapúa)

Annual rain 1,248–2,566 mm and ET0 1,211–1,604 mm. The 2021–22 season has the highest ET0 (1,604 mm) and the most days ≥ 35 °C (76) of the series, consistent with the drought recorded that season. The independent checks are in `EXTERNAL_VALIDATION.md` and `SATELLITE_VALIDATION_MODIS.md`.

## MODIS NDVI (Resources: "Landsat and MODIS/VIIRS")

| Field | Value |
|---|---|
| Product | MODIS/Terra Vegetation Indices 16-Day (MOD13Q1, 250 m) |
| Images | NASA GIBS WMS (Worldview), no login, layer `MODIS_Terra_L3_NDVI_16Day`: composites starting 1 Jan 2022 (drought) and 1 Jan 2024 (wet season) |
| Numeric values | ORNL DAAC MODIS web service: January NDVI for 25 seasons in Itapúa and Alto Paraná, used to validate the model (see `SATELLITE_VALIDATION_MODIS.md`) |
| Use | Visual context and validation; **not part of the score** |

## Other NASA layers

- **HLS** (Harmonized Landsat and Sentinel-2, 30 m) true colour through NASA GIBS: field view comparing two dates. Visual only.
- **Blue Marble** through NASA GIBS: base layer of the world map. Visual only.

## Candidates for after the event

| Product | Purpose | Caveat |
|---|---|---|
| SMAP L3/L4 soil moisture | Satellite evidence of dry soil in 2021–22 against the median | 9–36 km; 0–5 cm depth (L3) or modelled root zone (L4); needs Earthdata |
| GPM IMERG | Cross-check POWER rainfall | 0.1°; needs a free Earthdata account |
| SRTM | Terrain slope → erosion risk in fallow | 30 m; Earthdata or OpenTopography |
| GLDAS | Modelled soil moisture for the water balance | 0.25°; Earthdata |
| FAO GAEZ | Crop suitability and soil constraints in Paraguay | 5 arc-minutes |

## Local sources to add

Paraguay's Ministry of Agriculture (MAG) crop calendar, IPTA (wheat, soybean, cover crops), CAPECO (area and sowing dates), soil maps of the Eastern Region.

## References

- Allen, R.G., Pereira, L.S., Raes, D., Smith, M. (1998). *Crop evapotranspiration*. FAO Irrigation and Drainage Paper 56. Rome: FAO. (Eq. 52 Hargreaves; Table 12 Kc.)
- Hargreaves, G.H., Samani, Z.A. (1985). Reference crop evapotranspiration from temperature. *Applied Engineering in Agriculture*, 1(2), 96–99.
- NASA POWER Project. https://power.larc.nasa.gov/docs/
