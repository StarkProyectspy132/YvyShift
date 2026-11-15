# Publicar Rotation Lab en Google Cloud (Cloud Run) con los créditos del GDG

Resultado: **una sola dirección pública** (`https://rotation-lab-….run.app`) que sirve la página, la app instalable sin conexión y, si se activa, el modo con IA de Gemini. Tiempo: unos 10 minutos la primera vez.

Proyecto del equipo: `astro-code-514720`.

## Qué hace Claude y qué hace el equipo

| Paso | Quién |
|---|---|
| Código del servidor, pruebas (30), paquete `entrega/rotation-lab-cloudrun.zip`, este instructivo | Claude ✅ |
| Iniciar sesión en Google Cloud, canjear el crédito, activar la facturación | Equipo |
| Subir el `.zip` a Cloud Shell y ejecutar `bash deploy.sh` | Equipo |
| Escribir la clave de Gemini cuando el script la pide (queda oculta y se guarda en Secret Manager) | Equipo. **No pasarla por el chat ni pegarla en ningún archivo** |
| Probar la dirección publicada, revisar errores y corregir el código | Claude, con la dirección que le pasen |

## Antes de empezar (una sola vez)

1. **Facturación:** el proyecto tiene que tener una cuenta de facturación con el crédito del GDG. Consola → Facturación.
2. **Alerta de presupuesto (muy recomendado):** Facturación → Presupuestos y alertas → crear un presupuesto chico (por ejemplo, la mitad del crédito) con avisos al 50 % y 90 %. Evita que un error o un abuso gaste todo el crédito.
3. **Nombre del modelo de Gemini:** copiar el nombre exacto de un modelo vigente desde la documentación o la consola de Google (Vertex AI → Model Garden, o Google AI Studio). El script lo pide.

## Publicar

1. Abrir https://console.cloud.google.com/?project=astro-code-514720 e iniciar sesión con la cuenta del equipo.
2. Abrir **Cloud Shell**: el ícono `>_` arriba a la derecha. Es un terminal en el navegador que ya trae todo instalado.
3. En Cloud Shell: menú **⋮ → Subir (Upload)** → elegir `entrega/rotation-lab-cloudrun.zip` de esta carpeta.
4. Copiar y pegar en Cloud Shell:
   ```
   gcloud config set project astro-code-514720
   rm -rf rotation-lab && unzip -q rotation-lab-cloudrun.zip -d rotation-lab && cd rotation-lab && bash deploy.sh
   ```
5. Responder lo que pregunta el script:
   - **¿Activar el modo con IA?** `s` o `n`. Con `n` se publica solo la página (sin IA, todo funciona igual).
   - **Nombre del modelo:** el del punto 3 de arriba.
   - **Clave de Gemini:** pegarla y Enter. No se ve en pantalla. Solo la pide la primera vez.
   - Si pregunta por crear un repositorio de **Artifact Registry**, responder `Y`.
6. Al final muestra: `Listo. Dirección pública: https://…run.app`. **Pasarle esa dirección a Claude** para que la pruebe.

## Volver a publicar después de un cambio

1. En esta computadora, Claude rearma el paquete (`python _work/build_deploy_zip.py`) y sube `VERSION` en `app/sw.js`.
2. En Cloud Shell: subir el `.zip` nuevo y repetir el paso 4. La clave ya guardada se reutiliza.

## Si algo falla

Copiar el mensaje de error completo y pasárselo a Claude. Los más probables:

| Mensaje | Qué hacer |
|---|---|
| `billing account ... not found` / `must be enabled` | Vincular la facturación al proyecto (Facturación → Administrar) |
| `PERMISSION_DENIED` durante la compilación | Falta un permiso de la cuenta que compila; pasarle a Claude el texto exacto |
| La página abre pero el asistente dice "La IA no respondió" | Ver los registros: Cloud Run → rotation-lab → Registros. Buscar `IA no disponible: gemini 4xx`. 403 = la clave no tiene permiso para esa API; 404 = nombre de modelo equivocado |
| `Secret ... permission denied` | Volver a correr `bash deploy.sh`: el script asigna el permiso de lectura del secreto |

## Qué queda protegido

- **La clave** vive en Secret Manager y la lee solo el servidor; nunca llega a la página ni al código.
- **La IA** solo responde a la propia página (otros sitios reciben 403), con un límite de 20 mensajes por minuto por persona y mensajes de hasta 300 caracteres. No se registra lo que escribe el productor.
- **La IA no calcula nada:** solo reescribe la frase; los números salen del motor de la app. Si falla, la app vuelve sola al modo sin IA.
- La página tiene una política de seguridad de contenido (solo carga scripts propios y se conecta solo a NASA POWER y NASA GIBS).

## Para apagar todo después de la competencia

Cloud Run → seleccionar `rotation-lab` → Eliminar. Y en Secret Manager, eliminar `gemini-api-key`. También conviene revocar la clave en la consola donde se creó.
