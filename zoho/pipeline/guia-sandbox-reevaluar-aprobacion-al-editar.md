# Guía Sandbox: re-disparar aprobaciones cuando se edita una cotización

**Fecha:** 2026-11-03 · **Estado:** para probar en Sandbox. No tocar
Producción hasta tener el OK de Simón.
Diseño y motivo: `propuesta-reevaluar-aprobacion-al-editar-cotizacion.md`
(caso COT-II10022-2883).

Tiempo estimado: 30–45 min.

---

## Paso 0 — Antes de empezar (5 min)

1. Entrar al **Sandbox** de Zoho CRM.
2. En Configuración → Personalización → Módulos y campos → **Cotizaciones**,
   confirmar que existen estos campos (casillas):
   - Aprobación Sobre 10 millones / Aprobado por Sobre 10 millones
   - Aprobación Descuento Monto Mínimo / Aprobado por Descuento Monto Mínimo
   - Aprobación 2da Selección / Aprobado por Segunda Selección
   - Aprobación Cambio Forma de Pago / Aprobado por Cambio Forma de Pago
   - Aprobación Venta Rental / Aprobado por Venta Rental
   - Aprobación Sobreprecio / Aprobado por Sobreprecio
   - Aprobación Descuento / **¿cuál es su "Aprobado por"?** (supuse
     "Aprobado por Descuento Item"; si es otro, anotarlo y avisarme).
3. En Configuración → Automatización → **Procesos de aprobación** →
   Cotizaciones, confirmar que está activo **"UN Izaje Aprobación sobre 10
   millones"** con la condición Fase = Pendiente de Aprobación.

---

## Paso 1 — Crear la función (10 min)

1. Configuración → Desarrollador → **Funciones** → **+ Nueva función**.
2. Nombre: `cotizacion_reevaluarAprobacion` · Nombre visible: "Reevaluar
   aprobación al editar" · Categoría: **Automatización** · Crear.
3. En **Editar argumentos**: agregar `quoteId` de tipo **String**
   (cadena).
4. Pegar este código y **Guardar**:

```deluge
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
```

> Si al guardar marca error en algún nombre de campo, es que en Sandbox el
> nombre API es distinto: copiar el mensaje y avisarme.

---

## Paso 2 — Crear la regla de flujo de trabajo (10 min)

1. Configuración → Automatización → **Reglas de flujo de trabajo** →
   **+ Crear regla**.
2. Módulo: **Cotizaciones** · Nombre: "Reevaluar aprobación al editar".
3. **Cuándo**: "Acción en el registro" → **Editar**.
   - Marcar **"Repetir esta regla de flujo de trabajo cada vez que se edite
     un registro"** (si no, solo corre la primera vez).
   - Dejar "cualquier campo".
4. **Condición**: "Registros que coinciden con las condiciones":
   1. Fase de Cotización **es** Creada
   2. Aprobación Sobre 10 millones **es** Seleccionado
   3. Aprobación Descuento Monto Mínimo **es** Seleccionado
   4. Aprobación 2da Selección **es** Seleccionado
   5. Aprobación Cambio Forma de Pago **es** Seleccionado
   6. Aprobación Venta Rental **es** Seleccionado
   7. Aprobación Sobreprecio **es** Seleccionado
   8. Aprobación Descuento **es** Seleccionado
   - En **Editar patrón** dejar: `1 and (2 or 3 or 4 or 5 or 6 or 7 or 8)`
5. **Acción instantánea** → **Función** → elegir
   `cotizacion_reevaluarAprobacion`.
   - Mapear el argumento `quoteId` → **Cotizaciones → ID de cotización**.
6. Guardar y dejar la regla **activa**.

---

## Paso 3 — Pruebas (15–20 min)

Usar una cotización de **Inamar Izaje** cuyo dueño **no** sea Juan Marchant.
Ideal: desde el **Cotizador conectado a Sandbox**, porque así se prueba lo
mismo que pasa en Producción. Si el Cotizador de Sandbox no está conectado
al CRM Sandbox, usar la versión "a mano" (entre paréntesis).

| # | Qué hacer | Qué debería pasar |
|---|-----------|-------------------|
| A | Crear cotización **bajo 10 MM** | Queda en Fase "Creada", sin aprobación. |
| B | **Editarla** subiendo el monto **sobre 10 MM** (a mano: marcar la casilla "Aprobación Sobre 10 millones" y guardar) | La Fase pasa sola a **Pendiente de Aprobación** y aparece el aprobador (botones Aprobar/Rechazar para el aprobador). |
| C | Aprobarla y luego **editar** cualquier cosa | **No** vuelve a aprobación (ya está aprobada / Fase distinta de Creada). |
| D | Otra cotización: llevarla a aprobación (como en B) y **rechazarla**. Anotar en qué Fase queda. Editarla. | Anotar qué pasa. Si queda en "Creada" y vuelve a aprobación al editar, decidir si es lo deseado. |
| E | Cotización bajo 10 MM, editar **sin** activar ninguna marca | No pasa nada, sigue en "Creada". |
| F | Repetir B con **monto mínimo** (marca "Aprobación Descuento Monto Mínimo") | Igual que B, entra el proceso de monto mínimo. |

**Dónde mirar si algo no funciona:**
- En la cotización, pestaña **Historial / Línea de tiempo**: debe aparecer
  la regla "Reevaluar aprobación al editar" y el envío a aprobación.
- Si la regla aparece pero la Fase no cambia: en Funciones →
  `cotizacion_reevaluarAprobacion` → **Registros de ejecución**, copiar el
  mensaje de `resp`. Lo más probable es que el **Blueprint "SB Gestión de
  Cotizaciones"** no deje cambiar la Fase así; avisarme con el texto.
- Si la regla **no aparece** en el historial cuando se edita desde el
  Cotizador (pero sí cuando se edita a mano): el Cotizador actualiza sin
  disparar reglas, y entonces el arreglo tiene que hacerlo el proveedor en
  el Cotizador.

---

## Paso 4 — Resultado

Mandarme lo que pasó en cada prueba (A–F), especialmente B, D y lo del
Cotizador. Con eso dejo listo el paso a Producción. Para deshacer en
Sandbox: desactivar la regla.
