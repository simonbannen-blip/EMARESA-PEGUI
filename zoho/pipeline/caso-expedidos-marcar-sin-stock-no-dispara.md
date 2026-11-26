# Caso: función nueva de expedidos no se dispara con "Marcar Sin Stock"

Fecha: 2026-11-26 · Ambiente: pruebas de Simón (usuario "Simon Tirapegui")

## Síntoma
En el historial de la cotización aparece 3 veces:
"Fase de Cotización **Sin Stock suficiente sigue sin modificar** — por Simon
Tirapegui mediante transición: Marcar Sin Stock (Blueprint SB Gestión de
Cotizaciones)". Entre medio solo corren funciones de reglas de flujo
(SB Validar Importe Oportunidad, vendedorSecundarioCotizacion). La función
nueva de expedidos nunca aparece.

## Diagnóstico
1. **La cotización ya estaba en "Sin Stock suficiente"** antes de la prueba.
   "Marcar Sin Stock" es transición común (marca C) y su destino también está
   entre sus fases de origen, así que se puede ejecutar estando ya en Sin
   Stock: corre, pero la fase no cambia ("sigue sin modificar").
2. Como la fase no cambia, **cualquier regla de flujo con disparador "cuando
   Fase de Cotización se modifica / cambia a Sin Stock suficiente" no corre**.
   Si la función de expedidos cuelga de una regla así, este es el motivo.
3. Si la función estuviera en las acciones "Después" de la transición, el
   historial mostraría "Se ha llamado a la función … a través de Blueprint"
   (incluso si falla). No aparece → la función **no está conectada a la
   transición**.

## Cómo probar bien
- Usar una cotización en otra fase (p. ej. Creada / Aprobada) y ejecutar
  "Marcar Sin Stock" una sola vez.
- Conectar la función en Blueprint → transición "Marcar Sin Stock" →
  pestaña **Después** → Acciones → Función (no depender de una regla por
  cambio de fase).
- Opcional: sacar "Sin Stock suficiente" de las fases de origen de
  "Marcar Sin Stock" para que no se pueda re-ejecutar estando ya en esa fase.

## Pendiente
- Confirmar con Simón dónde está conectada la función de expedidos
  (transición vs. regla de flujo) y su condición.

## Aclaración de Simón (26-11)
Lo esperado es que **al ejecutar "Marcar Sin Stock" aparezca la ventana con
las opciones de expedido** (campos en la pestaña "Durante" de la transición).
En producción no existe aún ningún campo de expedido en Cotizaciones (solo
el check "Sin Stock suficiente"), así que se está armando en Sandbox.

La transición se ejecuta sin mostrar ventana → para el CRM la transición no
tiene campos "Durante" visibles. Revisar en este orden:
1. **Blueprint publicado**: tras editar la transición hay que pulsar
   *Publicar*; si quedó como borrador, sigue corriendo la versión anterior.
2. **Campos en el diseño**: los campos de expedido deben estar en el diseño
   (layout) de la cotización de prueba (p. ej. Construcción). Si no están en
   ese diseño, el Blueprint no los muestra.
3. **Permisos de campo**: si para el perfil del usuario están ocultos o solo
   lectura, no aparecen en la ventana.
4. **Transición correcta**: confirmar que se editó "Marcar Sin Stock" del
   Blueprint "SB Gestión de Cotizaciones" (la común, marca C) y no otra.
5. **Campos condicionales**: si se agregaron como condicionales, la condición
   tiene que cumplirse.
