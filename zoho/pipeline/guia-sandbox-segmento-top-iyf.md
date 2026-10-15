# Guía paso a paso: Segmento "Top" automático para clientes nuevos de IyF (Sandbox → pruebas → Producción)

Relacionado: `propuesta-flujo-segmento-top-clientes-nuevos-iyf.md` (opción A elegida).

**Objetivo:** cuando un vendedor de Industria y Ferretería crea un Cliente,
se crea solo un registro en "Segmento asociado" con
UN = Industria y Ferretería y Segmento = Top.

> Cambio respecto a la propuesta: el código ya **no usa IDs fijos**. Busca la
> UN por su nombre y reconoce al usuario del ERP por su correo, así funciona
> igual en Sandbox y en Producción (en Sandbox los IDs pueden ser distintos).

---

## Parte 0 — Antes de empezar (5 min)

1. Entra al Sandbox: **Configuración → Espacio de desarrollador (Developer
   Hub) → Sandbox** → en tu sandbox, **Acceder / Abrir Sandbox**.
   Si no tienes uno, crea uno ahí mismo ("Nuevo Sandbox") y **marca copiar
   datos** de, al menos, Unidades de Negocio, Usuarios por UN y Segmentos de
   Cuentas.
2. En el Sandbox revisa que existan estos datos (si no, créalos a mano):
   - Módulo **Unidades de Negocio**: un registro llamado exactamente
     **Industria y Ferretería** (con tilde).
   - Módulo **Usuarios por UN**: tu usuario (**Simon Tirapegui**) con
     UN = Industria y Ferretería. En Producción ya estás cargado así, con
     código 1111, así que puedes hacer las pruebas tú mismo.
3. **Muy importante:** los Clientes y Segmentos tienen integraciones con
   Creator / ERP (campos "ID Creator", "Respuesta_Creator", "Log ERP").
   En el Sandbox ve a **Configuración → Automatización → Reglas de flujo de
   trabajo**, filtra por módulos **Clientes** y **Segmentos de Cuentas**, y
   **desactiva** las reglas que envían datos a Creator o al ERP. Así los
   clientes de prueba no llegan a sistemas reales. (Esto se hace **solo en
   Sandbox**: en Producción no se toca nada.)

---

> **Envío a Creator:** los registros creados desde una función **no disparan
> las reglas de flujo** salvo que se pida explícitamente. Por eso el
> `createRecord` lleva `{"trigger":{"workflow"}}`: así corre la regla
> existente "Enviar Segmento de Cuenta a Creator" igual que cuando el
> segmento se crea a mano. Si Creator rechaza el segmento porque el cliente
> aún no llegó a Creator, se puede reenviar marcando el check "reprocesar"
> del segmento (a confirmar) o agregar una espera.

## Parte 1 — Crear la regla y la función en Sandbox (10 min)

1. **Configuración → Automatización → Reglas de flujo de trabajo →
   + Crear regla.**
   - Módulo: **Clientes**
   - Nombre: `Segmento Top clientes nuevos IyF`
   - Descripción: `Crea Segmento asociado Top (UN Industria y Ferretería) cuando un vendedor de IyF crea un cliente.`
   - Clic en **Siguiente**.
2. **¿Cuándo ejecutar?** → **Acción del registro** → **Crear**.
   Clic en **Siguiente**.
3. **Condición:** **Todos los clientes** (el filtro lo hace la función).
4. **Acciones instantáneas → Función → + Nueva función → Escribir su
   propia función.**
   - Nombre de la función: `crearSegmentoTopIyF`
   - Nombre visible: `Crear Segmento Top IyF`
   - Clic en **Crear**.
5. Se abre el editor. **Borra todo lo que trae** y pega este código
   completo:

```deluge
void automation.crearSegmentoTopIyF(Int cuentaId)
{
	// 1. Datos del cliente recién creado
	cuenta = zoho.crm.getRecordById("Accounts", cuentaId);
	creador = cuenta.get("Created_By");
	if(creador == null)
	{
		return;
	}
	creadorId = creador.get("id").toString();
	creadorEmail = ifnull(creador.get("email"), "");
	// 2. Los clientes que llegan del ERP (usuario de integración) no aplican
	if(creadorEmail == "infraestructura@emaresa.cl")
	{
		info "Cliente creado por integración ERP: no aplica";
		return;
	}
	// 3. Buscar la UN Industria y Ferretería por su nombre
	uns = zoho.crm.searchRecords("Unidades_de_Negocio", "(Name:equals:Industria y Ferretería)");
	if(uns.size() == 0)
	{
		info "No se encontró la UN Industria y Ferretería";
		return;
	}
	unIyF = uns.get(0).get("id").toString();
	// 4. ¿Quien creó el cliente es vendedor de IyF? (no se usa "Activo?" porque está mal cargado)
	esIyF = false;
	vendedores = zoho.crm.searchRecords("Vendedores_por_UN", "(UN:equals:" + unIyF + ")");
	for each v in vendedores
	{
		if(v.get("Vendedor") != null && v.get("Vendedor").get("id").toString() == creadorId)
		{
			esIyF = true;
		}
	}
	if(!esIyF)
	{
		info "El creador no es vendedor de IyF: no aplica";
		return;
	}
	// 5. Evitar duplicados: si ya tiene segmento en IyF, no crear otro
	existentes = zoho.crm.searchRecords("Segmentos_de_Cuentas", "((Cuenta:equals:" + cuentaId + ")and(UN:equals:" + unIyF + "))");
	if(existentes.size() > 0)
	{
		info "El cliente ya tiene segmento en IyF: no se crea otro";
		return;
	}
	// 6. Crear el Segmento asociado Top
	nuevo = Map();
	nuevo.put("Cuenta", cuentaId);
	nuevo.put("UN", unIyF);
	nuevo.put("Segmento", "Top");
	// trigger workflow: para que corra la regla "Enviar Segmento de Cuenta a Creator"
	resp = zoho.crm.createRecord("Segmentos_de_Cuentas", nuevo, {"trigger":{"workflow"}});
	info resp;
}
```

   > Si el editor ya trae escrita la primera línea (`void automation...`),
   > deja la suya y pega solo desde `// 1. Datos del cliente` hasta el
   > final, antes de la última `}`.

6. Arriba a la derecha, **Editar argumentos**:
   - Nombre del argumento: `cuentaId`
   - Valor: elige **Clientes → ID de Cliente**.
   - Guarda.
7. Clic en **Guardar** (abajo). Si marca un error, copia el mensaje y
   envíamelo.
8. De vuelta en la regla: **Guardar** la regla. Verifica que quede
   **activa** (interruptor en verde).

---

## Parte 2 — Pruebas en Sandbox (15 min)

Anota el resultado de cada prueba (✅ / ❌).

### Prueba 1 — Vendedor de IyF crea un cliente → debe crear Top

1. Con tu usuario (que está en Usuarios por UN como IyF), ve a
   **Clientes → + Crear Cliente**.
2. Nombre: `PRUEBA SEG TOP 1`, RUT de prueba (ej. `11111111-1`), lo mínimo
   obligatorio. **Guardar**.
3. Espera unos segundos y **refresca** la ficha.
4. Baja a la lista relacionada **Segmento asociado**.
   **Esperado:** 1 registro con UN = **Industria y Ferretería** y
   Segmento = **Top**.

### Prueba 2 — Usuario que NO es de IyF → no debe crear nada

1. En **Usuarios por UN**, busca tus registros con UN = Industria y
   Ferretería (hay más de uno) y, **solo en Sandbox**, cámbiales la UN a
   otra (ej. Construcción). Guarda.
2. Crea el cliente `PRUEBA SEG TOP 2`.
3. **Esperado:** "Segmento asociado" **vacío**.
4. Devuelve tus registros de Usuarios por UN a **Industria y
   Ferretería**.

### Prueba 3 — No duplica

1. Abre la función: **Configuración → Espacio de desarrollador →
   Funciones → Crear Segmento Top IyF → Ejecutar**.
2. Cuando pida `cuentaId`, pega el ID de `PRUEBA SEG TOP 1` (es el número
   largo al final de la URL de la ficha del cliente).
3. **Esperado:** el resultado dice "El cliente ya tiene segmento en IyF:
   no se crea otro", y el cliente sigue con **1 solo** segmento.

### Prueba 4 — Editar un cliente no dispara nada

1. Edita cualquier campo de `PRUEBA SEG TOP 2` (ej. Descripción) y guarda.
2. **Esperado:** sigue sin segmento (la regla corre solo al crear).

### Si algo falla

- **Configuración → Automatización → Acciones → Funciones → Crear Segmento
  Top IyF → Registros/Logs de ejecución**: ahí sale el mensaje
  (`info`) de por qué no creó el segmento. Envíame una captura.
- Lo más común: la UN no se llama exactamente "Industria y Ferretería" en
  Sandbox, o tu usuario no está en Usuarios por UN.

Al terminar, borra los clientes y segmentos `PRUEBA SEG TOP` del Sandbox.

---

## Parte 3 — Pasar a Producción (5 min)

1. En el Sandbox: **Configuración → Espacio de desarrollador → Sandbox →
   Implementar / Desplegar cambios** (Deploy).
2. Selecciona solo:
   - Regla de flujo de trabajo **Segmento Top clientes nuevos IyF**
   - Función **Crear Segmento Top IyF**
   - **No** incluyas las reglas de Creator/ERP que desactivaste en la Parte 0
     (en Producción deben seguir activas tal cual).
3. Implementa y, en **Producción**, revisa que la regla quede **activa**.
4. Prueba de humo en Producción: pide a un vendedor de IyF que cree su
   próximo cliente real (o créalo tú) y revisa que aparezca el Top en
   "Segmento asociado".

> Recordatorio: cada vendedor nuevo de IyF tiene que estar cargado en
> **Usuarios por UN** con UN = Industria y Ferretería para que sus clientes
> reciban el Top automáticamente.
