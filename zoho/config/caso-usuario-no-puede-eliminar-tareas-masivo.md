# Caso: usuario puede borrar tareas de a una, pero no en forma masiva (~240 tareas)

Fecha: 2026-10-22 · Estado: **diagnóstico / pendiente de que Simón indique el usuario**

## Síntoma
Un usuario elimina tareas una por una sin problema, pero no puede seleccionar
varias (o todas) y borrarlas juntas. Tiene ~240 tareas pendientes.

## Causa (Zoho CRM)
En Zoho son dos permisos distintos del **perfil**:

| Permiso | Dónde | Efecto |
|---|---|---|
| Eliminar en módulo Tareas | Perfil → Permisos de módulo → Tareas → Eliminar | Borrar de a un registro (ya lo tiene) |
| **Eliminación masiva (Mass Delete)** | Perfil → Permisos de herramientas → Eliminación masiva | Borrar varios registros seleccionados a la vez desde la vista de lista |

Si el perfil no tiene "Eliminación masiva", el usuario no ve/puede usar la
acción "Eliminar" con varios registros seleccionados. El MCP no permite leer
perfiles, así que se verifica en Setup.

## Solución propuesta (requiere OK de Simón — es cambio en CRM en vivo)
**Opción A — habilitar el permiso (recomendada si es algo recurrente):**
1. Configuración → Usuarios y control → Control de seguridad → Perfiles.
2. Abrir el perfil del usuario → Permisos de herramientas → activar
   **Eliminación masiva** → Guardar.
   - Ojo: aplica a **todos** los usuarios de ese perfil y a todos los módulos
     donde tengan permiso de eliminar. Si no se quiere eso, clonar el perfil
     y asignar el clon solo a este usuario.
3. El usuario, en Tareas, pone la vista en 100 registros por página, marca
   la casilla de "seleccionar todo" y elimina → 3 tandas para 240.

**Opción B — borrado puntual sin tocar permisos:** Simón (admin) o Claude vía
API borra las ~240 tareas filtrando por propietario (+ estado si aplica).
Claude puede hacerlo en lotes de 100 con el OK explícito y el criterio exacto.

Lo eliminado queda 60 días en la Papelera de reciclaje (recuperable).

## Contexto de datos (tareas no completadas por propietario, 2026-10-22)
Ningún propietario tiene exactamente 240; los más cercanos: Silva 264,
Rodriguez 255, Valdes 193. Falta confirmar de qué usuario se trata.
