# Propuesta: campo "Código de Vendedor Secundario" (Oportunidad → Cotización → Orden de venta)

## Estado: PROPUESTA — esperando OK de Simón para crear los campos (diseño recomendado: lista de usuarios + código automático)

## Qué se pidió

Simón quiere un campo nuevo en la **Oportunidad** llamado **Código de
Vendedor Secundario**, y que ese dato viaje a la **Cotización** y a la
**Orden de venta**.

## Para qué es (contexto que dio Simón)

El **Propietario de la Cotización** es un vendedor, pero muchas veces la
cotización la **termina otro vendedor**. Ese otro vendedor es el
"vendedor secundario", y su código tiene que quedar registrado en la
Cotización y llegar a la Orden de venta.

Consecuencia para el diseño: el vendedor secundario muchas veces se
conoce **recién en la etapa de Cotización** (no al abrir la
Oportunidad). Por eso el campo tiene que poder **completarse o cambiarse
directo en la Cotización**, no solo copiarse desde la Oportunidad.

## Diseño recomendado (ajustado al contexto)

Encontré que cada **Usuario** del CRM ya tiene su propio campo
**"Código de Vendedor"** (`C_digo_de_Vendedor` en Usuarios). Entonces lo
más seguro es que el vendedor **elija a la persona** de una lista, y el
código se complete solo (evita errores de tipeo en el código):

| Campo | Tipo | Módulos | Quién lo llena |
|---|---|---|---|
| **Vendedor Secundario** | Búsqueda de usuario | Oportunidades, Cotizaciones (**no** en Órdenes de venta) | El vendedor, eligiendo de la lista |
| **Código de Vendedor Secundario** | Texto (solo lectura en el diseño) | Oportunidades, Cotizaciones, Órdenes de venta | Automático, desde el Código de Vendedor del usuario elegido |

Reglas:

1. **Al elegir/cambiar el Vendedor Secundario** (en Oportunidad o
   Cotización) → se completa solo el Código de Vendedor Secundario con el
   código de ese usuario.
2. **Al crear la Cotización desde la Oportunidad** → si la Oportunidad
   ya tenía vendedor secundario, se copia. Si no, se elige en la
   Cotización (que es el caso más común, según lo que contó Simón).
3. **Al crear la Orden de venta** → se copia **solo el Código de
   Vendedor Secundario** desde la Cotización. **Requisito de Simón
   (2026-09-24): en la Orden de venta tiene que llegar el código del
   vendedor, no el nombre.** Por eso la OV no lleva el campo "Vendedor
   Secundario" (nombre), solo el código — igual que el "Código del
   Vendedor" que ya tiene la OV hoy. El código se copia tal cual desde la
   Cotización (ya viene resuelto ahí), así no depende de volver a buscar
   al usuario.

Función Deluge para la regla 1 en Cotizaciones (al crear o editar,
cuando cambia "Vendedor Secundario"; argumento `quoteId`):

```deluge
quote = zoho.crm.getRecordById("Quotes", quoteId);
vend = quote.get("Vendedor_Secundario");
codigo = "";
if(vend == null && quote.get("Deal_Name") != null)
{
	// sin vendedor elegido en la Cotización: tomarlo de la Oportunidad
	dealRec = zoho.crm.getRecordById("Deals", quote.get("Deal_Name").get("id"));
	vend = dealRec.get("Vendedor_Secundario");
}
mapa = Map();
if(vend != null)
{
	user = zoho.crm.getRecordById("users", vend.get("id"));
	codigo = ifnull(user.get("users").get(0).get("C_digo_de_Vendedor"), "");
	mapa.put("Vendedor_Secundario", vend.get("id"));
}
mapa.put("C_digo_de_Vendedor_Secundario", codigo);
zoho.crm.updateRecord("Quotes", quoteId, mapa);
```

(La misma lógica, cambiando el módulo, sirve para Oportunidades. Para
Órdenes de venta se usa la función del Paso 3 de abajo, que copia solo
el código desde la Cotización — `Quote_Name` — con respaldo desde la
Oportunidad.)

> La versión original de esta propuesta (solo campo de texto libre,
> copiado desde la Oportunidad al crear) queda abajo como alternativa
> más simple.

## Lo que hay hoy en el CRM (revisado en vivo, solo lectura, 2026-09-24)

| Módulo | Campo de código de vendedor que ya existe | API name |
|---|---|---|
| Oportunidades | Código de Vendedor | `C_digo_de_Vendedor` (texto) |
| Cotizaciones | Código de Vendedor | `C_digo_de_Vendedor` (texto) |
| Cotizaciones | Cód Vendedor Rental | `C_digo_del_Vendedor` (texto) |
| Órdenes de venta | Código del Vendedor | `C_digo_del_Vendedor` (texto) |

**No existe** ningún campo de vendedor secundario en ninguno de los tres
módulos — hay que crearlo en los tres.

## Alternativa simple: Paso 1 — Crear el campo en los 3 módulos

Mismo nombre y mismo tipo en los tres (así Zoho le asigna el mismo
API name en todos, lo que facilita el traspaso):

- **Etiqueta**: `Código de Vendedor Secundario`
- **Tipo**: Línea única (texto), igual que el "Código de Vendedor" actual
- **API name esperado**: `C_digo_de_Vendedor_Secundario`
- **Módulos**: Oportunidades, Cotizaciones, Órdenes de venta
- **Ubicación en el diseño**: al lado del "Código de Vendedor" existente
  en cada módulo (esto último lo acomoda Simón en el editor de diseño —
  la herramienta de creación de campos no ubica el campo en la sección).

Esto lo puedo crear yo directo con la conexión a Zoho, apenas Simón dé
el OK.

## Paso 2 — Que el dato viaje de la Oportunidad a la Cotización

Igual que pasó con "Ámbito" (ver
`propuesta-flujo-ambito-oportunidad-a-cotizacion.md`): al generar la
Cotización desde la Oportunidad, Zoho **no copia solos** los campos
personalizados de texto. Hace falta una regla de flujo.

### Pasos en Zoho (Configuración → Automatización → Reglas de flujo de trabajo)

1. Módulo: **Cotizaciones**
2. Nombre: **"Código Vendedor Secundario desde Oportunidad"**
3. Cuándo: **Al crear el registro**
4. Criterio: todos los registros (o `Nombre de Trato` **no está vacío**)
5. Acción: **Función personalizada** con este código (argumento
   `quoteId` = ID de la Cotización):

```deluge
quote = zoho.crm.getRecordById("Quotes", quoteId);
deal = quote.get("Deal_Name");
if(deal != null)
{
	dealRec = zoho.crm.getRecordById("Deals", deal.get("id"));
	codigo = ifnull(dealRec.get("C_digo_de_Vendedor_Secundario"), "");
	if(codigo != "")
	{
		mapa = Map();
		mapa.put("C_digo_de_Vendedor_Secundario", codigo);
		zoho.crm.updateRecord("Quotes", quoteId, mapa);
	}
}
```

(También se puede intentar con "Actualización de campo" → valor de la
Oportunidad asociada, sin código; si el asistente no ofrece esa opción,
usar la función.)

## Paso 3 — Que el dato viaje de la Cotización a la Orden de venta

Cuando se convierte la Cotización en Orden de venta, Zoho normalmente
**sí copia** los campos personalizados que tienen el mismo nombre en los
dos módulos. Por eso es importante crearlo con la misma etiqueta en
ambos (Paso 1).

**Hay que probarlo** con una cotización de prueba. Si no se copia solo,
se agrega una segunda regla igual a la del Paso 2, en el módulo
**Órdenes de venta**, al crear:

```deluge
so = zoho.crm.getRecordById("Sales_Orders", soId);
quote = so.get("Quote_Name");
codigo = "";
if(quote != null)
{
	quoteRec = zoho.crm.getRecordById("Quotes", quote.get("id"));
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

## Preguntas abiertas para Simón

1. ¿Texto libre está bien, o el vendedor secundario debería elegirse de
   una lista de usuarios (y el código se completa solo)? La propuesta
   usa texto libre para ser igual al "Código de Vendedor" actual.
2. ¿Si alguien cambia el código en la Oportunidad **después** de creada
   la Cotización, debe actualizarse también en la Cotización/OV? La
   propuesta solo lo copia al crear.

## Próximo paso

- OK de Simón → creo los 3 campos en Zoho.
- Simón arma la regla del Paso 2 y prueba la conversión a OV (Paso 3).
