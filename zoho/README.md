# Zoho CRM — MCP scope

Este directorio documenta el alcance (scope) del servidor MCP `Zoho_CRM`
conectado a esta sesión, y sirve como base para los cambios de
**configuración** (`config/`) y **manejo de pipeline** (`pipeline/`) de Zoho.

> Nota: esta sesión corre en un contenedor cloud efímero. No existe una
> "carpeta local" separada — todo lo que se crea acá vive en este repo
> (rama `claude/claude-code-install-57wk1g`). Para tenerlo en tu máquina,
> hacé `git pull` de esa rama una vez esté pusheada.

## Organización conectada

| Campo | Valor |
|---|---|
| Empresa | Emaresa |
| País | Chile |
| Moneda | CLP (Chilean Peso) |
| Zona horaria | America/Santiago |
| Edición | Zoho One Enterprise (paid) |
| Licencias de usuario | 175 |
| Vencimiento licencia | 2026-09-21 |
| Email principal | infraestructura@emaresa.cl |
| Org ID | 5404724000000020005 |

## Herramientas MCP disponibles

El servidor expone las siguientes tools (prefijo `mcp__Zoho_CRM__`),
agrupadas por función:

**Registros (CRUD)**
- `getRecord`, `getRecords`, `searchRecords`, `executeCOQLQuery`
- `createRecords`, `updateRecord`, `updateRecords`, `upsertRecords`
- `deleteRecord`, `deleteRecords`, `convertInventory`

**Relaciones entre registros**
- `getRelatedRecord`, `getRelatedRecords`, `getRelatedLists`
- `updateRelatedRecords`, `updateSpecificRelatedRecord`, `delinkSpecificRelatedRecord`

**Metadata / esquema**
- `getModules`, `getModuleByApiName`, `getFields`, `createFields`
- `getLayoutById`, `getLayouts`

**Notas**
- `createNotesModule`, `updateNotesModule`, `deleteNotesModule`

**Tags**
- `getTags`, `createTags`, `postAddTags`

**Usuarios**
- `getUsers`, `getSingleUser`, `updateUser`, `updateSingleUser`, `getTeamMembers` *(si aplica vía github, no confundir)*

**Organización / configuración general**
- `getOrganization`, `getAllTerritories`, `getAssignmentRules`
- `getVariables`, `getVariableById`, `updateVariableById`

**Jobs masivos**
- `getBulkReadJobDetails`

**Auditoría / timeline**
- `getTimelines`

## Módulos relevantes para pipeline (custom modules detectados)

Además de los módulos estándar (Leads, Accounts, Contacts, Deals, Quotes,
Sales_Orders, Products, Purchase_Orders, Invoices, Price_Books, Vendors,
Campaigns, Cases), la org tiene módulos custom propios del negocio de
Emaresa que probablemente sean el foco del trabajo de pipeline:

| api_name | module_name | Descripción aproximada |
|---|---|---|
| `Unidades_de_Negocio` | CustomModule4 | Unidades de negocio |
| `L_neas_de_Negocio` | CustomModule19 | Líneas de negocio |
| `L_neas_porUN` | CustomModule20 | Líneas por unidad de negocio |
| `Vendedores_por_UN` | CustomModule10 | Vendedores asignados por unidad de negocio |
| `Vendedores_por_LN` | CustomModule17 | Vendedores por línea de negocio |
| `Segmentos_de_Cuentas` | CustomModule5 | Segmentación de cuentas |
| `Cartera_de_Clientes` | CustomModule9 | Cartera de clientes |
| `Sucursales` | CustomModule21 | Sucursales |
| `Sucursales_de_Clientes` | CustomModule6 | Sucursales de clientes |
| `Listas_de_Precios` | CustomModule12 | Listas de precios |
| `Detalle_Listas_de_Precios` | CustomModule18 | Detalle de listas de precios |
| `List_Precios_por_Cuenta` | CustomModule15 | Lista de precios por cuenta |
| `Precios_Especiales` | CustomModule11 | Precios especiales |
| `Descuentos_por_UN` | CustomModule25 | Descuentos por unidad de negocio |
| `Lineas_de_Credito_Cliente` | CustomModule13 | Líneas de crédito de cliente |
| `Formas_de_Pago` | CustomModule23 | Formas de pago |
| `Formas_de_Pago_de_Cliente` | LinkingModule4 | Formas de pago por cliente |
| `Stock` | CustomModule14 | Stock |
| `Bodegas` | CustomModule8 | Bodegas |
| `Transportistas` | CustomModule22 | Transportistas |
| `Func_Cotizador_por_UN` | CustomModule7 | Funciones del cotizador por UN |
| `Funcionalidades_Cotizador` | CustomModule16 | Funcionalidades del cotizador |
| `Giros_del_Cliente` | CustomModule33 | Giros del cliente |
| `Sectores_del_Cliente` | CustomModule35 | Sectores del cliente |
| `Empresas` | CustomModule27 | Empresas |
| `Equipos_Rental` / `Obras_Rental` / `Lista_de_Precios_Rental` | CustomModule26 / 31 / 29 | Línea de negocio Rental |
| `Usuarios_por_Sucursales` | CustomModule30 | Usuarios por sucursal |

Listado completo (754 líneas, todos los módulos con su `api_supported`,
`generic_type`, etc.) queda respaldado en
`zoho/reference/modules-full.json` para consulta sin volver a llamar al MCP.

## Estructura de este directorio

```
zoho/
├── README.md          # este archivo — mapeo del scope MCP
├── reference/
│   └── modules-full.json   # snapshot completo de getModules()
├── config/             # cambios de configuración (campos, layouts, roles, etc.)
└── pipeline/            # cambios de manejo de pipeline (deals, stages, asignación)
```
