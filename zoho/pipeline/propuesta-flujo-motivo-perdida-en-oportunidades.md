# Propuesta: recuadro de "Motivo de Pérdida" al perder una Oportunidad

## Estado: PROPUESTO — pendiente de tu OK para crear los campos, y de que
armes el recuadro en Zoho (ver limitación abajo)

## Qué se pidió

Replicar en **Oportunidades** el mismo recuadro que hoy aparece en
**Cotizaciones** cuando se marca una cotización como perdida: un
formulario que pide el motivo antes de guardar el cambio.

## Cómo funciona hoy en Cotizaciones

Revisé el módulo `Quotes` y encontré 3 campos custom, todos ligados al
layout Standard y con `blueprint_supported = true` (o sea, pensados para
usarse en el proceso guiado — Blueprint — que es justamente lo que dispara
el recuadro al cambiar de fase):

| Campo (label) | api_name | Tipo | Detalle |
|---|---|---|---|
| Motivo de Pérdida | `Motivo_de_P_rdida` | Lista desplegable | 9 opciones activas |
| Motivo de Pérdida Secundario | `Motivo_de_P_rdida_Secundario` | Lista desplegable | 26 opciones activas |
| Comentario del Motivo de Pérdida | `Comentario_del_Motivo_de_P_rdida` | Área de texto (2000 car.) | Libre |

Opciones activas de **Motivo de Pérdida**: Precio y condiciones,
Disponibilidad, Competencia, Producto, Servicio y soporte, Relación y
confianza, Requerimientos del cliente, Cliente bloqueado.

Opciones activas de **Motivo de Pérdida Secundario** (más detalladas):
Precio demasiado elevado, Precio más alto que competencia, Financiamiento
poco competitivo, Condiciones de venta/arriendo no se ajustan al cliente,
Cliente sin fondos suficientes para la compra, No contamos con stock
disponible, Plazo de entrega demasiado largo, Cliente eligió otro
proveedor, La competencia ofreció mejor financiamiento, Cliente no quiere
cambiar de proveedor, Producto no cumple necesidades del cliente, Producto
percibido como de menor calidad que la competencia, Mala reputación del
producto en el mercado, Producto sin respaldo de repuestos, Respuesta
lenta en cotización o seguimiento, Proceso comercial no cumplió con lo
esperado, Cliente solicita servicios que no ofrecemos, No existe confianza
o vínculo comercial con el cliente, Falta de asesoría o acompañamiento
técnico, Solución poco personalizada para el cliente, Necesidad muy
específica que no cubrimos, Cliente pospuso la compra/arriendo/proyecto,
Cliente pidió productos o servicio que no tenemos, Decisión afectada por
factores externos (economía, conflictos, etc.), Cliente con morosidad,
Cliente sin Línea de Crédito.

El campo de fase de Cotización (`Quote_Stage`) ya tiene la opción "Cerrada
Perdida" (`Closed Lost`). El recuadro que ves al marcar una cotización como
perdida es el popup nativo de **Blueprint** pidiendo estos 3 campos como
obligatorios para completar esa transición de fase — no es un campo
"emergente" mágico, es la pantalla que Zoho muestra automáticamente cuando
un Blueprint exige campos en una transición.

## Buena noticia: en Oportunidades ya está la mitad del camino

El campo **Fase** (`Stage`) de Oportunidades **ya tiene** la opción
"Cerrada Perdida" (`Closed Lost`) y también soporta Blueprint
(`blueprint_supported = true`). Lo único que falta es:

1. Crear los 3 campos equivalentes en Oportunidades.
2. Armar (o extender) un Blueprint en Oportunidades que pida esos 3 campos
   al pasar a la fase "Cerrada Perdida".

## Propuesta de campos a crear en Oportunidades (Deals)

Mismo criterio que en Cotizaciones — mismas opciones, para que los
reportes de motivos de pérdida se puedan comparar entre ambos negocios:

| Campo a crear | Tipo | Opciones |
|---|---|---|
| Motivo de Pérdida | Lista desplegable | Las 8 de arriba |
| Motivo de Pérdida Secundario | Lista desplegable | Las 26 de arriba |
| Comentario del Motivo de Pérdida | Área de texto (2000 car.) | Libre |

**Esta parte sí la puedo aplicar yo directo** con las herramientas
conectadas (crear campos) — pero como es un cambio en el Zoho CRM real,
según la regla que dejamos en `CLAUDE.md`, **espero tu confirmación antes
de crearlos**. Avisame "dale" o "confirmado" y los creo.

## Lo que no puedo aplicar yo: el recuadro (Blueprint)

Armar o editar un Blueprint (el proceso guiado que muestra el recuadro y
obliga a llenar los campos antes de guardar) **no está entre las
herramientas conectadas a esta sesión** — solo tengo CRUD de registros y
metadata de campos/layouts, no automatizaciones ni procesos. Esto lo tenés
que armar una vez, a mano, en Zoho. Pasos:

### Pasos en Zoho (Configuración → Automatización → Blueprint)

1. Módulo: **Oportunidades**.
2. Si Oportunidades no tiene Blueprint activo todavía: crear uno nuevo
   sobre el campo **Fase**.
3. Ubicar (o crear) la transición hacia la fase **"Cerrada Perdida"**.
4. En esa transición, en **"Campos obligatorios en esta transición"**
   (Mandatory Fields), agregar los 3 campos:
   - Motivo de Pérdida
   - Motivo de Pérdida Secundario
   - Comentario del Motivo de Pérdida
5. Guardar y publicar el Blueprint.

Con eso, cada vez que un vendedor mueva una Oportunidad a "Cerrada
Perdida" (desde el Kanban o el detalle del registro), Zoho va a mostrar el
mismo recuadro que hoy aparece en Cotizaciones, pidiendo esos 3 datos antes
de guardar.

> Si en Oportunidades ya existe un Blueprint por otro motivo, el paso es
> el mismo pero agregando esta transición/exigencia al que ya está armado,
> en vez de crear uno desde cero.

## Guía paso a paso para armarlo vos mismo: primero en Sandbox, después en Productivo

Tu Zoho tiene función de **Sandbox** (ambiente de prueba, copia de tu Zoho
real donde podés probar sin riesgo). La idea es armar todo ahí primero, y
cuando funcione bien, "desplegarlo" al Zoho de verdad con un par de clics
— sin tener que rehacer nada a mano dos veces.

### Paso 0 — Entrar al Sandbox

1. Arriba a la derecha, donde normalmente ves el nombre de tu
   organización, hacé clic ahí.
2. Vas a ver dos opciones: tu organización real (Producción) y una
   marcada como **Sandbox**. Entrá al Sandbox.
3. Vas a ver la misma interfaz de siempre, pero con un aviso/etiqueta de
   que estás en modo Sandbox — así no te confundís con el productivo.

> Si no ves la opción Sandbox, avisame y vemos si hay que activarla
> primero (según la licencia puede estar disponible pero no habilitada).

### Paso 1 — Crear los 3 campos en Oportunidades (adentro del Sandbox)

Configuración (⚙️) → Personalización → Módulos y Campos → **Oportunidades**
→ Nuevo Campo.

**Campo 1: Motivo de Pérdida**
- Tipo: Lista desplegable (Pick List)
- Nombre del campo: `Motivo de Pérdida`
- Opciones a cargar (una por línea):
  Precio y condiciones / Disponibilidad / Competencia / Producto /
  Servicio y soporte / Relación y confianza / Requerimientos del cliente /
  Cliente bloqueado

**Campo 2: Motivo de Pérdida Secundario**
- Tipo: Lista desplegable (Pick List)
- Nombre del campo: `Motivo de Pérdida Secundario`
- Opciones a cargar (26, una por línea):
  Precio demasiado elevado / Precio más alto que competencia /
  Financiamiento poco competitivo / Condiciones de venta/arriendo no se
  ajustan al cliente / Cliente sin fondos suficientes para la compra / No
  contamos con stock disponible / Plazo de entrega demasiado largo /
  Cliente eligió otro proveedor / La competencia ofreció mejor
  financiamiento / Cliente no quiere cambiar de proveedor / Producto no
  cumple necesidades del cliente / Producto percibido como de menor
  calidad que la competencia / Mala reputación del producto en el mercado
  / Producto sin respaldo de repuestos / Respuesta lenta en cotización o
  seguimiento / Proceso comercial no cumplió con lo esperado / Cliente
  solicita servicios que no ofrecemos / No existe confianza o vínculo
  comercial con el cliente / Falta de asesoría o acompañamiento técnico /
  Solución poco personalizada para el cliente / Necesidad muy específica
  que no cubrimos / Cliente pospuso la compra/arriendo/proyecto / Cliente
  pidió productos o servicio que no tenemos / Decisión afectada por
  factores externos (economía, conflictos, etc.) / Cliente con morosidad
  / Cliente sin Línea de Crédito

**Campo 3: Comentario del Motivo de Pérdida**
- Tipo: Área de texto, tamaño chico ("Small", hasta 2000 caracteres)
- Nombre del campo: `Comentario del Motivo de Pérdida`

Después de crear cada campo, Zoho te pregunta en qué vista/layout
agregarlo — elegí el layout Estándar de Oportunidades (el que usan tus
vendedores).

### Paso 2 — Armar el Blueprint (adentro del Sandbox)

Configuración (⚙️) → Automatización → **Blueprint**.

1. Módulo: **Oportunidades**. Fijate si ya existe un Blueprint activo
   sobre el campo Fase:
   - Si **no existe** ninguno: creá uno nuevo, campo base = **Fase**.
   - Si **ya existe** uno: entrá a editarlo (vas a agregar la exigencia
     ahí, sin tocar el resto).
2. Ubicá (o creá) la transición que lleva a la fase **"Cerrada Perdida"**.
3. Hacé clic en esa transición → **"Campos obligatorios en esta
   transición"** ("Mandatory Fields" / "Common Fields" según la versión).
4. Agregá los 3 campos que creaste: Motivo de Pérdida, Motivo de Pérdida
   Secundario, Comentario del Motivo de Pérdida.
5. Guardá y **publicá** el Blueprint (pasarlo de Borrador a "En vivo" /
   Live) — si queda en borrador, no se activa para nadie.

### Paso 3 — Probar en el Sandbox

1. Abrí una Oportunidad de prueba (o creá una nueva).
2. Cambiá la Fase a **"Cerrada Perdida"** (desde el Kanban arrastrando la
   tarjeta, o desde el detalle del registro).
3. Debería aparecer el recuadro pidiendo los 3 campos, igual que en
   Cotizaciones. Probá guardar sin completarlos (debería bloquear) y
   completando (debería guardar bien).

### Paso 4 — Pasar del Sandbox a Producción

Cuando ya probaste y funciona como querés:

1. Configuración (⚙️) → **Sandbox** → **Implementar en Producción**
   ("Deploy to Production" / "Migrate to Production" según la versión).
2. Zoho te muestra una lista de todo lo que cambiaste en el Sandbox.
   Marcá para mover:
   - Los 3 campos nuevos de Oportunidades.
   - El Blueprint (o la transición que modificaste, si ya existía uno).
3. Zoho te da una vista previa de qué se va a aplicar en el productivo.
   Revisala y confirmá el despliegue.
4. Listo — a partir de ahí, el recuadro funciona igual en tu Zoho real,
   sin tener que repetir los pasos 1 y 2 a mano.

> Los nombres exactos de los menús pueden variar un poco según la versión
> de Zoho que tengas. Si algún paso no coincide con lo que ves en
> pantalla, mandame una captura o contame qué opciones aparecen y te
> ayudo a ubicarlo.

## Próximo paso

- Si preferís que los 3 campos los cree yo directo (en el ambiente
  conectado a esta sesión), confirmame y los creo — pero si vas a
  probarlo primero en el Sandbox como arriba, no hace falta que yo toque
  nada: seguí la guía y avisame cuando esté armado para dejarlo marcado
  como aplicado acá.
