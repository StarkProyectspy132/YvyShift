---
name: nasa-earthdata-agri-decision-support
description: Investiga, integra y valida datos NASA Earth science para herramientas de apoyo a decisiones agrícolas. Úsala para evaluar recursos oficiales de Field Shift, consultar APIs/datasets, procesar datos geoespaciales, diseñar comparaciones de rotaciones, documentar incertidumbre, validar indicadores y crear módulos reproducibles y explicables.
---

# NASA Earthdata & Agricultural Decision Support

## Propósito

Construir componentes de datos y análisis confiables para un sistema de apoyo a decisiones agrícolas que combine observaciones de NASA, datos locales de suelo, características de cultivos y prioridades del productor. El sistema debe ayudar a explorar escenarios, no reemplazar a un agrónomo ni emitir recomendaciones no validadas.

## Principios científicos y de datos

1. **Elegibilidad primero:** comprueba la pestaña `Resources` del desafío oficial. No des por supuesto que un dataset sugerido está incluido en los recursos obligatorios.
2. **Atribución y trazabilidad:** cada dato debe conservar producto, URL, fecha, coordenadas/área, unidades, periodo, versión y método de procesamiento.
3. **Resolución honesta:** nunca atribuyas una precisión a nivel de parcela si el producto tiene una celda mucho mayor.
4. **Tipo de dato explícito:** distingue observación satelital, reanálisis, modelo, estimación y estación terrestre.
5. **Sin datos fabricados:** si se usan datos sintéticos para pruebas, identifícalos y sepáralos de los resultados reales.
6. **Incertidumbre visible:** comunica huecos, calidad, nubes, latencia, error y extrapolaciones.
7. **Cálculos explicables:** cada indicador debe tener fórmula, unidades, rangos y pruebas.
8. **Decisión humana:** el producto apoya al productor y al profesional local; no presenta una salida heurística como verdad agronómica.

## Procedimiento de investigación

### 1. Revisar los recursos del reto

- Abre la página oficial de Field Shift.
- Inspecciona todos los recursos enlazados para el desafío.
- Registra cuáles son NASA, Space Agency Partner, local o tercero.
- Marca al menos una fuente NASA oficial del reto que será usada sustancialmente por el prototipo, según las reglas vigentes.
- Guarda una copia/versionado de metadatos cuando sea posible.

### 2. Elegir datasets según la pregunta agrícola

Evalúa cada dataset por la decisión que puede informar, no por su popularidad.

Posibles familias que se deben comprobar (no asumir como obligatorias ni como recursos incluidos):

- NASA POWER: variables meteorológicas y solares de series temporales; verifica producto, fuente y resolución.
- SMAP: humedad del suelo; verifica producto, profundidad representada, resolución, frecuencia y limitaciones.
- GPM IMERG: precipitación; verifica acumulaciones, resolución, periodo, latencia y calidad.
- MODIS, Landsat o HLS: índices de vegetación/cobertura y cambios; revisa bandas, máscaras, resolución y nubes.
- ECOSTRESS u otros productos térmicos: verifica cobertura, disponibilidad y si la escala temporal/espacial sirve para el caso elegido.

No uses un dataset solo para poner el logo de NASA. Debe contribuir a una función o análisis que la solución pueda explicar.

### 3. Crear un manifiesto de fuentes

Mantén un registro CSV/JSON/Markdown con, como mínimo:

- `source_id`
- nombre del producto
- organización/proveedor
- enlace oficial
- inclusión en Resources del reto (sí/no/no comprobado)
- variable y definición
- unidad original
- resolución espacial
- resolución temporal
- periodo de cobertura
- última actualización/latencia
- cobertura geográfica
- método/API
- transformaciones
- calidad/QA
- limitaciones
- cita corta para UI
- cita bibliográfica completa

### 4. Construir una canalización reproducible

Separa el trabajo en pasos pequeños:

1. Validación de parámetros y ubicación.
2. Consulta/descarga de datos.
3. Validación de respuesta y metadatos.
4. Normalización de fecha, unidad, sistema de coordenadas y valores faltantes.
5. Cálculo de indicadores.
6. Agregación espacial/temporal compatible con la resolución nativa.
7. Cache y guardado reproducible.
8. Exportación a contrato JSON/API.

Requisitos:

- Reintentos limitados y backoff ante errores transitorios.
- Timeouts y mensajes de error comprensibles.
- Caché para no repetir llamadas innecesarias.
- No almacenar ni exponer credenciales.
- No sustituir silenciosamente fallos de API con datos falsos.
- Guardar el origen y los parámetros de cada extracción.
- Verificar que la respuesta pertenece a la ubicación/periodo solicitado.

## Diseño de indicadores agrícolas

Antes de calcular un indicador, responde:

- ¿Qué decisión informa?
- ¿Qué variable se necesita?
- ¿Qué dataset la mide o estima?
- ¿La resolución sirve a la escala del usuario?
- ¿Qué datos de campo faltan?
- ¿Cuál es la fórmula y su unidad?
- ¿Cómo se valida?

No inventes fórmulas agronómicas. Usa bibliografía o documentación técnica reconocida y cita su procedencia.

### Comparación de rotaciones

Si el producto compara rotaciones:

- Incluye la rotación/práctica actual como línea base cuando se disponga de información.
- Compara al menos dos alternativas plausibles para el sistema productivo local.
- Documenta secuencia, duración, calendario, cultivos, cobertura, manejo y requerimientos de cada alternativa.
- Separa atributos medidos, atributos de literatura y supuestos ingresados por el usuario.
- No supongas que una leguminosa siempre mejora el suelo o que una rotación siempre reduce riesgo; depende de especie, suelo, manejo, clima y contexto.
- Usa una tabla de trade-offs, no solo una clasificación única.
- Permite cambiar prioridades y observar cómo cambia el resultado.
- Muestra los pesos y reglas de la comparación.
- Si faltan datos críticos, degrada la confianza, bloquea la recomendación o etiqueta el resultado como exploratorio.

Una puntuación compuesta solo es admisible cuando:

1. Cada dimensión está definida.
2. Las unidades/escala están normalizadas de forma justificada.
3. Los pesos son visibles y modificables o claramente establecidos.
4. Se muestra la contribución de cada dimensión.
5. La incertidumbre y los datos faltantes afectan explícitamente al resultado.
6. Existen tests con casos de entrada y resultados esperados.

## Validación y control de calidad

Incluye pruebas para:

- Respuestas vacías, incompletas o fuera del periodo.
- Valores faltantes, duplicados y outliers.
- Unidades y conversiones.
- Límites geográficos y zonas horarias.
- Transformaciones y agregaciones.
- Fórmulas e indicadores.
- Diferentes escenarios de prioridades.
- Comportamiento cuando faltan datos de suelo o cultivo.

Haz una revisión manual de al menos un resultado y compara con una segunda fuente cuando sea razonable. No uses un modelo de IA para validar sus propias salidas sin referencia independiente.

## Localización del piloto

Para un piloto paraguayo o sudamericano:

- Elige una zona y sistema de cultivo con información pública comprobable.
- Busca datos de MAG, IPTA, INBIO, CAPECO, SENAVE, institutos de investigación, universidades y publicaciones técnicas, según pertinencia.
- Comprueba que la cobertura de las fuentes coincide con la ubicación seleccionada.
- No inventes propiedades del suelo ni calendarios de siembra.
- Si los datos de finca no están disponibles, utiliza un caso regional exploratorio claramente identificado y permite al usuario ingresar sus datos.
- Solicita validación local antes de formular recomendaciones prácticas.

## Contrato mínimo de salida

Un resultado de escenario debería poder representar una estructura similar a esta (ajústala al stack, sin copiar valores ficticios):

```json
{
  "scenario_id": "rotation_A",
  "location": {
    "label": "pilot area",
    "geometry_id": "...",
    "spatial_scale": "regional"
  },
  "period": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "inputs": [],
  "indicators": [],
  "tradeoffs": [],
  "evidence": [
    {
      "source_id": "...",
      "variable": "...",
      "value": null,
      "unit": "...",
      "resolution": "...",
      "period": "...",
      "limitations": []
    }
  ],
  "assumptions": [],
  "missing_data": [],
  "confidence": {
    "label": "exploratory",
    "reasons": []
  }
}
```

Nunca uses `confidence: high` solo porque el algoritmo devolvió un número. La confianza debe estar vinculada a disponibilidad, calidad y validación de la evidencia.

## Documentación que debes entregar

- `README_DATA.md`: cómo reproducir la ingesta.
- `DATA_DICTIONARY.md`: definiciones y unidades.
- `source_manifest.csv` o `.json`: fuentes y metadatos.
- `SCIENTIFIC_VALIDATION.md`: fórmulas, bibliografía y pruebas.
- `LIMITATIONS_AND_ASSUMPTIONS.md`: límites claros.
- Contrato JSON/API para integración.
- Tests automatizados de funciones críticas.

## Criterio de finalización

El módulo está listo cuando puede volver a generar sus resultados, cada valor tiene trazabilidad, las pruebas críticas pasan, la escala/resolución es honesta y la UI puede explicar con claridad qué se sabe, qué se estima y qué falta saber.
