# Guía — Recalcular precios USD al cambiar el dólar (Cotizaciones)

Reemplaza a `guia-sandbox-tasa-cambio-automatica-cotizaciones.md` (esta función
también sincroniza la Tasa de cambio de Zoho). Probar primero en Sandbox.

## Cómo funciona
- Se agrega un campo **"Tasa Usada en Precios"**: el dólar con el que están calculados los precios.
- Cuando alguien cambia **"Cotización de Moneda"** en el CRM, la función multiplica
  todos los montos de las líneas (precio de lista, descuento, IVA, subtotal, montos
  rental/seguro) y el descuento/ajuste general por `dólar viejo ÷ dólar nuevo`.
  El valor en pesos se mantiene; cambia el precio en USD.
  Ej. 4857: USD 41 con dólar 996,68 → al pasar a 1.044,08 queda USD 39,14.
- Si el guardado lo hace el Cotizador (usuario Infraestructura Emaresa), **no recalcula**
  (el Cotizador ya calculó con el dólar nuevo): solo anota el dólar.
- No toca cotizaciones Cerradas (Ganadas/Perdidas) ni cotizaciones en CLP.
- Siempre deja la Tasa de cambio de Zoho = 1 ÷ dólar, para que el total en CLP calce.
- Precios quedan con 2 decimales.

## Pasos
1. **Campo**: Configuración → Personalización → Módulos → Cotizaciones → Diseño Standard →
   arrastrar campo **Decimal**, nombre `Tasa Usada en Precios`, 2 decimales. Confirmar que
   el nombre API quede `Tasa_Usada_en_Precios` (si no, ajustar en el código).
   Puede ir oculto/solo lectura para los vendedores.
2. **Función**: Configuración → Automatización → Acciones → Funciones → Nueva →
   `SB Recalcular Precios USD Cotización`, categoría Automatización. Pegar
   `zoho/config/funciones/SBrecalcularPreciosUSDCotizacion.deluge`.
   Argumento `idCotizacion` = Cotizaciones → Id. de cotización.
3. **Regla de flujo**: Cotizaciones → Crear o editar (repetir en cada edición) →
   condición **Moneda no es CLP** → función del paso 2.
   (Si ya creaste la regla de la guía anterior, cambiarle la función por esta.)

## Pruebas en Sandbox
1. Cotización USD nueva desde el Cotizador → "Tasa Usada en Precios" se llena con el dólar; precios sin cambio.
2. Cambiar a mano "Cotización de Moneda" (ej. 996,68 → 1.044,08) y guardar → precios de lista,
   subtotales, IVA y total bajan ~4,5 %; Tasa de cambio = 0,000957781; total en CLP igual que antes.
3. Revisar que el **IVA por línea** quedó bien (Zoho podría recalcularlo solo) y que el
   **importe de la Oportunidad** se actualizó.
4. Revisar una cotización **Rental en USD** (montos de arriendo/seguro).
5. Volver a abrir la cotización en el Cotizador → confirmar que muestra los precios nuevos y no los pisa con los viejos.
6. Cotización en CLP y cotización Cerrada Ganada → no cambian.

## Riesgos / a conversar
- Cambia el precio que ya se le cotizó al cliente: si se envió el PDF, queda distinto.
- No vuelve a evaluar aprobaciones (descuento, precio mínimo). En pesos el precio es el mismo, así que en principio no debería cambiar el resultado.
- Si el Cotizador guarda con otro usuario que no sea "Infraestructura Emaresa", habría que ajustar la condición.
- Lo ideal sigue siendo que el Cotizador haga este recálculo; esto es una solución desde el CRM.
