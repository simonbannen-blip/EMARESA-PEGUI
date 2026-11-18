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

## 1-bis. Punto de partida por UN (18-11, datos desde 01-05-2026)

| UN | Cotizaciones | Clones | % clonado | Cómo clona | Quién crea el clon | Oportunidad del clon | Fase de la original (muestra) | Estado de los clones |
|---|---|---|---|---|---|---|---|---|
| **Construcción** | 4.312 | 321 | 7% | Cotizador (Creator) | Integración "Emaresa" | **Nueva casi siempre** (17 de 24) | Creada 51% · Ganada 30% · Perdida 12% · Lista para Clonar 7% (n=84) | Creada 149 (46%) · Ganada 134 · Perdida 29 · otros 9 |
| **Rental** | 6.227 | 105 | 2% | Cotizador (Creator) | Integración "Emaresa" | **Misma** (20 de 20) | Creada 32% · Ganada 29% · Aprobada 29% · otras 10% (n=41) | Ganada 39 · Perdida 25 · Creada 22 · Aprobada 10 · otros 9 |
| **Inamar Izaje** | 2.269 | 94 | 4% | Cotizador (Creator) | Integración "Emaresa" | **Misma** (9 de 9) | **Perdida 42%** · Enviada 38% · Ganada 15% (n=26) | Ganada 47 · Perdida 24 · Enviada 14 · Creada 6 · otros 3 |
| **Inamar Vapor (MIV)** | 182 | 74 | **41%** | Clonar nativo CRM ("…") | Responsables MIV (Lledo 32, Ancao 30, Alarcon 12) | Misma (muestra chica) | No medible: ID original = código ERP ("RQ14234_R9", "2026-1831M") | **Enviada 69 (93%)** · Creada 4 · Perdida 1 |
| Ferretek | 17.301 | 0 | 0% | No clona: todas vienen del ERP (Origen = ERP) | — | — | — | — |
| Agroforestal y Jardines | 40 | 0 | 0% | No clona (Cotizador) | — | — | — | — |
| Industria y Ferretería | 61 | 0 | 0% | No clona | — | — | — | — |
| Maktotal | 139 | 0 | 0% | No clona | — | — | — | — |

### Lectura por UN
- **Construcción**: es la que más clona (321). El clon funciona como
  "guardar como": hay cadenas de 3–4 clones en 15 minutos (ej. 09-10
  15:38 → 15:49 → 15:54) y la mitad de las originales queda en Creada.
  El Cotizador **crea una oportunidad nueva** por cada clon → oportunidades
  duplicadas abiertas. 46% de los clones también queda en Creada.
  Usa la fase "Lista para Clonar" como marca previa (única UN que la usa).
  Clona Ganadas para repetir venta (30%).
- **Rental**: reutiliza la oportunidad (bien), pero **conviven varias
  versiones aprobadas** (MIS RAICES 3, CONSORCIO 3). Clona Ganadas (29%)
  → repetir arriendos. Algunos clones quedan en Pendiente de revisión/aprobación.
- **Inamar Izaje**: reutiliza la oportunidad y **cierra la original a mano
  como Cerrada Perdida** minutos después de clonar (42% de las originales)
  → pérdidas que en realidad son versiones reemplazadas. Las que no cierra
  quedan en Enviada en paralelo con el clon.
- **Inamar Vapor (MIV)**: clona en el CRM nativo, casi 1 de cada 2
  cotizaciones es un clon (revisiones: asunto con sufijo `_R1`), y el clon
  se envía casi siempre (93% Enviada). El campo ID Cotizac. Original lleva
  el código del ERP escrito a mano → no se puede rastrear la original en el
  CRM. Bloqueo por perfil vía Client Script "Deshabilitar clonar cotización".
- **Ferretek, Agroforestal, Industria y Ferretería, Maktotal**: no usan
  clonación (Ferretek recibe todo desde el ERP). Quedan fuera del flujo nuevo
  salvo que lo pidan.

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

## 3-bis. Desde qué fases se puede clonar (agregado 18-11)

### Hoy: se clona desde cualquier fase
No hay ninguna restricción por fase (el único control es por **perfil**, en el
Client Script de MIV). Fase actual de las originales en una muestra de **150
clones** (ago–nov 2026):

| Fase de la original | Cant. | % |
|---|---|---|
| Creada | 56 | 37% |
| Cerrada Ganada | 40 | 27% |
| Cerrada Perdida | 22 | 15% |
| Cotización Aprobada | 13 | 9% |
| Enviada | 11 | 7% |
| Lista para Clonar | 6 | 4% |
| Cotización Rechazada | 2 | 1% |

Hallazgos:
- **Clonar una Cerrada Ganada ya se hace hoy (27%)**, sobre todo en
  Construcción y Rental, para repetir el mismo negocio otro mes. Varias
  estaban ganadas semanas antes de clonarse (ej. Rental ganada el 11-09 y
  clonada el 26-10).
- **Inamar Izaje clona y luego marca la original como Cerrada Perdida a
  mano** (minutos después: 17:54 → 17:59, 12:38 → 12:46, 13:57 → 14:02…).
  O sea, esas "perdidas" **no son negocios perdidos**, son versiones
  reemplazadas → el % de pérdida de Inamar Izaje está inflado. Esto es justo
  lo que resolvería la fase "Recotizada".
- 56 originales siguen en "Creada": borradores que quedaron olvidados.

### Propuesta: matriz de fases

| Fase de la original | ¿Se puede clonar? | Motivos permitidos | Qué pasa con la original |
|---|---|---|---|
| Creada | Sí | Nueva versión / Otro cliente | Nueva versión → Recotizada |
| Pendiente de Aprobación, Parcialmente Aprobada | **No** | — | Esperar la aprobación (si no, se duplica o salta la aprobación) |
| Cotización Aprobada | Sí | Las 3 | Nueva versión → Recotizada |
| Cotización Rechazada | Sí | Nueva versión / Otro cliente | Nueva versión → Recotizada |
| Enviada / Actualización de oferta / Lista para Clonar | Sí | Las 3 | Nueva versión → Recotizada |
| Lista para Confirmar, Direc. de Facturación/Despacho validada, Sin Stock suficiente, Pendiente aprobación despacho sin factura | **No** | — | Está en proceso de pasar a Orden de Venta / ERP |
| **Cerrada Ganada** | **Sí** | **Repetir venta** / Otro cliente | **No se toca** (sigue Ganada) |
| Cerrada Perdida | Sí | Repetir venta ("retomar negocio") / Otro cliente | No se toca (sigue Perdida) |
| Recotizada | **No** | — | Clonar la versión vigente, no una reemplazada |
| Pendiente de revisión | A definir con Simón | | |

### Clonar desde Cerrada Ganada = "Repetir venta (nuevo período)"
Mismo negocio, otro mes. Cómo debería quedar:
1. Motivo **Repetir venta** (en una Ganada no se ofrece "Nueva versión").
2. **Oportunidad nueva** del mismo cliente, con fecha de cierre del mes nuevo
   (la oportunidad ganada no se reabre, así cada mes cuenta su venta).
3. Clon en **Creada**, con **fecha de validez nueva** y **sin aprobaciones
   heredadas**: si cambiaron precios de lista, descuentos o crédito del
   cliente, se vuelven a evaluar.
4. Precios: definir si se copian los del mes anterior o se **recalculan con
   la lista vigente** (recomendado recalcular; si se copian, que pase por
   aprobación si quedan bajo el mínimo).
5. La original **queda Cerrada Ganada**; el clon guarda el link a ella
   (ID Cotizac. Original) → se puede ver la "serie" mensual del cliente.
6. Ojo Rental: si lo que se repite es la **extensión de un arriendo vigente**,
   confirmar con Rental si debe ser cotización nueva o una extensión del
   contrato.

### Cómo aplicar la restricción por fase
> **Aclaración de Simón (18-11):** el clonado oficial es el botón propio
> **"Clonar Cotización"**, que lleva al **Cotizador (Creator)**. El "Clonar"
> nativo de Zoho (menú "…") **no** es el flujo de clonación; está bloqueado
> por el Client Script salvo Administrator y perfiles MIV.
> Por eso el flujo nuevo se diseña sobre el botón → Creator.

Dónde vive cada parte del flujo nuevo:

| Parte | Dónde se hace | Quién |
|---|---|---|
| Bloquear por fase (matriz 3-bis) | **Antes de abrir el Cotizador**: el botón primero revisa la fase en el CRM (Client Script del botón o función) y solo si está permitida abre el Cotizador; o la valida el Cotizador al abrir | Simón (CRM) o proveedor |
| Elegir motivo (Nueva versión / Repetir venta / Otro cliente) | Pantalla de clonar del **Cotizador** | Proveedor |
| Oportunidad misma o nueva según motivo (hoy Construcción crea nueva siempre) | **Cotizador** | Proveedor |
| Sin aprobaciones heredadas, fecha de validez nueva, precios vigentes | **Cotizador** | Proveedor |
| Llenar ID Cotizac. Original (ya lo hace) + motivo | **Cotizador** → CRM | Proveedor |
| Original → Recotizada + nota (función de la sección 4) | **CRM**, regla al crear | Simón |
| Informes de duplicados / limpieza histórica | **CRM** | Simón / yo por API |

Para definir la primera fila hace falta ver **cómo está configurado el botón
"Clonar Cotización"** (si es "Abrir URL" o "Función"): Cotizaciones →
desplegable "Editar Cotización" → Administrar botones → "Clonar Cotización"
→ captura de la acción.

#### Configuración real del botón (captura de Simón, 18-11)
- Nombre: **Clonar Cotización** · Acción: **Función** → **"SB Clonar Cotizacion"**
  · Página: En registro · Posición: Detalles · Diseño: Estándar.
- Perfiles: Administrador, Estándar, Vendedor, Responsable de Área, Vendedor
  MIV, Gerente, Asistente, Gerente de UN, Vendedor Distribución Repuestos
  jardín y m…, (y más en la lista).

**Conclusión: el bloqueo por fase se puede hacer en el CRM, sin el
proveedor.** Como el botón ejecuta una función del CRM antes de ir al
Cotizador, basta agregar al **inicio** de "SB Clonar Cotizacion" una
validación que corte si la fase no está permitida. Lo que retorna la función
es el mensaje que ve el usuario.

Bloque a pegar al inicio de la función (ajustar `quoteId` al nombre real del
argumento de la función; falta ver su código):
```deluge
// --- Validación de fase antes de clonar (nuevo flujo) ---
cotOrig = zoho.crm.getRecordById("Quotes", quoteId.toLong());
faseOrig = ifnull(cotOrig.get("Quote_Stage"), "");
fasesBloqueadas = {"Pendiente de Aprobación","Pendiente de Aprobacion","Cotizacion Parcialmente Aprobada","Lista para Confirmar","Direc. de Facturación Validada","Direc. de Despacho validada","Sin Stock suficiente","pendiente aprobación despacho sin factura","Recotizada"};
if(fasesBloqueadas.contains(faseOrig))
{
    return "No se puede clonar una cotización en fase \"" + faseOrig + "\". Espere a que termine ese proceso o clone la versión vigente.";
}
// --- fin validación; sigue el código actual de la función ---
```
Pendiente: que Simón pegue el código actual de "SB Clonar Cotizacion"
(Editar → copiar) para ver el nombre del argumento, cómo abre el Cotizador y
si ya pasa algún dato (ej. motivo) que sirva para el resto del flujo.

- **Inamar Vapor (MIV)**: sus clones **no pasan por el Cotizador** (creados
  por el propio usuario, sin ID Creator). **Decisión de Simón (18-11):
  camino (b)** → Vapor sigue con el Clonar nativo, agregando la validación de
  fase al Client Script "Deshabilitar clonar cotización" (código abajo).

Client Script para Vapor (camino b, elegido). Versión con perfiles + fases (MIV, página Clonar, onLoad o
onSave según como esté hoy). Probar en Sandbox:
```js
var user = ZDK.Apps.CRM.Users.fetchById($Crm.user.id);
var perfilesPermitidos = ['Administrator', 'Responsable de Área MIV y MAK', 'Vendedor MIV'];
// Fases desde las que NO se puede clonar
var fasesBloqueadas = [
    'Pendiente de Aprobación', 'Pendiente de Aprobacion',
    'Cotizacion Parcialmente Aprobada',
    'Lista para Confirmar', 'Direc. de Facturación Validada',
    'Direc. de Despacho validada', 'Sin Stock suficiente',
    'pendiente aprobación despacho sin factura', 'Recotizada'
];
if (perfilesPermitidos.indexOf(user.profile.name) === -1) {
    ZDK.Client.showAlert('Hola ' + user.first_name + ' ' + user.last_name + ', usted no tiene permisos para clonar cotización!');
    return false;
}
// En la página Clonar los campos vienen copiados de la original
var faseOriginal = ZDK.Page.getField('Quote_Stage').getValue();
if (fasesBloqueadas.indexOf(faseOriginal) !== -1) {
    ZDK.Client.showAlert('No se puede clonar una cotización en fase "' + faseOriginal + '". Espere a que termine ese proceso o clone la versión vigente.');
    return false;
}
```
> Validar en Sandbox que en la página Clonar `Quote_Stage` traiga la fase de
> la original (en la prueba de "Actualización de oferta" sí venía copiada).

---

## 3-ter. Editar vs Clonar — regla única (agregado 18-11)

Pedido de Simón: no todo se resuelve clonando; hay casos en que basta con
**editar**. Se define una sola regla para los dos botones ("Editar
Cotización" y "Clonar Cotización", ambos llevan al Cotizador).

### Regla simple para el vendedor
> **Si el cliente todavía no la ha recibido → EDITAR.**
> **Si el cliente ya la recibió o está cerrada → CLONAR.**

Motivo: una cotización enviada es un documento que el cliente tiene; si se
edita, se pierde lo que se le mandó. Clonarla deja la versión enviada como
"Recotizada" (con trazabilidad) y la nueva sigue su curso. Mientras no se ha
enviado, clonar solo genera duplicados (el "guardar como" de Construcción).

### Matriz combinada por fase (reemplaza a la de 3-bis)

| Fase actual | Editar | Clonar | Qué pasa |
|---|---|---|---|
| **Creada** | ✅ **Sí** (lo normal) | Solo Otro cliente / Repetir venta | Al editar, si cumple criterios → va a aprobación (propuesta re-aprobación v2) |
| **Pendiente de Aprobación / Parcialmente Aprobada** | ❌ No | ❌ No | Esperar resultado; si hay que cambiar algo, que el aprobador rechace |
| **Cotización Aprobada** (aún no enviada) | ✅ Sí | Solo Otro cliente / Repetir venta | Al editar montos/descuentos/plazo → **vuelve a aprobación** |
| **Cotización Rechazada** | ✅ Sí (corregir) | Solo Otro cliente | Al editar → vuelve a aprobación si cumple criterios |
| **Enviada / Actualización de oferta** | ❌ No | ✅ **Sí** (Nueva versión) | Original → **Recotizada**; el clon parte en Creada |
| **Lista para Clonar** | ❌ No | ✅ Sí | Original → Recotizada (o se elimina la fase, ver idea 8) |
| **Lista para Confirmar, Direc. validadas, Sin Stock, Despacho sin factura** | ❌ No | ❌ No | En proceso de Orden de Venta / ERP |
| **Cerrada Ganada** | ❌ No | ✅ Repetir venta / Otro cliente | Original sigue Ganada |
| **Cerrada Perdida** | ❌ No | ✅ Retomar / Otro cliente | Original sigue Perdida |
| **Recotizada** | ❌ No | ❌ No | Trabajar sobre la versión vigente |
| Pendiente de revisión | A definir | A definir | |

Con esto:
- Se **cierra la decisión pendiente #1** de la propuesta de re-aprobación
  (`propuesta-reevaluar-aprobacion-al-editar-cotizacion.md`): **Enviada no
  se edita**, se clona → no hace falta agregar "Enviada" a la función de
  re-aprobación.
- Se cortan las cadenas de clones en Creada de Construcción (se edita).
- Inamar Izaje deja de cerrar como Perdida: clona desde Enviada y el
  sistema pasa la original a Recotizada.

### Código real de los botones (entregado por Simón 18-11) — antes / después

Respaldos de lo vigente y propuestas completas, listas para pegar:
- `zoho/config/funciones/EditarCotizacion.actual.deluge` → `EditarCotizacion.deluge`
- `zoho/config/funciones/SBclonarCotizacion.actual.deluge` → `SBclonarCotizacion.deluge`

Ambas mantienen la **misma firma** (argumentos), así que el botón no se
reconfigura: solo se reemplaza el código de la función.

> Corrección: en la sección 3-bis se dijo que "hoy no hay restricción por
> fase". Para el botón del Cotizador **sí hay**: "SB Clonar Cotizacion" ya
> trae una lista de fases permitidas. Lo que no existía era la regla
> Editar vs Clonar ni el cierre de la original.

| Fase | Editar HOY | Editar PROPUESTO | Clonar HOY | Clonar PROPUESTO |
|---|---|---|---|---|
| Creada | ✅ | ✅ | ✅ | ❌ → "use Editar" (*) |
| Pendiente de revisión | ✅ | ✅ | ❌ | ❌ → "use Editar" |
| Sin Stock suficiente | ✅ | ✅ | ❌ | ❌ → "use Editar" |
| Pendiente de Aprobación | ❌ (mensaje genérico; el mensaje específico nunca salía) | ❌ con mensaje claro | ❌ | ❌ |
| Parcialmente Aprobada | ❌ | ❌ con mensaje claro | ❌ | ❌ |
| Cotización Aprobada | ❌ | ✅ **cuando esté la re-aprobación** (interruptor) | ✅ | ❌ → "use Editar" (*) |
| Cotización Rechazada | ❌ | ✅ **cuando esté la re-aprobación** (interruptor) | ✅ | ❌ → "use Editar" (*) |
| Enviada | Solo con producto ficticio | Igual (excepción se mantiene) | ✅ | ✅ |
| Actualización de oferta | ❌ | ❌ → "use Clonar" | ❌ | ✅ |
| Lista para Clonar | ❌ | ❌ → "use Clonar" | ✅ | ✅ |
| Cerrada Ganada / Perdida | ❌ | ❌ → "use Clonar" | ✅ | ✅ |
| Recotizada, Lista para Confirmar, Direc. validadas, Despacho sin factura | ❌ | ❌ | ❌ | ❌ |

(*) Interruptor `permitirClonarEnFasesDeEdicion` en la función de clonar:
`false` = bloquea (propuesto), `true` = deja clonar como hoy.

Hallazgos del código:
- **Editar**: el mensaje "La Cotización se encuentra Pendiente de
  Aprobación…" **nunca se muestra** (la condición anterior ya la atrapa y
  responde "No es posible Editar esta cotización!"). Corregido.
- **Editar**: hoy **no deja editar Aprobadas ni Rechazadas** → por eso el
  vendedor clona para corregirlas (Rental: varias aprobadas vivas). Se
  habilitan con el interruptor `permitirEditarAprobadas`, que se pone en
  `true` **solo cuando la re-aprobación al editar esté funcionando** (si no,
  la aprobación vieja vale para una oferta distinta) y el Cotizador lo
  permita (ya pedido al proveedor en el mail del 12-11).
- **Clonar**: hoy deja clonar Creadas → origen de los clones en cadena de
  Construcción (51% de las originales en Creada).
- Fases sin tilde ("Cotizacion Aprobada", "Pendiente de Aprobacion",
  "Cotizacion Rechazada") son **solo de Ferretek** (vienen del ERP, no usan
  estos botones) → no se consideran.
- La función de clonar **no recibe el id de la cotización del CRM**, solo
  idCreator y fase. No hace falta para esta etapa; si más adelante se
  necesita (ej. motivo de clonación), se agrega el argumento en el botón.
- Los botones están visibles para el perfil **Vendedor MIV**, pero las
  cotizaciones de Vapor no tienen ID Creator → el botón abriría el
  Cotizador vacío. Vapor sigue con el camino (b) nativo.

### Cómo se implementa

**1. Botón "Clonar Cotización" → función "SB Clonar Cotizacion"**
> Reemplazado por la función completa `zoho/config/funciones/SBclonarCotizacion.deluge`.
> El bloque de abajo queda como referencia del diseño.
Bloque de validación al inicio (reemplaza al de 3-bis):
```deluge
// --- Validación de fase antes de CLONAR ---
cotOrig = zoho.crm.getRecordById("Quotes", quoteId.toLong());
faseOrig = ifnull(cotOrig.get("Quote_Stage"), "");
// Fases donde NO se clona
fasesNoClonar = {"Pendiente de Aprobación","Pendiente de Aprobacion","Cotizacion Parcialmente Aprobada","Lista para Confirmar","Direc. de Facturación Validada","Direc. de Despacho validada","Sin Stock suficiente","pendiente aprobación despacho sin factura","Recotizada"};
// Fases donde lo correcto es EDITAR (mientras no exista el campo Motivo,
// se bloquea el clon y se indica editar)
fasesEditar = {"Creada","Cotización Aprobada","Cotizacion Aprobada","Cotización Rechazada","Cotizacion Rechazada"};
if(fasesNoClonar.contains(faseOrig))
{
    return "No se puede clonar una cotización en fase \"" + faseOrig + "\".";
}
if(fasesEditar.contains(faseOrig))
{
    return "Esta cotización aún no se envía al cliente: use \"Editar Cotización\" en vez de clonar. (Si es para otro cliente o para repetir la venta, consulte con su jefatura.)";
}
// --- fin validación; sigue el código actual ---
```
> Decisión para Simón: ¿bloquear el clon en Creada/Aprobada/Rechazada desde
> ya (corta los duplicados de Construcción, pero impide clonar a otro
> cliente desde ahí hasta que el Cotizador tenga el campo Motivo), o solo
> mostrar el aviso sin bloquear?

**2. Botón "Editar Cotización"** — es **Función** ("EditarCotizacion",
captura 18-11). Reemplazado por la función completa
`zoho/config/funciones/EditarCotizacion.deluge`. Bloque de referencia:
```deluge
// --- Validación de fase antes de EDITAR ---
cot = zoho.crm.getRecordById("Quotes", quoteId.toLong());
fase = ifnull(cot.get("Quote_Stage"), "");
fasesEditables = {"Creada","Cotización Aprobada","Cotizacion Aprobada","Cotización Rechazada","Cotizacion Rechazada"};
fasesClonar = {"Enviada","Actualización de oferta","Lista para Clonar","Cerrada Ganada","Cerrada Perdida"};
if(fasesClonar.contains(fase))
{
    return "Esta cotización ya fue enviada o está cerrada (fase \"" + fase + "\"): no se edita, use \"Clonar Cotización\" para crear una nueva versión.";
}
if(!fasesEditables.contains(fase))
{
    return "No se puede editar una cotización en fase \"" + fase + "\".";
}
// --- fin validación; sigue el código actual ---
```
Si es "Abrir URL" (va directo al Cotizador sin función), hay dos caminos:
cambiarlo a Función que valide y luego abra el Cotizador, o pedir al
proveedor que valide la fase al abrir.

**3. Re-aprobación al editar** — se mantiene la propuesta v2
(regla + función `cotizacion_reevaluarAprobacion`) para Creada, Aprobada,
Parcialmente Aprobada y Rechazada. Sin Enviada.

**4. Inamar Vapor (camino b, nativo)** — Client Scripts:
- Página **Clonar**: el de 3-bis, con la misma lista `fasesNoClonar` +
  aviso de "use Editar" en Creada/Aprobada/Rechazada.
- Página **Editar** (onLoad), nuevo:
```js
// Inamar Vapor: no editar cotizaciones ya enviadas o cerradas
var fase = ZDK.Page.getField('Quote_Stage').getValue();
var fasesClonar = ['Enviada', 'Actualización de oferta', 'Lista para Clonar', 'Cerrada Ganada', 'Cerrada Perdida'];
var fasesBloqueadas = ['Pendiente de Aprobación', 'Pendiente de Aprobacion', 'Cotizacion Parcialmente Aprobada',
    'Lista para Confirmar', 'Direc. de Facturación Validada', 'Direc. de Despacho validada',
    'Sin Stock suficiente', 'pendiente aprobación despacho sin factura', 'Recotizada'];
if (fasesClonar.indexOf(fase) !== -1) {
    ZDK.Client.showAlert('Esta cotización ya fue enviada o está cerrada: no se edita. Use Clonar para crear una nueva versión (_R).');
    return false;
}
if (fasesBloqueadas.indexOf(fase) !== -1) {
    ZDK.Client.showAlert('No se puede editar una cotización en fase "' + fase + '".');
    return false;
}
```
> Validar en Sandbox que `return false` en onLoad de Editar impida la
> edición; si no, usar onSave (bloquea al guardar). Ojo: el Blueprint y
> funciones automáticas editan por API, no por esta página → no los afecta.
> Vapor usa Blueprint "Actualización de oferta": confirmar con Simón si en
> esa fase Vapor **edita** o **clona** (hoy se dejó clonando).

### A probar en Sandbox (Editar + Clonar)
| Prueba | Esperado |
|---|---|
| Creada → Editar | Abre Cotizador; si sube monto y cumple criterio → Pendiente de Aprobación |
| Creada → Clonar | Mensaje "use Editar" |
| Aprobada → Editar (interruptor en false) | Mensaje "No es posible Editar…" |
| Enviada con producto ficticio → Editar | Abre Cotizador (excepción vigente) |
| Aprobada → Editar con más descuento (interruptor en true) | Vuelve a Pendiente de Aprobación |
| Pendiente de Aprobación → Editar / Clonar | Mensaje, no abre Cotizador |
| Enviada → Editar | Mensaje "use Clonar" |
| Enviada → Clonar | Abre Cotizador; al guardar el clon, original → Recotizada |
| Cerrada Ganada → Clonar | Abre Cotizador (Repetir venta); original sigue Ganada |
| Recotizada → Editar / Clonar | Mensaje, no abre |
| Vapor: Enviada → Editar nativo | Alerta del Client Script |

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

11. **Inamar Izaje: dejar de cerrar como Perdida las versiones reemplazadas**
    (usar Recotizada) y corregir el histórico para que el % de pérdida sea real.

## Pendientes / preguntas para Simón
- ~~Captura del botón Editar y código de funciones~~ → recibido 18-11.
- Clonar en Creada/Aprobada/Rechazada: ¿bloquear (`false`, propuesto) o
  dejar como hoy (`true`)? Interruptor en `SBclonarCotizacion.deluge`.
- Orden de puesta en marcha: (1) funciones de botones con
  `permitirEditarAprobadas = false`; (2) regla "Original → Recotizada";
  (3) re-aprobación al editar; (4) recién ahí `permitirEditarAprobadas = true`.
- Vapor en "Actualización de oferta": ¿edita o clona?
- ¿La matriz de fases (3-bis) está bien? En especial "Pendiente de revisión".
- Repetir venta desde Ganada: ¿precios copiados o recalculados con la lista vigente?
- ¿Los dobles "Cerrada Ganada" con igual monto (BITUMIX, BELLAVISTA, MC
  LIMITADA) son recompras reales o la misma venta contada dos veces?
- ¿En Construcción la oportunidad nueva la crea el Cotizador sí o sí, o el
  vendedor elige?
- ¿Partimos por la idea 1 (Recotizada automática) en Sandbox?
