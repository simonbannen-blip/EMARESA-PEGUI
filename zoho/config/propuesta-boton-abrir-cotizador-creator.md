# Propuesta: botón "Abrir Cotizador" en Cotizaciones (abre el Cotizador de Creator)

## Estado: LISTO PARA ARMAR — falta que definas para qué Perfiles habilitar
el botón (ver sección "Restringir el botón a ciertos perfiles")

## Qué se pidió

Un botón en el módulo **Cotizaciones** (Quotes) que, al apretarlo, abra
directamente **el Cotizador** — la app hecha en Zoho Creator que ya se usa
para armar/calcular cotizaciones (la misma que ya mencionaste antes como
"el Creator").

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
| Visible para | Restringido por **Perfil** (no todos los usuarios) — ver sección siguiente |

## Restringir el botón a ciertos perfiles

Pediste que el botón no sea visible/accesible para todos. En Zoho CRM, los
Botones personalizados se restringen **por Perfil** (el tipo de usuario:
Vendedor, Gerente, etc.) desde los permisos del Perfil — no hace falta
tocar el botón en sí, se habilita/deshabilita desde cada Perfil.

Estos son los 11 Perfiles que hoy tienen acceso al módulo Cotizaciones en
esta org:

| Perfil |
|---|
| Administrator |
| Standard |
| Vendedor |
| Responsable de Área |
| Vendedor MIV |
| Gerente |
| Asistente |
| Gerente de UN |
| Responsable de Área MIV y MAK |
| Vendedor MAK |
| Vendedor IyF Const y Ematerra |

**Todavía falta que definas** para cuáles de estos perfiles (o cuáles
usuarios puntuales dentro de un perfil, si hiciera falta algo más fino)
querés que el botón esté disponible. Cuando lo tengas claro, avisame y
actualizo esta tabla marcando Sí/No por perfil antes de que lo apliques.

### Cómo se configura (una vez definido el listado)

Por cada Perfil, adentro del Sandbox:

1. Configuración (⚙️) → Usuarios y Control → **Perfiles**.
2. Elegí el Perfil (ej. "Vendedor").
3. Buscá la sección de permisos del módulo **Cotizaciones** — ahí, junto a
   los permisos de Crear/Editar/Eliminar, vas a ver listados los **Botones
   personalizados** del módulo, con un interruptor por cada uno.
4. Dejá **activado** el interruptor de `Abrir Cotizador` solo en los
   Perfiles que definiste que sí deben verlo, y **desactivado** en el
   resto.
5. Guardar.

Esto controla tanto que el botón **no se vea** como que **no se pueda
usar** para los perfiles sin el permiso activado (no es solo estético).

> Si en algún momento la restricción tiene que ser más fina que por Perfil
> (ej. "estos 2 vendedores puntuales sí, el resto del mismo Perfil no"),
> avisame — esa parte ya no se resuelve con el permiso del Perfil y hay
> que ver una alternativa (separar esos usuarios a un Perfil propio, o un
> Client Script).

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
6. Guardar.

### Paso 2 — Restringir por Perfil (adentro del Sandbox)

Seguí los pasos de la sección "Cómo se configura" de arriba, perfil por
perfil, según el listado que definas.

### Paso 3 — Probar en el Sandbox

1. Abrí una Cotización cualquiera con un usuario de un Perfil que **sí**
   debería ver el botón — confirmá que aparece y que abre el Cotizador en
   una pestaña nueva.
2. Repetí con un usuario de un Perfil que **no** debería verlo — confirmá
   que el botón no aparece.

### Paso 4 — Pasar del Sandbox a Producción

1. Configuración (⚙️) → **Sandbox** → **Implementar en Producción**.
2. Marcá para mover el botón `Abrir Cotizador` **y** los cambios de
   permisos de los Perfiles que tocaste.
3. Revisá la vista previa y confirmá el despliegue.

## Próximo paso

1. Decime para qué Perfiles (de la tabla de arriba) querés que el botón
   esté disponible.
2. Armalo en el Sandbox siguiendo los 4 pasos de arriba y probalo con un
   usuario que sí y uno que no tenga permiso.
3. Avisame cuando esté funcionando para dejarlo marcado como aplicado
   acá, o si en algún momento querés la versión que abre directo el
   registro puntual de la cotización (la mejora que quedó anotada arriba).
