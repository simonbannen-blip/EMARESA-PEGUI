# Propuesta: actualizar el Monto de la Oportunidad al editar la Cotización

## Estado: PROPUESTA — pendiente OK de Simón (armar primero en Sandbox)

## Qué se pidió

Hoy, al crear una Cotización, su monto viaja a la Oportunidad (campo
`Monto` / `Amount`). Pero si después se edita la Cotización, la
Oportunidad se queda con el monto viejo. Simón pidió que al editar la
Cotización el monto de la Oportunidad también se actualice.

## Diagnóstico (revisado en Producción, 2026-09-28)

Comparé `Total general` (`Grand_Total`) de las últimas 40 cotizaciones
modificadas contra el `Monto` de su Oportunidad:

- En las cotizaciones recién creadas y no editadas, los montos coinciden
  (ej. COT-CONST-490-3374: 49.385 = 49.385).
- En las editadas después de crearse, no coinciden. Ejemplos:

| Cotización | Total Cotización | Monto Oportunidad |
|---|---|---|
| COT-REN-4596 | 7.027.000 | 620.900 |
| 20260925-COT-II10026-2428 | 2.359.000 | 500.000 |
| COT-REN-4592 | 1.767.745 | 1.183.235 |
| 20260914-COT-II10027-2299 | 3.525.111 | 5.889.471 |
| 20260910-COT-II10022-2254 | 284.896 | 284.900 |

O sea: el traspaso actual solo ocurre **al crear**. Al editar no existe
ninguna automatización que vuelva a copiar el monto.

## Punto a decidir: Oportunidades con más de una Cotización

Algunas Oportunidades tienen varias Cotizaciones (ej.
260909-OP-CONST--002799 tiene 3: 928, 67.193 y 13.291). Hay que elegir
qué monto manda:

1. **La última Cotización creada o editada** (recomendado): es lo mismo
   que pasa hoy al crear, solo que ahora también al editar. Simple y
   predecible: "la Oportunidad muestra el monto de la última Cotización
   que se tocó".
2. **La suma de todas las Cotizaciones**: solo sirve si las cotizaciones
   de una misma Oportunidad son partes de un mismo negocio. Si son
   versiones/alternativas del mismo pedido (lo más común), inflaría el
   pipeline — no recomendado.

## Solución propuesta (opción 1)

Una **Regla de flujo de trabajo** en Cotizaciones que llama a una
**Función** (Deluge). Se usa función y no "Actualización de campo"
porque la regla de Cotizaciones no puede escribir directo un campo de la
Oportunidad relacionada.

Resguardo incluido: **no se toca el monto de Oportunidades ya cerradas**
(`Cerrada Ganada`, `Cerrada Perdida`, `Declinada`), para no alterar
informes de ventas ya cerradas si alguien edita una cotización antigua.

### Paso 1 — Función (Configuración → Desarrollador → Funciones → Nueva)

- Nombre: `Monto Cotizacion a Oportunidad`
- Módulo: Cotizaciones
- Argumento: `quoteId` (tipo Cadena) → mapeado a **"ID de registro"**
  (ojo: no "ID de Cotización", que Zoho no reconoce — lección del caso
  Vendedor Secundario)

```deluge
void automation.MontoCotizacionAOportunidad(String quoteId)
{
	quote = zoho.crm.getRecordById("Quotes",quoteId.toLong());
	deal = quote.get("Deal_Name");
	if(deal == null)
	{
		info "Cotización sin Oportunidad, no se hace nada";
		return;
	}
	dealId = deal.get("id").toLong();
	dealRec = zoho.crm.getRecordById("Deals",dealId);
	etapa = ifnull(dealRec.get("Stage"),"");
	if(etapa == "Cerrada Ganada" || etapa == "Cerrada Perdida" || etapa == "Declinada")
	{
		info "Oportunidad cerrada (" + etapa + "), no se actualiza el monto";
		return;
	}
	monto = ifnull(quote.get("Grand_Total"),0);
	if(monto.toDecimal() != ifnull(dealRec.get("Amount"),0).toDecimal())
	{
		resp = zoho.crm.updateRecord("Deals",dealId,{"Amount":monto});
		info resp;
	}
}
```

### Paso 2 — Regla de flujo (Configuración → Automatización → Reglas de flujo de trabajo)

1. Módulo: **Cotizaciones**
2. Nombre: **"Monto Cotización → Oportunidad"**
3. Cuándo ejecutar: **Al crear o editar** → marcar "Repetir esta regla
   de flujo de trabajo cada vez que se edite un registro". Si Zoho lo
   ofrece, agregar la condición "cuando se modifica el campo
   **Total general**" (así no corre en ediciones que no cambian el monto).
4. Criterio: todas las Cotizaciones (o `Nombre de Trato` **no está
   vacío**).
5. Acción instantánea: **Función** → `Monto Cotizacion a Oportunidad`.
6. Guardar y activar.

## Pruebas sugeridas en Sandbox

1. Crear una Cotización desde una Oportunidad abierta → el Monto de la
   Oportunidad = Total de la Cotización (igual que hoy).
2. Editar esa Cotización (cambiar cantidad o precio de un ítem) → el
   Monto de la Oportunidad cambia al nuevo total.
3. Editar una Cotización cuya Oportunidad está en `Cerrada Ganada` → el
   Monto de la Oportunidad **no** cambia.
4. Cotización que viene desde Creator (cotizador) y se edita/aprueba
   allá → confirmar que también actualiza (las ediciones hechas por API
   disparan reglas de flujo, salvo que la integración las desactive).
5. Cotización sin Oportunidad → no da error.

## Nota

La automatización que hoy copia el monto al crear sigue igual; esta
regla la complementa. Si al revisarla en Sandbox se ve que la copia al
crear también es una regla/función propia, se puede reemplazar por esta
(que cubre crear y editar) para no tener dos haciendo lo mismo.
