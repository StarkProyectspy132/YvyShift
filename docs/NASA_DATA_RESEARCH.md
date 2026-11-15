# Datos NASA y científicos

## En uso (verificado: descarga real 14-nov-2026 17:45 UTC)

| Campo | NASA POWER Daily API |
|---|---|
| Fuente | NASA LaRC POWER Project, https://power.larc.nasa.gov/ — API `v2.10.3` "POWER Daily API" |
| Elegibilidad | ✅ Figura en la pestaña Resources del reto ("NASA POWER: Agroclimatology & Meteorological Data"), confirmado por Miguel el 14-nov. |
| Variables | `PRECTOTCORR` precipitación corregida (mm/día); `T2M`, `T2M_MAX`, `T2M_MIN` temperatura a 2 m (°C); `TOA_SW_DWN` radiación en el tope de la atmósfera (MJ/m²/día); `GWETROOT` humedad relativa de zona radicular (0–1) |
| Fuentes internas | MERRA-2, GEOS-IT, CERES SYN1deg, FLASHFlux (según encabezado de la respuesta) |
| Tipo de dato | Reanálisis/modelo + productos satelitales; **no** estación ni observación de parcela |
| Resolución | Meteorología ~0,5° × 0,625° (MERRA-2); diaria; tiempo estándar local (LST) |
| Periodo usado | 2001-05-01 → 2026-10-31 (25 campañas completas, 2001–02 a 2025–26) |
| Puntos | Itapúa -27.08, -55.65 (elev. 187 m); Alto Paraná -25.79, -55.09 (elev. 257 m) |
| Método | API REST pública sin clave; agregación a dekadas (10 días) por año agrícola mayo–abril |
| Calidad | Valor de relleno -999 → la dekada se marca incompleta y la campaña no se usa |
| Uso en la app | ET0, demanda de cultivo, déficit, días de calor y helada; gráfico de evidencia |
| Cita UI | "Datos: NASA Langley Research Center POWER Project" |

## Verificación de plausibilidad (Itapúa)
Lluvia anual 1.248–2.566 mm y ET0 1.211–1.604 mm. La campaña 2021–22 tiene la ET0 más alta (1.604 mm) y la mayor cantidad de días ≥ 35 °C (76) de la serie, coherente con la sequía registrada esa campaña. **Pendiente:** contrastar con una fuente independiente (estación DMH o informe MAG) — T-06.

## En uso como evidencia visual: MODIS NDVI (Resources: "Landsat and MODIS/VIIRS")
| Campo | Valor |
|---|---|
| Producto | MODIS/Terra Vegetation Indices 16-Day L3 (MOD13), capa GIBS `MODIS_Terra_L3_NDVI_16Day` |
| Acceso | NASA GIBS WMS (Worldview), sin login: `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi` |
| Fechas | Compuestos que empiezan el 2022-01-01 (sequía) y 2024-01-01 (campaña lluviosa) |
| Área | 28°S–24,5°S, 57°O–54°O, 600×700 px (imagen renderizada, no valores numéricos) |
| Uso | Contexto visual en la app; **no entra en el puntaje** |
| Archivos | `app/data/img/modis_ndvi_2022-01-01.jpg`, `modis_ndvi_2024-01-01.jpg` (descargados 14-nov-2026) |

Intento fallido: la API de subconjuntos MODIS de ORNL DAAC (valores NDVI por punto) no respondió en 40 s desde la computadora del equipo; se descartó para no arriesgar la demo.

## Candidatos (Claude B)
| Producto | Para qué | Advertencia |
|---|---|---|
| SMAP L3/L4 humedad de suelo | Evidencia satelital de sequedad del suelo en 2021–22 vs mediana | 9–36 km; profundidad 0–5 cm (L3) o zona radicular modelada (L4) |
| GPM IMERG | Contrastar la lluvia de POWER (en Resources) | 0,1°; requiere cuenta Earthdata (gratis) |
| SRTM | Pendiente del terreno → riesgo de erosión en barbecho (en Resources) | 30 m; requiere Earthdata u OpenTopography |
| GLDAS | Humedad de suelo modelada para el balance (en Resources) | 0,25°; Earthdata |
| FAO GAEZ | Aptitud de cultivos y restricciones de suelo en Paraguay (en Resources, global) | 5 arc-min |
| MODIS NDVI (MOD13Q1) | Mostrar el efecto de la sequía en la vegetación | 250 m, 16 días, nubes |

## Fuentes locales a buscar (Compañero 1)
MAG (calendario agrícola), IPTA (trigo, soja, cobertura), CAPECO (superficie y fechas de siembra), mapas de suelo (Reconocimiento de suelos de la Región Oriental).

## Referencias
- Allen, R.G., Pereira, L.S., Raes, D., Smith, M. (1998). *Crop evapotranspiration*. FAO Irrigation and Drainage Paper 56. Roma: FAO. (Ec. 52 Hargreaves; Tabla 12 Kc).
- Hargreaves, G.H., Samani, Z.A. (1985). Reference crop evapotranspiration from temperature. *Applied Engineering in Agriculture*, 1(2), 96–99.
- NASA POWER Project. https://power.larc.nasa.gov/docs/
