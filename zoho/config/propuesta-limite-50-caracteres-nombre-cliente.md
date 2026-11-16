# Propuesta: limitar "Nombre de Cliente" a 50 caracteres

## Estado: PROPUESTA — no aplicado en el CRM (esperando OK de Simón)

## Qué se pidió

Que el **Nombre de Cliente** (módulo Clientes / `Accounts`) acepte como máximo
**50 caracteres**.

## Lo que encontré en el CRM (13-11-2026)

| | |
|---|---|
| Campo | `Account_Name` — label "Nombre de Cliente" |
| Tipo | Texto de una línea, **campo estándar del sistema** |
| Largo máximo actual | **200** caracteres |
| Clientes en el CRM | 93.658 |

**El largo de un campo estándar no se puede cambiar** en Zoho (solo se
puede en campos custom). Por eso el límite se hace con una **Regla de
Validación**, que muestra un error y no deja guardar si el nombre pasa de 50.

## Paso a paso (pantallas reales de Zoho)

1. Engranaje ⚙️ (arriba a la derecha) → **Personalización** → **Módulos y campos** → **Clientes**.
2. Pestaña **Reglas de validación** → **+ Nueva regla de validación**.
3. Ventana "Crear regla de validación":
   - Campo: **Nombre de Cliente**
   - Tipo: **Usando la función**
   - Validar el: **Verificar y guardar campo**
   - **Siguiente**.
4. **Nueva función** (o "Crear función"). Ventana "Crear función":
   - Nombre de visualización: `Validar largo Nombre de Cliente`
   - Nombre de la función: `validarLargoNombreCliente`
   - Descripción: `Impide guardar si el Nombre de Cliente supera 50 caracteres.`
   - Idioma: **Deluge** → **Crear**.
5. En el editor: borrar todo y pegar el código de abajo → **Guardar**
   (si pregunta por argumentos, `crmAPIRequest` ya viene incluido; no agregar nada).
6. Volver a la regla → **Guardar**. Revisar que quede **activa**.
7. Probar (50 caracteres guarda / 51 da error / editar un cliente con nombre largo da error).
   Texto de prueba de 50: `ABCDEFGHIJKLMNOPQRSTUVWXYZ ABCDEFGHIJKLMNOPQRSTUVW` · de 51: el mismo + `X`.
8. Si algo falla: desactivar la regla desde la misma pestaña (interruptor) y avisar.

## Cómo aplicarlo

Configuración → Personalización → Módulos y campos → **Clientes** →
pestaña **Reglas de validación** → Nueva regla →
Campo: **Nombre de Cliente** → tipo **"Función"** (Deluge):

```deluge
record = crmAPIRequest.toMap().get("record");
nombre = ifnull(record.get("Account_Name"),"").trim();
response = Map();
if(nombre.length() > 50)
{
	response.put("status","error");
	response.put("message","El Nombre de Cliente no puede superar 50 caracteres (tiene " + nombre.length() + ").");
}
else
{
	response.put("status","success");
}
return response;
```

Probar primero en **Sandbox**:
1. Crear cliente con nombre de 50 caracteres → guarda.
2. Crear cliente con 51 caracteres → muestra el error.
3. Editar un cliente existente con nombre largo → muestra el error (ver riesgo 1).

## Riesgos / a considerar

1. **Clientes que ya tienen más de 50 caracteres**: al editarlos (cualquier
   campo, desde el formulario) la regla les exigirá acortar el nombre.
   Antes de activar conviene sacar un informe/exportación de clientes y
   revisar cuántos superan 50 (con 93 mil registros hay que hacerlo por
   exportación o Bulk Read; se puede preparar con OK).
2. **Integraciones (ERP / Cotizador Creator)**: las reglas de validación
   aplican al formulario del CRM; los clientes creados o actualizados por
   API/integración pueden no pasar por la regla. Si el objetivo es que el
   nombre calce con un límite del ERP, hay que confirmar que la
   integración también corte o rechace nombres largos.
3. Alternativa más suave: un **Client Script** que avise mientras se
   escribe (sin bloquear). Se puede preparar si se prefiere aviso en vez de bloqueo.

## Actualización 16-11: límite de licencia

Al crear la regla, Zoho bloqueó "Usando la función": **el plan permite máximo
3 reglas de validación por función y ya están usadas**. Alternativas:

- **A (preferida si existe):** agregar el chequeo de largo dentro de una
  regla por función que **ya exista en Clientes** (la función recibe el
  registro completo). Requiere ver ese código antes de tocarlo.
- **B:** **Client Script** en Clientes, página Crear y página Editar, evento
  `onSave` (Configuración → Herramientas para desarrolladores → Client Script):

```javascript
var nombre = (ZDK.Page.getField('Account_Name').getValue() || '').trim();
if (nombre.length > 50) {
    ZDK.Client.showAlert('El Nombre de Cliente no puede superar 50 caracteres (tiene ' + nombre.length + ').');
    return false;
}
```

- **C:** liberar un cupo desactivando una regla por función que ya no se use.
- "Basado en criterios" no sirve: no tiene condición de largo de texto.

## Decisión 16-11: opción A — dentro de "SB Validar RUT"

Las 3 reglas por función de Clientes son RUT, Teléfono y Celular. Se agrega el
chequeo al inicio de la función `SBvalidarRut` (regla del campo RUT, "Solo
guardar"). Resto del código sin cambios. Código completo (antes de pegar,
este es el que va): `zoho/config/funciones/SBvalidarRut.deluge`.
Si hay que volver atrás: borrar el bloque entre "Largo máximo de Nombre de
Cliente" y "Fin chequeo Nombre de Cliente".
