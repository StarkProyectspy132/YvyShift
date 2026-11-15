# Scientific validation of the engine (`app/engine.js`)

## Formulas

1. **ET0 (mm/day)** = 0.0023 × 0.408 × Ra × (Tmean + 17.8) × √(Tmax − Tmin). FAO-56 eq. 52. Ra = `TOA_SW_DWN` (MJ/m²/day).
2. **Kc per 10-day period:** FAO-56 Table 12. Stages in fixed fractions of 15 / 25 / 40 / 20 % (initial, development, mid, late), with linear interpolation as in FAO-56 Fig. 25. *Simplifying assumption.*

| Crop | Kc ini | Kc mid | Kc end | Sensitive stage used |
|---|---|---|---|---|
| Soybean | 0.40 | 1.15 | 0.50 | mid → heat |
| Grain maize | 0.30 | 1.20 | 0.60 | mid → heat and frost |
| Wheat | 0.30 | 1.15 | 0.40 | mid → frost |
| Oat (approximates black oat) | 0.30 | 1.15 | 0.25 | none |

Soybean also counts frost (≤ 2 °C) at the initial stage (emergence). This is an assumption to validate, added on 14 Nov so that sowing earlier has a cost in the model. Result with real data: over 25 seasons, the POWER cells of Itapúa and Alto Paraná record no day ≤ 2 °C during the emergence of soybean sown between 11 and 20 September. A cell of about 50 km may not see local frost.

**Sensitivity to sowing date** (clay soil, default weights, seasons in which each rotation ranks first, out of 25):
- Itapúa: 10 days earlier B 7, C 9, D 9; assumed calendar B 7, C 6, D 12; 10 days later B 8, C 3, D 14.
- Alto Paraná: earlier B 8, C 9, D 8; assumed B 10, C 5, D 10; later B 11, C 5, D 9.

Conclusion: which rotation leads depends on the sowing date, so validating the calendars is what would change the result most. The 35 °C and 2 °C thresholds cannot be varied offline, because the cache stores counts per 10-day period that are already computed.

3. **Water deficit (mm of unmet demand)**, two modes selectable in the app:
   - *Without soil (climatic):* sum over cropped 10-day periods of max(0, Kc × ET0 − P).
   - *With soil (default, clay):* a "bucket" balance per 10-day period, continuous across seasons: available = min(TAW, S + P); use = min(ETc, available); deficit = ETc − use; S = available − use. TAW = (θFC − θWP) × 1.0 m of roots, using the mid-point of FAO-56 Table 19: sandy 80 mm, loam 155 mm, clay 160 mm. In fallow the soil loses water with Kc = 0.3 (*assumption*: soil with no-till residue), but that deficit is not counted. So a winter or cover crop leaves the soil drier for soybean, and the model reflects that trade-off. No runoff or separate drainage (water above TAW is lost).
4. **Heat:** days with T2M_MAX ≥ 35 °C in the mid stage. **Frost:** days with T2M_MIN ≤ 2 °C in the mid stage. Thresholds are sourced in `RISKS_AND_LIMITATIONS.md`. This is air temperature at 2 m, not crop temperature.
5. **Covered soil (%)** = 10-day periods with a living crop / 36 (from the calendar, not from satellites).
6. **Crop diversity** = number of different botanical families in the rotation (legume, grass). Added on 14 Nov as a second soil health indicator. It comes from the calendar, not from NASA data. With the four fixed rotations it only separates the baseline (1 family) from the rest (2); in custom rotations it distinguishes, for example, oat + maize (1 family) from oat + soybean (2). *A simple indicator: it does not measure organic matter or soil structure.*
7. **Score** = Σ normalised weight × normalised value × 100. Normalisation is proportional to the group maximum: "lower is better" → 1 − (v − min)/max; "higher is better" → v/max. We chose this instead of min-max because min-max turned a 6 % difference in deficit into 0 versus 100 points. The scale is relative to the rotations being compared.

## Calendars (agricultural year from 1 May), pending local validation

| Rotation | Crops and window |
|---|---|
| A (baseline) | Soybean 11 Oct → 10 Feb; winter fallow |
| B | Wheat 21 May → 10 Oct; soybean 11 Oct → 10 Feb |
| C | Black oat 1 May → 31 Aug; soybean 11 Oct → 10 Feb |
| D | Early soybean 11 Sep → 10 Jan; second-crop maize 11 Jan → 30 Apr |

## Tests

`node --test tests/engine.test.js` covers: ET0 against a hand-calculated value; 10-day periods and agricultural years; aggregation with −999 values; the Kc curve; overlapping calendars; indicators with synthetic climate **marked as TEST**; weights changing the order; median, 1-in-5 and single-season scenarios; plausibility of the real data; 2021–22 worse than the median; the soil water balance (capacity, carry-over, effect of the cover crop on soybean); a continuous series with real data. `tests/validation.test.js` checks the external validation figures.

## Observed result (real data, default weights 3/2/2/3/2/2, recalculated on 14 Nov with the diversity indicator)

Clay soil. Itapúa: typical year → C (black oat) 91.4, B 85.3, D 82.4, A (baseline) 74.1. Bad year and the 2021–22 season → D first (96.4 in 2021–22), because early soybean avoids part of the heat at flowering (27 vs 38 days). Alto Paraná: same pattern (C in a typical year, D in 2021–22). **This is an exploratory hypothesis, not a recommendation**: it depends on the assumed calendar.

## Season by season (`seasonWins`)

With clay soil and default weights, over the 25 seasons of Itapúa: D ranks first in 12, B in 7, C in 6, A (baseline) in 0. C beats the baseline in 25 of 25, B in 24, D in 23. Alto Paraná: B 10, D 10, C 5. The diversity indicator did not change which rotation ranks first in any season (it adds the same to B, C and D); it did change the scores and how often the baseline is beaten. With only the three climate dimensions (weights 3/2/2/0/0/0), the baseline ranks first in 17 of 25 seasons and D in 8, in both areas.

**Honest reading:** the baseline (fallow) loses on "covered soil" and "harvests" by construction, so with weights that value those dimensions it almost never wins. What is informative is *which* alternative wins depending on the year and the priorities. If the farmer sets those two weights to 0, the baseline competes again. The app makes this visible with the NASA lens.

## Consistency check with GWETROOT (`soilCoherence`, 14 Nov)

Bucket water fraction (S / TAW) against POWER `GWETROOT`, in the soybean periods of rotation A, clay soil, 25 seasons (300 periods): r = 0.61 in Itapúa and 0.58 in Alto Paraná. **This is not independent validation**: both series start from the same MERRA-2 rainfall, and they measure different things (water available to the plant versus wetness relative to saturation).

In 2021–22 (Itapúa) the bucket goes from 89 % to 0 % and stays empty from mid-December; `GWETROOT` goes from 70 % to 61 %. The simple bucket reacts much more strongly, so the deficit in dry years (348 mm in 2021–22) may be overstated. Possible causes to review: TAW of 160 mm with 1 m of roots, no capillary rise and no reduction of transpiration under stress (FAO-56 uses a Ks coefficient that is not applied here).

## El Niño and La Niña (`ensoPhase`, `app/data/enso_oni.js`, 14 Nov)

NOAA CPC Oceanic Niño Index (https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt, read on 14 Nov 2026). **It is not NASA data**; it only groups seasons and is not part of the score. Season phase = ONI of the November–January quarter: El Niño if ≥ +0.5; La Niña if ≤ −0.5. *Simple assumption*: NOAA requires five consecutive quarters. Result: 10 La Niña seasons, 6 neutral, 9 El Niño.

Rain during the soybean cycle (rotation A), median and range. Itapúa: La Niña 614 mm (369–902), neutral 631 (402–789), El Niño 848 (637–1141); rain below demand in 6/10, 3/6 and 1/9. Alto Paraná: La Niña 623 (408–988), neutral 579 (466–797), El Niño 738 (611–1000); 5/10, 3/6 and 0/9. ONI–rain correlation: r = 0.62 (Itapúa) and 0.43 (Alto Paraná), n = 25. The ranges overlap: the phase shifts the odds, it does not decide the season. The "La Niña / El Niño seasons" scenarios use the median of each indicator within the group. Latest ONI published when read: Aug–Oct 2026 = +2.46.

## Hypothetical rainfall (`scaleRain`, 14 Nov)

Multiplies the rain of each 10-day period by a factor (0.7 to 1.3) on a copy of the series; the observed data are not changed. ET0, heat days and frost days do not change. **It is a simulation, not data or a forecast**, and the app labels it in every section. It is not a realistic climate change: a drier year is usually also hotter, and here temperature stays the same. Itapúa, default weights, clay soil, with −20 %: D first in 10 of 25 seasons, B in 8, C in 7 (observed: 12, 7, 6).

## Farmer constraints

Rotations that include a crop marked as unavailable leave the comparison. Because the score is relative to the group being compared, the scores of the remaining rotations change. The baseline is never removed.

## Pending

- Real soil for each area (soil map of the Eastern Region) instead of generic classes; root depth per crop.
- Cross-check with IMERG and a local weather station.
- Review of thresholds and calendars by an agronomist.
