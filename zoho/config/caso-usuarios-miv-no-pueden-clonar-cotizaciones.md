# Caso: usuarios MIV no pueden clonar cotizaciones

Fecha: 2026-10-22 · Estado: **hipótesis "falta Crear" descartada / falta el síntoma exacto**

## Perfiles involucrados (usuarios activos)
- **Vendedor MIV** (7): Lorena Argomedo, Braulio Guzmán, Daniela Muñoz Gomez,
  Nicolas Avila, Pablo Farias, Patricio Castro, Vladimir Barrales.
- **Responsable de Área MIV y MAK** (4): Francisco Lledo Calvo, Jorge Ancao
  Paillalef, Sebastian Herrera Romero, Patricio Alarcon.

## Qué revisé (solo lectura)
- En Zoho clonar = **crear** un registro nuevo con los datos del original. No hay
  un permiso aparte para clonar: depende del permiso **Crear** en Cotizaciones del perfil.
- Ambos perfiles tienen acceso al módulo Cotizaciones y al layout Standard (único).
- **Responsable de Área MIV y MAK** crea cotizaciones a diario (COT-MIV-000232
  a 000239, 14 al 22-10) → tiene "Crear". **Vendedor MIV** creó solo 3 en total
  (Argomedo 1, Guzmán 2) → probablemente le falta "Crear" en Cotizaciones.
- Campos: ningún campo obligatorio está oculto para MIV. Los campos ocultos
  (aprobadores, Obra Rental, Código vendedor, Plazo de entrega del ítem, etc.)
  no impiden clonar, solo no se copian.
- Módulos vinculados: MIV tiene acceso a Cuentas, Contactos, Oportunidades,
  Productos, UN, Líneas, Sucursales, Formas de pago, Transportistas. Le faltan
  Obras Rental y Catálogos de precios (y Segmentos en Resp. Área MIV), pero en
  sus cotizaciones esos campos vienen vacíos → no deberían bloquear.

## Solución propuesta (requiere OK — cambio en CRM en vivo, lo hace Simón en Setup)
1. Configuración → Usuarios y control → Control de seguridad → Perfiles →
   **Vendedor MIV** (y verificar también **Responsable de Área MIV y MAK**).
2. Permisos de módulo → **Cotizaciones** → activar **Crear** (además de Ver/Editar) → Guardar.
3. Probar con un usuario MIV: abrir una cotización → menú "…" → **Clonar**.

Si después de eso sigue fallando, el mensaje exacto de error indica qué
módulo/campo falta (ver tabla de módulos arriba).

## Actualización 2026-10-22 — captura de Simón
El perfil (Campañas y Órdenes de venta apagados → coincide con Vendedor MIV)
**ya tiene Cotizaciones: Vista, Crear, Editar**. Hipótesis de "falta Crear"
descartada. Además, Vendedor MIV casi no usa cotizaciones (es dueño de 1);
las cotizaciones MIV las hacen los Responsables de Área MIV y MAK (que también crean).

Revisada COT-MIV-000239 (Ancao): ítems sin Catálogo de precios, sin Obra Rental
ni Segmento; Blueprint activo; registro no bloqueado. Nada que impida clonar
a nivel de permisos/datos.

Pendiente de Simón: quién lo intentó, en qué cotización, y qué pasa exactamente
(no aparece "Clonar" en el menú "…", o sale un mensaje de error — cuál).
Nota: existen los campos "ID Cotizac. Original" y "Tipo de Cotización"
(1° Selección…) — revisar si hay un botón/flujo propio para clonar/revisar
cotizaciones que esté restringido por perfil.

## Actualización 2 — se usa el "Clonar" nativo (menú "…")
Captura de Simón (vista admin) en COT-MIV-000239: el menú "…" muestra Clonar y
además **"Botón Crear"**, que es la personalización de botones estándar
(Crear / Editar / Clonar) por perfil y layout. Como la org redirige la creación
y edición al Cotizador ("Editar Cotización"), lo más probable es que **Clonar
esté sobrescrito u oculto para los perfiles MIV** en esa configuración.

Revisar: Configuración → Personalización → Módulos y campos → Cotizaciones →
Botones → botones estándar (o "…" → Botón Crear) → acción **Clonar**: ver qué
regla aplica a "Vendedor MIV" y "Responsable de Área MIV y MAK" y dejarla
igual a la de los perfiles que sí pueden clonar.
