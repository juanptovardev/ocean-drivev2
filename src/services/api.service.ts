import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, of, map, catchError } from 'rxjs';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    nationality?: string;
    doc_type?: string;
    doc_number?: string;
    created_at?: string;
}

export interface Category {
    id: number;
    name: string;
    category_type: string;
    price_per_day: number;
    price_low_season: number;
    price_high_season: number;
    base_price?: number;
    special_periods?: any;
    price_end_year?: number;
    high_season_months?: string;
    luggage?: number;
    wash_price?: number;
    image_url: string;
    description: string;
    passengers: number;
    transmission: string;
    stock: number;
    status: string;
}

// Token expiration time: 2 hours in milliseconds
const TOKEN_EXPIRATION_MS = 2 * 60 * 60 * 1000;

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    // Use proxy for local development (avoids CORS)
    // /api is proxied to production server via proxy.conf.json
    private apiUrl = this.getApiUrl();

    private getApiUrl(): string {
        const hostname = window.location.hostname;
        // Local development with proxy
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Check if running on port 4200 (Angular CLI)
            if (window.location.port === '4200') {
                return '/api';
            }
            // Local PHP server assumed at standard location if not proxied? 
            // Or maybe we want to point to the production API directly if proxy fails?
            // For now, let's stick to /api for 4200.
            return '/api';
        }
        // Production - Use absolute path from root
        return '/server/public';
    }

    // Auth state
    currentUser = signal<User | null>(this.getUserFromStorage());

    constructor(private http: HttpClient) {
        // Check token expiration on service initialization
        this.checkTokenExpiration();
    }

    // --- Token Expiration Management ---

    private checkTokenExpiration(): void {
        const loginTime = localStorage.getItem('loginTime');
        if (loginTime) {
            const elapsed = Date.now() - parseInt(loginTime, 10);
            if (elapsed >= TOKEN_EXPIRATION_MS) {
                // Token has expired, force logout
                this.forceLogout('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            }
        }
    }

    isTokenExpired(): boolean {
        const loginTime = localStorage.getItem('loginTime');
        if (!loginTime) return true;

        const elapsed = Date.now() - parseInt(loginTime, 10);
        return elapsed >= TOKEN_EXPIRATION_MS;
    }

    forceLogout(message?: string): void {
        this.logout();

        // Clear any cached data
        this.clearAppCache();

        // Store message for display on login page
        if (message) {
            sessionStorage.setItem('logoutMessage', message);
        }

        // Redirect to login
        window.location.href = '/login';
    }

    clearAppCache(): void {
        // Clear localStorage except for essential items we might need
        const keysToKeep: string[] = [];
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear caches if available
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
    }

    // --- Auth ---

    private getUserFromStorage(): User | null {
        // First check if token is expired
        const loginTime = localStorage.getItem('loginTime');
        if (loginTime) {
            const elapsed = Date.now() - parseInt(loginTime, 10);
            if (elapsed >= TOKEN_EXPIRATION_MS) {
                // Token expired, clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('loginTime');
                return null;
            }
        }

        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/register`, data);
    }

    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
            tap(response => {
                if (response.token) {
                    this.setSession(response.token, response.user);
                }
            })
        );
    }

    setSession(token: string, user: any) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('loginTime', Date.now().toString());
        this.currentUser.set(user);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        this.currentUser.set(null);
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
    }

    resetPassword(data: { token: string, password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/reset-password`, data);
    }

    isAuthenticated(): boolean {
        // Check if user exists AND token is not expired
        if (!this.currentUser()) return false;
        if (this.isTokenExpired()) {
            this.forceLogout('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            return false;
        }
        return true;
    }

    getLogoutMessage(): string | null {
        const message = sessionStorage.getItem('logoutMessage');
        if (message) {
            sessionStorage.removeItem('logoutMessage');
        }
        return message;
    }

    // --- Categories (Formerly Vehicles) ---

    // Helper for safe JSON parsing
    private parseJsonResponse(text: string): any {
        // Remove BOM and whitespace
        let cleanText = text.replace(/^\uFEFF/, '').trim();

        // Check for HTML (case insensitive)
        const isHtmlResponse = cleanText.match(/^<(!DOCTYPE|html)/i) || cleanText.startsWith('<');

        if (isHtmlResponse) {
            console.warn('[DEBUG] Detected HTML response. Server is returning webpage instead of JSON API data.');
            throw new Error('SERVER_HTML_ERROR');
        }

        // Normal JSON parsing
        try {
            return JSON.parse(cleanText);
        } catch (e) {
            console.error('[DEBUG] JSON.parse failed on:', cleanText.substring(0, 50) + '...');
            throw new Error('INVALID_JSON_RESPONSE');
        }
    }

    // --- Categories (Formerly Vehicles) ---

    // Returns list of Categories
    getVehicles(): Observable<Category[]> {
        return this.http.get(`${this.apiUrl}/vehicles`, { responseType: 'text' }).pipe(
            map(text => this.parseJsonResponse(text))
        );
    }

    getVehicle(id: string | number): Observable<Category> {
        return this.http.get(`${this.apiUrl}/vehicles/${id}`, { responseType: 'text' }).pipe(
            map(text => this.parseJsonResponse(text))
        );
    }

    // --- Bookings ---

    createBooking(bookingData: any): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.post(`${this.apiUrl}/bookings`, bookingData, { headers });
    }

    updateBooking(id: string | number, bookingData: any): Observable<any> {
        const headers = this.getAuthHeaders();
        // Try PUT /bookings/:id
        return this.http.put(`${this.apiUrl}/bookings/${id}`, bookingData, { headers });
    }

    getMyBookings(): Observable<any[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.apiUrl}/bookings/my-history`, { headers });
    }

    getBookingByCode(code: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/bookings/${code}`);
    }

    sendTicketEmail(code: string, pdfBase64: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/bookings/send-ticket-email`, { code, pdf: pdfBase64 });
    }

    clientCancelBooking(id: string | number): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.post(`${this.apiUrl}/client/bookings/${id}/cancel`, {}, { headers });
    }

    clientUpdateBooking(id: string | number, data: any): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.post(`${this.apiUrl}/client/bookings/${id}/update`, data, { headers });
    }

    subscribeToMarketing(data: { name?: string, email: string, phone?: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/marketing/subscribe`, data);
    }

    sendContactRequest(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/marketing/contact-request`, data);
    }

    checkAvailability(startDate: string, endDate: string, pickupTime: string = '10:00', dropoffTime: string = '10:00'): Observable<any[]> {
        return this.http.get(`${this.apiUrl}/bookings/availability?start_date=${startDate}&end_date=${endDate}&pickup_time=${pickupTime}&dropoff_time=${dropoffTime}`, { responseType: 'text' }).pipe(
            map((text: string) => this.parseJsonResponse(text)),
            catchError((err: Error) => {
                console.error('[DEBUG] Availability check failed:', err.message);
                if (err.message === 'SERVER_HTML_ERROR') {
                    // Propagate this specific error so component can alert user
                    throw err;
                }
                return of([]); // Return empty array on other errors
            })
        );
    }

    // --- Admin ---

    adminGetBookings(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin/bookings`, { headers: this.getAuthHeaders() });
    }

    adminUpdateBookingStatus(id: number | string, status: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/bookings/${id}/status`, { status }, { headers: this.getAuthHeaders() });
    }

    adminCreateBooking(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/bookings`, data, { headers: this.getAuthHeaders() });
    }

    adminUpdateBooking(id: number | string, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/bookings/${id}`, data, { headers: this.getAuthHeaders() });
    }

    adminDeleteBooking(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/bookings/${id}`, { headers: this.getAuthHeaders() });
    }

    // Admin: Get Categories
    adminGetVehicles(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin/vehicles`, { headers: this.getAuthHeaders() }).pipe(
            tap({
                error: (err) => {
                    if (err.status === 401) {
                        this.forceLogout('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
                    }
                }
            })
        );
    }

    adminCreateVehicle(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/vehicles`, data, { headers: this.getAuthHeaders() });
    }

    // Admin: Update Category
    adminUpdateVehicle(id: number | string, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/vehicles/${id}`, data, { headers: this.getAuthHeaders() });
    }

    adminDeleteVehicle(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/vehicles/${id}`, { headers: this.getAuthHeaders() });
    }

    adminCreateUser(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/users`, data, { headers: this.getAuthHeaders() });
    }

    adminGetUsers(role?: string): Observable<User[]> {
        const url = role
            ? `${this.apiUrl}/admin/users?role=${role}`
            : `${this.apiUrl}/admin/users`;
        return this.http.get<User[]>(url, { headers: this.getAuthHeaders() });
    }

    adminUpdateUserRole(id: number | string, role: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/users/${id}/role`, { role }, { headers: this.getAuthHeaders() });
    }

    adminDeleteUser(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/users/${id}`, { headers: this.getAuthHeaders() });
    }

    adminUpdateUser(id: number | string, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/users/${id}`, data, { headers: this.getAuthHeaders() });
    }

    // Admin: Get Vehicles (Specific Instances) by Category
    adminGetInstances(categoryId: number | string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin/vehicles/${categoryId}/instances`, { headers: this.getAuthHeaders() });
    }

    // Admin: Create Vehicle Instance
    adminCreateInstance(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/instances`, data, { headers: this.getAuthHeaders() });
    }

    adminGetInstanceBookings(instanceId: number | string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin/instances/${instanceId}/bookings`, { headers: this.getAuthHeaders() });
    }

    adminGetBooking(id: number | string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/admin/bookings/${id}`, { headers: this.getAuthHeaders() });
    }

    adminCreateMaintenanceBlock(instanceId: number | string, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/instances/${instanceId}/maintenance`, data, { headers: this.getAuthHeaders() });
    }

    adminOverrideInstance(instanceId: number | string, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/instances/${instanceId}/override`, data, { headers: this.getAuthHeaders() });
    }

    adminUpdateInstance(instanceId: number | string, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/instances/${instanceId}`, data, { headers: this.getAuthHeaders() });
    }

    adminDeleteInstance(instanceId: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/instances/${instanceId}`, { headers: this.getAuthHeaders() });
    }

    adminSetupSchema(): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/system/setup-schema`, {}, { headers: this.getAuthHeaders() });
    }

    private getAuthHeaders(): HttpHeaders {
        // Check token expiration before any authenticated request
        if (this.isTokenExpired()) {
            this.forceLogout('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        }

        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }
}
