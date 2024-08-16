import { Component, ElementRef, ViewChild } from '@angular/core'
import {
  ChartSize,
  CheckDomainPredicate,
  CustomPoint,
  CustomPointContext,
  CustomPointsHandler,
  GridLine,
  SelectedPoint,
} from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.types'
import { ChartWrapperComponent } from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.component'
import { getRandomArbitrary, getRandomColor, getRandomInt } from '@src/app/common/utils/helpers'
import { DataPoint, Domain } from 'c3'
import { MIN_DOMAIN_RANGE } from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.consts'
import { CustomPointsHelper, CustomPointTag } from '@src/app/sandboxes/select-points-sandbox/custom-points.helper'
import { DEBOUNCE_TIME_SMALL } from '@src/app/common/constants/constants'
// import debounce from 'lodash/debounce'
import { debounce, debounceTime, fromEvent } from 'rxjs'

@Component({
  selector: 'lw-vertical-line-sync-sandbox',
  templateUrl: './vertical-line-sync-sandbox.component.html',
  styleUrls: ['./vertical-line-sync-sandbox.component.less'],
})
export class VerticalLineSyncSandboxComponent {
  pCount = 100
  dataSetTop = [
    ...Array(this.pCount)
      .fill(0)
      .map((v, i) => getRandomArbitrary(10, 1000)),
  ]
  dataSetBottom = [
    ...Array(this.pCount)
      .fill(0)
      .map((v, i) => getRandomArbitrary(10, 1000)),
  ]
  chartSize: ChartSize = { height: 420 }

  private masterChart: ChartWrapperComponent = null

  yGridLines: GridLine[] = [
    { value: 100, text: 'LSL', class: 'custom-dotted-line', color: '#ED2024' },
    { value: 200, text: 'LWL', class: 'custom-dotted-line', color: '#FF9900' },
    { value: 300, text: 'LCL', class: 'custom-dotted-line', color: '#BA191C' },
    { value: 500, text: 'Target', class: 'custom-dotted-line', color: '#00AD1D' },
    { value: 600, text: 'CL', class: 'custom-dotted-line', color: '#007A14' },
    { value: 700, text: 'UWL', class: 'custom-dotted-line', color: '#FF9900' },
    { value: 800, text: 'UCL', class: 'custom-dotted-line', color: '#BA191C' },
  ]
  yGridLinesTopLimitEnabled = true

  selectedPoints: SelectedPoint[] = []

  customPoints: CustomPoint[] = []

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

  @ViewChild('chartWrapperTop', { read: ChartWrapperComponent }) chartWrapperTop: ChartWrapperComponent
  @ViewChild('chartWrapperBottom', { read: ChartWrapperComponent }) chartWrapperBottom: ChartWrapperComponent
  @ViewChild('chartsContainer', { read: ElementRef }) chartsContainer: ElementRef<HTMLDivElement>

  constructor() {
    fromEvent(window, 'resize')
      .pipe(debounceTime(DEBOUNCE_TIME_SMALL))
      .subscribe(() => {
        this.windowResize()
      })
  }

  isDomainCorrect: CheckDomainPredicate = (domain: Domain) => {
    return !(Math.abs(domain[0] - domain[1]) <= MIN_DOMAIN_RANGE)
  }

  onShowXGridFocusTop(d: DataPoint): void {
    this.xFocusShow(this.chartWrapperBottom, d)
  }

  onHideXGridFocusTop(): void {
    this.xFocusHide(this.chartWrapperBottom)
  }

  onShowXGridFocusBottom(d: DataPoint): void {
    this.xFocusShow(this.chartWrapperTop, d)
  }

  onHideXGridFocusBottom(): void {
    this.xFocusHide(this.chartWrapperTop)
  }

  onZoomStartTop(): void {
    this.masterChart = this.chartWrapperTop
  }

  onZoomEndTop(domain: Domain): void {
    if (this.masterChart === this.chartWrapperTop) {
      this.zoomChart(this.chartWrapperBottom, domain)
    }
  }

  onZoomTop(domain: Domain): void {
    if (this.masterChart === this.chartWrapperTop) {
      this.zoomChart(this.chartWrapperBottom, domain)
    }
  }

  onZoomStartBottom(): void {
    this.masterChart = this.chartWrapperBottom
  }

  onZoomEndBottom(domain: Domain): void {
    if (this.masterChart === this.chartWrapperBottom) {
      this.zoomChart(this.chartWrapperTop, domain)
    }
  }

  onZoomBottom(domain: Domain): void {
    if (this.masterChart === this.chartWrapperBottom) {
      this.zoomChart(this.chartWrapperTop, domain)
    }
  }

  zoomIn(): void {
    this.masterChart = this.chartWrapperTop
    this.chartWrapperTop.zoomStep('in')
  }

  zoomOut(): void {
    this.masterChart = this.chartWrapperTop
    this.chartWrapperTop.zoomStep('out')
  }

  zoomReset(): void {
    this.masterChart = this.chartWrapperTop
    this.chartWrapperTop.resetZoom()
  }

  addCustomPoints(): void {
    const tags = Object.values(CustomPointTag)
    this.customPoints = Array(getRandomInt(0, this.pCount - 1))
      .fill(0)
      .map(() => ({ index: getRandomInt(0, this.pCount - 1), tag: tags[getRandomInt(0, 3)] }))
  }

  clearCustomPoints(): void {
    this.customPoints = []
  }

  addSelectedPoints(): void {
    this.selectedPoints = Array(getRandomInt(0, this.pCount - 1))
      .fill(0)
      .map(() => ({ index: getRandomInt(0, this.pCount - 1), color: getRandomColor() }))
  }

  clearSelectedPoints(): void {
    this.selectedPoints = []
  }

  protected zoomChart = (chartWrapper: ChartWrapperComponent, domain: number[]) => {
    chartWrapper.chart.getInstance().zoom(domain)
  }

  protected xFocusShow(chartWrapper: ChartWrapperComponent, d: DataPoint): void {
    chartWrapper?.chart.getInstance().xgrids([{ value: d.x }])
  }

  protected xFocusHide(chartWrapper: ChartWrapperComponent): void {
    chartWrapper?.chart.getInstance().xgrids.remove()
  }

  protected windowResize(): void {
    this.adjustChartWidth()
  }

  protected adjustChartWidth(): void {
    const width = this.chartsContainer.nativeElement.offsetWidth
    this.chartSize = { ...this.chartSize, width }
  }
}
