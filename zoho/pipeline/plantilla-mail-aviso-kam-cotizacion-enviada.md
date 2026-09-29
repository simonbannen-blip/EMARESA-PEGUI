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

## Paso 1 — Campo nuevo en Cotizaciones

- Configuración → Personalización → Módulos → **Cotizaciones** → diseño.
- Arrastrar un campo **"Búsqueda de usuario"** (user lookup).
- Etiqueta: **KAM Asociado**. No obligatorio.
- Revisar el **nombre de API** que le asigna Zoho (debería ser
  `KAM_Asociado`); si es otro, cambiarlo en la función del paso 2.

## Paso 2 — Función que copia el KAM de la Oportunidad

- Configuración → Desarrollador → Funciones → **Nueva función** (Categoría:
  Automatización, módulo Cotizaciones).
- Nombre: **SB Copiar KAM a Cotizacion**
- Argumentos (mapearlos al asociarla a la regla):
  - `quoteId` = Cotizaciones → **ID de Cotización**
  - `dealId` = Cotizaciones → Nombre de Oportunidad → **ID de Oportunidad**

```deluge
if(dealId == null || dealId == "")
{
	return;
}
deal = zoho.crm.getRecordById("Deals",dealId.toLong());
kam = deal.get("KAM_Asociado");
if(kam != null)
{
	quote = zoho.crm.getRecordById("Quotes",quoteId.toLong());
	actual = quote.get("KAM_Asociado");
	actualId = "";
	if(actual != null)
	{
		actualId = actual.get("id").toString();
	}
	if(actualId != kam.get("id").toString())
	{
		resp = zoho.crm.updateRecord("Quotes",quoteId.toLong(),{"KAM_Asociado":kam.get("id")});
		info resp;
	}
}
```

- Solo escribe si el KAM cambió (no hace ediciones de más).
- Una actualización hecha desde una función no vuelve a disparar reglas,
  así que no genera bucles.

## Paso 3 — Regla que ejecuta la función

- Reglas de flujo de trabajo → **Crear regla** → módulo **Cotizaciones**.
- Nombre: **SB Copiar KAM a Cotización**
- Cuándo: **Acción de registro → Crear o editar**, con "Repetir" **marcado**
  (así también toma el KAM si se completa en la Oportunidad después).
- Condición: **Todas las Cotizaciones** (o "Nombre de Oportunidad no está
  vacío").
- Acción: **Función** → SB Copiar KAM a Cotizacion.

## Paso 4 — Enviar el correo al confirmar el envío

**Opción recomendada — en el Blueprint:**

- Configuración → Automatización → Blueprint → **SB Gestión de
  Cotizaciones** → transición **"Confirmar Envío de Cotización"** →
  sección **Después** → **Alertas de correo electrónico** → nueva alerta:
  - Plantilla: **Aviso KAM - Cotización Enviada** (la de Cotizaciones).
  - Para: campo de usuario **KAM Asociado**.
- Es lo más directo: sale justo cuando el vendedor confirma el envío.
- Si la Cotización no tiene KAM, simplemente no hay destinatario.

**Alternativa — regla de flujo** (si no se quiere tocar el Blueprint):
Cotizaciones → al **editar**, **sin** "Repetir", condición **Fase de
Cotización es Enviada** Y **KAM Asociado no está vacío** → alerta de correo
con la misma plantilla a KAM Asociado.

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
