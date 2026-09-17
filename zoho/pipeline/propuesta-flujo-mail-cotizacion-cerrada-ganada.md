# Propuesta: Zoho Flow — mail a Crédito y Cobranza cuando una Cotización queda Cerrada Ganada

## Estado: EN ARMADO EN SANDBOX (junto con Simón, probando en vivo en Zoho Flow)

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
  **deshabilitado**, así que no había a quién apuntar dentro del CRM. Como
  además el destinatario **no tiene acceso al CRM**, el mail tiene que traer
  todo el contenido en sí mismo (o en links públicos que no requieran login
  a Zoho) — no sirve un link que abra un registro del CRM.
- **Número de pedido "del legado"**: es el campo `Nro Pedido ERP`
  (`Nro_Pedido_ERP`) del módulo **Órdenes de venta** (`Sales_Orders`) — el
  número que vuelve del sistema legado/ERP al integrar el pedido. No existe
  un campo así en Cotizaciones.
- **Disparador del flujo**: dispara **cuando se completa el campo `Nro
  Pedido ERP`** en la Orden de venta (no apenas la Cotización pasa a Cerrada
  Ganada) — así se garantiza que el número ya esté disponible al armar el
  mail (evita mandarlo vacío si el ERP tarda en responder).
- **Alcance**: el flujo aplica **solo a la UN "Agroforestal y Jardines"**
  (confirmado que el registro existe con ese nombre exacto en
  `Unidades_de_Negocio`, id `5404724000032587452`).
- **Objetivo explícito de Simón**: que el vendedor **no tenga que hacer
  ningún trabajo manual extra** además de lo que ya hace hoy (adjuntar el
  comprobante + cerrar la venta). Cualquier paso manual nuevo (subir un
  archivo aparte, pegar un link a mano) derrota el propósito de automatizar
  esto — este punto define varias decisiones de diseño de abajo.

## Cómo se resuelve cada dato (actualizado tras probar en vivo en Zoho Flow)

| Dato pedido | Cómo se resuelve |
|---|---|
| Datos del cliente | `Nombre de Cliente` (lookup a Cuentas) de la Orden de venta → paso "Fetch account" en Flow |
| Monto del pedido | `Total general` (`Grand_Total`) de la Orden de venta (viene directo del disparador) |
| Número de pedido (legado) | `Nro Pedido ERP` de la Orden de venta (viene directo del disparador) |
| Comprobante de pago | Ver sección "Comprobante de pago" abajo — vía WorkDrive |
| Copia de la cotización | Ver sección "Copia de la cotización" abajo — vía la API nativa de Zoho (`inventory_details`) |

### Comprobante de pago — vía Zoho WorkDrive (sin trabajo extra para el vendedor)

Se descartó la idea original de "adjuntar el archivo de la sección Adjuntos
de la Cotización" porque **Zoho Flow no tiene ninguna acción para leer/traer
archivos adjuntos de un registro de CRM** (se revisó la lista completa de
acciones del conector Zoho CRM en Flow — no existe). Tampoco se puede
"pasar" un archivo de un paso a otro dentro de una Función personalizada de
Flow: los tipos de dato que puede devolver una función ahí son solo texto,
número, fecha, mapa, lista y booleano — no hay tipo "archivo".

La salida (probada en vivo con Simón): en la Cotización, botón **"Adjuntar"**
de la lista relacionada "Archivos adjuntos" → opción **"Zoho WorkDrive"** →
**"+ Nuevo" → "Cargar archivos"**. Esto le permite al vendedor subir el
archivo desde su computadora **exactamente como hace hoy** (mismos clics),
solo que en vez de guardarse en el almacenamiento propio de Zoho CRM, el
archivo queda guardado en **Zoho WorkDrive** — y de paso sigue apareciendo
en "Archivos adjuntos" de la Cotización como siempre.

Para que el flujo pueda encontrar el archivo solo (sin que nadie pegue un
link a mano), se necesitan 2 convenciones:

1. **Carpeta fija compartida** en WorkDrive (no la carpeta personal "My
   Folders" de cada vendedor) — por ejemplo **"Comprobantes de Pago -
   Ventas"** — para que el flujo sepa siempre dónde buscar.
2. **Nombre de archivo con el número de Cotización o de Pedido**, por
   ejemplo `COT-REN-4250 - Comprobante.pdf` — el flujo usa el conector de
   **Zoho WorkDrive** en Flow (aparte del de CRM) para buscar el archivo por
   ese nombre y generar su link público.

**Pendiente**: Simón tiene que crear esa carpeta compartida de equipo en
WorkDrive y confirmar el nombre exacto para usarlo en la búsqueda del flujo.
También falta confirmar en Zoho Flow que existe un conector de Zoho WorkDrive
con una acción de búsqueda de archivo por nombre + generación de link
público.

### Copia de la cotización — vía la API nativa de Zoho (sin exportar nada a mano)

Se investigó en la documentación oficial de Zoho CRM (API v8) y existe un
mecanismo nativo para esto, sin necesidad de que nadie exporte el PDF a
mano: la **Send Mail API** (`POST /crm/v8/Quotes/{id}/actions/send_mail`)
acepta un parámetro `inventory_details` que genera y adjunta el PDF de la
Cotización automáticamente, usando la plantilla de inventario (Inventory
Template) configurada:

```json
"inventory_details": {
    "inventory_template": {
        "id": "<ID de la plantilla de inventario a usar>",
        "name": "<nombre de la plantilla>"
    },
    "paper_type": "A4",
    "view_type": "portrait"
}
```

Esto significa que el **envío del mail final no se puede armar con las
acciones genéricas de "Enviar correo" de Flow** (esas no soportan esto) —
tiene que hacerse llamando a esta API directo, desde una **Función
personalizada (Deluge)** dentro del flujo, usando `invokeurl`. Esa misma
función puede armar y mandar el mail completo (destinatario, asunto, cuerpo
con los datos del cliente/monto/número de pedido, y el link del comprobante
de WorkDrive) en un solo paso — ya no hace falta un paso aparte de "Enviar
correo" del conector genérico.

Fuentes:
- [Send Mail API | Zoho CRM API | V8](https://www.zoho.com/crm/developer/docs/api/v8/send-mail.html)
- [Send Mail from Inventory Module | Zoho CRM REST APIs (Postman)](https://www.postman.com/zohocrmdevelopers/zoho-crm-developers/request/lra198z/send-mail-from-inventory-module)

**Pendiente**: identificar el `id` de la plantilla de inventario (Inventory
Template) que usan hoy para Cotizaciones de Agroforestal y Jardines, para
poder ponerlo en el código.

## Diseño del flujo en Zoho Flow (estado actual, en armado)

> Nota: crear flujos en Zoho Flow **no está entre las herramientas
> conectadas a esta sesión** (el MCP conectado es solo de Zoho CRM — mismo
> límite que ya existe con Reglas de flujo, Blueprints y Procesos de
> aprobación). Esta guía se está armando a mano, en vivo, junto con Simón.

1. **Disparador**: Zoho CRM → **"Updated module entry"** → módulo **Órdenes
   de venta**. Este conector no tiene un disparador específico por campo,
   así que el filtrado se hace con los "Criterios de filtro" del propio
   disparador (ya armado y probado en el Sandbox):
   - `UN` equals `Agroforestal y Jardines`
   - AND `Nro Pedido ERP` is not empty
   - AND `Aviso Crédito y Cobranza Enviado` is false (ver campo de control
     abajo)
2. **Campo de control** (ya creado en Sandbox): casilla booleana **"Aviso
   Crédito y Cobranza Enviado"** en Órdenes de venta, sin marcar por
   defecto. Evita que el mail se repita si alguien vuelve a editar esa
   Orden de venta más adelante (el disparador es genérico "cualquier
   edición", no "campo específico actualizado").
3. **Fetch account**: trae los datos de la Cuenta relacionada
   (`${trigger.Account_Name}` como ID) — ya armado y probado.
4. **Fetch module entry** (módulo Cotizaciones): trae el registro de la
   Cotización relacionada, usando el campo **"Entry Id"** con el valor
   dinámico del campo "Nombre de Cotización" del disparador — ya armado y
   probado.
5. **(Pendiente de armar)** Paso del conector **Zoho WorkDrive**: buscar el
   archivo del comprobante por nombre (carpeta fija + nombre con el número
   de Cotización/Pedido) y obtener su link público.
6. **(Pendiente de armar)** **Función personalizada (Deluge)**: arma y manda
   el mail final llamando a la Send Mail API de Zoho CRM sobre el registro
   de la Cotización, con:
   - `to`: `caraya@emaresa.cl`
   - `subject`/`content`: datos del cliente, monto, número de pedido, y el
     link de WorkDrive del comprobante
   - `inventory_details`: adjunta automáticamente el PDF de la Cotización
7. **(Pendiente de armar)** Al final, **Update record** sobre la Orden de
   venta: tilda `Aviso Crédito y Cobranza Enviado` para que no se repita.

## Caminos descartados (para no repetir la investigación)

- **Adjuntar el comprobante desde "Archivos adjuntos" del CRM directo**:
  descartado, no existe acción en Flow para leerlos (ver arriba).
- **Función personalizada devolviendo un archivo**: descartado, el tipo de
  dato "archivo" no existe como retorno de Función personalizada en Flow.
- **Fetch inventory template**: no sirve para esto — trae el diseño/molde
  de la plantilla, no el PDF ya armado de un registro puntual.
- **Link que abre la Cotización en el CRM** (en vez de adjuntar el
  archivo): descartado, el destinatario **no tiene acceso al CRM**.
- **Subida manual duplicada a WorkDrive con campos de texto para pegar
  links a mano**: descartado, le agrega trabajo manual al vendedor en vez
  de sacárselo — contradice el objetivo explícito de Simón.

## Puntos a probar en Sandbox antes de pasar a Producción

1. Que el disparador con las 3 condiciones dispara una sola vez por Orden
   de venta.
2. Que el conector de Zoho WorkDrive en Flow puede buscar un archivo por
   nombre dentro de una carpeta fija y generar su link público.
3. Que la Función personalizada con `invokeurl` a la Send Mail API funciona
   con la conexión de Zoho CRM del Sandbox, adjunta el PDF de la Cotización
   correctamente vía `inventory_details`, y llega el mail con todo el
   contenido.

## Por qué no se aplica nada desde esta sesión

Zoho Flow no es parte del alcance del MCP conectado (solo Zoho CRM: registros
y metadata, sin acceso a Flow, Reglas de flujo, Blueprints ni Procesos de
aprobación). Simón lo está armando a mano en el Sandbox, en vivo, con guía
paso a paso en cada pantalla.
