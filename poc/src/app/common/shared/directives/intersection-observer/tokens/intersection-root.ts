import { ElementRef, InjectionToken } from '@angular/core'

export const INTERSECTION_ROOT = new InjectionToken<ElementRef<Element>>('Root element for IntersectionObserver')
