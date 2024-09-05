import { Injectable } from '@angular/core'
import { SubscriptionHandler } from '@src/app/common/utils/subscription-handler'
import { debounceTime, Observable, tap } from 'rxjs'
import { ChartId, ChartPanelData } from '@src/app/common/shared/components/chart-panel/chart-panel.types'
import { DEBOUNCE_TIME_SMALL } from '@src/app/common/constants/constants'
import { arrayToObject } from '@src/app/common/utils/helpers'
import { ScrollDirection } from '@src/app/common/shared/directives/scroll-direction.directive'

@Injectable()
export class ChartPanelTrackingService extends SubscriptionHandler {
  private panels: ChartPanelData[]
  private panelsMap: Record<string, ChartPanelData>
  private visiblePanelsQueue: ChartPanelData[] = []
  private inVisiblePanelsQueue: ChartPanelData[] = []
  private scrollDirection: 'up' | 'down' = 'down'
  private hideChart: (id: ChartId) => void
  private showChart: (id: ChartId) => void

  init(data: {
    panels: ChartPanelData[]
    visibility$: Observable<{ id: ChartId; isVisible: boolean }>
    chartInitFinished$: Observable<ChartId>
    scrollDirection$: Observable<ScrollDirection>
    hideChart: (id: ChartId) => void
    showChart: (id: ChartId) => void
  }) {
    const { panels, visibility$, chartInitFinished$, scrollDirection$, hideChart, showChart } = data
    this.panels = structuredClone(panels)
    this.panelsMap = arrayToObject(this.panels, 'id')
    this.hideChart = hideChart
    this.showChart = showChart
    this.subscriptions.push(
      visibility$
        .pipe(
          tap(({ id, isVisible }) => (this.panelsMap[id].isVisible = isVisible)),
          debounceTime(DEBOUNCE_TIME_SMALL / 2)
        )
        .subscribe(() => {
          this.visiblePanelsQueue = this.panels.filter((panel) => panel.isVisible)
          this.inVisiblePanelsQueue = this.panels.filter((panel) => !panel.isVisible)
          this.renderNextPanel()
          this.inVisiblePanelsQueue.forEach((panel) => {
            this.hideChart(panel.id)
            panel.rendered = false
          })
        })
    )
    this.subscriptions.push(
      chartInitFinished$.subscribe((id: string) => {
        this.panelsMap[id].rendered = true
        this.renderNextPanel()
      })
    )
    this.subscriptions.push(
      scrollDirection$.subscribe((direction: ScrollDirection) => {
        this.scrollDirection = direction
      })
    )
  }

  private getNextPanel(): ChartPanelData {
    return this.scrollDirection === 'up' ? this.visiblePanelsQueue.pop() : this.visiblePanelsQueue.shift()
  }

  private renderNextPanel(): void {
    if (this.visiblePanelsQueue?.length) {
      let panel = this.getNextPanel()
      while (panel.rendered && this.visiblePanelsQueue.length) {
        panel = this.getNextPanel()
      }
      if (panel && !panel.rendered) {
        requestAnimationFrame(() => {
          this.showChart(panel.id)
        })
      }
    }
  }
}
