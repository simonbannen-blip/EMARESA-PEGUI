# Propuesta: permisos para exportar OV a PDF con la plantilla "OV prueba"

**Estado:** propuesta, pendiente del OK de Simón. No se aplicó nada en el CRM.
**Fecha:** 2026-09-23

## Problema

Al exportar una Orden de Venta a PDF con la plantilla de inventario
"OV prueba" (carpeta "Ordenes de venta", ya compartida con "Todos los
usuarios"), los usuarios no administradores ven:
"No tiene permisos suficientes para realizar esta operación".
A Simón (perfil Administrator) le funciona.

## Pedido original y por qué no se aplica tal cual

Simón pidió "dar mi acceso a todos los usuarios". Eso significa pasar a
unos 180 usuarios activos al perfil **Administrator**. No se recomienda:
tendrían acceso a toda la configuración del CRM (campos, flujos, usuarios,
borrado masivo, exportación de toda la base). Además, el MCP no permite
editar los permisos de un perfil, solo cambiar el perfil de cada usuario.

## Qué encontré (solo lectura, 2026-09-23)

Usuarios activos por perfil: Vendedor 64, Responsable de Área 43,
Vendedor Distribución Repuestos jardín y maquinari 27, Asistente 19,
Gerente 8, Vendedor MIV 7, Standard 6, Administrator 6,
Responsable de Área MIV y MAK 4, Vendedor MAK 3.

Módulos con acceso restringido que pueden bloquear el PDF:

| Módulo | Perfiles con acceso hoy |
|---|---|
| Órdenes de venta | todos, **salvo Vendedor MIV y Responsable de Área MIV y MAK** |
| Catálogos de precios (Price_Books) | solo Administrator, Vendedor MAK |
| Detalle Listas de Precios | solo Administrator, Vendedor MAK |
| Descuentos por UN | solo Administrator, Vendedor MAK |

Si la plantilla usa algún campo de esos módulos, Zoho bloquea el PDF
completo para quien no tiene acceso.

## Opciones (elegir una)

**A. Ajustar la plantilla (recomendada, sin tocar permisos).**
Quitar de "OV prueba" los campos que vienen de Catálogos de precios,
Detalle Listas de Precios o Descuentos por UN. Usar en su lugar los campos
de la propia OV / Artículos solicitados (Precio de lista, Descuento, Total).

**B. Dar permiso de "Ver" en los módulos restringidos.**
En Configuración → Control de seguridad → Perfiles, para cada perfil que
debe exportar: activar **Ver** en Catálogos de precios, Detalle Listas de
Precios y Descuentos por UN. Además, dar acceso a **Órdenes de venta** a
Vendedor MIV y Responsable de Área MIV y MAK si deben usarla.
Se hace desde la pantalla de Zoho, porque el MCP no edita perfiles.

**C. Pasar a todos a Administrator (no recomendada).** Ver arriba.

## Decisión (2026-09-23)

Simón eligió la opción B, solo para dos perfiles:
- **Asistente** (19 usuarios)
- **Vendedor Distribución Repuestos jardín y maquinari** (27 usuarios)

Los dos ya tienen acceso a Órdenes de venta. Hay que activar **Ver** en:
Catálogos de precios, Detalle Listas de Precios y Descuentos por UN.
Simón lo aplica desde la pantalla de Zoho (el MCP no edita perfiles).
Pendiente: confirmar que el PDF funciona después del cambio.

## Verificación (2026-09-24)

El error seguía en la OV 5404724000611143779 (dueño: Cristian Jara, perfil
Vendedor Distribución Repuestos jardín y maquinari). Estado real en el CRM:

| Perfil | Catálogos de precios | Descuentos por UN | Detalle Listas de Precios |
|---|---|---|---|
| Asistente | ✅ aplicado | ✅ aplicado | ❌ falta |
| Vendedor Distribución Repuestos jardín y maquinari | ❌ falta | ❌ falta | ❌ falta |

Nota: la tabla de productos de la OV tiene el campo "Catálogo de precios"
(Price_Book_Name), que apunta al módulo Catálogos de precios. Por eso ese
permiso es el más probable de bloquear el PDF.

## Nueva causa probable (2026-09-24)

Con Catálogos de precios y Descuentos por UN ya aplicados, al perfil
Asistente le seguía fallando. "Detalle Listas de Precios" no aparece en los
perfiles porque es un módulo oculto, y la OV no lo usa: se descarta.

En la tabla de productos de la OV (Artículos solicitados) hay 2 campos
**ocultos para todos los perfiles salvo Administrator**:
- **Bodega**
- **Producto Confirmado**

Si "OV prueba" incluye alguna de esas columnas, eso explica que solo a los
administradores les funcione. Solución propuesta: quitar esas 2 columnas de
la plantilla (sin tocar permisos). La otra opción es cambiarlas a "solo
lectura" para los perfiles que exportan.

## Comparación Cotizaciones vs Órdenes de venta (2026-09-24)

Simón aclara que el PDF de Cotizaciones sí funciona para esos perfiles.
Diferencias encontradas (solo lectura):

| | Cotizaciones | Órdenes de venta |
|---|---|---|
| Acceso al módulo (Asistente / Vend. Distribución) | Sí | Sí |
| "Producto Confirmado" oculto en tabla de productos | Sí | Sí (no es la causa) |
| Campo **Bodega** en tabla de productos (oculto a todos salvo Admin, apunta a otro módulo) | No existe | **Sí** |
| Quién crea el registro | El vendedor | La integración ERP (usuario "Infraestructura Emaresa") |
| Aprobadores (campos de usuario) y proceso de aprobación | — | Sí |

Candidatos a revisar: (1) columna Bodega en la plantilla; (2) permisos
extra del módulo Órdenes de venta en el perfil (Exportar/Imprimir),
comparados con Cotizaciones; (3) prueba con la plantilla pública para
separar plantilla vs. permisos.

## Prueba con plantilla pública (2026-09-24)

Al Asistente tampoco le funciona la plantilla pública "Plantilla de orden
de venta". Conclusión: **no es la plantilla "OV prueba"**; el bloqueo es del
perfil o de cómo se comparten las OV. Bodega no está en la plantilla.

Próximos pasos (en Zoho, pantalla de Simón):
1. Perfiles → Asistente → Permisos de módulo: comparar Cotizaciones vs
   Órdenes de venta, incluidas las opciones extra (Exportar, Imprimir, etc.).
2. Control de seguridad → Compartir datos: comparar el acceso por defecto
   de Cotizaciones vs Órdenes de venta.
3. Ver si algún perfil no administrador (p. ej. Gerente) sí puede exportar
   una OV, para aislar el perfil.
