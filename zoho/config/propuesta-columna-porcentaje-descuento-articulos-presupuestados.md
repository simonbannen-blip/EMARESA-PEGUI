# Propuesta: mostrar el % de descuento en "Artículos presupuestados"

## Pedido de Simón

En el listado de "Artículos presupuestados" (líneas de producto dentro de una
Cotización), solo se ve el descuento en pesos ($), no el %. Como consecuencia,
los vendedores están calculando el % a mano aparte, que es justo lo que se
quiere evitar.

## Cómo funciona hoy

El campo **Descuento** de esa grilla es un campo estándar de Zoho (no es un
campo nuestro custom) que acepta tanto un monto en pesos como un porcentaje:

- Si se escribe un monto (ej. `1176400`), Zoho lo deja tal cual.
- Si se escribe un porcentaje (ej. `20%`), **Zoho calcula solo** el monto en
  pesos a partir del precio de la línea, y guarda ese resultado.
- En cualquiera de los dos casos, al pasar el mouse sobre el ícono ⓘ que
  aparece al lado del monto, Zoho muestra el % que corresponde a ese
  descuento (aunque se haya escrito el monto directo).

Es decir: **ya existe una forma de evitar el cálculo manual** — si el
vendedor escribe el % directamente en el campo Descuento (en vez de calcular
el monto a mano y escribir el número), Zoho hace la conversión solo. El
único problema es que el % no se ve como columna fija, hay que pasar el
mouse por el ícono ⓘ para verlo.

## Opción para que el % se vea siempre, sin pasar el mouse

Se puede agregar una columna nueva de solo lectura, calculada
automáticamente, que muestre el % de descuento como número fijo en la
grilla (no editable — se calcula solo a partir del Descuento y el Importe
de la línea, así nadie la llena a mano ni se puede desincronizar del monto).

- **Módulo:** Artículos presupuestados (`Quoted_Items`)
- **Campo nuevo:** `% Descuento` (fórmula, tipo porcentaje), solo lectura
- **Cálculo:** `Descuento / Importe * 100`
- **Dónde se ve:** como columna nueva en la grilla de líneas dentro de la
  Cotización, junto a "Descuento(CLP)"

Con esto, el vendedor puede seguir escribiendo el monto o el % en
"Descuento" como hace hoy, y la columna nueva siempre va a mostrar el %
correcto sin que nadie tenga que calcularlo ni tipearlo a mano.

## Nota sobre el campo "% Desc Adicional" existente

Ya existe un campo `% Desc Adicional` en esa misma grilla, pero es un campo
distinto: un descuento adicional aparte del descuento principal, no el
equivalente en % del campo "Descuento". No sirve para lo que se pide acá.

## Estado

- **2026-08-04 — Hecho en Sandbox por Simón.** Creó el campo `% Descuento`
  (fórmula, tipo Decimal, 2 posiciones decimales) en el subformulario
  "Artículos presupuestados" dentro del layout de Cotizaciones, con la
  fórmula `Descuento / Importe * 100`. Probado en Sandbox: la columna
  nueva calcula solo el % (ej. 70.200 / 1.404.000 → 5, 36.720 / 367.200 →
  10), sin que nadie lo tipee a mano. **Funciona correctamente.**
- **Pendiente:** pasar el campo de Sandbox a Producción (falta el OK
  explícito de Simón para aplicarlo en el ambiente real, o que lo migre
  él mismo con la herramienta de Zoho de Sandbox → Producción).
- Nota: por ser un campo de fórmula, no se recalcula solo en Cotizaciones
  ya existentes — solo en líneas nuevas de acá en adelante (para las
  viejas habría que seleccionarlas y actualizarlas manualmente si se
  quisiera).
