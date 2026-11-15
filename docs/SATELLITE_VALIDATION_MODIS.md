# Satellite validation: MODIS NDVI against the model's deficit

Date: 15 Nov 2026. It answers the strongest criticism under the Relevance criterion: until then, the only NASA dataset used with numbers was NASA POWER, which is a reanalysis and not a satellite observation.

## Question

Is the greenness a NASA satellite measured in January, when soybean is in full growth, lower in the seasons where the model says soybean lacked water?

If the answer is yes, two NASA sources that measure different things (reanalysis climate against reflectance observed from space) tell the same story, and the model is also checked against a direct observation.

## Data

| Item | Detail |
|---|---|
| Product | MODIS/Terra Vegetation Indices 16-Day L3 Global 250 m (MOD13Q1, collection 6.1), band `250m_16_days_NDVI` |
| Service | ORNL DAAC MODIS Web Service (`https://modis.ornl.gov/rst/api/v1/`), no account needed, queried on 15 Nov 2026 from the team's computer browser |
| Location | A box of about 4 × 4 km (17 × 17 pixels of 250 m) centred on each area's point: Itapúa (−27.08, −55.65) and Alto Paraná (−25.79, −55.09) |
| Dates | Composites starting on 1 and 17 January of each year, 2002 to 2026; the average of the two is used |
| Quality | Fill value (−3000) excluded. In the sample reviewed (Itapúa 2002–2012), the reliability band gave 289 of 289 good or marginal pixels on every date |
| Model | Soybean water deficit, baseline rotation (soybean + fallow), clay soil, computed by `engine.js` with NASA POWER |

Raw data and averages: `data/modis_ndvi_enero_ornl.json`. Averages used by the app: `app/data/validation.js` (`VALIDATION.modis`). Automated test: `tests/validation.test.js`.

## Results

| Area | Correlation January NDVI vs model deficit | Seasons | Least green January |
|---|---|---|---|
| Itapúa | **r = −0.76** | 25 | 2021–22 (NDVI 0.60) |
| Alto Paraná | **r = −0.51** | 25 | 2021–22 (NDVI 0.47) |

In Itapúa, the five least green Januaries were 2021–22, 2008–09, 2001–02, 2005–06 and 2011–12. Four of them (2021–22, 2008–09, 2005–06 and 2011–12) are among Paraguay's five worst real soybean harvests according to FAO. January NDVI also follows the national yield: r = +0.69 over 23 seasons.

For scale: in the 2021–22 drought the mean January NDVI in Itapúa was 0.60, against 0.73 in January 2024, a wet season.

## How to read it

In Itapúa the agreement is strong. In Alto Paraná it is weaker, and there is a likely explanation that we did not verify: more early soybean (September) is sown there, which in January is already maturing or harvested, so January greenness also depends on the sowing date and not only on water. Several seasons with little or no deficit in the model (2012–13, 2014–15, 2015–16, 2017–18) have low-greenness Januaries in Alto Paraná, and January NDVI there has generally declined since 2012, which points to a change in calendar or land use rather than climate.

Line for the project page and the pitch, with both figures: *"NASA's MODIS satellite agrees: January greenness falls in the seasons the model flags as dry (r = −0.76 in Itapúa, −0.51 in Alto Paraná, 25 seasons)."*

## Limits

The 4 × 4 km box mixes soybean with forest, pasture and roads; it is not a crop mask. Only January is used; a full October to March series would be better. The two sources are not fully independent of the real climate, and that is fine: both should respond to the same drought. The correlation does not validate the rotation ranking, only the soybean water indicator that feeds it. We did not use SMAP or IMERG because they require an Earthdata account.

## How to repeat it

In a browser, open a tab on `https://modis.ornl.gov/` and request, for each year and area:

```
/rst/api/v1/MOD13Q1/subset?latitude=-27.08&longitude=-55.65&band=250m_16_days_NDVI&startDate=A2022001&endDate=A2022017&kmAboveBelow=2&kmLeftRight=2
```

Each request takes between 20 and 60 seconds. Average the valid values (greater than −2000) and multiply by 0.0001.
