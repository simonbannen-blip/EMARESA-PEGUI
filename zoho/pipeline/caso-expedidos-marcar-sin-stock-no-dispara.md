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

## Capturas de la configuración (26-11, Sandbox)
- Lienzo: "Marcar Sin Stock" (común, C) aparece como **bucle sobre "Sin Stock
  suficiente"**: sale y vuelve a la misma fase. A Sin Stock se llega por las
  transiciones "No En…" / "Enviar …" desde Lista para Confirmar.
- Antes: propietarios = Infraestructura Em…; sin criterios.
- **Durante: vacío** (solo el botón "+ Agregar"). → Causa confirmada: la
  ventana no aparece porque no hay ningún campo agregado.

## Pasos para dejarlo funcionando
1. Crear en Cotizaciones (Sandbox) los campos de expedido si no existen y
   ponerlos en el diseño que se usa en la prueba.
2. Transición "Marcar Sin Stock" → **Durante → + Agregar → Campos** → elegir
   los campos de expedido (marcar obligatorios los que correspondan).
3. Definir desde qué fases se puede marcar (link "Incluir todos los estados"
   o elegir fases puntuales, p. ej. Lista para Confirmar / Direcciones
   validadas). Hoy solo sale desde Sin Stock, por eso la fase nunca cambia.
4. **Publicar** el Blueprint y probar con una cotización que no esté en Sin
   Stock.

## Cotización de prueba COT-CONST-999999-0174 (26-11, Sandbox)
- UN Construcción, ya en **Sin Stock suficiente**, puesta por el sistema
  (Detalle Revisión: "La cotización contiene productos sin stock disponible -
  SKU 1650000785070 - (0)…").
- Botones visibles: Perder Cotización y **Marcar Sin Stock** → el botón sí
  aparece; al pulsarlo se ejecuta directo porque "Durante" está vacío.
- **Corrección al paso 3 anterior**: como el sistema ya deja la cotización en
  Sin Stock, el bucle de "Marcar Sin Stock" puede quedar así (sirve para
  pedir las opciones de expedido sin mover la fase). Lo que falta es:
  1. Campos de expedido en **Durante**.
  2. La función de expedidos en **Después** de la transición (no en una
     regla por cambio de fase, que no corre porque la fase no cambia).
  3. Opcional: renombrar el botón (p. ej. "Solicitar Expedido") y decidir si
     después debe pasar a otra fase en vez de quedarse en Sin Stock.
