/* Written with assistance from Claude (Anthropic) · Escrito con asistencia de Claude (Anthropic). */
/* Worker de la IA local (beta): corre el modelo fuera de la pantalla para que la app no se trabe. */
import { WebWorkerMLCEngineHandler } from 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.88/+esm';
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => handler.onmessage(msg);
