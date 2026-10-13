# Caso COT-II10029-2598 — Cerrada Ganada sin Orden de Venta (2026-10-13)

Cotización: `20261013-COT-II10029-2598` (id 5404724000618926138), Inamar Izaje,
IMPORTADORA VIMA, vendedora Vanessa Ponce, Oportunidad
260925-OP-II-10029-002283. Es una recotización de la 2421
(id 5404724000612020076, sigue en "Enviada").

## Qué pasó (según el historial del registro)

- 13:38 — El Cotizador (Creator, vía API) reescribe los artículos con un
  descuento de **11,06 %** sobre el TECLE PALANCA LB063 X 1,5M.
- 13:41–13:42 — Vanessa valida facturación, despacho y pasa
  **"Confirmar Cotización Izaje"** → Cerrada Ganada, OC 1208.
- 13:42:29 — Se ejecuta **"SB Convertir Orden de Venta x Linea Negocio"**,
  pero **no se creó ninguna OV** y no quedó ningún error en la cotización
  (`Detalle de Log ERP` vacío). Mismo síntoma que el caso 1741.

## Lo que se descartó

Comparado contra la 2595 (misma vendedora, misma UN, mismo día, sí generó OV)
y otras de Inamar Izaje:

- Cliente, sucursal del cliente y contacto: completos y sincronizados con el
  ERP (Sucursal "AV. Vitacura 3568 of 410", código 1-1, id ERP 55672).
- Producto activo, con UN Inamar Izaje.
- Totales con decimales: otras con decimales (2079, 1936, 1965…) sí generaron OV.
- "Aprobación Descuento Monto Mínimo" sin aprobar: la 1908 estaba igual y
  igual generó OV.
- No hay ninguna OV ligada a la cotización, a la 2421 ni a la oportunidad.

## Causa más probable

El descuento de la línea quedó con **4 decimales**: `136.782,2274`
(11,06 % de 1.236.729). Revisadas las 156 líneas con descuento de
cotizaciones Inamar Izaje desde el 01-08: **es la única** con más de 2
decimales; todas las demás tienen 2 o menos y generaron su OV. Los campos
de moneda de las Órdenes de Venta aceptan hasta 2 decimales, así que es muy
probable que la función intentara crear la OV con ese valor, Zoho la
rechazara, y la función no dejara registro del error.

No está 100 % confirmado: el código y los logs de la función no se ven
desde las herramientas conectadas.

## Propuesta (pendiente OK de Simón)

1. **Arreglar esta cotización**: redondear el descuento de la línea a
   `136.782` (o el monto que defina la vendedora) y volver a generar la OV con
   la función "SB Convertir Orden de Venta x Linea Negocio" (Configuración →
   Funciones → Ejecutar con el id de la cotización). **No usar el botón
   Convertir** (ver caso 1741: la OV sale incompleta y falla en el ERP).
   Para confirmar la causa: antes de redondear, ver en la función el log de
   la ejecución de las 13:42 del 13-10.
2. **Prevenir**: pedir a quien mantiene el Cotizador (Creator) o la función
   que redondee los descuentos a pesos enteros (CLP) antes de mandarlos al
   CRM / al crear la OV, y que la función registre el error en
   `Detalle de Log ERP` cuando la OV no se pueda crear.
