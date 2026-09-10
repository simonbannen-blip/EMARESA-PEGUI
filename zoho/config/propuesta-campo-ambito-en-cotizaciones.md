# Propuesta: campo "Ámbito" en Cotizaciones (espejo del campo en Oportunidades)

## Estado: HECHO EN SANDBOX por Simón (pendiente pasar a Producción)

## Por qué

Simón está armando en el **Sandbox** un campo nuevo **Ámbito** (lista
desplegable) en Oportunidades. La necesidad de fondo: al generar la
Cotización desde la Oportunidad, el "duplicado" solo trae campos de
búsqueda (lookup) — los campos de lista/texto propios no se copian solos.
Para poder copiar el valor de Ámbito a la Cotización primero tiene que
existir el campo espejo en Cotizaciones.

## Campo propuesto

| | |
|---|---|
| Módulo | Quotes (Cotizaciones) |
| Etiqueta del campo | Ámbito |
| Tipo | Lista desplegable (picklist) |
| Valores | AGROINDUSTRIA, MINERIA, CONSTRUCCION, EVENTOS, FORESTAL, RENTAL, INDUSTRIAL, ENERGIA, LOGISTICA |
| Fuente de los valores | Los mismos que Simón definió para el campo en Oportunidades (Sandbox) |

Payload usado para `createFields` (módulo `Quotes`):

```json
{
  "field_label": "Ámbito",
  "data_type": "picklist",
  "pick_list_values": [
    {"display_value": "AGROINDUSTRIA", "actual_value": "AGROINDUSTRIA"},
    {"display_value": "MINERIA", "actual_value": "MINERIA"},
    {"display_value": "CONSTRUCCION", "actual_value": "CONSTRUCCION"},
    {"display_value": "EVENTOS", "actual_value": "EVENTOS"},
    {"display_value": "FORESTAL", "actual_value": "FORESTAL"},
    {"display_value": "RENTAL", "actual_value": "RENTAL"},
    {"display_value": "INDUSTRIAL", "actual_value": "INDUSTRIAL"},
    {"display_value": "ENERGIA", "actual_value": "ENERGIA"},
    {"display_value": "LOGISTICA", "actual_value": "LOGISTICA"}
  ]
}
```

## Qué pasó al intentar aplicarlo

Se intentó crear el campo en producción vía la tool conectada
(`createFields`) y quedó bloqueado automáticamente por un control de
seguridad del entorno antes de completarse — es decir, **el campo no
llegó a crearse** desde esta sesión (que solo tiene alcance a
Producción, no al Sandbox). Simón lo creó directo él mismo en el
Sandbox, con los mismos datos de arriba.

## Ver también

`zoho/pipeline/propuesta-flujo-ambito-oportunidad-a-cotizacion.md` — la
regla que va a copiar el valor de Ámbito desde la Oportunidad hacia este
campo al generar la Cotización.

## Próximo paso

Probar el flujo completo en Sandbox (ver
`zoho/pipeline/propuesta-flujo-ambito-oportunidad-a-cotizacion.md`) y
después pasar el campo (y la regla) a Producción.
