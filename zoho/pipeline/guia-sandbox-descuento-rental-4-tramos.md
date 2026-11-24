# Guía Sandbox: aprobación de descuento Rental en 4 tramos (paso a paso detallado)

Versión 3 (24-11-2026). Se arma 100% en el **CRM Sandbox**; no se toca el
Cotizador ni el registro IDFUNC-59. Propuesta base:
`propuesta-rental-aprobacion-descuento-4-tramos.md`.

## Resultado esperado

| Descuento de la cotización | Aprueba y recibe aviso |
|---|---|
| hasta 5% | nadie (lo da el vendedor) |
| más de 5% hasta 10% | Jefe Zonal: Norte Jaime Zúñiga · Centro Jaime Rojas · Sur Eduardo Roldán |
| más de 10% hasta 15% | Mauricio Correa |
| más de 15% | Andrés Salah |

Cómo funciona: el Cotizador sigue marcando **"Aprobación Descuento"** cuando
hay más de 5% (eso no cambia). Un campo nuevo, **"% Descuento Cotización"**,
calcula el % real y decide a quién le toca.

---

## Antes de empezar (5 minutos)

1. Confirma que estás en el **Sandbox**: arriba debe verse la franja o el
   aviso de Sandbox. Nada de esta guía se hace en Producción.
2. **Respaldo**: entra al proceso de aprobación "UN Rental - Arriendo" y a
   cada regla de aviso Rental (pasos 2 y 3) y **saca captura** de cómo están
   hoy (criterios, aprobadores, acciones). Si algo sale mal, vuelves a
   dejarlas igual.

---

## PASO 1 — Crear el campo "% Descuento Cotización"

1. Haz clic en el **engranaje** (Configuración), arriba a la derecha.
2. En **Personalización**, entra a **Módulos y campos**.
3. Haz clic en **Cotizaciones**.
4. Pestaña **Diseños** → abre el diseño **Standard**. Se abre el editor de
   diseño (a la izquierda, una lista de tipos de campo; al centro, la ficha).
5. En la lista de la izquierda busca **Fórmula** y **arrástralo** a una
   sección visible (por ejemplo, la sección donde están Subtotal / Descuento).
   No lo pongas en "Ocultar".
6. Se abre la ventana del campo fórmula. Completa:
   - **Etiqueta de campo**: `% Descuento Cotización`
   - **Tipo de devolución de fórmula**: `Decimal`
   - **Número de lugares decimales**: `2`
7. En el cuadro de la **expresión**:
   1. Escribe `If(` .
   2. Clic en **Insertar campos** (o "Seleccionar campo") → elige
      **Subtotal sin descuento**. Aparece algo como
      `${Cotizaciones.Subtotal sin descuento}`.
   3. Escribe ` > 0, `.
   4. Inserta **Descuento Total de Productos**.
   5. Escribe ` / `.
   6. Inserta **Subtotal sin descuento**.
   7. Escribe ` * 100, 0)`.

   Debe quedar así:

   `If(${Cotizaciones.Subtotal sin descuento} > 0, ${Cotizaciones.Descuento Total de Productos} / ${Cotizaciones.Subtotal sin descuento} * 100, 0)`

8. Clic en **Verificar sintaxis**. Debe decir que la sintaxis es correcta.
   Si da error, revisa paréntesis y comas (deben ser comas, no punto y coma).
9. Si aparece una opción del tipo "si los campos están vacíos…", elige
   **tratar como 0**.
10. **Guardar** la ventana del campo, y luego **Guardar** (o "Guardar y
    cerrar") arriba del editor de diseño. Si no guardas el diseño, el campo
    no queda creado.

**Comprobar:** abre cualquier cotización Rental del Sandbox que tenga
descuento. El campo debe mostrar el %. Ejemplo: Subtotal sin descuento
1.000.000 y Descuento Total de Productos 120.000 → **12,00**. Mándame
captura antes de seguir.

---

## PASO 2 — Proceso de aprobación "UN Rental - Arriendo"

Ruta: **Configuración → Automatización → Procesos de aprobación** → módulo
**Cotizaciones** → abre **"UN Rental - Arriendo"**.

Dentro verás la lista de **reglas** (hoy: una por zona para el Jefe Zonal y
una para el Gerente). Cada regla tiene: **criterios** (condiciones numeradas
1, 2, 3… y un patrón como "1 and 2 and 3"), **aprobadores** y **acciones**
al aprobar / rechazar.

### 2.1 Reglas de los Jefes Zonales (Norte, Centro, Sur) — se repite 3 veces

1. Abre la regla de **Zona Norte**.
2. En los criterios, busca la condición
   **"Rental - superó Porcentaje Descuento — es — No seleccionado"**.
3. **Cámbiala** (no agregues otra): en el campo elige
   **% Descuento Cotización**, en el operador **<=** ("menor o igual que") y
   en el valor **10**.
   - Así no tienes que tocar el patrón "1 and 2 and…", porque la condición
     conserva su número.
4. Deja todo lo demás igual (UN = Rental, Fase = Pendiente de Aprobación,
   Tipo de Negocio = Arriendo, Aprobación Descuento = Seleccionado,
   Zona = Zona Norte).
5. Aprobador: confirma que sea **jaime zuñiga** (solo él).
6. **Guardar**.
7. Repite con **Zona Centro** (aprobador **Jaime Rojas Pérez**) y
   **Zona Sur** (aprobador **Eduardo Roldán Fernández**).

> Si el campo "% Descuento Cotización" **no aparece** en la lista de campos
> del criterio, detente y avísame (hay otra forma de hacerlo).

### 2.2 Regla del Gerente

1. Abre la regla del Gerente (hoy tiene
   "Rental - superó Porcentaje Descuento — es — Seleccionado").
2. **Cambia** esa condición por:
   **% Descuento Cotización — > (mayor que) — 15**.
3. Si la regla no tiene la condición **Aprobación Descuento = Seleccionado**,
   agrégala (botón **+** al final de los criterios) y suma su número al
   patrón con "and".
4. **Aprobadores**: deja **solo a Andrés Salah**. Si hay un Jefe Zonal antes
   o algún otro aprobador, quítalo (cada tramo aprueba solo).
5. **Guardar**.

### 2.3 Regla nueva para Mauricio Correa

1. En la lista de reglas, clic en **+ Agregar otra regla** (o "Agregar
   regla").
2. Nombre (si lo pide): `Subgerente Rental 10-15%`.
3. **Criterios** — agrega estas condiciones (botón **+** para cada una):
   1. UN — es — **Rental**
   2. Fase — es — **Pendiente de Aprobación**
   3. Tipo de Negocio — es — **Arriendo**
   4. Aprobación Descuento — es — **Seleccionado**
   5. % Descuento Cotización — **>** — **10**
   6. % Descuento Cotización — **<=** — **15**

   Patrón: `1 and 2 and 3 and 4 and 5 and 6`.
   - Copia los valores **exactamente** como están en las reglas de los jefes
     (mira tus capturas del respaldo), por si alguno se escribe distinto.
   - **No** pongas Zona: Mauricio aprueba todas las zonas.
4. **Aprobadores**: tipo **Usuarios** → **Mauricio Correa**.
5. **Acciones al aprobar** y **al rechazar**: deja **las mismas** que tienen
   las reglas de los Jefes Zonales (mira tu captura: normalmente actualizan
   la Fase a "Cotización Aprobada" / "Cotización Rechazada"). Si la regla
   del jefe tiene alguna función o correo al aprobar, agrégalo igual.
6. **Guardar**.

### 2.4 Orden de las reglas

1. Clic en **Reordenar reglas** (o arrastra las reglas).
2. Orden: **Jefe Norte → Jefe Centro → Jefe Sur → Subgerente (Mauricio) →
   Gerente (Andrés)**.
3. **Guardar**.

---

## PASO 3 — Correos de aviso

Ruta: **Configuración → Automatización → Reglas de flujo de trabajo** →
filtra por módulo **Cotizaciones**. Busca las reglas
"Notificar jefe zona norte Rental", "…centro…", "…sur…" y
"Notificar Gerente Rental".

### 3.1 Avisos a los Jefes Zonales (se repite 3 veces)

1. Abre **"Notificar jefe zona norte Rental"**.
2. En la condición, busca **"Rental - superó Porcentaje Descuento — es — No
   seleccionado"** y **cámbiala** por **% Descuento Cotización <= 10**.
3. No toques la acción de correo (sigue yendo a jaime zuñiga).
4. **Guardar**. Repite con Centro y Sur.

### 3.2 Aviso al Gerente

1. Abre **"Notificar Gerente Rental"**.
2. Cambia la condición de "superó" (estaba mal en agosto: decía "No
   seleccionado") por **% Descuento Cotización > 15**.
3. En la acción de correo, en **Para**, deja a **Andrés Salah**
   (asalah@emaresa.cl).
4. **Guardar**.

### 3.3 Aviso nuevo a Mauricio Correa

1. Primero la **plantilla de correo**: Configuración → Personalización →
   **Plantillas** → **Correo electrónico** → busca
   **"Aprobación Rental Zona norte"** → menú **…** → **Clonar**.
   - Nombre: `Aprobación Rental Subgerente`.
   - Ajusta el texto si menciona "Zona Norte" o "Jefe Zonal".
   - **Guardar**.
2. Vuelve a **Reglas de flujo de trabajo**. En "Notificar jefe zona norte
   Rental", menú **…** → **Clonar**.
3. Nombre: `Notificar Subgerente Rental`.
4. Condiciones:
   - **Quita** la condición de **Zona**.
   - La condición de % debe quedar en dos: **% Descuento Cotización > 10**
     y **% Descuento Cotización <= 15**.
   - Lo demás igual (UN, Fase, Aprobación Descuento, etc.).
5. Acción de **Correo**: elige la plantilla
   **"Aprobación Rental Subgerente"** y en **Para**: **Mauricio Correa**.
6. **Guardar** y confirma que la regla quede **activa**.

> En Sandbox puedes poner **tu propio correo** en "Para" de las 5 reglas
> para no avisarle a la gente real. **Acuérdate de volver a dejar los
> correos reales antes de pasar a Producción.**

---

## PASO 4 — Pruebas

Desde el **Cotizador del Sandbox**, crea cotizaciones Rental (Arriendo) con
el **mismo descuento en todas las líneas**:

| Caso | Descuento | Zona | Debe pasar |
|---|---|---|---|
| 1 | 4% | cualquiera | no pide aprobación |
| 2 | 8% | Norte | aprobación y aviso a Jaime Zúñiga |
| 3 | 10% | Centro | aprobación y aviso a Jaime Rojas |
| 4 | 12% | Sur | aprobación y aviso a Mauricio Correa |
| 5 | 15% | cualquiera | aprobación y aviso a Mauricio Correa |
| 6 | 18% | cualquiera | aprobación y aviso a Andrés Salah |

Cómo revisar cada una:
1. Abre la cotización en el CRM Sandbox y mira **% Descuento Cotización**.
2. Pestaña **Cronología**: debe aparecer "Enviado para aprobación" con el
   aprobador correcto, y el correo de aviso enviado.
3. Prueba también **aprobar** una y **rechazar** otra (entrando como admin o
   con "Aprobar/Rechazar" en la cotización) y revisa que la Fase cambie bien.

Anota qué pasó en cada caso y mándamelo (o capturas de la Cronología).

---

## PASO 5 — Producción (después, con todo OK)

1. Devuelve los correos reales en "Para" si pusiste el tuyo.
2. Pasa los cambios a Producción (despliegue desde Sandbox o repitiendo los
   pasos 1–3 en Producción).
3. Actualiza el **Comentario** de IDFUNC-59 en Producción:
   "0-5% vendedor · 6-10% Jefe Zonal · 11-15% Mauricio Correa · 16%+ Andrés
   Salah".
4. Avísame para dejarlo anotado como implementado.
