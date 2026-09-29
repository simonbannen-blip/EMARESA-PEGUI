# Plantilla de correo + regla de flujo: aviso al KAM cuando la Oportunidad pasa a "Cotización Enviada"

## Estado: PROPUESTA (pendiente OK de Simón para armarla en Sandbox)

## Para qué

Avisar al **KAM asociado** que se envió la cotización al cliente, para que
pueda hacer el seguimiento comercial.

## Decisión (Simón, 29-09-2026)

Se arma en **Oportunidades** (no en Cotizaciones), porque:

- Ahí existe el campo **`KAM Asociado`** (`KAM_Asociado`, búsqueda de
  usuario). En Cotizaciones y Clientes no hay campo KAM (revisado en
  Producción).
- Cuando la cotización se envía, la Oportunidad queda en la fase
  **"Cotización Enviada"** (valor del campo `Fase` / `Stage`).

## Regla de flujo propuesta

- **Módulo:** Oportunidades
- **Cuándo:** al editar un registro, cuando se modifica el campo **Fase**
- **Condición:** `Fase` es `Cotización Enviada` **Y** `KAM Asociado` no está
  vacío
- **Acción:** Alerta de correo electrónico con la plantilla de abajo
  - **Para:** campo de usuario **KAM Asociado**
  - (Opcional) **CC:** Propietario de Oportunidad

## Plantilla (módulo Oportunidades)

**Nombre de la plantilla:** Aviso KAM - Cotización Enviada

**Asunto:**

```
Cotización enviada: ${Oportunidades.Nombre de Oportunidad} - ${Oportunidades.Nombre de Cliente}
```

**Cuerpo:**

```
Hola ${Oportunidades.KAM Asociado},

Te informamos que se envió una cotización a tu cliente asociado:

- Cliente: ${Oportunidades.Nombre de Cliente}
- Contacto: ${Oportunidades.Nombre de Contacto}
- Oportunidad: ${Oportunidades.Nombre de Oportunidad}
- N° de Oportunidad: ${Oportunidades.Nro. de Oportunidad}
- Unidad de Negocio: ${Oportunidades.UN}
- Importe: ${Oportunidades.Importe}
- Fecha estimada de cierre: ${Oportunidades.Fecha de cierre}
- Vendedor: ${Oportunidades.Propietario de Oportunidad}

Te recomendamos coordinar con el vendedor el seguimiento con el cliente.

Puedes revisar el detalle de la oportunidad y sus cotizaciones en el CRM:
${Oportunidades.URL del registro}

Saludos,
Equipo Comercial Emaresa
```

## Notas

- Los `${...}` se insertan en Zoho con el botón **"Insertar campo de
  combinación"** (Configuración → Personalización → Plantillas → Correo
  electrónico → Oportunidades), para que queden con el nombre interno
  correcto.
- Una plantilla de Oportunidades **no puede mostrar datos de la
  Cotización** (N° de cotización, validez), porque son registros
  relacionados. La cotización se ve desde el link a la Oportunidad.
- El **Importe** de la Oportunidad refleja el monto de la última cotización
  una vez aplicada la propuesta
  `propuesta-sincronizar-monto-cotizacion-a-oportunidad.md`.
