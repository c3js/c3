import { Component, ElementRef, ViewChild } from '@angular/core'
import { BarChartWrapperComponent } from '@src/app/common/shared/components/bar-chart-wrapper/bar-chart-wrapper.component'
import { Domain } from 'c3'
import { debounceTime, fromEvent } from 'rxjs'
import { DEBOUNCE_TIME_SMALL } from '@src/app/common/constants/constants'
import {
  BarChartDataSet,
  ChartSize,
  CheckDomainPredicate,
  GridLine,
} from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'

@Component({
  selector: 'lw-bar-chart-sandbox',
  templateUrl: './bar-chart-sandbox.component.html',
  styleUrls: ['./bar-chart-sandbox.component.less'],
})
export class BarChartSandboxComponent {
  dataSet: BarChartDataSet = []
  chartSize: ChartSize = { height: 420 }
  num = 0

  initialDataSet = [
    { x: 5, y: null, xTick: 5, ndcValue: 3 },
    { x: 10, y: 4, xTick: 10, ndcValue: 5 },
    { x: 15, y: 5, xTick: 15, ndcValue: 7 },
    { x: 20, y: 60, xTick: 20, ndcValue: 15 },
    { x: 25, y: 80, xTick: 25, ndcValue: 70 },
    { x: 30, y: 70, xTick: 30, ndcValue: 15 },
    { x: 35, y: 60, xTick: 35, ndcValue: 10 },
    { x: 40, y: 25, xTick: 40, ndcValue: 7 },
    { x: 45, y: 5, xTick: 45, ndcValue: 5 },
    { x: 50, y: null, xTick: 50, ndcValue: 5 },
    { x: 55, y: null, xTick: 55, ndcValue: 5 },
  ]

  initialGridLines: GridLine[] = [
    { value: 7, text: 'LCL', class: 'custom-dotted-line', color: '#BA191C' },
    { value: 27, text: 'CL', class: 'custom-dotted-line', color: '#00AD1D' },
    { value: 47, text: 'UCL', class: 'custom-dotted-line', color: '#BA191C' },
  ]

  xGridLines: GridLine[] = []

  @ViewChild('chartWrapper', { read: BarChartWrapperComponent }) chartWrapper: BarChartWrapperComponent
  @ViewChild('chartsContainer', { read: ElementRef }) chartsContainer: ElementRef<HTMLDivElement>

  constructor() {
    fromEvent(window, 'resize')
      .pipe(debounceTime(DEBOUNCE_TIME_SMALL))
      .subscribe(() => {
        this.windowResize()
      })

    this.dataSet = this.initialDataSet
    this.xGridLines = this.initialGridLines
  }

  isDomainCorrect: CheckDomainPredicate = (domain: Domain) => {
    return true
  }

  zoomIn(): void {
    this.chartWrapper.zoomStep('in')
  }

  zoomOut(): void {
    this.chartWrapper.zoomStep('out')
  }

  zoomReset(): void {
    this.chartWrapper.resetZoom()
  }

  newData() {
    const configs = [
      {
        dataSet: [
          { x: 5, y: 10, xTick: 5, ndcValue: 5 },
          { x: 10, y: 10, xTick: 10, ndcValue: 7 },
          { x: 15, y: 50, xTick: 15, ndcValue: 55 },
          { x: 20, y: 60, xTick: 20, ndcValue: 7 },
          { x: 25, y: null, xTick: 25, ndcValue: 1 },
          { x: 30, y: 15.5, xTick: 30, ndcValue: 1 },
          { x: 35, y: null, xTick: 35, ndcValue: 1 },
        ],
        lines: [
          { value: 7, text: 'LCL', class: 'custom-dotted-line', color: '#BA191C' },
          { value: 15, text: 'CL', class: 'custom-dotted-line', color: '#00AD1D' },
          { value: 25, text: 'UCL', class: 'custom-dotted-line', color: '#BA191C' },
        ],
      },
      {
        dataSet: [
          { x: 5, y: 1, xTick: 5, ndcValue: 5 },
          { x: 10, y: 1, xTick: 10, ndcValue: 7 },
          { x: 15, y: 5, xTick: 15, ndcValue: 12 },
          { x: 20, y: 60, xTick: 20, ndcValue: 23 },
          { x: 25, y: null, xTick: 25, ndcValue: 30 },
          { x: 30, y: 70, xTick: 30, ndcValue: 32 },
          { x: 35, y: null, xTick: 35, ndcValue: 30 },
          { x: 40, y: null, xTick: 40, ndcValue: 23 },
          { x: 45, y: null, xTick: 45, ndcValue: 12 },
          { x: 50, y: null, xTick: 50, ndcValue: 7 },
          { x: 55, y: null, xTick: 55, ndcValue: 5 },
          { x: 60, y: 80, xTick: 60, ndcValue: 1 },
          { x: 65, y: 90, xTick: 65, ndcValue: 1 },
          { x: 70, y: null, xTick: 70, ndcValue: 1 },
        ],
        lines: [
          { value: 10, text: 'LCL', class: 'custom-dotted-line', color: '#BA191C' },
          { value: 35, text: 'CL', class: 'custom-dotted-line', color: '#00AD1D' },
          { value: 60, text: 'UCL', class: 'custom-dotted-line', color: '#BA191C' },
        ],
      },
      {
        dataSet: [
          { x: 1.5, y: 1, xTick: 1.5, ndcValue: 5 },
          { x: 2.5, y: 1, xTick: 2.5, ndcValue: 7 },
          { x: 3.5, y: 5, xTick: 3.5, ndcValue: 12 },
          { x: 4.5, y: 60, xTick: 4.5, ndcValue: 23 },
          { x: 5.5, y: null, xTick: 5.5, ndcValue: 30 },
          { x: 6.5, y: 70, xTick: 6.5, ndcValue: 32 },
          { x: 7.5, y: null, xTick: 7.5, ndcValue: 30 },
          { x: 8.5, y: null, xTick: 8.5, ndcValue: 23 },
          { x: 9.5, y: null, xTick: 9.5, ndcValue: 12 },
          { x: 10.5, y: null, xTick: 10.5, ndcValue: 7 },
          { x: 11.5, y: null, xTick: 11.5, ndcValue: 5 },
          { x: 12.5, y: 80, xTick: 12.5, ndcValue: 1 },
        ],
        lines: [
          { value: 2.5, text: 'LCL', class: 'custom-dotted-line', color: '#BA191C' },
          { value: 6.8, text: 'CL', class: 'custom-dotted-line', color: '#00AD1D' },
          { value: 11.3, text: 'UCL', class: 'custom-dotted-line', color: '#BA191C' },
        ],
      },
      {
        dataSet: this.initialDataSet,
        lines: this.initialGridLines,
      },
    ]
    if (this.num >= configs.length) {
      this.num = 0
    }
    this.dataSet = configs[this.num].dataSet
    this.xGridLines = configs[this.num].lines
    this.num++
  }

  protected windowResize(): void {
    this.adjustChartWidth()
  }

  protected adjustChartWidth(): void {
    const width = this.chartsContainer.nativeElement.offsetWidth
    this.chartSize = { ...this.chartSize, width }
  }
}
