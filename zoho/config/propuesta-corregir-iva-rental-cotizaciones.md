# Propuesta: corregir IVA y Total de Rental en Cotizaciones (no descuentan el descuento)

**Estado**: propuesto — pendiente OK de Simón (el cambio de fórmulas se hace
a mano en Configuración > Módulos > Cotizaciones; la API/MCP no permite
editar fórmulas).

## Problema detectado (2026-09-24)

Caso: **COT-REN-4471** (id 5404724000611377481). Valores reales del CRM:

| Campo (API) | Etiqueta | Valor | ¿Correcto? |
|---|---|---|---|
| `Sub_Total` | Subtotal | 4.618.165 | Sí (ya con descuento) |
| `Subtotal_General_con_Descuento` | Subtotal General con Descuento | 4.618.165 | Sí |
| `Descuento_Total_de_Productos` | Descuento Total de Productos | 786.735 | Sí |
| `Rental_SUM_Subtotal` | Constuc_SUM_Subtotal | 5.404.900 | **No** — es la suma **sin** descuento |
| `Rental_IVA` | Rental_IVA | 1.026.931 | **No** — 19% de 5.404.900 |
| `Rental_Total_con_IVA` | Rental Total con IVA | 6.431.831 | **No** — 5.404.900 + 1.026.931 |

Ítems:

| Ítem | Total Rental (`Total_Rental`) | Descuento | Total con descuento (`Net_Total`) |
|---|---|---|---|
| 1 | 5.244.900 | 786.735 | 4.458.165 |
| 2 | 160.000 | 0 | 160.000 |
| **Suma** | **5.404.900** | 786.735 | **4.618.165** |

**Causa**: `Rental_SUM_Subtotal` suma la columna `Total_Rental` de la tabla
de productos, que guarda el monto **antes** del descuento. `Rental_IVA` y
`Rental_Total_con_IVA` se calculan desde ese valor, así que el IVA y el
total final del PDF se inflan (en este caso en 176.215 de total).

El PDF además muestra en la columna "Valor Total" el `Total_Rental`
(5.244.900) en vez del total con descuento (4.458.165).

## Valores correctos para COT-REN-4471

- Neto con descuento: 4.618.165
- IVA 19%: **877.451**
- Total con IVA: **5.495.616** (hoy el PDF dice 6.431.831)

## Cambio propuesto

1. **`Rental_IVA`** (fórmula) → calcular sobre el subtotal con descuento:
   `Round(${Cotizaciones.Subtotal General con Descuento} * 0.19, 0)`
2. **`Rental_Total_con_IVA`** (fórmula) →
   `${Cotizaciones.Subtotal General con Descuento} + ${Cotizaciones.Rental_IVA}`
3. **Plantilla PDF de Cotización Rental** → columna "Valor Total" de los
   ítems: cambiar `Total Rental` por `Total` (Net_Total, con descuento), y
   la línea del neto usar `Subtotal General con Descuento`.
4. (Opcional) `Constuc_SUM_Subtotal` puede quedar como "Subtotal sin
   descuento" informativo, o cambiarse para que sume `Total` en vez de
   `Total Rental`. Si otro flujo/función lo usa, revisar antes de tocarlo.

Nota: las cotizaciones ya creadas se recalculan cuando se editan/guardan;
las fórmulas se recalculan solas al cambiar la definición.

## Fórmulas originales (respaldo, antes del cambio)

- `Rental_IVA`: `(${Cotizaciones.Constuc_SUM_Subtotal}*19)/100`
  → nueva: `Round((${Cotizaciones.Subtotal General con Descuento}*19)/100, 0)`
- `Rental_Total_con_IVA`: pendiente de copiar.
