# Propuesta: botón "Abrir Cotizador" en Cotizaciones (abre el Cotizador de Creator)

## Estado: LISTO PARA ARMAR — falta que confirmes cómo resolver la
restricción (ver sección de restricción más abajo)

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
| Visible para | Solo vendedores de Industria y Ferretería y Ematerra — ver sección siguiente |

## Cómo restringirlo — pendiente que decidas

Había armado esto con un Criterio por el campo `UN` de la Cotización, pero
esa opción **ya no aplica**: ese criterio solo funciona cuando el botón
está adentro de un registro puntual, y ahora el botón va en la vista
general del módulo (sin ningún registro de por medio), porque el objetivo
es justamente que el vendedor no tenga que crear nada antes.

Sin un registro de referencia, la única forma nativa de restringir un
botón en Zoho vuelve a ser **por Perfil** — mismo tema que ya habíamos
visto: no hay un Perfil que separe exactamente Industria y Ferretería +
Ematerra. El más cercano, **"Vendedor IyF Const y Ematerra"**, incluye
también **Construcción**.

Tenés 3 caminos, elegí el que prefieras:

1. **Habilitar el botón para el Perfil "Vendedor IyF Const y Ematerra"
   (más simple)** — Construcción también va a poder verlo y usarlo. No
   rompe nada (si alguien de Construcción lo usa, en el peor caso genera
   una cotización/Oportunidad de más por ese lado), pero no es 100%
   exclusivo de las 2 UN que pediste.
2. **Pedir que se separe ese Perfil en 2** (uno solo para Industria y
   Ferretería + Ematerra, otro para Construcción) — ahí sí queda exacto,
   pero es un cambio de Perfiles más grande, aparte de este botón, y hay
   que revisar qué otros permisos dependen de ese Perfil antes de
   tocarlo.
3. **No restringir por Zoho y resolverlo por uso/comunicación** — el
   botón queda visible para todos los que tengan acceso a Cotizaciones,
   y simplemente se le avisa al equipo que es para Industria y Ferretería
   / Ematerra. Cero trabajo de configuración extra, pero no hay
   restricción real.

Decime cuál preferís y actualizo la guía de abajo con eso.

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
2. Ubicación: **Vista de lista** (la que se ve al entrar a la pestaña
   Cotizaciones, sin abrir ningún registro).
3. Tipo de acción: **Abrir URL**.
4. URL: pegá tal cual
   `https://creatorapp.zoho.com/emaresa/cotizador#Form:Generar_Cotizaciones`
5. Abrir en: **Pestaña nueva**.
6. Restricción: **pendiente** — depende de cuál de los 3 caminos de la
   sección anterior elijas. Si es el camino 1 o 2 (por Perfil), se
   configura después desde Usuarios y Control → Perfiles → el/los
   Perfiles elegidos → sección de Botones personalizados del módulo
   Cotizaciones → activar el interruptor de `Abrir Cotizador`.
7. Guardar.

> Nota: al crear el botón, fijate si Zoho te muestra la opción de vista
> de lista como "acción sobre la página" (sin necesidad de seleccionar
> ningún registro) — es lo que buscamos. Si solo aparece como acción
> "sobre los registros seleccionados", avisame para revisar una
> alternativa.

### Paso 2 — Restringirlo (según lo que elegiste arriba)

Si elegiste el camino 1 o 2 (por Perfil): Configuración (⚙️) → Usuarios y
Control → Perfiles → elegí el/los Perfiles habilitados → buscá el módulo
Cotizaciones → activá el interruptor de `Abrir Cotizador` solo ahí y
dejalo apagado en el resto. Si elegiste el camino 3, no hay nada que
configurar acá.

### Paso 3 — Probar en el Sandbox

1. Entrá a la pestaña Cotizaciones (sin abrir ningún registro) con un
   usuario que debería ver el botón — confirmá que aparece y que abre el
   Cotizador en una pestaña nueva, con el formulario "Generar
   Cotizaciones" listo.
2. Si restringiste por Perfil, repetí con un usuario que no debería
   verlo y confirmá que no aparece.

### Paso 4 — Pasar del Sandbox a Producción

1. Configuración (⚙️) → **Sandbox** → **Implementar en Producción**.
2. Marcá para mover el botón `Abrir Cotizador` y, si tocaste Perfiles,
   esos cambios también.
3. Revisá la vista previa y confirmá el despliegue.

## Próximo paso

1. Decime cuál de los 3 caminos de restricción preferís (o si preferís
   otra alternativa).
2. Armalo en el Sandbox siguiendo los pasos de arriba y probalo.
3. Avisame cuando esté funcionando para dejarlo marcado como aplicado
   acá.
