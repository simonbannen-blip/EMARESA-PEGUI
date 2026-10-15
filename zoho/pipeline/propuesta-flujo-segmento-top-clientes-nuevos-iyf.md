# Propuesta: crear Segmento "Top" automático para clientes nuevos de Industria y Ferretería

## Estado: PROPUESTO — falta que Simón confirme cómo reconocer a un cliente "de IyF"

## Qué se pidió

Que al crear un Cliente nuevo de **Industria y Ferretería** se cree solo su
registro en **Segmentos de Cuentas** con Segmento = **Top**.

## Lo que encontré revisando Zoho (solo lectura, 2026-10-15)

- El segmento vive en el módulo **Segmentos de Cuentas**
  (`Segmentos_de_Cuentas`): un registro por Cliente + UN con los campos
  `Cuenta` (Cliente), `UN` (Unidad de Negocio) y `Segmento` (lista, incluye
  "Top"). Aparece en el Cliente como lista relacionada "Segmento asociado".
- UN Industria y Ferretería: id `5404724000032587507`.
- Hoy los segmentos "Top" de IyF se están cargando **a mano / por lote**
  (ej.: lote del 07-10 y SEG-13948 del 09-10, todos por Carrasco Garrido).
- **Problema: el Cliente no tiene ningún campo que diga a qué UN pertenece.**
  - "Empresas" no sirve: IyF es parte de la empresa Emaresa, igual que
    Construcción, Rental y Agroforestal.
  - "Cartera de Clientes" (Cliente + UN + Vendedor) no se está usando para
    clientes nuevos (la última de IyF es de dic-2025).
  - La gran mayoría de los clientes nuevos los crea el **usuario de
    integración "Emaresa" desde el ERP** (Origen = ERP), sin vendedor ni UN.
    Solo algunos los crea directamente un vendedor.

Por eso hay que definir **qué condición dice que un cliente nuevo es de
IyF**. Opciones:

| Opción | Cómo se reconoce al cliente de IyF | Pros / contras |
|---|---|---|
| **A. Por quien lo crea** | El usuario que crea el Cliente está en "Usuarios por UN" con UN = IyF | Sin campos nuevos. No cubre los clientes que llegan del ERP (usuario "Emaresa", que está en varias UN). |
| **B. Campo nuevo en Clientes** | Campo lista "UN de origen" en Clientes; si = Industria y Ferretería → Top | Lo más claro y explícito. Requiere que se complete al crear (y que el ERP lo mande, o un vendedor lo llene). |
| **C. Al primer negocio en IyF** | Cuando se crea la primera Oportunidad/Cotización con UN = IyF de un cliente que no tiene segmento en IyF | Cubre también los clientes del ERP. Se crea al primer negocio, no en el minuto en que nace el cliente. |

**Recomendación: A + C** — A para los que crea el vendedor, C como red
para los que vienen del ERP. Ambos usan la misma función y nunca duplican
(si el cliente ya tiene segmento en IyF, no hace nada).

## Flujo (opción A) — Configuración → Automatización → Reglas de flujo de trabajo

1. Módulo **Clientes** → Cuándo: **Al crear el registro**.
2. Condición: todos los registros (el filtro lo hace la función).
3. Acción: **Función** nueva, argumento `cuentaId` = ID del Cliente.

```deluge
void crearSegmentoTopIyF(int cuentaId)
{
	unIyF = 5404724000032587507;
	usuarioIntegracion = 5404724000000392005;   // usuario "Emaresa" (ERP)
	cuenta = zoho.crm.getRecordById("Accounts", cuentaId);
	creadorId = cuenta.get("Created_By").get("id").toLong();
	if(creadorId == usuarioIntegracion)
	{
		return;
	}
	// ¿el creador es vendedor de IyF? (no se filtra por "Activo?" porque está mal cargado)
	esIyF = false;
	vendedores = zoho.crm.searchRecords("Vendedores_por_UN", "(UN:equals:" + unIyF + ")");
	for each v in vendedores
	{
		if(v.get("Vendedor") != null && v.get("Vendedor").get("id").toLong() == creadorId)
		{
			esIyF = true;
		}
	}
	if(!esIyF)
	{
		return;
	}
	// evitar duplicados
	existentes = zoho.crm.searchRecords("Segmentos_de_Cuentas", "((Cuenta:equals:" + cuentaId + ")and(UN:equals:" + unIyF + "))");
	if(existentes.size() == 0)
	{
		nuevo = Map();
		nuevo.put("Cuenta", cuentaId);
		nuevo.put("UN", unIyF);
		nuevo.put("Segmento", "Top");
		resp = zoho.crm.createRecord("Segmentos_de_Cuentas", nuevo);
		info resp;
	}
}
```

## Flujo (opción C) — red para clientes del ERP

Regla en **Oportunidades** (y/o Cotizaciones) → Al crear → Condición
`UN` es Industria y Ferretería → Función con argumento `cuentaId` =
Cliente de la Oportunidad. Mismo código desde "evitar duplicados" en
adelante (sin el chequeo de creador).

## Pendiente antes de armarlo

1. Simón elige A, B, C o combinación.
2. Confirmar si los clientes nuevos ya existentes sin segmento IyF se
   completan con una carga única (eso sí lo puedo hacer yo por API, con OK).
3. Probar primero en Sandbox con un cliente creado por un vendedor de IyF.

> Las reglas de flujo y funciones no se pueden crear con las herramientas
> conectadas a esta sesión — se arman a mano en Zoho con los pasos de arriba.
