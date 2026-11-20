# Mail al proveedor del Cotizador — error al clonar cotización Rental (ambiente desarrollo)

Fecha: 2026-11-20 · Estado: borrador para que Simón lo envíe (completar N° de cotizaciones).

## Diagnóstico (revisado el código que pasó Simón)
Flujo Creator: formulario **Generar Cotizaciones** · Created → Load of the form ·
**"Cargar Datos Clonación"** (On Add - On Load).
Error: *Comparison of non numeric expression is not supported Line:(445)*.

- En el bloque `if(unidadNegocio == "Rental")` la línea
  `productoRental.Desc_Adicional=prodRT.Desc_Adicional;` está **comentada**,
  pero más abajo se usa `if(productoRental.Desc_Adicional > 0, …)` → el valor
  queda nulo y la comparación falla.
- Solo se ejecuta cuando `prodRT.Precio_Lista != precioUnitario` (cambió el
  precio de lista) → aparece al clonar cotizaciones antiguas (ej. Ganadas).
- Corrección propuesta (2 líneas del bloque Rental):
  - `if(productoRental.Desc_Adicional > 0,…)` → `if(ifnull(productoRental.Desc_Adicional,0) > 0,…)`
  - `if(productoRental.Descuento > 0,…)` → `if(ifnull(productoRental.Descuento,0) > 0,…)`
- Observación: en Rental el importe recalculado es `Precio_Lista * Cantidad`,
  sin `Cant_D_as` → confirmar con el proveedor si es correcto.
- Dato útil: al clonar, el Cotizador **recalcula precios a la lista vigente**
  cuando cambiaron (en todas las UN).

---

**Asunto:** Cotizador (desarrollo) – error al clonar cotización Rental (línea 445)

Hola,

Al clonar cotizaciones **Rental** en el ambiente de desarrollo, el Cotizador
muestra este error y no abre el formulario:

> Error in executing On Add - On Load script
> Comparison of non numeric expression is not supported Line:(445)

Cotizaciones probadas: [N° 1], [N° 2]. Con Construcción e Inamar Izaje el
clon abre bien.

Revisando el flujo **"Cargar Datos Clonación"**, en el bloque de Rental la
línea `productoRental.Desc_Adicional=prodRT.Desc_Adicional;` está comentada,
pero luego se compara `productoRental.Desc_Adicional > 0`, que queda nulo
(pasa cuando cambió el precio de lista). Proponemos:

- `if(productoRental.Desc_Adicional > 0, …)` → `if(ifnull(productoRental.Desc_Adicional,0) > 0, …)`
- `if(productoRental.Descuento > 0, …)` → `if(ifnull(productoRental.Descuento,0) > 0, …)`

¿Pueden aplicarlo en desarrollo para probar y luego en producción?

Además, en ese mismo bloque el importe se recalcula como Precio Lista ×
Cantidad, sin los días de arriendo (Cant. Días). ¿Es correcto para Rental?

Adjunto captura.

Saludos,
Simón
