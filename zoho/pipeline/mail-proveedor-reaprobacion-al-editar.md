# Mail al proveedor del Cotizador — re-enviar a aprobación al editar (2026-11-12)

Estado: texto entregado a Simón para enviar. Contexto en
`propuesta-reevaluar-aprobacion-al-editar-cotizacion.md`.

---

**Asunto:** Cotizador – enviar a aprobación al editar una cotización

Hola,

Necesitamos un ajuste en el Cotizador al **editar** cotizaciones:

1. **Al guardar una edición** (`EnviarCotizacionACRM`), si la cotización
   queda con alguna casilla de aprobación en verdadero, enviar a CRM
   `Quote_Stage = "Pendiente de Aprobación"` y `Sub_Fase_de_Cotizaci_n`
   vacía, igual que al crear. Hoy al editar no se envía la Fase, queda en
   "Creada" y el proceso de aprobación no se activa.
   Ejemplo: COT-II10022-2883 se editó a $14,3 MM, quedó con las casillas
   Sobre 10 millones y Monto Mínimo marcadas, pero siguió en "Creada" sin
   aprobación.
2. **Permitir editar** cotizaciones en Fase "Cotización Aprobada" y
   "Cotización Rechazada", aplicando la misma regla del punto 1.

¿Nos pueden indicar plazo estimado?

Saludos,
Simón Bannen
