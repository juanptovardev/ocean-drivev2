import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-hero4',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero4.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero4Component {
    lang = inject(LanguageService);
}
