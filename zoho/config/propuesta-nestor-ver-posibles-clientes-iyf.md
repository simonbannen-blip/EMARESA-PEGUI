# Propuesta: Néstor Mendoza ve todos los Posibles clientes de Industria y Ferretería

Fecha: 2026-11-27 · Estado: **propuesta, la aplica Simón desde Configuración**
(el MCP de Zoho no permite ver ni editar roles ni reglas de uso compartido; no se tocó el CRM)

## Pedido
Que Néstor vea todos los Posibles clientes de la UN Industria y Ferretería.
Hoy solo ve los del usuario Maktotal, aunque Simón le armó un rol para que vea todo.

## Por qué solo ve los de Maktotal (datos reales del CRM)
- Néstor Mendoza (id 5404724000048746001) · perfil "Responsable de Área MIV y MAK" ·
  rol **Jefe de Ecommerce** (id 5404724000062142007).
- Bajo ese rol está **Asistente Ecommerce** (id 5404724000062142026), que es el rol
  del usuario **Maktotal** → por jerarquía Néstor ve solo lo de Maktotal.
- Posibles clientes es **privado**: un rol solo deja ver lo propio + lo de los roles
  que cuelgan debajo. Los demás dueños de leads IyF están en otras ramas del
  organigrama, así que el rol nuevo no le alcanza.
- Teobaldo Díaz también tiene el rol Jefe de Ecommerce (ojo: cualquier regla al rol
  le aplica también a él).

Posibles clientes con UN = Industria y Ferretería: **632**, por dueño:

| Dueño | Leads |
|---|---|
| Fredy León | 162 |
| Maktotal | 146 (los únicos que ve hoy) |
| Daniel Cartagena | 69 |
| Patricio García | 54 |
| Rodrigo Lagos | 44 |
| Marina Villalobos | 43 |
| Infraestructura Emaresa | 34 |
| Pamela Torres | 32 |
| Victor Vergara | 28 |
| William Castillo | 20 |

## Recomendado: regla de uso compartido por criterio (no mover el organigrama)
Configuración → Seguridad → Uso compartido de datos → Posibles clientes →
**Nueva regla de uso compartido**:
- Tipo: **basada en criterios**
- Criterio: **UN es Industria y Ferretería**
- Compartir con: **Roles – Jefe de Ecommerce** (le llega a Néstor y a Teobaldo).
  Si debe ser **solo Néstor**: crear antes un Grupo (Configuración → Usuarios y
  control → Grupos) con solo Néstor y compartir con ese grupo.
- Acceso: **Solo lectura** (o Lectura/Escritura si debe editarlos/convertirlos)
- Guardar. Zoho recalcula el acceso en unos minutos.

Resultado: Néstor ve los 632 leads IyF (y los nuevos que entren con esa UN),
sin cambiar a quién reporta nadie.

## Alternativa (no recomendada): mover roles
Colgar los roles de IyF bajo Jefe de Ecommerce. Le daría acceso por jerarquía, pero
cambia el organigrama en **todos** los módulos (oportunidades, cotizaciones,
aprobaciones, reportes "de mis subordinados").

## Cómo probarlo
Después de guardar la regla, que Néstor entre a Posibles clientes → vista
"Todos los Posibles clientes" con filtro UN = Industria y Ferretería: debería ver 632.
