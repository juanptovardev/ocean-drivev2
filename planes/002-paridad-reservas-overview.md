# Plan 002: Análisis de Paridad de Reservas en Overview

## Objetivo
Evaluar la necesidad de incluir un botón de "Reserva Manual" en el panel de **Overview** (`AdminOverviewComponent`) para mantener la paridad con los paneles de **Inventario** y **Disponibilidad**.

## Análisis de Situación
El componente `AdminOverviewComponent` está diseñado como un **Dashboard de Resumen** de alto nivel. Sus funciones principales son:
1. Visualizar métricas rápidas (ingresos, vehículos libres, mantenimiento).
2. Mostrar listas cortas de próximos retiros y entregas.
3. Proporcionar un mini-calendario de referencia.

Actualmente, el componente incluye un botón de "Expandir" (`navigateToBookings()`) que redirige al usuario al panel de **Disponibilidad**, donde se encuentra la interfaz completa de gestión y el calendario interactivo.

## Propuesta de Diseño
Para mantener la simplicidad y el propósito de "resumen" del Overview:
- **NO** se añadirá un botón de reserva manual directamente en esta vista.
- Se refuerza el uso de la navegación hacia el panel de **Disponibilidad** para realizar operaciones de gestión.
- Esto evita la duplicación de lógica compleja de formularios y validaciones en un tercer componente, facilitando el mantenimiento.

## Conclusión
La paridad funcional se garantiza mediante el flujo de navegación existente, asegurando que el administrador siempre tenga acceso rápido a la creación de reservas desde el panel principal de gestión de flota.
