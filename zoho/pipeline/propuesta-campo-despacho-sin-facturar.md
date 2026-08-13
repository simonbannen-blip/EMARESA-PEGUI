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

Por eso la aprobación de "Despacho sin Facturar" tiene que resolverse
**en la Cotización** (donde trabaja el vendedor, antes de que exista la
Orden de venta), y tiene que pasar **antes** de que la transición
"Confirmar la Cotización" cree la Orden de venta — así el pedido nunca
llega a despacho sin haber pasado por el Gerente. El dato aprobado se
copia después a la Orden de venta ya creada (mismo mecanismo que hoy usan
`Currency` / `Exchange_Rate`, que existen en ambos módulos).

### 4. Con qué UN restringirlo

Confirmé que **Construcción** existe como registro en el módulo
`Unidades_de_Negocio` (junto con Rental, Industria y Ferretería, Ferretek,
Ematerra, etc.). No hay un campo que limite estructuralmente el uso del
campo a una UN — la restricción se hace a nivel de **criterio en el Plan de
acción** (Blueprint), igual que se hizo antes con "Ganada por B2b"
(exclusiva de Construcción) o con ocultar "Generar Cotización" para
Ferretek.

## Propuesta de campos nuevos (versión simplificada, 2026-08-13)

Simplificaste el diseño: no hace falta un campo separado para que el
vendedor "pida" la modalidad — directamente el Gerente aprueba o rechaza,
y eso ya genera el registro. Con eso, en vez de 8 campos quedan **4**:

**En Cotizaciones (3 campos, mismo patrón de auditoría que ya usa esta
org — ver punto 1 de arriba):**

| Campo (label) | api_name propuesto | Tipo | Quién lo completa |
|---|---|---|---|
| Aprobado Despacho sin Facturar | `Aprobado_Despacho_sin_Facturar` | Casilla de verificación | Se tilda al ejecutar la transición "Aprobar" (ver flujo abajo) |
| Fh/hora Aprob. Despacho sin Facturar | `Fecha_hora_Aprob_Despacho_sin_Facturar` | Fecha y hora | Se completa solo (automático) al aprobar |
| Aprobador Despacho sin Facturar | `Aprobador_Despacho_sin_Facturar` | Usuario (lookup) | Se completa solo (automático) con quien aprobó |

Para el rechazo no hace falta crear campos nuevos: se puede reusar
`Fecha_hora_Rechazo_Aprobaci_n` / `Usuario_Rechaza_Aprobaci_n`, que ya son
genéricos para cualquier tipo de aprobación en Cotizaciones.

**En Órdenes de venta (1 campo):**

| Campo (label) | api_name propuesto | Tipo | De dónde sale |
|---|---|---|---|
| Aprobado Despacho sin Facturar | `Aprobado_Despacho_sin_Facturar` | Casilla de verificación | Se copia desde la Cotización al crear la Orden de venta — es el campo que sigue camino al ERP |

Pediste que **no los cree yo**, que te diga cómo armarlos vos mismo — la
guía de abajo (Pasos 1 y 2) tiene el paso a paso para crear estos 4 campos
a mano en el Sandbox.

## Propuesta del flujo de autorización — versión simplificada
(2026-08-13, ajustada a tu último mensaje)

Tu idea: una transición nueva "Despacho sin Facturar" que lleva a la
Cotización a la sub-fase Aprobada o Rechazada según lo que elija el
aprobador, y después el campo que quedó aprobado se manda a la Orden de
Venta. Así queda armado en Zoho:

1. **Dos transiciones, no una** (aclaración técnica importante): en Zoho
   Blueprint, cada transición tiene **un solo destino fijo** — no existe
   una transición que pregunte "¿aprobás o rechazás?" y vaya a un lugar u
   otro según la respuesta dentro de la misma ventana. Lo que sí se puede
   (y es lo que arma exactamente lo que pediste) es tener **dos botones**
   —**"Aprobar Despacho sin Facturar"** y **"Rechazar Despacho sin
   Facturar"**— disponibles al mismo tiempo sobre la Cotización, y el
   Gerente aprieta el que corresponde. Es la misma idea que "elegir cuál
   seleccionar", solo que en la práctica son dos botones en vez de uno con
   una opción adentro.
2. **Ventana check**: ambas transiciones llevan **Campos obligatorios en
   la transición** — la ventana emergente que Zoho abre antes de dejar
   ejecutar el paso, para evitar errores (mismo mecanismo que ya usa esta
   org para exigir Orden de Compra/HES en "Ganada por B2b"). En "Aprobar"
   pedí como obligatorio `Aprobado Despacho sin Facturar`; en "Rechazar" no
   hace falta pedir nada adicional (los campos de rechazo se completan
   solos).
3. **Sub-fases**: cada transición lleva a su propia sub-fase —
   **"Desp. sin Facturar — Aprobada"** o **"Desp. sin Facturar —
   Rechazada"**. Ambas transiciones restringidas **solo al Perfil
   Gerente**.
4. **Al Cerrar Ganada**, la función "SB Crear Orden de Venta" copia
   `Aprobado Despacho sin Facturar` a la Orden de venta — de ahí sigue el
   canal que ya existe hacia el ERP (`Código de Log ERP` / `Detalle de Log
   ERP`). Si quedó Rechazada, ese campo sigue en No y no se manda nada
   relevante al ERP.

**Sobre el aviso ("luego se informa")**: no hace falta una notificación
por correo aparte — se cumple con que `Aprobado Despacho sin Facturar`
quede visible como casilla directamente en la Cotización.

**Alcance por UN**: **solo Construcción**, sin otras UN por ahora.

**Sobre "Ganada por B2b"**: es un camino aparte, no hace falta replicar
ahí el control de Despacho sin Facturar.

## Guía paso a paso: primero en Sandbox, después en Producción

### Paso 0 — Entrar al Sandbox

Arriba a la derecha, en el nombre de la organización, elegí **Sandbox**.

### Paso 1 — Crear los 3 campos en Cotizaciones

Configuración (⚙️) → Personalización → Módulos y Campos → **Cotizaciones**
→ Nuevo Campo, uno por uno, con los nombres y tipos de la tabla de arriba
(`Aprobado Despacho sin Facturar`, `Fh/hora Aprob.`, `Aprobador`).
Agregalos al layout cuando Zoho te lo pida.

### Paso 2 — Crear el campo en Órdenes de venta

Igual que el Paso 1, pero en el módulo **Órdenes de venta**, solo el campo
`Aprobado Despacho sin Facturar`.

### Paso 3 — Ajustar la función "SB Crear Orden de Venta"

Esta función (Deluge) es la que crea la Orden de venta desde la Cotización.
Hay que sumarle el mapeo de `Aprobado Despacho sin Facturar` (y confirmar
que ya copia `Currency` / `Exchange_Rate` / `Cotización de Moneda`, que
deberían estar desde antes). Esto **no lo puedo revisar ni editar yo** —
no hay tool en el MCP conectado para ver/editar Funciones — pedile a quien
mantenga esa función (o revisala vos en Configuración → Automatización →
Funciones) que agregue esa línea de mapeo.

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

### Paso 5 — Crear las sub-fases "Aprobada" y "Rechazada"

Configuración (⚙️) → Automatización → Planes de acción (Blueprint) →
Cotizaciones → agregá dos estados nuevos: **"Desp. sin Facturar —
Aprobada"** y **"Desp. sin Facturar — Rechazada"**.

### Paso 6 — Crear las dos transiciones "Aprobar" / "Rechazar"

Desde la fase donde hoy está la Cotización cuando el Gerente tiene que
decidir (la que uses hoy antes de "Confirmar la Cotización"), creá:

1. **"Aprobar Despacho sin Facturar"**:
   - Campos obligatorios en la transición (la "ventana check"):
     `Aprobado Despacho sin Facturar` (que quede marcado Sí).
   - Destino: "Desp. sin Facturar — Aprobada".
   - Restringila **solo al Perfil Gerente** (mismo mecanismo de
     restricción por Perfil ya usado con el botón del Cotizador, ver
     `memory.md` 2026-08-10).
   - Criterio: `UN ES Construcción` (por ahora es la única UN habilitada).
2. **"Rechazar Despacho sin Facturar"**:
   - No hace falta pedir campos obligatorios (los de rechazo se completan
     solos: `Fecha_hora_Rechazo_Aprobaci_n` / `Usuario_Rechaza_Aprobaci_n`).
   - Destino: "Desp. sin Facturar — Rechazada".
   - Misma restricción: solo Perfil Gerente, mismo criterio de UN.
3. Desde ambas sub-fases nuevas, reconectá el flujo normal (agregá la
   transición correspondiente para que desde "Aprobada" — y desde
   "Rechazada" si corresponde seguir vendiendo sin la modalidad — se
   pueda seguir hacia "Confirmar la Cotización").

No hace falta armar ningún aviso por correo aparte: el campo `Aprobado
Despacho sin Facturar`, visible en la Cotización, ya cumple el "se
informa".

### Paso 7 — Terminar de ajustar la función "SB Crear Orden de Venta"

Confirmá que el mapeo del Paso 3 quede mandando `Aprobado Despacho sin
Facturar` a la Orden de venta — así llega y sigue el canal existente hacia
el ERP (`Código de Log ERP` / `Detalle de Log ERP`). Si la Cotización
quedó en "Rechazada", ese campo sigue en No, así que no se manda nada
relevante al ERP.

### Paso 8 — Probar en el Sandbox

1. Creá/editá una Cotización de prueba de UN Construcción, avanzála hasta
   la fase donde aparecen los dos botones nuevos.
2. Con un usuario Vendedor (Perfil distinto a Gerente), confirmá que
   **no** ve disponibles "Aprobar Despacho sin Facturar" ni "Rechazar
   Despacho sin Facturar".
3. Con un usuario de Perfil **Gerente**, ejecutá "Aprobar Despacho sin
   Facturar": debería abrirse la ventana pidiendo confirmar el check, y al
   aceptar, `Aprobado Despacho sin Facturar`, `Fh/hora Aprob.` y
   `Aprobador` se completan solos, y la Cotización pasa a "Desp. sin
   Facturar — Aprobada".
4. Probá también "Rechazar Despacho sin Facturar" con otra Cotización de
   prueba, y confirmá que pasa a "Desp. sin Facturar — Rechazada" con los
   campos de rechazo completos.
5. Avanzá la Cotización aprobada hasta "Confirmar la Cotización" y
   verificá que la Orden de venta se crea con `Aprobado Despacho sin
   Facturar` ya copiado (Paso 7).

### Paso 9 — Pasar de Sandbox a Producción

Configuración (⚙️) → Sandbox → Implementar en Producción, marcando los 4
campos nuevos, las 2 sub-fases y sus transiciones (Aprobar / Rechazar), el
ajuste de la función "SB Crear Orden de Venta".

## Resumen de lo confirmado (ya no queda pendiente)

- Diseño simplificado: sin campo separado de "pedido" del vendedor — el
  Gerente aprueba o rechaza directamente con dos botones nuevos.
- 4 campos en total (3 en Cotizaciones + 1 en Órdenes de venta), no 8.
- Restringido a la UN **Construcción** únicamente.
- Solo el Perfil **Gerente** puede aprobar/rechazar.
- Sin aviso por correo: "se informa" se cumple con el campo visible en la
  Cotización.
- Al ERP viaja `Aprobado Despacho sin Facturar` solo cuando está en Sí; si
  queda rechazado, no se manda nada.
- "Ganada por B2b" es un camino aparte, no hay que tocarlo.
- Vos armás todo esto en el Sandbox siguiendo la guía de arriba — no lo
  aplico yo en el Zoho real.
