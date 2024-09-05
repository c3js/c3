import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'
import { INTERSECTION_ROOT } from '@src/app/common/shared/directives/intersection-observer/tokens/intersection-root'
import { IntersectionObserverOptions } from '@src/app/common/shared/directives/intersection-observer/intersection-observer.types'

@Directive({
  selector: '[lwIntersectionObserver]',
  exportAs: 'IntersectionObserver',
})
export class IntersectionObserverDirective implements OnInit, OnDestroy {
  @Input() lwIntersectionObserver: IntersectionObserverOptions

  private readonly callbacks = new Map<Element, IntersectionObserverCallback>()
  private intersectionObserver: IntersectionObserver

  constructor(@Optional() @Inject(INTERSECTION_ROOT) private root: ElementRef<Element> | null) {}

  ngOnInit(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.callbacks.forEach((callback, element) => {
          const filtered = entries.filter(({ target }) => target === element)

          return filtered.length && callback(filtered, this.intersectionObserver)
        })
      },
      {
        root: this.root && this.root.nativeElement,
        rootMargin: this.lwIntersectionObserver.rootMargin,
        threshold: this.lwIntersectionObserver.threshold,
      }
    )
  }

  ngOnDestroy() {
    this.intersectionObserver.disconnect()
  }

  observe(target: Element, callback: IntersectionObserverCallback = () => {}) {
    this.intersectionObserver.observe(target)
    this.callbacks.set(target, callback)
  }

  unobserve(target: Element) {
    this.intersectionObserver.unobserve(target)
    this.callbacks.delete(target)
  }
}
