import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { DataPoint, Domain, PrimitiveArray } from 'c3'
import { MAIN_DATA_SET, NDC_DATA_SET, X_DATA_SET } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper-base.consts'
import { ChartWrapperBaseComponent } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper-base.component'
import { BarChartDataSet } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'

@Component({
  selector: 'lw-bar-chart-wrapper',
  templateUrl: '../chart-wrapper-base/chart-wrapper-base.component.html',
  styleUrls: ['../chart-wrapper-base/chart-wrapper-base.component.less', './bar-chart-wrapper.component.less'],
})
export class BarChartWrapperComponent extends ChartWrapperBaseComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() dataSet: BarChartDataSet

  override ngOnInit(): void {
    super.ngOnInit()
  }

  updateParams(): void {
    const xDataSet = this.dataSet.map((item) => item.x)
    const xTickDataSet = this.dataSet.map((item) => item.xTick)
    const yDataSet = this.dataSet.map((item) => item.y)
    const ndcDataSet = this.dataSet.map((item) => item.ndcValue)
    this.params = {
      bindto: `#${this.chartId}`,
      size: this.size,
      data: {
        xs: {
          [MAIN_DATA_SET]: X_DATA_SET,
          [NDC_DATA_SET]: X_DATA_SET,
        },
        columns: [
          [X_DATA_SET, ...xDataSet],
          [MAIN_DATA_SET, ...yDataSet],
          [NDC_DATA_SET, ...ndcDataSet],
        ],
        types: {
          [MAIN_DATA_SET]: 'bar',
          [NDC_DATA_SET]: 'spline',
        },
      },
      bar: {
        width: {
          ratio: 0.99,
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
              return `${x}`
            },
            // values: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
            values: xTickDataSet,
          },
        },
        y: {
          tick: {
            format: (y: number) => {
              return y
            },
          },
        },
      },
      grid: {
        lines: {
          front: true,
        },
      },
      context: {
        isHideXLabelIfNotVisibleDisabled: (id: string) => {
          // TODO: add chart types in which we could disable this functionality
          return false
        },
        isMouseOverDisabled: (d: DataPoint) => {
          return d?.value === null || d?.id === NDC_DATA_SET
        },
        isDataDisabled: (id: string) => {
          return id === NDC_DATA_SET
        },
      },
    }
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit()
    this.setInitialZoom()
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes)
    if (changes.dataSet && !changes.dataSet.firstChange) {
      this.updateParams()
      setTimeout(() => {
        this.ngAfterViewInit()
      })
    }
  }

  protected override refreshXGrids(): void {
    this.chart.getInstance()?.xgrids(this.xGridLines)
  }
}
