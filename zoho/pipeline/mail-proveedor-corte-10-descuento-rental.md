# Correo al proveedor del Cotizador — nuevo corte 10% descuento Rental

**Asunto:** Cotizador Rental – agregar tramo de aprobación de descuento al 10%

Hola,

Necesitamos un cambio en el Cotizador (app `cotizador`, formulario
Generar Cotizaciones) para la UN Rental.

**Hoy:** la configuración "Funcionalidades Cotizador = Requiere Aprobación
de Descuento" (UN Rental) tiene Porcentaje Descuento inicial = 5 y
Porcentaje Descuento = 15. Con eso el Cotizador marca en la cotización del
CRM:
- `Aprobaci_n_Descuento` = true cuando el descuento total supera el 5%
- `Rental_super_Porcentaje_Descuento` = true cuando supera el 15%

**Lo que necesitamos:**
1. En esa configuración, un campo nuevo "Porcentaje Descuento Subgerente"
   con valor **10**.
2. En el código que hoy calcula y envía `Rental_super_Porcentaje_Descuento`
   al CRM, agregar la misma lógica con el nuevo porcentaje y enviar el
   campo nuevo del CRM **`Rental_super_10_Descuento`** (casilla) = true
   cuando el descuento total supere el 10%.
   (Mismo cálculo que ya usan: Descuento Total de Productos ÷ Subtotal sin
   descuento; 10% exacto NO cruza, igual que hoy con 5% y 15%.)
3. Que aplique también al editar/clonar una cotización, igual que las
   otras dos casillas.

Por favor indíquennos además en qué workflow o función está ese cálculo,
para tenerlo documentado.

Nosotros creamos la casilla en el CRM y ajustamos el proceso de aprobación.

Gracias,
Simón
