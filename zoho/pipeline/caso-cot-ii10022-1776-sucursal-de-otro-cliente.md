# Caso COT-II10022-1776 — Cerrada Ganada sin Orden de Venta (2026-10-16)

Cotización: `20260731-COT-II10022-1776` (id 5404724000590676117), Inamar Izaje,
vendedor Fabián Rodriguez, cliente **NEOGEL S.A.**, OC 5118, $15.500.000 neto,
Oportunidad 260731-OP-II-10022-001646.

## Qué pasó (según el historial del registro)

- 31-07 — Se crea para **GELYMAR S.A.** y se aprueba (sobre 10 millones).
  Sucursal del Cliente = "CAMINO A PARGUA KM.25" (sucursal de GELYMAR).
- 09-10 10:58 — El Cotizador (Creator, vía API) cambia el cliente de
  GELYMAR a **NEOGEL S.A.** (y contacto, dirección de facturación, forma de
  pago). **La Sucursal del Cliente no se cambió**: sigue apuntando a la
  sucursal de GELYMAR.
- 16-10 09:04:44 — Fabián pasa "Confirmar Cotización Izaje" → Cerrada Ganada.
  Corre la función del Blueprint, pero **no se crea ninguna OV** y no queda
  error en la cotización (`Detalle de Log ERP` vacío).

## Causa

Cliente y sucursal no coinciden:

| | Cliente de la cotización | Sucursal del Cliente en la cotización |
|---|---|---|
| Registro | NEOGEL S.A. (id …47926051) | CAMINO A PARGUA KM.25 (id …86851916) |
| Pertenece a | — | **GELYMAR S.A.** (id …44803148, código ERP 966090405[4255]) |

Al crear la OV para NEOGEL con una sucursal de GELYMAR, el ERP/la función no
puede crearla y no deja registro del error. El resto está correcto: el
contacto (Elias Troncoso) y la Oportunidad ya están con NEOGEL, y la forma de
pago vacía no es el problema (otras cotizaciones Izaje sin forma de pago, ej.
2595, 2604, 2620, sí generaron OV).

Sucursales que sí son de NEOGEL:

- **MATRIZ- - UN: (210)** — id 5404724000080883710, código 968212303[1],
  sincronizada con el ERP (id ERP 24098), dirección CAMINO A PARGUA KM 25,
  CALBUCO. ← recomendada
- CAMINO A PARGUA KM 25, CALBUCO — id 5404724000087379676, código
  968212303[6286], sin registro de sincronización con el ERP.

## Propuesta (pendiente OK de Simón)

1. Cambiar la Sucursal del Cliente de la cotización a **MATRIZ- - UN: (210)**
   (la cotización está bloqueada; se puede hacer por API).
2. Volver a generar la OV con la función "SB Convertir Orden de Venta x Linea
   Negocio" (Configuración → Funciones → Ejecutar con el id de la cotización).
   **No usar el botón Convertir** (ver caso 1741).
3. Prevenir: cuando el Cotizador cambia el cliente de una cotización, que
   limpie o reemplace la Sucursal del Cliente; y que la función registre el
   error en `Detalle de Log ERP` cuando la OV no se pueda crear (mismo pedido
   que en los casos 1741 y 2598).
