import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-overview',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <!-- Main Layout -->
    <div class="-m-4 md:-m-8 flex flex-col h-[calc(100%+2rem)] md:h-[calc(100%+4rem)] w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] bg-[#f8fafc]">
        
        <!-- Content Grid -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-4 gap-4 relative z-0 landscape-grid">
            
            <!-- LEFT COLUMN: Active Reservations (Renamed to Reservas) -->
            <div class="w-full lg:w-[240px] xl:w-[260px] h-[300px] lg:h-auto bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden shrink-0 landscape-reservas">
                <div class="px-4 py-3 border-b border-slate-100 bg-white">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-blue-600"></div>
                        <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wide leading-none">Ultimas Reservas</h3>
                        <span class="ml-auto text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{{ activeReservations().length }}</span>
                    </div>
                </div>
                
                <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-slate-50/30">
                    @if (activeReservations().length === 0) {
                        <div class="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                            <p class="text-xs font-medium text-center">Sin reservas activas</p>
                        </div>
                    }
                    
                    @for (booking of activeReservations(); track booking.id) {
                        <div (click)="openBookingModal(booking)" class="relative bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden">
                            <!-- Subtle left accent -->
                            <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div class="pl-1">
                                <!-- Top: Category -->
                                <div class="flex justify-between items-center mb-1.5">
                                    <h4 class="text-[13px] font-black text-slate-700 truncate max-w-[70%] leading-tight group-hover:text-blue-700 transition-colors">
                                        {{ booking.category_name }}
                                    </h4>
                                    @if(booking.plate) {
                                        <span class="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                            {{ booking.plate }}
                                        </span>
                                    } @else {
                                        <span class="text-[9px] font-mono text-slate-400">{{ booking.code }}</span>
                                    }
                                </div>
                                
                                <!-- Bottom: Customer + Date -->
                                <div class="flex justify-between items-end">
                                    <div class="flex items-center gap-1.5 min-w-0 pr-2">
                                        <div class="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shrink-0">
                                            {{ getInitials(booking.customer_name || booking.user_name) }}
                                        </div>
                                        <p class="text-[10px] font-medium text-slate-600 truncate">
                                            {{ booking.customer_name || booking.user_name }}
                                        </p>
                                    </div>
                                    
                                    <div class="text-right shrink-0">
                                        <div class="flex items-center gap-1 justify-end text-[9px] text-slate-400">
                                            <span>Retorno</span>
                                        </div>
                                        <div class="text-[10px] font-bold text-slate-700 leading-none mt-0.5">
                                            {{ formatDateShort(booking.end_date) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            
            <!-- CENTER: Calendar (Expanded) -->
            <div class="flex-1 min-h-[600px] lg:min-h-0 bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden min-w-0 grow-[1.4] landscape-calendar">
                <div class="px-4 py-2 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-blue-600"></div>
                        <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wide leading-none">{{ currentDate().getFullYear() }}</h3>
                    </div>
                    
                    <div class="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                        <!-- Expand Button -->
                        <button (click)="navigateToBookings()" 
                                class="p-1 rounded-md hover:bg-white hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all group border-r border-slate-200 pr-1 mr-0.5" 
                                title="Ver Calendario Completo">
                            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
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

                        <!-- Selector de Mes / Rango (Slim & Contextual) -->
                        <div class="flex items-center gap-0.5">
                            <button (click)="viewMode.set('month')" 
                                [class]="viewMode() === 'month' ? 'bg-white shadow-sm ring-1 ring-slate-200/50 text-blue-600' : 'text-slate-500 hover:bg-white/50'"
                                class="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase transition-all min-w-[60px]">
                                {{ viewMode() === 'month' ? currentMonthName() : 'Mensual' }}
                            </button>
                            
                            <button (click)="viewMode.set('3month')"
                                [class]="viewMode() === '3month' ? 'bg-white shadow-sm ring-1 ring-slate-200/50 text-blue-600' : 'text-slate-500 hover:bg-white/50'"
                                class="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase transition-all min-w-[60px]">
                                {{ viewMode() === '3month' ? getQuarterRange() : 'Trimestral' }}
                            </button>
                            
                            <button (click)="viewMode.set('6month')"
                                [class]="viewMode() === '6month' ? 'bg-white shadow-sm ring-1 ring-slate-200/50 text-blue-600' : 'text-slate-500 hover:bg-white/50'"
                                class="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase transition-all min-w-[60px]">
                                {{ viewMode() === '6month' ? getSemesterRange() : 'Semestral' }}
                            </button>
                        </div>
                        
                        <!-- Filters Button -->
                        <div class="relative ml-1 pl-1 border-l border-slate-200">
                            <button aria-label="Filtros de calendario" (click)="showCalendarFilters.set(!showCalendarFilters())" class="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            </button>

                            @if (showCalendarFilters()) {
                                <div class="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4 animate-scale-in" (click)="$event.stopPropagation()">
                                    <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                                         <h4 class="text-xs font-black text-slate-800 uppercase tracking-wide">Filtros de Calendario</h4>
                                         <button aria-label="Cerrar filtros" (click)="showCalendarFilters.set(false)" class="text-slate-400 hover:text-slate-600"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    </div>
                                    
                                    <div class="space-y-4">
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
                                                    
                                                    <div class="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar animate-scale-in flex flex-col p-1">
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
                                         <div class="space-y-1.5">
                                             <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5 mt-2">Visibilidad de Eventos</label>
                                             
                                             <!-- Retiros Toggle -->
                                             <div (click)="showPickups.set(!showPickups())" class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-slate-50 group select-none" [class.bg-green-50]="showPickups()" [class.border-green-100]="showPickups()">
                                                 <div class="flex items-center gap-2.5">
                                                     <div class="w-6 h-6 rounded-md flex items-center justify-center transition-colors" [class.bg-green-500]="showPickups()" [class.bg-slate-200]="!showPickups()">
                                                         <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                                     </div>
                                                     <span class="text-[10px] font-bold uppercase transition-colors" [class.text-green-800]="showPickups()" [class.text-slate-500]="!showPickups()">Retiros (Inicio)</span>
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
                                                     <span class="text-[10px] font-bold uppercase transition-colors" [class.text-red-800]="showDropoffs()" [class.text-slate-500]="!showDropoffs()">Entregas (Fin)</span>
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
                                                     <span class="text-[10px] font-bold uppercase transition-colors" [class.text-orange-800]="showMaintenance()" [class.text-slate-500]="!showMaintenance()">Mantenimiento</span>
                                                 </div>
                                                 <div class="w-8 h-4 bg-slate-200 rounded-full relative transition-colors" [class.bg-orange-500]="showMaintenance()">
                                                     <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm" [class.translate-x-4]="showMaintenance()"></div>
                                                 </div>
                                             </div>
                                         </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                
                <div class="flex-1 overflow-hidden flex flex-col min-h-0">
                    @if (viewMode() === 'month') {
                        <div class="p-1 h-full flex flex-col min-h-0">
                            <div class="bg-white rounded-lg border border-slate-200 h-full flex flex-col min-h-0 overflow-hidden">
                                <div class="grid grid-cols-7 bg-slate-50 border-b border-slate-200 shrink-0">
                                    @for(dayName of ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']; track $index) {
                                        <div class="py-1 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ dayName }}</div>
                                    }
                                </div>
                                
                                <div class="grid grid-cols-7 gap-px bg-slate-200 flex-1 h-full max-h-full" [style.grid-template-rows]="gridRowsStyle()">
                                    @for (empty of emptyDaysStart(); track $index) {
                                        <div class="bg-slate-50/50"></div>
                                    }
                                    
                                    @for (day of calendarDays(); track day.dateStr) {
                                        <div class="p-1 relative flex flex-col bg-white hover:bg-blue-50/30 transition-colors group overflow-hidden">
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
                                                         (click)="openBookingModal(event.booking)"
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
                        </div>
                    } @else {
                        <!-- MULTI MONTH VIEW (OVERVIEW) -->
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
                                                        @if (day.hasMaintenance) { <span class="w-1 h-1 rounded-full bg-amber-500"></span> }
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
            
            <!-- RIGHT COLUMN: Upcoming (Narrower) -->
            <div class="w-full lg:w-[240px] xl:w-[260px] h-[400px] lg:h-auto flex flex-col gap-4 shrink-0 landscape-right-col">
                <!-- Pickups -->
                <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-100 bg-white">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-green-500"></div>
                            <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wide leading-none">Próximos Retiros</h3>
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-slate-50/30">
                        @if (upcomingPickups().length === 0) {
                             <div class="flex justify-center py-6"><span class="text-xs text-slate-400">Sin retiros</span></div>
                        }
                        @for (booking of upcomingPickups().slice(0, 4); track booking.id) {
                            <div (click)="openBookingModal(booking)" class="relative bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                                <!-- Green accent left -->
                                <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div class="pl-1">
                                    <div class="flex justify-between items-center mb-1.5">
                                        <h4 class="text-[13px] font-black text-slate-700 truncate max-w-[70%] group-hover:text-green-700 transition-colors">
                                            {{ booking.category_name }}
                                        </h4>
                                        <span class="text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                            {{ formatDateShort(booking.start_date) }}
                                        </span>
                                    </div>
                                    
                                    <div class="flex justify-between items-end">
                                        <div class="flex items-center gap-1.5 min-w-0 pr-2">
                                            <div class="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shrink-0">
                                                <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                                            </div>
                                            <p class="text-[11px] font-bold font-mono text-slate-700 truncate">
                                                {{ booking.plate || booking.code || 'SIN PLACA' }}
                                            </p>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <p class="text-[9px] text-slate-400">Hora</p>
                                            <p class="text-[10px] font-bold text-slate-700 leading-none mt-0.5">{{ booking.pickup_time || '10:00' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <!-- Dropoffs -->
                <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-100 bg-white">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-red-500"></div>
                            <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wide leading-none">Próximas Entregas</h3>
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-slate-50/30">
                        @if (upcomingDropoffs().length === 0) {
                             <div class="flex justify-center py-6"><span class="text-xs text-slate-400">Sin entregas</span></div>
                        }
                        @for (booking of upcomingDropoffs().slice(0, 4); track booking.id) {
                            <div (click)="openBookingModal(booking)" class="relative bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm hover:border-red-400 hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                                <!-- Red accent left -->
                                <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div class="pl-1">
                                    <div class="flex justify-between items-center mb-1.5">
                                        <h4 class="text-[13px] font-black text-slate-700 truncate max-w-[70%] group-hover:text-red-700 transition-colors">
                                            {{ booking.category_name }}
                                        </h4>
                                        <span class="text-[9px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                            {{ formatDateShort(booking.end_date) }}
                                        </span>
                                    </div>
                                    
                                    <div class="flex justify-between items-end">
                                        <div class="flex items-center gap-1.5 min-w-0 pr-2">
                                            <div class="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shrink-0">
                                                <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                                            </div>
                                            <p class="text-[11px] font-bold font-mono text-slate-700 truncate">
                                                {{ booking.plate || booking.code || 'SIN PLACA' }}
                                            </p>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <p class="text-[9px] text-slate-400">Hora</p>
                                            <p class="text-[10px] font-bold text-slate-700 leading-none mt-0.5">{{ booking.dropoff_time || '10:00' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Stats - Interactive with Summary Modal -->
        <div class="shrink-0 bg-white border-t border-slate-200 px-5 py-3 landscape-stats">
             <div class="max-w-7xl mx-auto grid grid-cols-6 gap-4 landscape-stats-grid">
                 <!-- 1. RETIROS -->
                 <div class="group cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors" (click)="openSummaryModal('Retiros', stats().upcomingPickups, 'bookings_pickup')">
                    <div class="flex flex-col items-center text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-hover:text-slate-600">Retiros</span>
                        <span class="text-xl font-black text-green-600 transition-transform group-hover:scale-105">{{ stats().upcomingPickups }}</span>
                    </div>
                 </div>

                 <!-- 2. ENTREGAS -->
                 <div class="group cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors" (click)="openSummaryModal('Entregas', stats().upcomingDropoffs, 'bookings_dropoff')">
                    <div class="flex flex-col items-center text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-hover:text-slate-600">Entregas</span>
                        <span class="text-xl font-black text-red-600 transition-transform group-hover:scale-105">{{ stats().upcomingDropoffs }}</span>
                    </div>
                 </div>

                 <!-- 3. MANTENIMIENTO -->
                 <div class="group cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors" (click)="openSummaryModal('Mantenimiento', stats().maintenanceCount, 'maintenance')">
                    <div class="flex flex-col items-center text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-hover:text-slate-600">Mantenimiento</span>
                        <span class="text-xl font-black text-orange-500 transition-transform group-hover:scale-105">{{ stats().maintenanceCount }}</span>
                    </div>
                 </div>

                 <!-- 4. RESERVAS (Old En Ruta) -->
                 <div class="group cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors" (click)="openSummaryModal('Reservas', stats().reservedToday, 'active')">
                    <div class="flex flex-col items-center text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-hover:text-slate-600">Reservas</span>
                        <span class="text-xl font-black text-blue-600 transition-transform group-hover:scale-105">{{ stats().reservedToday }}</span>
                    </div>
                 </div>

                 <!-- 5. DISPONIBLES (Old Libres) -->
                 <div class="group cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors" (click)="openSummaryModal('Disponibles', stats().availableCount, 'available')">
                    <div class="flex flex-col items-center text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-hover:text-slate-600">Disponibles</span>
                        <span class="text-xl font-black text-purple-600 transition-transform group-hover:scale-105">{{ stats().availableCount }}</span>
                    </div>
                 </div>

                 <!-- 6. INGRESOS MENSUALES -->
                 <div class="group cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors" (click)="openSummaryModal('Ingresos del Mes', stats().totalRevenue, 'revenue')">
                    <div class="flex flex-col items-center text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-hover:text-slate-600">Ingresos Mes</span>
                        <span class="text-xl font-black text-slate-800 transition-transform group-hover:scale-105">\${{ stats().totalRevenue | number:'1.0-0' }}</span>
                    </div>
                 </div>
             </div>
        </div>
        
        <!-- BOOKING MODAL (Existing) -->
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

        <!-- SUMMARY MODAL (Grid View for Items) -->
        @if (summaryModal()) {
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" (click)="closeSummaryModal()">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[85vh]" (click)="$event.stopPropagation()">
                    <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                        <h3 class="text-sm font-black text-slate-800 uppercase tracking-wide">{{ summaryModal().title }}</h3>
                        <button aria-label="Cerrar" (click)="closeSummaryModal()" class="text-slate-400 hover:text-slate-600">
                             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div class="p-6 overflow-y-auto custom-scrollbar">
                         <div class="text-center mb-3">
                            <div class="text-xl font-black mb-0.5" [ngClass]="{
                                'text-green-600': summaryModal().title === 'Retiros',
                                'text-red-600': summaryModal().title === 'Entregas' || summaryModal().title === 'Mantenimiento',
                                'text-blue-600': summaryModal().title === 'Reservas',
                                'text-purple-600': summaryModal().title === 'Disponibles',
                                'text-slate-800': summaryModal().title === 'Ingresos' || summaryModal().title === 'Ingresos del Mes'
                            }">{{ summaryModal().value | number: (summaryModal().title === 'Ingresos' || summaryModal().title === 'Ingresos del Mes' ? '1.0-0' : '') }}</div>
                            <p class="text-[10px] text-slate-400 font-medium">Elementos activos</p>
                        </div>
                        
                        <!-- Grid Layout for Items -->
                        @if(summaryModal().title === 'Ingresos' || summaryModal().title === 'Ingresos del Mes') {
                            <div class="text-center text-slate-400 text-sm py-8">
                                Ingresos del mes actual basados en reservas confirmadas.
                            </div>
                        } @else {
                             <!-- Available and others use the same grid -->
                            <div class="grid grid-cols-2 gap-2">
                               @for(item of getSummaryItems(summaryModal().type); track $index) {
                                   <div class="p-2 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col hover:border-blue-400 transition-colors cursor-pointer min-h-[60px]" (click)="openBookingModal(item); closeSummaryModal()">
                                        
                                        <!-- DISPONIBLE -->
                                        <!-- DISPONIBLE -->
                                        @if(summaryModal().type === 'available') {
                                             <div class="flex items-center justify-between h-full p-0.5">
                                                 <span class="text-[9px] font-black text-slate-700 uppercase leading-none">{{ item.category_name }}</span>
                                                 
                                                 <div class="flex flex-col items-end gap-0.5">
                                                     <span class="text-[8px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">{{ item.plate }}</span>
                                                     <span class="text-[8px] font-bold text-white bg-purple-500 px-1.5 py-0.5 rounded shadow-sm">DISP</span>
                                                 </div>
                                             </div>
                                        } @else {
                                            <!-- OTROS -->
                                            <div class="flex flex-col h-full justify-between p-0.5">
                                                <div class="flex justify-between items-start w-full mb-1">
                                                     <span class="text-[9px] font-black text-slate-700 uppercase truncate pr-1 max-w-[60%] leading-tight">{{ item.category_name }}</span>
                                                     
                                                     <div class="flex items-center gap-1 shrink-0">
                                                         <span class="text-[8px] font-mono text-slate-500 mr-0.5">{{ item.plate || item.code }}</span>
                                                         
                                                         @if(summaryModal().title === 'Mantenimiento') {
                                                             <div class="text-orange-500"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                                                         } @else {
                                                             <div class="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] shadow-sm" [ngClass]="{
                                                                 'bg-green-500': summaryModal().title === 'Retiros',
                                                                 'bg-red-500': summaryModal().title === 'Entregas',
                                                                 'bg-blue-500': summaryModal().title === 'Reservas'
                                                             }">
                                                                  @if(summaryModal().title === 'Retiros') { <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> }
                                                                  @else if(summaryModal().title === 'Entregas') { <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg> }
                                                                  @else { <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> }
                                                             </div>
                                                         }
                                                     </div>
                                                </div>

                                                <div class="mt-auto flex justify-between items-end border-t border-slate-50 pt-1">
                                                    <span class="text-[9px] text-slate-400 font-medium tracking-tight">
                                                        @if(summaryModal().title === 'Retiros') { {{ item.pickup_time || '10:00' }} }
                                                        @else { {{ formatDateShort(item.end_date) }} }
                                                    </span>
                                                    <span class="text-[9px] text-slate-600 font-bold truncate max-w-[65%] text-right">
                                                        {{ (item.customer_name || item.user_name || 'Cliente').split(' ')[0] }}
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                   </div>
                               }
                            </div>
                            @if(getSummaryItems(summaryModal().type).length === 0) {
                                <div class="text-center text-xs text-slate-400 italic py-4">No hay ítems para mostrar.</div>
                            }
                        }
                    </div>
                    
                    <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-center shrink-0">
                        <button (click)="closeSummaryModal()" class="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest">Cerrar Listado</button>
                    </div>
                </div>
            </div>
        }
    </div>
    `,
    styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        @media (max-width: 1023px) and (orientation: landscape) {
            .landscape-grid {
                display: grid !important;
                grid-template-columns: 4fr 3fr 3fr;
                grid-auto-flow: dense;
                gap: 0.5rem !important;
                padding: 0.5rem !important;
            }
            .landscape-calendar {
                grid-column: 1 / -1;
                grid-row: 1;
                min-height: 400px !important;
            }
            .landscape-reservas {
                grid-column: 1;
                grid-row: 2;
                height: 300px !important;
            }
            .landscape-right-col {
                display: contents !important;
            }
            /* Pickups (Retiros) in 3rd column */
            .landscape-right-col > div:nth-child(1) {
                grid-column: 3;
                grid-row: 2;
                height: 300px !important;
            }
            /* Dropoffs (Entregas) in 2nd column */
            .landscape-right-col > div:nth-child(2) {
                grid-column: 2;
                grid-row: 2;
                height: 300px !important;
            }
            .landscape-stats {
                padding: 0.25rem 1rem !important;
            }
            .landscape-stats-grid {
                gap: 0.25rem !important;
            }
            .landscape-stats .text-xl {
                font-size: 1rem !important;
                line-height: 1.2 !important;
            }
            .landscape-stats .text-\\[10px\\] {
                font-size: 8px !important;
            }
            .landscape-stats .p-2 {
                padding: 0.25rem !important;
            }
        }

        /* =========================================================
           MOBILE PORTRAIT (Vertical) — max-width: 767px + portrait
           ========================================================= */
        @media (max-width: 767px) and (orientation: portrait) {
            /* Stack all columns vertically, full width */
            .landscape-grid {
                display: flex !important;
                flex-direction: column !important;
                padding: 0.75rem !important;
                gap: 0.75rem !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
            }
            /* Reservations panel: compact fixed height */
            .landscape-reservas {
                width: 100% !important;
                height: 220px !important;
                min-height: unset !important;
                flex-shrink: 0 !important;
            }
            /* Calendar: taller to be readable vertically */
            .landscape-calendar {
                width: 100% !important;
                min-height: 420px !important;
                flex-shrink: 0 !important;
            }
            /* Right panel (pickups/dropoffs): horizontal scroll row */
            .landscape-right-col {
                width: 100% !important;
                display: flex !important;
                flex-direction: row !important;
                gap: 0.75rem !important;
                flex-shrink: 0 !important;
            }
            .landscape-right-col > div {
                flex: 1 !important;
                height: 220px !important;
                min-width: 0 !important;
            }
            /* Reduce stat card padding */
            .landscape-stats {
                padding: 0.5rem 0.75rem !important;
            }
            .landscape-stats .text-xl { 
                font-size: 1.1rem !important; 
            }
        }

        /* =========================================================
           MOBILE LANDSCAPE (Horizontal) — max-width: 900px + landscape
           ========================================================= */
        @media (max-width: 900px) and (orientation: landscape) {
            /* 2-column layout: reservas | calendar with right panels below */
            .landscape-grid {
                display: grid !important;
                grid-template-columns: 190px 1fr !important;
                grid-template-rows: 1fr auto !important;
                gap: 0.4rem !important;
                padding: 0.4rem !important;
                height: 100% !important;
                overflow: hidden !important;
            }
            /* Reservations: left column, full height */
            .landscape-reservas {
                grid-column: 1 !important;
                grid-row: 1 / 3 !important;
                height: 100% !important;
            }
            /* Calendar: right column, top row */
            .landscape-calendar {
                grid-column: 2 !important;
                grid-row: 1 !important;
                min-height: 0 !important;
            }
            /* Right panels (pickup/dropoff): horizontal row below calendar */
            .landscape-right-col {
                grid-column: 2 !important;
                grid-row: 2 !important;
                display: flex !important;
                flex-direction: row !important;
                gap: 0.4rem !important;
                height: 160px !important;
            }
            .landscape-right-col > div {
                flex: 1 !important;
                height: 100% !important;
            }
            /* Compact stats bar */
            .landscape-stats {
                padding: 0.15rem 0.75rem !important;
            }
            .landscape-stats-grid { gap: 0.15rem !important; }
            .landscape-stats .text-xl { font-size: 0.9rem !important; }
            .landscape-stats .text-\\[10px\\] { font-size: 7px !important; }
            .landscape-stats .p-2 { padding: 0.15rem !important; }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminOverviewComponent {
    private apiService = inject(ApiService);
    private router = inject(Router);

    allBookings = signal<any[]>([]);
    selectedBooking = signal<any>(null);
    summaryModal = signal<any>(null); // For stats popups
    allInstances = signal<any[]>([]); // Store all vehicle instances
    availableInstances = signal<any[]>([]); // Store specifically filtered available intances

    // View Range Helper for Stats
    viewRange = computed(() => {
        const d = this.currentDate();
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const mode = this.viewMode();
        let monthCount = 1;
        if (mode === '3month') monthCount = 3;
        if (mode === '6month') monthCount = 6;
        
        const end = new Date(d.getFullYear(), d.getMonth() + monthCount, 0, 23, 59, 59);
        return {
            start,
            end,
            startStr: start.toISOString().split('T')[0],
            endStr: end.toISOString().split('T')[0],
            month: d.getMonth(),
            year: d.getFullYear()
        };
    });

    stats = computed(() => {
        const range = this.viewRange();
        const bookings = this.allBookings();
        const today = new Date().toISOString().split('T')[0];

        // 1. Pickups in Period
        const upcomingPickups = bookings.filter(b => {
            const start = (b.start_date || '').substring(0, 10);
            return start >= range.startStr && start <= range.endStr && this.isRealBooking(b.status);
        }).length;

        // 2. Dropoffs in Period
        const upcomingDropoffs = bookings.filter(b => {
            const end = (b.end_date || '').substring(0, 10);
            return end >= range.startStr && end <= range.endStr && this.isRealBooking(b.status);
        }).length;

        // 3. Maintenance in Period (overlapping the month/period)
        const maintenanceCount = bookings.filter(b => {
            const start = (b.start_date || '').substring(0, 10);
            const end = (b.end_date || '').substring(0, 10);
            const isMaint = b.status === 'maintenance' || b.status === 'offline';
            return isMaint && (end >= range.startStr && start <= range.endStr);
        }).length;

        // 4. Active/Reserved in Period
        const reservedToday = bookings.filter(b => {
            const start = (b.start_date || '').substring(0, 10);
            const end = (b.end_date || '').substring(0, 10);
            return this.isRealBooking(b.status) && (end >= range.startStr && start <= range.endStr);
        }).length;

        // 5. Revenue for the period (based on start date)
        const totalRevenue = bookings
            .filter(b => {
                if (!this.isRealBooking(b.status)) return false;
                const start = (b.start_date || '').substring(0, 10);
                return start >= range.startStr && start <= range.endStr;
            })
            .reduce((sum, b) => sum + Number(b.total_price || 0), 0);

        // 6. Availability - We keep this reflecting ACTUAL TODAY availability 
        // because "future availability" is a complex projection.
        // However, we increment load if needed, but for now we use the signal updated from calculateStats
        const availableCount = this.availableInstances().length;

        return {
            upcomingPickups,
            upcomingDropoffs,
            maintenanceCount,
            reservedToday,
            availableCount,
            totalRevenue
        };
    });

    currentDate = signal(new Date());
    currentMonth = computed(() => this.currentDate().getMonth());
    currentYear = computed(() => this.currentDate().getFullYear());

    // Filters State
    showCalendarFilters = signal(false);
    categoryDropdownOpen = signal(false);
    selectedCategory = signal<string>('all');
    showPickups = signal(true);
    showDropoffs = signal(true);
    showMaintenance = signal(true);
    vehicles = signal<any[]>([]);

    currentMonthName = computed(() => {
        return new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(this.currentDate());
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

    navigateToBookings() {
        this.router.navigate(['/admin/bookings']);
    }

    viewMode = signal<'month' | '3month' | '6month'>('month');

    monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];


    emptyDaysStart = computed(() => {
        const year = this.currentYear();
        const month = this.currentMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        return Array(firstDayIndex).fill(null);
    });

    // Calcula el número de semanas necesarias para el mes (5 o 6)
    weeksNeeded = computed(() => {
        const year = this.currentYear();
        const month = this.currentMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalCells = firstDayIndex + daysInMonth;
        return Math.ceil(totalCells / 7);
    });

    // Celdas vacías al final para completar solo las semanas necesarias
    emptyDaysEnd = computed(() => {
        const year = this.currentYear();
        const month = this.currentMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalCells = this.weeksNeeded() * 7; // Solo las semanas necesarias
        const usedCells = firstDayIndex + daysInMonth;
        const emptyCells = totalCells - usedCells;
        return Array(Math.max(0, emptyCells)).fill(null);
    });

    // Estilo dinámico para las filas del grid
    gridRowsStyle = computed(() => {
        return `repeat(${this.weeksNeeded()}, minmax(0, 1fr))`;
    });

    // Helper for strict status checking
    private isRealBooking(status: string | null | undefined): boolean {
        const s = (status || '').toLowerCase();
        return ['confirmed', 'pending', 'booked', 'active'].includes(s);
    }

    activeReservations = computed(() => {
        const range = this.viewRange();
        return this.allBookings().filter(b => {
            const start = (b.start_date || '').substring(0, 10);
            const end = (b.end_date || '').substring(0, 10);
            if (!this.isRealBooking(b.status)) return false;
            return end >= range.startStr && start <= range.endStr;
        });
    });

    upcomingPickups = computed(() => {
        const range = this.viewRange();
        return this.allBookings()
            .filter(b => {
                const start = (b.start_date || '').substring(0, 10);
                if (!this.isRealBooking(b.status)) return false; 
                return start >= range.startStr && start <= range.endStr;
            })
            .sort((a, b) => a.start_date.localeCompare(b.start_date));
    });

    upcomingDropoffs = computed(() => {
        const range = this.viewRange();
        return this.allBookings()
            .filter(b => {
                const end = (b.end_date || '').substring(0, 10);
                if (!this.isRealBooking(b.status)) return false; 
                return end >= range.startStr && end <= range.endStr;
            })
            .sort((a, b) => a.end_date.localeCompare(b.end_date));
    });

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
                isBooked: events.some(e => e.type === 'booked' || e.type === 'start' || e.type === 'end'),
                isMaintenance: events.some(e => e.type === 'maintenance')
            });
        }
        return days;
    });

    getEventsForDate(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const dayNum = date.getDate();
        const dateStr = this.formatDateFromParts(year, month, dayNum);
        const bookings = this.allBookings();
        const events: any[] = [];
        const catFilter = this.selectedCategory();

        bookings.forEach(b => {
            if (catFilter !== 'all' && b.category_id != catFilter) return;

            const startStr = (b.start_date || '').substring(0, 10);
            const endStr = (b.end_date || '').substring(0, 10);
            const isMaint = b.status === 'maintenance' || b.status === 'offline';
            const plateInfo = b.plate || b.code || 'Sin Placa';

            if (isMaint && !this.showMaintenance()) return;

            if (dateStr === startStr) {
                if (!isMaint && this.showPickups()) {
                    events.push({
                        type: 'start',
                        title: (b.category_name || 'PICKUP'),
                        booking: b,
                        tooltip: `Retiro: ${b.customer_name || b.user_name || ''}\nPlaca: ${plateInfo}`
                    });
                } else if (isMaint) {
                    events.push({
                        type: 'maintenance',
                        title: 'Mant.',
                        booking: b,
                        tooltip: `Mantenimiento\nPlaca: ${plateInfo}`
                    });
                }
            } else if (dateStr === endStr && !isMaint && this.showDropoffs()) {
                events.push({
                    type: 'end',
                    title: 'Entr.',
                    booking: b,
                    tooltip: `Entrega: ${b.customer_name || b.user_name || ''}\nPlaca: ${plateInfo}`
                });
            }

            if (dateStr >= startStr && dateStr <= endStr) {
                if (!isMaint && dateStr !== startStr && dateStr !== endStr) {
                    events.push({
                        type: 'booked',
                        booking: b,
                        tooltip: `Reserva: ${b.customer_name || b.user_name || 'Cliente'}\nPlaca: ${plateInfo}`
                    });
                }
            }
        });
        return events;
    }

    constructor() {
        this.loadData();
    }

    loadData() {
        this.apiService.adminGetBookings().subscribe(bookings => {
            this.allBookings.set(bookings);
            this.calculateStats(bookings);
        });
    }

    calculateStats(bookings: any[]) {
        const today = new Date().toISOString().split('T')[0];

        // Prepare to find busy plates for Physical Availability calculation
        // (This remains based on TODAY because physical availability is a "now" metric)
        const busyPlates = new Set<string>();
        bookings.forEach(b => {
            const start = (b.start_date || '').substring(0, 10);
            const end = (b.end_date || '').substring(0, 10);
            if (today >= start && today <= end && this.isRealBooking(b.status)) {
                if (b.plate) busyPlates.add(b.plate);
            }
        });

        this.apiService.adminGetVehicles().subscribe(categories => {
            this.vehicles.set(categories);

            let collectedInstances: any[] = [];
            let loadedCats = 0;
            if (categories.length === 0) return;

            categories.forEach(cat => {
                this.apiService.adminGetInstances(cat.id).subscribe(instances => {
                    const enriched = instances.map(i => ({
                        ...i,
                        category_name: cat.name,
                        image_url: cat.image_url,
                        category_id: cat.id
                    }));
                    collectedInstances.push(...enriched);
                    loadedCats++;

                    if (loadedCats === categories.length) {
                        this.allInstances.set(collectedInstances);

                        const availableList = collectedInstances.filter(i => {
                            if (i.status === 'maintenance' || i.status === 'offline') return false;
                            if (i.plate && busyPlates.has(i.plate)) return false;
                            return true;
                        });

                        this.availableInstances.set(availableList);
                    }
                });
            });
        });
    }

    changeMonth(delta: number) {
        const newDate = new Date(this.currentDate());
        newDate.setMonth(newDate.getMonth() + delta);
        this.currentDate.set(newDate);
    }

    openBookingModal(booking: any) {
        if (!booking) return;
        this.selectedBooking.set(booking);
    }

    openSummaryModal(title: string, value: number, type: string) {
        this.summaryModal.set({ title, value, type });
    }

    closeModal() {
        this.selectedBooking.set(null);
    }

    closeSummaryModal() {
        this.summaryModal.set(null);
    }

    getSummaryItems(type: string): any[] {
        const range = this.viewRange();
        const bookings = this.allBookings();

        switch (type) {
            case 'bookings_pickup':
                return bookings.filter(b => {
                    const start = (b.start_date || '').substring(0, 10);
                    return start >= range.startStr && start <= range.endStr && this.isRealBooking(b.status);
                }).slice(0, 15);
            case 'bookings_dropoff':
                return bookings.filter(b => {
                    const end = (b.end_date || '').substring(0, 10);
                    return end >= range.startStr && end <= range.endStr && this.isRealBooking(b.status);
                }).slice(0, 15);
            case 'maintenance':
                return bookings.filter(b => {
                    const start = (b.start_date || '').substring(0, 10);
                    const end = (b.end_date || '').substring(0, 10);
                    const isMaint = b.status === 'maintenance' || b.status === 'offline';
                    return isMaint && (end >= range.startStr && start <= range.endStr);
                });
            case 'active': // Reservas
                return this.activeReservations().slice(0, 15);
            case 'available':
                return this.availableInstances().slice(0, 15);
            default:
                return [];
        }
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
    }

    formatDateShort(dateStr: string): string {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
    }

    formatDateFull(dateStr: string): string {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (dateStr.length === 10) {
                const d = new Date(dateStr + 'T00:00:00');
                return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
            }
            return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
        } catch (e) {
            return dateStr;
        }
    }

    getInitials(name: string): string {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    private formatDateFromParts(year: number, month: number, day: number): string {
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
    }

    getQuarterRange(): string {
        const month = this.currentDate().getMonth();
        const startMonthIndex = Math.floor(month / 3) * 3;
        const endMonthIndex = startMonthIndex + 2;

        const start = this.monthNames[startMonthIndex].substring(0, 3).toUpperCase();
        const end = this.monthNames[Math.min(endMonthIndex, 11)].substring(0, 3).toUpperCase();
        return `${start} - ${end}`;
    }

    getSemesterRange(): string {
        const month = this.currentDate().getMonth();
        const startMonthIndex = Math.floor(month / 6) * 6;
        const endMonthIndex = startMonthIndex + 5;

        const start = this.monthNames[startMonthIndex].substring(0, 3).toUpperCase();
        const end = this.monthNames[Math.min(endMonthIndex, 11)].substring(0, 3).toUpperCase();
        return `${start} - ${end}`;
    }

    getViewOffsets(): number[] {
        const mode = this.viewMode();
        if (mode === '3month') return [0, 1, 2];
        if (mode === '6month') return [0, 1, 2, 3, 4, 5];
        return [0];
    }

    getMonthNameByOffset(offset: number): string {
        const date = new Date(this.currentDate());
        date.setMonth(date.getMonth() + offset);
        return `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }

    getMiniMonthDays(offset: number): any[] {
        const baseDate = new Date(this.currentDate());
        baseDate.setMonth(baseDate.getMonth() + offset);
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days = [];
        // Prev month padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            days.push({ dayNum: prevMonthLastDay - i, inMonth: false });
        }

        // Current month
        const today = new Date();
        const isTodayMonth = today.getFullYear() === year && today.getMonth() === month;

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const events = this.getEventsForDate(date);
            days.push({
                dayNum: i,
                inMonth: true,
                isToday: isTodayMonth && today.getDate() === i,
                hasStart: events.some(e => e.type === 'start'),
                hasEnd: events.some(e => e.type === 'end'),
                hasMaintenance: events.some(e => e.type === 'maintenance'),
                hasBooking: events.some(e => e.type === 'booked')
            });
        }

        // Next month padding
        const total = days.length;
        const remaining = 42 - total;
        for (let i = 1; i <= remaining; i++) {
            days.push({ dayNum: i, inMonth: false });
        }

        return days;
    }

    navigateView(direction: number) {
        const mode = this.viewMode();
        let delta = direction;

        if (mode === '3month') {
            delta = direction * 3;
        } else if (mode === '6month') {
            delta = direction * 6;
        }

        this.changeMonth(delta);
    }
    // Helper for Custom Select
    getSelectedCategoryName() {
        if (this.selectedCategory() === 'all') return 'TODAS LAS CATEGORÍAS';
        const v = this.vehicles().find(v => v.id == this.selectedCategory());
        return v ? v.name.toUpperCase() : 'SELECCIONAR';
    }

    selectCategory(id: string) {
        this.selectedCategory.set(id);
        this.categoryDropdownOpen.set(false);
    }
}
