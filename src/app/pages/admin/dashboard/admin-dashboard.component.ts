import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      <!-- Mobile Overlay -->
      @if (isMobileMenuOpen()) {
        <div class="fixed inset-0 bg-slate-900/60 z-20 md:hidden backdrop-blur-sm animate-fade-in" 
             (click)="toggleMobileMenu()"></div>
      }

      <!-- Sidebar -->
      <aside class="bg-slate-900 text-white flex flex-col shadow-2xl z-30 
                    fixed inset-y-0 left-0 w-72 transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0 mobile-sidebar"
             [ngClass]="isMobileMenuOpen() ? 'translate-x-0' : '-translate-x-full'">
        <div class="p-6 border-b border-slate-800 flex justify-between items-center md:justify-center sidebar-logo-area">
           <a routerLink="/" class="cursor-pointer hover:opacity-80 transition-opacity">
               <img src="assets/imgs/logo/LogotipoPositivo.webp" alt="Ocean Drive" class="h-8 md:h-10 w-auto object-contain">
           </a>
           <!-- Close Button (Mobile Only) -->
           <button class="md:hidden text-slate-400 hover:text-white" aria-label="Cerrar menú" (click)="toggleMobileMenu()">
             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        
        <nav class="flex-1 p-4 md:p-6 space-y-2 overflow-y-auto custom-scrollbar mobile-nav">
          <!-- Mobile Home/Logo Link (Visible only on mobile) -->
          <a routerLink="/" (click)="closeMobileMenu()" class="md:hidden flex flex-col items-center justify-center p-4 mb-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all group">
              <img src="assets/imgs/logo/LogotipoPositivo.webp" alt="Ocean Drive" class="h-10 w-auto object-contain mb-2 group-hover:scale-105 transition-transform">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-widest group-hover:text-white transition-colors">Volver al Inicio</span>
          </a>

          <a routerLink="/admin/availability" (click)="closeMobileMenu()" routerLinkActive="border-l-2 border-blue-600 bg-slate-800 text-white shadow-lg shadow-blue-900/20" class="flex items-center space-x-3 px-4 py-3.5 rounded-r-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group border-l-2 border-transparent mobile-nav-item">
             <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
             <span class="font-medium">Disponibilidad</span>
          </a>
          <a routerLink="/admin/overview" (click)="closeMobileMenu()" routerLinkActive="border-l-2 border-blue-600 bg-slate-800 text-white shadow-lg shadow-blue-900/20" class="flex items-center space-x-3 px-4 py-3.5 rounded-r-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group border-l-2 border-transparent mobile-nav-item">
            <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span class="font-medium">Panel Principal</span>
          </a>

          <a routerLink="/admin/inventory" (click)="closeMobileMenu()" routerLinkActive="border-l-2 border-blue-600 bg-slate-800 text-white shadow-lg shadow-blue-900/20" class="flex items-center space-x-3 px-4 py-3.5 rounded-r-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group border-l-2 border-transparent mobile-nav-item">
             <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <span class="font-medium">Inventario de Flota</span>
          </a>
          <a routerLink="/admin/reservation-list" (click)="closeMobileMenu()" routerLinkActive="border-l-2 border-blue-600 bg-slate-800 text-white shadow-lg shadow-blue-900/20" class="flex items-center space-x-3 px-4 py-3.5 rounded-r-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group border-l-2 border-transparent mobile-nav-item">
             <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            <span class="font-medium">Control de Reservas</span>
          </a>
           <a routerLink="/admin/users" (click)="closeMobileMenu()" routerLinkActive="border-l-2 border-blue-600 bg-slate-800 text-white shadow-lg shadow-blue-900/20" class="flex items-center space-x-3 px-4 py-3.5 rounded-r-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group border-l-2 border-transparent mobile-nav-item">
             <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <span class="font-medium">Gestión Usuarios</span>
          </a>
        </nav>

        <div class="p-6 border-t border-slate-800 sidebar-logout">
            <button (click)="logout()" class="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-xl text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span class="font-medium">Cerrar Sesión</span>
            </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-hidden flex flex-col relative w-full">
        <header class="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-4 md:px-8 py-3 md:py-5 flex justify-between items-center mobile-header">
            
            <div class="flex items-center gap-3">
                 <!-- Hamburger (Mobile) -->
                 <button class="md:hidden text-slate-500 hover:text-slate-800 p-1" aria-label="Abrir menú" (click)="toggleMobileMenu()">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                 </button>
                 <!-- Page Title -->
                 <h2 class="text-xl md:text-2xl font-bold text-slate-800 tracking-wider uppercase truncate">{{ pageTitle() }}</h2>
            </div>
            
            <div class="flex items-center gap-4 md:gap-6">
               <!-- Global Refresh Action -->
               <button (click)="refreshPage()" 
                        class="flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 md:p-2.5 rounded-lg transition-all"
                        title="Actualizar Datos">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               </button>

               <div class="h-6 md:h-8 w-px bg-gray-200"></div>

               <!-- User Profile -->
               <div class="flex items-center gap-3">
                   <div class="text-right hidden md:block">
                        <div class="text-sm font-bold text-slate-700 leading-tight">Hola, {{ formattedName() }}</div>
                        <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Administrador</div>
                   </div>
                   <div class="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white text-sm md:text-base">
                     {{ currentUser()?.name?.charAt(0) }}
                   </div>
               </div>
            </div>
        </header>
        
        <div class="flex-1 overflow-auto custom-scrollbar" 
             [ngClass]="isAvailabilityPage() ? 'p-0' : 'p-4 md:p-8'">
             <router-outlet></router-outlet>
        </div>
      </main>
    </div>
    `,
  styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }

        /* ========================================================
           MOBILE PORTRAIT (Vertical) — max-width: 767px + portrait
           ======================================================== */
        @media (max-width: 767px) and (orientation: portrait) {
            /* Full-screen sidebar overlay with glass effect */
            .mobile-sidebar {
                width: 100% !important;
                max-width: 320px !important;
            }
            /* Larger, more tappable nav items */
            .mobile-nav-item {
                padding-top: 1rem !important;
                padding-bottom: 1rem !important;
                margin-bottom: 0.25rem !important;
                border-radius: 0.75rem !important;
            }
            .mobile-nav { padding: 1rem !important; space-y: 0.5rem !important; }
            .sidebar-logo-area { padding: 1.25rem 1.25rem !important; }
            .sidebar-logout { padding: 1.25rem !important; }
            /* Header: taller for easy thumb reach */
            .mobile-header { padding-top: 0.875rem !important; padding-bottom: 0.875rem !important; }
        }

        /* =========================================================
           MOBILE LANDSCAPE (Horizontal) — max-width: 900px + landscape
           ========================================================= */
        @media (max-width: 900px) and (orientation: landscape) {
            /* Compact sidebar: scrollable nav to fit all items */
            .mobile-sidebar {
                width: 240px !important;
            }
            .mobile-nav {
                padding: 0.5rem !important;
                space-y: 0 !important;
            }
            /* Compact nav items to prevent overflow */
            .mobile-nav-item {
                padding-top: 0.6rem !important;
                padding-bottom: 0.6rem !important;
                border-radius: 0.5rem !important;
            }
            .sidebar-logo-area { 
                padding: 0.75rem 1rem !important; 
            }
            .sidebar-logout { 
                padding: 0.75rem 1rem !important; 
            }
            /* Compact header: reduce vertical padding to maximize content area */
            .mobile-header {
                padding-top: 0.4rem !important;
                padding-bottom: 0.4rem !important;
            }
        }
    `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {
  apiService = inject(ApiService);
  router = inject(Router);
  currentUser = this.apiService.currentUser;
  pageTitle = signal('Panel Principal');
  isAvailabilityPage = signal(false);
  isMobileMenuOpen = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.url);
      this.isMobileMenuOpen.set(false); // Close menu on navigation
    });

    // Initial set
    this.updateTitle(this.router.url);
  }

  updateTitle(url: string) {
    this.isAvailabilityPage.set(url.includes('availability'));

    if (url.includes('bookings')) this.pageTitle.set('Calendario General');
    else if (url.includes('availability')) this.pageTitle.set('Disponibilidad de Flota');
    else if (url.includes('inventory')) this.pageTitle.set('Inventario de Flota');
    else if (url.includes('reservation-list')) this.pageTitle.set('Control de Reservas');
    else if (url.includes('users')) this.pageTitle.set('Gestión Usuarios');
    else this.pageTitle.set('Panel Principal');
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  formattedName() {
    const full = this.currentUser()?.name || 'Usuario';
    const parts = full.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  }

  refreshPage() {
    // Simple reload to refresh all data since we moved the button globally
    window.location.reload();
  }

  logout() {
    this.apiService.logout();
    window.location.href = '/';
  }
}
