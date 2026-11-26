import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { LanguageService } from '../../../services/language.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen w-full flex bg-[#FBFBFD] font-sans text-[#002B5B] overflow-hidden selection:bg-[#FF6F61] selection:text-white" (click)="closeAllDropdowns()">
        
        <!-- Left Section: Form Area -->
        <main class="w-full lg:w-1/2 flex flex-col px-8 md:px-16 lg:px-24 pt-10 pb-8 bg-white/80 backdrop-blur-xl relative z-10 animate-fade-in overflow-y-auto custom-scrollbar">
            
            <!-- Navbar / Back Link & Language Switcher -->
            <nav class="flex justify-between items-center mb-8">
                <a routerLink="/login" class="group flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-[#002B5B]/40 hover:text-[#002B5B] transition-colors duration-300">
                    <span class="p-2 rounded-full bg-transparent group-hover:bg-[#002B5B]/5 transition-colors">
                        <svg class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </span>
                    {{ lang.t('auth.backLogin') }}
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

            <div class="max-w-lg w-full mx-auto flex-1 flex flex-col justify-center">
                
                <!-- Header -->
                <header class="mb-8 animate-fade-up delay-100">
                    <h1 class="text-[2.1rem] md:text-[2.7rem] font-black uppercase tracking-tight leading-[1.1] text-[#002B5B] mb-3">
                        {{ lang.t('auth.registerTitle') }}<br>
                        <span class="text-[#FF6F61] italic">{{ lang.t('auth.immediate') }}</span>
                    </h1>
                    <div class="h-[3px] w-80 bg-gradient-to-r from-[#FF6F61] to-[#FF6F61]/20 rounded-full mb-3"></div>
                    <p class="text-gray-400 text-xs font-medium leading-relaxed tracking-wide">
                        {{ lang.t('auth.registerDesc') }}
                    </p>
                </header>

                <!-- ERROR ALERT -->
                @if (errorMessage) {
                    <div class="mb-6 p-4 bg-red-50/50 backdrop-blur-sm border-l-2 border-[#FF6F61] rounded-r-xl animate-shake flex items-start gap-3 shadow-sm">
                        <svg class="w-5 h-5 text-[#FF6F61] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        <div>
                            <h4 class="text-xs font-bold text-[#FF6F61] uppercase tracking-wider mb-1">{{ lang.t('auth.errorRegister') }}</h4>
                            <p class="text-xs text-red-600/80 font-medium leading-relaxed">{{ errorMessage }}</p>
                        </div>
                    </div>
                }

                <!-- FORM -->
                <form (ngSubmit)="onSubmit()" class="space-y-5 animate-fade-up delay-200 pb-2">
                    
                    <!-- Row 1: Name & Email -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="group relative">
                            <label class="block text-[0.6rem] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.fullName') }}</label>
                            <div class="relative">
                                <input name="name" type="text" autocomplete="name" required [(ngModel)]="name" #nameModel="ngModel"
                                    class="w-full pl-0 pr-4 py-1.5 bg-transparent border-b border-gray-100/80 text-[#002B5B] font-bold text-sm placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all"
                                    [placeholder]="lang.t('auth.fullNamePh')">
                                <div class="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                        </div>

                        <div class="group relative">
                            <label class="block text-[0.6rem] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.email') }}</label>
                            <div class="relative">
                                <input name="email" type="email" autocomplete="email" spellcheck="false" required email [(ngModel)]="email" #emailRegModel="ngModel"
                                    class="w-full pl-0 pr-4 py-1.5 bg-transparent border-b border-gray-100/80 text-[#002B5B] font-bold text-sm placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all"
                                    [placeholder]="lang.t('auth.emailPh')">
                                <div class="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Row 2: Phone & Nationality -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <!-- Phone -->
                        <div class="group relative">
                            <label class="block text-[0.6rem] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.cellphone') }}</label>
                            <div class="flex gap-3">
                                <!-- Country Code -->
                                <div class="relative w-24 shrink-0" (click)="$event.stopPropagation()">
                                    <button type="button" (click)="toggleDropdown('dialCode')" 
                                        class="w-full h-full flex items-center justify-between px-0 py-1.5 bg-transparent border-b border-gray-100 group-focus-within:border-[#002B5B] text-[#002B5B] font-bold text-sm transition-all">
                                        <span class="flex items-center gap-2">
                                            <span class="text-lg leading-none grayscale group-hover:grayscale-0 transition-all">{{ getSelectedFlag() }}</span>
                                            <span>{{ dialCode }}</span>
                                        </span>
                                        <svg class="w-3 h-3 text-gray-400 transition-transform duration-300" [class.rotate-180]="dropdowns.dialCode" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7"/></svg>
                                    </button>
                                    
                                    @if(dropdowns.dialCode) {
                                        <div class="absolute z-50 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in origin-top-left">
                                            <div class="max-h-52 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                                                @for (country of countries; track country.code) {
                                                    <button type="button" (click)="selectDialCode(country.dialCode)"
                                                        class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#002B5B]/5 transition-colors text-left group/item"
                                                        [class.bg-blue-50]="dialCode === country.dialCode">
                                                        <span class="text-xl shrink-0">{{ country.flag }}</span>
                                                        <div class="flex flex-col">
                                                            <span class="text-[12px] font-bold text-[#002B5B]">{{ country.name }}</span>
                                                            <span class="text-[0.55rem] text-gray-400 font-bold">{{ country.dialCode }}</span>
                                                        </div>
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    }
                                </div>

                                <!-- Number Input -->
                                <div class="relative flex-1">
                                    <input name="phone" type="tel" autocomplete="tel" required [(ngModel)]="phone" #phoneModel="ngModel"
                                        class="w-full pl-0 pr-4 py-1.5 bg-transparent border-b border-gray-100/80 text-[#002B5B] font-bold text-sm placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all"
                                        placeholder="300 123 4567">
                                    <div class="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Nationality -->
                         <div class="group relative" (click)="$event.stopPropagation()">
                            <label class="block text-[0.6rem] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.nationality') }}</label>
                            <button type="button" (click)="toggleDropdown('nationality')" 
                                class="w-full flex items-center justify-between px-0 py-1.5 bg-transparent border-b border-gray-100 group-focus-within:border-[#002B5B] text-[#002B5B] font-bold text-sm transition-all text-left">
                                <span>{{ nationality }}</span>
                                <svg class="w-4 h-4 transition-transform text-[#002B5B]/30" [class.rotate-180]="dropdowns.nationality" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7"/></svg>
                            </button>
                            
                            <div *ngIf="dropdowns.nationality" 
                                class="absolute z-50 left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in origin-top p-1">
                                <div class="max-h-48 overflow-y-auto custom-scrollbar">
                                    @for (country of countries; track country.name) {
                                        <button type="button" (click)="selectNationality(country.name)"
                                            class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#002B5B]/5 transition-colors text-left"
                                            [class.bg-blue-50]="nationality === country.name">
                                            <span class="text-lg">{{ country.flag }}</span>
                                            <span class="text-xs font-bold text-[#002B5B]">{{ country.name }}</span>
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Row 3: ID -->
                    <div class="group relative">
                        <label class="block text-[0.6rem] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.id') }}</label>
                        <div class="flex gap-4">
                            <!-- Type Dropdown -->
                            <div class="relative w-28 shrink-0" (click)="$event.stopPropagation()">
                                <button type="button" (click)="toggleDropdown('docType')" 
                                    class="w-full h-full flex items-center justify-between px-0 py-1.5 bg-transparent border-b border-gray-100 group-focus-within:border-[#002B5B] text-[#002B5B] font-bold text-sm transition-all">
                                    <span>{{ docType }}</span>
                                    <svg class="w-3 h-3 text-gray-400 transition-transform duration-300" [class.rotate-180]="dropdowns.docType" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7"/></svg>
                                </button>
                                
                                @if(dropdowns.docType) {
                                    <div class="absolute z-50 mt-2 w-32 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in origin-top-left p-1">
                                        <button type="button" (click)="selectDocType('CC')" class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#002B5B] hover:bg-[#002B5B]/5 transition-colors" [class.bg-blue-50]="docType === 'CC'">{{ lang.t('paso4.doc_cc') }}</button>
                                        <button type="button" (click)="selectDocType('CE')" class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#002B5B] hover:bg-[#002B5B]/5 transition-colors" [class.bg-blue-50]="docType === 'CE'">{{ lang.t('paso4.doc_ce') }}</button>
                                        <button type="button" (click)="selectDocType('PASSPORT')" class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#002B5B] hover:bg-[#002B5B]/5 transition-colors" [class.bg-blue-50]="docType === 'PASSPORT'">{{ lang.t('paso4.doc_pas') }}</button>
                                        <button type="button" (click)="selectDocType('ID EX')" class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#002B5B] hover:bg-[#002B5B]/5 transition-colors" [class.bg-blue-50]="docType === 'ID EX'">{{ lang.t('paso4.doc_idex') }}</button>
                                    </div>
                                }
                            </div>

                            <!-- Number Input -->
                            <div class="relative flex-1">
                                <input name="docNumber" type="text" spellcheck="false" required [(ngModel)]="docNumber" #docModel="ngModel"
                                    class="w-full pl-0 pr-4 py-1.5 bg-transparent border-b border-gray-100/80 text-[#002B5B] font-bold text-sm placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all"
                                    [placeholder]="lang.t('auth.docNumberPh')">
                                <div class="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Row 4: Passwords -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="group relative">
                            <label class="block text-[0.6rem] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.password') }}</label>
                            <div class="relative">
                                <input name="password" [type]="showPassword ? 'text' : 'password'" autocomplete="new-password" required minlength="6" [(ngModel)]="password" #passwordRegModel="ngModel"
                                    class="w-full pl-0 pr-8 py-1.5 bg-transparent border-b border-gray-100/80 text-[#002B5B] font-bold text-sm placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all"
                                    placeholder="••••••••">
                                <button type="button" (click)="showPassword = !showPassword"
                                    class="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#002B5B] transition-colors focus:outline-none p-1">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        @if(!showPassword) {
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        } @else {
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l3.59 3.59"/>
                                        }
                                    </svg>
                                </button>
                                <div class="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                        </div>

                        <div class="group relative">
                            <label class="block text-[0.6rem] font-bold text-[#002B5B]/40 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-[#002B5B] transition-colors">{{ lang.t('auth.confirmPassword') }}</label>
                            <div class="relative">
                                <input name="confirmPassword" [type]="showPassword ? 'text' : 'password'" autocomplete="new-password" required [(ngModel)]="confirmPassword" #confirmPwdModel="ngModel"
                                    class="w-full pl-0 pr-8 py-1.5 bg-transparent border-b border-gray-100/80 text-[#002B5B] font-bold text-sm placeholder-gray-200 focus:outline-none focus:border-[#002B5B] transition-all"
                                    placeholder="••••••••">
                                <div class="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#FF6F61] transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                            @if (confirmPassword && password !== confirmPassword) {
                                <p class="text-[0.55rem] font-bold text-[#FF6F61] mt-0.5 uppercase tracking-wide">{{ lang.t('auth.noMatch') }}</p>
                            }
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="pt-4">
                        <button type="submit" [disabled]="isLoading || nameModel.invalid || emailRegModel.invalid || passwordRegModel.invalid || docModel.invalid || phoneModel.invalid || (password !== confirmPassword)"
                            class="group w-full h-12 bg-[#FF6F61] text-white font-bold uppercase tracking-[0.25em] text-xs hover:bg-[#ff8579] hover:shadow-xl hover:shadow-[#FF6F61]/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl relative overflow-hidden">
                            <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            @if (isLoading) {
                                <span class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
                            }
                            <span class="relative z-10">{{ isLoading ? lang.t('auth.verifying') : lang.t('auth.completeRegister') }}</span>
                        </button>
                    </div>
                </form>

                <!-- Terms -->
                <p class="mt-4 mb-8 text-[0.55rem] font-bold text-gray-300 uppercase tracking-widest text-center leading-relaxed italic animate-fade-in delay-500">
                    {{ lang.t('auth.terms') }}
                </p>
            </div>
        </main>

        <!-- Right Section: Visual Experience -->
        <aside class="hidden lg:block w-1/2 relative bg-gray-900 overflow-hidden">
            <!-- Background Image -->
            <div class="absolute inset-0 transition-transform duration-[25s] hover:scale-110">
                <img src="assets/imgs/auth/login-split.png" alt="Detail" class="w-full h-full object-cover">
            </div>
            
            <!-- Gradient Overlay -->
            <!-- Gradient Overlays -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
            <div class="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent"></div>
            
            <!-- Content -->
            <div class="absolute bottom-0 left-0 right-0 p-24 text-white z-20">
                <div class="inline-flex items-center gap-3 mb-8">
                    <div class="h-px w-12 bg-[#FF6F61]"></div>
                    <span class="text-xs font-bold tracking-[0.4em] uppercase text-[#FF6F61]">Potencia</span>
                </div>
                <h2 class="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                    Libertad<br>
                    Redefinida
                </h2>
                <p class="text-white/60 text-sm font-medium leading-relaxed max-w-xs tracking-wide uppercase italic">
                    Vive la combinación perfecta de rendimiento y confort absoluto.
                </p>
            </div>
        </aside>
    </div>
    `,
    styles: [`
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #E5E7EB;
            border-radius: 10px;
        }
        .animate-spin-slow {
            animation: spin 10s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `]
})
export class RegisterComponent {
    name = '';
    email = '';
    dialCode = '+57';
    phone = '';
    password = '';
    confirmPassword = ''; // Added confirm password
    showPassword = false;

    // New fields
    nationality = 'Colombia'; // Default to Colombia
    docType = 'CC';
    docNumber = '';

    // Dropdown state
    dropdowns = {
        dialCode: false,
        docType: false,
        nationality: false
    };

    countries = [
        { name: 'Colombia', code: 'CO', flag: '🇨🇴', dialCode: '+57' },
        { name: 'Estados Unidos', code: 'US', flag: '🇺🇸', dialCode: '+1' },
        { name: 'México', code: 'MX', flag: '🇲🇽', dialCode: '+52' },
        { name: 'España', code: 'ES', flag: '🇪🇸', dialCode: '+34' },
        { name: 'Argentina', code: 'AR', flag: '🇦🇷', dialCode: '+54' },
        { name: 'Brasil', code: 'BR', flag: '🇧🇷', dialCode: '+55' },
        { name: 'Canadá', code: 'CA', flag: '🇨🇦', dialCode: '+1' },
        { name: 'Chile', code: 'CL', flag: '🇨🇱', dialCode: '+56' },
        { name: 'Perú', code: 'PE', flag: '🇵🇪', dialCode: '+51' },
        { name: 'Ecuador', code: 'EC', flag: '🇪🇨', dialCode: '+593' },
        { name: 'Panamá', code: 'PA', flag: '🇵🇦', dialCode: '+507' },
        { name: 'Francia', code: 'FR', flag: '🇫🇷', dialCode: '+33' },
        { name: 'Alemania', code: 'DE', flag: '🇩🇪', dialCode: '+49' },
        { name: 'Italia', code: 'IT', flag: '🇮🇹', dialCode: '+39' },
        { name: 'Reino Unido', code: 'GB', flag: '🇬🇧', dialCode: '+44' },
    ];

    errorMessage = '';
    isLoading = false;

    private apiService = inject(ApiService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    lang = inject(LanguageService);

    ngOnInit() {
        const p = this.route.snapshot.queryParams;
        if (p['name']) this.name = p['name'];
        if (p['email']) this.email = p['email'];
        if (p['phone']) this.phone = p['phone'];
        if (p['dialCode']) this.dialCode = p['dialCode'].startsWith('+') ? p['dialCode'] : '+' + p['dialCode'].trim();
        if (p['docNumber']) this.docNumber = p['docNumber'];
        if (p['docType']) this.docType = p['docType'];
        if (p['nationality']) this.nationality = p['nationality'];
    }

    // Dropdown Logic
    toggleDropdown(key: keyof typeof this.dropdowns) {
        const currentState = this.dropdowns[key];
        this.closeAllDropdowns();
        this.dropdowns[key] = !currentState;
    }

    closeAllDropdowns() {
        this.dropdowns.dialCode = false;
        this.dropdowns.docType = false;
        this.dropdowns.nationality = false;
    }

    selectDialCode(code: string) {
        this.dialCode = code;
        this.dropdowns.dialCode = false;
    }

    selectDocType(type: string) {
        this.docType = type;
        this.dropdowns.docType = false;
    }

    selectNationality(name: string) {
        this.nationality = name;
        this.dropdowns.nationality = false;
    }

    getSelectedFlag() {
        return this.countries.find(c => c.dialCode === this.dialCode)?.flag || '🇨🇴';
    }

    onSubmit() {
        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Las contraseñas no coinciden';
            return;
        }

        // Client-side password strength validation (matches backend rules)
        if (this.password.length < 8) {
            this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
            return;
        }
        if (!/[A-Z]/.test(this.password)) {
            this.errorMessage = 'La contraseña debe contener al menos una letra mayúscula';
            return;
        }
        if (!/[a-z]/.test(this.password)) {
            this.errorMessage = 'La contraseña debe contener al menos una letra minúscula';
            return;
        }
        if (!/[0-9]/.test(this.password)) {
            this.errorMessage = 'La contraseña debe contener al menos un número';
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) {
            this.errorMessage = 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...)';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const fullPhone = `${this.dialCode} ${this.phone}`;

        const user = {
            name: this.name,
            email: this.email,
            phone: fullPhone,
            password: this.password,
            nationality: this.nationality,
            docType: this.docType,
            docNumber: this.docNumber
        };

        this.apiService.register(user).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.token && res.user) {
                    this.apiService.setSession(res.token, res.user);
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                    this.router.navigateByUrl(returnUrl);
                } else {
                    this.router.navigate(['/login']);
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.error || 'Error al registrarse';
            }
        });
    }
}
