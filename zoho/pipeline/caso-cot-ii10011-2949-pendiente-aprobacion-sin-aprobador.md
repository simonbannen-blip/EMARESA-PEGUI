# Caso COT-II10011-2949 — queda en "Pendiente de Aprobación" sin aprobador (Juan Marchant)

**Fecha:** 2026-11-09 · **Estado:** diagnóstico listo, propuesta pendiente de OK de Simón.

## Cotización

- `20261109-COT-II10011-2949` (id 5404724000631604735), UN Inamar Izaje,
  dueño **Juan Marchant** (rol Product Manager Equipos, código 10011),
  cliente Codelco, CLP 19.044.000. Creada por el Cotizador (usuario
  Infraestructura Emaresa, vía API).

## Qué pasó (Timeline)

| Hora | Quién | Qué |
|---|---|---|
| 11:39:47 | Cotizador (API) | Crea la cotización, ya en Fase **Pendiente de Aprobación** |
| 11:39:49 | Cotizador (API) | Marca `Aprobación Sobre 10 millones` = verdadero |
| 11:39:50 | Regla "Notificar Subgerente Inamar Izaje" | Mail a Dieter Steinmeyer pidiendo aprobación |
| — | — | **El proceso de aprobación "UN Izaje Aprobación sobre 10 millones" NO entra** (no hay "enviado a aprobación", nadie tiene botón Aprobar) |
| 11:45:51 | Simón (a mano) | Cambia Fase Pendiente de Aprobación → **Creada** |

## Comparación con una cotización normal

`20261106-COT-II10004-2943` (dueño Claudio Valdés, mismo cliente, 27,5 MM):
el mismo proceso **sí entra** (11:52:16 "enviado", aprobadores Dieter
Steinmeyer / Sebastián Toro, luego Rodrigo Verdugo) y al aprobar pasa a
"Cotización Aprobada". O sea, el proceso funciona; **solo se salta a Juan
Marchant**.

## Se repite siempre con Juan Marchant (sobre 10 MM)

| Cotización | Fecha | Monto | Qué pasó |
|---|---|---|---|
| COT-II10011-2228 | 08-09 | 19.040.000 | (terminó Cerrada Ganada) |
| COT-II10011-2341 | 21-09 | 21.600.882 | **Sigue trabada en "Pendiente de Aprobación"** desde hace 7 semanas, sin aprobador |
| COT-II10011-2782 | 27-10 | 13.095.155 | Mismo patrón: Simón la pasó a Creada a mano a los 2 min |
| COT-II10011-2949 | 09-11 | 19.044.000 | Este caso |

Las cotizaciones de Juan bajo 10 MM no tienen problema.

## Causa

Dos piezas que no están de acuerdo entre sí:

1. **El proceso de aprobación** "UN Izaje Aprobación sobre 10 millones"
   tiene algún criterio que **deja fuera a Juan Marchant** (por dueño o
   por rol "Product Manager Equipos") — coherente con que él no necesita
   aprobación. No es legible por el MCP; hay que confirmarlo mirando sus
   criterios.
2. **El Cotizador** (y la regla de mail "Notificar Subgerente Inamar
   Izaje") **no tienen esa excepción**: toda cotización de Inamar Izaje
   sobre 10 MM la crea en "Pendiente de Aprobación" y avisa a Dieter.

Resultado: la cotización queda en una fase de espera que nadie puede
destrabar (ni aprobar ni rechazar), hasta que alguien la cambia a mano.

Nota: el indicador interno de aprobación de la cotización figura como
"aprobado", pero es el valor por defecto de Zoho cuando un registro no está
en ningún proceso — no significa que alguien la haya aprobado.

## Propuesta (no aplicada — esperar OK)

**Opción A (recomendada, en el CRM, sin código):** regla de flujo de trabajo
en Cotizaciones:

- Nombre: "Inamar Izaje - Sin aprobación para exentos"
- Cuándo: al **Crear o Editar** (repetir en cada edición).
- Condición: UN = Inamar Izaje **y** Fase de Cotización = Pendiente de
  Aprobación **y** Propietario = Juan Marchant (usar exactamente el mismo
  criterio de exclusión que tenga el proceso de aprobación; si es por rol,
  usar el rol).
- Acción: Actualizar campo → Fase de Cotización = **Creada**.
- Además: agregar la misma excepción a la regla "Notificar Subgerente
  Inamar Izaje" para que no le llegue el mail a Dieter.

**Opción B:** pedir al proveedor del Cotizador que no ponga "Pendiente de
Aprobación" cuando el vendedor está exento. Es lo más limpio, pero depende
de terceros.

**Inmediato:** pasar `COT-II10011-2341` (trabada desde 21-09) a "Creada",
igual que se hizo con 2949. Lo puedo hacer yo con OK de Simón.

## Pendiente de Simón

1. Confirmar que Juan Marchant **sí está exento** de la aprobación sobre
   10 MM (y si hay otros exentos), mirando los criterios del proceso.
2. OK para armar Opción A y para destrabar la 2341.
