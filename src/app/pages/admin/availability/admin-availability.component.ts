import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { forkJoin } from 'rxjs';

import { CalendarComponent } from '../../../../components/calendar/calendar.component';

@Component({
    selector: 'app-admin-availability',
    standalone: true,
    imports: [CommonModule, FormsModule, CalendarComponent],
    template: `
    <div class="flex flex-col h-full bg-transparent p-0 relative">
      
      <!-- MAIN CONTENT: 70/30 GRID -->
      <div class="flex-1 flex flex-col lg:flex-row gap-1 min-h-0 overflow-hidden landscape-avail-grid">
         
         <!-- LEFT: SCHEDULE (70%) -->
         <div class="flex-[7] bg-white border-r border-slate-200 flex flex-col overflow-hidden landscape-avail-schedule">
             
             <!-- Top Control Bar -->
             <div class="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                <!-- Left: Filters -->
                 <div class="flex items-center gap-3">
                      <!-- Category Filter (Custom Dropdown) -->
                      <div class="relative group">
                          <button (click)="isCategoryOpen.set(!isCategoryOpen()); isStatusOpen.set(false); isDatePickerOpen.set(false); $event.stopPropagation()"
                                  class="flex items-center justify-between gap-2 pl-3 pr-2 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer hover:bg-white transition-all uppercase tracking-wide min-w-[170px]">
                              <span>{{ categoryFilter() === 'all' ? 'CATEGORÍAS' : categoryFilter() }}</span>
                              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          
                          @if(isCategoryOpen()) {
                              <div class="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-30 animate-fade-in max-h-[300px] overflow-y-auto custom-scrollbar">
                                   <button (click)="categoryFilter.set('all'); isCategoryOpen.set(false)" 
                                           class="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors uppercase flex items-center justify-between"
                                           [class.text-blue-600]="categoryFilter() === 'all'"
                                           [class.bg-blue-50]="categoryFilter() === 'all'">
                                       TODOS (CATEGORÍAS)
                                       @if(categoryFilter() === 'all') { <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> }
                                   </button>
                                   @for (cat of getCategories(); track cat) {
                                       <button (click)="categoryFilter.set(cat); isCategoryOpen.set(false)"
                                               class="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors uppercase flex items-center justify-between"
                                               [class.text-blue-600]="categoryFilter() === cat"
                                               [class.bg-blue-50]="categoryFilter() === cat">
                                           {{ cat }}
                                           @if(categoryFilter() === cat) { <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> }
                                       </button>
                                   }
                              </div>
                              <div class="fixed inset-0 z-20" (click)="isCategoryOpen.set(false)"></div>
                          }
                      </div>

                      <!-- Status Filter (Custom Dropdown) -->
                      <div class="relative group">
                          <button (click)="isStatusOpen.set(!isStatusOpen()); isCategoryOpen.set(false); isDatePickerOpen.set(false); $event.stopPropagation()"
                                  class="flex items-center justify-between gap-2 pl-3 pr-2 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer hover:bg-white transition-all uppercase tracking-wide min-w-[150px]">
                              <span>
                                @switch(statusFilter()) {
                                    @case('all') { ESTADOS }
                                    @case('booked') { EN CURSO }
                                    @case('available') { DISPONIBLE }
                                    @case('maintenance') { MANTENIMIENTO }
                                }
                              </span>
                              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                          </button>

                           @if(isStatusOpen()) {
                              <div class="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-30 animate-fade-in">
                                  <button (click)="statusFilter.set('all'); isStatusOpen.set(false)" class="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors uppercase flex items-center justify-between" [class.text-blue-600]="statusFilter() === 'all'" [class.bg-blue-50]="statusFilter() === 'all'">
                                      TODOS (ESTADOS)
                                      @if(statusFilter() === 'all') { <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> }
                                  </button>
                                  <button (click)="statusFilter.set('booked'); isStatusOpen.set(false)" class="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors uppercase flex items-center justify-between" [class.text-blue-600]="statusFilter() === 'booked'" [class.bg-blue-50]="statusFilter() === 'booked'">
                                      EN CURSO
                                      @if(statusFilter() === 'booked') { <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> }
                                  </button>
                                  <button (click)="statusFilter.set('available'); isStatusOpen.set(false)" class="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors uppercase flex items-center justify-between" [class.text-blue-600]="statusFilter() === 'available'" [class.bg-blue-50]="statusFilter() === 'available'">
                                      DISPONIBLE
                                      @if(statusFilter() === 'available') { <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> }
                                  </button>
                                  <button (click)="statusFilter.set('maintenance'); isStatusOpen.set(false)" class="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors uppercase flex items-center justify-between" [class.text-blue-600]="statusFilter() === 'maintenance'" [class.bg-blue-50]="statusFilter() === 'maintenance'">
                                      MANTENIMIENTO
                                      @if(statusFilter() === 'maintenance') { <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> }
                                  </button>
                              </div>
                              <div class="fixed inset-0 z-20" (click)="isStatusOpen.set(false)"></div>
                          }
                      </div>
                 </div>

                <!-- Right: Week Navigation & Picker -->
                <div class="relative z-20 min-w-[280px]">
                    <div class="flex items-center gap-2 bg-slate-50 rounded-lg p-0.5 border border-slate-200 shadow-sm w-full" (click)="toggleDatePicker(); isCategoryOpen.set(false); isStatusOpen.set(false)">
                          <button aria-label="Semana anterior" (click)="changeWeek(-1); $event.stopPropagation()" class="p-1 hover:bg-white hover:text-slate-800 rounded-md transition-all text-slate-500 hover:shadow-sm group shrink-0">
                              <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          
                          <!-- Main Label (Month Year only) -->
                          <div class="flex-1 flex items-center justify-center px-2 cursor-pointer hover:bg-white rounded-md transition-colors py-1.5 h-full" title="Seleccionar Fecha">
                              <span class="text-xs font-black text-slate-700 uppercase tracking-widest leading-none flex items-center gap-2">
                                  {{ currentMonthName() }} {{ currentYear() }}
                                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                              </span>
                          </div>

                          <button aria-label="Semana siguiente" (click)="changeWeek(1); $event.stopPropagation()" class="p-1 hover:bg-white hover:text-slate-800 rounded-md transition-all text-slate-500 hover:shadow-sm group shrink-0">
                              <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
                          </button>
                    </div>

                    <!-- Date Picker Overlay -->
                    @if (isDatePickerOpen()) {
                        <div class="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-full animate-fade-in origin-top-right z-50" (click)="$event.stopPropagation()">
                             
                             <!-- Picker Header (Dropdowns) -->
                             <div class="flex gap-2 mb-4">
                                 <!-- Month Picker -->
                                 <div class="relative flex-1 group">
                                     <button (click)="isMonthPickerOpen.set(!isMonthPickerOpen()); isYearPickerOpen.set(false); $event.stopPropagation()"
                                             class="w-full flex items-center justify-between pl-3 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 uppercase hover:bg-slate-100 transition-colors">
                                         <span>{{ months[pickerDate().getMonth()] }}</span>
                                         <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                     </button>

                                      @if (isMonthPickerOpen()) {
                                         <div class="absolute top-full left-0 mt-1 w-full bg-slate-50 rounded-lg shadow-xl border border-slate-200 max-h-[200px] overflow-y-auto custom-scrollbar z-30">
                                             @for (m of months; track $index) {
                                                 <button (click)="setPickerMonth($index); isMonthPickerOpen.set(false)"
                                                         class="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-600 hover:text-white transition-colors uppercase"
                                                         [class.bg-blue-600]="$index === pickerDate().getMonth()"
                                                         [class.text-white]="$index === pickerDate().getMonth()">
                                                     {{ m }}
                                                 </button>
                                             }
                                         </div>
                                         <div class="fixed inset-0 z-20" (click)="isMonthPickerOpen.set(false)"></div>
                                      }
                                 </div>

                                 <!-- Year Picker -->
                                 <div class="relative w-28 group">
                                     <button (click)="isYearPickerOpen.set(!isYearPickerOpen()); isMonthPickerOpen.set(false); $event.stopPropagation()"
                                             class="w-full flex items-center justify-between pl-3 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                                         <span>{{ pickerDate().getFullYear() }}</span>
                                         <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                     </button>

                                     @if (isYearPickerOpen()) {
                                         <div class="absolute top-full left-0 mt-1 w-full bg-slate-50 rounded-lg shadow-xl border border-slate-200 max-h-[200px] overflow-y-auto custom-scrollbar z-30">
                                             @for (y of availableYears(); track y) {
                                                 <button (click)="setPickerYear(y); isYearPickerOpen.set(false)"
                                                         class="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-600 hover:text-white transition-colors"
                                                         [class.bg-blue-600]="y === pickerDate().getFullYear()"
                                                         [class.text-white]="y === pickerDate().getFullYear()">
                                                     {{ y }}
                                                 </button>
                                             }
                                         </div>
                                          <div class="fixed inset-0 z-20" (click)="isYearPickerOpen.set(false)"></div>
                                     }
                                 </div>
                             </div>
                             
                             <!-- Days Grid -->
                             <div class="grid grid-cols-7 gap-y-1 gap-x-0 text-[10px] font-bold text-center text-slate-400 mb-2">
                                 <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
                             </div>
                             <div class="grid grid-cols-7 gap-y-1 gap-x-0">
                                 @for (day of pickerDays(); track $index) {
                                     <div class="aspect-square flex items-center justify-center text-xs font-medium cursor-pointer relative group isolation-auto"
                                          [class.text-slate-300]="!day.isCurrentMonth"
                                          [class.text-slate-700]="day.isCurrentMonth"
                                          (click)="selectWeekFromPicker(day.date)"
                                          (mouseenter)="hoverDate.set(day.date)"
                                          (mouseleave)="hoverDate.set(null)">
                                         
                                         <!-- Selection/Hover Background Layer -->
                                         @if (isDateInSelectedWeek(day.date) || isDateInHoverWeek(day.date)) {
                                             <div class="absolute inset-y-0 w-full bg-blue-100/50 z-[-1]"
                                                  [class.rounded-l-lg]="day.date.getDay() === 1"
                                                  [class.rounded-r-lg]="day.date.getDay() === 0"
                                                  [class.bg-blue-600]="isDateInSelectedWeek(day.date)"
                                                  [class.bg-blue-100]="!isDateInSelectedWeek(day.date)"></div>
                                         }
                                         
                                         <span class="relative z-10" 
                                               [class.text-white]="isDateInSelectedWeek(day.date)"
                                               [class.font-bold]="isDateInSelectedWeek(day.date)">
                                             {{ day.dayNum }}
                                         </span>
                                     </div>
                                 }
                             </div>
                        </div>
                        <div class="fixed inset-0 z-10" (click)="isDatePickerOpen.set(false)"></div>
                    }
                </div>
             </div>

             <!-- Table Header -->
             <div class="grid grid-cols-[50px_90px_70px_repeat(7,1fr)] bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider shrink-0">
                 
                 <!-- Status Header -->
                 <div class="p-2 border-r border-slate-200 flex items-center justify-center text-slate-400">
                     <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 
                 <div class="p-2 border-r border-slate-100 flex items-center pl-3">Categoría</div>
                 <div class="p-2 border-r border-slate-100 flex items-center pl-3">Placa</div>
                 
                 @for (day of weekDays(); track day.date) {
                     <div class="p-1 text-center border-r border-slate-100 flex flex-col items-center justify-center h-full min-h-[30px]" 
                           [class.bg-blue-50]="day.isToday" 
                           [class.text-blue-700]="day.isToday"
                           [class.border-blue-100]="day.isToday">
                          <span class="text-[10px] font-black leading-none">{{ day.name }} {{ day.dayNum }}</span>
                      </div>
                 }
             </div>

             <!-- Table Body -->
             <div class="flex-1 overflow-y-auto custom-scrollbar">
                 @for (row of availabilityData(); track row.vehicle.id) {
                     <div class="grid grid-cols-[50px_90px_70px_repeat(7,1fr)] border-b border-slate-100 hover:bg-slate-50/50 transition-colors group text-xs font-medium text-slate-700 items-stretch min-h-[55px] cursor-pointer" 
                          (click)="selectVehicle(row.vehicle)"
                          [class.bg-blue-50]="selectedVehicle()?.id === row.vehicle.id">
                         
                          <!-- Status Dot Only -->
                          <div class="flex items-center justify-center border-r border-slate-100" [class.bg-orange-50]="row.currentStatus === 'maintenance'">
                              <div class="w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-white" [class.bg-blue-500]="row.currentStatus === 'booked'" [class.bg-green-500]="row.currentStatus === 'available'" [class.bg-orange-500]="row.currentStatus === 'maintenance'"></div>
                         </div>
                         
                          <!-- Category -->
                          <div class="flex items-center px-3 border-r border-slate-100 text-[10px] font-bold uppercase truncate text-slate-500" 
                               [class.bg-orange-50]="row.currentStatus === 'maintenance'">
                              {{ row.vehicle.category_name }}
                          </div>
                         
                          <!-- Plate -->
                          <div class="flex items-center px-3 border-r border-slate-100 font-mono font-bold text-slate-800"
                               [class.bg-orange-50]="row.currentStatus === 'maintenance'">
                              {{ row.vehicle.plate || row.vehicle.code || '---' }}
                          </div>

                          <!-- Days -->
                          @for (dayStatus of row.days; track $index) {
                              <div class="border-r border-slate-100 relative p-1 h-full flex flex-col justify-center"
                                   [class.bg-orange-50]="row.currentStatus === 'maintenance'">
                                  @if (dayStatus.status === 'booked') {
                                      <div class="w-full h-full bg-blue-50 border border-blue-200 rounded-md shadow-sm transition-all hover:bg-blue-100 group/item flex items-center justify-center p-0.5 cursor-pointer"
                                           [title]="dayStatus.tooltip"
                                           (click)="$event.stopPropagation(); selectBooking(dayStatus.booking)">
                                           <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                      </div>
                                   } @else if (dayStatus.status === 'pickup') {
                                        <div class="w-full h-full bg-green-50 border border-green-200 rounded-md shadow-sm transition-all hover:bg-green-100 flex flex-col items-center justify-center p-0.5 cursor-pointer"
                                            [title]="dayStatus.tooltip"
                                            (click)="$event.stopPropagation(); selectBooking(dayStatus.booking)">
                                            <span class="text-[8px] font-black text-green-700 uppercase leading-none mb-1 tracking-wider">{{ dayStatus.label }}</span>
                                            <span class="text-[9px] font-bold text-slate-500 leading-none">{{ dayStatus.time }}</span>
                                       </div>
                                  } @else if (dayStatus.status === 'dropoff') {
                                       <div class="w-full h-full bg-red-50 border border-red-200 rounded-md shadow-sm transition-all hover:bg-red-100 flex flex-col items-center justify-center p-0.5 cursor-pointer"
                                           [title]="dayStatus.tooltip"
                                           (click)="$event.stopPropagation(); selectBooking(dayStatus.booking)">
                                           <span class="text-[8px] font-black text-red-700 uppercase leading-none mb-1 tracking-wider">{{ dayStatus.label }}</span>
                                           <span class="text-[9px] font-bold text-slate-500 leading-none">{{ dayStatus.time }}</span>
                                      </div>
                                  } @else if (dayStatus.status === 'split') {
                                       <div class="w-full h-full flex rounded-md overflow-hidden shadow-sm h-full" [title]="dayStatus.tooltip">
                                            <!-- Left Half: Dropoff (Entrega) -->
                                            <div class="w-1/2 h-full bg-red-50 border border-red-200 flex flex-col items-center justify-center p-0.5 cursor-pointer hover:bg-red-100 transition-colors"
                                                 (click)="$event.stopPropagation(); selectBooking(dayStatus.bookings?.[0])">
                                                <span class="text-[7px] font-black text-red-700 uppercase leading-none tracking-tight">ENTREGA</span>
                                            </div>
                                             <!-- Right Half: Pickup (Retiro) -->
                                             <div class="w-1/2 h-full bg-green-50 border border-green-200 flex flex-col items-center justify-center p-0.5 cursor-pointer hover:bg-green-100 transition-colors"
                                                  (click)="$event.stopPropagation(); selectBooking(dayStatus.bookings?.[1])">
                                                 <span class="text-[7px] font-black text-green-700 uppercase leading-none tracking-tight">RETIRO</span>
                                             </div>
                                       </div>
                                   } @else if (dayStatus.status === 'maintenance') {
                                       <div class="w-full h-full bg-orange-100 border border-orange-300 text-orange-700 rounded flex items-center justify-center shadow-sm p-1 transition-all hover:bg-orange-200"
                                            [title]="dayStatus.tooltip"
                                            (click)="$event.stopPropagation(); selectBooking(dayStatus.booking)">
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                       </div>
                                   } @else if (dayStatus.status === 'maintenance-pickup') {
                                       <div class="w-full h-full bg-orange-50 border border-orange-300 rounded-md shadow-sm transition-all hover:bg-orange-100 flex flex-col items-center justify-center p-0.5 cursor-pointer"
                                           [title]="dayStatus.tooltip"
                                           (click)="$event.stopPropagation(); selectBooking(dayStatus.booking)">
                                           <span class="text-[8px] font-black text-orange-700 uppercase leading-none mb-1 tracking-wider">INICIO</span>
                                           <span class="text-[9px] font-bold text-slate-500 leading-none">{{ dayStatus.time }}</span>
                                      </div>
                                  } @else if (dayStatus.status === 'maintenance-dropoff') {
                                       <div class="w-full h-full bg-orange-50 border border-orange-300 rounded-md shadow-sm transition-all hover:bg-orange-100 flex flex-col items-center justify-center p-0.5 cursor-pointer"
                                           [title]="dayStatus.tooltip"
                                           (click)="$event.stopPropagation(); selectBooking(dayStatus.booking)">
                                           <span class="text-[8px] font-black text-orange-700 uppercase leading-none mb-1 tracking-wider">FIN</span>
                                           <span class="text-[9px] font-bold text-slate-500 leading-none">{{ dayStatus.time }}</span>
                                      </div>
                                  } @else {
                                       <!-- Empty Slot with Ghost Icon -->
                                       <div class="w-full h-full flex items-center justify-center group/empty" 
                                            (click)="$event.stopPropagation(); selectEmptySlot(row.vehicle, dayStatus.date!)">
                                            <div class="w-6 h-6 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-300 opacity-0 group-hover/empty:opacity-100 transition-all hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500">
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                            </div>
                                       </div>
                                   }
                             </div>
                         }
                     </div>
                 }
             </div>

             <!-- Tariff Ticker (Quick Reference) -->
             <div class="border-t border-slate-200 bg-slate-50 p-3 flex gap-4 shrink-0 items-center h-[70px]">
                 <!-- Scrollable Rates -->
                 <div class="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar flex gap-4 items-center pr-4 border-r border-slate-200 h-full">
                     <div class="flex flex-col justify-center px-2 shrink-0 border-r border-slate-200 mr-1">
                         <span class="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">Tarifa</span>
                         <span class="text-[9px] font-black uppercase text-slate-400 leading-none">Actual</span>
                     </div>
                     @for (cat of categoriesList(); track cat.id) {
                         <div class="flex flex-col shrink-0 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm min-w-[120px] hover:border-blue-300 transition-colors cursor-pointer group"
                              (click)="openEditRates(cat)"
                              [title]="isSpecialPrice(cat) ? 'Tarifa de Temporada Especial - Click para editar' : 'Tarifa Base - Click para editar'">
                             <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 truncate max-w-full group-hover:text-blue-500 transition-colors">
                                 {{ cat.name }}
                             </span>
                             <span class="text-xs font-black text-slate-700" [class.text-blue-600]="isSpecialPrice(cat)">
                                 {{ getCurrentPrice(cat) | currency:'COP':'symbol-narrow':'1.0-0' }}
                             </span>
                         </div>
                     }
                 </div>
                 
                 <!-- Weekly Income Module -->
                 <div class="flex flex-col shrink-0 px-6 py-2 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm min-w-[140px] animate-fade-in relative overflow-hidden group justify-center">
                     <!-- Decoration -->
                     <div class="absolute -right-2 -top-2 w-12 h-12 bg-emerald-100/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                     
                     <div class="flex items-center gap-2 mb-0.5 relative z-10">
                         <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                         <span class="text-[10px] font-black uppercase text-emerald-600 leading-none tracking-widest">INGRESOS</span>
                     </div>
                     <div class="relative z-10">
                         <span class="text-xl font-black text-slate-800 tracking-tight leading-none">
                             {{ totalWeeklyIncome() | currency:'COP':'symbol':'1.0-0' }}
                         </span>
                     </div>
                 </div>
             </div>
         </div>
 
         <!-- RIGHT: SIDE PANEL (30%) -->
         <div class="flex-[3] flex flex-col gap-2 min-w-[300px] landscape-avail-modules">
 
       <!-- Modal Editar Tarifas -->
       @if (showEditRatesModal()) {
           <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                (click)="showEditRatesModal.set(false)">
               <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
                    (click)="$event.stopPropagation()">
                   
                   <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                       <div class="flex items-center gap-3">
                           <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                               <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                           <h3 class="text-2xl font-black text-slate-800 uppercase tracking-widest">EDITAR TARIFAS: {{ editingCategory()?.name }}</h3>
                       </div>
                       <button aria-label="Cerrar" (click)="showEditRatesModal.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">
                           <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                   </div>
 
                   <div class="p-6 overflow-y-auto max-h-[70vh]">
                       <div class="space-y-6">
                           <div>
                               <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Precio Base (Por Día) *</label>
                               <div class="relative">
                                   <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                                   <input type="number" [(ngModel)]="basePriceToEdit"
                                          class="w-full pl-7 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                               </div>
                           </div>
 
                           <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                               <div class="flex items-center gap-2 mb-3">
                                   <div class="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                                       <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                   </div>
                                   <h4 class="text-xs font-black text-blue-800 uppercase tracking-widest">Temporadas Especiales</h4>
                               </div>
 
                               <div class="space-y-2">
                                   @if (specialPeriods().length === 0) {
                                       <div class="text-center py-6 border-2 border-dashed border-blue-100/50 rounded-lg bg-white/50 flex flex-col items-center justify-center gap-1.5 group cursor-pointer hover:bg-blue-50/30 transition-colors" (click)="addSpecialPeriod()">
                                           <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                               <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                           </div>
                                           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Agregar Temporada</p>
                                       </div>
                                   }
                                   @for(period of specialPeriods(); track $index) {
                                       <div class="bg-white p-3 rounded-lg border border-blue-100 relative group hover:border-blue-300 transition-colors shadow-sm">
                                           <button aria-label="Eliminar período" (click)="removeSpecialPeriod($index)" class="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10">
                                               <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                           </button>
 
                                           <div class="mb-2">
                                               <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre (Ej: Semana Santa)</label>
                                               <input type="text" [(ngModel)]="period.name" placeholder="Fin de año, Vacaciones..."
                                                      class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-300">
                                           </div>
 
                                           <div class="grid grid-cols-3 gap-2">
                                               <div>
                                                   <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Desde</label>
                                                   <div class="relative">
                                                       <button type="button" (click)="toggleCalendar($index, 'start', $event)"
                                                             class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center justify-between hover:bg-slate-100 focus:outline-none focus:border-blue-500 transition-all">
                                                           <span>{{ period.start ? (getPeriodDate(period.start) | date:'dd/MM/yyyy') : 'dd/mm/aaaa' }}</span>
                                                           <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                       </button>
                                                       
                                                       @if (isCalendarOpen($index, 'start')) {
                                                           <div class="fixed inset-0 z-[200]" (click)="activeCalendar.set(null)"></div>
                                                           <div class="absolute bottom-full left-0 mb-1 z-[201] w-64 shadow-xl rounded-xl overflow-hidden border border-slate-100 bg-white" (click)="$event.stopPropagation()">
                                                               <app-calendar 
                                                                   [date]="getPeriodDate(period.start)"
                                                                   [minDate]="getMinStartDate(null)"
                                                                   [disabledRanges]="getUnavailableRanges($index)"
                                                                   (dateSelected)="setPeriodDate($index, 'start', $event)">
                                                               </app-calendar>
                                                           </div>
                                                       }
                                                   </div>
                                               </div>
                                               <div>
                                                   <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Hasta</label>
                                                   <div class="relative">
                                                       <button type="button" (click)="toggleCalendar($index, 'end', $event)"
                                                             class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center justify-between hover:bg-slate-100 focus:outline-none focus:border-blue-500 transition-all">
                                                            <span>{{ period.end ? (getPeriodDate(period.end) | date:'dd/MM/yyyy') : 'dd/mm/aaaa' }}</span>
                                                            <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                       </button>
 
                                                       @if (isCalendarOpen($index, 'end')) {
                                                           <div class="fixed inset-0 z-[200]" (click)="activeCalendar.set(null)"></div>
                                                           <div class="absolute bottom-full right-0 mb-1 z-[201] w-64 shadow-xl rounded-xl overflow-hidden border border-slate-100 bg-white" (click)="$event.stopPropagation()">
                                                               <app-calendar 
                                                                   [date]="getPeriodDate(period.end)"
                                                                   [minDate]="getPeriodDate(period.start) || getMinStartDate(null)"
                                                                   [disabledRanges]="getUnavailableRanges($index)"
                                                                   (dateSelected)="setPeriodDate($index, 'end', $event)">
                                                               </app-calendar>
                                                           </div>
                                                       }
                                                   </div>
                                               </div>
                                               <div>
                                                   <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Precio Diario</label>
                                                   <div class="relative">
                                                       <span class="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-[9px]">$</span>
                                                       <input type="number" [(ngModel)]="period.price" placeholder="0"
                                                              class="w-full pl-5 pr-1 py-1.5 bg-blue-50 border border-blue-200 rounded text-[10px] font-bold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all">
                                                   </div>
                                               </div>
                                           </div>
                                       </div>
                                   }
                                   @if (specialPeriods().length > 0) {
                                      <div class="mt-2 flex justify-center">
                                          <div class="px-3 py-1.5 border border-dashed border-blue-200 rounded-lg bg-white/50 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-blue-50 transition-colors group" (click)="addSpecialPeriod()">
                                              <svg class="w-4 h-4 text-blue-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Agregar Otra Temporada</span>
                                          </div>
                                      </div>
                                   }
                               </div>
                           </div>
                       </div>
                   </div>
 
                   <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                       <button (click)="showEditRatesModal.set(false)" 
                               class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider">Cancelar</button>
                       <button (click)="saveRates()" [disabled]="ratesLoading()"
                               class="px-8 py-3 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2">
                           @if (ratesLoading()) {
                               <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                               GUARDANDO...
                           } @else {
                               <span>GUARDAR TARIFAS</span>
                           }
                       </button>
                   </div>
               </div>
           </div>
       }
        <!-- FULL BOOKING VIEWER MODAL -->
        @if (showFullBookingModal() && selectedFullBooking()) {
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" (click)="closeFullBookingModal()">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
                    
                    <!-- Header -->
                    <div class="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                        <h2 class="text-2xl font-black text-slate-800 uppercase tracking-tight">{{ selectedFullBooking().category_name || 'Reserva' }}</h2>
                        
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2">
                                <span class="text-[11px] font-bold text-white bg-slate-900 px-2 py-1 rounded shadow-sm tracking-widest uppercase font-mono leading-none">
                                    {{ selectedFullBooking().code || selectedFullBooking().plate || 'ID: ' + selectedFullBooking().id }}
                                </span>
                                <span class="text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider leading-none"
                                      [ngClass]="{
                                          'bg-blue-100 text-blue-700': selectedFullBooking().status === 'pending',
                                          'bg-green-100 text-green-700': selectedFullBooking().status === 'confirmed' || selectedFullBooking().status === 'available',
                                          'bg-slate-200 text-slate-600': selectedFullBooking().status === 'completed',
                                          'bg-red-100 text-red-700': selectedFullBooking().status === 'cancelled',
                                          'bg-orange-100 text-orange-700': selectedFullBooking().status === 'maintenance'
                                      }">
                                      @if(selectedFullBooking().status === 'pending') { RESERVADO }
                                      @else if(selectedFullBooking().status === 'confirmed') { CONFIRMADO }
                                      @else if(selectedFullBooking().status === 'available') { DISPONIBLE }
                                      @else if(selectedFullBooking().status === 'cancelled') { CANCELADO }
                                      @else if(selectedFullBooking().status === 'completed') { COMPLETADO }
                                      @else if(selectedFullBooking().status === 'maintenance') { MANTENIMIENTO }
                                      @else { {{ selectedFullBooking().status }} }
                                </span>
                            </div>
                            <button aria-label="Cerrar" (click)="closeFullBookingModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all">
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
                                        {{ getInitials(selectedFullBooking().customer_name || selectedFullBooking().user_name) }}
                                     </div>
                                     <div class="space-y-1">
                                         <div>
                                             <p class="text-xs text-slate-400 font-bold uppercase">Nombre Completo</p>
                                             <p class="text-sm font-bold text-slate-800">{{ selectedFullBooking().customer_name || selectedFullBooking().user_name }}</p>
                                         </div>
                                         <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                                             <div>
                                                 <p class="text-[10px] text-slate-400 font-bold uppercase">Documento</p>
                                                 <p class="text-xs text-slate-700">{{ selectedFullBooking().customer_doc_type || 'ID' }} {{ selectedFullBooking().customer_doc_number || '---' }}</p>
                                             </div>
                                             <div>
                                                 <p class="text-[10px] text-slate-400 font-bold uppercase">Nacionalidad</p>
                                                 <p class="text-xs text-slate-700">{{ selectedFullBooking().customer_nationality || '---' }}</p>
                                             </div>
                                         </div>
                                         <div>
                                             <p class="text-[10px] text-slate-400 font-bold uppercase">Contacto</p>
                                             <p class="text-xs text-slate-700 flex items-center gap-1">
                                                <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {{ selectedFullBooking().customer_email || 'Sin email' }}
                                             </p>
                                             <p class="text-xs text-slate-700 flex items-center gap-1 mt-0.5">
                                                <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {{ selectedFullBooking().customer_phone || 'Sin teléfono' }}
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
                                                <p class="text-sm font-black text-slate-800">{{ selectedFullBooking().plate || 'PENDIENTE' }}</p>
                                                <p class="text-[10px] text-slate-500">{{ selectedFullBooking().category_name }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <p class="text-[10px] font-bold text-slate-400 uppercase">Seguro</p>
                                        <p class="text-sm font-bold text-slate-800 capitalize mt-1">{{ selectedFullBooking().insurance_type || 'Básico' }}</p>
                                        <p class="text-[10px] text-slate-500">Cobertura seleccionada</p>
                                    </div>
                                    
                                    <div class="col-span-2">
                                        <div class="flex justify-between items-end border-t border-slate-200 pt-2 mt-1">
                                            <span class="text-xs font-bold text-slate-500">Total a Pagar</span>
                                            <span class="text-2xl font-black text-emerald-600">{{ selectedFullBooking().total_price | currency:'COP':'symbol':'1.0-0' }}</span>
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
                                                <p class="text-sm font-bold text-slate-800">{{ formatDisplayDate(selectedFullBooking().start_date?.split('T')[0]) }}</p>
                                                <p class="text-xs text-slate-600">{{ formatDisplayTime(selectedFullBooking().pickup_time || (selectedFullBooking().status === 'maintenance' ? '12:00' : '10:00')) }}</p>
                                            </div>

                                            <div>
                                                <p class="text-[10px] font-bold text-slate-400 uppercase">Ubicación</p>
                                                <p class="text-xs text-slate-700 font-medium">{{ selectedFullBooking().pickup_location || 'Oficina Principal' }}</p>
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
                                                <p class="text-sm font-bold text-slate-800">{{ formatDisplayDate(selectedFullBooking().end_date?.split('T')[0]) }}</p>
                                                <p class="text-xs text-slate-600">{{ formatDisplayTime(selectedFullBooking().dropoff_time || (selectedFullBooking().status === 'maintenance' ? '12:00' : '12:00')) }}</p>
                                            </div>
                                            <div>
                                                <p class="text-[10px] font-bold text-slate-400 uppercase">Ubicación</p>
                                                <p class="text-xs text-slate-700 font-medium">{{ selectedFullBooking().dropoff_location || 'Oficina Principal' }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 4. Created At -->
                             <div class="col-span-1 md:col-span-2 text-right">
                                 <p class="text-[9px] text-slate-400">Reserva creada el {{ formatDisplayDate(selectedFullBooking().created_at?.split('T')[0]) }}</p>
                             </div>
                        </div>
                    </div>
                    
                    <!-- Footer: Just Close -->
                    <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                         <button (click)="closeFullBookingModal()" class="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-wider shadow-lg shadow-slate-200">
                             Cerrar Ventana
                         </button>
                    </div>
                </div>
            </div>
        }
             
              <!-- Module 1: Manage Status -->
              <div class="flex-1 bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden relative landscape-avail-manage">
                  <div class="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <h3 class="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Gestionar Estado
                      </h3>
                  </div>
                  
                  <div class="p-3 flex-1 overflow-y-auto">
                      @if (selectedVehicle(); as vehicle) {
                          <div class="space-y-4">
                              <!-- Header: Centered Plate -->
                              <div class="flex flex-col items-center justify-center py-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <div class="text-xl font-black text-slate-800 font-mono tracking-tight">{{ vehicle.plate || vehicle.code || 'SIN PLACA' }}</div>
                              </div>

                                                            <!-- Dates Input Grid -->
                              <div class="grid grid-cols-2 gap-3">
                                   <!-- Desde -->
                                    <div class="relative" [class.z-50]="statusPickerMode() === 'start'">
                                       <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Desde</label>
                                       <button type="button" (click)="togglePicker('start', $event)"
                                               class="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left flex items-center justify-between text-slate-600 text-[10px] font-bold"
                                               [class.text-blue-600]="blockStart">
                                           <span>{{ blockStart ? formatDisplayDate(blockStart) : 'DD/MM/AAAA' }}</span>
                                           <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                       </button>
                                       @if (statusPickerMode() === 'start') {
                                           <div class="fixed inset-0 z-[90]" (click)="closePicker()"></div>
                                           <div class="absolute left-[-17.5%] w-[135%] z-[100] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in bottom-full mb-1">
                                               <app-calendar [date]="getParsedDate(blockStart)" (dateSelected)="selectPickerDate($event)"></app-calendar>
                                           </div>
                                       }
                                    </div>

                                   <!-- Hasta -->
                                    <div class="relative" [class.z-50]="statusPickerMode() === 'end'">
                                       <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Hasta</label>
                                       <button type="button" (click)="togglePicker('end', $event)"
                                               class="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left flex items-center justify-between text-slate-600 text-[10px] font-bold"
                                               [class.text-blue-600]="blockEnd">
                                           <span>{{ blockEnd ? formatDisplayDate(blockEnd) : 'DD/MM/AAAA' }}</span>
                                           <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                       </button>
                                       @if (statusPickerMode() === 'end') {
                                           <div class="fixed inset-0 z-[90]" (click)="closePicker()"></div>
                                           <div class="absolute left-[-17.5%] w-[135%] z-[100] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in bottom-full mb-1">
                                               <app-calendar [date]="getParsedDate(blockEnd)" [minDate]="getParsedDate(blockStart)" (dateSelected)="selectPickerDate($event)"></app-calendar>
                                           </div>
                                       }
                                    </div>
                              </div>

                              <!-- Action/Status Dropdown -->
                              <div class="relative">
                                  <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Acción / Estado</label>
                                  <button (click)="toggleStatusDropdown($event)" class="w-full text-left pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm hover:border-blue-300 transition-all flex items-center justify-between">
                                       <span class="flex items-center gap-2">
                                           @switch(overrideStatus) {
                                               @case('maintenance') { <span>🛠️ Mantenimiento</span> }
                                               @case('booked') { <span>📅 Reserva Manual</span> }
                                               @case('available') { <span>✅ Liberar / Disponible</span> }
                                           }
                                       </span>
                                       <svg class="w-4 h-4 text-slate-400 absolute right-3 transition-transform duration-200" [class.rotate-180]="statusDropdownOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                  </button>
                                  
                                  @if(statusDropdownOpen()) {
                                      <div class="fixed inset-0 z-30" (click)="statusDropdownOpen.set(false)"></div>
                                      <div class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-100 z-40 overflow-hidden animate-scale-in origin-top">
                                          <button (click)="selectStatus('maintenance', $event)" class="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors" [class.bg-blue-50]="overrideStatus === 'maintenance'" [class.text-blue-600]="overrideStatus === 'maintenance'">
                                              <span>🛠️</span> Mantenimiento
                                          </button>
                                          <button (click)="selectStatus('booked', $event)" class="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors" [class.bg-blue-50]="overrideStatus === 'booked'" [class.text-blue-600]="overrideStatus === 'booked'">
                                              <span>📅</span> Reserva Manual
                                          </button>
                                          <button (click)="selectStatus('available', $event)" class="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors" [class.bg-blue-50]="overrideStatus === 'available'" [class.text-blue-600]="overrideStatus === 'available'">
                                              <span>✅</span> Liberar / Disponible
                                          </button>
                                      </div>
                                  }
                              </div>

                              <!-- Notes -->
                              <div>
                                   <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notas</label>
                                   <textarea [(ngModel)]="blockReason" class="w-full h-20 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-600 resize-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" placeholder="Motivo del bloqueo..."></textarea>
                              </div>
                              
                              <button (click)="submitOverride()" class="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all uppercase tracking-wider shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
                                  <span>APLICAR CAMBIOS</span>
                                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                              </button>
                          </div>
                      } @else {
                          <div class="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                              <svg class="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                              <p class="text-xs font-medium">Seleccione un vehículo de la tabla para gestionar su estado.</p>
                          </div>
                      }
                  </div>
              </div>

             <!-- Module 2: Reservation Info -->
             <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden landscape-avail-details">
                 <div class="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <h3 class="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                         <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                         Detalles De Reserva
                     </h3>
                 </div>

                 <div class="p-3 flex-1 overflow-y-auto">
                     @if (selectedBooking()) {
                          <div class="animate-slide-up h-full flex flex-col -m-3">
                              <div class="bg-white flex-1 overflow-y-auto">
                                   <div class="px-3 py-2 border-b border-slate-100 bg-white">
                                       <h3 class="text-xs font-black text-slate-900 leading-tight mb-0.5">{{ selectedBooking().customer_name }}</h3>
                                       <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            @if(selectedBooking().phone || selectedBooking().customer_phone) {
                                                <span class="flex items-center gap-1">
                                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                    {{ selectedBooking().phone || selectedBooking().customer_phone }}
                                                </span>
                                            }
                                       </div>
                                       <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-0.5">
                                             <span class="flex items-center gap-1 truncate">
                                                 <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                 {{ selectedBooking().email || selectedBooking().customer_email || 'Sin correo' }}
                                             </span>
                                        </div>
                                   </div>

                                   <div class="p-3 space-y-3">
                                       <!-- Timeline View (More Compact) -->
                                       <div class="relative pl-4 space-y-4 border-l-2 border-slate-100 ml-1">
                                            <!-- Retiro -->
                                            <div class="relative">
                                                <div class="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow-sm ring-1 ring-green-100"></div>
                                                <div class="flex justify-between items-start">
                                                    <div>
                                                        <span class="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-0.5">Retiro</span>
                                                        <p class="text-xs font-bold text-slate-800">{{ selectedBooking().pickup_location || 'Sede Principal' }}</p>
                                                    </div>
                                                    <div class="text-right">
                                                        <p class="text-xs font-bold text-slate-700 capitalize">{{ formatDateShortSpanish(selectedBooking().start_date) }}</p>
                                                        <p class="text-[10px] font-medium text-slate-400">{{ formatTime(getDateTime(selectedBooking().start_date, selectedBooking().pickup_time)) }}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Entrega -->
                                            <div class="relative">
                                                <div class="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white shadow-sm ring-1 ring-red-100"></div>
                                                <div class="flex justify-between items-start">
                                                    <div>
                                                        <span class="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-0.5">Entrega</span>
                                                        <p class="text-xs font-bold text-slate-800">{{ selectedBooking().dropoff_location || 'Sede Principal' }}</p>
                                                    </div>
                                                    <div class="text-right">
                                                        <p class="text-xs font-bold text-slate-700 capitalize">{{ formatDateShortSpanish(selectedBooking().end_date) }}</p>
                                                        <p class="text-[10px] font-medium text-slate-400">{{ formatTime(getDateTime(selectedBooking().end_date, selectedBooking().dropoff_time)) }}</p>
                                                    </div>
                                                </div>
                                            </div>
                                       </div>

                                       <div class="h-px bg-slate-100 w-full"></div>

                                       <!-- Vehicle Compact (Plate only, larger) -->
                                       <div class="flex items-center gap-2 bg-slate-50 px-3 py-3 rounded-xl border border-slate-100 justify-center">
                                            <div class="text-lg font-black text-slate-800 font-mono tracking-tight">{{ selectedBooking().plate }}</div>
                                       </div>

                                       <!-- Financials Compact -->
                                       <div class="flex justify-between items-end pt-1">
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</span>
                                            <span class="text-lg font-black text-slate-900 tracking-tight">{{ selectedBooking().total_price | currency:'COP':'symbol':'1.0-0' }}</span>
                                       </div>
                                       
                                        <div class="pt-1">
                                           <button (click)="openFullBookingModal(selectedBooking())" class="w-full py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black hover:bg-blue-100 transition-colors uppercase tracking-wide flex items-center justify-center gap-2">
                                                Ver Detalles Completos
                                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                           </button>
                                       </div>
                                   </div>
                              </div>
                          </div>
                      } @else if (selectedVehicleReservations().length > 0 && !selectedBoxDate()) {
                        <div class="space-y-3">
                            <h4 class="text-[10px] font-bold text-slate-400 uppercase mb-2">Reservas esta semana</h4>
                            @for (res of selectedVehicleReservations(); track res.id) {
                                <div class="bg-blue-50/50 rounded-lg p-3 border border-blue-100 hover:border-blue-300 transition-colors">
                                    <div class="flex justify-between items-start mb-2">
                                        <span class="text-[9px] font-black text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase">ID: {{ res.id }}</span>
                                        <span class="text-[9px] font-bold text-slate-500">{{ formatDateShort(res.created_at) }}</span>
                                    </div>
                                    <h5 class="text-xs font-black text-slate-800 mb-1 leading-tight">{{ res.customer_name || 'Cliente' }}</h5>
                                    
                                    <div class="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                                        <div>
                                            <span class="block text-slate-400 font-bold uppercase text-[8px]">Desde</span>
                                            <span class="font-bold text-slate-700">{{ formatDateShort(res.start_date) }}</span>
                                        </div>
                                        <div>
                                            <span class="block text-slate-400 font-bold uppercase text-[8px]">Hasta</span>
                                            <span class="font-bold text-slate-700">{{ formatDateShort(res.end_date) }}</span>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                     } @else if (selectedVehicle()) {
                         <div class="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                             <p class="text-xs font-medium">No hay reservas programadas para este vehículo en la semana seleccionada.</p>
                         </div>
                  } @else {
                      <div class="flex flex-col items-center justify-center h-full text-slate-300 p-4">
                          <svg class="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p class="text-xs font-bold uppercase tracking-widest text-center">Seleccione un vehículo o reserva de la tabla</p>
                      </div>
                  }
                 </div>
             </div>
    </div>
    
      <!-- Manual Booking Modal -->
      @if (showManualBookingModal()) {
          <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" (click)="closeManualBookingModal()">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-scale-in" (click)="$event.stopPropagation()">
                  <!-- Header -->
                  <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                      <div>
                          <h3 class="text-lg font-black text-slate-800 uppercase tracking-tight">
                              {{ editingBookingId() ? 'Editar Reserva' : 'Nueva Reserva Manual' }}
                          </h3>
                          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {{ selectedVehicle()?.category_name }} • {{ selectedVehicle()?.plate }}
                          </p>
                      </div>
                      <div class="flex items-center gap-3">
                           @if(editingBookingId()) {
                               <button (click)="deleteBooking()" class="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Eliminar Reserva">
                                   <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                           }
                           <button aria-label="Cerrar" (click)="closeManualBookingModal()" class="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                               <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                      </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <!-- Column 1: Customer Details -->
                          <div class="space-y-6">
                              <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Información del Cliente</h4>
                              
                              <div class="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6">
                                  <!-- Fields Stack -->
                                  <div class="space-y-3">
                                      <div>
                                          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre Completo *</label>
                                          <input type="text" [(ngModel)]="manualBookingForm.fullName" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                      </div>

                                      <div>
                                          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email *</label>
                                          <input type="email" [(ngModel)]="manualBookingForm.email" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60">
                                      </div>

                                      <div class="relative">
                                          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Celular *</label>
                                          <div class="flex">
                                              <button type="button" (click)="showManualDDI.set(!showManualDDI())" [disabled]="isMaintenanceBooking()" class="px-2 py-2 bg-slate-100 border border-slate-200 rounded-l-xl border-r-0 text-xs font-bold text-slate-600 flex items-center gap-1 hover:bg-slate-200 transition-colors disabled:opacity-60">
                                                  <span>{{ manualBookingForm.ddi }}</span>
                                                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                              </button>
                                              <input type="tel" [(ngModel)]="manualBookingForm.phone" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60">
                                          </div>
                                          
                                          @if (showManualDDI()) {
                                              <div class="fixed inset-0 z-[80]" (click)="showManualDDI.set(false)"></div>
                                              <div class="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-[90] overflow-hidden animate-scale-in">
                                                  <div class="p-2 border-b border-slate-50">
                                                      <input type="text" [ngModel]="ddiSearch()" (ngModelChange)="filterDDI($event)" placeholder="Buscar país..." class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-blue-300">
                                                  </div>
                                                  <div class="max-h-48 overflow-y-auto custom-scrollbar">
                                                      @for(country of filteredDDI(); track country.code) {
                                                          <button (click)="selectManualDDI(country)" class="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                                              <span class="text-xl">{{ country.flag }}</span>
                                                              <div class="flex-1">
                                                                  <div class="text-xs font-bold text-slate-700">{{ country.name }}</div>
                                                                  <div class="text-[10px] font-bold text-slate-400">{{ country.dialCode }}</div>
                                                              </div>
                                                          </button>
                                                      }
                                                  </div>
                                              </div>
                                          }
                                      </div>

                                      <div class="grid grid-cols-3 gap-3">
                                          <div class="relative">
                                              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo Doc.</label>
                                              <button type="button" (click)="showManualDocType.set(!showManualDocType())" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 text-left flex items-center justify-between hover:border-blue-300 transition-all disabled:opacity-60">
                                                  <span>{{ manualBookingForm.docType }}</span>
                                                  <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                              </button>
                                              
                                              @if (showManualDocType()) {
                                                  <div class="fixed inset-0 z-[80]" (click)="showManualDocType.set(false)"></div>
                                                  <div class="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-100 z-[90] overflow-hidden animate-scale-in">
                                                      @for(type of ['CC', 'CE', 'PASAPORTE', 'LICENCIA']; track type) {
                                                          <button (click)="selectManualDocType(type)" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                                              {{ type }}
                                                          </button>
                                                      }
                                                  </div>
                                              }
                                          </div>
                                          <div class="col-span-2">
                                              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Número Documento</label>
                                              <input type="text" [(ngModel)]="manualBookingForm.docNumber" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60">
                                          </div>
                                      </div>

                                      <div>
                                          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nacionalidad</label>
                                          <input type="text" [(ngModel)]="manualBookingForm.nationality" [disabled]="isMaintenanceBooking()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all disabled:opacity-60">
                                      </div>


                                      <!-- Costos Section -->
                                      <div class="grid grid-cols-2 gap-3 mt-4" [class.opacity-50]="isMaintenanceBooking()">
                                          <div>
                                              <label class="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Base Día</label>
                                              <input type="number" [ngModel]="isMaintenanceBooking() ? null : manualBookingForm.pricePerDay" (ngModelChange)="manualBookingForm.pricePerDay = $event; calculateManualPrice('price')" [disabled]="isMaintenanceBooking()" class="w-full px-2 py-2 text-xs font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-300 disabled:bg-slate-50">
                                          </div>
                                          <div>
                                              <label class="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Lavado</label>
                                              <input type="number" [ngModel]="isMaintenanceBooking() ? null : manualBookingForm.washFee" (ngModelChange)="manualBookingForm.washFee = $event; calculateManualPrice('other')" [disabled]="isMaintenanceBooking()" class="w-full px-2 py-2 text-xs font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-300 disabled:bg-slate-50">
                                          </div>
                                      </div>

                                      <!-- Additional Costs Manager (Moved) -->
                                      <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-2">
                                           <h5 class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Costos Adicionales</h5>
                                           
                                           <!-- List -->
                                           <div class="space-y-2 mb-3">
                                               @for(cost of manualBookingForm.additionalCosts; track $index) {
                                                   <div class="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                                       <span class="text-[10px] font-bold text-slate-600 flex-1 truncate">{{ cost.name }}</span>
                                                       <div class="flex items-center gap-1">
                                                            <span class="text-[10px] text-slate-400">$</span>
                                                            <input type="number" 
                                                                   [ngModel]="cost.price" 
                                                                   (ngModelChange)="cost.price = $event; calculateManualPrice('other')" 
                                                                   [disabled]="isMaintenanceBooking()"
                                                                   class="w-20 px-1.5 py-0.5 text-[10px] font-black text-slate-800 bg-slate-50 border border-transparent hover:border-blue-200 focus:border-blue-400 rounded outline-none text-right transition-all">
                                                        </div>
                                                       <button aria-label="Eliminar costo" (click)="removeAdditionalCost($index)" class="text-red-400 hover:text-red-600 ml-1">
                                                           <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                       </button>
                                                   </div>
                                               }
                                               @if(manualBookingForm.additionalCosts.length === 0) {
                                                   <p class="text-[9px] text-slate-300 italic text-center py-1">Sin costos adicionales</p>
                                               }
                                           </div>
  
                                           <!-- Add New -->
                                            <div class="flex items-center gap-2">
                                                <input type="text" [(ngModel)]="newCostName" [disabled]="isMaintenanceBooking()" placeholder="Nombre" class="flex-[2] px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-300 disabled:bg-slate-50">
                                                <input type="number" [(ngModel)]="newCostPrice" [disabled]="isMaintenanceBooking()" placeholder="Valor" class="flex-1 px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-300 disabled:bg-slate-50">
                                                <button aria-label="Agregar costo" (click)="addAdditionalCost()" [disabled]="!newCostName || newCostPrice === null || isMaintenanceBooking()" class="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>
                                       </div>

                                       <!-- Summary and Notes moved to bottom -->
                                  </div>
                              </div>
                          </div>

                          <!-- Column 2: Booking Details -->
                          <div class="space-y-6">
                              <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Detalles del Servicio</h4>
                              
                              <div class="space-y-4">
                                  <div class="grid grid-cols-2 gap-4">
                                      <!-- Pickup Details (LEFT) -->
                                      <div class="col-span-1 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-3 border border-blue-100/50 flex flex-col">
                                          <div class="flex items-center gap-2 mb-3 border-b border-blue-100/50 pb-2">
                                              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                              <h5 class="text-[10px] font-black uppercase text-blue-600 tracking-widest">Retiro</h5>
                                          </div>
                                          
                                          <div class="space-y-3 flex-1" [ngClass]="{'opacity-60': isPickupPassed() && editingBookingId(), 'pointer-events-none': isMaintenanceBooking()}">
                                              <div>
                                                  <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Ciudad</label>
                                                  <div class="w-full px-3 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg bg-slate-100 flex items-center gap-2">
                                                      <svg class="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                      <span>{{ isMaintenanceBooking() ? 'TALLER/OFICINA' : 'Cartagena' }}</span>
                                                      <span class="ml-auto text-[8px] text-slate-400 uppercase">{{ isMaintenanceBooking() ? 'MTTO' : 'Único' }}</span>
                                                  </div>
                                              </div>
                                             <div class="relative" [class.z-50]="showBookingPickupDate()">
                                                 <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Fecha</label>
                                                 <button type="button" (click)="showBookingPickupDate.set(!showBookingPickupDate()); showBookingPickupTime.set(false)"
                                                         class="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left flex items-center justify-between text-slate-600 text-xs font-bold"
                                                         [class.text-blue-600]="manualBookingForm.startDate" [class.font-bold]="manualBookingForm.startDate">
                                                     <span>{{ formatDisplayDate(manualBookingForm.startDate) }}</span>
                                                     <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                 </button>
                                                 @if (showBookingPickupDate()) {
                                                     <div class="fixed inset-0 z-[90]" (click)="showBookingPickupDate.set(false)"></div>
                                                     <div class="absolute left-[-17.5%] w-[135%] z-[100] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in top-full mt-1">
                                                         <app-calendar (dateSelected)="onBookingPickupDateSelected($event)"></app-calendar>
                                                     </div>
                                                 }
                                             </div>
                                             <div class="relative" [class.z-40]="showBookingPickupTime()">
                                                 <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Hora</label>
                                                 <button type="button" (click)="showBookingPickupTime.set(!showBookingPickupTime()); showBookingPickupDate.set(false)"
                                                         class="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left flex items-center justify-between text-slate-600 text-xs font-bold"
                                                         [class.text-blue-600]="manualBookingForm.pickupTime" [class.font-bold]="manualBookingForm.pickupTime">
                                                     <span>{{ formatDisplayTime(manualBookingForm.pickupTime) }}</span>
                                                     <svg class="w-4 h-4 text-slate-400 transition-transform" [class.rotate-180]="showBookingPickupTime()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                                 </button>
                                                 @if (showBookingPickupTime()) {
                                                     <div class="fixed inset-0 z-[90]" (click)="showBookingPickupTime.set(false)"></div>
                                                     <div class="absolute inset-x-0 z-[100] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-100 py-2 max-h-48 overflow-y-auto animate-scale-in custom-scrollbar bottom-full mb-1">
                                                         @for (time of timeOptions; track time) {
                                                             <button type="button" (click)="selectBookingTime('pickup', time)"
                                                                     class="w-full px-4 py-2 text-left text-xs font-medium transition-all hover:bg-blue-50 hover:text-blue-700 border-l-4 border-transparent hover:border-blue-500"
                                                                     [class.bg-blue-50]="manualBookingForm.pickupTime === time"
                                                                     [class.text-blue-700]="manualBookingForm.pickupTime === time"
                                                                     [class.border-blue-500]="manualBookingForm.pickupTime === time"
                                                                     [class.font-bold]="manualBookingForm.pickupTime === time">
                                                                 {{ formatDisplayTime(time) }}
                                                             </button>
                                                         }
                                                     </div>
                                                 }
                                             </div>
                                          </div>
                                      </div>

                                      <!-- Dropoff Details (RIGHT) -->
                                      <div class="col-span-1 bg-gradient-to-br from-slate-50/80 to-slate-100/30 rounded-xl p-3 border border-slate-200/50 flex flex-col">
                                          <div class="flex items-center gap-2 mb-3 border-b border-slate-200/50 pb-2">
                                              <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                                              <h5 class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Devolución</h5>
                                          </div>
                                          
                                          <div class="space-y-3 flex-1">
                                              <div>
                                                  <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Ciudad</label>
                                                  <div class="relative">
                                                      <div (click)="showManualDropoffCity.set(!showManualDropoffCity())" class="w-full px-3 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg bg-white cursor-pointer flex items-center gap-2 hover:border-slate-400 transition-colors">
                                                          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                           <span class="flex-1">{{ isMaintenanceBooking() ? 'TALLER/OFICINA' : manualBookingForm.dropoffLocation }}</span>
                                                           @if(!isMaintenanceBooking()) {
                                                               <svg class="w-3 h-3 text-slate-400 transition-transform" [class.rotate-180]="showManualDropoffCity()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                                           }
                                                       </div>
                                                        @if(showManualDropoffCity() && !isMaintenanceBooking()) {
                                                          <div class="fixed inset-0 z-[90]" (click)="showManualDropoffCity.set(false)"></div>
                                                          <div class="absolute z-[100] mt-1 w-full bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden animate-fade-in-up">
                                                              <div (click)="selectManualDropoffCity('Cartagena')" class="px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2" [class.bg-blue-50]="manualBookingForm.dropoffLocation === 'Cartagena'" [class.text-blue-600]="manualBookingForm.dropoffLocation === 'Cartagena'">
                                                                  <span class="w-1.5 h-1.5 rounded-full" [class.bg-blue-500]="manualBookingForm.dropoffLocation === 'Cartagena'" [class.bg-slate-300]="manualBookingForm.dropoffLocation !== 'Cartagena'"></span>
                                                                  Cartagena
                                                              </div>
                                                              <div (click)="selectManualDropoffCity('Barranquilla')" class="px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2" [class.bg-blue-50]="manualBookingForm.dropoffLocation === 'Barranquilla'" [class.text-blue-600]="manualBookingForm.dropoffLocation === 'Barranquilla'">
                                                                  <span class="w-1.5 h-1.5 rounded-full" [class.bg-blue-500]="manualBookingForm.dropoffLocation === 'Barranquilla'" [class.bg-slate-300]="manualBookingForm.dropoffLocation !== 'Barranquilla'"></span>
                                                                  Barranquilla
                                                              </div>
                                                              <div (click)="selectManualDropoffCity('Santa Marta')" class="px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-2" [class.bg-blue-50]="manualBookingForm.dropoffLocation === 'Santa Marta'" [class.text-blue-600]="manualBookingForm.dropoffLocation === 'Santa Marta'">
                                                                  <span class="w-1.5 h-1.5 rounded-full" [class.bg-blue-500]="manualBookingForm.dropoffLocation === 'Santa Marta'" [class.bg-slate-300]="manualBookingForm.dropoffLocation !== 'Santa Marta'"></span>
                                                                  Santa Marta
                                                              </div>
                                                          </div>
                                                      }
                                                  </div>
                                              </div>
                                              <div class="relative" [class.z-50]="showBookingDropoffDate()">
                                                  <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Fecha</label>
                                                  <button type="button" (click)="showBookingDropoffDate.set(!showBookingDropoffDate()); showBookingDropoffTime.set(false)"
                                                          class="w-full px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl transition-all text-left flex items-center justify-between text-slate-600 text-xs font-bold"
                                                          [class.text-slate-700]="manualBookingForm.endDate" [class.font-bold]="manualBookingForm.endDate">
                                                      <span>{{ formatDisplayDate(manualBookingForm.endDate) }}</span>
                                                      <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                  </button>
                                                  @if (showBookingDropoffDate()) {
                                                      <div class="fixed inset-0 z-[90]" (click)="showBookingDropoffDate.set(false)"></div>
                                                      <div class="absolute left-[-17.5%] w-[135%] z-[100] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in top-full mt-1">
                                                          <app-calendar (dateSelected)="onBookingDropoffDateSelected($event)"></app-calendar>
                                                      </div>
                                                  }
                                              </div>
                                              <div class="relative" [class.z-40]="showBookingDropoffTime()">
                                                  <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Hora</label>
                                                  <button type="button" (click)="showBookingDropoffTime.set(!showBookingDropoffTime()); showBookingDropoffDate.set(false)"
                                                          class="w-full px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl transition-all text-left flex items-center justify-between text-slate-600 text-xs font-bold"
                                                          [class.text-slate-700]="manualBookingForm.dropoffTime" [class.font-bold]="manualBookingForm.dropoffTime">
                                                      <span>{{ formatDisplayTime(manualBookingForm.dropoffTime) }}</span>
                                                      <svg class="w-4 h-4 text-slate-400 transition-transform" [class.rotate-180]="showBookingDropoffTime()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                                  </button>
                                                  @if (showBookingDropoffTime()) {
                                                      <div class="fixed inset-0 z-[90]" (click)="showBookingDropoffTime.set(false)"></div>
                                                      <div class="absolute inset-x-0 z-[100] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-100 py-2 max-h-48 overflow-y-auto animate-scale-in custom-scrollbar bottom-full mb-1">
                                                          @for (time of timeOptions; track time) {
                                                              <button type="button" (click)="selectBookingTime('dropoff', time)"
                                                                      class="w-full px-4 py-2 text-left text-xs font-medium transition-all hover:bg-slate-50 hover:text-slate-800 border-l-4 border-transparent hover:border-slate-500"
                                                                      [class.bg-slate-100]="manualBookingForm.dropoffTime === time"
                                                                      [class.text-slate-800]="manualBookingForm.dropoffTime === time"
                                                                      [class.border-slate-500]="manualBookingForm.dropoffTime === time"
                                                                      [class.font-bold]="manualBookingForm.dropoffTime === time">
                                                                  {{ formatDisplayTime(time) }}
                                                              </button>
                                                          }
                                                      </div>
                                                  }
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  <!-- Notifications Section -->
                                  <div class="flex flex-col gap-2 pt-3 pl-1">
                                      <div class="flex items-center gap-2">
                                          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                          <span class="text-[10px] font-black text-slate-600 uppercase tracking-wider">Notificar por correo</span>
                                      </div>
                                      <div class="flex items-center gap-4 pl-3.5">
                                          <label class="flex items-center gap-2 cursor-pointer group">
                                              <input type="checkbox" [(ngModel)]="manualBookingForm.notifyAdmin" class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
                                              <span class="text-[10px] font-bold text-slate-500 uppercase group-hover:text-blue-600 transition-colors">Admin</span>
                                          </label>
                                          <label class="flex items-center gap-2 cursor-pointer group">
                                              <input type="checkbox" [(ngModel)]="manualBookingForm.notifyUser" class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
                                              <span class="text-[10px] font-bold text-slate-500 uppercase group-hover:text-blue-600 transition-colors">Usuario</span>
                                          </label>
                                      </div>
                                  </div>

                                  </div>
                                          </div>
                                  </div>


                          <!-- Full Width Bottom Section -->
                          <div class="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-8">
                              <!-- Notes (Left 2/3) -->
                              <div class="lg:col-span-2">
                                   <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notas Internas</label>
                                   <textarea [(ngModel)]="manualBookingForm.notes" rows="6" class="w-full px-4 py-3 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none resize-none bg-slate-50"></textarea>
                              </div>

                              <!-- Summary (Right 1/3) -->
                              <div class="lg:col-span-1">
                                    <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                        <h5 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            Resumen de Cuenta
                                            <button (click)="calculateManualPrice('price')" class="p-1 rounded-lg hover:bg-slate-100 text-blue-500 transition-colors" title="Recalcular">
                                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            </button>
                                        </h5>
                                    </div>
                                    
                                    <div class="space-y-1.5" [class.opacity-50]="isMaintenanceBooking()">
                                        <div class="flex justify-between text-xs text-slate-500 font-medium">
                                            <span>Días ({{ breakdownData.days }})</span>
                                            <span class="text-slate-700 font-bold ml-auto">{{ isMaintenanceBooking() ? '---' : ((breakdownData.baseTotal || 0) | currency:'COP':'symbol':'1.0-0') }}</span>
                                         </div>
                                         <div class="flex justify-between text-xs text-slate-500 font-medium">
                                             <span>Lavado</span>
                                             <span class="text-slate-700 font-bold ml-auto">{{ isMaintenanceBooking() ? '---' : (manualBookingForm.washFee | currency:'COP':'symbol':'1.0-0') }}</span>
                                         </div>
                                         @if(breakdownData.dropoff > 0) {
                                             <div class="flex justify-between text-xs text-slate-500 font-medium animate-fade-in">
                                                 <span>Recargo Ciudad</span>
                                                 <span class="text-slate-700 font-bold ml-auto">{{ isMaintenanceBooking() ? '---' : (breakdownData.dropoff | currency:'COP':'symbol':'1.0-0') }}</span>
                                             </div>
                                         }
                                        @for(cost of manualBookingForm.additionalCosts; track $index) {
                                            <div class="flex justify-between text-xs text-emerald-600 font-medium animate-fade-in">
                                                <span>+ {{ cost.name }}</span>
                                                <span class="font-bold ml-auto">{{ cost.price | currency:'COP':'symbol':'1.0-0' }}</span>
                                            </div>
                                        }
                                    </div>
                                    
                                    <div class="flex flex-col items-end justify-center pt-3 border-t border-slate-100 mt-2" [class.opacity-50]="isMaintenanceBooking()">
                                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total a Pagar</p>
                                        <p class="text-3xl font-black text-slate-900 tracking-tighter leading-none">{{ isMaintenanceBooking() ? '---' : (manualBookingForm.totalPrice | currency:'COP':'symbol':'1.0-0') }}</p>
                                    </div>
                              </div>
                          </div>
                  </div>
                  
                  <!-- Footer -->
                  <div class="p-4 bg-slate-50 flex gap-3 shrink-0">
                      <button (click)="closeManualBookingModal()" class="flex-1 py-3 text-xs font-bold text-slate-500 border rounded-xl hover:bg-slate-100 transition-colors">Cancelar</button>
                      <button (click)="editingBookingId() ? saveEditedBooking() : saveManualBooking()" 
                              class="flex-1 py-3 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              [disabled]="manualBookingLoading()">
                          @if(manualBookingLoading()) { <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
                          {{ editingBookingId() ? 'Actualizar Reserva' : 'Crear Reserva' }}
                      </button>
                  </div>
              </div>
          </div>
      }

  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    
    @media (max-width: 1023px) and (orientation: landscape) {
        .landscape-avail-grid {
            display: grid !important;
            grid-template-columns: 6fr 4fr;
            grid-template-rows: auto auto;
            gap: 0.5rem !important;
            overflow-y: auto !important;
        }
        .landscape-avail-schedule {
            grid-column: 1 / -1;
            grid-row: 1;
            min-height: 400px;
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0;
        }
        .landscape-avail-modules {
            display: contents !important;
        }
        .landscape-avail-details {
            grid-column: 1;
            grid-row: 2;
            height: 350px !important;
        }
        .landscape-avail-manage {
            grid-column: 2;
            grid-row: 2;
            height: 350px !important;
        }
    }

    /* =========================================================
       MOBILE PORTRAIT (Vertical) — max-width: 767px + portrait
       ========================================================= */
    @media (max-width: 767px) and (orientation: portrait) {
        /* Stack schedule and side panel vertically, scrollable */
        .landscape-avail-grid {
            display: flex !important;
            flex-direction: column !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            gap: 0 !important;
        }
        /* Schedule: horizontal scroll on mobile */
        .landscape-avail-schedule {
            width: 100% !important;
            min-height: 320px !important;
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0 !important;
            overflow-x: auto !important;
            flex-shrink: 0 !important;
        }
        /* Modules container: stacked vertically */
        .landscape-avail-modules {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            flex-shrink: 0 !important;
        }
        .landscape-avail-details {
            width: 100% !important;
            height: 300px !important;
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0 !important;
        }
        .landscape-avail-manage {
            width: 100% !important;
            height: auto !important;
            min-height: 280px !important;
        }
    }

    /* =========================================================
       MOBILE LANDSCAPE (Horizontal) — max-width: 900px + landscape
       ========================================================= */
    @media (max-width: 900px) and (orientation: landscape) {
        /* 2-column: schedule takes full width on top, panels below */
        .landscape-avail-grid {
            display: flex !important;
            flex-direction: column !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            height: 100% !important;
            gap: 0 !important;
        }
        /* Schedule takes most of the height */
        .landscape-avail-schedule {
            width: 100% !important;
            flex: 1 !important;
            min-height: 0 !important;
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0 !important;
            overflow-x: auto !important;
        }
        /* Modules: side-by-side row at fixed compact height */
        .landscape-avail-modules {
            width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            height: 220px !important;
            flex-shrink: 0 !important;
        }
        .landscape-avail-details {
            flex: 1 !important;
            height: 100% !important;
            border-right: 1px solid #e2e8f0 !important;
        }
        .landscape-avail-manage {
            flex: 1 !important;
            height: 100% !important;
        }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAvailabilityComponent {
    private apiService = inject(ApiService);

    // State
    currentDate = signal(new Date()); // Represents the start of the week view
    vehicles = signal<any[]>([]);
    bookings = signal<any[]>([]);

    selectedVehicle = signal<any>(null);
    selectedBooking = signal<any>(null); // To store currently selected booking for detail panel
    categoryFilter = signal<string>('all');
    statusFilter = signal<string>('all');

    // Date Picker State
    isDatePickerOpen = signal(false);
    pickerDate = signal(new Date()); // Controls the displayed month in picker
    hoverDate = signal<Date | null>(null);
    isCategoryOpen = signal(false);
    isStatusOpen = signal(false);
    isMonthPickerOpen = signal(false);
    isYearPickerOpen = signal(false);
    categoriesList = signal<any[]>([]);

    // Tariff Editing State
    showEditRatesModal = signal(false);
    editingCategory = signal<any>(null);
    specialPeriods = signal<any[]>([]);
    basePriceToEdit = 0;
    ratesLoading = signal(false);
    activeCalendar = signal<string | null>(null);

    // Constants
    months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Derived
    weekStart = computed(() => {
        const d = new Date(this.currentDate());
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        return new Date(d.setDate(diff));
    });

    weekDays = computed(() => {
        const start = new Date(this.weekStart());
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const current = new Date(start);
            current.setDate(start.getDate() + i);
            days.push({
                date: current,
                dayNum: current.getDate(),
                name: ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'][current.getDay()], // Simple map
                isToday: current.getDate() === today.getDate() && current.getMonth() === today.getMonth() && current.getFullYear() === today.getFullYear()
            });
        }
        // Fix Sunday order if needed, but standard logic above puts Monday first if diff logic is correct.
        // My logic: day === 0 (Sun) ? -6 : 1. 
        // If Sun (0): 0 - 0 + (-6) = -6 (Mon is 6 days ago). Correct.
        // If Mon (1): 1 - 1 + 1 = 1 (Mon is today). Correct.
        // So week starts on Monday.
        return days;
    });

    weekRangeLabel = computed(() => {
        const days = this.weekDays();
        const start = days[0].date;
        const end = days[6].date;
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]}`;
    });

    currentMonthName = computed(() => {
        const d = new Date(this.weekStart());
        return new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(d);
    });

    currentYear = computed(() => {
        return new Date(this.weekStart()).getFullYear();
    });

    weekRangeLabelSimple = computed(() => {
        const days = this.weekDays();
        const start = days[0].date;
        const end = days[6].date;
        return `${start.getDate()} - ${end.getDate()}`;
    });

    getCategories = computed(() => {
        const vs = this.vehicles();
        const cats = new Set(vs.map(v => v.category_name));
        return Array.from(cats).sort();
    });

    availabilityData = computed(() => {
        const vs = this.vehicles();
        const bs = this.bookings();
        const range = this.weekDays();
        const catFilter = this.categoryFilter();
        const statFilter = this.statusFilter();

        const filteredVehicles = vs.filter(v => {
            if (catFilter !== 'all' && v.category_name !== catFilter) return false;
            // Status check (simple current current status from DB)
            if (statFilter !== 'all') {
                const s = v.status || 'available';
                // Map 'booked' status if needed, assuming 'booked' comes from reservations not vehicle status?
                // Actually usually vehicle.status is 'available', 'maintenance'. 'booked' is derived.
                // For this filter we might check calculated current status? 
                // Let's defer strict status filtering till we calculate it below or use static property.
                // If the user wants to filter by "En Curso", we need to check if it's currently booked.
                // We'll filter AFTER mapping if necessary, or do a quick check here.
                return true; // Filter after mapping to be accurate
            }
            return true;
        });

        const mapped = filteredVehicles.map(v => {
            // Determine current global status

            // Check if currently booked NOW
            const now = new Date();
            const activeBooking = bs.find(b => {
                if (b.vehicle_id !== v.id && b.plate !== v.plate) return false;
                if (b.status === 'cancelled' || b.status === 'completed') return false;

                // Correctly parse dates with times
                const bStart = new Date(`${b.start_date}T${b.pickup_time || '00:00:00'}`);
                let bEnd = new Date(`${b.end_date}T${b.dropoff_time || '23:59:59'}`);

                // Grace period: +2 hours before showing as available
                bEnd.setHours(bEnd.getHours() + 2);

                return now >= bStart && now <= bEnd;
            });

            let currentStatus = v.status || 'available';
            if (activeBooking && currentStatus !== 'maintenance') {
                if (activeBooking.status === 'maintenance') {
                    currentStatus = 'maintenance';
                } else {
                    currentStatus = 'booked';
                }
            }

            // Calculate status for each day in range
            const dayStatuses = range.map(dayObj => {
                const dayDate = dayObj.date;
                const dStart = new Date(dayDate); dStart.setHours(0, 0, 0, 0);
                const dEnd = new Date(dayDate); dEnd.setHours(23, 59, 59, 999);

                const booking = bs.find(b => {
                    if (b.vehicle_id !== v.id && b.plate !== v.plate) return false;
                    if (b.status === 'cancelled' || b.status === 'completed') return false;
                    const bStart = new Date(b.start_date + 'T00:00:00');
                    const bEnd = new Date(b.end_date + 'T00:00:00');
                    return bStart <= dEnd && bEnd >= dStart;
                });

                if (booking) {
                    const bStart = new Date(booking.start_date + 'T00:00:00');
                    const bEnd = new Date(booking.end_date + 'T00:00:00');
                    const dayStr = dayDate.toDateString();

                    // Check for multiple bookings on the same day (Dropoff & Pickup)
                    const sameDayBookings = bs.filter(b => {
                        if (b.vehicle_id !== v.id && b.plate !== v.plate) return false;
                        if (b.status === 'cancelled' || b.status === 'completed') return false;
                        const s = new Date(b.start_date + 'T00:00:00').toDateString();
                        const e = new Date(b.end_date + 'T00:00:00').toDateString();
                        return s === dayStr || e === dayStr;
                    });

                    // Logic for Split status (Entrega -> Retiro on same day)
                    // We need a dropoff (end) and a pickup (start) on this day.
                    const dropoffBooking = sameDayBookings.find(b => new Date(b.end_date + 'T00:00:00').toDateString() === dayStr);
                    const pickupBooking = sameDayBookings.find(b => new Date(b.start_date + 'T00:00:00').toDateString() === dayStr);

                    if (dropoffBooking && pickupBooking && dropoffBooking.id !== pickupBooking.id) {
                        return {
                            status: 'split',
                            label: '',
                            tooltip: `Entrega: ${dropoffBooking.customer_name} / Retiro: ${pickupBooking.customer_name}`,
                            isPartial: true,
                            customerName: undefined,
                            time: '',
                            booking: booking, // Not strictly used in template for split but useful
                            bookings: [dropoffBooking, pickupBooking],
                            date: dayDate
                        };
                    }


                    let status = 'booked';
                    let label = 'OCUPADO';
                    let time = '';
                    const isMaintenance = booking.status === 'maintenance';

                    const startStr = bStart.toDateString();
                    const endStr = bEnd.toDateString();

                    if (startStr === dayStr) {
                        status = isMaintenance ? 'maintenance-pickup' : 'pickup';
                        label = 'RETIRO';
                        const tempDate = new Date(`${booking.start_date}T${booking.pickup_time || '00:00:00'}`);
                        time = this.formatTime(tempDate);
                    } else if (endStr === dayStr) {
                        status = isMaintenance ? 'maintenance-dropoff' : 'dropoff';
                        label = 'ENTREGA';
                        const tempDate = new Date(`${booking.end_date}T${booking.dropoff_time || '00:00:00'}`);
                        time = this.formatTime(tempDate);
                    } else {
                        // Middle days
                        if (isMaintenance) {
                            status = 'maintenance';
                            label = 'MANTENIMIENTO';
                        }
                    }

                    return {
                        status,
                        label,
                        tooltip: isMaintenance ? `Mantenimiento: ${booking.notes || ''}` : `Reservado: ${booking.customer_name}`,
                        isPartial: false,
                        customerName: booking.customer_name,
                        time,
                        booking: booking,
                        date: dayDate
                    };
                }

                // Check maintenance from vehicle status if needed, but per day? 
                // If vehicle is in maintenance status, is it for all days? 
                // Usually yes unless we have maintenance events.
                if (v.status === 'maintenance') {
                    return { status: 'maintenance', label: 'MTO.', tooltip: 'Mantenimiento', isPartial: false, customerName: undefined, time: '', date: dayDate };
                }

                return { status: 'available', label: '', tooltip: 'Disponible', isPartial: false, customerName: undefined, time: '', date: dayDate };
            });

            return {
                vehicle: v,
                currentStatus, // specific to Now
                days: dayStatuses
            };
        });

        // Apply Status Filter finally
        if (statFilter !== 'all') {
             return mapped.filter(row => row.currentStatus === statFilter);
         }
         return mapped;
     });

    totalWeeklyIncome = computed(() => {
        const days = this.weekDays();
        if (days.length === 0) return 0;
        
        const start = days[0].date;
        const end = days[6].date;
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        // Sum income of all bookings that start in this week
        return this.bookings()
            .filter(b => {
                const status = (b.status || '').toLowerCase();
                // Only confirmed/pending/booked/active bookings count as income
                const isReal = ['confirmed', 'pending', 'booked', 'active'].includes(status);
                if (!isReal) return false;
                
                const bStart = (b.start_date || '').substring(0, 10);
                return bStart >= startStr && bStart <= endStr;
            })
            .reduce((sum, b) => sum + Number(b.total_price || 0), 0);
    });

    // Date Picker Computed
    pickerMonthName = computed(() => {
        // Not used in template anymore but good to keep or remove.
        // We use months array index now.
        return this.months[this.pickerDate().getMonth()];
    });

    pickerYear = computed(() => {
        return this.pickerDate().getFullYear();
    });

    availableYears = computed(() => {
        const currentCheck = new Date().getFullYear();
        const years = [];
        for (let i = currentCheck - 2; i <= currentCheck + 5; i++) {
            years.push(i);
        }
        return years;
    });

    pickerDays = computed(() => {
        const date = this.pickerDate();
        const year = date.getFullYear();
        const month = date.getMonth();

        // First day of month
        const firstDay = new Date(year, month, 1);
        // Day of week of first day (0-6)
        let startingDay = firstDay.getDay(); // 0 is Sun
        // Adjust for Monday start (Mon=0, ..., Sun=6)
        // If 0 (Sun) -> 6
        // If 1 (Mon) -> 0
        startingDay = startingDay === 0 ? 6 : startingDay - 1;

        // Last day of month
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Previous month filler
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        const days = [];

        // Prev Month days
        for (let i = 0; i < startingDay; i++) {
            days.unshift({
                dayNum: prevMonthLastDay - i,
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false
            });
        }

        // Current Month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                dayNum: i,
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        // Next Month days to fill 42
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                dayNum: i,
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    });

    selectedVehicleReservations = computed(() => {
        const v = this.selectedVehicle();
        if (!v) return [];
        const bs = this.bookings();
        const range = this.weekDays();
        const start = range[0].date;
        start.setHours(0, 0, 0, 0);
        const end = range[6].date;
        end.setHours(23, 59, 59, 999);

        // Return bookings for this vehicle that overlap with the current week
        return bs.filter(b => {
            if (b.vehicle_id !== v.id && b.plate !== v.plate) return false;
            const bStart = new Date(b.start_date + 'T00:00:00');
            const bEnd = new Date(b.end_date + 'T00:00:00');
            return bStart <= end && bEnd >= start;
        }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    });

    constructor() {
        this.loadData();
    }

    loadData() {
        // Fetch Categories first, then Instances for each category
        this.apiService.adminGetVehicles().subscribe(categories => {
            if (!categories || categories.length === 0) {
                this.vehicles.set([]);
                this.categoriesList.set([]);
                return;
            }
            this.categoriesList.set(categories);

            const requests = categories.map(cat =>
                this.apiService.adminGetInstances(cat.id)
            );

            forkJoin(requests).subscribe(results => {
                // results[i] corresponds to categories[i]
                const allInstances: any[] = [];
                results.forEach((instances, index) => {
                    const catName = categories[index].name;
                    if (Array.isArray(instances)) {
                        instances.forEach(inst => {
                            allInstances.push({ ...inst, category_name: catName });
                        });
                    }
                });
                this.vehicles.set(allInstances);
            });
        });

        this.apiService.adminGetBookings().subscribe(data => {
            this.bookings.set(data);
        });
    }

    // Date Picker Methods
    toggleDatePicker() {
        this.isDatePickerOpen.update(v => !v);
        // Sync picker date with current view date when opening
        if (!this.isDatePickerOpen()) {
            // Closed
        } else {
            this.pickerDate.set(new Date(this.currentDate()));
        }
    }

    setPickerMonth(monthIndexStr: string | number) {
        const monthIndex = Number(monthIndexStr);
        const d = new Date(this.pickerDate());
        d.setMonth(monthIndex);
        this.pickerDate.set(d);
    }

    setPickerYear(yearStr: string | number) {
        const year = Number(yearStr);
        const d = new Date(this.pickerDate());
        d.setFullYear(year);
        this.pickerDate.set(d);
    }

    selectWeekFromPicker(date: Date) {
        this.currentDate.set(new Date(date));
        this.isDatePickerOpen.set(false);
    }

    isDateInSelectedWeek(date: Date) {
        const start = this.weekStart();
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
    }

    isDateInHoverWeek(date: Date) {
        const hover = this.hoverDate();
        if (!hover) return false;
        // Determine week of hover date
        const d = new Date(hover);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(d.setDate(diff));
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        return date >= start && date <= end;
    }

    changeWeek(offset: number) {
        const newDate = new Date(this.currentDate());
        newDate.setDate(newDate.getDate() + (offset * 7));
        this.currentDate.set(newDate);
    }

    // --- Refined Selection & Manage Status State ---
    selectedBoxDate = signal<Date | null>(null);

    // Manage Status Inputs
    blockStart: string = '';
    blockEnd: string = '';
    blockReason: string = '';
    overrideStatus: string = 'maintenance'; // maintenance, booked, available
    statusDropdownOpen = signal(false);

    // Custom Mini Picker State for Manage Status
    statusPickerMode = signal<'start' | 'end' | null>(null);
    statusPickerViewDate = signal<Date>(new Date());

    get statusPickerDays() {
        const year = this.statusPickerViewDate().getFullYear();
        const month = this.statusPickerViewDate().getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        let d = new Date(firstDay);
        // Padding for start of week (Monday)
        let dayOfWeek = d.getDay() - 1;
        if (dayOfWeek === -1) dayOfWeek = 6;

        for (let i = 0; i < dayOfWeek; i++) {
            days.push(null);
        }

        while (d <= lastDay) {
            days.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        return days;
    }

    weekDaysLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    toggleStatusDropdown(e: Event) {
        e.stopPropagation();
        this.statusDropdownOpen.set(!this.statusDropdownOpen());
    }

    selectStatus(status: string, e: Event) {
        e.stopPropagation();
        this.overrideStatus = status;
        this.statusDropdownOpen.set(false);
        this.onOverrideStatusChange();
    }

    onOverrideStatusChange() {
        if (this.overrideStatus === 'booked') {
            // Open full booking modal
            this.openManualBookingModal();
            // Reset status back to maintenance or keep as booked? 
            // Logic suggests if they want manual booking they use the modal.
            // But let's keep it sync.
        } else if (this.overrideStatus === 'available') {
            this.blockStart = '';
            this.blockEnd = '';
            this.blockReason = '';
        }
    }

    togglePicker(mode: 'start' | 'end', e: Event) {
        e.stopPropagation();
        if (this.statusPickerMode() === mode) {
            this.closePicker();
        } else {
            this.statusPickerMode.set(mode);
            // Initialize view date based on current value
            const currentVal = mode === 'start' ? this.blockStart : this.blockEnd;
            if (currentVal) {
                // Fix timezone issue by appending T00:00:00
                const [y, m, d] = currentVal.split('-').map(Number);
                this.statusPickerViewDate.set(new Date(y, m - 1, d));
            } else {
                this.statusPickerViewDate.set(new Date());
            }
        }
    }

    closePicker() {
        this.statusPickerMode.set(null);
    }

    changePickerMonth(delta: number, e: Event) {
        e.stopPropagation();
        const d = new Date(this.statusPickerViewDate());
        d.setMonth(d.getMonth() + delta);
        this.statusPickerViewDate.set(d);
    }

    selectPickerDate(date: Date, e?: Event) {
        if (e) e.stopPropagation();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const str = `${year}-${month}-${day}`;

        if (this.statusPickerMode() === 'start') {
            this.blockStart = str;
            if (this.blockEnd && this.blockEnd < str) this.blockEnd = str;
        } else {
            this.blockEnd = str;
            if (this.blockStart && this.blockStart > str) this.blockStart = str;
        }
        this.closePicker();
    }

    getParsedDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    isDateSelected(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const str = `${year}-${month}-${day}`;
        return str === (this.statusPickerMode() === 'start' ? this.blockStart : this.blockEnd);
    }

    isDateDisabled(date: Date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }

    isToday(date: Date) {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }

    formatMonthYear(date: Date) {
        return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
    }

    submitOverride() {
        const ins = this.selectedVehicle(); // In this component vehicle IS the instance usually (or loosely coupled)
        // Adjust: logic here uses 'vehicle' as instance. 
        if (!ins) return;

        // If specific logic for 'booking' override is needed, we handle it in openManualBookingModal
        if (this.overrideStatus === 'booked') {
            this.openManualBookingModal();
            return;
        }

        // Logic for Available/Maintenance
        if (this.overrideStatus === 'available') {
            if (ins.status === 'available') return;
            // If booked?
            if (ins.status === 'booked' || this.isVehicleBookedOnDate(ins, new Date())) {
                if (!confirm('El vehículo podría tener reservas activas. ¿Liberar disponibilidad?')) return;
            }
        }

        if (this.overrideStatus !== 'available' && (!this.blockStart || !this.blockEnd)) {
            alert('Selecciona fechas para el bloqueo.');
            return;
        }

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const data: any = {
            category_id: ins.category_id || 0, // Fallback if missing
            status: this.overrideStatus,
            start_date: this.overrideStatus === 'available' ? todayStr : this.blockStart,
            end_date: this.overrideStatus === 'available' ? todayStr : this.blockEnd,
            notes: this.blockReason || ''
        };

        // Use correct API endpoint for Override (assuming same as Inventory)
        this.apiService.adminOverrideInstance(ins.id, data).subscribe({
            next: () => {
                alert('Estado actualizado correctamente.');
                this.refreshData(); // Reload all data
                this.blockStart = '';
                this.blockEnd = '';
                this.blockReason = '';
                this.overrideStatus = 'maintenance';
            },
            error: (err) => {
                alert('Error al actualizar: ' + err.message);
            }
        });
    }

    // --- Manual Booking Editor State ---
    showManualBookingModal = signal(false);
    manualBookingLoading = signal(false);
    showManualDDI = signal(false);
    showManualDocType = signal(false);
    showManualDropoffCity = signal(false);

    // Form Data
    manualBookingForm: any = {
        fullName: '',
        ddi: '+57',
        phone: '',
        email: '',
        docType: 'CC',
        docNumber: '',
        nationality: '',
        startDate: '',
        pickupTime: '10:00',
        endDate: '',
        dropoffTime: '10:00',
        pickupLocation: 'Sede Principal',
        dropoffLocation: 'Sede Principal',
        notifyAdmin: true,
        notifyUser: true,
        washRate: 0,
        pricePerDay: 0, // Added
        totalPrice: 0, // Added
        additionalCosts: [], // {name, price}
        notes: ''
    };

    // Helper Pickers for Form
    showBookingPickupDate = signal(false);
    showBookingPickupTime = signal(false);
    showBookingDropoffDate = signal(false);
    showBookingDropoffTime = signal(false);

    timeOptions = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
        .flatMap(h => [h, h.replace(':00', ':30')]); // Simple 30m slots

    openManualBookingModal(booking?: any) {
        // Reset or Populate
        if (booking) {
            this.populateEditForm(booking);
        } else {
            this.resetManualBookingForm();
            // Pre-fill dates if selectedBoxDate is set
            if (this.selectedBoxDate()) {
                const d = this.selectedBoxDate()!;
                const s = d.toISOString().split('T')[0];
                this.manualBookingForm.startDate = s;
                // Default end date +1 day?
                const e = new Date(d); e.setDate(e.getDate() + 3);
                this.manualBookingForm.endDate = e.toISOString().split('T')[0];
            }
        }
        this.showManualBookingModal.set(true);
    }

    closeManualBookingModal() {
        this.showManualBookingModal.set(false);
    }

    resetManualBookingForm() {
        const v = this.selectedVehicle();
        let defaultWash = 35000;
        // Simple logic mainly

        // Reset signals to clean state for new reservations
        this.isMaintenanceBooking.set(false);
        this.editingBookingId.set(null);
        this.editingBookingStatus.set('');

        this.manualBookingForm = {
            fullName: '',
            ddi: '+57',
            phone: '',
            email: '',
            docType: 'CC',
            docNumber: '',
            nationality: '',
            startDate: '', // will fill
            pickupTime: '10:00',
            endDate: '',
            dropoffTime: '10:00',
            pickupLocation: 'Cartagena',
            dropoffLocation: 'Cartagena',
            notifyAdmin: true,
            notifyUser: true,
            washRate: defaultWash,
            pricePerDay: v ? (v.current_price || v.price_per_day || 0) : 0,
            totalPrice: 0,
            additionalCosts: [],
            notes: ''
        };
        this.calculateManualPrice();
    }

    populateEditForm(booking: any) {
        this.isMaintenanceBooking.set(booking.status === 'maintenance');
        this.editingBookingStatus.set(booking.status);
        const v = this.selectedVehicle();

        // Use 'booking.vehicle_id' to find instance if 'v' is not it? 
        // In availability 'selectedVehicle' is the row.

        // Defaults
        let defaultDayPrice = v ? (v.price_per_day || v.current_price || 0) : 0;

        // IMPORTANT: Use wash_rate from the booking itself first
        let wash = 35000;
        if (booking.wash_price !== undefined && booking.wash_price !== null) {
            wash = Number(booking.wash_price);
        } else if (booking.wash_rate !== undefined && booking.wash_rate !== null) {
            wash = Number(booking.wash_rate);
        } else if (v && v.wash_price) {
            wash = Number(v.wash_price);
        }

        // Load additional costs
        let additionalCosts: { name: string, price: number }[] = [];
        let cleanNotes = booking.notes || '';

        // Try to load from column
        if (booking.additional_costs) {
            try {
                const parsed = typeof booking.additional_costs === 'string'
                    ? JSON.parse(booking.additional_costs)
                    : booking.additional_costs;
                if (Array.isArray(parsed)) {
                    additionalCosts = parsed.map((c: any) => ({
                        name: c.name || '',
                        price: Number(c.price) || 0
                    }));
                }
            } catch (e) {
                console.error('Error parsing additional_costs:', e);
            }
        }

        // Fallback: Parse from notes if empty (legacy)
        if (additionalCosts.length === 0) {
            const costMarker = '\n\n[Costos Adicionales]:';
            if (cleanNotes.includes(costMarker)) {
                const parts = cleanNotes.split(costMarker);
                cleanNotes = parts[0].trim();
                const costsPart = parts[1];
                const lines = costsPart.split('\n');
                lines.forEach((line: string) => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('- ') && trimmed.includes(': $')) {
                        const content = trimmed.substring(2);
                        const segments = content.split(': $');
                        if (segments.length === 2) {
                            const name = segments[0].trim();
                            const price = Number(segments[1].replace(/,/g, '').trim());
                            if (!isNaN(price)) {
                                additionalCosts.push({ name, price });
                            }
                        }
                    }
                });
            }
        } else {
            // Clean legacy notes if column was used
            const costMarker = '\n\n[Costos Adicionales]:';
            if (cleanNotes.includes(costMarker)) {
                cleanNotes = cleanNotes.split(costMarker)[0].trim();
            }
        }

        // Derive actual Base Price from Total
        const total = Number(booking.total_price) || 0;
        const extrasSum = additionalCosts.reduce((acc, curr) => acc + curr.price, 0);

        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const totalDays = daysDiff > 0 ? daysDiff : 1;

        const derivedBase = Math.round((total - wash - extrasSum) / totalDays);

        this.manualBookingForm = {
            id: booking.id,
            fullName: booking.customer_name || '',
            email: booking.customer_email || '',
            phone: booking.customer_phone || booking.phone || '',
            ddi: booking.customer_phone_code || booking.customer_country_code || '+57',
            nationality: booking.customer_nationality || 'Colombia',
            docType: booking.customer_doc_type || 'CC',
            docNumber: booking.customer_doc_number || booking.customer_doc_id || '',
            startDate: booking.start_date ? booking.start_date.split(/T| /)[0] : '',
            endDate: booking.end_date ? booking.end_date.split(/T| /)[0] : '',
            pickupTime: booking.pickup_time ? (booking.pickup_time.substring(0, 5)) : '10:00',
            dropoffTime: booking.dropoff_time ? (booking.dropoff_time.substring(0, 5)) : '10:00',
            pickupLocation: booking.pickup_location || 'Cartagena',
            dropoffLocation: booking.dropoff_location || 'Cartagena',
            totalPrice: total,
            notes: cleanNotes,

            pricePerDay: booking.daily_rate ? Number(booking.daily_rate) : (derivedBase > 0 ? derivedBase : defaultDayPrice),
            washFee: wash,
            additionalCosts: additionalCosts,
            createdAt: booking.created_at || null,
            notifyAdmin: false,
            notifyUser: false
        };

        this.calculateManualPrice('other');
        // Restore exact total
        if (booking.total_price) {
            this.manualBookingForm.totalPrice = Number(booking.total_price);
        }
    }

    saveManualBooking() {
        const v = this.selectedVehicle();
        if (!v && !this.manualBookingForm.id) {
            alert('No se ha seleccionado vehículo.');
            return;
        }

        const form = this.manualBookingForm;

        // --- VALIDATIONS ---

        // 1. Pickup Location Restriction (Force Cartagena if not maintenance)
        if (form.pickupLocation !== 'Cartagena' && this.overrideStatus !== 'maintenance' && !this.isMaintenanceBooking()) {
            // Although UI restricts it, we enforce it here for data integrity
            form.pickupLocation = 'Cartagena';
        }

        // 2. Date & Time Validations
        if (form.startDate && form.pickupTime) {
            const pickupDate = new Date(`${form.startDate}T${form.pickupTime}:00`);
            const now = new Date();

            // Tolerance of 1 minute just in case
            if (pickupDate < new Date(now.getTime() - 60000) && !this.manualBookingForm.id) {
                alert('La fecha y hora de retiro no pueden ser en el pasado.');
                return;
            }

            if (form.endDate && form.dropoffTime) {
                const dropoffDate = new Date(`${form.endDate}T${form.dropoffTime}:00`);

                // Difference in hours
                const diffMs = dropoffDate.getTime() - pickupDate.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);

                if (diffHours < 6) {
                    alert('La duración mínima de la reserva debe ser de 6 horas.');
                    return;
                }
            }
        }

        this.manualBookingLoading.set(true);

        // Prepare payload to match Inventory component (robust)
        const payload: any = {
            force_vehicle_id: v ? v.id : undefined,
            category_id: v ? v.category_id : undefined,
            start_date: form.startDate,
            end_date: form.endDate,
            pickup_time: form.pickupTime,
            dropoff_time: form.dropoffTime,
            pickup_location: form.pickupLocation,
            dropoff_location: form.dropoffLocation,
            total_price: Number(form.totalPrice),

            // Flat fields
            customer_name: form.fullName,
            customer_email: form.email,
            customer_phone: form.phone,
            customer_phone_code: form.ddi,
            customer_doc_type: form.docType,
            customer_doc_number: form.docNumber,
            customer_nationality: form.nationality,

            daily_rate: Number(form.pricePerDay),
            wash_rate: Number(form.washFee),
            additional_costs: JSON.stringify(form.additionalCosts || []),

            // Structured fields for consistency with Inventory/API
            insurance_type: 'basic',
            is_manual_admin_booking: true,
            customerDetails: {
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                ddi: form.ddi,
                nationality: form.nationality,
                docType: form.docType,
                docNumber: form.docNumber
            },
            notes: form.notes || '',
            notify_admin: form.notifyAdmin,
            notify_user: form.notifyUser
        };

        if (this.manualBookingForm.id) {
            // Update
            this.apiService.adminUpdateBooking(this.manualBookingForm.id, payload).subscribe({
                next: () => {
                    alert('Reserva actualizada correctamente.');
                    this.closeManualBookingModal();
                    this.manualBookingLoading.set(false);
                    this.refreshData();
                },
                error: (e) => {
                    console.error('Update Error:', e);
                    const errorMsg = e.error?.error || e.error?.message || e.message || 'Error desconocido';
                    alert('Error al actualizar: ' + errorMsg);
                    this.manualBookingLoading.set(false);
                }
            });
        } else {
            // Create
            this.apiService.adminCreateBooking(payload).subscribe({
                next: () => {
                    alert('Reserva creada exitosamente.');
                    this.closeManualBookingModal();
                    this.manualBookingLoading.set(false);
                    this.refreshData();
                },
                error: (e) => {
                    console.error('Create Error:', e);
                    const errorMsg = e.error?.error || e.error?.message || e.message || 'Error desconocido';
                    alert('Error al crear: ' + errorMsg);
                    this.manualBookingLoading.set(false);
                }
            });
        }
    }

    cancelCurrentBooking(booking?: any) {
        const id = booking?.id || this.manualBookingForm.id;
        if (!id) return;

        if (confirm('¿Estás seguro de que deseas cancelar esta reserva? Esta acción liberará la disponibilidad del vehículo.')) {
            this.manualBookingLoading.set(true);
            this.apiService.adminUpdateBookingStatus(id, 'cancelled').subscribe({
                next: () => {
                    alert('Reserva cancelada correctamente.');
                    if (this.showManualBookingModal() && this.manualBookingForm.id === id) {
                        this.closeManualBookingModal();
                    }
                    this.manualBookingLoading.set(false);
                    this.refreshData();
                },
                error: (err) => {
                    this.manualBookingLoading.set(false);
                    console.error('Error cancelling booking', err);
                    alert('Error al cancelar la reserva: ' + (err.error?.message || err.message));
                }
            });
        }
    }

    // --- Helpers for Form ---
    // --- Helpers for Form ---
    newCostName = '';
    newCostPrice: number | null = null;
    breakdownData = { days: 0, baseTotal: 0, dropoff: 0 };

    addAdditionalCost() {
        if (!this.newCostName || this.newCostPrice === null) return;
        this.manualBookingForm.additionalCosts.push({ name: this.newCostName, price: this.newCostPrice });
        this.newCostName = '';
        this.newCostPrice = null;
        this.calculateManualPrice();
    }

    removeAdditionalCost(i: number) {
        this.manualBookingForm.additionalCosts.splice(i, 1);
        this.calculateManualPrice();
    }

    // --- Manual Booking Calculation Logic ---
    calculateManualPrice(source: 'date' | 'price' | 'other' = 'date') {
        const form = this.manualBookingForm;
        if (!form.startDate || !form.endDate || !this.selectedVehicle()) return;

        // 1. Parse Dates
        const start = new Date(form.startDate + 'T' + (form.pickupTime || '00:00') + ':00');
        const end = new Date(form.endDate + 'T' + (form.dropoffTime || '00:00') + ':00');

        if (end <= start) {
            this.manualBookingForm.totalPrice = 0;
            return;
        }

        // 2. Calculate Days (24h rule or Daily?)
        const diffMs = end.getTime() - start.getTime();
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const finalDays = days > 0 ? days : 1;

        // 3. Determine Base Price (Daily)
        let totalBase = 0;
        let avgPrice = 0;

        if (source === 'other' || source === 'price') {
            // Use current form values for manual recalculation (reload button or manual price edit)
            const currentPricePerDay = Number(form.pricePerDay) || 0;
            totalBase = finalDays * currentPricePerDay;
            avgPrice = currentPricePerDay;
        } else {
            // source === 'date' - Recalculate from category's base_price and special_periods
            const instance = this.selectedVehicle();
            let category: any = null;

            // Try to find the category object if available
            if (this.categoriesList && this.categoriesList()) {
                category = this.categoriesList().find(c => c.id === instance.category_id);
            }

            const refObj = category || instance; // Prefer category for stats? Or instance for price?

            // Prefer instance specific price if set, else category base
            let pBase = Number(instance.current_price || instance.price_per_day || refObj.base_price) || 0;

            // Parse special_periods from CATEGORY (usually where they are defined)
            let specialPeriods: any[] = [];
            const spSource = category ? category.special_periods : instance.special_periods;

            if (typeof spSource === 'string') {
                try { specialPeriods = JSON.parse(spSource); } catch (e) { }
            } else if (Array.isArray(spSource)) {
                specialPeriods = spSource;
            }

            let current = new Date(start);

            // Iterate through each day in the booking range
            for (let i = 0; i < finalDays; i++) {
                const dateStr = current.toISOString().split('T')[0];

                // Check if this date falls within any special period
                const matchingPeriod = specialPeriods.find((p: any) =>
                    dateStr >= p.start && dateStr <= p.end
                );

                let dailyRate = pBase;
                if (matchingPeriod && matchingPeriod.price) {
                    dailyRate = Number(matchingPeriod.price);
                }

                totalBase += dailyRate;

                // Advance 1 day
                current.setDate(current.getDate() + 1);
            }

            // Update form price to Average (for display)
            avgPrice = Math.round(totalBase / finalDays);
            this.manualBookingForm.pricePerDay = avgPrice;
        }

        // 4. Wash Fee (Use current form value)
        const wash = Number(form.washFee) || 0;

        // 5. Dropoff Fees
        let dropoff = 0;
        if (this.manualBookingForm.dropoffLocation !== this.manualBookingForm.pickupLocation) {
            dropoff = 0; // Mocked for now per inventory parity
        }

        const extras = this.manualBookingForm.additionalCosts.reduce((acc: number, cur: any) => acc + (Number(cur.price) || 0), 0);

        this.breakdownData = { days: finalDays, baseTotal: totalBase, dropoff };
        this.manualBookingForm.totalPrice = totalBase + wash + dropoff + extras;
    }

    saveEditedBooking() {
        this.saveManualBooking();
    }

    // --- Selection Logic Updates ---

    selectVehicle(vehicle: any, date?: Date) {
        // Core Selection
        if (this.selectedVehicle()?.id === vehicle.id && !date) {
            // Toggle off if no date context?
            // User requested: "selecciona ese vehiculo" - usually keeps it selected.
            // Let's just update selectedBoxDate if provided.
        }

        this.selectedVehicle.set(vehicle);

        if (date) {
            this.selectedBoxDate.set(date);
            // Search for booking on this date
            const days = this.availabilityData().find(r => r.vehicle.id === vehicle.id)?.days;
            // Now days has 'date' property
            const dayStatus = days?.find(d => {
                // date is Date object
                // d.date is Date object (from availabilityData)
                return (d as any).date && this.isSameDate(new Date((d as any).date), date);
            });

            if (dayStatus && (dayStatus as any).booking) {
                this.selectedBooking.set((dayStatus as any).booking);
            } else {
                // If clicked empty box, clear booking selection?
                // Request says: "al selecciona una box vacia se selecciona el vehiculo" - implies booking panel shows empty/create state?
                this.selectedBooking.set(null);
            }
        } else {
            // Just row click - try to keep existing booking if relevant?
            // Request: "Al seleccionar un vehiculo se muestra la reserva de la box seleccionada a menos que este vacia"
            // This means if we have a selectedBoxDate, we update the booking view.
            if (this.selectedBoxDate()) {
                // Re-run the search
                this.selectVehicle(vehicle, this.selectedBoxDate()!);
                return;
            }
            this.selectedBooking.set(null);
        }
    }

    selectBooking(booking: any) {
        if (!booking) return;
        this.selectedBooking.set(booking);
        // Ensure vehicle is selected for sidebar context
        const v = this.vehicles().find(veh => veh.id === booking.vehicle_id);
        if (v) {
            this.selectedVehicle.set(v);
        }
        // Sync date for context but DO NOT open modal
        if (booking.start_date) {
            this.selectedBoxDate.set(new Date(booking.start_date));
        }
        // NO CALL to openManualBookingModal
    }

    selectEmptySlot(vehicle: any, date: Date) {
        // Select vehicle and date
        this.selectedVehicle.set(vehicle);
        this.selectedBoxDate.set(date);

        // Ensure booking selection is cleared so sidebar doesn't show a previous booking
        this.selectedBooking.set(null);

        // Open Modal for NEW booking
        this.openManualBookingModal();
    }

    isVehicleBookedOnDate(vehicle: any, date: Date) {
        // Check local bookings signal
        return this.bookings().some(b => {
            if (b.vehicle_id !== vehicle.id) return false;
            if (b.status === 'cancelled') return false;
            const s = new Date(b.start_date);
            const e = new Date(b.end_date);
            // Normalize
            const check = new Date(date); check.setHours(12, 0, 0, 0);
            const bs = new Date(s); bs.setHours(0, 0, 0, 0);
            const be = new Date(e); be.setHours(23, 59, 59, 999);
            return check >= bs && check <= be;
        });
    }

    // Helper
    isSameDate(d1: Date, d2: Date) {
        return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    }



    refreshData() {
        // Re-call ngOnInit logic
        this.currentDate.set(new Date(this.currentDate())); // Trigger effects
    }

    // --- Booking Modal Helpers ---
    isMaintenanceBooking = signal(false);
    editingBookingId = signal<number | null>(null);
    editingBookingStatus = signal<string>('');

    isPickupPassed() {
        if (!this.manualBookingForm.startDate || !this.manualBookingForm.pickupTime) return false;
        const start = new Date(this.manualBookingForm.startDate + 'T' + this.manualBookingForm.pickupTime);
        return new Date() > start;
    }

    isDropoffPassed() {
        if (!this.manualBookingForm.endDate || !this.manualBookingForm.dropoffTime) return false;
        const end = new Date(this.manualBookingForm.endDate + 'T' + this.manualBookingForm.dropoffTime);
        return new Date() > end;
    }

    deleteBooking() {
        const id = this.manualBookingForm.id;
        if (!id) return;
        if (!confirm('¿Estás seguro de que deseas cancelar/eliminar esta reserva?')) return;

        // Use cancel logic or delete? Reference implies delete for total removal
        this.apiService.adminDeleteBooking(id).subscribe({
            next: () => {
                alert('Reserva eliminada.');
                this.closeManualBookingModal();
                this.refreshData();
            },
            error: (e) => alert('Error: ' + e.message)
        });
    }

    // Dropoff City
    selectManualDropoffCity(city: string) {
        this.manualBookingForm.dropoffLocation = city;
        this.showManualDropoffCity.set(false);
    }

    // Doc Type
    selectManualDocType(type: string) {
        this.manualBookingForm.docType = type;
        this.showManualDocType.set(false);
    }

    // DDI Logic
    ddiSearch = signal('');
    filterDDI(val: string) {
        this.ddiSearch.set(val);
    }

    filteredDDI = computed(() => {
        const all = [
            { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
            { name: 'Estados Unidos', code: 'US', dialCode: '+1', flag: '🇺🇸' },
            { name: 'México', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
            { name: 'España', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
            { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
            { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱' },
            { name: 'Perú', code: 'PE', dialCode: '+51', flag: '🇵🇪' },
            { name: 'Ecuador', code: 'EC', dialCode: '+593', flag: '🇪🇨' },
            { name: 'Panamá', code: 'PA', dialCode: '+507', flag: '🇵🇦' },
            { name: 'Brasil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
            { name: 'Rep. Dominicana', code: 'DO', dialCode: '+1', flag: '🇩🇴' }
        ];
        if (!this.ddiSearch()) return all;
        const q = this.ddiSearch().toLowerCase();
        return all.filter(c => c.name.toLowerCase().includes(q) || c.dialCode.includes(q));
    });

    selectManualDDI(country: any) {
        this.manualBookingForm.ddi = country.dialCode;
        this.showManualDDI.set(false);
    }

    formatDisplayDate(dateStr: string) {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }

    formatDisplayTime(timeStr: string | null | undefined) {
        if (!timeStr) return '';
        // Handle HH:MM or HH:MM:SS
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;

        const h = Number(parts[0]);
        const m = Number(parts[1]);
        if (isNaN(h) || isNaN(m)) return timeStr;

        const date = new Date();
        date.setHours(h);
        date.setMinutes(m);
        return this.formatTime(date);
    }

    // Form Date Pickers Handlers
    onBookingPickupDateSelected(date: Date) {
        this.manualBookingForm.startDate = date.toISOString().split('T')[0];
        this.showBookingPickupDate.set(false);
    }

    onBookingDropoffDateSelected(date: Date) {
        this.manualBookingForm.endDate = date.toISOString().split('T')[0];
        this.showBookingDropoffDate.set(false);
    }

    selectBookingTime(type: 'pickup' | 'dropoff', time: string) {
        if (type === 'pickup') {
            this.manualBookingForm.pickupTime = time;
            this.showBookingPickupTime.set(false);
        } else {
            this.manualBookingForm.dropoffTime = time;
            this.showBookingDropoffTime.set(false);
        }
    }

    // --- Full Booking Viewer State ---
    showFullBookingModal = signal(false);
    selectedFullBooking = signal<any>(null);

    openFullBookingModal(booking: any) {
        this.selectedFullBooking.set(booking);
        this.showFullBookingModal.set(true);
    }

    closeFullBookingModal() {
        this.showFullBookingModal.set(false);
        this.selectedFullBooking.set(null);
    }

    getInitials(name: string) {
        if (!name) return 'AN';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }




    getDateTime(dateStr: string, timeStr: string): Date {
        return new Date(`${dateStr}T${timeStr || '00:00:00'}`);
    }

    updateVehicleStatus(vehicle: any, status: string) {
        // Placeholder for API call
        // this.apiService.updateVehicleStatus(vehicle.id, status).subscribe(...)
        // Optimistic update
        const updated = this.vehicles().map(v => v.id === vehicle.id ? { ...v, status } : v);
        this.vehicles.set(updated);
        this.selectedVehicle.set({ ...vehicle, status });
    }

    formatDateShortSpanish(dateStr: string) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        // e.g. "10 Ene"
        return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(d).replace('.', '');
    }

    formatDateShort(dateStr: string) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    }

    // Tariff Helper Methods
    getCurrentPrice(cat: any): number {
        const targetDate = new Date(this.currentDate());
        const dateStr = targetDate.toISOString().split('T')[0];

        let pBase = Number(cat.base_price) || 0;

        // Parse special_periods
        let specialPeriods: any[] = [];
        if (typeof cat.special_periods === 'string') {
            try { specialPeriods = JSON.parse(cat.special_periods); } catch (e) { }
        } else if (Array.isArray(cat.special_periods)) {
            specialPeriods = cat.special_periods;
        }

        const matchingPeriod = specialPeriods.find((p: any) =>
            dateStr >= p.start && dateStr <= p.end
        );

        if (matchingPeriod && matchingPeriod.price) {
            return Number(matchingPeriod.price);
        }

        return pBase;
    }

    isSpecialPrice(cat: any): boolean {
        const targetDate = new Date(this.currentDate());
        const dateStr = targetDate.toISOString().split('T')[0];

        let specialPeriods: any[] = [];
        if (typeof cat.special_periods === 'string') {
            try { specialPeriods = JSON.parse(cat.special_periods); } catch (e) { }
        } else if (Array.isArray(cat.special_periods)) {
            specialPeriods = cat.special_periods;
        }

        return specialPeriods.some((p: any) => dateStr >= p.start && dateStr <= p.end);
    }

    getShortName(fullName: string): string {
        if (!fullName) return '---';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0];
        // Return First Name + Last Name (assuming 2nd word is last name or first last name)
        // User asked for "Primer Nombre y Primer Apellido"
        // If name is "Juan Pablo Perez", parts[0] is Juan, parts[1] is Pablo.
        // Usually, split by space, take index 0 and index 1? Or 0 and last?
        // User "primer nombre y primer apellido" usually implies Name + Surname.
        // But in many systems "Juan Pablo Perez" -> "Juan Pablo" are names. 
        // I will stick to "Word 1" + "Word 2" for simplicity unless I have structured data.
        return `${parts[0]} ${parts[1]}`;
    }

    formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    }
    getFirstName(fullName: string): string {
        if (!fullName) return '';
        const parts = fullName.trim().split(/\s+/);
        return parts.length > 0 ? parts[0] : '';
    }

    getLastName(fullName: string): string {
        if (!fullName) return '';
        const parts = fullName.trim().split(/\s+/);
        return parts.length > 1 ? parts[1] : '';
    }

    // Tariff Editing Logic
    openEditRates(cat: any) {
        this.editingCategory.set(cat);
        this.basePriceToEdit = cat.base_price || cat.price_per_day || 0;

        let periods = [];
        if (typeof cat.special_periods === 'string') {
            try { periods = JSON.parse(cat.special_periods); } catch (e) { }
        } else if (cat.special_periods && Array.isArray(cat.special_periods)) {
            periods = cat.special_periods;
        }
        this.specialPeriods.set(periods || []);
        this.showEditRatesModal.set(true);
    }

    addSpecialPeriod() {
        const current = this.specialPeriods();
        this.specialPeriods.set([...current, { name: '', start: '', end: '', price: 0 }]);
    }

    removeSpecialPeriod(index: number) {
        const current = this.specialPeriods();
        this.specialPeriods.set(current.filter((_, i) => i !== index));
    }

    toggleCalendar(index: number, type: 'start' | 'end', event: Event) {
        event.stopPropagation();
        event.preventDefault();
        const key = String(index) + '-' + type;
        const current = this.activeCalendar();
        if (current === key) {
            this.activeCalendar.set(null);
        } else {
            this.activeCalendar.set(key);
        }
    }

    isCalendarOpen(index: number, type: 'start' | 'end'): boolean {
        return this.activeCalendar() === (String(index) + '-' + type);
    }

    getPeriodDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
        return null;
    }

    setPeriodDate(index: number, type: 'start' | 'end', date: Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        const updated = [...this.specialPeriods()];
        updated[index] = { ...updated[index], [type]: dateStr };

        if (type === 'start') {
            if (updated[index].end && dateStr > updated[index].end) {
                updated[index].end = dateStr;
            }
        }

        this.specialPeriods.set(updated);
        setTimeout(() => this.activeCalendar.set(null), 100);
    }

    getMinStartDate(index: number | null): Date | null {
        const jan1 = new Date(new Date().getFullYear(), 0, 1);
        jan1.setHours(0, 0, 0, 0);
        return jan1;
    }

    getUnavailableRanges(currentIndex: number): { start: Date, end: Date }[] {
        const periods = this.specialPeriods();
        const ranges: { start: Date, end: Date }[] = [];
        periods.forEach((p, i) => {
            if (i !== currentIndex && p.start && p.end) {
                const start = this.getPeriodDate(p.start);
                const end = this.getPeriodDate(p.end);
                if (start && end) ranges.push({ start, end });
            }
        });
        return ranges;
    }

    saveRates() {
        const cat = this.editingCategory();
        if (!cat) return;

        this.ratesLoading.set(true);

        const formData = new FormData();
        formData.append('name', cat.name);
        formData.append('base_price', String(this.basePriceToEdit));
        formData.append('special_periods', JSON.stringify(this.specialPeriods()));

        // Mantener otros campos si están disponibles o enviarlos como están
        if (cat.description) formData.append('description', cat.description);
        if (cat.passengers) formData.append('passengers', String(cat.passengers));
        if (cat.luggage) formData.append('luggage', String(cat.luggage));
        if (cat.transmission) formData.append('transmission', cat.transmission);

        this.apiService.adminUpdateVehicle(cat.id, formData).subscribe({
            next: () => {
                this.ratesLoading.set(false);
                this.showEditRatesModal.set(false);
                // Recargar categorías para ver cambios en el ticker
                this.apiService.adminGetVehicles().subscribe(res => {
                    this.categoriesList.set(res || []);
                });
            },
            error: (err) => {
                console.error('Error saving rates:', err);
                this.ratesLoading.set(false);
                alert('Error al guardar las tarifas');
            }
        });
    }
}
