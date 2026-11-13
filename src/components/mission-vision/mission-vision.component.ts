import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { MotionDirective } from '../../app/core/motion/motion.directive';

@Component({
    selector: 'app-mission-vision',
    standalone: true,
    imports: [CommonModule, MotionDirective],
    templateUrl: './mission-vision.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
    /* Animación de Brillo Borde (Border Shimmer) */
    @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    .animate-shimmer {
        animation: shimmer 4s linear infinite;
    }

    /* Animación de Brillo Rápido (Hover Shine) */
    @keyframes shine {
        100% { transform: translateX(100%); }
    }
    .group:hover .group-hover\\:animate-shine {
        animation: shine 1.5s infinite;
    }

    /* Entrada Suave (Fade Up) */
    @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
        animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Textura de Ruido */
    .noise-bg {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    /* Animación de la Comilla */
    @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
    }
    .animate-scale-in {
        animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class MissionVisionComponent {
    lang = inject(LanguageService);
}
