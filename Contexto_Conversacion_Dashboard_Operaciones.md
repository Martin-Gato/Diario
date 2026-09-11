# Contexto de trabajo — Dashboard de Operaciones (Power BI)

> Pega este documento al inicio de la conversación de mañana para retomar exactamente donde nos quedamos, sin tener que repetir todo el análisis.

## 1. Objetivo de la tarea

Mi jefe me entregó un dashboard de Power BI (`DashBoard_Operaciones.pbix`) y me pidió agregar cosas nuevas. Antes de tocar nada, quiero **entender toda la lógica existente** (tablas, transformaciones, reglas de negocio) para poder actualizarlo con confianza, sin romper nada. Recién me lo dieron (llevo pocos días con él).

## 2. Restricción clave que cambia todo el enfoque

El `.pbix` es un **reporte con conexión en vivo** a un dataset publicado en el servicio de Power BI (tiene un `DatasetId` remoto). Esto significa:
- Las páginas y visuales **sí están** en el archivo (se pudieron extraer del JSON del reporte).
- Las **medidas DAX y transformaciones Power Query NO están** en el archivo — viven en el dataset remoto, al cual **no tengo acceso y no me lo van a dar**.
- Estrategia adoptada: **reconstrucción por evidencia** — cruzar lo que se ve en el reporte contra exports reales de las tablas fuente de Business Central, en vez de leer el código fuente del modelo.

Fuente de datos subyacente: **Business Central** (Navision), con una capa de interfaz custom llamada **"Onest"** que gestiona el flujo de pedidos.

## 3. Mapa del dashboard (6 páginas)

| Página | Qué muestra | Tablas principales |
|---|---|---|
| Panel Principal | Pipeline general de pedidos | Sales Header, Customer, Salesperson_Purchaser |
| Surtido | Mismo pipeline a nivel de detalle (piezas, monto, artículo) | + Sales Line, Item |
| Surtido Histórico | Dias_Surtido promedio/máximo por canal | Sales Header Archive_1/2, Interface entries, Pedidos enviados |
| Tiempo Total Histórico | **Tiene un bug confirmado** (ver sección 6) | igual que arriba |
| Indicador Diario | Introduce `ID_Sts` (semáforo de cumplimiento) | Sales Header, Sales Line, Customer, Item |
| Analítico Tiempos | Patrones de día/hora de carga de pedidos | Interface entries, Sales Header Archive_1, Pedidos enviados |

## 4. Piezas de lógica — YA CONFIRMADAS (con evidencia de datos reales)

### 4.1 Status Ped vs. Status Onest
Es el mismo pedido visto en dos ejes:
- **Status Ped**: ¿ya se mandó a surtir? → Abierto → Lanzado (Pend x Aut = excepción de autorización).
- **Status Onest**: ¿en qué parte del flujo completo está? → 01 Abierto → 02 Por Liberar → 04 Por Facturar → 05 Facturado / 06 Cancelado.

### 4.2 ID_Sts (semáforo On Time / Warining / Delay) — CONFIRMADO CON DATOS
**Regla de negocio:** el pedido tiene 2 días naturales para ser surtido desde que se lanza.

**Fórmula real (validada con 282 registros, 0 excepciones):**
- `Fecha Surtido` es una **fecha objetivo/compromiso** (no la fecha real de surtido), probablemente `Fecha creación + 2 días naturales`.
- `ID_Sts` compara esa fecha objetivo contra **HOY**:
  - Fecha objetivo ya pasó y el pedido sigue sin resolver → **Delay**
  - Fecha objetivo es **hoy** → **Warining** (así, con ese typo, tal cual lo escribe el sistema)
  - Fecha objetivo es **futura** → **On Time**
- Importante: es un campo **dinámico** — cambia solo con el paso del tiempo, sin que nada más en el pedido cambie.

### 4.3 Dias_Surtido — CONFIRMADO CON DATOS
Flujo real de 3 momentos:
1. `Order Date` (Sales Header) — se crea el pedido.
2. Marca `LineNo = -1` en **Interface entries** — el pedido queda listo para facturar/embarcar (solo aparece una vez existe la factura).
3. Primer evento **"actualización en docto de envío"** en **Log Interface Onest-BC** — el embarque real.

**Validado con 34 pedidos con las 3 marcas de tiempo enlazadas:** promedio de 2.29 días de `Order Date` al evento de envío (mín 0.45, máx 4.67) — coincide con la regla de 2 días.

**Bono:** de 1,401 pedidos analizados en Interface entries, **90 (6.4%)** tuvieron al menos un error de interfaz en la marca "-1" (mensajes como *"record locked by another user"*, *"remisión ya procesada"*). Este es el indicador de "envíos detenidos por algún problema" que el negocio pidió auditar — ya se puede calcular.

### 4.4 No_Series
Confirmado: cada prefijo (V-PED-EXP, V-PED-IND, V-PED-PDROP, etc.) = canal de venta de origen del pedido.

### 4.5 Interface entries — mecanismo
Ya está en el modelo actual (no falta agregarla). `LineNo = -1` = evento a nivel de documento (no de línea). `Interface Msg_` vacío = todo bien; con texto = hubo un problema puntual.

## 5. Pendiente — BLOQUEADO (no seguir intentando deducir por datos)

### Enviado (Completo / Incompleto)
Se probaron 3 hipótesis contra 20 pedidos reales y **ninguna cuadró consistentemente**:
- ❌ `Shipping Advice` (campo estándar BC) — vino en 0 para los 20 casos.
- ❌ `Ship` / `Status` de encabezado — no distingue (hay "Incompletos" idénticos a "Completos" en estos campos).
- ❌ `Completely Shipped` + comparación de cantidades en Sales Line — resultados contradictorios (pedidos "Incompletos" con 100% de cantidad ya embarcada, y viceversa).

**Conclusión:** probablemente es un campo que se escribe una sola vez en el momento del evento de embarque (del lado de la interfaz Onest BC) y luego queda fijo — no se recalcula en vivo sobre las cantidades actuales.

**Acción pendiente:** preguntar directamente a quien administra la extensión/interfaz de Business Central en qué evento se escribe este campo y con qué regla. Dejar de intentar reverse-engineering por datos aquí.

## 6. Bugs detectados en el dashboard actual (reportar, no solo documentar)

1. **"Tiempo Total Histórico" usa la tabla incorrecta.** Calcula Dias_Surtido/Dias envio desde `Sales Header Archive` en vez de `Interface entries` (la fuente correcta, confirmada en 4.3). Los números que muestra hoy esa página probablemente están mal.
2. **Desfase de 6 horas entre logs.** Al cruzar Interface entries (marca "-1") contra Log Interface Onest-BC (evento de envío), el evento de envío aparece *exactamente* 6 horas antes que la marca de "factura lista" en el 100% de los 34 casos — imposible en la realidad. Es casi seguro un desfase de zona horaria (UTC vs. hora local México, UTC-6) entre las dos tablas de log, no un problema de proceso. Hay que normalizar antes de calcular tiempos exactos con ambas fuentes.

## 7. Inventario completo de tablas identificadas

| Tabla | Uso |
|---|---|
| Sales Header | Encabezado del pedido: fechas, cliente, estatus |
| Sales Line | Detalle: artículo, cantidad, monto |
| Sales Header Archive_1 / _2 | Pedidos cerrados/históricos |
| Sales Invoice Header | Facturas |
| Customer | Cliente |
| Item | Catálogo de artículos |
| Salesperson_Purchaser | Vendedor / Gerente de Zona |
| Interface entries | Eventos del proceso de interfaz (marca -1, errores) |
| Pedidos enviados | Tabla especial con hora/día de carga (probable tabla calculada) |
| Change Log Entry | Auditoría de cambios/eliminaciones a nivel de registro (BC) — **no está en el pbix actual**, mencionada por el negocio |
| Log Interface Onest-BC | Log de texto libre del proceso Onest — **no está en el pbix actual**, usada para validar Dias_Surtido |

## 8. Archivos que ya compartí para este análisis (por si hay que volver a consultarlos)

- `DashBoard_Operaciones.pbix` (el reporte original)
- Capturas de las 6 páginas del dashboard
- `sales_header.csv` (dos versiones: muestra inicial + todas las de septiembre, ~427 registros)
- `sales_line.csv`
- `CHANGE_LOG_ENTRY.csv`
- `data.csv` (20 pedidos con campo `Enviado` para probar hipótesis)
- `indicador_diario.csv` (282 registros, usado para confirmar `ID_Sts`)
- `INTERFACE_ENTRIES.csv` (24,122 registros)
- `Sales_invoice_Header.csv`
- `LOG__INTERFACE_ONEEST-BC.csv` (108,394 registros)

## 9. Entregable ya generado

Documento formal **`Hallazgos_Dashboard_Operaciones.docx`** con todo lo de arriba en formato presentable, para compartir con mi jefe si hace falta.

## 10. Próximos pasos (lo que sigue mañana)

1. **Aún no sé cuál es el cambio específico** que me pidieron agregar/actualizar — hay que definirlo con mi jefe antes de construir nada nuevo.
2. Una vez que sepa el cambio puntual, contrastarlo contra este mapa para saber exactamente qué tablas/campos hay que tocar (probablemente no se necesite replicar el 100% del modelo, solo la parte relevante).
3. Pendiente de conseguir la definición real del campo `Enviado` (sección 5) — preguntar a IT/administrador de la interfaz Onest BC.
4. Evaluar si conviene pedir acceso mínimo de solo lectura ("Build permission") al dataset en el workspace de Power BI Service, en vez de seguir reconstruyendo todo por evidencia.
5. Si se libera acceso a `Change Log Entry` y `Log Interface Onest-BC` de forma más completa, se puede afinar aún más la fórmula de `Dias_Surtido` y corregir el bug de zona horaria con precisión.
