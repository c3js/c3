import { Injectable, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'

// this class should be extended by a component class if a component class deals with rxjs subscriptions
@Injectable()
export class SubscriptionHandler implements OnDestroy {
  protected subscriptions: Subscription[] = []

  ngOnDestroy(): void {
    if (Array.isArray(this.subscriptions)) {
      this.subscriptions.filter(Boolean).forEach((sub) => sub.unsubscribe())
    }
  }
}
