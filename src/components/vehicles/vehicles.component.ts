import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, signal, computed, OnInit, OnDestroy, Inject, PLATFORM_ID, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BookingService } from '../../services/booking.service';
import { CurrencyService } from '../../services/currency.service';
import { LanguageService } from '../../services/language.service';

interface ServiceItem {
  id: number;
  title: string;
  category?: string;
  description?: string;
  priceLowSeason?: number;
  priceHighSeason?: number;
  base_price?: number;
  washPrice?: number;
  special_periods?: any[];
  price?: number;
  imageUrl: string;
  specs?: { icon: string; text: string }[];
  passengers?: number; // Keep raw data for re-computation
  luggage?: number;
  doors?: number;
  transmission?: string;
}

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class VehiclesComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  currencyService = inject(CurrencyService);
  lang = inject(LanguageService);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  @Input() theme: 'coral' | 'blue' = 'coral';
  @Input() data: ServiceItem[] | null = null;
  @Input() overlineText: string = '— Nuestra Flota —';
  @Input() titleText: string = 'Nuestros Servicios';
  @Input() descriptionText: string | null = null; // New description input (optional)
  @Output() selectService = new EventEmitter<ServiceItem>();
  @Output() modalVisibilityChange = new EventEmitter<boolean>();

  activeIndex = signal(0);
  highlightedIndex = signal<number>(-1);
  private autoScrollTimer: any;
  private platformId: Object;

  showAvailabilityModal = signal(false);
  showErrorModal = signal(false);
  showNoAlternativesModal = signal(false);
  unavailableCategory = signal<any>(null);
  suggestedCategories = signal<any[]>([]);

  // Store raw service items to allow re-computation on language change
  _rawServices = signal<ServiceItem[]>([]);

  // Computed signal that regenerates services (with translated specs) when language changes
  services = computed(() => {
    const raw = this._rawServices();
    // Trigger language dependency
    this.lang.currentLang();

    return raw.map(v => ({
      ...v,
      // Regenerate specs with current language
      specs: [
        { icon: 'users', text: `${v.passengers || 4} ${this.lang.t('vehicles.seats')}` },
        { icon: 'case', text: `${v.luggage || 2} ${this.lang.t('vehicles.luggage')}` },
        { icon: 'traction', text: 'FWD' }, // Technical term often kept as is, but could be translated if needed
        { icon: 'gear', text: this.formatTransmission(v.transmission || '') }
      ]
    }));
  });

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;
  }

  ngOnInit() {
    // Load data from API if not provided via Input
    if (!this.data) {
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
          // Filter logic:
          // We show ALL vehicles, even if unavailable, so the user can see the options
          // and trigger the "Unavailable / Suggestion" modal if they select one.
          // We only filter out vehicles that have strictly 0 stock defined (meaning they don't exist).
          const availableItems = data.filter((d: any) => {
            const stock = d.stock ?? d.total ?? d.total_units ?? 1;
            return Number(stock) > 0;
          });

          const mappedServices: ServiceItem[] = availableItems.map((v: any) => {
            // Parse special periods
            let periods = [];
            if (typeof v.special_periods === 'string') {
              try { periods = JSON.parse(v.special_periods); } catch (e) { }
            } else if (Array.isArray(v.special_periods)) {
              periods = v.special_periods;
            }

            // Normalize image path logic - ROBUST PRODUCTION FIX
            let imgPath = v.image_url;

            if (imgPath) {
              // Case 1: External URL (http/https) -> validation only
              if (imgPath.startsWith('http')) {
                // Keep as is
              }
              // Case 2: Standard Assets Path (already has assets/)
              else if (imgPath.includes('assets/')) {
                // Ensure it starts with / for absolute path from domain root
                if (!imgPath.startsWith('/')) {
                  imgPath = '/' + imgPath;
                }
                // Ensure webp
                if (imgPath.endsWith('.png') || imgPath.endsWith('.jpg')) {
                  imgPath = imgPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
                }
              }
              // Case 3: Admin Uploads (server/public/...)
              else if (imgPath.includes('server/public/')) {
                if (!imgPath.startsWith('/')) {
                  imgPath = '/' + imgPath;
                }
              }
              // Case 4: Just Filename (legacy DB data) -> "compacto", "compacto.png"
              else {
                // Extract basename and force assets path
                const baseName = imgPath.split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || 'compacto';
                imgPath = `/assets/imgs/servicios/${baseName}.webp`;
              }
            } else {
              imgPath = '/assets/imgs/servicios/compacto.webp';
            }

            return {
              id: v.id,
              title: v.name,
              category: v.category_type || v.category || '',
              description: v.description,
              base_price: Number(v.base_price || v.price_per_day || 0),
              washPrice: Number(v.wash_price || 35000),
              special_periods: periods,
              imageUrl: imgPath,
              // Store raw data for computed property
              passengers: v.passengers,
              luggage: v.luggage,
              doors: v.doors,
              transmission: v.transmission,
              // Initial specs (will be overwritten by computed)
              specs: []
            } as ServiceItem;
          });

          this._rawServices.set(mappedServices);

          // Center view after data load
          setTimeout(() => {
            const count = this.services().length;
            if (count > 0) {
              const middleIndex = Math.floor(count / 2);
              this.scrollToIndex(middleIndex, false);
            }
          }, 0);
        },
        error: (err) => {
          console.error('Error fetching vehicles:', err);
          if (err.message === 'SERVER_HTML_ERROR' || (err.error && err.error.message === 'SERVER_HTML_ERROR')) {
            alert(this.lang.t('val.serverError'));
          }
        }
      });
    } else {
      this._rawServices.set(this.data);
    }

    // Check for unavailable redirection error
    const error = this.route.snapshot.queryParamMap.get('error');
    if (error === 'unavailable') {
      setTimeout(() => {
        this.showErrorModal.set(true);
        // Clean URL to prevent recurring alert
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { error: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }, 500);
    }

    // Centrar vista inicialmente
    setTimeout(() => {
      const count = this.services().length;
      if (count > 0) {
        const middleIndex = Math.floor(count / 2);
        this.scrollToIndex(middleIndex, false);
      }
    }, 0);

    if (isPlatformBrowser(this.platformId)) {
      this.startAutoScroll();
    }
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
    const state = this.bookingService.reservation();
    // If no dates selected, return base price
    if (!state.pickup.date || !state.dropoff.date) {
      return service.base_price || 0;
    }

    // Logic similar to bookingService.calculateTotalValue but for a single day reference or average
    // The requirement says "mostrar el precio real".
    // Usually "Price per Day" in the card. If it varies, showing the STARTING price or AVERAGE is common.
    // Let's show the price for the FIRST DAY of the selected range as the "Daily Rate".

    // Check if the FIRST DAY falls into a special period
    // Adjust for timezone to ensure we match the correct day
    const checkDate = new Date(state.pickup.date);
    checkDate.setMinutes(checkDate.getMinutes() - checkDate.getTimezoneOffset());
    const dateStr = checkDate.toISOString().split('T')[0]; // YYYY-MM-DD

    if (service.special_periods && Array.isArray(service.special_periods)) {
      for (const period of service.special_periods) {
        // Format 1: "dates" string "YYYY-MM-DD to YYYY-MM-DD"
        if (period.dates) {
          const [start, end] = period.dates.split(' to ');
          if (dateStr >= start && dateStr <= end) {
            return Number(period.price);
          }
        }
        // Format 2: "start" and "end" properties (Admin Panel Format)
        else if (period.start && period.end) {
          if (dateStr >= period.start && dateStr <= period.end) {
            return Number(period.price);
          }
        }
      }
    }

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

    let scrollLeft = cardCenter - containerCenter;

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

  onSelectService(service: any) {
    const state = this.bookingService.reservation();

    const fullService = {
      ...service,
      price: this.getCurrentPrice(service)
    };

    if (!state.pickup.date || !state.dropoff.date) {
      // No dates, proceed to step 1 via emission (parent handles routing)
      this.selectService.emit(fullService);
      return;
    }

    const startStr = state.pickup.date.toISOString().split('T')[0];
    const endStr = state.dropoff.date.toISOString().split('T')[0];
    const pickupTime = state.pickup.time || '10:00';
    const dropoffTime = state.dropoff.time || '10:00';

    console.log('[Availability Check] Calling API with dates:', startStr, pickupTime, 'to', endStr, dropoffTime);

    this.apiService.checkAvailability(startStr, endStr, pickupTime, dropoffTime).subscribe({
      next: (availability) => {
        console.log('[DEBUG] Full Availability Response:', availability);

        // If empty array (API error fallback), proceed to Step 3
        // If empty array (API error fallback), DO NOT proceed blindly if strict validation is required.
        if (!availability || availability.length === 0) {
          console.warn('[DEBUG] Empty availability array! Strict validation blocks this.');
          // Treat as unavailable or system error
          alert(this.lang.t('val.error'));
          return;
        }

        // Helper to normalize strings (remove accents, uppercase)
        const normalize = (str: string) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

        // Robust match: Check ID (loose) OR Name (normalized)
        const catAvailability = availability.find((a: any) => {
          const idMatch = String(a.id) === String(service.id);
          const nameMatch = normalize(a.name) === normalize(service.title);
          return idMatch || nameMatch;
        });

        console.log('[DEBUG] Searching for Service ID:', service.id, 'Title:', service.title);
        console.log('[DEBUG] Matched Category:', catAvailability);

        // Robust TRUTHY check for availability (handles boolean, 1, '1', 'true')
        const isAvailable = catAvailability && (
          catAvailability.is_available === true ||
          catAvailability.is_available === 1 ||
          catAvailability.is_available === '1' ||
          String(catAvailability.is_available).toLowerCase() === 'true'
        );

        console.log('[DEBUG] Computed isAvailable:', isAvailable);

        if (isAvailable) {
          // Enrich with fresh DB data if available
          const enrichedService = {
            ...fullService,
            id: catAvailability.id,
            title: catAvailability.name,
            category: catAvailability.category_type || catAvailability.category || fullService.category || '',
            description: catAvailability.description || fullService.description || '',
            base_price: Number(catAvailability.base_price || catAvailability.price_per_day || fullService.base_price || 0),
            washPrice: Number(catAvailability.wash_price || fullService.washPrice || 35000),
            imageUrl: catAvailability.image_url || fullService.imageUrl
          };
          this.selectService.emit(enrichedService);
        } else {
          this.unavailableCategory.set(service);
          const alternatives = availability.filter((a: any) => {
            // Robust check for suggestions too
            const val = a.is_available;
            return val === true || val === 1 || val === '1' || String(val).toLowerCase() === 'true';
          }).slice(0, 2);

          this.suggestedCategories.set(alternatives);
          this.modalVisibilityChange.emit(true);

          if (alternatives.length === 0) {
            // No alternatives - show special modal
            this.showNoAlternativesModal.set(true);
          } else {
            // Show normal availability modal with suggestions
            this.showAvailabilityModal.set(true);
          }
        }
      },
      error: (err: any) => {
        console.error('[Availability Check] API ERROR:', err);

        if (err.message === 'SERVER_HTML_ERROR' || (err.error && err.error.message === 'SERVER_HTML_ERROR')) {
          alert(this.lang.t('val.serverError'));
        }

        alert(this.lang.t('val.error'));
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

    const mappedService = {
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
        { icon: 'users', text: `${suggested.passengers || 4} ${this.lang.t('vehicles.seats')}` },
        { icon: 'case', text: `${suggested.luggage || 2} ${this.lang.t('vehicles.luggage')}` },
        { icon: 'traction', text: 'FWD' },
        { icon: 'gear', text: this.formatTransmission(suggested.transmission) }
      ]
    };
    this.showAvailabilityModal.set(false);
    this.modalVisibilityChange.emit(false);
    this.selectService.emit(mappedService);
  }

  closeModal() {
    this.showAvailabilityModal.set(false);
    this.modalVisibilityChange.emit(false);
  }

  closeNoAlternativesModal() {
    this.showNoAlternativesModal.set(false);
    this.modalVisibilityChange.emit(false);
    this.router.navigate(['/paso-1']);
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
  }

  scroll(direction: 'left' | 'right') {
    this.resetAutoScrollTimer();

    const count = this.services().length;
    let newIndex = direction === 'left' ? this.activeIndex() - 1 : this.activeIndex() + 1;

    if (newIndex < 0) newIndex = 0;
    if (newIndex >= count) newIndex = count - 1;

    this.scrollToIndex(newIndex);
  }

  formatTransmission(t: string): string {
    if (!t) return this.lang.t('vehicles.transmission.auto');
    const val = t.toLowerCase();
    if (val.includes('auto')) return this.lang.t('vehicles.transmission.auto');
    if (val.includes('manu') || val.includes('meca')) return this.lang.t('vehicles.transmission.manual');
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }
}
