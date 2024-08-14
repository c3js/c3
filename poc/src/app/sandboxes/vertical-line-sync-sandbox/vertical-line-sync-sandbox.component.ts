import { Component, ViewChild } from '@angular/core'
import { ChartSize } from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.types'
import { ChartWrapperComponent } from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.component'
import { getRandomArbitrary } from '@src/app/common/utils/helpers'
import { DataPoint, Domain } from 'c3'

@Component({
  selector: 'lw-vertical-line-sync-sandbox',
  templateUrl: './vertical-line-sync-sandbox.component.html',
  styleUrls: ['./vertical-line-sync-sandbox.component.less'],
})
export class VerticalLineSyncSandboxComponent {
  pCount = 100
  dataSet1 = [
    ...Array(this.pCount)
      .fill(0)
      .map((v, i) => getRandomArbitrary(10, 1000)),
  ]
  dataSet2 = [
    ...Array(this.pCount)
      .fill(0)
      .map((v, i) => getRandomArbitrary(10, 1000)),
  ]
  chartSize: ChartSize = { height: 420 }

  private masterChart: ChartWrapperComponent = null

  @ViewChild('chartWrapperTop', { read: ChartWrapperComponent }) chartWrapperTop: ChartWrapperComponent
  @ViewChild('chartWrapperBottom', { read: ChartWrapperComponent }) chartWrapperBottom: ChartWrapperComponent

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

  private zoomChart = (chartWrapper: ChartWrapperComponent, domain: number[]) => {
    chartWrapper.chart.getInstance().zoom(domain)
  }

  private xFocusShow(chartWrapper: ChartWrapperComponent, d: DataPoint): void {
    chartWrapper?.chart.getInstance().xgrids([{ value: d.x }])
  }

  private xFocusHide(chartWrapper: ChartWrapperComponent): void {
    chartWrapper?.chart.getInstance().xgrids.remove()
  }
}
