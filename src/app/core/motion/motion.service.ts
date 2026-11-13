import { Injectable, signal } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'blur';

export interface RevealOptions {
    variant?: RevealVariant;
    delay?: number;
    duration?: number;
    stagger?: number;
    /** ScrollTrigger start position, e.g. "top 85%". */
    start?: string;
}

const FROM: Record<RevealVariant, gsap.TweenVars> = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: -40 },
    right: { x: 40 },
    fade: {},
    scale: { scale: 0.92 },
    blur: { filter: 'blur(8px)' }
};

/**
 * One place to drive every scroll animation. Keeps GSAP out of the
 * components, and honours the OS "reduce motion" setting.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
    /** True when the operating system asks for reduced motion. */
    readonly reduced = signal(false);

    constructor() {
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
            const query = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.reduced.set(query.matches);
            query.addEventListener('change', (event) => this.reduced.set(event.matches));
        }
    }

    /**
     * Fades an element in when it scrolls into view. Children marked with
     * `data-reveal-item` animate one after another instead of the wrapper.
     */
    reveal(element: HTMLElement, options: RevealOptions = {}): gsap.core.Tween | null {
        if (this.reduced()) {
            gsap.set(element, { opacity: 1, clearProps: 'transform,filter' });
            return null;
        }

        const {
            variant = 'up',
            delay = 0,
            duration = 0.8,
            stagger = 0.08,
            start = 'top 85%'
        } = options;

        const items = element.querySelectorAll<HTMLElement>('[data-reveal-item]');
        const targets: gsap.TweenTarget = items.length > 0 ? items : element;

        return gsap.fromTo(
            targets,
            { opacity: 0, x: 0, y: 0, scale: 1, filter: 'none', ...FROM[variant] },
            {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                filter: 'none',
                duration,
                delay,
                stagger,
                ease: 'power3.out',
                scrollTrigger: { trigger: element, start, once: true }
            }
        );
    }

    /** Kills a tween together with its scroll trigger. */
    destroy(tween: gsap.core.Tween | null): void {
        if (!tween) {
            return;
        }
        tween.scrollTrigger?.kill();
        tween.kill();
    }
}
