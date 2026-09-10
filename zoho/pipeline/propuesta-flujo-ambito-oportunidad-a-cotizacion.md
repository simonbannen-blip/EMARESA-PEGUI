# Propuesta: copiar "Ámbito" de la Oportunidad a la Cotización

## Estado: PROPUESTO — pendiente de OK para crear el campo en Cotizaciones, de que Simón pase Ámbito a Producción en Oportunidades, y de armar la regla en Zoho

## Qué se pidió

Simón preguntó si hay forma de traer un campo de la Oportunidad hasta la
Cotización, porque al generar la Cotización desde la Oportunidad
("duplicado") solo se copian los campos de búsqueda (lookup) — no los
campos de texto, lista, fecha, etc. aunque se llamen igual en los dos
módulos. El caso concreto es el campo **Ámbito** (lista desplegable) que
está armando en el Sandbox, en Oportunidades.

## Por qué pasa esto

Es un comportamiento estándar de Zoho: al crear la Cotización desde la
Oportunidad, el sistema solo mapea automáticamente los campos estándar
(Cliente, Contacto, Monto, etc.) y los campos de búsqueda compartidos.
Los campos personalizados "de valor" (picklist, texto, fecha, casilla)
nunca se copian solos, sin importar si el nombre coincide en los dos
módulos — confirmé revisando los campos actuales que esto ya pasa con
varios otros campos que hoy existen duplicados a mano en Oportunidades y
Cotizaciones (Canal de Venta, Origen, Región, Zona, UN, Socio, Sucursal,
etc.), ninguno se autocompleta.

## Requisito previo

Este campo tiene que existir en **ambos módulos** antes de armar la
regla:

- **Oportunidades**: Simón lo está armando en Sandbox — lo va a pasar a
  Producción él mismo cuando termine de probarlo.
- **Cotizaciones**: ver
  `zoho/config/propuesta-campo-ambito-en-cotizaciones.md` (mismos
  valores: AGROINDUSTRIA, MINERIA, CONSTRUCCION, EVENTOS, FORESTAL,
  RENTAL, INDUSTRIAL, ENERGIA, LOGISTICA).

## Flujo propuesto

1. **Dispara**: al crear una Cotización.
2. **Condición**: el campo "Nombre de Trato" (la Oportunidad de origen)
   no está vacío.
3. **Acción — Actualización de campo**: `Ámbito` (Cotización) = valor del
   campo `Ámbito` de la Oportunidad relacionada.

## Por qué esto no lo puedo aplicar solo

Las Reglas de flujo de trabajo (y las Funciones personalizadas) **no
están entre las herramientas conectadas a esta sesión** — el MCP de Zoho
solo permite crear/editar registros y campos, no reglas de
automatización. Hay que armarlo a mano en Zoho, una sola vez. Son 5
minutos.

### Pasos en Zoho (Configuración → Automatización → Reglas de flujo de trabajo)

1. Módulo: **Cotizaciones**
2. Cuándo ejecutar: **Al crear el registro**
3. Criterio: "Nombre de Trato" **no es nulo** (siempre se cumple, ya que
   toda Cotización nace desde una Oportunidad — se puede dejar sin
   criterio también)
4. Acción: **Actualización de campo** → módulo Cotizaciones → campo
   **Ámbito** → elegir como origen del valor "**Campo de otro módulo**" /
   "**Valor de campo asociado**" → Oportunidad (Nombre de Trato) → campo
   **Ámbito**
5. Guardar y activar la regla.

> Si el asistente de Zoho no ofrece "campo de módulo asociado" para un
> picklist (a veces limita esa opción a ciertos tipos de dato), la
> alternativa es la misma que se usó para el flujo de Segmento Cliente en
> Oportunidades: una función Deluge disparada por la misma regla, con este
> código:
>
> ```deluge
> dealId = input.Deal_Name;
> ambitoValue = "";
>
> if(dealId != null)
> {
> 	deal = zoho.crm.getRecordById("Deals", dealId.get("id"));
> 	ambitoValue = ifnull(deal.get("Ambito"), "");
> }
>
> if(ambitoValue != "")
> {
> 	mapaActualizar = Map();
> 	mapaActualizar.put("Ambito", ambitoValue);
> 	zoho.crm.updateRecord("Quotes", input.id, mapaActualizar);
> }
> ```
>
> (el `api_name` exacto de cada campo puede diferir de "Ambito" según
> como lo autogenere Zoho a partir de la etiqueta "Ámbito" — hay que
> confirmarlo en Configuración → Módulos y campos antes de pegar el
> código).

## Próximo paso

1. Confirmar/crear el campo en Cotizaciones (ver propuesta de campo).
2. Esperar a que Simón pase "Ámbito" de Oportunidades del Sandbox a
   Producción.
3. Armar la regla de flujo con los pasos de arriba.
