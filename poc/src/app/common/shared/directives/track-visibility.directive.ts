import { Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core'

@Directive({
  selector: '[lwTrackVisibility]',
})
export class TrackVisibilityDirective implements OnInit, OnDestroy {
  observer!: IntersectionObserver

  @Input() lwTrackVisibility = true

  @Input('lwTrackVisibilityOptions') options: IntersectionObserverInit

  @Input('lwTrackVisibilityScrollContainer') scrollContainer: HTMLElement

  @Output()
  visible = new EventEmitter<IntersectionObserverEntry>()

  constructor(
    private el: ElementRef<HTMLElement>,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!this.lwTrackVisibility) {
      return
    }
    this.ngZone.runOutsideAngular(() => {
      const options = this.scrollContainer ? { ...this.options, root: this.scrollContainer } : this.options
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          this.visible.emit(e)
        })
      }, options)
      this.observer.observe(this.el.nativeElement)
    })
  }

  ngOnDestroy(): void {
    if (!this.lwTrackVisibility) {
      return
    }
    this.observer.disconnect()
  }
}
