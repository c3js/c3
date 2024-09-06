import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import {
  ChartPanelData,
  ChartPanelEvent,
  ChartPanelOuterEvent,
  ChartWrapperType,
} from '@src/app/common/shared/components/chart-panel/chart-panel.types'
import { debounceTime, Subject } from 'rxjs'
import { BarChartDataSet, ChartSize, CheckDomainPredicate } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import { SubscriptionHandler } from '@src/app/common/utils/subscription-handler'
import { DataPoint, Domain } from 'c3'
import { MIN_DOMAIN_RANGE } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper-base.consts'
import { customPointsHandler } from '@src/app/common/utils/custom-points.helper'
import { DEBOUNCE_TIME_SMALL } from '@src/app/common/constants/constants'
import { ResizeEvent } from 'angular-resizable-element-labworks'
import { ResizeVHandleComponent } from '@src/app/common/shared/components/resize-handle/resize-v-handle.component'

@Component({
  selector: 'lw-chart-panel',
  templateUrl: './chart-panel.component.html',
  styleUrls: ['./chart-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartPanelComponent extends SubscriptionHandler implements OnInit, OnDestroy {
  @Input() data: ChartPanelData
  @Input() eventBus: EventEmitter<ChartPanelEvent>
  @Input() scrollContainer: HTMLElement
  @Input() resizeHandle: ResizeVHandleComponent

  @Output() zoomEnd = new EventEmitter<Domain>()
  @Output() chartInitFinished = new EventEmitter<ChartPanelData>()
  @Output() visible = new EventEmitter<IntersectionObserverEntry>()
  @Output() resizeStart = new EventEmitter<ResizeEvent>()
  @Output() resizeEnd = new EventEmitter<ResizeEvent>()
  @Output() resizing = new EventEmitter<ResizeEvent>()

  @ViewChild('chartPanel', { static: true }) chartPanel: ElementRef<HTMLDivElement>

  ChartWrapperType = ChartWrapperType

  chartSize: ChartSize = {}

  isVisible = false

  lineDataSet: number[]
  barDataSet: BarChartDataSet

  private readonly minHeight = 150

  private resizeObserver: ResizeObserver
  private resizeSubject = new Subject<ChartSize>()
  private resize$ = this.resizeSubject.asObservable().pipe(debounceTime(DEBOUNCE_TIME_SMALL))

  customPointsHandler = customPointsHandler

  resizeInProgress = false

  getPanelHeight = (height: number) => {
    if (height < this.minHeight) {
      return this.minHeight
    }
    return height
  }

  constructor(private cdr: ChangeDetectorRef) {
    super()
  }
  ngOnInit(): void {
    this.createResizeObserver()
    this.setupEventBusListeners()
    if (this.data.chartType === ChartWrapperType.LINE) {
      this.lineDataSet = this.data.dataSet as number[]
    } else {
      this.barDataSet = this.data.dataSet as BarChartDataSet
    }
    this.chartSize = {
      height: this.getPanelHeight(this.data.panelHeight),
      width: this.chartPanel.nativeElement.offsetWidth,
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy()
    this.destroyResizeObserver()
  }

  isLineDomainCorrect: CheckDomainPredicate = (domain: Domain) => {
    return !(Math.abs(domain[0] - domain[1]) <= MIN_DOMAIN_RANGE)
  }

  isBarDomainCorrect: CheckDomainPredicate = (domain: Domain) => {
    return true
  }

  validateResize(): (resizeEvent: ResizeEvent) => boolean {
    return (resizeEvent: ResizeEvent) => {
      return this.data.panelHeight + (resizeEvent.edges.bottom as number) >= this.minHeight
    }
  }

  onResizeStart(event?: ResizeEvent): void {
    if (this.resizeInProgress) {
      return
    }
    this.resizeInProgress = true
    this.resizeStart.emit(event)
  }

  onResizing(event?: ResizeEvent): void {
    if (!this.resizeInProgress) {
      return
    }
    this.resizing.emit(event)
  }

  onResizeEnd(event?: ResizeEvent): void {
    if (!this.resizeInProgress) {
      return
    }
    this.resizeInProgress = false
    this.resizeHandle.visibility = 'hidden'
    this.data.panelHeight += event.edges.bottom as number
    this.resizeEnd.emit(event)
  }

  private createResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      this.resizeSubject.next({
        height: entries?.[0]?.contentRect.height,
        width: entries?.[0].contentRect.width,
      })
    })
    this.resizeObserver.observe(this.chartPanel.nativeElement)
  }

  private destroyResizeObserver(): void {
    this.resizeObserver.unobserve(this.chartPanel.nativeElement)
    this.resizeObserver = null
  }

  private setupEventBusListeners(): void {
    this.subscriptions.push(
      this.eventBus?.subscribe((event: ChartPanelEvent) => {
        this.processEvent(event)
      })
    )
    this.subscriptions.push(
      this.resize$.subscribe((size: ChartSize) => {
        this.processResize(size)
      })
    )
  }

  private processEvent(event: ChartPanelEvent): void {
    const { type, id, payload } = event
    if (this.data.id !== id) {
      return
    }
    switch (event?.type) {
      case ChartPanelOuterEvent.SHOW_CHART:
        this.isVisible = true
        this.cdr.markForCheck()
        break
      case ChartPanelOuterEvent.HIDE_CHART:
        this.isVisible = false
        this.cdr.markForCheck()
        break
    }
  }

  private processResize(size: ChartSize): void {
    this.chartSize = this.calcChartSize(size)
    this.cdr.markForCheck()
  }

  private calcChartSize(size: ChartSize): ChartSize {
    // TODO: implement calculation logic
    return { ...size }
  }
}
