import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-reservation-steps',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './reservation-steps.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationStepsComponent {
    lang = inject(LanguageService);
}
