# Propuesta: recordatorio de vencimiento para todas las UN (Oportunidades + Cotizaciones)

Estado: **paso 3 — Simón edita la regla de Oportunidades en Zoho**
Fecha: 2026-11-17

## Situación actual (verificada en el CRM)

Regla existente **"Recordatorio Oportunidades"** (id 5404724000579956014), módulo Oportunidades.

- **Cuándo:** basada en fecha (Fecha de cierre / `Closing_Date`). Se ejecuta el día siguiente
  a la fecha de cierre, ~13:00.
- **Condición:** Nombre de UN = Inamar Izaje **Y** Fase no es Cerrada Ganada / Cerrada Perdida.
- **Acciones:** correo "Oportunidad" (plantilla id 5404724000579956007) al propietario de la
  oportunidad: 1 instantáneo + programados a 1, 2, 3, 4… días después (uno diario).
- **Funciona:** última ejecución 2026-11-17 13:00 (Fabián Rodríguez, 261026-OP-II-10022-002589).
  El panel de estadísticas de la regla marca 0 envíos, pero el historial de cada oportunidad
  sí registra "Correo enviado". Fiarse del historial, no del panel.
- Inamar Izaje además tiene la regla **"SB Inamar Izaje - Notificar Oportunidad por vencer"**
  (aviso *antes* del vencimiento, id 5404724000035478076).

## Volumen: oportunidades abiertas por UN

| UN | Abiertas |
|---|---:|
| Rental | 3.621 |
| Emakip | 1.921 |
| Maquinaria | 1.438 |
| Ferretek | 1.227 |
| Inamar Izaje | 1.069 (ya tiene la regla) |
| Maestranza Inamar Vapor | 161 |
| Emafex | 40 |
| Maktotal | 25 |
| Distribución | 22 |
| Ematerra | 21 |
| Terra | 4 |

Todas las oportunidades tienen Fecha de cierre llena.

## Cotizaciones (datos para el diseño)

- Fecha de referencia disponible: **Válido hasta** (`Valid_Till`). Todas las cotizaciones la tienen llena.
- UN: campo lookup `UN`.
- Fases "abiertas" candidatas (con cantidad actual): Creada (7.312), Enviada (3.154),
  Cotización Aprobada / Cotizacion Aprobada (549 + 730), Parcialmente Aprobada (363),
  Pendiente de Aprobación (180 + 150), Pendiente de revisión (133), Lista para Confirmar (103),
  Lista para Clonar (25), Sin Stock suficiente (22), Direc. Facturación/Despacho validada (19 + 16).
- Fases "cerradas": Cerrada Ganada, Cerrada Perdida, Ganada, Cotización Rechazada / Cotizacion Rechazada,
  Recotizada.

## Nota

Las reglas basadas en fecha no son retroactivas: al activarlas, las oportunidades o cotizaciones
que ya vencieron no reciben el correo de golpe. Empiezan a llegar solo para las que venzan
de ahí en adelante.

## Pasos

1. ✅ Diagnóstico (este documento).
2. ✅ Decisiones de Simón (ver abajo).
3. ⏳ Oportunidades: ampliar a todas las UN (lo configura Simón en Zoho, las reglas no se crean por MCP).
4. Verificar en el historial de una oportunidad de otra UN al día siguiente.
5. Cotizaciones: crear la regla nueva.
6. Verificar en el historial de una cotización.

## Decisiones de Simón (2026-11-17)

- Oportunidades: **una sola regla para todas las UN** (quitar el filtro de UN de la regla actual).
- Cotizaciones: avisar en **todas las fases menos las cerradas** (Cerrada Ganada, Cerrada Perdida,
  Ganada, Cotización Rechazada, Cotizacion Rechazada, Recotizada).
- Días: **los mismos que la regla actual** (instantáneo + programados diarios).

## Impacto estimado (oportunidades que vencen entre 18 y 24 de noviembre)

Rental 152 · Inamar Izaje 65 · Maquinaria 63 · Maestranza Inamar Vapor 10. Las demás UN no
tienen oportunidades con cierre esa semana (sus abiertas están vencidas hace tiempo y, como la
regla no es retroactiva, no van a recibir correos).

## Paso 3 — Editar "Recordatorio Oportunidades" (lo hace Simón en Zoho)

1. Configuración → Automatización → Reglas de flujo de trabajo → **Recordatorio Oportunidades** → Editar.
2. **Antes de tocar la condición**, abrir la plantilla de correo **"Oportunidad"** y revisar
   que no diga "Inamar Izaje" (logo, firma, texto). Si lo dice, dejarla genérica.
3. En **Condición 1**, borrar el criterio **"Nombre de UN es Inamar Izaje"**.
   Debe quedar solo: **Fase no está Cerrada Ganada, Cerrada Perdida**.
4. No tocar "Cuándo" ni las acciones. Guardar.
5. Opcional: cambiar el nombre a "Recordatorio Oportunidades - Todas las UN".
