# Checklist: Clientes (Accounts) no aparece como módulo principal al crear un Informe

## Problema

Al crear un Informe nuevo en Zoho CRM, el módulo **Clientes (Accounts)** no
aparece como opción de módulo principal, aunque el usuario tiene perfil
Administrador.

## Ya descartado (revisado por API, no es la causa)

- Visibilidad del módulo, si está habilitado para API, si aparece en el
  menú, tipo de módulo: todo es **idéntico** entre Clientes y Oportunidades
  (que sí funciona bien en Informes).
- Permisos de perfil: Administrador tiene acceso a ambos módulos por igual.
- No es posible crear/consultar Informes por API — hay que revisarlo a
  mano en Zoho.

## Qué revisar en Zoho (5-10 min)

### 1. Propiedades del módulo Clientes
1. Ir a **Configuración** (ícono de engranaje, arriba a la derecha).
2. **Personalización → Módulos y Campos**.
3. Hacer clic en **Clientes (Accounts)**.
4. Buscar las propiedades/ajustes del módulo (ícono de engranaje al lado
   del nombre del módulo, o "Module Settings").
5. Fijarse si hay algún interruptor/casillero relacionado con
   **"Informes" / "Reports"** que esté apagado. Si existe y está apagado,
   **prenderlo**.

### 2. Si el problema sigue: revisar Zoho Analytics
1. En **Configuración**, buscar **"Zoho Analytics"** o
   **"Administración de Datos"** (el nombre exacto depende de la edición).
2. Ver si hay un espacio de trabajo ("workspace") vinculado al CRM.
3. Adentro, revisar si **Clientes/Accounts** aparece como una tabla
   sincronizada. Si no aparece, hay que agregarla a la sincronización
   (puede requerir permisos de administrador de Zoho Analytics, no solo
   de Zoho CRM).

## Resultado

- [ ] Punto 1 revisado — ¿se encontró el interruptor de Informes? (sí/no)
- [ ] Punto 2 revisado — ¿Clientes está sincronizado en Zoho Analytics? (sí/no)
- [ ] Problema resuelto

_Actualizar este archivo con lo que se encuentre para dejar registro._
