// PROPUESTA 2026-11-19 — SOLO SANDBOX. Botón "Clonar Cotización" con disclaimer (Sí/No) antes del Cotizador.
// Requiere que Zoho permita Client Script como acción/evento de botón personalizado
// (a confirmar por Simón: Developer Hub → Client Script → evento de botón, o
// "Definir acción" del botón → Client Script).
// A validar: ZDK.Client.showConfirmation y $Client.openURL (no confirmados en doc oficial).
var fase = ZDK.Page.getField('Quote_Stage').getValue();
var idCreator = ZDK.Page.getField('ID_Creator').getValue();
var permitidas = ['Creada', 'Cotización Aprobada', 'Cotización Rechazada', 'Enviada',
                  'Cerrada Ganada', 'Cerrada Perdida', 'Lista para Clonar'];

if (permitidas.indexOf(fase) === -1) {
    ZDK.Client.showAlert('La cotización está en fase "' + fase + '" que no se permite clonar!');
    return false;
}
if (fase === 'Cerrada Ganada') {
    var acepta = ZDK.Client.showConfirmation(
        'Va a clonar una cotización Cerrada Ganada. Se creará una oportunidad nueva. ' +
        'Puede usar el mismo cliente u otro; el cliente debe tener Contacto, Sucursal del Cliente ' +
        '(y Obra en Rental) y Plazo/Forma de Pago, o el Cotizador no dejará guardar. ¿Desea continuar?',
        'Sí, continuar', 'Cancelar');
    if (!acepta) {
        return false;
    }
}
// Sandbox: Cotizador de desarrollo. Producción: https://creatorapp.zoho.com/emaresa/cotizador#Form:Generar_Cotizaciones?Clonar_Cot=
var url = 'https://creatorapp.zoho.com/emaresa/environment/development/cotizador#Form:Generar_Cotizaciones?Clonar_Cot=' + idCreator;
$Client.openURL(url, 'parent window');
