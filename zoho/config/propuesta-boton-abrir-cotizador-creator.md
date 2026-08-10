# Propuesta: botón "Abrir Cotizador" en Cotizaciones (abre el Cotizador de Creator)

## Estado: LISTO PARA ARMAR

## Qué se pidió

Un botón en el módulo **Cotizaciones** (Quotes) que, al apretarlo, abra
directamente **el Cotizador** — la app hecha en Zoho Creator que ya se usa
para armar/calcular cotizaciones (la misma que ya mencionaste antes como
"el Creator") — visible **solo para las Cotizaciones de 2 Unidades de
Negocio puntuales: Industria y Ferretería y Ematerra**. El motivo: esos
vendedores necesitan cotizar rápido, y pasar primero por una Oportunidad
antes de llegar a Cotizaciones les complica el flujo del día a día.

## URL del Cotizador (confirmada)

```
https://creatorapp.zoho.com/emaresa/cotizador#Form:Generar_Cotizaciones
```

Es el formulario **"Generar Cotizaciones"** de la app **cotizador**, dentro
de la organización Creator **emaresa**. Con esta URL, el botón cumple
exactamente lo pedido: abre el Cotizador listo para generar una cotización.

## Lo que encontré revisando Cotizaciones (contexto, no bloquea el armado)

Cada Cotización del CRM tiene un campo `ID_Creator` (texto) cargado con un
ID numérico de esa misma organización Creator (`emaresa`), distinto al ID
de la Cotización acá en el CRM — por ejemplo `4389062000010888092` para
COT-REN-2864. Esto confirma que cada Cotización ya queda enlazada con un
registro puntual del lado del Cotizador cuando se genera.

**Nota para más adelante (no forma parte de esta propuesta):** en teoría
se podría hacer que el botón, en vez de abrir el formulario en blanco,
lleve directo al registro puntual de esa cotización dentro del Cotizador
usando `ID_Creator`. Para eso hace falta confirmar el patrón de URL que usa
Creator para *ver/editar* un registro existente (es distinto al de este
formulario, que es para *crear uno nuevo*) — se puede armar como mejora
después si te sirve; por ahora el botón simple ya resuelve lo que pediste.

## Cómo queda armado el botón

| | |
|---|---|
| Módulo | Cotizaciones |
| Nombre del botón | Abrir Cotizador |
| Tipo | Botón personalizado → Abrir URL |
| Ubicación | Vista de detalle de la Cotización |
| URL destino | `https://creatorapp.zoho.com/emaresa/cotizador#Form:Generar_Cotizaciones` |
| Se abre en | Pestaña nueva (para no perder la Cotización abierta en el CRM) |
| Visible para | Solo Cotizaciones de UN **Industria y Ferretería** o **Ematerra** — ver sección siguiente |

## Cómo queda restringido: por Criterio, según el campo UN de la Cotización

Antes había armado esto por Perfil (Vendedor, Gerente, etc.), pero contame
el caso de uso: es para que los vendedores de **2 UN puntuales** (Industria
y Ferretería y Ematerra) puedan cotizar rápido. Restringir por Perfil no
encaja bien acá — revisé los Perfiles del módulo y no hay uno que separe
exactamente esas 2 UN: el que más se acerca, **"Vendedor IyF Const y
Ematerra"**, mezcla también **Construcción**, que no pediste incluir.

La forma correcta es la que ya usás en el Plan de acción de Oportunidades
para casos parecidos (ej. el criterio de Ferretek en "Generar Cotización"):
un **Criterio en el botón**, basado en el campo `UN` que ya tiene cada
Cotización — así el botón aparece o no según la UN de esa Cotización
puntual, sin importar el Perfil de quien la mira. Ventajas:

- No depende de a qué Perfil pertenece cada vendedor (evita el problema de
  arriba con Construcción).
- Si mañana cambia el equipo de ventas de esas UN, no hay que tocar nada
  del botón — sigue funcionando solo.

**Criterio del botón:** `UN` es **Industria y Ferretería** **O** `UN` es
**Ematerra**.

## Importante: esto no lo puedo aplicar yo directo, ni con tu OK

A diferencia de crear un campo, **crear Botones personalizados no está
entre las herramientas conectadas** a esta sesión de Zoho CRM (mismo
límite que ya pasó con Reglas de flujo de trabajo y Blueprints) — tenés
que armarlo vos a mano en la interfaz de Zoho, siguiendo la guía de abajo.

## Guía paso a paso: primero en Sandbox, después en Producción

### Paso 0 — Entrar al Sandbox

1. Arriba a la derecha, donde ves el nombre de tu organización, hacé clic.
2. Elegí la opción marcada **Sandbox** (en vez de Producción).

### Paso 1 — Crear el botón (adentro del Sandbox)

Configuración (⚙️) → Personalización → Módulos y Campos → **Cotizaciones**
→ pestaña **Botones** → **Nuevo Botón**.

1. Nombre: `Abrir Cotizador`.
2. Ubicación: **Vista de detalle**.
3. Tipo de acción: **Abrir URL**.
4. URL: pegá tal cual
   `https://creatorapp.zoho.com/emaresa/cotizador#Form:Generar_Cotizaciones`
5. Abrir en: **Pestaña nueva**.
6. **Criterio** (sección "Mostrar este botón solo si..." / "Add Criteria"):
   `UN` **es** `Industria y Ferretería` **O** `UN` **es** `Ematerra`.
7. Guardar.

### Paso 2 — Probar en el Sandbox

1. Abrí una Cotización de prueba con `UN` = Industria y Ferretería (o
   Ematerra) — confirmá que el botón **aparece** y abre el Cotizador en
   una pestaña nueva.
2. Abrí una Cotización de otra UN (ej. Construcción o Rental) — confirmá
   que el botón **no aparece**.

### Paso 3 — Pasar del Sandbox a Producción

1. Configuración (⚙️) → **Sandbox** → **Implementar en Producción**.
2. Marcá para mover el botón `Abrir Cotizador`.
3. Revisá la vista previa y confirmá el despliegue.

## Próximo paso

Armalo en el Sandbox siguiendo los 3 pasos de arriba y probalo con una
Cotización de cada UN (dentro y fuera del criterio) — avisame cuando esté
funcionando para dejarlo marcado como aplicado acá, o si en algún momento
querés la versión que abre directo el registro puntual de la cotización
(la mejora que quedó anotada arriba).

## Nota aparte: el "molestia" de pasar por Oportunidad antes de Cotizar

Contaste que para estas 2 UN, tener que crear una Oportunidad antes de
llegar a Cotizaciones les complica el flujo. Dato encontrado revisando el
módulo: el campo `Nombre de Oportunidad` (`Deal_Name`) en Cotizaciones
**no es obligatorio** a nivel de campo — técnicamente ya se podría crear
una Cotización sin pasar por una Oportunidad primero. Si hoy igual están
obligados a pasar por ahí, probablemente sea por cómo está armado el
proceso/capacitación del equipo, no por una restricción del campo. Si
querés, en otra vuelta puedo revisar más a fondo por qué pasa esto y ver
si conviene ajustarlo — quedó anotado como pendiente, no lo incluí en esta
propuesta para no mezclarlo con el botón.
