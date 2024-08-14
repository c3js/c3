import { Component, ViewChild } from '@angular/core'
import { ChartConfiguration, DataPoint } from 'c3'
import {
  ChartSize,
  CustomPoint,
  CustomPointContext,
  CustomPointsHandler,
  GridLine,
  SelectedPoint,
} from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.types'
import { ChartWrapperComponent } from '@src/app/common/shared/components/chart-wrapper/chart-wrapper.component'
import { getRandomColor, getRandomInt } from '@src/app/common/utils/helpers'
import { CustomPointsHelper, CustomPointTag } from '@src/app/sandboxes/select-points-sandbox/custom-points.helper'

@Component({
  selector: 'lw-select-points-sandbox',
  templateUrl: './select-points-sandbox.component.html',
  styleUrls: ['./select-points-sandbox.component.less'],
})
export class SelectPointsSandboxComponent {
  dataSet = [300, 500, 200, 1000, 400, 150, 250, null, 350, 350]

  yGridLines: GridLine[] = [
    { value: 100, text: 'LSL', class: 'custom-dotted-line', color: '#ED2024' },
    { value: 200, text: 'LWL', class: 'custom-dotted-line', color: '#FF9900' },
    { value: 300, text: 'LCL', class: 'custom-dotted-line', color: '#BA191C' },
    { value: 500, text: 'Target', class: 'custom-dotted-line', color: '#00AD1D' },
    { value: 600, text: 'CL', class: 'custom-dotted-line', color: '#007A14' },
    { value: 700, text: 'UWL', class: 'custom-dotted-line', color: '#FF9900' },
    { value: 800, text: 'UCL', class: 'custom-dotted-line', color: '#BA191C' },
  ]

  yGridLinesTopLimitEnabled = false

  selectedPoints: SelectedPoint[] = [{ index: 1, color: 'red' }]

  customPoints: CustomPoint[] = [
    { index: 3, tag: CustomPointTag.WE },
    { index: 4, tag: CustomPointTag.S },
    { index: 5, tag: CustomPointTag.CL },
  ]

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

  chartSize: ChartSize = { height: 420 }

  @ViewChild(ChartWrapperComponent) chartWrapper: ChartWrapperComponent

  select(idx: number) {
    const point = this.selectedPoints.find((p) => p.index === idx)
    if (!point) {
      this.selectedPoints = [...this.selectedPoints, { index: idx, color: getRandomColor() }]
    } else {
      point.color = getRandomColor()
      this.selectedPoints = [...this.selectedPoints]
    }
  }

  unselect(idx: number) {
    this.selectedPoints = this.selectedPoints.filter((p) => p.index !== idx)
  }

  selectAll() {
    this.selectedPoints = this.dataSet.map((d, idx) => ({ index: idx, color: getRandomColor() }))
  }

  unselectAll() {
    this.selectedPoints = []
  }

  yLinesShuffle() {
    this.yGridLines = this.yGridLines.map((l) => ({ ...l, value: getRandomInt(50, 2000) }))
  }

  resizeHeight() {
    this.chartSize = { height: getRandomInt(320, 720) }
  }

  resizeWidth() {
    this.chartSize = { width: getRandomInt(480, 1900) }
  }

  topLimitEnable() {
    this.yGridLinesTopLimitEnabled = true
  }
  topLimitDisable() {
    this.yGridLinesTopLimitEnabled = false
  }

  addCustomPoints() {
    const tags = Object.values(CustomPointTag)
    this.customPoints = Array(getRandomInt(0, 9))
      .fill(0)
      .map(() => ({ index: getRandomInt(0, 9), tag: tags[getRandomInt(0, 3)] }))
  }

  clearCustomPoints() {
    this.customPoints = []
  }
}
