# Assistant: knowledge base and optional local AI (v21)

Date: 15 Nov 2026. It replaces the old cloud AI mode (Gemini), which was removed in v16 because it needed a server and an API key.

## What it is

The chat answers in steps. The numbers for an area always come from the calculation engine, never from the AI.

| Step | What it does | Uses AI? | File |
|---|---|---|---|
| 1. Guided assistant | Recognises places, soils, crops and about 15 intents. Numbers come from the engine | No | `app/app.js` (`answer`) |
| 2. Knowledge base | If step 1 did not understand, it searches 18 fixed texts, each with a source and a reviewer. Tolerates typos and some Guaraní words | No | `app/data/conocimiento.js`, `app/asistente-ia.js` (`search`) |
| 3. Local AI picks a topic | Only if step 2 was not enough and the user installed the AI: the model **picks a topic** from a closed list | Yes, on the device | `app/asistente-ia.js` (`classify`), `app/ia-worker.js` |
| 4. Local AI writes a short answer | Only if no topic fits: the model writes a short answer about farming or about how to use the app, guided by the two closest knowledge texts and the selected area | Yes, on the device | `app/asistente-ia.js` (`write`) |

## Safety layer

1. **Closed list first.** When picking a topic, the model can only answer with one of the 18 knowledge topics, one of the engine questions, or `ninguno` (none). The code discards any output that is not an id from the list (`tests/asistente.test.js` tests this with malicious outputs such as "It rained 5000 mm").
2. **Fixed texts when possible.** If the model picks a knowledge topic, the reviewed text is shown. If it picks an engine question, the guided assistant is asked again and the numbers come from `engine.js`.
3. **Written answers are labelled.** An answer from step 4 is marked "Answer written by the local AI" so it is never confused with a reviewed text.
4. **No invented numbers.** Before a written answer is shown, `keepKnown()` removes any sentence that contains a number that is not in the prompt the model received (the app's own texts and the area's data). This was added after an early test where the model invented a herbicide dose.
5. **Safe display.** `fmt()` escapes HTML, so the model cannot inject markup or scripts.
6. **Fixed notice** next to the chat: the assistant may misunderstand the question; check the topic and the source of each answer, and talk to your technician before deciding.
7. **When unsure, it does not answer.** An error or a timeout (120 s) shows "I did not find that topic" and the list of topics.

Remaining risk: the model may **pick the wrong topic**, or write an answer that is vague or wrong in a way that contains no number. That is why every answer shows how it was produced.

## The local AI

- Model: Qwen2.5-1.5B-Instruct, 4-bit (`Qwen2.5-1.5B-Instruct-q4f16_1-MLC`, about 0.9 GB; on GPUs without `shader-f16`, the `q4f32_1` version). Licence: Apache 2.0. It replaced Llama 3.2 1B, which did not follow the instructions well in Spanish.
- Engine: WebLLM 0.2.88 (`@mlc-ai/web-llm`, Apache 2.0), loaded from cdn.jsdelivr.net, running in a Web Worker with WebGPU.
- Storage: the model is stored in IndexedDB (`cacheBackend: 'indexeddb'`). The browser's Cache API failed with the model host's download servers and left the download stuck at about 5 %.
- Download: off by default, through the "Install local AI" button. A progress bar shows the download, and a small cancel button stops it. Network errors are retried up to 3 times. On mobile data or data saver mode it asks first. It checks free space and requests persistent storage.
- Remove: the "Remove local AI" button deletes the model.
- Battery: the model is loaded only when the user taps the text box, not when the app opens.

## Requirements and phones

- A browser with WebGPU (a recent Chrome or Edge on a computer or on Android).
- WebLLM asks the GPU for a compute workgroup storage limit (`maxComputeWorkgroupStorageSize`) of 32768 bytes. Many phones offer only 16384. On those devices the app says "Local AI is not available on this phone" and the guided assistant and knowledge base keep working, offline. The team chose not to build a phone workaround.
- Without WebGPU, the chat keeps working with steps 1 and 2 and explains why.

Measured on the team's computer (Intel integrated GPU, Chromium): download about 70 s at about 14.6 MB/s; first answer about 75 s while the model warms up; later answers 15 to 30 s. After installation the model loaded and answered with no connection.

## Offline (app installed on the phone or computer)

- `data/conocimiento.js`, `asistente-ia.js` and `ia-worker.js` are in the service worker's main cache, so steps 1 and 2 always work without signal.
- The WebLLM library is kept in a separate cache (`yvy-ia-lib-0.2.88`) and the model in IndexedDB.
- The service worker only deletes old caches of the app itself (`yvy-v*`, `rl-v*`), so an app update does not delete the 0.9 GB model.
- Not yet tested: caching of the library by the service worker on the published HTTPS site in airplane mode. Test it before a live demo.

## How to edit the knowledge base

In `app/data/conocimiento.js`, each topic has `id`, `keys` (lower-case words without accents), `title` and `text` in Spanish and English, `src` (source) and `rev` (who reviewed it). Rules: nothing without a source; no figures for a specific place (those come from the engine); agronomic topics stay "pending agronomist" until reviewed. After editing, run `node --test tests/asistente.test.js` and bump `VERSION` in `app/sw.js`.

## Tests

`node --test tests/engine.test.js tests/validation.test.js tests/asistente.test.js` → 34 of 34 pass.
