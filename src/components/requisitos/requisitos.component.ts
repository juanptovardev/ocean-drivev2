import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-requisitos',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="flex flex-col font-sans text-gray-900 bg-gray-50">
    <main class="flex-grow">
      <!-- Sección del Encabezado -->
      <section class="text-center pt-16 pb-4 px-4 bg-white">
        <span class="text-[#002B5B] font-semibold tracking-widest text-sm uppercase block mb-3" style="font-family: 'Rubik', sans-serif;">{{ lang.t('req.header') }}</span>
        <h2 class="text-4xl md:text-5xl font-normal text-gray-900 mb-4" style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em;">{{ lang.t('req.title') }}</h2>
      </section>

      <!-- Contenido del Componente Stepper -->
      <div class="bg-white pb-8 pt-4 px-4">
        <div class="max-w-md mx-auto">
          <div class="relative">
            <!-- Línea vertical punteada -->
            <div class="absolute left-6 top-6 bottom-6 w-0.5 border-l-2 border-dashed border-gray-300"></div>

            <!-- Lista de Requisitos -->
            <div class="space-y-10">
              
              <!-- Requisito 1 -->
              <div class="relative group cursor-pointer">
                <div class="flex items-center gap-6">
                  <div class="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:scale-110">
                    <div class="text-gray-500 transition-colors duration-300 group-hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"></path></svg>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                      {{ lang.t('req.item1') }}
                    </h3>
                  </div>
                </div>
              </div>

              <!-- Requisito 2 -->
              <div class="relative group cursor-pointer">
                <div class="flex items-center gap-6">
                  <div class="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:scale-110">
                    <div class="text-gray-500 transition-colors duration-300 group-hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z"></path></svg>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                      {{ lang.t('req.item2') }}
                    </h3>
                  </div>
                </div>
              </div>

              <!-- Requisito 3 -->
              <div class="relative group cursor-pointer">
                <div class="flex items-center gap-6">
                  <div class="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:scale-110">
                    <div class="text-gray-500 transition-colors duration-300 group-hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M12 14v7"></path><path stroke-linecap="round" stroke-linejoin="round" d="M10 12 3.25 10"></path><path stroke-linecap="round" stroke-linejoin="round" d="m14 12 6.75-2"></path></svg>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                      {{ lang.t('req.item3') }}
                    </h3>
                  </div>
                </div>
              </div>

              <!-- Requisito 4 -->
              <div class="relative group cursor-pointer">
                <div class="flex items-center gap-6">
                  <div class="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:scale-110">
                    <div class="text-gray-500 transition-colors duration-300 group-hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path></svg>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                      {{ lang.t('req.item4') }}
                    </h3>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <!-- Sección de Párrafo -->
      <div class="bg-white text-center pb-16 pt-4 px-4">
        <p class="max-w-2xl mx-auto text-base text-gray-600 leading-relaxed" style="font-family: 'Open Sans', sans-serif;">{{ lang.t('req.desc') }}</p>
      </div>
    </main>
  </div>
  `,
  styles: [`
    .serif { 
      font-family: 'Playfair Display', serif; 
    }
  `]
})
export class RequisitosComponent {
  lang = inject(LanguageService);
}
