# Caso: ENOTEC — no aparece "Crédito Simple" al cotizar (Inamar Izaje)

**Fecha:** 2026-10-19
**Cliente:** ASESORIAS INDUSTRIALES ENOTEC S.A. (RUT 99535580-9) —
[ficha](https://crm.zoho.com/crm/org784807563/tab/Accounts/5404724000057082479)
**Oportunidad:** 261019-OP-II-10029-002508 (UN Inamar Izaje, vendedora Vanessa Ponce,
creada 19-10 09:21) — todavía sin cotización.

## Qué tiene hoy el CRM (está bien)

| LC | UN | Forma de Pago | Estado | LC Venta | Vence | ID Creator |
|---|---|---|---|---|---|---|
| IDLINEA-446488 | **Inamar Izaje** | **CREDITO SIMPLE** | VI | $2.000.000 | 31-12-2027 | 4389062000011402036 |
| IDLINEA-353222 | Emaresa | CHEQUE | BL | $0 | 15-02-2012 | 4389062000005472263 |

- La LC de Inamar Izaje pasó a **CREDITO SIMPLE** el **16-10 a las 11:14**
  (venía como "TRANSFERENCIA, EFECTIVO O VALE VISTA"; el ERP también le subió
  la línea de $0 a $2 MM y la fecha de vencimiento). Ese cambio **sí se envió
  al Cotizador** ("Data Updated Successfully").
- La oportunidad se creó el 19-10, o sea, **después** del cambio — el CRM ya
  tenía Crédito Simple cuando se intentó cotizar.
- No es un problema general: otros clientes de Inamar Izaje con LC Crédito
  Simple sí están cotizando con Crédito Simple hoy (Lomas Bayas, AVA
  Montajes, Maestranza Diesel, etc.).

## Causa probable: LC duplicadas/huérfanas en el Cotizador (Creator)

El historial muestra que este cliente tuvo más LC de las que hay hoy en el CRM:

1. **IDLINEA-91920** — creada automáticamente al crear el cliente (06-10-2025).
   **Ya no existe en el CRM** (fue borrada), pero su copia en el Cotizador
   probablemente sigue ahí.
2. **IDLINEA-353222** (la de Emaresa) — en el Cotizador tuvo primero el ID
   `4389062000004693999`; el 12-12-2025 se le borró ese ID por actualización
   masiva y el 01-09-2026 se reenvió quedando con `4389062000005472263`. Es
   posible que el registro viejo (`...4693999`) también haya quedado huérfano.

Esto calza con lo que vio Simón ("tenía 2 LC de Inamar Izaje"): si en el
Cotizador hay **dos LC de Inamar Izaje** para el mismo cliente, el Cotizador
puede estar tomando la vieja (sin Crédito Simple) en vez de la vigente.

## Qué hacer (en el Cotizador / Creator — fuera del alcance del MCP)

1. Buscar en el Cotizador las Líneas de Crédito del RUT **99535580-9**.
2. Dejar solo:
   - Inamar Izaje → ID Creator **4389062000011402036** (Crédito Simple, $2 MM).
   - Emaresa → ID Creator **4389062000005472263**.
3. Borrar cualquier otra (la copia de IDLINEA-91920, y la `...4693999` si
   existe).
4. Pedir a la vendedora que vuelva a abrir el cotizador desde la oportunidad
   002508 y confirme que aparece Crédito Simple.

Si Simón no tiene acceso para borrar en el Cotizador, pedirlo al proveedor
con estos IDs. Si después de limpiar sigue sin aparecer, enviarle este caso
al proveedor tal cual.

## Nota adicional

En la lista "Forma de Pago" (Líneas de Crédito y Cotizaciones) los nombres
visibles no coinciden con los valores internos: "CREDITO SIMPLE" se guarda
internamente como `Contado`, "LETRAS" como `Crédito Simple` y "CHEQUE" como
`Vale Vista`. Hoy no es la causa de este caso (otros clientes funcionan), pero
es un riesgo si alguna integración lee el valor interno. Conviene mencionarlo
al proveedor.
