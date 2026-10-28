# Propuesta: permiso "Exportar" en Cotizaciones y Oportunidades para MIV

**Pedido (2026-10-28):** que los usuarios de MIV puedan exportar
Cotizaciones y Oportunidades.

## Perfiles afectados

- **Vendedor MIV** (7 usuarios)
- **Responsable de Área MIV y MAK** (4 usuarios)

Ojo: "Responsable de Área MIV y MAK" también lo usan personas de MAK, así que
el permiso les llegará a ellos también.

## Por qué no se aplica con el MCP

El permiso de exportar vive en el **perfil** (permisos de módulo). Las
herramientas MCP de Zoho no leen ni editan perfiles → lo aplica Simón.

## Pasos (para cada uno de los 2 perfiles)

1. Configuración → Usuarios y control → **Control de seguridad** →
   pestaña **Perfiles** → abrir el perfil.
2. Sección **Permisos de módulo** → fila **Cotizaciones** → abrir el
   detalle (ícono de engranaje / clic en el módulo) → marcar **Exportar**.
3. Repetir en la fila **Oportunidades** → marcar **Exportar**.
4. Guardar.

## Qué exporta el usuario

- Solo los registros que **ya puede ver** (respeta roles y reglas de uso
  compartido) y solo los campos que su perfil tiene visibles.
- Se exporta desde la vista de lista: menú "…" → **Exportar** (o
  seleccionando registros → Exportar).
- Si además quieren exportar desde **Informes**, el permiso es aparte:
  en el mismo perfil, sección **Permisos de informes y paneles** →
  **Exportar informe**.

## Prueba

Entrar con un usuario MIV (o "Iniciar sesión como" si está disponible),
ir a Cotizaciones → vista de lista → "…" → debe aparecer **Exportar**.
Repetir en Oportunidades.
