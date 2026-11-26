import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionDirective } from '../../app/core/motion/motion.directive';

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [CommonModule, MotionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section appReveal class="bg-transparent w-full">
      <!-- Map Wrapper 
           Heights adjusted: 320px mobile / 400px desktop (approx 15% increase) 
      -->
      <div class="relative w-full h-[288px] md:h-[360px] bg-gray-200 overflow-hidden group border-b border-gray-200">
        
        <!-- Google Maps Embed - Pure Viewport Mode -->
        <!-- 
             Technique: We use negative margins (-top, -left) and calc width/height > 100% 
             to "crop" the iframe edges. This physically hides the default Google UI buttons 
             (Zoom, View larger map) that sit at the borders.
        -->
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.7152740640176!2d-75.5178762!3d10.4441536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef6253b1b253d1b%3A0xa80ebf69d084b345!2sOCEAN%20DRIVE%20CAR%20RENTAL!5e0!3m2!1ses-419!2sco!4v1766695754895!5m2!1ses-419!2sco"
          class="absolute -top-[150px] -left-[150px] w-[calc(100%+300px)] h-[calc(100%+300px)] border-0 grayscale-[20%] contrast-[1.1]"
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>

        <!-- Unified Elegant Place Card -->
        <div class="absolute top-4 left-4 md:top-6 md:left-6 z-10 animate-enter">
          <div class="bg-white rounded-xl shadow-xl p-5 w-[300px] md:w-[340px] border border-gray-100 flex items-start justify-between gap-4">
              
              <!-- Left: Info -->
              <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-lg text-gray-900 leading-tight mb-1 truncate">Ocean Drive Car Rental</h3>
                  <p class="text-xs text-gray-500 font-medium mb-2">CL 70 KR 2-60 Crespo, Cartagena</p>
                  
                  <!-- Ratings -->
                  <div class="flex items-center gap-1.5 mb-3">
                      <span class="font-bold text-sm text-gray-800">4.9</span>
                      <div class="flex text-[#FFB800] space-x-[1px]">
                          <!-- Stars -->
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                      </div>
                      <span class="text-[12px] text-gray-400 font-medium">(690)</span>
                  </div>

                  <a href="https://maps.app.goo.gl/tJBr35ETjXJ2Eqwx7" target="_blank" class="inline-flex items-center min-h-[44px] text-[12px] font-semibold text-[#4285F4] hover:text-[#002B5B] hover:underline transition-colors">
                      Ampliar mapa
                  </a>
              </div>

              <!-- Right: Directions Button (Integrated) -->
              <a href="https://maps.app.goo.gl/tJBr35ETjXJ2Eqwx7" target="_blank" class="group/dir flex flex-col items-center shrink-0 min-w-[44px]">
                 <!-- Icon Container -->
                 <div class="w-10 h-10 bg-[#4285F4] rounded-lg shadow-md flex items-center justify-center transition-all duration-300 group-hover/dir:bg-[#3367D6] group-hover/dir:scale-105 group-hover/dir:shadow-lg">
                    <!-- Direction Arrow Icon -->
                    <svg class="w-6 h-6 text-white transform group-hover/dir:translate-x-0.5 group-hover/dir:-translate-y-0.5 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                 </div>
                 <span class="text-[12px] font-bold text-[#4285F4] mt-1.5 uppercase tracking-wide group-hover/dir:text-[#3367D6]">Llegar</span>
              </a>

          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { 
        opacity: 0; 
        transform: translateY(10px) scale(0.98);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-enter {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class LocationMapComponent { }
