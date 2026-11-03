# Revisión — módulo Activos en Producción (2026-11-03)

Simón implementó el módulo desde Sandbox a Producción y dice que "no quedó
como en Sandbox". Revisado por API en Producción (solo lectura, sin
cambios):

- Módulo: **Activos** (API `Activos`, CustomModule40), 0 registros.
  Acceso a nivel módulo: perfiles **Administrator** y **Vendedor**.
- Campo nombre: **Numero de serie** (`Name`).

| Campo | API | Tipo | Observación |
|---|---|---|---|
| Cliente | `Cliente` | Búsqueda → Clientes | Lista relacionada con nombre por defecto "Etiqueta de lista relacionada 1" |
| Sucursal del cliente | `Sucursal_del_cliente` | Búsqueda → Sucursales de Clientes | Tiene filtro de búsqueda y "validar al editar" ✔. Lista relacionada con nombre por defecto |
| Estado del Activo | `Estado_del_Activo` | Lista | Valores: **Opción 1 / Opción 2** / Fuera de servicio / Dado de baja → faltan "Operativo" y "En mantención" |
| Fecha de instalación | `Fecha_de_instalaci_n` | **Fecha/Hora** | Debería ser Fecha |
| Marca, Modelo, Capacidad | | Texto | OK |
| Observaciones | | Área de texto | OK |

Faltan respecto a la propuesta: Producto, Origen, Orden de Venta, Fin de
Garantía, Frecuencia de Mantención, Última Mantención, Próxima Mantención.

En **Cotizaciones** no existe el campo búsqueda **Activo** → la lista de
cotizaciones en el activo no existe en Producción. Tampoco se ve la regla
de diseño (UN = Inamar Izaje) ni la función/flujo `validarActivoCotizacion`
(no verificable por API, revisar a mano).

## Qué puedo hacer por API (con OK de Simón)

- Crear campos que faltan (`createFields`): Producto, Fin de Garantía,
  Frecuencia, Última/Próxima Mantención, y el campo **Activo** en
  Cotizaciones.

## Qué tiene que hacer Simón a mano

- Cambiar valores "Opción 1/Opción 2" → Operativo / En mantención.
- Renombrar listas relacionadas (Cliente → "Activos", Sucursal → "Activos").
- Recrear "Fecha de instalación" como Fecha.
- Regla de diseño en Cotizaciones, función y flujo de trabajo.
- Permisos del módulo a perfiles Izaje.
