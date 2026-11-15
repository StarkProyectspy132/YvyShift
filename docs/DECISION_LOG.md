# Registro de decisiones

| Fecha (PY) | Decisión | Por qué | Alternativas descartadas | Quién |
|---|---|---|---|---|
| 03-nov | Reto: Field Shift | Agricultura es central en Paraguay; datos NASA abundantes | Otros 13 retos | Equipo |
| 14-nov 14:40 | Sede: Asunción (virtual) | Confirmado por Miguel | Encarnación | Miguel |
| 14-nov 14:50 | Idea: Rotation Lab (comparador de rotaciones con escenarios) | Puntaje 40/50 en IDEA_SELECTION | Alerta SMAP (29), chatbot IA (24) | Claude A |
| 14-nov 14:50 | Zona piloto Itapúa + Alto Paraná | Núcleo sojero; donde la sequía 2021–22 pegó fuerte | Chaco (otro sistema productivo) | Claude A |
| 14-nov 14:55 | Dato base: NASA POWER diario 2001–2026 | API pública sin clave, CORS, 25 años; funciona en el navegador | Earthdata (requiere login; pesado para 30 h) | Claude A |
| 14-nov 14:55 | ET0 Hargreaves con Ra de POWER | Solo requiere variables confiables de POWER; FAO-56 lo admite si faltan datos | Penman-Monteith (más variables, viento/humedad de reanálisis) | Claude A |
| 14-nov 15:00 | App 100 % estática con caché offline | Plan B de demo, publicación gratis | Backend Python | Claude A |
| 14-nov 15:00 | Sumar MODIS NDVI vía GIBS como evidencia visual (sin login) | Dataset de Resources; muestra la sequía 2022 vs 2024 en el mapa; robusto offline | ORNL subsets (no respondió), SMAP (requiere login) | Claude A |
| 14-nov 15:30 | Balance hídrico con suelo (FAO-56 Tabla 19), arcilloso por defecto | Sin suelo, más cultivos = más déficit siempre; con suelo se ve que la cobertura seca el perfil antes de la soja | Déficit climático solo (queda como opción) | Claude A |
| 14-nov 15:30 | Normalización proporcional al máximo | Min-max exageraba diferencias pequeñas | Min-max | Claude A |
| 14-nov 16:10 | Sin IA generativa en el producto | Decisión de Miguel; la explicación de la app es determinista y trazable | Asistente con Claude o Gemini (requería clave y servidor) | Miguel |
| 14-nov 16:00 | No reutilizar la lógica de AgroClima PY (repo de Federico) | No contiene IA: usa OpenWeather y datos aleatorios como "predicción"; no usa NASA | Portar sus recomendaciones fijas | Claude A |
| 14-nov 15:00 | Confianza siempre "exploratorio" | Sin suelo, celda regional, calendarios sin validar | Etiqueta "alta" | Claude A |
| 15-nov 09:40 | Nombre único: **YvyShift** («yvy» = tierra en guaraní + «Shift» del reto) | La auditoría encontró 6 equipos «TerraShift» y un «RotationLab» en Field Shift. «Rotation Lab» queda solo como nombre del módulo de comparación | TERRA-SHIFT Paraguay, Kokue, Arandu Fields, Tierra Colorada | Equipo |
| 15-nov 09:40 | Quitar por completo el modo con IA (Gemini) de la app | Contradecía «la app no usa IA» (auditoría, punto 10). Plan futuro: IA local, opcional e instalable | Dejarlo apagado | Equipo |
| 15-nov 09:40 | Demo como video de 30 s con guion en inglés (`DEMO_SCRIPT_30S_EN.md`) | Límite oficial de 30 s o 7 diapositivas; el guion de 90 s no es elegible | 7 diapositivas (queda como plan B) | Equipo |
| 15-nov 10:30 | Lente NASA en Rotation Lab (botón «Ver solo los datos NASA») | Convierte el hallazgo N-1 en el mensaje central en vez de esconderlo | Esconder N-1 | Claude |
| 15-nov 10:30 | Mantener «56 × 62 km» como tamaño de la celda en Itapúa | La auditoría dijo 56 × 52, pero `engine.powerCell(-27.08, -55.65)` da 56 × 62 (0,625° × 111,32 km × cos 27,5°) | 56 × 52 | Claude |
| 15-nov 13:00 | v17 «uso en el campo»: modo sol, barra inferior de 5 botones con «Más», preguntas rápidas, portada en lenguaje del productor, letra sin serifa en el celular | Sugerencias de UX agrícola (`New Text Document.txt`) y auditoría móvil (`AUDITORIA_MOVIL.md`): 91 → 17 áreas táctiles chicas, 70 → 12 textos chicos | Mantener la tira de 9 iconos con desplazamiento | Equipo + Claude |
| 15-nov 13:00 | Fondo de portada con foto que se desplaza con el mouse (paralaje); quieto en celular y con «menos movimiento» | Pedido del equipo. En el celular el movimiento distrae y gasta batería | Paralaje con giroscopio | Equipo |

## 15-nov-2026 · Asistente con base de conocimiento e IA local opcional (v18)

- **Decisión:** el chat suma una base de 18 textos fijos con fuente y una IA local opcional (Llama 3.2 1B vía WebLLM, ~0,9 GB) que solo elige un tema de una lista cerrada.
- **Por qué:** el equipo pidió un chatbot de ~1 GB que funcione en el celular sin conexión, con una capa que le impida inventar.
- **Seguridad:** salida forzada por gramática + validación en código; el modelo nunca redacta la respuesta; aviso "puede equivocarse" junto al chat; tema y fuente visibles en cada respuesta.
- **Riesgo aceptado:** puede elegir mal el tema. No probado aún en teléfonos reales. Apagado por defecto. Ver `docs/MODO_IA.md`.
