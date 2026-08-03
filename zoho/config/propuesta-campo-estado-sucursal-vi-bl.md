# Propuesta: campo "Estado de Sucursal" (VI / BL) con sincronización bidireccional con el ERP

## Estado: PROPUESTO — guía para armar y probar vos mismo en el Sandbox,
antes de tocar el Zoho real

## Qué se pidió

Un campo en el módulo **Sucursales** que indique si la sucursal está
**VI (Vigente)** o **BL (Bloqueada)**, con dos direcciones de sincronización:

1. **ERP → Zoho** (la principal): el estado se define en el ERP y llega a
   Zoho. Sucursales actúa como **receptor**.
2. **Zoho → ERP**: si alguien cambia el estado a mano desde el CRM, ese
   cambio también se tiene que reflejar de vuelta en el ERP.

## Lo que encontré revisando el módulo Sucursales hoy

Los 8 campos personalizados actuales de `Sucursales` (además de los
estándar de Zoho):

| Campo (label) | api_name | Tipo |
|---|---|---|
| Centro de Costo | `Centro_de_Costo` | Texto |
| UN | `UN` | Lookup (Unidad de Negocio) |
| Comuna | `Comuna` | Lista desplegable |
| Zona | `Zona` | Lista desplegable |
| Región | `Regi_n` | Lista desplegable |
| Provincia | `Provincia` | Lista desplegable |
| Contacto | `Contacto` | Lookup |
| **Código de Sucursal** | `C_digo_de_Sucursal` | Texto |
| ID_Creator | `ID_Creator` | Texto |
| Respuesta_Creator | `Respuesta_Creator` | Área de texto |

Dos cosas importantes para la sincronización:

- **`Código de Sucursal`** es, con casi total seguridad, el dato que usa
  (o debería usar) la integración para saber "esta fila del ERP es esta
  Sucursal en Zoho" — es la llave natural para hacer *upsert* (actualizar
  si existe, crear si no) en vez de duplicar sucursales.
- **`ID_Creator` / `Respuesta_Creator`**: estos dos campos sugieren que la
  sincronización con el ERP **ya pasa (o pasó) por Zoho Creator** (la app
  de formularios/automatización de Zoho, separada del CRM) como
  intermediario, no por una conexión directa ERP↔CRM. Esto no lo puedo
  confirmar del todo desde acá (Creator no está en el alcance de las
  herramientas conectadas a esta sesión, solo CRM) — **antes de armar nada
  nuevo, conviene que confirmes con quien administra esa integración
  (IT/proveedor del ERP) si el puente es Zoho Creator, un middleware, o
  el ERP llamando directo a la API de Zoho CRM.** Eso cambia el "dónde" se
  configura el lado ERP→Zoho, aunque el lado Zoho→ERP (más abajo) es igual
  en cualquier caso.

No encontré ningún campo de estado/vigencia ya existente en el módulo — hay
que crearlo de cero.

## Propuesta del campo nuevo

| | |
|---|---|
| Nombre del campo | Estado de Sucursal |
| Tipo | Lista desplegable (Pick List) |
| Opciones | `Vigente (VI)` y `Bloqueada (BL)` |
| Valor por defecto | Vigente (VI) |
| Módulo | Sucursales |

Nota sobre las opciones: si quien mantiene la integración del ERP prefiere
que el valor que viaja sea literalmente el texto `VI` / `BL` (sin la parte
"Vigente"/"Bloqueada"), se puede crear el picklist con esos dos valores
exactos en vez de la versión "larga". Cualquiera de las dos formas
funciona igual para la sincronización — es solo una preferencia de
legibilidad para los usuarios del CRM. Definilo con el equipo del ERP antes
del Paso 1.

**Esta parte (crear el campo) la puedo aplicar yo directo** con las
herramientas conectadas a esta sesión — pero es un cambio en el Zoho CRM
real, así que según la regla de `CLAUDE.md` espero tu confirmación antes
de crearlo. Mientras tanto, seguí la guía de abajo para armarlo vos mismo
en el Sandbox.

## Cómo armar la sincronización bidireccional

### Dirección 1: ERP → Zoho (Sucursales como receptor)

Esta dirección **no se configura dentro del CRM** — la maneja quien sea
que hoy actualiza las Sucursales desde el ERP (un job, un middleware, o
Zoho Creator según lo que confirmes arriba). El único paso del lado CRM es:

1. Crear el campo `Estado de Sucursal` (Paso 1 más abajo).
2. Pasarle a quien administra esa integración el `api_name` del campo
   (`Estado_de_Sucursal`) y los dos valores exactos que espera Zoho
   (`Vigente (VI)` / `Bloqueada (BL)`, o `VI`/`BL` si elegiste la versión
   corta), para que lo agregue al payload que ya envía por cada Sucursal,
   usando `Código de Sucursal` como llave para hacer *upsert* (así no
   duplica sucursales).

### Dirección 2: Zoho → ERP (cuando se edita a mano en el CRM)

Esto sí se arma dentro de Zoho CRM, con una **Regla de flujo de trabajo**
(Workflow Rule) que dispare un **Webhook** o una **Función** hacia el ERP
cuando alguien cambie el campo a mano.

> Aclaración: crear Reglas de flujo de trabajo / Funciones **no está entre
> las herramientas conectadas a esta sesión** (solo tengo CRUD de
> registros y metadata de campos/layouts) — esta parte la tenés que armar
> vos a mano en Zoho, igual que pasó con el flujo de Motivo de Pérdida.

**Punto crítico: evitar el bucle infinito.** Si la regla se dispara con
cualquier edición del campo, vas a terminar con: ERP actualiza Zoho → la
regla ve un cambio → le avisa al ERP → el ERP vuelve a actualizar Zoho →
bucle. Para evitarlo, la regla tiene que dispararse **solo cuando el
cambio lo hizo una persona desde el CRM**, no cuando lo hizo la
integración del ERP. La forma estándar de lograr esto es agregar un
criterio a la regla:

- `Modificado por` **no es** el usuario/API que usa la integración del
  ERP para escribir en Zoho.

Para saber cuál es ese usuario, preguntale a quien administra la
integración (punto que ya quedó pendiente de confirmar arriba) — suele ser
un usuario dedicado tipo "Integración ERP" o una API Key/Zoho user
específico, nunca un vendedor real.

## Guía paso a paso: primero en Sandbox, después en Producción

### Paso 0 — Entrar al Sandbox

1. Arriba a la derecha, donde ves el nombre de tu organización, hacé clic.
2. Elegí la opción marcada **Sandbox** (en vez de Producción).
3. Vas a ver la misma interfaz de siempre, con un aviso de que estás en
   modo Sandbox.

### Paso 1 — Crear el campo (adentro del Sandbox)

Configuración (⚙️) → Personalización → Módulos y Campos → **Sucursales**
→ Nuevo Campo.

- Tipo: Lista desplegable (Pick List)
- Nombre del campo: `Estado de Sucursal`
- Opciones: `Vigente (VI)` y `Bloqueada (BL)` (o `VI`/`BL`, según lo que
  definiste con el equipo del ERP)
- Valor por defecto: `Vigente (VI)`
- Agregalo al layout Estándar de Sucursales cuando Zoho te lo pregunte.

### Paso 2 — Avisar al lado ERP → Zoho

Pasale a quien administra la integración el `api_name` exacto del campo
(`Estado_de_Sucursal`) y los valores esperados, para que empiece a
mandarlo en el Sandbox primero (si la integración tiene un ambiente de
prueba propio) o para que lo tenga listo para cuando despliegues a
Producción.

### Paso 3 — Armar la Regla de flujo de trabajo (Zoho → ERP)

Configuración (⚙️) → Automatización → **Reglas de flujo de trabajo**.

1. Módulo: **Sucursales**. Crear regla nueva.
2. Disparador ("Cuándo ejecutar"): **Al editar un registro** →
   condición: el campo `Estado de Sucursal` cambia de valor.
3. Criterio adicional (clave para evitar el bucle): `Modificado por` **no
   es** el usuario/API de la integración del ERP.
4. Acción: **Webhook** (si el ERP expone un endpoint HTTP que Zoho puede
   llamar directo) o **Función** (Deluge, si hace falta armar el llamado
   a mano con `invokeurl` — mismo mecanismo que ya usa esta org para
   mandar Órdenes de Venta al ERP desde Cotizaciones, así que el equipo
   que armó eso puede reutilizar la misma conexión/autenticación).
5. Guardar y **activar** la regla.

### Paso 4 — Probar en el Sandbox

1. Abrí una Sucursal de prueba.
2. Cambiá `Estado de Sucursal` a mano (de Vigente a Bloqueada).
3. Verificá que:
   - El Webhook/Función se ejecutó (Configuración → Automatización →
     Reglas de flujo de trabajo → historial de ejecución, o el log de la
     Función).
   - El ERP recibió el cambio (a confirmar con el equipo que lo mantiene).
   - **No se generó un bucle**: el estado no "rebota" ni queda
     parpadeando entre Vigente/Bloqueada.
4. Si tenés forma de simular en el Sandbox una actualización desde el
   ERP (ej. la integración también corre contra el Sandbox), probá ese
   camino también y confirmá que **no** dispara la regla de vuelta hacia
   el ERP (por el criterio de `Modificado por`).

### Paso 5 — Pasar del Sandbox a Producción

Cuando ya probaste y funciona:

1. Configuración (⚙️) → **Sandbox** → **Implementar en Producción**.
2. Marcá para mover: el campo `Estado de Sucursal` y la Regla de flujo de
   trabajo nueva.
3. Revisá la vista previa y confirmá el despliegue.
4. Coordiná con el equipo del ERP para activar el envío del campo en
   Producción (recién ahí, no antes, para no mezclar datos de prueba).

## Próximo paso

- Si preferís que el campo lo cree yo directo (en el ambiente conectado a
  esta sesión), confirmame y lo creo — pero si vas a probarlo primero en
  el Sandbox como arriba, no hace falta que yo toque nada: seguí la guía
  y avisame cuando esté armado para dejarlo marcado como aplicado acá.
- Pendiente clave antes de arrancar: confirmar con quien administra la
  integración del ERP (a) si el puente es Zoho Creator, middleware, o
  llamado directo a la API de Zoho CRM, y (b) cuál es el usuario/API que
  usa para escribir en Zoho (necesario para el criterio anti-bucle del
  Paso 3).
