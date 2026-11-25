# Caso: reunión creada en CRM no aparece en Outlook (Simón sí / David no)

Fecha: 2026-11-25 (pruebas del 24-11)

## Registros comparados (módulo Reuniones / Events)

| | Reunión de David | Reunión de Simón |
|---|---|---|
| ID | 5404724000638983018 | 5404724000639020003 |
| Título | Reunión online con Ferreteria | Prueba |
| Creada | 24-11 10:53 por David Carrasco Garrido | 24-11 10:51 por Simon Tirapegui |
| Horario | 24-11 12:00–13:00 | 24-11 12:00–13:00 |
| Relacionado con | COMERCIAL FERREDIM LIMITADA (Socios) | Simon Tirapegui (Cuenta) |
| Proveedor reunión | Microsoft Teams (con link) | Microsoft Teams (con link) |
| **Participantes** | **1: Simon Tirapegui (contacto, stirapegui@emaresa.cl)** | **ninguno** |
| **Enviar invitación ($send_notification)** | **Sí** | **No** |

## Diagnóstico

- La de David llegó a Outlook porque tenía un participante con correo y se
  envió invitación → el CRM mandó el correo de invitación (con el link de
  Teams) y Outlook lo agregó al calendario.
- La de Simón no tenía participantes ni invitación → el CRM no envió
  nada a nadie, así que Outlook nunca se enteró. La reunión existe solo en
  el calendario del CRM.
- Ambos links de Teams se generaron con la misma cuenta Microsoft
  (mismo organizador, Oid 4f2d1210-…), la conectada en la integración de
  Teams, no la de cada usuario.

## Para que aparezca en Outlook

1. Opción rápida: al crear la reunión, agregar participantes (al menos a
   uno mismo / al cliente) y dejar marcado "Enviar invitación".
2. Opción completa: que cada usuario active la sincronización de
   calendario con Microsoft 365 / Outlook (Configuración → Canales /
   Calendario → Sincronización de calendario). Así toda reunión de la que
   sea propietario se copia sola a su Outlook, con o sin participantes.
   No se puede verificar por API si cada usuario la tiene activa — revisar
   en la configuración de usuario de Simón y David.

Sin cambios en el CRM.

## Segunda prueba (25-11)

Reunión 5404724000639541232 "Prueba", creada por Simón el 25-11 16:22,
para 25-11 17:00–18:00, con Teams. Ahora sí tiene participante (David
Carrasco, dcarrascog@emaresa.cl) e invitación enviada ($send_notification
= Sí). Quedó configurada igual que la de David → la invitación debería
llegarle a David a su Outlook. Pendiente confirmar con David.

## Guía: activar sincronización de calendario CRM ↔ Outlook (por usuario)

Lo hace cada usuario en su propia sesión (no se puede por API).

1. Ruta confirmada con captura del menú de Configuración de Emaresa (25-11):
   NO está bajo "Configuración personal". Está en **Configuración →
   Marketplace → Microsoft** (opción Office 365 / Calendario). Alternativa:
   módulo **Calendario** → engranaje del calendario → Sincronización.
2. Sección **Sincronización de calendario** → **Microsoft / Office 365**
   → Sincronizar / Conectar.
3. Iniciar sesión con la cuenta @emaresa.cl y aceptar permisos.
   Si pide "aprobación del administrador", lo debe aprobar TI
   (Infraestructura) en Microsoft 365.
4. Elegir: calendario de Outlook = el principal; dirección = **ambos
   sentidos**; módulos = Reuniones. Guardar.
5. Probar: crear reunión en CRM sin participantes → debe aparecer en
   Outlook en unos minutos.

## ¿Por qué a David sí le aparece como host? (25-11)

Usuarios comparados por API: David y Simón tienen **mismo perfil
(Administrator), mismo rol (CEO), misma zona horaria**. No hay diferencia
de permisos.

Hipótesis principal: todas las reuniones Teams creadas desde el CRM (las de
David y las de Simón) tienen el **mismo organizador Microsoft**
(Oid 4f2d1210-93bb-4614-9c6b-4d2792f106e0). La integración de Teams está
conectada con UNA sola cuenta Microsoft para toda la org. Si esa cuenta es
la de David, Microsoft crea la reunión en el calendario Outlook de David
→ por eso a él le aparece siempre, y a Simón nunca (aunque sea el dueño
en el CRM).

Prueba para confirmar: preguntar a David si en su Outlook aparece la
reunión "Prueba" de Simón del 24-11 12:00 (sin participantes). Si
aparece → confirmado.

Si se confirma: cada usuario necesita su propia sincronización de
calendario con Office 365, o agregarse como participante. La conexión de
Teams es de la org y no se puede tener por usuario desde la API.
