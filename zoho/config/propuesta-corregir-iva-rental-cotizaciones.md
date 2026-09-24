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

## Definición real de Constuc_SUM_Subtotal y solución de fondo

`Constuc_SUM_Subtotal` es un **campo de agregación**: SUM del campo
"Subtotal" de la tabla de productos (2 decimales). Ese "Subtotal" de línea
lo escribe el cotizador Creator (= Importe − Descuento + Seguro). Si
Creator no resta el descuento (COT-REN-4471), todo el cálculo sale mal.

Propuesta para que no dependa de Creator:
1. Cambiar la agregación de `Constuc_SUM_Subtotal` a SUM de
   **"Total con descuentos"** (calculado por Zoho) — si el campo aparece
   en la lista.
2. Crear agregación nueva **"SUM Seguro"** = SUM de "Valor Total Seguro".
3. `Rental_IVA` = `((${Constuc_SUM_Subtotal} + ${SUM Seguro})*19)/100`
   `Rental_Total_con_IVA` = `${Constuc_SUM_Subtotal} + ${SUM Seguro} + ${Rental_IVA}`
   con "valores en blanco como 0".
4. Las agregaciones no se aplican retroactivamente: hay que actualizar
   los registros existentes.

Hallazgo: las diferencias en 4472, 4455, 4451, etc. son el **seguro**
(ej. 4472: +39.000 = Valor Total Seguro), no errores.

## Por qué falló COT-REN-4471 en particular (historial del registro)

- 09:33:53 — Creator crea la cotización vía API (usuario Infraestructura).
- 09:35:14 — Katherine Antich agrega nota "DESCUENTO DE 15% PARA CERRAR UN
  ARRIENDO DE 3 A 6 MESES".
- 09:42:33 — Paulette Quintana aprueba (proceso "UN Rental - Arriendo - 1°
  Aprobación Dto por Item").
- 09:42:34-36 — funciones "Ejecución Proceso de Aprobación descuento item 1",
  "cotizacionAprobada", "SB Enviar Fase Cotizacion a Creator".
- 09:42:40 — Creator reescribe las líneas: Descuento 786.735 OK, pero
  Subtotal y Total Rental = 5.244.900 (sin descuento).
- 09:42:41 — "Enviar Sub Fase de Cotizacion a Creator"; además se borró el
  Código de Vendedor (426 → vacío).

Nadie editó la cotización en el CRM entre la creación y la aprobación. Otras
cotizaciones con el mismo flujo de aprobación el mismo día (4448, 4459,
4460, 4465) quedaron bien → el error ocurrió dentro de Creator al reenviar
las líneas de esta cotización (ID Creator 4389062000011871288). Hay que
revisarlo en Creator.

## Corrección aplicada en COT-REN-4471 (2026-09-24 10:41, con OK de Simón)

Actualizado vía API (sin disparar workflows/aprobaciones/blueprint), línea 1
(ARR. BOMBA DE HORMIGÓN DIESEL SP-500): Subtotal y Total Rental
5.244.900 → 4.458.165. Línea 2 sin cambios.

Resultado verificado: Constuc_SUM_Subtotal 4.618.165 · Rental_IVA 877.451 ·
Rental Total con IVA 5.495.616. Fase sigue "Cotización Aprobada".
Pendiente: Código de Vendedor sigue vacío (antes 426).

## Barrido de otras cotizaciones Rental (2026-09-24)

Revisé ~2.000 líneas con descuento de COT-REN creadas entre 2026-05-05 y
2026-09-24, comparando el "Subtotal" de línea (lo que suma
Constuc_SUM_Subtotal) contra Total con descuentos + Seguro.

**Igual a 4471 (descuento no restado)**: ninguna otra.

**Otras con el subtotal Rental mal (patrones distintos)**:

| Cotización | Fase | Subtotal Zoho | Constuc_SUM_Subtotal | Problema |
|---|---|---|---|---|
| COT-REN-3782 | Pendiente de Aprobación | 3.230.770,5 | 1.344.626 | línea con Subtotal 65.039 (muy bajo) |
| COT-REN-3356 | Creada | 2.341.211,4 | 8.045,4 | Subtotal de línea 8.045 |
| COT-REN-3027 | Cotización Aprobada | 1.896.223 | −775.083 | Subtotal de línea negativo |
| COT-REN-2900 | Cotización Aprobada | 1.144.800 | −84.800 | negativo |
| COT-REN-2438 | Cotización Rechazada | 2.886.041 | 620.503 | negativo en una línea |
| COT-REN-2285 | Creada | 6.583.984 | 2.232.119 | negativo en una línea |
| COT-REN-2229 | Cotización Aprobada | 561.943,5 | −77.129,5 | negativo |
| COT-REN-1655 | Cerrada Ganada | 2.993.760 | 2.245.320 | descuento restado 2 veces (−748.440) |
| COT-REN-1610 | Cotización Aprobada | 2.447.479,5 | 864.756,5 | 2 líneas negativas |
| COT-REN-1390 | Creada | 3.558.990 | 3.543.909 | −15.081 |
| COT-REN-1050 | Enviada | 3.162.672 | −175.704 | negativo |
| COT-REN-0727 | Creada | 100.250 | 181.250 | +81.000 (sobre-valorada) |
| COT-REN-0466 | Creada | 2.490.198,8 | 2.666.498 | +176.299 (sobre-valorada) |

(Diferencias < 1.000 son redondeos y se ignoraron.) Todas vienen del
"Subtotal" de línea que escribe Creator → refuerza la solución de fondo.

### Causas por cotización (análisis de líneas)

En todas, el "Subtotal"/"Total Rental" de línea (calculado por Creator) no
coincide con los datos de la línea en el CRM. Patrones:

1. **No multiplica por los días** — Subtotal = precio de 1 día − descuento
   del período completo → negativo o casi 0.
   Ej. COT-REN-2900: 42.400 (1 día) − 127.200 (desc. 30 días) = −84.800.
   Casos: 2900, 3027, 2229, 2438, 1610 (2 generadores), 2285 (bomba),
   1050 (6 torres: 175.704 − 351.408), 3356 (80.454 − 72.408,6 = 8.045,4).
   3782: precio de 1 día con 15% desc (76.517 × 0,85 = 65.039).
2. **Cantidad distinta** — COT-REN-1655: Creator calculó 3 placas
   (2.494.800 × 0,9), el CRM tiene 4 (3.326.400 − 10%). Cerrada Ganada:
   confirmar cuál es la cantidad real.
3. **Precio distinto** — COT-REN-1390: Creator usó 72.408,6/día, el CRM
   73.000/día (BW-120). Dif. 15.081.
4. **Días distintos** — COT-REN-0466 y 0727: en el CRM esas líneas dicen
   1 día, Creator calculó 5 días (como el resto). Aquí el que estaría mal
   es el Subtotal de Zoho, no el de Rental.
5. **Descuento no restado** — COT-REN-4471 (ya corregida).

No se puede ver el código de Creator desde el CRM; el patrón 1 apunta a
un cálculo en Creator que en algún caso no multiplica por "Cant. Días".
