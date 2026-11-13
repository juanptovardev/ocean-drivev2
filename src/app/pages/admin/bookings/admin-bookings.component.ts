import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';

@Component({
    selector: 'app-admin-bookings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <!-- Main Layout -->
    <div class="-m-4 md:-m-8 flex flex-col h-[calc(100%+2rem)] md:h-[calc(100%+4rem)] w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] bg-[#f8fafc]">
        
        <!-- Content Grid -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-4 gap-4 relative z-0">
            
            <!-- CALENDAR AREA (Expanded) -->
            <div class="flex-1 min-h-[600px] lg:min-h-0 bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden min-w-0">
                <div class="px-4 py-2 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
                    <div class="flex items-center gap-2">
                         <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                        <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wide leading-none">{{ currentYear() }}</h3>
                    </div>
                    
                    <div class="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                        <!-- Collapse/Return Button -->
                        <button (click)="navigateToOverview()" 
                                class="p-1 rounded-md hover:bg-white hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all group border-r border-slate-200 pr-1 mr-0.5" 
                                title="Volver al Panel Principal">
                            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <!-- Navigation Arrows -->
                        <div class="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-0.5">
                            <button aria-label="Vista anterior" (click)="navigateView(-1)" 
                                    class="p-1 rounded-md hover:bg-white hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all group">
                                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button aria-label="Vista siguiente" (click)="navigateView(1)" 
                                    class="p-1 rounded-md hover:bg-white hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all group">
                                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <!-- View Switcher -->
                        <div class="flex">
                            <button (click)="viewMode.set('month')" 
                                    class="px-2.5 py-0.5 rounded text-[10px] font-bold transition-all uppercase tracking-wide min-w-[60px]"
                                    [class.bg-white]="viewMode() === 'month'" 
                                    [class.shadow-sm]="viewMode() === 'month'"
                                    [class.text-blue-600]="viewMode() === 'month'"
                                    [class.text-slate-400]="viewMode() !== 'month'">
                                {{ viewMode() === 'month' ? currentMonthName().toUpperCase() : 'MENSUAL' }}
                            </button>
                            <button (click)="viewMode.set('3month')" 
                                    class="px-2.5 py-0.5 rounded text-[10px] font-bold transition-all uppercase tracking-wide min-w-[60px]"
                                    [class.bg-white]="viewMode() === '3month'" 
                                    [class.shadow-sm]="viewMode() === '3month'"
                                    [class.text-blue-600]="viewMode() === '3month'"
                                    [class.text-slate-400]="viewMode() !== '3month'">
                                {{ viewMode() === '3month' ? getQuarterRange() : 'TRIMESTRAL' }}
                            </button>
                            <button (click)="viewMode.set('6month')" 
                                    class="px-2.5 py-0.5 rounded text-[10px] font-bold transition-all uppercase tracking-wide min-w-[60px]"
                                    [class.bg-white]="viewMode() === '6month'" 
                                    [class.shadow-sm]="viewMode() === '6month'"
                                    [class.text-blue-600]="viewMode() === '6month'"
                                    [class.text-slate-400]="viewMode() !== '6month'">
                                {{ viewMode() === '6month' ? getSemesterRange() : 'SEMESTRAL' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- CALENDAR CONTENT -->
                <div class="flex-1 overflow-hidden relative">
                    @if (viewMode() === 'month') {
                         <!-- MONTH VIEW -->
                         <div class="p-1 h-full flex flex-col min-h-0">
                            <!-- Days Header -->
                            <div class="grid grid-cols-7 border-b border-slate-100 mb-1 shrink-0">
                                @for(day of ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']; track $index) {
                                    <div class="py-1 text-center text-[10px] font-black text-slate-400 tracking-wider">{{ day }}</div>
                                }
                            </div>
                            
                            <!-- Calendar Grid -->
                            <div class="grid grid-cols-7 gap-px bg-slate-200 flex-1 h-full max-h-full" [style.grid-template-rows]="gridRowsStyle()">
                                @for (empty of emptyDaysStart(); track $index) {
                                    <div class="bg-slate-50/50"></div>
                                }
                                
                                @for (day of calendarDays(); track day.dateStr) {
                                    <div class="p-1 relative flex flex-col bg-white hover:bg-blue-50/30 transition-colors group overflow-hidden cursor-pointer" (click)="openDaySummary(day)">
                                        <div class="flex justify-between items-start mb-0.5 opacity-60">
                                            <span class="text-[11px] font-medium w-6 h-6 flex items-center justify-center rounded-full"
                                                  [ngClass]="day.isToday ? 'bg-slate-900 text-white' : 'text-slate-400'">
                                                {{ day.dayNum }}
                                            </span>
                                        </div>
                                        
                                        <div class="flex flex-wrap content-start gap-1 px-0.5">
                                            @for (event of day.events; track $index) {
                                                <div class="w-3 h-3 rounded-sm shadow-sm cursor-pointer hover:scale-110 transition-transform border border-white/20"
                                                     [title]="event.tooltip || event.title"
                                                     (click)="$event.stopPropagation(); openBookingModal(event.booking)"
                                                     (mouseenter)="startHoverTimer(event.booking)"
                                                     (mouseleave)="clearHoverTimer()"
                                                     [ngClass]="{
                                                        'bg-orange-400 ring-1 ring-orange-500': event.type === 'maintenance',
                                                        'bg-blue-500 ring-1 ring-blue-600': event.type === 'booked',
                                                        'bg-green-500 ring-1 ring-green-600': event.type === 'start',
                                                        'bg-red-500 ring-1 ring-red-600': event.type === 'end'
                                                     }"
                                                     style="background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px);">
                                                </div>
                                            }
                                        </div>
                                    </div>
                                }
                                
                                @for (empty of emptyDaysEnd(); track $index) {
                                    <div class="bg-slate-50/50"></div>
                                }
                            </div>
                        </div>
                    } @else {
                        <!-- MULTI MONTH VIEW -->
                        <div class="p-2 h-full overflow-hidden">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-full">
                                @for (monthOffset of getViewOffsets(); track monthOffset) {
                                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-2 h-full flex flex-col">
                                        <h4 class="text-xs font-black text-slate-700 mb-2 text-center uppercase border-b border-slate-100 pb-1.5 tracking-wider shrink-0">
                                            {{ getMonthNameByOffset(monthOffset) }}
                                        </h4>
                                        
                                        <div class="grid grid-cols-7 gap-0.5 text-[7px] text-center mb-1 shrink-0">
                                            @for(d of ['D','L','M','M','J','V','S']; track $index) {
                                                <div class="text-slate-300 font-bold">{{d}}</div>
                                            }
                                        </div>
                                        
                                        <div class="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded overflow-hidden flex-1 content-stretch">
                                            @for (day of getMiniMonthDays(monthOffset); track $index) {
                                                <div class="flex flex-col items-center justify-center bg-white relative text-[8px] min-h-0"
                                                     [class.bg-slate-50]="!day.inMonth"
                                                     [class.text-slate-300]="!day.inMonth">
                                                     <span class="w-4 h-4 flex items-center justify-center rounded-full transition-all"
                                                           [class.font-bold]="day.isToday"
                                                           [class.bg-blue-600]="day.isToday"
                                                           [class.text-white]="day.isToday"
                                                           [class.text-slate-300]="!day.isToday && !day.inMonth"
                                                           [class.text-slate-600]="!day.isToday && day.inMonth">
                                                         {{ day.dayNum }}
                                                     </span>
                                                    
                                                    <!-- Dots -->
                                                    <div class="flex gap-0.5 mt-0.5">
                                                        @if (day.hasStart) { <span class="w-1 h-1 rounded-full bg-green-500"></span> }
                                                        @if (day.hasEnd) { <span class="w-1 h-1 rounded-full bg-red-500"></span> }
                                                        @if (day.hasMaintenance) { <span class="w-1 h-1 rounded-full bg-orange-500"></span> }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>

            <!-- SIDEBAR: FILTERS -->
            <div class="w-full lg:w-[260px] h-[500px] lg:h-auto flex flex-col gap-4 shrink-0">
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div class="px-3 py-2 border-b border-slate-100 bg-white">
                        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide leading-none">Filtros</h3>
                    </div>
                    
                    <div class="px-4 py-3 space-y-4 bg-white flex-1 overflow-y-auto">
                        <!-- Category Select Custom -->
                        <div class="relative group">
                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5">Categoría</label>
                            <div class="relative">
                                <button (click)="categoryDropdownOpen.set(!categoryDropdownOpen())" class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-3 flex items-center justify-between text-[11px] font-bold text-slate-700 hover:bg-white hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 h-9">
                                    <span class="truncate">{{ getSelectedCategoryName() }}</span>
                                    <svg class="w-4 h-4 text-slate-400 transform transition-transform duration-200" [class.rotate-180]="categoryDropdownOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                
                                @if (categoryDropdownOpen()) {
                                    <!-- Backdrop clickable to close -->
                                    <div class="fixed inset-0 z-40" (click)="categoryDropdownOpen.set(false)"></div>
                                    
                                    <div class="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar animate-scale-in origin-top flex flex-col p-1">
                                            <button (click)="selectCategory('all')" class="w-full px-3 py-2 text-[10px] font-bold text-left uppercase hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors" [class.text-blue-600]="selectedCategory() === 'all'" [class.bg-blue-50]="selectedCategory() === 'all'" [class.text-slate-600]="selectedCategory() !== 'all'">
                                                <span>Todas las Categorías</span>
                                                @if (selectedCategory() === 'all') { <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg> }
                                            </button>
                                            @for (v of vehicles(); track v.id) {
                                                <button (click)="selectCategory(v.id)" class="w-full px-3 py-2 text-[10px] font-bold text-left uppercase hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors mt-0.5" [class.text-blue-600]="selectedCategory() === v.id" [class.bg-blue-50]="selectedCategory() === v.id" [class.text-slate-600]="selectedCategory() !== v.id">
                                                    <span>{{ v.name }}</span>
                                                    @if (selectedCategory() === v.id) { <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg> }
                                                </button>
                                            }
                                    </div>
                                }
                            </div>
                        </div>

                        <!-- Toggles -->
                        <div class="space-y-2 pt-2 border-t border-slate-100/50">
                            <!-- Retiros Toggle -->
                            <div role="button" tabindex="0" (click)="showPickups.set(!showPickups())" (keydown.enter)="showPickups.set(!showPickups())" (keydown.space)="showPickups.set(!showPickups()); $event.preventDefault()" class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-slate-50 group select-none" [class.bg-green-50]="showPickups()" [class.border-green-100]="showPickups()">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-6 h-6 rounded-md flex items-center justify-center transition-colors" [class.bg-green-500]="showPickups()" [class.bg-slate-200]="!showPickups()">
                                        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                    </div>
                                    <span class="text-[9px] font-bold uppercase transition-colors" [class.text-green-800]="showPickups()" [class.text-slate-500]="!showPickups()">Retiros (Inicio)</span>
                                </div>
                                <div class="w-8 h-4 bg-slate-200 rounded-full relative transition-colors" [class.bg-green-500]="showPickups()">
                                    <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm" [class.translate-x-4]="showPickups()"></div>
                                </div>
                            </div>

                            <!-- Entregas Toggle -->
                            <div (click)="showDropoffs.set(!showDropoffs())" class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-slate-50 group select-none" [class.bg-red-50]="showDropoffs()" [class.border-red-100]="showDropoffs()">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-6 h-6 rounded-md flex items-center justify-center transition-colors" [class.bg-red-500]="showDropoffs()" [class.bg-slate-200]="!showDropoffs()">
                                        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                    </div>
                                    <span class="text-[9px] font-bold uppercase transition-colors" [class.text-red-800]="showDropoffs()" [class.text-slate-500]="!showDropoffs()">Entregas (Fin)</span>
                                </div>
                                <div class="w-8 h-4 bg-slate-200 rounded-full relative transition-colors" [class.bg-red-500]="showDropoffs()">
                                    <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm" [class.translate-x-4]="showDropoffs()"></div>
                                </div>
                            </div>

                            <!-- Mantenimiento Toggle -->
                            <div (click)="showMaintenance.set(!showMaintenance())" class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-slate-50 group select-none" [class.bg-orange-50]="showMaintenance()" [class.border-orange-100]="showMaintenance()">
                                <div class="flex items-center gap-2.5">
                                        <div class="w-6 h-6 rounded-md flex items-center justify-center transition-colors" [class.bg-orange-500]="showMaintenance()" [class.bg-slate-200]="!showMaintenance()">
                                        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <span class="text-[9px] font-bold uppercase transition-colors" [class.text-orange-800]="showMaintenance()" [class.text-slate-500]="!showMaintenance()">Mantenimiento</span>
                                </div>
                                <div class="w-8 h-4 bg-slate-200 rounded-full relative transition-colors" [class.bg-orange-500]="showMaintenance()">
                                    <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm" [class.translate-x-4]="showMaintenance()"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Bookings -->
                 <div class="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0 flex-1">
                    <div class="px-4 py-3 border-b border-slate-100 bg-white">
                        <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wide leading-none">Últimas Reservas</h3>
                    </div>
                     <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-slate-50/30">
                        @if (recentBookings().length === 0) {
                            <div class="text-center py-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sin reservas recientes</div>
                        }

                        @for (booking of recentBookings(); track booking.id) {
                             <div (click)="openBookingModal(booking)" class="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group">
                                <div class="flex justify-between items-center mb-1.5">
                                    <h4 class="text-[10px] font-black text-slate-700 truncate max-w-[70%] group-hover:text-blue-700 transition-colors">
                                        {{ booking.category_name }}
                                    </h4>
                                    <span class="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                         {{ booking.id }}
                                    </span>
                                </div>
                                <div class="flex justify-between items-end">
                                     <div class="flex items-center gap-1.5 min-w-0 pr-2">
                                        <div class="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shrink-0">
                                            {{ getInitials(booking.customer_name || 'AN') }}
                                        </div>
                                        <p class="text-[10px] font-medium text-slate-600 truncate">
                                            {{ booking.customer_name || 'Anónimo' }}
                                        </p>
                                    </div>
                                    <div class="text-[9px] font-bold text-slate-400 uppercase">
                                        {{ formatDateShort(booking.created_at) }}
                                    </div>
                                </div>
                             </div>
                        }
                    </div>
                </div>
            </div>
        </div>

        <!-- BOOKING MODAL -->
        @if (selectedBooking()) {
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" (click)="closeModal()">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
                    
                    <!-- Header -->
                    <div class="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                        <h2 class="text-2xl font-black text-slate-800 uppercase tracking-tight">{{ selectedBooking().category_name }}</h2>
                        
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2">
                                <span class="text-[11px] font-bold text-white bg-slate-900 px-2 py-1 rounded shadow-sm tracking-widest uppercase font-mono leading-none">
                                    {{ selectedBooking().code || selectedBooking().plate || 'ID: ' + selectedBooking().id }}
                                </span>
                                <span class="text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider leading-none"
                                      [ngClass]="{
                                          'bg-blue-100 text-blue-700': selectedBooking().status === 'pending',
                                          'bg-green-100 text-green-700': selectedBooking().status === 'confirmed' || selectedBooking().status === 'available',
                                          'bg-slate-200 text-slate-600': selectedBooking().status === 'completed',
                                          'bg-red-100 text-red-700': selectedBooking().status === 'cancelled',
                                          'bg-orange-100 text-orange-700': selectedBooking().status === 'maintenance'
                                      }">
                                      @if(selectedBooking().status === 'pending') { RESERVADO }
                                      @else if(selectedBooking().status === 'confirmed') { CONFIRMADO }
                                      @else if(selectedBooking().status === 'available') { DISPONIBLE }
                                      @else if(selectedBooking().status === 'cancelled') { CANCELADO }
                                      @else if(selectedBooking().status === 'completed') { COMPLETADO }
                                      @else if(selectedBooking().status === 'maintenance') { MANTENIMIENTO }
                                      @else { {{ selectedBooking().status }} }
                                </span>
                            </div>
                            <button aria-label="Cerrar" (click)="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Scrollable Content -->
                    <div class="p-6 overflow-y-auto custom-scrollbar">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <!-- 1. Customer Info -->
                            <div class="space-y-4">
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Información del Cliente</h3>
                                <div class="flex items-start gap-4">
                                     <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-500 shrink-0">
                                        {{ getInitials(selectedBooking().customer_name || selectedBooking().user_name) }}
                                     </div>
                                     <div class="space-y-1">
                                         <div>
                                             <p class="text-xs text-slate-400 font-bold uppercase">Nombre Completo</p>
                                             <p class="text-sm font-bold text-slate-800">{{ selectedBooking().customer_name || selectedBooking().user_name }}</p>
                                         </div>
                                         <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                                             <div>
                                                 <p class="text-[10px] text-slate-400 font-bold uppercase">Documento</p>
                                                 <p class="text-xs text-slate-700">{{ selectedBooking().customer_doc_type || 'ID' }} {{ selectedBooking().customer_doc_number || '---' }}</p>
                                             </div>
                                             <div>
                                                 <p class="text-[10px] text-slate-400 font-bold uppercase">Nacionalidad</p>
                                                 <p class="text-xs text-slate-700">{{ selectedBooking().customer_nationality || '---' }}</p>
                                             </div>
                                         </div>
                                         <div>
                                             <p class="text-[10px] text-slate-400 font-bold uppercase">Contacto</p>
                                             <p class="text-xs text-slate-700 flex items-center gap-1">
                                                <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {{ selectedBooking().customer_email || 'Sin email' }}
                                             </p>
                                             <p class="text-xs text-slate-700 flex items-center gap-1 mt-0.5">
                                                <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {{ selectedBooking().customer_phone || 'Sin teléfono' }}
                                             </p>
                                         </div>
                                     </div>
                                </div>
                            </div>
                            
                            <!-- 2. Reservation Details -->
                            <div class="space-y-4">
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Detalles de la Reserva</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <p class="text-[10px] font-bold text-slate-400 uppercase">Vehículo Asignado</p>
                                        <div class="flex items-center gap-2 mt-1">
                                            <div class="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-500">
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                            </div>
                                            <div>
                                                <p class="text-sm font-black text-slate-800">{{ selectedBooking().plate || 'PENDIENTE' }}</p>
                                                <p class="text-[10px] text-slate-500">{{ selectedBooking().category_name }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <p class="text-[10px] font-bold text-slate-400 uppercase">Seguro</p>
                                        <p class="text-sm font-bold text-slate-800 capitalize mt-1">{{ selectedBooking().insurance_type || 'Básico' }}</p>
                                        <p class="text-[10px] text-slate-500">Cobertura seleccionada</p>
                                    </div>
                                    
                                    <div class="col-span-2">
                                        <div class="flex justify-between items-end border-t border-slate-200 pt-2 mt-1">
                                            <span class="text-xs font-bold text-slate-500">Total a Pagar</span>
                                            <span class="text-2xl font-black text-emerald-600">\${{ selectedBooking().total_price | number:'1.0-0' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 3. Logistics -->
                            <div class="col-span-1 md:col-span-2 space-y-4">
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Logística del Viaje</h3>
                                <div class="flex flex-col md:flex-row gap-4">
                                    <!-- Pickup -->
                                    <div class="flex-1 bg-green-50/50 p-4 rounded-xl border border-green-100">
                                        <div class="flex items-center gap-2 mb-3">
                                            <div class="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm">
                                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                            </div>
                                            <span class="text-xs font-black text-green-700 uppercase tracking-wider">Retiro</span>
                                        </div>
                                        <div class="space-y-2 pl-8">
                                            <div>
                                                <p class="text-[10px] font-bold text-slate-400 uppercase">Fecha y Hora</p>
                                                <p class="text-sm font-bold text-slate-800">{{ formatDateFull(selectedBooking().start_date) }}</p>
                                                <p class="text-xs text-slate-600">{{ selectedBooking().pickup_time || '10:00' }}</p>
                                            </div>

                                            <div>
                                                <p class="text-[10px] font-bold text-slate-400 uppercase">Ubicación</p>
                                                <p class="text-xs text-slate-700 font-medium">{{ selectedBooking().pickup_location || 'Oficina Principal' }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Dropoff -->
                                    <div class="flex-1 bg-red-50/50 p-4 rounded-xl border border-red-100">
                                        <div class="flex items-center gap-2 mb-3">
                                            <div class="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm">
                                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                            </div>
                                            <span class="text-xs font-black text-red-700 uppercase tracking-wider">Entrega</span>
                                        </div>
                                        <div class="space-y-2 pl-8">
                                            <div>
                                                <p class="text-[10px] font-bold text-slate-400 uppercase">Fecha y Hora</p>
                                                <p class="text-sm font-bold text-slate-800">{{ formatDateFull(selectedBooking().end_date) }}</p>
                                                <p class="text-xs text-slate-600">{{ selectedBooking().dropoff_time || '10:00' }}</p>
                                            </div>
                                            <div>
                                                <p class="text-[10px] font-bold text-slate-400 uppercase">Ubicación</p>
                                                <p class="text-xs text-slate-700 font-medium">{{ selectedBooking().dropoff_location || 'Oficina Principal' }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 4. Created At -->
                             <div class="col-span-1 md:col-span-2 text-right">
                                 <p class="text-[9px] text-slate-400">Reserva creada el {{ formatDateFull(selectedBooking().created_at) }}</p>
                             </div>
                        </div>
                    </div>
                    
                    <!-- Footer: Just Close -->
                    <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                         <button (click)="closeModal()" class="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-wider shadow-lg shadow-slate-200">
                             Cerrar Ventana
                         </button>
                    </div>
                </div>
            </div>
        }

        <!-- SUMMARY MODAL -->
        @if (summaryModal(); as modal) {
           <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" (click)="closeSummaryModal()">
               <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[85vh]" (click)="$event.stopPropagation()">
                   <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                       <h3 class="text-lg font-black text-slate-800 uppercase tracking-wide">{{ modal.title }}</h3>
                       <button aria-label="Cerrar" (click)="closeSummaryModal()" class="text-slate-400 hover:text-slate-600">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                   </div>
                   
                   <div class="p-4 overflow-y-auto custom-scrollbar">
                        <div class="grid grid-cols-2 gap-2">
                          @for(item of modal.events; track $index) {
                              <div class="p-2 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col hover:border-blue-400 transition-colors cursor-pointer min-h-[60px]" (click)="openBookingModal(item.booking || item); closeSummaryModal()">
                                   <!-- CONTENIDO ITEM -->
                                   <div class="flex flex-col h-full justify-between p-0.5">
                                        <div class="flex justify-between items-start w-full mb-1">
                                             <span class="text-[9px] font-black text-slate-700 uppercase truncate pr-1 max-w-[60%] leading-tight">{{ item.booking?.category_name || item.category_name }}</span>
                                             
                                             <div class="flex items-center gap-1 shrink-0">
                                                 <span class="text-[8px] font-mono text-slate-500 mr-0.5">{{ item.booking?.plate || item.booking?.code || item.code }}</span>
                                                 
                                                 @if(item.type === 'maintenance') {
                                                      <div class="text-orange-500"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                                                 } @else if (item.type === 'start') {
                                                     <div class="w-4 h-4 rounded-full flex items-center justify-center bg-green-500 text-white text-[8px] shadow-sm">
                                                         <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                                     </div>
                                                 } @else if (item.type === 'end') {
                                                      <div class="w-4 h-4 rounded-full flex items-center justify-center bg-red-500 text-white text-[8px] shadow-sm">
                                                         <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                                     </div>
                                                 } @else {
                                                     <div class="w-4 h-4 rounded-full flex items-center justify-center bg-blue-500 text-white text-[8px] shadow-sm">
                                                          <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                     </div>
                                                 }
                                             </div>
                                        </div>

                                        <div class="mt-auto flex justify-between items-end border-t border-slate-50 pt-1">
                                            <span class="text-[9px] text-slate-400 font-medium tracking-tight">
                                                {{ item.booking?.pickup_time || item.booking?.dropoff_time || '---' }}
                                            </span>
                                            <span class="text-[9px] text-slate-600 font-bold truncate max-w-[65%] text-right">
                                                {{ (item.booking?.customer_name || item.booking?.user_name || 'Cliente').split(' ')[0] }}
                                            </span>
                                        </div>
                                   </div>
                              </div>
                          }
                        </div>
                   </div>
               </div>
           </div>
       }
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `]
})
export class AdminBookingsComponent {
    private apiService = inject(ApiService);
    private router = inject(Router);

    bookings = signal<any[]>([]);
    vehicles = signal<any[]>([]);

    selectedBooking = signal<any>(null);
    summaryModal = signal<{ title: string, events: any[] } | null>(null);

    // Filters State
    currentDate = signal(new Date());
    selectedCategory = signal<string>('all');
    categoryDropdownOpen = signal(false);
    showPickups = signal(true);
    showDropoffs = signal(true);
    showMaintenance = signal(true);
    viewMode = signal<'month' | '3month' | '6month'>('month');

    // Computed Nav
    currentMonthName = computed(() => {
        return new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(this.currentDate());
    });
    currentYear = computed(() => this.currentDate().getFullYear());

    currentMonth = computed(() => this.currentDate().getMonth());

    recentBookings = computed(() => {
        return [...this.bookings()]
            .filter(b => b.status !== 'maintenance')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);
    });

    // Hover Timer for Events
    hoverTimer: any = null;

    startHoverTimer(booking: any) {
        this.clearHoverTimer();
        this.hoverTimer = setTimeout(() => {
            this.openBookingModal(booking);
        }, 300); // 1 second
    }

    clearHoverTimer() {
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
            this.hoverTimer = null;
        }
    }

    // --- CALENDAR LOGIC (ADAPTED FROM OVERVIEW) ---

    emptyDaysStart = computed(() => {
        const year = this.currentYear();
        const month = this.currentMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        return Array(firstDayIndex).fill(null);
    });

    weeksNeeded = computed(() => {
        const year = this.currentYear();
        const month = this.currentMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const totalCells = firstDayIndex + daysInMonth;
        return Math.ceil(totalCells / 7);
    });

    emptyDaysEnd = computed(() => {
        const year = this.currentYear();
        const month = this.currentMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const totalUsed = firstDayIndex + daysInMonth;
        const totalCells = this.weeksNeeded() * 7;
        return Array(Math.max(0, totalCells - totalUsed)).fill(null);
    });

    gridRowsStyle = computed(() => `repeat(${this.weeksNeeded()}, minmax(0, 1fr))`);

    // Calendar Days Generator with FILTER LOGIC
    calendarDays = computed(() => {
        const year = this.currentYear();
        const month = this.currentMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const days = [];
        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const dateStr = this.formatDateFromParts(year, month, dayNum);
            const isToday = today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === dayNum;

            const events = this.getEventsForDate(new Date(year, month, dayNum));

            days.push({
                dayNum,
                dateStr,
                isToday,
                events,
                // These hints can be used for summary dots if needed, based on filtered events
                hasStart: events.some(e => e.type === 'start'),
                hasEnd: events.some(e => e.type === 'end'),
                hasMaintenance: events.some(e => e.type === 'maintenance'),
            });
        }
        return days;
    });

    constructor() {
        this.loadData();
    }

    loadData() {
        this.apiService.adminGetVehicles().subscribe(data => this.vehicles.set(data));
        this.apiService.adminGetBookings().subscribe(data => this.bookings.set(data));
    }

    // --- EVENT GENERATION (FILTERED) ---
    getEventsForDate(date: Date) {
        const dateStr = date.toISOString().split('T')[0];
        const events: any[] = [];

        // category filter
        const catFilter = this.selectedCategory();

        this.bookings().forEach(b => {
            // 1. Filter by Category
            if (catFilter !== 'all' && b.category_id != catFilter) return;

            const startStr = (b.start_date || '').substring(0, 10);
            const endStr = (b.end_date || '').substring(0, 10);
            const isMaint = b.status === 'maintenance' || b.status === 'offline';
            const plateInfo = b.plate || b.code || 'Sin Placa';

            // 2. Filter by Type Toggle (Maintenance vs Booking)
            if (isMaint && !this.showMaintenance()) return;

            // Start (Pickup)
            if (dateStr === startStr && !isMaint) {
                if (this.showPickups()) {
                    events.push({
                        type: 'start',
                        title: (b.customer_name || 'Cliente').split(' ')[0],
                        booking: b,
                        tooltip: `Retiro: ${b.customer_name}\nPlaca: ${plateInfo}`
                    });
                }
            }

            // End (Dropoff)
            if (dateStr === endStr && !isMaint) {
                if (this.showDropoffs()) {
                    events.push({
                        type: 'end',
                        title: (b.customer_name || 'Cliente').split(' ')[0],
                        booking: b,
                        tooltip: `Entrega: ${b.customer_name}\nPlaca: ${plateInfo}`
                    });
                }
            }

            // Mid-range (Booked or Maintenance)
            if (dateStr >= startStr && dateStr <= endStr) {
                if (isMaint) {
                    // Show only on start date
                    if (dateStr === startStr) {
                        events.push({
                            type: 'maintenance',
                            title: 'Mantenimiento',
                            booking: b,
                            tooltip: `Mantenimiento: ${b.plate}\nPlaca: ${plateInfo}`
                        });
                    }
                } else if (dateStr !== startStr && dateStr !== endStr) {
                    // Booked block (Active) - Generally shown if pickups/dropoffs are shown, 
                    // OR maybe we should add a 'showBooked' filter? 
                    // For now, let's show it if it's a valid booking and not filtered out by category
                    events.push({
                        type: 'booked',
                        title: (b.customer_name || 'R').split(' ')[0],
                        booking: b,
                        tooltip: `Reserva: ${b.customer_name}\nPlaca: ${plateInfo}`
                    });
                }
            }
        });
        return events;
    }

    // --- NAVIGATION ---

    navigateToOverview() {
        this.router.navigate(['/admin/overview']);
    }

    navigateView(direction: number) {
        const mode = this.viewMode();
        let delta = direction;
        if (mode === '3month') delta = direction * 3;
        else if (mode === '6month') delta = direction * 6;

        const newDate = new Date(this.currentDate());
        newDate.setMonth(newDate.getMonth() + delta);
        this.currentDate.set(newDate);
    }

    // --- HELPERS ---
    getQuarterRange() {
        // ... (copy logic) ...
        const start = new Date(this.currentDate());
        const end = new Date(this.currentDate());
        end.setMonth(end.getMonth() + 2);

        const m1 = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(start).replace('.', '').toUpperCase();
        const m2 = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(end).replace('.', '').toUpperCase();
        return `${m1} - ${m2}`;
    }

    getSemesterRange() {
        const start = new Date(this.currentDate());
        const end = new Date(this.currentDate());
        end.setMonth(end.getMonth() + 5);

        const m1 = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(start).replace('.', '').toUpperCase();
        const m2 = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(end).replace('.', '').toUpperCase();
        return `${m1} - ${m2}`;
    }

    getViewOffsets() {
        if (this.viewMode() === '3month') return [0, 1, 2];
        if (this.viewMode() === '6month') return [0, 1, 2, 3, 4, 5];
        return [];
    }

    getMonthNameByOffset(offset: number) {
        const d = new Date(this.currentDate());
        d.setMonth(d.getMonth() + offset);
        return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d);
    }

    formatDateFromParts(year: number, month: number, day: number): string {
        const d = new Date(year, month, day);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${da}`;
    }

    // --- MINI MONTH LOGIC (From Overview) ---
    getMiniMonthDays(offset: number) {
        // ... Copy from Overview ...
        const baseDate = new Date(this.currentDate());
        baseDate.setMonth(baseDate.getMonth() + offset);

        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

        const days = [];

        // Padding
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ inMonth: false });
        }

        // Days
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const events = this.getEventsForDate(date);
            days.push({
                dayNum: i,
                inMonth: true,
                isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === i,
                hasStart: events.some(e => e.type === 'start'),
                hasEnd: events.some(e => e.type === 'end'),
                hasMaintenance: events.some(e => e.type === 'maintenance')
            });
        }

        // End padding to 42
        while (days.length < 42) {
            days.push({ inMonth: false });
        }
        return days;
    }

    // --- MODAL ACTIONS ---
    openBookingModal(booking: any) {
        this.selectedBooking.set(booking);
    }
    closeModal() {
        this.selectedBooking.set(null);
    }

    // Formatters
    getInitials(name: string) {
        return (name || '').substring(0, 2).toUpperCase();
    }
    formatDateShort(dateStr: string) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase();
    }

    formatDateFull(dateStr: string) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // --- FILTERS HELPERS ---
    getSelectedCategoryName() {
        if (this.selectedCategory() === 'all') return 'TODAS LAS CATEGORÍAS';
        const v = this.vehicles().find(v => v.id == this.selectedCategory());
        return v ? v.name.toUpperCase() : 'SELECCIONAR';
    }

    selectCategory(id: string) {
        this.selectedCategory.set(id);
        this.categoryDropdownOpen.set(false);
    }

    // --- SUMMARY MODAL ---
    openDaySummary(day: any) {
        if (!day.inMonth) return;
        const year = this.currentYear();
        const month = this.currentMonth();
        const date = new Date(year, month, day.dayNum);

        const events = this.getEventsForDate(date);

        if (events.length > 0) {
            this.summaryModal.set({
                title: this.formatDateFull(date.toISOString()),
                events: events
            });
        }
    }

    closeSummaryModal() {
        this.summaryModal.set(null);
    }
}
