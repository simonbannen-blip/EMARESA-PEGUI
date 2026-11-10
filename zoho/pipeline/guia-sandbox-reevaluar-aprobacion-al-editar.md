# Guía Sandbox: re-disparar aprobaciones cuando se edita una cotización (v2)

**Fecha:** 2026-11-10 (reemplaza la v1 del 03-11) · **Estado:** para probar
en Sandbox. No tocar Producción hasta tener el OK de Simón.
Diseño y motivo: `propuesta-reevaluar-aprobacion-al-editar-cotizacion.md`.

Cubre los dos casos:
1. Cotización **ya aprobada** que se edita y sigue cumpliendo criterios →
   vuelve a aprobación.
2. Cotización **sin aprobación** (Creada) que se edita y ahora cumple
   criterios → entra a aprobación.

Tiempo estimado: 45–60 min.

> Si en Sandbox ya armaste la v1 (función + regla "Reevaluar aprobación al
> editar"), **no crees nada nuevo**: reemplaza el código de la función
> (Paso 2) y edita la regla (Paso 3).

---

## Paso 0 — Antes de empezar (5 min)

1. Entrar al **Sandbox** de Zoho CRM.
2. Confirmar que estén activas (si ya las armaste): la regla de **Juan
   Marchant sin aprobación** y la de **exención Sub Gerentes**. Esta nueva
   regla se apoya en ellas para que las cotizaciones de exentos no queden
   trabadas en Pendiente.

---

## Paso 1 — Procesos de aprobación: que evalúen al editar (10 min)

Configuración → Automatización → **Procesos de aprobación** → Cotizaciones.
Para **cada** proceso activo (UN Izaje Aprobación sobre 10 millones,
UN Inamar Izaje - Aprobaciones, UN Rental, etc.):

1. Abrir el proceso → sección **"Cuándo ejecutar"** (o "Activar").
2. Si dice solo **Crear**, cambiar a **Crear o Editar**. Guardar.
3. Anotar cuáles tuviste que cambiar.

No tocar criterios ni aprobadores.

> Ya confirmado (captura 10-11): **UN Izaje Aprobación sobre 10 millones**
> ya está en "Crear o editar" en Producción. Aun así no entra al editar
> porque su criterio 1 exige Fase = Pendiente de Aprobación y la Fase queda
> en Creada — eso es lo que arregla la función.

---

## Paso 2 — Función (10 min)

1. Configuración → Desarrollador → **Funciones**. Si ya existe
   `cotizacion_reevaluarAprobacion`, abrirla; si no, **+ Nueva función**:
   nombre `cotizacion_reevaluarAprobacion`, nombre visible "Reevaluar
   aprobación al editar", categoría **Automatización**, argumento
   `quoteId` tipo **String**.
2. Reemplazar todo el código por este y **Guardar**:

```deluge
// Fases en las que una edición puede mandar a aprobación
fasesSinAprobar = {"Creada","Cotización Rechazada"};
fasesAprobadas = {"Cotización Aprobada","Cotizacion Parcialmente Aprobada"};
q = zoho.crm.getRecordById("Quotes",quoteId.toLong());
fase = ifnull(q.get("Quote_Stage"),"");
if(!fasesSinAprobar.contains(fase) && !fasesAprobadas.contains(fase))
{
	return;
}
// ¿Cumple algún criterio de aprobación? (casillas que calcula el Cotizador)
marcas = {"Aprobaci_n_Sobre_10_millones","Aprobaci_n_Descuento_Monto_M_nimo","Aprobaci_n_Descuento","Aprobaci_n_2da_Selecci_n","Aprobaci_n_Cambio_Forma_de_Pago","Aprobaci_n_Venta_Rental","Aprobaci_n_Sobreprecio","Aprobaci_n_Venta_Calzada"};
cumple = false;
for each m in marcas
{
	if(q.get(m) == true)
	{
		cumple = true;
	}
}
if(!cumple)
{
	return;
}
// Limpiar la aprobación anterior y mandar a aprobación
datos = Map();
datos.put("Sub_Fase_de_Cotizaci_n",null);
aprobados = {"Aprobado_por_Sobre_10_millones","Aprobado_por_Descuento_Monto_M_nimo","Aprobado_por_Descuento_Item","Aprobado_por_Segunda_Selecci_n","Aprobado_por_Cambio_Forma_de_Pago","Aprobado_por_Venta_Rental","Aprobado_por_Sobreprecio"};
for each a in aprobados
{
	datos.put(a,false);
}
datos.put("Quote_Stage","Pendiente de Aprobación");
resp = zoho.crm.updateRecord("Quotes",quoteId.toLong(),datos,{"trigger":{"approval","workflow"}});
info resp;
```

> Si al guardar marca error en algún nombre de campo, en Sandbox el nombre
> API es distinto: copiar el mensaje y avisarme.

---

## Paso 3 — Regla de flujo de trabajo (10 min)

1. Configuración → Automatización → **Reglas de flujo de trabajo**.
   Abrir "Reevaluar aprobación al editar" o **+ Crear regla** (módulo
   **Cotizaciones**, ese nombre).
2. **Cuándo**: "Acción en el registro" → **Editar** →
   **"cuando se modifique cualquiera de los campos seleccionados"** y
   elegir:
   - Total general
   - Descuento Total de Productos
   - Plazo de Pago
   - Aprobación Sobre 10 millones
   - Aprobación Descuento Monto Mínimo
   - Aprobación Descuento
   - Aprobación 2da Selección
   - Aprobación Cambio Forma de Pago
   - Aprobación Venta Rental
   - Aprobación Sobreprecio
   - Aprobación Venta Calzada

   Marcar **"Repetir cada vez que se edite"**.

   ⚠️ **No** usar "cualquier campo": las automatizaciones que corren al
   aprobar (Sub Fase, vendedor secundario, envío a Creator) editan la
   cotización y la mandarían de vuelta a aprobación sola.
3. **Condición**: Fase de Cotización **es** Creada, Cotización Rechazada,
   Cotización Aprobada, Cotizacion Parcialmente Aprobada (una sola
   condición con varios valores).
4. **Acción instantánea** → **Función** → `cotizacion_reevaluarAprobacion`,
   mapeando `quoteId` → **Cotizaciones → ID de cotización**.
5. Guardar y dejar **activa**.

---

## Paso 4 — Pruebas (20 min)

Ideal: desde el **Cotizador conectado a Sandbox**. Si no está conectado,
usar la versión "a mano" (entre paréntesis). Usar un dueño que **no** sea
Juan Marchant ni Sub Gerente de Ventas Inamar Izaje.

**Caso 2 — sin aprobación:**

| # | Qué hacer | Qué debería pasar |
|---|-----------|-------------------|
| A | Crear cotización Inamar Izaje **bajo 10 MM** | Queda en "Creada", sin aprobación. |
| B | Editarla subiendo el monto **sobre 10 MM** (a mano: marcar "Aprobación Sobre 10 millones" y guardar) | Pasa sola a **Pendiente de Aprobación** y aparece el aprobador. |
| C | Editar cualquier cosa **sin** que cumpla criterios (ej. sigue bajo 10 MM) | No pasa nada, sigue en "Creada". |

**Caso 1 — ya aprobada:**

| # | Qué hacer | Qué debería pasar |
|---|-----------|-------------------|
| D | Aprobar la de la prueba B hasta el final | Queda en **Cotización Aprobada** con Sub Fase "Aprobado por precio sobre 10 millones". **No** debe volver sola a Pendiente (si vuelve, avisarme: la regla está tomando un campo de más). |
| E | Editar la aprobada **cambiando el monto** (sigue sobre 10 MM) (a mano: cambiar cantidad o precio de un ítem) | Vuelve a **Pendiente de Aprobación**, Sub Fase vacía, y entra de nuevo el aprobador desde el primer paso. |
| F | Otra aprobada: editar **solo observaciones** (sin tocar montos) | Sigue en Cotización Aprobada (no re-dispara). |
| G | Aprobada con precio bajo mínimo (marca "Aprobación Descuento Monto Mínimo"): bajar más el precio | Vuelve a Pendiente y entra "UN Inamar Izaje - Aprobaciones". |

**Rechazo y exentos:**

| # | Qué hacer | Qué debería pasar |
|---|-----------|-------------------|
| H | Llevar una a aprobación y **rechazarla**. Editarla cambiando el monto | Vuelve a Pendiente de Aprobación. |
| I | Cotización de **Juan Marchant** sobre 10 MM: editar el monto | Puede pasar un instante por Pendiente y vuelve sola a **Creada** (regla de Juan). No debe quedar trabada. |

**Dónde mirar si algo no funciona:**
- En la cotización → **Línea de tiempo**: debe aparecer la regla
  "Reevaluar aprobación al editar" y luego "enviado a aprobación".
- Si la regla aparece pero la Fase no cambia: Funciones →
  `cotizacion_reevaluarAprobacion` → **Registros de ejecución**, copiar el
  texto de `resp`. Lo más probable: el **Blueprint "SB Gestión de
  Cotizaciones"** no deja mover la Fase así, o la Sub Fase no acepta
  `null` (probar cambiando `null` por `""`).
- Si la Fase cambia a Pendiente pero **no aparece aprobador**: ese proceso
  quedó en "Crear" (Paso 1).
- Si la regla **no aparece** cuando se edita desde el Cotizador (pero sí a
  mano): el Cotizador actualiza sin disparar reglas → el arreglo lo tiene
  que hacer el proveedor.

---

## Paso 5 — Resultado

Mandarme lo que pasó en cada prueba (A–I), especialmente D, E e I, y las
respuestas a las decisiones pendientes de la propuesta (¿incluir
"Enviada"? ¿"Rechazada" sí?). Con eso dejo listo el paso a Producción.
Para deshacer en Sandbox: desactivar la regla.
