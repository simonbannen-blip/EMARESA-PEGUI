# Checklist de pruebas — Clonar Cerrada Ganada (Sandbox, Paso 1)

Fecha: 2026-11-19. Botón de prueba "Clonar Cotización (prueba)" (widget) +
regla "Clon - Crear oportunidad nueva". Ver
`zoho/config/widgets/clonar-cotizacion-prueba/LEEME.md` y
`zoho/pipeline/guia-sandbox-clonar-cerrada-ganada.md`.

## A. Botón y disclaimer
| # | Prueba | Esperado | Resultado |
|---|---|---|---|
| 1 | Cerrada Ganada → botón de prueba | Disclaimer con Sí/No | ✅ 19-11 (COT-CONST-999999-0164) |
| 2 | Cancelar | Se cierra, no pasa nada | |
| 3 | Sí, continuar | Cotizador en pestaña nueva, modo clonar | |
| 4 | Enviada → botón de prueba | "Continuar al Cotizador" (sin disclaimer) | |
| 5 | Pendiente de Aprobación → botón de prueba | "No se permite clonar" | |
| 6 | Sin ID Creator (Vapor/MIV) | "No se hizo en el Cotizador" | |
| 7 | Usuario no Administrador | No ve el botón | |

## B. Ganada → mismo cliente (regla activa)
| # | Prueba | Esperado | Resultado |
|---|---|---|---|
| 8 | Clonar, mismo cliente, cambio menor | Clon en Creada | |
| 9 | Oportunidad del clon | Nueva, Creada, cierre +30 días | |
| 10 | Notas del clon | "Oportunidad nueva por clonación" | |
| 11 | Original | Sigue Cerrada Ganada | |
| 12 | Oportunidad de la original | Sigue ganada, mismo monto | |
| 13 | Nombre opp nueva | Anotar (si "CLON COT-…", avisar) | |

## C. Aprobación (Rental / Inamar Izaje, no Construcción)
| # | Prueba | Esperado | Resultado |
|---|---|---|---|
| 14 | Clonar Ganada Rental | Pendiente de Aprobación | |
| 15 | Aprobador | Recibe solicitud | |
| 16 | Aprobar | Cotización Aprobada | |
| 17 | Clonar Ganada Izaje > 10 MM o descuento alto | Pendiente de Aprobación | |

## D. Ganada → otro cliente
| # | Prueba | Esperado | Resultado |
|---|---|---|---|
| 18 | Cliente con datos completos | Clon con cliente nuevo | |
| 19 | Oportunidad del clon | Nueva, del cliente nuevo | |
| 20 | Cliente sin contacto/sucursal | Cotizador no deja guardar (anotar mensaje) | |
| 21 | Original y su oportunidad | Sin cambios | |

## E. No romper lo actual
| # | Prueba | Esperado | Resultado |
|---|---|---|---|
| 22 | Botón original en Enviada | Igual que siempre | |
| 23 | Clonar Enviada con botón de prueba | No crea oportunidad nueva | |
| 24 | Cotización nueva normal | Sin oportunidad extra | |

Anotar por prueba: N° original, N° clon, fase del clon, nombre de la oportunidad.
