# Caso: IVA (19%) sale en blanco en el PDF de cotización (Inamar Izaje)

**Fecha**: 2026-10-28 · **Estado**: propuesto — pendiente OK de Simón

## Síntoma

Cotización **20261028-COT-II10026-2803** (id 5404724000626234433, dueño
Sebastián Toro). En el PDF "In Iz - Cotización Accesorios" la fila
**IVA (19%)** sale vacía, pero Subtotal (192.000) y Total General
(228.480) sí salen.

## Diagnóstico

El registro **sí tiene el valor**: `Rental_IVA` = 36.480 (fórmula OK).

El problema es de **permisos de campo**. La plantilla se genera con los
permisos del usuario que la descarga:

| Campo (API) | En plantilla | Administrator | Resto de perfiles |
|---|---|---|---|
| `Sub_Total` | Subtotal | lectura/escritura | lectura/escritura |
| `Rental_IVA` | IVA (19%) | lectura/escritura | **oculto** |
| `Rental_Total_con_IVA` | Total General | lectura/escritura | lectura/escritura |
| `Rental_SUM_Subtotal` (Constuc_SUM_Subtotal) | — | lectura/escritura | oculto |

`Rental_IVA` está **oculto** para todos los perfiles excepto
Administrator (Standard, Vendedor, Vendedor MIV, Vendedor MAK, Gerente,
Gerente de UN, Asistente, Responsable de Área, Responsable de Área MIV y
MAK, Vendedor Distribución Repuestos…). Por eso un administrador ve el
IVA y un vendedor no. Afecta a todas las plantillas que usen
`Rental_IVA`, no solo Inamar.

## Solución propuesta

Configuración > Módulos y campos > Cotizaciones > campo **Rental_IVA** >
(…) **Establecer permiso** → marcar **Solo lectura** para todos los
perfiles (es fórmula, nadie la edita). Guardar.

Opcional: lo mismo con `Constuc_SUM_Subtotal` si alguna plantilla lo usa.

Verificar: un vendedor descarga el PDF de COT-II10026-2803 y debe ver
IVA (19%) = 36.480.
