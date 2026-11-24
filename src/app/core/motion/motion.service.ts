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

/** Lets a component stop the animations it started. */
export interface MotionHandle {
    kill(): void;
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

    /**
     * Runs a callback the first time an element scrolls into view.
     * Used by the "count up when visible" effects.
     */
    onEnter(element: HTMLElement, callback: () => void, options: { start?: string; once?: boolean } = {}): MotionHandle {
        if (this.reduced()) {
            callback();
            return { kill: () => undefined };
        }

        const trigger = ScrollTrigger.create({
            trigger: element,
            start: options.start ?? 'top 85%',
            once: options.once ?? true,
            onEnter: () => callback()
        });

        return { kill: () => trigger.kill() };
    }

    /**
     * Scroll spy: calls back with the element currently inside the reading band.
     */
    spy(elements: HTMLElement[], callback: (element: HTMLElement) => void): MotionHandle {
        const triggers = elements.map((element) =>
            ScrollTrigger.create({
                trigger: element,
                start: 'top 20%',
                end: 'bottom 60%',
                onToggle: (self) => {
                    if (self.isActive) {
                        callback(element);
                    }
                }
            })
        );

        return { kill: () => triggers.forEach((trigger) => trigger.kill()) };
    }

    /**
     * Parallax: moves an element slower than the page while it crosses the
     * viewport. `toY` is the pixel offset applied at the end of the travel.
     */
    parallax(element: HTMLElement, options: { fromY?: number; toY?: number; trigger?: HTMLElement; start?: string; end?: string } = {}): MotionHandle {
        if (this.reduced()) {
            return { kill: () => undefined };
        }

        const tween = gsap.fromTo(
            element,
            { y: options.fromY ?? 0 },
            {
                y: options.toY ?? 60,
                ease: 'none',
                scrollTrigger: {
                    trigger: options.trigger ?? element,
                    start: options.start ?? 'top bottom',
                    end: options.end ?? 'bottom top',
                    scrub: true
                }
            }
        );

        return { kill: () => { tween.scrollTrigger?.kill(); tween.kill(); } };
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
