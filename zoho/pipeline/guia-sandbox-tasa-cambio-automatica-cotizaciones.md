# Guía — Tasa de cambio automática en Cotizaciones (USD)

Objetivo: cada vez que el Cotizador guarde una cotización con un dólar nuevo
("Cotización de Moneda"), el CRM actualiza solo la "Tasa de cambio" de Zoho, y
el total en pesos se recalcula. El total en USD no cambia; cambia su valor en CLP.

Probar primero en Sandbox.

## 1. Crear la función
Configuración → Automatización → Acciones → Funciones → Nueva función
- Nombre: `SB Actualizar Tasa de Cambio Cotización` — Categoría: Automatización
- Pegar el código de `zoho/config/funciones/SBactualizarTasaCambioCotizacion.deluge`
- Argumento: `idCotizacion` → Cotizaciones → Id. de cotización
- Guardar.

## 2. Crear la regla de flujo
Configuración → Automatización → Reglas de flujo de trabajo → Crear regla
- Módulo: Cotizaciones — Nombre: `SB Sincronizar tasa de cambio`
- Cuándo: Acción de registro → **Crear o editar**, marcar "repetir en cada edición"
- Condición: **Moneda no es CLP**
- Acción inmediata: Función → `SB Actualizar Tasa de Cambio Cotización`
- Guardar.

Las ediciones que hace el Cotizador por API sí disparan reglas de flujo (ya se ve en
el historial: "SB Guardar importe de la cotización" corre en cada guardado).

## 3. Probar
1. Abrir/editar una cotización en USD desde el Cotizador (con un dólar distinto al del día que se creó).
2. Verificar en la ficha: Tasa de cambio = 1 ÷ Cotización de Moneda (ej. 1.044,08 → 0,000957781).
3. Verificar que el total en CLP (vista en moneda base / informes) = Total USD × Cotización de Moneda.
4. Editar una cotización en CLP → no debe cambiar nada.

## 4. Pendiente aparte
- Las 17 cotizaciones ya desfasadas no se arreglan solas (la regla corre al próximo guardado).
  Se pueden corregir de una vez por API con OK de Simón.
- Confirmar si "SB Validar Importe Oportunidad" toma el monto en CLP: si corre antes que esta
  regla en el mismo guardado, podría usar la tasa vieja. Revisar en la prueba del paso 3.
- Solución de fondo igual recomendada: que el Cotizador mande `Exchange_Rate` en cada guardado.
