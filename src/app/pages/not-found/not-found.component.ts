import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div class="text-center max-w-2xl mx-auto">
        <!-- Animated 404 -->
        <div class="relative mb-8">
          <h1 class="text-[12rem] md:text-[16rem] font-black text-[var(--brand-900)] leading-none select-none animate-pulse">
            404
          </h1>
          <div class="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500/30 via-teal-400/30 to-emerald-500/30 -z-10"></div>
        </div>

        <!-- Message -->
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          {{ lang.t('general.notFound.title') }}
        </h2>
        <p class="text-lg text-gray-400 mb-10 max-w-md mx-auto">
          {{ lang.t('general.notFound.desc') }}
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/" 
             class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-full overflow-hidden shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105">
            <span class="relative z-10 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {{ lang.t('general.notFound.backHome') }}
            </span>
          </a>
          
          <a routerLink="/servicios" 
             class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-300">
            {{ lang.t('general.notFound.viewServices') }}
          </a>
        </div>

        <!-- Decorative Elements -->
        <div class="mt-16 flex justify-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {
  lang = inject(LanguageService);
}
