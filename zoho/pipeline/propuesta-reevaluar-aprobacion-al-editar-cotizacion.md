# Propuesta — Re-disparar aprobaciones cuando una cotización se edita (2026-11-03)

Estado: **propuesta, no aplicada**. Probar primero en Sandbox.

## Problema

Caso origen: `20261103-COT-II10022-2883` (id 5404724000629111444, Bekaert,
dueño Fabián Rodriguez). Se creó bajo 10 MM (Fase "Creada") y al editarla en
el Cotizador subió a CLP 14.286.663. Llegaron en verdadero
`Aprobaci_n_Sobre_10_millones` y `Aprobaci_n_Descuento_Monto_M_nimo`, pero la
Fase quedó en "Creada" porque `EnviarCotizacionACRM` quita `Quote_Stage` al
actualizar. Todos los procesos de aprobación exigen Fase = "Pendiente de
Aprobación", así que ninguno entra.

Cambiar el "cuándo se dispara" de los procesos de aprobación (Crear → Crear o
Editar) **no basta**: el proceso sí se evalúa al editar, pero falla porque la
Fase no es "Pendiente de Aprobación". Lo que falta es mover la Fase.

## Solución propuesta en el CRM (una sola regla para todos los procesos)

1. **Regla de flujo de trabajo** en Cotizaciones
   - Cuándo: al **editar** el registro (cualquier campo).
   - Condición: Fase = "Creada" Y alguna marca de aprobación = verdadero
     (Sobre 10 millones, Descuento Monto Mínimo, 2da Selección, Cambio Forma
     de Pago, Venta Rental, Sobreprecio, Descuento).
   - Acción: función `cotizacion_reevaluarAprobacion(quoteId)`.

2. **Función** (Deluge). Revisa que haya al menos una marca pendiente (marca
   en verdadero y su "Aprobado por …" en falso) y, si la hay, mueve la Fase
   pidiendo explícitamente que se evalúen las aprobaciones (un cambio de campo
   hecho por una regla normal no dispara procesos de aprobación; uno hecho por
   función con `trigger: approval` sí):

```deluge
void cotizacion_reevaluarAprobacion(String quoteId)
{
	q = zoho.crm.getRecordById("Quotes", quoteId.toLong());
	if(q.get("Quote_Stage") != "Creada")
	{
		return;
	}
	pares = {
		"Aprobaci_n_Sobre_10_millones":"Aprobado_por_Sobre_10_millones",
		"Aprobaci_n_Descuento_Monto_M_nimo":"Aprobado_por_Descuento_Monto_M_nimo",
		"Aprobaci_n_2da_Selecci_n":"Aprobado_por_Segunda_Selecci_n",
		"Aprobaci_n_Cambio_Forma_de_Pago":"Aprobado_por_Cambio_Forma_de_Pago",
		"Aprobaci_n_Venta_Rental":"Aprobado_por_Venta_Rental",
		"Aprobaci_n_Sobreprecio":"Aprobado_por_Sobreprecio",
		"Aprobaci_n_Descuento":"Aprobado_por_Descuento_Item"
	};
	pendiente = false;
	for each marca in pares.keys()
	{
		if(q.get(marca) == true && q.get(pares.get(marca)) != true)
		{
			pendiente = true;
		}
	}
	if(pendiente)
	{
		resp = zoho.crm.updateRecord("Quotes", quoteId.toLong(), {"Quote_Stage":"Pendiente de Aprobación"}, {"trigger":["approval","workflow"]});
		info resp;
	}
}
```

## A validar en Sandbox antes de pasar a Producción

- Que la regla se dispare con las ediciones que llegan desde el Cotizador
  (vía API). Si el Cotizador actualiza sin disparar flujos, la regla no corre
  y hay que volver al arreglo en el Cotizador.
- El par `Aprobaci_n_Descuento` ↔ `Aprobado_por_Descuento_Item` es supuesto;
  confirmar.
- Qué hace un **rechazo**: si devuelve la Fase a "Creada" con las marcas aún
  en verdadero, la regla re-enviaría a aprobación en la siguiente edición.
  Revisar si eso es lo deseado (probablemente sí, si el vendedor corrigió).
- Que el Blueprint de Cotizaciones permita el cambio Creada → Pendiente de
  Aprobación hecho por función.

## Alternativa de fondo

Arreglo en el Cotizador (`EnviarCotizacionACRM`): al actualizar, si hay marca
de aprobación activa y la Fase es "Creada", enviar Fase "Pendiente de
Aprobación". Lo hace el proveedor. Ambas soluciones pueden convivir.
