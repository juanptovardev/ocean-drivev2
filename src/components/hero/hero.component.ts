import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { LanguageService } from '../../services/language.service';
import { MotionService } from '../../app/core/motion/motion.service';

gsap.registerPlugin(ScrollTrigger, SplitText);

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroSection') heroSection!: ElementRef<HTMLElement>;
  @ViewChild('heroBg') heroBg!: ElementRef<HTMLElement>;
  @ViewChild('heroEyebrow') heroEyebrow!: ElementRef<HTMLElement>;
  @ViewChild('heroLine1') heroLine1!: ElementRef<HTMLElement>;
  @ViewChild('heroLine2') heroLine2!: ElementRef<HTMLElement>;
  @ViewChild('heroSub') heroSub!: ElementRef<HTMLElement>;
  @ViewChild('heroCtas') heroCtas!: ElementRef<HTMLElement>;
  @ViewChild('heroCue') heroCue!: ElementRef<HTMLElement>;

  lang = inject(LanguageService);
  private readonly motion = inject(MotionService);
  private ctx: gsap.Context | null = null;
  private splits: SplitText[] = [];

  ngAfterViewInit(): void {
    const section = this.heroSection.nativeElement;
    const reduced = this.motion.reduced();

    this.ctx = gsap.context(() => {
      if (reduced) {
        return; // estado natural visible, sin animaciones
      }

      const split1 = new SplitText(this.heroLine1.nativeElement, { type: 'chars' });
      const split2 = new SplitText(this.heroLine2.nativeElement, { type: 'chars' });
      this.splits.push(split1, split2);

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from(this.heroBg.nativeElement, { scale: 1.15, duration: 1.8, ease: 'power2.out' }, 0)
        .from(split1.chars, { yPercent: 130, opacity: 0, stagger: 0.035, duration: 0.9 }, 0.2)
        .from(split2.chars, { yPercent: 130, opacity: 0, stagger: 0.035, duration: 0.9 }, 0.35)
        .from([this.heroEyebrow.nativeElement, this.heroSub.nativeElement], { y: 24, opacity: 0, stagger: 0.12, duration: 0.7 }, 0.55)
        .from(this.heroCtas.nativeElement.children, { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, 0.75)
        .from(this.heroCue.nativeElement, { opacity: 0, y: 10, duration: 0.6 }, 1.0);

      // Parallax del fondo al hacer scroll (solo transform, sin layout)
      gsap.to(this.heroBg.nativeElement, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
      });

      // Cue de scroll pulsante
      gsap.to(this.heroCue.nativeElement, { y: 8, yoyo: true, repeat: -1, duration: 0.9, ease: 'power1.inOut' });
    }, section);
  }

  ngOnDestroy(): void {
    this.splits.forEach(s => s.revert());
    this.splits = [];
    this.ctx?.revert();
    this.ctx = null;
  }
}
