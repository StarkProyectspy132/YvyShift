# Riesgos y límites

## Afirmaciones prohibidas (en la app, la página, el video y el pitch)
- "Recomienda qué sembrar" → decir "compara y explora".
- "Datos de tu parcela" → "datos de tu zona (celda de NASA POWER de unos 56 × 62 km en Itapúa)".
- "Predice el rendimiento" o "aumenta la ganancia X %" → no lo calculamos.
- "Satélite mide la humedad de tu suelo" → POWER es reanálisis/modelo; solo SMAP es satelital (si se agrega).
- "Único en el mundo".

- "Inteligencia artificial", "Machine Learning" o "predice el clima" → el producto no usa IA ni pronostica; compara con datos históricos.
- "Validado por el MAG" → no hay validación institucional.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| NASA POWER no figura en Resources del reto | T-01 a primera hora; si no figura, sumar un dataset de Resources (p. ej. SMAP) como evidencia sustancial |
| Calendarios incorrectos cambian el orden | Validación T-04; mostrar los calendarios en la app (P1) |
| Déficit sin suelo exagera el estrés | Declarado en el panel; T-07 balance con suelo |
| Internet falla en la demo | Caché offline; abrir `index.html` local |
| Llegar tarde al cierre | Entrega interna 22:00; congelar 15:00 |
| El .mp4 de 4 GB termina en GitHub | `.gitignore` lo excluye |

## Limitaciones conocidas (actualizado 15-nov-2026, después de la auditoría)

| Limitación | Qué se hizo | Estado |
|---|---|---|
| El ranking lo decide el calendario, no el clima (hallazgo N-1: con solo datos NASA, el barbecho gana 13 a 17 de 25 campañas) | Lente NASA y botón «Ver solo los datos NASA» en Rotation Lab; el pitch lo cuenta de frente | Mostrado en la app |
| La cosecha del maíz zafriña cae fuera de la ventana del modelo (el modelo corta el 30-abr; FAO GIEWS: junio a agosto) | Aviso en «Dónde pesa más tu criterio» cuando la comparación incluye maíz | Mostrado en la app; arreglo de fondo pendiente (ciclo que cruce el año agrícola) |
| Umbral de calor 35 °C | Fuente: Salem et al. 2007, Crop Science 47:219 (soja). Para trigo y maíz sigue siendo supuesto | Citado en «Términos» |
| Umbral de helada 2 °C a 2 m | Queda entre la helada meteorológica (0 °C) y la agrometeorológica (3 °C) del SMN de Argentina | Citado en «Términos»; falta validar con agrónomo |
| El «verdor» de la parcela es GCC sobre JPEG, no NDVI | Rotulado «Índice de verdor visual (no es NDVI)» | Hecho |
| Escala: parcela de 30 m, clima de ~56 × 62 km | Frase fija en el pie de la app | Hecho |
| Calendarios sin validación local | Ficha `VALIDACION_AGRONOMO.md` lista | Pendiente (Compañero 1) |
| Sin costos ni precios | Fuera de alcance para hoy | Pendiente |
| Guaraní sin revisión nativa | | Pendiente |
| Textos nuevos del 15-nov (lente NASA, avisos) aparecen en inglés en pt, gn, ja e hi | Faltan traducciones | Pendiente menor |
