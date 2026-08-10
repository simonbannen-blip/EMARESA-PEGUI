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
