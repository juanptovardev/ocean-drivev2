import { Component, EventEmitter, Output, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-5 bg-white font-sans w-full relative overflow-hidden flex flex-col transition-all duration-300" [ngClass]="{'h-auto': viewMode() === 'days', 'h-[340px]': viewMode() !== 'days'}">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 w-full shrink-0 z-20 relative">
        <button type="button" aria-label="Mes anterior" (click)="prevPage($event)" class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button type="button" (click)="cycleViewMode()" class="flex-1 text-center font-extrabold text-[#002B5B] uppercase tracking-widest hover:bg-blue-50 py-2 rounded-lg transition-colors mx-2 text-sm">
          @if(viewMode() === 'days') {
            {{ currentMonthName() }} {{ currentYear() }}
          } @else if(viewMode() === 'months') {
            {{ currentYear() }}
          } @else {
            {{ yearsList[0] }} - {{ yearsList[yearsList.length - 1] }}
          }
        </button>

        <button type="button" aria-label="Mes siguiente" (click)="nextPage($event)" class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Content Container -->
      <div class="flex-1 relative overflow-hidden">
          
          <!-- DAYS VIEW -->
          @if(viewMode() === 'days') {
              <div class="animate-fade-in flex flex-col">
                  <!-- Weekdays -->
                  <div class="grid grid-cols-7 gap-1 mb-2 shrink-0">
                      @for(day of weekDays; track day) {
                        <div class="text-center text-[12px] font-bold text-slate-400 uppercase tracking-wider py-1 select-none">
                            {{ day }}
                        </div>
                      }
                  </div>

                  <!-- Days -->
                  <div class="grid grid-cols-7 gap-1 flex-1 content-start">
                      @for(day of calendarDays(); track $index) {
                          <button type="button" (click)="selectDate(day.date)" [disabled]="day.disabled"
                            class="aspect-square w-full rounded-lg flex items-center justify-center text-sm transition-all duration-200 relative font-bold"
                            [ngClass]="{
                                'text-slate-200 cursor-not-allowed': day.disabled,
                                'hover:bg-blue-50 hover:text-[#002B5B] text-slate-800 cursor-pointer': !day.disabled && !day.selected,
                                'bg-[#002B5B] text-white shadow-md shadow-blue-900/10 scale-105 z-10': day.selected,
                                'invisible': day.empty
                            }">
                            @if(!day.empty) { {{ day.day }} }
                          </button>
                      }
                  </div>
              </div>
          }

          <!-- MONTHS VIEW -->
          @if(viewMode() === 'months') {
              <div class="grid grid-cols-3 gap-4 h-full animate-fade-in content-center">
                  @for(month of monthNames; track $index) {
                      <button type="button" (click)="selectMonth($index)" [disabled]="isMonthDisabled($index)"
                              class="p-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
                              [ngClass]="{
                                  'bg-[#002B5B] text-white shadow-lg': $index === currentDate().getMonth() && !isMonthDisabled($index),
                                  'bg-slate-50 text-slate-800 hover:bg-blue-50 hover:text-[#002B5B] hover:scale-105 active:scale-95': $index !== currentDate().getMonth() && !isMonthDisabled($index),
                                  'opacity-30 cursor-not-allowed text-slate-400': isMonthDisabled($index)
                              }">
                          {{ month }}
                      </button>
                  }
              </div>
          }

          <!-- YEARS VIEW -->
          @if(viewMode() === 'years') {
              <div class="grid grid-cols-4 gap-3 h-full animate-fade-in content-center overflow-y-auto custom-scrollbar pr-1 max-h-[250px]">
                  @for(year of yearsList; track year) {
                      <button type="button" (click)="selectYear(year)" [disabled]="isYearBlocked(year)"
                              class="p-2 rounded-xl text-sm font-bold transition-all"
                              [ngClass]="{
                                  'bg-[#002B5B] text-white shadow-lg': year === currentDate().getFullYear() && !isYearBlocked(year),
                                  'bg-slate-50 text-slate-800 hover:bg-blue-50 hover:text-[#002B5B] hover:scale-105 active:scale-95': year !== currentDate().getFullYear() && !isYearBlocked(year),
                                  'opacity-30 cursor-not-allowed text-slate-400': isYearBlocked(year)
                              }">
                          {{ year }}
                      </button>
                  }
              </div>
          }
      </div>
    </div>
  `,
  styles: [`
      .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
      }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
  `]
})
export class CalendarComponent {
  @Output() dateSelected = new EventEmitter<Date>();

  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);
  minDateSignal = signal<Date | null>(null);
  disabledRangesSignal = signal<{ start: Date, end: Date }[]>([]);

  viewMode = signal<'days' | 'months' | 'years'>('days');

  private initialized = false;

  @Input() set date(value: Date | null) {
    if (value) {
      this.selectedDate.set(value);
      if (!this.initialized) {
        this.currentDate.set(new Date(value));
        this.initialized = true;
      }
    }
  }

  @Input() set minDate(value: Date | null) {
    this.minDateSignal.set(value);
  }

  @Input() set disabledRanges(value: { start: string | Date, end: string | Date }[]) {
    const processed = value.map(r => ({
      start: new Date(r.start),
      end: new Date(r.end)
    }));
    processed.forEach(r => {
      r.start.setHours(0, 0, 0, 0);
      r.end.setHours(23, 59, 59, 999);
    });
    this.disabledRangesSignal.set(processed);
  }

  weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
  // Short month names for template
  monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  currentMonthName = computed(() => {
    return this.currentDate().toLocaleString('es-CO', { month: 'long' });
  });

  currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  // Years list for 'years' view (centered around current year selection)
  get yearsList(): number[] {
    const current = this.currentDate().getFullYear();
    const start = current - 6;
    const end = current + 9;
    const years = [];
    for (let y = start; y <= end; y++) {
      years.push(y);
    }
    return years;
  }

  isMonthDisabled(monthIndex: number): boolean {
    const minDate = this.minDateSignal();
    if (!minDate) return false;

    const currentViewYear = this.currentDate().getFullYear();
    const minYear = minDate.getFullYear();

    if (currentViewYear < minYear) return true;
    if (currentViewYear > minYear) return false;

    // Same year, check month
    return monthIndex < minDate.getMonth();
  }

  isYearBlocked(year: number): boolean {
    const minDate = this.minDateSignal();
    if (!minDate) return false;
    return year < minDate.getFullYear();
  }

  isPrevDisabled(): boolean {
    const min = this.minDateSignal();
    const d = this.currentDate();
    const mode = this.viewMode();
    if (!min) return false;

    if (mode === 'days') {
      // Compare current month start with min month start
      const currentMonthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const minMonthStart = new Date(min.getFullYear(), min.getMonth(), 1);
      return currentMonthStart <= minMonthStart;
    } else if (mode === 'months') {
      // Compare current year with min year
      return d.getFullYear() <= min.getFullYear();
    } else if (mode === 'years') {
      return (d.getFullYear() - 7) < min.getFullYear();
    }
    return false;
  }

  calendarDays = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: any[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push({ empty: true });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ranges = this.disabledRangesSignal();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      const min = this.minDateSignal();

      let isDisabled = false;
      if (min) {
        const minCopy = new Date(min);
        minCopy.setHours(0, 0, 0, 0);
        isDisabled = date < minCopy;
      } else {
        isDisabled = date < today;
      }

      if (!isDisabled && ranges.length > 0) {
        const dateMs = date.getTime();
        for (const range of ranges) {
          if (dateMs >= range.start.getTime() && dateMs <= range.end.getTime()) {
            isDisabled = true;
            break;
          }
        }
      }

      const isSelected = this.selectedDate()?.toDateString() === date.toDateString();

      days.push({
        day: i,
        date: date,
        disabled: isDisabled,
        selected: isSelected,
        empty: false
      });
    }
    return days;
  });

  // Navigation Logic
  prevPage(event?: Event) {
    event?.stopPropagation();
    if (this.isPrevDisabled()) return; // Extra safety

    const mode = this.viewMode();
    const d = new Date(this.currentDate());

    if (mode === 'days') {
      d.setMonth(d.getMonth() - 1);
    } else if (mode === 'months') {
      d.setFullYear(d.getFullYear() - 1);
    } else if (mode === 'years') {
      d.setFullYear(d.getFullYear() - 16);
    }
    this.currentDate.set(d);
  }

  nextPage(event?: Event) {
    event?.stopPropagation();
    const mode = this.viewMode();
    const d = new Date(this.currentDate());

    if (mode === 'days') {
      d.setMonth(d.getMonth() + 1);
    } else if (mode === 'months') {
      d.setFullYear(d.getFullYear() + 1);
    } else if (mode === 'years') {
      d.setFullYear(d.getFullYear() + 16);
    }
    this.currentDate.set(d);
  }

  // View Switching
  cycleViewMode() {
    const mode = this.viewMode();
    if (mode === 'days') this.viewMode.set('months');
    else if (mode === 'months') this.viewMode.set('years');
    else this.viewMode.set('days');
  }

  selectMonth(monthIndex: number) {
    if (this.isMonthDisabled(monthIndex)) return;
    const d = new Date(this.currentDate());
    d.setMonth(monthIndex);
    this.currentDate.set(d);
    this.viewMode.set('days');
  }

  selectYear(year: number) {
    if (this.isYearBlocked(year)) return;
    const d = new Date(this.currentDate());
    d.setFullYear(year);

    // Validate that the current month is valid for the new year
    // If we move back to a year that is equal to minYear, check month
    const minDate = this.minDateSignal();
    if (minDate && year === minDate.getFullYear()) {
      if (d.getMonth() < minDate.getMonth()) {
        d.setMonth(minDate.getMonth());
      }
    }

    this.currentDate.set(d);
    this.viewMode.set('months');
  }

  selectDate(date: Date) {
    if (!date) return;
    this.selectedDate.set(date);
    this.dateSelected.emit(date);
  }
}
