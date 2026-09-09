# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

Diario de trabajo personal (bitácora) del usuario como administrador de bases de datos / ingeniero de datos en Mikel's. Es un sitio estático de una sola página con estética "Matrix" (fondo de red neuronal animado, scanlines, texto tipo terminal). No tiene backend ni build: todo el contenido vive en un array de JavaScript y se renderiza en el navegador.

## Stack y comandos

- HTML + CSS + JS vanilla, sin framework, sin bundler, sin `package.json`, sin linter ni tests.
- No hay paso de build. Para previsualizar, abre [index.html](index.html) directamente en el navegador (doble clic o `start index.html` / `Invoke-Item index.html`), o sírvelo con cualquier servidor estático simple (ej. `python -m http.server`) si necesitas evitar restricciones de `file://`.
- No ejecutes `npm install` ni introduzcas dependencias/tooling nuevo sin avisar primero al usuario (ver "No hagas" más abajo).

## Arquitectura

Todo el contenido y la lógica de render están separados en tres capas dentro de `js/`, cargadas en este orden desde [index.html](index.html):

1. **[js/entries-data.js](js/entries-data.js)** — única fuente de datos. Exporta dos globals:
   - `CONFIG`: datos personales que alimentan la pestaña "acerca_de" (nombre, rol, empresa, fecha de inicio, intro).
   - `ENTRIES`: array de objetos, uno por bloque de trabajo/proyecto documentado, con forma `{ id, dateStart, dateEnd, project, tags[], summary, tasks[], findings[], pending[] }`.
   - Este es el único archivo que se edita para agregar una entrada nueva al diario; no requiere tocar HTML/CSS/JS.

2. **[js/app.js](js/app.js)** — toda la lógica de render, envuelta en un IIFE con `state = { activeTags, query }`. Lee `ENTRIES`/`CONFIG` y pinta cinco piezas de UI: línea de tiempo (`renderTimeline`, clonando `<template id="entry-template">` de index.html por cada entrada), filtros por etiqueta (`renderTagFilters`), barra de estadísticas (`renderStats`), grid de habilidades acumuladas por frecuencia de tags (`renderSkills`) y la tarjeta "acerca de" (`renderAbout`). El buscador y los filtros de tag son 100% client-side sobre el array `ENTRIES` (`entryMatchesFilters`); no hay paginación ni fetch.

3. **[js/neural-network.js](js/neural-network.js)** — fondo animado independiente sobre `<canvas id="neural-bg">`. No depende de `entries-data.js` ni de `app.js`; es una simulación de nodos conectados en canvas 2D puro que reacciona a mouse/touch y respeta `prefers-reduced-motion`.

[css/style.css](css/style.css) contiene todo el estilado (tema Matrix/terminal vía variables CSS, scanlines, glitch del título, tarjetas de entrada, tabs).

Las pestañas (`01_bitacora`, `02_habilidades`, `03_acerca_de`) son secciones `<section class="tab-panel">` alternadas por clase `is-active`, sin routing ni recarga de página.

## Cómo agregar una nueva entrada al diario

Esta es la tarea recurrente más común en este repo. Sigue el flujo documentado en el encabezado de [js/entries-data.js](js/entries-data.js):

1. Copia uno de los objetos existentes en `ENTRIES`.
2. Cambia `id` (único, sin espacios), `dateStart`/`dateEnd` (`YYYY-MM-DD`), `project`, `tags`, `summary`, `tasks`, `findings` y `pending`.
3. Guarda y recarga `index.html` — la entrada aparece sola en la línea de tiempo, filtros y estadísticas; no hace falta tocar nada más.
4. Mantén el diario libre de datos sensibles de la empresa (credenciales, IPs, nombres de recursos internos, clientes reales, etc). Describe QUÉ se hizo y QUÉ se aprendió, no el detalle interno exacto.

Cuando el usuario pida crear una nueva entrada, pregúntale primero qué archivos debes tomar como contexto para esa entrada específica (suele haber `.docx`, `.ipynb` o `.pdf` sueltos en la raíz del repo con la documentación de un proyecto — ej. [Documentacion_Proyecto_API_LIDEX.ipynb](Documentacion_Proyecto_API_LIDEX.ipynb)/`.html`). Los `.docx` no son legibles con la herramienta Read; hay que descomprimirlos (son ZIP) y extraer el texto de `word/document.xml`. Valida cualquier dato que venga de esos archivos antes de usarlo en la entrada.

## No hagas

- No instales dependencias ni introduzcas tooling (bundler, framework, linter) sin avisar.

## Flujo de trabajo

- Antes de una tarea no trivial, propón un plan y espera el OK del usuario.
- Una tarea a la vez; al terminar, indica qué cambiaste para que se revise.
- Si no estás seguro al 80%, pregunta. No inventes.
