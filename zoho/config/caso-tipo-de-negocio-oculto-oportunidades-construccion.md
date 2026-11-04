# Caso: "Tipo de Negocio" no aparece al crear Oportunidad (UN Construcción)

Fecha: 2026-11-03 / 2026-11-04 — reportado por Walter Uribe.

## Síntoma
- Al crear una Oportunidad desde el CRM y elegir UN = Construcción, el campo
  **Tipo de Negocio** (`L_nea`, lookup a `L_neas_porUN`) no aparece.
- La Oportunidad queda sin Tipo de Negocio (ej. `261103-OP-CONST-465-004830`).

## Causa
Client Script de Oportunidades que corre al cambiar el campo **UN**. Su
último `else` (todas las UN salvo Rental, Inamar Izaje e Inamar Vapor) hacía:

```javascript
var tipoNegocio = ZDK.Page.getField('L_nea');
tipoNegocio.setVisibility(false);
tipoNegocio.setMandatory(false);
```

O sea, ocultaba Tipo de Negocio para Construcción cada vez que el usuario
elegía la UN en el formulario. Un script de formulario se impone a las reglas
de diseño.

Por qué solo algunas quedaban vacías: la mayoría de las Oportunidades de
Construcción llegan con la UN ya cargada (Cotizador / integración), así que el
script no se dispara y el campo queda visible. Cuando el usuario elige la UN a
mano, el script lo oculta. Por eso los vacíos son casos sueltos (05-10, 20-10,
02-11, 03-11…), no un corte en una hora puntual.

> Corrige la hipótesis inicial de "cambio el 03-11 entre 16:00 y 16:13":
> después de las 16:13 siguieron creándose Oportunidades de Construcción con
> el campo lleno (Ortiz 16:54, Núñez 17:37, Castro 18:21…).

## Cambio aplicado (2026-11-04, en Producción, por Simón)
En el `else` final del script:

```javascript
// ===== INICIO CAMBIO 2026-11-04 (Construcción muestra Tipo de Negocio) =====
if (value["name"] == "Construcción") {
    tipoNegocio.setVisibility(true);
    tipoNegocio.setMandatory(true);
}
else {
    tipoNegocio.setVisibility(false);
    tipoNegocio.setMandatory(false);
}
// ===== FIN CAMBIO 2026-11-04 =====
```

Para revertir: dejar solo `setVisibility(false)` / `setMandatory(false)`.

## Efectos a tener en cuenta
- Para Construcción el campo pasa a ser **obligatorio** en el formulario
  (antes no lo era). No afecta lo que crea el Cotizador/integración por API.
- El resto de UN que caen en ese `else` (Agroforestal y Jardines, Industria y
  Ferretería, Maktotal, Ferretek…) siguen con el campo oculto. Si alguna lo
  necesita, agregarla a la misma condición.
- El nombre se compara exacto: "Construcción" con tilde (coincide con el
  registro de Unidades de Negocio).

## Pruebas sugeridas
1. Crear Oportunidad, UN = Construcción → aparece Tipo de Negocio, obligatorio.
2. Crear Oportunidad, otra UN (ej. Agroforestal y Jardines) → sigue oculto.
3. Editar `261103-OP-CONST-465-004830` y asignar "Construcción Repuestos"
   (ver si persiste el error "no cumple con los criterios de búsqueda").

## Pendientes
- `004830` (Walter) sigue sin Tipo de Negocio. `004833` es prueba (cliente
  "Simon Tirapegui").

## Parte 2 — Error al editar: "no cumple con los criterios de búsqueda" (04-11)

Filtro del lookup `L_nea` (captura de Simón):
- `UN (Tipos de Negocio por UN) ES UN (Oportunidades)`
- "Validar filtro de búsqueda durante la edición de registros": **desmarcado**.

El filtro es correcto ("Construcción Repuestos" tiene UN = Construcción).
Hipótesis: al editar, el campo UN de la oportunidad aparece bloqueado (gris en
la captura de Walter), el formulario no le entrega su valor al filtro, y
ningún Tipo de Negocio calza. Al crear sí funciona porque la UN se elige en
el mismo formulario. Sin confirmar.

Propuesta (pendiente OK, probar en Sandbox primero):
1. Quitar "Filtrar registros de búsqueda" del campo Tipo de Negocio.
2. Aplicar el mismo filtro por script:
   - En el script existente (onChange de UN), dentro de `if (value != null)`:
     `ZDK.Page.getField('L_nea').setCriteria("(UN:equals:" + value["id"] + ")");`
   - Script nuevo: Oportunidades, página Editar, evento al cargar:
     ```javascript
     var un = ZDK.Page.getField('UN').getValue();
     if (un != null) {
         ZDK.Page.getField('L_nea').setCriteria("(UN:equals:" + un["id"] + ")");
     }
     ```
Inmediato (con OK): asignar por API "Construcción Repuestos" a `004897`
(5404724000629591379) y `004830` (5404724000628930360).
