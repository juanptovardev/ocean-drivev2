import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { Vehicles4Component } from '../../../components/vehicles4/vehicles4.component';
import { ReservationStepsComponent } from '../../../components/reservation-steps/reservation-steps.component';
import { ContactPromoComponent } from '../../../components/contact-promo/contact-promo.component';
import { Hero4Component } from '../../../components/hero4/hero4.component';
import { RequisitosComponent } from '../../../components/requisitos/requisitos.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  template: `
    <app-header></app-header>
    <main class="overflow-x-hidden">
      <app-hero4></app-hero4>
      <app-vehicles4></app-vehicles4>
      <app-reservation-steps></app-reservation-steps>
      <app-requisitos></app-requisitos>
      <app-contact-promo></app-contact-promo>
    </main>
    <app-footer waveBgClass="bg-[#050914]"></app-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, Vehicles4Component, ContactPromoComponent, ReservationStepsComponent, Hero4Component, RequisitosComponent],
})
export class ServiciosComponent { }
