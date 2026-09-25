# Vendedor Secundario (Oportunidad → Cotización → Orden de venta)

## Estado: EN ARMADO EN SANDBOX por Simón (guiado paso a paso)

Avance:
- ✅ Paso 1: entró al Sandbox.
- ✅ Paso 2: "Usuarios por UN" ya tiene datos con códigos en el Sandbox.
- ✅ Paso 3: creados en Oportunidades `Vendedor Secundario` (búsqueda de
  usuario) y `Código de Vendedor Secundario` (texto, solo lectura).
- ⚠️ Paso 4: al crear `Vendedor Secundario` como búsqueda de usuario en
  **Cotizaciones**, Zoho dio error de **máximo de campos de búsqueda de
  usuario** (Cotizaciones ya tiene 5: Aprobador Descuento Item,
  Aprobador Cartera de Cliente, Aprobador Mínimo de Venta, Aprobador 2da
  Selección, Usuario Rechaza Aprobación). **Rediseño aprobado por Simón
  (2026-09-24)**: el vendedor secundario se elige solo en la Oportunidad
  y baja automáticamente a sus Cotizaciones (ver Diseño).
- ✅ Paso 4 (corregido): campos creados en Cotizaciones (2, texto) y OV
  (1); nombres de API confirmados por Simón.
- ✅ Paso 5: Función 1 `vendedorSecundarioOportunidad` creada y guarda
  sin errores. Primera ejecución manual no buscó código porque el
  Vendedor Secundario no estaba guardado aún en la Oportunidad
  (260921-OP-CONST-200-000177). Reprobando.
- ✅ Regla 3 "VS Cotización - crear" funcionando en Sandbox
  (2026-09-25): al generar Cotización trae Cristian Silva / 289. Hubo
  que (1) agregar `.toLong()` a los IDs y (2) mapear `quoteId` a
  "ID de registro".
- Decisiones de Simón sobre el campo `Vendedor Secundario`
  (Oportunidades):
  - **Aplica solo a Construcción.** El filtro de usuarios por Rol queda
    en: Vendedores Generalistas, Vendedor Fuerza, Vendedores
    Geosintéticos, Vendedores Equipos Construcción, Vendedores
    Repuestos.
  - "Permitir accesibilidad de registros" activado con permiso
    **Lectura/Escritura** (se cambió desde "Acceso total" para que el
    secundario pueda trabajar la Oportunidad pero no borrarla).
- Observación: al elegir el vendedor, Zoho muestra una ventana "Campos
  relacionados" que propone el código tomado de la **ficha del
  usuario** (no por UN). No viene de las propiedades del campo. La
  función lo sobrescribe con el código de Usuarios por UN; queda
  pendiente ubicar su origen y desactivarla para no confundir.

## CAMBIO v3 (2026-09-25): lista desplegable en Cotizaciones

**Motivo (Simón):** hay vendedores que trabajan solo con la Cotización
que viene desde Creator (sin pasar por la Oportunidad). Necesitan
elegir el vendedor secundario **en la Cotización**. No se puede usar
búsqueda de usuario (tope de 5 en Cotizaciones), así que se usa una
**Lista de selección** con "Nombre - código"; el código se rellena solo
leyendo lo que viene después del " - ".

Dato: en Producción, de 2.000 cotizaciones de Construcción desde junio
2026, solo 5 no tienen Oportunidad (casi todas nacen con una, muchas
creadas por "Infraestructura Emaresa").

### Valores de la lista (Construcción, Usuarios por UN, activos con código, roles de venta)

```
Cesar Valladares - 384
Cristian Collao Gahona - 490
Cristian Jara - 130
Cristian Nuñez - 376
Cristian Silva - 289
Enrique Castro - 422
Ernesto Corvalán - 502
Fabiola Sanhueza - 480
Hector Godoy - 29
Jhosmar Acacio - 425
Manuel Ortiz - 466
Raul Muñoz - 467
Sergio Guerrero - 388
Victor Olivares - 66
Walter Uribe - 465
```

Excluidos: asistentes/encargados/jefes sin código; Infraestructura
Emaresa (159) y Simon Tirapegui (131, CEO); 2 filas activas con código
472 y 482 cuyos usuarios ya no están activos. **Códigos duplicados a
revisar en Usuarios por UN:** 376 = Cristian Nuñez y Gabriela Vasquez
Villagra (asistente); 502 = Ernesto Corvalán y Nicolas Espinoza
(asistente).

Mantención: cuando entra o sale un vendedor de Construcción, agregar o
quitar su valor en esta lista (formato exacto `Nombre Apellido - código`,
con el nombre igual al del usuario en Zoho).

### Cambios en el Sandbox

1. Cotizaciones: reemplazar el campo de texto `Vendedor Secundario` por
   una **Lista de selección** `Vendedor Secundario` (editable) con los
   valores de arriba. `Código de Vendedor Secundario` sigue solo lectura.
   Confirmar el nombre de API nuevo (puede quedar con un número al final
   si Zoho guarda el anterior).
2. Reemplazar Función 1 y Función 2 por las versiones v3 (abajo).
3. Regla 4 pasa a ser **"VS Cotización - editar"**: al editar, campo
   modificado **Vendedor Secundario** → Función 2.

### Función 1 v3: `vendedorSecundarioOportunidad`

```deluge
deal = zoho.crm.getRecordById("Deals", dealId.toLong());
vend = deal.get("Vendedor_Secundario");
nombre = "";
codigo = "";
if(vend != null)
{
	nombre = ifnull(vend.get("name"), "");
	if(deal.get("UN") != null)
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
}
mapaDeal = Map();
mapaDeal.put("C_digo_de_Vendedor_Secundario", codigo);
zoho.crm.updateRecord("Deals", dealId.toLong(), mapaDeal);
// Bajar a las Cotizaciones solo si la Oportunidad tiene vendedor secundario con código
if(nombre != "" && codigo != "")
{
	cotizaciones = zoho.crm.getRelatedRecords("Quotes", "Deals", dealId.toLong());
	for each cot in cotizaciones
	{
		mapaCot = Map();
		mapaCot.put("Vendedor_Secundario", nombre + " - " + codigo);
		mapaCot.put("C_digo_de_Vendedor_Secundario", codigo);
		zoho.crm.updateRecord("Quotes", cot.get("id").toLong(), mapaCot);
	}
}
```

### Función 2 v3: `vendedorSecundarioCotizacion`

```deluge
quote = zoho.crm.getRecordById("Quotes", quoteId.toLong());
vs = ifnull(quote.get("Vendedor_Secundario"), "");
mapa = Map();
// Si en la Cotización no eligieron vendedor secundario, tomarlo de la Oportunidad
if(vs == "" && quote.get("Deal_Name") != null)
{
	deal = zoho.crm.getRecordById("Deals", quote.get("Deal_Name").get("id").toLong());
	vend = deal.get("Vendedor_Secundario");
	codDeal = ifnull(deal.get("C_digo_de_Vendedor_Secundario"), "");
	if(vend != null && codDeal != "")
	{
		vs = ifnull(vend.get("name"), "") + " - " + codDeal;
		mapa.put("Vendedor_Secundario", vs);
	}
}
// El código es lo que viene después de " - "
codigo = "";
if(vs.contains(" - "))
{
	codigo = vs.getSuffix(" - ").trim();
}
mapa.put("C_digo_de_Vendedor_Secundario", codigo);
zoho.crm.updateRecord("Quotes", quoteId.toLong(), mapa);
```

(Función 3 de la OV no cambia: copia el código que tenga la Cotización.)


## Qué se pidió y para qué

El **Propietario de la Cotización** es un vendedor, pero muchas veces la
cotización la **termina otro vendedor** — el "vendedor secundario".
Simón quiere registrarlo y que su **código** llegue a la **Orden de
venta**.

Requisitos de Simón (2026-09-24):

- El campo tiene que estar en la Oportunidad y viajar a Cotización y OV.
- **En la Orden de venta tiene que llegar el CÓDIGO del vendedor, no el
  nombre.**

## Hallazgos en el CRM real (lectura, 2026-09-24)

- El código de vendedor **depende de la Unidad de Negocio**: vive en el
  módulo **Usuarios por UN** (`Vendedores_por_UN`, campos `Vendedor`,
  `UN`, `Activo`, `C_digo_de_Vendedor`). Ej.: Tirapegui = 131 en
  Construcción y 1111 en Agroforestal.
- El "Código de Vendedor" de la ficha del **Usuario** NO sirve: solo ~50
  de 158 usuarios activos lo tienen, con valores erróneos.
- En Usuarios por UN hay 139 filas activas, pero **muchas sin código**
  (casi toda Rental, Inamar Vapor y Maktotal).
- Los 3 módulos tienen `UN`. Cotización tiene `Deal_Name`; OV tiene
  `Quote_Name` y `Deal_Name`.
- Límite de Zoho: **máx. 5 campos "búsqueda de usuario" por módulo**.
  Cotizaciones ya está en el tope.

## Diseño (final)

| Campo | Oportunidades | Cotizaciones | Órdenes de venta |
|---|---|---|---|
| **Vendedor Secundario** | Búsqueda de usuario (lo elige el vendedor) | Línea única, **solo lectura** (nombre, se llena solo) | ❌ |
| **Código de Vendedor Secundario** | Línea única, solo lectura | Línea única, solo lectura | Línea única, solo lectura |

- El vendedor secundario **se elige SOLO en la Oportunidad**. El código
  se busca en Usuarios por UN (vendedor + UN del registro).
- Al elegirlo/cambiarlo en la Oportunidad → se actualizan **todas las
  Cotizaciones de esa Oportunidad** (nombre + código según la UN de cada
  cotización).
- Al crear una Cotización → trae nombre y código desde su Oportunidad.
- Al crear la OV → se copia **solo el código** desde la Cotización
  (respaldo: desde la Oportunidad).

---

## PASO A PASO

### Parte A — Preparar el Sandbox ✅

### Parte B — Crear los campos

**Oportunidades** ✅ (hecho): `Vendedor Secundario` (búsqueda de
usuario) + `Código de Vendedor Secundario` (línea única, solo lectura).

**Cotizaciones** (en todos los diseños):
- `Vendedor Secundario` → **Línea única**, solo lectura.
- `Código de Vendedor Secundario` → **Línea única**, solo lectura.

**Órdenes de venta** (en todos los diseños):
- Solo `Código de Vendedor Secundario` → Línea única, solo lectura.

Solo lectura: ⋮ sobre el campo → Establecer permiso → Solo lectura para
todos los perfiles menos Administrator.

Verificar nombres de API (Configuración → Desarrollador → API y SDK →
Nombres de API): `Vendedor_Secundario` y `C_digo_de_Vendedor_Secundario`
en cada módulo.

### Parte C — Crear las 3 funciones

Configuración → Desarrollador → **Funciones** → **+ Nueva función** →
categoría **Automatización / Flujo de trabajo**.

#### Función 1: `vendedorSecundarioOportunidad` (argumento `dealId`)

Calcula el código en la Oportunidad y lo baja a todas sus Cotizaciones.

```deluge
deal = zoho.crm.getRecordById("Deals", dealId.toLong());
vend = deal.get("Vendedor_Secundario");
nombre = "";
if(vend != null)
{
	nombre = ifnull(vend.get("name"), "");
}
// 1) Código en la Oportunidad, según su UN
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
mapaDeal = Map();
mapaDeal.put("C_digo_de_Vendedor_Secundario", codigo);
zoho.crm.updateRecord("Deals", dealId.toLong(), mapaDeal);
// 2) Bajar nombre y código a todas las Cotizaciones de esta Oportunidad
cotizaciones = zoho.crm.getRelatedRecords("Quotes", "Deals", dealId.toLong());
for each cot in cotizaciones
{
	codCot = "";
	if(vend != null && cot.get("UN") != null)
	{
		filasCot = zoho.crm.searchRecords("Vendedores_por_UN", "(UN:equals:" + cot.get("UN").get("id") + ")");
		for each fila in filasCot
		{
			if(fila.get("Vendedor") != null && fila.get("Vendedor").get("id").toString() == vend.get("id").toString() && fila.get("Activo") == true && ifnull(fila.get("C_digo_de_Vendedor"), "") != "")
			{
				codCot = fila.get("C_digo_de_Vendedor");
			}
		}
	}
	mapaCot = Map();
	mapaCot.put("Vendedor_Secundario", nombre);
	mapaCot.put("C_digo_de_Vendedor_Secundario", codCot);
	zoho.crm.updateRecord("Quotes", cot.get("id"), mapaCot);
}
```

#### Función 2: `vendedorSecundarioCotizacion` (argumento `quoteId`)

Al crear la Cotización (o si le cambian la UN), trae nombre y código
desde su Oportunidad.

```deluge
quote = zoho.crm.getRecordById("Quotes", quoteId.toLong());
nombre = "";
codigo = "";
if(quote.get("Deal_Name") != null)
{
	deal = zoho.crm.getRecordById("Deals", quote.get("Deal_Name").get("id"));
	vend = deal.get("Vendedor_Secundario");
	if(vend != null)
	{
		nombre = ifnull(vend.get("name"), "");
		if(quote.get("UN") != null)
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
	}
}
mapa = Map();
mapa.put("Vendedor_Secundario", nombre);
mapa.put("C_digo_de_Vendedor_Secundario", codigo);
zoho.crm.updateRecord("Quotes", quoteId.toLong(), mapa);
```

#### Función 3: `vendedorSecundarioOV` (argumento `soId`)

```deluge
so = zoho.crm.getRecordById("Sales_Orders", soId.toLong());
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
	zoho.crm.updateRecord("Sales_Orders", soId.toLong(), mapa);
}
```

### Parte D — Reglas de flujo

Configuración → Automatización → **Reglas de flujo de trabajo**.
Acción: **Función** → mapear el argumento con `#` → módulo → **"ID de registro"**
(⚠️ NO usar "ID de Cotización" u otros parecidos: quedan como
`${Campo no admitido}` y la función falla con "Unable to cast TEXT into
Long". Pasó en el Sandbox el 2026-09-24/25).

| # | Módulo | Nombre | Cuándo | Condición | Función |
|---|---|---|---|---|---|
| 1 | Oportunidades | VS Oportunidad - crear | Al crear | Vendedor Secundario no está vacío | vendedorSecundarioOportunidad |
| 2 | Oportunidades | VS Oportunidad - editar | Al editar → campos modificados: Vendedor Secundario o UN | Todos | vendedorSecundarioOportunidad |
| 3 | Cotizaciones | VS Cotización - crear | Al crear | Todos | vendedorSecundarioCotizacion |
| 4 | Cotizaciones | VS Cotización - cambio UN | Al editar → campo modificado: UN | Todos | vendedorSecundarioCotizacion |
| 5 | Órdenes de venta | VS OV - crear | Al crear | Todos | vendedorSecundarioOV |

### Parte E — Pruebas en el Sandbox

1. Oportunidad (UN con código para el vendedor de prueba) → elegir
   Vendedor Secundario → aparece el código.
2. Cambiar la UN de la Oportunidad → el código cambia.
3. Generar Cotización desde esa Oportunidad → trae nombre y código.
4. **Caso más común**: Oportunidad sin vendedor secundario → generar
   Cotización → recién ahí elegir el Vendedor Secundario **en la
   Oportunidad** → la Cotización se actualiza sola.
5. Cambiar el vendedor en la Oportunidad → se actualizan sus
   Cotizaciones.
6. Convertir la Cotización en OV → la OV tiene el **código** (no el
   nombre).
7. Cotización sin vendedor secundario → OV sin código, sin error.
8. Con un usuario de perfil Vendedor: puede elegir el Vendedor
   Secundario en la Oportunidad y **no** puede escribir en los campos de
   solo lectura.

Si algo falla: Configuración → Desarrollador → Funciones → la función →
Registros/Logs.

### Parte F — Pasar a Producción

1. En Producción: Configuración → Administración de datos → Sandbox →
   el Sandbox → **Implementar / Deploy**.
2. Seleccionar: campos y diseños de los 3 módulos, las 3 funciones y las
   5 reglas.
3. En Producción: revisar que las 5 reglas estén **activas** y los
   campos en todos los diseños.
4. Prueba real Cotización → OV y borrar los registros de prueba.
5. Pendiente de datos: completar códigos faltantes en Usuarios por UN
   (Rental, Inamar Vapor, Maktotal).

## Notas

- Si una Cotización ya se convirtió en OV y después cambian el vendedor
  en la Oportunidad, la Cotización se actualiza pero la OV ya creada
  **no** (la OV conserva el código con que se creó).
- ¿Aplica a Rental? Rental casi no tiene códigos en Usuarios por UN y
  usa aparte "Cód Vendedor Rental" en Cotizaciones.
