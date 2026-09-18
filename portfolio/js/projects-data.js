/**
 * projects-data.js
 * Contenido del Portfolio. A diferencia de entries-data.js (el Diario, que
 * documenta el trabajo día a día), aquí cada objeto es una versión curada
 * y orientada a resultado de un proyecto, pensada para mostrarse a terceros.
 *
 * Cómo agregar un proyecto nuevo:
 *   1. Copia uno de los objetos de PROJECTS.
 *   2. Cambia id, title, periodLabel, status, stack, summary y highlights.
 *   3. Guarda y recarga index.html — aparece solo en la sección de proyectos
 *      y sus tecnologías se suman solas al conteo de habilidades.
 */

const CONFIG = {
  name: "Martin Alejos Martínez",
  role: "Analista de Bases de Datos / Data Engineer",
  company: "Mikel's",
  tagline: "Construyo y documento infraestructura de datos: APIs, pipelines, dashboards y la arquitectura que los conecta.",
  email: "martinalejosmartinez@gmail.com",
  github: "https://github.com/Martin-Gato",
};

const PROJECTS = [
  {
    id: "api-extraccion-datos",
    title: "API de Extracción de Datos (Ventas y Devoluciones)",
    periodLabel: "sep 2026",
    status: "En producción",
    stack: ["FastAPI", "Python", "MySQL", "Docker", "CI/CD", "Azure"],
    summary:
      "Diseñé, documenté y desplegué una API REST interna en Mikel's que expone un reporte de ventas netas (ventas − devoluciones) desde una base de datos MySQL remota, junto con su pipeline completo de contenerización y despliegue.",
    highlights: [
      "Diagnostiqué en producción un problema de conectividad intermitente rastreando la causa hasta una regla de red en la nube, confirmada vía consulta WHOIS/RDAP de la IP del servidor.",
      "Optimicé las consultas del reporte: detecté con EXPLAIN una tabla sin índice sobre la columna de fecha (full table scan) y un ORDER BY + LIMIT que no podía usar ningún índice.",
      "Contenericé la aplicación con Docker (build multi-stage) y configuré un pipeline de CI/CD que construye, publica y despliega la imagen en un servicio serverless con auto-escalado a cero.",
      "Generé, mediante introspección automática, un diccionario de datos de más de 200 tablas como base para un futuro data lakehouse corporativo.",
    ],
  },
  {
    id: "propuesta-data-lakehouse",
    title: "Propuesta de Data Lakehouse Corporativo",
    periodLabel: "sep 2026",
    status: "Propuesta entregada",
    stack: ["Data Lakehouse", "Azure", "AWS", "Arquitectura de Datos", "CDC", "Gobierno de Datos"],
    summary:
      "Redacté para Mikel's la propuesta formal de un Data Lakehouse corporativo para consolidar seis fuentes de datos del negocio, comparando dos rutas de nube sobre diez criterios técnicos y de costo.",
    highlights: [
      "Identifiqué y documenté las seis fuentes de datos relevantes del negocio (ERP, portal de ventas, CRM, portal de devoluciones, entre otras), con su motor de base de datos y ubicación.",
      "Comparé AWS vs. la suscripción empresarial de Azure ya existente sobre diez criterios: costo de arranque, conectividad, ingesta CDC, IA generativa, gobierno de datos y curva de aprendizaje del equipo.",
      "Diseñé la plantilla de diagnóstico de bases de datos usada en las reuniones de descubrimiento con cada responsable de fuente.",
      "Monté un tablero Kanban para dar seguimiento al plan de acción del proyecto y coordinar responsabilidades entre equipos.",
    ],
  },
  {
    id: "dashboard-operaciones-powerbi",
    title: "Dashboard de Operaciones — Ingeniería Inversa y Reconstrucción (Power BI)",
    periodLabel: "sep 2026",
    status: "Cerrado y entregado",
    stack: ["Power BI", "DAX", "Power Query", "SQL", "ERP", "Modelado de Datos", "Debugging"],
    summary:
      "En Mikel's reconstruí por completo la lógica de negocio de un dashboard de Power BI con conexión en vivo a un dataset remoto (sin acceso al modelo semántico original), construí dos páginas nuevas y corregí 6 bugs de fondo preexistentes en el modelo de datos.",
    highlights: [
      "Reconstruí y validé contra datos reales del ERP 6 piezas de lógica de negocio, cruzando lo visible en el reporte contra exports de las tablas fuente.",
      "Encontré y corregí 6 bugs de fondo en el modelo: tres desfases de zona horaria, una pérdida de datos por un filtro mal diseñado, una columna huérfana que rompía el refresh completo, y una configuración que saturaba el servidor durante la actualización.",
      "Investigué a fondo un supuesto hallazgo mayor de negocio, descartando 6 hipótesis antes de encontrar la causa real (un huso horario sin corregir) y retractar formalmente el hallazgo.",
      "Construí dos páginas nuevas — auditoría de errores accionable y tendencias históricas — y cerré el proyecto con un documento formal que consolida hallazgos, código en producción y pendientes.",
    ],
  },
];
