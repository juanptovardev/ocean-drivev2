import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { Hero6Component } from '../../../components/hero6/hero6.component';
import { ReservationFormFinalComponent } from '../../../components/reservation-form-final/reservation-form-final.component';
import { StepProgressComponent } from '../../../components/step-progress/step-progress.component';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-paso-1',
  standalone: true,
  template: `
    <div class="h-screen flex flex-col overflow-y-auto relative">
        <app-header variant="white" class="relative z-[101]"></app-header>
        <main class="flex-1 relative flex flex-col items-center pt-28 pb-8 gap-2 md:gap-3">
            <!-- Full background hero -->
            <div class="absolute inset-0 z-0 h-full w-full animate-hero-fade">
                <app-hero6></app-hero6>
            </div>
            
            <!-- Page Title -->
             <div class="relative z-20 text-center text-white drop-shadow-md px-4 shrink-0 animate-title-entrance">
                 <h2 class="text-2xl md:text-3xl font-extrabold uppercase tracking-widest italic leading-tight">{{ lang.t('paso1.title') }}</h2>
                 <p class="text-xs md:text-sm font-light opacity-90 mt-1 animate-subtitle-entrance">{{ lang.t('paso1.subtitle') }}</p>
             </div>

            <!-- Step Progress -->
            <div class="relative z-20 w-full max-w-2xl px-6 shrink-0 animate-progress-entrance">
                <app-step-progress [currentStep]="1" [totalSteps]="4"></app-step-progress>
            </div>

            <!-- Centered Form -->
            <div class="relative z-20 w-full max-w-7xl px-4 md:px-6 mt-4 md:mt-6 animate-form-entrance">
                <app-reservation-form-final [customModalHandling]="true" #reservationForm></app-reservation-form-final>
            </div>

            <!-- Copyright Footer -->
            <div class="relative z-10 mt-2 pt-8  text-center animate-form-entrance" style="animation-delay: 0.9s;">
                <p class="text-[0.6rem] md:text-[0.7rem] text-white/40 font-medium tracking-widest uppercase">
                    {{ lang.t('paso1.copyright') }}
                </p>
            </div>
        </main>

        <!-- EXTERNAL ROOT MODAL (Avoiding Transform Traps) -->
        @if (reservationForm.showDropoffFeeModal()) {
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-scale-in" (click)="reservationForm.cancelDropoffCity()">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up" (click)="$event.stopPropagation()">
                    
                    <!-- Header -->
                    <div class="flex items-center justify-between px-6 pt-5 pb-2">
                        <div class="flex items-center gap-2">
                            <h3 class="text-[1.31rem] font-black text-slate-800 uppercase tracking-wider italic">{{ lang.t('reservas.dropoff_modal.loc_title') }}</h3>
                            <span class="w-6 h-1 bg-[#FF6F61] rounded-full hidden xs:block"></span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[0.6rem] font-bold text-[#FF6F61] uppercase tracking-widest hidden sm:block">{{ lang.t('reservas.dropoff_modal.fee') }}</span>
                            <button aria-label="Cancelar" (click)="reservationForm.cancelDropoffCity()" class="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Content Body -->
                    <div class="px-6 pb-6 pt-2">
                        <p class="text-sm font-bold text-slate-600 mb-4 text-center">{{ lang.t('reservas.dropoff_modal.details_label') }}</p>
                        
                        <!-- Fee Display Box -->
                        <div class="bg-slate-50/50 rounded-xl p-6 border border-slate-100 mb-5 flex flex-col items-center justify-center">
                            <div class="flex items-center gap-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#FF6F61]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ lang.t('reservas.dropoff_modal.destination') }} <span class="text-[#002B5B]">{{ reservationForm.pendingDropoffCity() }}</span></span>
                            </div>
                            <p class="text-3xl font-black text-[#002B5B] tracking-tighter">
                                +{{ reservationForm.currencyService.formatPrice(reservationForm.pendingDropoffFee()) }}
                            </p>
                            <p class="text-[12px] text-slate-400 font-medium mt-1">{{ lang.t('reservas.dropoff_modal.note') }}</p>
                            @if(reservationForm.pendingDropoffCity() && reservationForm.cityConfig[reservationForm.pendingDropoffCity()] && reservationForm.cityConfig[reservationForm.pendingDropoffCity()].minDays > 1) {
                                <p class="text-[0.6rem] text-[#FF6F61] font-bold mt-2 uppercase tracking-wider">
                                    ⚠️ {{ lang.t('form.modal.dropoff.warn') }} {{ reservationForm.cityConfig[reservationForm.pendingDropoffCity()].minDays }} {{ lang.t('form.modal.dropoff.warnDays') }}
                                </p>
                            }
                        </div>

                        <!-- Footer Actions -->
                        <div class="grid grid-cols-2 gap-3">
                            <button (click)="reservationForm.cancelDropoffCity()" 
                                    class="w-full py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 uppercase tracking-wider">
                                {{ lang.t('reservas.cancel_action') }}
                            </button>
                            <button (click)="reservationForm.confirmDropoffCity()" 
                                    class="w-full py-2.5 text-xs font-bold text-white bg-[#002B5B] hover:bg-[#003875] rounded-lg shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wider">
                                {{ lang.t('general.accept') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        }

        <!-- AVAILABILITY NOTIFICATION MODAL (External Root) -->
        @if (reservationForm.showAvailabilityModal()) {
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-scale-in" (click)="reservationForm.showAvailabilityModal.set(false)">
                <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up relative" (click)="$event.stopPropagation()">

                    <!-- Decorative Background Element -->
                    <div class="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#FF6F61]/5 rounded-full blur-3xl"></div>
                    <div class="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-[#002B5B]/5 rounded-full blur-3xl"></div>

                    <!-- Header Section -->
                    <div class="relative px-6 pt-5 pb-2 text-center">
                        <div class="inline-flex items-center justify-center w-10 h-10 bg-orange-50 rounded-full mb-2 ring-2 ring-orange-50/50">
                            <svg class="w-4 h-4 text-[#FF6F61]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-black text-[#002B5B] uppercase tracking-[0.15em] italic leading-none mb-2">{{ lang.t('form.modal.avail.title') }}</h3>
                        <p class="text-slate-500 text-sm font-medium leading-relaxed px-4">
                            {{ lang.t('form.modal.avail.desc1') }} <span class="text-[#FF6F61] font-bold">{{ reservationForm.unavailableCategory()?.title }}</span> {{ lang.t('form.modal.avail.desc2') }}
                            <br><span class="text-xs italic opacity-75 mt-1 block">{{ lang.t('form.modal.avail.alt') }}</span>
                        </p>
                    </div>

                    <!-- Suggested Alternatives -->
                    <div class="px-6 pb-4">
                        <div class="space-y-3 mt-2">
                            @for (suggested of reservationForm.suggestedCategories(); track suggested.id) {
                            <div (click)="reservationForm.selectAlternative(suggested)"
                                class="group flex items-center gap-4 p-3 bg-slate-50 hover:bg-[#002B5B] rounded-2xl border border-slate-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/10">
                                <div class="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-slate-200 group-hover:border-transparent transition-colors">
                                    <img [src]="suggested.image_url" alt="" class="w-full h-full object-cover">
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-black text-[#002B5B] group-hover:text-white uppercase italic tracking-wide text-base transition-colors">
                                        {{ suggested.name }}</h4>
                                    <p class="text-[0.6rem] font-bold text-slate-400 group-hover:text-white/60 uppercase tracking-wide transition-colors">
                                        {{ lang.t('form.modal.avail.now') }}</p>
                                </div>
                                <div class="text-[#FF6F61] group-hover:text-white font-black text-sm px-4 py-2 bg-white group-hover:bg-white/10 rounded-full shadow-sm transition-all">
                                    {{ lang.t('form.modal.avail.choose') }}
                                </div>
                            </div>
                            }
                        </div>

                        <!-- Close Button -->
                        <button (click)="reservationForm.showAvailabilityModal.set(false)"
                            class="w-full mt-4 py-3 text-xs font-black text-slate-400 hover:text-[#002B5B] uppercase tracking-[0.2em] transition-colors">
                            {{ lang.t('form.modal.avail.all') }}
                        </button>
                    </div>
                </div>
            </div>
        }
    </div>
  `,
  styles: [`
    /* Hero background fade-in with subtle zoom */
    @keyframes heroFade {
      0% { opacity: 0; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-hero-fade {
      animation: heroFade 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    /* Title entrance with blur effect */
    @keyframes titleEntrance {
      0% { 
        opacity: 0; 
        transform: translateY(-30px); 
        filter: blur(8px);
      }
      100% { 
        opacity: 1; 
        transform: translateY(0); 
        filter: blur(0);
      }
    }
    .animate-title-entrance {
      opacity: 0;
      animation: titleEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
    }

    /* Subtitle with delayed fade */
    @keyframes subtitleEntrance {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 0.9; transform: translateY(0); }
    }
    .animate-subtitle-entrance {
      opacity: 0;
      animation: subtitleEntrance 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.6s forwards;
    }

    /* Step progress slide-in from left */
    @keyframes progressEntrance {
      0% { 
        opacity: 0; 
        transform: translateX(-40px) scale(0.95);
      }
      100% { 
        opacity: 1; 
        transform: translateX(0) scale(1);
      }
    }
    .animate-progress-entrance {
      opacity: 0;
      animation: progressEntrance 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards;
    }

    /* Form entrance with elegant rise */
    @keyframes formEntrance {
      0% { 
        opacity: 0; 
        transform: translateY(50px) scale(0.97);
      }
      60% {
        transform: translateY(-5px) scale(1);
      }
      100% { 
        opacity: 1; 
        transform: none;
      }
    }
    .animate-form-entrance {
      opacity: 0;
      animation: formEntrance 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    Hero6Component,
    ReservationFormFinalComponent,
    StepProgressComponent,
    CommonModule
  ],
})
export class Paso1Component {
  lang = inject(LanguageService);
}
