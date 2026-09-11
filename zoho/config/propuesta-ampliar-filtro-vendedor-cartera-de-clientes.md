# Propuesta: ampliar el filtro del campo "Vendedor" en Cartera de Clientes

## Estado: PROPUESTO — pendiente de OK del usuario para aplicar

## Por qué (el problema que reportó Simón)

Al asociar un cliente a una **Cartera de Cliente** (módulo
`Cartera_de_Clientes`), el campo **Vendedor** (búsqueda de usuario) no
muestra a algunos vendedores reales al buscarlos.

Revisando la configuración del campo en el CRM (Producción) encontré la
causa: el campo `Vendedor` tiene un **filtro de búsqueda** que solo deja
elegir usuarios que cumplan **las dos condiciones a la vez**:

1. Perfil = `Vendedor`, `Administrator`, `Responsable de Área` o
   `Asistente`.
2. Tengan cargado el campo `Código de Vendedor` en su ficha de usuario
   (no puede estar vacío).

El problema es que esos 4 perfiles son los **antiguos**. Con el tiempo se
crearon perfiles nuevos para vendedores de otras unidades de negocio
(Inamar Vapor, Maktotal, Distribución y Repuestos Jardín, etc.) y el
filtro nunca se actualizó para incluirlos. Resultado: aunque esas personas
sí pueden editar el campo `Vendedor` (tienen permiso en su perfil), **nunca
aparecen en la lista** al buscarlos, tengan o no el Código de Vendedor
cargado.

## Usuarios activos afectados hoy (perfil no incluido en el filtro)

Encontrado revisando los usuarios activos del CRM en vivo:

| Perfil (no está en el filtro) | Cantidad de usuarios activos |
|---|---|
| Vendedor Distribución y Repuestos jardín | 17 |
| Vendedor MIV | 7 |
| Gerente | 8 |
| Responsable de Área MIV y MAK | 4 |
| Vendedor MAK | 1 |

Ejemplos concretos: Pamela Torres, Rodrigo Lagos, Walter Riquelme, Andres
De la cuadra Ramos, Patricio Garcia, Victor Vergara (todos perfil
"Vendedor Distribución y Repuestos jardín", **con** Código de Vendedor
cargado) — ninguno aparece hoy en el buscador del campo `Vendedor` de
Cartera de Clientes, aunque son vendedores activos.

Además, dentro de los 4 perfiles que sí están en el filtro, hay usuarios
sin `Código de Vendedor` cargado — a esos tampoco les va a aparecer nada
raro, simplemente no van a salir en la lista hasta que se les cargue el
código (esto es aparte del punto de los perfiles).

## Solución propuesta

Editar el filtro de búsqueda (lookup filter) del campo `Vendedor` en el
módulo `Cartera_de_Clientes`, agregando los perfiles faltantes a la
condición de perfil:

- Vendedor Distribución y Repuestos jardín
- Vendedor MIV
- Vendedor MAK
- Responsable de Área MIV y MAK
- (a confirmar con Simón: ¿el perfil `Gerente` también debería poder
  aparecer como Vendedor de una cartera, o es intencional que los
  Gerentes no salgan en esta lista?)

La segunda condición (Código de Vendedor no vacío) se deja igual — tiene
sentido como filtro, solo falta que cada usuario tenga el código cargado.

## Cómo aplicarlo

Esto **no se puede hacer por API** (el conjunto de tools MCP conectado no
tiene una operación para editar el filtro de búsqueda de un campo
existente, solo para crear campos nuevos). Hay que hacerlo a mano en el
CRM:

1. Configuración → Personalización → Módulos y campos → **Cartera de
   Cliente**.
2. Editar el campo **Vendedor**.
3. En "Filtro de búsqueda" (lookup filter), agregar los perfiles listados
   arriba a la condición de "Perfil es cualquiera de".
4. Guardar y probar buscando a uno de los usuarios de la lista de
   ejemplos.

Recomendado probarlo primero en el **Sandbox** y después replicarlo en
Producción, siguiendo la regla general del repo para cambios en el CRM en
vivo.

## Pendiente

- Confirmar con Simón si el perfil `Gerente` debe quedar incluido o no.
- Una vez confirmado, Simón aplica el cambio de filtro (no soy yo con las
  tools conectadas, ver arriba).
- Si además hace falta cargar el `Código de Vendedor` a usuarios
  puntuales que no lo tienen, eso sí lo puedo hacer yo con las tools
  conectadas (`updateUser`) — pero solo con su OK explícito y sabiendo
  qué usuarios específicos.
