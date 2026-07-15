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
- Se creó el PR #1 (`claude/claude-code-install-57wk1g` → `main`) con el
  mapeo de Zoho + `CLAUDE.md`/`memory.md`, y se **mergeó a `main`**.
- Regla ampliada a pedido del usuario: nunca revisa nada en GitHub, así
  que a partir de ahora el flujo es 100% automático — PR y merge a `main`
  inmediatos en cada ciclo de cambios, sin pedir aprobación, más registro
  en `memory.md` de cada cambio. Detalle completo en `CLAUDE.md`.
- Pedido de instalar el plugin `obra/superpowers`: **no se pudo** desde
  esta sesión remota — ese marketplace se instala con `/plugin marketplace
  add` en una sesión local de la CLI de Claude Code, comando no disponible
  acá. Se le explicó cómo hacerlo él mismo en su terminal.
- Se relevaron preferencias de trabajo del usuario (Simón, CRM Specialist
  Zoho en Emaresa, recién aprendiendo) y quedaron fijadas en `CLAUDE.md`:
  - Cambios en este repo (git/GitHub): 100% automáticos, sin aprobación.
  - Cambios en el **Zoho CRM real** (crear campos, tocar layouts,
    actualizar/borrar registros): siempre proponer primero en
    `zoho/config/` o `zoho/pipeline/` y esperar su OK antes de aplicar.
  - Preferencia por comunicación no técnica: evitar jerga de git/dev,
    ir directo a la acción y resultados en términos de negocio.
  - Sin restricciones sobre qué datos guardar en el repo (uso interno).
  - Modo de trabajo: sesiones sueltas a demanda, sin rutinas programadas
    por defecto.

## Pendientes / próximos pasos

- Confirmar si se guarda el listado de campos custom de Deals como archivo
  en `zoho/reference/`.
- Revisar campos personalizados de otros módulos si se pide (Accounts,
  Quotes, o los custom de pipeline).
- Empezar a poblar `zoho/config/` y `zoho/pipeline/` con los cambios reales
  que el usuario vaya definiendo.
