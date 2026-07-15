# Memoria del proyecto

Bitácora de contexto y decisiones entre sesiones. Este repo funciona como
espejo de trabajo local del usuario (simon.bannen@gmail.com) para
configuración y pipeline de Zoho CRM — todo cambio se pushea automáticamente,
ver regla de sincronización en `CLAUDE.md`.

## 2026-07-15

- Se creó la carpeta `zoho/` como base de trabajo para configuración y
  manejo de pipeline de Zoho CRM.
- Se mapeó el scope del MCP `Zoho_CRM` conectado a la sesión:
  - Org: **Emaresa** (Chile, CLP, Zoho One Enterprise, licencia hasta
    2026-09-21, 175 usuarios, email `infraestructura@emaresa.cl`).
  - ~40 tools disponibles (CRUD de registros, relaciones, metadata/fields/
    layouts, notas, tags, usuarios, organización/territorios/reglas de
    asignación, variables, jobs masivos, timeline).
  - Detectados ~25 módulos custom relevantes para pipeline (unidades/líneas
    de negocio, vendedores por UN/LN, listas de precios, precios especiales,
    descuentos, líneas de crédito, stock, bodegas, sucursales, formas de
    pago, etc.). Detalle completo en `zoho/README.md`.
  - Snapshot completo de `getModules()` guardado en
    `zoho/reference/modules-full.json` (754 líneas) para no tener que
    volver a llamar al MCP.
- Se listaron los **36 campos personalizados del módulo Deals**. Mezcla dos
  negocios: venta tradicional (UN, Sucursal, Vendedor, Canal de Venta) y
  **arriendo/rental** (Obra Rental, Dirección/Comuna/Región/Ciudad de
  Arriendo, Duración del Arriendo). Aún no guardado como archivo — pendiente
  si el usuario lo pide.
- Regla establecida: siempre `git pull` al iniciar sesión y siempre
  commit+push al terminar cambios, ya que el usuario usa este repo como
  espejo de su carpeta local (ver `CLAUDE.md`).

## Pendientes / próximos pasos

- Confirmar si se guarda el listado de campos custom de Deals como archivo
  en `zoho/reference/`.
- Revisar campos personalizados de otros módulos si se pide (Accounts,
  Quotes, o los custom de pipeline).
- Empezar a poblar `zoho/config/` y `zoho/pipeline/` con los cambios reales
  que el usuario vaya definiendo.
