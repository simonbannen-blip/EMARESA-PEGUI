# Propuesta: dejar elegir Efectivo + Crédito Simple cuando la Línea de Crédito del cliente es Crédito Simple

## Estado: PENDIENTE DE DEFINIR — necesito 2 datos tuyos antes de poder dejarlo
listo para aplicar (ver "Lo que falta confirmar" al final)

## Qué se pidió

Que en la regla que decide qué formas de pago puede elegir un vendedor, se
permita elegir **Efectivo Y Crédito Simple** (no solo una) cuando la
**Línea de Crédito** del cliente sea **Crédito Simple**. Ejemplo dado:
**Inamar Izaje**.

## Lo que encontré en el CRM sobre Inamar Izaje

Busqué la cuenta y su Línea de Crédito:

| | |
|---|---|
| Cliente | INAMAR IZAJE SPA. |
| Línea de Crédito (UN Emaresa) | **Forma de Pago: CREDITO SIMPLE** |
| Línea de Crédito Ventas | $88.000.000 |
| Línea de Crédito Rental | $30.000.000 |
| Estado del Cliente | VI (Vigente) |

(Tiene una segunda Línea de Crédito para UN Rental, todavía sin datos
cargados.)

El campo que guarda esto se llama internamente `Condición de Pago` (label
"Forma de Pago") y es una **lista de una sola opción** (no de opción
múltiple), con estos valores disponibles hoy en el CRM:

`Contado`, `Crédito Simple`, `Vale Vista`, `EFECTIVO O VALE VISTA`,
`DEPOSITO A PLAZO ENDOSABLE`, `TRANSFERENCIA`.

Ese mismo campo (mismos valores) existe también en **Cotizaciones**, con
el label "Forma de Pago" (`Condicion_de_Pago`).

**No existe una opción llamada "Efectivo" a secas** — lo más parecido es
`EFECTIVO O VALE VISTA`.

## Lo que no pude encontrar (y por qué)

Busqué en el CRM alguna regla, validación o dependencia entre picklists
que controle "qué formas de pago se pueden elegir según la Línea de
Crédito del cliente", y no hay nada de eso configurado en los módulos
conectados a esta sesión (Línea de Crédito Cliente, Cotizaciones,
Formas_de_Pago). El campo "Forma de Pago" en Cotizaciones es de una sola
opción, sin restricciones visibles desde acá.

Dijiste que la regla está en **"el Creator"**. Si te referís a **Zoho
Creator** (la app aparte de formularios/automatización que ya identificamos
antes como intermediaria en la sincronización de Sucursales con el ERP),
**no tengo acceso a esa app desde esta sesión** — el MCP conectado acá es
solo de Zoho CRM. No puedo ver ni editar formularios, reportes ni reglas
de Creator.

## Lo que falta confirmar para poder ayudarte con esto

1. **Dónde vive la regla**: ¿es Zoho Creator (app aparte) o es algo dentro
   del CRM que todavía no encontré (por ejemplo, al crear la Cotización)?
   Si es dentro del CRM, decime en qué pantalla/momento pasa y sigo
   buscando. Si es Zoho Creator, voy a necesitar que me pases una captura
   de la regla actual (o me digas en qué formulario/página está) para
   poder escribirte la propuesta exacta de qué cambiar — no puedo verla yo.
2. **Qué es "Efectivo" en tu pedido**: ¿es el valor que ya existe,
   `EFECTIVO O VALE VISTA`, o es una opción nueva y distinta que habría
   que crear? Esto cambia si la propuesta es solo "permitir elegir dos
   valores existentes juntos" o "agregar una opción nueva al picklist".

## Próximo paso

En cuanto me confirmes esos dos puntos, actualizo esta propuesta con el
detalle exacto (campo, valores, y los pasos para armarlo en Sandbox antes
de tocar Producción, como venimos haciendo con los demás cambios) y, si el
cambio queda dentro del CRM, te aviso qué parte puedo aplicar yo directo
(con tu OK) y qué parte queda para armar del lado de Creator.
