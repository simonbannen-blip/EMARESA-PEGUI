# Propuesta: Dayana Nossa ve todo Ferretek, quedando bajo el Subgerente

Fecha: 2026-11-11 · Estado: **propuesta, la aplica Simón desde Configuración**
(el MCP de Zoho no permite editar roles ni reglas de uso compartido; no se tocó el CRM)

## Pedido
Que Dayana Nossa vea todo lo de Ferretek, pero quedando por debajo del
Subgerente en el organigrama.

## Situación actual (datos reales del CRM)
- Dayana Nossa (id 5404724000412383001) · perfil "Responsable de Área" ·
  rol **Gestor Comercial** (id 5404724000632720504).
- Su rol ya cuelga de **Sub Gerente** (id 5404724000033273401, Omar
  Arriagada) → la parte de "estar debajo del subgerente" ya está.
- Gestor Comercial **no tiene a nadie debajo** → en módulos privados solo ve
  sus propios registros.
- Bajo Sub Gerente están los 8 usuarios Ferretek: Dayana Nossa, Isolmar
  Zambrano (Encargado de Tienda 1), Juan Gomez y Juan París (Gestores
  Comerciales de Tienda 1), Hugo Aravena (Vendedores Terreno), Julio Arias
  (Enc. Sucursal Vitacura), Yerko Vargas (Enc. Sucursal Puerto Varas),
  Antonio Fernandez (Enc. Sucursal Huechuraba).
- Oportunidades con UN Ferretek (1.025) son **todas** de dueños de ese
  equipo: París 189, Gomez 174, Nossa 160, Vargas 147, Fernandez 137,
  Arias 117, Aravena 101.

## Recomendado: reglas de uso compartido (no se mueve el organigrama)
Configuración → Seguridad → Uso compartido de datos → en cada módulo →
Nueva regla:
- Tipo: basada en propietario
- Registros de: **Roles y subordinados – Sub Gerente**
- Compartir con: **Roles – Gestor Comercial**
- Acceso: **Lectura/Escritura** (o Solo lectura si solo debe mirar)
- Módulos: Clientes, Contactos, Oportunidades, Cotizaciones, Órdenes de
  venta, Posibles clientes, Actividades (y los custom privados que use).

Resultado: Dayana ve todo lo del equipo Ferretek (incluido lo de Omar),
sigue debajo del Subgerente y Omar sigue viéndolo todo como hoy.

## Alternativa (no recomendada): mover roles
Hacer que los roles de Tienda, Sucursales y Terreno cuelguen de Gestor
Comercial. Le daría acceso total por jerarquía, pero cambia el organigrama
(afecta todos los módulos, aprobaciones y reportes "de mis subordinados").
