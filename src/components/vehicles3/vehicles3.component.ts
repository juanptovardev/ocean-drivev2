import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, signal, computed, OnInit, OnDestroy, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { BookingService } from '../../services/booking.service';
import { CurrencyService } from '../../services/currency.service';
import { LanguageService } from '../../services/language.service';
import { Router } from '@angular/router';

interface ServiceItem {
  id: string | number;
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
  selector: 'app-vehicles3',
  templateUrl: './vehicles3.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class Vehicles3Component implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  activeIndex = signal(0);
  highlightedIndex = signal<number>(-1);
  private autoScrollTimer: any;
  private platformId: Object;

  private apiService = inject(ApiService);
  private bookingService = inject(BookingService);
  private router = inject(Router);
  currencyService = inject(CurrencyService);
  lang = inject(LanguageService);

  // List of raw vehicles from API
  rawVehicles = signal<any[]>([]);

  // Computed services that updates with language changes
  services = computed(() => {
    const lang = this.lang.currentLang(); // Dependency on language signal

    return this.rawVehicles().map(c => {
      const type = c.category_type?.toLowerCase() || '';

      // Normalize image path logic - ROBUST PRODUCTION FIX
      let imgPath = c.image_url;

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

      // Fallback removed to rely on DB image.
      if (!imgPath) {
        imgPath = '';
      }

      // Parse special periods
      let periods = [];
      if (typeof c.special_periods === 'string') {
        try { periods = JSON.parse(c.special_periods); } catch (e) { }
      } else if (Array.isArray(c.special_periods)) {
        periods = c.special_periods;
      }

      return {
        id: c.id,
        title: c.name,
        description: c.description,
        base_price: Number(c.base_price || c.price_per_day || 0),
        special_periods: periods,
        imageUrl: imgPath,
        specs: [
          { icon: 'users', text: `${c.passengers} ${this.lang.t('vehicles.seats')}` },
          { icon: 'case', text: `${c.luggage} ${this.lang.t('vehicles.luggage')}` },
          { icon: 'traction', text: this.lang.t('vehicles.fwd') }, // Default for now
          { icon: 'gear', text: this.formatTransmission(c.transmission) }
        ]
      };
    });
  });

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoScroll();
      this.loadVehicles();
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

    obs$.subscribe(data => {
      // Filter logic: Show all vehicles unless strictly 0 stock
      const availableItems = data.filter((d: any) => {
        const stock = d.stock ?? d.total ?? d.total_units ?? 1;
        return Number(stock) > 0;
      });

      // Set raw data, computed 'services' will update automatically
      this.rawVehicles.set(availableItems);

      // Center the view initially so user can scroll left or right
      setTimeout(() => {
        const count = availableItems.length;
        if (count > 0) {
          const middleIndex = Math.floor(count / 2);
          this.scrollToIndex(middleIndex, false);
        }
      }, 0);
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

  getCurrentPrice(service: ServiceItem): number {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Check special periods first
    if (service.special_periods && service.special_periods.length > 0) {
      for (const p of service.special_periods) {
        if (p.dates) {
          const [start, end] = p.dates.split(' to ');
          if (todayStr >= start && todayStr <= end) {
            return Number(p.price);
          }
        }
        else if (p.start && p.end) {
          if (todayStr >= p.start && todayStr <= p.end) {
            return Number(p.price);
          }
        }
      }
    }

    return service.base_price || 0;
  }

  onReserve(service: any, event: Event) {
    event.stopPropagation();

    // Set selected car and navigate to Paso 1
    // Availability check happens in Paso 2 (VehiclesComponent)
    this.bookingService.updateSelectedCar({ ...service, price: this.getCurrentPrice(service) });
    this.router.navigate(['/paso-1']);
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
