# YvyShift · 7-slide demo (English)

Official limits: at most 7 slides including the title, all text in English, published at a link that opens without signing in. Use real screenshots of the app; no mock-ups, NASA logos or AI-generated images. Every number comes from the app, [`EXTERNAL_VALIDATION.md`](EXTERNAL_VALIDATION.md) or [`SATELLITE_VALIDATION_MODIS.md`](SATELLITE_VALIDATION_MODIS.md).

---

## Slide 1 · Title and team

**On slide**
- YvyShift
- *The field that remembers*
- "Yvy" means land in Guaraní
- Team [TEAM NAME] · Asunción, Paraguay · NASA Space Apps 2026 · Field Shift: Adapting Farms with NASA Data

**Visual:** the app's home page on a computer and on a phone, side by side.

**Speaker notes:** "We are [team name], from Asunción, Paraguay. YvyShift is a free app that lets farmers test crop rotations against 25 years of NASA climate data for their own area."

---

## Slide 2 · The problem

**On slide**
- In 2021–22, drought cut Paraguay's soybean harvest in half: 10.5 → 5.2 million tonnes (FAO)
- Itapúa that season: 369 mm of rain vs about 729 mm the soybean needed · 76 days at 35 °C or more
- Every winter, farmers choose: fallow, wheat, black oat cover crop, or early soybean + second-crop maize
- They choose without seeing how each option behaved in their area's good and bad years

**Visual:** the HLS 30 m satellite comparison of Itapúa, January 2022 (brown) against January 2024 (green).

**Speaker notes:** "In the 2021–22 drought Paraguay lost half its soybean harvest. In Itapúa the crop got half the water it needed. Every winter, farmers choose a rotation, and each option trades water, heat, frost, soil cover and harvests. Nobody shows them how each one would have done in their own past seasons."

---

## Slide 3 · How it works

**On slide**
- Pick an area: 8 Paraguayan areas stored offline, any point in the world, or your own field drawn on a map
- Pick a climate scenario: typical year, 1-in-5 bad year, El Niño, La Niña, or a real season
- Pick soil type, crops you can't grow, and what matters to you
- YvyShift replays 4 rotations (plus your own) over 25 seasons of NASA POWER daily data with the FAO-56 water balance
- Each score shows how much comes from NASA climate data and how much from the crop calendar

**Visual:** Rotation Lab with Itapúa selected and the ranking bars split into "climate (NASA)" and "calendar".

**Speaker notes:** "The farmer picks an area, a scenario, a soil and their priorities. YvyShift replays four local rotations over 25 seasons of daily NASA POWER data, using the FAO-56 crop water method. Every score is split: this part comes from NASA data, this part from the calendar."

---

## Slide 4 · The NASA lens: our most honest feature

**On slide**
- One button: "Show NASA data only"
- With NASA climate data alone, soybean + winter fallow ranks first in 13 to 17 of 25 seasons, in all 8 areas
- With balanced priorities, fallow never ranks first
- **NASA data show what each extra crop costs in water. The farmer decides what that water is worth.**

**Visual:** the same ranking before and after tapping "Show NASA data only".

**Speaker notes:** "This is the feature we are proudest of. With NASA data alone, leaving the field empty in winter wins most seasons, because any winter crop uses water. Soil cover and a second harvest flip the ranking, and that is the farmer's call. We show the line between data and judgment instead of hiding it."

---

## Slide 5 · Does it match reality?

**On slide**
- Checked against 23 real soybean harvests (FAO, 2002–2024): correlation −0.83
- The model's 5 driest seasons include 4 of the 5 worst real harvests (chance at random ≈ 0.3 %)
- NASA MODIS satellite: January greenness drops in the seasons the model flags as dry (r = −0.76 in Itapúa)
- NASA POWER rain agrees with the independent ERA5 reanalysis (r = 0.74 and 0.85)

**Visual:** the "How sure is this" section with the chart of deficit against real harvests.

**Speaker notes:** "We checked the model against data it never used. When the model says soybean lacked water, real harvests fall: minus 0.83 over 23 seasons. It finds four of the five worst years with no tuning. And NASA's MODIS satellite sees those same seasons as less green fields."

---

## Slide 6 · Built for the field

**On slide**
- Free, installs on a phone, works offline after the first visit
- 6 languages: Spanish, English, Guaraní, Portuguese, Japanese, Hindi
- Field DNA, Climate Replay, Adaptive Monitor and a printable Resilience Passport reuse the same numbers
- Optional local AI assistant runs on the device; its answers are labelled and never invent numbers
- Honest limits: regional climate (a NASA POWER cell is about 56 × 62 km), no prices, calendars still need a local agronomist

**Visual:** a phone showing Field DNA (the 25-year bars) and the assistant chat.

**Speaker notes:** "It is built for rural Paraguay: a free app that installs on a phone, works without signal and speaks Guaraní. The same numbers feed a climate memory of the area, a replay of hard years and a printable report for the technician or the bank. We also say clearly what it cannot do."

---

## Slide 7 · Try it

**On slide**
- Try it: [PUBLIC APP URL]
- Code: https://github.com/StarkProyectspy132/YvyShift
- Next: validate with IPTA agronomists and cooperatives, add SMAP soil moisture and GPM rainfall, test with farmers in Itapúa and Alto Paraná
- Built with NASA POWER, MODIS and HLS · Development assisted by Claude (Anthropic)

**Visual:** a QR code that opens the app, generated once the public address exists.

**Speaker notes:** "YvyShift is live and open source. Next we want agronomists from IPTA and the cooperatives to validate the calendars, and to test it with farmers in Itapúa and Alto Paraná. Thank you."

---

## Before publishing

1. Replace [TEAM NAME] and [PUBLIC APP URL].
2. Export to PDF and check it has exactly 7 pages.
3. Upload it with public access and open the link in a private window.
4. That link goes in "Link to Project Demo" on the submission form.
