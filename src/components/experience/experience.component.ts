import { Component, ChangeDetectionStrategy, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, inject, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';

interface Stat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  currentValue: number;
}

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ExperienceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('statsSection') statsSection!: ElementRef;
  private observer: IntersectionObserver | null = null;
  private isBrowser: boolean;
  private router = inject(Router);
  lang = inject(LanguageService);

  stats = signal<Stat[]>([
    { id: 'clients', label: '', value: 215, suffix: '', currentValue: 0 },
    { id: 'cars', label: '', value: 120, suffix: '', currentValue: 0 },
    { id: 'types', label: '', value: 10, suffix: '', currentValue: 0 },
    { id: 'brands', label: '', value: 5, suffix: '', currentValue: 0 },
  ]);

  translatedStats = computed(() => {
    const labels = [
      this.lang.t('exp.stat1'),
      this.lang.t('exp.stat2'),
      this.lang.t('exp.stat3'),
      this.lang.t('exp.stat4'),
    ];
    return this.stats().map((s, i) => ({ ...s, label: labels[i] }));
  });

  brands = [
    { name: 'Mercedes-Benz', opacity: 'opacity-60' },
    { name: 'Audi', opacity: 'opacity-60' },
    { name: 'Tesla', opacity: 'opacity-60' },
    { name: 'BMW', opacity: 'opacity-60' },
    { name: 'Porsche', opacity: 'opacity-60' },
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  goToPaso1() {
    this.router.navigate(['/paso-1']);
  }

  ngAfterViewInit() {
    if (this.isBrowser && this.statsSection) {
      this.initObserver();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private initObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateStats();
          this.observer?.disconnect(); // Only run once
        }
      });
    }, { threshold: 0.3 });

    this.observer.observe(this.statsSection.nativeElement);
  }

  private animateStats() {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    this.stats.update(currentStats => {
      // Initialize animation
      const timers: any[] = [];

      currentStats.forEach((stat, index) => {
        let step = 0;
        const increment = stat.value / steps;

        const timer = setInterval(() => {
          step++;
          this.stats.update(vals => {
            const newVals = [...vals];
            if (step >= steps) {
              newVals[index].currentValue = stat.value;
              clearInterval(timer);
            } else {
              newVals[index].currentValue = Math.floor(increment * step);
            }
            return newVals;
          });
        }, interval);
      });
      return currentStats;
    });
  }
}
