import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-hero6',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero6.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero6Component {
}
