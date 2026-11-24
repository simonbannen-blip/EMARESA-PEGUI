# Guía Sandbox: aprobación de descuento Rental en 4 tramos (opción CRM)

Simón lo arma él mismo en Sandbox (24-11-2026). Propuesta base:
`propuesta-rental-aprobacion-descuento-4-tramos.md`.

| Descuento | Aprueba y recibe aviso |
|---|---|
| ≤ 5% | nadie (vendedor) |
| > 5% y ≤ 10% | Jefe Zonal (Norte: Jaime Zúñiga · Centro: Jaime Rojas · Sur: Eduardo Roldán) |
| > 10% y ≤ 15% | Mauricio Correa |
| > 15% | Andrés Salah |

El Cotizador sigue marcando como hoy: `Aprobación Descuento` (>5%) y
`Rental - superó Porcentaje Descuento` (>15%) — config IDFUNC-59, no se toca.

## Paso 1 — Campo fórmula en Cotizaciones

Configuración → Módulos y campos → Cotizaciones → Standard → arrastrar
**Fórmula**:
- Nombre: **% Descuento Cotización**
- Tipo de retorno: Decimal, 2 decimales
- Fórmula (insertar los campos con "Seleccionar campo"):
  `If(${Cotizaciones.Subtotal sin descuento} > 0, ${Cotizaciones.Descuento Total de Productos} / ${Cotizaciones.Subtotal sin descuento} * 100, 0)`
- Ubicarlo en una sección visible (sirve también para ver el % en la ficha).
- Comprobar en una cotización: COT-REN-6926 → 12,81 · COT-REN-6909 → 10,00.

Si el campo fórmula no aparece al armar criterios en el paso 2/3, avisar
(alternativa: campo decimal llenado por regla).

## Paso 2 — Proceso de aprobación "UN Rental - Arriendo"

Configuración → Automatización → Procesos de aprobación → Cotizaciones.

1. Reglas Jefe Zonal Norte / Centro / Sur: agregar criterio
   **% Descuento Cotización ≤ 10**. Aprobador: el jefe de la zona.
2. **Regla nueva "Subgerente"** (sin zona): UN = Rental · Fase = Pendiente
   de Aprobación · Tipo de Negocio = Arriendo · Aprobación Descuento =
   Seleccionado · Rental - superó Porcentaje Descuento = No seleccionado ·
   **% Descuento Cotización > 10**. Aprobador: **Mauricio Correa**.
   Acciones al aprobar/rechazar: copiar las de las reglas de jefe zonal.
3. Regla Gerente (superó = Seleccionado): aprobador único **Andrés Salah**
   (sin jefe zonal antes: cada tramo aprueba solo).
4. Orden: Jefes zonales → Subgerente → Gerente.

## Paso 3 — Correos de aviso (Reglas de flujo, Cotizaciones)

1. "Notificar jefe zona Norte/Centro/Sur Rental": agregar
   **% Descuento Cotización ≤ 10**.
2. **Nueva "Notificar Subgerente Rental"** (clonar la de zona Norte):
   quitar Zona, Superó = No seleccionado, **% Descuento Cotización > 10**.
   Correo: clonar plantilla "Aprobación Rental Zona norte" → Para: Mauricio
   Correa.
3. "Notificar Gerente Rental": condición **Superó = Seleccionado** (en agosto
   estaba "No seleccionado"), Para: Andrés Salah.

## Paso 4 — Pruebas

Cotizaciones Rental en Sandbox, una por caso (si el Cotizador no está
conectado al Sandbox, crearlas a mano y marcar las casillas a mano —
están en la sección "Ocultar"):

| Caso | % | Aprobación Desc. | Superó | Debe ir a |
|---|---|---|---|---|
| 1 | 4% | No | No | nadie |
| 2 | 8% | Sí | No | Jefe Zonal de la zona |
| 3 | 10% | Sí | No | Jefe Zonal |
| 4 | 12% | Sí | No | Mauricio Correa |
| 5 | 15% | Sí | No | Mauricio Correa |
| 6 | 18% | Sí | Sí | Andrés Salah |

Revisar en Cronología: a quién quedó asignada la aprobación y qué correo
salió. En Sandbox usar el propio correo como destinatario si no se quiere
avisar a la gente real.

## Paso 5 — Producción

Validado en Sandbox → desplegar a Producción y actualizar el comentario de
IDFUNC-59.
