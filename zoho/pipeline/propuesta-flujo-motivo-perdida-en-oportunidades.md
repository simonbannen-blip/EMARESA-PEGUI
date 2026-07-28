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

## Próximo paso

1. Confirmame si creo los 3 campos en Oportunidades (puedo hacerlo ya).
2. Armás el Blueprint con los pasos de arriba (o me contás qué ves en tu
   Zoho si el menú no coincide, y te ayudo a ubicarlo).
3. Cuando esté armado, avisame para marcarlo como aplicado acá.
