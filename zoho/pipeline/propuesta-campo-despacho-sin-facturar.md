# Propuesta: campo y flujo "Despacho sin Facturar"

## Estado: PROPUESTO — a la espera de tu OK antes de aplicar nada en el Zoho real

## Qué se pidió

Un campo nuevo que marque los **pedidos** (Órdenes de venta) que requieren la
modalidad **"Despacho sin Facturar"** — despachar la mercadería antes de
emitir la factura. Requisitos del pedido:

1. Que quede marcado con un campo/indicador claro.
2. Que **no se pueda usar libremente**: tiene que pasar primero por
   **autorización del Gerente**, y recién después **se informa** (a
   logística/despacho, para que sepan que ese pedido va sin factura).
3. Que viajen junto con el pedido los **tipos de cambio y tipo de moneda**
   con que se generó la venta.
4. Que quede **auditoría**: quién autorizó y cuándo.
5. Es para la unidad de negocio **Construcción**, y posiblemente otras UN
   más adelante.

## Lo que encontré revisando el CRM

### 1. Ya existe en esta org un mecanismo idéntico para "autorización de
   Gerente con auditoría" — no hay que inventar nada nuevo

Revisé los campos de **Cotizaciones** y **Órdenes de venta** (que es el
módulo de "Pedidos" — confirmado por el campo `Nro Pedido ERP`) y esta org
**ya usa exactamente este patrón** para otras aprobaciones existentes
(Descuento, Sobreprecio, Cambio de Forma de Pago, Cartera de Cliente,
Venta Rental, Venta sobre $10 millones, etc.). Por cada tipo de aprobación
hay siempre el mismo grupo de campos:

| Rol del campo | Ejemplo ya existente en Cotizaciones | Tipo |
|---|---|---|
| Marca/gatillo de la aprobación | `Aprobaci_n_Sobreprecio` | Casilla de verificación |
| Resultado de la aprobación | `Aprobado_por_Sobreprecio` | Casilla de verificación |
| **Auditoría — cuándo** | `Fh_hora_Aprobador_Forma_de_Pago` (ej. de Forma de Pago) | Fecha/Hora |
| **Auditoría — quién** | `Aprobador_Forma_de_Pago` | Usuario (lookup) |

Y para el rechazo hay dos campos **genéricos** compartidos entre todos los
tipos de aprobación: `Fecha_hora_Rechazo_Aprobaci_n` y
`Usuario_Rechaza_Aprobaci_n`.

Esto ya resuelve el punto 4 del pedido (auditoría de quién y cuándo): la
propuesta de abajo es **replicar el mismo patrón**, no crear algo distinto,
para que se vea y funcione igual que las demás aprobaciones que el equipo
ya conoce.

### 2. El tipo de cambio y la moneda ya viajan con el pedido — no hace falta
   crear campos nuevos para eso

Tanto **Cotizaciones** como **Órdenes de venta** (y Oportunidades) ya
tienen estos 3 campos estándar/custom, con los mismos datos en los tres
módulos:

| Campo (label) | api_name | Tipo |
|---|---|---|
| Moneda | `Currency` | Lista desplegable (campo estándar Zoho) |
| Tasa de cambio | `Exchange_Rate` | Numérico decimal (campo estándar Zoho) |
| Cotización de Moneda | `Cotizaci_n_de_Moneda` | Numérico decimal (custom) |

Como ya están en el pedido (Orden de venta) y en la Cotización de la que
se genera, **el punto 3 del pedido ya está cubierto**: no hace falta crear
nada nuevo para que "viajen" el tipo de cambio y la moneda — el Gerente ya
los va a ver en el mismo registro al momento de autorizar. Lo único que
conviene chequear es que estos 3 campos estén visibles en el layout que ve
el Gerente al aprobar (ver Paso 4 de la guía).

### 3. Dónde conviene poner la marca: en la Cotización, no solo en la Orden
   de venta

Según la cronología que ya tengo mapeada de esta org (ver `memory.md`,
2026-07-30 y 2026-08-12), la Orden de venta **no se crea a mano**: nace
automáticamente cuando una Cotización pasa por el Plan de acción (Blueprint)
de Cotizaciones, en la transición **"Confirmar la Cotización"**, que llama
después a la función **"SB Crear Orden de Venta"**.

Por eso la marca "Despacho sin Facturar" tiene que poder elegirse **desde
la Cotización** (donde trabaja el vendedor, antes de que exista la Orden de
venta), y la autorización del Gerente tiene que pasar **antes** de que esa
transición cree la Orden de venta — así el pedido nunca llega a despacho
sin haber pasado por el Gerente. El dato aprobado se copia después a la
Orden de venta ya creada (mismo mecanismo que hoy usan `Currency` /
`Exchange_Rate`, que existen en ambos módulos).

### 4. Con qué UN restringirlo

Confirmé que **Construcción** existe como registro en el módulo
`Unidades_de_Negocio` (junto con Rental, Industria y Ferretería, Ferretek,
Ematerra, etc.). No hay un campo que limite estructuralmente el uso del
campo a una UN — la restricción se hace a nivel de **criterio en el Plan de
acción** (Blueprint), igual que se hizo antes con "Ganada por B2b"
(exclusiva de Construcción) o con ocultar "Generar Cotización" para
Ferretek.

## Propuesta de campos nuevos

Mismo patrón que ya usa esta org (ver punto 1), aplicado a **Cotizaciones**
y **Órdenes de venta** (mismos 4 campos en los dos módulos, para que el dato
quede también en el pedido ya creado):

| Campo (label) | api_name propuesto | Tipo | Quién lo completa |
|---|---|---|---|
| Despacho sin Facturar | `Despacho_sin_Facturar` | Casilla de verificación | Vendedor/a — marca que este pedido necesita la modalidad |
| Aprobado Despacho sin Facturar | `Aprobado_Despacho_sin_Facturar` | Casilla de verificación | Gerente — autoriza |
| Fh/hora Aprob. Despacho sin Facturar | `Fecha_hora_Aprob_Despacho_sin_Facturar` | Fecha y hora | Se completa solo (automático) al aprobar |
| Aprobador Despacho sin Facturar | `Aprobador_Despacho_sin_Facturar` | Usuario (lookup) | Se completa solo (automático) con quien aprobó |

Para el rechazo no hace falta crear campos nuevos: se puede reusar
`Fecha_hora_Rechazo_Aprobaci_n` / `Usuario_Rechaza_Aprobaci_n`, que ya son
genéricos para cualquier tipo de aprobación en Cotizaciones.

**Estos 8 campos (4 en Cotizaciones + 4 en Órdenes de venta) los puedo crear
yo directo** con las herramientas conectadas a esta sesión — pero es un
cambio en el Zoho real, así que según la regla de `CLAUDE.md` espero tu OK
antes de crearlos.

## Propuesta del flujo de autorización ("pasa por Gerente, después se
informa")

Esto sí requiere tocar el **Plan de acción (Blueprint)** de Cotizaciones, y
crear/editar Botones y una Regla de flujo de trabajo — ninguna de esas tres
cosas está entre las herramientas conectadas al MCP (mismo límite ya
documentado con Motivo de Pérdida, Segmento Cliente, Sucursales, etc.), así
que esta parte la armás vos en el Sandbox siguiendo la guía.

1. **Gatillo**: cuando el vendedor marca `Despacho sin Facturar` en la
   Cotización, esta debería pasar (o quedar bloqueada) hasta que un Gerente
   marque `Aprobado Despacho sin Facturar`. La forma más simple y
   consistente con lo que ya existe en esta org: agregar como **campo
   obligatorio** en la transición **"Confirmar la Cotización"** (la que crea
   la Orden de venta) una condición del tipo:
   - Si `Despacho sin Facturar` = Sí → exigir `Aprobado Despacho sin
     Facturar` = Sí para poder avanzar.
   Mismo mecanismo ya usado para exigir el Motivo de Pérdida al cerrar una
   Oportunidad como perdida (ver
   `zoho/pipeline/propuesta-flujo-motivo-perdida-en-oportunidades.md`).
2. **Quién puede aprobar**: restringir quién puede tildar `Aprobado
   Despacho sin Facturar` a los Perfiles **Gerente** y **Gerente de UN**
   (ya existen en esta org, ver `memory.md` 2026-08-10). Se puede hacer con
   permisos de campo por Perfil (solo esos dos Perfiles con permiso de
   edición sobre ese campo), sin necesidad de tocar el Plan de acción para
   esto.
3. **Alcance por UN**: agregar el criterio `UN es Construcción` a la
   condición de arriba, dejándolo armado para sumar más UN fácilmente
   después con un `O` (ej. `UN es Construcción O UN es Rental`) el día que
   confirmes cuáles otras UN lo van a usar — no hace falta esperar a tener
   la lista completa para arrancar con Construcción.
4. **"Luego se informa"**: una Regla de flujo de trabajo sobre Cotizaciones
   (mismo mecanismo que `Notificar Gerente Rental` / `Notificar jefe zona
   centro Rental`, ver `memory.md` 2026-08-12), disparada cuando `Aprobado
   Despacho sin Facturar` pasa a Sí, que mande una notificación por correo
   a quien vos definas (ej. Despacho/Logística, y quien administre el envío
   al ERP) con los datos clave del pedido: Cliente, Nº de Cotización/Orden,
   Moneda, Tasa de cambio, y quién/cuándo autorizó.
   - Falta que me confirmes el/los destinatarios de este aviso.
5. **Nota sobre "Ganada por B2b"**: esa transición (exclusiva de
   Construcción, ver `memory.md` 2026-07-30) **no** llama a "SB Crear Orden
   de Venta", o sea que una Cotización que pase por ahí no genera Orden de
   venta. Si "Despacho sin Facturar" tiene que aplicar también a ese camino,
   avisame — hay que replicar el mismo control ahí, no solo en "Confirmar
   la Cotización".

## Guía paso a paso: primero en Sandbox, después en Producción

### Paso 0 — Entrar al Sandbox

Arriba a la derecha, en el nombre de la organización, elegí **Sandbox**.

### Paso 1 — Crear los 4 campos en Cotizaciones

Configuración (⚙️) → Personalización → Módulos y Campos → **Cotizaciones**
→ Nuevo Campo, uno por uno, con los nombres y tipos de la tabla de arriba.
Agregalos al layout cuando Zoho te lo pida.

### Paso 2 — Crear los mismos 4 campos en Órdenes de venta

Igual que el Paso 1, pero en el módulo **Órdenes de venta**.

### Paso 3 — Ajustar la función "SB Crear Orden de Venta"

Esta función (Deluge) es la que crea la Orden de venta desde la Cotización.
Hay que sumarle el mapeo de los 4 campos nuevos (y confirmar que ya copia
`Currency` / `Exchange_Rate` / `Cotización de Moneda`, que deberían estar
desde antes). Esto **no lo puedo revisar ni editar yo** — no hay tool en el
MCP conectado para ver/editar Funciones — pedile a quien mantenga esa
función (o revisala vos en Configuración → Automatización → Funciones) que
agregue esas 4 líneas de mapeo.

### Paso 4 — Restringir quién edita "Aprobado Despacho sin Facturar"

Configuración (⚙️) → Personalización → Módulos y Campos → Cotizaciones →
click en el campo `Aprobado Despacho sin Facturar` → Permisos de campo por
Perfil → dejar edición habilitada solo para **Gerente** y **Gerente de
UN** (de solo lectura o sin acceso para el resto). Aprovechá para revisar
en el mismo paso que `Moneda`, `Tasa de cambio` y `Cotización de Moneda`
estén visibles en la sección donde se muestra el resto de los datos de
aprobación.

### Paso 5 — Agregar la condición en el Plan de acción de Cotizaciones

Configuración (⚙️) → Automatización → Planes de acción (Blueprint) →
Cotizaciones → transición **"Confirmar la Cotización"** → agregá como
campo obligatorio en esa transición: `Aprobado Despacho sin Facturar`,
con criterio `Despacho sin Facturar ES Sí` Y `UN ES Construcción` (podés
sumar más UN con `O` cuando confirmes cuáles).

### Paso 6 — Armar la Regla de flujo de trabajo de aviso

Configuración (⚙️) → Automatización → Reglas de flujo de trabajo →
Cotizaciones → regla nueva:

1. Disparador: al editar un registro, campo `Aprobado Despacho sin
   Facturar` cambia a Sí.
2. Acción: Notificación por correo (Alerta de correo) a los destinatarios
   que definas, con los datos del pedido.
3. Guardar y activar.

### Paso 7 — Probar en el Sandbox

1. Creá/editá una Cotización de prueba de UN Construcción.
2. Marcá `Despacho sin Facturar`.
3. Intentá avanzar por "Confirmar la Cotización" sin aprobar: debería
   pedirte `Aprobado Despacho sin Facturar` como obligatorio.
4. Con un usuario que tenga Perfil Gerente o Gerente de UN, tildá la
   aprobación y confirmá que `Fh/hora Aprob.` y `Aprobador` se completan
   solos, y que llega el correo de aviso.
5. Confirmá con un usuario Vendedor que **no puede** tildar la aprobación
   (por los permisos de campo del Paso 4).
6. Avanzá la transición y verificá que la Orden de venta se crea con los
   4 campos ya copiados (Paso 3).

### Paso 8 — Pasar de Sandbox a Producción

Configuración (⚙️) → Sandbox → Implementar en Producción, marcando los 8
campos nuevos, el ajuste de la función, los permisos de campo, la
condición del Plan de acción y la Regla de flujo de trabajo.

## Pendiente para poder cerrar la propuesta

1. Confirmar destinatario(s) del aviso "luego se informa" (Paso 6).
2. Confirmar si además de Construcción ya hay otra(s) UN definida(s), o si
   arrancamos solo con Construcción y se suma después.
3. Confirmar si "Despacho sin Facturar" tiene que estar disponible también
   en el camino "Ganada por B2b" (ver nota 5 más arriba).
4. Tu OK para que yo cree directo los 8 campos (Paso 1 y 2) en el ambiente
   conectado a esta sesión — el resto (función, permisos, Plan de acción,
   Regla de flujo) lo tenés que armar vos en el Sandbox, no está entre mis
   herramientas conectadas.
