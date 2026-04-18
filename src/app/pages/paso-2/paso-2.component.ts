import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { Hero6Component } from '../../../components/hero6/hero6.component';
import { VehiclesComponent } from '../../../components/vehicles/vehicles.component';
import { StepProgressComponent } from '../../../components/step-progress/step-progress.component';
import { BookingService } from '../../../services/booking.service';
import { ApiService } from '../../../services/api.service';
import { inject } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

@Component({
    selector: 'app-paso-2',
    standalone: true,
    template: `
    <div class="h-screen flex flex-col overflow-y-auto">
        <app-header variant="white" class="relative z-30"></app-header>
        <main class="flex-1 relative flex flex-col items-center pt-36 md:pt-28 pb-4 gap-0 md:gap-3">
            <!-- Full background hero -->
            <div class="absolute inset-0 z-0 h-full w-full">
                <app-hero6></app-hero6>
            </div>
            
            <!-- Page Title -->
             <div class="relative z-20 text-center text-white drop-shadow-md px-4 shrink-0 mb-2">
                 <h2 class="text-2xl md:text-3xl font-extrabold uppercase tracking-widest italic leading-tight">{{ lang.t('paso2.title') }}</h2>
                 <p class="text-xs md:text-sm font-light opacity-90 mt-1">{{ lang.t('paso2.subtitle') }}</p>
             </div>

            <!-- Step Progress - Hidden when modal is visible -->
            @if (!isModalVisible()) {
            <div class="relative z-30 w-full max-w-2xl px-6 shrink-0 -mt-1">
                <app-step-progress [currentStep]="2" [totalSteps]="4"></app-step-progress>
            </div>
            }

            <!-- Vehicles Selection -->
            <div class="relative z-20 w-full max-w-full md:max-w-[1600px] px-0 md:px-6 flex-1 flex flex-col justify-start md:justify-center -mt-4">
                <div class="w-full max-h-[85vh]">
                    <app-vehicles 
                        [theme]="'blue'" 
                        [overlineText]="''"
                        [titleText]="''"
                        [descriptionText]="''"
                        (selectService)="onCategorySelected($event)"
                        (modalVisibilityChange)="onModalVisibilityChange($event)">
                    </app-vehicles>
                </div>
            </div>
        </main>

    </div>
  `,
    styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        HeaderComponent,
        Hero6Component,
        VehiclesComponent,
        StepProgressComponent
    ],
})
export class Paso2Component {
    isModalVisible = signal(false);
    lang = inject(LanguageService);

    constructor(
        private router: Router,
        private bookingService: BookingService
    ) { }

    onCategorySelected(category: any) {
        // Validation now handled internally by VehiclesComponent if dates are present.
        // If we reach here, it means it's available or no dates were set yet.
        this.bookingService.updateSelectedCar(category);
        this.router.navigate(['/paso-3']);
    }

    onModalVisibilityChange(visible: boolean) {
        this.isModalVisible.set(visible);
    }
}
