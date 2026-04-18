# Plan 001: Corrección Integral de Reserva Manual 404

## Descripción del Problema
A pesar de los ajustes en el backend (`index.php`), la creación de reservas manuales sigue fallando con error 404. Esto se debe a que el entorno de desarrollo local redirige las peticiones `/api` al servidor de producción (`oceandrivecarental.com`), el cual aún no tiene los cambios locales aplicados. 

Además, se detectó que la validación inicial en la ruta `POST /admin/bookings` era demasiado estricta con el parámetro `vehicle_id`, causando rechazos cuando se enviaba como `force_vehicle_id`.

## Cambios Realizados y Propuestos

### Backend (Desplegar estos cambios a Producción)
- **[MODIFY] [server/public/index.php]**: 
    - Se habilitó la ruta `POST /admin/bookings`.
    - Se flexibilizó la validación para aceptar `force_vehicle_id` o `vehicle_id`.
    - Se asegura que el sistema cree un usuario automáticamente si no existe para la reserva manual.

### Frontend
- **[MODIFY] [AdminAvailabilityComponent.ts]**: 
    - Sincronización del payload para usar `force_vehicle_id`.
    - Inclusión mandatoria de `is_manual_admin_booking: true`.
- **[MODIFY] [AdminInventoryComponent.ts]**:
    - Cambio de `createBooking` (público) a `adminCreateBooking` (administrativo).
    - Inclusión de `force_vehicle_id` para garantizar que la unidad seleccionada sea la reservada.

## Plan de Verificación

### Paso Crítico: Despliegue
> [!IMPORTANT]
> Dado que no hay PHP local instalado, los cambios en `server/public/index.php` deben subirse al servidor real para que el proxy de Angular pueda encontrarlos y procesar las reservas.

### Pruebas Post-Despliegue
1. Intentar reserva manual desde **Disponibilidad**.
2. Intentar reserva manual desde **Inventario**.
3. Verificar la creación correcta en el calendario y en la base de datos (últimas reservas en Overview).
