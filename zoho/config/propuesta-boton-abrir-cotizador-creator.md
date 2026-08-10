# Propuesta: botón "Abrir Cotizador" en Cotizaciones (abre el Cotizador de Creator)

## Estado: PROPUESTO — falta un dato tuyo antes de poder dejarlo armado del
todo (la URL del Cotizador)

## Qué se pidió

Un botón en el módulo **Cotizaciones** (Quotes) que, al apretarlo, abra
directamente **el Cotizador** — la app hecha en Zoho Creator que ya se usa
para armar/calcular cotizaciones (la misma que mencionaste antes como "el
Creator").

## Lo que encontré revisando Cotizaciones hoy

Cada Cotización ya tiene un campo `ID_Creator` (texto) y, al revisar las 5
Cotizaciones más recientes, **todas** lo tienen cargado con un ID numérico
distinto al ID de la Cotización en el CRM, por ejemplo:

| Cotización (CRM) | `ID_Creator` |
|---|---|
| COT-REN-2864 | `4389062000010888092` |
| 20260810-COT-II10022-1881 | `4389062000010890048` |
| COT-CONST-467-2299 | `4389062000010889094` |

Esto confirma dos cosas importantes:

- **El Cotizador es efectivamente una app separada** (Zoho Creator, con su
  propio ID de organización interno, distinto al de este CRM) — coincide
  con lo que ya sabíamos por `ID_Creator`/`Respuesta_Creator` en Sucursales.
- **Cada Cotización del CRM ya está enlazada 1 a 1 con un registro puntual
  en el Cotizador** vía ese `ID_Creator`. Esto es una buena noticia: el
  botón no tiene que abrir el Cotizador "en blanco" — puede llevar
  directo a la cotización correcta, sin que el vendedor tenga que
  buscarla de nuevo del otro lado.

## Lo que me falta para dejar el botón armado del todo

El Cotizador (Zoho Creator) **no está dentro del alcance de las
herramientas conectadas a esta sesión** (solo tengo acceso al CRM) — no
puedo ver su URL ni cómo abre un registro puntual. Necesito que me
confirmes:

1. **La URL del Cotizador** — la que usás hoy vos (o el equipo) para
   entrar a mano (algo con forma
   `https://creator.zoho.com/<organización>/<nombre-de-la-app>/...`).
2. **Si esa URL admite abrir directo un registro puntual pasándole un ID**
   por parámetro (ej. `...?ID=1234...`), y si es así, **cómo se llama ese
   parámetro**. Si no lo sabés de memoria, alcanza con que abras una
   cotización cualquiera adentro del Cotizador y me pases la URL completa
   que te queda en el navegador — de ahí se puede deducir el patrón.
3. Si preferís que el botón aparezca **solo en la vista de detalle** de la
   Cotización, o **también en la vista de lista**.

Con esos 3 datos dejo la URL final del botón lista para pegar.

## Cómo va a quedar armado el botón (una vez tenga la URL)

| | |
|---|---|
| Módulo | Cotizaciones |
| Nombre del botón | Abrir Cotizador |
| Tipo | Botón personalizado → Abrir URL |
| Ubicación | Vista de detalle de la Cotización (y lista, si lo confirmás) |
| URL destino | `<URL BASE DEL COTIZADOR>` + parámetro con el valor del campo `ID_Creator` de la Cotización actual |
| Se abre en | Pestaña nueva (para no perder la Cotización abierta en el CRM) |

> Nota: si el Cotizador **no** tiene forma de abrir un registro puntual
> por URL, el botón igual se puede armar apuntando a la URL general de la
> app (el vendedor entra y busca la cotización a mano del otro lado) — es
> una versión más simple, avisame si preferís arrancar por ahí mientras
> confirmás el resto.

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
2. Ubicación: **Vista de detalle** (marcá también **Vista de lista** si lo
   pediste en el punto 3 de arriba).
3. Tipo de acción: **Abrir URL**.
4. URL: pegá la URL base del Cotizador y agregá el campo `ID_Creator`
   como parámetro dinámico usando el selector de campos de Zoho (el mismo
   que se usa para insertar merge fields), por ejemplo:
   `https://creator.zoho.com/tuorg/tuapp/#Formulario/Ver/${Quotes.ID_Creator}`
   — el patrón exacto depende de la respuesta al punto 2 de arriba.
5. Abrir en: **Pestaña nueva**.
6. Guardar.

### Paso 2 — Probar en el Sandbox

1. Abrí una Cotización de prueba (con `ID_Creator` cargado).
2. Apretá el botón nuevo y confirmá que abre el Cotizador **directo en
   esa cotización** (no en blanco, no en otra).
3. Probá también con una Cotización sin `ID_Creator` cargado (si existe
   alguna vieja sin ese dato) para ver qué pasa — probablemente el
   Cotizador muestre un error o pantalla vacía; si eso molesta, se puede
   agregar más adelante una condición para ocultar el botón cuando
   `ID_Creator` esté vacío.

### Paso 3 — Pasar del Sandbox a Producción

1. Configuración (⚙️) → **Sandbox** → **Implementar en Producción**.
2. Marcá para mover el botón `Abrir Cotizador`.
3. Revisá la vista previa y confirmá el despliegue.

## Próximo paso

Pasame la URL del Cotizador (y si podés, la URL completa que te queda al
abrir una cotización puntual desde ahí) para terminar de armar la URL
exacta del botón y dejarte la guía 100% lista para pegar sin adivinar
nada.
