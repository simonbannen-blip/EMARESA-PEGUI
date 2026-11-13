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
