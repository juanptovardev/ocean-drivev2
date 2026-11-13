import { Component, ChangeDetectionStrategy, signal, HostListener, Inject, PLATFORM_ID, computed, Input, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CurrencyService } from '../../services/currency.service';
import { LanguageService, Lang } from '../../services/language.service';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// Force rebuild
@Component({
  selector: 'app-header',
  standalone: true,
  template: `
<header 
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
  [class]="displayScrolled() ? 'bg-white/95 backdrop-blur-lg shadow-md py-2' : 'bg-transparent py-2 md:py-4'">
  <div class="w-full px-4 md:px-8 lg:container lg:mx-auto lg:px-10 flex justify-between items-center">
    <div class="flex items-center">
        <a routerLink="/" class="flex items-center group relative z-10">
            <!-- Logo cambia según el scroll -->
            <img [src]="displayScrolled() ? 'assets/imgs/header/logo-color.webp' : 'assets/imgs/header/logo-white.webp'" 
                 alt="Ocean Drive Logo"
                 class="h-[2.4rem] md:h-[3.3rem] w-auto transition-transform duration-500 group-hover:scale-105" />
        </a>
    </div>
    
    <!-- Navigation Items -->
    <nav class="hidden lg:flex items-center space-x-8">
      @for(item of navItems(); track item.label) {
        <div class="relative group">
            <a [routerLink]="item.href" class="relative px-1.5 py-1.5 text-[0.92rem] font-medium transition-colors group flex items-center gap-1"
            [ngClass]="getItemClasses(item.href)">
            {{ item.label }}
            @if (item.children) {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 transition-transform duration-300 group-hover:rotate-180">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            }
            <span class="absolute bottom-0 left-0 h-0.5 bg-[#FF6F61] transition-all duration-300 group-hover:w-full" [class]="isActiveRoute(item.href) ? 'w-full' : 'w-0'"></span>
            </a>

            @if (item.children) {
            <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left overflow-hidden z-50">
                <div class="py-2">
                    @for (child of item.children; track child.label) {
                        <a [routerLink]="child.href" class="block px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#FF6F61] transition-colors">
                            {{ child.label }}
                        </a>
                    }
                </div>
            </div>
            }
        </div>
      }
    </nav>

    <!-- Right Side Actions -->
    <div class="flex items-center gap-2 md:gap-0">
      <!-- Right Icons (Language, Currency) -->
      <div class="hidden landscape:flex md:flex items-center space-x-2 md:space-x-3 md:mr-3">

      <!-- Language Selector -->
      <div class="relative group z-50" (mouseenter)="isLangMenuOpen.set(true)" (mouseleave)="isLangMenuOpen.set(false)">
        <button 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer select-none border border-[#1A3F6F]/40 hover:border-[#1A3F6F] hover:scale-105 active:scale-95 backdrop-blur-sm"
          [ngClass]="displayScrolled() ? 'bg-[#1A3F6F]/10 text-[#1A3F6F]' : 'bg-white/15 text-white'"
          title="Seleccionar Idioma">
          <span class="text-[11px] font-bold tracking-widest">{{ lang.currentLang() }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 transition-transform duration-300" [class.rotate-180]="isLangMenuOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown -->
        <div class="absolute top-full right-0 mt-2 w-20 py-1 rounded-xl shadow-xl border border-[#1A3F6F]/10 overflow-hidden transition-all duration-300 transform origin-top-right"
             [ngClass]="isLangMenuOpen() ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'"
             [class]="displayScrolled() ? 'bg-white/90 backdrop-blur-md' : 'bg-black/60 backdrop-blur-md'">
            
            <button (click)="setLang('ES')" 
                    class="w-full px-4 py-2 text-[10px] font-bold tracking-widest text-center transition-colors hover:bg-[#1A3F6F]/10"
                    [ngClass]="displayScrolled() ? 'text-gray-700' : 'text-white/90'">
                ES
            </button>
            <button (click)="setLang('EN')" 
                    class="w-full px-4 py-2 text-[10px] font-bold tracking-widest text-center transition-colors hover:bg-[#1A3F6F]/10"
                    [ngClass]="displayScrolled() ? 'text-gray-700' : 'text-white/90'">
                EN
            </button>
        </div>
      </div>

      <!-- USD / COP Toggle -->
      <button (click)="currencyService.toggle()"
        class="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full transition-all duration-300 cursor-pointer select-none border border-[#1A3F6F]/40 hover:border-[#1A3F6F] hover:scale-105 active:scale-95 backdrop-blur-sm"
        [ngClass]="currencyService.showUsd() ? (displayScrolled() ? 'bg-[#1A3F6F]/10' : 'bg-white/15') : 'bg-transparent'"
        [title]="lang.t('currency.convert')">
        <span class="text-[11px] font-bold tracking-widest transition-colors duration-300"
          [ngClass]="displayScrolled() ? 'text-[#1A3F6F]' : 'text-white'">
          {{ currencyService.showUsd() ? 'USD' : 'COP' }}
        </span>
        <div class="relative w-8 h-[18px] rounded-full transition-all duration-300"
          [ngClass]="currencyService.showUsd() ? 'bg-[#1A3F6F]' : (displayScrolled() ? 'bg-gray-300' : 'bg-white/25')">
          <div class="absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white shadow-sm"
            [ngClass]="currencyService.showUsd() ? 'translate-x-[12px]' : 'translate-x-[2px]'">
          </div>
        </div>
      </button>

      <a href="https://www.instagram.com/oceandrivecarental/" target="_blank" rel="noopener noreferrer" [ngClass]="instagramClasses()" title="Instagram" class="hidden lg:inline-flex">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-[1.44rem] h-[1.44rem]" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
        </svg>
      </a>
      <a href="https://wa.me/573012358181" target="_blank" rel="noopener noreferrer" [ngClass]="whatsappClasses()" title="Contáctanos por WhatsApp" class="hidden lg:inline-flex">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-[1.68rem] h-[1.68rem]" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"></path>
          <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a .5 .5 0 0 0 0 1"></path>
        </svg>
      </a>
    </div>
    
    <!-- Hamburger Button with Animation -->
    <div class="lg:hidden">
      <button aria-label="Abrir menú" (click)="toggleMobileMenu()" class="relative w-10 h-10 flex items-center justify-center focus:outline-none active:scale-95 transition-all duration-200 rounded-lg" [class]="displayScrolled() || mobileMenuOpen() ? 'text-gray-800' : 'text-white'">
        <div class="w-5 h-4 flex flex-col justify-between">
          <span class="h-0.5 w-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                [ngClass]="mobileMenuOpen() ? 'rotate-45 translate-y-1.5 bg-gray-800' : (displayScrolled() ? 'bg-gray-800' : 'bg-white')">
          </span>
          <span class="h-0.5 w-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                [ngClass]="mobileMenuOpen() ? 'opacity-0' : 'opacity-100'"
                [class.bg-white]="!displayScrolled()"
                [class.bg-gray-800]="displayScrolled()">
          </span>
          <span class="h-0.5 w-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                [ngClass]="mobileMenuOpen() ? '-rotate-45 -translate-y-1.5 bg-gray-800' : (displayScrolled() ? 'bg-gray-800' : 'bg-white')">
          </span>
        </div>
      </button>
    </div>
    </div>
  </div>
</header>

<!-- Mobile Menu - Full Screen Premium -->
<div class="fixed inset-0 bg-black/50 backdrop-blur-md z-[9998] lg:hidden transition-all duration-500 ease-in-out"
     [class.opacity-0]="!mobileMenuOpen()"
     [class.pointer-events-none]="!mobileMenuOpen()"
     [class.opacity-100]="mobileMenuOpen()"
     (click)="toggleMobileMenu()">
</div>

<div class="fixed top-0 right-0 bottom-0 w-[88%] max-w-[380px] bg-gradient-to-br from-white via-white to-gray-50/60 shadow-2xl z-[9999] lg:hidden backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
     [class.translate-x-full]="!mobileMenuOpen()"
     [class.translate-x-0]="mobileMenuOpen()">
  <div class="flex flex-col h-full relative">
    <div class="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#FF6F61]/5 via-[#FF6F61]/2 to-transparent pointer-events-none"></div>
    
    <div class="px-6 py-5 border-b border-gray-200/50 relative z-10">
      <div class="flex items-center justify-between">
        <img src="assets/imgs/header/logo-color.webp" alt="Ocean Drive" class="h-10 transition-transform duration-300 hover:scale-105 drop-shadow-sm">
        <button aria-label="Cerrar menú" (click)="toggleMobileMenu()"
          class="p-2.5 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 rounded-xl transition-all duration-300 active:scale-90 group relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-[#FF6F61]/0 via-[#FF6F61]/5 to-[#FF6F61]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <svg class="w-6 h-6 text-gray-700 relative z-10 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar">
      @for(item of navItems(); track item.label; let i = $index) {
      <div class="mb-2 animate-slide-in-left" [style.animation-delay]="(i * 60) + 'ms'">
        <a [routerLink]="item.href" (click)="!item.children && toggleMobileMenu()"
          class="flex items-center justify-between px-4 py-4 text-[1.063rem] font-semibold text-gray-800 hover:bg-gradient-to-r hover:from-[#FF6F61]/10 hover:to-[#FF6F61]/5 rounded-xl transition-all duration-300 active:scale-[0.97] group relative overflow-hidden"
          [ngClass]="{'bg-gradient-to-r from-[#FF6F61]/12 to-[#FF6F61]/5 text-[#FF6F61] shadow-sm': isActiveRoute(item.href)}">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <span class="relative z-10 transition-transform duration-300 group-hover:translate-x-1">{{ item.label }}</span>
          @if (item.children) {
          <svg class="w-5 h-5 text-gray-400 transition-all duration-300 group-hover:text-[#FF6F61] group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
          }
        </a>

        @if (item.children) {
        <div class="ml-5 mt-2 space-y-1 pl-4 border-l-2 border-[#FF6F61]/20">
          @for (child of item.children; track child.label; let j = $index) {
          <a [routerLink]="child.href" (click)="toggleMobileMenu()"
            class="block px-4 py-3 text-[0.938rem] text-gray-600 hover:text-[#FF6F61] hover:bg-gradient-to-r hover:from-[#FF6F61]/5 hover:to-transparent rounded-lg transition-all duration-300 group animate-slide-in-left"
            [style.animation-delay]="((i * 60) + (j * 40) + 120) + 'ms'">
            <span class="transition-transform duration-300 inline-block group-hover:translate-x-2">{{ child.label }}</span>
          </a>
          }
        </div>
        }
      </div>
      }
    </nav>

    <div class="px-6 py-6 border-t border-gray-200/50 bg-gray-50/30 md:hidden">
        <p class="text-[0.65rem] text-[#1A3F6F]/40 mb-4 font-black uppercase tracking-[0.2em]">{{ lang.t('lang.select') }} & {{ lang.t('currency.convert') }}</p>
        <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between bg-white/80 border border-[#1A3F6F]/10 rounded-2xl p-2 shadow-sm">
                <div class="flex gap-1 flex-1">
                    <button (click)="setLang('ES')" 
                        class="flex-1 py-2.5 rounded-xl text-[11px] font-black tracking-widest transition-all duration-300 active:scale-95"
                        [class]="lang.currentLang() === 'ES' ? 'bg-[#1A3F6F] text-white shadow-lg shadow-[#1A3F6F]/20' : 'text-[#1A3F6F]/50 hover:bg-[#1A3F6F]/5'">
                        ESPAÑOL
                    </button>
                    <button (click)="setLang('EN')" 
                        class="flex-1 py-2.5 rounded-xl text-[11px] font-black tracking-widest transition-all duration-300 active:scale-95"
                        [class]="lang.currentLang() === 'EN' ? 'bg-[#1A3F6F] text-white shadow-lg shadow-[#1A3F6F]/20' : 'text-[#1A3F6F]/50 hover:bg-[#1A3F6F]/5'">
                        ENGLISH
                    </button>
                </div>
            </div>
            <button (click)="currencyService.toggle()"
                class="w-full flex items-center justify-between bg-white/80 border border-[#1A3F6F]/10 rounded-2xl px-5 py-3.5 shadow-sm active:scale-[0.98] transition-all">
                <div class="flex flex-col items-start translate-y-[-1px]">
                    <span class="text-[10px] font-black text-[#1A3F6F]/30 uppercase tracking-widest mb-0.5">Moneda</span>
                    <span class="text-xs font-black text-[#1A3F6F]">{{ currencyService.showUsd() ? 'Dólares (USD)' : 'Pesos (COP)' }}</span>
                </div>
                <div class="relative w-11 h-6 rounded-full transition-all duration-300"
                    [ngClass]="currencyService.showUsd() ? 'bg-[#1A3F6F]' : 'bg-gray-200'">
                    <div class="absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white shadow-md flex items-center justify-center"
                        [ngClass]="currencyService.showUsd() ? 'translate-x-[20px]' : 'translate-x-[3px]'">
                        <span class="text-[8px] font-black text-[#1A3F6F]">{{ currencyService.showUsd() ? '$' : '$' }}</span>
                    </div>
                </div>
            </button>
        </div>
    </div>
  </div>
</div>

<!-- Social Media FAB -->
<div class="fixed bottom-6 right-6 z-[10000] flex flex-col items-center gap-4 transition-all duration-300 lg:hidden"
     [class.opacity-0]="mobileMenuOpen()"
     [class.pointer-events-none]="mobileMenuOpen()"
     [class.translate-y-12]="mobileMenuOpen()">
    <!-- Instagram Bubble (Hidden by default) -->
    <a href="https://www.instagram.com/oceandrivecarental/" target="_blank" rel="noopener noreferrer"
       class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl backdrop-blur-md border-[1.5px] border-[#1A3F6F]/20 group relative overflow-hidden bg-white/40"
       [class]="socialFabOpen() ? 'opacity-100 translate-y-0 pointer-events-auto scale-110 delay-100' : 'opacity-0 translate-y-12 pointer-events-none scale-0'">
       <div class="absolute inset-0 bg-[#E1306C]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
       <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#E1306C] relative z-10" viewBox="0 0 16 16" fill="currentColor">
           <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
       </svg>
    </a>

    <!-- WhatsApp Bubble (Visible only when open) -->
    <a href="https://wa.me/573012358181" target="_blank" rel="noopener noreferrer"
        class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl backdrop-blur-md border-[1.5px] border-[#1A3F6F]/20 group relative overflow-hidden bg-white/40"
        [class]="socialFabOpen() ? 'opacity-100 translate-y-0 pointer-events-auto scale-110' : 'opacity-0 translate-y-12 pointer-events-none scale-0'">
        <div class="absolute inset-0 bg-[#25D366]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#25D366] relative z-10" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"></path>
            <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1"></path>
        </svg>
    </a>

    <!-- Main FAB (Toggles Menu) -->
    <button aria-label="Menú de contacto" (click)="socialFabOpen.set(!socialFabOpen())"
            class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl backdrop-blur-md border-2 border-[#1A3F6F]/40 active:scale-95 group relative overflow-hidden bg-white/40 z-30"
            [ngClass]="socialFabOpen() ? 'border-[#1A3F6F] rotate-90 bg-white' : ''">
        <div class="absolute inset-0 bg-[#25D366]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <!-- WhatsApp Icon (Shown when closed) -->
        <svg *ngIf="!socialFabOpen()" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#25D366] relative z-10 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"></path>
            <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1"></path>
        </svg>

        <!-- Close (X) Icon (Shown when open) -->
        <svg *ngIf="socialFabOpen()" class="w-8 h-8 text-[#1A3F6F] relative z-10 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
</div>
`,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slide-in-left {
      from {
        transform: translateX(-20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in-left {
      animation: slide-in-left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      opacity: 0;
    }

    /* Custom scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #FF6F61 0%, #ff8f85 100%);
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #ff8f85 0%, #FF6F61 100%);
    }
`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
})
export class HeaderComponent {
  currencyService = inject(CurrencyService);
  lang = inject(LanguageService);
  isScrolled = signal(false);
  mobileMenuOpen = signal(false);
  socialFabOpen = signal(false);

  // Language Selector
  isLangMenuOpen = signal(false);

  setLang(lang: Lang) {
    this.lang.setLang(lang);
    this.isLangMenuOpen.set(false);
  }

  @Input() variant: 'transparent' | 'white' = 'transparent';

  displayScrolled = computed(() => this.variant === 'white' || this.isScrolled());

  navItems = computed<NavItem[]>(() => [
    { label: this.lang.t('nav.home'), href: '/' },
    { label: this.lang.t('nav.services'), href: '/servicios' },
    { label: this.lang.t('nav.about'), href: '/nosotros' },
    { label: this.lang.t('nav.policies'), href: '/politicas' },
    { label: this.lang.t('nav.bookings'), href: '/reservas' },
  ]);

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 20);

      // Cerrar el menú móvil automáticamente al hacer scroll
      if (this.mobileMenuOpen() && window.scrollY > 20) {
        this.mobileMenuOpen.set(false);
      }
    }
  }

  isActiveRoute(href: string): boolean {
    return this.router.url === href;
  }

  getItemClasses(href: string) {
    const scrolled = this.displayScrolled();
    const isActive = this.isActiveRoute(href);
    if (isActive) {
      return 'text-[#FF6F61] font-bold';
    }
    return scrolled
      ? 'text-gray-700 hover:text-[#FF6F61]'
      : 'text-white/90 hover:text-[#FF6F61]';
  }



  instagramClasses = computed(() => {
    const base = 'p-2.5 rounded-full transition-all duration-100 active:scale-90 hover:scale-110';
    const scrolled = this.displayScrolled();
    const color = scrolled
      ? 'text-[#E1306C] hover:bg-[#E1306C]/10'
      : 'text-white hover:text-[#E1306C] hover:bg-white/20';
    return `${base} ${color} `.trim();
  });

  whatsappClasses = computed(() => {
    const base = 'ml-2 p-2.5 rounded-full transition-all duration-100 active:scale-90 hover:scale-110';
    const scrolled = this.displayScrolled();
    const color = scrolled
      ? 'text-[#25D366] hover:bg-[#25D366]/10'
      : 'text-white hover:text-[#25D366] hover:bg-white/20';
    return `${base} ${color} `.trim();
  });

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }
}
