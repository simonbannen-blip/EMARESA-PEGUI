# Propuesta: campo "Plazo Completo" en Artículos presupuestados (Cotizaciones)

**Fecha:** 2026-10-08 · **Estado:** OK de Simón; pendiente de crear (en la sesión el permiso para crear el campo por API quedó bloqueado, se le dio el paso a paso)

## Problema
En la plantilla de cotización (Zoho Writer), bajo "Plazo de entrega", se
necesitan los campos `Plazo` (texto, ej. "2") y `Unidad` (texto, ej. "Día")
del subformulario **Artículos presupuestados** (`Quoted_Items`). Al poner los
dos campos juntos en una región de repetición, Writer dejaba el segundo
"sin asignar" (en rojo).

## Solución
Crear un único campo fórmula en el subformulario que una ambos valores, para
insertar un solo campo en Writer.

- Módulo: Cotizaciones → subformulario Artículos presupuestados
- Etiqueta: **Plazo Completo**
- Tipo: Fórmula, retorno **Texto**
- Expresión: `Concat(${Artículos presupuestados.Plazo},' ',${Artículos presupuestados.Unidad})`
- Resultado esperado: "2 Día", "6 Semana"

Nota: en cotizaciones antiguas la fórmula se calcula al volver a guardarlas
(igual que con "Precio Unitario con Descuento").
