# Propuesta: que las notas no las vean usuarios de otras UN

Fecha: 2026-11-17 · Estado: **propuesta, no aplicada** (el MCP de Zoho no
permite leer ni editar uso compartido de datos ni crear módulos; tampoco
tiene permiso para leer el módulo Notas → no se tocó ni revisó nada en el CRM)

## Pedido
Simón: que las notas no las puedan ver personas de otras Unidades de
Negocio. Aplica a notas en **Clientes** y en **Oportunidades**.

## Cómo funciona en Zoho
Las notas **no tienen permisos propios**: una nota la ve cualquiera que
pueda ver el registro donde está (Cliente, Oportunidad, etc.). No existe
"nota privada" ni "nota solo para mi UN".

## Parte 1 — Oportunidades (se resuelve con permisos)
Una Oportunidad pertenece a una sola UN → si solo la ve su UN, sus notas
también.

Configuración → Seguridad → Uso compartido de datos:
1. **Oportunidades** en **Privado** (no "Público lectura" ni "Público
   lectura/escritura").
2. Revisar las reglas de uso compartido de Oportunidades: ninguna debe
   compartir registros de una UN con roles de otra UN.
3. Organigrama: cada UN en su propia rama de roles (ej. Ferretek bajo Sub
   Gerente). Quien esté arriba de varias ramas (Gerencia, Administradores)
   seguirá viendo todo — es esperable.
4. Ojo con usuarios de perfil **Administrator**: ven todo siempre.

Prueba: entrar como un usuario de otra UN (o pedirle a uno) y confirmar que
no ve la Oportunidad ni sus notas.

## Parte 2 — Clientes (los permisos NO alcanzan)
Un Cliente se comparte entre UN (por eso existe Segmentos de Cuentas: un
Segmento por UN). Si Clientes queda privado, las otras UN dejan de ver al
cliente completo → no sirve. Mientras el Cliente sea visible para varias
UN, **todas sus notas también lo son**.

Además, la sección Notas del Cliente puede mostrar las notas de sus
Oportunidades y Contactos asociados → incluir eso en la prueba.

### Recomendado: módulo nuevo "Notas por UN"
Módulo personalizado **privado**, que reemplaza el uso de Notas en el
Cliente para comentarios comerciales/internos.

Campos:
| Campo | Tipo | Obligatorio |
|---|---|---|
| Asunto | Línea única (nombre del registro) | Sí |
| Cliente | Búsqueda → Clientes | Sí |
| UN | Búsqueda → Unidades de Negocio | Sí |
| Oportunidad | Búsqueda → Oportunidades | No |
| Nota | Área de texto (larga) | Sí |
| Propietario / Fecha creación | estándar | — |

Permisos:
- Uso compartido de datos del módulo: **Privado**.
- Una regla por UN, basada en propietario: registros de *Roles y
  subordinados – [jefe de la UN]* → compartidos con *Roles y subordinados –
  [jefe de la UN]* (mismo patrón que la propuesta de Dayana Nossa /
  Ferretek). Así el equipo de una UN ve las notas de sus compañeros, y no
  las de otras UN.
- Alternativa más simple si las reglas por rol no calzan con las UN: regla
  **basada en criterio** (`UN es Ferretek` → compartir con roles Ferretek,
  etc.), una por UN.
- Perfiles: dar acceso al módulo (ver/crear/editar) a los perfiles
  comerciales.

Dónde se ve:
- Lista relacionada "Notas por UN" en el diseño de **Clientes** (y de
  Oportunidades si se llena el campo Oportunidad). Cada usuario solo ve en
  esa lista las notas que le corresponden a su UN.

Opcional: que la UN se complete sola con la UN del usuario (workflow o
valor por defecto según rol) para que el vendedor no tenga que elegirla.

### Qué hacer con la sección Notas estándar del Cliente
- Dejar instrucción al equipo: en el Cliente usar solo "Notas por UN".
  Las notas estándar quedan para información general visible para todos.
- Si se quiere forzar: quitar la sección Notas del diseño de Clientes. No
  se recomienda ocultarla por perfil (es todo o nada: dejarían de ver
  también las de su propia UN).
- Las notas antiguas ya escritas en Clientes seguirán visibles para todas
  las UN. Si hay notas sensibles, habría que moverlas a mano (o con un
  proceso aparte) al módulo nuevo.

### Descartado
- Poner Clientes en privado: corta la visibilidad del cliente entre UN.
- Ocultar Notas por perfil: los perfiles se comparten entre UN.

## Pendiente de Simón
1. Confirmar que Oportunidades está en Privado y sin reglas cruzadas.
2. OK para crear el módulo "Notas por UN" (idealmente primero en Sandbox).
3. Decidir qué hacer con las notas antiguas de Clientes.
