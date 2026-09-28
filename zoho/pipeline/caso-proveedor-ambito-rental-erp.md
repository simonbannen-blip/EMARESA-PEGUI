# Solicitud a proveedor: enviar "Ámbito" (UN Rental) en el JSON hacia el ERP

## Estado: BORRADOR para enviar al proveedor de la integración ERP

## Texto para enviar

**Asunto:** Solicitud – Incluir nuevo campo "Ámbito" (UN Rental) en el JSON de Órdenes de venta hacia el ERP

Estimados, buen día:

Les escribimos para solicitar un ajuste en la integración entre Zoho CRM y
el ERP.

Para la **Unidad de Negocio Rental** creamos en el CRM un campo nuevo
llamado **"Ámbito"**, que indica el sector o industria al que corresponde
cada negocio. Necesitamos que este dato viaje al ERP junto con la Orden de
venta.

**Detalle del campo:**

| Dato | Valor |
|---|---|
| Etiqueta | Ámbito |
| Módulo de origen | Órdenes de venta (el valor viene desde la Oportunidad → Cotización) |
| Nombre de API | *(por confirmar al pasarlo a Producción)* |
| Tipo | Lista desplegable (un solo valor) |
| Valores posibles | AGROINDUSTRIA, MINERIA, CONSTRUCCION, EVENTOS, FORESTAL, RENTAL, INDUSTRIAL, ENERGIA, LOGISTICA |
| Aplica a | Solo UN Rental |
| ¿Puede venir vacío? | Sí — en las demás UN no se llena |

**Lo que les pedimos:**

1. Agregar el valor del campo **"Ámbito"** al **JSON de Órdenes de venta
   que se envía al ERP**.
2. Indicarnos el **nombre de la clave** en el JSON y el **campo del ERP**
   donde quedará registrado.
3. Cuando el campo venga **vacío** (otras UN), enviarlo vacío/nulo sin que
   falle la integración ni la creación del pedido en el ERP.
4. Probarlo primero en ambiente de pruebas con una Orden de venta de
   Rental que tenga Ámbito y otra de otra UN sin él.

Ejemplo referencial (la clave final la definen ustedes):

```json
{
  "unidadNegocio": "Rental",
  "ambito": "MINERIA"
}
```

Quedamos atentos a sus comentarios y a una estimación de plazo.

Saludos,
Simón
CRM Specialist Zoho – Emaresa

## Notas internas (no enviar)

- Hoy el campo "Ámbito" existe en **Sandbox** en Oportunidades y
  Cotizaciones (regla "Ámbito Rental" copia el valor). Para que llegue al
  ERP también tiene que existir en **Órdenes de venta** y la función "SB
  Crear Orden de Venta" (o una regla) debe copiarlo desde la Cotización.
- Completar el nombre de API real antes de enviar (Zoho suele quitar la
  tilde; probablemente quede como `mbito`).
- Ver también `zoho/config/propuesta-campo-ambito-en-cotizaciones.md` y
  `zoho/pipeline/propuesta-flujo-ambito-oportunidad-a-cotizacion.md`.
