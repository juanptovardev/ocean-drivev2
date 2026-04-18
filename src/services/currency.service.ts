import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
    /** Whether prices should be displayed in USD */
    showUsd = signal(false);

    /** COP per 1 USD (e.g. 4200 means 1 USD = 4200 COP) */
    exchangeRate = signal<number>(0);

    /** True while the rate is being fetched */
    loading = signal(false);

    /** Error message if fetching failed */
    error = signal<string | null>(null);

    constructor() {
        this.fetchRate();
    }

    toggle() {
        this.showUsd.update(v => !v);
    }

    /** Convert a COP amount to USD using the current rate */
    convertToUsd(copAmount: number): number {
        const rate = this.exchangeRate();
        if (!rate || rate <= 0) return 0;
        return copAmount / rate;
    }

    /** Format an amount as USD */
    formatUsd(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    }

    /** Format an amount as COP */
    formatCop(amount: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount);
    }

    /** Get the formatted price based on the current toggle state */
    formatPrice(copAmount: number): string {
        if (this.showUsd() && this.exchangeRate() > 0) {
            return this.formatUsd(this.convertToUsd(copAmount));
        }
        return this.formatCop(copAmount);
    }

    private fetchRate() {
        this.loading.set(true);
        this.error.set(null);

        fetch('https://api.exchangerate-api.com/v4/latest/USD')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch exchange rate');
                return res.json();
            })
            .then(data => {
                const copRate = data?.rates?.COP;
                if (copRate && copRate > 0) {
                    this.exchangeRate.set(copRate);
                } else {
                    // Fallback rate
                    this.exchangeRate.set(4200);
                }
                this.loading.set(false);
            })
            .catch(err => {
                console.warn('[CurrencyService] Could not fetch rate, using fallback:', err);
                this.exchangeRate.set(4200); // Fallback
                this.error.set('No se pudo obtener la tasa del día');
                this.loading.set(false);
            });
    }
}
