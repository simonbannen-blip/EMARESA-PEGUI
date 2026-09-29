# Plantilla de correo + regla de flujo: aviso al KAM cuando la Oportunidad pasa a "Cotización Enviada"

## Estado: EN ARMADO (Simón arma la automatización; probar primero en Sandbox)

## Para qué

Avisar al **KAM asociado** que se envió la cotización al cliente, para que
pueda hacer el seguimiento comercial.

## Decisión (Simón, 29-09-2026)

Se arma en **Oportunidades** (no en Cotizaciones), porque:

- Ahí existe el campo **`KAM Asociado`** (`KAM_Asociado`, búsqueda de
  usuario). En Cotizaciones y Clientes no hay campo KAM (revisado en
  Producción).
- Cuando la cotización se envía, la Oportunidad queda en la fase
  **"Cotización Enviada"** (valor del campo `Fase` / `Stage`).

## Cómo cambia hoy la fase a "Cotización Enviada" (revisado en Producción)

En el timeline de la Oportunidad 260929-OP-II-10015-002312 (29-09-2026) se
ve que la fase **no la cambia el vendedor a mano**: la cambia la regla de
flujo **"SB Actualizar Fase de Oportunidad según Cotización"** (módulo
Cotizaciones), con la acción de actualización de campo **"Act. Fase a
Cotización enviada"** (Creada → Cotización Enviada).

Esto importa porque en Zoho, **un cambio hecho por la acción "actualizar
campo" de una regla normalmente no dispara otras reglas de flujo**. Por eso
hay que probar en Sandbox si la regla nueva de Oportunidades se dispara; si
no, se usa la opción B.

## Opción A (recomendada, sin código): regla en Oportunidades

1. Configuración → Automatización → Reglas de flujo de trabajo → **Crear
   regla**.
2. Módulo: **Oportunidades**. Nombre: **SB Aviso KAM - Cotización
   Enviada**.
3. Ejecutar cuando: **se edite un registro** (edición en general). **No**
   usar "Cuando se modifique un campo específico": ahí **Fase no aparece**
   (confirmado por Simón en Sandbox, 29-09-2026), porque Fase la maneja el
   Blueprint "Gestión de Oportunidades".
   - Dejar **desmarcada** la opción **"Repetir este flujo de trabajo cada
     vez que se edite un registro"**: así la regla corre **una sola vez**,
     cuando la Oportunidad pasa a cumplir la condición (llega a Cotización
     Enviada), y no en cada edición posterior.
4. Condición: **Fase es Cotización Enviada** Y **KAM Asociado no está
   vacío**.
   - Si **Fase tampoco aparece en la lista de condiciones**, usar
     **Probabilidad (%) es 75**: en esta org, "Cotización Enviada" es la
     única fase con probabilidad 75 (Creada 0, Necesita Análisis 20,
     Negociación 90, Cerrada Ganada 100, Contactado/Perdida/Declinada 0), y
     Zoho la actualiza sola al cambiar la fase.
5. Acción instantánea: **Alerta de correo electrónico** → plantilla **Aviso
   KAM - Cotización Enviada** → Para: **KAM Asociado** (en la lista de
   usuarios del registro). Opcional CC: Propietario de Oportunidad.
6. Guardar y probar: enviar una cotización de una Oportunidad que tenga KAM
   Asociado y revisar el timeline de la Oportunidad.

## Opción B (si la A no se dispara): agregar una función a la regla existente

Agregar, como acción extra en la regla **"SB Actualizar Fase de
Oportunidad según Cotización"** (Cotizaciones), una función que envía el
correo directo al KAM de la Oportunidad.

- Nombre: **SB Aviso KAM Cotizacion Enviada**
- Argumento: `dealId` = Cotizaciones → Nombre de Oportunidad → **ID de
  Oportunidad**

```deluge
deal = zoho.crm.getRecordById("Deals",dealId.toLong());
kam = deal.get("KAM_Asociado");
if(kam != null && kam.get("email") != null)
{
	cliente = ifnull(deal.get("Account_Name"),{"name":""}).get("name");
	contacto = ifnull(deal.get("Contact_Name"),{"name":""}).get("name");
	un = ifnull(deal.get("UN"),{"name":""}).get("name");
	vendedor = ifnull(deal.get("Owner"),{"name":""}).get("name");
	link = "https://crm.zoho.com/crm/tab/Potentials/" + dealId;
	cuerpo = "Hola " + kam.get("name") + ",<br><br>";
	cuerpo = cuerpo + "Te informamos que se envió una cotización a tu cliente asociado:<br><br>";
	cuerpo = cuerpo + "- Cliente: " + cliente + "<br>";
	cuerpo = cuerpo + "- Contacto: " + contacto + "<br>";
	cuerpo = cuerpo + "- Oportunidad: " + deal.get("Deal_Name") + "<br>";
	cuerpo = cuerpo + "- N° de Oportunidad: " + ifnull(deal.get("Nro_de_Oportunidad"),"") + "<br>";
	cuerpo = cuerpo + "- Unidad de Negocio: " + un + "<br>";
	cuerpo = cuerpo + "- Importe: CLP " + ifnull(deal.get("Amount"),0) + "<br>";
	cuerpo = cuerpo + "- Fecha estimada de cierre: " + ifnull(deal.get("Closing_Date"),"") + "<br>";
	cuerpo = cuerpo + "- Vendedor: " + vendedor + "<br><br>";
	cuerpo = cuerpo + "Te recomendamos coordinar con el vendedor el seguimiento con el cliente.<br><br>";
	cuerpo = cuerpo + "Puedes revisar el detalle en el CRM: <a href='" + link + "'>" + link + "</a><br><br>";
	cuerpo = cuerpo + "Saludos,<br>Equipo Comercial Emaresa";
	sendmail
	[
		from :zoho.adminuserid
		to :kam.get("email")
		subject :"Cotización enviada: " + deal.get("Deal_Name") + " - " + cliente
		message :cuerpo
	]
}
```

Nota: si el importe no se actualiza a tiempo (la regla de monto corre en
paralelo), puede salir el importe anterior en el correo.

## Ojo: pocas Oportunidades tienen KAM Asociado

Al 29-09-2026 solo **92 Oportunidades** tienen `KAM Asociado` completo, y
las 5 últimas que pasaron a "Cotización Enviada" lo tenían **vacío**. Sin
KAM, el correo no se envía (la condición lo filtra). Si se quiere que el
aviso llegue siempre, hay que asegurar que el campo se complete (por
ejemplo, desde el Cliente o haciéndolo obligatorio en ciertas UN).

## Plantilla (módulo Oportunidades)

**Nombre de la plantilla:** Aviso KAM - Cotización Enviada

**Asunto:**

```
Cotización enviada: ${Oportunidades.Nombre de Oportunidad} - ${Oportunidades.Nombre de Cliente}
```

**Cuerpo:**

```
Hola ${Oportunidades.KAM Asociado},

Te informamos que se envió una cotización a tu cliente asociado:

- Cliente: ${Oportunidades.Nombre de Cliente}
- Contacto: ${Oportunidades.Nombre de Contacto}
- Oportunidad: ${Oportunidades.Nombre de Oportunidad}
- N° de Oportunidad: ${Oportunidades.Nro. de Oportunidad}
- Unidad de Negocio: ${Oportunidades.UN}
- Importe: ${Oportunidades.Importe}
- Fecha estimada de cierre: ${Oportunidades.Fecha de cierre}
- Vendedor: ${Oportunidades.Propietario de Oportunidad}

Te recomendamos coordinar con el vendedor el seguimiento con el cliente.

Puedes revisar el detalle de la oportunidad y sus cotizaciones en el CRM:
${Oportunidades.URL del registro}

Saludos,
Equipo Comercial Emaresa
```

## Notas

- Los `${...}` se insertan en Zoho con el botón **"Insertar campo de
  combinación"** (Configuración → Personalización → Plantillas → Correo
  electrónico → Oportunidades), para que queden con el nombre interno
  correcto.
- Una plantilla de Oportunidades **no puede mostrar datos de la
  Cotización** (N° de cotización, validez), porque son registros
  relacionados. La cotización se ve desde el link a la Oportunidad.
- El **Importe** de la Oportunidad refleja el monto de la última cotización
  una vez aplicada la propuesta
  `propuesta-sincronizar-monto-cotizacion-a-oportunidad.md`.
