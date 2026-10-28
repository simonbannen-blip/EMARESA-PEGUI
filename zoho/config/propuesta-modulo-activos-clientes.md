# Propuesta — Módulo nuevo "Activos de Clientes" (Assets)

**Estado:** propuesta, pendiente de OK de Simón. No se ha tocado el CRM.
**Fecha:** 2026-10-28

## Objetivo

Registrar los equipos que cada cliente ya tiene instalados (comprados a
Emaresa o de terceros) — p. ej. un **puente grúa** — para:

- saber qué equipos tiene cada cliente, dónde están y desde cuándo;
- hacer seguimiento de **mantenciones** (preventivas, correctivas,
  certificaciones) y avisar antes de la próxima;
- generar oportunidades de venta (mantención, repuestos, renovación).

## Qué hay hoy en el CRM (revisado 28-10)

- **No existe** un módulo de Activos/Assets.
- Los productos sí existen en `Products`, p. ej.:
  - `ABUS-00012500` SET PUENTE GRUA ELK 5 TON X 12500 MM
  - `ABUS-000ELK10` SET PUENTE GRUA ELK 10 TON X 10000 MM
  - `ABUS-000VS355` GRUA PLUMA DE PILAR ABUS S 355 2 TON
  - (el campo `Categoría de producto` está vacío en estos productos)
- Existe `Equipos_Rental` (línea Rental) — el MCP no tiene permiso para
  verlo. Hay que confirmar si se cruza con esto (ver pregunta 3).
- El MCP de Zoho **no puede crear módulos**: el módulo lo crea Simón desde
  Configuración; después los campos sí los puedo crear yo por API.

## Decisión previa: ¿CRM o Zoho FSM?

Emaresa tiene **Zoho One**, que incluye **Zoho FSM** (Field Service), que
trae de fábrica: Activos, planes de mantención, órdenes de trabajo,
agenda de técnicos y app móvil, y se sincroniza con el CRM.

| Si el objetivo es… | Conviene |
|---|---|
| Que vendedores/KAM vean la base instalada del cliente y reciban avisos de mantención para venderla | **Módulo en CRM** (esta propuesta) |
| Que el equipo técnico agende y ejecute las mantenciones en terreno (órdenes de trabajo, informes, firma del cliente) | **Zoho FSM** |

Recomendación: partir con el módulo en CRM (simple, rápido, lo usan los
mismos usuarios de hoy). Si después el servicio técnico necesita órdenes de
trabajo, se evalúa FSM.

## Diseño propuesto

### Módulo 1: **Activos de Clientes** (singular "Activo")

| Campo | Tipo | Notas |
|---|---|---|
| Nombre del Activo | Texto (campo nombre) | Ej: "Puente Grúa 5T – Planta Quilicura" |
| Cliente | Búsqueda → Clientes | Obligatorio. Aparece como lista relacionada en la ficha del cliente |
| Producto | Búsqueda → Productos | El modelo vendido (ej. SET PUENTE GRUA ELK 5 TON) |
| Sucursal del Cliente | Búsqueda → Sucursales de Clientes | Dónde está instalado |
| N° de Serie | Texto, **único** | Evita duplicados |
| Marca / Modelo | Texto | Para equipos de terceros sin producto en CRM |
| Capacidad | Texto | Ej: "5 ton x 12.500 mm" |
| Origen | Lista: Venta Emaresa / Rental / Equipo de terceros | |
| Orden de Venta | Búsqueda → Órdenes de venta | Opcional, venta de origen |
| Fecha de Instalación | Fecha | Puesta en marcha |
| Fin de Garantía | Fecha | |
| Estado del Activo | Lista: Operativo / En mantención / Fuera de servicio / Dado de baja | |
| Frecuencia de Mantención (meses) | Número | Ej: 6 = semestral, 12 = anual |
| Última Mantención | Fecha | Se actualiza sola al registrar una mantención |
| Próxima Mantención | Fecha | Se calcula sola (Última + frecuencia) |
| Observaciones | Área de texto | |

Propietario del registro = vendedor/KAM responsable del cliente.

### Módulo 2: **Mantenciones** (historial)

Un registro por cada visita/servicio, colgando del activo (así cada
mantención tiene su propio informe adjunto y se puede reportar).

| Campo | Tipo | Notas |
|---|---|---|
| N° Mantención | Autonumérico (MANT-0001) | Campo nombre |
| Activo | Búsqueda → Activos de Clientes | Obligatorio |
| Cliente | Búsqueda → Clientes | Se completa solo desde el activo |
| Tipo | Lista: Preventiva / Correctiva / Inspección-Certificación / Instalación | |
| Fecha | Fecha | Obligatorio |
| Estado | Lista: Programada / Realizada / Cancelada | |
| Técnico | Búsqueda → Usuario (o texto si es externo) | |
| Descripción del trabajo | Área de texto | |
| Hallazgos / Recomendaciones | Área de texto | Base para cotizar repuestos |
| Oportunidad generada | Búsqueda → Oportunidades | Opcional |
| Informe | Adjunto (archivo) | PDF del informe técnico |

### Automatizaciones

1. **Al marcar una Mantención como "Realizada"** → función actualiza en el
   Activo: Última Mantención = Fecha, Próxima = Fecha + frecuencia,
   Estado = Operativo.
2. **Aviso 30 días antes de Próxima Mantención** (regla de flujo por
   fecha) → tarea al propietario del activo "Coordinar mantención de
   <activo> – <cliente>" + correo.
3. (Opcional) Vista "Mantenciones vencidas" y un informe de base instalada
   por cliente / producto.

## Pasos para crearlo (cuando haya OK)

1. **Simón** — Configuración → Personalización → Módulos y campos →
   Crear nuevo módulo: "Activos de Clientes" (singular "Activo"). Repetir
   para "Mantenciones". Probar primero en **Sandbox** si se prefiere.
2. **Claude** — crear los campos de ambos módulos por API.
3. **Simón** — ordenar el diseño (layout), dar permisos por perfil
   (Configuración → Perfiles), y agregar la lista relacionada "Activos" en
   la ficha del Cliente.
4. **Claude** — entregar el código de la función y la regla de aviso.
5. Carga inicial: Simón comparte un Excel con los puentes grúa vendidos
   (cliente, producto, serie, sucursal, fecha instalación) y se importa.

## Preguntas abiertas

1. ¿CRM (esta propuesta) o Zoho FSM? ¿Quién ejecuta las mantenciones:
   técnicos de Emaresa, un servicio externo, o solo se quiere el aviso
   comercial?
2. ¿Sólo puentes grúa o todo equipo (grúas pluma, tecles, articuladas…)?
3. ¿Los equipos Rental (`Equipos_Rental`) deben entrar aquí o quedan
   aparte?
4. ¿Qué perfiles deben verlo/editarlo (vendedores, servicio técnico,
   gerentes de UN)?
5. ¿Existe ya un listado (Excel/ERP) de equipos instalados para la carga
   inicial?
