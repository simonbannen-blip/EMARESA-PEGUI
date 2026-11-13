# Guía paso a paso: Probabilidad por fase en Oportunidades (Sandbox → pruebas → Producción)

**Pedido (correo a Simón, 13-11-2026):** definir la probabilidad de cada
Oportunidad según la fase, el tipo de cotización y la preferencia del
cliente, para saber qué parte de los ~6.500 MM CLP en "Cotización Enviada"
son estimativas o a firme, y si nos prefieren o no. Objetivo: empujar las
de 35% hacia 70%.

## La tabla (9 opciones)

| Fase | Tipo de cotización | Preferencia del cliente | Probabilidad |
|---|---|---|---|
| Creada | — | — | **5%** |
| Necesita Análisis | — | — | **10%** |
| Cotización Enviada | Estimativa / Budget | Prefiere a la competencia | **15%** |
| Cotización Enviada | Estimativa / Budget | Nos prefiere | **20%** |
| Cotización Enviada | A Firme | Prefiere a la competencia | **35%** |
| Cotización Enviada | A Firme | Nos prefiere | **70%** |
| Negociación | — | Nos prefiere | **90%** |
| Negociación | — | Indiferente | **60%** |
| Negociación | — | Prefiere a la competencia | **10%** |
| Cerrada Ganada | — | — | 100% (sin cambio) |
| Cerrada Perdida / Declinada | — | — | 0% (sin cambio) |

## Cómo se arma (resumen)

1. **Dos campos nuevos** en Oportunidades: *Tipo de Cotización* y
   *Preferencia del Cliente* (listas de selección).
2. **Probabilidad por defecto de cada fase** cambiada a la opción más baja
   / neutra (Creada 5, Necesita Análisis 10, Cotización Enviada 15,
   Negociación 60). Así, si el vendedor todavía no clasifica, la
   Oportunidad queda en el valor conservador.
3. **Una regla + función** que, cada vez que se crea o edita una
   Oportunidad, calcula la probabilidad con la tabla y la deja en el campo
   estándar **Probabilidad (%)**. Con eso el campo estándar **Ingresos
   esperados** (Monto × Probabilidad) queda bien solo, y sirve para el
   embudo ponderado.

> ¿Por qué la probabilidad por defecto también? La fase "Cotización
> Enviada" la pone sola la regla de Cotizaciones ("SB Actualizar Fase de
> Oportunidad según Cotización"), y un cambio hecho por una regla **no
> dispara otras reglas**. Con el valor por defecto en 15%, la Oportunidad
> queda bien igual; cuando el vendedor la edita para clasificarla, la
> regla la sube a 20 / 35 / 70.

---

## Parte 0 — Antes de empezar

1. Entra al Sandbox (**Configuración → Espacio de desarrollador → Sandbox →
   Abrir**). Ojalá con algunas Oportunidades copiadas de Producción (si no,
   crea 4–5 a mano en el Sandbox).
2. Anota los valores actuales de probabilidad de cada fase (hoy en
   Producción: Creada 0, Necesita Análisis 20, Cotización Enviada 75,
   Negociación 90, Cerrada Ganada 100, Cerrada Perdida 0, Declinada 0,
   Contactado 0). Sirven para volver atrás si algo falla.

## Parte 1 — Crear los dos campos (10 min)

**Configuración → Personalización → Módulos y campos → Oportunidades →
Diseño Standard.**

1. Arrastra una **Lista de selección** a la sección principal (cerca de
   Fase y Monto).
   - Etiqueta: `Tipo de Cotización`
   - Valores (en este orden): `-None-`, `Estimativa / Budget`, `A Firme`
   - Valor predeterminado: `-None-`
2. Arrastra otra **Lista de selección**:
   - Etiqueta: `Preferencia del Cliente`
   - Valores: `-None-`, `Nos prefiere`, `Indiferente`,
     `Prefiere a la competencia`
   - Valor predeterminado: `-None-`
3. **Guardar diseño.**
4. Revisa los **nombres API** que les puso Zoho: **Configuración →
   Desarrollador → APIs → Nombres de API → Oportunidades**. Deberían ser
   `Tipo_de_Cotizacion` y `Preferencia_del_Cliente`. Si salen distintos,
   cámbialos en las líneas 6 y 7 del código de la Parte 3.

## Parte 2 — Probabilidad por defecto de cada fase (5 min)

**Configuración → Personalización → Módulos y campos → Oportunidades →
Diseño Standard → campo Fase → ⚙ → Editar propiedades** (o **Pipelines**,
si la probabilidad aparece ahí).

| Fase | Antes | Después |
|---|---|---|
| Creada | 0 | **5** |
| Necesita Análisis | 20 | **10** |
| Cotización Enviada | 75 | **15** |
| Negociación | 90 | **60** |
| Cerrada Ganada / Perdida / Declinada / Contactado | — | sin cambio |

Si en Sandbox ya existe la fase "Actualización de oferta" (Inamar Vapor),
déjala igual que Cotización Enviada: **15**.

## Parte 3 — Regla y función (10 min)

1. **Configuración → Automatización → Reglas de flujo de trabajo → + Crear
   regla.**
   - Módulo: **Oportunidades**
   - Nombre: `SB Calcular Probabilidad`
   - Descripción: `Calcula Probabilidad (%) según Fase, Tipo de Cotización y Preferencia del Cliente.`
2. **¿Cuándo?** → **Acción del registro → Crear o editar** → marcar
   **"Repetir esta regla de flujo cada vez que se edite un registro"**.
3. **Condición:** **Todas las oportunidades**.
4. **Acciones instantáneas → Función → + Nueva función → Escribir su
   propia función.**
   - Nombre: `calcularProbabilidad` — Nombre visible: `Calcular Probabilidad`
5. Borra lo que trae el editor y pega:

```deluge
void automation.calcularProbabilidad(Int dealId)
{
	deal = zoho.crm.getRecordById("Deals", dealId);
	fase = ifnull(deal.get("Stage"), "");
	// Nombres API de los campos nuevos (revisar en Parte 1, paso 4)
	tipo = ifnull(deal.get("Tipo_de_Cotizacion"), "");
	pref = ifnull(deal.get("Preferencia_del_Cliente"), "");
	prob = -1;
	if(fase == "Creada")
	{
		prob = 5;
	}
	else if(fase == "Necesita Análisis")
	{
		prob = 10;
	}
	else if(fase == "Cotización Enviada" || fase == "Actualización de oferta")
	{
		if(tipo == "A Firme")
		{
			if(pref == "Nos prefiere")
			{
				prob = 70;
			}
			else
			{
				prob = 35;
			}
		}
		else
		{
			// Estimativa / Budget, o sin clasificar
			if(pref == "Nos prefiere")
			{
				prob = 20;
			}
			else
			{
				prob = 15;
			}
		}
	}
	else if(fase == "Negociación")
	{
		if(pref == "Nos prefiere")
		{
			prob = 90;
		}
		else if(pref == "Prefiere a la competencia")
		{
			prob = 10;
		}
		else
		{
			// Indiferente, o sin clasificar
			prob = 60;
		}
	}
	// Cerradas, Declinada u otras fases: no se toca
	if(prob < 0)
	{
		return;
	}
	actual = ifnull(deal.get("Probability"), -1).toLong();
	if(actual != prob)
	{
		resp = zoho.crm.updateRecord("Deals", dealId, {"Probability":prob});
		info resp;
	}
}
```

6. **Editar argumentos:** `dealId` = **Oportunidades → ID de
   Oportunidades**. Guardar.
7. **Guardar** la regla (queda activa).

> Si al guardar la función sale "Improper code format", revisa que la
> primera línea sea exactamente `void automation.calcularProbabilidad(Int dealId)`
> (el nombre tiene que calzar con el que Zoho le dio a la función).

> La función actualiza sin volver a disparar reglas (no queda en bucle).

## Parte 4 — Pruebas en Sandbox

Crea u ocupa una Oportunidad de prueba y ve cambiando cosas. Después de
cada **Guardar**, refresca y mira **Probabilidad (%)** e **Ingresos
esperados**.

| # | Qué hacer | Debe quedar |
|---|---|---|
| A | Crear Oportunidad nueva (Fase Creada) | 5 |
| B | Pasarla a Necesita Análisis (Blueprint) | 10 |
| C | Pasarla a Cotización Enviada, sin llenar nada | 15 |
| D | Tipo = Estimativa / Budget, Preferencia = Nos prefiere | 20 |
| E | Tipo = A Firme, Preferencia = Prefiere a la competencia | 35 |
| F | Tipo = A Firme, Preferencia = Nos prefiere | 70 |
| G | Pasarla a Negociación (deja Preferencia = Nos prefiere) | 90 |
| H | Preferencia = Indiferente | 60 |
| I | Preferencia = Prefiere a la competencia | 10 |
| J | Cerrarla Ganada | 100 (no la toca la regla) |
| K | Cotización de prueba pasada a "Enviada" → la Oportunidad cambia sola a Cotización Enviada | 15 (por defecto de la fase) |
| L | Revisar que el **aviso al KAM** siga llegando con la prueba K | llega el correo |

Si alguna no calza, mira **Configuración → Desarrollador → Funciones →
calcularProbabilidad → Registros de ejecución** y mándame el detalle.

> **Ojo con G:** al mover la fase con el Blueprint, Zoho pone primero el
> valor por defecto (60) y luego la regla lo corrige a 90. Si se queda en
> 60, es que la transición del Blueprint no disparó la regla: me avisas y
> agregamos la función también en el "Después" de esa transición.

## Parte 5 — Antes de pasar a Producción (revisar conmigo)

1. **Reglas que usan "Probabilidad = 75" o "= 90" como condición.** La
   alerta "SB Aviso KAM - Cotización Enviada" pudo haberse armado con
   *Probabilidad (%) es 75* en vez de *Fase*. Si es así, dejaría de
   funcionar: hay que cambiar esa condición a *Fase es Cotización
   Enviada* **antes** de cambiar las probabilidades. Revisar también
   informes, paneles y vistas que filtren por Probabilidad.
2. **Oportunidades abiertas que ya existen.** Cambiar la probabilidad por
   defecto de una fase **no** recalcula las Oportunidades que ya están en
   ella. Después de activar en Producción hay que recalcular las abiertas
   (Creada, Necesita Análisis, Cotización Enviada, Negociación) — lo puedo
   hacer yo por API con tu OK, sin disparar otras automatizaciones.
3. **Clasificar la cartera.** Las que hoy están en Cotización Enviada
   quedan en 15% hasta que el vendedor llene Tipo y Preferencia. Sugerido:
   una vista "Cotización Enviada sin clasificar" (Tipo de Cotización está
   vacío) para que cada vendedor las complete.
4. (Opcional) Dejar **Probabilidad (%)** como solo lectura para los
   perfiles de vendedor, para que no la sobrescriban a mano.
5. (Opcional) Hacer obligatoria *Preferencia del Cliente* en la transición
   del Blueprint de Cotización Enviada → Negociación.

## Parte 6 — Pasar a Producción

Mismo orden: Parte 1 (campos) → corregir reglas/informes del punto 5.1 →
Parte 2 (probabilidades por fase) → Parte 3 (regla + función) → prueba
rápida A–F con una Oportunidad real de prueba → recálculo de las abiertas
(punto 5.2).

## Para el embudo

Con la probabilidad cargada, el embudo puede mostrar **Ingresos
esperados** (monto ponderado) en vez de Monto, o un informe de Cotización
Enviada agrupado por *Tipo de Cotización* y *Preferencia del Cliente*
(ver cuánto de los 6.500 MM está en 15 / 20 / 35 / 70%).

## Dudas para confirmar con quien lo pidió

1. En **Cotización Enviada**, si el cliente es **Indiferente** (esa opción
   solo está definida en Negociación): la guía lo trata como "prefiere a
   la competencia" (15% / 35%, lo más conservador). ¿Está bien?
2. ¿Aplica a **todas las Unidades de Negocio** (incluido Rental) o solo a
   algunas?
3. ¿Quién llena *Tipo* y *Preferencia*: el vendedor dueño de la
   Oportunidad?
