# Solicitud a proveedor: enviar "Ámbito" (UN Rental) en el JSON hacia el ERP

## Estado: BORRADOR para enviar al proveedor de la integración ERP

## Texto para enviar

Estimados, junto con saludar, les solicitamos incluir en el JSON que se
envía al ERP desde la Cotización un nuevo campo llamado **"Ámbito"**,
aplicable solo a la UN Rental. Es una lista desplegable con los valores
AGROINDUSTRIA, MINERIA, CONSTRUCCION, EVENTOS, FORESTAL, RENTAL,
INDUSTRIAL, ENERGIA y LOGISTICA, y en las demás UN vendrá vacío, por lo que
agradeceríamos que en ese caso se envíe nulo sin afectar la integración.
Les pedimos además indicarnos el nombre de la clave en el JSON y el campo
del ERP donde quedará registrado, y probarlo primero en ambiente de
pruebas. Quedamos atentos a sus comentarios y plazo estimado. Saludos,
Simón – CRM Specialist Zoho, Emaresa.

## Notas internas (no enviar)

- El JSON hacia el ERP se arma desde **Cotizaciones** (corrección de
  Simón), no desde Órdenes de venta. El campo "Ámbito" ya existe en
  Cotizaciones en Sandbox (regla "Ámbito Rental" lo copia desde la
  Oportunidad).
- Confirmar el nombre de API real al pasarlo a Producción (Zoho suele
  quitar la tilde; probablemente `mbito`).
- Ver también `zoho/config/propuesta-campo-ambito-en-cotizaciones.md` y
  `zoho/pipeline/propuesta-flujo-ambito-oportunidad-a-cotizacion.md`.
