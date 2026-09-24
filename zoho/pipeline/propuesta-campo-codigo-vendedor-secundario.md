# Vendedor Secundario (Oportunidad → Cotización → Orden de venta)

## Estado: GUÍA LISTA — Simón lo arma en Sandbox, prueba y despliega a Producción

## Qué se pidió y para qué

El **Propietario de la Cotización** es un vendedor, pero muchas veces la
cotización la **termina otro vendedor** — el "vendedor secundario".
Simón quiere registrarlo en la Oportunidad/Cotización y que su **código**
llegue a la **Orden de venta**.

Requisitos de Simón (2026-09-24):

- El campo tiene que estar en la Oportunidad y viajar a Cotización y OV.
- **En la Orden de venta tiene que llegar el CÓDIGO del vendedor, no el
  nombre.**

## Hallazgos en el CRM real (lectura, 2026-09-24)

- No existe ningún campo de vendedor secundario en Oportunidades,
  Cotizaciones ni Órdenes de venta.
- El código de vendedor **depende de la Unidad de Negocio**: vive en el
  módulo **Usuarios por UN** (`Vendedores_por_UN`, campos `Vendedor`,
  `UN`, `Activo`, `C_digo_de_Vendedor`). Ej.: Tirapegui = 131 en
  Construcción y 1111 en Agroforestal; Carrasco Garrido = 999 en IyF y
  7777777 en Agroforestal.
- El campo "Código de Vendedor" de la ficha del **Usuario** NO sirve
  como fuente: solo ~50 de 158 usuarios activos lo tienen, y hay valores
  erróneos (ej. un teléfono).
- En Usuarios por UN hay 139 filas activas, pero **muchas sin código**
  (casi toda la UN **Rental**, Inamar Vapor y Maktotal). Para esos
  vendedores el código secundario quedará vacío hasta completar esa
  tabla.
- Los 3 módulos tienen el campo `UN` (búsqueda a Unidades de Negocio).
  Cotización tiene `Deal_Name` (Oportunidad); OV tiene `Quote_Name`
  (Cotización) y `Deal_Name`.

## Diseño

| Campo | Tipo | Oportunidades | Cotizaciones | Órdenes de venta |
|---|---|---|---|---|
| **Vendedor Secundario** | Búsqueda de usuario | ✅ | ✅ | ❌ (no va el nombre) |
| **Código de Vendedor Secundario** | Línea única (texto), solo lectura | ✅ | ✅ | ✅ |

- El vendedor **elige a la persona** en la Oportunidad o en la
  Cotización; el **código se completa solo** buscando en Usuarios por UN
  la fila de ese vendedor + la UN del registro.
- Al crear la Cotización desde la Oportunidad: si la Cotización no trae
  vendedor secundario, se copia el de la Oportunidad.
- Al crear la OV: se copia **solo el código**, tal cual, desde la
  Cotización (respaldo: desde la Oportunidad).

---

## PASO A PASO

### Parte A — Preparar el Sandbox

1. En **Producción**: Configuración → Administración de datos →
   **Sandbox**. Usar el Sandbox existente (el del campo Ámbito). Si
   hace mucho que no se actualiza, **Actualizar (Refresh)** para que
   tenga la configuración actual de Producción.
2. Entrar al Sandbox (botón **Acceder / Iniciar sesión en Sandbox**).
3. Revisar si el Sandbox tiene datos. Si es solo de configuración (sin
   registros), crear para las pruebas:
   - 1 fila en **Usuarios por UN**: Usuario = un vendedor de prueba,
     UN = Construcción, Activo = ✔, Código de Vendedor = `TEST123`.
   - 1 fila más, mismo usuario, UN = Agroforestal y Jardines, código
     `TEST456` (para probar que el código cambia según la UN).
   - 1 Cliente de prueba.

### Parte B — Crear los campos (en el Sandbox)

Configuración → Personalización → **Módulos y campos**.

**Oportunidades** → diseño(s) de Oportunidad → arrastrar:
1. **Búsqueda de usuario** → etiqueta `Vendedor Secundario`.
2. **Línea única** → etiqueta `Código de Vendedor Secundario`.
   - En las propiedades del campo (⚙) → **Establecer permiso** → dejarlo
     **Solo lectura** para todos los perfiles (lo llena el sistema).
3. Ubicarlos al lado de "Código de Vendedor". Guardar.

**Cotizaciones** → mismo par de campos, mismas etiquetas exactas.
Repetir en **todos los diseños** de Cotizaciones que se usan
(Agroforestal, Construcción, Rental, etc.).

**Órdenes de venta** → **solo** `Código de Vendedor Secundario` (Línea
única, solo lectura), al lado de "Código del Vendedor". Todos los
diseños.

4. Verificar los **nombres de API**: Configuración → Desarrollador →
   API y SDK → Nombres de API → cada módulo. Deben quedar:
   - `Vendedor_Secundario`
   - `C_digo_de_Vendedor_Secundario`

   Si Zoho les puso otro nombre, avisar para ajustar el código de abajo.

### Parte C — Crear las 3 funciones (en el Sandbox)

Configuración → Desarrollador → **Funciones** → **+ Nueva función** →
categoría **Flujo de trabajo (Automatización)**.

#### Función 1: `codigoVendedorSecundarioOportunidad`

Argumento: `dealId` (tipo cadena/string).

```deluge
deal = zoho.crm.getRecordById("Deals", dealId);
vend = deal.get("Vendedor_Secundario");
codigo = "";
if(vend != null && deal.get("UN") != null)
{
	filas = zoho.crm.searchRecords("Vendedores_por_UN", "(UN:equals:" + deal.get("UN").get("id") + ")");
	for each fila in filas
	{
		if(fila.get("Vendedor") != null && fila.get("Vendedor").get("id").toString() == vend.get("id").toString() && fila.get("Activo") == true && ifnull(fila.get("C_digo_de_Vendedor"), "") != "")
		{
			codigo = fila.get("C_digo_de_Vendedor");
		}
	}
}
mapa = Map();
mapa.put("C_digo_de_Vendedor_Secundario", codigo);
zoho.crm.updateRecord("Deals", dealId, mapa);
```

#### Función 2: `codigoVendedorSecundarioCotizacion`

Argumento: `quoteId` (string).

```deluge
quote = zoho.crm.getRecordById("Quotes", quoteId);
vend = quote.get("Vendedor_Secundario");
mapa = Map();
// si la Cotización no tiene vendedor secundario, tomarlo de la Oportunidad
if(vend == null && quote.get("Deal_Name") != null)
{
	dealRec = zoho.crm.getRecordById("Deals", quote.get("Deal_Name").get("id"));
	vend = dealRec.get("Vendedor_Secundario");
	if(vend != null)
	{
		mapa.put("Vendedor_Secundario", vend.get("id"));
	}
}
codigo = "";
if(vend != null && quote.get("UN") != null)
{
	filas = zoho.crm.searchRecords("Vendedores_por_UN", "(UN:equals:" + quote.get("UN").get("id") + ")");
	for each fila in filas
	{
		if(fila.get("Vendedor") != null && fila.get("Vendedor").get("id").toString() == vend.get("id").toString() && fila.get("Activo") == true && ifnull(fila.get("C_digo_de_Vendedor"), "") != "")
		{
			codigo = fila.get("C_digo_de_Vendedor");
		}
	}
}
mapa.put("C_digo_de_Vendedor_Secundario", codigo);
zoho.crm.updateRecord("Quotes", quoteId, mapa);
```

#### Función 3: `codigoVendedorSecundarioOV`

Argumento: `soId` (string).

```deluge
so = zoho.crm.getRecordById("Sales_Orders", soId);
codigo = "";
if(so.get("Quote_Name") != null)
{
	quoteRec = zoho.crm.getRecordById("Quotes", so.get("Quote_Name").get("id"));
	codigo = ifnull(quoteRec.get("C_digo_de_Vendedor_Secundario"), "");
}
// respaldo: si la OV no vino de una Cotización, tomarlo de la Oportunidad
if(codigo == "" && so.get("Deal_Name") != null)
{
	dealRec = zoho.crm.getRecordById("Deals", so.get("Deal_Name").get("id"));
	codigo = ifnull(dealRec.get("C_digo_de_Vendedor_Secundario"), "");
}
if(codigo != "")
{
	mapa = Map();
	mapa.put("C_digo_de_Vendedor_Secundario", codigo);
	zoho.crm.updateRecord("Sales_Orders", soId, mapa);
}
```

En cada función: **Guardar** → botón **Ejecutar** con el ID de un
registro de prueba para ver que no da error.

### Parte D — Crear las reglas de flujo (en el Sandbox)

Configuración → Automatización → **Reglas de flujo de trabajo** →
**+ Crear regla**. En la acción elegir **Función** → la función creada
→ mapear el argumento al **ID** del registro (ej. `dealId` =
Oportunidades → ID de Oportunidad).

| # | Módulo | Nombre de la regla | Cuándo | Condición | Función |
|---|---|---|---|---|---|
| 1 | Oportunidades | VS Oportunidad - crear | Al **crear** | Vendedor Secundario **no está vacío** | codigoVendedorSecundarioOportunidad |
| 2 | Oportunidades | VS Oportunidad - editar | Al **editar** → "Campos específicos modificados": **Vendedor Secundario** o **UN** | Todos | codigoVendedorSecundarioOportunidad |
| 3 | Cotizaciones | VS Cotización - crear | Al **crear** | Todos | codigoVendedorSecundarioCotizacion |
| 4 | Cotizaciones | VS Cotización - editar | Al **editar** → campos modificados: **Vendedor Secundario** o **UN** | Todos | codigoVendedorSecundarioCotizacion |
| 5 | Órdenes de venta | VS OV - crear | Al **crear** | Todos | codigoVendedorSecundarioOV |

### Parte E — Pruebas en el Sandbox

Marcar cada una ✅/❌:

1. **Oportunidad con vendedor secundario**: crear Oportunidad UN =
   Construcción, elegir Vendedor Secundario = vendedor de prueba →
   guardar → el Código debe quedar `TEST123`.
2. **Cambio de UN**: editar esa Oportunidad, UN = Agroforestal →
   código pasa a `TEST456`.
3. **Cotización desde la Oportunidad**: generar Cotización desde la
   Oportunidad del caso 1 → debe traer Vendedor Secundario y el código
   según la UN de la Cotización.
4. **Vendedor elegido en la Cotización** (caso más común): Oportunidad
   sin vendedor secundario → generar Cotización → elegir ahí el
   Vendedor Secundario → guardar → aparece el código.
5. **Cambio de vendedor en la Cotización**: cambiar a otro vendedor →
   el código se actualiza (o queda vacío si ese vendedor no tiene código
   en esa UN).
6. **Convertir Cotización en Orden de venta** → la OV debe tener el
   **código** (no el nombre) en "Código de Vendedor Secundario".
7. **Sin vendedor secundario**: Cotización sin vendedor secundario →
   convertir a OV → el campo queda vacío y no da error.
8. **Vendedor normal (no admin)**: repetir el caso 4 con un usuario de
   perfil Vendedor → puede elegir el Vendedor Secundario y **no** puede
   escribir a mano el código.

Si algo falla: Configuración → Desarrollador → Funciones → la función
→ **Registros/Logs** para ver el error, y avisar.

### Parte F — Pasar a Producción

1. En **Producción**: Configuración → Administración de datos →
   **Sandbox** → elegir el Sandbox → **Implementar / Deploy** (o
   "Implementar cambios").
2. Seleccionar los cambios:
   - Campos: `Vendedor Secundario` (Oportunidades, Cotizaciones) y
     `Código de Vendedor Secundario` (Oportunidades, Cotizaciones, OV).
   - Diseños (layouts) modificados de los 3 módulos.
   - Las 3 funciones.
   - Las 5 reglas de flujo.
3. Implementar y esperar el aviso de que terminó.
4. **Revisar en Producción**:
   - Las 5 reglas están **activas** (a veces llegan desactivadas).
   - Los campos aparecen en todos los diseños y el código es solo
     lectura.
5. **Prueba real en Producción**: una Cotización de prueba con un
   vendedor que tenga código en Usuarios por UN → convertir a OV →
   revisar el código → borrar los registros de prueba.
6. Pendiente de datos (no bloquea la puesta en marcha): **completar
   los códigos faltantes en Usuarios por UN** (sobre todo Rental,
   Inamar Vapor y Maktotal) — si un vendedor no tiene código ahí, su
   código secundario queda vacío.

## Preguntas abiertas

- Rental ya usa en Cotizaciones un campo aparte "Cód Vendedor Rental"
  (`C_digo_del_Vendedor`) y casi no tiene códigos en Usuarios por UN.
  ¿El vendedor secundario aplica también a Rental? Si sí, hay que
  completar esos códigos.
