# Propuesta: flujo automático para completar "Segmento Cliente Asociado" en Oportunidades

## Estado: PROPUESTO — pendiente de que Simón lo arme en Zoho (ver limitación abajo)

## Qué se pidió

Que el campo **Segmento Cliente Asociado** de la Oportunidad se complete solo,
tomando el dato del Segmento que tiene el Cliente asociado.

## Lo que encontré revisando Zoho

- El campo **ya existe** en Oportunidades: `Segmento_Cliente_Asociado`
  ("Segmento Cliente Asociado"), tipo lista desplegable, creado el
  2026-07-24. Ya trae una nota interna que dice: *"Se completa
  automáticamente según el Segmento del Cliente para la misma Unidad de
  Negocio de la Oportunidad."* — o sea, la idea ya estaba pensada, pero el
  mecanismo que lo completa nunca se armó. Por eso hoy queda vacío.
- El "Segmento" del Cliente **no vive como campo directo en Clientes**.
  Vive en un módulo aparte: **Segmentos de Cuentas**
  (`Segmentos_de_Cuentas`), donde cada registro conecta:
  - **Cuenta** (el Cliente)
  - **UN** (Unidad de Negocio)
  - **Segmento** (Oro, Plata, Bronce, Top, Premium, Constructora - X,
    Minería - X, etc. — mismas opciones que el campo de Oportunidades)

  Es decir, un mismo Cliente puede tener **un Segmento distinto por cada
  Unidad de Negocio** (por eso la nota del campo menciona "para la misma
  Unidad de Negocio de la Oportunidad"). Confirmé que ese módulo sí tiene
  datos cargados (no está vacío como pasaba con otro campo de segmento que
  revisamos antes).

## Flujo propuesto

1. **Dispara**: al crear una Oportunidad, o al editarla si cambia el
   Cliente o la Unidad de Negocio.
2. **Busca**: el registro en Segmentos de Cuentas donde
   `Cuenta = Cliente de la Oportunidad` y `UN = Unidad de Negocio de la
   Oportunidad`.
3. **Copia**: el valor de `Segmento` de ese registro al campo
   `Segmento Cliente Asociado` de la Oportunidad.

## Por qué esto no lo puedo aplicar solo

Las automatizaciones de Zoho (Reglas de flujo de trabajo + Funciones) **no
están disponibles entre las herramientas conectadas a esta sesión** — esas
tools solo permiten crear/editar registros y campos, no reglas de
automatización. Esto hay que armarlo una vez, a mano, en Zoho. Son 5
minutos. Te dejo el paso a paso y el texto ya listo para copiar y pegar:

### Pasos en Zoho (Configuración → Automatización → Reglas de flujo de trabajo)

1. Módulo: **Oportunidades**
2. Cuándo ejecutar: **Al crear el registro, y cada vez que se edite** →
   marcar que se dispare si cambian los campos "Cliente" o "Unidad de
   Negocio"
3. Acción: **Función** → función nueva (Deluge) → pegar este código:

```deluge
cuentaId = input.Account_Name;
unId = input.UN;
segmentoValue = "";

if(cuentaId != null && unId != null)
{
	segmentos = zoho.crm.searchRecords("Segmentos_de_Cuentas", "(Cuenta:equals:" + cuentaId + ")and(UN:equals:" + unId + ")");
	if(segmentos != null && segmentos.size() > 0)
	{
		registro = segmentos.get(0);
		segmentoValue = ifnull(registro.get("Segmento"), "");
	}
}

if(segmentoValue != "")
{
	mapaActualizar = Map();
	mapaActualizar.put("Segmento_Cliente_Asociado", segmentoValue);
	zoho.crm.updateRecord("Deals", input.id, mapaActualizar);
}
```

4. Guardar y activar la regla.

> Nota: el código de arriba es un borrador — el editor de Funciones de
> Zoho valida la sintaxis al guardar, así que si marca algún error de
> tipeo se corrige ahí mismo, la lógica de fondo no cambia.

## Alternativa si preferís que no toque Oportunidades ya creadas

La regla de arriba solo completa Oportunidades nuevas o editadas después
de activarla. Si además querés completar las Oportunidades **ya
existentes** con este dato, se puede hacer una actualización masiva por
única vez (yo sí puedo ejecutar esa parte con las tools conectadas, previo
OK tuyo) — avisame si la querés.

## Próximo paso

Esperando que armes la regla en Zoho con los pasos de arriba, o que me
confirmes si preferís otra vía. Cuando esté lista, avisame para dejarla
marcada como aplicada acá.
