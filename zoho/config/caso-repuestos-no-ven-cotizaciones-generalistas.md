# Caso: vendedores de Repuestos no ven cotizaciones de Vendedores Generalistas

Fecha: 2026-10-29 · Estado: **propuesta, pendiente OK de Simón** (no se tocó el CRM)

## Pedido
Que los vendedores de repuestos puedan ver las cotizaciones de los
Vendedores Generalistas.

## Diagnóstico (datos reales del CRM, usuarios activos)

| Rol | ID rol | Usuarios activos |
|---|---|---|
| Vendedores Repuestos (bajo Encargado de Repuestos) | — | **ninguno** |
| Repuestos 2.0 (cuelga directo del tope, aparte) | 5404724000616658050 | Ernesto Corvalán, Manuel Ortiz, Raul Muñoz, Walter Uribe |
| Vendedor Repuesto Jardín | 5404724000047747297 | Walter Riquelme |
| Vendedores Generalistas (bajo Jefe de Ventas Construcción) | 5404724000033273502 | Cristian Collao Gahona, Cristian Jara, Cristian Nuñez, Cristian Silva, Fabiola Sanhueza, Hector Godoy, Sergio Guerrero, Victor Olivares |

Causas:
1. Los vendedores de repuestos **no están en el rol "Vendedores Repuestos"**:
   están en "Repuestos 2.0" (y uno en "Vendedor Repuesto Jardín"). Mover el
   rol "Vendedores Repuestos" no les cambia nada.
2. En Zoho un rol solo ve los registros de los roles que están **debajo** de
   él. "Repuestos 2.0" y "Vendedores Generalistas" están en ramas distintas
   del organigrama, así que no se ven entre sí (Cotizaciones es privado).

## Opción recomendada: regla de uso compartido (no toca el organigrama)
Configuración → Seguridad → Uso compartido de datos → Cotizaciones →
Nueva regla:
- Registros de: **Rol – Vendedores Generalistas**
- Compartir con: **Rol – Repuestos 2.0** (y repetir para "Vendedor
  Repuesto Jardín" si aplica)
- Acceso: **Solo lectura**
- Opcional: activar "Superiores" para que sus jefes también las vean.

Ventaja: Margot (Jefe de Ventas Construcción) sigue viendo a sus
Generalistas, y los de repuestos ven las cotizaciones sin poder editarlas.

## Alternativa: mover roles en el organigrama
Hacer que "Vendedores Generalistas" reporte a "Repuestos 2.0".
Desventaja: Margot y la rama Construcción dejarían de ver a los
Generalistas (salvo que "Repuestos 2.0" también pase a colgar de Jefe de
Ventas Construcción). Además da a repuestos acceso de edición, no solo
lectura. No recomendada.

> El MCP de Zoho no permite editar roles ni reglas de uso compartido:
> este cambio se hace a mano desde Configuración.

## Verificación 29-10 (seguimiento)
Simón confirma que los vendedores ya están en "Repuestos 2.0" y aun así no
ven. Consulta al CRM (usuarios subordinados por rol):
- Bajo **Repuestos 2.0** → **0 usuarios** (no tiene a nadie debajo).
- Bajo **Jefe de Ventas Construcción** → los 8 Vendedores Generalistas.

Confirma la causa: Repuestos 2.0 es una hoja suelta del organigrama, no
está por encima de Vendedores Generalistas. Estar en ese rol no da
visibilidad; falta la regla de uso compartido (o mover el rol).
