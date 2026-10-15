# Propuesta: crear Segmento "Top" automático para clientes nuevos de Industria y Ferretería

## Estado: PROBADO OK EN SANDBOX (2026-10-15) — falta prueba negativa y pasar a Producción

**Decisión de Simón (2026-10-15):** todos los clientes existentes de IyF ya
tienen algún segmento, así que **no hace falta carga masiva ni la opción C**.
Solo se necesita que los clientes **nuevos creados por vendedores de IyF**
nazcan con su Segmento asociado "Top" → se usa la **opción A**.

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

~~Recomendación inicial: A + C~~ (descartada: se eligió solo A).
Recomendación original: A + C — A para los que crea el vendedor, C como red
para los que vienen del ERP. Ambos usan la misma función y nunca duplican
(si el cliente ya tiene segmento en IyF, no hace nada).

> **Código y paso a paso final (Sandbox + pruebas + Producción):**
> `guia-sandbox-segmento-top-iyf.md`. Esa versión no usa IDs fijos (busca la
> UN por nombre y el usuario ERP por correo). El código de abajo es el
> borrador original.

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

## Pasos para armarlo

1. En **Sandbox**: crear la función de arriba (Configuración →
   Desarrollador → Funciones → Nueva función → categoría Automatización)
   y la regla de flujo en Clientes "Al crear" que la llame.
2. Probar: un vendedor de IyF crea un cliente de prueba → en su lista
   "Segmento asociado" debe aparecer un registro UN = Industria y
   Ferretería, Segmento = Top. Crear otro cliente con un usuario que no
   sea de IyF → no debe crearse nada.
3. Si funciona, repetir los mismos pasos en Producción.

> Nota: un vendedor nuevo de IyF tiene que estar cargado en "Usuarios por
> UN" con UN = Industria y Ferretería para que sus clientes reciban el Top.

> Las reglas de flujo y funciones no se pueden crear con las herramientas
> conectadas a esta sesión — se arman a mano en Zoho con los pasos de arriba.
