import { AfterViewInit, Component, ElementRef, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core'
import c3 from '@src/app/c3/src/index.js'
import { ChartComponent } from '@src/app/common/shared/components/chart/chart.component'
import { SubscriptionHandler } from '@src/app/common/utils/subscription-handler'
import { waitBlock, WaitBlock } from '@src/app/common/utils/helpers'
import { DEBOUNCE_TIME_SMALL } from '@src/app/common/constants/constants'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import { DataPoint, Domain } from 'c3'

@Component({
  selector: 'lw-chart-poc-story',
  templateUrl: './chart-poc-story.component.html',
  styleUrls: ['./chart-poc-story.component.less'],
})
export class ChartPocStoryComponent extends SubscriptionHandler implements AfterViewInit {
  params1: any
  params2: any

  chart1: ChartComponent
  chart2: ChartComponent

  chart1Id = 'chart1'
  chart2Id = 'chart2'

  @ViewChildren(ChartComponent) private charts: QueryList<ChartComponent> = null
  @ViewChild('chartContainer1', { read: ViewContainerRef }) chartContainer1Ref: ViewContainerRef
  @ViewChild('chartContainer2', { read: ViewContainerRef }) chartContainer2Ref: ViewContainerRef
  @ViewChild('chartContent', { read: TemplateRef }) chartContentRef: TemplateRef<any>

  zoomEnabled = true
  dragZoomEnabled = false

  domain: Domain
  selectedPoints: DataPoint[] = []

  lastSelectedPoint: DataPoint | null = null

  minX = 5
  maxX = 50
  minY = 50000
  maxY = 90000
  chart1Height = 420
  chart2Height = 450
  barWidth = 10

  pCount = 100

  smoothZoomThreshold = 100
  throttleZoomThreshold = 300

  data = [
    ['data1', 30, 500, 200, 100, 400, 150, 250],
    ['data2', 350, 200, 100, 400, 150, 250],
    ['data3', null, null, 10, 40, null, null],
    ['data4', 100, 200, 100, 400, 150, 250],
  ]

  waitChart1Create: WaitBlock
  waitChart1Zoom: WaitBlock

  masterChart = ''

  zoomChartThrottled = null
  zoomChartDebounced = null

  constructor() {
    super()
    //@ts-ignore
    window.X = this
    this.params1 = {
      oninit: () => {
        this.waitChart1Create?.wakeUp()
      },
      bindto: '#chart1',
      size: {
        height: this.chart1Height,
      },
      data: {
        x: 'x',
        columns: [
          [
            'x',
            ...Array(this.pCount)
              .fill(0)
              .map((v, i) => i * 10),
          ],
          [
            'data1',
            ...Array(this.pCount)
              .fill(0)
              .map((v, i) => this.getRandomArbitrary(10, 10000)),
          ],
          ['data2', 3500, 2000, 1000, 4000, 1500, 2500],
          ['data3', null, null, 100, 400, null, null],
          ['data4', 1000, 2000, 1000, 4000, 1500, 2500],
          ['data5', 300, 5000, 2000, 1000, 4000, 1500, 2500],
        ],
        types: {
          data2: 'spline',
          data4: 'bar',
        },
        colors: {
          data4: '#a3d3f1',
        },
        onmouseover: (d: DataPoint, element?: SVGElement) => {
          this.syncVLine(d)
        },
        onmouseout: (d: DataPoint, element?: SVGElement) => {
          this.removeVLine(d)
        },
        onclick: (d: DataPoint, element?: SVGElement) => {},
        onselected: (d: DataPoint, element?: SVGElement) => {
          this.selectPointChart(d)
        },
        onunselected: (d: DataPoint, element?: SVGElement) => {
          this.unselectPointChart(d)
        },
        selection: {
          enabled: true,
        },
      },
      bar: {
        width: this.barWidth,
      },
      zoom: {
        enabled: true,
        rescale: true,
        onzoomstart: (event) => {
          this.masterChart = this.chart1Id
        },
        onzoomend: (domain: Domain) => {
          if (this.masterChart === this.chart1Id) {
            this._zoomChart(this.chart2, domain)
            this.domain = domain
          }
          this.waitChart1Zoom?.wakeUp()
        },
        onzoom: (domain: Domain) => {
          if (this.masterChart === this.chart1Id) {
            this.zoomChart(this.chart2, domain)
          }
        },
      },
      tooltip: {
        grouped: false,
        contents: (d, defaultTitleFormat, defaultValueFormat, color) => this.createTooltip(d),
      },
      onrendered: () => {
        this.addRectsToPoints(this.chart1?.chart, 'data1', [4, 5])
      },
      axis: {
        y: {
          padding: {
            bottom: 0,
          },
          min: 0,
        },
        x: {
          padding: {
            left: 1,
            right: 1,
          },
          tick: {
            count: this.pCount,
            format(x) {
              return ''
            },
          },
        },
      },
      legend: {
        show: false,
      },
      transition: {
        duration: 0, // Disable animation
      },
    }

    this.params2 = {
      bindto: '#chart2',
      size: {
        height: this.chart2Height,
      },
      data: {
        x: 'x',
        columns: [
          [
            'x',
            ...Array(this.pCount)
              .fill(0)
              .map((v, i) => i * 10),
          ],
          [
            'data1',
            ...Array(this.pCount)
              .fill(0)
              .map((v, i) => this.getRandomArbitrary(10, 1000)),
          ],
          ['data2', 350, 200, 100, 400, 150, 250],
          ['data3', null, null, 10, 40, null, null],
          ['data4', 100, 200, 100, 400, 150, 250],
          ['data5', null, null, 200, 100, 400, 150, null],
        ],
        types: {
          data2: 'spline',
          data4: 'bar',
          data5: 'area',
        },
        colors: {
          data4: '#a3d3f1',
        },
        selection: {
          enabled: true,
        },
      },
      bar: {
        width: this.barWidth,
      },
      zoom: {
        enabled: true,
        rescale: true,
        onzoomstart: (event) => {
          this.masterChart = this.chart2Id
        },
        onzoomend: (domain: Domain) => {
          if (this.masterChart === this.chart2Id) {
            this._zoomChart(this.chart1, domain)
            this.domain = domain
          }
        },
        onzoom: (domain: Domain) => {
          if (this.masterChart === this.chart2Id) {
            this.zoomChart(this.chart1, domain)
          }
        },
      },
      tooltip: {
        grouped: false,
        contents: (d, defaultTitleFormat, defaultValueFormat, color) => this.createTooltip(d),
      },
      onrendered: () => {
        this.addRectsToPoints(this.chart2?.chart, 'data3', [2, 3])
      },
      axis: {
        y: {
          padding: {
            bottom: 0,
          },
          min: 0,
          tick: {
            format: (v) => `\u00a0\u00a0${v}\u00a0`, // Width align. TODO: need to implement fixed width
          },
        },
        x: {
          padding: {
            left: 1,
            right: 1,
          },
          tick: {
            count: this.pCount,
            format(x) {
              return `Sample ${x}`
            },
            values: Array(this.pCount)
              .fill(0)
              .map((v, i) => i * 10)
              .map((v) => v),
            rotate: -90,
            multiline: true,
          },
        },
      },
      transition: {
        duration: 0, // Disable animation
      },
    }

    this.zoomChartThrottled = throttle(this._zoomChart, DEBOUNCE_TIME_SMALL * 2)
    this.zoomChartDebounced = debounce(this._zoomChart, DEBOUNCE_TIME_SMALL)
  }

  ngAfterViewInit(): void {
    this.initCharts()
    this.subscriptions.push(
      this.charts.changes.subscribe(() => {
        this.initCharts()
        this.refreshCharts()
      })
    )
    this.refreshCharts()
    this.toggleZoom()
  }

  private initCharts() {
    const charts = this.charts.toArray()
    this.chart1 = charts.find((chart) => chart.id === this.chart1Id)
    this.chart2 = charts.find((chart) => chart.id === this.chart2Id)
  }

  private refreshCharts() {
    this.updateXRange()
    this.updateYRange()
    this.updateSelectedPoints()
  }

  addRectsToPoints(chartRef: ElementRef, columnName: string, pointNums: number[] = []) {
    if (!chartRef) {
      return
    }
    const circlesContainer = chartRef.nativeElement.querySelector(`.c3-circles-${columnName}`)
    const circles = circlesContainer.querySelectorAll('.c3-circle')

    const rects = circlesContainer.querySelectorAll('.custom-point')
    rects.forEach((r) => {
      circlesContainer.removeChild(r)
    })

    circles.forEach((c, i) => {
      if (!pointNums.includes(i)) {
        return
      }
      const circleStyles = getComputedStyle(c)
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      // const rect = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const x = parseFloat(c.getAttribute('cx')) - 5
      const y = parseFloat(c.getAttribute('cy')) - 5
      rect.setAttribute('x', `${x}`)
      rect.setAttribute('y', `${y}`)
      rect.setAttribute('r', c.getAttribute('r'))
      rect.setAttribute('fill', circleStyles.fill)
      rect.setAttribute('class', 'custom-point custom-point--rect')
      rect.setAttribute('d', 'M61 66L45 83h130v18H44l17 17-13 13L9 92l39-39z')
      rect.style.opacity = circleStyles.opacity
      circlesContainer.appendChild(rect)
    })
  }

  async toggleZoom() {
    if (this.dragZoomEnabled) {
      this.dragZoomEnabled = false
      this.params1.zoom.enabled = true
      this.params1.zoom.type = 'scroll'
      this.recreateChart1()
      this.waitChart1Create = waitBlock(DEBOUNCE_TIME_SMALL)
      await this.waitChart1Create.wait
    }
    this.chart1?.getInstance().zoom.enable(this.zoomEnabled)
    this.chart1?.getInstance().flush()
    if (this.domain) {
      this.chart1?.getInstance().zoom(this.domain)
    }
  }

  async toggleDragZoom() {
    this.params1.zoom.enabled = true
    this.params1.zoom.type = 'scroll'
    if (this.zoomEnabled) {
      this.zoomEnabled = false
    }
    if (this.dragZoomEnabled) {
      this.params1.zoom.enabled = true
      this.params1.zoom.type = 'drag'
      this.recreateChart1()
      this.waitChart1Create = waitBlock(DEBOUNCE_TIME_SMALL)
      await this.waitChart1Create.wait
    } else {
      this.params1.zoom.enabled = true
      this.params1.zoom.type = 'scroll'
      this.recreateChart1()
      this.waitChart1Create = waitBlock(DEBOUNCE_TIME_SMALL)
      await this.waitChart1Create.wait
      await this.toggleZoom()
    }
    if (this.domain) {
      this.chart1?.getInstance().zoom(this.domain)
    }
  }

  async resetZoom() {
    this.chart1.getInstance().unzoom()
    this.chart1.getInstance().flush()
    this.domain = null
    this.recreateChart1()
    this.recreateChart2()
    this.waitChart1Create = waitBlock(DEBOUNCE_TIME_SMALL)
    await this.waitChart1Create.wait
    await this.toggleZoom()
  }

  async zoom(zoomType: 'in' | 'out'): Promise<void> {
    this.masterChart = this.chart1Id
    const zoomCoef = 0.85
    const point = this.lastSelectedPoint
    const domain = this.chart1?.getInstance().zoom()
    if (!point || domain?.length !== 2 || point.x < domain[0] || point.x > domain[1]) {
      return
    }
    let lPart = point.x - domain[0]
    let rPart = domain[1] - point.x
    if (zoomType === 'in') {
      lPart = lPart * zoomCoef
      rPart = rPart * zoomCoef
    } else {
      lPart = lPart / zoomCoef
      rPart = rPart / zoomCoef
    }
    const newDomain = [point.x - lPart, point.x + rPart]
    this._zoomChart(this.chart1, newDomain)
    this._zoomChart(this.chart2, newDomain)
    this.waitChart1Zoom = waitBlock(DEBOUNCE_TIME_SMALL)
    await this.waitChart1Zoom.wait
    const curDomain = this.chart1?.getInstance().zoom()
    if (curDomain[0] < 0) {
      this.resetZoom()
    }
  }

  syncVLine(d: DataPoint): void {
    this.chart2?.getInstance().xgrids([{ value: d.x }])
  }

  removeVLine(d: DataPoint): void {
    //@ts-ignore
    this.chart2?.getInstance().xgrids.remove([{ value: d.x }])
  }

  updateXRange(): void {
    const minX = this.minX / 10
    const maxX = this.maxX / 10
    const values = [
      { value: minX, text: 'minX', class: 'custom-line mix-x-line' },
      { value: maxX, text: 'maxX', class: 'custom-line max-x-line' },
    ]
    this.chart1?.getInstance().xgrids(values)
  }

  updateYRange(): void {
    const minY = this.minY / 10
    const maxY = this.maxY / 10
    const values = [
      { value: minY, text: 'minY', class: 'custom-line mix-y-line' },
      { value: maxY, text: 'maxY', class: 'custom-line max-y-line' },
    ]
    this.chart1?.getInstance().ygrids(values)
  }

  updateSelectedPoints(): void {
    this.selectedPoints.forEach((p) => {
      this.chart1?.getInstance().select([p.id], [p.index])
    })
  }

  selectPointChart(d: DataPoint): void {
    this.selectedPoints.push(d)
    //@ts-ignore
    this.chart2?.getInstance().select('data2', [d.index])
    this.lastSelectedPoint = d
  }

  unselectPointChart(d: DataPoint): void {
    this.selectedPoints = this.selectedPoints.filter((point) => !(point.id === d.id && point.index === d.index))
    //@ts-ignore
    this.chart2?.getInstance().unselect('data2', [d.index])
    if (d.id === this.lastSelectedPoint?.id && d.x === this.lastSelectedPoint.x) {
      this.lastSelectedPoint = null
    }
  }

  recreateChart1(): void {
    this.chart1 = null
    this.chartContainer1Ref.clear()
    this.chartContainer1Ref.createEmbeddedView(this.chartContentRef, { params: this.params1, id: this.chart1Id })
  }

  recreateChart2(): void {
    this.chart2 = null
    this.chartContainer2Ref.clear()
    this.chartContainer2Ref.createEmbeddedView(this.chartContentRef, { params: this.params2, id: this.chart2Id })
  }

  createTooltip(d: DataPoint[]): string {
    return `
<div class="chart-tooltip">
	<div class="chart-tooltip__header">A</div>
	<div class="chart-tooltip__sub-header">Individuals</div>
	<div class="chart-tooltip__sub-header">Descriptions:</div>
	<div class="chart-tooltip__item">ROW: 1</div>
	<div class="chart-tooltip__item">SAMPLE: ${d[0].x}</div>
	<div class="chart-tooltip__item">VALUE: ${d[0].value}</div>
</div>`
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min
  }

  getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  private _zoomChart = (chart: ChartComponent, domain: number[]) => {
    chart.getInstance().zoom(domain)
  }

  zoomChart(chart: ChartComponent, domain: number[]): void {
    if (this.pCount <= this.smoothZoomThreshold) {
      this._zoomChart(chart, domain)
    } else if (this.pCount > this.smoothZoomThreshold && this.pCount <= this.throttleZoomThreshold) {
      this.zoomChartThrottled(chart, domain)
    } else {
      this.zoomChartDebounced(chart, domain)
    }
  }
}
