import { ChangeDetectorRef, Component } from '@angular/core'
import { ResizeEvent } from 'angular-resizable-element-labworks'
import { ChartPanelData } from '@src/app/common/shared/components/chart-panel/chart-panel.types'
import { getRandomInt } from '@src/app/common/utils/helpers'

@Component({
  selector: 'lw-chart-list-sandbox',
  templateUrl: './chart-list-sandbox.component.html',
  styleUrls: ['./chart-list-sandbox.component.less'],
})
export class ChartListSandboxComponent {
  readonly minHeight = 100
  readonly defaultHeight = 150

  panels: ChartPanelData[] = Array(20)
    .fill(0)
    .map((_, idx) => ({ id: idx, height: getRandomInt(100, 300) }))

  visiblePanels: ChartPanelData[] = []

  visibleTrackOptions: IntersectionObserverInit = { threshold: [0, 1], rootMargin: '0px 0px 0px 0px' }

  constructor(private changeDetection: ChangeDetectorRef) {}

  trackItem = (index: number, panel: ChartPanelData) => {
    return panel.id
  }

  validateResize(panel: ChartPanelData): (resizeEvent: ResizeEvent) => boolean {
    return (resizeEvent: ResizeEvent) => {
      return panel.height + (resizeEvent.edges.bottom as number) >= this.minHeight
    }
  }

  onResizeStart(event?: ResizeEvent): void {}

  onResizeEnd(index: number, event?: ResizeEvent): void {
    const item = this.panels[index]
    item.height += event.edges.bottom as number
  }

  onResizing(event?: ResizeEvent): void {}

  onVisibleChange(panel: ChartPanelData, observerEntry: IntersectionObserverEntry) {
    panel.isVisible = observerEntry.isIntersecting
    this.updateVisibleItems()
  }

  updateVisibleItems(): void {
    this.visiblePanels = this.panels.filter((panel) => panel.isVisible)
    this.changeDetection.markForCheck()
  }
}
