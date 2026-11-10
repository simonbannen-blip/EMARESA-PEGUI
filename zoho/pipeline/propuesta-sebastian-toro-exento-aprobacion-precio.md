# Propuesta: Sebastián Toro exento de aprobaciones de **precio** (no de monto)

**Fecha:** 2026-11-09 · **Estado:** guía cerrada con la captura del proceso.
Nada aplicado en el CRM (lo arma Simón).

## Datos

- Sebastián Toro (id 5404724000574740001), rol **Sub Gerente de Ventas
  Inamar Izaje**, código vendedor 10026.
- Sus aprobaciones de **monto** (> 10 MM) pasan por "UN Izaje Aprobación
  sobre 10 millones" (ej. COT-2927, 2797, 2677) → **se mantienen**.
- Sus aprobaciones de **precio** pasan por otro proceso: **"UN Inamar
  Izaje - Aprobaciones"** (id 5404724000042131058), gatillado por la
  casilla `Aprobación Descuento Monto Mínimo` ("precio por debajo del
  mínimo"). Aprobadores (cualquiera): Juan Ortiz, Eduardo Carrillo, Miguel
  Alarcón, Carlos Oliva, Gerardo Pizarro. Ej.: COT-2920 (05-11), 2858,
  2803. Al aprobar: Sub Fase "Aprobado por Precio por debajo del mínimo -
  1" y Fase "Cotización Aprobada".

## Por qué no sirve copiar la receta de Juan Marchant tal cual

Con Juan la regla devuelve a "Creada" toda cotización que llega a
Pendiente de Aprobación, porque está exento de todo. Sebastián **sí**
necesita la de monto: si se devuelve a "Creada" sin mirar, se saltaría
también la aprobación sobre 10 MM.

Además el Cotizador marca las casillas en guardados separados, un segundo
después de crear (primero crea, luego los productos, luego la casilla). Una
regla "al crear" vería todas las casillas vacías.

## Propuesta

**Paso 1 — Proceso "UN Inamar Izaje - Aprobaciones":** en cada regla de
precio (monto mínimo y las que haya de descuento/sobreprecio), agregar el
criterio **Propietario de Cotización no está Sebastian Toro**, igual que el
criterio 4 que ya tiene Juan en el proceso de 10 MM.
**No tocar** "UN Izaje Aprobación sobre 10 millones".

**Paso 2 — Regla de flujo nueva** "In Iz - Sebastián Toro sin aprobación de precio":
- Cuándo: **al editar** (repetir en cada edición).
- Condiciones (todas):
  1. UN es Inamar Izaje
  2. Fase de Cotización es Pendiente de Aprobación
  3. Propietario de Cotización es Sebastian Toro
  4. Aprobación Sobre 10 millones **no** seleccionado
  5. Aprobación Descuento Monto Mínimo **es** seleccionado
     (si el proceso tiene otras casillas de precio, agregarlas con "o":
     patrón `1 y 2 y 3 y 4 y (5 o 6 ...)`)
- Acción: Fase de Cotización = **Creada**.

Resultado:
- Solo precio → la regla la deja en Creada, sin aprobación.
- Precio + sobre 10 MM → la regla no actúa (condición 4), el proceso de
  precio lo excluye y entra solo el de 10 MM (Dieter/Sebastián → Rodrigo
  Verdugo).
- Solo sobre 10 MM → igual que hoy.

**Paso 3 — Prueba:** una cotización de Sebastián con un precio bajo el
mínimo y bajo 10 MM (debe quedar Creada) y otra sobre 10 MM con precio bajo
el mínimo (debe pedir solo la aprobación de monto).

## Pendiente

- Captura del proceso "UN Inamar Izaje - Aprobaciones" (todas sus reglas)
  para saber qué casillas de precio usa además de Monto Mínimo.
- Riesgo a confirmar en prueba: si el Cotizador marcara la casilla de
  precio en un guardado **anterior** al de la casilla de 10 MM, la regla
  alcanzaría a pasarla a Creada antes. En los casos vistos cada marca llega
  en un solo guardado.

## Proceso "UN Inamar Izaje - Aprobaciones" (captura de Simón, 09-11)

**Regla 1** — aprobador Product Manager Izaje (cualquiera); al aprobar,
función "Ejecución Proceso Aprobacion descuento Minimo".
1 UN = Inamar Izaje · 2 Aprobación Descuento Monto Mínimo = Seleccionado ·
3 Fase = Pendiente de Aprobación · 4 Sub Fase = Aprobado por Descuento de
Item - 1 · 5 Sub Fase está vacío · 6 Aprobación Descuento = No seleccionado
· 7 Fase = Pendiente de Aprobación.
Patrón: `(1 y (((2 y 3) y 4) o ((5 y 6) y 7)))`.

**Regla 2** — aprobador Product Manager Izaje; al aprobar, función
"Ejecución Proceso de Aprobación descuento item 1".
1 UN = Inamar Izaje · 2 Aprobación Descuento = Seleccionado · 3 Fase =
Pendiente de Aprobación. Patrón: `((1 y 2) y 3)`.

Las dos son de precio (Regla 2 = descuento por ítem; Regla 1 = precio bajo
el mínimo, también encadenada después de aprobar la 2).

Observación: en la Regla 1, la rama `(5 y 6) y 7` no exige la casilla de
Monto Mínimo (criterio 2). Probablemente la intención era
`1 y 2 y 3 y (4 o (5 y 6))`. No se cambia ahora; queda anotado.

## Guía final

**Regla 1:** agregar criterio 8 = Propietario de Cotización **no está**
Sebastian Toro. Patrón: `((1 y (((2 y 3) y 4) o ((5 y 6) y 7))) y 8)`.

**Regla 2:** agregar criterio 4 = Propietario de Cotización **no está**
Sebastian Toro. Patrón: `(((1 y 2) y 3) y 4)`.

**Regla de flujo nueva** (al editar): condiciones
1 UN es Inamar Izaje · 2 Fase es Pendiente de Aprobación · 3 Propietario
es Sebastian Toro · 4 Aprobación Sobre 10 millones no seleccionado ·
5 Aprobación Descuento Monto Mínimo es Seleccionado · 6 Aprobación
Descuento es Seleccionado. Patrón: `((((1 y 2) y 3) y 4) y (5 o 6))`.
Acción: Fase de Cotización = Creada.
