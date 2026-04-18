import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

interface FaqCategory {
  id: string;
  name: string;
  items: { question: string; answer: string }[];
}

@Component({
  selector: 'app-faq2',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative py-12 px-4 bg-white font-sans">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-10">
          <h2 class="text-4xl md:text-5xl font-display text-[#002B5B] mb-6 text-center">
            {{ lang.t('faq.title') }}
        </h2>
        <p class="text-gray-500 text-center max-w-2xl mx-auto mb-16 text-lg">
            {{ lang.t('faq.description') }}
        </p>
        </div>

        <!-- Categories Grid (Masonry Layout) -->
        <div class="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            @for (category of categories(); track category.id) {
                <div class="break-inside-avoid bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div class="flex items-center gap-3 mb-4">
              <!-- Category Header -->
              <h3 class="text-lg font-bold text-[#002B5B]">
                {{ category.name }}
              </h3>
            </div>

              <!-- Questions List -->
              <ul class="space-y-3">
                @for (item of category.items; track item.question) {
                  <li>
                    <button 
                      (click)="openModal(item.question, item.answer)"
                      class="w-full text-left text-sm text-gray-600 hover:text-[#FF6F61] transition-colors focus:outline-none flex items-start gap-2 group/btn">
                      <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/btn:bg-[#FF6F61] transition-colors flex-shrink-0"></span>
                      <span class="leading-relaxed font-medium">{{ item.question }}</span>
                    </button>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>

      <!-- Premium Modal -->
      @if (selectedItem()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>
          
          <!-- Modal Content -->
          <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 animate-modal-in overflow-hidden">
            <!-- Decorative accent -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#002B5B] to-[#FF6F61]"></div>
            
            <button (click)="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-[#FF6F61] transition-colors focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 class="text-xl md:text-2xl font-bold text-[#002B5B] mb-4 pr-6 leading-tight">
              {{ selectedItem()?.question }}
            </h3>
            
            <div class="text-gray-600 leading-relaxed text-base faq-content overflow-y-auto max-h-[60vh] custom-scrollbar" [innerHTML]="selectedItem()?.answer">
            </div>

            <!-- Button removed as requested -->
          </div>
        </div>
      }
    </section>
    `,
  styles: [`
    :host {
      display: block;
    }
    .animate-modal-in {
      animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    ::ng-deep .faq-content ul {
      list-style-type: disc;
      padding-left: 1.5rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
    ::ng-deep .faq-content li {
        margin-bottom: 0.25rem;
    }
    ::ng-deep .faq-content strong {
        color: #002B5B;
        font-weight: 700;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #999;
    }
  `]
})
export class Faq2Component {
  selectedItem = signal<{ question: string, answer: string } | null>(null);
  lang = inject(LanguageService);

  categories = computed<FaqCategory[]>(() => {
    const l = this.lang.currentLang(); // trigger dependency

    return [
      {
        id: 'fuel',
        name: this.lang.t('faq.fuel.name'),
        items: [
          {
            question: this.lang.t('faq.fuel.q1'),
            answer: this.lang.t('faq.fuel.a1')
          },
          {
            question: this.lang.t('faq.fuel.q2'),
            answer: this.lang.t('faq.fuel.a2')
          }
        ]
      },
      {
        id: 'driver',
        name: this.lang.t('faq.driver.name'),
        items: [
          {
            question: this.lang.t('faq.driver.q1'),
            answer: this.lang.t('faq.driver.a1')
          }
        ]
      },
      {
        id: 'fleet',
        name: this.lang.t('faq.fleet.name'),
        items: [
          {
            question: this.lang.t('faq.fleet.q1'),
            answer: this.lang.t('faq.fleet.a1')
          },
          {
            question: this.lang.t('faq.fleet.q2'),
            answer: this.lang.t('faq.fleet.a2')
          },
          {
            question: this.lang.t('faq.fleet.q3'),
            answer: this.lang.t('faq.fleet.a3')
          }
        ]
      },
      {
        id: 'booking',
        name: this.lang.t('faq.booking.name'),
        items: [
          {
            question: this.lang.t('faq.booking.q1'),
            answer: this.lang.t('faq.booking.a1')
          },
          {
            question: this.lang.t('faq.booking.q2'),
            answer: this.lang.t('faq.booking.a2')
          },
          {
            question: this.lang.t('faq.booking.q3'),
            answer: this.lang.t('faq.booking.a3')
          },
          {
            question: this.lang.t('faq.booking.q4'),
            answer: this.lang.t('faq.booking.a4')
          },
          {
            question: this.lang.t('faq.booking.q5'),
            answer: this.lang.t('faq.booking.a5')
          },
          {
            question: this.lang.t('faq.booking.q6'),
            answer: this.lang.t('faq.booking.a6')
          },
          {
            question: this.lang.t('faq.booking.q7'),
            answer: this.lang.t('faq.booking.a7')
          }
        ]
      },
      {
        id: 'fines',
        name: this.lang.t('faq.fines.name'),
        items: [
          {
            question: this.lang.t('faq.fines.q1'),
            answer: this.lang.t('faq.fines.a1')
          },
          {
            question: this.lang.t('faq.fines.q2'),
            answer: this.lang.t('faq.fines.a2')
          },
          {
            question: this.lang.t('faq.fines.q3'),
            answer: this.lang.t('faq.fines.a3')
          }
        ]
      },
      {
        id: 'picoplaca',
        name: this.lang.t('faq.picoplaca.name'),
        items: [
          {
            question: this.lang.t('faq.picoplaca.q1'),
            answer: this.lang.t('faq.picoplaca.a1')
          }
        ]
      },
      {
        id: 'accidents',
        name: this.lang.t('faq.accidents.name'),
        items: [
          {
            question: this.lang.t('faq.accidents.q1'),
            answer: this.lang.t('faq.accidents.a1')
          },
          {
            question: this.lang.t('faq.accidents.q2'),
            answer: this.lang.t('faq.accidents.a2')
          }
        ]
      },
      {
        id: 'requests',
        name: this.lang.t('faq.requests.name'),
        items: [
          {
            question: this.lang.t('faq.requests.q1'),
            answer: this.lang.t('faq.requests.a1')
          },
          {
            question: this.lang.t('faq.requests.q2'),
            answer: this.lang.t('faq.requests.a2')
          }
        ]
      },
      {
        id: 'requirements',
        name: this.lang.t('faq.requirements.name'),
        items: [
          {
            question: this.lang.t('faq.requirements.q1'),
            answer: this.lang.t('faq.requirements.a1')
          },
          {
            question: this.lang.t('faq.requirements.q2'),
            answer: this.lang.t('faq.requirements.a2')
          },
          {
            question: this.lang.t('faq.requirements.q3'),
            answer: this.lang.t('faq.requirements.a3')
          },
          {
            question: this.lang.t('faq.requirements.q4'),
            answer: this.lang.t('faq.requirements.a4')
          }
        ]
      }
    ];
  });

  openModal(question: string, answer: string) {
    this.selectedItem.set({ question, answer });
  }

  closeModal() {
    this.selectedItem.set(null);
  }
}
