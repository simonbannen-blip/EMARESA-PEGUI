# Caso: COT-CONST-5017 vendida bajo el precio mínimo sin aprobación

Cotización: https://crm.zoho.com/crm/org784807563/tab/Quotes/5404724000639198302
(VEOLIA SU CHILE S.A., UN Construcción, línea Construcción Geosintéticos,
vendedor Cesar Valladares, gestionada por Anny Urribarri, 24-11-2026).

## Qué pasó

- Producto: NAC GEOMEM HDPE 1,5 MM (4260000000155), 5.884 m2 a **USD 1,10**
  (≈ CLP 1.119 al cambio 1.017,66). Precio de lista del producto en el CRM:
  **CLP 2.534** → se vendió a ~44 % del precio de lista.
- La revisión de precio mínimo **sí corrió**: al crearse la cotización
  (16:26:53, desde el Cotizador/Creator) la casilla
  `Aprobación Descuento Monto Mínimo` quedó en **verdadero**.
- Pero **ningún proceso de aprobación la tomó**: en el historial no hay
  ninguna entrada de aprobación. El Blueprint pasó directo
  Creada → Enviada (17:17:37) → Pendiente de revisión → Lista para
  Confirmar → Direc. Facturación → Direc. Despacho → **Cerrada Ganada**
  (17:18:22) y se generó la Orden de Venta. `Aprobado por Descuento Monto
  Mínimo` = falso, `Aprobador Mínimo Venta` vacío.

## Causa

Para la UN **Construcción** no hay un proceso de aprobación activo que use
la casilla `Aprobación Descuento Monto Mínimo` (los que existen son de
Inamar Izaje, Rental, etc.). La casilla se marca, pero no detiene nada, y el
Blueprint no exige que esté aprobada antes de "Confirmar Envío de
Cotización". Ya se había detectado el 18-11 (ver memory.md).

## Magnitud (desde 01-09-2026, casilla marcada y sin aprobar)

| UN | Fase | Cotizaciones |
|---|---|---|
| Construcción | Creada | 683 |
| Construcción | **Cerrada Ganada** | **118** |
| Construcción | Cerrada Perdida | 25 |
| Construcción | Lista para Clonar | 8 |
| Construcción | Sin Stock suficiente | 3 |
| Construcción | Lista para Confirmar | 2 |
| Inamar Izaje | Cerrada Ganada | 5 |
| Inamar Izaje | Enviada | 1 |
| Industria y Ferretería | Pendiente de Aprobación | 2 |

## Opciones para corregir (pendiente de decisión de Simón)

1. **Crear el proceso de aprobación "UN Construcción – Precio bajo mínimo"**
   (Cotizaciones, al crear/editar): UN = Construcción y Aprobación Descuento
   Monto Mínimo = seleccionado y Aprobado por Descuento Monto Mínimo = no
   seleccionado. Definir aprobador (Product Manager / Gerente Construcción).
   Al aprobar: reutilizar la función "Ejecución Proceso Aprobacion descuento
   Minimo" como en Inamar Izaje.
2. **Candado en el Blueprint** (complementario): en la transición
   "Confirmar Envío de Cotización", bloquear si Aprobación Descuento Monto
   Mínimo = verdadero y Aprobado por Descuento Monto Mínimo = falso — evita
   que cualquier UN sin proceso se salte el control.
3. Antes de activar, revisar el umbral del mínimo en Construcción: 683
   cotizaciones Creadas marcadas sugiere que el cálculo marca casi todo
   (o que los precios mínimos de la UN están desactualizados), lo que
   inundaría a los aprobadores.

Nota: Inamar Izaje también tiene 5 ganadas con la marca sin aprobar — vale
revisarlas (puede ser la exención de Sebastián Toro o el mismo hueco).
