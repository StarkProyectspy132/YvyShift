# Selección de idea (14-nov-2026)

Escala 1–5. Pesos internos iguales (no son pesos oficiales).

| Dimensión | 1. Rotation Lab (comparador de rotaciones por escenarios) | 2. Alerta de ventana de siembra con humedad de suelo SMAP | 3. Asistente conversacional agrícola (IA, español/guaraní) |
|---|---|---|---|
| Ajuste a Field Shift | 5: el reto pide explorar rotaciones con prioridades del productor | 3: útil pero no compara rotaciones | 3: depende del contenido, no del dato |
| Uso de datos NASA | 4: POWER 25 años, calculado y citado; SMAP/IMERG como extra | 4: SMAP central, pero 9–36 km y latencia | 2: el dato queda detrás del texto |
| Validez científica | 4: FAO-56, pruebas, límites visibles | 3: interpretar SMAP para siembra requiere calibración local | 2: riesgo de alucinaciones |
| Innovación | 4: prioridades editables + evidencia + confianza | 3: existen alertas similares | 3: hay muchos chatbots |
| Impacto | 4: soja es central en PY; adaptación a sequía | 4 | 3 |
| Viabilidad en 30 h | 5: ya funciona v0 | 3: descarga y procesamiento de SMAP es pesado | 3 |
| Demo | 5: mover un control y ver cambiar el orden | 3 | 4 |
| Datos locales | 3: calendarios a validar | 3 | 2 |
| Explicar límites | 5: panel de confianza integrado | 3 | 2 |
| **Total** | **40** | 29 | 24 |

**Decisión:** Rotation Lab. De la idea 2 tomamos SMAP como **capa de evidencia** opcional (Claude B). La IA conversacional se descarta para el MVP (riesgo de claims no validados).

**Qué ya existe y qué es nuestro:** existen calculadoras FAO-56 (CROPWAT) y visores de clima; lo nuestro es comparar rotaciones locales con 25 campañas NASA reales y prioridades del productor, con trazabilidad y confianza explícita, gratis y en el celular. No afirmamos que sea "único en el mundo".
