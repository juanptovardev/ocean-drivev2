import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, input, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';

// Force rebuild
@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <footer #mainFooter class="relative w-full group font-sans" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
        <!-- Contenedor de las olas -->
        <div class="waves-container">
          <svg class="waves-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 120" preserveAspectRatio="none">
            <!-- Ola 1 (Más clara y brillante - Espuma) -->
            <path class="wave wave-1" d="M0,50 C640,20 1280,80 1920,50 S3200,20 3840,50 L3840,120 L0,120 Z" fill="rgba(220, 245, 255, 0.6)"></path>
            <!-- Ola 2 (Tono medio - Transición) -->
            <path class="wave wave-2" d="M0,60 C640,90 1280,30 1920,60 S3200,90 3840,60 L3840,120 L0,120 Z" fill="rgba(87, 166, 210, 0.5)"></path>
            <!-- Ola 3 -->
            <path class="wave wave-3" d="M0,70 C640,45 1280,95 1920,70 S3200,45 3840,70 L3840,120 L0,120 Z" fill="rgba(0, 43, 91, 0.5)"></path>
            <!-- Ola 4 (Fondo sólido, la más lenta) -->
            <path class="wave wave-4" d="M0,80 C640,60 1280,100 1920,80 S3200,60 3840,80 L3840,120 L0,120 Z" fill="var(--brand-900)"></path>
          </svg>
        </div>

        <div #spotlight 
             class="pointer-events-none absolute left-0 right-0 bottom-0 -top-[150px] z-30 transition-opacity duration-300 ease-out mix-blend-screen opacity-0">
        </div>

        <div class="bg-[var(--brand-900)] text-white pt-2 -mt-1 relative z-20">
            <div class="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay noise-bg"></div>

            <div class="container mx-auto px-6 relative z-10">
                <div class="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 animate-enter delay-100">
                    <a routerLink="/nosotros" class="flex items-center group">
                        <img src="assets/imgs/header/logo-white.webp" alt="Ocean Drive Logo"
                            class="h-14 md:h-18 w-auto transition-transform duration-500 group-hover:scale-105" />
                    </a>

                    <div class="text-center md:text-right">
                        <p class="text-white/80 text-sm">{{ lang.t('footer.callForInfo') }}</p>
                        <a href="tel:+573012358181" class="text-2xl font-bold text-[var(--glow)] hover:text-white transition-colors">+57 301 235 8181</a>
                    </div>
                </div>

                <hr class="border-white/10 my-4">

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-5 lg:gap-x-16 text-base">
                    <div class="lg:col-span-3 group animate-enter delay-200">
                        <h4 class="font-bold text-white mb-3 text-xl tracking-[0.15em]">{{ lang.t('footer.aboutUs') }}</h4>
                        <div class="flex items-center gap-1.5 mb-3">
                            <div class="w-8 h-1 bg-[var(--accent)] transition-all duration-300 group-hover:w-12"></div>
                            <div class="w-1.5 h-1 bg-[var(--accent)]"></div>
                            <div class="w-1.5 h-1 bg-[var(--accent)]"></div>
                        </div>
                        <p class="text-base text-white/80 leading-relaxed">
                        {{ lang.t('footer.aboutText') }}
                        </p>
                    </div>

                    <div class="lg:col-span-3 group animate-enter delay-300">
                        <h4 class="font-bold text-white mb-3 text-xl tracking-[0.15em]">{{ lang.t('footer.usefulLinks') }}</h4>
                        <div class="flex items-center gap-1.5 mb-3">
                            <div class="w-8 h-1 bg-[var(--accent)] transition-all duration-300 group-hover:w-12"></div>
                            <div class="w-1.5 h-1 bg-[var(--accent)]"></div>
                            <div class="w-1.5 h-1 bg-[var(--accent)]"></div>
                        </div>
                        <ul class="grid grid-cols-2 gap-x-2 gap-y-2 text-base text-white/80">
                            @for(link of usefulLinks(); track $index) {
                            <li><a href="{{ link.href }}" class="hover:text-white transition-colors whitespace-pre-line">{{ link.label }}</a></li>
                            }
                        </ul>
                    </div>

                    <div class="lg:col-span-3 group animate-enter delay-400">
                        <h4 class="font-bold text-white mb-3 text-xl tracking-[0.15em]">{{ lang.t('footer.contactUs') }}</h4>
                        <div class="flex items-center gap-1.5 mb-3">
                            <div class="w-8 h-1 bg-[var(--accent)] transition-all duration-300 group-hover:w-12"></div>
                            <div class="w-1.5 h-1 bg-[var(--accent)]"></div>
                            <div class="w-1.5 h-1 bg-[var(--accent)]"></div>
                        </div>
                        <ul class="space-y-2.5">
                            @for(item of contactItems(); track item.title) {
                            <li class="flex items-center gap-3">
                                <span class="text-[var(--glow)] shrink-0">
                                    @if(item.icon === 'phone') { 
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg> 
                                    }
                                    @if(item.icon === 'mail') { 
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25-2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0  01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.26 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg> 
                                    }
                                    @if(item.icon === 'location') { 
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg> 
                                    }
                                </span>
                                <div>
                                    <p class="text-base text-white/80">{{ item.title }}</p>
                                    @if(item.icon === 'phone') {
                                        <button (click)="copyToClipboard('+573012358181', 'phone')" 
                                                class="font-semibold text-white hover:text-[var(--glow)] transition-colors text-sm hover:underline cursor-pointer text-left">
                                            {{ item.value }}
                                        </button>
                                    } @else if(item.icon === 'mail') {
                                        <button (click)="copyToClipboard('reservas@oceandrivecarental.com', 'email')" 
                                                class="font-semibold text-white hover:text-[var(--glow)] transition-colors text-sm hover:underline cursor-pointer text-left">
                                            {{ item.value }}
                                        </button>
                                    } @else {
                                        <a [href]="item.href || '#'" [target]="item.href ? '_blank' : '_self'" 
                                           class="font-semibold text-white hover:text-gray-200 transition-colors text-sm hover:underline">
                                            {{ item.value }}
                                        </a>
                                    }
                                </div>
                            </li>
                            }
                        </ul>
                    </div>

                    <div class="lg:col-span-3 group animate-enter delay-500 flex flex-col justify-center h-full">
                        <form (ngSubmit)="onSubscribe()" #subForm="ngForm" class="flex flex-col gap-4 w-full">
                            <input [(ngModel)]="subName" name="name" type="text" placeholder="Nombre" class="bg-transparent border-b border-white/30 text-white w-full py-1.5 focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-white/60 text-sm">
                            <input [(ngModel)]="subPhone" name="phone" type="tel" placeholder="Número" class="bg-transparent border-b border-white/30 text-white w-full py-1.5 focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-white/60 text-sm">
                            <input [(ngModel)]="subEmail" name="email" required type="email" placeholder="Correo" class="bg-transparent border-b border-white/30 text-white w-full py-1.5 focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-white/60 text-sm">
                            
                            <button type="submit" [disabled]="isLoading()" class="w-full bg-[var(--accent)] text-white hover:bg-white hover:text-[var(--accent)] font-medium text-sm rounded-lg transition-all duration-300 ease-in-out flex items-center justify-between shadow-lg transform hover:-translate-y-0.5 active:scale-95 group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed">
                                <span class="px-4 py-3 transition-colors duration-300">
                                  @if(isLoading()) { {{ lang.t('footer.processing') }} } @else { {{ lang.t('footer.subscribe') }} }
                                </span>
                                <span class="bg-white text-[var(--accent)] p-3 h-full flex items-center border-l border-white/20 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </button>
                        </form>
                    </div>
                </div>

                <div class="border-t border-white/10 mt-5"></div>

                <div class="flex flex-col md:flex-row justify-between items-center gap-4 py-6">
                    <p class="text-white/80 text-sm order-2 md:order-1 text-center md:text-left">
                        &copy; {{ currentYear }} Ocean Drive. {{ lang.t('footer.rights') }}
                    </p>

                    <div class="flex flex-wrap justify-center md:justify-end items-center gap-2 order-1 md:order-2">
                        <a href="https://www.instagram.com/oceandrivecarental/" target="_blank" class="px-3 py-1.5 text-[10px] font-bold tracking-widest text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full hover:scale-105 transition-all shadow-sm shadow-pink-900/20">INSTAGRAM</a>
                        <a href="https://wa.me/573012358181" target="_blank" class="px-3 py-1.5 text-[10px] font-bold tracking-widest text-white bg-[var(--wa)] rounded-full hover:scale-105 transition-all shadow-sm shadow-green-900/20">WHATSAPP</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Modal (Premium UX) -->
        @if(showSuccessModal()) {
            <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[var(--brand-900)]/40 backdrop-blur-md animate-fade-in" (click)="closeSuccessModal()">
                <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative animate-scale-up border border-white/20" (click)="$event.stopPropagation()">
                    
                    <!-- Close Button -->
                    <button aria-label="Cerrar" (click)="closeSuccessModal()" class="absolute top-4 right-4 text-gray-400 hover:text-[var(--accent)] transition-colors p-2 hover:bg-gray-50 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>

                    <div class="p-8 flex flex-col items-center text-center">
                        <!-- Success Animation Icon -->
                        <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce-soft relative">
                            <div class="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                            <svg class="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h3 class="text-2xl font-black text-[var(--brand-900)] mb-2 tracking-tight">{{ lang.t('footer.successTitle') }}</h3>
                        
                        <div class="w-10 h-1 bg-[var(--accent)] rounded-full mb-4"></div>

                        <p class="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                            {{ lang.t('footer.successMsg') }} <br><br>
                            <span class="text-[var(--brand-900)] font-bold">{{ lang.t('footer.successMsg2') }}</span>
                        </p>

                        <button (click)="closeSuccessModal()" 
                                class="w-full py-4 bg-[var(--brand-900)] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-[var(--brand-800)] hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 active:translate-y-0 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group">
                            <span>{{ lang.t('footer.understood') }}</span>
                            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        }

        <!-- Apple-Style Toast Notification -->
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
                        <p class="text-xs text-gray-400">{{ lang.t('footer.thanksSubscribe') }}</p>
                    </div>
                </div>
            </div>
        }
    </footer>
    `,
    styles: [`
      /* Contenedor principal: Se ajusta arriba del footer */
      .waves-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 150px; /* Ajusta la altura de las olas aquí */
        transform: translateY(-85%); /* Olas bajan un poco para reducir espacio vacío (overlap) */
        overflow: hidden;
        line-height: 0;
        z-index: 1;
      }

      /* Animación base para todas las olas */
      .wave {
        animation-name: wave-animation;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        will-change: transform;
        /* Force animation even if user has reduced motion enabled */
        animation-duration: 5s; /* Fallback */
      }

      .waves-svg {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible; /* CRITICAL: Allows the long path to be seen when shifted */
      }

      /* Velocidades y retrasos individuales - ¡IMPORTANTE! para forzar la animación */
      .wave-1 { animation-duration: 5s !important; animation-delay: 0s; }
      .wave-2 { animation-duration: 7s !important; animation-delay: -3s; }
      .wave-3 { animation-duration: 10s !important; animation-delay: -5s; }
      .wave-4 { animation-duration: 12s !important; animation-delay: -9s; }

      /* Keyframes: Mueve el SVG horizontalmente de izquierda a derecha usando PORCENTAJES */
      @keyframes wave-animation {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }



        .noise-bg {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        @keyframes fadeInUp {
            from { 
                opacity: 0; 
                transform: translateY(20px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-enter {
            animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        @keyframes toastIn {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
            100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        .animate-toast-in {
            animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Modal Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-up {
            animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes bounceSoft {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .animate-bounce-soft {
            animation: bounceSoft 2s infinite ease-in-out;
        }
    `]
})
export class FooterComponent {
    private apiService = inject(ApiService);
    private router = inject(Router);
    lang = inject(LanguageService);

    @ViewChild('mainFooter') mainFooter!: ElementRef<HTMLElement>;
    @ViewChild('spotlight') spotlight!: ElementRef<HTMLElement>;

    currentYear = new Date().getFullYear();

    subName = '';
    subPhone = '';
    subEmail = '';
    isLoading = signal(false);

    // Toast Notification
    showToast = signal(false);
    toastMessage = signal('');

    // Success Modal
    showSuccessModal = signal(false);

    usefulLinks = computed(() => [
        { label: this.lang.t('nav.services'), href: 'servicios' },
        { label: 'FAQ', href: 'faq' },
        { label: this.lang.t('nav.bookings'), href: 'reservas' },
        { label: this.lang.t('nav.about'), href: 'nosotros' },
        { label: '     ', href: '' },
        { label: '     ', href: '' },
        { label: '     ', href: '' },
        { label: '     ', href: '' },
        { label: '     ', href: '' },
        { label: '     ', href: '' },
        { label: '     ', href: '' },
        { label: '     ', href: '' },
        { label: this.lang.t('footer.privacyPolicy'), href: '' },
        { label: this.lang.t('footer.disclaimer'), href: '' },
    ]);

    contactItems = computed(() => [
        {
            icon: 'phone',
            title: this.lang.t('footer.callUs'),
            value: '+57 301 235 8181'
        },
        {
            icon: 'mail',
            title: this.lang.t('footer.emailUs'),
            value: 'reservas@oceandrivecarental.com'
        },
        {
            icon: 'location',
            title: this.lang.t('footer.ourOffice'),
            value: this.lang.t('footer.seeOnMap'),
            href: 'https://maps.app.goo.gl/tJBr35ETjXJ2Eqwx7'
        }
    ]);

    onMouseMove(e: MouseEvent) {
        if (!this.mainFooter || !this.spotlight) return;

        const footer = this.mainFooter.nativeElement;
        const spotlight = this.spotlight.nativeElement;

        const rect = footer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Compensate for the spotlight starting 150px above the footer
        const localY = y + 150;

        spotlight.style.background = `radial-gradient(100px circle at ${x}px ${localY}px, rgba(255, 111, 97, 0.4), transparent 100%)`;
        spotlight.style.opacity = '1';
    }

    onMouseLeave() {
        if (!this.spotlight) return;
        this.spotlight.nativeElement.style.opacity = '0';
    }

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

    onSubscribe() {
        if (this.isLoading()) return;
        if (!this.subEmail) return;

        this.isLoading.set(true);
        const data = {
            name: this.subName,
            phone: this.subPhone,
            email: this.subEmail
        };

        this.apiService.subscribeToMarketing(data).subscribe({
            next: () => {
                this.isLoading.set(false);
                // Clear form
                this.subName = '';
                this.subPhone = '';
                this.subEmail = '';

                // Show Success Modal always (better UX for lead gen)
                this.showSuccessModal.set(true);
            },
            error: (err) => {
                this.isLoading.set(false);
                console.error('Subscription error', err);
                this.toastMessage.set(this.lang.t('footer.errorSubscribe'));
                this.showToast.set(true);
                setTimeout(() => { this.showToast.set(false); }, 3000);
            }
        });
    }

    closeSuccessModal() {
        this.showSuccessModal.set(false);
    }
}

