# Propuesta: nuevo flujo de clonación de cotizaciones

Fecha: 2026-11-18 · Estado: **propuesta / diagnóstico** — no se tocó nada en el CRM.
Pendiente: que Simón elija qué mejoras avanzar; las partes del Cotizador
(Creator) requieren al proveedor.

Relacionado: `zoho/config/caso-clonar-cotizacion-a-otro-cliente.md`,
`zoho/config/caso-usuarios-miv-no-pueden-clonar-cotizaciones.md`,
`zoho/pipeline/propuesta-reevaluar-aprobacion-al-editar-cotizacion.md`,
`zoho/pipeline/propuesta-sincronizar-monto-cotizacion-a-oportunidad.md`.

---

## 1. Cómo funciona hoy (revisado en el CRM, solo lectura)

Hoy **no hay un flujo único**: hay dos caminos según la UN.

| Camino | UN que lo usan | Cómo se clona | Quién queda como creador |
|---|---|---|---|
| **A. Cotizador (Creator)** | Construcción, Rental, Inamar Izaje (y Vapor) | Botón **"Editar Cotización ▾ → Clonar Cotización"** → abre el Cotizador → se guarda y vuelve al CRM | Usuario de integración "Emaresa" (`ID Creator` lleno) |
| **B. Clonar nativo del CRM** | MIV / MAK | Menú **"…" → Clonar** | El propio vendedor (`ID Creator` vacío) |

Controles existentes:
- Client Script **"Deshabilitar clonar cotización"** (página Clonar, onSave):
  solo deja clonar a Administrator + perfiles MIV (y en "Actualización de
  oferta" a cualquiera, versión Sandbox).
- Visibilidad del botón "Clonar Cotización" por perfil (Administrar botones).
- Campo **ID Cotizac. Original** (texto, creado 03-12-2025): guarda de dónde
  viene el clon.

### Volumen (desde 01-05-2026)
594 cotizaciones clonadas: Construcción 321 · Rental 105 · Inamar Izaje 94 ·
Inamar Vapor 74. Estado actual de los clones: Cerrada Ganada 219, Creada 181,
Enviada 88, Cerrada Perdida 79, Aprobada 11, Pendiente de revisión 8, Lista
para Clonar 5, otras 3.

### Fases por las que pasa hoy un clon

```
 Cotización original                          Clon
 ───────────────────                          ────
 (cualquier fase; a veces
  se marca "Lista para Clonar")
          │
          │ 1. Vendedor pulsa Clonar (Cotizador o "…")
          ▼
 2. Cotizador copia ítems, precios, cliente, contacto, sucursal
          │
          │ 3. Oportunidad:
          │    · Rental / Inamar → se reutiliza la misma
          │    · Construcción   → el Cotizador crea una NUEVA
          │                       (1 segundo antes de la cotización)
          ▼
                                             4. Clon nace en "Creada"
                                                ID Cotizac. Original = id de la original
                                                Tipo de Cotización = "1° Selección" (siempre)
                                                      │
                                             5. Sigue el Blueprint normal:
                                                Creada → (aprobación) → Enviada → Ganada/Perdida
 6. La ORIGINAL no cambia: queda
    en la fase en la que estaba
    (Creada, Enviada, Aprobada,
     Lista para Clonar…)
```

---

## 2. Problemas encontrados (muestra de los 60 clones más recientes)

1. **La original nunca se cierra.** Queda viva en el pipeline junto al clon.
   - Inamar Izaje: REY PLAST (2922 y 3073), INCORMET (3058 y 3070) → las dos
     versiones en "Enviada".
   - Rental: MIS RAICES tiene 3 versiones aprobadas a la vez (6255, 6263,
     6359) en la misma oportunidad; CONSORCIO igual (4946, 6166, 6167).
   - Las fases **"Recotizada"** y **"En proceso de recotización"** ya existen
     en el campo, pero **no se usaron ni una vez en 2026**.
2. **Construcción duplica oportunidades.** En ~17 de 24 clones revisados el
   Cotizador creó una oportunidad nueva para el mismo cliente. La
   oportunidad de la original queda abierta:
   - TECHINT: 004143 (24,4 MM, "Creada") + 005095 (19,3 MM, "Creada").
   - DUAL PRODUCCIONES: 005020 (192,8 MM, "Creada") + 005352 (19,6 MM, "Creada").
   - SODIMAC: 005117 + 005119, ambas "Creada", creadas con 9 minutos de diferencia.
   - RITTER (004668) y VILICIC (004954) siguen "Creada" aunque el clon ya se ganó.
   → **El pipeline de Construcción está inflado** y el % de ganadas/perdidas
     se distorsiona (ej. MAGA: misma venta, una oportunidad perdida y otra ganada).
3. **Posible doble conteo de ventas ganadas** (a confirmar si son recompras
   reales): BITUMIX 664.496 ×2, BELLAVISTA 3.310.999,88 ×2, MC LIMITADA
   7.578.872 ×2 — original y clon ganados con el mismo monto.
4. **No se sabe para qué se clonó.** No hay motivo: puede ser nueva versión
   al mismo cliente, repetir una venta, o cotizar a otro cliente (ej.
   ECMOVIAL → RENTVIAL, COT-CONST 4732 → 4766). "Tipo de Cotización" siempre
   dice "1° Selección", no ayuda.
5. **ID Cotizac. Original es texto libre e inconsistente.** En el Cotizador
   guarda el id interno del CRM; en MIV se escribe a mano el código del ERP
   (ej. "RQ14234_R9"). No se puede abrir la original con un clic ni ver la
   cadena de versiones.
6. **Clonar a otro cliente falla** si el cliente nuevo no tiene oportunidad,
   contacto o sucursal (caso del 10-11).
7. **"Lista para Clonar"** se usa como marca previa (25 cotizaciones), pero
   la original queda ahí para siempre después de clonarse.

---

## 3. Flujo nuevo propuesto

Idea central: **al clonar, el vendedor dice para qué**, y el sistema hace el
resto (oportunidad correcta, cierre de la original, trazabilidad).

### Fase 1 — Solicitud (el vendedor elige el motivo)
Nuevo campo de lista en Cotizaciones **"Motivo de Clonación"**:

| Opción | Cliente | Oportunidad | Qué pasa con la original |
|---|---|---|---|
| **Nueva versión** (cambió precio, cantidad, plazo) | Mismo | **Misma** | Pasa a **Recotizada** (sale del pipeline) |
| **Repetir venta** (recompra) | Mismo | **Nueva** | No se toca |
| **Otro cliente** | Otro RUT | **Nueva**, del cliente nuevo | No se toca |

### Fase 2 — Validación antes de crear
- Otro cliente: exigir contacto, sucursal y oportunidad del cliente nuevo
  (si no tiene oportunidad, crearla primero o que la cree el Cotizador).
- Nueva versión: la original no puede estar Cerrada Ganada (si ya se ganó,
  corresponde "Repetir venta").

### Fase 3 — Creación del clon
- Nace en **Creada**, sin casillas de aprobación heredadas (se vuelven a
  evaluar descuentos/precios, ver propuesta de re-aprobación al editar).
- **Cotización Original**: pasar de texto a **campo de búsqueda** (lookup a
  Cotizaciones) → link directo y lista relacionada "Versiones" en la original.
- **N° de Versión** (número): original = 1, cada nueva versión +1. Opcional:
  sufijo en el asunto (`_V2`, `_V3`), como ya hace MIV con `_R1`.

### Fase 4 — Cierre automático de la original (lado CRM)
Regla de flujo en Cotizaciones · **al crear** · condición
`ID Cotizac. Original` no vacío **y** Motivo = Nueva versión → función Deluge
(abajo) que pasa la original a **Recotizada** y deja una nota con el número
del clon.

### Fase 5 — Oportunidad
- Nueva versión → la oportunidad queda con **un solo** monto vivo (el del
  clon) — engancha con `propuesta-sincronizar-monto-cotizacion-a-oportunidad.md`.
- Repetir venta / Otro cliente → oportunidad nueva (lo que hoy hace
  Construcción, pero solo cuando corresponde).

### Fase 6 — Seguimiento
- Vista "Cotizaciones clonadas este mes" por motivo y UN.
- Informe "Oportunidades con más de una cotización abierta" (para detectar
  lo que se escape).
- Limpieza única del histórico (ver idea 7).

---

## 4. Función Deluge propuesta (Fase 4) — probar en Sandbox

Regla de flujo: módulo **Cotizaciones** · al **Crear** · condición
`ID Cotizac. Original` *no está vacío* (y, cuando exista el campo,
`Motivo de Clonación` = *Nueva versión*) · acción: función.
Argumento: `quoteId` = Id de la Cotización.

```deluge
void automation.cerrar_original_al_clonar(String quoteId)
{
    clon = zoho.crm.getRecordById("Quotes", quoteId.toLong());
    idOriginal = ifnull(clon.get("ID_Cotizac_Original"), "");
    // Solo ids del CRM (MIV escribe códigos del ERP tipo "RQ...")
    if(idOriginal == "" || !idOriginal.isNumber())
    {
        return;
    }
    original = zoho.crm.getRecordById("Quotes", idOriginal.toLong());
    if(original.get("id") == null)
    {
        return;
    }
    fase = ifnull(original.get("Quote_Stage"), "");
    if(fase == "Cerrada Ganada" || fase == "Cerrada Perdida" || fase == "Recotizada")
    {
        return;
    }
    // Solo si es nueva versión: misma oportunidad
    dealClon = ifnull(clon.get("Deal_Name"), Map()).get("id");
    dealOrig = ifnull(original.get("Deal_Name"), Map()).get("id");
    if(dealClon == null || dealClon != dealOrig)
    {
        return;
    }
    upd = Map();
    upd.put("Quote_Stage", "Recotizada");
    resp = zoho.crm.updateRecord("Quotes", idOriginal.toLong(), upd);
    nota = Map();
    nota.put("Parent_Id", idOriginal);
    nota.put("se_module", "Quotes");
    nota.put("Note_Title", "Cotización recotizada");
    nota.put("Note_Content", "Reemplazada por " + clon.get("Subject") + " (clon creado el " + clon.get("Created_Time") + ").");
    zoho.crm.createRecord("Notes", nota);
    info resp;
}
```

Mientras no exista el campo "Motivo de Clonación", la función usa como
criterio "misma oportunidad = nueva versión" (es lo que pasa en Rental e
Inamar). Si se edita en el editor nuevo de funciones, envolver igual que la
de re-aprobación (`void automation.<nombre>(String quoteId) { … }`).

### A probar en Sandbox
| Prueba | Esperado |
|---|---|
| Clonar cotización Enviada, misma oportunidad | Original → Recotizada + nota |
| Clonar cotización Cerrada Ganada | Original no cambia |
| Clonar a otra oportunidad / otro cliente | Original no cambia |
| Clon MIV con "RQ…" en ID Cotizac. Original | No hace nada, sin error |
| Original dentro del Blueprint | Ver que el cambio de fase por función se aplique (si el Blueprint lo bloquea, agregar "Recotizada" como fase con transición automática) |
| Regla "SB Actualizar Fase de Oportunidad según Cotización" | No debe mover la oportunidad por la original recotizada |
| Envío de fase a Creator ("Enviar Sub Fase de Cotizacion a Creator") | Confirmar con proveedor que acepta "Recotizada" |

---

## 5. Ideas de mejora (de más fácil a más trabajo)

1. **Usar "Recotizada" automáticamente** (función de arriba). Lado CRM, sin
   proveedor. Impacto inmediato: pipeline real en Rental e Inamar.
2. **Informe/vista "oportunidades con 2+ cotizaciones abiertas"** para
   detectar duplicados. Solo configuración de informe.
3. **Campo "Motivo de Clonación"** (Nueva versión / Repetir venta / Otro
   cliente). En el CRM es fácil; en el Cotizador lo debe agregar el proveedor
   en la pantalla de clonar.
4. **Que el Cotizador de Construcción no cree oportunidad nueva** cuando es
   nueva versión del mismo cliente (pedido al proveedor). Es el problema
   más grande en montos: decenas de MM duplicados en "Creada".
5. **"Cotización Original" como campo de búsqueda** + **N° de versión** +
   lista relacionada "Versiones". Requiere que el Cotizador y MIV llenen el
   nuevo campo; se puede poblar el histórico por API a partir del texto actual.
6. **Unificar MIV con el mismo criterio**: Client Script en la página Clonar
   que llene "ID Cotizac. Original" con el id del CRM (no el RQ del ERP; ese
   código podría ir en un campo propio "Código ERP").
7. **Limpieza única del histórico** (con OK): pasar a Recotizada las
   originales abiertas que tienen un clon en la misma oportunidad, y revisar
   con Construcción las oportunidades "Creada" duplicadas (TECHINT, DUAL,
   SODIMAC, RITTER, VILICIC…). Lo puedo hacer por API previa revisión de la
   lista.
8. **"Lista para Clonar"**: que al crearse el clon la original salga de esa
   fase (la misma función puede hacerlo), o eliminar la fase si ya no aporta.
9. **Aviso al KAM/jefe** cuando una cotización se clona a **otro cliente**
   (para evitar que se reutilicen precios especiales de un cliente en otro).
10. **Clon a otro cliente: recalcular precios** (lista de precios / precios
    especiales / descuentos del cliente nuevo) en vez de copiar los del
    cliente original — pedido al proveedor del Cotizador.

## Pendientes / preguntas para Simón
- ¿Los dobles "Cerrada Ganada" con igual monto (BITUMIX, BELLAVISTA, MC
  LIMITADA) son recompras reales o la misma venta contada dos veces?
- ¿En Construcción la oportunidad nueva la crea el Cotizador sí o sí, o el
  vendedor elige?
- ¿Partimos por la idea 1 (Recotizada automática) en Sandbox?
