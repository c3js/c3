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
import { ChartPanelData, ChartPanelEvent, ChartPanelOuterEvent } from '@src/app/common/shared/components/chart-panel/chart-panel.types'
import { Subject } from 'rxjs'
import {
  ChartSize,
  CheckDomainPredicate,
  CustomPoint,
  CustomPointContext,
  CustomPointsHandler,
} from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import { SubscriptionHandler } from '@src/app/common/utils/subscription-handler'
import { DataPoint, Domain } from 'c3'
import { MIN_DOMAIN_RANGE } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper-base.consts'
import { CustomPointsHelper } from '@src/app/common/utils/custom-points.helper'

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

  resizeObserver: ResizeObserver
  @ViewChild('chartPanel', { static: true }) chartPanel: ElementRef<HTMLDivElement>

  chartSize: ChartSize = {}

  isVisible = false

  private initComplete = new Subject<ChartPanelData>()

  initComplete$ = this.initComplete.asObservable()

  customPointsHandler: CustomPointsHandler = {
    append: (context: CustomPointContext) => {
      CustomPointsHelper[context.getTag()].append(context)
    },
    redraw: (context: CustomPointContext) => {
      const { selection, cx, cy, getTag } = context
      return selection
        .attr('x', (d: DataPoint) => {
          return CustomPointsHelper[context.getTag(d)].reCalcX(d, cx)
        })
        .attr('y', (d: DataPoint) => {
          return CustomPointsHelper[context.getTag(d)].reCalcY(d, cy)
        })
    },
    remove: (context: CustomPointContext) => {
      const { chartInternal, d, containerClass, customPointClass } = context
      chartInternal.main
        .select('.' + containerClass)
        .selectAll('.' + customPointClass)
        .remove()
    },
  }

  constructor(private cdr: ChangeDetectorRef) {
    super()
  }
  ngOnInit(): void {
    this.createResizeObserver()
    this.setupEventBusListeners()
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy()
    this.destroyResizeObserver()
  }

  isDomainCorrect: CheckDomainPredicate = (domain: Domain) => {
    return !(Math.abs(domain[0] - domain[1]) <= MIN_DOMAIN_RANGE)
  }

  private createResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      console.log('Panel resize', entries)
      this.chartSize = {
        height: entries?.[0]?.contentRect.height,
        width: entries?.[0].contentRect.width,
      }
      this.cdr.markForCheck()
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
  }

  private processEvent(event: ChartPanelEvent): void {
    const { type, panelId, payload } = event
    if (this.data.id !== panelId) {
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
}
