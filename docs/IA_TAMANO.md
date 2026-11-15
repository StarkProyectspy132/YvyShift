# ¿Cuánto pesaría la app con IA?

Fecha: 14-nov-2026. Tamaños de archivo leídos ese día en Hugging Face y jsDelivr. El resto son estimaciones y lo dice.

Uso pedido: un asistente que entienda frases como "quiero registrar mi parcela de tomates en San Lorenzo" y guíe al productor.

## Base

| Versión | Tamaño | Cómo se midió |
|---|---|---|
| App antes del rediseño | 516 KB | Carpeta `app/` medida |
| App con barra lateral y asistente guiado sin IA | 574 KB | Carpeta `app/` medida. El asistente, la agenda y las parcelas suman 58 KB |

## Opciones con IA

| Opción | Qué hace | Descarga la primera vez | ¿Sin conexión? | Calidad para este uso |
|---|---|---|---|---|
| **A. Asistente guiado por reglas** (lo que quedó hecho) | Reconoce lugares, suelos, cultivos, limitaciones y unas 15 intenciones | **0,6 MB** | Sí | Buena en frases simples; falla con frases raras. Nunca inventa números |
| **B. Clasificador de intención** (multilingual-e5-small, int8) | Entiende frases con otras palabras; las respuestas siguen siendo plantillas | **~140 MB**: modelo 118 MB + motor ~21,5 MB | Sí, después de la primera descarga | Mejor comprensión, misma honestidad. Lento en teléfonos baratos |
| **C. Modelo generativo chico en el navegador** (Qwen2.5-0.5B-Instruct, 4 bits) | Conversa libremente | **~505 MB**: modelo 483 MB + motor ~21,5 MB | Sí, después de la primera descarga | Español flojo en un modelo de 0,5 mil millones de parámetros; puede inventar cifras o consejos. Necesita WebGPU para ir rápido |
| **D. Modelo generativo mediano** (Qwen2.5-1.5B-Instruct, 4 bits) | Conversa mejor | **~1,15 GB**: modelo 1,12 GB | Sí, después de la primera descarga | Mejor, pero puede seguir inventando. Inviable en la mayoría de los teléfonos |
| **E. IA en la nube** (API de un proveedor) | Conversa bien | **0,6 MB** (la app no cambia) | **No** | La mejor. Pero necesita un servidor propio para esconder la clave, cobra por mensaje y los datos del productor salen del teléfono |

### Fuentes de los tamaños

- multilingual-e5-small, `model_int8.onnx`: 118 MB (huggingface.co/Xenova/multilingual-e5-small).
- Qwen2.5-0.5B-Instruct, `model_q4f16.onnx`: 483 MB (huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct). La versión GGUF Q4_K_M pesa 491 MB.
- Qwen2.5-1.5B-Instruct, GGUF Q4_K_M: 1,12 GB (huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF).
- Motor para correr modelos en el navegador (Transformers.js 3.5.1): `transformers.min.js` 830 KB + `ort-wasm-simd-threaded.jsep.wasm` 20,6 MB (cdn.jsdelivr.net).
- No incluí el tokenizador ni la configuración (pocos MB). No medí velocidad ni memoria en un teléfono real: son estimaciones.

### Regla para calcular otros modelos

Peso ≈ cantidad de parámetros × bits por parámetro ÷ 8, más un 5–10 % de extra.
Ejemplo: 0,5 mil millones × 4 bits ÷ 8 = 250 MB. El archivo real pesa 483 MB porque esa versión deja partes del modelo (como el vocabulario) en 16 bits.

## Recomendación

Para la competencia: **A**, que ya está hecho. Pesa 100 veces menos que cualquier IA local, funciona sin conexión en el campo y no puede inventar un dato, que es justo lo que el jurado de Validez va a buscar.

Si después se quiere IA de verdad, la que tiene sentido es **E** (nube) usada solo para entender la frase, y que los números sigan saliendo del motor de Rotation Lab. La interfaz del chat ya está lista para eso: habría que agregar un servidor pequeño que guarde la clave, y cambiar la función `answer()` de `app/app.js`. **B**, **C** y **D** no valen la descarga para un productor con datos móviles.
