import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { DataPoint, Domain, PrimitiveArray } from 'c3'
import {
  MAIN_DATA_SET,
  NDC_DATA_SET,
  X2_DATA_SET,
  X_DATA_SET,
} from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper-base.consts'
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
    const x2DataSet = [...xDataSet]
    const padding = (x2DataSet[1] - x2DataSet[0]) / 2
    /* TODO: Need to think about a more accurate calculation of the NDC data set
    const xDataSet = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
    const ndcDataSet =[3, 4,    5,  6,     7,  8, 15, 70, 15, 10, 7, 7, 5, 5, 5, 4, 4, 4, 4, 3, 2]
    const x2DataSet = [5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50, 52.5, 55]
    const xTickDataSet = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
    const yDataSet = [1, 4, 5, 60, 80, 70, 60, 25, 5, null, 5]
    const padding = (x2DataSet[1] - x2DataSet[0])
     */
    this.params = {
      bindto: `#${this.chartId}`,
      size: this.size,
      data: {
        xs: {
          [MAIN_DATA_SET]: X_DATA_SET,
          [NDC_DATA_SET]: X2_DATA_SET,
        },
        columns: [
          [X_DATA_SET, ...xDataSet],
          [X2_DATA_SET, ...x2DataSet],
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
            values: xTickDataSet,
          },
          padding: {
            left: padding,
            right: padding,
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
