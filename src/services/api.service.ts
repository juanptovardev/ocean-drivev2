import { Injectable, signal, isDevMode } from '@angular/core';
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

const DEMO_TOKEN = 'demo-token-admin-1234';
const DEMO_USER: User = { id: 999, name: 'Admin Demo', email: 'admin', role: 'admin', phone: '+1 305 000 0000' };

// ------------------------------------------------------------------
// DEMO MOCK DATA (used when DB is down / demo login is active)
// ------------------------------------------------------------------
function demoDate(offsetDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
}

const DEMO_CATEGORIES: Category[] = [
    { id: 1, name: 'Economy', category_type: 'economy', price_per_day: 35, price_low_season: 30, price_high_season: 45, base_price: 35, image_url: 'assets/imgs/vehicles/economy.webp', description: 'Ideal para ciudad', passengers: 4, transmission: 'Aut.', stock: 5, status: 'active' } as Category,
    { id: 2, name: 'Compact SUV', category_type: 'suv', price_per_day: 55, price_low_season: 50, price_high_season: 75, base_price: 55, image_url: 'assets/imgs/vehicles/suv.webp', description: 'Versátil y cómodo', passengers: 5, transmission: 'Aut.', stock: 3, status: 'active' } as Category,
    { id: 3, name: 'Full Size', category_type: 'sedan', price_per_day: 65, price_low_season: 60, price_high_season: 85, base_price: 65, image_url: 'assets/imgs/vehicles/sedan.webp', description: 'Máximo confort', passengers: 5, transmission: 'Aut.', stock: 4, status: 'active' } as Category,
    { id: 4, name: 'Premium', category_type: 'premium', price_per_day: 120, price_low_season: 110, price_high_season: 150, base_price: 120, image_url: 'assets/imgs/vehicles/premium.webp', description: 'Experiencia premium', passengers: 5, transmission: 'Aut.', stock: 2, status: 'active' } as Category,
];

const DEMO_BOOKINGS: any[] = [
    { id: 101, code: 'OD- demo-101', plate: 'ABC123', category_name: 'Economy', category_id: 1, customer_name: 'Juan Pérez', user_name: 'Juan Pérez', customer_email: 'juan@demo.com', customer_phone: '+1 305 111 2222', customer_doc_type: 'Pasaporte', customer_doc_number: 'A1234567', customer_nationality: 'USA', start_date: demoDate(-2), end_date: demoDate(2), pickup_time: '10:00', dropoff_time: '10:00', total_price: 140, status: 'confirmed' },
    { id: 102, code: 'OD-DEMO-102', plate: 'XYZ789', category_name: 'Compact SUV', category_id: 2, customer_name: 'María García', user_name: 'María García', customer_email: 'maria@demo.com', customer_phone: '+1 305 333 4444', customer_doc_type: 'Licencia', customer_doc_number: 'B9876543', customer_nationality: 'España', start_date: demoDate(1), end_date: demoDate(4), pickup_time: '09:00', dropoff_time: '09:00', total_price: 220, status: 'pending' },
    { id: 103, code: 'OD-DEMO-103', plate: 'DEF456', category_name: 'Full Size', category_id: 3, customer_name: 'Carlos Ruiz', user_name: 'Carlos Ruiz', customer_email: 'carlos@demo.com', customer_phone: '+1 305 555 6666', customer_doc_type: 'Pasaporte', customer_doc_number: 'C1122334', customer_nationality: 'México', start_date: demoDate(3), end_date: demoDate(6), pickup_time: '14:00', dropoff_time: '14:00', total_price: 390, status: 'confirmed' },
    { id: 104, code: 'OD-DEMO-104', plate: 'GHI789', category_name: 'Premium', category_id: 4, customer_name: 'Ana López', user_name: 'Ana López', customer_email: 'ana@demo.com', customer_phone: '+1 305 777 8888', customer_doc_type: 'Pasaporte', customer_doc_number: 'D5566778', customer_nationality: 'Argentina', start_date: demoDate(5), end_date: demoDate(9), pickup_time: '11:00', dropoff_time: '11:00', total_price: 600, status: 'confirmed' },
    { id: 105, code: 'OD-DEMO-105', plate: 'JKL012', category_name: 'Economy', category_id: 1, customer_name: 'Demo Cliente', user_name: 'Demo Cliente', customer_email: 'demo@oceandrive.com', customer_phone: '+1 305 999 0000', customer_doc_type: 'ID', customer_doc_number: 'E9990001', customer_nationality: 'USA', start_date: demoDate(0), end_date: demoDate(1), pickup_time: '10:00', dropoff_time: '10:00', total_price: 35, status: 'pending' },
    { id: 106, code: 'OD-MAINT-01', plate: 'MNT001', category_name: 'Economy', category_id: 1, customer_name: 'Mantenimiento', user_name: 'Mantenimiento', customer_email: '', customer_phone: '', customer_doc_type: '', customer_doc_number: '', customer_nationality: '', start_date: demoDate(7), end_date: demoDate(8), pickup_time: '08:00', dropoff_time: '18:00', total_price: 0, status: 'maintenance' },
];

const DEMO_USERS: User[] = [
    DEMO_USER,
    { id: 2, name: 'Juan Pérez', email: 'juan@demo.com', role: 'user', phone: '+1 305 111 2222', nationality: 'USA', doc_type: 'Pasaporte', doc_number: 'A1234567', created_at: new Date().toISOString() },
    { id: 3, name: 'María García', email: 'maria@demo.com', role: 'user', phone: '+1 305 333 4444', created_at: new Date().toISOString() },
    { id: 4, name: 'Carlos Ruiz', email: 'carlos@demo.com', role: 'user', phone: '+1 305 555 6666', created_at: new Date().toISOString() },
];

function demoInstancesForCategory(categoryId: number | string): any[] {
    const cid = Number(categoryId);
    const cat = DEMO_CATEGORIES.find(c => c.id === cid);
    const basePlate = ['ABC', 'XYZ', 'DEF', 'GHI'][cid - 1] || 'ZZZ';
    return [
        { id: cid * 10 + 1, plate: `${basePlate}101`, status: 'available', category_id: cid, category_name: cat?.name || 'Demo', mileage: 12000, year: 2023 },
        { id: cid * 10 + 2, plate: `${basePlate}102`, status: 'available', category_id: cid, category_name: cat?.name || 'Demo', mileage: 18500, year: 2022 },
        { id: cid * 10 + 3, plate: `${basePlate}103`, status: 'maintenance', category_id: cid, category_name: cat?.name || 'Demo', mileage: 22000, year: 2021 },
    ];
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    // Use proxy for local development (avoids CORS)
    // /api is proxied to production server via proxy.conf.json
    private apiUrl = this.getApiUrl();

    private getApiUrl(): string {
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // If running on Angular CLI dev server (with proxy config)
        if (port === '4200') {
            return '/api';
        }
        
        // If running locally but NOT on dev server (e.g. Live Server on 5500, or file://)
        // or if running in an external AI Studio environment
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
            return 'https://oceandrivecarental.com/server/public';
        }

        // If it's some other non-production host (like an AI IDE preview URL)
        if (hostname !== 'oceandrivecarental.com' && hostname !== 'www.oceandrivecarental.com') {
            return 'https://oceandrivecarental.com/server/public';
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

    isDemoMode(): boolean {
        // Demo mode must never activate in a production build: it swaps real
        // API data for local mocks. isDevMode() is false under build:prod.
        return isDevMode() && localStorage.getItem('token') === DEMO_TOKEN;
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/register`, data);
    }

    login(credentials: { email: string, password: string }): Observable<any> {
        const emailNorm = (credentials.email || '').trim().toLowerCase();
        const pass = (credentials.password || '').trim();
        const isDemoCredentials = (emailNorm === 'admin' || emailNorm === 'admin@oceandrive.com' || emailNorm === 'admin@demo.com' || emailNorm === 'demo' || emailNorm === 'administrador') && pass === '1234';
        if (isDevMode() && isDemoCredentials) {
            this.setSession(DEMO_TOKEN, DEMO_USER);
            // Simulate network latency for realism
            return of({ token: DEMO_TOKEN, user: DEMO_USER });
        }
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
        if (this.isDemoMode()) {
            return of(DEMO_CATEGORIES);
        }
        return this.http.get(`${this.apiUrl}/vehicles`, { responseType: 'text' }).pipe(
            map(text => this.parseJsonResponse(text)),
            catchError(() => this.isDemoMode() ? of(DEMO_CATEGORIES as any) : of([]))
        );
    }

    getVehicle(id: string | number): Observable<Category> {
        if (this.isDemoMode()) {
            const found = DEMO_CATEGORIES.find(c => String(c.id) === String(id));
            return of((found || DEMO_CATEGORIES[0]) as Category);
        }
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
        if (this.isDemoMode()) {
            return of(DEMO_BOOKINGS);
        }
        const headers = this.getAuthHeaders();
        return this.http.get<any[]>(`${this.apiUrl}/bookings/my-history`, { headers }).pipe(
            catchError(() => this.isDemoMode() ? of(DEMO_BOOKINGS) : of([]))
        );
    }

    getBookingByCode(code: string): Observable<any> {
        if (this.isDemoMode()) {
            const found = DEMO_BOOKINGS.find(b => String(b.code) === String(code) || String(b.id) === String(code));
            return of(found || DEMO_BOOKINGS[0]);
        }
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
        if (this.isDemoMode()) {
            // In demo mode return demo categories as available
            return of(DEMO_CATEGORIES as any[]);
        }
        return this.http.get(`${this.apiUrl}/bookings/availability?start_date=${startDate}&end_date=${endDate}&pickup_time=${pickupTime}&dropoff_time=${dropoffTime}`, { responseType: 'text' }).pipe(
            map((text: string) => this.parseJsonResponse(text)),
            catchError((err: Error) => {
                console.error('[DEBUG] Availability check failed:', err.message);
                if (this.isDemoMode()) {
                    return of(DEMO_CATEGORIES as any[]);
                }
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
        if (this.isDemoMode()) {
            return of(DEMO_BOOKINGS);
        }
        return this.http.get<any[]>(`${this.apiUrl}/admin/bookings`, { headers: this.getAuthHeaders() }).pipe(
            catchError(() => this.isDemoMode() ? of(DEMO_BOOKINGS) : of([]))
        );
    }

    adminUpdateBookingStatus(id: number | string, status: string): Observable<any> {
        if (this.isDemoMode()) {
            const b = DEMO_BOOKINGS.find(x => String(x.id) === String(id));
            if (b) b.status = status;
            return of({ success: true, booking: b });
        }
        return this.http.post(`${this.apiUrl}/admin/bookings/${id}/status`, { status }, { headers: this.getAuthHeaders() });
    }

    adminCreateBooking(data: any): Observable<any> {
        if (this.isDemoMode()) {
            const newBooking = { id: Date.now(), code: `OD-DEMO-${Date.now()}`, ...data, status: 'confirmed' };
            DEMO_BOOKINGS.push(newBooking);
            return of(newBooking);
        }
        return this.http.post(`${this.apiUrl}/admin/bookings`, data, { headers: this.getAuthHeaders() });
    }

    adminUpdateBooking(id: number | string, data: any): Observable<any> {
        if (this.isDemoMode()) {
            const idx = DEMO_BOOKINGS.findIndex(x => String(x.id) === String(id));
            if (idx >= 0) DEMO_BOOKINGS[idx] = { ...DEMO_BOOKINGS[idx], ...data };
            return of(DEMO_BOOKINGS[idx] || data);
        }
        return this.http.post(`${this.apiUrl}/admin/bookings/${id}`, data, { headers: this.getAuthHeaders() });
    }

    adminDeleteBooking(id: number | string): Observable<any> {
        if (this.isDemoMode()) {
            const idx = DEMO_BOOKINGS.findIndex(x => String(x.id) === String(id));
            if (idx >= 0) DEMO_BOOKINGS.splice(idx, 1);
            return of({ success: true });
        }
        return this.http.delete(`${this.apiUrl}/admin/bookings/${id}`, { headers: this.getAuthHeaders() });
    }

    // Admin: Get Categories
    adminGetVehicles(): Observable<any[]> {
        if (this.isDemoMode()) {
            return of(DEMO_CATEGORIES as any[]);
        }
        return this.http.get<any[]>(`${this.apiUrl}/admin/vehicles`, { headers: this.getAuthHeaders() }).pipe(
            tap({
                error: (err) => {
                    if (err.status === 401) {
                        this.forceLogout('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
                    }
                }
            }),
            catchError(() => this.isDemoMode() ? of(DEMO_CATEGORIES as any[]) : of([]))
        );
    }

    adminCreateVehicle(data: any): Observable<any> {
        if (this.isDemoMode()) {
            const newCat = { id: Date.now(), ...data, status: 'active' };
            (DEMO_CATEGORIES as any[]).push(newCat);
            return of(newCat);
        }
        return this.http.post(`${this.apiUrl}/admin/vehicles`, data, { headers: this.getAuthHeaders() });
    }

    // Admin: Update Category
    adminUpdateVehicle(id: number | string, data: any): Observable<any> {
        if (this.isDemoMode()) {
            const idx = (DEMO_CATEGORIES as any[]).findIndex(c => String(c.id) === String(id));
            if (idx >= 0) (DEMO_CATEGORIES as any[])[idx] = { ...(DEMO_CATEGORIES as any[])[idx], ...data };
            return of((DEMO_CATEGORIES as any[])[idx] || data);
        }
        return this.http.post(`${this.apiUrl}/admin/vehicles/${id}`, data, { headers: this.getAuthHeaders() });
    }

    adminDeleteVehicle(id: number | string): Observable<any> {
        if (this.isDemoMode()) {
            const idx = (DEMO_CATEGORIES as any[]).findIndex(c => String(c.id) === String(id));
            if (idx >= 0) (DEMO_CATEGORIES as any[]).splice(idx, 1);
            return of({ success: true });
        }
        return this.http.delete(`${this.apiUrl}/admin/vehicles/${id}`, { headers: this.getAuthHeaders() });
    }

    adminCreateUser(data: any): Observable<any> {
        if (this.isDemoMode()) {
            const newUser = { id: Date.now(), ...data, role: data.role || 'client', created_at: new Date().toISOString() };
            DEMO_USERS.push(newUser as User);
            return of(newUser);
        }
        return this.http.post(`${this.apiUrl}/admin/users`, data, { headers: this.getAuthHeaders() });
    }

    adminGetUsers(role?: string): Observable<User[]> {
        if (this.isDemoMode()) {
            const filtered = role ? DEMO_USERS.filter(u => u.role === role) : DEMO_USERS;
            return of(filtered);
        }
        const url = role
            ? `${this.apiUrl}/admin/users?role=${role}`
            : `${this.apiUrl}/admin/users`;
        return this.http.get<User[]>(url, { headers: this.getAuthHeaders() }).pipe(
            catchError(() => this.isDemoMode() ? of(DEMO_USERS) : of([]))
        );
    }

    adminUpdateUserRole(id: number | string, role: string): Observable<any> {
        if (this.isDemoMode()) {
            const u = DEMO_USERS.find(x => String(x.id) === String(id));
            if (u) u.role = role;
            return of({ success: true, user: u });
        }
        return this.http.post(`${this.apiUrl}/admin/users/${id}/role`, { role }, { headers: this.getAuthHeaders() });
    }

    adminDeleteUser(id: number | string): Observable<any> {
        if (this.isDemoMode()) {
            const idx = DEMO_USERS.findIndex(x => String(x.id) === String(id));
            if (idx >= 0) DEMO_USERS.splice(idx, 1);
            return of({ success: true });
        }
        return this.http.delete(`${this.apiUrl}/admin/users/${id}`, { headers: this.getAuthHeaders() });
    }

    adminUpdateUser(id: number | string, data: any): Observable<any> {
        if (this.isDemoMode()) {
            const idx = DEMO_USERS.findIndex(x => String(x.id) === String(id));
            if (idx >= 0) DEMO_USERS[idx] = { ...DEMO_USERS[idx], ...data } as User;
            return of(DEMO_USERS[idx] || data);
        }
        return this.http.post(`${this.apiUrl}/admin/users/${id}`, data, { headers: this.getAuthHeaders() });
    }

    // Admin: Get Vehicles (Specific Instances) by Category
    adminGetInstances(categoryId: number | string): Observable<any[]> {
        if (this.isDemoMode()) {
            return of(demoInstancesForCategory(categoryId));
        }
        return this.http.get<any[]>(`${this.apiUrl}/admin/vehicles/${categoryId}/instances`, { headers: this.getAuthHeaders() }).pipe(
            catchError(() => this.isDemoMode() ? of(demoInstancesForCategory(categoryId)) : of([]))
        );
    }

    // Admin: Create Vehicle Instance
    adminCreateInstance(data: any): Observable<any> {
        if (this.isDemoMode()) {
            return of({ id: Date.now(), ...data, status: 'available' });
        }
        return this.http.post(`${this.apiUrl}/admin/instances`, data, { headers: this.getAuthHeaders() });
    }

    adminGetInstanceBookings(instanceId: number | string): Observable<any[]> {
        if (this.isDemoMode()) {
            // Return bookings that match the instance plate if available, otherwise demo bookings
            return of(DEMO_BOOKINGS.slice(0, 2));
        }
        return this.http.get<any[]>(`${this.apiUrl}/admin/instances/${instanceId}/bookings`, { headers: this.getAuthHeaders() }).pipe(
            catchError(() => this.isDemoMode() ? of(DEMO_BOOKINGS.slice(0,2)) : of([]))
        );
    }

    adminGetBooking(id: number | string): Observable<any> {
        if (this.isDemoMode()) {
            const found = DEMO_BOOKINGS.find(b => String(b.id) === String(id) || String(b.code) === String(id));
            return of(found || DEMO_BOOKINGS[0]);
        }
        return this.http.get<any>(`${this.apiUrl}/admin/bookings/${id}`, { headers: this.getAuthHeaders() });
    }

    adminCreateMaintenanceBlock(instanceId: number | string, data: any): Observable<any> {
        if (this.isDemoMode()) {
            return of({ success: true, ...data });
        }
        return this.http.post(`${this.apiUrl}/admin/instances/${instanceId}/maintenance`, data, { headers: this.getAuthHeaders() });
    }

    adminOverrideInstance(instanceId: number | string, data: any): Observable<any> {
        if (this.isDemoMode()) {
            return of({ success: true, ...data });
        }
        return this.http.post(`${this.apiUrl}/admin/instances/${instanceId}/override`, data, { headers: this.getAuthHeaders() });
    }

    adminUpdateInstance(instanceId: number | string, data: any): Observable<any> {
        if (this.isDemoMode()) {
            return of({ success: true, ...data });
        }
        return this.http.post(`${this.apiUrl}/admin/instances/${instanceId}`, data, { headers: this.getAuthHeaders() });
    }

    adminDeleteInstance(instanceId: number | string): Observable<any> {
        if (this.isDemoMode()) {
            return of({ success: true });
        }
        return this.http.delete(`${this.apiUrl}/admin/instances/${instanceId}`, { headers: this.getAuthHeaders() });
    }

    adminSetupSchema(): Observable<any> {
        if (this.isDemoMode()) {
            return of({ success: true, message: 'Demo mode — schema check skipped' });
        }
        return this.http.post(`${this.apiUrl}/admin/system/setup-schema`, {}, { headers: this.getAuthHeaders() }).pipe(
            catchError(() => this.isDemoMode() ? of({ success: true }) : of({ success: false }))
        );
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
