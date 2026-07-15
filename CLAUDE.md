# EMARESA-PEGUI

Repositorio usado como **espejo de trabajo** para la configuración y manejo
de pipeline de Zoho CRM (org Emaresa). No es un proyecto de software con
build/tests — es un repo de configuración/documentación versionada.

## Regla de sincronización (siempre aplicar)

- **Al empezar cualquier sesión**: hacer `git pull origin <rama-actual>`
  (o `git fetch` + rebase/merge) antes de tocar nada, para partir siempre
  del último estado guardado.
- **Al terminar cualquier cambio**: commitear y pushear automáticamente a
  la rama de trabajo, sin esperar a que el usuario lo pida explícitamente.
  El usuario usa este repo como espejo de una carpeta local — si un cambio
  no queda pusheado, se considera perdido.
- No dejar trabajo sin commitear al cerrar una tarea. Preferir commits
  pequeños y descriptivos sobre uno grande al final.
- Rama de trabajo activa: `claude/claude-code-install-57wk1g`.

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
