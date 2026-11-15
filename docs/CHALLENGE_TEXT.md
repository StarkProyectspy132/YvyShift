# Field Shift: challenge text and resources

## Objective (summary)
A decision support tool that combines NASA Earth observations with local soil data, crop traits and farmer priorities to explore crop rotations that improve soil health and help farms adapt to changing conditions.

## Resources (pasted by the team on 14 Nov 2026; the copy received was cut off at the end)

**NASA Data & Resources** listed in the challenge:
- SMAP (surface soil moisture, every 2–3 days)
- GPM / IMERG (precipitation)
- Landsat and MODIS/VIIRS (reflectance, NDVI, vegetation indices) ← **used (MODIS NDVI through GIBS and the ORNL DAAC web service; HLS through GIBS)**
- **NASA POWER** (agroclimatology and meteorology) ← **used as the main source**
- SRTM (elevation and terrain)
- ECOSTRESS (land surface temperature and ET)

Other resources listed: USDA Ag Data Commons, Web Soil Survey, Cropland Data Layer (CropScape), PRISM, SSURGO/STATSGO2, NAIP, NLCD (United States only); NLDAS/GLDAS; FAO GAEZ (global); CoCoRaHS (North America); and others (the rest was cut off).

Challenge note: NASA does not endorse any non-U.S. Government entity, and participants must comply with the data use terms of each website.

## Potential considerations (two blocks, from screenshots provided by the team on 14 Nov 2026)

**Mapping and geospatial visualisation**
- Interactive maps can help explore trends over time, such as long-term soil moisture, heat waves or shrinking water reserves.
- Explore ways to show field-level vulnerabilities (for example erosion risk zones, water stress hotspots, frost-prone areas).
- Optional add-ons: timelines, overlays that compare datasets, or scenario sliders that adjust rainfall or temperature patterns.

**Farmer-centred design**
- Make the tool easy to interpret for farmers with little technical or geospatial experience.
- Let farmers express their own priorities or constraints, such as water availability, equipment limits or market preferences.
- The tool is meant to complement, not replace, local expertise; highlight the cases where human judgment matters most.

## How YvyShift answers each point

| Consideration | In the app |
|---|---|
| Trends over time on maps | Field Monitor (NASA GIBS imagery, two-date HLS comparison) and Field DNA (25 seasons in one picture) |
| Field-level vulnerabilities | Water deficit, heat at flowering and frost at the sensitive stage per rotation; fields drawn on the map |
| Timelines, overlays, scenario sliders | Climate Replay, sowing calendar, rainfall simulation slider in Rotation Lab |
| Easy for farmers | Farmer language on the home page, Sun mode, bottom navigation bar, 6 languages including Guaraní, works offline |
| Farmer priorities and constraints | Priority weights, soil type, crops the farmer cannot grow, a custom rotation |
| Complement local expertise | The NASA lens separates what NASA data decide from what the farmer decides; the Resilience Passport is made for the technician |
