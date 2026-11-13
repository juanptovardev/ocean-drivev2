import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiService } from '../../services/api.service';

/**
 * HTTP Interceptor that handles authentication errors globally.
 * If a 401 Unauthorized response is received, it forces logout and redirects to login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const apiService = inject(ApiService);

    // Demo mode: bypass auth expiration / 401 handling
    const isDemo = (apiService as any).isDemoMode?.() === true;

    // Check token expiration before making the request (skip for demo)
    if (!isDemo && req.headers.has('Authorization') && apiService.isTokenExpired()) {
        apiService.forceLogout('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return throwError(() => new Error('Token expired'));
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (!isDemo && error.status === 401) {
                // Unauthorized - token is invalid or expired
                apiService.forceLogout('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
            }
            return throwError(() => error);
        })
    );
};
