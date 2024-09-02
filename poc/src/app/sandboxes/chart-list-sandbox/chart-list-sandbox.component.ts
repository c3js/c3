import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit } from '@angular/core'
import { ResizeEvent } from 'angular-resizable-element-labworks'
import { ChartPanelData, ChartPanelEvent, ChartPanelOuterEvent } from '@src/app/common/shared/components/chart-panel/chart-panel.types'
import { generateCustomPoints, generateDataset, generateSelectedPoints, getRandomInt } from '@src/app/common/utils/helpers'
import { debounceTime, Subject } from 'rxjs'
import { SubscriptionHandler } from '@src/app/common/utils/subscription-handler'
import { DEBOUNCE_TIME_DEFAULT } from '@src/app/common/constants/constants'
import { GridLine } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import { Domain } from 'c3'

@Component({
  selector: 'lw-chart-list-sandbox',
  templateUrl: './chart-list-sandbox.component.html',
  styleUrls: ['./chart-list-sandbox.component.less'],
})
export class ChartListSandboxComponent extends SubscriptionHandler implements OnInit, AfterViewInit {
  readonly minHeight = 100
  readonly pCount = 50
  readonly minVal = 50
  readonly maxVal = 1000
  readonly chartsCount = 100

  eventBus = new EventEmitter<ChartPanelEvent>()

  visibility$ = new Subject<void>()

  panels: ChartPanelData[] = Array(this.chartsCount)
    .fill(0)
    .map((_, idx) => ({
      id: idx,
      height: getRandomInt(100, 300),
      disabled: false,
      dataSet: generateDataset(this.minVal, this.maxVal, this.pCount),
      selectedPoints: generateSelectedPoints(this.pCount),
      customPoints: generateCustomPoints(this.pCount),
      yGridLines: this.generateYLines(),
    }))

  visiblePanels: ChartPanelData[] = []

  visibleTrackOptions: IntersectionObserverInit = { threshold: [0, 1], rootMargin: '0px 0px 0px 0px' }

  constructor(private changeDetection: ChangeDetectorRef) {
    super()
  }

  ngOnInit(): void {
    this.initSubscriptions()
  }

  ngAfterViewInit(): void {}

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
    console.log('onVisibleChange', observerEntry)
    panel.isVisible = observerEntry.isIntersecting
    this.updateVisibleItems()
    this.visibility$.next()
  }

  onZoomEnd(panel: ChartPanelData, domain: Domain): void {
    panel.domain = domain
  }

  private updateVisibleItems(): void {
    this.visiblePanels = this.panels.filter((panel) => panel.isVisible)
    this.changeDetection.markForCheck()
  }

  private initSubscriptions(): void {
    this.subscriptions.push(
      this.visibility$.pipe(debounceTime(DEBOUNCE_TIME_DEFAULT)).subscribe(() => {
        this.panels.forEach((panel) => {
          this.eventBus.emit({
            type: panel.isVisible ? ChartPanelOuterEvent.SHOW_CHART : ChartPanelOuterEvent.HIDE_CHART,
            panelId: panel.id,
          })
        })
      })
    )
  }

  private generateYLines(): GridLine[] {
    return [
      { value: getRandomInt(this.minVal, this.maxVal + 200), text: 'LSL', class: 'custom-dotted-line', color: '#ED2024' },
      { value: getRandomInt(this.minVal, this.maxVal + 200), text: 'LWL', class: 'custom-dotted-line', color: '#FF9900' },
      { value: getRandomInt(this.minVal, this.maxVal + 200), text: 'LCL', class: 'custom-dotted-line', color: '#BA191C' },
      { value: getRandomInt(this.minVal, this.maxVal + 200), text: 'Target', class: 'custom-dotted-line', color: '#00AD1D' },
      { value: getRandomInt(this.minVal, this.maxVal + 200), text: 'CL', class: 'custom-dotted-line', color: '#007A14' },
      { value: getRandomInt(this.minVal, this.maxVal + 200), text: 'UWL', class: 'custom-dotted-line', color: '#FF9900' },
      { value: getRandomInt(this.minVal, this.maxVal + 200), text: 'UCL', class: 'custom-dotted-line', color: '#BA191C' },
    ]
  }
}
