# Propuesta — Módulo nuevo "Activos de Clientes" (Assets)

**Estado:** propuesta, pendiente de OK de Simón. No se ha tocado el CRM.
**Fecha:** 2026-10-28

## Objetivo

Registrar los equipos que cada cliente ya tiene instalados (comprados a
Emaresa o de terceros) — p. ej. un **puente grúa** — para:

- saber qué equipos tiene cada cliente, dónde están y desde cuándo;
- hacer seguimiento de **mantenciones** (preventivas, correctivas,
  certificaciones) y avisar antes de la próxima;
- generar oportunidades de venta (mantención, repuestos, renovación).

## Qué hay hoy en el CRM (revisado 28-10)

- **No existe** un módulo de Activos/Assets.
- Los productos sí existen en `Products`, p. ej.:
  - `ABUS-00012500` SET PUENTE GRUA ELK 5 TON X 12500 MM
  - `ABUS-000ELK10` SET PUENTE GRUA ELK 10 TON X 10000 MM
  - `ABUS-000VS355` GRUA PLUMA DE PILAR ABUS S 355 2 TON
  - (el campo `Categoría de producto` está vacío en estos productos)
- Existe `Equipos_Rental` (línea Rental) — el MCP no tiene permiso para
  verlo. Hay que confirmar si se cruza con esto (ver pregunta 3).
- El MCP de Zoho **no puede crear módulos**: el módulo lo crea Simón desde
  Configuración; después los campos sí los puedo crear yo por API.

## Decisión previa: ¿CRM o Zoho FSM?

Emaresa tiene **Zoho One**, que incluye **Zoho FSM** (Field Service), que
trae de fábrica: Activos, planes de mantención, órdenes de trabajo,
agenda de técnicos y app móvil, y se sincroniza con el CRM.

| Si el objetivo es… | Conviene |
|---|---|
| Que vendedores/KAM vean la base instalada del cliente y reciban avisos de mantención para venderla | **Módulo en CRM** (esta propuesta) |
| Que el equipo técnico agende y ejecute las mantenciones en terreno (órdenes de trabajo, informes, firma del cliente) | **Zoho FSM** |

Recomendación: partir con el módulo en CRM (simple, rápido, lo usan los
mismos usuarios de hoy). Si después el servicio técnico necesita órdenes de
trabajo, se evalúa FSM.

## Diseño propuesto

### Módulo 1: **Activos de Clientes** (singular "Activo")

| Campo | Tipo | Notas |
|---|---|---|
| Nombre del Activo | Texto (campo nombre) | Ej: "Puente Grúa 5T – Planta Quilicura" |
| Cliente | Búsqueda → Clientes | Obligatorio. Aparece como lista relacionada en la ficha del cliente |
| Producto | Búsqueda → Productos | El modelo vendido (ej. SET PUENTE GRUA ELK 5 TON) |
| Sucursal del Cliente | Búsqueda → Sucursales de Clientes | Dónde está instalado |
| N° de Serie | Texto, **único** | Evita duplicados |
| Marca / Modelo | Texto | Para equipos de terceros sin producto en CRM |
| Capacidad | Texto | Ej: "5 ton x 12.500 mm" |
| Origen | Lista: Venta Emaresa / Rental / Equipo de terceros | |
| Orden de Venta | Búsqueda → Órdenes de venta | Opcional, venta de origen |
| Fecha de Instalación | Fecha | Puesta en marcha |
| Fin de Garantía | Fecha | |
| Estado del Activo | Lista: Operativo / En mantención / Fuera de servicio / Dado de baja | |
| Frecuencia de Mantención (meses) | Número | Ej: 6 = semestral, 12 = anual |
| Última Mantención | Fecha | Se actualiza sola al registrar una mantención |
| Próxima Mantención | Fecha | Se calcula sola (Última + frecuencia) |
| Observaciones | Área de texto | |

Propietario del registro = vendedor/KAM responsable del cliente.

### Módulo 2: **Mantenciones** (historial)

Un registro por cada visita/servicio, colgando del activo (así cada
mantención tiene su propio informe adjunto y se puede reportar).

| Campo | Tipo | Notas |
|---|---|---|
| N° Mantención | Autonumérico (MANT-0001) | Campo nombre |
| Activo | Búsqueda → Activos de Clientes | Obligatorio |
| Cliente | Búsqueda → Clientes | Se completa solo desde el activo |
| Tipo | Lista: Preventiva / Correctiva / Inspección-Certificación / Instalación | |
| Fecha | Fecha | Obligatorio |
| Estado | Lista: Programada / Realizada / Cancelada | |
| Técnico | Búsqueda → Usuario (o texto si es externo) | |
| Descripción del trabajo | Área de texto | |
| Hallazgos / Recomendaciones | Área de texto | Base para cotizar repuestos |
| Oportunidad generada | Búsqueda → Oportunidades | Opcional |
| Informe | Adjunto (archivo) | PDF del informe técnico |

### Automatizaciones

1. **Al marcar una Mantención como "Realizada"** → función actualiza en el
   Activo: Última Mantención = Fecha, Próxima = Fecha + frecuencia,
   Estado = Operativo.
2. **Aviso 30 días antes de Próxima Mantención** (regla de flujo por
   fecha) → tarea al propietario del activo "Coordinar mantención de
   <activo> – <cliente>" + correo.
3. (Opcional) Vista "Mantenciones vencidas" y un informe de base instalada
   por cliente / producto.

## Pasos para crearlo (cuando haya OK)

1. **Simón** — Configuración → Personalización → Módulos y campos →
   Crear nuevo módulo: "Activos de Clientes" (singular "Activo"). Repetir
   para "Mantenciones". Probar primero en **Sandbox** si se prefiere.
2. **Claude** — crear los campos de ambos módulos por API.
3. **Simón** — ordenar el diseño (layout), dar permisos por perfil
   (Configuración → Perfiles), y agregar la lista relacionada "Activos" en
   la ficha del Cliente.
4. **Claude** — entregar el código de la función y la regla de aviso.
5. Carga inicial: Simón comparte un Excel con los puentes grúa vendidos
   (cliente, producto, serie, sucursal, fecha instalación) y se importa.

## Paso a paso en Sandbox — Módulo 1 "Activos de Clientes"

> Los nombres de menú pueden variar un poco según la versión de la interfaz
> de Zoho; el orden es el mismo.

### A. Entrar al Sandbox

1. En el CRM: ⚙️ **Configuración** → **Administración de datos** →
   **Sandbox**.
2. Antes de entrar, revisar que el Sandbox esté **actualizado con
   Producción** (botón *Actualizar / Sincronizar*). Si es antiguo, puede
   que no existan módulos como *Sucursales de Clientes* y no se puedan
   crear las búsquedas del paso C.
3. Clic en **Ir a Sandbox** (se abre otra pestaña con la barra de
   "Sandbox" arriba). Todo lo que sigue se hace ahí.

### B. Crear el módulo

1. ⚙️ **Configuración** → **Personalización** → **Módulos y campos**.
2. Botón **+ Crear nuevo módulo**.
3. Arriba a la izquierda, en el nombre del módulo:
   - Nombre plural: **Activos de Clientes**
   - Nombre singular: **Activo**
4. El módulo trae campos por defecto. Hacer clic sobre el campo de nombre
   (dice "Nombre de Activo" o similar) → **Editar propiedades** →
   etiqueta: **Nombre del Activo**. Dejarlo obligatorio.
   Los demás campos por defecto (Propietario, Creado por, Modificado por,
   Correo electrónico) se pueden dejar; el de **Correo electrónico** se
   puede quitar (arrastrar a "Campos no utilizados").

### C. Agregar los campos

Desde el panel izquierdo, arrastrar cada tipo de campo al diseño, ponerle
la etiqueta y configurar lo indicado. Sugerencia: dos secciones —
**"Información del Activo"** y **"Mantención"** (arrastrar *Nueva sección*).

**Sección "Información del Activo"**

| # | Tipo de campo (panel izquierdo) | Etiqueta | Configuración |
|---|---|---|---|
| 1 | Búsqueda | Cliente | Módulo: **Clientes**. Título de lista relacionada: **Activos**. Marcar **Obligatorio** |
| 2 | Búsqueda | Producto | Módulo: **Productos**. Lista relacionada: **Activos instalados** |
| 3 | Búsqueda | Sucursal del Cliente | Módulo: **Sucursales de Clientes**. Lista relacionada: **Activos** |
| 4 | Línea única | N° de Serie | Propiedades → **No permitir valores duplicados** |
| 5 | Línea única | Marca | |
| 6 | Línea única | Modelo | |
| 7 | Línea única | Capacidad | Ej. "5 ton x 12.500 mm" |
| 8 | Lista de selección | Origen | Valores: Venta Emaresa / Rental / Equipo de terceros. Predeterminado: Venta Emaresa |
| 9 | Búsqueda | Orden de Venta | Módulo: **Órdenes de venta**. Lista relacionada: **Activos** |
| 10 | Fecha | Fecha de Instalación | |
| 11 | Fecha | Fin de Garantía | |
| 12 | Lista de selección | Estado del Activo | Valores: Operativo / En mantención / Fuera de servicio / Dado de baja. Predeterminado: Operativo |

**Sección "Mantención"**

| # | Tipo de campo | Etiqueta | Configuración |
|---|---|---|---|
| 13 | Número | Frecuencia de Mantención (meses) | Ej. 6 = semestral, 12 = anual |
| 14 | Fecha | Última Mantención | |
| 15 | Fecha | Próxima Mantención | Por ahora se llena a mano; después lo hará la automatización |
| 16 | Varias líneas | Observaciones | |

> Tip: en *Lista de selección*, escribir un valor por línea en el cuadro
> de opciones. En *Búsqueda*, el "Título de lista relacionada" es el nombre
> con que aparecerá la lista en la ficha del otro módulo (ej. en la ficha
> del Cliente aparecerá "Activos").

### D. Guardar y dar permisos

1. Clic en **Guardar** (arriba a la derecha).
2. Zoho pregunta a qué **perfiles** dar acceso al módulo: para la prueba
   marcar **Administrator** (y, si se quiere probar con un vendedor, su
   perfil). Lo definitivo se ajusta antes de pasar a Producción.
3. Si el módulo no aparece en la barra de pestañas: ⚙️ → Personalización
   → Módulos y campos → verificar que esté **visible**, o buscarlo en
   "Todos los módulos" / "Más".

### E. Revisar la ficha del Cliente

1. Abrir cualquier cliente en el Sandbox.
2. Debe aparecer la lista relacionada **Activos** (si no se ve: en la
   ficha, sección de listas relacionadas → **Administrar listas
   relacionadas** → activarla).
3. Lo mismo en un Producto (**Activos instalados**) y en una Sucursal de
   Cliente.

### F. Prueba

1. Crear un activo de prueba, ej.:
   - Nombre: "Puente Grúa 5T – Prueba"
   - Cliente: cualquiera del Sandbox
   - Producto: SET PUENTE GRUA ELK 5 TON X 12500 MM (`ABUS-00012500`)
   - N° de Serie: TEST-001, Frecuencia: 6, Última Mantención: hoy
2. Intentar crear otro con N° de Serie **TEST-001** → Zoho debe
   rechazarlo (duplicado).
3. Verificar que el activo aparece en la ficha del Cliente y del Producto.
4. Avisar a Claude con el resultado (o un pantallazo) → siguiente paso:
   módulo 2 "Mantenciones" y la automatización de fechas/aviso.

### Ajuste: que "Sucursal del Cliente" muestre solo las del cliente elegido

Problema visto en la prueba (28-10): al buscar sucursal salen **todas**
las sucursales del CRM, no solo las del cliente del activo.

Solución: **filtro de búsqueda dinámico** en el campo. En `Sucursales de
Clientes` el campo que apunta al cliente se llama **Cliente** (API
`Cliente`, búsqueda a Clientes).

1. ⚙️ Configuración → Personalización → Módulos y campos → **Activos de
   Clientes** → diseño (Standard).
2. Pasar el mouse sobre el campo **Sucursal del cliente** → ⚙️ / ⋮ →
   **Editar propiedades**.
3. Activar **Filtro de búsqueda** ("Filtrar registros de búsqueda" /
   "Lookup filter").
4. Condición: **Cliente** (de Sucursales de Clientes) **es** → en el
   valor, cambiar al modo **campo** (ícono junto al cuadro de valor) y
   elegir **Activos de Clientes → Cliente**.
5. Guardar el campo y guardar el diseño.
6. Probar: elegir primero el Cliente y luego abrir la búsqueda de
   sucursal → solo deben salir sus sucursales. Si el Cliente está vacío,
   la lista sale vacía (es lo esperado: siempre llenar Cliente primero).

Si no aparece la opción de valor por campo (solo deja escribir un valor
fijo), avisar: la alternativa es un *Client Script* de unos pocas líneas.

Otro detalle visto en el pantallazo: **Fecha de instalación** quedó como
*Fecha/Hora* (muestra 04:00 PM). Lo correcto es tipo **Fecha**; como el
tipo no se puede cambiar, borrar ese campo y crearlo de nuevo como Fecha
(en Sandbox no hay datos que perder).

### Ajuste: Cotizaciones y Oportunidades asociadas a un Activo

Pedido de Simón (29-10): que un activo pueda tener **muchas cotizaciones**
(y oportunidades), igual que un cliente tiene muchas.

Solución: campo de **Búsqueda "Activo"** dentro de Cotizaciones (y de
Oportunidades). Cada cotización apunta a un activo; en la ficha del activo
aparece la lista "Cotizaciones" con todas las que lo nombran.
(Cotizaciones tiene un solo diseño, "Standard".)

1. ⚙️ → Personalización → Módulos y campos → **Cotizaciones** → Standard.
2. Arrastrar un campo **Búsqueda** (sección de información de la
   cotización, cerca de Cliente / Oportunidad).
   - Rótulo: **Activo**
   - Módulo de búsqueda: **Activos de Clientes**
   - Título de lista relacionada: **Cotizaciones**
   - No obligatorio (no toda cotización es de un equipo).
3. **Filtrar registros de búsqueda**: **Cliente** (del activo) · **es** ·
   **Campo** → **Nombre de Cliente** (de la cotización). Marcar *Validar
   filtro durante la edición*. Así solo salen los activos del cliente.
4. Fin → Guardar.
5. ~~Repetir en **Oportunidades**~~ — **descartado (29-10)**: Simón
   solo necesita ver las cotizaciones en el activo. Pasos originales:
   repetir en **Oportunidades** (en cada diseño/pipeline que use la
   venta de equipos): rótulo **Activo**, lista relacionada
   **Oportunidades**, mismo filtro con **Nombre de Cliente** de la
   oportunidad.
6. En la ficha del activo: ícono de columnas de cada lista para mostrar
   N° cotización, Asunto, Fase, Total, Propietario (cotizaciones) y
   Nombre, Fase, Importe, Fecha de cierre (oportunidades).

Nota: con este diseño una cotización queda ligada a **un** activo. Si una
misma cotización suele cubrir varios equipos (ej. mantención de 3 puentes
grúa juntos), la alternativa es un campo de **búsqueda de selección
múltiple**; contra: no admite el filtro por cliente y es más incómodo en
informes. Recomendación: búsqueda simple.

### Ajuste: módulo solo para la UN **Inamar Izaje** (29-10)

Simón aclaró que Activos es **solo para Inamar Izaje**. Cambios:

1. **Acceso al módulo por perfil** — ⚙️ → Usuarios y control → Seguridad
   → Perfiles → en cada perfil: módulo *Activos de Clientes* activado solo
   en los perfiles de usuarios Izaje (+ Administrator); desactivado en el
   resto. Así la lista "Activo" tampoco aparece en la ficha del Cliente
   para los demás.
   - Si los vendedores Izaje comparten perfil con otras UN, esto no los
     separa: en ese caso dejar el módulo visible y apoyarse en el punto 2.
2. **Campo "Activo" en Cotizaciones solo cuando la UN es Inamar Izaje**
   (Cotizaciones tiene un único diseño Standard y el campo `UN` es búsqueda
   a Unidades de Negocio):
   ⚙️ → Módulos y campos → Cotizaciones → **Reglas de diseño** → Nueva
   regla: *Si* **UN** *es* **Inamar Izaje** → *Mostrar campos*: **Activo**.
   Para el resto de las UN el campo no aparece.
3. En el módulo Activos **no hace falta** campo UN (todo es Izaje).
4. Origen (lista) y productos: se mantienen; los puentes grúa ABUS son
   productos de Izaje.

### Ajuste: al "Asignar" cotizaciones desde el Activo salen otras UN (29-10)

Problema: desde la ficha del Activo → lista Cotizaciones → **Asignar**,
Zoho lista **todas** las cotizaciones (cualquier UN y cliente). El filtro
de búsqueda del campo Activo solo funciona en la dirección contraria
(desde la cotización elige activos); Zoho no permite filtrar ese
"Asignar".

Solución recomendada:
1. **Asociar siempre desde la cotización**: abrir la cotización → campo
   **Activo** → ahí solo salen los activos del cliente de esa cotización,
   y el campo solo aparece en cotizaciones Inamar Izaje (regla de diseño).
2. **Candado — regla de validación** en Cotizaciones, por si alguien usa
   "Asignar" igual: ⚙️ → Módulos y campos → Cotizaciones → Reglas de
   validación → Nueva → campo **Activo**: si *Activo no está vacío* y
   *UN no es Inamar Izaje* → mensaje "Solo cotizaciones Inamar Izaje se
   pueden asociar a un Activo". Probar en Sandbox si también frena el
   "Asignar" de la lista relacionada.
3. Si se usa igual "Asignar": en la ventana buscar por N° de cotización.

### G. Después (no ahora)

Cuando el módulo esté validado en Sandbox, se pasa a Producción desde
**Sandbox → Implementar cambios** (deploy), eligiendo el módulo
"Activos de Clientes" y sus campos, y se ajustan los permisos por perfil.

## Preguntas abiertas

1. ¿CRM (esta propuesta) o Zoho FSM? ¿Quién ejecuta las mantenciones:
   técnicos de Emaresa, un servicio externo, o solo se quiere el aviso
   comercial?
2. ¿Sólo puentes grúa o todo equipo (grúas pluma, tecles, articuladas…)?
3. ¿Los equipos Rental (`Equipos_Rental`) deben entrar aquí o quedan
   aparte?
4. ¿Qué perfiles deben verlo/editarlo (vendedores, servicio técnico,
   gerentes de UN)?
5. ¿Existe ya un listado (Excel/ERP) de equipos instalados para la carga
   inicial?
