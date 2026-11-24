# Propuesta: aprobación de descuento Rental en 4 tramos

## Estado: PROPUESTA — Simón confirmó tramos (6-10 Jefe Zonal, 11-15
Subgerente, 16+ Gerente Unidad) y prefiere hacer el corte en el Cotizador
(opción B). Falta el código del Cotizador y los nombres de aprobadores.

## Qué se pidió (correo, 24-11-2026)

| Descuento | Quién aprueba |
|---|---|
| 0 – 5% | Vendedor (sin aprobación) |
| 5 – 10% | Jefe Zonal |
| 11 – 15% | Subgerente de Ventas |
| 16% en adelante | Gerente de Unidad |

Cortes exactos que se usarán (sin huecos entre 10 y 11 ni entre 15 y 16):

| Tramo | Regla exacta |
|---|---|
| Vendedor | descuento ≤ 5% |
| Jefe Zonal | más de 5% y hasta 10% (10% exacto = Jefe Zonal) |
| Subgerente Ventas | más de 10% y hasta 15% (15% exacto = Subgerente) |
| Gerente Unidad | más de 15% |

## Cómo funciona hoy

- El Cotizador (Creator) tiene una configuración "Requiere Aprobación de
  Descuento" (UN Rental) con 2 cortes: **5%** y **15%**. Con eso marca 2
  casillas en la cotización del CRM:
  - `Aprobación Descuento` → descuento > 5%
  - `Rental - superó Porcentaje Descuento` → descuento > 15%
- El proceso de aprobación "UN Rental - Arriendo" usa esas casillas:
  reglas por zona (>5% y ≤15%) → Jefe Zonal; regla >15% → Gerente Rental.
- **Falta el corte del 10%**: el Cotizador no tiene un tercer porcentaje.

## Verificado con datos reales (60 COT-REN de noviembre)

El % que usa el Cotizador es **descuento total de la cotización**:
`Descuento Total de Productos ÷ Subtotal sin descuento`. Calza en todos
los casos revisados:

| Cotización | % real | Aprobación Desc. | Superó 15% |
|---|---|---|---|
| COT-REN-6927 | 5,0% | No | No |
| COT-REN-6931 | 4,6% | No | No |
| COT-REN-6895 | 7,4% | Sí | No |
| COT-REN-6909 | 10,0% | Sí | No |
| COT-REN-6926 | 12,8% | Sí | No |
| COT-REN-6934 | 15,0% | Sí | No |
| COT-REN-6893 | 18,1% | Sí | Sí |

## Propuesta (todo en el CRM, sin tocar el Cotizador)

### 1. Campo nuevo en Cotizaciones

- Nombre: **% Descuento Cotización** (fórmula, decimal, 2 decimales)
- Fórmula:
  `If(${Cotizaciones.Subtotal sin descuento} > 0, ${Cotizaciones.Descuento Total de Productos} / ${Cotizaciones.Subtotal sin descuento} * 100, 0)`
- Sirve para el corte del 10% y además deja visible el % en cada
  cotización (y en vistas/informes).

### 2. Proceso de aprobación "UN Rental - Arriendo"

Las casillas del Cotizador se mantienen como puerta de entrada (>5% y >15%);
el campo nuevo solo separa 10%.

| Regla | Criterios (además de UN=Rental, Fase=Pendiente de Aprobación, Tipo de Negocio=Arriendo) | Aprobador |
|---|---|---|
| 1 Norte | Aprobación Descuento = Sí · Superó = No · % Descuento Cotización ≤ 10 · Zona Norte | Jefe Zonal Norte |
| 2 Centro | ídem · Zona Centro | Jefe Zonal Centro |
| 3 Sur | ídem · Zona Sur | Jefe Zonal Sur |
| 4 Subgerente (nueva) | Aprobación Descuento = Sí · Superó = No · % Descuento Cotización > 10 | Subgerente de Ventas (*) |
| 5 Gerente | Superó = Sí | Gerente de Unidad (*) |

(*) Si se quiere escalamiento (que pase primero por el Jefe Zonal y luego
sube), las reglas 4 y 5 se separan por zona con aprobadores en secuencia,
igual que en `propuesta-aprobacion-rental-jefe-zona-antes-gerente.md`.

### 3. Correos de aviso

Revisar las reglas de notificación "Notificar jefe zona … Rental" y
"Notificar Gerente Rental": agregar el corte ≤10 / >10 y crear una para el
Subgerente.

## Opción B (elegida por Simón): hacer el corte del 10% en el Cotizador

Lo que hay que hacer:

1. **Creator – configuración "Requiere Aprobación de Descuento"**: agregar
   un campo nuevo al formulario de configuración, p.ej. "Porcentaje
   Descuento Subgerente" = 10 (los otros quedan: inicial 5, tope 15).
2. **CRM – Cotizaciones**: casilla nueva "Rental - superó 10% Descuento"
   (`Rental_super_10_Descuento`), en la sección "Ocultar" como las otras.
3. **Creator – código** que hoy marca `Rental_super_Porcentaje_Descuento`:
   agregar al lado la misma lógica con el nuevo % y mandar la casilla nueva
   al CRM. Falta ver ese código (Simón lo busca).
4. **CRM – proceso "UN Rental - Arriendo"**: igual que la tabla de arriba,
   pero usando la casilla nueva en vez del campo fórmula:
   Jefe Zonal = Aprobación Sí · superó 10% No; Subgerente = superó 10% Sí ·
   superó 15% No; Gerente Unidad = superó 15% Sí.

El proceso de aprobación vive en el CRM: se ajusta igual en ambas opciones.

## Definiciones confirmadas por Simón (24-11-2026)

- **Cada tramo aprueba solo** (sin escalamiento).
- Aprobadores (usuarios CRM):

| Tramo | Aprobador | Usuario CRM |
|---|---|---|
| 6–10% Norte | Jaime Zúñiga | jzuniga@emaresa.cl (5404724000491824023) |
| 6–10% Centro | Jaime Rojas Pérez | jrojas@emaresa.cl (5404724000491808001) |
| 6–10% Sur | Eduardo Roldán | eroldan@emaresa.cl (5404724000491822001) |
| 11–15% | **Mauricio Correa** (Subgerente) | mcorrea@emaresa.cl (5404724000568634001) — rol en CRM hoy: "Coordinador Rental" |
| 16%+ | **Andrés Salah** (Gerente Unidad) | asalah@emaresa.cl (5404724000500223001) — rol "Gerente Rental" |

(Jefes zonales a confirmar: son los usuarios con rol "Jefe Ventas Zona …".)

## Correos de aviso (reglas de flujo en Cotizaciones)

Uno por tramo, al mismo que aprueba:

| Regla | Condición clave | Para |
|---|---|---|
| Notificar jefe zona Norte/Centro/Sur Rental (existen) | agregar: superó 10% = **No** | Jefe Zonal de la zona |
| **Notificar Subgerente Rental (nueva)** | Aprobación Descuento = Sí · superó 10% = Sí · superó 15% = No | Mauricio Correa |
| Notificar Gerente Rental (existe) | superó 15% = **Sí** (revisar: en agosto tenía "No seleccionado" por error) | Andrés Salah |

## Pendiente

1. Ubicar el código del Cotizador que marca `Rental_super_Porcentaje_Descuento`
   (Simón no lo encuentra → correo al proveedor:
   `mail-proveedor-corte-10-descuento-rental.md`).
2. OK de Simón para los cambios en el CRM (casilla nueva, reglas del
   proceso, correos). Primero Sandbox.
