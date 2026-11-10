# Propuesta: que al clonar a otro cliente el sistema limpie los datos del cliente anterior

Fecha: 2026-11-10 · Estado: **propuesta, pendiente OK de Simón** (Client Script;
lo aplica Simón en Zoho, el MCP no edita Client Scripts). Probar primero en Sandbox.

Contexto: `caso-clonar-cotizacion-a-otro-cliente.md`.

## Lo que ya se puede hacer hoy (sin cambios)
En la pantalla de Clonar, Cliente, Contacto, Sucursal del Cliente y Oportunidad
son **editables para todos los perfiles** (revisado en la metadata). O sea, el
vendedor ya puede cambiarlos él mismo antes de guardar. Plazo de Pago está
oculto para Vendedor MIV y es de solo lectura para Vendedor MAK. Obra Rental
está oculta para los perfiles MIV/MAK.
Si el cliente nuevo no tiene oportunidad, hay que crearla antes.

## Mejora propuesta: 2 Client Scripts en Cotizaciones · página Clonar

### Script 1 — "Clonar: limpiar datos al cambiar cliente"
Tipo de evento: **Campo** → Nombre de Cliente (`Account_Name`) → **onChange**.
```js
// Al cambiar el cliente en una cotización clonada, borra los datos
// que pertenecen al cliente anterior para obligar a elegir los del nuevo.
var campos = ['Contact_Name', 'Sucursal_del_Cliente', 'Deal_Name', 'Obra_Rental'];
campos.forEach(function (api) {
    var campo = ZDK.Page.getField(api);
    if (campo) { campo.setValue(null); }
});
ZDK.Client.showMessage('Cambiaste el cliente: elige Contacto, Sucursal del Cliente y Oportunidad del cliente nuevo antes de guardar.', { type: 'info' });
```

### Script 2 — "Clonar: exigir datos del cliente"
Tipo de evento: **Página** → **onSave**.
```js
// No deja guardar el clon si falta contacto, sucursal u oportunidad.
var faltan = [];
if (!ZDK.Page.getField('Contact_Name').getValue()) { faltan.push('Contacto'); }
if (!ZDK.Page.getField('Sucursal_del_Cliente').getValue()) { faltan.push('Sucursal del Cliente'); }
if (!ZDK.Page.getField('Deal_Name').getValue()) { faltan.push('Oportunidad'); }
if (faltan.length > 0) {
    ZDK.Client.showAlert('Antes de guardar completa: ' + faltan.join(', ') + ' (del cliente nuevo).');
    return false;
}
```

Resultado: el vendedor clona, cambia el RUT, el sistema vacía contacto, sucursal
y oportunidad, le avisa, y no lo deja guardar hasta que elija los del cliente
nuevo. Los buscadores de Contacto y Sucursal ya filtran por cliente, así que
solo le muestran los del cliente nuevo.

## Paso a paso (Sandbox primero)
1. Configuración → Developer Hub → **Client Script** → Nuevo script.
2. Módulo **Cotizaciones**, Diseño Standard, Página **Clonar**.
3. Script 1: evento de Campo, campo Nombre de Cliente, onChange → pegar código → Guardar.
4. Script 2: evento de Página, onSave → pegar código → Guardar.
5. Probar: clonar una cotización, cambiar el cliente → deben vaciarse los 3
   campos; intentar guardar sin llenarlos → alerta; llenarlos → guarda.

## Puntos a validar
- Que `setValue(null)` funcione en los campos de búsqueda en la página Clonar
  (en una prueba anterior un setValue dentro de onSave no aplicó; aquí va en onChange).
- El script existente "Deshabilitar clonar cotización" (onSave, filtro por
  perfil) sigue mandando: quien no esté en su lista igual no podrá clonar.
- No aplica a Rental (allí se clona por el botón "Clonar Cotización", que usa el Cotizador).
