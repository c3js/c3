import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { generateId } from '@src/app/common/utils/helpers'
import { DataPoint, Domain } from 'c3'
import {
  ChartSize,
  CheckDomainPredicate,
  FormatPredicate,
  GridLine,
} from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import {
  X_AXIS_MAX_LENGTH_DEFAULT,
  ZOOM_COEFFICIENT_DEFAULT,
} from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper-base.consts'
import c3 from '@src/app/c3/src/index.js'
import * as d3 from 'd3'
import { ChartPoint } from '@src/app/common/shared/components/chart/chart.types'

@Component({ template: '' })
export abstract class ChartWrapperBaseComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() chartId = `chart_${generateId()}`
  @Input() size: ChartSize
  @Input() xAxisMaxLength = X_AXIS_MAX_LENGTH_DEFAULT
  @Input() isDomainCorrect: CheckDomainPredicate
  @Input() initialDomain: Domain
  @Input() xAxisRotated: boolean
  @Input() formatX: FormatPredicate
  @Input() formatY: FormatPredicate
  @Input() yGridLines: GridLine[] = []
  @Input() yGridLinesTopLimitEnabled = false
  @Input() xGridLines: GridLine[] = []
  @Input() hideXTicks = false

  @Output() showXGridFocus = new EventEmitter<DataPoint>()
  @Output() hideXGridFocus = new EventEmitter<void>()
  @Output() zoom = new EventEmitter<Domain>()
  @Output() zoomStart = new EventEmitter<void>()
  @Output() zoomEnd = new EventEmitter<Domain>()
  @Output() afterInit = new EventEmitter()
  @Output() pointer = new EventEmitter<ChartPoint>()

  @ViewChild('chart', { static: true }) chart!: ElementRef

  protected instance!: any

  protected params: any

  protected currentDomain: Domain = null
  protected originDomain: Domain = null

  protected initComplete = false

  protected updateParams(): void {
    this.params = this.getParams()
    this.patchParams(this.params)
    this.destroy()
    this.create()
  }

  protected patchParams(params: any): void {
    if (this.size?.width || this.size?.height) {
      params.size = this.size
    }
    if (this.yGridLines) {
      params.grid = params.grid || {}
      params.grid.y = params.grid.y || {}
      params.grid.y.lines = params.grid.y.lines || this.yGridLines
    }
    if (this.xGridLines) {
      params.grid = params.grid || {}
      params.grid.x = params.grid.x || {}
      params.grid.x.lines = params.grid.x.lines || this.xGridLines
    }
  }

  protected abstract getParams(): any

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
    if (changes.yGridLinesTopLimitEnabled && !changes.yGridLinesTopLimitEnabled.firstChange) {
      this.refreshYGrids()
    }
  }

  ngAfterViewInit(): void {
    this.currentDomain = this.getCurrentXDomain()
    this.originDomain = this.currentDomain
    this.setInitialZoom()
    this.initComplete = true
    this.afterInit.emit()
  }

  ngOnDestroy(): void {
    this.destroy()
  }

  protected create(): void {
    const id = this.extractIdFromBindTo(this.params.bindto)
    this.setElementId(id)
    this.instance = c3.generate({
      bindto: id || this.chart.nativeElement,
      ...this.params,
    })
    this.params.chartObj = this.instance
    this.subscribe()
  }

  protected destroy(): void {
    this.unsubscribe()
    this.instance?.destroy()
  }

  protected extractIdFromBindTo(bindTo: string): string {
    return bindTo.startsWith('#') ? bindTo.slice(1) : bindTo
  }

  protected setElementId(id: string): void {
    if (id) {
      this.chart.nativeElement.id = id
    }
  }

  protected subscribe(): void {
    const internal = this.instance.internal
    const pointer = this.pointer

    internal.main.on('click', function (this: d3.ContainerElement) {
      const coords = d3.mouse(this)
      pointer.emit({
        x: internal.x.invert(coords[0]),
        y: internal.y.invert(coords[1]),
      })
    })
  }

  protected unsubscribe(): void {
    this.instance?.internal.main.on('click', null)
  }

  protected refreshYGrids(): void {}

  protected refreshXGrids(): void {}

  protected getCurrentXDomain(): Domain {
    return this.instance?.internal.x.domain()
  }

  protected isSameDomain(domain: Domain, domainNew: Domain): boolean {
    return domain[0] === domainNew[0] && domain[1] === domainNew[1]
  }

  protected setInitialZoom(): void {
    if (this.initialDomain) {
      this.instance?.zoom(this.initialDomain)
    }
  }

  protected onZoom(domain: Domain): void {
    if (this.isDomainCorrect && !this.isDomainCorrect(domain) && !this.isSameDomain(domain, this.currentDomain)) {
      this.instance?.zoom(this.currentDomain)
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
    this.instance?.zoom(this.currentDomain)
    this.zoomEnd.emit(domain)
  }

  protected resize(size?: ChartSize): void {
    const domain = this.getCurrentXDomain()
    this.instance?.resize(size)
    this.instance?.zoom(domain)
  }

  protected getMaxYLine(): number | undefined {
    if (this.yGridLines?.length > 0) {
      return Math.max(...this.yGridLines.map((l) => l.value))
    }
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
    this.instance.zoom(newDomain)
    const curDomain = this.getCurrentXDomain()
    if (curDomain[0] < this.originDomain[0] || curDomain[1] > this.originDomain[1]) {
      this.resetZoom()
    }
  }

  resetZoom(): void {
    this.instance?.unzoom()
    this.instance?.zoom(this.getCurrentXDomain())
  }

  flush(): void {
    const domain = this.getCurrentXDomain()
    this.instance?.flush()
    this.instance?.zoom(domain)
  }

  getInstance(): any {
    return this.instance
  }
}
