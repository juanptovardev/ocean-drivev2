import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const apiService = inject(ApiService);
    const router = inject(Router);

    // Check token expiration first
    if (apiService.isTokenExpired() && localStorage.getItem('user')) {
        apiService.forceLogout('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return false;
    }

    const user = apiService.currentUser();

    if (!user) {
        return router.createUrlTree(['/login']);
    }

    // Verify user is still authenticated (token not expired)
    if (!apiService.isAuthenticated()) {
        return router.createUrlTree(['/login']);
    }

    if (user.role === 'admin') {
        return true;
    }

    // Logged in but not admin -> Redirect to Reservas
    return router.createUrlTree(['/reservas']);
};
