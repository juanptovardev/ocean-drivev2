import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-fortalezas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-white py-16 px-4 font-sans">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="flex items-center justify-center gap-4 mb-3">
             <!-- Linea izquierda -->
             <div class="h-px w-12 bg-slate-300"></div>
             
             <h2 class="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
               {{ lang.t('fort.sectionTitle') }}
             </h2>
             
             <!-- Linea derecha -->
             <div class="h-px w-12 bg-slate-300"></div>
          </div>
          
          <p class="mt-2 text-slate-900 font-serif italic text-4xl">
            {{ lang.t('fort.heading') }}
          </p>
        </div>

        <div class="relative">
                <!-- Linea Central (Solo Desktop) -->
          <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#002B5B] -translate-x-1/2"></div>

          <div class="space-y-12 md:space-y-0">
            @for (item of features(); track $index; let i = $index) {
              <div class="relative md:flex items-center justify-between group">
                
                <!-- Punto central (Decorativo) -->
                <div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-[#002B5B] z-10 group-hover:border-[#002B5B] group-hover:scale-125 transition-all duration-300"></div>

                <!-- Contenido de Texto (Alternado Izquierda/Derecha) -->
                <div class="md:w-[45%] p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300 border border-transparent hover:border-slate-100" 
                     [class]="i % 2 === 0 ? 'md:order-1 md:text-right' : 'md:order-3'">
                  <h3 class="text-2xl tracking-wider font-bold text-slate-800 mb-2 group-hover:text-[#002B5B] transition-colors">
                    {{ item.title }}
                  </h3>
                  <p class="text-slate-500 text-base leading-relaxed">
                    {{ item.description }}
                  </p>
                </div>

                <!-- Espacio vacío para alineación -->
                <div class="hidden md:block md:w-[45%] md:order-2"></div>

                <!-- Burbuja de Icono -->
                <div class="md:absolute md:top-1/2 md:-translate-y-1/2 w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 md:mb-0 transition-all duration-300 text-[#002B5B] group-hover:bg-[#002B5B] group-hover:text-white"
                     [class]="i % 2 === 0 ? 'md:left-[calc(50%+2rem)]' : 'md:right-[calc(50%+2rem)]'">
                   
                   @if (item.icon === 'transparency') {
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                       <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                     </svg>
                   } @else if (item.icon === 'closeness') {
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                     </svg>
                   } @else {
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                     </svg>
                   }

                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `
})
export class FortalezasComponent {
  lang = inject(LanguageService);

  features = computed(() => [
    {
      title: this.lang.t('fort.item1.title'),
      description: this.lang.t('fort.item1.desc'),
      icon: 'transparency'
    },
    {
      title: this.lang.t('fort.item2.title'),
      description: this.lang.t('fort.item2.desc'),
      icon: 'closeness'
    },
    {
      title: this.lang.t('fort.item3.title'),
      description: this.lang.t('fort.item3.desc'),
      icon: 'efficiency'
    }
  ]);
}
