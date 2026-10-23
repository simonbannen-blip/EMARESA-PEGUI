# Líneas de Crédito duplicadas (2026-10-23)

Criterio: mismo **Cliente + misma UN** con más de una Línea de Crédito
(módulo `Lineas_de_Credito_Cliente`). Se revisaron las 113.094 LC del CRM.

Listado completo: `lineas-credito-duplicadas-2026-10-23.csv`.

## Resumen

- **819 clientes** tienen la LC repetida en alguna UN.
- Suman **1.649 LC**, de las cuales **830 sobran** (habría que dejar 1 por cliente/UN).
- 808 casos son de 2 LC, 11 de 3 LC (ver CSV).
- Aparte: **32 LC sin cliente asociado** (22 Inamar Izaje, 8 Emaresa,
  2 Industria y Ferretería) — no son duplicados, son LC huérfanas.

| UN | Clientes con duplicado | LC involucradas | LC sobrantes |
|---|---:|---:|---:|
| Emaresa | 515 | 1.038 | 523 |
| Inamar Izaje | 196 | 394 | 198 |
| Rental | 64 | 128 | 64 |
| Industria y Ferretería | 22 | 45 | 23 |
| Maktotal | 16 | 32 | 16 |
| Inamar Vapor | 4 | 8 | 4 |
| Agroforestal y Jardines | 2 | 4 | 2 |
| **Total** | **819** | **1.649** | **830** |

## Pendiente

Definir con Simón qué LC se conserva en cada caso (ej. la más reciente,
la que tiene ID Creator vigente o la que tiene montos) antes de borrar
nada en el CRM. Ojo con el Cotizador (Creator): ver caso ENOTEC.
