import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-hero2',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero2.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero2Component {
    lang = inject(LanguageService);
}
