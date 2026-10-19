# Ticket a proveedor: habilitar siempre la opción "Crédito Simple" como forma de pago

## Estado: BORRADOR para enviar al proveedor (Cotizador / Creator)

## Texto para enviar

**Asunto:** Habilitar opción "Crédito Simple" como forma de pago para todos los clientes

Estimados, junto con saludar:

Les solicitamos habilitar la opción **"Crédito Simple"** en la selección de
forma de pago, de modo que esté **siempre disponible** para los vendedores,
independiente de si el cliente tiene o no una línea de Crédito Simple
asignada.

**Situación actual:** hoy la opción "Crédito Simple" solo aparece cuando el
cliente tiene esa condición de pago en su Línea de Crédito. Cuando no la
tiene, el vendedor no puede seleccionarla y el flujo queda detenido, sin
poder completar la cotización y su paso a orden de venta.

**Motivo del cambio:** estos casos los revisa y administra una persona
encargada en **KARVE**, quien valida la condición de crédito de cada
cliente. Por lo tanto, no es necesario bloquear la selección en el CRM;
hacerlo solo retrasa el proceso comercial.

**Lo que necesitamos:**

1. Que "Crédito Simple" se pueda seleccionar siempre como forma de pago,
   para cualquier cliente.
2. Que, al seleccionarla, el flujo se pueda completar de punta a punta
   (cotización → orden de venta → envío al ERP) sin errores ni bloqueos.
3. Que las demás formas de pago sigan funcionando igual que hoy.
4. Probarlo primero en ambiente de pruebas (Sandbox) y avisarnos para
   validarlo antes de pasarlo a Producción.

**Resultado esperado:** dar agilidad al proceso comercial, dejando la
validación del crédito en manos del encargado en KARVE.

Quedamos atentos a sus comentarios y al plazo estimado para este cambio.

Saludos,
Simón – CRM Specialist Zoho, Emaresa

## Notas internas (no enviar)

- La regla que restringe las formas de pago según la Línea de Crédito no
  está en el CRM (no se encontró en Línea de Crédito Cliente, Cotizaciones
  ni Formas_de_Pago); vive del lado del proveedor (Cotizador / Creator).
- Relacionado: `zoho/config/propuesta-regla-efectivo-credito-simple.md`
  (pedido anterior de permitir Efectivo + Crédito Simple, ej. Inamar
  Izaje). Este ticket lo amplía: Crédito Simple disponible para todos.
- Valor en el CRM: `Crédito Simple` del campo "Forma de Pago"
  (`Condicion_de_Pago`) en Cotizaciones y Línea de Crédito Cliente.
