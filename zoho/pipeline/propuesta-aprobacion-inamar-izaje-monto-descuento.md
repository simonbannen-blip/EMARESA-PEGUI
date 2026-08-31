# Propuesta: aprobación nueva para UN Inamar Izaje — monto y descuento

## Estado: PENDIENTE DE TU OK — falta crear un campo nuevo antes de armar
la regla en Sandbox

## Qué se pidió

Nueva aprobación en **Cotizaciones**, para la **UN Inamar Izaje**: cuando
el monto de la cotización sea **mayor a $1.000.000** y el descuento
aplicado sea de **al menos 10%** del subtotal, la cotización debe pasar
por la aprobación de **Rodrigo Verdugo** (Gerente Inamar Izaje).

## Cómo queda armado en Zoho

**Módulo:** Cotizaciones (Quotes)

**Criterios (todos deben cumplirse):**

| # | Campo | Condición |
|---|---|---|
| 1 | UN | = Inamar Izaje |
| 2 | Fase de Cotización | = Pendiente de Aprobación |
| 3 | Total general | > 1.000.000 |
| 4 | % Descuento *(campo nuevo, ver abajo)* | ≥ 10% |

**Aprobador:** Rodrigo Verdugo — confirmado como usuario activo en Zoho
(`rverdugo@inamarizaje.cl`, rol "Gerente Inamar Izaje").

**Al aprobar:** Fase de Cotización → **Cotización Aprobada**.
**Al rechazar:** Fase de Cotización → **Cotización Rechazada** (mismo
comportamiento estándar que ya usan el resto de las aprobaciones).

## Campo nuevo necesario (para el criterio de 10%)

El campo `Descuento` guarda el descuento en **pesos**, no en porcentaje.
Como el monto de cada cotización es distinto, no se puede comparar contra
un número fijo — hace falta un campo que calcule el **porcentaje** de
descuento de cada cotización para poder comparar "≥ 10%" de forma
correcta sin importar el tamaño de la cotización.

- **Nombre sugerido:** `% Descuento`
- **Tipo:** fórmula (Descuento ÷ Subtotal sin descuento)
- **Uso:** queda disponible para reutilizar en futuras aprobaciones de
  otras UN, igual que ya pasa con los campos que usa Rental.

Puedo crear este campo yo mismo con las herramientas conectadas — pero
como es un cambio en el CRM real, **espero tu OK explícito** antes de
crearlo (nombre y fórmula tal como quedaron arriba, salvo que quieras
cambiar algo).

## Guía paso a paso para armar la regla en Sandbox

1. (Con tu OK) Creo el campo `% Descuento` en Cotizaciones.
2. Configuración → Automatización → Procesos de aprobación → Cotizaciones
   → **Nuevo proceso de aprobación**.
3. Nombre sugerido: **"UN Inamar Izaje - Aprobación Monto y Descuento"**.
4. Agregar los 4 criterios de la tabla de arriba.
5. Aprobador: Rodrigo Verdugo.
6. Acción después de aprobación final: campo `Fase de Cotización` =
   Cotización Aprobada.
7. Acción después del rechazo: campo `Fase de Cotización` = Cotización
   Rechazada.
8. Probar con una cotización de prueba de Inamar Izaje (monto > 1.000.000,
   descuento ≥ 10%): confirmar que le llega a Rodrigo y que aprobar/
   rechazar mueve la Fase como corresponde.
9. Repetir en Producción una vez validado en Sandbox.

## Ya confirmado (por vos, en esta sesión)

- UN: Inamar Izaje.
- Monto: mayor a $1.000.000 (corregido — no $10.000.000).
- Descuento: al menos 10% del subtotal de esa cotización específica (no
  un monto fijo en pesos).
- Aprobador: Rodrigo Verdugo.
- Acción al aprobar: pasa a "Cotización Aprobada" (sin función
  personalizada — no hace falta programar nada extra).

## Por qué no armo yo la regla completa

Crear/editar Procesos de aprobación no está entre las herramientas
conectadas del MCP de Zoho CRM (mismo límite ya documentado en la
propuesta de Rental — solo hay CRUD de registros y metadata de
módulos/campos, por eso sí puedo crear el campo `% Descuento`). Con tu
OK creo el campo, y te dejo esta guía para que armes el proceso de
aprobación vos mismo en el Sandbox; avisame cuando esté probado para
dejarlo anotado como implementado.
