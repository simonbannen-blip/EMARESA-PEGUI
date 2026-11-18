# Guía Sandbox: clonar una cotización Cerrada Ganada → clon en Creada y aprobación si corresponde

Fecha: 2026-11-18 · Estado: **lista para probar** (primer paso del nuevo
flujo Editar/Clonar, ver `propuesta-nuevo-flujo-clonacion-cotizacion.md`).

## Objetivo de la prueba
Clonar una cotización **Cerrada Ganada** (mismo negocio, otro mes) y verificar:
1. El clon nace como cotización nueva, **no** como Ganada.
2. Si **no** cumple criterios de aprobación → queda en **Creada**.
3. Si **sí** cumple (monto, descuento, precio, venta rental…) → entra sola a
   **Pendiente de Aprobación** y le llega al aprobador.
4. La original **sigue Cerrada Ganada** (no se toca).
5. No hereda aprobaciones de la original (Sub Fase vacía, "Aprobado por…" en falso).

## Lo que ya revisé en Producción (solo lectura)
- **El botón ya permite clonar Cerrada Ganada**: la función "SB Clonar
  Cotizacion" tiene Cerrada Ganada en su lista de fases permitidas.
  → Para esta prueba **no hay que cambiar código**.
- **La aprobación ya se dispara al crear el clon** (ej. **COT-REN-6359**, 11-11):
  1. 09:35:41 el Cotizador crea el clon.
  2. 09:35:43 el Cotizador recalcula la casilla "Aprobación Venta Rental"
     (falso → verdadero).
  3. 09:35:43 entra solo al proceso **"UN Rental - Aprobación Venta"**
     (aprobador Mauro Monje), fase Pendiente de Aprobación.
  4. 09:41 aprobado → Sub Fase "Aprobado por Venta Rental" → Cotización Aprobada.
  → O sea: si cumple criterios, el clon **no se queda en Creada**, pasa
  directo a Pendiente de Aprobación. Si no cumple, queda en Creada (ej.
  COT-REN-6256, clon de una Ganada, sin casillas → Creada).
- **Ojo Construcción**: la casilla "Aprobación Descuento Monto Mínimo" viene
  marcada en cientos de cotizaciones de Construcción (clones y no clones) y
  **ninguna pasa a aprobación** → en Construcción esa casilla no tiene
  proceso de aprobación asociado. **No usar Construcción para esta prueba**
  (o confirmar antes qué aprobaciones tiene Construcción).

## Qué UN usar
**Rental** (recomendado: todo clon de venta rental marca "Aprobación Venta
Rental") o **Inamar Izaje** (forzar "Sobre 10 millones" o descuento alto).

---

## Paso a paso en Sandbox

### Preparación
1. Entrar al **Sandbox** (Configuración → Sandbox → Abrir).
2. Confirmar que en el Sandbox existan los botones "Editar Cotización" y
   "Clonar Cotización" con las mismas funciones que Producción (si el
   Sandbox es antiguo, refrescarlo). La función ya detecta el ambiente
   (`SBvalidarAmbiente`) y abre el **Cotizador de desarrollo**.
3. Buscar (o crear) una cotización **Rental** o **Inamar Izaje** en
   **Cerrada Ganada** que tenga **ID Creator** (si no tiene, el Cotizador no
   la puede abrir). Anotar: número, monto, oportunidad y su fase.

### Prueba A — Clon sin cambios que requieran aprobación
1. Abrir la cotización Ganada → **Editar Cotización ▾ → Clonar Cotización**.
2. En el Cotizador, cambiar algo que **no** dispare aprobación (ej. solo la
   fecha de validez) → Guardar.
3. Revisar en el CRM el clon nuevo.

### Prueba B — Clon que sí requiere aprobación
1. Volver a clonar la misma Ganada.
2. En el Cotizador forzar un criterio:
   - Rental: cualquier venta rental (marca "Aprobación Venta Rental"), o
   - Inamar Izaje: subir cantidades para pasar **10 millones**, o poner un
     descuento sobre el permitido.
3. Guardar y revisar el clon en el CRM.

### Qué revisar en cada clon
| Revisar | Prueba A esperado | Prueba B esperado |
|---|---|---|
| Fase del clon | **Creada** | **Pendiente de Aprobación** |
| Casillas de aprobación | Todas en falso | La que corresponde en verdadero |
| Sub Fase | Vacía | Vacía hasta que apruebe; luego "Aprobado por …" |
| Aprobador | No recibe nada | Recibe la solicitud (en Sandbox, ver "Solicitudes de aprobación") |
| ID Cotizac. Original | Id de la Ganada | Id de la Ganada |
| Original | Sigue **Cerrada Ganada** | Sigue **Cerrada Ganada** |
| Oportunidad del clon | **Anotar cuál quedó** (ver ojo abajo) | Igual |
| Línea de tiempo del clon | "Ingresado al proceso: Creada" del Blueprint | "Enviado para aprobación" |

Si el clon queda en Creada **aunque cumpla criterios** (Prueba B), el
problema es el mismo de la re-aprobación al editar (el Cotizador no manda
"Pendiente de Aprobación"): anotar el número y lo revisamos.

### Ojo: la oportunidad
En Rental e Inamar el clon queda en la **misma oportunidad** de la original,
que ya está **Cerrada Ganada**. Revisar en la prueba:
- ¿La oportunidad ganada **cambia de fase** al crear/aprobar el clon? (regla
  "SB Actualizar Fase de Oportunidad según Cotización").
- ¿Su **importe** cambia? (regla "SB Guardar importe de la cotización" →
  función "SB Validar Importe Oportunidad", corre en cada clon).
Para "repetir venta otro mes" lo correcto es una **oportunidad nueva**; si
la prueba muestra que se pisa la ganada, se agrega como pedido al proveedor
(o se elige una oportunidad nueva en el Cotizador antes de guardar).

## Resultado de la prueba (llenar)
| Prueba | Cotización original | Clon | Fase del clon | ¿Aprobación? | Original | Oportunidad | OK |
|---|---|---|---|---|---|---|---|
| A | | | | | | | |
| B | | | | | | | |
