# Plantilla de correo: aviso al KAM de que se envió la Cotización

## Estado: BORRADOR (texto listo; falta definir cómo se dispara y a quién se envía)

## Para qué

Avisar al **KAM asociado** que la Cotización ya fue enviada al cliente, para
que pueda hacer el seguimiento comercial.

## Nota sobre el destinatario

En el CRM **no existe un campo "KAM"** ni en Cotizaciones ni en Clientes
(revisado en Producción, 29-09-2026): "KAM" es un **rol** de usuario (ej.
"KAM Mineria"). Opciones para dirigir el correo:

- **Propietario de Cliente** (`Account_Name.Owner`) — si el KAM es el dueño
  de la cuenta (recomendado si así se trabaja la cartera).
- **Propietario de Cotización** (`Owner`) — si quien cotiza es el mismo KAM.
- Un campo nuevo "KAM" en Clientes, si el KAM no es ninguno de los dos.

## Plantilla (módulo Cotizaciones)

**Asunto:**

```
Cotización ${Cotizaciones.Número de Cotización} enviada a ${Cotizaciones.Nombre de Cliente}
```

**Cuerpo:**

```
Hola,

Te informamos que se envió la siguiente cotización a tu cliente:

- Cliente: ${Cotizaciones.Nombre de Cliente}
- Contacto: ${Cotizaciones.Nombre de Contacto}
- N° de Cotización: ${Cotizaciones.Número de Cotización}
- Asunto: ${Cotizaciones.Asunto}
- Oportunidad: ${Cotizaciones.Nombre de Oportunidad}
- Total: ${Cotizaciones.Moneda} ${Cotizaciones.Total general}
- Válida hasta: ${Cotizaciones.Válido hasta}
- Enviada por: ${Cotizaciones.Propietario de Cotización}

Te recomendamos hacer seguimiento con el cliente antes de la fecha de
vencimiento de la cotización.

Puedes revisar el detalle en el CRM aquí: ${Cotizaciones.URL del registro}

Saludos,
Equipo Comercial Emaresa
```

Los `${...}` son campos de combinación: al armar la plantilla en Zoho
(Configuración → Personalización → Plantillas → Correo electrónico →
Cotizaciones) se insertan con el botón **"Insertar campo de combinación"**
para que queden con el nombre interno correcto.
