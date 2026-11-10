# Propuesta — Re-disparar aprobaciones cuando una cotización se edita

Estado: **propuesta, no aplicada**. Probar primero en Sandbox
(guía: `guia-sandbox-reevaluar-aprobacion-al-editar.md`).

- v1 (2026-11-03): solo cubría cotizaciones en "Creada".
- **v2 (2026-11-10)**: cubre los dos casos que pidió Simón:
  1. **Cotización ya aprobada** que se edita → si cumple criterios, vuelve
     a aprobación.
  2. **Cotización sin aprobación** (Creada) que se edita → si ahora cumple
     criterios, entra a aprobación.

## Problema

**Caso 2 (sin aprobación)** — origen: `20261103-COT-II10022-2883`. Se creó
bajo 10 MM (Fase "Creada") y al editarla en el Cotizador subió a CLP
14.286.663. Las casillas de aprobación quedaron en verdadero, pero la Fase
siguió en "Creada" (el Cotizador no manda la Fase al actualizar) y todos los
procesos de aprobación exigen Fase = "Pendiente de Aprobación" → ninguno
entra.

**Caso 1 (ya aprobada)** — revisado en `20261106-COT-II10004-2943`:
al aprobarse, la cotización pasa a Fase **"Cotización Aprobada"** (regla
"SB In Iz - Actualizar Fase a Cotización Aprobada") y la **Sub Fase** queda
con el último paso aprobado (ej. "Aprobado por precio sobre 10 millones").
Si después el vendedor la edita y sube monto / baja precio, nada la saca de
"Cotización Aprobada": la aprobación vieja sigue valiendo para una oferta
distinta.

Hallazgo importante para el diseño: las casillas **"Aprobado por …" no son
confiables** para saber si algo ya se aprobó. En la 2943 (aprobada por
Dieter y Rodrigo Verdugo) `Aprobado por Sobre 10 millones` sigue en falso.
Lo que sí refleja la aprobación es la **Fase** y la **Sub Fase**.

## Solución propuesta en el CRM (una regla + una función, para todos los procesos)

### 1. Procesos de aprobación de Cotizaciones

Revisar que cada proceso tenga "Cuándo ejecutar" = **Crear o Editar**
(no solo Crear). Si queda en "Crear", aunque la función pida evaluar
aprobaciones, el proceso no entra.

### 2. Regla de flujo de trabajo — "Reevaluar aprobación al editar"

- Módulo: Cotizaciones.
- Cuándo: **Editar**, con **"cuando se modifique un campo específico"**
  (cualquiera de estos), repitiendo en cada edición:
  - Total general
  - Descuento Total de Productos
  - Plazo de Pago
  - Las 8 casillas de aprobación: Sobre 10 millones, Descuento Monto
    Mínimo, Descuento, 2da Selección, Cambio Forma de Pago, Venta Rental,
    Sobreprecio, Venta Calzada.

  **Por qué campos específicos y no "cualquier campo":** sobre una
  cotización corren muchas automatizaciones que la editan (vendedor
  secundario, cotizacionAprobada, envío a Creator, el propio proceso de
  aprobación al escribir la Sub Fase…). Con "cualquier campo", una
  cotización recién aprobada se volvería a mandar a aprobación sola. Con
  estos campos, solo dispara cuando cambia lo comercial (montos, descuentos,
  plazo) o cuando el Cotizador recalcula una casilla de aprobación.
- Condición: Fase de Cotización **es** Creada, Cotización Rechazada,
  Cotización Aprobada o Cotizacion Parcialmente Aprobada. (La función
  vuelve a revisar todo; esto solo evita llamarla de más.)
- Acción instantánea: función `cotizacion_reevaluarAprobacion(quoteId)`.

### 3. Función (Deluge)

Si la cotización está en una de las fases que se reevalúan y tiene al menos
una casilla de aprobación en verdadero:

- borra la aprobación anterior (Sub Fase vacía y casillas "Aprobado por…"
  en falso), para que los procesos con pasos encadenados partan de cero;
- pasa la Fase a "Pendiente de Aprobación" pidiendo explícitamente que se
  evalúen los procesos de aprobación y las reglas de flujo (`trigger:
  approval, workflow`). Un cambio de Fase hecho por una regla normal no
  dispara procesos de aprobación; uno hecho por función con este parámetro
  sí.

Las fases que se reevalúan quedan en dos listas al inicio del código para
poder ajustarlas sin tocar el resto.

```deluge
void cotizacion_reevaluarAprobacion(String quoteId)
{
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
}
```

Cambios respecto de v1:
- Ya no exige que la Fase sea "Creada": también actúa sobre aprobadas,
  parcialmente aprobadas y rechazadas.
- Ya no usa "Aprobado por…" para decidir (no es confiable, ver arriba):
  basta con que haya una casilla de aprobación en verdadero.
- Limpia Sub Fase y "Aprobado por…" antes de reenviar.
- Agrega Venta Calzada (no tiene casilla "Aprobado por", se aprueba solo
  por Sub Fase).
- La regla pasa de "cualquier campo" a "campos específicos" para no
  re-disparar con las automatizaciones.

## Qué NO cambia / cómo convive con lo que ya existe

- **Juan Marchant (exento de 10 MM)** y **Sub Gerentes de Ventas Inamar
  Izaje (exentos de precio)**: si la función manda una cotización suya a
  Pendiente y ningún proceso la toma, las reglas ya propuestas
  ("Juan Marchant sin aprobación" / exención Sebastián-Dieter) la devuelven
  a Creada al instante, porque la función dispara reglas de flujo. Por eso
  esas reglas tienen que estar activas antes que esta.
- La regla "SB Enviar Fase de Cotización a Creator" sigue mandando la Fase
  nueva al Cotizador.
- Las notificaciones de aprobación ("Notificar Subgerente Inamar Izaje",
  etc.) se disparan igual que en una aprobación normal.

## Decisiones pendientes de Simón

1. **Enviada**: si una cotización ya aprobada y **enviada al cliente** se
   edita, ¿también vuelve a aprobación? Hoy **no** está incluida (habría que
   agregar "Enviada" a `fasesAprobadas` y a la condición de la regla, y
   validar que el Blueprint lo permita). Recomendación: sí incluirla si en
   la práctica los vendedores editan después de enviar.
2. **Rechazada**: hoy **sí** está incluida (si el vendedor corrige y sigue
   cumpliendo criterios, vuelve a aprobación). Confirmar.
3. **Ediciones que no cambian montos** (ej. solo observaciones o fecha) no
   re-disparan aprobación. Confirmar que es lo esperado.

## A validar en Sandbox antes de pasar a Producción

- Que la regla corra con las ediciones que llegan desde el **Cotizador**
  (vía API). Si no aparece en el historial, el arreglo tiene que hacerlo el
  proveedor en el Cotizador.
- Que el **Blueprint "SB Gestión de Cotizaciones"** deje pasar
  Cotización Aprobada → Pendiente de Aprobación hecho por función.
- Que `Sub_Fase_de_Cotizaci_n = null` limpie la Sub Fase (si da error,
  probar con `""`).
- Que una cotización recién aprobada **no** vuelva sola a aprobación
  (prueba C de la guía).

## Alternativa de fondo

Arreglo en el Cotizador (`EnviarCotizacionACRM`): al actualizar, si hay
casilla de aprobación activa, enviar Fase "Pendiente de Aprobación" y
limpiar Sub Fase. Lo hace el proveedor. Ambas soluciones pueden convivir.
