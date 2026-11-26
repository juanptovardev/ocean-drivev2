import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { HeaderComponent } from '../../../../components/header/header.component';
import { FooterComponent } from '../../../../components/footer/footer.component';
import { CurrencyService } from '../../../../services/currency.service';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main class="min-h-screen bg-gray-50 py-20">
      <div class="max-w-3xl mx-auto px-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">Resumen de tu Reserva</h1>
        
        @if (loading()) {
          <div class="text-center py-12">
            <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500">Cargando detalles...</p>
          </div>
        } @else if (bookingData()) {
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <!-- Vehicle Info -->
            <div class="p-6 border-b border-gray-100 flex items-center gap-6">
              <img [src]="bookingData()?.vehicle?.image_url" class="w-32 h-20 object-cover rounded-lg" alt="">
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ bookingData()?.vehicle?.name }}</h2>
                <p class="text-gray-500">{{ bookingData()?.vehicle?.description }}</p>
              </div>
            </div>

            <!-- Details -->
            <div class="p-6 space-y-4">
              <div class="flex justify-between text-gray-600">
                <span>Fecha de Recogida:</span>
                <span class="font-medium text-gray-900">{{ bookingData()?.start_date }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Fecha de Devolución:</span>
                <span class="font-medium text-gray-900">{{ bookingData()?.end_date }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Días:</span>
                <span class="font-medium text-gray-900">{{ bookingData()?.days }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Lugar de Recogida:</span>
                <span class="font-medium text-gray-900">{{ bookingData()?.pickup_location || 'Oficina Principal' }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="bg-gradient-to-r from-blue-600 to-teal-500 p-6">
              <div class="flex justify-between items-center text-white">
                <span class="text-lg">Total a Pagar:</span>
                <span class="text-3xl font-bold">{{ currencyService.formatPrice(bookingData()?.total_price) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="p-6 flex flex-col sm:flex-row gap-4">
              <button (click)="goBack()" class="flex-1 py-3 px-6 min-h-[44px] border-2 border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Volver
              </button>
              <button (click)="confirmBooking()" [disabled]="confirming()" class="flex-1 py-3 px-6 min-h-[44px] bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70">
                {{ confirming() ? 'Procesando...' : 'Confirmar Reserva' }}
              </button>
            </div>
          </div>
        } @else {
          <div class="text-center py-12 bg-white rounded-2xl shadow">
            <p class="text-gray-500">No se encontraron datos de reserva.</p>
            <a routerLink="/" class="mt-4 inline-block text-blue-600 hover:underline">Volver al inicio</a>
          </div>
        }
      </div>
    </main>
    <app-footer></app-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  currencyService = inject(CurrencyService);

  loading = signal(true);
  confirming = signal(false);
  bookingData = signal<any>(null);

  ngOnInit() {
    // Get booking data from state or localStorage
    const state = history.state;
    if (state && state.vehicle) {
      this.bookingData.set(state);
      this.loading.set(false);
    } else {
      // Try localStorage fallback
      const saved = localStorage.getItem('pending_booking');
      if (saved) {
        this.bookingData.set(JSON.parse(saved));
        this.loading.set(false);
      } else {
        this.loading.set(false);
      }
    }
  }

  goBack() {
    window.history.back();
  }

  confirmBooking() {
    this.confirming.set(true);
    const data = this.bookingData();

    this.apiService.createBooking({
      vehicle_id: data.vehicle.id,
      start_date: data.start_date,
      end_date: data.end_date,
      total_price: data.total_price,
      pickup_location: data.pickup_location || '',
      dropoff_location: data.dropoff_location || ''
    }).subscribe({
      next: (response) => {
        localStorage.removeItem('pending_booking');
        this.router.navigate(['/booking/confirmation'], {
          state: { bookingId: response.id, vehicle: data.vehicle }
        });
      },
      error: (err) => {
        this.confirming.set(false);
        alert(err.error?.error || 'Error al crear la reserva');
      }
    });
  }
}
