# Propuesta: botón "Abrir Cotizador" en Cotizaciones (abre el Cotizador de Creator)

## Estado: LISTO PARA ARMAR

## Qué se pidió

Un botón en el módulo **Cotizaciones** (Quotes) que, al apretarlo, abra
directamente **el Cotizador** — la app hecha en Zoho Creator que ya se usa
para armar/calcular cotizaciones (la misma que ya mencionaste antes como
"el Creator") — pensado para que los vendedores de **2 Unidades de
Negocio puntuales (Industria y Ferretería y Ematerra)** puedan cotizar
rápido, sin tener que crear antes una Oportunidad a mano en el CRM.

**Contexto clave que aclaraste:** ya existe un flujo donde, si la
cotización se genera directo desde el Cotizador (Creator), **se crea
automáticamente la Oportunidad en el CRM** del otro lado. Por eso el botón
no tiene sentido adentro de una Cotización que ya existe en el CRM —
tiene que estar **en la vista general del módulo Cotizaciones**, para que
el vendedor entre directo a esa pestaña y cotice de cero en el Cotizador,
sin crear nada a mano antes. La Oportunidad (y probablemente la
Cotización) quedan creadas solas por esa automatización existente.

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
| Ubicación | **Vista general / lista de Cotizaciones** (no adentro de un registro puntual) |
| URL destino | `https://creatorapp.zoho.com/emaresa/cotizador#Form:Generar_Cotizaciones` |
| Se abre en | Pestaña nueva |
| Visible para | Solo el Perfil `Vendedor Distribución y Repuestos jardín` — ver sección siguiente |

## Cómo queda restringido: Perfil nuevo creado por Simón

Ya quedó resuelto: Simón creó un **Perfil nuevo** con exactamente los
vendedores que necesita para esto (los nombres de las UN se renombraron en
el medio, por eso el Perfil quedó con el nombre `Vendedor Distribución y
Repuestos jardín`, aunque es para los vendedores de las 2 UN de este
pedido — confirmado por Simón).

La restricción se resuelve igual que veníamos viendo para casos por
Perfil: activar el botón `Abrir Cotizador` **solo** para ese Perfil desde
sus permisos, dejándolo apagado en el resto.

**Antes de activar el botón, hay un paso previo:** al revisar el módulo
Cotizaciones, ese Perfil nuevo **todavía no tenía acceso** al módulo (no
aparecía en la lista de Perfiles con acceso a Cotizaciones) — hay que
darle acceso primero, si no, ni el módulo ni el botón le van a aparecer a
esos vendedores. Quedó incluido como Paso 1 de la guía de abajo.

## Importante: esto no lo puedo aplicar yo directo, ni con tu OK

A diferencia de crear un campo, **crear Botones personalizados no está
entre las herramientas conectadas** a esta sesión de Zoho CRM (mismo
límite que ya pasó con Reglas de flujo de trabajo y Blueprints) — tenés
que armarlo vos a mano en la interfaz de Zoho, siguiendo la guía de abajo.

## Guía paso a paso: primero en Sandbox, después en Producción

### Paso 0 — Entrar al Sandbox

1. Arriba a la derecha, donde ves el nombre de tu organización, hacé clic.
2. Elegí la opción marcada **Sandbox** (en vez de Producción).

### Paso 1 — Darle acceso a Cotizaciones al Perfil nuevo (adentro del Sandbox)

Configuración (⚙️) → Usuarios y Control → **Perfiles** → `Vendedor
Distribución y Repuestos jardín` → habilitá el acceso al módulo
**Cotizaciones** (Ver/Crear como mínimo, lo que ya uses para los demás
Perfiles de vendedores). Si ese Perfil ya lo tiene, saltealo.

### Paso 2 — Crear el botón (adentro del Sandbox)

Configuración (⚙️) → Personalización → Módulos y Campos → **Cotizaciones**
→ pestaña **Botones** → **Nuevo Botón**.

1. Nombre: `Abrir Cotizador`.
2. Ubicación: **Vista de lista** (la que se ve al entrar a la pestaña
   Cotizaciones, sin abrir ningún registro).
3. Tipo de acción: **Abrir URL**.
4. URL: pegá tal cual
   `https://creatorapp.zoho.com/emaresa/cotizador#Form:Generar_Cotizaciones`
5. Abrir en: **Pestaña nueva**.
6. Guardar.

> Nota: al crear el botón, fijate si Zoho te muestra la opción de vista
> de lista como "acción sobre la página" (sin necesidad de seleccionar
> ningún registro) — es lo que buscamos. Si solo aparece como acción
> "sobre los registros seleccionados", avisame para revisar una
> alternativa.

### Paso 3 — Restringirlo al Perfil nuevo

Configuración (⚙️) → Usuarios y Control → **Perfiles** → `Vendedor
Distribución y Repuestos jardín` → sección de Botones personalizados del
módulo Cotizaciones → activá el interruptor de `Abrir Cotizador` **solo**
ahí. En el resto de los Perfiles (Vendedor, Vendedor MIV, etc.) dejalo
apagado.

### Paso 4 — Probar en el Sandbox

1. Entrá a la pestaña Cotizaciones (sin abrir ningún registro) con un
   usuario que tenga el Perfil `Vendedor Distribución y Repuestos jardín`
   — confirmá que el botón aparece y abre el Cotizador en una pestaña
   nueva, con el formulario "Generar Cotizaciones" listo.
2. Repetí con un usuario de otro Perfil (ej. Vendedor a secas) — confirmá
   que el botón **no aparece**.

### Paso 5 — Pasar del Sandbox a Producción

1. Configuración (⚙️) → **Sandbox** → **Implementar en Producción**.
2. Marcá para mover: el botón `Abrir Cotizador`, el acceso nuevo del
   Perfil al módulo Cotizaciones, y el permiso del botón en ese Perfil.
3. Revisá la vista previa y confirmá el despliegue.

## Próximo paso

Armalo en el Sandbox siguiendo los 5 pasos de arriba y probalo con un
usuario del Perfil nuevo y uno de otro Perfil — avisame cuando esté
funcionando para dejarlo marcado como aplicado acá.
