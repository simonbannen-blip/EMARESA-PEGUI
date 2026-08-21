# Propuesta: en la aprobación de Rental, que el Gerente reciba la
cotización recién después de que la apruebe el Jefe Zonal

## Estado: LISTO PARA ARMAR EN SANDBOX — diseño cerrado, sin preguntas
pendientes

## Qué se pidió

En el **Proceso de aprobación "UN Rental - Arriendo"** (módulo Cotizaciones),
que cuando el caso le corresponda al **Gerente Rental** (descuento >15%), la
cotización **pase primero por el Jefe Zonal correspondiente**, y recién si
él la aprueba, suba al Gerente.

## Cómo es el proceso real hoy (confirmado por vos)

Son **4 reglas**, evaluadas de arriba hacia abajo:

| Regla | Cuándo aplica (negocio) | Zona | Aprobador hoy |
|---|---|---|---|
| 1 | Descuento >5% y ≤15% | Zona Norte | Jefe Zonal Norte |
| 2 | Descuento >5% y ≤15% | Zona Centro | Jefe Zonal Centro |
| 3 | Descuento >5% y ≤15% | Zona Sur | Jefe Zonal Sur |
| 4 | Descuento >15% | (cualquiera — sin criterio de Zona) | **Gerente Rental** |

En Zoho estos rangos de negocio están armados con 2 campos de la
cotización: `Aprobación Descuento` (se marca cuando el descuento supera el
5%, es lo que hace que el proceso se dispare) y `Rental - superó Porcentaje
Descuento` (marca si además supera el 15%). Las Reglas 1-3 exigen que este
segundo campo esté **sin marcar** (por eso el tope de 15%) y la Regla 4
exige que esté **marcado** (por eso arranca justo pasado el 15%).

Como un proceso de aprobación en Zoho sigue **solo la primera regla que le
calza** a la cotización, hoy cuando se supera el 15% la Regla 4 la agarra
directo y va al Gerente Rental sin pasar por nadie más, sea cual sea la
zona (la Regla 4 no distingue Norte/Centro/Sur, a diferencia de la 1, 2 y 3).

## Cómo se resuelve en Zoho

Zoho permite que **una misma regla** tenga más de un aprobador en
**secuencia** (primero uno, y solo si aprueba pasa al siguiente) — es la
función de "agregar otro aprobador" dentro de la regla, no el
"+ Agregar otra regla" que arma reglas nuevas.

El problema es que la Regla 4 de hoy **no distingue zona**, así que no hay
una única regla donde meter "el Jefe Zonal" — hace falta saber de qué zona
es la cotización para saber a cuál de los 3 mandarla primero.

**Propuesta**: reemplazar la Regla 4 única por **3 reglas**, una por zona
(mismo patrón que ya usan las Reglas 1, 2 y 3), cada una con **2
aprobadores en secuencia**:

| Regla nueva | Criterios (igual a la Regla 4 actual + Zona) | 1er aprobador | 2do aprobador |
|---|---|---|---|
| 4a | Zona = Zona Norte + resto igual a Regla 4 | Jefe Zonal Norte | Gerente Rental |
| 4b | Zona = Zona Centro + resto igual a Regla 4 | Jefe Zonal Centro | Gerente Rental |
| 4c | Zona = Zona Sur + resto igual a Regla 4 | Jefe Zonal Sur | Gerente Rental |

Así, cuando se supera el 15% de descuento: primero la ve el Jefe Zonal de
la zona que corresponda (el mismo que ya la revisó en el tramo 5%-15%, si
antes pasó por ahí), y **solo si él la aprueba**, Zoho la manda
automáticamente al Gerente Rental como segundo paso. Si el Jefe Zonal la
rechaza, no llega al Gerente: queda directo como "Cotización Rechazada"
(confirmado por vos — mismo comportamiento que ya tiene hoy cualquier
rechazo, no hace falta configurar nada extra para esto).

## Guía paso a paso (Sandbox)

1. Entrar a **Configuración → Automatización → Procesos de aprobación →
   "UN Rental - Arriendo"** (Módulo: Cotizaciones).
2. Duplicar la Regla 4 actual dos veces, para terminar con 3 copias.
3. En cada copia, agregar el criterio **Zona = Zona Norte / Centro / Sur**
   (una zona distinta en cada copia), dejando el resto de los criterios
   igual (UN=Rental, Fase=Pendiente de Aprobación, Aprobación
   Descuento=Seleccionado, Rental-superó Porcentaje Descuento=Seleccionado,
   Tipo de Negocio=Arriendo).
4. En cada copia, dejar como **primer aprobador** al Jefe Zonal que
   corresponda (Norte / Centro / Sur) y **agregar un segundo aprobador**:
   Gerente Rental.
5. Borrar la Regla 4 original (la que no distingue zona), una vez que las
   3 copias estén armadas y probadas.
6. Revisar el **orden de las reglas** con "Reordenar reglas": las 3 reglas
   nuevas tienen que quedar después de las Reglas 1, 2 y 3 (nunca compiten
   por el mismo caso, porque unas exigen "no superó 15%" y las otras
   "superó 15%", pero conviene mantener el mismo orden lógico por zona que
   ya tiene el proceso).
7. Probar con una cotización Rental de prueba, en cada zona, con descuento
   por encima del 15%: confirmar que primero le llega al Jefe Zonal de esa
   zona y que, recién al aprobar él, le llega al Gerente Rental (revisar
   con el historial/Timeline de aprobación de la cotización).
8. Repetir en Producción una vez validado en Sandbox.

## Ya confirmado

- El aprobador de la Regla 4 es el mismo **Gerente Rental** que ya
  aparecía en la captura original (no hay un rol "Gerente General"
  separado).
- Estructura real de las 4 reglas y los cortes de 5% / 15%, confirmada por
  vos.
- Si el Jefe Zonal rechaza en el nuevo primer paso (tramo >15%), la
  cotización queda directo como "Cotización Rechazada" — no pasa al
  Gerente Rental.

## Por qué no lo armo yo directo

Crear/editar Procesos de aprobación no está entre las herramientas
conectadas del MCP de Zoho CRM (mismo límite ya documentado para
Blueprints y Reglas de flujo de trabajo — solo hay CRUD de registros y
metadata de módulos/campos). Te dejo la guía para que lo armes vos mismo en
el Sandbox; avisame cuando esté probado para dejarlo anotado como
implementado.
