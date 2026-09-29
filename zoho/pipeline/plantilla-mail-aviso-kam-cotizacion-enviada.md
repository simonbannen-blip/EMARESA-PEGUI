# Aviso al KAM cuando se envía una Cotización

## Estado: EN ARMADO EN SANDBOX (Simón lo arma; diseño final = campo KAM en Cotizaciones)

## Para qué

Avisar al **KAM asociado** que se envió la cotización al cliente, para que
pueda hacer el seguimiento comercial.

## Diseño final (decidido por Simón, 29-09-2026)

Se probó armarlo en Oportunidades (campo `KAM Asociado` + fase "Cotización
Enviada"), pero no calzaba: Fase no aparece para disparar la regla (la
maneja el Blueprint "Gestión de Oportunidades") y la plantilla ya estaba
hecha en Cotizaciones. **Decisión: crear un campo "KAM Asociado" en
Cotizaciones que copie el KAM de la Oportunidad, y mandar el correo desde
la Cotización.**

### Cómo funciona hoy el envío (revisado en Producción, COT 20260929-COT-II10015-2450)

1. La Cotización la **crea Creator por API** ("Infraestructura Emaresa").
2. Al crearse corren varias reglas, entre ellas **"VS Cotización -
   crear/editar"** (función `vendedorSecundarioCotizacion`, mismo patrón
   de copiar un dato de la Oportunidad).
3. Minutos después el vendedor ejecuta **a mano** la transición de
   Blueprint **"Confirmar Envío de Cotización"** (Blueprint "SB Gestión de
   Cotizaciones"): Fase de Cotización **Creada → Enviada**.
4. Eso dispara "SB Actualizar Fase de Oportunidad según Cotización", que
   pasa la Oportunidad a "Cotización Enviada".

Como el KAM se copia al **crear** la Cotización (paso 2) y el envío pasa
después (paso 3), cuando llega el momento del correo el KAM ya está en la
Cotización.

## Ajuste (29-09-2026): Cotizaciones no admite más campos "Búsqueda de usuario"

Simón no pudo crear el campo como búsqueda de usuario (el módulo ya llegó
al límite de ese tipo de campo). Solución: **dos campos simples** que llena
la función:

- **KAM Asociado** — Línea única (texto): nombre del KAM (para el saludo).
- **Email KAM** — Correo electrónico: a esta dirección se manda la alerta.

El campo `KAM_Asociado` de la Oportunidad solo trae nombre e id (revisado
en Producción: `{"name":"Braulio Guzmán","id":"5404724000038063001"}`), sin
email. Por eso la función consulta el usuario por API, lo que requiere una
**conexión** de Deluge.

## Paso 1 — Campos nuevos en Cotizaciones

- Configuración → Personalización → Módulos y campos → Cotizaciones →
  diseño.
- **Línea única**, etiqueta `KAM Asociado` (API esperado `KAM_Asociado`).
- **Correo electrónico**, etiqueta `Email KAM` (API esperado `Email_KAM`).

## Paso 2 — Conexión para leer usuarios

- Configuración → Desarrollador → Conexiones → **Crear conexión** →
  servicio **Zoho OAuth**.
- Nombre de la conexión: `crm_usuarios`.
- Alcance (scope): `ZohoCRM.users.READ`.
- Crear y **Conectar** (autorizar con un usuario administrador).

## Paso 3 — Función "SB Copiar KAM a Cotizacion"

Argumentos: `quoteId` (ID de Cotización), `dealId` (ID de Oportunidad).

```deluge
if(dealId == null || dealId == "")
{
	return;
}
deal = zoho.crm.getRecordById("Deals",dealId.toLong());
kam = deal.get("KAM_Asociado");
if(kam != null)
{
	// Sandbox: https://sandbox.zohoapis.com  |  Producción: https://www.zohoapis.com
	resp = invokeurl
	[
		url :"https://sandbox.zohoapis.com/crm/v8/users/" + kam.get("id")
		type :GET
		connection:"crm_usuarios"
	];
	users = resp.get("users");
	if(users != null && users.size() > 0)
	{
		email = users.get(0).get("email");
		quote = zoho.crm.getRecordById("Quotes",quoteId.toLong());
		if(quote.get("Email_KAM") != email || quote.get("KAM_Asociado") != kam.get("name"))
		{
			upd = zoho.crm.updateRecord("Quotes",quoteId.toLong(),{"KAM_Asociado":kam.get("name"),"Email_KAM":email});
			info upd;
		}
	}
}
```

**Al pasar a Producción cambiar la URL** a `https://www.zohoapis.com/...`.

## Paso 4 — Regla que ejecuta la función

- Reglas de flujo de trabajo → Crear regla → módulo **Cotizaciones** →
  `SB Copiar KAM a Cotización`.
- Cuándo: **Crear o editar**, con "Repetir" **marcado**.
- Condición: **Nombre de Oportunidad no está vacío**.
- Acción: **Función** → SB Copiar KAM a Cotizacion (quoteId = ID de
  Cotización, dealId = ID de Oportunidad).

## Paso 5 — Alerta de correo al confirmar el envío (Blueprint)

- Blueprint **SB Gestión de Cotizaciones** → transición **"Confirmar Envío
  de Cotización"** → **Después** → Alertas de correo electrónico → nueva:
  - Plantilla: **Aviso KAM - Cotización Enviada** (Cotizaciones).
  - Para: el campo de correo **Email KAM** (aparece entre los campos de
    correo del módulo en el selector de destinatarios).
- Si "Email KAM" no aparece como destinatario, alternativa: agregar
  `sendmail` al final de la función (o una función aparte en el "Después"
  de la transición).

## Plantilla (módulo Cotizaciones)

**Nombre:** Aviso KAM - Cotización Enviada

**Asunto:**

```
Cotización ${Cotizaciones.Asunto} enviada a ${Cotizaciones.Nombre de Cliente}
```

**Cuerpo:**

```
Hola ${Cotizaciones.KAM Asociado},

Te informamos que se envió la siguiente cotización a tu cliente:

- Cliente: ${Cotizaciones.Nombre de Cliente}
- Contacto: ${Cotizaciones.Nombre de Contacto}
- Cotización: ${Cotizaciones.Asunto}
- Oportunidad: ${Cotizaciones.Nombre de Oportunidad}
- Total: ${Cotizaciones.Total general}
- Válida hasta: ${Cotizaciones.Válido hasta}
- Vendedor: ${Cotizaciones.Propietario de Cotización}

Te recomendamos coordinar con el vendedor el seguimiento con el cliente
antes de la fecha de vencimiento.

Puedes revisar el detalle en el CRM: ${Cotizaciones.URL del registro}

Saludos,
Equipo Comercial Emaresa
```

Los `${...}` se insertan con **"Insertar campo de combinación"** para que
queden con el nombre interno correcto. En esta org el número de la
cotización va en **Asunto** (ej. `20260929-COT-II10015-2450`).

## Ojo: pocas Oportunidades tienen KAM Asociado

Al 29-09-2026 solo **92 Oportunidades** tienen `KAM Asociado` completo, y
las 5 últimas que pasaron a "Cotización Enviada" lo tenían **vacío**. Sin
KAM en la Oportunidad, la Cotización tampoco lo tendrá y el correo no sale.

## Pasar a Producción

Después de probar en Sandbox: crear el campo, la función, la regla y la
alerta del Blueprint en Producción (o implementar el Sandbox), confirmando
el nombre de API del campo.
