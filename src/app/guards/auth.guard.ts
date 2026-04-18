import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

export const authGuard = () => {
    const apiService = inject(ApiService);
    const router = inject(Router);

    // Check if user is authenticated AND token is not expired
    if (apiService.isAuthenticated()) {
        return true;
    }

    // Check if token is expired (user was logged in but session expired)
    if (apiService.isTokenExpired() && localStorage.getItem('user')) {
        // Clear expired session
        apiService.forceLogout('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return false;
    }

    // Redirect to login if not authenticated
    return router.navigate(['/login']);
};
