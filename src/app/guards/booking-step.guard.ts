import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { BookingService } from '../../services/booking.service';

export const bookingStepGuard: CanActivateFn = (route, state) => {
    const bookingService = inject(BookingService);
    const router = inject(Router);
    const reservation = bookingService.reservation();
    const targetPath = route.routeConfig?.path;

    // Check Step 1 Completion (Dates & Cities)
    const hasDates = !!reservation.pickup.date && !!reservation.dropoff.date;
    const hasCities = !!reservation.pickup.city; // Dropoff city optional if same path logic

    if (!hasDates || !hasCities) {
        // Redirect to Step 1 if basic data missing
        return router.createUrlTree(['/paso-1']);
    }

    // Step 2 Guard (going to Paso 2)
    // If we have dates, Paso 2 access is valid.
    if (targetPath === 'paso-2') {
        return true;
    }

    // Step 3 Guard (going to Paso 3)
    // Requires Car Selection
    const hasCar = !!reservation.selectedCar;
    if (targetPath === 'paso-3') {
        if (!hasCar) return router.createUrlTree(['/paso-2']);
        return true;
    }

    // Step 4 Guard (going to Paso 4)
    // Requires Car Selection (Insurance has default 'basic')
    if (targetPath === 'paso-4') {
        if (!hasCar) return router.createUrlTree(['/paso-2']);
        return true;
    }

    return true;
};
