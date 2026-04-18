import { Component, ChangeDetectionStrategy, signal, ElementRef, ViewChild, inject, OnInit, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarComponent } from '../calendar/calendar.component';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';
import { CurrencyService } from '../../services/currency.service';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-reservation-form-final',
    templateUrl: './reservation-form-final.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, CalendarComponent],
    host: {
        '(document:click)': 'onDocumentClick($event)',
    }
})
export class ReservationFormFinalComponent implements OnInit {
    showDropoffCity = signal(true);
    @Input() set enableDropoffCity(val: boolean) {
        this.showDropoffCity.set(val);
    }

    // New Input for "Home Mode"
    isInitialStep = signal(false);
    @Input() set initialStep(val: boolean) {
        this.isInitialStep.set(val);
    }

    // Custom Modal Handling (Input)
    @Input() customModalHandling = false;

    private bookingService = inject(BookingService);
    private router = inject(Router);
    currencyService = inject(CurrencyService);
    lang = inject(LanguageService);

    @ViewChild('dateWrapper') dateWrapper!: ElementRef;
    @ViewChild('cityWrapper') cityWrapper!: ElementRef;
    @ViewChild('timeWrapper') timeWrapper!: ElementRef;

    // ViewChilds for Dropoff
    @ViewChild('dropoffDateWrapper') dropoffDateWrapper!: ElementRef;
    @ViewChild('dropoffCityWrapper') dropoffCityWrapper!: ElementRef;
    @ViewChild('dropoffTimeWrapper') dropoffTimeWrapper!: ElementRef;

    // --- PICKUP ---
    showPickupCalendar = signal(false);
    pickupDate = signal<Date | null>(null);

    showCityDropdown = signal(false);
    selectedCity = signal<string>('');

    showTimeDropdown = signal(false);
    selectedTime = signal<string>('');
    pickupCityPos = signal<'top' | 'bottom'>('bottom');
    pickupDatePos = signal<'top' | 'bottom'>('bottom');
    pickupTimePos = signal<'top' | 'bottom'>('bottom');

    // --- DROPOFF ---
    showDropoffCalendar = signal(false);
    dropoffDate = signal<Date | null>(null);

    showDropoffCityDropdown = signal(false);
    selectedDropoffCity = signal<string>('');

    showDropoffTimeDropdown = signal(false);
    selectedDropoffTime = signal<string>('');
    dropoffCityPos = signal<'top' | 'bottom'>('bottom');
    dropoffDatePos = signal<'top' | 'bottom'>('bottom');
    dropoffTimePos = signal<'top' | 'bottom'>('bottom');

    // --- DROPOFF FEE CONFIRMATION MODAL ---
    showDropoffFeeModal = signal(false);
    pendingDropoffCity = signal<string>('');
    pendingDropoffFee = signal<number>(0);

    // --- AVAILABILITY MODAL ---
    showAvailabilityModal = signal(false);
    unavailableCategory = signal<any>(null);
    suggestedCategories = signal<any[]>([]);
    private apiService = inject(ApiService);

    // Data
    cities = ['Cartagena', 'Barranquilla', 'Santa Marta', 'Bogota', 'Medellin', 'Cali'];
    pickupCities = ['Cartagena', 'Barranquilla', 'Santa Marta'];
    dropoffCities = ['Cartagena', 'Barranquilla', 'Santa Marta'];
    private readonly allDailyTimes = this.generateTimes();

    pickupTimes = computed(() => {
        const date = this.pickupDate();
        let times = this.allDailyTimes;

        // Filter standard hours if not Cartagena (Cartagena is 24/7)
        if (this.selectedCity() !== 'Cartagena') {
            times = times.filter(t => {
                const h = parseInt(t.split(':')[0], 10);
                return h >= 7 && h < 22;
            });
        }

        if (!date) return times;

        const selected = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);

        if (selected.getTime() === today.getTime()) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const threshold = currentMinutes + 60;


            return times.filter(t => {
                const [h, m] = t.split(':').map(Number);
                return (h * 60 + m) > threshold;
            });
        }
        return times;
    });

    dropoffTimes = computed(() => {
        const date = this.dropoffDate();
        let times = this.allDailyTimes;

        // Filter standard hours if not Cartagena (Cartagena is 24/7)
        if (this.selectedDropoffCity() !== 'Cartagena') {
            times = times.filter(t => {
                const h = parseInt(t.split(':')[0], 10);
                return h >= 7 && h < 22;
            });
        }

        if (!date) return times;

        const selected = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);

        // Filter based on minimum duration requirement
        const minDate = this.absoluteMinDropoffDate();
        if (minDate) {
            const minDateOnly = new Date(minDate);
            minDateOnly.setHours(0, 0, 0, 0);

            // If selected dropoff date equals minimum date, filter times
            if (selected.getTime() === minDateOnly.getTime()) {
                const minHour = minDate.getHours();
                const minMinute = minDate.getMinutes();
                const minTotalMinutes = minHour * 60 + minMinute;

                times = times.filter(t => {
                    const [h, m] = t.split(':').map(Number);
                    return (h * 60 + m) >= minTotalMinutes;
                });
            }
        }

        // Also filter if today (existing logic)
        if (selected.getTime() === today.getTime()) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const threshold = currentMinutes + 60;

            times = times.filter(t => {
                const [h, m] = t.split(':').map(Number);
                return (h * 60 + m) > threshold;
            });
        }

        return times;
    });

    // Computed states for Sequential Filling
    // If pickup is locked (edit mode + active), disable pickup fields regardless of other state
    isPickupLocked = computed(() => !!this.bookingService.reservation().isPickupLocked);

    isPickupDateDisabled = computed(() => this.isPickupLocked() || !this.selectedCity());
    isPickupTimeDisabled = computed(() => this.isPickupLocked() || !this.pickupDate());

    // Dropoff enables after Pickup cycle is complete
    isDropoffCityDisabled = computed(() => !this.selectedTime());
    isDropoffDateDisabled = computed(() => {
        if (!this.showDropoffCity()) {
            return !this.selectedTime();
        }
        return !this.selectedDropoffCity();
    });
    isDropoffTimeDisabled = computed(() => !this.dropoffDate());

    // Calculation Computed Signals
    rentalDays = computed(() => {
        const start = this.pickupDate();
        const end = this.dropoffDate();
        if (!start || !end) return 0;

        const diffTime = end.getTime() - start.getTime();
        // Return 0 or negative if invalid, otherwise days (rounded up)
        if (diffTime < 0) return 0;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    });

    // Minimum dropoff date based on DROPOFF city requirements
    // Absolute minimum date/time for logic (filtering hours)
    absoluteMinDropoffDate = computed(() => {
        const dropoffCity = this.selectedDropoffCity();
        const pickupDateVal = this.pickupDate();
        const pickupTimeVal = this.selectedTime();

        if (!pickupDateVal) return null;

        let minDays = 1;
        if (dropoffCity && this.cityConfig[dropoffCity]) {
            const configDays = this.cityConfig[dropoffCity].minDays;
            minDays = (configDays !== undefined && configDays !== null) ? configDays : 1;
        }

        const minDate = new Date(pickupDateVal);
        if (pickupTimeVal) {
            const [h, m] = pickupTimeVal.split(':').map(Number);
            minDate.setHours(h, m, 0, 0);
        }

        minDate.setTime(minDate.getTime() + (minDays * 24 * 60 * 60 * 1000));
        return minDate;
    });

    // Date for Calendar Min Date constraint
    minDropoffDateForCalendar = computed(() => {
        const absDate = this.absoluteMinDropoffDate();
        const dropoffCity = this.selectedDropoffCity();
        if (!absDate || !dropoffCity) return absDate;

        const configDays = this.cityConfig[dropoffCity]?.minDays;
        // If minDays < 1 (e.g. 6 hours), allow selecting the base Pickup Day in calendar
        // even if the exact time spills to next day. (UX preference: let user see empty slots or next day)
        // However, standard logic: if absolute min is Tomorrow, Today IS invalid.
        // But user issue suggests they want to select same day.
        if (configDays !== undefined && configDays < 1) {
            const pDate = this.pickupDate();
            return pDate ? new Date(pDate) : absDate;
        }

        return absDate;
    });

    // Get minimum days text for display based on DROPOFF city
    getDropoffMinDaysText = computed(() => {
        const dropoffCity = this.selectedDropoffCity();
        if (!dropoffCity || !this.cityConfig[dropoffCity]) return '';

        const minDays = this.cityConfig[dropoffCity].minDays;

        if (minDays === 0.25) return this.lang.t('reservas.min_6_hours');
        if (!minDays || minDays <= 1) return this.lang.t('reservas.min_24_hours');
        return this.lang.t('reservas.min_days_param').replace('{days}', minDays.toString());
    });

    // Get minimum days text for display
    getPickupMinDaysText = computed(() => {
        const pickupCity = this.selectedCity();
        if (!pickupCity || !this.cityConfig[pickupCity]) return '';

        const minDays = this.cityConfig[pickupCity].pickupMinDays;

        if (minDays === 0.25) return this.lang.t('reservas.min_6_hours');
        if (minDays <= 1) return this.lang.t('reservas.min_24_hours');
        return this.lang.t('reservas.min_days_param').replace('{days}', minDays.toString());
    });

    proratedDropoffFee = computed(() => {
        const city = this.selectedDropoffCity();
        if (!city || !this.cityConfig[city]) return 0;

        const totalFee = this.cityConfig[city].dropoffFee;
        const days = this.rentalDays();

        if (totalFee <= 0 || days <= 0) return 0;
        return totalFee / days;
    });

    // Configuration for Cities
    // minDays = minimum days for DROPOFF in this city
    // pickupMinDays = minimum days when PICKING UP from this city
    cityConfig: Record<string, { code: string; airport: string; address: string; phone: string; hours: string; dropoffFee: number; minDays: number; pickupMinDays: number }> = {
        'Cartagena': {
            code: 'CTG',
            airport: 'Rafael Núñez',
            address: 'CL 70 KR 2-60, Barrio Crespo',
            phone: '+57 3012358181',
            hours: 'reservas.hours_24',
            dropoffFee: 0,
            minDays: 0.25,
            pickupMinDays: 0.25
        },
        'Barranquilla': {
            code: 'BAQ',
            airport: 'Ernesto Cortissoz',
            address: 'Centro Comercial Buenavista',
            phone: '+57 3012358181',
            hours: 'reservas.agree_schedule',
            dropoffFee: 250000,
            minDays: 3,
            pickupMinDays: 3 // 3 days minimum
        },
        'Santa Marta': {
            code: 'SMR',
            airport: 'Simón Bolívar',
            address: 'Cra. 4 #23-49',
            phone: '+57 3012358181',
            hours: 'reservas.agree_schedule',
            dropoffFee: 350000,
            minDays: 5,
            pickupMinDays: 5 // 5 days minimum
        },
        'Bogota': { code: 'BOG', airport: 'El Dorado', address: '', phone: '', hours: '', dropoffFee: 0, minDays: 0, pickupMinDays: 1 },
        'Medellin': { code: 'MDE', airport: 'José María Córdova', address: '', phone: '', hours: '', dropoffFee: 0, minDays: 0, pickupMinDays: 1 },
        'Cali': { code: 'CLO', airport: 'Alfonso Bonilla Aragón', address: '', phone: '', hours: '', dropoffFee: 0, minDays: 0, pickupMinDays: 1 }
    };

    // Helper for template compatibility
    get airportInfo(): Record<string, string> {
        const info: Record<string, string> = {};
        for (const city in this.cityConfig) {
            info[city] = `${this.cityConfig[city].code} - ${this.cityConfig[city].airport}`;
        }
        return info;
    }

    ngOnInit() {
        // Load persist data
        const state = this.bookingService.reservation();
        const pickupData = state.pickup;
        const dropoffData = state.dropoff;

        if (pickupData) {
            if (pickupData.date) this.pickupDate.set(pickupData.date);
            if (pickupData.city) this.selectedCity.set(pickupData.city);
            if (pickupData.time) this.selectedTime.set(pickupData.time);
        }

        if (dropoffData) {
            if (dropoffData.city) this.selectedDropoffCity.set(dropoffData.city);
            if (dropoffData.date) this.dropoffDate.set(dropoffData.date);
            if (dropoffData.time) this.selectedDropoffTime.set(dropoffData.time);
        }
    }

    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        // Close Pickup Calendar
        if (this.showPickupCalendar() && this.dateWrapper && !this.dateWrapper.nativeElement.contains(target)) {
            this.showPickupCalendar.set(false);
        }
        // Close Pickup City
        if (this.showCityDropdown() && this.cityWrapper && !this.cityWrapper.nativeElement.contains(target)) {
            this.showCityDropdown.set(false);
        }
        // Close Pickup Time
        if (this.showTimeDropdown() && this.timeWrapper && !this.timeWrapper.nativeElement.contains(target)) {
            this.showTimeDropdown.set(false);
        }

        // Close Dropoff Calendar
        if (this.showDropoffCalendar() && this.dropoffDateWrapper && !this.dropoffDateWrapper.nativeElement.contains(target)) {
            this.showDropoffCalendar.set(false);
        }
        // Close Dropoff City
        if (this.showDropoffCityDropdown() && this.dropoffCityWrapper && !this.dropoffCityWrapper.nativeElement.contains(target)) {
            this.showDropoffCityDropdown.set(false);
        }
        // Close Dropoff Time
        if (this.showDropoffTimeDropdown() && this.dropoffTimeWrapper && !this.dropoffTimeWrapper.nativeElement.contains(target)) {
            this.showDropoffTimeDropdown.set(false);
        }
    }

    startReservation() {
        // Initial Step (Home): Check strict sequence and completeness
        if (this.isInitialStep()) {
            if (!this.selectedCity() || !this.pickupDate() || !this.selectedTime()) {
                alert(this.lang.t('val.selectDate'));
                return;
            }
        } else {
            // Final Step: Check both Pickup and Dropoff
            if (!this.selectedCity() || !this.pickupDate() || !this.selectedTime()) {
                alert(this.lang.t('val.selectDate'));
                return;
            }
            if (this.showDropoffCity() && !this.selectedDropoffCity()) {
                alert(this.lang.t('val.selectDropoffCity'));
                return;
            }
            if (!this.dropoffDate() || !this.selectedDropoffTime()) {
                alert(this.lang.t('val.selectDropoffDate'));
                return;
            }
        }

        // Validate Pickup Time (Min 1 hour from now)
        if (!this.isPickupLocked() && this.pickupDate() && this.selectedTime()) {
            const pDate = new Date(this.pickupDate()!);
            const [h, m] = this.selectedTime().split(':').map(Number);
            pDate.setHours(h, m, 0, 0);

            const now = new Date();
            const minTime = new Date(now.getTime() + 59 * 60 * 1000); // ~1 hour buffer

            if (pDate < minTime) {
                alert(this.lang.t('val.minTime'));
                return;
            }
        }

        const dropCity = this.selectedDropoffCity();
        const pickup = this.pickupDate();
        const dropoff = this.dropoffDate();

        // Min days validation
        if (dropCity && this.cityConfig[dropCity] && dropoff && pickup) {
            const config = this.cityConfig[dropCity];
            const diffTime = Math.abs(dropoff.getTime() - pickup.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

            if (config.minDays > 0 && diffDays < config.minDays) {
                return;
            }
        }

        // Prepare updates
        const pickupData = {
            city: this.selectedCity(),
            date: this.pickupDate(),
            time: this.selectedTime()
        };
        const dropoffData = {
            city: dropCity,
            date: this.dropoffDate(),
            time: this.selectedTime() // or selectedDropoffTime
        };

        // Availability check if car is selected
        const currentCar = this.bookingService.reservation().selectedCar;
        if (currentCar && pickup && dropoff) {
            const startStr = pickup.toISOString().split('T')[0];
            const endStr = dropoff.toISOString().split('T')[0];

            this.apiService.checkAvailability(startStr, endStr).subscribe({
                next: (availability) => {
                    const catAvailability = availability.find((a: any) =>
                        (a.id === currentCar.id) || (a.name.toUpperCase() === (currentCar.title || '').toUpperCase())
                    );

                    if (catAvailability && catAvailability.is_available) {
                        // Update car with DB data
                        let periods: any[] = [];
                        if (typeof catAvailability.special_periods === 'string') {
                            try { periods = JSON.parse(catAvailability.special_periods); } catch (e) { }
                        } else if (Array.isArray(catAvailability.special_periods)) {
                            periods = catAvailability.special_periods;
                        }

                        this.bookingService.updateSelectedCar({
                            id: catAvailability.id,
                            title: catAvailability.name,
                            category: catAvailability.category_type || catAvailability.category || '',
                            description: catAvailability.description,
                            imageUrl: catAvailability.image_url,
                            base_price: Number(catAvailability.base_price || catAvailability.price_per_day || 0),
                            special_periods: periods,
                            price: Number(catAvailability.base_price || catAvailability.price_per_day || 0),
                            washPrice: Number(catAvailability.wash_price || 35000),
                            specs: [
                                { text: (catAvailability.passengers || 4) + ' ' + this.lang.t('specs.passengers') },
                                { text: this.lang.t('specs.ac') },
                                { text: (catAvailability.doors || 4) + ' ' + this.lang.t('specs.doors') },
                                { text: catAvailability.transmission === 'Automatic' || catAvailability.transmission === 'Automática' ? this.lang.t('specs.auto') : (catAvailability.transmission || this.lang.t('specs.auto')) }
                            ]
                        });

                        this.finalizeStartReservation(pickupData, dropoffData);
                    } else {
                        // Update dates so Paso 2 knows the new range
                        this.bookingService.updatePickup(pickupData);
                        if (dropoffData.date) {
                            this.bookingService.updateDropoff({
                                city: dropoffData.city,
                                date: dropoffData.date,
                                time: this.selectedDropoffTime() || dropoffData.time
                            });
                        }

                        // Show availability modal instead of redirecting
                        this.unavailableCategory.set(currentCar);
                        this.suggestedCategories.set(availability.filter((a: any) => {
                            const val = a.is_available;
                            return val === true || val === 1 || val === '1' || String(val).toLowerCase() === 'true';
                        }).slice(0, 2));
                        this.showAvailabilityModal.set(true);
                    }
                },
                error: () => this.finalizeStartReservation(pickupData, dropoffData)
            });
        } else {
            this.finalizeStartReservation(pickupData, dropoffData);
        }
    }

    private finalizeStartReservation(pickup: any, dropoff: any) {
        this.bookingService.updatePickup(pickup);
        if (dropoff.date) {
            this.bookingService.updateDropoff({
                city: dropoff.city,
                date: dropoff.date,
                time: this.selectedDropoffTime() || dropoff.time
            });
        }

        if (this.isInitialStep()) {
            this.router.navigate(['/paso-1']);
        } else {
            const currentCar = this.bookingService.reservation().selectedCar;
            if (currentCar) {
                this.router.navigate(['/paso-3']);
            } else {
                this.router.navigate(['/paso-2']);
            }
        }
    }

    selectAlternative(suggested: any) {
        // Parse special periods if they exist
        let periods: any[] = [];
        if (typeof suggested.special_periods === 'string') {
            try { periods = JSON.parse(suggested.special_periods); } catch (e) { }
        } else if (Array.isArray(suggested.special_periods)) {
            periods = suggested.special_periods;
        }

        this.bookingService.updateSelectedCar({
            id: suggested.id,
            title: suggested.name,
            category: suggested.category_type || suggested.category || '',
            description: suggested.description,
            imageUrl: suggested.image_url,
            base_price: Number(suggested.base_price || suggested.price_per_day || 0),
            special_periods: periods,
            price: Number(suggested.base_price || suggested.price_per_day || 0),
            washPrice: Number(suggested.wash_price || 35000),
            specs: [
                { text: (suggested.passengers || 4) + ' ' + this.lang.t('specs.passengers') },
                { text: this.lang.t('specs.ac') },
                { text: (suggested.doors || 4) + ' ' + this.lang.t('specs.doors') },
                { text: suggested.transmission === 'Automatic' || suggested.transmission === 'Automática' ? this.lang.t('specs.auto') : (suggested.transmission || this.lang.t('specs.auto')) }
            ]
        });
        this.showAvailabilityModal.set(false);
        this.router.navigate(['/paso-2']);
    }

    // --- PICKUP TOGGLES ---
    togglePickupCalendar() {
        if (this.isPickupDateDisabled()) return;
        if (!this.showPickupCalendar()) {
            this.pickupDatePos.set(this.getDropdownPosition(this.dateWrapper));
            this.closeAllDropdowns();
        }
        this.showPickupCalendar.update(v => !v);
    }

    toggleCityDropdown() {
        if (!this.showCityDropdown()) {
            this.pickupCityPos.set(this.getDropdownPosition(this.cityWrapper));
            this.closeAllDropdowns();
        }
        this.showCityDropdown.update(v => !v);
    }

    toggleTimeDropdown() {
        if (this.isPickupTimeDisabled()) return;
        if (!this.showTimeDropdown()) {
            this.pickupTimePos.set(this.getDropdownPosition(this.timeWrapper));
            this.closeAllDropdowns();
        }
        this.showTimeDropdown.update(v => !v);
    }

    // --- DROPOFF TOGGLES ---
    toggleDropoffCalendar() {
        if (this.isDropoffDateDisabled()) return;
        if (!this.showDropoffCalendar()) {
            this.dropoffDatePos.set(this.getDropdownPosition(this.dropoffDateWrapper));
            this.closeAllDropdowns();
        }
        this.showDropoffCalendar.update(v => !v);
    }

    toggleDropoffCityDropdown() {
        if (this.isDropoffCityDisabled()) return;
        if (!this.showDropoffCityDropdown()) {
            this.dropoffCityPos.set(this.getDropdownPosition(this.dropoffCityWrapper));
            this.closeAllDropdowns();
        }
        this.showDropoffCityDropdown.update(v => !v);
    }

    toggleDropoffTimeDropdown() {
        if (this.isDropoffTimeDisabled()) return;
        if (!this.showDropoffTimeDropdown()) {
            this.dropoffTimePos.set(this.getDropdownPosition(this.dropoffTimeWrapper));
            this.closeAllDropdowns();
        }
        this.showDropoffTimeDropdown.update(v => !v);
    }

    private closeAllDropdowns() {
        this.showPickupCalendar.set(false);
        this.showCityDropdown.set(false);
        this.showTimeDropdown.set(false);
        this.showDropoffCalendar.set(false);
        this.showDropoffCityDropdown.set(false);
        this.showDropoffTimeDropdown.set(false);
    }

    // --- SELECTION HANDLERS ---
    selectCity(city: string) {
        this.selectedCity.set(city);
        this.showCityDropdown.set(false);
    }

    selectTime(time: string) {
        this.selectedTime.set(time);
        this.showTimeDropdown.set(false);
    }

    onPickupDateSelected(date: Date) {
        this.pickupDate.set(date);
        this.showPickupCalendar.set(false);

        // Reset dropoff date if it's before the new pickup date
        const currentDropoff = this.dropoffDate();
        if (currentDropoff && currentDropoff < date) {
            this.dropoffDate.set(null);
        }
    }

    selectDropoffCity(city: string) {
        const fee = this.cityConfig[city]?.dropoffFee || 0;

        // If there's an additional fee, show confirmation modal
        if (fee > 0) {
            this.pendingDropoffCity.set(city);
            this.pendingDropoffFee.set(fee);
            this.showDropoffCityDropdown.set(false);
            this.showDropoffFeeModal.set(true);
        } else {
            // No fee, just select directly
            this.selectedDropoffCity.set(city);
            this.showDropoffCityDropdown.set(false);
        }
    }

    confirmDropoffCity() {
        this.selectedDropoffCity.set(this.pendingDropoffCity());
        this.showDropoffFeeModal.set(false);
        this.pendingDropoffCity.set('');
        this.pendingDropoffFee.set(0);
    }

    cancelDropoffCity() {
        this.showDropoffFeeModal.set(false);
        this.pendingDropoffCity.set('');
        this.pendingDropoffFee.set(0);
    }

    selectDropoffTime(time: string) {
        this.selectedDropoffTime.set(time);
        this.showDropoffTimeDropdown.set(false);
    }

    onDropoffDateSelected(date: Date) {
        this.dropoffDate.set(date);
        this.showDropoffCalendar.set(false);

        // Reset dropoff time if it's no longer valid for the new date
        const dropoffTimeVal = this.selectedDropoffTime();
        if (dropoffTimeVal) {
            const validTimes = this.dropoffTimes();
            if (!validTimes.includes(dropoffTimeVal)) {
                this.selectedDropoffTime.set('');
            }
        }
    }

    formatDate(date: Date | null): string {
        if (!date) return '';
        const locale = this.lang.currentLang() === 'EN' ? 'en-US' : 'es-CO';
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    private generateTimes(): string[] {
        const times: string[] = [];
        for (let h = 0; h <= 24; h++) {
            times.push(`${h.toString().padStart(2, '0')}:00`);
        }
        return times;
    }

    private getDropdownPosition(elementRef: ElementRef): 'top' | 'bottom' {
        if (!elementRef || !elementRef.nativeElement) return 'bottom';
        const rect = elementRef.nativeElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        return spaceBelow < 320 ? 'top' : 'bottom';
    }

    getTimeButtonClasses(time: string, isDropoff: boolean) {
        const selected = isDropoff ? this.selectedDropoffTime() : this.selectedTime();
        const isSelected = selected === time;

        return {
            'text-[#002B5B]': isSelected,
            'bg-blue-50/30': isSelected,
            'font-bold': isSelected,
            'border-[#002B5B]': isSelected,
            'text-gray-500': !isSelected
        };
    }
}
