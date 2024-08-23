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
  @Input() normalDistributionCurveEnabled = true

  private xDataSet: number[] = []
  private xTickDataSet: number[] = []
  private yDataSet: number[] = []
  private ndcDataSet: number[] = []
  private x2DataSet: number[] = []
  private chartPadding: number

  override ngOnInit(): void {
    super.ngOnInit()
  }

  updateParams(): void {
    this.xDataSet = this.dataSet.map((item) => item.x)
    this.xTickDataSet = this.dataSet.map((item) => item.xTick)
    this.yDataSet = this.dataSet.map((item) => item.y)
    this.ndcDataSet = this.dataSet.map((item) => item.ndcValue)
    this.x2DataSet = this.dataSet.map((item) => item.x)
    this.chartPadding = (this.x2DataSet[1] - this.x2DataSet[0]) / 2
    /* TODO: Need to think about a more accurate calculation of the NDC data set
    this.xDataSet = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
    this.ndcDataSet =[3, 4,    5,  6,     7,  8, 15, 70, 15, 10, 7, 7, 5, 5, 5, 4, 4, 4, 4, 3, 2]
    this.x2DataSet = [5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50, 52.5, 55]
    this.xTickDataSet = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
    this.yDataSet = [1, 4, 5, 60, 80, 70, 60, 25, 5, null, 5]
    this.chartPadding = (this.x2DataSet[1] - this.x2DataSet[0])
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
          [X_DATA_SET, ...this.xDataSet],
          [MAIN_DATA_SET, ...this.yDataSet],
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
            values: this.xTickDataSet,
          },
          padding: {
            left: this.chartPadding,
            right: this.chartPadding,
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
    this.toggleNDC()
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes)
    if (changes.dataSet && !changes.dataSet.firstChange) {
      this.updateParams()
      setTimeout(() => {
        this.ngAfterViewInit()
      })
    }
    if (changes.normalDistributionCurveEnabled && !changes.normalDistributionCurveEnabled.firstChange) {
      this.toggleNDC()
    }
  }

  protected override refreshXGrids(): void {
    this.chart.getInstance()?.xgrids(this.xGridLines)
  }

  private enableNDC(): void {
    this.chart.getInstance().load({
      columns: [
        [NDC_DATA_SET, ...this.ndcDataSet],
        [X2_DATA_SET, ...this.x2DataSet],
      ],
    })
  }

  private disableNDC(): void {
    this.chart.getInstance().unload([NDC_DATA_SET])
  }

  private toggleNDC(): void {
    if (this.normalDistributionCurveEnabled) {
      this.enableNDC()
    } else {
      this.disableNDC()
    }
  }
}
