# Guía paso a paso: campo "Probabilidad de Cierre" (lista) en Oportunidades

**Pedido (correo a Simón, 13-11-2026):** definir la probabilidad de cada
Oportunidad según fase, tipo de cotización y preferencia del cliente, para
saber qué parte de los ~6.500 MM CLP en "Cotización Enviada" son
estimativas / a firme y si nos prefieren o no.

**Decisión de Simón (13-11):** hacerlo simple — **un solo campo de lista**
con las 9 opciones. Cada opción dice la situación y su %, así al elegirla
queda claro qué probabilidad tenía la Oportunidad. Sin funciones ni
cambios a la probabilidad estándar de las fases.

---

## Parte 1 — Crear el campo en Sandbox (5 min)

**Configuración → Personalización → Módulos y campos → Oportunidades →
Diseño Standard.**

1. Arrastra una **Lista de selección** a la sección principal (cerca de
   Fase y Monto).
2. Etiqueta: `Probabilidad de Cierre`
3. Valores (copiar en este orden, uno por línea):

```
-None-
Creación - 5%
Necesita Análisis - 10%
Cot. Estimativa/Budget - Prefiere competencia - 15%
Cot. Estimativa/Budget - Nos prefiere - 20%
Cot. A Firme - Prefiere competencia - 35%
Cot. A Firme - Nos prefiere - 70%
Negociación - Prefiere competencia - 10%
Negociación - Indiferente - 60%
Negociación - Nos prefiere - 90%
```

4. Valor predeterminado: `-None-`.
5. Opcional en propiedades del campo: **Habilitar historial** (Zoho
   guarda quién cambió la opción y cuándo → se ve cómo evolucionó cada
   Oportunidad, ej. de 35% a 70%).
6. **Guardar diseño.**

## Parte 2 — Pruebas en Sandbox

| # | Qué probar | Resultado esperado |
|---|---|---|
| A | Abrir una Oportunidad, elegir una opción y guardar | Se guarda sin error |
| B | Cambiar la opción (ej. 35% → 70%) | En "Historial" / Notas aparece el cambio (si activaste el historial) |
| C | Pasar una Oportunidad por el Blueprint (Creada → Necesita Análisis …) | El Blueprint sigue igual, el campo no lo bloquea |
| D | Informe de Oportunidades en Cotización Enviada agrupado por *Probabilidad de Cierre*, sumando Monto | Se ve cuánto monto hay en 15 / 20 / 35 / 70% |
| E | Vista "Cotización Enviada sin probabilidad" (Fase = Cotización Enviada y Probabilidad de Cierre está vacío) | Lista las que faltan clasificar |

## Parte 3 — Opcionales (probar si se quieren)

- **Que solo aparezcan las opciones de la fase actual:** Configuración →
  Módulos y campos → Oportunidades → **Mapeo de dependencias de listas**
  → padre *Fase*, hijo *Probabilidad de Cierre*. (Probar en Sandbox: Fase
  la maneja el Blueprint y puede que Zoho no la deje usar como padre.)
- **Obligatorio en el Blueprint:** en las transiciones que llegan a
  Negociación, agregar *Probabilidad de Cierre* como campo obligatorio en
  "Durante".

## Parte 4 — Pasar a Producción

Repetir la Parte 1 en Producción (mismos valores, mismo orden) y crear el
informe y la vista de la Parte 2. Avisar a los vendedores que clasifiquen
sus Oportunidades abiertas, empezando por las de Cotización Enviada.

> No afecta reglas existentes (aviso al KAM, etc.): no se toca el campo
> estándar Probabilidad (%) ni las fases.

## Duda para quien lo pidió

En Cotización Enviada la tabla no tiene opción "Indiferente" (solo existe
en Negociación). Se dejó tal cual el correo; si la quieren, se agrega
como valor de la lista.
