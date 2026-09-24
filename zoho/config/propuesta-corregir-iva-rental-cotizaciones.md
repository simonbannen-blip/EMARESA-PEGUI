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

## ⚠️ Corrección del diagnóstico (2026-09-24, después de aplicar)

**El cambio de fórmulas era incorrecto y hay que revertirlo.**

- En cotizaciones de **Construcción** (COT-CONST-…), "Subtotal General con
  Descuento" **ya incluye el IVA** (impuesto por línea), y ahí
  `Constuc_SUM_Subtotal` es el neto con descuento (correcto). Con la
  fórmula nueva el IVA se cobra dos veces. Ej.: COT-CONST-467-3262
  (guardada 10:24, después del cambio) quedó con Rental_IVA 51.171 y total
  320.492, cuando lo correcto es 43.001 y 269.321.
- En **Rental** normalmente "Total Rental" de cada línea **ya viene con el
  descuento** (ej. COT-REN-4475: Importe 495.000, desc. 24.750,
  Total Rental 470.250), así que las fórmulas originales funcionan.

**Causa real en COT-REN-4471**: en la línea 1, "Total Rental" y "Subtotal"
quedaron en 5.244.900 (sin descuento) aunque el descuento de 786.735 (15%)
sí está cargado. Las líneas fueron reescritas a las 09:42 por el usuario
"Infraestructura Emaresa" (integración con el cotizador Creator) al
aprobarse el descuento del ítem → la integración escribió "Total Rental"
sin aplicar el descuento.

**Acciones**:
1. Revertir fórmulas a las originales:
   - `Rental_IVA`: `(${Cotizaciones.Constuc_SUM_Subtotal}*19)/100`
   - `Rental_Total_con_IVA`: `${Cotizaciones.Constuc_SUM_Subtotal}+${Cotizaciones.Rental_IVA}`
     (reconstruida desde los datos; coincide en todas las cotizaciones revisadas)
2. Volver a guardar las cotizaciones editadas mientras estuvo la fórmula
   nueva (al menos COT-CONST-467-3262).
3. Corregir "Total Rental" de la línea 1 de COT-REN-4471 a 4.458.165.
4. Revisar con TI/Creator por qué la integración no aplica el descuento
   al "Total Rental" en esos casos.

Otras COT-REN (últimas 200 con descuento) donde Constuc_SUM_Subtotal es
mayor que el Subtotal: 4472 (+39.000), 4471 (+786.735), 4455 (+405.000),
4451 (+162.000), 4450 (+162.000), 4203 (+84.000), 4141 (+135.000),
4067 (+66.000), 4039 (+66.000), 4032 (+90.000). ~10 de 200.
