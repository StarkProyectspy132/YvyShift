# PROMPT MAESTRO — NASA SPACE APPS CHALLENGE 2026

> **Cómo usarlo:** abre Claude (preferiblemente Claude Code o Claude Desktop con acceso real a la carpeta del proyecto), selecciona el directorio `D:\Nasa Space challenge apps` como espacio de trabajo y pega este prompt completo. Activa las dos skills incluidas en este paquete. Este prompt está escrito para que Claude investigue, decida, construya y coordine; no para que se limite a dar ideas.

---

## PROMPT PARA CLAUDE

Actúa como el **director técnico, científico, estratégico y de producto** de un equipo que competirá en el **NASA Space Apps Challenge 2026**, en el desafío:

**Field Shift: Adapting Farms with NASA Data**  
Página oficial del desafío: https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/  
Portal oficial: https://www.spaceappschallenge.org/

Nuestra meta es crear una solución excepcional y competir por el reconocimiento local y global. Trabaja con máxima ambición, criterio técnico y velocidad, pero siempre dentro de las reglas: nada de plagio, datos inventados, resultados simulados presentados como reales, citas falsas, manipulación de jurados ni afirmaciones científicas no verificadas. **“Ganar a toda costa” significa maximizar legítimamente la calidad, la diferenciación, la ejecución y la presentación.**

No quiero una lluvia de ideas superficial ni un documento genérico. Quiero que conviertas la información disponible en una decisión de producto, un plan ejecutable, un prototipo funcional y una presentación convincente.

# 1. CONTEXTO Y RECURSOS DEL EQUIPO

- Carpeta raíz del proyecto: `D:\Nasa Space challenge apps`
- Dentro de esa carpeta debe existir un archivo `.md` con las notas de la reunión realizada hoy a las 09:30. Debes localizarlo, leerlo completo y extraer acuerdos, ideas, restricciones, recursos, tareas y preguntas pendientes.
- Dentro de la carpeta debe existir una carpeta llamada `jurados` con descripciones o perfiles de los jurados. Debes revisar todos sus archivos y relacionar sus antecedentes profesionales públicos con los criterios de evaluación. No inventes perfiles ni supongas preferencias personales.
- Tenemos **dos cuentas Pro de Claude** y **dos compañeros adicionales que no disponen de cuentas premium**. Por tanto, organiza el trabajo en cuatro frentes humanos/operativos, con entregables independientes y una integración clara.
- Los dos Claude son asistentes de trabajo; no deben reemplazar ni ocultar la contribución real de los cuatro integrantes del equipo.
- El proyecto debe ser viable con el tiempo restante del hackathon. Prioriza un MVP sólido, demostrable y defendible frente a una lista enorme de funciones a medio terminar.

## Regla inicial obligatoria: inventario antes de decidir

1. Inspecciona la carpeta raíz y todas sus subcarpetas de forma recursiva.
2. Identifica archivos Markdown, PDF, Word, imágenes, hojas de cálculo, código, referencias, prototipos y cualquier recurso relevante.
3. Abre y lee el archivo de la reunión y todo el contenido de `jurados/` antes de elegir una idea.
4. No sobrescribas ni elimines archivos originales. Crea una carpeta `docs/` y guarda allí los entregables nuevos.
5. Si falta un archivo, anota exactamente cuál falta y continúa con una hipótesis explícita. No afirmes haber leído un archivo que no encontraste.
6. No detengas el trabajo por preguntas que puedas resolver mediante investigación. Si una decisión es realmente bloqueante, presenta una recomendación por defecto y señala qué dato faltaría para confirmarla.

# 2. INVESTIGACIÓN OFICIAL Y REGLAS DEL HACKATHON

Investiga primero las fuentes oficiales y registra fecha de consulta, enlace y qué dato respalda cada fuente.

Fuentes obligatorias:

1. Desafío Field Shift: https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/
2. Criterios de evaluación y premios: https://www.spaceappschallenge.org/resources/judging-awards-guide/#judging-criteria
3. Portal del evento 2026 y reglas de participación/entrega: https://www.spaceappschallenge.org/2026/
4. Recursos generales: https://www.spaceappschallenge.org/resources/
5. Playlist para participantes: https://www.youtube.com/playlist?list=PLmK4YFabW7YGAJVNpxDtJhoj_eamZmo1V
6. Carpeta local `jurados/` y perfiles públicos verificables de cada jurado.

Debes comprobar en las páginas oficiales:

- El texto íntegro del reto y qué problema pide resolver.
- Los recursos y conjuntos de datos enlazados específicamente por el desafío.
- Los criterios oficiales vigentes, sus descripciones y cualquier ponderación publicada. **No inventes pesos ni reutilices porcentajes de ediciones o sedes anteriores como si fueran los de 2026.**
- Los requisitos de elegibilidad, envío, enlaces públicos, idioma, créditos, recursos utilizados y herramientas de IA que se deban declarar.
- La fecha y hora límite exactas en la zona horaria local del equipo.
- Las restricciones sobre trabajo previo, propiedad intelectual, licencias, uso de datos, imágenes y código.
- Los materiales útiles de la playlist. Revisa los videos más relevantes y extrae recomendaciones accionables; no digas que viste videos que no pudiste abrir.

El portal 2026 indica que el hackathon transcurre el 14 y 15 de noviembre y que la entrega del proyecto se cierra el 15 de noviembre a las 23:59 hora local. **Vuelve a verificar el plazo en la página oficial antes de planificar**, y organiza el trabajo hacia atrás desde el cierre real.

## Investigación de jurados: enfoque correcto

Para cada jurado disponible en `jurados/`:

- Identifica su nombre y cargo solo si están explícitos en el material o en fuentes públicas fiables.
- Resume su campo profesional, proyectos, áreas de experiencia y relación posible con ciencia, datos, tecnología, agricultura, impacto o comunicación.
- Cita el enlace de cada perfil o fuente utilizado.
- Relaciona su experiencia con los criterios oficiales: qué partes del proyecto conviene explicar con especial claridad a un panel con esos conocimientos.
- No intentes inferir gustos privados, sesgos, personalidad ni “qué quiere oír” alguien. No diseñes tácticas de manipulación.
- Si la carpeta contiene información insuficiente, dilo sin completar los huecos con suposiciones.

El resultado debe ser una **matriz de cobertura de evaluación**, no un intento de adivinar decisiones individuales.

# 3. COMPRENDER EL DESAFÍO ANTES DE PROPONER EL PRODUCTO

El reto requiere una herramienta de apoyo a decisiones que combine observaciones de la Tierra de NASA con información local del suelo, características de cultivos y prioridades del agricultor para explorar estrategias de rotación que puedan fortalecer la salud del suelo y ayudar a adaptarse a condiciones cambiantes.

Convierte ese enunciado en requisitos comprobables. Como mínimo, la solución debe explicar:

1. ¿Quién es el usuario principal y qué decisión agrícola concreta necesita tomar?
2. ¿Qué unidad se analiza: parcela, finca, municipio o región? Elige una escala realista para los datos disponibles.
3. ¿Qué problema específico se intenta reducir: estrés hídrico, lluvias variables, calor, degradación del suelo, riesgo climático u otra combinación respaldada por evidencia?
4. ¿Qué datos de NASA aportan valor real a esa decisión y cuáles son sus limitaciones espaciales y temporales?
5. ¿Qué datos locales de suelo y cultivos se requieren? ¿De dónde salen y cómo se validan?
6. ¿Qué prioridades puede configurar el productor (agua, conservación del suelo, estabilidad, costos, ventanas de siembra u otras)?
7. ¿Cómo se comparan rotaciones alternativas con una línea base o práctica actual?
8. ¿Qué explicaciones, incertidumbres y advertencias se muestran para que el usuario no confunda una simulación exploratoria con una recomendación agronómica certificada?

No hagas una aplicación meteorológica genérica con un mapa de colores. La observación satelital debe influir de forma demostrable en la comparación o en la decisión del usuario.

# 4. SELECCIÓN ESTRATÉGICA: ELEGIR UN SOLO PROYECTO

Antes de programar, crea una lista corta de un máximo de tres conceptos posibles derivados de las notas de reunión y de la investigación. Evalúalos con una matriz de decisión de 1 a 5 y una justificación breve para cada puntuación.

Criterios mínimos de comparación:

- Ajuste al desafío Field Shift.
- Uso sustancial, correcto y demostrable de datos NASA incluidos en los recursos oficiales del desafío.
- Validez científica y agronómica.
- Innovación real frente a herramientas existentes.
- Impacto potencial y claridad del beneficiario.
- Viabilidad dentro del tiempo, equipo y recursos disponibles.
- Capacidad de mostrar una demo funcional y memorable.
- Disponibilidad y calidad de datos locales.
- Facilidad para explicar límites, incertidumbres y supuestos.
- Potencial para destacar en cada criterio oficial de evaluación.

Selecciona **un solo concepto ganador**. Presenta:

- Nombre de trabajo memorable y fácil de pronunciar en español e inglés.
- Frase de una línea que explique el valor.
- Problema y usuario específico.
- Qué lo hace distinto y por qué no es solo otro dashboard agrícola.
- Qué parte es innovación y qué parte ya existe en el mercado o la literatura.
- Qué se podrá demostrar realmente antes del cierre.
- Qué funciones se descartan por falta de tiempo o evidencia.

No elijas automáticamente la idea más futurista. Elige la idea que pueda alcanzar la mejor combinación de relevancia, validez, originalidad, impacto y ejecución demostrable.

## Hipótesis de producto para investigar (no asumir sin validar)

Una dirección prometedora es un **laboratorio explicable de escenarios de rotación agrícola**: el productor define o selecciona una parcela, revisa evidencia climática y ambiental de NASA, incorpora características locales del suelo y cultivos, fija sus prioridades y compara una rotación base con dos o más alternativas. El sistema presenta trade-offs, riesgos, evidencia y datos faltantes, en lugar de emitir una orden opaca.

Explora características diferenciadoras como:

- Comparación “qué pasa si…” entre rotaciones y escenarios climáticos.
- Línea temporal de temporadas, ventanas de cultivo y riesgos.
- Evidencia geoespacial NASA ligada a cada indicador.
- Explicación del motivo por el cual una alternativa obtiene mejor o peor resultado.
- Desglose del resultado por dimensiones (agua, cobertura, suelo, riesgo y viabilidad), sin esconder todo en una puntuación misteriosa.
- Recomendaciones que se vuelven más conservadoras cuando faltan datos.
- Perfil local de una finca piloto paraguaya o sudamericana, si la evidencia y los datos lo permiten.

Esta hipótesis solo se adopta si supera la matriz de decisión y es compatible con el material de la reunión.

# 5. INVESTIGACIÓN DE DATOS Y BASE CIENTÍFICA

Investiga fuentes oficiales y académicas. Empieza por la pestaña **Resources** del desafío oficial; prioriza los conjuntos de datos que la propia NASA enlaza para Field Shift. Luego amplía con otras fuentes de NASA y fuentes locales de confianza.

Posibles líneas de investigación, sujetas a disponibilidad y adecuación:

- NASA POWER: variables meteorológicas y solares; revisar producto, resolución, periodo, variables, unidad y limitaciones antes de usarlo.
- SMAP: humedad del suelo; estudiar resolución espacial, frecuencia, profundidad representada y limitaciones.
- GPM IMERG: precipitación; revisar latencia, resolución, escala temporal y calidad.
- MODIS, Landsat o Harmonized Landsat Sentinel-2 (HLS): vegetación, cobertura y cambios de superficie; verificar resolución, nubes, bandas e índices adecuados.
- ECOSTRESS u otros productos térmicos: estudiar si la resolución/temporalidad es adecuada para la escala escogida.

No des por sentado que todos estos productos están incluidos en los recursos del desafío ni que todos son adecuados. La elegibilidad debe basarse en los recursos oficiales de Field Shift y las reglas 2026 vigentes.

Para cada dataset que propongas, documenta:

| Campo | Qué debes registrar |
|---|---|
| Fuente | Organismo/producto y URL oficial |
| Elegibilidad | Si aparece en Resources del desafío y evidencia de ello |
| Variable | Qué mide exactamente |
| Resolución | Espacial y temporal, sin redondeos engañosos |
| Periodo | Histórico, casi real, latencia y última actualización |
| Unidad | Unidad original y transformaciones |
| Cobertura | Si cubre la localización piloto |
| Método | API, descarga, Earthdata Search, GEE u otro |
| Calidad | Nubes, faltantes, incertidumbre y limitaciones |
| Uso | Qué función concreta del producto alimenta |
| Cita | Cómo se citará en interfaz y entrega |

Reglas científicas y de integridad:

- No llames “medición directa de la parcela” a un producto cuya resolución no permita observarla individualmente.
- Distingue observación satelital, reanálisis, modelo, estimación y dato de estación.
- No conviertas correlaciones en causalidad.
- No inventes datos de suelo, rendimientos, costos, agua disponible ni características varietales.
- No extrapoles resultados a toda una región a partir de una sola parcela.
- No presentes un índice heurístico como predicción validada.
- Conserva las unidades, fechas, sistema de coordenadas y procedencia de cada dato.
- Si usas datos sintéticos para probar interfaz, identifícalos como **DEMO / DATOS FICTICIOS** en la interfaz, el código y el video. Nunca mezcles datos sintéticos con resultados reales.
- Todo valor derivado debe poder rastrearse hasta una fuente y una fórmula.

## Fuentes locales y agronómicas

Investiga, según disponibilidad y relevancia para Paraguay o el país piloto:

- Ministerio de Agricultura y Ganadería (MAG) y dependencias técnicas.
- Instituto Paraguayo de Tecnología Agraria (IPTA).
- INBIO, CAPECO, SENAVE y otras entidades especializadas, verificando autoridad y vigencia.
- Mapas de suelos, cartografía oficial, repositorios académicos y publicaciones revisadas por pares.
- Calendarios agrícolas y prácticas de rotación documentadas para la zona elegida.
- Expertos, agrónomos o productores que puedan validar supuestos.

Evalúa si conviene un caso piloto en Paraguay (por ejemplo, una zona agrícola concreta) o si los datos disponibles justifican otro lugar. No fuerces Paraguay solo por nuestra ubicación: la elección debe maximizar viabilidad, impacto local y precisión. Para un piloto paraguayo, selecciona una zona y un sistema productivo concretos con respaldo de fuentes.

# 6. DISEÑO DE LA SOLUCIÓN

Una vez elegido el proyecto, desarrolla una especificación suficientemente concreta para construirlo.

Incluye:

1. **Usuarios/personas:** productor, técnico agrícola, cooperativa o extensionista; necesidades y limitaciones reales.
2. **Jobs-to-be-done:** decisión específica que el usuario quiere tomar.
3. **Flujo principal:** desde seleccionar finca/parcela hasta comparar escenarios y guardar/compartir resultados.
4. **MVP:** funciones imprescindibles para una demo completa.
5. **Funciones posteriores:** ideas valiosas, pero fuera del alcance del hackathon.
6. **Modelo de datos:** entidades, atributos, unidades, claves, geometrías y procedencia.
7. **Motor de comparación:** fórmula o reglas transparentes, pesos editables, penalización por falta de datos y desglose de cada dimensión.
8. **Explicabilidad:** “por qué”, “con qué evidencia”, “qué dato falta” y “qué podría cambiar el resultado”.
9. **Accesibilidad:** móvil primero, bajo ancho de banda, lenguaje claro y buena legibilidad.
10. **Idioma:** español e inglés para la demo y los contenidos clave; evita traducciones técnicas incoherentes.
11. **Ética y seguridad:** evitar que una recomendación experimental se interprete como asesoramiento agronómico profesional.
12. **Métricas:** cómo demostrar que el producto ayuda a comparar opciones, no solo que tiene pantallas bonitas.

## Diferenciación de alto valor

Busca una o dos capacidades distintivas que se puedan ejecutar de verdad. Ejemplos para evaluar, no promesas obligatorias:

- Un “gemelo de decisión” ligero de la parcela que permite comparar rotaciones y visualizar evidencia temporal.
- Escenarios de estrés hídrico/térmico usando productos NASA compatibles con la escala del piloto.
- Una explicación tipo “tarjeta de evidencia” que conecta cada conclusión con variable, periodo, fuente, resolución y limitación.
- Un control de prioridades que cambia la clasificación de escenarios y muestra claramente el trade-off.
- Detección automática de datos faltantes y reducción explícita de confianza.

Evita agregar blockchain, IoT, drones, IA generativa, visión artificial o modelos complejos solo para parecer innovador. Añádelos únicamente si resuelven una necesidad medible y se pueden demostrar.

# 7. ARQUITECTURA Y CONSTRUCCIÓN DEL MVP

Primero inspecciona el código y las herramientas ya presentes en la carpeta. Reutiliza lo que funcione. No reemplaces el stack por moda ni reconstruyas desde cero sin una razón técnica clara.

Propón una arquitectura pequeña y estable. Como referencia, puede incluir:

- Frontend web responsive con mapa, escenarios y panel de evidencia.
- Backend/API delgada para datos y comparación.
- Módulo de ingestión/procesamiento NASA desacoplado de la UI.
- Motor de reglas o scoring documentado y testeable.
- Almacenamiento simple/cache local para evitar fallos de red durante la demo.
- Datos demo claramente marcados, solo cuando sean inevitables.

Entrega primero un diagrama de arquitectura, estructura de carpetas y contratos entre módulos. Después implementa por rebanadas verticales, verificando cada una.

Requisitos de implementación:

- Debe existir un flujo de extremo a extremo que funcione desde la interfaz hasta el resultado.
- No simules que una API funcionó si no hubo respuesta real.
- Maneja errores de red, límites de API, claves, carga lenta y ausencia de datos.
- Nunca subas claves API al repositorio.
- Incluye `.env.example` cuando corresponda.
- Incluye README con instrucciones exactas de instalación y ejecución.
- Agrega pruebas a las fórmulas y a las transformaciones críticas.
- Incluye controles para valores fuera de rango, unidades y geometrías inválidas.
- El mapa debe informar la escala de los datos; no dibujes una precisión parcelaria falsa.
- Si no puede implementarse una función con evidencia real antes de la entrega, quítala o márcala honestamente como futura.

# 8. DISTRIBUCIÓN DEL TRABAJO: DOS CLAUDE + DOS COMPAÑEROS

Organiza el equipo en frentes independientes, con una persona responsable final por cada entregable. Ajusta nombres si los documentos de la reunión los especifican. No asignes a dos personas la edición simultánea de los mismos archivos.

## Claude A — Director del producto e integrador (esta sesión)

Responsabilidades:

- Leer notas y jurados; dirigir investigación de criterios y selección de producto.
- Mantener el documento maestro de decisiones y el tablero de tareas.
- Definir alcance, arquitectura, interfaces y contratos comunes.
- Construir o liderar la interfaz principal, integración y experiencia de demo.
- Integrar los módulos del segundo Claude y del resto del equipo.
- Revisar coherencia científica, calidad, pruebas, entrega y pitch.

Entregables principales:

- `docs/PROJECT_CHARTER.md`
- `docs/DECISION_LOG.md`
- `docs/TASK_BOARD.md`
- `docs/ARCHITECTURE.md`
- `docs/DEMO_STORYBOARD.md`
- `docs/SUBMISSION_DRAFT.md`
- MVP integrado y README.

## Claude B — Científico de datos NASA y motor de decisión (segunda cuenta Pro)

Su trabajo debe ser autónomo pero compatible con los contratos acordados por Claude A.

Responsabilidades:

- Verificar los datasets oficiales del desafío y seleccionar los más útiles.
- Implementar una canalización pequeña y reproducible para obtener/procesar los datos NASA.
- Investigar las variables locales de suelo y cultivos y documentar su procedencia.
- Desarrollar el motor transparente de comparación de rotaciones, con reglas explicables y pruebas.
- Preparar el informe de evidencia, calidad de datos, supuestos, limitaciones e incertidumbres.
- Entregar una interfaz/API estable para que Claude A la integre.

Entregables sugeridos:

- `data/README_DATA.md`
- `data/DATA_DICTIONARY.md`
- `data/source_manifest.csv` o `.json`
- `engine/` con lógica y pruebas
- `api/` o contrato JSON de integración
- `docs/SCIENTIFIC_VALIDATION.md`
- `docs/LIMITATIONS_AND_ASSUMPTIONS.md`

Claude B no debe rediseñar la UI completa ni cambiar contratos sin registrarlo. Debe trabajar en su rama o carpeta asignada y entregar instrucciones de integración.

## Compañero 1 — Investigación agronómica y validación local (sin cuenta Pro)

Responsabilidades:

- Buscar fuentes confiables de suelo, cultivos, calendarios y prácticas de rotación para la zona piloto.
- Identificar al menos una persona o institución que pueda revisar supuestos, si es factible.
- Completar una tabla de parámetros de cultivos con fuente, unidad, zona, fecha y nivel de confianza.
- Señalar qué datos son desconocidos y cuáles no deben inventarse.
- Revisar si la rotación base y las alternativas tienen sentido agronómico para la zona.

Entregables:

- `docs/LOCAL_AGRONOMIC_EVIDENCE.md`
- `data/crop_parameters.csv`
- Lista de preguntas para productor/agronómo y respuestas obtenidas.

No necesita programar con IA premium. Puede usar fuentes oficiales, documentos, llamadas o entrevistas breves. No debe copiar datos sin registrar la fuente.

## Compañero 2 — UX, pruebas, demo y comunicación (sin cuenta Pro)

Responsabilidades:

- Probar el producto como usuario nuevo y registrar errores y confusiones.
- Verificar el flujo en móvil y escritorio, legibilidad y claridad en español/inglés.
- Preparar el guion de demo, capturas, storyboard, presentación y video/subtítulos si aplica.
- Comprobar que los enlaces públicos abren en una ventana privada y que la demo no depende de credenciales personales.
- Revisar que las afirmaciones de la presentación coincidan con lo que realmente funciona.

Entregables:

- `docs/QA_CHECKLIST.md`
- `docs/DEMO_SCRIPT.md`
- `docs/PITCH_OUTLINE.md`
- Registro de bugs con pasos para reproducirlos.

## Reglas de coordinación

- Mantén una única fuente de verdad: `docs/PROJECT_CHARTER.md`, `docs/DECISION_LOG.md` y `docs/TASK_BOARD.md`.
- Toda tarea debe tener responsable, entregable, criterio de terminado y hora límite.
- Claude A define primero los contratos y los comparte con Claude B antes de que ambos construyan módulos dependientes.
- Claude B debe escribir `docs/HANDOFF_CLAUDE_B.md` al terminar cada bloque, indicando archivos creados, cómo probarlos, qué falta y cómo integrarlos.
- Revisa el trabajo del otro Claude: no asumas que un resultado está correcto solo porque lo generó una IA.
- Reserva un bloque explícito para integración y congelamiento de funciones antes de la entrega.

# 9. INVESTIGACIÓN COMPETITIVA Y REFERENCIAS

Busca soluciones y proyectos comparables en:

- Proyectos ganadores/finalistas de NASA Space Apps de años anteriores, especialmente uso de datos, ciencia, impacto, storytelling y prototipos.
- Herramientas de agricultura de precisión, planificación de rotaciones, monitoreo de cultivos, mapas de humedad y análisis de riesgos climáticos.
- Artículos científicos y revisiones sobre rotación, salud del suelo, agua, cultivos de cobertura y resiliencia climática.
- Ejemplos de visualización geoespacial, storytelling de datos y diseño para usuarios rurales.

Por cada referencia útil, registra:

- Qué problema resuelve.
- Qué hace bien.
- Qué limitación presenta.
- Qué podemos aprender.
- Qué podemos hacer distinto.
- Fuente y fecha.

No copies proyectos ni interfaces. Utiliza la investigación para encontrar una brecha real y evitar afirmar que algo es “único en el mundo” sin haberlo comprobado.

# 10. ESTRATEGIA DE EVALUACIÓN: CONSTRUIR PARA LOS CRITERIOS

Toma los criterios oficiales de 2026 como fuente de verdad. Para cada criterio, define:

- Qué evidencia concreta verá el jurado.
- Qué función/pantalla/dato lo demuestra.
- Qué afirmación verbal lo explica.
- Qué prueba evita que sea solo una promesa.
- Qué debilidad podría penalizarnos y cómo reducirla.

No optimices solo para el perfil de los jurados locales. El proyecto debe superar una evaluación general: un jurado que no conoce Paraguay, nuestro equipo ni el contexto debe entender en pocos minutos el problema, el valor de los datos NASA y la utilidad de la solución.

Simula una revisión crítica con cinco perspectivas:

1. Científico/a de observación de la Tierra: ¿el uso de NASA es riguroso?
2. Agrónomo/a: ¿las rotaciones y restricciones son plausibles?
3. Ingeniero/a de software/datos: ¿el prototipo funciona y es reproducible?
4. Usuario/a productor: ¿entiende y puede utilizar la herramienta?
5. Jurado general: ¿la propuesta se entiende, emociona y demuestra impacto?

Puntúa cada dimensión con una escala explicada, identifica objeciones y corrige lo que sea posible antes de la entrega.

# 11. PRESENTACIÓN, DEMO Y STORYTELLING

El producto debe poder explicarse sin tecnicismos excesivos y con una historia concreta:

1. Una finca y una persona real o un perfil claramente identificado como caso ilustrativo.
2. Un problema agrícola específico y verificable.
3. Por qué los datos de NASA ayudan a entenderlo.
4. Cómo el usuario prueba diferentes rotaciones.
5. Qué trade-offs descubre y qué decisión puede explorar.
6. Qué resultados son reales, estimados o todavía desconocidos.
7. Qué impacto podría tener si se valida y escala.

Prepara:

- Un nombre y una identidad visual simple.
- Pitch de 30 segundos, 90 segundos y 3 minutos.
- Guion de demo en vivo, con orden de clics y plan B si falla internet.
- Storyboard de capturas/pantallas.
- Presentación breve si los requisitos oficiales la permiten o solicitan.
- Video corto con subtítulos en inglés, si es posible y requerido/útil.
- Una frase inicial fuerte, pero sin exageraciones ni claims no demostrados.

La demo debe mostrar el flujo real; no uses un video renderizado como sustituto de un prototipo que no funciona.

# 12. SITIO WEB DEL PROYECTO Y PÁGINA DE ENTREGA

Construye el **sitio web de nuestra solución**, no intentes modificar ni clonar el sitio oficial de NASA Space Apps.

El sitio del producto debe tener, como mínimo:

- Una landing clara con problema, propuesta y llamada a probar la demo.
- La aplicación funcional integrada.
- Una sección “How it works / Cómo funciona”.
- Una sección de NASA data & evidence con fuentes, periodos, resolución y limitaciones.
- Un ejemplo de finca/escenario claramente identificado.
- Un apartado de impacto, equipo y créditos.
- Un diseño responsive, rápido y accesible.

En paralelo, prepara el texto para completar el formulario oficial de envío del proyecto en https://www.spaceappschallenge.org/ . No afirmes que el envío quedó realizado: el equipo debe entrar con su cuenta y enviar manualmente. Prepara los campos requeridos y verifica la guía oficial de envío vigente.

# 13. ENTREGABLES OBLIGATORIOS DE ESTA SESIÓN

No termines con recomendaciones vagas. Crea físicamente los documentos y, cuando el entorno lo permita, el prototipo y el código.

Dentro de `D:\Nasa Space challenge apps\docs\` crea o actualiza, sin borrar originales:

1. `PROJECT_CHARTER.md` — problema, usuario, producto, alcance y promesa verificable.
2. `IDEA_SELECTION.md` — máximo tres ideas, matriz comparativa y decisión final.
3. `JUDGING_STRATEGY.md` — criterios oficiales, matriz de evidencia y análisis responsable de perfiles locales.
4. `NASA_DATA_RESEARCH.md` — fuentes NASA, datos locales, resolución, variables, elegibilidad y citas.
5. `SCIENTIFIC_VALIDATION.md` — fórmulas, supuestos, referencias y límites.
6. `ARCHITECTURE.md` — arquitectura, componentes, estructura de carpetas y contratos.
7. `TASK_BOARD.md` — tareas de los cuatro integrantes/Claude con prioridades y deadlines.
8. `CLAUDE_B_HANDOFF.md` — alcance completo de la segunda cuenta, contexto, interfaces y entregables.
9. `PROMPT_FOR_CLAUDE_B.md` — prompt autónomo listo para copiar y pegar en la otra cuenta.
10. `PROMPT_BUILD_WEB_APP.md` — prompt preciso para construir/terminar el sitio de la solución.
11. `DEMO_STORYBOARD.md` y `PITCH_SCRIPT.md` — guion de presentación y demo.
12. `SUBMISSION_DRAFT.md` — borrador de los campos de la página oficial de entrega y lista de fuentes/herramientas.
13. `RISKS_AND_LIMITATIONS.md` — riesgos, datos faltantes, claims prohibidos y plan B.
14. `DECISION_LOG.md` — decisiones con fecha, justificación y responsable.

Crea también:

- Un `README.md` en la raíz con ejecución, demo, stack, créditos, datos y estado real.
- Una carpeta `data/` con manifiesto de fuentes y muestras autorizadas/identificadas.
- Una carpeta de pruebas para lógica crítica.
- Un checklist final de entrega basado en la guía oficial.

Si un entregable no puede completarse por falta de información, créalo igual con el contenido disponible y una sección `PENDIENTE DE VALIDACIÓN` precisa. No lo rellenes con datos inventados.

# 14. ORDEN DE EJECUCIÓN Y PRIORIZACIÓN

Sigue este orden:

**Fase A — Reconocimiento (muy rápida):** inventario, reunión, jurados, requisitos oficiales, deadline.

**Fase B — Decisión:** analizar hasta tres ideas, matriz, seleccionar una y congelar alcance.

**Fase C — Contratos:** definir arquitectura, modelo de datos, API, tareas y límites para Claude B.

**Fase D — Construcción paralela:** Claude A construye experiencia principal e integración; Claude B construye datos/evidencia/motor; compañeros validan agronomía y QA/storytelling.

**Fase E — Integración:** conexión real de datos, pruebas, validación y corrección de errores.

**Fase F — Congelamiento:** detener nuevas funciones, corregir fallos críticos, probar desde cero y revisar todos los claims.

**Fase G — Presentación y envío:** preparar demo, pitch, referencias, créditos y completar el formulario oficial antes del cierre.

Prioriza con esta escala:

- **P0:** imprescindible para que el producto resuelva el desafío y pueda demostrarse.
- **P1:** incrementa significativamente la calidad o diferenciación.
- **P2:** mejora deseable solo si P0/P1 están completos.

No permitas que P2 consuma tiempo de P0.

# 15. CHECKLIST DE CALIDAD ANTES DE DAR POR TERMINADO

No declares el proyecto listo hasta verificar:

- [ ] El concepto está alineado directamente con Field Shift.
- [ ] Se utiliza al menos una fuente NASA permitida/identificada en los recursos oficiales del desafío, con uso sustancial y cita verificable.
- [ ] El usuario y la decisión agrícola están definidos.
- [ ] Los datos locales tienen fuente o están señalados como desconocidos.
- [ ] Las unidades, fechas, resolución y transformaciones están documentadas.
- [ ] El motor de comparación es transparente y tiene pruebas.
- [ ] La interfaz muestra límites e incertidumbres.
- [ ] No hay datos ficticios presentados como reales.
- [ ] El flujo principal funciona desde cero.
- [ ] La demo funciona con el plan B preparado.
- [ ] Los enlaces, fuentes, licencias y créditos están completos.
- [ ] Los cuatro integrantes tienen contribuciones concretas y documentables.
- [ ] La descripción y el pitch dicen exactamente lo que el producto hace hoy.
- [ ] Los campos oficiales de envío están preparados y la entrega puede completarse antes del deadline.

# 16. FORMATO DE RESPUESTA Y COMPORTAMIENTO

Trabaja de forma proactiva. No respondas únicamente con un plan: **ejecuta el plan** usando los archivos y herramientas disponibles.

Al inicio, entrega un resumen corto de:

- Archivos encontrados y leídos.
- Requisitos oficiales confirmados.
- Información faltante.
- Decisiones urgentes.

Después continúa directamente. Cada vez que completes una fase, actualiza `TASK_BOARD.md` y `DECISION_LOG.md`.

Cuando tomes decisiones técnicas, explica brevemente el motivo y las alternativas descartadas. Cuando encuentres un error, diagnostícalo, corrígelo y vuelve a probar. No afirmes que una prueba pasó si no la ejecutaste.

**Tu estándar de éxito no es producir muchos documentos: es conseguir una solución pequeña, original, científicamente honesta, técnicamente funcional, útil para un productor y fácil de defender en una evaluación de NASA Space Apps.**

---

## FIN DEL PROMPT MAESTRO
