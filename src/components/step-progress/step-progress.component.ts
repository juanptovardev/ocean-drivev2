import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-step-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-6xl mx-auto pt-2 pb-12 px-4">
      <div class="relative flex items-center justify-between">
        
        <!-- Background Line -->
        <div class="absolute top-1/2 -translate-y-1/2 h-[2px] bg-white/20 z-0"
             [style.left.%]="getLineOffset()"
             [style.right.%]="getLineOffset()"></div>
        
        <!-- Active Progress Line with glow -->
        <div class="absolute top-1/2 -translate-y-1/2 h-[2px] bg-white z-0 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.5)]"
             [style.left.%]="getLineOffset()"
             [style.width.%]="getProgressWidth()"></div>
        
        <!-- Steps -->
        @for (step of stepDefinitions; track step.id; let i = $index) {
          <div class="relative z-10 flex flex-col items-center flex-1 group"
               [style.animation-delay.ms]="i * 100">
            <!-- Dot -->
            <div 
              class="w-4 h-4 rounded-full border-2 flex items-center justify-center relative transition-all duration-500 ease-out"
              [ngClass]="{
                'bg-white border-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.6)]': step.id === currentStep,
                'bg-white border-white': step.id < currentStep,
                'bg-transparent border-white/40 hover:border-white/60': step.id > currentStep
              }">
              
              <!-- Pulse effect for current step -->
              @if(step.id === currentStep) {
                <div class="absolute inset-0 rounded-full bg-white/40 animate-pulse-slow"></div>
                <div class="absolute inset-[-4px] rounded-full border border-white/20 animate-ping-slow"></div>
              }
            </div>
            
            <!-- Content Container -->
            <div class="absolute top-8 left-1/2 -translate-x-1/2 w-28 md:w-40 flex flex-col items-center">
                
                <!-- Fixed Height Text Container for Alignment -->
                <div class="h-8 md:h-10 flex items-end justify-center pb-1 w-full px-1">
                    <!-- Label -->
                    <span class="text-[0.45rem] md:text-[0.55rem] uppercase tracking-widest font-semibold transition-all duration-500 leading-tight text-center block"
                          [ngClass]="{
                            'text-white scale-105 font-bold': step.id === currentStep,
                            'text-white/70 group-hover:text-white/90': step.id !== currentStep
                          }"
                          [innerHTML]="lang.t(step.labelKey)">
                    </span>
                </div>

                <!-- Edit Link -->
                @if (step.id < currentStep) {
                    <button (click)="navigateTo(step.route)" 
                            class="relative z-50 text-[0.55rem] font-bold text-[#FF6F61] hover:text-[#ff9e93] transition-all duration-300 cursor-pointer uppercase tracking-wider hover:underline border-b border-transparent hover:border-[#ff9e93] mt-0.5 hover:scale-105 pointer-events-auto">
                        {{ lang.t('step.edit') }}
                    </button>
                }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    @keyframes pulseSlow {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.5); opacity: 0; }
    }
    .animate-pulse-slow {
      animation: pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pingSlow {
      0% { transform: scale(1); opacity: 0.3; }
      75%, 100% { transform: scale(1.8); opacity: 0; }
    }
    .animate-ping-slow {
      animation: pingSlow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepProgressComponent {
  @Input() currentStep: number = 1;
  @Input() totalSteps: number = 4;

  private router = inject(Router);
  lang = inject(LanguageService);

  stepDefinitions = [
    { id: 1, labelKey: 'step.pickup', route: '/paso-1' },
    { id: 2, labelKey: 'step.service', route: '/paso-2' },
    { id: 3, labelKey: 'step.customize', route: '/paso-3' },
    { id: 4, labelKey: 'step.info', route: '/paso-4' }
  ];

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // Calculate the starting offset (center of the first item)
  getLineOffset(): number {
    // 100% / steps / 2
    return (100 / this.totalSteps) / 2;
  }

  getProgressWidth(): number {
    if (this.currentStep <= 1) {
      return 0;
    }

    // Width logic:
    // Distance between centers = 100% / totalSteps
    // Valid segments = totalSteps - 1
    // Completed segments = currentStep - 1

    const segmentWidth = 100 / this.totalSteps;
    const completedSegments = this.currentStep - 1;
    return completedSegments * segmentWidth;
  }
}
