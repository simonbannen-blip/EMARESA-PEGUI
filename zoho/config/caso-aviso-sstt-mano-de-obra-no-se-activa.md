# Caso: el aviso SSTT no salta cuando se cotiza MANO DE OBRA (0MANO-OBRA)

Fecha: 24-11-2026. Función: `automation.SBvalidarCierreCotizacionSSTT(id)`.

## Qué hace la función
Lee la cotización, recorre los Artículos presupuestados y, si algún producto
tiene una Línea de Negocio cuyo nombre contiene "SSTT", marca la casilla
`Notificar_SSTT = true` en la cotización (disparando workflows). El aviso real
(correo/tarea) lo debería mandar **otra regla** que reaccione a esa casilla.

## Qué se revisó en el CRM
- Producto MANO DE OBRA (`0MANO-OBRA`): Línea de Negocio = **SSTT FICTICIA**
  → cumple la condición `contains("SSTT")`. El código no es el problema.
- Campo `Notificar_SSTT` (casilla, Cotizaciones): existe desde 26-08-2026.
- **Ninguna cotización del CRM tiene `Notificar_SSTT = true`**, ni siquiera
  las 48 con mano de obra (7 de ellas Cerradas Ganadas).
- Historial completo de la 20261120-COT-II10029-3110 (creada → Cerrada Ganada
  el 20-11): corrieron "SB Guardar importe", "VS Cotización - crear/editar",
  "SB Enviar Fase a Creator", "SB Actualizar Fase de Oportunidad",
  "SB Verificar Empresa", y las funciones del blueprint. **La función
  SBvalidarCierreCotizacionSSTT no aparece nunca.**

## Conclusión
La función nunca se ejecuta: no hay ninguna regla de flujo de trabajo (ni
transición del blueprint) activa que la llame. Causas probables:
1. La regla que la asocia está desactivada o nunca se creó/guardó.
2. La regla existe pero su condición no se cumple nunca (p. ej. pide
   "Fase = Cerrada Ganada" en "al editar" pero la fase cambia por blueprint,
   o tiene un criterio que no aplica).
3. Por el nombre ("validarCierre") estaba pensada para el cierre, no para la
   creación: aunque funcionara, no avisaría al crear la cotización.

Además, como la casilla nunca se marcó, la regla que envía el aviso
(la que reacciona a "Notificar SSTT = Sí") tampoco se ha disparado nunca.

## Propuesta (pendiente OK de Simón)
1. Configuración → Automatización → Reglas de flujo de trabajo → Cotizaciones:
   buscar la regla que llama a `SBvalidarCierreCotizacionSSTT`.
   - Si no existe: crear "SB Aviso SSTT" — Cotizaciones, al **Crear o editar**,
     todas las cotizaciones, acción: función `SBvalidarCierreCotizacionSSTT`
     (argumento id = ID de cotización).
   - Si existe y está inactiva: activarla y cambiar el disparo a Crear o editar.
   (Las cotizaciones las crea el Cotizador por API — "Infraestructura Emaresa",
   `crm_api` — y las reglas sí corren en esos casos: lo muestra el historial.)
2. Confirmar que existe la segunda regla: Cotizaciones, al editar, condición
   "Notificar SSTT = Sí", acción correo/tarea al responsable SSTT.
3. Ajustes al código:
   - Si la casilla ya está en true, no volver a actualizarla (evita avisos
     repetidos en cada edición): `if(cotizacion.get("Notificar_SSTT") != true && productoSstt)`.
   - Proteger productos sin Línea de Negocio: hoy `.get("L_nea_de_Negocio").get("name")`
     falla si viene vacío y corta la función. Usar `ifnull(...)`.
   - El `return;` dentro del if no es necesario (no hace daño).

## Actualización 24-11 — captura de "Detalles de la función"
Simón mandó la ficha de "SB Validar cierre de cotizacion SSTT": el argumento
`id` aparece **sin valor asignado** (`id = ` vacío). Cuando una función está
asociada a una regla, ahí se ve el mapeo (p. ej. `id = Cotizaciones - ID de
Cotización`). Junto con que la función no aparece en ningún historial, se
confirma: **no está asociada a ninguna regla** (o lo está sin el argumento
mapeado). Solución: asociarla a una regla de Cotizaciones (al Crear o editar)
y mapear `id` → ID de Cotización.
