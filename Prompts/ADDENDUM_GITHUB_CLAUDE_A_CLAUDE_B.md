# ADDENDUM: GITHUB, CONTROL DE VERSIONES Y COLABORACIÓN ENTRE CLAUDE A Y CLAUDE B

## Objetivo

Además de trabajar en la carpeta local:

`D:\Nasa Space challenge apps`

debes configurar y mantener un repositorio GitHub que permita colaborar a Claude A y Claude B.

GitHub será el punto central de respaldo, sincronización, control de versiones, revisión e integración del proyecto.

**La carpeta local seguirá siendo el espacio de trabajo principal. GitHub no la sustituye.**

Este documento complementa el prompt maestro del proyecto NASA Space Apps Challenge. No reemplaza sus objetivos, criterios científicos, arquitectura ni responsabilidades.

---

## 1. Arquitectura de colaboración

Utilizaremos **un único repositorio principal compartido** por ambos Claude. No crees dos repositorios independientes que puedan terminar conteniendo versiones incompatibles del producto.

Nombre sugerido:

`nasa-space-apps-2026`

Estructura de ramas:

- `main`: versión estable e integrada del proyecto.
- `claude-a`: trabajo de Claude A (dirección, arquitectura, producto e integración).
- `claude-b`: trabajo de Claude B (investigación de datos NASA, ciencia, procesamiento y motor de decisión).
- `feature/<nombre>`: ramas temporales para funcionalidades específicas, cuando sea conveniente.

Cada Claude debe utilizar su propia cuenta o integración autorizada de GitHub. Ambos deben trabajar sobre el mismo repositorio, pero no deben editar simultáneamente los mismos archivos sin coordinación.

**No presupongas que tienes acceso a GitHub, que estás autenticado o que puedes crear repositorios.** Comprueba primero qué herramientas y permisos tienes. Si falta autorización, explica al usuario exactamente qué debe conectar, autorizar o configurar. Nunca solicites contraseñas, tokens privados ni claves secretas en el chat.

## 2. Primera tarea: inspeccionar el proyecto antes de modificarlo

Antes de ejecutar comandos Git o cambiar archivos:

1. Inspecciona `D:\Nasa Space challenge apps` y comprende su estructura.
2. Identifica el código, documentación, recursos, archivos de configuración y avances existentes.
3. Lee el prompt maestro, las notas de reuniones, los perfiles de jurados y los documentos relevantes disponibles.
4. Comprueba si la carpeta ya es un repositorio Git.
5. Si ya existe un repositorio remoto, identifica su URL y estado; no lo reemplaces.
6. Comprueba si hay cambios locales sin confirmar. No los descartes ni los sobrescribas.
7. Identifica archivos sensibles, credenciales, claves API, archivos privados, datos personales y archivos pesados que no deban subirse.

No inicialices un repositorio nuevo ni cambies el remoto hasta verificar que no existe una configuración previa que deba conservarse.

## 3. Configuración del repositorio

Si el usuario todavía no ha creado el repositorio:

- Recomienda crear un repositorio privado inicialmente, salvo que el equipo decida explícitamente hacerlo público.
- Utiliza el nombre `nasa-space-apps-2026`, si está disponible.
- Añade a los colaboradores autorizados.
- Configura `main` como rama predeterminada.
- Configura protección de `main` si el plan y las herramientas disponibles lo permiten.
- Evita publicar información sensible, credenciales, datos personales o archivos innecesarios.

Si tienes permiso para crear y configurar el repositorio mediante una integración disponible, puedes hacerlo después de confirmar que estás trabajando en la carpeta correcta y que no existe ya un remoto válido. Si no tienes ese permiso, proporciona instrucciones precisas para que el usuario lo haga.

## 4. Archivos que deben mantenerse sincronizados

El repositorio debe incluir, cuando correspondan, estos documentos compartidos:

- `README.md`: descripción, objetivo, instalación y ejecución.
- `docs/PROJECT_CHARTER.md`: objetivo, alcance, usuarios y propuesta de valor.
- `docs/ARCHITECTURE.md`: arquitectura técnica y componentes.
- `docs/DECISION_LOG.md`: decisiones importantes, razones y consecuencias.
- `docs/TASK_BOARD.md`: tareas, responsables, estado y prioridades.
- `docs/TEAM_TASKS.md`: responsabilidades y entregables de todos los integrantes.
- `docs/CLAUDE_B_HANDOFF.md`: instrucciones y contexto de transferencia entre Claude A y B.
- `docs/NASA_DATA_RESEARCH.md`: fuentes NASA, variables, cobertura, limitaciones y metodología.
- `docs/TEST_PLAN.md`: escenarios, resultados, errores y pruebas pendientes.
- `.gitignore`: exclusión de archivos locales, temporales y sensibles.
- `.env.example`: nombres de variables necesarias, con valores ficticios o vacíos; nunca secretos reales.

No crees documentos duplicados si ya existen equivalentes. Primero inspecciona y actualiza los existentes.

## 5. Reglas de trabajo para Claude A

Claude A es responsable de la dirección general, arquitectura, experiencia del producto, integración y coordinación.

Debe:

1. Trabajar principalmente en la rama `claude-a`.
2. Revisar periódicamente los cambios de `claude-b`.
3. Definir interfaces, contratos y formatos de datos antes de integrar módulos desarrollados por separado.
4. Mantener actualizados `PROJECT_CHARTER.md`, `ARCHITECTURE.md`, `DECISION_LOG.md` y `TASK_BOARD.md`.
5. Revisar que las contribuciones de Claude B sean compatibles con la arquitectura.
6. Integrar cambios mediante pull requests o un proceso de revisión equivalente.
7. No sobrescribir el trabajo de Claude B para resolver conflictos sin analizar primero las diferencias.
8. Mantener `main` en un estado estable y ejecutable.

Claude A debe dejar instrucciones claras y verificables para Claude B en `CLAUDE_B_HANDOFF.md`.

## 6. Reglas de trabajo para Claude B

Claude B es responsable de la investigación científica y agronómica relacionada con los datos NASA, su procesamiento y el motor de decisión.

Debe:

1. Trabajar principalmente en la rama `claude-b`.
2. Leer `README.md`, `ARCHITECTURE.md`, `TASK_BOARD.md` y `CLAUDE_B_HANDOFF.md` antes de comenzar una tarea.
3. Respetar los contratos, interfaces y formatos acordados por Claude A.
4. Documentar las fuentes de datos NASA y otras fuentes científicas utilizadas.
5. Diferenciar claramente datos observados, datos derivados, estimaciones y supuestos.
6. Documentar cobertura espacial y temporal, resolución, unidades, limitaciones e incertidumbre de cada fuente relevante.
7. Añadir pruebas para los módulos de procesamiento y decisión que desarrolle.
8. Registrar resultados, limitaciones y decisiones metodológicas.
9. No modificar la arquitectura general ni archivos de interfaz compartidos sin coordinarlo con Claude A.
10. Entregar sus cambios mediante commits claros y pull requests, o el mecanismo de integración acordado.

Claude B no debe asumir que Claude A conoce automáticamente sus avances. Debe documentarlos en GitHub.

## 7. Protocolo obligatorio antes de trabajar

Al iniciar cada sesión:

1. Comprueba la carpeta de trabajo.
2. Comprueba el repositorio remoto y la rama actual.
3. Ejecuta una revisión del estado de Git.
4. Consulta los cambios recientes y las instrucciones compartidas.
5. Sincroniza tu rama con el remoto sin descartar cambios locales.
6. Lee las tareas asignadas y confirma qué archivos puedes modificar.
7. Si hay cambios ajenos sin integrar, conflictos o una rama desactualizada, resuelve la situación de forma segura antes de editar.

No ejecutes operaciones destructivas como `reset --hard`, `clean -fd`, eliminación de ramas o sobrescritura forzada del remoto sin autorización explícita del usuario.

No hagas `push --force` sobre `main`, `claude-a` o `claude-b`.

## 8. Protocolo de commits y sincronización

Cada unidad de trabajo debe quedar registrada con commits pequeños y descriptivos.

Ejemplos:

- `feat: add NASA climate data ingestion`
- `feat: implement crop rotation evaluation`
- `fix: handle missing precipitation values`
- `test: add drought scenario validation`
- `docs: document agricultural data sources`
- `refactor: separate decision engine from interface`

Antes de subir cambios:

1. Revisa exactamente qué archivos cambiaron.
2. Comprueba que no se incluyan secretos, archivos temporales o datos privados.
3. Ejecuta las pruebas pertinentes.
4. Verifica que la aplicación siga funcionando en la medida que permita el entorno.
5. Resume los cambios en el mensaje del commit.
6. Sube los cambios únicamente a tu rama de trabajo.

Después de subir cambios, informa:

- Rama utilizada.
- Hash o identificador del commit.
- Archivos principales modificados.
- Pruebas ejecutadas y sus resultados.
- Problemas conocidos.
- Qué debe revisar el otro Claude.

No afirmes que un cambio fue subido, sincronizado, probado o integrado si no has comprobado que la operación terminó correctamente.

## 9. Integración y prevención de conflictos

- `main` debe contener solamente versiones revisadas y estables.
- Ningún Claude debe integrar directamente cambios complejos en `main` sin revisión.
- Utiliza pull requests para integrar `claude-a` y `claude-b` en `main`.
- Antes de integrar, comprueba compatibilidad, pruebas, dependencias y documentación.
- Si ambos necesitan modificar un mismo archivo, acuerden quién lo modifica o dividan el trabajo en módulos.
- Si surge un conflicto, analiza las dos versiones y conserva la intención funcional de ambas. No elijas automáticamente una versión.
- Después de cada integración, actualiza las instrucciones de transferencia y el tablero de tareas.

## 10. Trabajo de los compañeros humanos

GitHub también debe permitir que los compañeros del equipo contribuyan y que sus aportaciones sean verificables.

Crea o actualiza `docs/TEAM_TASKS.md` con responsables, tareas, fechas, entregables y criterios de aceptación.

Como mínimo:

**Compañero 1 — Investigación agronómica**
- Investigación documentada sobre cultivos y rotaciones relevantes.
- Fuentes confiables y referencias verificables.
- Datos agronómicos necesarios para evaluar las rotaciones.
- Criterios de evaluación y justificación científica.
- Entrega de un documento que pueda incorporarse al repositorio.

**Compañero 2 — Pruebas y demostración**
- Escenarios de prueba realistas.
- Registro de errores y resultados.
- Evidencias reproducibles de las pruebas.
- Evaluación de usabilidad.
- Guion de demostración y lista de mejoras.

Las contribuciones deben incorporarse mediante commits o pull requests cuando sea posible, o quedar documentadas con claridad en el repositorio. No deben ser tareas decorativas o sin impacto en el resultado.

## 11. Seguridad y privacidad

- Nunca subas claves API, tokens, contraseñas, archivos `.env` reales ni credenciales.
- Incluye `.env` y otros archivos sensibles en `.gitignore`.
- Usa variables de entorno y un `.env.example` sin secretos.
- No publiques datos personales ni documentos privados de los integrantes.
- Revisa los archivos antes de cada commit y antes de hacer público el repositorio.
- Si detectas un secreto que ya fue subido, informa al usuario y recomienda revocarlo o rotarlo; eliminarlo del último commit no garantiza que haya desaparecido del historial.

## 12. Continuidad entre las dos cuentas de Claude

Las cuentas de Claude no comparten automáticamente conversaciones, memoria ni contexto.

Por eso, GitHub y los documentos del repositorio deben actuar como fuente compartida de verdad.

Al finalizar cada sesión, actualiza cuando corresponda:

- `docs/TASK_BOARD.md`
- `docs/DECISION_LOG.md`
- `docs/CLAUDE_B_HANDOFF.md`
- La documentación específica del módulo trabajado.

El documento de transferencia debe indicar:

1. Qué se completó.
2. Qué está en progreso.
3. Qué falta.
4. Qué archivos se modificaron.
5. En qué rama y commit están los cambios.
6. Cómo ejecutar y probar el trabajo.
7. Qué decisiones se tomaron.
8. Qué problemas o riesgos siguen abiertos.
9. Qué debe hacer el otro Claude a continuación.

## 13. Informe obligatorio al terminar la configuración

Cuando termines la configuración inicial, presenta un informe que indique:

- Ruta local utilizada.
- URL del repositorio GitHub.
- Si el repositorio es privado o público.
- Rama actual y ramas creadas.
- Estado de sincronización.
- Archivos de documentación creados o actualizados.
- Permisos que faltan, si los hay.
- Pasos que debe realizar el usuario o el otro Claude.

Si no puedes completar alguna operación por falta de permisos, no simules que la completaste. Explica el bloqueo y proporciona el siguiente paso concreto.

## 14. Regla final

El objetivo no es simplemente tener una copia del proyecto en GitHub. El objetivo es que Claude A, Claude B y los integrantes humanos puedan colaborar sobre una única base de trabajo, conservar un historial verificable, evitar pérdidas de información e integrar sus aportaciones de forma ordenada.

**Prioriza siempre la integridad del proyecto, la trazabilidad de los cambios y la coordinación del equipo por encima de la velocidad de hacer commits.**
