import { Component, ChangeDetectionStrategy, signal, Inject, PLATFORM_ID, AfterViewInit, ViewChildren, QueryList, ElementRef, Input, inject, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../services/language.service';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  providers: []
})
export class FaqComponent implements AfterViewInit {
  @ViewChildren('faqItem') faqItems!: QueryList<ElementRef>;
  openIndex = signal<number | null>(null);
  isClient = signal(false);
  visibleCount = signal(3); // Default to showing only 3 on mobile initially
  windowWidth: number = 0;

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
    if (this.isClient()) {
      this.initObserver();
    }
  }

  private initObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // When the last visible item comes into view, show more!
          // But 'visibleCount' controls rendering.
          // If we render all but hide them with CSS, we can reveal them.
          // Let's implement valid "infinite scroll" style load locally.
          if (this.visibleCount() < this.faqs().length) {
            // Simple logic: if user scrolls near bottom, reveal more.
            this.visibleCount.update(c => Math.min(c + 3, this.faqs().length));
          }
        }
      });
    }, { threshold: 0.1 });

    // Observe a sentinel element (we will add one in HTML)
    // Or observe the last currently visible item?
    // Let's rely on a 'load-trigger' element in HTML.
    const trigger = document.querySelector('#faq-scroll-trigger');
    if (trigger) {
      observer.observe(trigger);
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