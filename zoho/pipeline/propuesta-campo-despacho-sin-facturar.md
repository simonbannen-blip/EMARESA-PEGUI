# Propuesta: campo y flujo "Despacho sin Facturar"

## Estado: LISTO PARA ARMAR EN SANDBOX — diseño confirmado por vos, lo armás
vos mismo siguiendo la guía (no lo aplico yo)

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

Pediste que **no los cree yo**, que te diga cómo armarlos vos mismo — la
guía de abajo (Pasos 1 y 2) tiene el paso a paso para crear estos 8 campos
a mano en el Sandbox.

## Propuesta del flujo de autorización — versión definida por vos
(2026-08-13, actualizado)

Nos diste el paso a paso concreto de cómo tiene que funcionar. Lo traduzco
a los mecanismos de Zoho que le corresponden a cada punto:

1. **"Abrir ventana check para evitar errores"** → un botón/transición
   nuevo en el Plan de acción de Cotizaciones, ej. **"Solicitar Despacho
   sin Facturar"**, configurado con **Campos obligatorios en la
   transición** — es la función nativa de Zoho Blueprint que abre una
   ventana emergente pidiendo confirmar/completar datos antes de dejar
   ejecutar la transición (mismo mecanismo que ya usa esta org para exigir
   Orden de Compra/HES en "Ganada por B2b", o el Motivo de Pérdida al
   perder una Oportunidad). Ahí se lista lo que hay que revisar antes de
   pedir la modalidad: como mínimo el propio campo `Despacho sin
   Facturar`, y de paso `Moneda` / `Tasa de cambio` si querés que quede
   confirmado en el mismo paso.
2. **"Al aceptar esta ventana tilda check un campo nuevo en paralelo a
   aprobación al gerente"** → al confirmar esa ventana, la transición hace
   dos cosas **a la vez**, no una detrás de la otra:
   - (a) marca sola el campo `Despacho sin Facturar` = Sí (queda pedido,
     sin que nadie lo tipee aparte).
   - (b) manda la Cotización a un estado de espera de aprobación del
     Gerente (sub-fase, punto 3). El campo se tilda en el momento de
     aceptar la ventana — no espera a que el Gerente resuelva; lo que sí
     queda pendiente de resolver es el estado de aprobación.
3. **"Crear subfase de cotización aprobada/rechaza despacho sin
   facturar"** → dos estados nuevos en el Plan de acción de Cotizaciones:
   **"Desp. sin Facturar — Aprobado"** y **"Desp. sin Facturar —
   Rechazado"**. La Cotización entra primero a una sub-fase intermedia
   **"Desp. sin Facturar — Pendiente"** (destino de la transición del
   punto 1) y desde ahí el Gerente resuelve con dos transiciones nuevas:
   - **Aprobar** → completa `Aprobado Despacho sin Facturar`, `Fh/hora
     Aprob.` y `Aprobador` (automáticos), destino "Desp. sin Facturar —
     Aprobado".
   - **Rechazar** → usa los campos genéricos de rechazo ya existentes
     (`Fecha_hora_Rechazo_Aprobaci_n` / `Usuario_Rechaza_Aprobaci_n`),
     destino "Desp. sin Facturar — Rechazado".
   Ambas transiciones restringidas **solo al Perfil Gerente** (confirmado
   por vos — Gerente de UN no queda habilitado para esto). Desde cualquiera
   de las dos sub-fases, la Cotización se reconecta al flujo normal para
   poder seguir avanzando (ej. hacia "Confirmar la Cotización").
4. **"Al cerrar ganar que ese nuevo campo 'check' se envíe a la OV para
   llevarlo a ERP"** → al pasar por "Confirmar la Cotización" (Cerrada
   Ganada), la función "SB Crear Orden de Venta" tiene que copiar el campo
   a la Orden de venta (mismo mapeo del Paso 3 de la guía). Los campos
   `Código de Log ERP` / `Detalle de Log ERP` que ya tiene Órdenes de venta
   confirman que ya existe un canal armado desde ahí hacia el ERP — solo
   hay que sumar el campo nuevo a ese envío existente, no armar uno nuevo.
   Confirmaste el criterio: **si se aprobó, viaja `Aprobado Despacho sin
   Facturar` = Sí al ERP; si no se aprobó, la Cotización queda en la
   sub-fase "Rechazado" y no viaja nada** (y solo el Gerente puede revertir
   eso aprobando).

**Sobre el aviso ("luego se informa")**: aclaraste que no hace falta una
notificación por correo aparte — "se informa" se cumple con que el campo
`Aprobado Despacho sin Facturar` quede visible como casilla de verificación
directamente en la Cotización, para que cualquiera que la abra (logística,
despacho, etc.) vea ahí mismo si está aprobado o no. No hace falta armar
ninguna Regla de flujo de trabajo de correo para esto.

**Alcance por UN**: confirmaste que es **solo para Construcción**, sin
otras UN por ahora.

**Sobre "Ganada por B2b"**: confirmaste que es **un camino aparte** — no
hace falta replicar ahí el control de Despacho sin Facturar.

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
Perfil → dejar edición habilitada **solo para el Perfil Gerente** (de solo
lectura o sin acceso para el resto, incluido Gerente de UN). Aprovechá
para revisar en el mismo paso que `Moneda`, `Tasa de cambio` y `Cotización
de Moneda` estén visibles en la sección donde se muestra el resto de los
datos de aprobación — y que `Aprobado Despacho sin Facturar` quede visible
(aunque sea de solo lectura) para el resto de los Perfiles, ya que ese
campo visible es justamente la forma en que "se informa" (ver más arriba).

### Paso 5 — Crear la sub-fase "Pendiente" y la transición "Solicitar
Despacho sin Facturar" (la ventana check)

Configuración (⚙️) → Automatización → Planes de acción (Blueprint) →
Cotizaciones:

1. Agregá un estado nuevo: **"Desp. sin Facturar — Pendiente"**.
2. Creá una transición nueva **"Solicitar Despacho sin Facturar"**, con
   origen la fase donde hoy trabaja el vendedor (la misma desde la que
   sale "Confirmar la Cotización" u otra que definas) y destino la
   sub-fase "Desp. sin Facturar — Pendiente".
3. En **Campos obligatorios en la transición** (esta es la "ventana
   check") agregá `Despacho sin Facturar` — y de paso `Moneda` / `Tasa de
   cambio` si querés que se confirmen ahí mismo.
4. Criterio: `UN ES Construcción` (por ahora es la única UN habilitada).

### Paso 6 — Crear las sub-fases y transiciones de Aprobar / Rechazar

1. Agregá dos estados más: **"Desp. sin Facturar — Aprobado"** y
   **"Desp. sin Facturar — Rechazado"**.
2. Desde "Desp. sin Facturar — Pendiente", creá la transición
   **"Aprobar Despacho sin Facturar"**:
   - Campo obligatorio: `Aprobado Despacho sin Facturar` (Sí).
   - Destino: "Desp. sin Facturar — Aprobado".
   - Restringila **solo al Perfil Gerente** (mismo mecanismo de
     restricción por Perfil ya usado con el botón del Cotizador, ver
     `memory.md` 2026-08-10) — Gerente de UN no queda habilitado.
3. Desde la misma sub-fase, creá **"Rechazar Despacho sin Facturar"**:
   - Usa los campos genéricos de rechazo `Fecha_hora_Rechazo_Aprobaci_n` /
     `Usuario_Rechaza_Aprobaci_n` (se completan solos).
   - Destino: "Desp. sin Facturar — Rechazado".
   - Misma restricción: solo Perfil Gerente.
4. Desde ambas sub-fases nuevas, reconectá el flujo normal (agregá la
   transición correspondiente para que desde "Aprobado" — y desde
   "Rechazado" si corresponde seguir vendiendo sin la modalidad — se
   pueda seguir hacia "Confirmar la Cotización").

No hace falta armar ningún aviso por correo aparte: el campo `Aprobado
Despacho sin Facturar`, visible en la Cotización (Paso 4), ya cumple el
"se informa".

### Paso 7 — Ajustar la función "SB Crear Orden de Venta"

Sumale a esta función el mapeo de los 4 campos nuevos hacia Órdenes de
venta (y confirmá que ya copia `Currency` / `Exchange_Rate` / `Cotización
de Moneda`, que deberían estar desde antes) — así el campo llega a la OV
y sigue el canal existente hacia el ERP (`Código de Log ERP` / `Detalle de
Log ERP`). Mandá `Aprobado Despacho sin Facturar` (el resultado ya
autorizado por el Gerente) — confirmado por vos: si no se aprobó, la
Cotización queda en la sub-fase Rechazado y no se manda nada al ERP. Esto
**no lo puedo revisar ni editar yo** (sin tool de Funciones en el MCP
conectado) — pedile a quien mantenga esa función que agregue el mapeo, o
revisala vos en Configuración → Automatización → Funciones.

### Paso 8 — Probar en el Sandbox

1. Creá/editá una Cotización de prueba de UN Construcción.
2. Ejecutá "Solicitar Despacho sin Facturar": debería abrirse la ventana
   pidiendo `Despacho sin Facturar` (y Moneda/Tasa de cambio si las
   sumaste) antes de dejarte avanzar.
3. Confirmá que al aceptar, el campo `Despacho sin Facturar` queda en Sí y
   la Cotización pasa a la sub-fase "Desp. sin Facturar — Pendiente".
4. Con un usuario Vendedor o Gerente de UN (ningún Perfil salvo Gerente),
   confirmá que **no** ve disponibles las transiciones Aprobar/Rechazar.
5. Con un usuario de Perfil **Gerente**, ejecutá "Aprobar Despacho sin
   Facturar" y confirmá que `Aprobado Despacho sin Facturar`, `Fh/hora
   Aprob.` y `Aprobador` se completan solos, la Cotización pasa a "Desp.
   sin Facturar — Aprobado", y el campo queda visible (tildado) para
   cualquiera que abra la Cotización.
6. Probá también el camino "Rechazar Despacho sin Facturar" con otra
   Cotización de prueba, y confirmá que esa Cotización no puede avanzar a
   "Confirmar la Cotización" (o si puede, que el campo queda sin tildar y
   por lo tanto no viaja al ERP).
7. Avanzá una Cotización aprobada hasta "Confirmar la Cotización" y
   verificá que la Orden de venta se crea con el campo ya copiado
   (Paso 7).

### Paso 9 — Pasar de Sandbox a Producción

Configuración (⚙️) → Sandbox → Implementar en Producción, marcando los 8
campos nuevos, las 3 sub-fases y sus transiciones (Solicitar / Aprobar /
Rechazar), el ajuste de la función y los permisos de campo por Perfil.

## Resumen de lo confirmado (ya no queda pendiente)

- Restringido a la UN **Construcción** únicamente.
- Solo el Perfil **Gerente** puede aprobar/rechazar (no Gerente de UN).
- Sin aviso por correo: "se informa" se cumple con el campo visible en la
  Cotización.
- Al ERP viaja `Aprobado Despacho sin Facturar` solo cuando está en Sí; si
  queda rechazado, no se manda nada.
- "Ganada por B2b" es un camino aparte, no hay que tocarlo.
- Vos armás todo esto en el Sandbox siguiendo la guía de arriba — no lo
  aplico yo en el Zoho real.
