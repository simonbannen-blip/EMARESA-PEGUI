# Caso: Responsable de Área ve "El Registro(s) no accesible(s)" en Tareas

Fecha: 2026-11-17 · Estado: **causa encontrada / solución PENDIENTE DE OK**

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

## Actualización 2026-11-17 — usuario identificado: Gonzalo Sanhueza
- Usuario: **Gonzalo Sanhueza** (`5404724000568633001`), Rol *IyF - Sub
  Gerente de Ventas*, Perfil Responsable de Área.
- Hoy 12:33 creó la tarea **"LA ITALIANA Negocio Mix 200 basureros 120L y
  240L"** (`5404724000635125005`) y la **asignó a Carlos Charlin
  Dussaillant**. **La tarea sí se creó** (hoy figura "Completado").
- Charlin tiene **el mismo rol** que Gonzalo (IyF - Sub Gerente de Ventas),
  o sea es un **par**, no un subordinado. En Zoho uno solo ve los registros
  propios y los de su gente debajo en la jerarquía; los de un par no.
- Al guardar, Zoho lo lleva al detalle de la tarea recién creada → como ya
  es de Charlin, Gonzalo no la puede ver → aparece "Registro no accesible".
  Por eso él percibe que "no puede hacer tareas".
- Las otras 6 tareas que creó para sí mismo (septiembre) funcionan normal.

## Solución propuesta (PENDIENTE DE OK — cambio en CRM en vivo)
**Opción A (recomendada, acotada): regla de uso compartido solo en Tareas.**
Configuración → Usuarios y control → Control de seguridad → Uso compartido
de datos → Tareas → Nueva regla:
- Registros de: Rol *IyF - Sub Gerente de Ventas*
- Compartir con: Rol *IyF - Sub Gerente de Ventas*
- Acceso: Solo lectura (o Lectura/Escritura si quieren poder editarlas)

Efecto: los 4 Sub Gerentes IyF (Gonzalo Sanhueza, Carlos Charlin, Nayadeth
Rebolledo, Ismael Taha) ven las tareas entre ellos. No toca otros módulos.

**Opción B (más amplia):** en el Rol *IyF - Sub Gerente de Ventas* activar
"Compartir datos con pares". Ojo: abre **todos** los módulos (clientes,
oportunidades, cotizaciones) entre esos 4 usuarios.

**Sin cambiar nada:** es solo un aviso; la tarea se crea igual. Gonzalo
puede ignorar el mensaje, o crearla primero a su nombre y que Charlin la
vea igual por su lado.
