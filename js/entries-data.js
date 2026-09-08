/**
 * entries-data.js
 * Aquí vive TODO el contenido del diario. No necesitas tocar HTML/CSS/JS
 * para agregar una entrada nueva: solo edita este archivo.
 *
 * CONFIG   -> tus datos personales, se muestran en la pestaña "acerca_de".
 * ENTRIES  -> un objeto por cada bloque de trabajo/proyecto documentado.
 *
 * Cómo agregar una entrada nueva:
 *   1. Copia uno de los objetos de ENTRIES.
 *   2. Cambia id (único, sin espacios), dateStart/dateEnd (YYYY-MM-DD),
 *      project, tags, summary, tasks, findings y pending.
 *   3. Guarda el archivo y recarga index.html — no hace falta nada más,
 *      la entrada aparece sola en la línea de tiempo y en las estadísticas.
 *
 * Nota: mantén este diario libre de datos sensibles de la empresa
 * (credenciales, IPs, nombres de recursos internos, clientes reales, etc).
 * Describe QUÉ hiciste y QUÉ aprendiste, no el detalle interno exacto.
 */

const CONFIG = {
  name: "Martin Alejos Martínez",
  role: "Analista de Bases de datos / Data Engineer",
  company: "Mikel's",
  startDate: "2026-09-03",
  intro:
    "Bitácora personal para documentar, día a día, el trabajo técnico realizado en mi puesto actual: proyectos, decisiones, problemas resueltos y aprendizajes.",
};

const ENTRIES = [
  {
    id: "api-extraccion-datos-01",
    dateStart: "2026-09-03",
    dateEnd: "2026-09-08",
    project: "API de Extracción de Datos (Ventas y Devoluciones)",
    tags: [
      "FastAPI",
      "Python",
      "MySQL",
      "Docker",
      "CI/CD",
      "Azure",
      "Networking",
      "Optimización SQL",
      "Seguridad",
      "Documentación",
    ],
    summary:
      "Primera semana en el puesto. Diseño, documentación y despliegue de una API REST interna para exponer un reporte combinado de ventas netas (ventas - devoluciones) desde una base de datos MySQL alojada en la nube, incluyendo su pipeline completo de contenerización y despliegue.",
    tasks: [
      "Documenté de punta a punta la arquitectura de una API REST (FastAPI) que expone catálogos y un reporte de ventas netas construido a partir de una consulta combinada (ventas + devoluciones en espejo, valores negativos) sobre una base de datos MySQL remota.",
      "Entendí y documenté el pool de conexiones a la base de datos: por qué se reutilizan conexiones abiertas en vez de crear una por request, y por qué se hace un chequeo de salud (ping + reconexión) antes de cada uso dado que la conexión es remota.",
      "Revisé el módulo que arma las consultas SQL de forma dinámica a partir de filtros (fechas, sucursal, cliente, tipo de movimiento), validando cada filtro contra una lista blanca de columnas para evitar inyección SQL.",
      "Documenté el módulo de autenticación JWT (login, emisión de token) que ya existe en el proyecto pero que hoy ningún endpoint exige todavía, dejando clara la ruta para activarlo cuando se coordine con los consumidores actuales de la API.",
      "Contenericé la aplicación con Docker usando un build multi-stage, resolviendo en el camino dos errores de build relacionados con instalación de dependencias de Python (uso incorrecto de una bandera de pip, y una forma de instalar que omitía dependencias transitivas).",
      "Configuré un flujo de integración/despliegue continuo (CI/CD) que construye la imagen y la publica en un registro de contenedores, resolviendo un problema de caché del builder que requería un paso adicional de configuración.",
      "Documenté el despliegue en un servicio de contenedores serverless en la nube, configurado para escalar a cero réplicas sin tráfico y así mantener el costo en $0 con el volumen de uso actual (con el trade-off de un cold start de 1-2s tras inactividad).",
    ],
    findings: [
      "Diagnostiqué un problema de conectividad en producción (la API respondía bien en endpoints simples pero fallaba con timeout en los que usaban base de datos) siguiendo un proceso de descarte: primero credenciales, luego firewall local de la VM, y finalmente identifiqué que el bloqueo real era una regla de red (NSG) en la nube, confirmado vía consulta WHOIS/RDAP de la IP del servidor.",
      "Aprendí por qué este tipo de problema de red no es exclusivo de un proveedor de nube: los servicios de contenedores serverless suelen salir a internet con IPs dinámicas de un pool compartido, no con una IP fija — a menos que se pague por una integración de red privada con IP de salida fija.",
      "Usé EXPLAIN sobre las consultas del reporte para analizar el plan de ejecución: encontré una tabla sin índice en la columna de fecha usada para filtrar (full table scan), y un ORDER BY + LIMIT sobre la unión completa que no podía aprovechar ningún índice (uso de archivo temporal para ordenar).",
      "Detecté una inconsistencia entre dos endpoints relacionados (el que devuelve los datos y el que devuelve el conteo total): uno de los dos no replicaba exactamente el mismo filtro en un JOIN, lo que podía causar que el conteo no coincidiera con la cantidad real de filas devueltas al filtrar por cliente.",
      "Generé un diccionario de datos completo del esquema (más de 200 tablas) mediante introspección automática de la base de datos, lo enriquecí con contexto de negocio para las tablas ya usadas por la API, y lo exporté en un formato reutilizable como base para un futuro data lakehouse.",
    ],
    pending: [
      "Confirmar con el equipo de infraestructura que la regla de red pendiente quedó aplicada correctamente.",
      "Decidir si se agregan los índices de base de datos recomendados (bajo riesgo, no cambian comportamiento).",
      "Corregir la inconsistencia encontrada entre el endpoint de datos y el de conteo.",
      "Definir cuándo se reactiva la autenticación JWT, coordinando con los consumidores actuales de la API.",
      "Seguir completando la documentación de negocio del diccionario de datos (la mayoría de las columnas todavía usa una descripción genérica o no tiene descripción).",
      "Evaluar mover el repositorio del proyecto a una cuenta/organización corporativa.",
      "Rotar credenciales que se compartieron en texto plano durante las pruebas de esta primera semana.",
      "Empezar a diseñar, con el diccionario de datos como base, el futuro data lakehouse.",
    ],
  },
];
