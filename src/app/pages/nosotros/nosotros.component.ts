import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { Hero2Component } from '../../../components/hero2/hero2.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { MissionVisionComponent } from '../../../components/mission-vision/mission-vision.component';
import { FortalezasComponent } from '../../../components/fortalezas/fortalezas.component';
import { ComentariosComponent } from '../../../components/comentarios/comentarios.component';



@Component({
  selector: 'app-nosotros',
  standalone: true,
  template: `
    <app-header></app-header>
    <main class="overflow-x-hidden">
      <app-hero2></app-hero2>
      <app-mission-vision></app-mission-vision>
      <app-fortalezas></app-fortalezas>
      <app-comentarios></app-comentarios>
    </main>
    <app-footer></app-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, Hero2Component, FooterComponent, MissionVisionComponent, FortalezasComponent, ComentariosComponent],
})
export class NosotrosComponent { }
