# Plan de Implementación - Sincronización de UI en Disponibilidad Admin

Este plan detalla los cambios necesarios para que el selector de fecha en la sección de "Gestionar Estado" de `AdminAvailabilityComponent` coincida con el estilo del modal de "Reserva Manual" de `AdminInventoryComponent`. Además, se incrementará la altura de las filas de vehículos en la cuadrícula de disponibilidad.

## Cambios Propuestos

### Frontend: Admin Availability

#### [MODIFY] [admin-availability.component.ts](file:///c:/Users/juanp_8h8f07l/OneDrive/Desktop/ocean-drivev2/src/app/pages/admin/availability/admin-availability.component.ts)

1.  **Selector de Fecha (Gestionar Estado)**:
    *   Reemplazar el selector de fecha personalizado (mini-picker) en los campos "Desde" y "Hasta" por el componente `app-calendar`.
    *   Sincronizar el estilo del botón activador (colores, bordes, iconos) para que coincida con el de `admin-inventory`.
    *   Asegurar que el desplegable use el posicionamiento y animaciones (`animate-scale-in`) correctas.
    *   Actualizar los métodos `togglePicker` y crear `onPickerDateSelected` para manejar la selección con `app-calendar`.

2.  **Altura de Vehículos**:
    *   Localizar la definición de la fila de la cuadrícula de disponibilidad.
    *   Cambiar la clase `min-h-[45px]` por `min-h-[70px]` (o un valor similar que se vea "premium" según `AGENTS.md`) para dar más aire y visibilidad a cada vehículo.

## Plan de Verificación

### Verificación Manual
1.  **Navegación**: Ir a la sección de Disponibilidad en el panel de admin.
2.  **Altura**: Comprobar visualmente que las filas de los vehículos son más altas y el contenido está bien distribuido.
3.  **Selector de Fecha**:
    *   Hacer clic en "Desde" o "Hasta" en el panel lateral de "Gestionar Estado".
    *   Verificar que se abre el mismo calendario (`app-calendar`) que en el inventario.
    *   Seleccionar una fecha y verificar que se actualiza el campo correctamente.
    *   Cerrar el selector haciendo clic fuera y verificar que se comporta como se esperaba.

### Pruebas Automatizadas
*   No se requieren nuevas pruebas automatizadas para este cambio estético, pero se verificará que el servidor de desarrollo compile sin errores después de los cambios.
