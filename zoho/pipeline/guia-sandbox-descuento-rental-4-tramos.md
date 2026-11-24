# Guía Sandbox: aprobación de descuento Rental en 4 tramos (opción CRM)

Simón lo arma él mismo en Sandbox (24-11-2026). Propuesta base:
`propuesta-rental-aprobacion-descuento-4-tramos.md`.

| Descuento | Aprueba y recibe aviso |
|---|---|
| ≤ 5% | nadie (vendedor) |
| > 5% y ≤ 10% | Jefe Zonal (Norte: Jaime Zúñiga · Centro: Jaime Rojas · Sur: Eduardo Roldán) |
| > 10% y ≤ 15% | Mauricio Correa |
| > 15% | Andrés Salah |

**Versión 2 (24-11-2026):** no se encontró en el Cotizador dónde marca
"superó 15%", así que los tramos se arman **solo con el campo fórmula**.
`Aprobación Descuento` (que marca el Cotizador por línea, >5%) queda como
puerta de entrada; "Rental - superó Porcentaje Descuento" ya no se usa en
las reglas. Config IDFUNC-59 no se toca.

Criterios (todas las reglas llevan además Aprobación Descuento = Seleccionado):
- Jefe Zonal (por zona): % Descuento Cotización **≤ 10** (sin piso, para que
  ninguna cotización quede sin aprobador si el Cotizador marcó por un ítem).
- Mauricio Correa: % **> 10 y ≤ 15**.
- Andrés Salah: % **> 15**.

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
   Seleccionado · **% Descuento Cotización > 10** · **% Descuento
   Cotización ≤ 15**. Aprobador: **Mauricio Correa**.
   Acciones al aprobar/rechazar: copiar las de las reglas de jefe zonal.
3. Regla Gerente: reemplazar el criterio "superó = Seleccionado" por
   **% Descuento Cotización > 15** (más Aprobación Descuento = Seleccionado);
   aprobador único **Andrés Salah** (cada tramo aprueba solo).
   En las reglas de Jefe Zonal, quitar "superó = No seleccionado".
4. Orden: Jefes zonales → Subgerente → Gerente.

## Paso 3 — Correos de aviso (Reglas de flujo, Cotizaciones)

1. "Notificar jefe zona Norte/Centro/Sur Rental": agregar
   **% Descuento Cotización ≤ 10**.
2. **Nueva "Notificar Subgerente Rental"** (clonar la de zona Norte):
   quitar Zona y "superó", **% > 10 y ≤ 15**.
   Correo: clonar plantilla "Aprobación Rental Zona norte" → Para: Mauricio
   Correa.
3. "Notificar Gerente Rental": reemplazar la condición de "superó" por
   **% Descuento Cotización > 15**, Para: Andrés Salah.
4. En los avisos de jefe de zona, quitar "superó" y dejar **% ≤ 10**.

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
