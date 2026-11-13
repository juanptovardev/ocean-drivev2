import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { Hero6Component } from '../../../components/hero6/hero6.component';
import { StepProgressComponent } from '../../../components/step-progress/step-progress.component';
import { InsuranceSelectorComponent, InsuranceType } from '../../../components/insurance-selector/insurance-selector.component';
import { ReservationTicketComponent } from '../../../components/reservation-ticket/reservation-ticket.component';
import { BookingService } from '../../../services/booking.service';
import { CurrencyService } from '../../../services/currency.service';
import { LanguageService } from '../../../services/language.service';

@Component({
    selector: 'app-paso-3',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,
        Hero6Component,
        StepProgressComponent,
        InsuranceSelectorComponent,
        ReservationTicketComponent
    ],
    template: `
    <div class="h-screen flex flex-col overflow-y-auto">
        <app-header variant="white" class="relative z-30"></app-header>
        
        <main class="flex-1 relative flex flex-col items-center pt-24 pb-6 gap-4">
            <!-- Full background hero -->
            <div class="absolute inset-0 z-0 h-full w-full">
                <app-hero6></app-hero6>
            </div>
            
            <!-- Page Title -->
             <div class="relative z-20 text-center text-white drop-shadow-md px-4 shrink-0">
                 <h2 class="text-2xl md:text-3xl font-extrabold uppercase tracking-widest italic leading-tight">{{ lang.t('paso3.title') }}</h2>
                 <p class="text-[0.65rem] md:text-xs font-light opacity-90 mt-1">{{ lang.t('paso3.subtitle') }}</p>
             </div>

            <!-- Step Progress -->
            <div class="relative z-20 w-full max-w-2xl px-6 shrink-0">
                <app-step-progress [currentStep]="3" [totalSteps]="4"></app-step-progress>
            </div>

            <!-- Content Grid Equal Height -->
            <div class="relative z-20 w-full max-w-7xl px-4 md:px-6 mt-8 flex-1 mb-8">
                <div class="grid grid-cols-1 md:grid-cols-[70%_30%] gap-6 md:gap-8 h-full items-stretch">
                    
                    <!-- LEFT COLUMN: Insurance Selector -->
                    <div class="h-full">
                        <app-insurance-selector (selectionChange)="onInsuranceChange($event)"></app-insurance-selector>
                    </div>

                    <!-- RIGHT COLUMN: Vehicle Summary (Premium Style) -->
                    <div class="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/20 group h-full bg-gray-900">
                        @if(selectedCar(); as car) {
                            <!-- Full Background Image -->
                            <div class="absolute inset-0 w-full h-full">
                                <img [src]="car.imageUrl" alt="Car" class="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-transform duration-[2s]">
                            </div>

                            <!-- Gradient Overlay -->
                            <div class="absolute inset-0 bg-gradient-to-t from-[#002B5B] via-[#002B5B]/80 to-transparent"></div>

                            <!-- Content Overlay -->
                            <div class="relative h-full flex flex-col p-6 z-10 text-white">
                                <!-- Title Section -->
                                <div class="mb-auto">
                                    <div class="flex items-center gap-2 mb-2 text-[#FF6F61] uppercase tracking-widest text-[0.65rem] font-bold">
                                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                         <span>{{ lang.t('paso3.selected_service') }}</span>
                                    </div>
                                    <h3 class="text-2xl md:text-3xl font-black italic tracking-widest leading-none mb-1">{{ car.title }}</h3>
                                    <p class="text-gray-300 font-medium border-l-2 border-[#FF6F61] pl-3 text-xs md:text-sm">{{ car.description }}</p>
                                </div>

                                <!-- Specs -->
                                <div class="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 mb-4">
                                     <div class="flex items-center gap-2 text-xs font-medium text-gray-200">
                                         <svg class="w-4 h-4 text-[#FF6F61]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                         <span>{{ car.passengers || 4 }} {{ lang.t('specs.passengers') }}</span>
                                     </div>
                                     <div class="flex items-center gap-2 text-xs font-medium text-gray-200">
                                         <svg class="w-4 h-4 text-[#FF6F61]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                         <span>{{ car.luggage || 2 }} {{ lang.t('specs.luggage') }}</span>
                                     </div>
                                     <div class="flex items-center gap-2 text-xs font-medium text-gray-200">
                                         <svg class="w-4 h-4 text-[#FF6F61]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                         <span>{{ lang.t('specs.ac') }}</span>
                                     </div>
                                     <div class="flex items-center gap-2 text-xs font-medium text-gray-200">
                                         <svg class="w-4 h-4 text-[#FF6F61]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                         <span>{{ lang.t('specs.mileage') }}</span>
                                     </div>
                                </div>

                                <!-- Action/Price Placeholder -->
                                <div class="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <p class="text-[0.6rem] uppercase tracking-widest text-[#FF6F61] font-bold mb-0.5">{{ lang.t('paso3.cost_per_day') }}</p>
                                        <p class="text-xl font-bold">{{ currencyService.formatPrice(currentDailyPrice()) }} <span class="text-xs font-normal opacity-70">/{{ lang.t('vehicles.perDay') }}</span></p>
                                    </div>
                                    <button (click)="changeVehicle()" class="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-xl text-[0.6rem] font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl text-center leading-tight">
                                        {{ lang.t('paso3.select_other') }}<br><span class="text-[0.5rem] opacity-80">{{ lang.t('paso3.other_service') }}</span>
                                    </button>
                                </div>
                            </div>
                        } @else {
                            <div class="absolute inset-0 flex items-center justify-center bg-[#002B5B]">
                                <p class="text-white/50 font-medium">{{ lang.t('paso3.select_first') }}</p>
                            </div>
                        }
                    </div>
                </div>
            </div>

            <!-- Reservation Ticket -->
            <div class="relative z-20 w-full max-w-7xl px-4 md:px-6 mb-6 flex flex-col items-center gap-10">
                <div class="w-full">
                    <app-reservation-ticket [totalAmount]="totalReservationCost()"></app-reservation-ticket>
                </div>
                
                <button (click)="openConfirmModal()" 
                        class="group w-full max-w-lg py-3.5 px-8 rounded-[2rem] bg-gradient-to-r from-[#FF6F61] to-[#FF8A75] text-white font-black tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,111,97,0.3)] hover:shadow-[0_0_40px_rgba(255,111,97,0.5)] hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden text-base md:text-lg flex items-center justify-center gap-3">
                    <span class="relative z-10 flex items-center justify-center gap-3">
                        {{ lang.t('paso3.complete_reservation') }}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                    <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                </button>
            </div>
        </main>

        <!-- Confirmation Modal (Matches Inventory Style) -->
        @if (showConfirmModal()) {
            <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in" (click)="showConfirmModal.set(false)">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up" (click)="$event.stopPropagation()">
                    
                    <!-- Header -->
                    <div class="flex items-center justify-between px-6 pt-5 pb-2">
                        <div class="flex items-center gap-1">
                            <h3 class="text-[1.35rem] font-black text-slate-800 uppercase tracking-wider italic">{{ lang.t('paso3.confirm_info') }}</h3>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">{{ lang.t('paso3.requirements') }}</span>
                            <button aria-label="Cerrar" (click)="showConfirmModal.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Requirements List -->
                    <div class="px-6 pb-6 pt-2">
                        <p class="text-sm font-bold text-slate-600 mb-4">{{ lang.t('paso3.req_doc_title') }}</p>
                        <div class="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mb-5">
                            <ul class="space-y-3">
                                <li class="flex items-start gap-3">
                                    <span class="bg-blue-100 text-blue-600 p-1 rounded-md mt-0.5 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                    </span>
                                    <div>
                                        <span class="block text-xs font-bold text-slate-700 leading-tight">{{ lang.t('paso3.doc_identity') }}</span>
                                        <span class="text-[0.65rem] text-slate-500">{{ lang.t('paso3.doc_identity_desc') }}</span>
                                    </div>
                                </li>
                                <li class="flex items-start gap-3">
                                    <span class="bg-green-100 text-green-600 p-1 rounded-md mt-0.5 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    </span>
                                    <div>
                                        <span class="block text-xs font-bold text-slate-700 leading-tight">{{ lang.t('paso3.doc_license') }}</span>
                                        <span class="text-[0.65rem] text-slate-500">{{ lang.t('paso3.doc_license_desc') }}</span>
                                    </div>
                                </li>
                                <li class="flex items-start gap-3">
                                    <span class="bg-amber-100 text-amber-600 p-1 rounded-md mt-0.5 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    </span>
                                    <div>
                                        <span class="block text-xs font-bold text-slate-700 leading-tight">{{ lang.t('paso3.doc_payment') }}</span>
                                        <span class="text-[0.65rem] text-slate-500">{{ lang.t('paso3.doc_payment_desc') }}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <!-- Checkboxes -->
                        <div class="space-y-3 mb-6">
                            <label class="flex items-start gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors -mx-2">
                                <div class="relative flex items-center justify-center mt-0.5">
                                    <input type="checkbox" [(ngModel)]="confirmRequirements" class="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 checked:bg-[#002B5B] checked:border-[#002B5B] transition-all">
                                    <svg class="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <span class="text-xs text-slate-500 group-hover:text-slate-700 transition-colors leading-snug" [innerHTML]="lang.t('paso3.confirm_docs')">
                                </span>
                            </label>
                            <label class="flex items-start gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors -mx-2">
                                <div class="relative flex items-center justify-center mt-0.5">
                                    <input type="checkbox" [(ngModel)]="confirmDelivery" class="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 checked:bg-[#002B5B] checked:border-[#002B5B] transition-all">
                                    <svg class="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <span class="text-xs text-slate-500 group-hover:text-slate-700 transition-colors leading-snug" [innerHTML]="lang.t('paso3.accept_conditions')">
                                </span>
                            </label>
                        </div>

                        <!-- Footer Actions -->
                        <div class="grid grid-cols-2 gap-3">
                            <button (click)="showConfirmModal.set(false)" 
                                    class="w-full py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 uppercase tracking-wider">
                                {{ lang.t('general.cancel') }}
                            </button>
                            <button (click)="confirmAndProceed()" 
                                    [disabled]="!confirmRequirements || !confirmDelivery"
                                    [class.opacity-50]="!confirmRequirements || !confirmDelivery"
                                    class="w-full py-2.5 text-xs font-bold text-white bg-[#002B5B] hover:bg-[#003875] rounded-lg shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wider">
                                {{ lang.t('general.continue') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
    `,
    styles: [`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    `]
})
export class Paso3Component {
    private bookingService = inject(BookingService);
    private router = inject(Router);
    private apiService = inject(ApiService);
    currencyService = inject(CurrencyService);
    lang = inject(LanguageService);

    selectedCar = computed(() => this.bookingService.reservation().selectedCar);
    selectedInsurance = signal<InsuranceType>('basic');

    // Modal state
    showConfirmModal = signal<boolean>(false);
    confirmRequirements = false;
    confirmDelivery = false;

    // Config duplicated for calculation (ideally moved to shared service)
    cityConfig: Record<string, { dropoffFee: number }> = {
        'Cartagena': { dropoffFee: 0 },
        'Barranquilla': { dropoffFee: 250000 },
        'Santa Marta': { dropoffFee: 350000 },
        'Bogota': { dropoffFee: 0 },
        'Medellin': { dropoffFee: 0 },
        'Cali': { dropoffFee: 0 }
    };

    currentDailyPrice = computed(() => {
        const car = this.selectedCar();
        const state = this.bookingService.reservation();
        if (!car) return 0;

        let basePrice = Number(car.base_price || car.price || car.priceLowSeason || 0);

        // Check special periods if pickup date exists
        if (state.pickup.date && car.special_periods && Array.isArray(car.special_periods)) {
            for (const period of car.special_periods) {
                try {
                    const checkDate = new Date(state.pickup.date);
                    checkDate.setMinutes(checkDate.getMinutes() - checkDate.getTimezoneOffset());
                    const dateStr = checkDate.toISOString().split('T')[0];

                    if (period.dates) {
                        const [start, end] = period.dates.split(' to ');
                        if (dateStr >= start && dateStr <= end) {
                            basePrice = Number(period.price);
                            break;
                        }
                    } else if (period.start && period.end) {
                        if (dateStr >= period.start && dateStr <= period.end) {
                            basePrice = Number(period.price);
                            break;
                        }
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }
        }

        // Add Insurance
        if (this.selectedInsurance() === 'total') {
            basePrice += 77000;
        }

        return basePrice;
    });

    totalReservationCost = computed(() => {
        // Use centralized calculation with current insurance selection
        return this.bookingService.calculateTotalValue(this.selectedInsurance());
    });

    onInsuranceChange(type: InsuranceType) {
        this.selectedInsurance.set(type);
    }

    changeVehicle() {
        this.router.navigate(['/paso-2']);
    }

    openConfirmModal() {
        // Reset checkboxes when opening
        this.confirmRequirements = false;
        this.confirmDelivery = false;
        this.showConfirmModal.set(true);
    }

    confirmAndProceed() {
        if (!this.confirmRequirements || !this.confirmDelivery) {
            return;
        }
        this.showConfirmModal.set(false);
        // Save insurance choice
        this.bookingService.setInsurance(this.selectedInsurance());

        // Proceed to Step 4
        this.router.navigate(['/paso-4']);
    }
}
