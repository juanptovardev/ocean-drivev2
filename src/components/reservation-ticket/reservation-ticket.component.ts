import { Component, Input, computed, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { CalendarComponent } from '../calendar/calendar.component';
import { CurrencyService } from '../../services/currency.service';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-reservation-ticket',
    standalone: true,
    imports: [CommonModule, CalendarComponent],
    template: `
    <div class="w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row relative group hover:shadow-2xl transition-all duration-300 border border-gray-100 ticket-shape">
      
      <!-- Left: Decorative Strip -->
      <div class="hidden md:block w-2 bg-[#FF6F61] h-full absolute left-0 top-0 bottom-0 z-10"></div>
      
      <!-- Section 1: Vehicle Info (Compact & Background Image) -->
      <div class="relative w-full md:w-56 overflow-hidden group/car">
          @if(selectedCar(); as car) {
             <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/car:scale-110" 
                  [style.backgroundImage]="'url(' + car.imageUrl + ')'"></div>
             <div class="absolute inset-0 bg-[#002B5B]/80 md:bg-[#002B5B]/70 hover:bg-[#002B5B]/60 transition-colors duration-300"></div>
             
             <div class="relative z-10 h-full p-6 flex flex-col justify-between text-white">
                <div>
                   <p class="text-[0.55rem] font-bold text-gray-300 uppercase tracking-widest mb-1">{{ lang.t('ticket.assigned') }}</p>
                   <h3 class="text-white font-black text-2xl italic tracking-tighter leading-none mb-1">{{ car.title }}</h3>
                   <p class="text-[0.65rem] text-gray-200 font-bold leading-tight mb-2 uppercase">{{ carDescription || car.category || car.description }}</p>
                   
                   <!-- Additional specs -->
                   <div class="flex flex-wrap gap-x-3 gap-y-1 opacity-90 pt-1.5 border-t border-white/20">
                       <div class="flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-tighter">
                           <svg class="w-2.5 h-2.5 text-[#FF6F61]" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 015.75-2.906z"></path></svg>
                           <span>{{ car.specs?.[0]?.text || lang.t('ticket.passengers') }}</span>
                       </div>
                       <div class="flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-tighter">
                           <svg class="w-2.5 h-2.5 text-[#FF6F61]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>
                           <span>{{ car.specs?.[3]?.text || lang.t('ticket.transmission') }}</span>
                       </div>
                   </div>
                </div>

                <!-- Plate -->
                @if(plate) {
                    <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col items-center justify-center self-start md:self-auto mt-4 shadow-lg">
                        <span class="text-[0.5rem] uppercase tracking-widest text-gray-300 mb-0.5">{{ lang.t('ticket.plate') }}</span>
                        <span class="text-xl font-black text-white tracking-[0.2em] font-mono leading-none">{{ plate | uppercase }}</span>
                    </div>
                }
             </div>
          }
         <!-- Right Border Dashed for Ticket effect -->
         <div class="absolute top-0 right-0 h-full w-[1px] border-r border-dashed border-white/30 hidden md:block"></div>
      </div>

      <!-- Section 2: Journey Details -->
      <div class="p-6 md:p-6 flex-1 flex flex-col justify-center relative bg-white md:pl-10">
         <div class="flex items-center justify-between gap-6">
             <!-- Pickup -->
             <div class="text-left group/edit">
                 <p class="text-[0.55rem] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ lang.t('ticket.pickup') }}</p>
                 <div class="text-[#002B5B] font-black text-3xl uppercase tracking-tighter leading-none">{{ pickupCityCode }}</div>
                 <p class="text-[0.65rem] text-gray-500 font-bold mt-1">{{ formatDate(pickupDate()) }}</p>
                 <p class="text-[0.6rem] text-gray-400">{{ pickupTime() }}</p>
                 
                 <!-- Always Visible Edit Button -->
                 @if(!readonly) {
                     <button (click)="openEditModal('pickup')" class="mt-2 text-[0.6rem] text-[#FF6F61] hover:text-[#002B5B] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 group/btn">
                        <span>{{ lang.t('ticket.edit') }}</span>
                        <svg class="w-3 h-3 transform transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     </button>
                 }
             </div>

             <!-- Path Visual -->
             <div class="flex-1 flex flex-col items-center px-2">
                 <div class="text-[0.5rem] whitespace-nowrap font-bold text-gray-800 uppercase tracking-widest mb-1 bg-red-50 px-2 h-4 inline-flex items-center justify-center rounded-full leading-none">{{ rentalDays() }} {{ lang.t('ticket.days') }}</div>
                 <div class="w-full h-px bg-gray-200 relative flex items-center justify-between mt-1">
                     <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                     <!-- Plane/Auto Icon -->
                     <svg class="w-4 h-4 text-gray-300 absolute left-1/2 -translate-x-1/2 -top-2 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                     <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                 </div>
             </div>

             <!-- Dropoff -->
             <div class="text-right group/edit">
                 <p class="text-[0.55rem] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ lang.t('ticket.dropoff') }}</p>
                 <div class="text-[#002B5B] font-black text-3xl uppercase tracking-tighter leading-none">{{ dropoffCityCode }}</div>
                 <p class="text-[0.65rem] text-gray-500 font-bold mt-1">{{ formatDate(dropoffDate()) }}</p>
                 <p class="text-[0.6rem] text-gray-400">{{ dropoffTime() }}</p>

                 <!-- Always Visible Edit Button -->
                 @if(!readonly) {
                     <button (click)="openEditModal('dropoff')" class="mt-2 text-[0.6rem] text-[#FF6F61] hover:text-[#002B5B] font-bold uppercase tracking-wider transition-colors flex items-center justify-end gap-1 ml-auto group/btn">
                        <span>{{ lang.t('ticket.edit') }}</span>
                        <svg class="w-3 h-3 transform transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     </button>
                 }
             </div>
         </div>
      </div>

      <!-- Section 3: Costos Detallados -->
       <div class="p-6 md:p-8 md:w-72 bg-gray-50 flex flex-col justify-center relative border-t md:border-t-0 md:border-l border-gray-100">
           <h4 class="text-[#006633] font-black text-xs uppercase tracking-widest mb-4">{{ lang.t('ticket.costs_detail') }}</h4>
           
           <div class="space-y-3 text-xs text-gray-600">
               <!-- Daily Rate -->
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-gray-700">{{ lang.t('ticket.cost_day') }}</p>
                        <p class="opacity-80">{{ rentalDays() }} {{ lang.t('ticket.days') }} x {{ currencyService.formatPrice(dailyPrice()) }}</p>
                    </div>
                    <p class="font-bold text-gray-800">{{ currencyService.formatPrice(totalDaysCost()) }}</p>
                </div>

                <!-- Wash Service (Single General Wash) -->
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-gray-700">{{ lang.t('ticket.wash') }}</p>
                        <p class="opacity-80">{{ lang.t('ticket.cleaning') }}</p>
                    </div>
                    <p class="font-bold text-gray-800">{{ currencyService.formatPrice(carWashPrice()) }}</p>
                </div>

                <!-- Dropoff Fee (Different City) -->
                @if (dropoffFee() > 0) {
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-gray-700">{{ lang.t('ticket.dropoff_in') }} {{ dropoffCity() }}</p>
                            <p class="opacity-80">{{ lang.t('ticket.transfer_city') }}</p>
                        </div>
                        <p class="font-bold text-gray-800">{{ currencyService.formatPrice(dropoffFee()) }}</p>
                    </div>
                }
           </div>
       </div>

       <!-- Section 4: Total Summary -->
       <div class="bg-[#002B5B] p-6 md:p-6 md:w-56 flex flex-col justify-center items-center text-white relative overflow-hidden">
           <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 10px 10px;"></div>
           <div class="relative z-10 text-center">
               <p class="text-[0.6rem] uppercase tracking-[0.2em] text-[#FF6F61] font-bold mb-2">{{ lang.t('ticket.total') }}</p>
                <div class="mb-1">
                    <p class="text-2xl font-light leading-none">
                        {{ currencyService.formatPrice(totalAmount) }}
                    </p>
                </div>
                <p class="text-[0.5rem] text-blue-200 font-medium">{{ lang.t('ticket.taxes') }}</p>
           </div>

           <!-- Barcode Fake -->
           <div class="mt-4 h-6 w-3/4 bg-white/10 rounded flex items-center justify-center gap-1 overflow-hidden opacity-50">
              <div class="w-[2px] h-full bg-white"></div><div class="w-[4px] h-full bg-white"></div><div class="w-[1px] h-full bg-white"></div><div class="w-[6px] h-full bg-white"></div><div class="w-[2px] h-full bg-white"></div><div class="w-[3px] h-full bg-white"></div>
           </div>
       </div>
    </div>

    <!-- Edit Modal (Floating Premium) -->
    @if(isEditModalOpen) {
       <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <!-- Backdrop -->
           <div (click)="closeEditModal()" class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"></div>
           
           <!-- Modal Content -->
           <div class="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl border border-white/50 animate-scale-in overflow-visible">
               <button (click)="closeEditModal()" class="absolute -top-3 -right-3 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-[#FF6F61] transition-all hover:scale-110 active:scale-95 z-50">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>

               <div class="mb-8">
                   <h3 class="text-[#002B5B] font-black text-2xl uppercase italic tracking-tighter leading-none mb-2">
                       {{ currentEditTarget === 'pickup' ? lang.t('ticket.edit_pickup') : lang.t('ticket.edit_dropoff') }}
                   </h3>
                   <p class="text-xs text-gray-500 font-medium tracking-wide">{{ lang.t('ticket.update_itinerary') }}</p>
               </div>

               <form class="space-y-6">
                   <!-- City Selector (Premium Dropdown) -->
                   <div class="group relative" [class.z-[60]]="isCityDropdownOpen" [class.z-20]="!isCityDropdownOpen">
                       <label class="block text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-2 pl-1 transition-colors group-hover:text-[#FF6F61]">{{ lang.t('ticket.city') }}</label>
                       
                       <div class="relative">
                            <button type="button" (click)="toggleDropdown('city')" 
                               class="w-full px-5 py-2 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 outline-none text-left flex items-center justify-between text-gray-600 group-hover:text-[#002B5B] touch-manipulation focus:ring-2 focus:ring-[#FF6F61]/20"
                               [class.text-[#002B5B]]="currentEditCity()" [class.font-bold]="currentEditCity()">
                               <div class="flex flex-col leading-tight">
                                   <span class="text-[0.9rem] tracking-tight">{{ currentEditCity() || lang.t('ticket.select_city') }}</span>
                                   @if(currentEditCity()) {
                                       <span class="text-[0.6rem] text-gray-400 font-medium tracking-wide">{{ airportInfo[currentEditCity()] }}</span>
                                   }
                               </div>
                               <svg class="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-[#FF6F61]" 
                                    [class.rotate-180]="isCityDropdownOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"></path>
                               </svg>
                           </button>

                           @if(isCityDropdownOpen) {
                               <div class="absolute inset-x-0 z-[100] mt-1 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 py-2 max-h-60 overflow-y-auto animate-scale-in custom-scrollbar">
                                   @for(city of availableCities; track city) {
                                       <button type="button" (click)="selectCity(city)"
                                               class="w-full px-5 py-3 text-left text-[0.85rem] transition-all duration-200 flex items-center justify-between group/item touch-manipulation border-b border-gray-50 last:border-0"
                                               [ngClass]="{
                                                 'bg-blue-50/30 text-[#002B5B] font-bold': currentEditCity() === city,
                                                 'text-gray-600 hover:bg-blue-50/50 hover:text-[#002B5B]': currentEditCity() !== city
                                               }">
                                           <span class="font-medium group-hover/item:font-bold">{{ city }}</span>
                                           <span class="text-[0.55rem] font-bold tracking-widest bg-gray-100/80 px-2 py-0.5 rounded text-gray-500 group-hover/item:bg-white group-hover/item:text-[#002B5B] transition-colors">
                                               {{ airportInfo[city] ? airportInfo[city].split(' - ')[0] : '' }}
                                           </span>
                                       </button>
                                   }
                               </div>
                           }
                       </div>
                   </div>

                   <!-- Date Picker -->
                    <div class="group relative" [class.z-[60]]="isDateDropdownOpen" [class.z-20]="!isDateDropdownOpen">
                       <label class="block text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-2 pl-1 transition-colors group-hover:text-[#FF6F61]">{{ lang.t('ticket.date') }}</label>
                       <div class="relative">
                           <button type="button" (click)="toggleDropdown('date')"
                                   [class.opacity-50]="isDateDisabled()"
                                   [class.cursor-not-allowed]="isDateDisabled()"
                                   class="w-full px-5 py-2 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 outline-none text-left flex items-center justify-between text-gray-600 group-hover:text-[#002B5B] touch-manipulation focus:ring-2 focus:ring-[#FF6F61]/20"
                                   [class.text-[#002B5B]]="currentEditDate()" [class.font-bold]="currentEditDate()">
                               <span class="text-[0.9rem] tracking-tight">{{ formatDate(currentEditDate()) || lang.t('ticket.select_date') }}</span>
                               
                               <svg class="w-4 h-4 text-gray-400 transition-colors duration-300 group-hover:text-[#FF6F61]"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                               </svg>
                           </button>

                           @if(isDateDropdownOpen) {
                               <div class="relative mt-4 z-[100] bg-white rounded-2xl shadow-2xl shadow-[#002B5B]/15 border border-gray-100 animate-scale-in origin-top">
                                   <app-calendar [date]="currentEditDate()" (dateSelected)="onDateChange($event)"></app-calendar>
                               </div>
                           }
                       </div>
                   </div>

                   <!-- Time Selector -->
                    <div class="group relative" [class.z-[60]]="isTimeDropdownOpen" [class.z-20]="!isTimeDropdownOpen">
                       <label class="block text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-2 pl-1 transition-colors group-hover:text-[#FF6F61]">{{ lang.t('ticket.time') }}</label>
                       
                       <div class="relative">
                            <button type="button" (click)="toggleDropdown('time')"
                               [class.opacity-50]="isTimeDisabled()"
                               [class.cursor-not-allowed]="isTimeDisabled()"
                               class="w-full px-5 py-2 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 outline-none text-left flex items-center justify-between text-gray-600 group-hover:text-[#002B5B] touch-manipulation focus:ring-2 focus:ring-[#FF6F61]/20"
                               [class.text-[#002B5B]]="currentEditTime()" [class.font-bold]="currentEditTime()">
                               <div class="flex flex-col leading-tight">
                                   <span class="text-[0.9rem] tracking-tight">{{ currentEditTime() || lang.t('ticket.select_time') }}</span>
                               </div>
                               <svg class="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-[#FF6F61]"
                                    [class.rotate-180]="isTimeDropdownOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"></path>
                               </svg>
                           </button>

                           @if(isTimeDropdownOpen) {
                               <div class="absolute inset-x-0 z-[100] mt-1 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 py-2 max-h-60 overflow-y-auto animate-scale-in custom-scrollbar">
                                   @for(time of availableTimes; track time) {
                                       <button type="button" (click)="selectTime(time)"
                                               class="w-full px-5 py-2.5 text-left text-sm font-medium transition-all duration-200 flex items-center gap-3 hover:bg-blue-50/50 hover:text-[#002B5B] hover:font-bold border-l-4 border-transparent hover:border-[#FF6F61]"
                                               [ngClass]="{
                                                 'bg-blue-50/30 text-[#002B5B] font-bold border-[#FF6F61]': currentEditTime() === time,
                                                 'text-gray-600': currentEditTime() !== time
                                               }">
                                           {{ time }}
                                       </button>
                                   }
                               </div>
                           }
                       </div>
                   </div>

                   <!-- Action Buttons -->
                   <div class="pt-4 flex gap-4">
                       <button type="button" (click)="closeEditModal()" 
                               class="flex-1 bg-slate-100 text-gray-500 font-extrabold py-4 rounded-[1.25rem] hover:bg-slate-200 transition-all active:scale-95 text-xs uppercase tracking-widest">
                           {{ lang.t('ticket.cancel') }}
                       </button>
                       <button type="button" (click)="saveChanges()" 
                               class="flex-[1.5] bg-[#FF6F61] text-white font-extrabold py-4 rounded-[1.25rem] hover:bg-[#ff5d4d] transition-all shadow-xl shadow-[#FF6F61]/20 hover:-translate-y-1 active:translate-y-0 active:scale-95 text-xs uppercase tracking-widest">
                           {{ lang.t('ticket.save') }}
                       </button>
                   </div>
               </form>
           </div>
       </div>
    }

    <!-- Dropoff Fee Confirmation Modal -->
    @if(showDropoffFeeModal()) {
        <div class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-scale-in" (click)="cancelDropoffModal()">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up" (click)="$event.stopPropagation()">
                <!-- Header -->
                <div class="flex items-center justify-between px-6 pt-5 pb-2">
                    <div class="flex items-center gap-1">
                        <span class="text-blue-600 font-black text-lg">#</span>
                        <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight italic">{{ lang.t('ticket.modal.dropoff') }}</h3>
                    </div>
                    <div class="flex items-center gap-3">
                         <span class="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">{{ lang.t('ticket.modal.fee') }}</span>
                         <button (click)="cancelDropoffModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="px-6 pb-6 pt-2">
                    <p class="text-sm font-bold text-slate-600 mb-4 text-center">{{ lang.t('ticket.modal.detail') }}</p>
                    <div class="bg-slate-50/50 rounded-xl p-6 border border-slate-100 mb-5 flex flex-col items-center justify-center">
                        <div class="flex items-center gap-2 mb-2">
                             <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ lang.t('ticket.modal.dest') }} <span class="text-[#002B5B]">{{ currentEditCity() }}</span></span>
                        </div>
                        <p class="text-3xl font-black text-[#002B5B] tracking-tighter">
                            +{{ currencyService.formatPrice(pendingDropoffFee()) }}
                        </p>
                        <p class="text-[0.65rem] text-slate-400 font-medium mt-1">{{ lang.t('ticket.modal.note') }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <button (click)="cancelDropoffModal()" class="w-full py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 uppercase tracking-wider">{{ lang.t('ticket.cancel') }}</button>
                        <button (click)="confirmDropoffChange()" class="w-full py-2.5 text-xs font-bold text-white bg-[#002B5B] hover:bg-[#003875] rounded-lg shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wider">{{ lang.t('ticket.modal.accept') }}</button>
                    </div>
                </div>
            </div>
        </div>
    }
  `,
    styles: [`
    .ticket-shape {
      mask-image: radial-gradient(circle at 14rem 0, transparent 0.75rem, black 0.8rem),
                  radial-gradient(circle at 14rem 100%, transparent 0.75rem, black 0.8rem);
      mask-size: 100% 100%;
      mask-repeat: no-repeat;
      -webkit-mask-image: radial-gradient(circle at 14rem 0, transparent 0.75rem, black 0.8rem),
                          radial-gradient(circle at 14rem 100%, transparent 0.75rem, black 0.8rem);
    }
    @media (max-width: 768px) {
      .ticket-shape {
        mask-image: radial-gradient(circle at 0 14rem, transparent 0.75rem, black 0.8rem),
                    radial-gradient(circle at 100% 14rem, transparent 0.75rem, black 0.8rem);
        -webkit-mask-image: radial-gradient(circle at 0 14rem, transparent 0.75rem, black 0.8rem),
                            radial-gradient(circle at 100% 14rem, transparent 0.75rem, black 0.8rem);
      }
    }
    .animate-scale-in {
      animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }
  `]
})
export class ReservationTicketComponent {
    private bookingService = inject(BookingService);
    currencyService = inject(CurrencyService);
    lang = inject(LanguageService);

    @Input() totalAmount: number = 0;
    @Input() readonly: boolean = false;
    @Input() plate: string = '';
    @Input() carDescription: string = '';

    selectedCar = computed(() => this.bookingService.reservation().selectedCar);
    pickupCity = computed(() => this.bookingService.reservation().pickup.city);
    pickupDate = computed(() => this.bookingService.reservation().pickup.date);
    pickupTime = computed(() => this.bookingService.reservation().pickup.time);
    dropoffCity = computed(() => this.bookingService.reservation().dropoff.city);
    dropoffDate = computed(() => this.bookingService.reservation().dropoff.date);
    dropoffTime = computed(() => this.bookingService.reservation().dropoff.time);

    // Normalized price computed - calculates first day price considering special periods
    dailyPrice = computed(() => {
        const car = this.selectedCar();
        const pickupDate = this.pickupDate();
        if (!car) return 0;

        const basePrice = Number(car.base_price || car.price || car.priceLowSeason || 0);

        // If we have pickup date and special periods, check if first day falls in special period
        if (pickupDate && car.special_periods && Array.isArray(car.special_periods)) {
            for (const period of car.special_periods) {
                try {
                    const checkDate = new Date(pickupDate);
                    checkDate.setMinutes(checkDate.getMinutes() - checkDate.getTimezoneOffset());
                    const dateStr = checkDate.toISOString().split('T')[0];

                    if (period.dates) {
                        const [start, end] = period.dates.split(' to ');
                        if (dateStr >= start && dateStr <= end) {
                            return Number(period.price);
                        }
                    } else if (period.start && period.end) {
                        if (dateStr >= period.start && dateStr <= period.end) {
                            return Number(period.price);
                        }
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }
        }

        return basePrice;
    });

    // Total cost for rental days - iterates each day considering special periods
    totalDaysCost = computed(() => {
        const car = this.selectedCar();
        const pickupDate = this.pickupDate();
        const days = this.rentalDays();
        if (!car || !pickupDate || days <= 0) return 0;

        const basePrice = Number(car.base_price || car.price || car.priceLowSeason || 0);
        let total = 0;

        for (let i = 0; i < days; i++) {
            const currentDay = new Date(pickupDate);
            currentDay.setDate(currentDay.getDate() + i);
            let dailyRate = basePrice;

            if (car.special_periods && Array.isArray(car.special_periods)) {
                for (const period of car.special_periods) {
                    try {
                        const dObj = new Date(currentDay);
                        dObj.setMinutes(dObj.getMinutes() - dObj.getTimezoneOffset());
                        const dateStr = dObj.toISOString().split('T')[0];

                        if (period.dates) {
                            const [start, end] = period.dates.split(' to ');
                            if (dateStr >= start && dateStr <= end) {
                                dailyRate = Number(period.price);
                                break;
                            }
                        } else if (period.start && period.end) {
                            if (dateStr >= period.start && dateStr <= period.end) {
                                dailyRate = Number(period.price);
                                break;
                            }
                        }
                    } catch (e) {
                        // ignore parse errors
                    }
                }
            }
            total += dailyRate;
        }

        return total;
    });

    // Normalized wash price
    carWashPrice = computed(() => {
        const car = this.selectedCar();
        if (!car) return 35000;
        return Number(car.wash_price || car.washPrice || 35000);
    });

    get pickupCityCode(): string {
        return this.getCityCode(this.pickupCity() || '');
    }
    get dropoffCityCode(): string {
        return this.getCityCode(this.dropoffCity() || '');
    }

    private getCityCode(city: string): string {
        const codes: Record<string, string> = {
            'Cartagena': 'CTG', 'Barranquilla': 'BAQ', 'Santa Marta': 'SMR',
            'Bogota': 'BOG', 'Medellin': 'MDE', 'Cali': 'CLO'
        };
        return codes[city] || (city ? city.substring(0, 3).toUpperCase() : '---');
    }

    formatDate(date: Date | null): string {
        if (!date) return '---';
        const locale = this.lang.currentLang() === 'ES' ? 'es-CO' : 'en-US';
        return date.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
    }

    rentalDays = computed(() => {
        return this.bookingService.calculateDays();
    });

    isDateDisabled = computed(() => !this.currentEditCity());
    isTimeDisabled = computed(() => !this.currentEditDate());

    // Dropoff fee configuration per city
    cityFees: Record<string, number> = {
        'Cartagena': 0,
        'Barranquilla': 250000,
        'Santa Marta': 350000,
        'Bogota': 0,
        'Medellin': 0,
        'Cali': 0
    };

    // Computed signal for dropoff fee
    dropoffFee = computed(() => {
        const pickupCity = this.pickupCity();
        const dropCity = this.dropoffCity();

        // No fee if same city or no cities selected
        if (!pickupCity || !dropCity || pickupCity === dropCity) return 0;

        return this.cityFees[dropCity] || 0;
    });

    // Modal logic
    isEditModalOpen = false;
    currentEditTarget: 'pickup' | 'dropoff' = 'pickup';
    isCityDropdownOpen = false;
    isDateDropdownOpen = false;
    isTimeDropdownOpen = false;

    currentEditCity = signal<string>('');
    currentEditDate = signal<Date | null>(null);
    currentEditTime = signal<string>('');

    pickupCities = ['Cartagena'];
    dropoffCities = ['Cartagena', 'Barranquilla', 'Santa Marta'];

    get availableCities(): string[] {
        return this.currentEditTarget === 'pickup' ? this.pickupCities : this.dropoffCities;
    }

    airportInfo: Record<string, string> = {
        'Cartagena': 'CTG - Rafael Núñez',
        'Barranquilla': 'BAQ - Ernesto Cortissoz',
        'Santa Marta': 'SMR - Simón Bolívar',
        'Bogota': 'BOG - El Dorado',
        'Medellin': 'MDE - José María Córdova',
        'Cali': 'CLO - Alfonso Bonilla Aragón'
    };
    availableTimes = Array.from({ length: 15 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

    // Modal State for Dropoff Confirmation
    showDropoffFeeModal = signal(false);
    pendingDropoffFee = computed(() => this.cityFees[this.currentEditCity()] || 0);

    saveChanges() {
        if (this.currentEditTarget === 'pickup') {
            this.bookingService.updatePickup({
                city: this.currentEditCity(),
                date: this.currentEditDate(),
                time: this.currentEditTime()
            });
            this.closeEditModal();
        } else {
            const newCity = this.currentEditCity();
            const pickupCity = this.bookingService.reservation().pickup.city;

            if (newCity && pickupCity && newCity !== pickupCity) {
                this.showDropoffFeeModal.set(true);
            } else {
                this.confirmDropoffChange();
            }
        }
    }

    confirmDropoffChange() {
        this.bookingService.updateDropoff({
            city: this.currentEditCity(),
            date: this.currentEditDate(),
            time: this.currentEditTime()
        });
        this.showDropoffFeeModal.set(false);
        this.closeEditModal();
    }

    cancelDropoffModal() {
        this.showDropoffFeeModal.set(false);
    }

    openEditModal(target: 'pickup' | 'dropoff') {
        this.currentEditTarget = target;
        if (target === 'pickup') {
            this.currentEditCity.set(this.pickupCity() || '');
            this.currentEditDate.set(this.pickupDate());
            this.currentEditTime.set(this.pickupTime() || '');
        } else {
            this.currentEditCity.set(this.dropoffCity() || '');
            this.currentEditDate.set(this.dropoffDate());
            this.currentEditTime.set(this.dropoffTime() || '');
        }
        this.isEditModalOpen = true;
    }

    closeEditModal() {
        this.isEditModalOpen = false;
        this.isCityDropdownOpen = false;
        this.isDateDropdownOpen = false;
        this.isTimeDropdownOpen = false;
    }

    toggleDropdown(type: 'city' | 'date' | 'time') {
        if (type === 'city') {
            this.isCityDropdownOpen = !this.isCityDropdownOpen;
            this.isDateDropdownOpen = false;
            this.isTimeDropdownOpen = false;
        } else if (type === 'date') {
            if (this.isDateDisabled()) return;
            this.isDateDropdownOpen = !this.isDateDropdownOpen;
            this.isCityDropdownOpen = false;
            this.isTimeDropdownOpen = false;
        } else {
            if (this.isTimeDisabled()) return;
            this.isTimeDropdownOpen = !this.isTimeDropdownOpen;
            this.isCityDropdownOpen = false;
            this.isDateDropdownOpen = false;
        }
    }

    selectCity(city: string) {
        this.currentEditCity.set(city);
        this.isCityDropdownOpen = false;
    }

    selectTime(time: string) {
        this.currentEditTime.set(time);
        this.isTimeDropdownOpen = false;
    }

    onDateChange(date: Date) {
        this.currentEditDate.set(date);
        this.isDateDropdownOpen = false;
    }
}
