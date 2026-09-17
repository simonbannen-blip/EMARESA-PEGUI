# Propuesta: Zoho Flow — mail a Crédito y Cobranza cuando una Cotización queda Cerrada Ganada

## Estado: LISTO PARA ARMAR EN ZOHO FLOW

## Qué se pidió

Que cuando una Cotización se cierre como **Ganada**, se mande automáticamente
un mail con:

1. Datos del cliente
2. Monto del pedido
3. Copia del comprobante de pago
4. Número del pedido (del legado / ERP)
5. Copia de la cotización

## Decisiones ya confirmadas con Simón

- **Destinatario**: `caraya@emaresa.cl` (persona de Crédito y Cobranza, fuera
  del CRM). Se usa este correo fijo en la acción de envío, **no** un usuario
  de Zoho — de paso evita el problema real que se encontró: el único usuario
  del CRM con el rol "Encargado de Crédito y Cobranza" (Marco Lagos) está
  **deshabilitado**, así que no había a quién apuntar dentro del CRM.
- **Comprobante de pago**: se sube hoy como **Adjunto en la Cotización**
  (sección Adjuntos del registro `Quotes`). El flujo lo toma de ahí.
- **Número de pedido "del legado"**: es el campo `Nro Pedido ERP`
  (`Nro_Pedido_ERP`) del módulo **Órdenes de venta** (`Sales_Orders`) — el
  número que vuelve del sistema legado/ERP al integrar el pedido. No existe
  un campo así en Cotizaciones.
- **Disparador del flujo**: en vez de disparar apenas la Cotización pasa a
  Cerrada Ganada, Simón pidió disparar **cuando se completa el campo `Nro
  Pedido ERP`** en la Orden de venta — así se garantiza que el número ya
  esté disponible al armar el mail (evita mandarlo vacío si el ERP tarda en
  responder).

## Por qué el disparador es la Orden de venta y no la Cotización

Al confirmar una Cotización como Cerrada Ganada (transición "Confirmar la
Cotización" del Plan de acción, ver nota de memoria 2026-07-30), se dispara
la función **"SB Crear Orden de Venta"**, que genera el registro en
**Órdenes de venta** y arranca la integración con el ERP. El campo `Nro
Pedido ERP` vive en ese registro y se completa cuando el ERP responde — no
necesariamente en el mismo instante en que la Cotización cambió de fase. Por
eso el flujo se ancla a ese campo, no a la fase de la Cotización.

> Importante: esto significa que el flujo **no cubre el camino "Ganada por
> B2b"** (la transición alternativa de Construcción que, a propósito, **no**
> crea Orden de venta ni llama al ERP — ver nota 2026-07-30). Si más adelante
> se necesita el mismo aviso para ese camino, hay que diseñarlo aparte (no
> hay Orden de venta ni Nro Pedido ERP para anclarse).

## Origen de cada dato en el mail

| Dato pedido | Campo / fuente |
|---|---|
| Datos del cliente | `Nombre de Cliente` (lookup a Cuentas) de la Orden de venta → datos del registro de Cuenta relacionado (nombre, dirección, contacto, etc.) |
| Monto del pedido | `Total general` (`Grand_Total`) de la Orden de venta |
| Comprobante de pago | Archivo adjunto en la Cotización relacionada (`Nombre de Cotización` → lookup a `Quotes`) — se toma de la sección Adjuntos de ese registro |
| Número de pedido (legado) | `Nro Pedido ERP` (`Nro_Pedido_ERP`) de la Orden de venta — el mismo campo que dispara el flujo |
| Copia de la cotización | PDF de la Cotización relacionada (`Nombre de Cotización`) |

## Diseño del flujo en Zoho Flow

> Nota: crear flujos en Zoho Flow **no está entre las herramientas
> conectadas a esta sesión** (el MCP conectado es solo de Zoho CRM — mismo
> límite que ya existe con Reglas de flujo, Blueprints y Procesos de
> aprobación). Esta sección es la guía para armarlo a mano.

1. **App / módulo**: Zoho CRM → Órdenes de venta (`Sales_Orders`).
2. **Disparador (Trigger)**: "Field Updated" / "Campo actualizado" sobre
   `Nro Pedido ERP` — para que dispare una sola vez, cuando ese campo pasa
   de vacío a tener valor (no en cada edición posterior de la Orden de
   venta).
3. **Búsqueda de datos relacionados** (acciones "Get Record" / "Buscar
   registro" del conector de Zoho CRM, encadenadas después del disparador):
   - Obtener la **Cuenta** relacionada (vía `Nombre de Cliente`) → datos del
     cliente.
   - Obtener la **Cotización** relacionada (vía `Nombre de Cotización`) →
     necesaria para el PDF y el comprobante.
   - Obtener los **Adjuntos** de esa Cotización (acción "List Attachments" /
     "Listar adjuntos" del conector CRM) → identificar el archivo del
     comprobante de pago.
4. **Adjuntar la Cotización como PDF**: el conector estándar de Zoho CRM en
   Flow no siempre trae una acción directa de "exportar a PDF". Si no
   aparece, la alternativa es un paso de **Función Deluge** (Zoho Flow
   permite agregar una tarea de función) que llama a la API de CRM para
   generar/enviar el PDF de la Cotización, o usar la acción del conector que
   corresponda si Zoho ya la agregó (revisar el listado de acciones
   disponibles al armar el paso — puede variar entre orgs).
5. **Acción final — Enviar correo**: conector de correo (Zoho Mail / Email
   genérico):
   - **Para**: `caraya@emaresa.cl`
   - **Asunto**: sugerido "Cotización Ganada — Pedido {{Nro Pedido ERP}} —
     {{Nombre de Cliente}}"
   - **Cuerpo**: datos del cliente + monto (`Total general`) + número de
     pedido (`Nro Pedido ERP`)
   - **Adjuntos**: el archivo de comprobante de pago (obtenido en el paso 3)
     + el PDF de la Cotización (paso 4)

## Puntos a probar en Sandbox antes de pasar a Producción

1. Que el disparador por "campo actualizado" (`Nro Pedido ERP`) efectivamente
   dispara una sola vez y no se repite en ediciones posteriores de la Orden
   de venta.
2. Que la acción de adjuntos de Zoho Flow puede tomar el archivo específico
   subido como comprobante de pago (si hay más de un adjunto en la
   Cotización, definir cómo identificarlo — por nombre de archivo, por ser
   el más reciente, etc. — Simón tiene que decidir esa convención con el
   equipo que sube el comprobante).
3. Que la acción de generar/adjuntar el PDF de la Cotización funciona con
   las acciones disponibles del conector CRM en esta org (paso 4 arriba).

## Por qué no se aplica nada desde esta sesión

Zoho Flow no es parte del alcance del MCP conectado (solo Zoho CRM: registros
y metadata, sin acceso a Flow, Reglas de flujo, Blueprints ni Procesos de
aprobación). Simón tiene que armar el flujo a mano siguiendo esta guía,
idealmente probándolo primero en el Sandbox.
