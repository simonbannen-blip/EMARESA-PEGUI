# Propuesta: en la aprobación de Rental, que el Gerente reciba la
cotización recién después de que la apruebe el Jefe de Zona

## Estado: PROPUESTA — falta confirmar con vos el detalle antes de armarla
en el Sandbox

## Qué se pidió

En el **Proceso de aprobación "UN Rental - Arriendo"** (módulo Cotizaciones),
que cuando el caso le corresponda al **Gerente** (regla 2, cuando el
descuento supera el umbral), la cotización **pase primero por el Jefe de
Zona correspondiente**, y recién si él la aprueba, suba al Gerente.

## Lo que muestra la captura que mandaste

El proceso tiene (al menos) estas 2 reglas, evaluadas de arriba hacia abajo:

- **Regla 1**: UN=Rental, Fase=Pendiente de Aprobación, Aprobación
  Descuento=Seleccionado, **Zona=Zona Norte**, Rental-superó Porcentaje
  Descuento=**No seleccionado**, Tipo de Negocio=Arriendo → aprobador
  **Jefe Ventas Zona Norte**.
- **Regla 2**: UN=Rental, Fase=Pendiente de Aprobación, Aprobación
  Descuento=Seleccionado, Rental-superó Porcentaje Descuento=**Seleccionado**,
  Tipo de Negocio=Arriendo → aprobador **Gerente Rental** — **sin criterio
  de Zona**, o sea aplica igual para Norte, Centro y Sur.

En Zoho, un proceso de aprobación evalúa las reglas en orden y la
cotización sigue **solo la primera regla que le calce** — por eso hoy,
cuando se supera el % de descuento, la Regla 2 la agarra directo y va al
Gerente sin pasar por nadie más, sea cual sea la zona.

## Cómo se resuelve en Zoho

Zoho permite que **una misma regla** tenga más de un aprobador en
**secuencia** (primero uno, y solo si aprueba pasa al siguiente) — es la
función de "agregar otro aprobador" dentro de la regla, no el
"+ Agregar otra regla" que arma reglas nuevas. Con eso se puede armar la
regla 2 para que primero pida la aprobación del Jefe de Zona y después,
recién si aprueba, la mande al Gerente.

El problema es que la Regla 2 de hoy **no distingue zona** (no tiene el
criterio Zona=Norte/Centro/Sur como sí tiene la Regla 1), así que no hay
una única regla donde meter "el Jefe de Zona" — hace falta saber de qué
zona es la cotización para saber a qué Jefe mandarla primero.

**Propuesta**: reemplazar la Regla 2 única por **3 reglas**, una por zona
(mismo patrón que ya usa la Regla 1), cada una con **2 aprobadores en
secuencia**:

| Regla | Criterios (igual a la Regla 2 actual + Zona) | 1er aprobador | 2do aprobador |
|---|---|---|---|
| 2a | Zona = Zona Norte + resto igual a Regla 2 | Jefe Ventas Zona Norte | Gerente Rental |
| 2b | Zona = Zona Centro + resto igual a Regla 2 | Jefe Ventas Zona Centro | Gerente Rental |
| 2c | Zona = Zona Sur + resto igual a Regla 2 | Jefe Ventas Zona Sur | Gerente Rental |

Así, cuando se supera el % de descuento: primero la ve el Jefe de la zona
que corresponda (igual que en la Regla 1), y **solo si él la aprueba**,
Zoho la manda automáticamente al Gerente Rental como segundo paso. Si el
Jefe de Zona la rechaza, no llega al Gerente (queda como "Cotización
Rechazada", igual que pasa hoy si rechaza cualquier aprobador).

## Guía paso a paso (Sandbox)

1. Entrar a **Configuración → Automatización → Procesos de aprobación →
   "UN Rental - Arriendo"** (Módulo: Cotizaciones).
2. Duplicar la Regla 2 actual dos veces, para terminar con 3 copias.
3. En cada copia, agregar el criterio **Zona = Zona Norte / Centro / Sur**
   (una zona distinta en cada copia), dejando el resto de los criterios
   igual (UN=Rental, Fase=Pendiente de Aprobación, Aprobación
   Descuento=Seleccionado, Rental-superó Porcentaje Descuento=Seleccionado,
   Tipo de Negocio=Arriendo).
4. En cada copia, dejar como **primer aprobador** al Jefe de Zona que
   corresponda (Jefe Ventas Zona Norte / Centro / Sur) y **agregar un
   segundo aprobador**: Gerente Rental.
5. Borrar la Regla 2 original (la que no distingue zona), una vez que las
   3 copias estén armadas y probadas.
6. Revisar el **orden de las reglas** con "Reordenar reglas": las 3 reglas
   nuevas tienen que quedar en algún punto **antes** de cualquier regla
   "catch-all" sin criterio de Zona (si la hubiera), para que no se salten.
   No hace falta que vayan antes de la Regla 1 (Regla 1 exige "No
   seleccionado" en el % superado y las nuevas exigen "Seleccionado", así
   que nunca compiten por el mismo caso).
7. Probar con una cotización Rental de prueba, en cada zona, con descuento
   por encima del umbral: confirmar que primero le llega al Jefe de esa
   zona y que, recién al aprobar él, le llega al Gerente Rental (revisar
   con "Ver Timeline" o el historial de aprobación de la cotización).
8. Repetir en Producción una vez validado en Sandbox.

## Preguntas para vos antes de dejar esto como guía final

1. En la captura solo llegué a ver las Reglas 1 y 2 — **¿hay más reglas
   debajo** (por ejemplo, Regla 1 repetida para Zona Centro y Zona Sur, o
   alguna regla "catch-all" sin Zona)? Si me pasás una captura con el
   proceso completo (scrolleado hasta el final) ajusto la guía y el orden
   exacto.
2. ¿Los roles se llaman exactamente **"Jefe Ventas Zona Centro"** y
   **"Jefe Ventas Zona Sur"** en Zoho (mismo patrón que "Jefe Ventas Zona
   Norte")? Encontré en el CRM que las 3 zonas (Norte/Centro/Sur) existen
   como valores del campo `Zona` en Cotizaciones, y la bitácora de una
   sesión anterior (2026-08-12) menciona una regla de aviso "jefe zona
   centro Rental" — pero no tengo forma de leer los Procesos de aprobación
   ni los Roles desde acá (no es una de las herramientas conectadas al
   CRM), así que necesito que confirmes los 2 nombres exactos.
3. Cuando el Jefe de Zona **rechaza** en este primer paso nuevo, ¿está bien
   que la cotización quede directo como "Cotización Rechazada" (como pasa
   hoy con cualquier rechazo), o preferís que en ese caso pase igual al
   Gerente para que él decida?

## Por qué no lo armo yo directo

Crear/editar Procesos de aprobación no está entre las herramientas
conectadas del MCP de Zoho CRM (mismo límite ya documentado para
Blueprints y Reglas de flujo de trabajo — solo hay CRUD de registros y
metadata de módulos/campos). Te dejo la guía para que lo armes vos mismo en
el Sandbox; avisame cuando esté probado para dejarlo anotado como
implementado.
