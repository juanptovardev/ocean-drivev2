import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, signal, computed, OnInit, OnDestroy, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BookingService } from '../../services/booking.service';
import { CurrencyService } from '../../services/currency.service';
import { LanguageService } from '../../services/language.service';

interface ServiceItem {
    id: number;
    title: string;
    description: string;
    priceLowSeason?: number;
    priceHighSeason?: number;
    base_price?: number;
    special_periods?: any[];
    imageUrl: string;
    specs: { icon: string; text: string }[];
}

@Component({
    selector: 'app-vehicles4',
    templateUrl: './vehicles4.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule],
})
export class Vehicles4Component implements OnInit, OnDestroy {
    @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

    private apiService = inject(ApiService);
    private bookingService = inject(BookingService);

    activeIndex = signal(0);
    highlightedIndex = signal<number>(-1);
    private autoScrollTimer: any;
    private platformId: Object;
    private router = inject(Router);
    currencyService = inject(CurrencyService);
    lang = inject(LanguageService);

    showAvailabilityModal = signal(false);
    unavailableCategory = signal<any>(null);
    suggestedCategories = signal<any[]>([]);

    onReserve(service: any, event?: Event) {
        event?.stopPropagation();
        const state = this.bookingService.reservation();
        const fullService = {
            ...service,
            price: this.getCurrentPrice(service)
        };

        if (!state.pickup.date || !state.dropoff.date) {
            // No dates, proceed to Paso 1
            this.bookingService.updateSelectedCar(fullService);
            this.router.navigate(['/paso-1']);
            return;
        }

        const startStr = state.pickup.date.toISOString().split('T')[0];
        const endStr = state.dropoff.date.toISOString().split('T')[0];
        const pickupTime = state.pickup.time || '10:00';
        const dropoffTime = state.dropoff.time || '10:00';

        this.apiService.checkAvailability(startStr, endStr, pickupTime, dropoffTime).subscribe({
            next: (availability) => {
                if (!availability || availability.length === 0) {
                    this.bookingService.updateSelectedCar(fullService);
                    this.router.navigate(['/paso-1']);
                    return;
                }

                // Helper to normalize strings
                const normalize = (str: string) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

                const catAvailability = availability.find((a: any) => {
                    const idMatch = String(a.id) === String(service.id);
                    const nameMatch = normalize(a.name) === normalize(service.title);
                    return idMatch || nameMatch;
                });

                const isAvailable = catAvailability && (
                    catAvailability.is_available === true ||
                    catAvailability.is_available === 1 ||
                    catAvailability.is_available === '1' ||
                    String(catAvailability.is_available).toLowerCase() === 'true'
                );

                if (isAvailable) {
                    this.bookingService.updateSelectedCar(fullService);
                    this.router.navigate(['/paso-1']);
                } else {
                    this.unavailableCategory.set(service);
                    this.suggestedCategories.set(availability.filter((a: any) => {
                        const val = a.is_available;
                        return val === true || val === 1 || val === '1' || String(val).toLowerCase() === 'true';
                    }).slice(0, 3));
                    this.showAvailabilityModal.set(true);
                }
            },
            error: (err) => {
                console.error('Availability check failed', err);
                // Fallback to allow booking if check fails
                this.bookingService.updateSelectedCar(fullService);
                this.router.navigate(['/paso-1']);
            }
        });
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
            imageUrl: suggested.image_url,
            base_price: Number(suggested.base_price || suggested.price_per_day || 0),
            special_periods: periods,
            price: Number(suggested.base_price || suggested.price_per_day || 0),
            washPrice: Number(suggested.wash_price || 35000)
        });
        this.showAvailabilityModal.set(false);
        this.router.navigate(['/paso-1']);
    }

    closeModal() {
        this.showAvailabilityModal.set(false);
    }

    // Lista de vehículos
    // List of raw vehicles from API
    rawVehicles = signal<any[]>([]);

    // Computed services that updates with language changes
    services = computed(() => {
        const lang = this.lang.currentLang(); // Dependency on language signal

        return this.rawVehicles().map(v => {
            // Parse special periods
            let periods = [];
            if (typeof v.special_periods === 'string') {
                try { periods = JSON.parse(v.special_periods); } catch (e) { }
            } else if (Array.isArray(v.special_periods)) {
                periods = v.special_periods;
            }

            // Normalize image path
            let imgPath = v.image_url;
            if (imgPath && !imgPath.startsWith('http') && !imgPath.startsWith('/')) {
                imgPath = '/' + imgPath;
            }

            return {
                id: v.id,
                title: v.name,
                description: v.description,
                base_price: Number(v.base_price || v.price_per_day || 0),
                special_periods: periods,
                imageUrl: imgPath,
                specs: [
                    { icon: 'users', text: `${v.passengers} ${this.lang.t('vehicles.seats')}` },
                    { icon: 'case', text: `${v.luggage} ${this.lang.t('vehicles.luggage')}` },
                    { icon: 'traction', text: this.lang.t('vehicles.fwd') },
                    { icon: 'gear', text: this.formatTransmission(v.transmission) }
                ]
            } as ServiceItem;
        });
    });

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.platformId = platformId;
    }

    ngOnInit() {
        this.loadVehicles();
        if (isPlatformBrowser(this.platformId)) {
            this.startAutoScroll();
            // Force change detection or just let signals work
        }
    }

    loadVehicles() {
        const state = this.bookingService.reservation();
        const hasDates = !!(state.pickup.date && state.dropoff.date);

        const obs$ = hasDates
            ? this.apiService.checkAvailability(
                state.pickup.date!.toISOString().split('T')[0],
                state.dropoff.date!.toISOString().split('T')[0],
                state.pickup.time || '10:00',
                state.dropoff.time || '10:00'
            )
            : this.apiService.getVehicles();

        obs$.subscribe({
            next: (data) => {
                // Filter logic: Show all vehicles unless strictly 0 stock
                const availableItems = data.filter((d: any) => {
                    const stock = d.stock ?? d.total ?? d.total_units ?? 1;
                    return Number(stock) > 0;
                });

                // Set raw data, computed 'services' will update automatically
                this.rawVehicles.set(availableItems);
            },
            error: (err) => console.error('Error fetching vehicles:', err)
        });
    }

    ngOnDestroy() {
        this.stopAutoScroll();
    }

    startAutoScroll() {
        this.stopAutoScroll(); // Limpiar timer existente

        this.autoScrollTimer = setInterval(() => {
            this.moveToNextSlide();
        }, 4000);
    }

    stopAutoScroll() {
        if (this.autoScrollTimer) {
            clearInterval(this.autoScrollTimer);
            this.autoScrollTimer = null;
        }
    }

    // Resetea el timer al interactuar
    resetAutoScrollTimer() {
        this.startAutoScroll();
    }

    moveToNextSlide() {
        const count = this.services().length;
        if (count === 0) return;

        // Calcular siguiente índice basado en el índice activo actual
        let nextIndex = this.activeIndex() + 1;
        if (nextIndex >= count) {
            nextIndex = 0;
        }

        // Efecto de resaltado para auto-scroll
        this.highlightedIndex.set(nextIndex);

        // Mover al índice calculado
        this.scrollToIndex(nextIndex, false);

        // Remover resaltado
        setTimeout(() => {
            this.highlightedIndex.set(-1);
        }, 2000);
    }

    formatPrice(price: number): string {
        return this.currencyService.formatPrice(price);
    }

    getCurrentPrice(service: ServiceItem): number {
        // Use BookingService state to get selected dates
        const state = this.bookingService.reservation();
        let checkDateStr = new Date().toISOString().split('T')[0];

        if (state.pickup.date) {
            checkDateStr = state.pickup.date.toISOString().split('T')[0];
        }

        // Check special periods first
        if (service.special_periods && service.special_periods.length > 0) {
            for (const p of service.special_periods) {
                // Check if date corresponds to a special period ("start to end" string format usually, but confirming usage)
                // In vehicles3/vehicles the period object might have 'dates' string "YYYY-MM-DD to YYYY-MM-DD"
                if (p.dates) {
                    const [start, end] = p.dates.split(' to ');
                    if (checkDateStr >= start && checkDateStr <= end) {
                        return Number(p.price);
                    }
                }
                // Fallback for object format {start, end} if used
                else if (p.start && p.end) {
                    if (checkDateStr >= p.start && checkDateStr <= p.end) {
                        return Number(p.price);
                    }
                }
            }
        }

        // Return base price
        return service.base_price || 0;
    }

    // Llamado al hacer scroll manual o swipe
    onScroll() {
        this.resetAutoScrollTimer();

        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;

        const containerCenter = container.scrollLeft + (container.clientWidth / 2);

        let closestIndex = 0;
        let minDistance = Number.MAX_VALUE;

        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            const childCenter = child.offsetLeft + (child.offsetWidth / 2);
            const distance = Math.abs(containerCenter - childCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }

        if (this.activeIndex() !== closestIndex) {
            this.activeIndex.set(closestIndex);
        }
    }

    scrollToIndex(index: number, isUserInteraction: boolean = true) {
        if (isUserInteraction) {
            this.resetAutoScrollTimer();
        }

        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;
        const children = container.children;

        if (!children[index]) return;

        const targetCard = children[index] as HTMLElement;

        const cardCenter = targetCard.offsetLeft + (targetCard.offsetWidth / 2);
        const containerCenter = container.clientWidth / 2;

        // Calcular posición ideal centrada
        let scrollLeft = cardCenter - containerCenter;

        // Limitar el scroll para no dejar espacios vacíos al inicio o final
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (scrollLeft < 0) {
            scrollLeft = 0;
        } else if (scrollLeft > maxScrollLeft) {
            scrollLeft = maxScrollLeft;
        }

        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });

        this.activeIndex.set(index);
    }

    scroll(direction: 'left' | 'right') {
        this.resetAutoScrollTimer();

        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;

        const cardWidth = 320 + 32; // Card width (320px) + gap (32px/8rem)
        const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;

        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    formatTransmission(t: string): string {
        if (!t) return this.lang.t('vehicles.auto');
        const val = t.toLowerCase();
        if (val.includes('auto')) return this.lang.t('vehicles.auto');
        if (val.includes('manu') || val.includes('meca')) return this.lang.t('vehicles.manual');
        return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    }
}
