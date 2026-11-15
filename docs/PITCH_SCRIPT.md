> **15-nov-2026: no usar este guion como demo.** El límite oficial es 30 s. El guion vigente es `docs/DEMO_SCRIPT_30S_EN.md`. El producto ahora se llama **YvyShift**.

# Pitch

Actualizado el 14-nov-2026 con el mensaje nuevo de la auditoría. Todas las cifras se verificaron contra la caché de NASA POWER ese día. Volver a verificarlas si cambian calendarios o umbrales.

Regla: decir "compara" y "explora". No decir "recomienda", "predice", "inteligencia artificial" ni "datos de tu parcela".

## 30 segundos (EN, para el video)

"In 2021–22 a drought hit Paraguay's soybean belt. In Itapúa, NASA data shows 369 millimetres of rain during the soybean cycle against 729 the crop needed: the highest demand and the most heat days at flowering in 25 seasons. Every year a farmer decides what to plant in winter and when to sow. NASA data shows what each extra crop costs in water. **Rotation Lab** puts that cost next to what the farmer gets back, soil cover and a second harvest, lets them set what matters most, and shows which rotation holds up, why, and how sure we are."

## 90 segundos (ES)

1. **Gancho (10 s).** "NOAA mide hoy un El Niño de +2,46. La campaña que se está sembrando arranca con El Niño. ¿Qué pasó en Itapúa las otras nueve veces desde 2001?" *Verificar el valor en la fuente antes de grabar.*
2. **Problema (15 s).** En la sequía 2021–22, la soja de Itapúa recibió 369 mm de lluvia y pedía 729. Cada año el productor decide qué sembrar en invierno y cuándo, sin ver cómo le habría ido a cada opción en años buenos y malos.
3. **Dato NASA (15 s).** 25 campañas de datos diarios de NASA POWER: lluvia, temperatura y radiación. Con el método FAO-56 calculamos cuánta agua pide cada cultivo y cuánta faltó.
4. **Demo (35 s).**
   - Itapúa, campaña 2021–22: queda primera la soja temprana con maíz zafriña. Tuvo 27 días de calor en floración frente a 38.
   - Debajo de cada barra: cuántos puntos vienen del clima NASA y cuántos del calendario.
   - Atajo "Cuidar el suelo": cambia la ganadora.
   - Tabla El Niño / La Niña: 614 mm de mediana con La Niña, 848 con El Niño.
4b. **Validación (10 s).** "Sin ajustar nada, el modelo encuentra 4 de los 5 peores años de la soja paraguaya desde 2002. En 2021–22 la producción nacional cayó a la mitad, según la FAO."
5. **Honestidad (10 s).** "Si solo miramos el clima, gana dejar el campo en barbecho: un cultivo menos gasta menos agua. Lo que la herramienta muestra es qué se gana a cambio de esa agua. Es exploratoria, regional, y dice qué datos faltan."
6. **Impacto (5 s).** Gratis, en el teléfono, sin conexión y sin clave.

## 3 minutos

Los 90 segundos, más:

- **Proceso (30 s).** Cómo se construyó, qué se descartó y por qué: chatbot con IA, sensores, pronósticos. Mostrar el registro de decisiones.
- **Validez (30 s).** 17 pruebas automáticas. Control de coherencia con la humedad de suelo de NASA: coincide en la dirección (r = 0,61), pero nuestro balance reacciona más fuerte en años secos, y lo decimos en la app.
- **Voz local (15 s).** La frase del agrónomo o productor que la probó. *Pendiente.*
- **Próximos pasos (15 s).** Validar calendarios con IPTA y MAG, suelo real, SMAP e IMERG como contraste, costos y precios.

## Preguntas que puede hacer el jurado

| Pregunta | Respuesta corta |
|---|---|
| ¿Por qué no usaron SMAP o IMERG? | Requieren cuenta Earthdata y descarga pesada. Priorizamos una fuente que funciona en el navegador y sin conexión. Es el primer paso siguiente. |
| ¿POWER no es un modelo? | Sí, es reanálisis (MERRA-2). Lo decimos en la app. La celda mide unos 50 km. |
| ¿Cómo saben que el modelo acierta? | No lo sabemos todavía. Mostramos un control de coherencia y una prueba de sensibilidad a la fecha de siembra, y marcamos todo como exploratorio. |
| ¿Por qué no tiene IA? | Cada número tiene que poder rastrearse a un dato y una fórmula. Un modelo de lenguaje puede inventar una cifra. |
| ¿Por qué el barbecho nunca gana? | Sí gana si solo se valora el clima: 17 de 25 campañas. Pierde cuando el productor valora cubrir el suelo y cosechar dos veces. |
| ¿El Niño predice la lluvia? | No. Inclina las probabilidades. Hubo campañas La Niña con 902 mm. |
| ¿A cuántos productores sirve? | Unos 3 millones de hectáreas de soja en la Región Oriental (Censo Agropecuario 2022); casi 39.000 pequeños productores plantan el 20 % de la soja (UGP, 2017). |
| ¿Cómo saben que el modelo acierta? | Lo comparamos con el rendimiento real de la FAO: r = −0,81 en 23 campañas y 4 de los 5 peores años detectados, sin ajustar nada. |
