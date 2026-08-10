# Propuesta: botón "Abrir Cotizador" en Cotizaciones (abre el Cotizador de Creator)

## Estado: LISTO PARA ARMAR — guía completa, con la URL confirmada por Simón

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

### Paso 2 — Probar en el Sandbox

1. Abrí una Cotización cualquiera.
2. Apretá el botón nuevo y confirmá que abre el Cotizador en una pestaña
   nueva, con el formulario "Generar Cotizaciones" listo.

### Paso 3 — Pasar del Sandbox a Producción

1. Configuración (⚙️) → **Sandbox** → **Implementar en Producción**.
2. Marcá para mover el botón `Abrir Cotizador`.
3. Revisá la vista previa y confirmá el despliegue.

## Próximo paso

Armalo en el Sandbox siguiendo los 3 pasos de arriba y probalo — avisame
cuando esté funcionando para dejarlo marcado como aplicado acá, o si en
algún momento querés la versión que abre directo el registro puntual de
la cotización (la mejora que quedó anotada arriba).
