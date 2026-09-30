# Propuesta: campo "Precio Unitario con Descuento" en Artículos presupuestados

## Pedido de Simón (2026-09-30)

En las líneas de producto de la Cotización ya existen "Precio de lista" y
"Descuento", pero no hay un campo que muestre el **precio unitario ya con el
descuento aplicado**.

## Cómo están hoy los campos (revisado en el CRM, módulo `Quoted_Items`)

| Campo | API | Qué es |
|---|---|---|
| Precio de lista | `List_Price` | precio de **1 unidad** |
| Cantidad | `Quantity` | unidades |
| Importe | `Total` | precio de lista × cantidad (total de la línea) |
| Descuento | `Discount` | monto en $ del descuento **de toda la línea**, no por unidad |
| % Descuento | `decimal` | fórmula ya creada: Descuento / Importe × 100 |

Ojo: como "Descuento" es el descuento de toda la línea, **no** sirve restar
Precio de lista − Descuento (daría mal cuando la cantidad es mayor a 1).

## Campo nuevo

- **Dónde:** subformulario "Artículos presupuestados" en el layout de
  Cotizaciones (igual que se hizo con "% Descuento").
- **Nombre:** `Precio Unitario con Descuento`
- **Tipo:** Fórmula, tipo de retorno **Moneda** (o Decimal), 2 posiciones
  decimales.
- **Fórmula:**

```
If(${Importe} > 0, ${Precio de lista} * (1 - ${Descuento} / ${Importe}), ${Precio de lista})
```

Se aplica al precio unitario el mismo % de descuento que tiene la línea.
Se usa el % (Descuento ÷ Importe) en vez de dividir por la cantidad para que
también funcione si en alguna línea el Importe incluye días u otro factor
(Rental). El `If` evita error de división cuando la línea no tiene importe.

### Ejemplo

Precio de lista 100.000 · Cantidad 3 · Importe 300.000 · Descuento 30.000
→ 100.000 × (1 − 30.000 / 300.000) = **90.000** por unidad.

## Notas

- No incluye el "% Desc Adicional" (campo aparte). Si se quiere que también
  lo descuente, multiplicar además por `(1 - ${% Desc Adicional} / 100)`.
- Como toda fórmula, en cotizaciones antiguas se calcula al volver a
  guardarlas.
- Recomendado probar primero en Sandbox y luego pasar a Producción.

## Estado

- 2026-09-30: propuesto. Pendiente que Simón lo cree (o dé OK para
  crearlo).
