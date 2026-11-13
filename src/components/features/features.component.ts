import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { MotionDirective } from '../../app/core/motion/motion.directive';

interface Feature {
    icon: string;
    title: string;
    desc: string;
}

@Component({
    selector: 'app-features',
    standalone: true,
    imports: [CommonModule, MotionDirective],
    templateUrl: './features.component.html'
})
export class FeaturesComponent {
    lang = inject(LanguageService);
    features = computed<Feature[]>(() => [
        {
            icon: 'plane',
            title: this.lang.t('features.item1.title'),
            desc: this.lang.t('features.item1.desc')
        },
        {
            icon: 'sparkles',
            title: this.lang.t('features.item2.title'),
            desc: this.lang.t('features.item2.desc')
        },
        {
            icon: 'globe',
            title: this.lang.t('features.item3.title'),
            desc: this.lang.t('features.item3.desc')
        },
        {
            icon: 'briefcase',
            title: this.lang.t('features.item4.title'),
            desc: this.lang.t('features.item4.desc')
        }
    ]);
}
