import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { REVIEWS_ES, REVIEWS_EN } from '../../data/reviews.data';
import { LanguageService } from '../../services/language.service';

@Component({
  // ... selector and template remain same ...
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-white pt-14 pb-28 px-6 font-sans antialiased relative overflow-hidden">
      <!-- Decorative Background Element -->
      <div class="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none" 
           style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 32px 32px;"></div>

      <div class="max-w-7xl mx-auto relative z-10">
        
        <!-- Header -->
        <div class="text-center mb-10 max-w-3xl mx-auto animate-fade-in-up">
          <div class="inline-flex items-center gap-2 mb-3">
             <div class="w-8 h-[1px] bg-[#FF6F61]"></div>
             <span class="text-[#FF6F61] font-bold tracking-[0.2em] text-xs uppercase">{{ lang.t('comments.label') }}</span>
             <div class="w-8 h-[1px] bg-[#FF6F61]"></div>
          </div>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
            {{ lang.t('comments.title1') }} <span class="italic text-gray-400 font-light">{{ lang.t('comments.title2') }}</span>
          </h2>
          <p class="text-gray-500 text-base md:text-lg leading-relaxed font-light">
            {{ lang.t('comments.subtitle') }}
          </p>
        </div>
        
        <!-- Grid Container -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          @for (comment of comments(); track comment.author) {
            <!-- OPINIÓN -->
            <div class="group bg-gray-50 rounded-2xl p-6 hover:bg-[#002B5B] transition-all duration-500 relative overflow-hidden cursor-default h-full flex flex-col hover:-translate-y-2 hover:shadow-2xl border border-gray-100 hover:border-[#002B5B]">
               <!-- Comilla gigante de fondo -->
               <div class="absolute -top-2 -right-2 text-[10rem] font-serif text-gray-200 opacity-40 group-hover:text-white group-hover:opacity-10 transition-all duration-500 select-none pointer-events-none leading-none">”</div>

               <div class="relative z-10 flex flex-col h-full">
                  <!-- Avatar & Rating -->
                  <div class="flex justify-between items-start mb-6">
                    <img [src]="comment.avatar" class="w-12 h-12 rounded-full object-cover ring-4 ring-white group-hover:ring-white/20 transition-all shadow-md" [alt]="'Foto ' + comment.author">
                    <div class="flex gap-0.5 text-[#FF6F61]">
                        <svg *ngFor="let star of [1,2,3,4,5]" class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    </div>
                  </div>

                  <!-- Texto -->
                  <p class="text-gray-700 font-serif text-lg leading-relaxed mb-6 group-hover:text-white/90 transition-colors duration-300 italic flex-grow">
                    "{{ comment.text }}"
                  </p>

                  <!-- Autor -->
                  <div class="mt-auto border-t border-gray-200 group-hover:border-white/20 pt-4 transition-colors duration-500">
                    <p class="text-sm font-bold uppercase tracking-widest text-gray-900 group-hover:text-white transition-colors">
                      {{ comment.author }}
                    </p>
                    <p class="text-xs text-[#FF6F61] mt-1 font-medium tracking-wide group-hover:text-[#FF6F61] transition-colors">{{ calculateTimeAgo(comment.role) }}</p>
                  </div>
               </div>
            </div>
          }

        </div>
      </div>
    </section>
  `,
  styles: [`
    .font-serif {
      font-family: 'Playfair Display', serif;
    }
    .font-sans {
      font-family: 'Inter', sans-serif;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
    }
  `]
})
export class ComentariosComponent {
  lang = inject(LanguageService);

  reviews = computed(() => {
    return this.lang.currentLang() === 'ES' ? REVIEWS_ES : REVIEWS_EN;
  });

  comments = computed(() => {
    return this.reviews().map(review => ({
      avatar: this.getAvatarUrl(review.reviewerName),
      text: review.reviewText,
      author: review.reviewerName,
      role: review.date
    }));
  });

  getAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  }

  calculateTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return this.lang.t('comments.justNow');
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${this.lang.t('comments.ago')} ${minutes} ${minutes === 1 ? this.lang.t('comments.minute') : this.lang.t('comments.minutes')}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${this.lang.t('comments.ago')} ${hours} ${hours === 1 ? this.lang.t('comments.hour') : this.lang.t('comments.hours')}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${this.lang.t('comments.ago')} ${days} ${days === 1 ? this.lang.t('comments.day') : this.lang.t('comments.days')}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${this.lang.t('comments.ago')} ${months} ${months === 1 ? this.lang.t('comments.month') : this.lang.t('comments.months')}`;
    const years = Math.floor(months / 12);
    return `${this.lang.t('comments.ago')} ${years} ${years === 1 ? this.lang.t('comments.year') : this.lang.t('comments.years')}`;
  }
}
