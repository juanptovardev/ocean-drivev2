# Plan de Implementación 003: Unificación de Modal de Reserva Manual

Este plan detalla los cambios necesarios para que el modal de creación de reservas en `AdminAvailabilityComponent` sea visualmente idéntico al de `AdminInventoryComponent`, incluyendo el sistema de validación visual con asteriscos y eliminando la inserción automática de metadatos en las notas.

## Cambios Propuestos

### Frontend

#### [MODIFY] [admin-availability.component.ts](file:///c:/Users/juanp_8h8f07l/OneDrive/Desktop/ocean-drivev2/src/app/pages/admin/availability/admin-availability.component.ts)

1.  **Rediseño del Template**:
    *   Reemplazar el contenido del modal `showManualBookingModal()` para que use la estructura de `AdminInventoryComponent`.
    *   Implementar secciones "Cliente" y "Detalles Reserva" con la misma distribución.
    *   Añadir asteriscos `*` en los labels obligatorios.
    *   Ajustar fondos (`bg-white` para inputs en lugar de `bg-slate-50`).

2.  **Lógica del Componente**:
    *   Remover el prefijo `[Estado: ...]` del campo `notes` en `saveManualBooking()`.
    *   Refinar las validaciones internas para coincidir con las marcas visuales `*`.

#### [MODIFY] [admin-inventory.component.ts](file:///c:/Users/juanp_8h8f07l/OneDrive/Desktop/ocean-drivev2/src/app/pages/admin/inventory/admin-inventory.component.ts)

*   **Remoción de Prefijos**: Quitar la lógica que añade estados automáticos a las notas para mantener la consistencia en todo el panel administrativo.

## Verificación Plan

### Verificación Manual
1.  **Comparación Visual**: Abrir el modal en Disponibilidad e Inventario; deben ser idénticos (labels, asteriscos, espaciado).
2.  **Validación de Formulario**: Intentar guardar con campos vacíos y confirmar que la alerta indique qué campos faltan.
3.  **Integridad de Datos**: Crear una reserva y confirmar que las notas solo contengan lo escrito por el usuario.
