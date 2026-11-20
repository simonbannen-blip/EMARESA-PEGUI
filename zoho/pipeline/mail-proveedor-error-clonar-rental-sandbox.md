# Mail al proveedor del Cotizador — error al clonar cotización Rental (ambiente desarrollo)

Fecha: 2026-11-20 · Estado: borrador para que Simón lo envíe (completar N° de cotizaciones).

Contexto: en el Sandbox, al clonar una cotización **Rental** (Cerrada Ganada)
el Cotizador de desarrollo falla al abrir. Con una de Construcción
(COT-CONST-999999-0164) funcionó. Se repitió con 2 cotizaciones Rental.
Pendiente confirmar si el botón original "Clonar Cotización" da el mismo error.

---

**Asunto:** Cotizador (desarrollo) – error al clonar cotización Rental

Hola,

Estamos probando en el ambiente de desarrollo la clonación de cotizaciones
Cerrada Ganada. Al clonar cotizaciones de **Rental**, el Cotizador muestra
este error y no abre el formulario:

> Error in executing On Add - On Load script
> Comparison of non numeric expression is not supported Line:(445)

Cotizaciones probadas: [N° 1], [N° 2]. Con una de Construcción
(COT-CONST-999999-0164) el clon abre sin problema.

¿Pueden revisar esa línea del On Load para el caso Rental? Necesitamos además
confirmar que en Producción se puede clonar una cotización Rental en estado
Cerrada Ganada (mismo cliente u otro cliente).

Adjunto captura.

Saludos,
Simón
