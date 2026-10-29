# Caso: COT-REN-5812 no viaja al ERP — "API call is taking too long"

## Síntoma (28-10-2026, 12:49)

Al pasar a **Cerrada Ganada**, la función **"Enviar Cotización Rental a ERP"**
dejó en `Detalle de Log ERP`:

> Error at line : 36, Execution exception : 'The task has been terminated
> since the API call is taking too long to respond. Please try again after
> sometime.'

## Diagnóstico (revisado en el CRM)

- La línea 36 es la llamada al ERP (`invokeurl`). Zoho corta cualquier
  llamada externa que tarde más de **~40 segundos**. En el historial de la
  cotización se ve: cierre 12:48:20 → error 12:49:00 (40 s exactos).
- O sea: **el ERP no respondió a tiempo**. No es un problema de datos de la
  cotización ni del vendedor; es lentitud/caída del servicio del ERP en ese
  momento.
- Las cotizaciones Rental cerradas justo antes y después se enviaron bien
  (`"Quotation added/updated successfully"`), lo que confirma que fue algo
  puntual del lado ERP.
- No se sabe si el ERP alcanzó a crear la cotización (Zoho cortó antes de
  recibir respuesta) → hay que revisar en el ERP antes de reenviar, para no
  duplicar.

## Cotizaciones con el mismo error (pendientes de reenvío)

| Cotización | Cliente | Vendedor | Fecha error | Total |
|---|---|---|---|---|
| COT-REN-5812 | INMOB. Y CONST. NUEVA PACIFICO SUR S.A. | Landa | 28-10 12:49 | 47.500 |
| COT-REN-5810 | CONSTRUCTORA SAN IGNACIO LTDA. | Sanchez | 28-10 12:14 | 29.150 |
| COT-REN-5118 | CONSTRUCTORA INMOBILIARIA E INVERCIONES OVAL LTDA | Muñoz | 14-10 | 1.050.000 |
| COT-REN-5115 | EMPRESA CONSTRUCTORA BRAVO E IZQUIERDO LIMITADA | Aguilera | 14-10 | 1.806.270 |
| COT-REN-4558 | CONSTRUCTORA RAYMAR LTDA. (línea 63) | Baez | 25-09 | 474.290 |
| COT-REN-3063 | CONSTRUCTORA CUEVAS Y PURCELL S A (línea 63) | Muñoz | 11-09 | 1.706.500 |

(Las de septiembre/octubre pueden haberse resuelto a mano en el ERP — validar.)

## Qué hacer

1. **Revisar en el ERP** si COT-REN-5812 (y 5810) existen. Si existen, no
   hay que hacer nada más que limpiar el log.
2. Si no existen, **volver a disparar la función** "Enviar Cotización Rental
   a ERP" sobre la cotización (Configuración → Funciones → Ejecutar con el ID
   del registro, o el mecanismo de reenvío que use el proveedor).
   IDs: 5812 = `5404724000626265433`, 5810 = `5404724000626271160`.
3. Si se repite seguido, pedir al proveedor de la integración:
   - revisar por qué el endpoint del ERP tarda >40 s en responder;
   - que la función **reintente automáticamente** (o deje la cotización
     marcada para reenvío) cuando ocurre este timeout, en vez de quedar
     solo el error en el log.

No se tocó el CRM (solo lectura).
