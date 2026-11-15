# TERRA-SHIFT

## The Field That Remembers

### Propuesta de innovación para NASA Space Apps Challenge 2026

**Concepto:** sistema de inteligencia agrícola geoespacial para analizar
la memoria ambiental de parcelas, ensayar rotaciones de cultivos frente
a escenarios climáticos históricos y respaldar decisiones adaptativas
con evidencia verificable.

------------------------------------------------------------------------

## 1. Visión del proyecto

TERRA-SHIFT propone transformar los datos de observación de la Tierra en
decisiones agrícolas mejor fundamentadas.

En lugar de limitarse a mostrar mapas satelitales o indicadores
aislados, la plataforma reconstruye el comportamiento histórico de una
parcela, analiza cómo respondió la vegetación ante condiciones
ambientales adversas y permite comparar estrategias de rotación de
cultivos bajo escenarios climáticos históricos.

**Idea central:** un campo no solo tiene condiciones actuales; también
tiene una historia de cómo ha respondido al clima. Esa historia puede
ayudar a evaluar decisiones futuras.

La plataforma no pretende sustituir a un agrónomo ni garantizar
rendimientos. Es una herramienta de apoyo a decisiones que presenta
evidencia, supuestos, incertidumbres y alternativas.

## 2. Los seis módulos de la plataforma

### 2.1 Field Monitor --- Monitoreo satelital

Permite seleccionar o delimitar una parcela y explorar su evolución
mediante imágenes y productos de observación de la Tierra.

Funciones propuestas:

-   Selección de país, región, explotación y parcela.
-   Dibujo de polígonos sobre el mapa.
-   Carga de límites mediante GeoJSON o KML.
-   Consulta de imágenes y observaciones por fecha.
-   Comparación temporal entre dos fechas o temporadas.
-   Visualización de índices de vegetación cuando las bandas necesarias
    estén disponibles.
-   Estadísticas por parcela y por zonas internas.
-   Indicadores de calidad, cobertura de nubes y porcentaje de píxeles
    válidos.

Índices que pueden considerarse:

  -----------------------------------------------------------------------
  Índice                              Uso orientativo
  ----------------------------------- -----------------------------------
  NDVI                                Actividad y verdor de la
                                      vegetación.

  EVI                                 Variaciones de vegetación con menor
                                      sensibilidad a algunos efectos de
                                      fondo y atmósfera.

  NDMI                                Cambios relacionados con el
                                      contenido de agua de la vegetación.

  NDRE                                Información de vegetación basada en
                                      bandas Red Edge, si la fuente
                                      dispone de ellas.
  -----------------------------------------------------------------------

**Precaución:** un valor bajo de NDVI no demuestra por sí solo sequía,
degradación del suelo o enfermedad. Puede deberse a la etapa fenológica,
cosecha, suelo descubierto, nubes, cambios de cultivo u otros factores.
El sistema debe presentar señales que requieren interpretación, no
diagnósticos automáticos.

### 2.2 Field DNA --- Memoria digital de la parcela

Field DNA es el perfil histórico y ambiental de cada parcela. Resume
patrones observados, no una supuesta identidad biológica literal.

Dimensiones propuestas:

1.  **Historial de vegetación:** evolución temporal de índices y
    cobertura observada.
2.  **Exposición climática:** historial de precipitaciones, temperaturas
    y episodios extremos disponibles.
3.  **Heterogeneidad espacial:** diferencias entre zonas de la parcela.
4.  **Respuesta posterior a eventos:** cambios observados después de
    períodos de estrés ambiental.
5.  **Calidad de evidencia:** cobertura temporal, resolución espacial,
    datos faltantes y limitaciones.

#### Recovery Signature --- Firma de recuperación vegetal

Funcionalidad distintiva que estudia cómo evoluciona la señal de
vegetación después de un episodio ambiental definido.

Flujo conceptual:

1.  Identificar un episodio de déficit de precipitación o calor
    utilizando criterios explícitos.
2.  Consultar observaciones de vegetación anteriores, durante y
    posteriores al episodio.
3.  Comparar la evolución con un período de referencia apropiado.
4.  Estimar el tiempo que tarda la señal vegetal en volver a un rango de
    referencia, si los datos son suficientes.
5.  Mostrar la curva, las fechas, las observaciones válidas y el nivel
    de confianza.

El indicador debe llamarse **Vegetation Recovery Time** y no presentarse
como una medición directa de recuperación del suelo.

Para evitar interpretaciones erróneas, hay que controlar o documentar:

-   Calendario de siembra y cosecha.
-   Tipo de cultivo, si se conoce.
-   Etapa fenológica.
-   Nubes y calidad de las observaciones.
-   Cambios de uso del suelo.
-   Frecuencia y resolución de los datos.
-   Diferencias entre variabilidad climática y prácticas de manejo.

Si no hay suficientes observaciones comparables, el sistema debe
informar que no puede calcular el indicador de manera fiable.

### 2.3 Climate Replay --- Reproducción de escenarios climáticos históricos

Permite seleccionar episodios históricos de la región para evaluar cómo
podrían comportarse distintas estrategias agrícolas bajo condiciones
similares.

Escenarios posibles:

-   Períodos de precipitación excepcionalmente baja.
-   Episodios de temperaturas elevadas.
-   Precipitaciones irregulares o concentradas.
-   Condiciones cercanas a un período climático de referencia.

Cada escenario debe estar respaldado por datos, fechas, umbrales y
fuentes. No se deben inventar eventos ni describir como extremo un
episodio sin un criterio cuantitativo documentado.

Climate Replay no es una predicción del tiempo. Es una herramienta de
análisis de escenarios basada en observaciones históricas.

### 2.4 Rotation Lab --- Evaluación de rotaciones

Es el módulo central de apoyo a decisiones.

El usuario puede comparar distintas secuencias de cultivos, por ejemplo:

-   **Plan A:** rotación actual o alternativa de referencia.
-   **Plan B:** secuencia que incorpora una leguminosa, si es
    agronómicamente apropiada.
-   **Plan C:** secuencia que incorpora cultivos de cobertura, si las
    condiciones locales lo permiten.

La evaluación debe considerar, según la disponibilidad de información:

1.  Compatibilidad climática y calendario de siembra.
2.  Requerimientos hídricos y exposición a períodos secos.
3.  Duración y continuidad de la cobertura del suelo.
4.  Diversidad y alternancia de familias de cultivos.
5.  Características del suelo y restricciones locales.
6.  Viabilidad operativa y prioridades del productor.
7.  Incertidumbre y calidad de los datos.

El motor debe explicar por qué una alternativa obtiene determinado
resultado. No debe afirmar que una rotación es universalmente superior.

#### Comparación multiobjetivo

En lugar de reducir todo a una puntuación opaca, el sistema debe
permitir observar compromisos entre objetivos, por ejemplo:

-   Protección del suelo.
-   Exposición al estrés hídrico.
-   Diversidad de cultivos.
-   Viabilidad agronómica.
-   Viabilidad operativa o económica, cuando existan datos suficientes.

Puede utilizarse una frontera de Pareto para mostrar alternativas no
dominadas. Las ponderaciones deben ser configurables y visibles para el
usuario.

**Límite importante:** no se deben generar predicciones de rendimiento,
ingresos o toneladas por hectárea sin un modelo calibrado y datos
adecuados. Si no existe esa validación, presentar indicadores
comparativos de compatibilidad y riesgo, no rendimientos simulados.

### 2.5 Adaptive Monitor --- Seguimiento y alertas

El sistema puede seguir la evolución de las condiciones observadas y
señalar cuándo conviene revisar una decisión o consultar a un
especialista.

Posibles variables:

-   Precipitación acumulada.
-   Anomalías de temperatura.
-   Evolución de índices de vegetación.
-   Etapa del cultivo, si se conoce.
-   Calidad y frecuencia de observaciones.

Ejemplo de alerta:

> Se detectó una desviación respecto del comportamiento histórico de
> referencia. Conviene revisar las observaciones recientes, comprobar la
> etapa fenológica y consultar al responsable agronómico antes de
> modificar el manejo.

Las alertas deben mostrar qué variable las activó, el umbral aplicado,
la fuente, la fecha y la incertidumbre. No deben ordenar acciones
agronómicas automáticas.

### 2.6 Resilience Passport --- Informe auditable

Cada parcela puede generar un informe descargable con:

  -----------------------------------------------------------------------
  Sección                             Contenido
  ----------------------------------- -----------------------------------
  Field DNA                           Perfil histórico y ambiental de la
                                      parcela.

  Climate History                     Eventos climáticos identificados y
                                      fuentes.

  Recovery Signature                  Evolución vegetal posterior a
                                      eventos, si puede calcularse.

  Rotation Stress Test                Comparación de alternativas de
                                      rotación.

  Risk Profile                        Riesgos y condiciones analizadas.

  Confidence Report                   Calidad, cobertura, incertidumbre y
                                      limitaciones.

  Recommended Strategies              Alternativas evaluadas y razones.

  Data Provenance                     Fuentes, fechas, resoluciones y
                                      transformaciones aplicadas.
  -----------------------------------------------------------------------

Toda conclusión importante debe poder rastrearse hasta los datos y
reglas que la respaldan.

------------------------------------------------------------------------

## 3. Fuentes de datos potenciales

La selección final debe depender del área de estudio, la disponibilidad
temporal, la resolución y las condiciones de acceso.

  -----------------------------------------------------------------------
  Fuente                  Aplicación posible      Precaución
  ----------------------- ----------------------- -----------------------
  NASA HLS                Reflectancia armonizada Producto de 30 m;
                          de Landsat y Sentinel-2 revisar bandas
                          para análisis de        disponibles, calidad y
                          vegetación.             nubes.

  NASA GPM IMERG          Estimaciones de         Resolución espacial
                          precipitación y         mucho más gruesa que
                          análisis de períodos    una parcela pequeña.
                          secos.                  

  NASA SMAP               Humedad superficial del Resolución demasiado
                          suelo y evolución       gruesa para
                          regional.               diagnosticar cada
                                                  pequeña parcela.

  NASA POWER              Variables               No tratar sus datos
                          meteorológicas y        como mediciones locales
                          solares para análisis   de alta resolución.
                          regional.               

  NASA ECOSTRESS          Evapotranspiración y    Disponibilidad temporal
                          variables relacionadas  y espacial irregular
                          con el uso del agua.    según producto.

  NASA-ISRO NISAR         Observaciones radar     Verificar
                          complementarias para    disponibilidad de
                          estudiar cambios de     escenas y nivel de
                          superficie.             validación del producto
                                                  antes de usarlo.

  Fuentes locales         Suelo, historial de     Registrar procedencia,
                          cultivos, calendario,   fecha, escala y
                          prácticas y             confiabilidad.
                          restricciones.          
  -----------------------------------------------------------------------

### Principio de resolución

No se deben representar todas las variables como si tuvieran la misma
resolución espacial. Un mapa de vegetación de 30 m no convierte
automáticamente un producto de precipitación de varios kilómetros en
información de 30 m.

La interfaz debe mostrar la resolución y escala de cada capa. Cuando se
combinen fuentes, hay que documentar el método de agregación o
comparación.

### Documentación oficial para investigar

-   NASA Earthdata: https://www.earthdata.nasa.gov/
-   NASA HLS: https://hls.gsfc.nasa.gov/
-   NASA GPM: https://gpm.nasa.gov/data
-   NASA SMAP: https://smap.jpl.nasa.gov/
-   NASA POWER: https://power.larc.nasa.gov/
-   NASA ECOSTRESS: https://ecostress.jpl.nasa.gov/
-   NASA NISAR: https://nisar.jpl.nasa.gov/

Verificar endpoints, productos, fechas, licencias, autenticación y
disponibilidad actuales antes de implementar.

------------------------------------------------------------------------

## 4. Arquitectura técnica propuesta

``` text
Frontend — Plataforma web
  ├── Mapa interactivo
  ├── Field Monitor
  ├── Field DNA
  ├── Climate Replay
  ├── Rotation Lab
  ├── Adaptive Monitor
  └── Resilience Passport

Backend — API y coordinación
  ├── Gestión de parcelas
  ├── Usuarios y proyectos
  ├── Consultas de datos
  ├── Orquestación de procesos
  └── Generación de informes

Motor geoespacial
  ├── Ingesta de datos raster
  ├── Máscaras de calidad
  ├── Cálculo de índices
  ├── Estadísticas zonales
  └── Series temporales

Motor agronómico
  ├── Catálogo de cultivos
  ├── Reglas y restricciones
  ├── Evaluación de rotaciones
  ├── Análisis multiobjetivo
  └── Explicaciones y trazabilidad

Fuentes
  ├── NASA HLS
  ├── NASA GPM
  ├── NASA SMAP
  ├── NASA POWER
  ├── NASA ECOSTRESS
  └── Datos agronómicos locales
```

### Tecnologías sugeridas

  -----------------------------------------------------------------------
  Componente                          Tecnología
  ----------------------------------- -----------------------------------
  Frontend                            React + TypeScript

  Mapas                               MapLibre GL JS

  Backend                             Python + FastAPI

  Procesamiento raster                Rasterio / GDAL

  Datos vectoriales                   GeoPandas

  Base de datos                       PostgreSQL + PostGIS

  Gráficos                            Plotly

  Procesamiento                       Python

  Formatos geoespaciales              GeoJSON, GeoTIFF y Cloud Optimized
                                      GeoTIFF, según necesidad
  -----------------------------------------------------------------------

La arquitectura debe adaptarse al prototipo existente. No reescribir la
aplicación completa sin evaluar primero su estructura y funcionamiento.

------------------------------------------------------------------------

## 5. Interfaz y experiencia de usuario

Se propone una interfaz oscura, moderna y profesional, inspirada en
plataformas GIS y herramientas de inteligencia geoespacial.

Menú principal:

1.  **Field Monitor:** mapa y monitoreo satelital.
2.  **Field DNA:** perfil histórico de la parcela.
3.  **Rotation Lab:** comparación de rotaciones.
4.  **Climate Replay:** escenarios históricos.
5.  **Adaptive Monitor:** seguimiento y alertas.
6.  **Resilience Passport:** informe final.

La vista principal debe priorizar el mapa central, con paneles laterales
compactos. Las gráficas deben permitir abrir la evidencia subyacente y
consultar fechas, fuentes y unidades.

La experiencia debe ser útil para una persona que no sea especialista en
teledetección. Los indicadores técnicos necesitan explicaciones breves y
comprensibles.

------------------------------------------------------------------------

## 6. Alcance recomendado para la competencia

No intentar construir todos los módulos a la vez. La versión de
competencia debe ser pequeña, funcional y demostrable.

### MVP prioritario

1.  Seleccionar una parcela real o un área de estudio claramente
    delimitada.
2.  Mostrar una capa de vegetación real derivada de NASA HLS.
3.  Comparar dos fechas o períodos.
4.  Consultar precipitación y variables climáticas de la región.
5.  Construir un perfil Field DNA básico, con fuentes y limitaciones.
6.  Comparar tres estrategias de rotación mediante criterios agronómicos
    documentados.
7.  Ejecutar al menos un Climate Replay histórico.
8.  Generar un Resilience Passport con resultados, evidencias e
    incertidumbres.

### Funciones posteriores o experimentales

-   Recovery Signature avanzada.
-   Alertas adaptativas automatizadas.
-   Integración experimental de NISAR.
-   Simulaciones agronómicas más sofisticadas.
-   Optimización multiobjetivo ampliada.

Una función experimental debe identificarse como tal. No presentarla
como validada si todavía no lo está.

------------------------------------------------------------------------

## 7. Reparto de responsabilidades

  -----------------------------------------------------------------------
  Integrante              Responsabilidad         Entregables
                          principal               verificables
  ----------------------- ----------------------- -----------------------
  Claude A                Dirección técnica,      Aplicación integrada,
                          arquitectura, interfaz, arquitectura,
                          integración y producto  documentación y
                          final.                  demostración.

  Claude B                Datos NASA,             Pipelines
                          procesamiento           reproducibles,
                          geoespacial, series     resultados de
                          temporales y motor de   procesamiento, pruebas
                          análisis.               y documentación de
                                                  datos.

  Compañero 1             Investigación           Informe con fuentes,
                          agronómica y validación fichas de cultivos,
                          de rotaciones.          restricciones,
                                                  calendario y reglas
                                                  agronómicas
                                                  justificadas.

  Compañero 2             Pruebas funcionales y   Matriz de escenarios,
                          experiencia de usuario. errores reproducibles,
                                                  resultados de pruebas y
                                                  guion de demostración.
  -----------------------------------------------------------------------

Los compañeros deben aportar resultados que influyan en las decisiones
del producto, no tareas meramente decorativas.

### Coordinación entre Claude A y Claude B

Ambos deben trabajar sobre el mismo repositorio GitHub, en ramas
separadas y con contratos de integración documentados. Antes de
desarrollar módulos paralelos, acordar:

-   Formatos de entrada y salida.
-   Identificadores de parcelas.
-   Sistema de coordenadas.
-   Unidades.
-   Frecuencia temporal.
-   Tratamiento de datos faltantes.
-   Manejo de errores.
-   Metadatos y procedencia.

------------------------------------------------------------------------

## 8. Demostración sugerida para los jueces

La demostración debe contar una historia sencilla y basada en datos
reales.

### Caso de uso

1.  Seleccionar una parcela real de la región elegida.
2.  Mostrar su ubicación y límites.
3.  Comparar dos períodos de observación satelital.
4.  Abrir su Field DNA y explicar un patrón histórico.
5.  Seleccionar un episodio climático histórico respaldado por datos.
6.  Comparar tres estrategias de rotación.
7.  Mostrar las ventajas, desventajas y limitaciones de cada
    alternativa.
8.  Generar el Resilience Passport y abrir las fuentes de evidencia.

La demostración debe evitar resultados inventados. Si se utilizan datos
de ejemplo, deben estar claramente etiquetados como simulados.

------------------------------------------------------------------------

## 9. Principios científicos y de transparencia

TERRA-SHIFT debe cumplir estas reglas:

-   Diferenciar observaciones, estimaciones, inferencias y simulaciones.
-   Mostrar fuentes, fechas, unidades y resolución espacial.
-   No confundir índices de vegetación con mediciones directas de salud
    del suelo.
-   No inferir humedad de suelo a escala de parcela a partir de
    productos regionales gruesos.
-   Documentar las reglas agronómicas y permitir su revisión.
-   Mostrar incertidumbre y datos faltantes.
-   No generar rendimientos o beneficios económicos sin modelos y datos
    adecuados.
-   No presentar correlaciones como causalidad.
-   Mantener trazabilidad entre cada conclusión y la evidencia
    utilizada.
-   Reconocer cuándo los datos no permiten una conclusión fiable.

------------------------------------------------------------------------

## 10. Diferenciación del proyecto

La propuesta no consiste simplemente en reunir mapas satelitales y un
recomendador de cultivos.

Su diferenciación es integrar cuatro ideas en un mismo flujo:

1.  **Memoria de la parcela:** reconstruir cómo ha cambiado el terreno.
2.  **Firma de recuperación:** estudiar cómo evolucionó la señal de
    vegetación después de eventos ambientales.
3.  **Ensayo de rotaciones:** comparar alternativas frente a episodios
    climáticos históricos.
4.  **Decisiones trazables:** explicar por qué una alternativa resulta
    más compatible con determinados objetivos y qué incertidumbre
    existe.

La innovación debe demostrarse con un caso de uso reproducible. No
afirmar que la combinación es inédita en el mundo sin una revisión
bibliográfica específica.

## 11. Mensaje central

> TERRA-SHIFT helps farmers explore the future of their fields using the
> Earth's observed past.

En español:

> TERRA-SHIFT ayuda a los agricultores a explorar el futuro de sus
> campos utilizando el pasado observado de la Tierra.

**La plataforma no pretende adivinar el futuro. Permite aprender del
comportamiento histórico del terreno, ensayar alternativas y tomar
decisiones mejor fundamentadas.**
