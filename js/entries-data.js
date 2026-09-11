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
  {
    id: "propuesta-data-lakehouse-02",
    dateStart: "2026-09-09",
    dateEnd: "2026-09-09",
    project: "Propuesta de Data Lakehouse y Diagnóstico de Fuentes de Datos",
    tags: [
      "Data Lakehouse",
      "Azure",
      "AWS",
      "Arquitectura de Datos",
      "CDC",
      "Gobierno de Datos",
      "Vikunja",
      "Gestión de Proyectos",
      "Documentación",
    ],
    summary:
      "Con el diccionario de datos de la API de ventas como base, redacté la propuesta formal de un Data Lakehouse corporativo para consolidar las seis fuentes de datos de la empresa, preparé la plantilla que usaré en las reuniones de diagnóstico con cada responsable de fuente, y monté un tablero Kanban en Vikunja para dar seguimiento a las tareas de este y otros proyectos.",
    tasks: [
      "Redacté la propuesta de Data Lakehouse corporativo: resumen ejecutivo, contexto actual, objetivo del proyecto, evaluación de plataforma, recomendación, arquitectura de alto nivel y plan de acción inmediato.",
      "Identifiqué y documenté las seis fuentes de datos relevantes para el negocio (ERP, portal de ventas, CRM, portal de devoluciones, sistema de supervisión y monitoreo), con su motor de base de datos y ubicación actual conocida.",
      "Comparé dos rutas de implementación (AWS vs. la suscripción empresarial de Azure ya existente) sobre diez criterios: costo de arranque, fuentes ya en la nube, conectividad, formato de tabla lakehouse, ingesta CDC, consulta SQL, predicciones, IA generativa, detección de anomalías, gobierno de datos y curva de aprendizaje del equipo.",
      "Formulé una recomendación (construir sobre la cuenta empresarial de Azure existente) condicionada a dos validaciones pendientes: costo mensual real de la suscripción y confirmación de que no hay una razón estratégica para preferir otro proveedor.",
      "Diseñé la plantilla de diagnóstico de bases de datos a usar en la reunión con cada responsable de fuente, con 7 categorías (estructura y modelo de datos, volumen y crecimiento, reglas de negocio, calidad de datos, viabilidad de CDC, acceso/seguridad y consumidores actuales) más un rastreador de acceso de solo lectura por fuente.",
      "Configuré un tablero Kanban en Vikunja para llevar el control de las tareas específicas de cada proyecto o desarrollo, incluyendo el plan de acción de esta propuesta.",
    ],
    findings: [
      "La empresa ya opera una suscripción empresarial en Azure donde residen al menos dos de las seis fuentes (portal de ventas y posiblemente el CRM); esto inclina la recomendación hacia Azure (Delta Lake / Data Factory / Azure OpenAI) aunque el diseño técnico original se había planteado sobre AWS (Iceberg / Glue / Bedrock), el estándar de facto en lakehouse abierto.",
      "Detecté que la lógica de negocio detrás de los reportes actuales reside hoy principalmente en el conocimiento del jefe directo, y que no existe todavía un inventario formal de accesos ni visibilidad completa de qué reportes se alimentan de cada fuente — ambos son riesgos a mitigar antes de migrar cualquier fuente.",
      "El plan de acción quedó explícitamente repartido por responsable (yo, TI, jefe directo) para no bloquear el proyecto en una sola persona: desde migrar la API de extracción a la cuenta empresarial, hasta validar conectividad de red hacia ERP, Hostgate y Supabase.",
    ],
    pending: [
      "Migrar la API de extracción actual de la cuenta personal de Azure a la cuenta empresarial.",
      "Solicitar a TI el costo mensual desglosado de la suscripción empresarial de Azure y el inventario de recursos existentes.",
      "Agendar con el jefe directo y TI las reuniones de diagnóstico por fuente usando la plantilla creada hoy, empezando por solicitar el acceso de solo lectura de cada una.",
      "Confirmar con el jefe directo el mapa de reportes actuales y las reglas de negocio detrás de cada uno.",
      "Validar la conectividad de red disponible hacia ERP, Hostgate y Supabase (accesos actualmente cerrados).",
      "Con base en el costo real y las validaciones anteriores, cerrar la elección definitiva de plataforma (Azure vs. AWS) con el jefe directo.",
      "Terminar de cargar en Vikunja las tareas restantes del plan de acción y del resto de proyectos en curso.",
    ],
  },
  {
    id: "dashboard-operaciones-powerbi-03",
    dateStart: "2026-09-10",
    dateEnd: "2026-09-10",
    project: "Ingeniería Inversa del Dashboard de Operaciones (Power BI)",
    tags: [
      "Power BI",
      "DAX",
      "Power Query",
      "ERP",
      "Modelado de Datos",
      "Debugging",
      "Documentación",
    ],
    summary:
      "Mi jefe me entregó un dashboard de Power BI ya existente para agregarle funcionalidad nueva. Como es un reporte con conexión en vivo a un dataset publicado en el servicio de Power BI (sin acceso a las medidas DAX ni a las transformaciones Power Query, que viven del lado del dataset remoto), reconstruí toda la lógica de negocio por evidencia: cruzando lo que se ve en el reporte contra exports reales de las tablas fuente del ERP. Confirmé 5 de 6 piezas de lógica y detecté 2 bugs existentes, documentando todo en un informe formal para mi jefe.",
    tasks: [
      "Mapeé las 6 páginas del dashboard (Panel Principal, Surtido, Surtido Histórico, Tiempo Total Histórico, Indicador Diario y Analítico Tiempos) y las tablas que alimenta cada una.",
      "Reconstruí y confirmé con datos reales la lógica de Status Ped vs. Status Onest: dos ejes distintos del mismo flujo de un pedido (si ya se mandó a surtir vs. en qué parte del flujo completo está).",
      "Validé contra 282 registros reales la fórmula del semáforo de cumplimiento (ID_Sts): compara una fecha objetivo/compromiso (creación + 2 días naturales) contra la fecha actual, sin una sola excepción en la muestra.",
      "Reconstruí y validé con 34 pedidos, enlazando 3 fuentes distintas (encabezado del pedido, tabla de eventos de interfaz y log de envío), la fórmula real de tiempo de surtido.",
      "Calculé, sobre 1,401 pedidos, la tasa de error de interfaz en el evento clave del proceso (6.4%), el indicador de envíos detenidos por algún problema que el negocio había pedido auditar.",
      "Documenté el significado de los prefijos de numeración de pedidos como identificador del canal de venta de origen.",
      "Redacté un documento formal de hallazgos para compartir con mi jefe, incluyendo una tabla resumen del estado de cada pieza de lógica investigada.",
    ],
    findings: [
      "Descubrí que la página 'Tiempo Total Histórico' calcula sus métricas de tiempo desde la tabla incorrecta, por lo que los números que muestra hoy probablemente no reflejan el proceso real.",
      "Detecté un desfase de exactamente 6 horas entre dos tablas de log del sistema, en el 100% de los 34 casos analizados — consistente con un problema de zona horaria (UTC vs. hora local) entre ambas fuentes, no con un problema de proceso.",
      "Probé tres hipótesis distintas para un campo de estatus de envío (completo/incompleto) contra 20 pedidos reales y ninguna cuadró de forma consistente; concluí que probablemente es un campo que se escribe una sola vez en el momento del evento de embarque, del lado de la interfaz personalizada que conecta los pedidos con el ERP, y luego queda fijo (no se recalcula en vivo).",
      "Aprendí que cuando un reporte de Power BI tiene conexión en vivo a un dataset remoto, no basta con abrir el archivo: si no hay acceso al modelo semántico, hay que reconstruir la lógica cruzando visuales y capturas contra exports reales de las tablas fuente.",
    ],
    pending: [
      "Definir con mi jefe cuál es el cambio específico que hay que agregar o actualizar en el dashboard antes de construir nada nuevo.",
      "Corregir la tabla fuente que usa la página 'Tiempo Total Histórico' para que use la fuente correcta de tiempos de surtido.",
      "Normalizar la zona horaria entre las dos tablas de log antes de calcular tiempos exactos con ambas.",
      "Conseguir de quien administra la interfaz personalizada la definición exacta y el evento donde se escribe el campo de estatus de envío.",
      "Evaluar solicitar acceso mínimo de solo lectura (permiso de build) al dataset publicado en el servicio de Power BI, en vez de seguir reconstruyendo todo por evidencia.",
    ],
  },
];
