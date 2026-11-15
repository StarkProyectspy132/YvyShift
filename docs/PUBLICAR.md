# Cómo publicar la app y obtener la URL

La app es estática: la carpeta `app/` completa es el sitio. No hay que compilar nada ni configurar claves.

Esta computadora no tiene `git` instalado y Claude no tiene acceso a ninguna cuenta de hosting, así que este paso lo hace una persona del equipo. Lleva entre 2 y 15 minutos.

> Actualizado el 15-nov-2026: el modo con IA (Gemini) se quitó de la app, así que ya no hace falta Google Cloud ni `server/ai-proxy/`. La opción recomendada es Netlify Drop. `docs/PUBLICAR_GOOGLE_CLOUD.md` y `entrega/rotation-lab-cloudrun.zip` quedan obsoletos.

## Opción A (recomendada): Netlify Drop (2 minutos, sin git)

Paquete listo: `entrega/yvyshift-app.zip` trae solo la carpeta `app/` limpia (sin `config.js`). Descomprimirlo y arrastrar la carpeta `app` que queda adentro.

1. Entrar a https://app.netlify.com/drop e iniciar sesión (cuenta gratuita).
2. Arrastrar la carpeta `app` (la carpeta entera, no su contenido suelto) a la página.
3. Netlify devuelve una URL del tipo `https://nombre-al-azar.netlify.app`.
4. En "Site configuration" se puede cambiar el nombre, por ejemplo `yvyshift-py`.

Para actualizar después de un cambio: pestaña "Deploys" y arrastrar la carpeta `app` otra vez.

## Opción B: GitHub Pages (15 minutos)

Conviene si la entrega pide un repositorio público, que es lo habitual en Space Apps.

1. Crear un repositorio público nuevo en GitHub, por ejemplo `yvyshift`. Recomendado: nuevo, y no el de Federico, que tiene una clave de OpenWeather en el historial.
2. Subir el contenido del proyecto. Sin git: botón "Add file" → "Upload files" y arrastrar `app/`, `docs/`, `tests/`, `data/`, `README.md` y `.gitignore`.
3. **No subir:** `server/ai-proxy/`, `tests/aiproxy.test.js`, `docs/MODO_IA.md`, `app/config.js` (restos del modo IA retirado), el video `.mp4` (4 GB), la carpeta `Jurados/`, `_work/`, ni la transcripción de la reunión (`Meet - ... .md`), que tiene conversaciones del equipo.
4. En el repositorio: Settings → Pages → Source: "Deploy from a branch" → rama `main`, carpeta `/ (root)` → Save.
5. La URL queda como `https://USUARIO.github.io/yvyshift/app/`.

## App instalable y sin conexión (PWA)

La web ya se puede instalar y usar sin internet (archivos `manifest.webmanifest`, `sw.js` y carpeta `icons/`). Condiciones:

- **Tiene que servirse por HTTPS**, como hacen Netlify, GitHub Pages y Firebase. Abierta con doble clic (`file://`) funciona normal, pero no se instala ni se guarda en el dispositivo.
- La primera visita debe hacerse **con conexión**: ahí se guardan los 18 archivos (unos 950 KB).
- **Cada vez que vuelvan a publicar**, cambien `VERSION` en `app/sw.js` (hoy es `yvy-v16`; la próxima, `yvy-v17`). Si no, los teléfonos pueden seguir mostrando la versión vieja.
- En el teléfono, el navegador ofrece "Instalar app" (el botón de la barra superior aparece solo cuando el navegador lo permite).

## Comprobar antes de entregar

Abrir la URL en una ventana privada y en un teléfono, y revisar:

- [ ] Carga la portada y el encabezado dice **YvyShift**.
- [ ] En Rotation Lab aparece la «Lente NASA» y el botón «Ver solo los datos NASA» cambia el texto y el ranking.
- [ ] El pie muestra la escala (56 × 62 km) y la declaración de uso de Claude.
- [ ] Se ven las dos imágenes satelitales en la sección 4.
- [ ] El botón "English" cambia todo el texto.
- [ ] "Copiar enlace a este resultado" genera un enlace que abre el mismo resultado.
- [ ] Al tocar el mapa de la sección 1 y pulsar "Descargar datos", llegan datos de NASA POWER (tarda hasta un minuto).
- [ ] En la sección 4, al elegir otro enero carga la imagen de NASA GIBS.
- [ ] En el teléfono no hay que desplazarse de costado.
- [ ] Instalar la app desde el navegador del teléfono, poner el modo avión y abrirla: debe mostrar el aviso "Sin conexión" y seguir funcionando.

Después, pegar la URL en `README.md`, en `docs/PROJECT_PAGE_EN.md` y en el formulario de entrega.

## Plan B para la demo

Si falla internet: abrir `app/index.html` con doble clic. Todo funciona con la caché, salvo la descarga en vivo.
