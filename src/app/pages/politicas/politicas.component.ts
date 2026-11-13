import { Component, ChangeDetectionStrategy, signal, AfterViewInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { Faq2Component } from '../../../components/faq2/faq2.component';
import { LanguageService } from '../../../services/language.service';
import { MotionService } from '../../core/motion/motion.service';

interface Policy {
  id: string;
  title: string;
  lastUpdated: string;
  content: string[];
}

interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-politicas',
  standalone: true,
  template: `
    <app-header variant="white"></app-header>
    
    <!-- Background Decor -->
    <div class="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none -z-10"></div>
    <div class="fixed top-20 right-[-100px] w-[300px] h-[300px] bg-[#FF6F61]/5 rounded-full blur-3xl -z-10"></div>
    <div class="fixed bottom-20 left-[-100px] w-[400px] h-[400px] bg-[#002B5B]/5 rounded-full blur-3xl -z-10"></div>

    <main class="min-h-screen pt-32 pb-20 overflow-x-hidden">
      <div class="flex items-start max-w-7xl mx-auto relative px-4 md:px-8">
        
        <!-- Sidebar Navigation (Desktop) -->
        <aside class="hidden lg:block w-64 sticky top-32 h-[calc(100vh-10rem)] overflow-y-auto pr-4 no-scrollbar">
          <div class="mb-8">
            <div class="w-10 h-10 bg-[#002B5B] rounded-xl flex items-center justify-center text-white font-bold italic mb-3">
              <span class="text-lg font-display">OD</span>
            </div>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ lang.t('pol.navigation') }}</span>
          </div>
          
          <ul class="space-y-3 border-l-2 border-gray-200">
            @for (policy of policies(); track policy.id) {
              <li 
                class="pl-4 -ml-[2px] border-l-2 transition-all duration-300"
                [class.border-[#FF6F61]]="activeSection() === policy.id"
                [class.border-transparent]="activeSection() !== policy.id">
                <button 
                  (click)="scrollToSection(policy.id)"
                  class="text-left text-sm font-medium block py-2 transition-colors duration-300 hover:text-[#002B5B]"
                  [class.text-[#002B5B]]="activeSection() === policy.id"
                  [class.text-gray-500]="activeSection() !== policy.id">
                  {{ policy.title }}
                </button>
              </li>
            }
            <li 
              class="pl-4 -ml-[2px] border-l-2 transition-all duration-300"
              [class.border-[#FF6F61]]="activeSection() === 'faq'"
              [class.border-transparent]="activeSection() !== 'faq'">
              <button 
                (click)="scrollToSection('faq')"
                class="text-left text-sm font-medium block py-2 transition-colors duration-300 hover:text-[#002B5B]"
                [class.text-[#002B5B]]="activeSection() === 'faq'"
                [class.text-gray-500]="activeSection() !== 'faq'">
                {{ lang.t('pol.faq') }}
              </button>
            </li>
            <li 
              class="pl-4 -ml-[2px] border-l-2 transition-all duration-300"
              [class.border-[#FF6F61]]="activeSection() === 'contrato'"
              [class.border-transparent]="activeSection() !== 'contrato'">
              <button 
                (click)="scrollToSection('contrato')"
                class="text-left text-sm font-medium block py-2 transition-colors duration-300 hover:text-[#002B5B]"
                [class.text-[#002B5B]]="activeSection() === 'contrato'"
                [class.text-gray-500]="activeSection() !== 'contrato'">
                {{ lang.t('pol.contract') }}
              </button>
            </li>
          </ul>

          <div class="mt-10 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 text-xs text-gray-400">
            <p class="font-medium text-gray-500 mb-1">{{ lang.t('pol.needHelp') }}</p>
            <p>{{ lang.t('pol.contactAnytime') }}</p>
            <button (click)="copyToClipboard('+573012358181', 'phone')" class="text-[#002B5B] hover:text-[#FF6F61] transition-colors mt-2 inline-block font-medium cursor-pointer text-left">
              +57 301 235 8181
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 max-w-3xl lg:ml-16 mx-auto">
          <!-- Header -->
          <div class="text-center mb-16 animate-fade-up">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-[#002B5B]/5 rounded-full mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#002B5B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span class="text-sm font-medium text-[#002B5B]">{{ lang.t('pol.legalDocs') }}</span>
            </div>
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-display text-[#002B5B] mb-4">
              {{ lang.t('pol.title') }}
            </h1>
            <p class="text-lg md:text-xl text-gray-400 font-light max-w-lg mx-auto">
              {{ lang.t('pol.subtitle') }}
            </p>
          </div>

          <!-- Policy Sections -->
          @for (policy of policies(); track policy.id; let i = $index) {
            <section 
              [id]="policy.id" 
              class="mb-20 scroll-mt-36 group policy-section animate-fade-up"
              [style.animation-delay]="(i * 100) + 'ms'">
              
              <div class="flex items-baseline justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 class="text-3xl md:text-4xl font-display text-[#002B5B] group-hover:text-[#FF6F61] transition-colors duration-300">
                  {{ policy.title }}
                </h2>
                <button 
                  (click)="downloadPolicy(policy)"
                  class="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm text-gray-400 hover:text-[#002B5B] flex items-center gap-2 cursor-pointer">
                  <span class="hidden sm:inline">{{ lang.t('pol.download') }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>

              <article class="space-y-4 text-gray-600 leading-relaxed text-base md:text-lg">
                @for (paragraph of policy.content; track $index) {
                  <p class="policy-paragraph">{{ paragraph }}</p>
                }
              </article>

              <div class="mt-6 flex flex-wrap gap-2">
                <span class="px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-500 font-medium">
                  📅 {{ lang.t('pol.updated') }}: {{ policy.lastUpdated }}
                </span>
                <span class="px-3 py-1.5 bg-[#002B5B]/5 rounded-lg text-xs text-[#002B5B] font-medium">
                  ✓ {{ lang.t('pol.active') }}
                </span>
              </div>
            </section>
          }

          <!-- FAQ Section -->
          <div id="faq" class="scroll-mt-36 policy-section">
              <app-faq2></app-faq2>
          </div>

          <!-- Contrato Section -->
          <section id="contrato" class="mb-20 scroll-mt-36 policy-section animate-fade-up">
             <div class="flex items-baseline justify-between mb-6 border-b border-gray-100 pb-4">
               <h2 class="text-3xl md:text-4xl font-display text-[#002B5B]">{{ lang.t('pol.contract') }}</h2>
             </div>
            <div class="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-[#002B5B]/5 p-8 md:p-10">
              <div class="absolute top-0 right-0 w-40 h-40 bg-[#FF6F61]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div class="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div class="w-20 h-20 rounded-2xl bg-[#002B5B]/10 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#002B5B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div class="flex-1 text-center md:text-left">
                  <h3 class="text-xl font-bold text-[#002B5B] mb-2">{{ lang.t('pol.contractTitle') }}</h3>
                  <p class="text-gray-500 text-sm leading-relaxed mb-4">{{ lang.t('pol.contractDesc') }}</p>
                  <div class="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span class="px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-500 font-medium">📄 PDF</span>
                    <span class="px-3 py-1.5 bg-[#002B5B]/5 rounded-lg text-xs text-[#002B5B] font-medium">✓ {{ lang.t('pol.officialDoc') }}</span>
                  </div>
                </div>
                <a routerLink="/contrato"
                   class="inline-flex items-center gap-2 px-6 py-3.5 bg-[#002B5B] text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:bg-[#003d7a] hover:scale-105 hover:shadow-xl hover:shadow-[#002B5B]/20 active:scale-95 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ lang.t('pol.downloadContract') }}
                </a>
              </div>
            </div>
          </section>

          <!-- Contact CTA -->
          <section class="mt-16 mb-12 p-8 md:p-12 bg-gradient-to-br from-[#002B5B] to-[#001a3a] rounded-3xl text-white text-center relative overflow-hidden">
            <div class="absolute inset-0 opacity-10">
              <div class="absolute top-0 right-0 w-64 h-64 bg-[#FF6F61] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
              <div class="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </div>
            <div class="relative z-10">
              <h3 class="text-2xl md:text-3xl font-display mb-4">{{ lang.t('pol.moreQuestions') }}</h3>
              <p class="text-white/70 mb-6 max-w-md mx-auto">
                {{ lang.t('pol.moreQuestionsDesc') }}
              </p>
              <a href="https://wa.me/573012358181" target="_blank" class="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6F61] hover:bg-[#ff5a4a] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FF6F61]/30">
                <span>{{ lang.t('pol.contactBtn') }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </section>

        </div>
      </div>
    </main>

    <!-- Toast Notification -->
    @if(showToast()) {
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-toast-in">
            <div class="bg-gray-900/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <div>
                    <p class="font-semibold text-sm">{{ toastMessage() }}</p>
                    <p class="text-xs text-gray-400">{{ lang.t('general.copiedClipboard') }}</p>
                </div>
            </div>
        </div>
    }

    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #FBFBFD;
    }

    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .font-display {
      font-family: 'Bebas Neue', sans-serif;
      letter-spacing: 0.02em;
    }

    .animate-fade-up {
      animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .policy-paragraph {
      position: relative;
      padding-left: 0;
      transition: all 0.3s ease;
      text-align: justify;
    }

    .policy-section:hover .policy-paragraph {
      color: #374151;
    }

    /* Mobile nav indicator */
    @media (max-width: 1023px) {
      aside {
        display: none !important;
      }
    }

    @keyframes toastIn {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
        100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
    }
    .animate-toast-in {
        animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, Faq2Component],
})
export class PoliticasComponent implements AfterViewInit, OnDestroy {
  activeSection = signal('privacy');
  private motion = inject(MotionService);
  private spyHandle: { kill(): void } | null = null;
  lang = inject(LanguageService);

  policies = computed<Policy[]>(() => {
    // Current lang dependency is handled by this.lang.t calls if simple, 
    // but to be reactive we need to access signal.
    const l = this.lang.currentLang(); // trigger dependency

    return [
      {
        id: 'privacy',
        title: this.lang.t('pol.privacy.title'),
        lastUpdated: this.lang.t('pol.privacy.date'),
        content: [
          this.lang.t('pol.privacy.p1'),
          this.lang.t('pol.privacy.p2'),
          this.lang.t('pol.privacy.p3'),
          this.lang.t('pol.privacy.p4')
        ]
      },
      {
        id: 'terms',
        title: this.lang.t('pol.terms.title'),
        lastUpdated: this.lang.t('pol.terms.date'),
        content: [
          this.lang.t('pol.terms.p1'),
          this.lang.t('pol.terms.p2'),
          this.lang.t('pol.terms.p3'),
          this.lang.t('pol.terms.p4'),
          this.lang.t('pol.terms.p5')
        ]
      },
      {
        id: 'disclaimer',
        title: this.lang.t('pol.disclaimer.title'),
        lastUpdated: this.lang.t('pol.disclaimer.date'),
        content: [
          this.lang.t('pol.disclaimer.p1'),
          this.lang.t('pol.disclaimer.p2'),
          this.lang.t('pol.disclaimer.p3'),
          this.lang.t('pol.disclaimer.p4'),
          this.lang.t('pol.disclaimer.p5')
        ]
      },
      {
        id: 'cancellation',
        title: this.lang.t('pol.cancellation.title'),
        lastUpdated: this.lang.t('pol.cancellation.date'),
        content: [
          this.lang.t('pol.cancellation.p1'),
          this.lang.t('pol.cancellation.p2')
        ]
      }
    ];
  });

  faqs: any[] = []; // Removed legacy FAQs as we are using Faq2Component

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.spyHandle?.kill();
    this.spyHandle = null;
  }

  private setupIntersectionObserver(): void {
    // The sections are rendered by the template, so wait a tick before
    // measuring them.
    setTimeout(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('.policy-section')
      ).filter((element) => element.id);

      this.spyHandle = this.motion.spy(sections, (element) => {
        this.activeSection.set(element.id);
      });
    }, 100);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 144; // Account for fixed header
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  showToast = signal(false);
  toastMessage = signal('');

  copyToClipboard(text: string, type: 'email' | 'phone') {
    navigator.clipboard.writeText(text).then(() => {
      this.toastMessage.set(type === 'email'
        ? this.lang.t('footer.emailCopied')
        : this.lang.t('footer.phoneCopied'));
      this.showToast.set(true);

      setTimeout(() => {
        this.showToast.set(false);
      }, 2500);
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
    });
  }

  downloadPolicy(policy: Policy): void {
    const content = policy.content.join('\n\n');
    const fullContent = `${policy.title}\n${'='.repeat(policy.title.length)}\n\nÚltima actualización: ${policy.lastUpdated}\n\n${content}\n\n© 2025 Ocean Drive Car Rental. Todos los derechos reservados.`;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
