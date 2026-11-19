# Widget de prueba — "Clonar Cotización (prueba)" con disclaimer Sí/No

Fecha: 2026-11-19 · Estado: **para probar en Sandbox**. No toca el botón actual.

Archivos:
- `app/widget.html` — el widget (código fuente).
- `clonar-cotizacion-prueba.zip` — lo que se sube a Zoho (contiene `widget.html`).

Qué hace (botón nuevo, en la página de detalle de Cotizaciones):
| Fase | Qué ve el usuario |
|---|---|
| Cerrada Ganada | Disclaimer (oportunidad nueva, mismo u otro cliente, datos obligatorios del cliente) con **Sí, continuar** / **Cancelar** |
| Creada, Aprobada, Rechazada, Enviada, Cerrada Perdida, Lista para Clonar | "Continuar al Cotizador" / Cancelar |
| Otras | "No se permite clonar" |
| Sin ID Creator | "No se hizo en el Cotizador, no se puede clonar" |

El Cotizador se abre en **pestaña nueva** (Sandbox: Cotizador de desarrollo).
Al pasar a Producción: en `widget.html` cambiar `AMBIENTE = 'sandbox'` por
`'produccion'`, volver a armar el .zip y subirlo.

## Paso a paso (Sandbox)

### 0. Verificar que existe la opción Widget
Cotizaciones → Botones → **Crear nuevo botón** → desplegable **Definir
acción**: debe aparecer **Widget**. Si no aparece, parar y avisar.

### 1. Subir el widget
1. Configuración → **Developer Hub** → **Widgets** → **Crear nuevo widget**.
2. Nombre: `Clonar Cotización prueba` · Tipo: **Botón** (o "Button").
3. Alojamiento (Hosting): **Zoho** (interno) → subir `clonar-cotizacion-prueba.zip`.
4. Página de índice (Index page): `/widget.html`.
5. **Guardar**.

### 2. Crear el botón nuevo
1. Configuración → Personalización → Módulos y campos → **Cotizaciones** →
   **Botones** → **Crear nuevo botón**.
2. Nombre: `Clonar Cotización (prueba)`.
3. Definir acción: **Widget** → elegir `Clonar Cotización prueba`.
4. Página: **En registro** · Posición: **Detalles** · Diseño: **Estándar**.
5. Perfiles: **solo Administrador** (para que solo lo vea quien prueba).
6. **Guardar**.

### 3. Probar
| Prueba | Esperado |
|---|---|
| Cotización Cerrada Ganada → "Clonar Cotización (prueba)" | Ventana con disclaimer y Sí/No |
| Pulsar **Cancelar** | Se cierra, no pasa nada |
| Pulsar **Sí, continuar** | Se abre el Cotizador (desarrollo) en pestaña nueva, en modo clonar |
| Cotización Enviada | Ventana "Continuar al Cotizador" |
| Cotización Pendiente de Aprobación | "No se permite clonar" |
| Guardar el clon en el Cotizador | Sigue el resto del Paso 1 (oportunidad nueva, aprobación) |

Si el navegador bloquea la pestaña nueva: permitir ventanas emergentes para Zoho.
Si la ventana queda en "Cargando cotización…": mandar captura (puede faltar
permiso del widget para leer Cotizaciones o el tipo de widget no es Botón).

### Volver atrás
Borrar o desactivar el botón "Clonar Cotización (prueba)". El botón original
no se tocó.
