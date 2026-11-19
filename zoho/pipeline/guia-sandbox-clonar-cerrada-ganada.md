# Guía Sandbox — PASO 1: clonar una cotización Cerrada Ganada (mismo cliente u otro)

Fecha: 2026-11-18 · Actualizada 2026-11-19 · Estado: **lista para probar en Sandbox**.
Solo Sandbox. No se toca Producción.

## Alcance del Paso 1 (decisión de Simón 19-11)
Solo esto:
- Clonar una cotización **Cerrada Ganada** para hacer otra cotización al
  **mismo cliente** o a un **cliente distinto**.
- El clon tiene **oportunidad nueva** (no se cuelga de la oportunidad ganada).
- El clon nace en **Creada** y, si cumple criterios, pasa solo a **aprobación**.
- La original **sigue Cerrada Ganada**.
- Aviso al vendedor de los datos que debe tener el cliente.

**Fuera del Paso 1** (queda igual que hoy): botón Editar, clonar desde otras
fases, pasar la original a Recotizada, bloqueos por fase, Vapor.

## Qué se configura (2 cosas)
| # | Qué | Archivo |
|---|---|---|
| 1 | Reemplazar el código de la función del botón **Clonar Cotización** | `zoho/config/funciones/SBclonarCotizacion.paso1.deluge` |
| 2 | Función + regla para crear la **oportunidad nueva** del clon | `zoho/config/funciones/cotizacion_clonCrearOportunidad.deluge` |

Respaldo para volver atrás: `zoho/config/funciones/SBclonarCotizacion.actual.deluge`.

### Por qué tan poco
- El botón **ya permite** clonar Cerrada Ganada hoy → el cambio 1 solo agrega
  el aviso (las demás fases quedan idénticas).
- La **aprobación ya se dispara sola** al crear el clon (revisado en
  Producción, COT-REN-6359: el Cotizador marca la casilla y en el mismo
  segundo entra a "UN Rental - Aprobación Venta").
- Lo que falta es la **oportunidad nueva**: hoy en Rental/Izaje el clon queda
  en la oportunidad ganada de la original (esas oportunidades las crea el
  vendedor a mano; en Construcción las crea el Cotizador).

---

## Configuración en Sandbox

### 0. Preparar
1. Configuración → **Sandbox** → abrir el Sandbox (refrescar si es antiguo,
   para que tenga los botones y el Blueprint actuales).
2. Ubicar una cotización **Rental** o **Inamar Izaje** en **Cerrada Ganada**
   con **ID Creator** lleno. Anotar número, cliente, monto y oportunidad.
   > No usar Construcción para probar aprobación: allí la casilla
   > "Aprobación Descuento Monto Mínimo" no dispara ningún proceso.
3. Tener a mano un **segundo cliente** con Contacto, Sucursal del Cliente
   (y Obra si es Rental) y Forma de Pago, y un **tercer cliente sin
   contacto o sin sucursal** (para la prueba de error).

### 1. Botón Clonar Cotización
1. Cotizaciones → desplegable **Editar Cotización** → Administrar botones →
   **Clonar Cotización** → junto a "SB Clonar Cotizacion" pulsar **Editar**.
2. Borrar el código y pegar el de `SBclonarCotizacion.paso1.deluge`.
3. **Guardar**. (No cambiar argumentos ni perfiles.)

### 2. Oportunidad nueva para el clon
1. Configuración → Automatización → Acciones → **Funciones** → **Nueva función**.
   - Nombre: `cotizacion_clonCrearOportunidad` · Categoría: Automatización.
   - Argumento: `quoteId` (tipo Cadena).
   - Pegar el código de `cotizacion_clonCrearOportunidad.deluge` → **Guardar**.
   - Si da "Improper code format", dejar solo el contenido entre las llaves
     `{ … }` o respetar la primera línea que propone Zoho con el nombre que
     generó (como pasó con la función de re-aprobación).
2. Configuración → Automatización → **Reglas de flujo de trabajo** → **Crear regla**.
   - Módulo: **Cotizaciones** · Nombre: `Clon - Crear oportunidad nueva`.
   - Cuándo: **Creación del registro**.
   - Condición: **ID Cotizac. Original** *no está vacío*.
   - Acción instantánea → **Función** → `cotizacion_clonCrearOportunidad`
     → `quoteId` = Cotizaciones → **Id de cotización**.
   - **Guardar**.

La función (con `soloDesdeGanada = true`) **solo actúa si la original está
Cerrada Ganada**. Crea la oportunidad con: cliente, contacto, propietario,
UN, obra y monto del clon; fase Creada; cierre a 30 días; sucursal, tipo de
negocio y canal copiados de la oportunidad anterior. La asocia al clon y
deja una **nota** en el clon. Si Zoho no deja crearla (campo obligatorio
faltante), deja una nota con el error.

---

## Pruebas

### Prueba A — Mismo cliente, sin aprobación
1. Abrir la Ganada → Editar Cotización ▾ → **Clonar Cotización**.
2. Ver el **aviso** en el CRM y que se abra el Cotizador.
3. En el Cotizador, cambiar algo menor (ej. fecha/cantidad baja) → Guardar.

### Prueba B — Mismo cliente, con aprobación
1. Clonar la misma Ganada.
2. Forzar un criterio: Rental (venta rental) o Izaje (> 10 millones o
   descuento alto) → Guardar.

### Prueba C — Otro cliente (con datos completos)
1. Clonar la Ganada → en el Cotizador cambiar el **cliente** por el segundo
   cliente, y elegir su contacto/sucursal(/obra) → Guardar.

### Prueba D — Otro cliente sin datos
1. Clonar la Ganada → cambiar al cliente **sin contacto o sucursal**.
2. Esperado: el Cotizador **no deja guardar**. Anotar el mensaje exacto.

### Qué revisar
| Revisar | A | B | C | D |
|---|---|---|---|---|
| Aviso al pulsar Clonar + Cotizador abierto | ✔ | ✔ | ✔ | ✔ |
| Fase del clon | Creada | **Pendiente de Aprobación** | Creada o Pendiente según valores | No se crea |
| Aprobador recibe solicitud | No | **Sí** | Según valores | — |
| Cliente del clon | Mismo | Mismo | **Nuevo** | — |
| Oportunidad del clon | **Nueva** | **Nueva** | **Nueva, del cliente nuevo** | — |
| Nota en el clon "Oportunidad nueva por clonación" | ✔ | ✔ | ✔ | — |
| Original | Sigue Cerrada Ganada | Igual | Igual | Igual |
| Oportunidad de la original | Sigue Ganada, mismo monto | Igual | Igual | Igual |
| Nombre de la oportunidad nueva | Anotar | Anotar | Anotar | — |

Notas:
- Si la oportunidad nueva queda con nombre **"CLON COT-…"**, no hay regla
  que numere oportunidades → avisar y se ajusta al formato AAMMDD-OP-….
- Si en **B** el clon queda en Creada aunque cumpla criterios → anotar el
  número (es el mismo problema del Cotizador al editar).
- Si el **aviso no aparece** pero sí se abre el Cotizador → avisar; se
  quita el aviso del botón y se pide al proveedor dentro del Cotizador.
- Si en **C** el Cotizador obliga a elegir una oportunidad del cliente nuevo
  antes de guardar → anotarlo (la función no duplica: si el clon ya trae una
  oportunidad abierta del cliente correcto, no crea otra).

## Resultado (llenar)
| Prueba | Original | Clon | Fase del clon | ¿Aprobación? | Oportunidad del clon | Original sigue Ganada | Aviso visible | OK |
|---|---|---|---|---|---|---|---|---|
| A | | | | | | | | |
| B | | | | | | | | |
| C | | | | | | | | |
| D | | | | | | | | |

## Volver atrás
- Botón: pegar `SBclonarCotizacion.actual.deluge`.
- Desactivar la regla "Clon - Crear oportunidad nueva".
