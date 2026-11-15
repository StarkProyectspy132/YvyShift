# Validación científica del motor (`app/engine.js`)

## Fórmulas
1. **ET0 (mm/día)** = 0,0023 × 0,408 × Ra × (Tmedia + 17,8) × √(Tmax − Tmin). FAO-56 ec. 52. Ra = `TOA_SW_DWN` (MJ/m²/día).
2. **Kc por dekada:** FAO-56 Tabla 12. Etapas en fracciones fijas 15 / 25 / 40 / 20 % (inicial, desarrollo, media, final), interpolación lineal como FAO-56 Fig. 25. *Supuesto simplificado.*

| Cultivo | Kc ini | Kc mid | Kc end | Etapa sensible usada |
|---|---|---|---|---|
| Soja | 0,40 | 1,15 | 0,50 | media → calor |
| Maíz grano | 0,30 | 1,20 | 0,60 | media → calor y helada |
| Trigo | 0,30 | 1,15 | 0,40 | media → helada |

Soja: además del calor en etapa media, cuenta helada (≤ 2 °C) en la etapa inicial (emergencia). SUPUESTO a validar, agregado el 14-nov para que adelantar la siembra tenga un costo en el modelo. Resultado con datos reales: en 25 campañas, la celda POWER de Itapúa y la de Alto Paraná no registran ningún día ≤ 2 °C en la emergencia de la soja sembrada del 11 al 20 de septiembre. Una celda de ~50 km puede no ver heladas locales.

Sensibilidad a la siembra (suelo arcilloso, pesos por defecto, campañas en que cada rotación queda primera, de 25). Itapúa: 10 días antes B 7, C 9, D 9; calendario supuesto B 7, C 6, D 12; 10 días después B 8, C 3, D 14. Alto Paraná: antes B 8, C 9, D 8; supuesto B 10, C 5, D 10; después B 11, C 5, D 9. Conclusión: el liderazgo depende de la fecha de siembra, así que validar calendarios (T-04) es lo que más cambia el resultado. Los umbrales de 35 °C y 2 °C no se pueden variar sin conexión porque la caché guarda conteos por dekada ya calculados.
| Avena (aprox. avena negra) | 0,30 | 1,15 | 0,25 | ninguna |

3. **Déficit hídrico (mm de demanda no cubierta)**, dos modos elegibles en la app:
   - *Sin suelo (climático):* Σ dekadas con cultivo de max(0, Kc × ET0 − P).
   - *Con suelo (por defecto, arcilloso):* balance de un "balde" por dekada, continuo entre campañas: disponible = min(CAD, S + P); uso = min(ETc, disponible); déficit = ETc − uso; S = disponible − uso. CAD = (θFC − θWP) × 1,0 m de raíces, con el punto medio de FAO-56 Tabla 19: arenoso 80 mm, franco 155 mm, arcilloso 160 mm. En barbecho el suelo pierde agua con Kc = 0,3 (*supuesto*: suelo con rastrojo de siembra directa), pero ese déficit no se cuenta. Así, un cultivo de invierno o de cobertura deja el suelo más seco para la soja: el modelo refleja ese trade-off. Sin escorrentía ni drenaje diferenciado (el exceso sobre CAD se pierde).
4. **Calor:** días con T2M_MAX ≥ 35 °C en etapa media. **Helada:** días con T2M_MIN ≤ 2 °C en etapa media. Umbrales = *supuestos a validar* con bibliografía (T-05). Temperatura de aire a 2 m, no del cultivo.
5. **Suelo cubierto (%)** = dekadas con cultivo vivo / 36 (del calendario, no satelital).
5b. **Diversidad de cultivos** = cantidad de familias botánicas distintas en la rotación (leguminosa, gramínea). Agregado el 14-nov como segundo indicador de salud del suelo. Sale del calendario, no de datos NASA. Con las cuatro rotaciones fijas solo separa a la base (1 familia) de las demás (2); en rotaciones propias distingue, por ejemplo, avena + maíz (1 familia) de avena + soja (2). *Indicador simple: no mide materia orgánica ni estructura del suelo.*
6. **Puntaje** = Σ peso_normalizado × valor_normalizado × 100. Normalización proporcional al máximo del grupo: "menor es mejor" → 1 − (v − mín)/máx; "mayor es mejor" → v/máx. Se eligió en lugar de min-max porque min-max convertía diferencias de 6 % en el déficit en 0 vs 100 puntos. La escala es relativa a las rotaciones comparadas.

## Calendarios (año agrícola desde 1 de mayo) — PENDIENTE DE VALIDACIÓN
| Rotación | Cultivos y ventana |
|---|---|
| A (base) | Soja 11-oct → 10-feb; barbecho invernal |
| B | Trigo 21-may → 10-oct; Soja 11-oct → 10-feb |
| C | Avena negra 1-may → 31-ago; Soja 11-oct → 10-feb |
| D | Soja temprana 11-sep → 10-ene; Maíz zafriña 11-ene → 30-abr |

## Pruebas (`node --test tests/engine.test.js`) — 19/19 pasan (14-nov-2026)
ET0 con valor calculado a mano; dekadas/año agrícola; agregación con -999; curva Kc; superposición de calendarios; indicadores con clima sintético **marcado como TEST**; los pesos cambian el orden; escenarios mediana/p80/año; plausibilidad de los datos reales; 2021–22 peor que la mediana; balance con suelo (capacidad, arrastre de agua, efecto de la cobertura sobre la soja); serie continua con datos reales.

## Resultado observado (datos reales, pesos por defecto 3/2/2/3/2/2; recalculado el 14-nov con el indicador de diversidad)
Suelo arcilloso. Itapúa: año típico → C (avena negra) 91,4, B 85,3, D 82,4, A (base) 74,1; año desfavorable y campaña 2021–22 → D primera (96,4 en 2021–22) porque la soja temprana evita parte del calor en floración (27 vs 38 días). Alto Paraná: mismo patrón (C en año típico, D en 2021–22). **Es una hipótesis exploratoria, no una recomendación**: depende del calendario supuesto.

## Campaña por campaña (`seasonWins`)
Con suelo arcilloso y pesos por defecto, en las 25 campañas de Itapúa: D queda primera en 12, B en 7, C en 6, A (base) en 0. C supera a la base en 25 de 25, B en 24, D en 23. Alto Paraná: B 10, D 10, C 5. El indicador de diversidad no cambió quién queda primera en ninguna campaña (suma lo mismo a B, C y D); sí cambió los puntajes y cuántas veces se supera a la base. Solo con las tres dimensiones climáticas (pesos 3/2/2/0/0/0), la base queda primera en 17 de 25 campañas y D en 8, en las dos zonas.

**Lectura honesta:** la base (barbecho) pierde en "suelo cubierto" y en "cosechas" por construcción, así que con pesos que valoren esas dimensiones casi nunca gana. Lo informativo es *cuál* alternativa gana según el año y las prioridades. Si el productor pone esos dos pesos en 0, la base vuelve a competir.

## Control de coherencia con GWETROOT (`soilCoherence`, 14-nov)
Fracción de agua del balde (S / CAD) frente a `GWETROOT` de POWER, en las dekadas con soja de la rotación A, suelo arcilloso, 25 campañas (300 dekadas): r = 0,61 en Itapúa y 0,58 en Alto Paraná. **No es validación independiente**: las dos series parten de la misma lluvia de MERRA-2, y miden cosas distintas (agua disponible para la planta frente a humedad relativa a la saturación).
En 2021–22 (Itapúa) el balde va de 89 % a 0 % y queda vacío desde mediados de diciembre; `GWETROOT` va de 70 % a 61 %. El balde simple reacciona mucho más fuerte, así que el déficit en años secos (348 mm en 2021–22) puede estar exagerado. Causas posibles a revisar: CAD de 160 mm con 1 m de raíces, sin ascenso capilar ni reducción de la transpiración bajo estrés (FAO-56 usa un coeficiente Ks que aquí no se aplica).

## El Niño / La Niña (`ensoPhase`, `app/data/enso_oni.js`, 14-nov)
Índice ONI de NOAA CPC (https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt, leído el 14-nov-2026). **No es dato NASA**; solo agrupa campañas y no entra en el puntaje. Fase de la campaña = ONI del trimestre nov–ene: El Niño si ≥ +0,5; La Niña si ≤ −0,5. *Supuesto simple*: NOAA exige cinco trimestres seguidos. Resultado: 10 campañas La Niña, 6 neutras, 9 El Niño.
Lluvia del ciclo de la soja (rotación A), mediana y rango. Itapúa: La Niña 614 mm (369–902), neutro 631 (402–789), El Niño 848 (637–1141); lluvia menor que la demanda en 6/10, 3/6 y 1/9. Alto Paraná: La Niña 623 (408–988), neutro 579 (466–797), El Niño 738 (611–1000); 5/10, 3/6 y 0/9. Correlación ONI–lluvia: r = 0,62 (Itapúa) y 0,43 (Alto Paraná), con n = 25. Los rangos se superponen: la fase cambia las probabilidades, no determina la campaña. Los escenarios "Campañas con La Niña / El Niño" usan la mediana de cada indicador dentro del grupo. Último ONI publicado al leer: ago–oct 2026 = +2,46.

## Lluvia hipotética (`scaleRain`, 14-nov)
Multiplica la lluvia de cada dekada por un factor (0,7 a 1,3) sobre una copia de la serie; los datos observados no se modifican. ET0, días de calor y heladas no cambian. **Es una simulación, no un dato ni un pronóstico**, y la app lo marca en cada sección. No representa un cambio climático realista: un año más seco suele ser también más caluroso, y aquí la temperatura queda igual. Itapúa, pesos por defecto, suelo arcilloso, con −20 %: D primera en 10 de 25 campañas, B en 8, C en 7 (observado: 12, 7, 6).

## Limitaciones del productor
Las rotaciones que contienen un cultivo marcado como no disponible salen de la comparación. Como el puntaje es relativo al grupo comparado, los puntajes de las restantes cambian. La base nunca se quita.

## Pendiente
- Suelo real de la zona (mapa de suelos de la Región Oriental) en lugar de clases genéricas; profundidad de raíces por cultivo.
- Contraste con IMERG y una estación local.
- Revisión de umbrales y calendarios por un agrónomo.
