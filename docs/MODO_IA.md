# Asistente: base de conocimiento e IA local opcional (v18, beta)

Fecha: 15-nov-2026. Reemplaza al antiguo "modo Gemini" (retirado en v16: usaba un servidor y una clave).

## Qué es

El chat de la portada responde en tres escalones. Ninguno deja que una IA escriba números o consejos:

| Paso | Qué hace | ¿Usa IA? | Archivo |
|---|---|---|---|
| 1. Asistente guiado | Reconoce lugares, suelos, cultivos y ~15 intenciones. Los números salen del motor | No | `app/app.js` (`answer`) |
| 2. Base de conocimiento | Si el paso 1 no entendió, busca entre 18 textos fijos, con fuente y revisor. Tolera errores de tipeo y algunas palabras en guaraní | No | `app/data/conocimiento.js`, `app/asistente-ia.js` (`search`) |
| 3. IA local (opcional) | Solo si el paso 2 no alcanzó y la persona la instaló: un modelo chico **elige un tema** de la lista | Sí, en el teléfono | `app/asistente-ia.js` (`classify`), `app/ia-worker.js` |

## Capa de seguridad

1. **Lista cerrada.** El modelo solo puede responder `{"tema":"<id>"}` con uno de los 18 temas de la base, 9 preguntas del motor o `ninguno`. La salida está forzada por una gramática JSON (WebLLM + XGrammar, `enum`).
2. **Doble control.** Aunque la gramática fallara, el código descarta cualquier salida que no sea un id de la lista (`tests/asistente.test.js` lo prueba con salidas maliciosas como "Llovieron 5000 mm").
3. **El modelo nunca escribe lo que lee el productor.** Si elige un tema de la base, se muestra el texto fijo. Si elige una pregunta del motor, se repregunta al asistente guiado y los números salen de `engine.js`.
4. **Transparencia.** Cada respuesta dice qué tema se eligió y cómo ("por coincidencia de palabras" o "por la IA local"), muestra la fuente y ofrece otros temas.
5. **Aviso fijo** junto al chat: "El asistente puede equivocarse al entender su pregunta. Revise el tema y la fuente de cada respuesta, y consulte a su técnico antes de decidir."
6. **Si duda, no contesta.** `ninguno`, error o más de 25 s → "No encontré ese tema" y la lista de temas.

Riesgo que queda: el modelo puede **elegir mal el tema**. La respuesta sería correcta, pero a otra pregunta. Por eso se muestra el tema elegido.

## La IA local

- Modelo: Llama 3.2 1B Instruct, 4 bits (`Llama-3.2-1B-Instruct-q4f16_1-MLC`, ~0,9 GB; si el teléfono no soporta `shader-f16`, la versión `q4f32_1`, ~1,1 GB). Licencia Llama 3.2 Community License.
- Motor: WebLLM 0.2.88 (`@mlc-ai/web-llm`), cargado desde cdn.jsdelivr.net, corriendo en un Web Worker con WebGPU.
- Descarga: el modelo viene de huggingface.co y raw.githubusercontent.com. Apagado por defecto. Botón "Instalar IA local (beta)". Si la persona está con datos móviles o en ahorro de datos, pide confirmación. Revisa el espacio libre y pide almacenamiento persistente.
- Quitar: botón "Quitar IA local" borra el modelo de la caché.
- Requisitos: navegador con WebGPU (Chrome reciente en Android o computadora). Si no hay, el chat sigue con los pasos 1 y 2 y lo explica.
- Batería: el modelo se carga solo cuando la persona toca la caja de texto, no al abrir la app.

## Sin internet (versión instalada en el celular)

- `data/conocimiento.js`, `asistente-ia.js` e `ia-worker.js` están en la caché principal del service worker: los pasos 1 y 2 funcionan siempre sin señal.
- La librería WebLLM se guarda en una caché aparte (`yvy-ia-lib-0.2.88`) y el modelo en las cachés propias de WebLLM (`webllm/...`).
- Desde v18 el service worker **solo borra cachés viejas de la app** (`yvy-v*`, `rl-v*`). Antes borraba todas, y eso habría eliminado el modelo de 0,9 GB en cada actualización.
- Probado en Chromium con emulación de Pixel 7 sin conexión (pasos 1 y 2). **No probado todavía**: la descarga y uso real del modelo en un teléfono; hacerlo antes de mostrarlo.

## Cómo editar la base de conocimiento

En `app/data/conocimiento.js`, cada tema tiene `id`, `keys` (palabras sin tildes, en minúscula), `title` y `text` en es/en, `src` (fuente) y `rev` (quién lo revisó). Reglas: nada sin fuente; nada de cifras de un lugar (esas salen del motor); los temas agronómicos quedan "pendiente agrónomo" hasta que los revise. Después de editar, correr `node --test tests/asistente.test.js` y subir `VERSION` en `app/sw.js`.

## Pruebas

`node --test tests/engine.test.js tests/validation.test.js tests/asistente.test.js` → 32 de 32.
