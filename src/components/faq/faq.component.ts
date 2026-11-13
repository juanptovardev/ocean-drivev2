import { Component, ChangeDetectionStrategy, signal, Inject, PLATFORM_ID, AfterViewInit, ViewChildren, QueryList, ElementRef, Input, inject, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { MotionDirective } from '../../app/core/motion/motion.directive';
import { MotionService } from '../../app/core/motion/motion.service';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, MotionDirective],
  providers: []
})
export class FaqComponent implements AfterViewInit {
  @ViewChildren('faqItem') faqItems!: QueryList<ElementRef>;
  openIndex = signal<number | null>(null);
  isClient = signal(false);
  visibleCount = signal(3); // Default to showing only 3 on mobile initially
  windowWidth: number = 0;
  private readonly motion = inject(MotionService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    console.log('FaqComponent (Reviews) Initialized');
    this.isClient.set(isPlatformBrowser(this.platformId));
    if (this.isClient()) {
      this.windowWidth = window.innerWidth;
      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth;
      });
    }
  }

  lang = inject(LanguageService);

  faqTitle = computed(() => this.lang.t('faq.title'));
  faqSubtitle = computed(() => this.lang.t('faq.subtitle'));
  faqDescription = computed(() => this.lang.t('faq.description'));
  faqCtaText = computed(() => this.lang.t('faq.ctaText'));
  @Input() ctaLink: string = 'https://wa.me/573012358181';

  // Default Original FAQs
  defaultFaqs = computed<FaqItem[]>(() => [
    {
      question: this.lang.t('faq.home.q1'),
      answer: this.lang.t('faq.home.a1')
    },
    {
      question: this.lang.t('faq.home.q2'),
      answer: this.lang.t('faq.home.a2')
    },
    {
      question: this.lang.t('faq.home.q3'),
      answer: this.lang.t('faq.home.a3')
    },
    {
      question: this.lang.t('faq.home.q4'),
      answer: this.lang.t('faq.home.a4')
    },
    {
      question: this.lang.t('faq.home.q5'),
      answer: this.lang.t('faq.home.a5')
    },
    {
      question: this.lang.t('faq.home.q6'),
      answer: this.lang.t('faq.home.a6')
    }
  ]);

  _items = signal<FaqItem[]>([]);

  @Input('items') set items(value: FaqItem[]) {
    this._items.set(value || []);
  }

  // Final FAQs to display (User input OR Default Translated)
  faqs = computed(() => {
    const inputItems = this._items();
    return (inputItems && inputItems.length > 0) ? inputItems : this.defaultFaqs();
  });

  ngAfterViewInit() {
    if (!this.isClient()) {
      return;
    }

    const trigger = document.querySelector('#faq-scroll-trigger');
    if (trigger) {
      // Reveal three more answers each time the sentinel scrolls back into view.
      this.motion.onEnter(
        trigger as HTMLElement,
        () => {
          this.visibleCount.update(c => Math.min(c + 3, this.faqs().length));
        },
        { once: false }
      );
    }
  }


  toggle(index: number) {
    this.openIndex.update(current => current === index ? null : index);
  }

  onMouseEnter(index: number) {
    this.openIndex.set(index);
  }

  onMouseLeave() {
    this.openIndex.set(null);
  }

  isOpen(index: number): boolean {
    return this.openIndex() === index;
  }
}