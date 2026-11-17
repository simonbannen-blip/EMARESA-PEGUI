# Ideas de mejora para el CRM — 2026-11-17

Basadas en datos reales consultados hoy (solo lectura, no se tocó nada).

## Lo que muestran los datos

| Hallazgo | Número |
|---|---|
| Oportunidades abiertas con fecha de cierre ya vencida | **8.402** (Creada 5.881 · Cotización Enviada 1.558 · Contactado 847 · otras 116) |
| Oportunidades abiertas sin monto (vacío o 0) | **1.861** |
| Cotizaciones abiertas sin movimiento hace 2+ meses | **~9.400** (Creada 5.495 · Enviada 2.259 · Aprobada 902 …) |
| Posibles clientes creados en 2026 que siguen en "Estado Inicial" | **6.132 de 6.156** (99,6%) |
| Cotizaciones perdidas 2026 por "Precio y condiciones" | **802 de 1.690** (47%) |
| Fases de Cotización duplicadas (con y sin tilde) | "Cotización Aprobada" / "Cotizacion Aprobada", "Pendiente de Aprobación" / "Pendiente de Aprobacion", "Cotización Rechazada" / "Cotizacion Rechazada" |

## Ideas (ordenadas por impacto / esfuerzo)

### Rápidas (limpieza)
1. **Unificar fases duplicadas de Cotización** — pasar los registros de la versión sin tilde a la con tilde y ocultar la vieja. Hoy los informes por fase cuentan cada estado partido en dos.
2. **Limpieza de pipeline vencido** — cerrar masivamente como "Declinada" (motivo "Sin respuesta / vencida") oportunidades y cotizaciones sin movimiento > 6 meses, previa lista por UN para que cada gerente valide. Así el pronóstico de ventas pasa a ser creíble.
3. **Monto obligatorio desde "Cotización Enviada"** en Oportunidades (Blueprint o sincronización con el monto de la cotización — ya hay propuesta `propuesta-sincronizar-monto-cotizacion-a-oportunidad.md`).

### Disciplina comercial (automático)
4. **Alerta de fecha de cierre vencida** — workflow programado que manda mail/tarea al dueño cuando una oportunidad pasa su fecha de cierre sin cerrar, y resumen semanal al jefe de cada UN.
5. **Seguimiento automático de cotizaciones enviadas** — tarea al vendedor a los 7 días de "Enviada" sin respuesta; si pasan 30, aviso al KAM/jefe.
6. **Vencimiento automático de cotizaciones** — al pasar la fecha de validez, mover a "Vencida" (nueva fase) en vez de dejarlas abiertas para siempre.
7. **Posibles clientes: estado que se mueva solo** — pasar a "Intento de contacto" al registrar la primera llamada/mail, y alerta si un lead lleva 48 h sin contacto. Hoy el campo no se usa, así que no se puede medir conversión.

### Inteligencia comercial
8. **Análisis de "Precio y condiciones"** — casi la mitad de las pérdidas. Agregar campo "Precio de la competencia" / "Competidor" (opcional) al perder por precio o competencia, para saber contra quién y por cuánto se pierde.
9. **Dashboard por UN**: tasa de ganancia, tiempo medio de cotización a cierre, pipeline vencido por vendedor, motivos de pérdida — uno por gerente.
10. **Clientes dormidos** — vista/alerta de clientes con compras históricas y sin cotización en 6+ meses, para que el KAM los reactive.
11. **Recompra en Rental** — aviso al vendedor X días antes de que termine un arriendo (usando Duración del Arriendo) para ofrecer extensión o nuevo equipo.

### Calidad de datos
12. **Puntaje de completitud del cliente** (RUT, segmento, contacto, dirección) visible en la ficha y en un informe por vendedor.
13. **Detección de duplicados por RUT** en Clientes y Posibles clientes (ya existe la función `SBvalidarRut`, se puede extender para avisar si el RUT ya existe).
