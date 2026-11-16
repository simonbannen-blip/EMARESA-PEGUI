# Caso: "Celular" del vendedor sale vacío en la plantilla de cotización (Inamar Izaje)

**Fecha**: 2026-11-16 · **Estado**: diagnosticado — propuesta pendiente OK de Simón

## Síntoma

En la plantilla de cotización Inamar (Cotización N° 3046, cliente
Valenzuela y Valenzuela Ltda), el bloque de contacto del vendedor sale así:

| Campo de plantilla | Resultado |
|---|---|
| `«Cotizaciones.Propietario de Cotización»` | Luis Castañeda ✅ |
| `«Usuarios.Teléfono»` | **(vacío)** ❌ |
| `«Usuarios.Correo electrónico»` | stirapegui@emaresa.cl ❌ (no es el correo de Luis) |

## Diagnóstico

Los campos **`Usuarios.*`** en una plantilla de combinación de Zoho
**no son del propietario de la cotización**, son del **usuario que genera
el documento** (el que hace clic en "Combinar/Descargar").

En la prueba el documento lo generó Simon Tirapegui:

| Usuario | Correo | Teléfono | Móvil |
|---|---|---|---|
| Simon Tirapegui (quien generó) | stirapegui@emaresa.cl | vacío | vacío |
| Luis Castañeda (propietario) | lcastaneda@inamarizaje.cl | vacío | +569 3886 2317 |

Por eso:
1. **Celular vacío**: Simon no tiene teléfono cargado. Además, aunque lo
   genere Luis, tampoco saldría: su número está en **Móvil**, no en
   **Teléfono**.
2. **Correo equivocado**: sale el de quien generó, no el del vendedor.

En el módulo Cotizaciones no existe hoy ningún campo con el celular/correo
del propietario (solo `Owner`, tipo lookup de usuario).

## Propuesta (no aplicada)

**Opción A — rápida, sin cambios en CRM**: en la plantilla cambiar
`«Usuarios.Teléfono»` por `«Usuarios.Móvil»` y que **cada vendedor genere
su propia cotización**. Sirve solo si siempre la descarga el propietario.

**Opción B — recomendada**: crear en Cotizaciones dos campos de texto
- `Celular Vendedor`
- `Correo Vendedor`

llenados por una regla de flujo de trabajo (al crear y al editar, cuando
cambie el Propietario) con una función Deluge que copie `mobile` y `email`
del usuario propietario. En la plantilla usar
`«Cotizaciones.Celular Vendedor»` y `«Cotizaciones.Correo Vendedor»`.
Así el dato correcto sale sin importar quién genere el PDF.

Complemento: cargar el Móvil en la ficha de usuario de los vendedores que
no lo tengan.
