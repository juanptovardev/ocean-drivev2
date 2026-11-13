import { Component, ChangeDetectionStrategy, signal, computed, output, input, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';

/**
 * ===========================================================================================
 * COMPONENTE CALENDARIO (INTERNO)
 * ===========================================================================================
 */
@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="shadow-xl p-4 w-72 transition-colors duration-300"
      [ngClass]="{
        'rounded-xl': variant() === 'rounded',
        'rounded-none': variant() === 'square',
        'bg-white': theme() === 'light',
        'bg-[#0F1420]': theme() === 'dark',
        'border': theme() === 'dark' || variant() === 'square',
        'border-gray-700': theme() === 'dark',
        'border-gray-100': theme() === 'light' && variant() === 'square'
      }">
      
      <div class="flex justify-between items-center mb-4">
        <button aria-label="Mes anterior" (click)="prevMonth()" type="button" class="p-1 transition" 
          [ngClass]="{
            'hover:bg-gray-100': theme() === 'light', 
            'hover:bg-white/10': theme() === 'dark'
          }">
          <svg class="w-5 h-5" [ngClass]="{'text-gray-600': theme() === 'light', 'text-gray-300': theme() === 'dark'}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div class="text-sm font-semibold capitalize" [ngClass]="{'text-gray-700': theme() === 'light', 'text-gray-100': theme() === 'dark'}">{{ monthName() }}</div>
        <button aria-label="Mes siguiente" (click)="nextMonth()" type="button" class="p-1 transition"
          [ngClass]="{
            'hover:bg-gray-100': theme() === 'light', 
            'hover:bg-white/10': theme() === 'dark'
          }">
          <svg class="w-5 h-5" [ngClass]="{'text-gray-600': theme() === 'light', 'text-gray-300': theme() === 'dark'}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
      
      <div class="grid grid-cols-7 gap-1 text-center text-xs" [ngClass]="{'text-gray-500': theme() === 'light', 'text-gray-400': theme() === 'dark'}">
        @for(day of daysOfWeek; track day) { <div>{{ day }}</div> }
      </div>

      <div class="grid grid-cols-7 gap-1 mt-2">
        @for(dayObj of calendarGrid(); track $index) {
          <div>
            @if(dayObj) {
              <button (click)="selectDate(dayObj.day)" type="button" class="w-8 h-8 flex items-center justify-center text-sm transition"
                [ngClass]="{
                  'rounded-full': variant() === 'rounded',
                  'rounded-none': variant() === 'square',
                  'bg-[#002B5B]': isSelected(dayObj.day) && theme() === 'light',
                  'bg-[#FF6F61]': isSelected(dayObj.day) && theme() === 'dark',
                  'text-white': isSelected(dayObj.day),
                  'text-gray-700': !isSelected(dayObj.day) && theme() === 'light',
                  'text-gray-300': !isSelected(dayObj.day) && theme() === 'dark',
                  'hover:bg-gray-200': !isSelected(dayObj.day) && theme() === 'light',
                  'hover:bg-white/10': !isSelected(dayObj.day) && theme() === 'dark'
                }">
                {{ dayObj.day }}
              </button>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class CalendarComponent {
  dateSelected = output<Date>();
  theme = input<'light' | 'dark'>('light');
  variant = input<'rounded' | 'square'>('rounded');

  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);
  daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  monthName = computed(() => this.currentDate().toLocaleString('es-CO', { month: 'long', year: 'numeric' }));

  calendarGrid = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: ({ day: number; isCurrentMonth: boolean } | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) grid.push(null);
    for (let i = 1; i <= daysInMonth; i++) grid.push({ day: i, isCurrentMonth: true });
    return grid;
  });

  prevMonth() { this.currentDate.update(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; }); }
  nextMonth() { this.currentDate.update(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; }); }
  selectDate(day: number | null) { if (day === null) return; const newDate = new Date(this.currentDate().getFullYear(), this.currentDate().getMonth(), day); this.selectedDate.set(newDate); this.dateSelected.emit(newDate); }
  isSelected(day: number): boolean { const s = this.selectedDate(); if (!s) return false; const c = this.currentDate(); return day === s.getDate() && c.getMonth() === s.getMonth() && c.getFullYear() === s.getFullYear(); }
}

/**
 * ===========================================================================================
 * COMPONENTE PRINCIPAL (CONTACT PROMO)
 * ===========================================================================================
 */
@Component({
  selector: 'app-contact-promo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CalendarComponent, FormsModule],
  host: { '(document:click)': 'onDocumentClick($event)' },
  template: `
    <section class="relative overflow-hidden font-poppins bg-[#050914]">
      <!-- SINGLE VARIANT: MIDNIGHT NEON -->
      <div class="relative min-h-[550px] flex items-center justify-center pt-16 pb-36 px-6 bg-[#050914] overflow-hidden">
          <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#FF6F61]/10 rounded-full blur-[100px] animate-pulse"></div>
          <div class="container mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 relative z-10 items-stretch">
              <div class="w-full lg:w-5/12 flex items-center animate-enter order-2 lg:order-1">
                  <div class="w-full">
                      <div class="flex items-center gap-3 mb-2"><span class="h-px w-6 bg-[#FF6F61]"></span><h2 class="text-xs font-bold text-[#FF6F61] tracking-[0.2em] uppercase">{{ lang.t('contact.sectionLabel') }}</h2></div>
                      <h2 class="text-3xl lg:text-4xl font-black text-white mb-3 leading-none">{{ lang.t('contact.title') }}</h2>
                      <p class="text-gray-400 mb-6 text-sm lg:text-base font-light max-w-md">{{ lang.t('contact.subtitle') }}</p>
                      
                      <!-- FORM START -->
                      <form (ngSubmit)="onSubmit()" class="space-y-6">
                          <div class="group relative">
                              <input type="text" [(ngModel)]="name" name="name" class="block py-2 px-0 w-full text-base text-white bg-transparent border-0 border-b border-gray-700 appearance-none focus:outline-none focus:border-[#B3E5FF] peer transition-all duration-300" placeholder=" " required />
                              <label class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-5 scale-90 top-2 -z-10 origin-[0] peer-focus:text-[#B3E5FF] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-90 peer-focus:-translate-y-5">{{ lang.t('contact.name') }}</label>
                              <div class="absolute bottom-0 left-0 h-[1px] w-0 bg-[#B3E5FF] transition-all duration-500 group-hover:w-full peer-focus:w-full"></div>
                          </div>
                          <div class="grid grid-cols-2 gap-6">
                              <div class="group relative">
                                  <input type="tel" [(ngModel)]="phone" name="phone" class="block py-2 px-0 w-full text-base text-white bg-transparent border-0 border-b border-gray-700 appearance-none focus:outline-none focus:border-[#B3E5FF] peer transition-all" placeholder=" " />
                                  <label class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-5 scale-90 top-2 -z-10 origin-[0] peer-focus:text-[#B3E5FF] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-90 peer-focus:-translate-y-5">{{ lang.t('contact.phone') }}</label>
                                  <div class="absolute bottom-0 left-0 h-[1px] w-0 bg-[#B3E5FF] transition-all duration-500 group-hover:w-full peer-focus:w-full"></div>
                              </div>
                              <div class="group relative">
                                  <input type="email" [(ngModel)]="email" name="email" class="block py-2 px-0 w-full text-base text-white bg-transparent border-0 border-b border-gray-700 appearance-none focus:outline-none focus:border-[#B3E5FF] peer transition-all" placeholder=" " required />
                                  <label class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-5 scale-90 top-2 -z-10 origin-[0] peer-focus:text-[#B3E5FF] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-90 peer-focus:-translate-y-5">{{ lang.t('contact.email') }}</label>
                                  <div class="absolute bottom-0 left-0 h-[1px] w-0 bg-[#B3E5FF] transition-all duration-500 group-hover:w-full peer-focus:w-full"></div>
                              </div>
                          </div>
                          <div class="space-y-4">
                              <div class="relative" [class.z-50]="showDeliveryDropdown()" [class.z-30]="!showDeliveryDropdown()" #deliveryWrapper>
                                  <button (click)="toggleDelivery()" type="button" class="w-full text-left py-3 px-5 bg-[#0F1420] rounded-lg border border-gray-800 text-gray-300 hover:border-[#B3E5FF] transition-all duration-300 flex justify-between items-center group text-sm">
                                      <span [class.text-white]="selectedDelivery()" [class.text-gray-500]="!selectedDelivery()">
                                          {{ selectedDelivery() || lang.t('contact.selectDelivery') }}
                                      </span>
                                      <svg class="w-4 h-4 text-gray-500 group-hover:text-[#B3E5FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                      </svg>
                                  </button>
                                  @if(showDeliveryDropdown()) { 
                                      <div class="absolute top-full left-0 w-full bg-[#0F1420] border border-gray-700 rounded-lg mt-2 overflow-hidden animate-enter z-[70] shadow-2xl ring-1 ring-white/10 max-h-56 overflow-y-auto custom-scrollbar">
                                          @for(o of deliveryOptions; track o.city){
                                              <div (click)="o.enabled && selectDelivery(o.city)" 
                                                   class="group/item relative p-4 transition-all duration-200 border-b border-white/5 last:border-0"
                                                   [ngClass]="{
                                                     'cursor-pointer hover:bg-white/5': o.enabled,
                                                     'cursor-not-allowed bg-black/20': !o.enabled,
                                                     'bg-[#FF6F61]/10': selectedDelivery() === o.city
                                                   }">
                                                  
                                                  <div class="flex justify-between items-center relative z-10">
                                                      <div class="flex flex-col gap-0.5">
                                                          <span class="text-sm font-bold tracking-wide"
                                                                [ngClass]="{
                                                                  'text-white group-hover/item:text-[#FF6F61] transition-colors': o.enabled,
                                                                  'text-[#FF6F61]': selectedDelivery() === o.city,
                                                                  'text-gray-600': !o.enabled
                                                                }">
                                                              {{o.city}}
                                                          </span>
                                                          <span class="text-[10px] font-medium tracking-wider uppercase"
                                                                [ngClass]="{
                                                                  'text-gray-400': o.enabled,
                                                                  'text-[#FF6F61]/80': selectedDelivery() === o.city,
                                                                  'text-gray-700': !o.enabled
                                                                }">
                                                              {{o.airport}}
                                                          </span>
                                                      </div>

                                                      <span class="text-[9px] font-black px-2 py-1 rounded-[4px] border transition-all"
                                                            [ngClass]="{
                                                              'bg-white/10 text-white border-white/10 group-hover/item:border-[#FF6F61]/50': o.enabled && selectedDelivery() !== o.city,
                                                              'bg-[#FF6F61] text-white border-[#FF6F61] shadow-[0_0_10px_rgba(255,111,97,0.4)]': selectedDelivery() === o.city,
                                                              'bg-transparent text-gray-700 border-gray-800': !o.enabled
                                                            }">
                                                          {{o.code}}
                                                      </span>
                                                  </div>

                                                  <!-- Active Indicator Bar -->
                                                  <div *ngIf="selectedDelivery() === o.city" class="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6F61] shadow-[0_0_10px_#FF6F61]"></div>
                                              </div>
                                          }
                                      </div> 
                                  }
                              </div>
                              <div class="flex gap-4 relative" [class.z-50]="showCalendar() || showTimeDropdown()" [class.z-20]="!showCalendar() && !showTimeDropdown()">
                                  <div class="relative w-1/2" #dateWrapper>
                                      <button (click)="toggleCalendar()" type="button" class="w-full text-left py-3 px-5 bg-[#0F1420] rounded-lg border border-gray-800 text-gray-300 hover:border-[#B3E5FF] transition-all duration-300 flex justify-between items-center group text-sm"><span [class.text-white]="selectedDate()" [class.text-gray-500]="!selectedDate()">{{ formatDate(selectedDate()) || lang.t('contact.selectDate') }}</span><svg class="w-4 h-4 text-gray-500 group-hover:text-[#B3E5FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></button>
                                      @if(showCalendar()) { <div class="absolute bottom-full mb-2 left-0 animate-enter shadow-[0_10px_40px_rgba(0,0,0,0.5)]"><app-calendar theme="dark" (dateSelected)="onDateSelected($event)"></app-calendar></div> }
                                  </div>
                                  <div class="relative w-1/2" #timeWrapper>
                                      <button (click)="toggleTime()" type="button" class="w-full text-left py-3 px-5 bg-[#0F1420] rounded-lg border border-gray-800 text-gray-300 hover:border-[#B3E5FF] transition-all duration-300 flex justify-between items-center group text-sm"><span [class.text-white]="selectedTime()" [class.text-gray-500]="!selectedTime()">{{ selectedTime() || lang.t('contact.selectTime') }}</span><svg class="w-4 h-4 text-gray-500 group-hover:text-[#B3E5FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></button>
                                      @if(showTimeDropdown()) { <div class="absolute bottom-full mb-2 w-full bg-[#0F1420] border border-gray-700 rounded-lg max-h-48 overflow-y-auto custom-scrollbar">@for(t of availableTimes; track t){<div (click)="selectTime(t)" class="p-2 text-sm text-gray-300 hover:bg-[#FF6F61] hover:text-white cursor-pointer text-center border-b border-gray-800 last:border-0">{{t}}</div>}</div> }
                                  </div>
                              </div>
                          </div>
                          
                          <!-- SUBMIT BUTTON -->
                          <button type="submit" [disabled]="isLoading()" class="group w-full py-4 rounded-xl bg-gradient-to-r from-[#FF6F61] to-[#FF8A75] text-white font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,111,97,0.3)] hover:shadow-[0_0_40px_rgba(255,111,97,0.5)] hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden text-sm disabled:opacity-70 disabled:cursor-not-allowed">
                              <span class="relative z-10 flex items-center justify-center gap-2">
                                {{ isLoading() ? lang.t('contact.sending') : lang.t('contact.submit') }}
                                <svg *ngIf="!isLoading()" class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                              </span>
                              <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                          </button>
                      </form>
                  </div>
              </div>
              <div class="hidden lg:block w-7/12 h-[500px] relative rounded-[32px] overflow-hidden shadow-2xl group border border-white/5 animate-enter delay-200 order-1 lg:order-2">
                  <img src="assets/imgs/servicios/form/fondo.webp" class="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 opacity-80 group-hover:opacity-100">
                  <div class="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-transparent opacity-90"></div>
                  <div class="absolute top-8 right-8 bg-black/50 backdrop-blur-md border border-[#FF6F61]/30 text-[#FF6F61] px-4 py-1.5 rounded-full font-bold tracking-wider text-[10px] shadow-[0_0_15px_rgba(255,111,97,0.2)]">MARCAS PREMIUM</div>
              </div>
          </div>
      </div>

      <!-- SUCCESS MODAL (Concept Idea Design) -->
      @if(showSuccessModal()) {
        <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg animate-fade-in" (click)="closeSuccessModal()">
            <div class="bg-[#1E293B] bg-gradient-to-b from-[#1E293B] to-[#0F172A] rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative animate-scale-up border border-white/10" (click)="$event.stopPropagation()">
                
                <!-- Close Button -->
                <button aria-label="Cerrar" (click)="closeSuccessModal()" class="absolute top-4 right-4 text-gray-400 hover:text-[#FF6F61] transition-colors p-2 hover:bg-white/5 rounded-full z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>

                <!-- Decorative Orb -->
                <div class="absolute top-[-50px] left-1/2 -translate-x-1/2 w-32 h-32 bg-[#FF6F61]/20 rounded-full blur-[50px]"></div>

                <div class="p-8 flex flex-col items-center text-center relative z-10">
                    <!-- Icon -->
                    <div class="w-20 h-20 bg-gradient-to-tr from-[#FF6F61] to-[#FF8A75] rounded-2xl rotate-3 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,111,97,0.3)] animate-bounce-soft">
                        <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h3 class="text-2xl font-black text-white mb-2 tracking-tight">{{ lang.t('contact.successTitle') }}</h3>
                    
                    <div class="w-10 h-1 bg-[#FF6F61] rounded-full mb-4"></div>

                    <p class="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                        {{ lang.t('contact.successMsg') }} <span class="text-[#FF6F61] font-bold">{{ selectedDelivery() || 'local' }}</span>. <br><br>
                        {{ lang.t('contact.successMsg2') }}
                    </p>

                    <button (click)="closeSuccessModal()" 
                            class="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-[#FF6F61]/50 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 group">
                        <span>{{ lang.t('contact.close') }}</span>
                    </button>
                </div>
            </div>
        </div>
      }

      <style>
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }

        /* Modal Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }

        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes bounceSoft { 0%, 100% { transform: translateY(0) rotate(3deg); } 50% { transform: translateY(-5px) rotate(3deg); } }
        .animate-bounce-soft { animation: bounceSoft 2s infinite ease-in-out; }
      </style>
    </section>
  `
})
export class ContactPromoComponent {
  private apiService = inject(ApiService);
  lang = inject(LanguageService);
  @ViewChild('dateWrapper') dateWrapper!: ElementRef;
  @ViewChild('deliveryWrapper') deliveryWrapper!: ElementRef;
  @ViewChild('timeWrapper') timeWrapper!: ElementRef;

  name = '';
  phone = '';
  email = '';
  isLoading = signal(false);
  showSuccessModal = signal(false);

  deliveryOptions = [
    { city: 'Cartagena', airport: 'Rafael Núñez', code: 'CTG', enabled: true },
    { city: 'Barranquilla', airport: 'Ernesto Cortissoz', code: 'BAQ', enabled: false },
    { city: 'Santa Marta', airport: 'Simón Bolívar', code: 'SMR', enabled: false },
    { city: 'Bogotá', airport: 'El Dorado', code: 'BOG', enabled: false },
    { city: 'Medellín', airport: 'José María Córdova', code: 'MDE', enabled: false },
    { city: 'Cali', airport: 'Alfonso Bonilla Aragón', code: 'CLO', enabled: false }
  ];

  availableTimes = this.generateTimes();
  showCalendar = signal(false);
  showDeliveryDropdown = signal(false);
  showTimeDropdown = signal(false);
  selectedDate = signal<Date | null>(null);
  selectedDelivery = signal<string>('');
  selectedTime = signal<string>('');

  onDocumentClick(event: MouseEvent) { const target = event.target as Node; if (this.showCalendar() && this.dateWrapper && !this.dateWrapper.nativeElement.contains(target)) this.showCalendar.set(false); if (this.showDeliveryDropdown() && this.deliveryWrapper && !this.deliveryWrapper.nativeElement.contains(target)) this.showDeliveryDropdown.set(false); if (this.showTimeDropdown() && this.timeWrapper && !this.timeWrapper.nativeElement.contains(target)) this.showTimeDropdown.set(false); }
  toggleCalendar() { this.closeAllPopupsExcept('calendar'); this.showCalendar.update(v => !v); }
  toggleDelivery() { this.closeAllPopupsExcept('delivery'); this.showDeliveryDropdown.update(v => !v); }
  toggleTime() { this.closeAllPopupsExcept('time'); this.showTimeDropdown.update(v => !v); }
  onDateSelected(date: Date) { this.selectedDate.set(date); this.showCalendar.set(false); }
  selectDelivery(o: string) { this.selectedDelivery.set(o); this.showDeliveryDropdown.set(false); }
  selectTime(t: string) { this.selectedTime.set(t); this.showTimeDropdown.set(false); }
  private closeAllPopupsExcept(type: string) { if (type !== 'calendar') this.showCalendar.set(false); if (type !== 'delivery') this.showDeliveryDropdown.set(false); if (type !== 'time') this.showTimeDropdown.set(false); }
  formatDate(date: Date | null): string { if (!date) return ''; return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }); }
  private generateTimes(): string[] { const times: string[] = []; for (let h = 7; h < 22; h++) { times.push(`${h.toString().padStart(2, '0')}:00`); times.push(`${h.toString().padStart(2, '0')}:30`); } return times; }

  onSubmit() {
    if (this.isLoading()) return;
    if (!this.name || !this.email) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    this.isLoading.set(true);

    const data = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      city: this.selectedDelivery(),
      date: this.selectedDate() ? this.selectedDate()?.toISOString().split('T')[0] : null,
      time: this.selectedTime()
    };

    console.log('Sending Contact Request:', data);

    this.apiService.sendContactRequest(data).subscribe({
      next: (res) => {
        console.log('Success:', res);
        this.isLoading.set(false);
        this.showSuccessModal.set(true);

        // Clear form
        this.name = '';
        this.email = '';
        this.phone = '';
        this.selectedDate.set(null);
        this.selectedDelivery.set('');
        this.selectedTime.set('');
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading.set(false);
        alert('Hubo un error al enviar tu solicitud. Intenta nuevamente.');
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal.set(false);
  }
}
