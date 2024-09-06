import { Directive, ElementRef } from '@angular/core'
import { INTERSECTION_ROOT } from '@src/app/common/shared/directives/intersection-observer/tokens/intersection-root'

@Directive({
  selector: '[lwIntersectionRoot]',
  providers: [
    {
      provide: INTERSECTION_ROOT,
      useExisting: ElementRef,
    },
  ],
})
export class IntersectionRootDirective {}
