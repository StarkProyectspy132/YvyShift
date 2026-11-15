# Validación con satélite: NDVI de MODIS frente al déficit del modelo

Fecha: 15-nov-2026. Responde al punto 3.3 de la auditoría (`auditoria_competitiva/09_PROMPT_PARA_LLEGAR_A_25.md`) y a la crítica más fuerte del criterio Relevancia: hasta ayer, el único dato NASA con números era NASA POWER, que es un reanálisis y no una observación satelital.

## Pregunta

¿El verdor que midió un satélite de NASA en enero, cuando la soja está en pleno desarrollo, es más bajo en las campañas en que el modelo dice que a la soja le faltó agua?

Si la respuesta es sí, dos fuentes de NASA que miden cosas distintas (clima de reanálisis frente a reflectancia observada desde el espacio) cuentan la misma historia, y el modelo queda validado también con una observación directa.

## Datos

| Elemento | Detalle |
|---|---|
| Producto | MODIS/Terra Vegetation Indices 16-Day L3 Global 250 m (MOD13Q1, colección 6.1), banda `250m_16_days_NDVI` |
| Servicio | ORNL DAAC MODIS Web Service (`https://modis.ornl.gov/rst/api/v1/`), sin cuenta, consultado el 15-nov-2026 desde el navegador de la PC del equipo |
| Lugar | Recuadro de unos 4 × 4 km (17 × 17 píxeles de 250 m) centrado en el punto de cada zona: Itapúa (−27,08; −55,65) y Alto Paraná (−25,79; −55,09) |
| Fechas | Compuestos que empiezan el 1 y el 17 de enero de cada año, 2002 a 2026; se usa el promedio de los dos |
| Calidad | Valor de relleno (−3000) excluido. En la muestra revisada (Itapúa 2002–2012), la banda de confiabilidad dio 289 de 289 píxeles buenos o marginales en todas las fechas |
| Modelo | Déficit de agua de la soja, rotación base (soja + barbecho), suelo arcilloso, calculado por `engine.js` con NASA POWER |

Datos crudos y promedios: `data/modis_ndvi_enero_ornl.json`. Promedios usados por la app: `app/data/validation.js` (`VALIDATION.modis`). Prueba automática: `tests/validation.test.js`.

## Resultados

| Zona | Correlación NDVI de enero – déficit del modelo | Campañas | Enero menos verde |
|---|---|---|---|
| Itapúa | **r = −0,76** | 25 | 2021–22 (NDVI 0,60) |
| Alto Paraná | **r = −0,51** | 25 | 2021–22 (NDVI 0,47) |

En Itapúa, los cinco eneros menos verdes fueron 2021–22, 2008–09, 2001–02, 2005–06 y 2011–12. Cuatro de ellos (2021–22, 2008–09, 2005–06 y 2011–12) están entre las cinco peores cosechas reales de soja de Paraguay según la FAO. El NDVI de enero también sigue al rendimiento nacional: r = +0,69 en 23 campañas.

Para ver la escala: en la sequía 2021–22 el NDVI medio de enero en Itapúa fue 0,60, frente a 0,73 en enero de 2024, una campaña húmeda.

## Cómo leerlo

En Itapúa el acuerdo es fuerte. En Alto Paraná es más débil, y hay una explicación probable que no verificamos: allí se siembra más soja temprana (septiembre), que en enero ya está madurando o cosechada, así que el verdor de enero depende también de la fecha de siembra y no solo del agua. Varias campañas con poco o ningún déficit en el modelo (2012–13, 2014–15, 2015–16, 2017–18) tienen eneros poco verdes en Alto Paraná, y el NDVI de enero de esa zona baja en general desde 2012, lo que apunta a un cambio en el calendario o en el uso del suelo más que al clima.

Frase para la página y el pitch, con las dos cifras: *"NASA's MODIS satellite agrees: January greenness falls in the seasons the model flags as dry (r = −0.76 in Itapúa, −0.51 in Alto Paraná, 25 seasons)."*

## Límites

El recuadro de 4 × 4 km mezcla soja con monte, pasturas y caminos; no es una máscara de cultivo. Solo se mira enero; una serie completa de octubre a marzo sería mejor. Las dos fuentes no son totalmente independientes del clima real, y eso está bien: ambas deberían responder a la misma sequía. La correlación no valida el ranking de rotaciones, solo el indicador de agua de la soja que lo alimenta. No usamos SMAP ni IMERG porque requieren cuenta Earthdata.

## Cómo repetirlo

En un navegador, abrir una pestaña en `https://modis.ornl.gov/` y pedir, para cada año y zona:

```
/rst/api/v1/MOD13Q1/subset?latitude=-27.08&longitude=-55.65&band=250m_16_days_NDVI&startDate=A2022001&endDate=A2022017&kmAboveBelow=2&kmLeftRight=2
```

Cada pedido tarda entre 20 y 60 segundos. Promediar los valores válidos (mayores que −2000) y multiplicar por 0,0001.
