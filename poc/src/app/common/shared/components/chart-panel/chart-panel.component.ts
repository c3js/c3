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
import {
  BarChartDataSet,
  ChartSize,
  CheckDomainPredicate,
  CustomPointContext,
  CustomPointsHandler,
} from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import { SubscriptionHandler } from '@src/app/common/utils/subscription-handler'
import { DataPoint, Domain } from 'c3'
import { MIN_DOMAIN_RANGE } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper-base.consts'
import { customPointsHandler } from '@src/app/common/utils/custom-points.helper'
import { DEBOUNCE_TIME_SMALL } from '@src/app/common/constants/constants'

@Component({
  selector: 'lw-chart-panel',
  templateUrl: './chart-panel.component.html',
  styleUrls: ['./chart-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartPanelComponent extends SubscriptionHandler implements OnInit, OnDestroy {
  @Input() data: ChartPanelData
  @Input() eventBus: EventEmitter<ChartPanelEvent>

  @Output() zoomEnd = new EventEmitter<Domain>()
  @Output() chartInitFinished = new EventEmitter<ChartPanelData>()

  @ViewChild('chartPanel', { static: true }) chartPanel: ElementRef<HTMLDivElement>

  ChartWrapperType = ChartWrapperType

  chartSize: ChartSize = {}

  isVisible = false

  lineDataSet: number[]
  barDataSet: BarChartDataSet

  private resizeObserver: ResizeObserver
  private resizeSubject = new Subject<ChartSize>()
  private resize$ = this.resizeSubject.asObservable().pipe(debounceTime(DEBOUNCE_TIME_SMALL))

  customPointsHandler = customPointsHandler

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
      height: this.chartPanel.nativeElement.offsetHeight,
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
