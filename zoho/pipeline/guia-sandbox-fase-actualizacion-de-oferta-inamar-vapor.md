# Guía Sandbox: nueva Fase de Cotización "Actualización de oferta" (solo Inamar Vapor)

**Fecha:** 2026-10-23 · **Estado:** propuesta, pendiente de probar en Sandbox
y del OK de Simón para pasar a Producción.

## Pedido
Nueva fase de Cotización **"Actualización de oferta"**:
- disponible **solo para la UN Inamar Vapor**;
- seleccionable desde **todas las fases menos Cerrada Ganada y Cerrada Perdida**.

## Lo revisado en Producción (solo lectura)
- Cotizaciones tiene **un solo diseño** ("Standard"), compartido por todas
  las UN. La UN es un campo de búsqueda (`UN`), no un diseño propio.
- Por eso **no se puede ocultar el valor del listado por UN** con diseños:
  el valor nuevo de "Fase de Cotización" existe para todos. Lo que lo
  restringe a Inamar Vapor es el **Blueprint**: la fase la mueve el
  Blueprint "SB Gestión de Cotizaciones" (el vendedor no la edita a mano),
  así que si la transición tiene criterio **UN = Inamar Vapor**, solo esas
  cotizaciones ven el botón.
- Valores actuales de Fase de Cotización: Creada, Pendiente de Aprobación,
  Solicitud de Equipo, Cotizacion Parcialmente Aprobada, Cotización
  Aprobada, Cotización Rechazada, Enviada, Cerrada Ganada, Cerrada Perdida,
  Ganada, Pendiente de revisión, Sin Stock suficiente, Lista para
  Confirmar, Lista para Clonar, Direc. de Facturación/Despacho validada,
  Recotizada, En proceso de recotización.
- Cotizaciones de Inamar Vapor hoy: Enviada 139, Creada 50, Cerrada
  Perdida 7 (usan básicamente Creada → Enviada → Cierre).

## Diseño propuesto
1. Nuevo valor **"Actualización de oferta"** en el campo Fase de Cotización.
2. En el Blueprint, una **transición común** llamada "Actualización de
   oferta" (destino: Actualización de oferta), disponible desde todas las
   fases del Blueprint **excepto** Cerrada Ganada y Cerrada Perdida, con
   criterio **UN = Inamar Vapor**.
3. Desde "Actualización de oferta" la cotización tiene que poder seguir:
   transiciones de salida hacia **Enviada** (volver a enviar la oferta
   actualizada), **Cerrada Ganada** y **Cerrada Perdida**. *(A confirmar
   por Simón: si debe salir a otras fases.)*

---

## Paso a paso en Sandbox

### Parte 0 — Preparar el Sandbox
1. **Configuración → Espacio de desarrollador → Sandbox → Abrir Sandbox.**
   Si el sandbox es antiguo, conviene **refrescarlo** (Actualizar desde
   Producción) para que tenga la versión actual del Blueprint
   "SB Gestión de Cotizaciones".
2. Revisar que en el Sandbox exista el registro **Inamar Vapor** en
   Unidades de Negocio y al menos una cotización de prueba con UN =
   Inamar Vapor (si no, créala a mano).
3. Desactivar en Sandbox las reglas de Cotizaciones que mandan datos a
   Creator/ERP (ej. "Enviar Sub Fase de Cotizacion a Creator"), para que
   las pruebas no lleguen a sistemas reales.

### Parte 1 — Agregar el valor al campo
1. **Configuración → Personalización → Módulos y campos → Cotizaciones →
   Diseño Standard.**
2. Buscar el campo **Fase de Cotización** → engranaje → **Editar
   propiedades**.
3. Agregar el valor **Actualización de oferta** (ubicarlo después de
   "Enviada" para que quede ordenado).
4. **Guardar** y luego **Guardar diseño**.

> Ojo: el valor queda visible para todas las UN en filtros y vistas, pero
> nadie podrá llegar a él salvo por la transición del Blueprint.

### Parte 2 — Agregar la fase y la transición al Blueprint
1. **Configuración → Automatización → Blueprint →** abrir
   **"SB Gestión de Cotizaciones"** → **Editar**.
2. En el panel izquierdo (Fases), arrastrar **Actualización de oferta** al
   lienzo.
3. Crear la **transición común**: en el lienzo, botón **"+ Transición
   común"** (Common Transition).
   - Nombre: `Actualización de oferta`
   - **Desde:** marcar todas las fases **menos Cerrada Ganada y Cerrada
     Perdida** (y menos la propia "Actualización de oferta").
   - **Hasta:** Actualización de oferta.
4. Abrir la transición nueva → pestaña **Antes**:
   - **Quién:** los mismos que tienen hoy las demás transiciones (ej.
     Propietario del registro + los roles de Inamar Vapor que la usan).
   - **Criterios:** `UN` **es** `Inamar Vapor`. Esto es lo que hace que
     solo aparezca en cotizaciones de Inamar Vapor.
5. Pestaña **Durante** (opcional, recomendado): pedir una **Nota** o un
   campo obligatorio con el motivo de la actualización, para dejar
   registro de qué cambió en la oferta.
6. Pestaña **Después** (opcional): alerta o tarea si se quiere avisar a
   alguien.
7. Crear las **transiciones de salida** desde "Actualización de oferta":
   arrastrar desde la fase nueva hacia **Enviada** (ej. "Confirmar Envío
   de Cotización Actualizada"), **Cerrada Ganada** y **Cerrada Perdida**,
   copiando la configuración (Quién/Durante/Después) de las transiciones
   equivalentes que ya existen, para no perder validaciones ni funciones
   (ej. la creación de OV al ganar).
8. **Guardar** y **Publicar**.

> Si en vez de "Transición común" el Blueprint tiene **fases paralelas o
> un Blueprint distinto por UN**, la idea es la misma: la transición común
> va en el Blueprint que cubre a Inamar Vapor, con el criterio de UN.

### Parte 3 — Probar en Sandbox
| Prueba | Resultado esperado |
|---|---|
| Cotización Inamar Vapor en Creada | Aparece botón "Actualización de oferta" |
| Cotización Inamar Vapor en Enviada | Aparece botón "Actualización de oferta" |
| Cotización Inamar Vapor en Cerrada Ganada / Perdida | **No** aparece |
| Cotización de otra UN (ej. Inamar Izaje) en Enviada | **No** aparece |
| Ejecutar la transición | Fase queda en "Actualización de oferta" |
| Desde "Actualización de oferta" | Se puede pasar a Enviada / Cerrada Ganada / Cerrada Perdida |
| Revisar Oportunidad asociada | La regla "SB Actualizar Fase de Oportunidad según Cotización" no la mueve mal |

### Parte 4 — Antes de pasar a Producción (revisar)
- **Creator / Cotizador:** la regla "Enviar Sub Fase de Cotizacion a
  Creator" manda la fase al Cotizador. Confirmar con el proveedor que
  Creator acepte el valor nuevo "Actualización de oferta" (si valida
  contra una lista, puede rechazarlo).
- **Regla "SB Actualizar Fase de Oportunidad según Cotización":** decidir
  si la Oportunidad debe cambiar de fase cuando la Cotización pasa a
  "Actualización de oferta" (por defecto no se toca).
- **Informes / vistas** que filtren por Fase de Cotización: agregar el
  valor nuevo si corresponde.

### Parte 5 — Pasar a Producción
Repetir Parte 1 y Parte 2 en Producción (o usar **Implementar cambios**
desde el Sandbox, si el Blueprint aparece en la lista de cambios), y
hacer una prueba con una cotización real de Inamar Vapor.

## Pendiente
- Confirmar transiciones de salida desde "Actualización de oferta".
- Confirmar con proveedor el impacto en Creator.
- OK de Simón para aplicar en Producción.
