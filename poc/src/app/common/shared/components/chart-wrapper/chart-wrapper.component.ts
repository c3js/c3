import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core'
import { DataPoint, Domain, PrimitiveArray } from 'c3'
import {
  ChartSize,
  CheckDomainPredicate,
  CustomPoint,
  CustomPointContext,
  CustomPointsHandler,
  GridLine,
  SelectedPoint,
} from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.types'
import { ChartComponent } from '@src/app/common/shared/components/chart/chart.component'
import { arrayToObject } from '@src/app/common/utils/helpers'
import {
  MAIN_DATA_SET,
  POINT_R,
  SELECTED_POINT_R,
  TOP_LIMIT_DATA_SET,
} from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.consts'

@Component({
  selector: 'lw-chart-wrapper',
  templateUrl: './chart-wrapper.component.html',
  styleUrls: ['./chart-wrapper.component.less'],
})
export class ChartWrapperComponent implements OnInit, AfterViewInit, OnChanges {
  params: any

  @Input() chartId = 'chart'
  @Input() dataSet: PrimitiveArray
  @Input() useSelection = false
  @Input() yGridLines: GridLine[] = []
  @Input() selectedPoints: SelectedPoint[] = []
  @Input() size: ChartSize
  @Input() customPoints: CustomPoint[] = []
  @Input() customPointsHandler: CustomPointsHandler
  @Input() yGridLinesTopLimitEnabled = false
  @Input() hideXTicks = false
  @Input() isDomainCorrect?: CheckDomainPredicate

  @Output() showXGridFocus = new EventEmitter<DataPoint>()
  @Output() hideXGridFocus = new EventEmitter<void>()
  @Output() zoom = new EventEmitter<Domain>()
  @Output() zoomStart = new EventEmitter<void>()
  @Output() zoomEnd = new EventEmitter<Domain>()

  @ViewChild(ChartComponent) chart: ChartComponent

  customPointsMap: Record<number, CustomPoint> = {}

  currentDomain: Domain = null

  ngOnInit(): void {
    this.params = {
      bindto: `#${this.chartId}`,
      size: this.size,
      data: {
        columns: [[MAIN_DATA_SET, ...this.dataSet]],
        types: {
          data: 'area',
        },
        selection: {
          enabled: this.useSelection,
        },
      },
      zoom: {
        enabled: true,
        rescale: true,
        onzoom: (domain: Domain) => {
          this.onZoom(domain)
        },
        onzoomstart: () => {
          this.onZoomStart()
        },
        onzoomend: (domain: Domain) => {
          this.onZoomEnd(domain)
        },
      },
      legend: {
        show: false,
      },
      point: {
        r: POINT_R,
        select: {
          r: SELECTED_POINT_R,
        },
        focus: {
          expand: {
            enabled: false,
          },
        },
      },
      transition: {
        duration: 0, // Disable animation
      },
      axis: {
        x: {
          tick: {
            format: (x: number) => {
              return this.hideXTicks ? '' : x
            },
            values: Array(this.dataSet.length)
              .fill(0)
              .map((v, i) => i),
          },
        },
      },
      context: {
        isSelectByClickDisabled: (d: DataPoint) => {
          return d?.id === MAIN_DATA_SET
        },
        isHideXLabelIfNotVisibleDisabled: (id: string) => {
          // TODO: add chart types in which we could disable this functionality
          return false
        },
        isMouseOverDisabled: (d: DataPoint) => {
          return d?.value === null || d?.id === TOP_LIMIT_DATA_SET
        },
        isDataDisabled: (id: string) => {
          return id === TOP_LIMIT_DATA_SET
        },
        isShowXGridFocusDisabled: (d: DataPoint) => {
          return d?.id === TOP_LIMIT_DATA_SET
        },
        onShowXGridFocus: (d: DataPoint) => {
          this.showXGridFocus.emit(d)
        },
        onHideXGridFocus: () => {
          this.hideXGridFocus.emit()
        },
        customPointsHandler: {
          append: (context: CustomPointContext) => {
            const { d } = context
            this.customPointsHandler?.append({ ...context, getTag: () => this.customPointsMap[d.index]?.tag })
          },
          redraw: (context: CustomPointContext) => {
            this.customPointsHandler?.redraw({
              ...context,
              getTag: (d: DataPoint) => {
                return this.customPointsMap[d.index]?.tag
              },
            })
          },
          remove: (context: CustomPointContext) => {
            this.customPointsHandler?.remove(context)
          },
        },
      },
    }
  }

  ngAfterViewInit(): void {
    this.currentDomain = this.getCurrentXDomain()
    this.refreshYGrids()
    this.selectPoints(this.selectedPoints)
    this.customizePoints(this.customPoints)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedPoints && !changes.selectedPoints.firstChange) {
      this.selectPoints(this.selectedPoints)
    }
    if (changes.customPoints && !changes.customPoints.firstChange) {
      this.customizePoints(this.customPoints)
    }
    if (changes.yGridLines && !changes.yGridLines.firstChange) {
      this.refreshYGrids()
    }
    if (changes.yGridLinesTopLimitEnabled && !changes.yGridLinesTopLimitEnabled.firstChange) {
      this.refreshYGrids()
    }
    if (changes.size && !changes.size.firstChange) {
      this.resize(this.size)
    }
  }

  private onZoom(domain: Domain): void {
    if (this.isDomainCorrect && !this.isDomainCorrect(domain) && !this.isSameDomain(domain, this.currentDomain)) {
      this.chart.getInstance()?.zoom(this.currentDomain)
      return
    }
    this.currentDomain = domain
    this.zoom.emit(domain)
  }
  private onZoomStart(): void {
    this.zoomStart.emit()
  }
  private onZoomEnd(domain: Domain): void {
    this.currentDomain = domain
    this.chart.getInstance()?.zoom(this.currentDomain)
    this.zoomEnd.emit(domain)
  }

  private resize(size?: ChartSize): void {
    const domain = this.getCurrentXDomain()
    this.chart.getInstance()?.resize(size)
    this.chart.getInstance()?.zoom(domain)
  }

  private refreshYGrids(): void {
    this.chart.getInstance()?.ygrids(this.yGridLines)
    const maxYLine = this.getMaxYLine()
    if (this.yGridLinesTopLimitEnabled && maxYLine) {
      this.topLimitEnable(maxYLine)
    } else {
      this.topLimitDisable()
    }
  }

  private getMaxYLine(): number | undefined {
    if (this.yGridLines?.length > 0) {
      return Math.max(...this.yGridLines.map((l) => l.value))
    }
  }

  private selectPoints(points: SelectedPoint[]): void {
    const indices = points.map((p) => p.index)
    this.chart.getInstance()?.select(MAIN_DATA_SET, indices, true)
    this.brushSelectedPoints()
  }

  private customizePoints(points: CustomPoint[]): void {
    this.customPointsMap = arrayToObject(this.customPoints, 'index')
    this.chart.getInstance()?.setCustomPoint(
      MAIN_DATA_SET,
      this.customPoints.map((p) => p.index)
    )
  }

  private topLimitEnable(limit: number) {
    const domain = this.getCurrentXDomain()
    this.chart.getInstance().load({ columns: [[TOP_LIMIT_DATA_SET, ...this.dataSet.map(() => limit)]] })
    this.chart.getInstance()?.zoom(domain)
  }

  private topLimitDisable() {
    const domain = this.getCurrentXDomain()
    this.chart.getInstance().unload([TOP_LIMIT_DATA_SET])
    this.chart.getInstance()?.zoom(domain)
  }

  private brushSelectedPoints() {
    const selectedPoints = arrayToObject(this.selectedPoints, 'index')
    const selection = this.chart.getInstance().internal.main.selectAll('.c3-selected-circles').selectAll('.c3-selected-circle')
    selection.attr('stroke', ({ index }) => {
      return selectedPoints[index]?.color
    })
  }

  private getCurrentXDomain(): Domain {
    return this.chart.getInstance().internal.x.domain()
  }

  private isSameDomain(domain: Domain, domainNew: Domain): boolean {
    return domain[0] === domainNew[0] && domain[1] === domainNew[1]
  }

  flush(): void {
    const domain = this.getCurrentXDomain()
    this.chart.getInstance()?.flush()
    this.chart.getInstance()?.zoom(domain)
  }
}
