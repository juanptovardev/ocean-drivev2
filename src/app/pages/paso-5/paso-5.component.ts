import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { HeaderComponent } from '../../../components/header/header.component';
import { ReservationTicketComponent } from '../../../components/reservation-ticket/reservation-ticket.component';
import { BookingService } from '../../../services/booking.service';
import { CurrencyService } from '../../../services/currency.service';
import { LanguageService } from '../../../services/language.service';

@Component({
    selector: 'app-paso-5',
    standalone: true,
    imports: [CommonModule, HeaderComponent, ReservationTicketComponent],
    template: `
    <div class="min-h-screen bg-[#FBFBFD] flex flex-col">
        <app-header variant="white" class="relative z-50"></app-header>
        
        <main class="flex-1 flex flex-col items-center pt-24 pb-6 px-4 md:px-6 animate-in fade-in duration-700">
            <!-- PDF Capture Wrapper -->
            <div class="w-full flex flex-col items-center" #pdfCapture>
                <!-- Success Icon & Message -->
                <div class="text-center mb-6">
                    <!-- Logo for PDF -->
                    <!-- Logo for PDF (Hidden on screen, shown in capture) -->
                    <img src="assets/imgs/header/logo-color.webp" class="h-14 md:h-16 mx-auto mb-5 object-contain ticket-logo hidden" alt="Ocean Drive">

                    <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 shadow-lg shadow-green-500/20" data-pdf-ignore>
                        <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h1 class="text-3xl md:text-5xl font-black text-[#002B5B] uppercase tracking-tighter italic mb-2">
                        {{ lang.t('paso5.title') }}
                    </h1>
                    <p class="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-4" data-pdf-ignore>
                        {{ lang.t('paso5.subtitle') }}
                    </p>
                    <div class="px-6 h-9 inline-flex items-center justify-center bg-blue-50 text-[#002B5B] text-xs font-bold rounded-full leading-none border border-blue-100">
                        {{ lang.t('paso5.id') }} {{ bookingId() }}
                    </div>
                </div>

                <!-- Advanced Ticket Layout -->
                <div class="w-full max-w-5xl flex flex-col gap-6" *ngIf="bookingData(); else loading">
                    
                    <!-- 1. Original Ticket -->
                    <div class="w-full shadow-2xl shadow-blue-900/10 rounded-[2.5rem] overflow-hidden">
                    <app-reservation-ticket 
                        [totalAmount]="totalPrice()" 
                        [readonly]="true"
                        [plate]="''"
                        [carDescription]="assignedCarModel()">
                    </app-reservation-ticket>
                    </div>

                    <!-- 2. Detailed Info Grid (Second Line) -->
                    <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        
                        <!-- Customer -->
                        <div class="flex flex-col justify-center space-y-3">
                            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ lang.t('paso5.holder') }}</h4>
                            <div>
                                <p class="text-[#002B5B] font-black text-2xl leading-none mb-1">{{ customerName() }}</p>
                                <p class="text-sm text-gray-400 font-medium">{{ customerDoc() }}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-[#FF6F61] font-bold bg-[#FF6F61]/10 px-3 h-6 inline-flex items-center justify-center rounded-full leading-none">{{ customerNationality() }}</span>
                            </div>
                        </div>

                        <!-- Contact -->
                        <div class="flex flex-col justify-center space-y-6">
                            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ lang.t('paso5.contact_info') }}</h4>
                            <div>
                                <p class="text-[#002B5B] font-bold text-base md:text-lg break-words" title="{{ customerEmail() }}">{{ customerEmail() }}</p>
                                <p class="text-sm text-gray-500 font-medium mt-1">{{ customerPhone() }}</p>
                            </div>
                        </div>

                        <!-- Times -->
                        <div class="flex flex-col justify-center space-y-4">
                            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ lang.t('paso5.itinerary') }}</h4>
                            
                            <div class="space-y-3">
                                <!-- Pickup -->
                                <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                                    <span class="text-gray-500 text-sm font-medium">{{ lang.t('paso5.pickup') }}</span>
                                    <div class="text-right">
                                        <span class="block font-black text-[#002B5B] text-lg leading-none">{{ pickupDate() | date:'dd MMM' }}</span>
                                        <span class="block text-xs text-gray-400 font-bold mt-0.5">{{ pickupTime() }}</span>
                                    </div>
                                </div>
                                <!-- Dropoff -->
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-500 text-sm font-medium">{{ lang.t('paso5.dropoff') }}</span>
                                    <div class="text-right">
                                        <span class="block font-black text-[#002B5B] text-lg leading-none">{{ dropoffDate() | date:'dd MMM' }}</span>
                                        <span class="block text-xs text-gray-400 font-bold mt-0.5">{{ dropoffTime() }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Extras/Total -->
                        <div class="flex flex-col justify-center space-y-6">
                            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ lang.t('paso5.financial_summary') }}</h4>
                            
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-500 text-sm font-medium">{{ lang.t('paso5.insurance') }}</span>
                                    <span class="font-bold text-[#002B5B] uppercase text-xs bg-blue-50 px-2 h-6 inline-flex items-center justify-center rounded leading-none">{{ insuranceType() }}</span>
                                </div>
                                
                                <div class="pt-2 border-t border-dashed border-gray-200">
                                    <div class="flex justify-between items-end">
                                        <span class="text-sm font-bold text-gray-400 mb-1">{{ lang.t('paso5.total_paid') }}</span>
                                        <span class="text-2xl ml-5 md:text-3xl font-black text-[#FF6F61] leading-none">{{ currencyService.formatPrice(totalPrice()) }}</span>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>

                    <!-- 3. New Sections Grid: Contact & Requirements -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        
                        <!-- Ocean Drive Info -->
                        <div class="bg-white rounded-[2.5rem] px-8 py-6 shadow-xl border border-gray-100 flex flex-col justify-between h-full">
                             <div>
                                 <h4 class="text-[#002B5B] font-black italic uppercase tracking-wider text-xl mb-6 text-balance leading-tight" [innerHTML]="lang.t('paso5.contact_us')"></h4>
                                 <div class="space-y-4">
                                     <div class="flex items-center gap-3">
                                         <div class="bg-blue-50 text-[#002B5B] p-2.5 rounded-full">
                                             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                         </div>
                                         <p class="text-sm text-gray-600 font-bold">+57 301 235 8181</p>
                                     </div>
                                     <div class="flex items-center gap-3">
                                         <div class="bg-blue-50 text-[#002B5B] p-2.5 rounded-full">
                                             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                             </svg>
                                         </div>
                                         <p class="text-sm text-gray-600 font-bold">reservas&#64;oceandrivecarental.com</p>
                                     </div>
                                     <div class="flex items-center gap-3">
                                        <div class="bg-blue-50 text-[#002B5B] p-2.5 rounded-full">
                                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                        </div>
                                        <p class="text-sm text-gray-600 font-bold">www.oceandrivecarental.com/reservas</p>
                                    </div>
                                 </div>
                             </div>
                             <div class="mt-6 pt-4 border-t border-gray-100">
                                 <p class="text-xs text-gray-400 text-center uppercase tracking-widest font-semibold">{{ lang.t('paso5.thanks') }}</p>
                             </div>
                        </div>

                        <!-- Requirements Notification Style -->
                        <div class="bg-slate-50 rounded-[2.5rem] px-8 py-6 border border-slate-200 flex flex-col h-full">
                            <div class="flex items-center gap-3 mb-5 border-b border-slate-200 pb-3">
                                 <span class="bg-[#FF6F61] text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg shadow-lg shadow-[#FF6F61]/30">!</span>
                                 <h4 class="text-slate-800 font-black italic uppercase tracking-wider text-xl">{{ lang.t('paso5.requirements_title') }}</h4>
                            </div>
                            <ul class="space-y-3 flex-1">
                                 <li class="flex items-start gap-3">
                                     <div class="mt-0.5 bg-green-100 p-1 rounded-md text-green-600 shrink-0">
                                         <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                                     </div>
                                     <span class="text-xs font-bold text-slate-600 uppercase leading-snug">{{ lang.t('paso5.req_license') }}</span>
                                 </li>
                                 <li class="flex items-start gap-3">
                                     <div class="mt-0.5 bg-green-100 p-1 rounded-md text-green-600 shrink-0">
                                         <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                                     </div>
                                     <span class="text-xs font-bold text-slate-600 uppercase leading-snug">{{ lang.t('paso5.req_id') }}</span>
                                 </li>

                                  <li class="flex items-start gap-3">
                                     <div class="mt-0.5 bg-green-100 p-1 rounded-md text-green-600 shrink-0">
                                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                                     </div>
                                     <span class="text-xs font-bold text-slate-600 uppercase leading-snug">{{ lang.t('paso5.req_holder') }}</span>
                                 </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions (Out of Capture) -->
            <div class="flex flex-col items-center gap-4 mt-8" *ngIf="bookingData()">
                <!-- Download Button -->
                <button (click)="downloadTicket()" class="flex items-center gap-2 text-gray-400 hover:text-[#002B5B] transition-colors text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-gray-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    {{ lang.t('paso5.ticket_pdf') }}
                </button>



                <!-- Finalize Button -->
                <button (click)="finish()" class="group py-4 px-12 rounded-full bg-gradient-to-r from-[#FF6F61] to-[#FF8A75] text-white font-black tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,111,97,0.3)] hover:shadow-[0_0_40px_rgba(255,111,97,0.5)] hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden text-lg">
                    <span class="relative z-10">{{ lang.t('paso5.finish') }}</span>
                    <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                </button>
                
                <p class="text-[0.6rem] text-gray-400 max-w-xs text-center mt-4">
                    {{ lang.t('paso5.finish_footer') }}
                </p>
            </div>

            <ng-template #loading>
                <div class="w-full h-64 flex items-center justify-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6F61]"></div>
                </div>
            </ng-template>
        </main>
    </div>
  `
})
export class Paso5Component implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private bookingService = inject(BookingService);
    currencyService = inject(CurrencyService);
    lang = inject(LanguageService);

    @ViewChild('pdfCapture') pdfCapture!: ElementRef;

    bookingId = signal<string>('');
    bookingData = signal<any>(null);
    emailSent = false;

    // ... (Helpers getters omitidos para brevedad, no cambian) ...
    customerName = computed(() => this.bookingData()?.user_name || this.lang.t('paso5.client_default'));
    customerEmail = computed(() => this.bookingData()?.user_email || '');
    customerPhone = computed(() => this.bookingData()?.user_phone || '');
    customerDoc = computed(() => (this.bookingData()?.customer_doc_type || '') + ' ' + (this.bookingData()?.customer_doc_number || ''));
    customerNationality = computed(() => this.bookingData()?.user_nationality || 'Colombia');

    pickupTime = computed(() => this.bookingData()?.pickup_time || '10:00');
    pickupDate = computed(() => this.bookingData()?.pickup_date);
    dropoffTime = computed(() => this.bookingData()?.dropoff_time || '10:00');
    dropoffDate = computed(() => this.bookingData()?.dropoff_date);

    insuranceType = computed(() => {
        const type = this.bookingData()?.insurance_type;
        return (type === 'total' || type === 'Total') ? this.lang.t('paso5.full_coverage') : this.lang.t('paso5.basic_coverage');
    });
    totalPrice = computed(() => Number(this.bookingData()?.total_price || 0));
    assignedPlate = computed(() => this.bookingData()?.assigned_plate || '');
    assignedCarModel = computed(() => this.bookingData()?.car_description || '');

    // Fee Config
    private cityConfig: Record<string, { dropoffFee: number }> = {
        'Cartagena': { dropoffFee: 0 },
        'Barranquilla': { dropoffFee: 250000 },
        'Santa Marta': { dropoffFee: 350000 },
        'Bogota': { dropoffFee: 0 },
        'Medellin': { dropoffFee: 0 },
        'Cali': { dropoffFee: 0 }
    };

    private apiService = inject(ApiService);

    ngOnInit() {
        const routeId = this.route.snapshot.paramMap.get('id');
        this.bookingId.set(routeId || 'REF-???');

        // STRICT ACCESS CONTROL
        // Only allow viewing if we just came from Paso 4 (which sets this code)
        // If user refreshes or comes from elsewhere, this will be null/different -> Redirect Home
        if (routeId) {
            // Try to load from API (Source of Truth)
            this.apiService.getBookingByCode(routeId).subscribe({
                next: (booking) => {
                    if (booking) {
                        this.bookingData.set({
                            user_name: booking.customer_name || booking.user_name || this.lang.t('paso5.client_default'),
                            user_email: booking.customer_email || booking.user_email,
                            user_phone: booking.customer_phone || booking.user_phone,
                            // If navigation/user table didn't store nationality explicitly in booking row join, might be missing or in user table
                            user_nationality: booking.nationality || 'Colombia',
                            pickup_time: booking.pickup_time,
                            pickup_date: new Date(booking.start_date), // Ensure Date object
                            dropoff_time: booking.dropoff_time,
                            dropoff_date: new Date(booking.end_date), // Ensure Date object
                            assigned_plate: booking.plate || '',
                            car_description: booking.car_description || booking.car_model || '',
                            insurance_type: booking.insurance_type,
                            total_price: Number(booking.total_price),
                            customer_doc_type: booking.customer_doc_type,
                            customer_doc_number: booking.customer_doc_number,
                            id: booking.id
                        });

                        // Automatically generate and send PDF email in background
                        this.generateAndSendTicketEmail();
                    }
                },
                error: (err) => {
                    console.error('Could not load booking from API', err);
                    // Fallback to local state if API fails (e.g. just created)
                    this.loadFromLocalState();
                }
            });
        } else {
            this.loadFromLocalState();
        }

        // Clear the "draft" reservation state from local storage immediately when
        // the confirmation page is loaded. This prevents the user from going back
        // to previous steps with the same data, effectively resetting the flow.
        // this.bookingService.clearState();
    }

    ngOnDestroy() {
        // Al salir del componente (navegar fuera), limpiamos el estado
        // para asegurar que una nueva reserva empiece desde cero.
        // this.bookingService.clearState();
        // Al salir de esta vista, revocamos el acceso a este código
        this.bookingService.setLastBookedCode(null);
    }

    private loadFromLocalState() {
        const state = this.bookingService.reservation();
        // Basic validation to see if state is valid
        if (!state.selectedCar || !state.pickup.date || !state.dropoff.date) {
            return;
        }

        const total = this.calculateTotal(state);

        this.bookingData.set({
            user_name: state.customerDetails?.fullName,
            user_email: state.customerDetails?.email,
            user_phone: state.customerDetails?.phone,
            user_nationality: state.customerDetails?.nationality,
            pickup_time: state.pickup.time,
            pickup_date: state.pickup.date,
            dropoff_time: state.dropoff.time,
            dropoff_date: state.dropoff.date,
            insurance_type: state.insurance,
            total_price: total,
            customer_doc_type: state.customerDetails?.docType,
            customer_doc_number: state.customerDetails?.docNumber
        });
    }

    private calculateTotal(state: any): number {
        return this.bookingService.calculateTotalValue();
    }

    finish() {
        this.bookingService.clearState();
        this.router.navigate(['/reservas']);
    }

    private async generateAndSendTicketEmail() {
        if (this.emailSent) return;
        this.emailSent = true;

        try {
            const pdfDataUri = await this.generatePDFInternal();
            if (pdfDataUri) {
                this.apiService.sendTicketEmail(this.bookingId(), pdfDataUri).subscribe({
                    next: () => console.log('Ticket confirmation email with PDF sent successfully.'),
                    error: (err) => console.error('Failed to send ticket email:', err)
                });
            }
        } catch (error) {
            console.error('Background PDF generation failed:', error);
        }
    }

    async downloadTicket() {
        try {
            const pdfDataUri = await this.generatePDFInternal();
            if (pdfDataUri) {
                const link = document.createElement('a');
                link.href = pdfDataUri;
                link.download = `Reserva-${this.bookingId()}.pdf`;
                link.click();
            }
        } catch (error) {
            console.error('Error downloading ticket:', error);
        }
    }

    private async generatePDFInternal(): Promise<string | null> {
        // Dynamic import
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).default;

        // Ensure DOM is ready if called very early
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 1. Clone Elements
        if (!this.pdfCapture) return null;
        const originalElement = this.pdfCapture.nativeElement;
        const clone = originalElement.cloneNode(true) as HTMLElement;

        // Remove ignored elements from clone
        const ignoredElements = clone.querySelectorAll('[data-pdf-ignore]');
        ignoredElements.forEach(el => el.remove());

        // 2. Wrap in a container to simulate user's page background and padding
        const wrapper = document.createElement('div');
        wrapper.style.width = '1200px';
        wrapper.style.padding = '4rem';
        wrapper.style.paddingTop = '6rem'; // More margin for top logo
        wrapper.style.backgroundColor = '#FBFBFD';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';

        // Unhide logo for PDF
        const logo = clone.querySelector('.ticket-logo');
        if (logo) {
            (logo as HTMLElement).style.display = 'block';
            (logo as HTMLElement).classList.remove('hidden');
        }

        wrapper.appendChild(clone);

        // 3. Absolute container off-screen
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.appendChild(wrapper);

        document.body.appendChild(container);

        try {
            // 4. Capture
            const canvas = await html2canvas(wrapper, {
                scale: 2, // Slightly lower for speed/size if background but 2 is good balance
                useCORS: true,
                backgroundColor: '#FBFBFD',
                windowWidth: 1200,
                scrollX: 0,
                scrollY: 0,
                height: wrapper.offsetHeight + 50
            });

            // 5. Generate PDF
            const imgWidth = 280;
            const imgHeight = canvas.height * imgWidth / canvas.width;

            const contentDataURL = canvas.toDataURL('image/png');
            let pdf = new jsPDF('l', 'mm', 'a4');

            const pageHeight = pdf.internal.pageSize.getHeight();
            const position = (pageHeight - imgHeight) / 2;

            pdf.addImage(contentDataURL, 'PNG', 8, position, imgWidth, imgHeight);
            return pdf.output('datauristring');

        } finally {
            document.body.removeChild(container);
        }
    }
}
