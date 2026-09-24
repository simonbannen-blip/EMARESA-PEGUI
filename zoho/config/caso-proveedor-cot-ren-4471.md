# Caso para proveedor Creator: COT-REN-4471 — descuento no restado en línea Rental

## Identificación
- Cotización CRM: **COT-REN-4471** (ID CRM 5404724000611377481)
- ID Creator: **4389062000011871288**
- Cliente: SERVICIOS AUSTRAL SANTIAGO S.A. · Vendedora: Katherine Antich
- UN Rental · Sucursal RENTAL-Santiago Norte (740) · Fecha: 24-09-2026

## Qué pasó (historial del registro en CRM)
| Hora | Evento |
|---|---|
| 09:33:53 | Creator crea la cotización en CRM vía API (usuario Infraestructura Emaresa) con "Aprobación Descuento" = true |
| 09:35:14 | La vendedora agrega nota: "DESCUENTO DE 15% PARA CERRAR UN ARRIENDO DE 3 A 6 MESES" |
| 09:42:33 | Paulette Quintana aprueba (proceso "UN Rental - Arriendo - 1° Aprobación Dto por Item") |
| 09:42:34-36 | Se ejecutan "Ejecución Proceso de Aprobación descuento item 1", "cotizacionAprobada" y "SB Enviar Fase Cotizacion a Creator" |
| **09:42:40** | **Creator reescribe las líneas de productos en CRM** (las líneas actuales tienen esa hora de creación) |
| 09:42:41 | "Enviar Sub Fase de Cotizacion a Creator"; el Código de Vendedor pasa de **426 a vacío** |

Nadie editó la cotización en el CRM entre la creación y la aprobación.

## Datos que envió Creator (línea 1: ARR. BOMBA DE HORMIGÓN DIESEL SP-500, cód. F09701)
| Campo | Enviado por Creator | Correcto |
|---|---|---|
| Precio día | 174.830 | 174.830 |
| Cantidad / Días | 1 / 30 | 1 / 30 |
| Importe (Importe_Rental) | 5.244.900 | 5.244.900 |
| % Descuento | 15 | 15 |
| Descuento | 786.735 | 786.735 |
| **Subtotal** | **5.244.900** | **4.458.165** |
| **Total Rental** | **5.244.900** | **4.458.165** |

Línea 2 (TRASLADO MAQUINARIA, 160.000, sin descuento): correcta.

→ Creator envió el descuento, pero **no lo restó** del Subtotal / Total Rental.

## Impacto
El CRM suma el "Subtotal" de las líneas para el total Rental y el PDF:

| | Emitido | Correcto |
|---|---|---|
| Neto | 5.404.900 | 4.618.165 |
| IVA 19% | 1.026.931 | 877.451 |
| **Total PDF** | **6.431.831** | **5.495.616** |

Sobrecobro en el documento: **936.215** (IVA incluido).

## Comparación
Cotizaciones del mismo día con el mismo flujo de aprobación quedaron bien
(ej. COT-REN-4465: Importe 3.498.000 − desc. 244.860 → Total Rental
3.253.140 ✔). El error es propio de cómo Creator calculó/reenvió esta línea.

## Qué pedimos al proveedor
1. Revisar en Creator la cotización 4389062000011871288: por qué la línea
   1 salió con Subtotal = Importe (sin descuento) al reenviarse tras la aprobación.
2. Revisar por qué se borró el Código de Vendedor (426) en ese reenvío.
3. Asegurar que el cálculo de línea se aplique siempre (alta de fila,
   cambio de precio/cantidad/días/% desc., envío inicial y reenvío post-aprobación):
   `Importe = Precio_día × Cantidad × Días` ·
   `Descuento = Importe × %Desc / 100` ·
   `Subtotal = Total Rental = Importe − Descuento + Seguro`
4. Hay otros casos con errores de cálculo de línea (principalmente sin
   multiplicar por los días): COT-REN-3782, 3356, 3027, 2900, 2438, 2285,
   2229, 1655, 1610, 1390, 1050, 0727, 0466.

Nota: la línea de COT-REN-4471 ya fue corregida manualmente en el CRM
(24-09-2026 10:41) para no afectar al cliente.
