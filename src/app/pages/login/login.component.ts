import { Component, inject, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { BookingService } from '../../../services/booking.service';
import { LanguageService } from '../../../services/language.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen w-full flex bg-[#FBFBFD] font-sans text-[#002B5B] overflow-hidden selection:bg-[#FF6F61] selection:text-white">
        
        <!-- Left Section: Form Area -->
        <main class="w-full lg:w-1/2 flex flex-col px-8 md:px-16 lg:px-24 pt-12 pb-8 bg-white/80 backdrop-blur-xl relative z-10 animate-fade-in user-select-none">
            
            <!-- Navbar / Back Link & Language Switcher -->
            <nav class="flex justify-between items-center mb-12 lg:mb-20">
                <a routerLink="/" class="group flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-[#002B5B]/40 hover:text-[#002B5B] transition-colors duration-300">
                    <span class="p-2 rounded-full bg-transparent group-hover:bg-[#002B5B]/5 transition-colors">
                        <svg class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    </span>
                    {{ lang.t('auth.backHome') }}
                </a>

                <!-- Language Selector -->
                <div class="flex items-center gap-2">
                    <button (click)="lang.setLang('ES')" 
                            class="text-[10px] font-black tracking-widest px-2 py-1 rounded-md transition-all active:scale-95"
                            [class]="lang.currentLang() === 'ES' ? 'bg-[#002B5B] text-white' : 'text-[#002B5B]/40 hover:text-[#002B5B]'">
                        ES
                    </button>
                    <div class="w-[1px] h-3 bg-gray-200"></div>
                    <button (click)="lang.setLang('EN')" 
                            class="text-[10px] font-black tracking-widest px-2 py-1 rounded-md transition-all active:scale-95"
                            [class]="lang.currentLang() === 'EN' ? 'bg-[#002B5B] text-white' : 'text-[#002B5B]/40 hover:text-[#002B5B]'">
                        EN
                    </button>
                </div>
            </nav>

            <div class="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
                
                <!-- Dynamic Header -->
                <header class="mb-12 animate-fade-up delay-100">
                    <div class="inline-flex items-center gap-3 mb-6">
                        <div class="h-[2px] w-8 bg-[#FF6F61]"></div>
                        <span class="text-xs font-bold text-[#FF6F61] tracking-[0.2em] uppercase">
                            {{ authMode === 'login' ? lang.t('auth.welcome') : (authMode === 'forgot' ? lang.t('auth.recovery') : lang.t('auth.newPass')) }}
                        </span>
                    </div>
                    
                    <h1 class="text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] text-[#002B5B] mb-4">
                        {{ authMode === 'login' ? lang.t('auth.loginTitle1') : (authMode === 'forgot' ? lang.t('auth.recoverTitle1') : lang.t('auth.resetTitle1')) }}
                        <span class="text-[var(--brand-900)] font-bold">
                            {{ authMode === 'login' ? lang.t('auth.loginTitle2') : (authMode === 'forgot' ? lang.t('auth.recoverTitle2') : lang.t('auth.resetTitle2')) }}
                        </span>
                    </h1>
                    
                    <p class="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
                        {{ authMode === 'login' 
                            ? lang.t('auth.loginDesc') 
                            : (authMode === 'forgot' 
                                ? lang.t('auth.forgotDesc') 
                                : lang.t('auth.resetDesc')) }}
                    </p>
                </header>

                <!-- Notifications -->
                @if (errorMessage) {
                    <div class="mb-8 p-4 bg-red-50/50 backdrop-blur-sm border-l-2 border-[#FF6F61] rounded-r-xl animate-fade-in flex items-start gap-3 shadow-sm">
                        <svg class="w-5 h-5 text-[#FF6F61] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        <div>
                            <h4 class="text-xs font-bold text-[#FF6F61] uppercase tracking-wider mb-1">{{ lang.t('auth.errorAccess') }}</h4>
                            <p class="text-xs text-red-600/80 font-medium leading-relaxed">{{ errorMessage }}</p>
                        </div>
                    </div>
                }

                @if (successMessage) {
                    <div class="mb-8 p-4 bg-emerald-50/50 backdrop-blur-sm border-l-2 border-emerald-500 rounded-r-xl animate-fade-in flex items-start gap-3 shadow-sm">
                        <svg class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <div>
                            <h4 class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{{ lang.t('auth.success') }}</h4>
                            <p class="text-xs text-emerald-600/80 font-medium leading-relaxed">{{ successMessage }}</p>
                        </div>
                    </div>
                }

                <!-- Demo credentials hint (dev-only; hidden in production builds) -->
                @if (authMode === 'login' && isDev) {
                    <div class="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-fade-in">
                        <div class="shrink-0 w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
                            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div class="flex-1">
                            <p class="text-[0.7rem] font-black text-amber-800 uppercase tracking-widest">Modo Demo — Sin base de datos</p>
                            <p class="text-xs font-medium text-amber-900/80 mt-1 leading-relaxed">
                                Usuario: <span class="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200">admin</span>
                                &nbsp;·&nbsp;
                                Contraseña: <span class="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200">1234</span>
                                <button type="button" (click)="email='admin'; password='1234'" class="ml-2 text-[12px] font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2">Autocompletar</button>
                            </p>
                        </div>
                    </div>
                }

                <!-- LOGIN FORM -->
                @if (authMode === 'login') {
                    <form (ngSubmit)="onSubmit()" class="space-y-6 animate-fade-up delay-200">
                        <!-- Email / Username Input (demo: admin) -->
                        <div class="group relative">
                            <label class="block text-[12px] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-2 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.email') }} <span class="normal-case tracking-normal text-[#FF6F61]">(o usuario demo: admin)</span></label>
                            <div class="relative">
                                <input name="email" type="text" autocomplete="username" spellcheck="false" required [(ngModel)]="email" #emailModel="ngModel"
                                    class="w-full pl-0 pr-4 py-3 bg-transparent border-b-2 border-gray-100/80 text-[#002B5B] font-semibold text-base placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all duration-300 rounded-none"
                                    [placeholder]="lang.t('auth.emailPh') + ' / admin'">
                                <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                            @if (emailModel.invalid && (emailModel.dirty || emailModel.touched)) {
                                <p class="text-[0.6rem] font-bold text-[#FF6F61] mt-1 uppercase tracking-wide animate-fade-in">{{ lang.t('auth.emailInvalid') }}</p>
                            }
                        </div>

                        <!-- Password Input (demo: 1234) -->
                        <div class="group relative">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-[12px] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.password') }}</label>
                                <button type="button" (click)="authMode = 'forgot'" class="text-[0.6rem] font-bold text-[#FF6F61] hover:text-[#e05041] uppercase tracking-wider transition-colors">
                                    {{ lang.t('auth.forgotLink') }}
                                </button>
                            </div>
                            <div class="relative">
                                <input name="password" [type]="showPassword ? 'text' : 'password'" autocomplete="current-password" required minlength="4" [(ngModel)]="password" #passwordModel="ngModel"
                                    class="w-full pl-0 pr-10 py-3 bg-transparent border-b-2 border-gray-100/80 text-[#002B5B] font-semibold text-base placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all duration-300 rounded-none"
                                    placeholder="••••••••">
                                <button type="button" (click)="showPassword = !showPassword"
                                    class="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-[#002B5B] transition-colors focus:outline-none">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        @if(!showPassword) {
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        } @else {
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l3.59 3.59"/>
                                        }
                                    </svg>
                                </button>
                                <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="pt-6 space-y-4">
                            <button type="submit" [disabled]="isLoading || emailModel.invalid || passwordModel.invalid"
                                class="group w-full h-14 bg-[#002B5B] text-white font-bold uppercase tracking-[0.25em] text-xs hover:bg-[#003b7a] hover:shadow-lg hover:shadow-[#002B5B]/20 transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl overflow-hidden relative">
                                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                @if (isLoading) {
                                    <span class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
                                }
                                <span class="relative z-10">{{ isLoading ? lang.t('auth.authenticating') : lang.t('auth.loginBtn') }}</span>
                            </button>
                            
                            <p class="text-center text-xs font-medium text-gray-400">
                                {{ lang.t('auth.noMember') }} 
                                <a routerLink="/register" class="text-[#002B5B] font-bold hover:text-[#FF6F61] transition-colors relative group/link inline-block pb-0.5">
                                    {{ lang.t('auth.createAccount') }}
                                    <span class="absolute bottom-0 left-0 w-full h-[1px] bg-[#002B5B] scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left"></span>
                                </a>
                            </p>
                        </div>
                    </form>
                }

                <!-- FORGOT PASSWORD FORM -->
                @if (authMode === 'forgot') {
                    <div class="space-y-8 animate-fade-up delay-200">
                        <div class="group relative">
                            <label class="block text-[12px] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-2 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.forgotEmail') }}</label>
                            <div class="relative">
                                <input name="forgotEmail" type="email" autocomplete="email" spellcheck="false" required email [(ngModel)]="email" #forgotModel="ngModel"
                                    class="w-full pl-0 pr-4 py-3 bg-transparent border-b-2 border-gray-100/80 text-[#002B5B] font-semibold text-base placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all duration-300 rounded-none"
                                    [placeholder]="lang.t('auth.emailPh')">
                                <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                        </div>

                        <div class="pt-2 space-y-4">
                            <button (click)="onForgotPasswordRequest()" [disabled]="isLoading || forgotModel.invalid"
                                class="group w-full h-14 bg-[#002B5B] text-white font-bold uppercase tracking-[0.25em] text-xs hover:bg-[#003b7a] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 rounded-xl relative overflow-hidden">
                                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                @if (isLoading) {
                                    <span class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
                                }
                                <span class="relative z-10">{{ isLoading ? lang.t('auth.sending') : lang.t('auth.sendLink') }}</span>
                            </button>
                            
                            <button (click)="authMode = 'login'" class="w-full h-10 text-[12px] font-bold text-[#002B5B]/60 hover:text-[#002B5B] uppercase tracking-[0.2em] transition-colors">
                                {{ lang.t('auth.cancelBack') }}
                            </button>
                        </div>
                    </div>
                }

                <!-- RESET PASSWORD FORM -->
                @if (authMode === 'reset') {
                    <div class="space-y-8 animate-fade-up delay-200">
                        <div class="group relative">
                            <label class="block text-[12px] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-2 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.newPassword') }}</label>
                            <div class="relative">
                                <input name="newPassword" [type]="showPassword ? 'text' : 'password'" autocomplete="new-password" required minlength="8" [(ngModel)]="password" #newPwdModel="ngModel"
                                    class="w-full pl-0 pr-10 py-3 bg-transparent border-b-2 border-gray-100/80 text-[#002B5B] font-semibold text-base placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all duration-300 rounded-none"
                                    [placeholder]="lang.t('auth.newPasswordPh')">
                                <button type="button" (click)="showPassword = !showPassword"
                                    class="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-[#002B5B] transition-colors">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        @if(!showPassword) {
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        } @else {
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l3.59 3.59"/>
                                        }
                                    </svg>
                                </button>
                                <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                                @if (newPwdModel.invalid && (newPwdModel.dirty || newPwdModel.touched)) {
                                    <p class="text-[0.6rem] font-bold text-[#FF6F61] mt-1 uppercase tracking-wide">{{ lang.t('auth.passwordMinLen') }}</p>
                                }
                            </div>
                        </div>

                        <div class="pt-2 space-y-4">
                            <button (click)="onResetPasswordSubmit()" [disabled]="isLoading || newPwdModel.invalid"
                                class="group w-full h-14 bg-[#002B5B] text-white font-bold uppercase tracking-[0.25em] text-xs hover:bg-[#003b7a] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 rounded-xl relative overflow-hidden">
                                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                @if (isLoading) {
                                    <span class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
                                }
                                <span class="relative z-10">{{ isLoading ? lang.t('auth.processing') : lang.t('auth.updatePassword') }}</span>
                            </button>
                        </div>
                    </div>
                }

            </div>

            <!-- Footer -->
            <footer class="mt-8 flex justify-between items-center text-[0.6rem] font-bold text-gray-300 uppercase tracking-widest animate-fade-in delay-500">
                <span class="hover:text-[#002B5B] transition-colors cursor-default">© 2026 Ocean Drive</span>
                <div class="flex gap-4">
                    <a href="#" class="hover:text-[#002B5B] transition-colors">{{ lang.t('auth.privacy') }}</a>
                    <a href="#" class="hover:text-[#002B5B] transition-colors">{{ lang.t('auth.support') }}</a>
                </div>
            </footer>
        </main>

        <!-- Right Section: Aesthetic Image -->
        <aside class="hidden lg:block w-1/2 relative bg-gray-900 overflow-hidden">
            <!-- Background Image -->
            <div class="absolute inset-0 transition-transform duration-[20s] hover:scale-105">
                <img src="assets/imgs/auth/login-split.png" alt="Luxury Car Detail" class="w-full h-full object-cover">
            </div>
            
            <!-- Overlay Gradients -->
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-60"></div>

            <!-- Content -->
            <div class="absolute bottom-0 left-0 right-0 p-24 text-white z-20">
                <div class="mb-8 flex items-center gap-4 animate-fade-right">
                    <span class="h-[1px] w-12 bg-[#FF6F61]"></span>
                    <span class="text-xs font-bold uppercase tracking-[0.3em] text-[#FF6F61]">Ocean Drive Exclusive</span>
                </div>
                
                <blockquote class="mb-8">
                    <p class="text-4xl font-light italic leading-tight mb-6 opacity-90 animate-fade-up delay-100">
                        "{{ lang.t('auth.quotePart1') }}
                        <strong class="font-bold text-white relative inline-block">
                            {{ lang.t('auth.quoteStrong') }}
                            <span class="absolute bottom-1 left-0 w-full h-[6px] bg-[#FF6F61]/30 -z-10"></span>
                        </strong>"
                    </p>
                    <footer class="text-xs font-bold uppercase tracking-[0.2em] opacity-60 animate-fade-up delay-200">
                        — Concierge Digital v2.4
                    </footer>
                </blockquote>
                
                <!-- Indicators -->
                <div class="flex gap-2 opacity-50">
                    <div class="w-2 h-2 rounded-full bg-white"></div>
                    <div class="w-2 h-2 rounded-full bg-white/30"></div>
                    <div class="w-2 h-2 rounded-full bg-white/30"></div>
                </div>
            </div>
        </aside>
    </div>
    `
})
export class LoginComponent {
    email = '';
    password = '';
    showPassword = false;
    errorMessage = '';
    isLoading = false;
    authMode: 'login' | 'forgot' | 'reset' = 'login';
    resetToken = '';
    successMessage = '';
    isDev = isDevMode();

    private apiService = inject(ApiService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private bookingService = inject(BookingService);
    lang = inject(LanguageService);

    ngOnInit() {
        // Check for logout message (session expired)
        const logoutMessage = this.apiService.getLogoutMessage();
        if (logoutMessage) {
            this.errorMessage = logoutMessage;
        }

        const email = this.route.snapshot.queryParams['email'];
        if (email) {
            this.email = email;
        }

        const token = this.route.snapshot.queryParams['token'];
        if (token) {
            this.resetToken = token;
            this.authMode = 'reset';
        }
    }

    onSubmit() {
        this.isLoading = true;
        this.errorMessage = '';

        this.apiService.login({ email: this.email, password: this.password }).subscribe({
            next: () => {
                this.isLoading = false;

                // Check for returnUrl
                const returnUrl = this.route.snapshot.queryParams['returnUrl'];
                if (returnUrl) {
                    this.router.navigateByUrl(returnUrl);
                    return;
                }

                const user = this.apiService.currentUser();
                this.bookingService.refreshSession();
                if (user?.role === 'admin') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/reservas']);
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.error || 'Error al iniciar sesión';
            }
        });
    }

    onForgotPasswordRequest() {
        if (!this.email) return;
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.apiService.forgotPassword(this.email).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.successMessage = res.message;
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.error || 'Error al procesar la solicitud';
            }
        });
    }

    onResetPasswordSubmit() {
        if (!this.password || !this.resetToken) return;
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.apiService.resetPassword({ token: this.resetToken, password: this.password }).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.successMessage = res.message + '. Redirigiendo...';
                setTimeout(() => {
                    this.authMode = 'login';
                    this.password = '';
                    this.successMessage = '';
                    this.router.navigate(['/login']);
                }, 3000);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.error || 'Error al restablecer la contraseña';
            }
        });
    }
}
