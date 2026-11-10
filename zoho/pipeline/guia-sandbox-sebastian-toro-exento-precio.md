# Guía Sandbox: Sebastián Toro exento de aprobaciones de precio

**Fecha:** 2026-11-09 · Diseño: `propuesta-sebastian-toro-exento-aprobacion-precio.md`.
Hacer primero en **Sandbox**; si las pruebas salen bien, repetir igual en
**Producción**. Tiempo: ~30 min.

## Paso 0 — Antes de empezar
1. Entrar al Sandbox de Zoho CRM.
2. Confirmar que existe el usuario **Sebastian Toro** (Configuración →
   Usuarios). Si no está, usar en las pruebas otro usuario de prueba y
   reemplazar su nombre en todos los pasos (en Producción va Sebastián).
3. Confirmar que existen los 2 procesos de aprobación de Cotizaciones:
   "UN Inamar Izaje - Aprobaciones" y "UN Izaje Aprobación sobre 10
   millones".

## Paso 1 — Regla 1 del proceso de precio
1. Configuración → Automatización → **Procesos de aprobación** →
   Cotizaciones → **UN Inamar Izaje - Aprobaciones** → Editar.
2. Regla **1** → editar criterios → **+** al final → criterio 8:
   **Propietario de Cotización** · **no está** · **Sebastian Toro**.
3. **Editar patrón** → `((1 y (((2 y 3) y 4) o ((5 y 6) y 7))) y 8)`.
4. No tocar aprobadores ni acciones.

## Paso 2 — Regla 2 del mismo proceso
1. Regla **2** → criterio 4: **Propietario de Cotización** · **no está** ·
   **Sebastian Toro**.
2. Patrón: `(((1 y 2) y 3) y 4)`.
3. **Guardar** el proceso (queda activo).

> No tocar "UN Izaje Aprobación sobre 10 millones".

## Paso 3 — Regla de flujo nueva
1. Configuración → Automatización → **Reglas de flujo de trabajo** →
   **Crear regla**.
2. Módulo **Cotizaciones** · Nombre **In Iz - Sebastián Toro sin
   aprobación de precio**.
3. **Cuándo:** Acción en el registro → **Editar** → marcar **Repetir esta
   regla cada vez que se edite** · cualquier campo.
4. **Condición:**
   1. UN · es · Inamar Izaje
   2. Fase de Cotización · es · Pendiente de Aprobación
   3. Propietario de Cotización · es · Sebastian Toro
   4. Aprobación Sobre 10 millones · es · No seleccionado
   5. Aprobación Descuento Monto Mínimo · es · Seleccionado
   6. Aprobación Descuento · es · Seleccionado
   - Editar patrón: `((((1 y 2) y 3) y 4) y (5 o 6))`
5. **Acción instantánea** → Actualización de campo → Nombre "In Iz -
   Sebastián creada" · Fase de Cotización · Estático · **Creada** →
   Guardar y asociar. (El aviso de "Mostrar Información de pérdida" se
   puede ignorar.)
6. Guardar y dejar **activa**.

## Paso 4 — Pruebas
Si el Cotizador de Sandbox está conectado al CRM Sandbox, crear las
cotizaciones desde ahí (es lo más real). Si no, a mano: crear la
cotización UN Inamar Izaje, dueño Sebastián, Fase "Pendiente de
Aprobación", guardar; luego **editarla** marcando las casillas indicadas
y guardar (la regla corre al editar).

| # | Cotización de Sebastián | Casillas | Debe pasar |
|---|---|---|---|
| A | bajo 10 MM | Monto Mínimo | Queda en **Creada**, sin aprobación |
| B | bajo 10 MM | Aprobación Descuento | Queda en **Creada**, sin aprobación |
| C | sobre 10 MM | Monto Mínimo + Sobre 10 millones | Sigue en Pendiente y entra **solo** "Aprobación sobre 10 millones" (Sub Gerente → Gerente) |
| D | sobre 10 MM | solo Sobre 10 millones | Igual que hoy: aprobación de monto |
| E | **otro vendedor**, bajo 10 MM | Monto Mínimo | Igual que hoy: aprobación de Product Manager Izaje |

Dónde mirar: en la cotización, **Línea de tiempo**: en A/B debe aparecer
la regla "In Iz - Sebastián Toro sin aprobación de precio" cambiando la
Fase; en C/D/E debe aparecer "enviado para aprobación" con el proceso
correcto.

Anotar cualquier caso que no salga como la tabla y avisar antes de pasar
a Producción.

## Paso 5 — Producción
Repetir Pasos 1, 2 y 3 igual en Producción (Zoho no copia esta
configuración solo). Probar con una cotización real de Sebastián o
revisar la primera que haga.

## Ojo
- Si en el futuro se exime a otra persona del precio, agregarla en los
  3 lugares: Regla 1, Regla 2 y la regla de flujo.
- Regla 1: la rama `(5 y 6) y 7` no exige la casilla Monto Mínimo
  (anotado, no se cambia en esta tanda).

## Nota 09-11: la Regla 1 del Sandbox es distinta a la de Producción

Captura de Simón (Sandbox): la Regla 1 tiene un criterio 8 extra
**Total general > CLP 1.000.000**, patrón `((1 y (((2 y 3) y 4) o ((5 y 6) y 7))) y 8)`,
y dos aprobadores en orden (Product Manager Izaje → Gerente Inamar Izaje).
En Producción (captura anterior) no tiene el criterio 8 y aprueba solo
Product Manager Izaje.

- **En Sandbox:** el criterio de Sebastián va como **9**; patrón
  `((1 y (((2 y 3) y 4) o ((5 y 6) y 7))) y 8) y 9`.
- Prueba E en Sandbox: el otro vendedor necesita total > 1.000.000 para
  que pida aprobación (PM Izaje y después Gerente).
- **En Producción:** seguir el Paso 1 tal cual (criterio 8, patrón
  original). No copiar a Producción el "Total general > 1.000.000" ni el
  Gerente como 2º aprobador salvo que sea un cambio decidido aparte.

## Contexto del criterio "Total general > 1.000.000" (Simón, 09-11)

Es un cambio que Simón probó tiempo atrás en Sandbox: se decidió pedir
aprobación de precio solo sobre $1.000.000 y no bajo ese monto, para
agilizar las ventas chicas. Todavía no está en Producción.

Si se lleva a Producción, ojo con lo mismo que pasó con Juan Marchant: el
Cotizador igual deja en "Pendiente de Aprobación" las cotizaciones bajo
1 MM con la casilla de precio, y el proceso no entraría → quedarían
trabadas sin aprobador. Hace falta una regla de flujo que las devuelva a
"Creada" (UN Inamar Izaje · Fase Pendiente de Aprobación · Total general
≤ 1.000.000 · Monto Mínimo o Aprobación Descuento seleccionado → Fase
Creada). Además definir si la Regla 2 (descuento por ítem) también lleva
el umbral de 1 MM (hoy en Sandbox solo lo tiene la Regla 1) y si el
Gerente queda como 2º aprobador.

## Decisión 09-11: dejar Sandbox igual a Producción

Simón decidió **no** llevar el umbral de $1 MM. En Sandbox, antes del
Paso 1, dejar la Regla 1 igual a Producción:
- Borrar el criterio 8 "Total general > CLP 1.000.000".
- Quitar al Gerente Inamar Izaje como 2º aprobador (queda solo Product
  Manager Izaje, "Cualquier").
- Luego seguir la guía normal: Sebastián como criterio **8**, patrón
  `((1 y (((2 y 3) y 4) o ((5 y 6) y 7))) y 8)`.
La nota de "criterio 9" de más arriba queda sin efecto.

## Corrección 10-11: patrón de la Regla 1
Zoho rechazó `(1 y 8 y (...))` ("Compruebe el patrón en 8"): exige
paréntesis de a dos elementos. Patrón correcto:
`((1 y (((2 y 3) y 4) o ((5 y 6) y 7))) y 8)` (mismo formato que generó
Zoho cuando el 8 era "Total general"). Ya corregido arriba.

## Decisión 10-11: la Regla 2 (descuento por ítem) NO se toca

Sebastián queda exento solo de **precio bajo el mínimo** (Regla 1); el
descuento por ítem (Regla 2) le sigue pidiendo aprobación.

Por eso cambia la regla de flujo (Paso 3): no debe actuar mientras la
Regla 2 está pendiente, pero sí después de aprobada (la Regla 2 deja Sub
Fase "Aprobado por Descuento de Item - 1" y encadena a la Regla 1, que ya
lo excluye → quedaría trabada en Pendiente).

Condiciones nuevas:
1. UN es Inamar Izaje
2. Fase de Cotización es Pendiente de Aprobación
3. Propietario de Cotización es Sebastian Toro
4. Aprobación Sobre 10 millones es No seleccionado
5. Aprobación Descuento Monto Mínimo es Seleccionado
6. Aprobación Descuento es No seleccionado
7. Sub Fase de Cotización es Aprobado por Descuento de Item - 1

Patrón: `((((1 y 2) y 3) y 4) y 5) y (6 o 7))` → en formato Zoho:
`(((((1 y 2) y 3) y 4) y 5) y (6 o 7))`. Acción: Fase = Creada.

Pruebas que cambian: B (solo Aprobación Descuento) → **pide aprobación**
de Product Manager Izaje como hoy. Nueva F: Monto Mínimo + Aprobación
Descuento → primero aprobación de descuento por ítem; al aprobarla debe
quedar en **Creada** (sin la 2ª aprobación de mínimo).
