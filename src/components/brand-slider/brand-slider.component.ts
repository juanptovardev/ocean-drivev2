import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionDirective } from '../../app/core/motion/motion.directive';

@Component({
  selector: 'app-brand-slider',
  standalone: true,
  imports: [CommonModule, MotionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section appReveal class="w-full py-10 bg-white relative">
      <!-- Scroll Container -->
      <div class="flex overflow-hidden relative w-full group hover-pause-trigger">
        
        <!-- Track: Left to Right animation (marquee-reverse) -->
        <div class="flex w-max animate-marquee-reverse items-center gap-16 md:gap-32 px-4">
          
          <!-- Set 1 (Original) -->
          @for(brand of brands(); track brand.name) {
            <div class="relative flex flex-col items-center justify-center w-24 h-10 md:w-32 md:h-14 group/brand cursor-pointer">
               <!-- Imagen Azul (Base) -->
               <img [src]="'assets/imgs/slider/Azul/' + brand.file" loading="lazy" decoding="async" 
                    [alt]="brand.name"
                    class="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-100 group-hover/brand:opacity-0"
                    [class]="brand.className || ''">
               
               <!-- Imagen Color (Hover) -->
               <img [src]="'assets/imgs/slider/Color/' + brand.file" loading="lazy" decoding="async" 
                    [alt]="brand.name + ' Color'"
                    class="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover/brand:opacity-100"
                    [class]="brand.className || ''">
            </div>
          }

          <!-- Set 2 (Duplicado para loop infinito) -->
          @for(brand of brands(); track brand.name + '_dup') {
            <div class="relative flex flex-col items-center justify-center w-24 h-10 md:w-32 md:h-14 group/brand cursor-pointer">
               <img [src]="'assets/imgs/slider/Azul/' + brand.file" loading="lazy" decoding="async" 
                    [alt]="brand.name"
                    class="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-100 group-hover/brand:opacity-0"
                    [class]="brand.className || ''">
               <img [src]="'assets/imgs/slider/Color/' + brand.file" loading="lazy" decoding="async" 
                    [alt]="brand.name + ' Color'"
                    class="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover/brand:opacity-100"
                    [class]="brand.className || ''">
            </div>
          }
          
          <!-- Set 3 (Triplicado para pantallas anchas) -->
          @for(brand of brands(); track brand.name + '_tri') {
            <div class="relative flex flex-col items-center justify-center w-24 h-10 md:w-32 md:h-14 group/brand cursor-pointer">
               <img [src]="'assets/imgs/slider/Azul/' + brand.file" loading="lazy" decoding="async" 
                    [alt]="brand.name"
                    class="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-100 group-hover/brand:opacity-0"
                    [class]="brand.className || ''">
               <img [src]="'assets/imgs/slider/Color/' + brand.file" loading="lazy" decoding="async" 
                    [alt]="brand.name + ' Color'"
                    class="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover/brand:opacity-100"
                    [class]="brand.className || ''">
            </div>
          }
          
           <!-- Set 4 (Cuadruplicado para pantallas ultra-anchas) -->
          @for(brand of brands(); track brand.name + '_quad') {
            <div class="relative flex flex-col items-center justify-center w-24 h-10 md:w-32 md:h-14 group/brand cursor-pointer">
               <img [src]="'assets/imgs/slider/Azul/' + brand.file" loading="lazy" decoding="async" 
                    [alt]="brand.name"
                    class="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-100 group-hover/brand:opacity-0"
                    [class]="brand.className || ''">
               <img [src]="'assets/imgs/slider/Color/' + brand.file" loading="lazy" decoding="async" 
                    [alt]="brand.name + ' Color'"
                    class="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover/brand:opacity-100"
                    [class]="brand.className || ''">
            </div>
          }

        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Animación de Marquee */
    @keyframes marquee-reverse {
      0% {
        transform: translateX(-50%); 
      }
      100% {
        transform: translateX(0%); 
      }
    }

    .animate-marquee-reverse {
      animation: marquee-reverse 60s linear infinite;
    }

    /* Pausar animación al pasar el mouse */
    .hover-pause-trigger:hover .animate-marquee-reverse {
      animation-play-state: paused;
    }
  `]
})
export class BrandSliderComponent {
  brands = signal([
    { name: 'Chevrolet', file: 'chevrolet.webp' },
    { name: 'Citroen', file: 'citroen.webp', className: 'p-1 md:p-1.5' }, // Vertical
    { name: 'Fiat', file: 'fiat.webp', className: 'p-1 md:p-1.5' },       // Vertical/Cuadrado
    { name: 'Hyundai', file: 'hyundai.webp' },
    { name: 'Kia', file: 'kia.webp' },
    { name: 'Mazda', file: 'mazda.webp' },
    { name: 'Nissan', file: 'nissan.webp' },
    { name: 'Renault', file: 'renault.webp', },
    { name: 'Suzuki', file: 'suzuki.webp', }
  ]);
}
