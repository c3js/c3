import { Directive, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core'
import { IntersectionObserverDirective } from '@src/app/common/shared/directives/intersection-observer/intersection-observer.directive'

@Directive({
  selector: '[lwIntersectionObservee]',
})
export class IntersectionObserveeDirective implements OnDestroy {
  @Output()
  visible = new EventEmitter<IntersectionObserverEntry>()

  constructor(
    private intersectionObserver: IntersectionObserverDirective,
    private el: ElementRef<HTMLElement>
  ) {
    this.intersectionObserver.observe(this.el.nativeElement, (entries) => {
      entries.forEach((e) => {
        this.visible.emit(e)
      })
    })
  }

  ngOnDestroy(): void {
    this.intersectionObserver.unobserve(this.el.nativeElement)
  }
}
