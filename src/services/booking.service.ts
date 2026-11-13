import { Injectable, signal } from '@angular/core';

export interface LocationDetails {
    city: string;
    date: Date | null;
    time: string;
}

export interface CustomerDetails {
    fullName: string;
    nationality: string;
    email: string;
    ddi: string;
    phone: string;
    docType: string;
    docNumber: string;
}

export interface ReservationState {
    pickup: LocationDetails;
    dropoff: LocationDetails;
    selectedCar?: any;
    extras?: any[];
    insurance?: string;
    customerDetails?: CustomerDetails;
    isPickupLocked?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    readonly reservation = signal<ReservationState>(this.loadState());
    readonly lastBookedCode = signal<string | null>(null);

    private readonly SCHEMA_VERSION = 'v1.0';
    private readonly EXPIRATION_MS = 2 * 60 * 60 * 1000; // 2 Hours

    constructor() { }

    setLastBookedCode(code: string | null) {
        this.lastBookedCode.set(code);
    }

    refreshSession() {
        const state = this.reservation();
        this.saveState(state);
    }

    private loadState(): ReservationState {
        const saved = localStorage.getItem('bookingState');
        if (saved) {
            try {
                const payload = JSON.parse(saved);

                // 1. Check Version (If simple state vs wrapped payload)
                // If it's the old format (direct object), invalid for v1.0
                if (!payload.version || payload.version !== this.SCHEMA_VERSION) {
                    console.warn('Booking state schema mismatch or old format. Clearing.');
                    this.clearState();
                    return this.getDefaultState();
                }

                // 2. Check Expiration
                const age = Date.now() - payload.timestamp;
                if (age > this.EXPIRATION_MS) {
                    // Do NOT clear state so the user can resume their draft if they
                    // log in again. loadState() only reads: it runs on service
                    // creation, so navigating from here would force a redirect to
                    // /login on every page load, not just in the booking flow.
                    console.warn('Booking state expired. Draft kept for resume.');
                    const state = payload.data;
                    if (state.pickup?.date) state.pickup.date = new Date(state.pickup.date);
                    if (state.dropoff?.date) state.dropoff.date = new Date(state.dropoff.date);
                    return state;
                }

                const state = payload.data;
                // Restore Dates
                if (state.pickup?.date) state.pickup.date = new Date(state.pickup.date);
                if (state.dropoff?.date) state.dropoff.date = new Date(state.dropoff.date);
                return state;
            } catch (e) {
                console.error('Error loading booking state', e);
            }
        }
        return this.getDefaultState();
    }

    private getDefaultState(): ReservationState {
        return {
            pickup: { city: '', date: null, time: '' },
            dropoff: { city: '', date: null, time: '' },
            extras: [],
            insurance: 'basic',
            customerDetails: {
                fullName: '',
                nationality: 'Colombia',
                email: '',
                ddi: '+57',
                phone: '',
                docType: 'CC',
                docNumber: ''
            }
        };
    }

    private saveState(state: ReservationState) {
        const payload = {
            version: this.SCHEMA_VERSION,
            timestamp: Date.now(),
            data: state
        };
        localStorage.setItem('bookingState', JSON.stringify(payload));
    }

    clearState() {
        localStorage.removeItem('bookingState');
    }

    resetReservation() {
        this.clearState();
        this.reservation.set(this.getDefaultState());
    }

    updatePickup(data: Partial<LocationDetails>) {
        this.reservation.update(state => {
            const newState = {
                ...state,
                pickup: { ...state.pickup, ...data }
            };
            this.saveState(newState);
            return newState;
        });
    }

    updateDropoff(data: Partial<LocationDetails>) {
        this.reservation.update(state => {
            const newState = {
                ...state,
                dropoff: { ...state.dropoff, ...data }
            };
            this.saveState(newState);
            return newState;
        });
    }

    updateSelectedCar(car: any) {
        this.reservation.update(state => {
            const newState = {
                ...state,
                selectedCar: car
            };
            this.saveState(newState);
            return newState;
        });
    }

    updateExtras(extras: any[]) {
        this.reservation.update(state => {
            const newState = {
                ...state,
                extras: extras
            };
            this.saveState(newState);
            return newState;
        });
    }

    setInsurance(type: string) {
        this.reservation.update(state => {
            const newState = {
                ...state,
                insurance: type
            };
            this.saveState(newState);
            return newState;
        });
    }

    updateCustomerDetails(data: Partial<CustomerDetails>) {
        this.reservation.update(state => {
            const newState = {
                ...state,
                customerDetails: { ...state.customerDetails!, ...data }
            };
            this.saveState(newState);
            return newState;
        });
    }

    getPickupData() {
        return this.reservation().pickup;
    }

    // Helper: Calculate Total Days based on 24h cycle
    calculateDays(): number {
        const state = this.reservation();
        if (!state.pickup.date || !state.dropoff.date || !state.pickup.time || !state.dropoff.time) {
            return 1;
        }

        try {
            const pickupDateTime = this.combineDateAndTime(state.pickup.date, state.pickup.time);
            const dropoffDateTime = this.combineDateAndTime(state.dropoff.date, state.dropoff.time);

            const diffMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
            // If diff is negative (dropoff before pickup), assume 1 day or explicit validation handled elsewhere
            if (diffMs <= 0) return 1;

            const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            return days > 0 ? days : 1;
        } catch (e) {
            console.error('Error calculating days', e);
            return 1;
        }
    }

    private cityFees: Record<string, number> = {
        'Cartagena': 0, 'Barranquilla': 250000, 'Santa Marta': 350000,
        'Bogota': 0, 'Medellin': 0, 'Cali': 0
    };

    // Helper: Check if a specific date falls into a date range string "YYYY-MM-DD to YYYY-MM-DD"
    private isDateInPeriod(date: Date, rangeStr: string): boolean {
        const [startStr, endStr] = rangeStr.split(' to ');
        if (!startStr || !endStr) return false;

        // Normalize comparison to "YYYY-MM-DD" strings to avoid timezone headaches
        // Create a clone to not mutate original
        const dObj = new Date(date);
        dObj.setMinutes(dObj.getMinutes() - dObj.getTimezoneOffset());
        const d = dObj.toISOString().split('T')[0];

        return d >= startStr && d <= endStr;
    }

    calculateTotalValue(insuranceOverride?: string): number {
        const state = this.reservation();
        const days = this.calculateDays();
        let total = 0;

        // 1. Car Price (Dynamic Calculation per Day)
        const car = state.selectedCar;
        let carBasePrice = Number(car?.base_price || car?.price || 0);

        if (car && state.pickup.date && state.dropoff.date) {
            let runningTotal = 0;
            // Iterate each day to check for special season pricing
            for (let i = 0; i < days; i++) {
                const currentDay = new Date(state.pickup.date);
                currentDay.setDate(currentDay.getDate() + i);

                let dailyRate = carBasePrice;

                // Check special periods if they exist
                if (car.special_periods && Array.isArray(car.special_periods)) {
                    for (const period of car.special_periods) {
                        try {
                            // Format 1: "dates" string "YYYY-MM-DD to YYYY-MM-DD"
                            if (period.dates && this.isDateInPeriod(currentDay, period.dates)) {
                                dailyRate = Number(period.price);
                                break;
                            }
                            // Format 2: "start/end" properties (Admin Panel)
                            else if (period.start && period.end) {
                                // Create a clone to not mutate original
                                const dObj = new Date(currentDay);
                                dObj.setMinutes(dObj.getMinutes() - dObj.getTimezoneOffset());
                                const d = dObj.toISOString().split('T')[0];

                                if (d >= period.start && d <= period.end) {
                                    dailyRate = Number(period.price);
                                    break;
                                }
                            }
                        } catch (e) {
                            console.warn('Error parsing special period', period);
                        }
                    }
                }
                runningTotal += dailyRate;
            }
            total += runningTotal;
        } else {
            // Fallback (shouldn't happen in valid flow): simple multiplication
            total += (days * carBasePrice);
        }

        // 2. Insurance
        const insuranceType = insuranceOverride || state.insurance;
        if (insuranceType === 'total') {
            total += (days * 77000);
        }

        // 3. Wash
        total += (state.selectedCar?.washPrice || state.selectedCar?.wash_price || 35000);

        // 4. Dropoff Fee
        const pickupCity = state.pickup.city;
        const dropCity = state.dropoff.city;
        if (pickupCity && dropCity && pickupCity !== dropCity) {
            total += (this.cityFees[dropCity] || 0);
        }

        return total;
    }

    private combineDateAndTime(date: Date, timeStr: string): Date {
        if (!date) return new Date();
        const parts = timeStr ? timeStr.split(':') : ['0', '0'];
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);

        const newDate = new Date(date);
        newDate.setHours(isNaN(hours) ? 0 : hours);
        newDate.setMinutes(isNaN(minutes) ? 0 : minutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        return newDate;
    }

    // --- EDIT RESERVATION FLOW ---
    readonly editingBookingId = signal<string | null>(null);

    startEditing(booking: any) {
        // Map DB booking to ReservationState
        const pickupDate = new Date(booking.start_date);
        const dropoffDate = new Date(booking.end_date);

        // Ensure times are formatted HH:mm
        const pickupTime = booking.pickup_time ? booking.pickup_time.substring(0, 5) : '10:00';
        const dropoffTime = booking.dropoff_time ? booking.dropoff_time.substring(0, 5) : '10:00';

        // Check if pickup is locked (Already active or started)
        // Logic: specific status OR current time > pickup time
        const pickupDateTime = this.combineDateAndTime(pickupDate, pickupTime);
        const now = new Date();
        const isLocked = booking.status === 'active' || now > pickupDateTime;

        const state: ReservationState = {
            pickup: {
                city: booking.pickup_location,
                date: pickupDate,
                time: pickupTime
            },
            dropoff: {
                city: booking.dropoff_location,
                date: dropoffDate,
                time: dropoffTime
            },
            isPickupLocked: isLocked,
            // We set the current car if possible, but Step 2 (Vehicles) handles logic to re-select
            selectedCar: {
                id: booking.vehicle_id || booking.category_id,
                title: booking.category_name,
                price: Number(booking.daily_rate || booking.base_price || 0),
                imageUrl: booking.image_url
            },
            extras: [], // TODO: Load extras if available in booking object
            insurance: 'basic', // TODO: Load insurance
            customerDetails: {
                fullName: booking.client_name || '', // You might need to fetch this if not in list
                nationality: booking.nationality || 'Colombia',
                email: booking.email || '',
                ddi: booking.ddi || '+57',
                phone: booking.phone || '',
                docType: booking.doc_type || 'CC',
                docNumber: booking.doc_number || ''
            }
        };

        this.editingBookingId.set(booking.id.toString());
        this.saveState(state);
        this.reservation.set(state);
    }

    cancelEditing() {
        this.editingBookingId.set(null);
        this.clearState();
        this.reservation.set(this.getDefaultState());
    }
}
