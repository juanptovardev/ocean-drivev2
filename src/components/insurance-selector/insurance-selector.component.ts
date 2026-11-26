import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

export type InsuranceType = 'basic' | 'total';

@Component({
  selector: 'app-insurance-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white/80 backdrop-blur-3xl rounded-[2rem] p-4 md:p-6 shadow-2xl shadow-black/5 border border-white/50 h-full flex flex-col">
      <h3 class="text-[#002B5B] font-black text-xl mb-1 uppercase tracking-wider">{{ lang.t('insurance.title2') }}</h3>
      <p class="text-gray-500 text-xs mb-5 font-medium">{{ lang.t('insurance.subtitle2') }}</p>

      <div class="flex flex-col md:flex-col lg:flex-row gap-4 lg:gap-6 h-full">
        
        <!-- BASIC PROTECTION (Selected by default, free) -->
        <div class="flex-1 border-2 rounded-2xl p-4 md:p-6 relative transition-all duration-300 flex flex-col group bg-white border-[#FF6F61] shadow-xl shadow-[#FF6F61]/10">
             
          <div class="text-center mb-4">
              <h4 class="text-[#002B5B] font-black text-lg uppercase tracking-wide">{{ lang.t('insurance.basic_title') }}</h4>
              <div class="mt-2 inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-wider">
                  {{ lang.t('insurance.free') }}
              </div>
          </div>

          <ul class="space-y-3 mb-6 flex-1">
              <li class="flex items-start gap-4 text-sm text-gray-600 font-medium">
                  <svg class="w-5 h-5 text-[#FF6F61] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                  <span>{{ lang.t('insurance.item1') }}</span>
              </li>
              <li class="flex items-start gap-4 text-sm text-gray-600 font-medium">
                  <svg class="w-5 h-5 text-[#FF6F61] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                  <span>{{ lang.t('insurance.item2') }}</span>
              </li>
              <li class="flex items-start gap-4 text-sm text-gray-600 font-medium">
                  <svg class="w-5 h-5 text-[#FF6F61] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                  <span>{{ lang.t('insurance.item3') }}</span>
              </li>
              <li class="flex items-start gap-4 text-xs text-orange-500 bg-orange-50 p-3 rounded-xl border border-orange-100 leading-snug">
                  <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>{{ lang.t('insurance.deductible') }}</span>
              </li>
          </ul>

          <div class="mt-auto text-center">
             <div class="w-full py-2.5 rounded-xl font-black uppercase tracking-[0.1em] text-xs bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/30">
               {{ lang.t('insurance.selected_free') }}
             </div>
          </div>
        </div>

        <!-- TOTAL PROTECTION (Temporarily Disabled) -->
        <div class="flex-1 border-2 rounded-2xl p-4 md:p-6 relative flex flex-col bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed">

          <!-- Unavailable Badge -->
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg ring-4 ring-white">
             <span class="pt-0.5">{{ lang.t('insurance.not_available') }}</span>
             <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
          </div>

          <div class="text-center mb-4 mt-1">
              <h4 class="text-gray-500 font-black text-lg uppercase tracking-wide">{{ lang.t('insurance.total_title') }}</h4>
              <p class="text-gray-400 font-bold text-lg mt-1 flex items-center justify-center gap-1 line-through">
                + COP 77.000 <span class="text-gray-300 text-[12px] font-normal">/{{ lang.t('booking.perDay') }}</span>
              </p>
          </div>

          <ul class="space-y-3 mb-6 flex-1">
              <li class="flex items-start gap-4 text-sm text-gray-400 font-medium">
                  <div class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                      <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span>{{ lang.t('insurance.total_item1') }}</span>
              </li>
              <li class="flex items-start gap-4 text-sm text-gray-400 font-medium">
                  <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                  <span>{{ lang.t('insurance.total_item2') }}</span>
              </li>
              <li class="flex items-start gap-4 text-sm text-gray-400 font-medium">
                  <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                  <span>{{ lang.t('insurance.total_item3') }}</span>
              </li>
              <li class="flex items-start gap-4 text-sm text-gray-400 font-medium">
                  <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                  <span>{{ lang.t('insurance.total_item4') }}</span>
              </li>
          </ul>

          <div class="mt-auto text-center">
             <div class="w-full py-2.5 rounded-xl font-bold uppercase tracking-[0.1em] text-xs bg-gray-300 text-gray-500">
               {{ lang.t('insurance.coming_soon') }}
             </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class InsuranceSelectorComponent {
  lang = inject(LanguageService);
  selected = signal<InsuranceType>('basic');
  @Output() selectionChange = new EventEmitter<InsuranceType>();

  // Always emit 'basic' as it's the only available option now
  constructor() {
    // Emit basic on init
    setTimeout(() => this.selectionChange.emit('basic'), 0);
  }
}
