# Propuesta: campo "Segmento del Cliente" en Oportunidades

## Estado: PROPUESTO — pendiente de OK del usuario para aplicar

## Por qué

El informe de Oportunidades (filtrado por UN = Inamar Izaje) necesita mostrar
el Segmento del Cliente. Ese dato vive en el módulo Clientes
(`Accounts.Sector_del_Cliente`), no en Oportunidades, así que el informe
—armado con Oportunidades como módulo principal— no puede traerlo
directamente como columna.

## Solución propuesta

Crear un campo nuevo en **Oportunidades (Deals)** que traiga automáticamente
el Segmento del Cliente de la Cuenta asociada a cada Oportunidad.

| | |
|---|---|
| Módulo | Deals (Oportunidades) |
| Etiqueta del campo | Segmento del Cliente |
| api_name propuesto | `Segmento_del_Cliente` |
| Tipo | Fórmula (formula) |
| Qué hace | Trae el valor de `Sector_del_Cliente` desde la Cuenta
  vinculada a la Oportunidad (vía el campo `Account_Name`) |
| Se actualiza | Solo, automáticamente — no requiere mantenimiento manual |

Payload aproximado para la API de Zoho (`createFields`, módulo `Deals`):

```json
{
  "field_label": "Segmento del Cliente",
  "data_type": "formula",
  "formula": {
    "return_type": "string",
    "expression": "Account_Name.Sector_del_Cliente"
  }
}
```

## Efecto en el informe

Una vez creado, "Segmento del Cliente" va a aparecer como columna
disponible al armar el informe de Oportunidades (módulo principal
Oportunidades), sin necesidad de agregar Clientes como módulo secundario.

## Nota

El campo `Sector_del_Cliente` en Clientes está vacío en más del 97% de los
~477 registros de cuentas (dato ya confirmado). El campo fórmula va a
reflejar eso — mostrará vacío para la mayoría de las Oportunidades hasta
que se complete ese dato en las Cuentas correspondientes.

## Próximo paso

Esperando confirmación explícita del usuario para crear el campo vía la
API de Zoho CRM.
