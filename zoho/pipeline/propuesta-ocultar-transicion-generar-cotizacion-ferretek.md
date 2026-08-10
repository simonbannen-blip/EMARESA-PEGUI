# Propuesta: ocultar la transición "Generar Cotización" para UN Ferretek

## Estado: PROPUESTO — pendiente de que lo armes en Zoho (ver limitación abajo)

## Qué se pidió

Que cuando una Oportunidad sea de la Unidad de Negocio **Ferretek**, no se
vea el botón/transición del Plan de acción (Blueprint) que genera la
Cotización — para el resto de las UN, todo sigue igual.

## Dónde vive esto hoy

En el Plan de acción de Oportunidades (mismo que ya conocés de los cambios
anteriores: Perder Oportunidad, Ganar Oportunidad, Declinar Oportunidad),
las fases son:

```
Creada → Necesita Análisis → Cotización Enviada → Negociación
                                                  → Cerrada Ganada
                                                  → Cerrada Perdida
                                                  → Declinada
```

La transición que corresponde a "generar cotización" es la que lleva de
**Necesita Análisis** a **Cotización Enviada** (el paso donde se genera la
Cotización asociada a la Oportunidad). No tengo acceso desde acá para leer
el nombre exacto que le pusiste a esa transición en el Blueprint — armar o
leer Blueprints no está entre las herramientas conectadas a esta sesión
(mismo límite que en los cambios anteriores de Motivo de Pérdida y Ganar
Oportunidad). Confirmame si el nombre no es literalmente "Generar
Cotización" para ajustar esta guía.

## Cómo ocultarla solo para Ferretek

Es el mismo mecanismo que ya usaste para que "Ganar Oportunidad" estuviera
disponible solo para Ferretek desde cualquier fase: agregar un **criterio**
a la transición basado en el campo **UN** (lookup a Unidades de Negocio).
Acá es al revés — la idea es que la transición **no aparezca** cuando la UN
es Ferretek, así que el criterio se agrega como exclusión:

- Criterio a agregar en la transición "Generar Cotización":
  **`UN` no está en `Ferretek`**

Con eso, para cualquier Oportunidad de UN Ferretek, ese botón deja de
mostrarse en la fase "Necesita Análisis" — el resto de las UN sigue viendo
el botón exactamente igual que hoy.

> Ojo: si Ferretek necesita de todas formas avanzar la Oportunidad de
> "Necesita Análisis" a "Cotización Enviada" (por ejemplo porque la
> cotización para esa UN se genera fuera del CRM), va a hacer falta una
> transición alternativa para que Ferretek pueda seguir avanzando sin ese
> botón — igual que se hizo con "Ganar Oportunidad Ferretek" como
> transición paralela. Si es el caso, avisame y la agrego a esta propuesta.
> Si Ferretek simplemente no necesita generar Cotización desde la
> Oportunidad (se maneja distinto), no hace falta nada más.

## Pasos en Zoho (primero en Sandbox, después en Producción)

### Sandbox

1. Entrá al **Sandbox** (arriba a la derecha, donde está el nombre de tu
   organización → elegís el ambiente Sandbox).
2. Configuración (⚙️) → Automatización → **Blueprint** → Oportunidades.
3. Abrí el Plan de acción activo y ubicá la transición **"Generar
   Cotización"** (la que va de "Necesita Análisis" a "Cotización
   Enviada").
4. Entrá a esa transición → sección de **Criterios** (la misma pantalla
   donde agregaste `UN no está Ferretek` en "Ganar Oportunidad").
5. Agregá el criterio: **UN no está en Ferretek**.
6. Guardá y publicá el Blueprint ("Guardar de todos modos" si aparece el
   aviso de bucle que ya conocés — es el mismo de siempre, no lo generamos
   nosotros).

### Probar en Sandbox

1. Abrí una Oportunidad de prueba con UN = Ferretek en fase "Necesita
   Análisis" → el botón "Generar Cotización" no debería aparecer.
2. Abrí otra con una UN distinta en la misma fase → el botón debería seguir
   apareciendo normal.

### Producción

Cuando probaste y funciona: Configuración (⚙️) → Sandbox → **Implementar
en Producción**, marcá el Blueprint/transición modificada, revisá la vista
previa y confirmá el despliegue.

## Por qué no lo aplico yo directo

Editar transiciones de un Blueprint (agregar criterios, campos
obligatorios, etc.) no está entre las herramientas de Zoho conectadas a
esta sesión — solo tengo CRUD de registros y metadata de campos/layouts,
no automatizaciones. Por eso queda en tus manos armarlo con la guía de
arriba, igual que las veces anteriores.

## Próximo paso

- Confirmame el nombre exacto de la transición si no es "Generar
  Cotización", y si Ferretek necesita o no una forma alternativa de
  avanzar de fase sin ese botón.
- Cuando lo armes (en Sandbox o directo en Productivo), avisame para
  dejarlo marcado como aplicado acá y en `memory.md`.
