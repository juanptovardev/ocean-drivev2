import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../../components/header/header.component';
import { FooterComponent } from '../../../../components/footer/footer.component';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6 py-20">
      <div class="text-center max-w-xl mx-auto">
        <!-- Success Icon -->
        <div class="mb-8 relative">
          <div class="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <svg class="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="absolute inset-0 blur-2xl bg-green-500/20 -z-10"></div>
        </div>

        <!-- Message -->
        <h1 class="text-4xl font-bold text-white mb-4">¡Reserva Confirmada!</h1>
        <p class="text-lg text-gray-400 mb-6">
          Tu reserva ha sido procesada exitosamente.
        </p>

        <!-- Booking ID -->
        @if (bookingId()) {
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
            <p class="text-gray-400 text-sm mb-2">Número de Reserva</p>
            <p class="text-3xl font-bold text-[var(--accent)]">
              #{{ bookingId() }}
            </p>
          </div>
        }

        <!-- Vehicle Info -->
        @if (vehicle()) {
          <div class="bg-white/5 rounded-xl p-4 mb-8 flex items-center gap-4 border border-white/10">
            <img [src]="vehicle()?.image_url" class="w-20 h-14 object-cover rounded-lg" alt="">
            <div class="text-left">
              <p class="font-semibold text-white">{{ vehicle()?.name }}</p>
              <p class="text-sm text-gray-400">{{ vehicle()?.description }}</p>
            </div>
          </div>
        }

        <!-- Next Steps -->
        <div class="text-left bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
          <h3 class="font-semibold text-white mb-3">Próximos Pasos:</h3>
          <ul class="space-y-2 text-gray-400 text-sm">
            <li class="flex items-start gap-2">
              <span class="text-green-400 mt-0.5">✓</span>
              Recibirás un correo de confirmación
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-400 mt-0.5">✓</span>
              Presenta tu documento de identidad al recoger
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-400 mt-0.5">✓</span>
              Revisa tu perfil para ver el historial
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/profile" 
             class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105">
            Ver Mis Reservas
          </a>
          <a routerLink="/" 
             class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-full hover:border-white/40 hover:bg-white/5 transition-all">
            Volver al Inicio
          </a>
        </div>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationComponent implements OnInit {
  bookingId = signal<number | null>(null);
  vehicle = signal<any>(null);

  ngOnInit() {
    const state = history.state;
    if (state) {
      this.bookingId.set(state.bookingId || null);
      this.vehicle.set(state.vehicle || null);
    }
  }
}
