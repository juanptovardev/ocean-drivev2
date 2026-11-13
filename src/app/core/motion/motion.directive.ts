import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';
import { MotionService, type RevealVariant } from './motion.service';

/**
 * Scroll reveal for any element: `appReveal` fades it in the first time it
 * enters the viewport. Use `appRevealDelay` to stagger a sequence.
 */
@Directive({
    selector: '[appReveal]',
    standalone: true
})
export class MotionDirective implements OnInit, OnDestroy {
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly motion = inject(MotionService);

    readonly appReveal = input<RevealVariant | ''>('');
    readonly appRevealDelay = input(0);

    private tween: gsap.core.Tween | null = null;

    ngOnInit(): void {
        const variant = this.appReveal();
        this.tween = this.motion.reveal(this.element.nativeElement, {
            variant: variant ? variant : 'up',
            delay: this.appRevealDelay()
        });
    }

    ngOnDestroy(): void {
        this.motion.destroy(this.tween);
        this.tween = null;
    }
}
