import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core'
import { generateId } from '@src/app/common/utils/helpers'
import { DataPoint, Domain } from 'c3'
import {
  ChartSize,
  CheckDomainPredicate,
  FormatPredicate,
  GridLine,
} from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import { ChartComponent } from '@src/app/common/shared/components/chart/chart.component'
import {
  X_AXIS_MAX_LENGTH_DEFAULT,
  ZOOM_COEFFICIENT_DEFAULT,
} from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper-base.consts'

@Component({ template: '' })
export abstract class ChartWrapperBaseComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() chartId = `chart_${generateId()}`
  @Input() size: ChartSize
  @Input() xAxisMaxLength = X_AXIS_MAX_LENGTH_DEFAULT
  @Input() isDomainCorrect: CheckDomainPredicate
  @Input() initialDomain: Domain
  @Input() xAxisRotated: boolean
  @Input() formatX: FormatPredicate
  @Input() formatY: FormatPredicate
  @Input() yGridLines: GridLine[] = []
  @Input() xGridLines: GridLine[] = []
  @Input() hideXTicks = false

  @Output() showXGridFocus = new EventEmitter<DataPoint>()
  @Output() hideXGridFocus = new EventEmitter<void>()
  @Output() zoom = new EventEmitter<Domain>()
  @Output() zoomStart = new EventEmitter<void>()
  @Output() zoomEnd = new EventEmitter<Domain>()

  @ViewChild(ChartComponent) chart: ChartComponent

  protected params: any

  protected currentDomain: Domain = null
  protected originDomain: Domain = null

  protected abstract updateParams(): void

  ngOnInit(): void {
    this.updateParams()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.size && !changes.size.firstChange) {
      this.resize(this.size)
    }
    if (changes.yGridLines && !changes.yGridLines.firstChange) {
      this.refreshYGrids()
    }
    if (changes.xGridLines && !changes.xGridLines.firstChange) {
      this.refreshXGrids()
    }
  }

  ngAfterViewInit(): void {
    this.currentDomain = this.getCurrentXDomain()
    this.originDomain = this.currentDomain
    this.refreshYGrids()
    this.refreshXGrids()
  }

  protected refreshYGrids(): void {}

  protected refreshXGrids(): void {}

  protected getCurrentXDomain(): Domain {
    return this.chart.getInstance().internal.x.domain()
  }

  protected isSameDomain(domain: Domain, domainNew: Domain): boolean {
    return domain[0] === domainNew[0] && domain[1] === domainNew[1]
  }

  protected setInitialZoom(): void {
    if (this.initialDomain) {
      this.chart.getInstance()?.zoom(this.initialDomain)
    }
  }

  protected onZoom(domain: Domain): void {
    if (this.isDomainCorrect && !this.isDomainCorrect(domain) && !this.isSameDomain(domain, this.currentDomain)) {
      this.chart.getInstance()?.zoom(this.currentDomain)
      return
    }
    this.currentDomain = domain
    this.zoom.emit(domain)
  }
  protected onZoomStart(): void {
    this.zoomStart.emit()
  }
  protected onZoomEnd(domain: Domain): void {
    this.currentDomain = domain
    this.chart.getInstance()?.zoom(this.currentDomain)
    this.zoomEnd.emit(domain)
  }

  protected resize(size?: ChartSize): void {
    const domain = this.getCurrentXDomain()
    this.chart.getInstance()?.resize(size)
    this.chart.getInstance()?.zoom(domain)
  }

  zoomStep(zoomType: 'in' | 'out'): void {
    const zoomCoef = ZOOM_COEFFICIENT_DEFAULT
    const domain = this.getCurrentXDomain()
    const midX = (domain[0] + domain[1]) / 2
    if (!midX || domain?.length !== 2 || midX < domain[0] || midX > domain[1]) {
      return
    }
    let lPart = midX - domain[0]
    let rPart = domain[1] - midX
    if (zoomType === 'in') {
      lPart = lPart * zoomCoef
      rPart = rPart * zoomCoef
    } else {
      lPart = lPart / zoomCoef
      rPart = rPart / zoomCoef
    }
    const newDomain = [midX - lPart, midX + rPart]
    this.chart.getInstance().zoom(newDomain)
    const curDomain = this.getCurrentXDomain()
    if (curDomain[0] < this.originDomain[0] || curDomain[1] > this.originDomain[1]) {
      this.resetZoom()
    }
  }

  resetZoom(): void {
    this.chart.getInstance().unzoom()
    this.chart.getInstance()?.zoom(this.getCurrentXDomain())
  }

  flush(): void {
    const domain = this.getCurrentXDomain()
    this.chart.getInstance()?.flush()
    this.chart.getInstance()?.zoom(domain)
  }
}
