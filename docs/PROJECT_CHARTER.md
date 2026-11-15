# Project charter · YvyShift

**Challenge:** Field Shift: Adapting Farms with NASA Data (NASA Space Apps 2026). **Local event:** Asunción, Paraguay (virtual). **Deadline:** Sunday 15 Nov 2026, 23:59 local time.

## Problem

In eastern Paraguay (Itapúa, Alto Paraná) soybean dominates the summer and the field is often left fallow in winter. Seasons such as 2021–22 showed that a dry, hot year hits soybean hard. Farmers decide what to do in winter and when to sow without a simple way to see how each rotation behaved in the good and bad years of their own area.

## User

A mid-sized grain farmer, or an extension or cooperative technician, in Itapúa or Alto Paraná, with a phone and an unreliable connection.

## Decision it supports

"Do I stay with soybean + fallow, or move to soybean + wheat, soybean + black oat, or early soybean + second-crop maize?", depending on what matters most to the farmer: water, heat, frost, soil cover, number of harvests.

## Product

A static web app that:
1. Loads 25 seasons of daily NASA POWER data for the area (from the cache or downloaded live).
2. Calculates, for 4 rotations: water deficit (soil water balance by soil type), heat at flowering, frost at the sensitive stage, share of the year with covered soil, harvests per year and crop diversity.
3. Lets the user choose a scenario (typical year, bad year, one season, El Niño or La Niña) and weights.
4. Ranks the rotations, shows what each dimension contributes and explains why.
5. Shows the NASA evidence and a confidence panel ("exploratory") with the missing data.

## Verifiable promise

"In under a minute, a farmer sees how 4 rotations would have behaved over the last 25 seasons of their area with NASA data, and what changes if they prioritise water or soil cover."

## Out of scope

Certified agronomic recommendations, yield in kg/ha, prices or income, field-level precision.
