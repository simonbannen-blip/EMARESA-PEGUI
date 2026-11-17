# Caso: Responsable de Área ve "El Registro(s) no accesible(s)" en Tareas

Fecha: 2026-11-17 · Estado: **diagnóstico / falta saber qué usuario y qué estaba haciendo**

## Síntoma
Un usuario con perfil **Responsable de Área** reporta que "no tiene permisos
para hacer tareas". En pantalla, módulo Tareas: *"El Registro(s) no
accesible(s) al que intenta acceder no está disponible"* (sin permisos sobre
ese registro, o registro eliminado).

## Revisión en el CRM (solo lectura)
- El perfil **Responsable de Área** (`5404724000036372151`) **sí tiene acceso
  al módulo Tareas** (está entre los 11 perfiles habilitados; también
  "Responsable de Área MIV y MAK").
- Usuarios de ese perfil **están creando tareas sin problema** en el último
  mes: Nayadeth Rebolledo 60, Carlos Charlin 28, Ismael Taha 9,
  Gonzalo Sanhueza 1 (y de "MIV y MAK": Lledo 3, Alarcon 4, Herrera 1).
- Hay 41 usuarios activos con perfil Responsable de Área.

## Conclusión
No es un problema de permiso del perfil para crear tareas. Ese mensaje de
Zoho aparece cuando se intenta **abrir una tarea puntual** que el usuario no
puede ver, típicamente:
1. Abrió un **link / notificación / correo** de una tarea cuyo propietario
   no está bajo su rol (jerarquía) y Tareas no está compartido con él.
2. La tarea **fue eliminada** (o reasignada) después de enviarse el aviso.
3. La tarea está asociada a un registro (Cliente/Oportunidad) que él no ve.

## Pendiente con Simón
- ¿Qué usuario es?
- ¿Qué hizo justo antes del error: botón "Crear tarea", abrir una tarea desde
  una notificación/correo, o abrir una tarea desde un cliente/oportunidad?
  (si se tiene el link/URL de la tarea, con eso se revisa propietario y estado).

Posibles soluciones según el caso (requieren OK, cambio en CRM en vivo):
- Reasignar esa tarea al usuario, o
- Ajustar su **Rol** (jerarquía) o una **regla de uso compartido** del módulo
  Tareas para que vea las tareas de su equipo.
