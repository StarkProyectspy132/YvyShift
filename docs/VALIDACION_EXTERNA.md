# Validación externa del modelo (sin consultar a un agrónomo)

Fecha: 14-nov-2026. Todo se calculó con los datos de la caché de la app y con fuentes públicas leídas ese día. Datos en `app/data/validation.js`; cálculo en `engine.yieldValidation()`, con prueba automática (20 de 20 pruebas pasan). La app lo muestra en la sección 5, "Qué tan seguro es esto".

## 1. El modelo frente al rendimiento real de la soja (lo más fuerte)

**Pregunta:** ¿el agua que le faltó a la soja según el modelo coincide con los años en que la soja de Paraguay rindió mal?

**Datos:** rendimiento nacional de soja de Paraguay, 2002–2024 (FAO, FAOSTAT; descargado vía Our World in Data porque FAOSTAT no respondía). Se le quitó la tendencia tecnológica (+0,029 t/ha por año) y se usó la anomalía en %. El indicador del modelo es el déficit de agua de la soja (rotación base, suelo arcilloso), promedio de un punto en cada uno de los 5 departamentos con más soja (Alto Paraná, Canindeyú, Itapúa, San Pedro, Caaguazú). **El modelo no se ajustó con estos datos.**

| Resultado | Valor |
|---|---|
| Correlación déficit del modelo – anomalía de rendimiento | **r = −0,83** (23 campañas) |
| Correlación días de calor en floración – anomalía | r = −0,77 |
| Sin la sequía 2021–22 | r = −0,77 |
| Las 5 peores campañas reales | 2021–22, 2011–12, 2008–09, 2005–06, 2003–04 |
| Las 5 más secas según el modelo | 2021–22, 2011–12, 2008–09, 2005–06, 2022–23 |
| Coincidencias | **4 de 5** (probabilidad de acertarlo al azar: 0,3 %) |
| La misma prueba en cada una de las 8 zonas | r entre −0,59 (Misiones) y −0,86 (Alto Paraná) |

Con solo Itapúa y Alto Paraná (la primera versión) daba r = −0,81.

Frase para el pitch: *"Sin ajustar nada, el modelo encuentra 4 de los 5 peores años de la soja paraguaya desde 2002."*

## 2. Lluvia de NASA POWER frente a otra fuente

ERA5 (ECMWF, Copernicus) vía Open-Meteo, mismos dos puntos, lluvia del ciclo de la soja (11-oct a 10-feb), 24 campañas.

| Zona | Correlación | Sequía 2021–22: POWER / ERA5 |
|---|---|---|
| Itapúa | r = 0,74 | 369 / 381 mm |
| Alto Paraná | r = 0,85 | 408 / 313 mm |

ERA5 es otro reanálisis de otro centro: independiente de NASA, pero no una medición de estación.

## 3. Calendarios frente a fuentes publicadas

| Cultivo | Resultado |
|---|---|
| Soja (11-oct y 11-sep) | ✅ Dentro de la ventana publicada: siembra de fines de agosto a inicios de noviembre, cosecha de fines de diciembre a marzo ([farmdoc daily, 21-abr-2026](https://farmdocdaily.illinois.edu/2026/04/paraguays-role-in-the-global-soybean-market.html)) |
| Trigo | 🟡 La cosecha empieza en septiembre ([FAO GIEWS, 25-sep-2026](https://www.fao.org/giews/countrybrief/country.jsp?code=PRY)); el modelo cosecha hasta el 10-oct. Siembra sin fuente |
| Maíz zafriña | ⚠️ La FAO reporta la cosecha entre junio y agosto; el modelo lo corta el 30-abr. **No cuenta heladas de mayo y junio en el maíz: puede subestimar el riesgo de la rotación D.** Está dicho en la app |
| Avena negra | Sin calendario publicado encontrado. **No se muestra en la app** (decisión del equipo, 14-nov): la tabla de contrastes solo lista lo que se pudo comparar. El calendario sigue marcado como supuesto en la sección de confianza |

La página de calendarios de USDA (IPAD) fue retirada y no se pudo usar.

## 3b. Validación con satélite (agregada el 15-nov-2026)

NDVI de MODIS (MOD13Q1) de enero frente al déficit del modelo: **r = −0,76 en Itapúa** y **r = −0,51 en Alto Paraná**, 25 campañas; el enero menos verde en las dos zonas fue el de la sequía 2021–22. Detalle en `VALIDACION_SATELITAL_MODIS.md`.

## 4. Cifras de impacto con fuente

| Cifra | Fuente |
|---|---|
| La producción de soja cayó **50 %** en la sequía: de 10,5 a 5,2 millones de t; el rendimiento, de 2,89 a 1,47 t/ha | FAO, FAOSTAT (vía Our World in Data) |
| **3.009.608 ha** de soja en la Región Oriental en 2022; más del 87 % en Alto Paraná, Canindeyú, Itapúa, San Pedro y Caaguazú | Censo Agropecuario Nacional 2022, citado por [Última Hora](https://www.ultimahora.com/la-soja-tuvo-minimo-impacto-en-cambio-de-uso-de-suelos) |
| Casi **39.000 pequeños productores** (fincas de menos de 20 ha) plantan el 20 % de la soja | UGP, agosto de 2017, citado por [Última Hora](https://www.ultimahora.com/casi-39000-pequenos-productores-plantan-el-20-del-total-la-soja-n1103857). Dato viejo: decirlo con el año |
| Los productores prevén sembrar unas **3,6 millones de ha** de soja en 2025/26 | Asociación de Productores de Soja, citada por [La Nación, 7-sep-2025](https://www.lanacion.com.py/negocios_edicion_impresa/2025/09/07/los-sojeros-preven-una-siembra-de-36-millones-de-hectareas/) |
| Paraguay aporta en promedio el **3,9 %** de las exportaciones mundiales de soja desde 2000 | [farmdoc daily, 21-abr-2026](https://farmdocdaily.illinois.edu/2026/04/paraguays-role-in-the-global-soybean-market.html) |

Otras estimaciones de la cosecha 2021–22 son más bajas (USDA 3,9 Mt; CAPECO llegó a estimar 2,97 Mt). La app usa la de la FAO.

## Límites

- El rendimiento es nacional; el modelo usa dos puntos del núcleo sojero.
- 23 campañas; correlación no es causa. La anomalía respecto de la tendencia reduce, pero no elimina, el efecto de precios, plagas y tecnología.
- Se valida el indicador climático de la soja, no el puntaje de cada rotación: no hay datos públicos de rendimiento por rotación.
- Los calendarios siguen sin validación local completa; esto la reemplaza en parte, no del todo.

## Cómo repetirlo

Los datos descargados y los scripts están en `_work/validacion/` (no se suben al repositorio). Desde la carpeta del proyecto:

```
node _work/validacion/yieldval.js . _work/validacion/owid_soy_yield.csv
node _work/validacion/rainval.js . _work/validacion
node _work/validacion/makeval.js . _work/validacion
```

El último regenera `app/data/validation.js` sin las cifras de impacto ni los calendarios, que se agregaron a mano al final del archivo.
