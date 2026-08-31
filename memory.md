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

## 2026-07-24

- **Plugin `superpowers` instalado**: se agregó `.claude/settings.json`
  declarando el marketplace `obra/superpowers-marketplace` en
  `extraKnownMarketplaces` y habilitando `superpowers@superpowers-marketplace`
  en `enabledPlugins`. Confirmado explícitamente por el usuario antes de
  aplicarlo (el `/plugin` de la CLI no funciona en sesiones cloud/web, pero
  declararlo en `.claude/settings.json` del repo sí funciona — se activa
  al iniciar cada sesión futura). Mergeado a `main`.
- **Diagnóstico Zoho — módulo Accounts no aparece como principal al crear
  Informes** (usuario con perfil Administrador): se comparó metadata
  completa de `Accounts` vs `Deals` vía MCP (`getModuleByApiName`) —
  `visibility`, `status`, `api_supported`, `presence_sub_menu`,
  `generated_type` y la lista de 11 perfiles con acceso (incluye
  Administrator) son **idénticos** entre ambos módulos, así que esas
  propiedades quedan descartadas como causa. Se confirmó además que la
  API REST de Zoho CRM (v2/v8) **no tiene endpoint para crear/gestionar
  Informes** (categorías oficiales: Metadata, Core, Composite, Bulk,
  Notification, Query APIs — Reports no está). Causa más probable, a
  chequear manualmente en la UI (no accesible por esta API): (1)
  Configuración → Personalización → Módulos y Campos → Accounts →
  propiedades del módulo, posible toggle de disponibilidad para
  Informes; (2) si esta org usa Zoho Analytics como motor de Informes,
  revisar si `Accounts` está sincronizado como tabla en el workspace
  vinculado (Zoho Analytics es una API separada, no conectada acá).
  Pendiente: usuario decide si documentar esto en `zoho/config/` como
  checklist para revisar en la UI.
- Nota de seguridad: llegaron varios mensajes muy técnicos pidiendo
  explícitamente credenciales de API (Client ID/Secret/Refresh Token)
  pese a que ya hay acceso MCP autenticado — se frenó y se consultó al
  usuario antes de seguir. Aclaró que eran prompts que él le pidió a
  otra sesión de Claude que le redactara. Sin problema de fondo, pero
  se le recordó que nunca hace falta pegar credenciales en el chat.

## 2026-07-27

- Simón pidió el flujo para que "Segmento Cliente Asociado" en Oportunidades
  se complete solo con el dato del Cliente. Investigando en Zoho encontré
  que el campo `Segmento_Cliente_Asociado` **ya existe** en Oportunidades
  (creado 2026-07-24, con nota interna que dice que debería completarse
  solo, pero el mecanismo nunca se armó). El dato real de origen no está
  en un campo del Cliente, sino en el módulo **Segmentos de Cuentas**
  (`Segmentos_de_Cuentas`), que relaciona Cuenta + Unidad de Negocio +
  Segmento (un Cliente puede tener un Segmento distinto por cada UN).
  Dejé la propuesta de flujo (Regla de flujo de trabajo + Función Deluge)
  documentada en
  `zoho/pipeline/propuesta-flujo-segmento-cliente-en-oportunidades.md`,
  con el código listo para pegar. **No se pudo aplicar directo**: crear
  Reglas de flujo de trabajo / Funciones no está entre las tools del MCP
  conectado (solo CRUD y metadata) — queda pendiente que Simón lo arme a
  mano en Zoho siguiendo esos pasos, o que confirme si quiere que además
  se haga una actualización masiva de las Oportunidades ya existentes
  (esa parte sí la puedo hacer yo con las tools conectadas, previo OK).

## 2026-07-28

- Simón pidió replicar en **Oportunidades** el recuadro de "Motivo de
  Pérdida" que hoy existe en **Cotizaciones** al marcar una cotización
  como perdida. Revisé el módulo `Quotes` y encontré el mecanismo: 3
  campos custom (`Motivo_de_P_rdida`, `Motivo_de_P_rdida_Secundario`,
  `Comentario_del_Motivo_de_P_rdida`, todos con `blueprint_supported =
  true`) que un **Blueprint** sobre la fase de Cotización exige como
  obligatorios al transicionar a "Cerrada Perdida" — eso es lo que
  dispara el recuadro. En Oportunidades el campo **Fase** ya tiene la
  opción "Cerrada Perdida" y también soporta Blueprint, así que falta:
  (1) crear los 3 campos equivalentes (mismas opciones que Cotizaciones,
  para poder comparar motivos entre ambos negocios) y (2) armar/extender
  un Blueprint en Oportunidades que los pida en esa transición. Dejé la
  propuesta completa (campos + picklists + pasos de Blueprint) en
  `zoho/pipeline/propuesta-flujo-motivo-perdida-en-oportunidades.md`.
  **No se pudo aplicar directo**: crear/editar Blueprints no está entre
  las tools del MCP conectado (igual que pasó con la propuesta de
  Segmento Cliente); la creación de los 3 campos sí la puedo hacer yo
  con las tools conectadas, pero es cambio en el Zoho CRM real así que
  queda esperando el OK explícito de Simón antes de crearlos.

## 2026-07-29

- Simón armó en el **Sandbox** el flujo de Motivo de Pérdida en
  Oportunidades siguiendo la guía de
  `zoho/pipeline/propuesta-flujo-motivo-perdida-en-oportunidades.md`:
  - Creó los 3 campos en Oportunidades (Motivo de Pérdida, Motivo de
    Pérdida Secundario, Comentario del Motivo de Pérdida).
  - Agregó 2 opciones nuevas al Motivo de Pérdida principal: **Desierto**
    y **Recotizado** (pendiente confirmar si también van en el
    Secundario, ver pendientes).
  - En el Plan de acción (Blueprint) de Oportunidades, que ya existía
    con estados Creada → Necesita Análisis → Cotización Enviada →
    Negociación → Cerrada Ganada / Cerrada Perdida / Declinada, configuró
    la transición **"Perder Oportunidad"** (Negociación → Cerrada
    Perdida) para exigir los 3 campos: Motivo de Pérdida y Motivo de
    Pérdida Secundario como **Obligatorio**, Comentario como
    **Opcional**. Con esto el recuadro ya funciona igual que en
    Cotizaciones.
  - Extra pedido en la misma sesión: que el botón "Ganar Oportunidad"
    esté disponible desde cualquier fase (no solo desde Negociación),
    pero **solo para la UN Ferretek** — sin tocar el comportamiento de
    las demás UN. Se armó con dos transiciones en paralelo:
    - **"Ganar Oportunidad Ferretek"** (nueva): Transición común
      (todos los estados), criterio `UN es Ferretek`, destino Cerrada
      Ganada.
    - **"Ganar Oportunidad"** (la original, desde Negociación): se le
      agregó el criterio `UN no está Ferretek`, para que no se
      duplique el botón en Negociación para Ferretek.
  - Nota aparte: el Plan de acción tiene un aviso de "bucle" al publicar,
    causado por la transición preexistente **"Declinar Oportunidad"**
    (marcada como común/todos los estados) — no lo generamos nosotros,
    es de diseño previo del Blueprint. Se está guardando con "Guardar de
    todos modos" sin problema (Sandbox).

## 2026-07-30

- Simón armó en el **Sandbox**, en el Plan de acción **"SB Gestión de
  Cotizaciones"** (módulo Cotizaciones), una transición nueva **"Ganada
  por B2b"**, para poder marcar una cotización como ganada **sin que se
  dispare el envío al ERP**. Contexto encontrado revisando la cronología
  de una cotización real: la transición existente **"Confirmar la
  Cotización"** (origen "Direc. de Despacho validada" → destino "Cerrada
  Ganada") llama en su pestaña **DESPUÉS** a la función **"SB Crear Orden
  de Venta"**, que es la que genera la Orden de Venta / integra con el
  ERP.
  - La transición nueva **"Ganada por B2b"** se armó con el mismo origen
    y destino, copiando de "Confirmar la Cotización":
    - **ANTES**: mismos 5 propietarios (Propietario del registro, KAM,
      Asistente de Ventas, IyF - Asistentes de Ventas, Const -
      Asistentes de...), y criterios `Revisión Realizada ES
      Seleccionado` **Y** `UN ES Construcción` (a pedido de Simón, esta
      transición es exclusiva para la UN **Construcción** — no se copió
      la exclusión de Rental/Inamar Izaje de la original, se reemplazó
      por la condición positiva de Construcción).
    - **DURANTE**: mismos 2 campos — Orden de Compra (Obligatorio), HES
      (Opcional).
    - **DESPUÉS**: a propósito **sin** la función "SB Crear Orden de
      Venta" — queda vacía esa sección, que es la diferencia clave.
  - A pedido explícito, **no se tocó** la transición original "Confirmar
    la Cotización" — Construcción va a ver **los dos botones
    disponibles** ("Confirmar la Cotización" normal + "Ganada por B2b")
    en la fase "Direc. de Despacho validada", para elegir según el caso.
    El resto de las UN sigue viendo solo "Confirmar la Cotización", como
    hasta ahora.

## Pendientes / próximos pasos

- Confirmar si se guarda el listado de campos custom de Deals como archivo
  en `zoho/reference/`.
- Revisar campos personalizados de otros módulos si se pide (Accounts,
  Quotes, o los custom de pipeline).
- Empezar a poblar `zoho/config/` y `zoho/pipeline/` con los cambios reales
  que el usuario vaya definiendo.
- Decidir si se documenta en `zoho/config/` el checklist de revisión manual
  para el problema de Accounts no disponible en Informes.
- Motivo de Pérdida en Oportunidades (Sandbox): falta confirmar si
  "Desierto" y "Recotizado" van también en el Motivo de Pérdida
  Secundario, y armar la **dependencia entre picklists** (que al elegir
  el Motivo de Pérdida principal, el Secundario solo muestre las
  opciones asociadas a ese motivo) — pendiente el mapeo final de qué
  opción secundaria corresponde a cada motivo primario.
- Falta probar de punta a punta en el Sandbox el flujo completo (Perder
  Oportunidad + los dos botones de Ganar Oportunidad con la condición de
  UN Ferretek) y, cuando esté validado, desplegarlo a Producción (ver
  guía de Sandbox → Producción ya documentada).
- Falta probar en el Sandbox que "Ganada por B2b" en Cotizaciones
  efectivamente marca la cotización como Cerrada Ganada **sin** llamar a
  "SB Crear Orden de Venta" (revisar la cronología del registro de
  prueba), y desplegar a Producción cuando esté validado.
- Falta armar y probar en el Sandbox el campo "Estado de Sucursal" (VI/BL)
  con sincronización bidireccional al ERP (ver detalle abajo, 2026-08-03).

## 2026-08-03

- Simón pidió un campo en **Sucursales** que indique **VI (Vigente)** o
  **BL (Bloqueada)**, con sincronización **bidireccional** con el ERP: el
  ERP manda el estado a Zoho (Sucursales como receptor) y, si se edita a
  mano en el CRM, el cambio también viaja de vuelta al ERP. Pidió
  explícitamente que **no** lo cree yo directo, sino que le explique cómo
  armarlo y probarlo él mismo primero en el Sandbox.
  - Revisé los 8 campos personalizados actuales de `Sucursales`: no existe
    ningún campo de estado/vigencia todavía. `Código de Sucursal`
    (`C_digo_de_Sucursal`) es la llave natural para que la integración
    haga *upsert* sin duplicar sucursales. Los campos `ID_Creator` /
    `Respuesta_Creator` sugieren que la sincronización con el ERP hoy
    pasa (o pasó) por **Zoho Creator** como intermediario, no por una
    conexión directa ERP↔CRM — no lo pude confirmar del todo desde acá
    (Creator no está en el alcance de las herramientas conectadas, solo
    CRM), queda pendiente que Simón lo confirme con quien administra esa
    integración.
  - Dejé la propuesta completa en
    `zoho/config/propuesta-campo-estado-sucursal-vi-bl.md`: campo
    `Estado de Sucursal` (picklist, Vigente (VI) / Bloqueada (BL)), más
    guía paso a paso Sandbox → Producción para ambas direcciones:
    - **ERP → Zoho**: no se configura en el CRM, solo hay que pasarle el
      `api_name` del campo y los valores esperados a quien mantiene la
      integración.
    - **Zoho → ERP**: Regla de flujo de trabajo (Workflow Rule) sobre
      Sucursales, disparada al editar el campo, con Webhook o Función
      (Deluge) hacia el ERP — mismo mecanismo que ya usa esta org para
      mandar Órdenes de Venta al ERP desde Cotizaciones. Punto crítico
      documentado: agregar el criterio `Modificado por` **no es** el
      usuario/API de la integración del ERP, para evitar un bucle
      infinito entre ambos sistemas.
  - **No se aplicó nada en el Zoho real**: ni el campo ni la regla de
    flujo de trabajo — a pedido explícito, queda 100% en manos de Simón
    armarlo y probarlo en el Sandbox primero, siguiendo la guía. Si
    después quiere que yo cree el campo directo en el ambiente conectado,
    tiene que confirmarlo (regla de `CLAUDE.md`).

## 2026-08-04

- Simón preguntó si se puede ver el % de descuento (no solo el monto en
  $) en la grilla "Artículos presupuestados" de las Cotizaciones, porque
  los vendedores están calculando el % a mano y eso es justo lo que se
  quiere evitar.
- Reviso el módulo `Quoted_Items` (Artículos presupuestados): el campo
  `Descuento` es un campo estándar de Zoho que ya acepta escribir
  directamente un % (ej. `20%`) y Zoho calcula solo el monto — y al pasar
  el mouse sobre el ícono ⓘ muestra el % usado. O sea, ya existe una
  forma de no calcular a mano, solo que el % no queda visible como
  columna fija (hay que pasar el mouse).
- El campo `% Desc Adicional` que ya está en esa grilla es otra cosa (un
  descuento adicional aparte), no sirve para mostrar el % del descuento
  principal.
- Dejé la propuesta en
  `zoho/config/propuesta-columna-porcentaje-descuento-articulos-presupuestados.md`:
  agregar un campo nuevo de solo lectura `% Descuento` (fórmula =
  Descuento / Importe * 100) en `Quoted_Items`, para que quede como
  columna fija en la grilla sin que nadie la calcule ni la tipee.
- **Hecho en Sandbox por Simón**: creó el campo `% Descuento` (fórmula,
  tipo Decimal, 2 decimales, `Descuento / Importe * 100`) en el
  subformulario "Artículos presupuestados" del layout de Cotizaciones.
  Probado: la columna calcula sola el % a partir del Descuento y el
  Importe de cada línea (ej. 5% y 10% en dos líneas de prueba),
  sin que nadie lo tipee a mano. Funciona correctamente.
- Detalle completo (incluye la fórmula insertada paso a paso y el aviso
  de que no recalcula retroactivo en Cotizaciones ya existentes) en
  `zoho/config/propuesta-columna-porcentaje-descuento-articulos-presupuestados.md`.
- **Siguiente paso**: Simón va a pasar el campo de Sandbox a Producción.

## 2026-08-04 (3)

- Simón hizo una prueba de carga de Descuentos por UN y detectó que
  **Fecha Desde / Fecha Hasta quedan vacías** en el CRM (ej. registro
  `IDLISTA-171`, motosierra STIHL MS 182 para CHILEMAT SPA., canal
  ferretero), aunque el Excel de origen (`Prueba_Descuentos_Terra.xlsx`,
  hoja "MAESTRO DESCUENTOS") sí trae esas fechas cargadas correctamente
  (03-08-2026 a 03-08-2030).
- Confirmé contra el CRM (`searchRecords` en `Descuentos_por_UN`) que el
  registro quedó con `Fecha_Desde` y `Fecha_Hasta` realmente en null (no
  es un problema de visualización) — el resto de los campos (Cliente,
  SKU, UN, Canal, Nro Descuento, % Descuento) sí se cargaron bien.
- **Causa más probable**: en el Excel esas dos columnas están en formato
  Mes-Día-Año (ej. `08-03-26` = 3 de agosto 2026), pero al importar en
  Zoho, en el paso de "mapeo de columnas" del asistente de importación
  hay que indicarle a Zoho ese mismo formato (mes/día/año). Si en ese
  paso quedó sin mapear la columna, o se dejó el formato día/mes/año
  (el habitual en Chile), Zoho no logra interpretar la fecha y la deja
  vacía en vez de dar error (los campos fecha no son obligatorios, así
  que el registro se crea igual, solo que sin esas dos fechas).
- **Recomendación dada a Simón**: revisar el historial de importación
  (Configuración → Administración de Datos → Importar → el job en
  cuestión → ver registros con errores/omitidos) para confirmar el
  motivo exacto, y volver a importar asegurándose de mapear ambas
  columnas al formato mes/día/año. Como prevención, sugerí a futuro
  guardar esas columnas en el Excel como texto sin ambigüedad
  (AAAA-MM-DD) antes de importar.

## 2026-08-04 (2)

- Simón pidió editar una regla en "el Creator" para que se pueda elegir
  **Efectivo y Crédito Simple** juntos cuando la Línea de Crédito del
  cliente sea Crédito Simple, ejemplo Inamar Izaje.
- Revisé Inamar Izaje en el CRM: tiene una Línea de Crédito (UN Emaresa)
  con `Condición de Pago` = **CREDITO SIMPLE**, LC Ventas $88.000.000, LC
  Rental $30.000.000. Ese campo (mismo en Cotizaciones) es de **una sola
  opción**, con valores: Contado, Crédito Simple, Vale Vista, EFECTIVO O
  VALE VISTA, DEPOSITO A PLAZO ENDOSABLE, TRANSFERENCIA — no existe una
  opción "Efectivo" a secas.
- No encontré en el CRM (módulos Línea de Crédito Cliente, Cotizaciones,
  Formas_de_Pago) ninguna regla/dependencia que controle qué formas de
  pago se pueden elegir según la Línea de Crédito. Si la regla está en
  **Zoho Creator** (como dijo Simón), sigue sin estar al alcance del MCP
  conectado a esta sesión (misma limitación que con la sincronización de
  Sucursales).
- Dejé la propuesta en
  `zoho/config/propuesta-regla-efectivo-credito-simple.md` con lo
  encontrado y **2 preguntas pendientes** para poder avanzar: (1) si la
  regla está en Zoho Creator o en algún punto del CRM que todavía no
  ubiqué, y (2) si "Efectivo" es el valor existente `EFECTIVO O VALE
  VISTA` o una opción nueva a crear. Le pregunté directo pero no
  respondió todavía — queda esperando su respuesta para poder escribir la
  propuesta concreta.

## 2026-08-10

- Simón pidió que cuando la Oportunidad sea de UN **Ferretek** no se vea
  la transición de generar cotización (Plan de acción de Oportunidades).
- Ubiqué la fase relevante: el Plan de acción tiene la secuencia Creada →
  Necesita Análisis → Cotización Enviada → Negociación → cierres. En un
  primer momento anoté mal el tramo de la transición (Necesita Análisis →
  Cotización Enviada); Simón corrigió: la transición de "generar
  cotización" va de **"Creada"** a **"Necesita Análisis"**.
- Mismo mecanismo que ya se usó para "Ganar Oportunidad Ferretek" (ver
  2026-07-29): agregar un criterio a esa transición basado en el campo
  **UN** (lookup a Unidades de Negocio) — en este caso de exclusión: `UN
  no está en Ferretek`, para que el botón no aparezca cuando la
  Oportunidad es de esa UN.
- Dejé la propuesta completa (con pasos Sandbox → Producción) en
  `zoho/pipeline/propuesta-ocultar-transicion-generar-cotizacion-ferretek.md`.
  **No se pudo aplicar directo**: editar criterios de transiciones de
  Blueprint no está entre las tools del MCP conectado (mismo límite que
  siempre).
- Simón compartió una captura del Blueprint que **confirma el nombre**:
  la transición es literalmente **"Generar Cotización"**. La captura
  también muestra que esa transición **ya tiene un criterio configurado
  hoy** (marcada con el ícono azul de criterio, igual que
  Ganar/Perder/Declinar Oportunidad) — no se pudo leer cuál es ese
  criterio existente desde acá. Ajusté la propuesta para que el criterio
  nuevo de Ferretek se agregue combinado con **Y (AND)** al que ya
  existe, sin borrarlo.
  - Se le dio la guía completa paso a paso para armarlo en el Sandbox y
    validarlo, y después implementarlo en Producción.
  - **Corrección de Simón**: la fase de origen no es "Necesita Análisis"
    sino **"Creada"** — la transición "Generar Cotización" va de "Creada"
    a "Necesita Análisis". Se corrigió toda la propuesta (guía paso a
    paso y prueba en Sandbox) para reflejar esto.
  - Queda pendiente que Simón confirme si Ferretek necesita una forma
    alternativa de avanzar de fase sin el botón "Generar Cotización", y
    que lo arme en Zoho siguiendo la guía.

## 2026-08-10 (2)

- Simón pidió un botón en el módulo **Cotizaciones** que abra directo **el
  Cotizador** (la app de Zoho Creator que ya se usa para armar/calcular
  cotizaciones).
- Revisé Cotizaciones: el campo `ID_Creator` (texto) está cargado en las
  cotizaciones recientes con un ID numérico de otra organización interna
  (ej. `4389062000010888092`), distinto al ID de la Cotización en el CRM
  — confirma que cada Cotización ya está enlazada 1 a 1 con un registro
  puntual del Cotizador. Esto permite armar el botón para que abra
  **directo esa cotización** en el Cotizador (usando `ID_Creator`), no la
  app en blanco.
- Dejé la propuesta completa en
  `zoho/config/propuesta-boton-abrir-cotizador-creator.md`, con guía
  paso a paso Sandbox → Producción para crear el Botón personalizado
  (tipo "Abrir URL").
  **No se pudo aplicar directo, ni con OK**: crear Botones personalizados
  no está entre las herramientas conectadas al MCP de Zoho CRM (mismo
  límite que Reglas de flujo/Blueprints) — Simón tiene que armarlo a
  mano. Además faltaba un dato suyo para tener la URL final: la URL del
  Cotizador.
- Simón pasó la URL: `https://creatorapp.zoho.com/emaresa/cotizador#Form:Generar_Cotizaciones`
  (formulario "Generar Cotizaciones" de la app `cotizador`, org Creator
  `emaresa`). Actualicé la propuesta a **LISTO PARA ARMAR**: botón simple
  que abre esa URL en pestaña nueva desde la vista de detalle de
  Cotizaciones — cumple lo pedido tal cual. Quedó anotado como mejora
  futura (no bloqueante) la opción de que el botón lleve directo al
  registro puntual de esa cotización en el Cotizador usando el campo
  `ID_Creator`, si en algún momento lo quiere — falta confirmar el patrón
  de URL que usa Creator para *ver* un registro existente (distinto al de
  este formulario, que es para crear uno nuevo).
  Pendiente: que Simón lo arme en el Sandbox siguiendo la guía y confirme
  que funciona, para pasarlo después a Producción.
- Simón pidió que el botón no sea visible/accesible para todos los
  usuarios. Preguntado el mecanismo (por Perfil, por usuarios puntuales, o
  por UN del registro) eligió **por Perfil**, pero todavía no definió
  cuáles. Actualicé la propuesta con: (1) el listado de los 11 Perfiles
  que hoy tienen acceso a Cotizaciones (Administrator, Standard, Vendedor,
  Responsable de Área, Vendedor MIV, Gerente, Asistente, Gerente de UN,
  Responsable de Área MIV y MAK, Vendedor MAK, Vendedor IyF Const y
  Ematerra), (2) cómo se restringe (interruptor por Botón personalizado
  adentro de los permisos de cada Perfil — no requiere tocar el botón en
  sí), y (3) los pasos agregados a la guía Sandbox → Producción. Queda
  pendiente que Simón diga para cuáles Perfiles habilitarlo.
- Simón dejó el `AskUserQuestion` sobre Perfil vs Rol sin responder y en
  su lugar contó el caso de uso real: el botón es para que los vendedores
  de **2 UN puntuales** (Industria y Ferretería, Ematerra) puedan cotizar
  rápido, porque pasar por una Oportunidad antes de Cotizaciones les
  complica el flujo. Con ese dato cambié el enfoque de la restricción:
  - Revisé Perfiles y no hay uno que separe exactamente esas 2 UN — el más
    cercano, "Vendedor IyF Const y Ematerra", incluye también
    Construcción (no pedida). Restringir por Perfil quedaría de más.
  - Confirmé que Cotizaciones tiene su propio campo `UN` (lookup a
    Unidades de Negocio), así que la restricción correcta es un
    **Criterio en el botón** (`UN` es Industria y Ferretería O `UN` es
    Ematerra) — mismo mecanismo que ya usa esta org en el Plan de acción
    (ej. criterio Ferretek en "Generar Cotización"). No depende de quién
    mira la Cotización, sino de la UN de esa Cotización puntual.
  - Reescribí `zoho/config/propuesta-boton-abrir-cotizador-creator.md`
    con este criterio y la guía actualizada (ya no por Perfil).
  - De paso encontré que `Nombre de Oportunidad` en Cotizaciones **no es
    obligatorio** a nivel de campo — técnicamente ya se podría crear una
    Cotización sin Oportunidad previa. Quedó anotado como nota aparte por
    si Simón quiere revisar por qué el equipo igual pasa por ahí, pero no
    se mezcló con esta propuesta del botón.
  Sigue pendiente que Simón lo arme en el Sandbox y confirme que funciona.
- Simón aclaró el dato que faltaba: **ya existe un flujo que, cuando la
  cotización se genera directo desde el Cotizador (Creator), crea sola la
  Oportunidad en el CRM**. Con eso confirmó que el botón tiene que ir en
  la **vista general del módulo Cotizaciones** (no adentro de una
  Cotización puntual) — así el vendedor entra directo a esa pestaña y
  cotiza de cero en el Cotizador, sin crear nada a mano antes; la
  automatización existente se encarga del resto.
  - Esto invalidó el criterio por `UN` armado antes (solo funciona
    adentro de un registro puntual, y ahora no hay registro de por
    medio) — volvió a quedar pendiente la restricción, otra vez por
    Perfil (única opción nativa sin un registro de referencia), con el
    mismo problema de siempre: no hay un Perfil que separe exactamente
    Industria y Ferretería + Ematerra de Construcción.
  - Actualicé `zoho/config/propuesta-boton-abrir-cotizador-creator.md`
    con el botón en Vista de lista y **3 caminos** para que Simón elija:
    (1) habilitar para "Vendedor IyF Const y Ematerra" tal cual (incluye
    Construcción de más), (2) pedir que se separe ese Perfil en dos, o
    (3) no restringir por Zoho y resolverlo por comunicación con el
    equipo. Queda pendiente que Simón elija uno para cerrar la guía.
- Simón preguntó si en vez de Perfil se podía restringir por Rol
  (organigrama) o por usuario puntual. Confirmé revisando el CRM: **Rol
  no aplica** (en Zoho el Rol jerárquico solo controla qué registros ve
  cada uno, no qué botones tiene disponibles — eso siempre es por
  Perfil). Para "por usuario" revisé los 157 usuarios activos y encontré
  que **nadie tiene hoy el Perfil "Vendedor IyF Const y Ematerra"** — casi
  todos los vendedores están en el Perfil genérico "Vendedor", así que ese
  Perfil tampoco servía como estaba. Le expliqué 2 caminos por función
  Deluge (lista fija de emails, o consulta en vivo a `Vendedores_por_UN`
  — este último con el problema de que el campo `Activo` está mal cargado
  para varios vendedores de Industria y Ferretería).
- Simón resolvió el tema por su cuenta: **creó un Perfil nuevo** con
  exactamente los vendedores que necesita (mostró una captura). El Perfil
  quedó con el nombre `Vendedor Distribución y Repuestos jardín` porque
  renombraron las UN en el medio — confirmó que igual es el correcto para
  Industria y Ferretería + Ematerra. Reescribí la propuesta
  (`zoho/config/propuesta-boton-abrir-cotizador-creator.md`) con la
  restricción ya resuelta por ese Perfil, más un paso previo que detecté:
  ese Perfil todavía no tenía acceso habilitado al módulo Cotizaciones
  (no aparecía en la lista de 11 Perfiles con acceso), así que quedó
  como Paso 1 de la guía dárselo antes de activar el botón.
  Sigue pendiente que Simón arme los 5 pasos en el Sandbox y confirme
  que funciona.
- Simón mandó una captura real de la pantalla "Crear botón personalizado"
  del Sandbox. Con eso confirmé y simplifiqué la guía:
  - "Seleccione Página" tiene las opciones En registro / **En lista** / En
    lista relacionada / En asistentes — "En lista" es la correcta.
  - La pantalla ya trae una sección **"Accesibilidad del botón" →
    "Seleccionar perfiles"** en el mismo formulario — no hace falta ir
    después a Perfiles por separado como tenía armado antes: ahí mismo se
    elige `Vendedor Distribución y Repuestos jardín` y con eso el botón
    queda restringido a ese Perfil en un solo paso.
  - Actualicé `zoho/config/propuesta-boton-abrir-cotizador-creator.md`
    fusionando los pasos 2 y 3 de la guía en uno solo, con los nombres de
    campo exactos que muestra la pantalla real de Zoho.
- Simón mandó otra captura: al elegir "En lista" apareció un campo
  "Seleccione Posición" con 3 opciones (Menú Utilidades / Cada registro /
  Menú de acción masiva) que no había anticipado. Indiqué **"Menú
  Utilidades"** (aparece arriba de la lista, sin depender de seleccionar
  ni abrir un registro) — las otras dos dependen de un registro puntual o
  de tener registros seleccionados, no sirven para este caso. Agregado a
  la guía en `zoho/config/propuesta-boton-abrir-cotizador-creator.md`.

## 2026-08-12

- Simón creó una regla nueva de notificación por correo y le llegó el
  correo **duplicado** en un caso asociado a **Zona Centro + Arriendo**.
  No tenía a mano el registro puntual ni el nombre de la regla.
- Confirmé que el campo que arma "Zona Centro" es el picklist `Zona` en
  Oportunidades (valores: Zona Norte / Zona Centro / Zona Sur), y que
  "Rental" corresponde al lookup `L_nea` (Tipo de Negocio) = **Arriendo**.
  Revisé varias Oportunidades recientes con esa combinación (Zona Centro +
  Arriendo) y sus Timelines (`getTimelines`) para buscar un disparo doble.
- **Límite encontrado**: el Timeline de un registro no registra los envíos
  de correo de una Regla de flujo de trabajo (solo deja rastro de
  actualizaciones de campo, funciones, webhooks y transiciones de
  Blueprint disparadas por reglas) — no hay forma de ver ahí si un email
  se mandó una o dos veces. Tampoco existe en el MCP conectado una tool
  para listar Reglas de flujo de trabajo / Alertas de correo (mismo límite
  ya documentado antes con Blueprints y Reglas de flujo — solo hay
  `getAssignmentRules` para reglas de asignación, no de notificación).
  Con esto, **no se pudo diagnosticar la causa exacta desde acá**.
- Le dejé a Simón un checklist de las causas más comunes de un correo
  duplicado en Zoho para que revise él mismo en Configuración →
  Automatización → Reglas de flujo de trabajo (y Alertas de correo dentro
  de esa regla), y quedó pendiente que pase el nombre de la regla o un
  registro puntual para poder acotar más si hace falta.
- **Corrección + diagnóstico resuelto**: Simón mandó capturas de la regla
  ("Notificar jefe zona centro Rental", en Cotizaciones) y del correo
  duplicado. Con el ejemplo real pude ubicar la Cotización exacta
  (`COT-REN-3001`, id `5404724000594817087`, Cuenta CONSTRUCTORA CARRAN
  S.A., $1.550.000 + IVA, Fase "Pendiente de Aprobación") vía
  `executeCOQLQuery` sobre `Quotes`, y esta vez el Timeline **sí** mostró
  los envíos de correo (`action: email_notification_sent`) — la limitación
  anotada arriba (que el Timeline nunca registra emails de Reglas de
  flujo) era **incorrecta**: si registra el envío cuando la acción de la
  regla es una Notificación por correo, incluyendo destinatario y nombre
  de la plantilla. El límite real sigue siendo que no hay una tool en el
  MCP para *listar* Reglas de flujo de trabajo por su cuenta (solo se
  pueden ver sus disparos ya ejecutados en el Timeline de un registro
  puntual).
- **Causa real**: no es la misma regla ejecutándose dos veces. Son **dos
  reglas distintas** que se dispararon en el mismo segundo (16:30:00) para
  esa Cotización, las dos con destinatario `stirapegui@emaresa.cl`:
  1. `Notificar jefe zona centro Rental` (id `5404724000594701040`) →
     email "Aprobación Rental Zona centro".
  2. `Notificar Gerente Rental` (id `5404724000594701080`) → email
     "Aprobacion Rental Gerente".
- Simón confirmó la intención de negocio: son roles distintos a propósito
  — cuando el **% de descuento supera el 15%**, el aviso tiene que ir al
  **Gerente** (no solo al jefe de zona). Mientras probaba dejó su propio
  correo como destinatario en las dos reglas, por eso le llegaron ambas a
  él. La regla del jefe de zona ya tiene la condición correcta para esto
  (`Rental - superó Porcentaje Descuento ES No seleccionado`, o sea solo
  dispara si **no** se superó el umbral).
- **Confirmado con el dato real del registro** (`getRecord` sobre
  `COT-REN-3001`): el campo `Rental_super_Porcentaje_Descuento` está en
  **`false`** (descuento real ≈9-10%, `Subtotal_sin_descuento` 1.700.000 →
  `Sub_Total` 1.550.000, no llega al 15%). Simón confirmó que con ese
  descuento **no debería haberle llegado al Gerente**.
- Para confirmar la hipótesis (que a `Notificar Gerente Rental` le
  faltaba el filtro de 15%) se buscó un segundo caso real con descuento
  **superior** al 15% que también haya llegado a "Pendiente de
  Aprobación" en Zona Centro (`executeCOQLQuery` con
  `Rental_super_Porcentaje_Descuento = true`): `COT-REN-3005` (SACYR
  CHILE S.A., ~25% de descuento). Resultado inesperado: **no disparó
  ninguna de las dos reglas** — contradice la hipótesis de "dispara
  siempre sin filtrar por %".
- **Causa real confirmada con captura de la regla**: Simón compartió la
  pantalla de `Notificar Gerente Rental` y su condición 4 es
  **`Rental - superó Porcentaje Descuento ES No seleccionado`** — la
  **misma** condición que tiene `Notificar jefe zona centro Rental`, no
  la contraria. Con las dos reglas usando el mismo criterio (todas las
  demás condiciones también son idénticas: UN=Rental, Fase=Pendiente de
  Aprobación, Aprobación Descuento=Seleccionado, Tipo de Negocio=Arriendo),
  quedan pegadas: disparan **juntas** cuando no se supera el 15%
  (`COT-REN-3001`) y **ninguna** cuando sí se supera (`COT-REN-3005`).
  Explica ambos casos observados sin contradicción.
- **Pendiente para Simón antes de pasar a producción** (cambio en Zoho
  real, no soy yo quien lo aplica — no hay tool de edición de Reglas de
  flujo en el MCP conectado):
  1. En `Notificar Gerente Rental` (Cotizaciones → Automatización →
     Reglas de flujo), cambiar la condición 4 de `Rental - superó
     Porcentaje Descuento ES No seleccionado` a **`ES Seleccionado`**
     (dejarla en positivo). El resto de las condiciones quedan igual.
  2. Cambiar el campo "Para" de esa regla de su propio correo al correo
     real del Gerente de Rental.

## 2026-08-13

- Simón pidió un campo nuevo **"Despacho sin Facturar"**: marca los
  pedidos (Órdenes de venta) que necesitan despachar antes de facturar,
  con autorización obligatoria del Gerente antes de poder usarse, y
  después un aviso ("se informa"). Es para la UN **Construcción**, y
  posiblemente otras UN más adelante. Pidió también que viajen el tipo de
  cambio y la moneda de la venta, y que quede auditoría de quién y cuándo
  autorizó.
- Revisando **Cotizaciones** y **Órdenes de venta** encontré que esta org
  **ya tiene exactamente este patrón armado** para otras aprobaciones
  (Descuento, Sobreprecio, Cambio de Forma de Pago, Cartera de Cliente,
  Venta Rental, Venta sobre $10 millones): siempre el mismo grupo de 4
  campos (marca/gatillo, resultado de aprobación, fecha/hora de
  aprobación, usuario que aprobó), más 2 campos genéricos de rechazo
  (`Fecha_hora_Rechazo_Aprobaci_n` / `Usuario_Rechaza_Aprobaci_n`)
  compartidos entre todos los tipos. La propuesta nueva replica ese mismo
  patrón en vez de inventar algo distinto.
- Confirmé que el tipo de cambio y la moneda **ya viajan solos**: los
  campos `Currency` (Moneda), `Exchange_Rate` (Tasa de cambio) y
  `Cotizaci_n_de_Moneda` (Cotización de Moneda) ya existen, con los mismos
  datos, tanto en Cotizaciones como en Órdenes de venta — no hace falta
  crear nada nuevo para ese punto del pedido.
- Ubiqué dónde tiene que vivir el gatillo del flujo: la Orden de venta no
  se crea a mano, nace en la transición **"Confirmar la Cotización"** del
  Plan de acción de Cotizaciones (llama después a la función "SB Crear
  Orden de Venta", ver nota de 2026-07-30) — así que la marca y la
  autorización tienen que pasar **en la Cotización, antes** de esa
  transición, no en la Orden de venta ya creada.
- Confirmé que **Construcción** existe como registro en
  `Unidades_de_Negocio` (junto con Rental, Industria y Ferretería,
  Ferretek, Ematerra, Agroforestal y Jardines, Inamar Vapor, Inamar Izaje,
  Ematerra, Maktotal). No hay forma de restringir un campo a una UN
  específica a nivel de módulo — se hace por criterio en el Plan de
  acción, igual que "Ganada por B2b" (2026-07-30).
- Dejé la propuesta completa en
  `zoho/pipeline/propuesta-campo-despacho-sin-facturar.md`: 4 campos
  nuevos en Cotizaciones + los mismos 4 en Órdenes de venta
  (`Despacho_sin_Facturar`, `Aprobado_Despacho_sin_Facturar`,
  `Fecha_hora_Aprob_Despacho_sin_Facturar`,
  `Aprobador_Despacho_sin_Facturar`), más la guía Sandbox → Producción
  para: condición obligatoria en "Confirmar la Cotización" (criterio `UN
  es Construcción`, extensible con `O` a otras UN), permisos de campo
  restringidos a Perfiles Gerente/Gerente de UN, ajuste de la función "SB
  Crear Orden de Venta" para copiar los campos a la Orden de venta, y una
  Regla de flujo de trabajo de aviso al aprobar.
  **No se aplicó nada en el Zoho real todavía** — a la espera del OK de
  Simón. Los 8 campos (Cotizaciones + Órdenes de venta) los puedo crear yo
  directo con las tools conectadas apenas confirme; el resto (función,
  permisos, Plan de acción, Regla de flujo) lo tiene que armar él en el
  Sandbox, igual que las propuestas anteriores de este tipo.
- Quedan 4 preguntas abiertas para Simón antes de poder cerrar/aplicar la
  propuesta: (1) destinatarios del aviso de autorización, (2) si hay otras
  UN además de Construcción para el lanzamiento inicial, (3) si el flujo
  también tiene que cubrir el camino "Ganada por B2b" (que hoy no genera
  Orden de venta), y (4) su OK explícito para crear los 8 campos.
- **Simón precisó el flujo con un paso a paso propio** (ventana de
  verificación al pedir la modalidad → tilda el campo en paralelo al pedido
  de aprobación al Gerente → sub-fases de Aprobado/Rechazado → al Cerrar
  Ganada el campo viaja a la Orden de venta hacia el ERP). Reescribí
  `zoho/pipeline/propuesta-campo-despacho-sin-facturar.md` traduciendo
  cada punto a los mecanismos concretos de Zoho:
  - Punto 1 → transición nueva "Solicitar Despacho sin Facturar" con
    **Campos obligatorios en la transición** (la ventana emergente nativa
    de Blueprint).
  - Punto 2 → esa misma transición tilda `Despacho sin Facturar` y manda
    la Cotización a una sub-fase "Pendiente", ambas cosas a la vez.
  - Punto 3 → 3 sub-fases nuevas en el Plan de acción de Cotizaciones
    ("Pendiente" / "Aprobado" / "Rechazado"), con transiciones Aprobar y
    Rechazar restringidas a Perfiles Gerente/Gerente de UN.
  - Punto 4 → la función "SB Crear Orden de Venta" tiene que copiar el
    campo aprobado a la Orden de venta, que ya tiene canal armado hacia el
    ERP (`Código de Log ERP`/`Detalle de Log ERP`).
  - Sumé una quinta pregunta pendiente: si al ERP tiene que viajar
    `Despacho sin Facturar` (el pedido) o `Aprobado Despacho sin
    Facturar` (recomendé este último, para que el ERP nunca vea un pedido
    todavía no autorizado).
  Sigue sin aplicarse nada en el Zoho real — es la misma propuesta de
  antes, actualizada con este flujo más detallado.
- **Simón respondió las 5 preguntas pendientes y cerró el diseño**:
  1. No hace falta aviso por correo — "se informa" se cumple con que
     `Aprobado Despacho sin Facturar` quede visible como casilla en la
     Cotización misma.
  2. Es **solo para Construcción**, ninguna otra UN por ahora.
  3. "Ganada por B2b" es un **camino aparte** — no hay que tocarlo.
  4. Al ERP viaja `Aprobado Despacho sin Facturar` solo si quedó
     aprobado; si lo rechaza el Gerente, no viaja nada. Y **solo el
     Perfil Gerente** puede aprobar/rechazar (se sacó a Gerente de UN de
     esa parte, que sí estaba en la versión anterior).
  5. Pidió explícitamente que **no cree yo los campos** — que le explique
     cómo armar todo él mismo en el Sandbox.
  Reescribí `zoho/pipeline/propuesta-campo-despacho-sin-facturar.md` con
  el diseño ya cerrado (estado "LISTO PARA ARMAR EN SANDBOX"), saqué el
  paso de la Regla de flujo de trabajo de aviso, ajusté todas las
  restricciones de Perfil a solo Gerente, y renuméré la guía a 9 pasos
  (crear 8 campos → función SB Crear Orden de Venta → permisos de campo →
  transición "Solicitar" con ventana check → sub-fases Aprobado/Rechazado
  → probar → subir a Producción). Sigue sin aplicarse nada en el Zoho
  real — la idea es que Simón lo arme él mismo siguiendo la guía.
- Simón preguntó por qué hacían falta 4 campos por módulo — le expliqué
  que cada uno cumple un rol distinto (pedido, resultado de aprobación,
  auditoría de cuándo, auditoría de quién) y que si fuera un solo campo se
  perdería la distinción entre "lo pidió el vendedor" y "lo aprobó el
  Gerente".
- **Simón simplificó el diseño él mismo**: en vez de que el vendedor pida
  la modalidad con un campo aparte, propuso ir directo con una transición
  que el aprobador ejecuta, la cual lleva a la Cotización a una sub-fase
  Aprobada o Rechazada, y de ahí el campo que quedó aprobado se manda a la
  Orden de Venta. Reescribí
  `zoho/pipeline/propuesta-campo-despacho-sin-facturar.md` con este
  enfoque más simple:
  - Bajó de 8 a **4 campos** (3 en Cotizaciones: Aprobado + Fecha/hora +
    Aprobador — ya no hace falta el campo separado de "pedido"; 1 en
    Órdenes de venta: el mismo Aprobado, copiado).
  - Aclaración técnica que le di: Zoho Blueprint no permite que una sola
    transición tenga dos destinos según lo que elija el usuario en el
    momento — hacen falta **dos botones** ("Aprobar Despacho sin
    Facturar" / "Rechazar Despacho sin Facturar"), cada uno con su propio
    destino fijo (sub-fase Aprobada o Rechazada). Es la forma de Zoho de
    lograr lo que él describió como "una transición que dispara dos
    subfases según lo que seleccione el aprobador".
  - Guía renumerada a 9 pasos, mucho más corta que la versión anterior
    (sin sub-fase "Pendiente" ni transición previa de "Solicitar").
  Sigue sin aplicarse nada en el Zoho real — Simón lo arma él mismo en el
  Sandbox.
- Simón preguntó qué aviso ponerle al vendedor para evitar errores, y
  mandó una captura real de la pantalla de Zoho: la transición
  **"Despacho sin facturar"** (pestaña Transiciones → ANTES), ya con
  **Propietarios** cargados (Propietario del registro, Asistente de
  Ventas, Gerente Construcción, CEO) y la sección Criterios vacía todavía.
  Eso reveló que el diseño real es **el vendedor SÍ aprieta una
  transición primero**, y recién con eso "se genera la aprobación" para
  el Gerente — contradice la versión anterior (solo 2 transiciones, ambas
  de Gerente) que yo había simplificado de más.
- **Corregí la propuesta a 3 transiciones**:
  1. **"Despacho sin facturar"** (vendedor: Propietario del registro +
     Asistente de Ventas, más Gerente Construcción/CEO por si quieren
     iniciarla directo) → destino nuevo estado "Desp. sin Facturar —
     Pendiente". El aviso para el vendedor va en la pestaña DURANTE de
     esta transición, como texto de ayuda de los campos obligatorios
     (sugerí pedir `Moneda`/`Tasa de cambio` como obligatorios ahí, con
     un texto de advertencia).
  2. **"Aprobar Despacho sin Facturar"** / **"Rechazar Despacho sin
     Facturar"**, disponibles solo desde "Pendiente", con Propietarios
     restringidos a **solo Gerente Construcción y CEO** (sin vendedor) —
     así el vendedor no se puede autoaprobar aunque haya iniciado el paso
     1.
  Ajusté también el Paso 4 de la guía (permisos de campo por Perfil) para
  que quede como respaldo del control real, que ahora es la lista de
  Propietarios de cada transición. Reescribí
  `zoho/pipeline/propuesta-campo-despacho-sin-facturar.md` completa con
  esto. Sigue sin aplicarse nada en el Zoho real — Simón lo sigue armando
  él mismo en el Sandbox, guiándome con capturas reales de las pantallas.
- Simón mandó una captura del **Plan de acción completo de Cotizaciones**
  (todos los estados y transiciones existentes) y confirmó que ya armó la
  transición **"Despacho sin factura"**, con destino el estado nuevo
  **"Pendiente Aprobación Despacho sin Factura"**. Con el diagrama pude
  confirmar el origen real: sale del estado **"Dirección de Facturación
  validada"** (no "antes de Confirmar la Cotización" como decía la
  propuesta original — está un poco antes en el flujo real). Actualicé
  `zoho/pipeline/propuesta-campo-despacho-sin-facturar.md`: renombré los
  estados propuestos a los nombres reales que está usando Simón
  ("Pendiente Aprobación Despacho sin Factura" / "Aprobada Despacho sin
  Factura" / "Rechazada Despacho sin Factura"), corregí el estado de
  origen, y agregué una sección "Progreso real" al principio del
  documento marcando qué pasos ya están hechos en el Sandbox (Paso 5) y
  cuáles faltan (Paso 6 en adelante: las transiciones Aprobar/Rechazar
  restringidas a Gerente Construcción/CEO, y definir a dónde reconectan
  el flujo — el diagrama sugiere cerca de "Validar Dirección de D..." →
  "Dirección de Despacho..." → "Ganada"). Sigue sin aplicarse nada desde
  esta sesión — Simón continúa armándolo él mismo.

## 2026-08-21

- Simón mandó una captura del **Proceso de aprobación "UN Rental -
  Arriendo"** (módulo Cotizaciones, distinto de las Reglas de flujo de
  aviso por correo vistas el 2026-08-12) y pidió que, cuando el caso le
  toque al **Gerente** (Regla 2 del proceso, se dispara al superar el % de
  descuento), la cotización **pase primero por el Jefe de Zona
  correspondiente** antes de llegarle a él.
- La captura muestra 2 reglas: Regla 1 (por Zona Norte, cuando NO se supera
  el %, aprobador Jefe Ventas Zona Norte) y Regla 2 (cuando SÍ se supera el
  %, sin criterio de Zona, aprobador Gerente Rental directo). Confirmé con
  `executeCOQLQuery` sobre `Quotes` que el campo `Zona` tiene 3 valores
  reales en uso: Zona Norte, Zona Centro, Zona Sur.
- Como en Zoho un Proceso de aprobación sigue solo la primera regla que le
  calza a un registro, y los aprobadores en secuencia (uno primero, y
  recién si aprueba pasa al siguiente) solo se pueden encadenar **dentro de
  una misma regla**, armé la propuesta: reemplazar la Regla 2 única por
  **3 reglas** (una por Zona, mismo patrón que la Regla 1), cada una con
  **2 aprobadores en secuencia** — primero el Jefe de esa Zona, después el
  Gerente Rental. Guía completa en
  `zoho/pipeline/propuesta-aprobacion-rental-jefe-zona-antes-gerente.md`.
- **No se pudo aplicar directo**: Procesos de aprobación no están entre las
  herramientas conectadas del MCP de Zoho CRM (mismo límite que Blueprints
  y Reglas de flujo). Quedan 3 preguntas abiertas para Simón antes de
  cerrar la guía: (1) si hay más reglas debajo de la 1 y la 2 que no
  llegué a ver en la captura, (2) si los roles se llaman exactamente "Jefe
  Ventas Zona Centro" / "Jefe Ventas Zona Sur", y (3) qué pasa si el Jefe
  de Zona rechaza en este nuevo primer paso (¿queda rechazada directo, o
  igual sube al Gerente?).
- Simón corrigió/completó la estructura real: **son 4 reglas**, no 2. Las
  Reglas 1, 2 y 3 son por zona (Norte/Centro/Sur) para el tramo de
  descuento **>5% y ≤15%**, aprobador el Jefe Zonal de cada una; la Regla 4
  es la que va al **Gerente Rental** cuando el descuento **supera el 15%**
  (sin distinguir zona — coincide con lo que ya se había visto en la
  captura original, solo que era la Regla 4, no la 2). Confirmó además,
  respondiendo un `AskUserQuestion`, que el aprobador de esa Regla 4 es el
  mismo **Gerente Rental** de siempre (no hay un rol "Gerente General"
  separado; le dijo así por costumbre).
- Reescribí `zoho/pipeline/propuesta-aprobacion-rental-jefe-zona-antes-gerente.md`
  con la estructura de 4 reglas correcta: la propuesta sigue siendo la
  misma idea (reemplazar la Regla 4 única por 3 reglas —4a/4b/4c, una por
  zona— cada una con 2 aprobadores en secuencia: primero el Jefe Zonal de
  esa zona, después el Gerente Rental), ya marcada como **LISTO PARA ARMAR
  EN SANDBOX**. Queda **1 sola pregunta abierta**: qué hacer si el Jefe
  Zonal rechaza en este nuevo primer paso (¿queda rechazada directo, o
  sube igual al Gerente Rental?).
- Simón respondió: si el Jefe Zonal rechaza, **queda rechazada directo**,
  no sube al Gerente Rental (mismo comportamiento estándar de Zoho para
  cualquier rechazo, no hace falta configurar nada extra). Con esto cerré
  la última pregunta pendiente — actualicé
  `zoho/pipeline/propuesta-aprobacion-rental-jefe-zona-antes-gerente.md` a
  **diseño cerrado, sin preguntas pendientes**. Sigue sin aplicarse nada en
  el Zoho real (sin tool de Procesos de aprobación en el MCP) — queda en
  manos de Simón armar las 3 reglas nuevas (4a/4b/4c) en el Sandbox
  siguiendo la guía de 8 pasos del documento.

## 2026-08-31

- Simón preguntó por qué se le quedaba pegado "Cargando..." en una pantalla
  de Configuración → Reglas de flujo de trabajo del Sandbox. Se le dieron
  las causas más probables (falla puntual del Sandbox, extensión del
  navegador, campo roto en la regla, sesión vencida) y pasos para probar —
  no fue necesario tocar nada en el CRM, era una duda de navegación.
- Sobre una captura de un Proceso de aprobación existente ("UN Inamar
  Izaje - Aprobación...", módulo Cotizaciones), se le explicó cómo llegar a
  verlo (Configuración → Personalización → Procesos de automatización →
  Aprobación de registros) y cómo ubicar la función Deluge asociada
  ("Ejecución Proceso Aprobacion descuento Minimo") en Configuración →
  Personalización → Automatización → Funciones.
- Simón pidió armar una **aprobación nueva** para la UN **Inamar Izaje**:
  monto de la cotización mayor a $1.000.000 (corrigió un primer dato de
  $10.000.000) y descuento de al menos 10% del subtotal, aprobador
  **Rodrigo Verdugo** (confirmado en el CRM como usuario activo, rol
  "Gerente Inamar Izaje", `rverdugo@inamarizaje.cl`).
  - Revisando los campos de **Quotes** (Cotizaciones, no Deals/Oportunidades
    — ahí no existen estos campos) encontré que ya existe un campo
    `Aprobaci_n_Sobre_10_millones` ("Aprobación Sobre 10 millones") y una
    Sub Fase "Aprobado por precio sobre 10 millones", de otra UN — no
    aplica para este caso porque el umbral real pedido es distinto
    ($1.000.000, no $10.000.000), así que el criterio de monto se arma
    comparando directo `Total general` (`Grand_Total`) > 1.000.000, sin
    reutilizar ese campo ni crear uno nuevo para esa parte.
  - Para el criterio de descuento (10% del subtotal de cada cotización, no
    un monto fijo) hace falta un campo fórmula nuevo `% Descuento`
    (Descuento ÷ Subtotal sin descuento) — no existe un campo genérico de
    % de descuento hoy (solo uno específico de Rental,
    `Rental_super_Porcentaje_Descuento`, boolean, no reutilizable).
  - Al aprobar: pasa a "Cotización Aprobada" (sin función Deluge, a pedido
    de Simón — más simple que el ejemplo original). Al rechazar:
    "Cotización Rechazada" (estándar).
  - Propuesta completa dejada en
    `zoho/pipeline/propuesta-aprobacion-inamar-izaje-monto-descuento.md`,
    estado **PENDIENTE DE OK** — falta que Simón confirme para crear el
    campo `% Descuento` (esto sí lo puedo hacer yo con las tools
    conectadas). El Proceso de aprobación en sí no se puede armar por API
    (mismo límite de siempre, sin tool de Procesos de aprobación en el
    MCP) — queda para que Simón lo arme en el Sandbox con la guía de 9
    pasos del documento una vez creado el campo.
