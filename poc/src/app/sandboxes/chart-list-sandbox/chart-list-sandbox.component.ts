import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core'
import { ResizeEvent } from 'angular-resizable-element-labworks'
import {
  ChartId,
  ChartPanelData,
  ChartPanelEvent,
  ChartPanelOuterEvent,
} from '@src/app/common/shared/components/chart-panel/chart-panel.types'
import { generateCustomPoints, generateDataset, generateSelectedPoints, getRandomInt, wait } from '@src/app/common/utils/helpers'
import { fromEvent, Observable, Subject } from 'rxjs'
import { SubscriptionHandler } from '@src/app/common/utils/subscription-handler'
import { GridLine } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import { Domain } from 'c3'
import { ChartPanelTrackingService } from '@src/app/common/shared/services/chart-panel-tracking.service'
import { ResizeVHandleComponent } from '@src/app/common/shared/components/resize-handle/resize-v-handle.component'

@Component({
  selector: 'lw-chart-list-sandbox',
  templateUrl: './chart-list-sandbox.component.html',
  styleUrls: ['./chart-list-sandbox.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ChartPanelTrackingService],
})
export class ChartListSandboxComponent extends SubscriptionHandler implements OnInit, AfterViewInit {
  readonly minHeight = 100
  readonly pCount = 50
  readonly minVal = 50
  readonly maxVal = 1000
  readonly chartsCount = 100
  getInitialChartPanelHeight = () => getRandomInt(100, 450)

  eventBus = new EventEmitter<ChartPanelEvent>()

  private visibility$ = new Subject<{ id: ChartId; isVisible: boolean }>()
  private chartInitFinished$ = new Subject<ChartId>()
  resizeInProgress = false

  @ViewChild('chartList', { static: true }) chartList: ElementRef<HTMLDivElement>
  @ViewChild(ResizeVHandleComponent) resizeHandle: ResizeVHandleComponent

  panels: ChartPanelData[] = Array(this.chartsCount)
    .fill(0)
    .map((_, idx) => ({
      id: idx,
      height: this.getInitialChartPanelHeight(),
      disabled: false,
      dataSet: generateDataset(this.minVal, this.maxVal, this.pCount),
      selectedPoints: generateSelectedPoints(this.pCount),
      customPoints: generateCustomPoints(this.pCount),
      yGridLines: this.generateYLines(),
      isVisible: true,
    }))

  visiblePanels: ChartPanelData[] = []

  visibleTrackOptions: IntersectionObserverInit = { threshold: [0, 1], rootMargin: '0px 0px 0px 0px' }

  constructor(
    private changeDetection: ChangeDetectorRef,
    private chartPanelTrackingService: ChartPanelTrackingService
  ) {
    super()
  }

  ngOnInit(): void {
    this.chartPanelTrackingService.init({
      panels: this.panels,
      visibility$: this.visibility$,
      chartInitFinished$: this.chartInitFinished$,
      containerScroll$: fromEvent(this.chartList.nativeElement, 'scroll'),
      hideChart: (id: ChartId) => {
        this.eventBus.emit({ type: ChartPanelOuterEvent.HIDE_CHART, id })
      },
      showChart: (id: ChartId) => {
        this.eventBus.emit({ type: ChartPanelOuterEvent.SHOW_CHART, id })
      },
    })
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

  onResizeStart(event?: ResizeEvent): void {
    if (this.resizeInProgress) {
      return
    }
    this.resizeInProgress = true
    this.resizeHandle.top = `${event.rectangle.bottom}px`
    this.resizeHandle.visibility = 'visible'
  }

  onResizing(event?: ResizeEvent): void {
    if (!this.resizeInProgress) {
      return
    }
    this.resizeHandle.top = `${event.rectangle.bottom}px`
  }

  onResizeEnd(index: number, event?: ResizeEvent): void {
    if (!this.resizeInProgress) {
      return
    }
    this.resizeInProgress = false
    this.resizeHandle.visibility = 'hidden'
    const item = this.panels[index]
    item.height += event.edges.bottom as number
  }

  onVisibleChange(panel: ChartPanelData, observerEntry: IntersectionObserverEntry) {
    panel.isVisible = observerEntry.isIntersecting
    this.updateVisibleItems()
    this.visibility$.next({ id: panel.id, isVisible: panel.isVisible })
  }

  onZoomEnd(panel: ChartPanelData, domain: Domain): void {
    panel.domain = domain
  }

  private updateVisibleItems(): void {
    this.visiblePanels = this.panels.filter((panel) => panel.isVisible)
    this.changeDetection.markForCheck()
  }

  onChartInitFinished(panel: ChartPanelData) {
    this.chartInitFinished$.next(panel.id)
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
