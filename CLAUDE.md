# EMARESA-PEGUI

Repositorio usado como **espejo de trabajo** para la configuración y manejo
de pipeline de Zoho CRM (org Emaresa). No es un proyecto de software con
build/tests — es un repo de configuración/documentación versionada.

## Regla de sincronización y auto-merge (siempre aplicar)

El usuario **nunca** revisa nada en GitHub manualmente. Todo el flujo debe
ser 100% automático, de punta a punta:

1. **Al empezar cualquier sesión**: `git pull`/`git fetch origin main`
   antes de tocar nada, para partir siempre del último estado guardado
   en `main`.
2. **Al terminar cualquier cambio**: commitear con mensaje descriptivo,
   pushear la rama de trabajo, abrir PR hacia `main`, y **mergearlo de
   inmediato** (sin esperar aprobación ni pedir permiso) — el usuario ya
   dio autorización permanente para esto.
3. **Registrar en `memory.md`** cada cambio hecho en la sesión (qué se
   hizo y por qué) como parte del mismo ciclo, antes o junto con el merge.
4. Después de mergear, si sigue habiendo trabajo en la sesión, reiniciar
   la rama de trabajo desde el `main` actualizado
   (`git fetch origin main && git checkout -B <rama> origin/main`) para
   que la siguiente tanda de cambios parta limpia.
5. No dejar trabajo sin commitear, pushear ni mergear al cerrar una tarea.
   El usuario usa este repo como espejo de una carpeta local — si un
   cambio no queda en `main`, se considera perdido.
6. Rama de trabajo activa: `claude/claude-code-install-57wk1g` (se
   reinicia desde `main` después de cada merge, ver punto 4).

## Cómo trabajar con el usuario (Simón, CRM Specialist Zoho, Emaresa)

- **No es perfil técnico.** No mostrar jerga de git/dev ni explicar pasos
  técnicos salvo que pregunte — ir directo a la acción y a los resultados
  en términos de negocio ("cambié tal cosa", no "hice un rebase").
- **Cambios en este repo (git/GitHub)**: 100% automáticos, ver regla de
  arriba — nunca pedir aprobación para commitear/pushear/mergear.
- **Cambios en el Zoho CRM real (en vivo)**: son de otro riesgo — regla
  distinta. Siempre **proponer primero** (dejar el cambio documentado en
  `zoho/config/` o `zoho/pipeline/`) y esperar su OK explícito antes de
  aplicarlo con las tools MCP de Zoho (crear campos, tocar layouts,
  actualizar/borrar registros, etc.). El auto-merge del punto anterior
  aplica al repo, no a acciones sobre el CRM en producción.
- **Datos**: no hay restricción particular sobre qué guardar en el repo
  (es privado y de uso interno) — no hace falta anonimizar ni evitar
  guardar datos reales del CRM.
- **Modo de trabajo**: sesiones sueltas, a demanda — no configurar rutinas
  programadas (triggers) salvo que las pida explícitamente.

## Estructura

```
zoho/
├── README.md                 # mapeo del scope del MCP Zoho_CRM (org, tools, módulos)
├── reference/                # snapshots de metadata de Zoho (módulos, campos, etc.)
├── config/                   # cambios de configuración de Zoho (campos, layouts, roles)
└── pipeline/                 # cambios de manejo de pipeline (deals, stages, asignación)
memory.md                     # bitácora de contexto y decisiones entre sesiones
```

## Contexto del negocio (Emaresa)

- Org Zoho CRM: Emaresa, Chile, CLP, Zoho One Enterprise.
- Dos líneas de negocio conviven en el CRM: venta tradicional y
  **arriendo/rental** (ver campos custom de `Deals` con prefijo "de Arriendo").
- Módulos custom clave: Unidades de Negocio, Líneas de Negocio, Vendedores
  por UN/LN, Listas de Precios, Precios Especiales, Descuentos por UN,
  Líneas de Crédito de Cliente, Stock, Bodegas, Sucursales, Formas de Pago.

Ver `zoho/README.md` para el detalle completo del scope MCP y
`memory.md` para el historial de lo trabajado sesión a sesión.
