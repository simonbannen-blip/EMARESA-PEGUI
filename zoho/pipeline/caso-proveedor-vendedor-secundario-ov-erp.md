# Solicitud a proveedor: enviar "Código de Vendedor Secundario" de la Orden de venta al ERP

## Contexto

En Construcción, muchas cotizaciones las crea un vendedor (Propietario)
pero las **termina otro vendedor**, el **vendedor secundario**. Emaresa
necesita que el **código** de ese segundo vendedor llegue al ERP junto
con la Orden de venta.

Ya se implementó y probó en Zoho CRM (Sandbox). Todas las pruebas
salieron bien. Falta que la integración que arma el **JSON de Órdenes de
venta hacia el ERP** incluya este campo nuevo.

## Campo nuevo en Zoho CRM

| Dato | Valor |
|---|---|
| Módulo | Órdenes de venta (`Sales_Orders`) |
| Etiqueta | Código de Vendedor Secundario |
| Nombre de API | `C_digo_de_Vendedor_Secundario` |
| Tipo | Texto (línea única) |
| Contenido | Solo el **código** del vendedor (ej. `289`), nunca el nombre |
| ¿Puede venir vacío? | **Sí**. Solo se llena cuando hay vendedor secundario (hoy solo aplica a Construcción) |
| Quién lo llena | Automático (función del CRM). El usuario no lo edita |

Referencia: el código del vendedor principal ya viaja hoy en el campo
**Código del Vendedor** (`C_digo_del_Vendedor`). El nuevo campo es
equivalente, para el segundo vendedor.

## Cómo se llena (flujo probado)

1. En la **Cotización**, el vendedor elige el "Vendedor Secundario" en una
   lista (formato `Nombre Apellido - código`). Si la Cotización viene de
   una Oportunidad que ya tiene vendedor secundario, se completa sola.
2. El CRM llena automáticamente el **Código de Vendedor Secundario** de
   la Cotización con el código (lo que va después del guion).
3. Al crear la **Orden de venta** desde la Cotización, una regla copia ese
   código al campo `C_digo_de_Vendedor_Secundario` de la Orden de venta.

## Caso de éxito (pruebas en Sandbox, 25-09-2026)

| # | Prueba | Resultado |
|---|---|---|
| 1 | Cotización: el vendedor elige "Cristian Silva - 289" en la lista | Código de Vendedor Secundario = **289** ✅ |
| 2 | Cotización generada desde Oportunidad con vendedor secundario Cristian Silva | Lista = "Cristian Silva - 289", código = **289** ✅ |
| 3 | Conversión de la Cotización a Orden de venta | OV con `C_digo_de_Vendedor_Secundario` = **289** ✅ |
| 4 | Cotización con aprobación (flujo Creator) | Vendedor secundario y código se mantienen ✅ |

## Qué pedimos al proveedor

1. Agregar al **JSON de Órdenes de venta que se envía al ERP** el valor
   del campo `C_digo_de_Vendedor_Secundario` de la Orden de venta.
2. Indicarnos el **nombre de la clave** en el JSON y el **campo del ERP**
   donde queda registrado (equivalente a como hoy se envía el Código del
   Vendedor principal).
3. Cuando el campo venga **vacío**, enviarlo vacío/nulo sin que falle la
   integración ni la creación del pedido en el ERP.
4. Probarlo primero en ambiente de pruebas con una Orden de venta que
   tenga código secundario y otra sin él.

Ejemplo referencial (la clave final la define el proveedor):

```json
{
  "codigoVendedor": "130",
  "codigoVendedorSecundario": "289"
}
```

## Contacto / estado

- Implementación en CRM: lista en Sandbox; se pasa a Producción con el
  mismo nombre de API (`C_digo_de_Vendedor_Secundario`).
- Responsable CRM: Simón Tirapegui (CRM Specialist Zoho, Emaresa).
