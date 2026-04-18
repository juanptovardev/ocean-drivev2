import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { HeroComponent } from '../../../components/hero/hero.component';
import { Vehicles3Component } from '../../../components/vehicles3/vehicles3.component';
import { ReservationFormFinalComponent } from '../../../components/reservation-form-final/reservation-form-final.component';
import { FeaturesComponent } from '../../../components/features/features.component';
import { ExperienceComponent } from '../../../components/experience/experience.component';
import { LocationMapComponent } from '../../../components/location-map/location-map.component';
import { BrandSliderComponent } from '../../../components/brand-slider/brand-slider.component';
import { FaqComponent } from '../../../components/faq/faq.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { RequisitosComponent } from '../../../components/requisitos/requisitos.component';

import { inject, OnInit } from '@angular/core';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <app-header></app-header>
    <main class="overflow-x-hidden">
      <app-hero></app-hero>
      <div class="relative z-40 -mt-24">
        <div class="px-6">
          <app-reservation-form-final [enableDropoffCity]="false" [initialStep]="true"></app-reservation-form-final>
        </div>
      </div>
      <div class="-mt-16 relative z-10">
        <app-vehicles3></app-vehicles3>
      </div>
      <div>
        <app-features></app-features>
      </div>
      <div>
        <app-requisitos></app-requisitos>
      </div>
      <div>
        <app-experience></app-experience>
      </div>
      <div>
        <app-location-map></app-location-map>
      </div>
      <app-brand-slider></app-brand-slider>
      <div class="mt-10">
        <app-faq></app-faq>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, HeroComponent, Vehicles3Component, ReservationFormFinalComponent, FeaturesComponent, ExperienceComponent, LocationMapComponent, BrandSliderComponent, FaqComponent, FooterComponent, RequisitosComponent],
})
export class HomeComponent implements OnInit {
  private bookingService = inject(BookingService);

  ngOnInit() {
    // Reset booking data when entering home page
    this.bookingService.resetReservation();
  }
}
