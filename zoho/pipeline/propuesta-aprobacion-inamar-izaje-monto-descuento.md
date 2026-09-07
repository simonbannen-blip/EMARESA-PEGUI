# Propuesta: aprobación nueva para UN Inamar Izaje — monto y descuento por ítem

## Estado: LISTO PARA ARMAR EN SANDBOX — diseño cerrado, guía completa

## Qué se pidió

Nueva aprobación en **Cotizaciones**, para la **UN Inamar Izaje**: cuando
el monto de la cotización sea **mayor a $1.000.000** Y **al menos uno de
los productos** de esa cotización tenga un descuento de **10% o más**, la
cotización debe pasar por la aprobación de **Rodrigo Verdugo** (Gerente
Inamar Izaje). No importa el descuento promedio de toda la cotización —
alcanza con que **un solo producto** llegue al 10%.

## Cómo queda armado en Zoho

**Módulo principal:** Cotizaciones (Quotes). El disparador de descuento
se calcula a nivel de **Artículos presupuestados** (Quoted_Items, la
grilla de productos dentro de la cotización).

**Criterios del proceso de aprobación (todos deben cumplirse):**

| # | Campo | Condición |
|---|---|---|
| 1 | UN | = Inamar Izaje |
| 2 | Fase de Cotización | = Pendiente de Aprobación |
| 3 | Total general | > 1.000.000 |
| 4 | Aprobación Item Sobre 10% *(campo nuevo, ver abajo)* | = Seleccionado |

**Aprobador:** Rodrigo Verdugo — confirmado como usuario activo en Zoho
(`rverdugo@inamarizaje.cl`, rol "Gerente Inamar Izaje").

**Al aprobar:** Fase de Cotización → **Cotización Aprobada**.
**Al rechazar:** Fase de Cotización → **Cotización Rechazada** (mismo
comportamiento estándar que ya usan el resto de las aprobaciones).

## Por qué no se puede comparar "10% del total" directo

El campo `Descuento` de cada producto se puede leer como % gracias al
campo `% Descuento` que ya existe en Artículos presupuestados (creado el
2026-08-04). Pero un Proceso de aprobación en Cotizaciones **no puede
mirar dentro de la grilla de productos** para comparar cada línea — solo
puede comparar campos que están en la Cotización misma. Por eso hace
falta un paso intermedio: una **Regla de flujo de trabajo** que vigile la
grilla de productos y, apenas encuentre uno con 10% o más, marque un
campo en la Cotización (el padre). Ese campo es el que después usa el
Proceso de aprobación como criterio.

Importante: revisando la función que ya usa esta org para casos
parecidos (`Ejecución Proceso Aprobacion descuento Minimo`) se confirmó
que **no hace falta escribir código** — esa función solo corre
**después** de que un humano aprueba, para marcar la Sub Fase. La
detección del 10% por producto se resuelve con una Regla de flujo de
trabajo simple, de clicks, sin Deluge.

También se descartó reutilizar el campo `Aprobación Descuento` que ya
existe: es el disparador genérico que usa toda la organización (Rental
lo usa a partir de 5%), así que ya está "ocupado" con otro umbral —
crear un campo nuevo evita pisar esa lógica.

## Progreso real

- [ ] Paso 1 — Campo `Aprobación Item Sobre 10%` en Cotizaciones
- [ ] Paso 2 — Regla de flujo de trabajo sobre Artículos presupuestados
- [ ] Paso 3 — Proceso de aprobación "UN Inamar Izaje - Aprobación Monto
      y Descuento"
- [ ] Paso 4 — Pruebas en Sandbox (caso positivo y caso negativo)
- [ ] Paso 5 — Repetir todo en Producción

## Guía paso a paso — Sandbox

### Paso 1 — Crear el campo nuevo en Cotizaciones

1. Configuración ⚙️ → Personalización → Módulos y campos → **Cotizaciones**.
2. Arrastrar un campo tipo **Casilla de verificación** (checkbox) al
   layout.
3. Nombre del campo: **Aprobación Item Sobre 10%**.
4. Guardar. No hace falta marcarlo como obligatorio ni darle un valor por
   defecto.

### Paso 2 — Regla de flujo de trabajo que revisa cada producto

1. Configuración → Automatización → **Reglas de flujo de trabajo** →
   Nueva regla.
2. Módulo: **Artículos presupuestados**.
   - Si al elegir el módulo no aparece "Artículos presupuestados" en la
     lista (algunas ediciones de Zoho no dejan armar reglas directo sobre
     la grilla de productos), avisame y te paso una alternativa con una
     función chica en vez de esto — pero probá primero este camino, que
     es el más simple.
3. Cuándo se ejecuta: **Al crear o editar un registro**.
4. Condición: `% Descuento` **mayor o igual a** `10`.
5. Acción: **Actualizar campo**.
   - Módulo a actualizar: **Cotizaciones** (aparece como módulo
     relacionado, a través del campo "ID principal" que conecta cada
     producto con su cotización).
   - Campo: `Aprobación Item Sobre 10%` → valor **Seleccionado**.
6. Guardar y **activar** la regla.

### Paso 3 — Proceso de aprobación

1. Configuración → Automatización → **Procesos de aprobación** →
   Cotizaciones → **Nuevo proceso de aprobación**.
2. Nombre: **"UN Inamar Izaje - Aprobación Monto y Descuento"**.
3. Agregar los 4 criterios de la tabla de arriba (UN, Fase de Cotización,
   Total general, Aprobación Item Sobre 10%).
4. Aprobador: **Rodrigo Verdugo**.
5. Acción después de aprobación final: campo `Fase de Cotización` =
   **Cotización Aprobada**.
6. Acción después del rechazo: campo `Fase de Cotización` = **Cotización
   Rechazada**.
7. Guardar y **activar** el proceso.

### Paso 4 — Probar en Sandbox

**Caso positivo** (tiene que disparar la aprobación):
1. Crear una cotización de prueba con UN = Inamar Izaje.
2. Agregar 2 o 3 productos, dejando a **uno solo** con 10% o más de
   descuento (los demás en 0% o menos de 10% — así confirmás que alcanza
   con uno solo).
3. Confirmar que el Total general de la cotización supera $1.000.000.
4. Guardar y revisar: ¿el campo `Aprobación Item Sobre 10%` quedó
   marcado solo, sin que lo tocaras a mano?
5. Llevar la cotización a Fase "Pendiente de Aprobación" y confirmar que
   le llega la aprobación a Rodrigo Verdugo.
6. Aprobar de prueba: confirmar que la Fase pasa a "Cotización Aprobada".
7. Repetir con otra cotización de prueba y **rechazar**: confirmar que
   pasa a "Cotización Rechazada".

**Casos negativos** (NO tienen que disparar la aprobación):
8. Cotización de Inamar Izaje con todos los productos por debajo de 10%
   de descuento (aunque el monto sea alto): no debería pedir aprobación.
9. Cotización de Inamar Izaje con un producto al 10%+ pero Total general
   por debajo de $1.000.000: tampoco debería pedir aprobación.
10. Cotización de **otra UN** (no Inamar Izaje) con las mismas
    condiciones: tampoco debería activar esta aprobación puntual (aunque
    sí puede disparar otras aprobaciones ya existentes de esa UN).

### Paso 5 — Pasar a Producción

Una vez que las pruebas del Paso 4 salen todas como se espera:

1. Repetir exactamente los Pasos 1, 2 y 3 en el ambiente de
   **Producción** (Zoho no copia automático esta configuración de
   Sandbox a Producción — hay que rehacerla a mano, salvo que tu org
   tenga habilitada la herramienta de Despliegue de Sandbox, en cuyo caso
   se puede migrar de un clic).
2. Repetir el Paso 4 (pruebas) una vez en Producción, con una cotización
   de prueba real, antes de avisarle al equipo de Inamar Izaje que la
   aprobación ya está activa.

## Ya confirmado (por vos, en esta sesión)

- UN: Inamar Izaje.
- Monto: mayor a $1.000.000.
- Descuento: alcanza con que **un solo producto** de la cotización tenga
  10% o más (no es el promedio de toda la cotización).
- Aprobador: Rodrigo Verdugo.
- Acción al aprobar: pasa a "Cotización Aprobada" (sin función
  personalizada).
- La función `Ejecución Proceso Aprobacion descuento Minimo` (revisada
  con vos) **no aplica acá** — es la acción posterior de otro proceso de
  aprobación (el de "Precio por debajo del mínimo", aprobador Product
  Manager Izaje), no calcula ningún porcentaje.

## Por qué no armo yo la regla completa

Crear/editar Reglas de flujo de trabajo y Procesos de aprobación no está
entre las herramientas conectadas del MCP de Zoho CRM (mismo límite ya
documentado en propuestas anteriores — solo hay CRUD de registros y
metadata de módulos/campos). Te dejo esta guía para que armes los 3
pasos vos mismo en el Sandbox; avisame cuando esté probado para dejarlo
anotado como implementado, o si en el Paso 2 el módulo "Artículos
presupuestados" no aparece disponible para reglas de flujo, para pasarte
la alternativa con función.
