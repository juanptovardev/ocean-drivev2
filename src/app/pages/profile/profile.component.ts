import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- User Info -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Mi Perfil</h2>
                    <p class="mt-1 text-gray-600 dark:text-gray-400">{{ user()?.name }}</p>
                    <p class="text-sm text-gray-500">{{ user()?.email }}</p>
                </div>
                <button (click)="logout()" class="text-red-600 hover:text-red-800 font-medium">
                    Cerrar Sesión
                </button>
            </div>
        </div>

        <!-- Bookings -->
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Mis Reservas</h3>
        
        <div *ngIf="loading()" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div *ngIf="!loading() && bookings().length === 0" class="bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500">
            No tienes reservas aún.
        </div>

        <div class="space-y-4">
            <div *ngFor="let booking of bookings()" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col md:flex-row gap-6">
                <div class="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img *ngIf="booking.image_url" [src]="booking.image_url" class="w-full h-full object-cover">
                    <div *ngIf="!booking.image_url" class="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                    </div>
                </div>
                <div class="flex-grow">
                    <div class="flex justify-between items-start">
                        <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ booking.category_name }}</h4>
                        <span [ngClass]="{
                            'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                            'bg-green-100 text-green-800': booking.status === 'confirmed',
                            'bg-red-100 text-red-800': booking.status === 'cancelled',
                            'bg-blue-100 text-blue-800': booking.status === 'completed'
                        }" class="px-2 py-1 text-xs font-semibold rounded-full">
                            {{ booking.status | titlecase }}
                        </span>
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <p class="font-medium">Desde</p>
                            <p>{{ booking.start_date | date }}</p>
                        </div>
                        <div>
                            <p class="font-medium">Hasta</p>
                            <p>{{ booking.end_date | date }}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="font-medium">Total</p>
                            <p class="text-lg font-bold text-gray-900 dark:text-white">\${{ booking.total_price }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
    apiService = inject(ApiService);
    router = inject(Router);

    user = this.apiService.currentUser;
    bookings = signal<any[]>([]);
    loading = signal(true);

    ngOnInit() {
        if (!this.apiService.isAuthenticated()) {
            this.router.navigate(['/login']);
            return;
        }

        this.apiService.getMyBookings().subscribe({
            next: (data) => {
                this.bookings.set(data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    logout() {
        this.apiService.logout();
        this.router.navigate(['/']);
    }
}
