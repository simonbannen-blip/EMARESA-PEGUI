# Caso: no aparecen transiciones de Blueprint a quien no es propietario

**Fecha:** 2026-10-07 · **Ejemplo:** COT-CONST-29-3217 (id 5404724000611049883)

## Situación
Simón cambió el uso compartido para que un rol pueda ver y editar las
cotizaciones de los Vendedores Generalistas (ellos venden equipos y los
vendedores de repuestos tienen que terminar el flujo). El otro vendedor ve
la cotización, pero **no le aparecen los botones de transición**.

## Lo verificado en el CRM (solo lectura)
- Propietario: Hector Godoy, rol **Vendedores Generalistas**, perfil
  "Vendedor Distribución Repuestos jardín y maquinari".
- Fase "Creada", Blueprint activo (`$process_flow: true`), no bloqueada,
  aprobación en estado "approved".
- El registro es editable (`$editable: true`) → el uso compartido funciona.

## Causa
En Zoho, **tener acceso de edición no basta para ver una transición**. Cada
transición del Blueprint define en **"Antes" → "Quién"** qué usuarios pueden
ejecutarla. Por defecto es **"Propietario del registro"**. Si está así, solo
Hector ve los botones, aunque el otro vendedor pueda editar.

## Cambio propuesto (lo hace Simón en Configuración)
Blueprint **"SB Gestión de Cotizaciones"**, en cada transición que el
vendedor de repuestos deba poder ejecutar (ej. "Confirmar Envío de
Cotización" y las siguientes hasta el cierre):

1. Abrir la transición → pestaña **Antes** → sección **Quién**.
2. Mantener **Propietario del registro**.
3. Agregar el **Rol** de los vendedores de repuestos (o el perfil, o
   usuarios puntuales).
4. Guardar y **publicar** el Blueprint.

Conviene probar primero en Sandbox o con una sola transición.

## Si después de eso sigue sin aparecer, revisar
- Que el usuario realmente tenga **edición** (no solo lectura) en
  Cotizaciones según el perfil y la regla de uso compartido.
- Los **criterios** de "Antes" de la transición (si filtran por
  propietario, UN, código de vendedor, etc.).
- En COT-CONST-29-3217 el campo "Válido hasta" está en 30-09 (dato del
  CRM), si alguna transición lo usa como criterio.
