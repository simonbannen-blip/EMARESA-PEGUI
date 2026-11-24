# Propuesta: aprobación de descuento Rental en 4 tramos

## Estado: PROPUESTA — falta OK de Simón y 2 datos (ver "Pendiente")

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

## Alternativa (no recomendada)

Pedir al proveedor un tercer porcentaje en la configuración del Cotizador y
una casilla nueva. Depende del proveedor y no aporta más que el campo
fórmula.

## Pendiente

1. ¿Aprobación directa por tramo, o escalonada (Jefe Zonal → Subgerente →
   Gerente)?
2. Usuarios: ¿quién es el Subgerente de Ventas y quién el Gerente de Unidad
   (¿el mismo Gerente Rental de hoy?)?
3. OK para crear el campo fórmula (cambio en el CRM real; primero Sandbox).
