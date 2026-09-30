# Caso COT-II10015-1741 — OV convertida a mano sin datos (2026-09-30)

Cotización: `20260729-COT-II10015-1741` (id 5404724000589810678), Inamar Izaje,
ANGLO AMERICAN SUR S.A., Oportunidad 260729-OP-II-10015-001617.

## Qué pasó (según el historial del registro)

1. 29-09 14:18 — Nelson Pacheco pasa la transición "Confirmar Cotización Izaje"
   (Blueprint "SB Gestión de Cotizaciones"). Corre la función
   **"SB Convertir Orden de Venta x Linea Negocio"**, pero **no se creó ninguna
   OV** (probablemente porque "Sucursal del Cliente" estaba vacía).
2. 30-09 12:54 — Simón llena **Sucursal del Cliente** = ISIDORA GOYENECHEA 2800
   PISO 46.
3. 30-09 12:55 — Simón convierte la cotización con el botón estándar
   **Convertir** → se crea la OV id 5404724000613996068.

## Problema

La conversión estándar no pasa los campos que sí llena la función del
Blueprint. La OV quedó sin UN, Sucursal, Sucursal del Cliente, Canal de Venta,
Forma/Condición de pago, datos de despacho y facturación, Orden de Compra, etc.,
y la integración con el ERP falló:
`Detalle de Log ERP = "Error at line : 67, Value is empty and 'get' function cannot be applied"`.
No tiene Nro Pedido ERP. Es la única OV ligada a la cotización.

## Propuesta

- **A (recomendada):** borrar la OV incompleta y volver a generarla con la
  función "SB Convertir Orden de Venta x Linea Negocio" (ahora que la Sucursal
  del Cliente ya está llena), para que salga con todos los datos y se envíe al ERP.
- **B:** mantener la OV y completarle por API los campos faltantes copiándolos
  desde la cotización; luego reintentar el envío al ERP.

## Aplicado (2026-09-30)

- Simón eligió la opción A. Se borró por API la OV incompleta
  (id 5404724000613996068; sin Nro Pedido ERP, sin cambios desde su creación).
- Pendiente (Simón): volver a generar la OV con la función
  "SB Convertir Orden de Venta x Linea Negocio". La cotización sigue en
  "Cerrada Ganada" y bloqueada, así que la transición del Blueprint ya no
  aparece: hay que ejecutar la función a mano (Configuración → Funciones →
  Ejecutar, con el id de la cotización) o devolver la cotización a la fase
  anterior y repetir "Confirmar Cotización Izaje". No usar el botón Convertir.
