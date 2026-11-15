# Project Charter — Rotation Lab

**Reto:** Field Shift: Adapting Farms with NASA Data (NASA Space Apps 2026). **Sede:** Asunción (virtual). **Cierre:** dom 15-nov-2026 23:59 hora local; objetivo interno de entrega 22:00.

> Nota: la página oficial del reto no pudo abrirse desde el entorno de Claude (bloqueo de robots). Un integrante debe copiar el texto y la pestaña **Resources** a `docs/CHALLENGE_TEXT.md` y confirmar que NASA POWER figura entre los recursos (ver TASK_BOARD T-01).

## Problema
En el este de Paraguay (Itapúa, Alto Paraná) la soja domina el verano y el invierno muchas veces queda en barbecho. Campañas como 2021–22 mostraron que un año seco y caluroso golpea fuerte a la soja. El productor elige qué hacer en invierno y cuándo sembrar sin una forma simple de ver cómo se comportó cada rotación en los años buenos y malos de su zona.

## Usuario
Productor mediano de granos o técnico de extensión / cooperativa en Itapúa o Alto Paraná, con celular y conexión irregular.

## Decisión que apoya
"¿Sigo con soja + barbecho, o paso a soja + trigo, soja + avena negra, o soja temprana + maíz zafriña?" según lo que más le importa: agua, calor, heladas, suelo cubierto, número de cosechas.

## Producto (MVP)
Web app estática, ES/EN, que:
1. Carga 25 campañas de datos diarios NASA POWER de su zona (caché o descarga en vivo).
2. Calcula para 4 rotaciones: déficit hídrico (balance con tipo de suelo), calor en floración, heladas en etapa sensible, % de suelo cubierto, cosechas/año.
3. Permite elegir escenario (año típico, año malo, campaña concreta) y pesos.
4. Ordena las rotaciones, muestra la contribución de cada dimensión y explica el porqué.
5. Muestra la evidencia NASA y un panel de confianza ("exploratorio") con datos faltantes.

## Promesa verificable
"En menos de un minuto, un productor ve cómo se habrían comportado 4 rotaciones en las últimas 25 campañas de su zona con datos NASA, y qué cambia si prioriza agua o suelo cubierto."

## Fuera de alcance
Recomendación agronómica certificada, rendimiento en kg/ha, precios/ingresos, precisión por parcela.
