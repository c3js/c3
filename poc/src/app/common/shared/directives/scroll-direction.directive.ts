import { Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core'
import { distinctUntilChanged, fromEvent, map, Subscription, tap } from 'rxjs'
import { DEBOUNCE_TIME_SMALL } from '@src/app/common/constants/constants'

export type ScrollDirection = 'up' | 'down'

@Directive({
  selector: '[lwScrollDirection]',
})
export class ScrollDirectionDirective implements OnDestroy {
  private subscription = new Subscription()
  private direction: ScrollDirection = 'down'
  private currentScroll = 0
  private timeThreshold = DEBOUNCE_TIME_SMALL / 2
  private lastTimestamp = 0

  @Output()
  directionChange = new EventEmitter<ScrollDirection>()

  constructor(private el: ElementRef<HTMLElement>) {
    this.subscription.add(
      fromEvent(this.el.nativeElement, 'scroll')
        .pipe(
          map((event) => {
            const scrollTop = (event.target as Element).scrollTop
            const time = new Date().getTime()
            const timeOffset = time - this.lastTimestamp
            const scrollOffset = scrollTop - this.currentScroll
            if (timeOffset > this.timeThreshold) {
              this.direction = scrollOffset < 0 ? 'up' : 'down'
            }
            this.currentScroll = scrollTop
            this.lastTimestamp = time
            return this.direction
          }),

          distinctUntilChanged()
        )
        .subscribe((direction) => {
          this.directionChange.next(direction)
        })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
}
