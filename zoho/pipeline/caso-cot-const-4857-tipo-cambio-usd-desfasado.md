# Caso COT-CONST-384-4857 — valores errados en conversión USD

- Registro: https://crm.zoho.com/crm/org784807563/tab/Quotes/5404724000636210168
- Cliente: IDESC INGENIERIA Y MAQUINARIAS SPA — UN Construcción — Vendedor Cesar Valladares
- Revisado: 2026-11-26 (solo lectura, sin cambios en el CRM)

## Qué pasa

La cotización tiene **dos tipos de cambio distintos al mismo tiempo**:

| Campo | Valor | De dónde sale |
|---|---|---|
| `Cotizaci_n_de_Moneda` (Cotización de Moneda) | **1.044,08** CLP/USD | Lo escribe el Cotizador (Creator) en cada guardado — se actualizó el 26-11 09:42 (antes 996,68) |
| `Exchange_Rate` (Tasa de cambio estándar Zoho) | 0,001003331 → **996,68** CLP/USD | Quedó congelado en el valor del día de creación (18-11); el Cotizador no lo actualiza al editar |

- Los precios en USD de las líneas se calcularon con el dólar del 26-11 (1.044,08).
- Pero el CRM convierte a pesos (informes, totales en CLP, importe a la Oportunidad,
  lo que se vea en moneda base) con **996,68**.
- Total general USD 589,05:
  - con 996,68 → **$587.094 CLP** (lo que muestra el CRM)
  - con 1.044,08 → **$615.015 CLP** (lo que corresponde)
  - diferencia: **$27.921 CLP (−4,5 %)** subvalorado.

## Historial (timeline)

- 18-11 16:40 — creada desde el Cotizador (Infraestructura Emaresa, API). Tasa 996,68 en ambos campos.
- 26-11 09:42 — re-editada desde el Cotizador: cambian líneas y `Cotización de Moneda` 996,68 → 1.044,08. `Exchange_Rate` **no cambia**.
- 26-11 09:43 y 11:03 — dos guardados más (líneas, plazo de pago a "al día contado"). `Exchange_Rate` sigue en 996,68.

## No es un caso aislado

Cotizaciones en USD modificadas desde 01-10 (primeras 200): **17 con los dos tipos de cambio desfasados**
(todas re-editadas días después de creadas). Diferencias entre −9 % y +5 %. Incluye 7 **Cerradas Ganadas**:

| Cotización | Fase | Tasa Zoho | Cotización Moneda | Desfase |
|---|---|---|---|---|
| COT-CONST-384-4857 | Creada | 996,68 | 1.044,08 | +4,76 % |
| COT-CONST-29-5058 | Creada | 1.025,06 | 1.044,08 | +1,86 % |
| COT-CONST-384-5001 | Creada | 1.017,66 | 1.025,06 | +0,73 % |
| COT-CONST-384-4854 | Creada | 996,68 | 1.025,06 | +2,85 % |
| COT-CONST-490-4678 | Creada | 977,05 | 1.017,66 | +4,16 % |
| COT-CONST-289-4740 | Cerrada Ganada | 992,48 | 1.017,17 | +2,49 % |
| COT-CONST-29-4878 | Creada | 1.002,07 | 1.008,79 | +0,67 % |
| COT-CONST-376-3113 | Creada | 958,42 | 1.008,79 | +5,26 % |
| COT-CONST-376-4855 | Creada | 996,68 | 1.002,07 | +0,54 % |
| 261118-COT-MIV-000091_R1 | Enviada | 996,68 | 905,36 | −9,16 % |
| COT-CONST-289-4607 | Cerrada Ganada | 979,88 | 992,48 | +1,29 % |
| COT-CONST-null-4530 | Cerrada Ganada | 970,95 | 992,48 | +2,22 % |
| COT-CONST-289-3998 | Creada | 981,86 | 992,48 | +1,08 % |
| COT-CONST-384-3066 | Creada | 957,53 | 984,49 | +2,82 % |
| COT-CONST-376-4495 | Cerrada Ganada | 970,95 | 984,49 | +1,39 % |
| COT-CONST-29-4521 | Cerrada Ganada | 970,95 | 979,88 | +0,92 % |
| COT-CONST-29-4355 | Cerrada Ganada | 993,22 | 979,88 | −1,34 % |

(La MIV-000091 tiene 905,36 en Cotización de Moneda, valor que no calza con ningún dólar
del período — revisar aparte.)

## Observación secundaria (sin confirmar)

Los precios de lista en USD de las líneas quedan en **números enteros** (41, 29, 15, 29, 22).
Ej.: precio CLP del producto 42.027 ÷ 1.044,08 = 40,25 → quedó 41. No pude confirmar contra la
Lista de Precios del cliente (la conexión no tiene permiso a `Detalle_Listas_de_Precios` ni
`Precios_Especiales`). Si el Cotizador redondea a entero en USD, distorsiona hasta ~US$1 por unidad.

## Propuesta (pendiente OK de Simón)

1. **Causa raíz — Cotizador (Creator)**: en cada creación/edición de cotización enviar también
   `Exchange_Rate = 1 / Cotización de Moneda` (y `Currency`), no solo al crear. Mismo ajuste
   donde se crea la Orden de Venta. Lo hace el proveedor del Cotizador.
2. **Corrección de registros existentes**: actualizar `Exchange_Rate` vía API en las 17
   cotizaciones (y revisar el resto de las USD, la consulta tenía más de 200) para que calce con
   `Cotización de Moneda`. Ojo con las Cerradas Ganadas: confirmar qué tipo de cambio usó la OV/ERP
   antes de tocarlas.
3. Revisar con el proveedor si los precios USD deben ir con 2 decimales.
