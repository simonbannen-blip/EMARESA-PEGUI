# Caso: clonar una cotización a otro RUT (cliente) no guarda

Fecha: 2026-11-10 · Estado: **diagnóstico preliminar, falta el mensaje exacto**

## Síntoma (reportado a Simón)
Un usuario clona una cotización y cambia el **Nombre de Cliente** a otro RUT.
El sistema deja cambiarlo, pero al Guardar/Actualizar "lo bota" y no guarda.
Pregunta: ¿es falla o está hecho para que no se pueda clonar a otro RUT?

## Qué revisé (solo lectura, metadata de Cotizaciones)
- No hay ninguna regla que prohíba clonar a otro cliente. El único bloqueo
  explícito conocido es el Client Script **"Deshabilitar clonar cotización"**
  (onSave), que filtra por **perfil** (Administrator + perfiles MIV, ver
  `caso-usuarios-miv-no-pueden-clonar-cotizaciones.md`), no por cliente, y
  muestra el aviso "usted no tiene permisos para clonar cotización!".
- Al clonar se copian los campos vinculados al cliente ORIGINAL. Varios
  tienen **filtro de búsqueda** que los amarra al cliente:
  | Campo | Filtro |
  |---|---|
  | Nombre de Contacto (`Contact_Name`) | sí (query 5404724000033973074) |
  | Sucursal del Cliente (`Sucursal_del_Cliente`) | sí (query 5404724000033973006) |
  | Activo (`Activo`) | sí, y **revalida al editar** |
  | Obra Rental (`Obra_Rental`) | sí |
  | Nombre de Oportunidad (`Deal_Name`) | sin filtro, pero queda la oportunidad del cliente original |
- Si se cambia solo el cliente, contacto/sucursal/oportunidad quedan del RUT
  anterior → el guardado falla o la cotización queda inconsistente (mismo
  patrón que el caso COT-II10022-1776: sucursal de otro cliente → no se
  generó la OV).

## Conclusión entregada
No está diseñado para impedir clonar a otro RUT; lo más probable es que
falle porque quedan datos del cliente anterior. Al clonar a otro RUT hay que
cambiar, antes de guardar: Cliente, Contacto, Sucursal del Cliente,
Oportunidad (una del cliente nuevo), dirección de facturación/despacho,
Plazo de pago y, si aplica, Obra Rental / Activo.

Si con eso sigue fallando: pedir **captura del mensaje**, número de la
cotización y usuario (perfil/UN) para ubicar la regla exacta. Ojo: en
Rental el clonado oficial es por "Editar Cotización ▾ → Clonar Cotización"
(Cotizador), no por el Clonar nativo.
