import { DataPoint } from 'c3'
import { CustomPointContext, CustomPointsHandler } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'

export enum CustomPointTag {
  WE = 'WesternElectricViolation',
  S = 'SpecificationsViolation',
  CL = 'ControlLimitViolation',
}

const CUSTOM_POINT_COLOR = '#DF2C04'
const CUSTOM_POINT_BG_COLOR = '#FFFFFF'
const WE_WIDTH = 20
const WE_HEIGHT = 20
const WE_DELTA_X = 10
const WE_DELTA_Y = 10
const WE_CIRCLE_X = 8
const WE_CIRCLE_Y = 8
const WE_CIRCLE_R = 5
const S_WIDTH = 18
const S_HEIGHT = 18
const S_DELTA_X = 8
const S_DELTA_Y = 8
const CL_WIDTH = 16
const CL_HEIGHT = 14
const CL_DELTA_X = 8
const CL_DELTA_Y = 9
const CL_CIRCLE_X = 6
const CL_CIRCLE_Y = 8
const CL_CIRCLE_R = 5

export const customPointsConfig: Record<
  CustomPointTag,
  {
    append: (context: CustomPointContext) => void
    reCalcX: (d: DataPoint, cx: (d: DataPoint) => number) => number
    reCalcY: (d: DataPoint, cy: (d: DataPoint) => number) => number
  }
> = {
  [CustomPointTag.WE]: {
    append: (context: CustomPointContext) => {
      const { chartInternal, d, cx, cy, containerClass, customPointClass, customPointClasses, getTag } = context
      const svg = chartInternal.main
        .select('.' + containerClass)
        .selectAll('.' + customPointClass)
        .data([d])
        .enter()
        .append('svg')
        .attr('class', customPointClasses)
        .attr('x', (d: DataPoint) => customPointsConfig[CustomPointTag.WE].reCalcX(d, cx))
        .attr('y', (d: DataPoint) => customPointsConfig[CustomPointTag.WE].reCalcY(d, cy))
        .attr('width', WE_WIDTH)
        .attr('height', WE_HEIGHT)
        .attr('viewBox', '0 0 16 16')

      svg
        .append('circle')
        .attr('cx', WE_CIRCLE_X)
        .attr('cy', WE_CIRCLE_Y)
        .style('stroke', CUSTOM_POINT_BG_COLOR)
        .style('fill', CUSTOM_POINT_BG_COLOR)
        .attr('r', WE_CIRCLE_R)

      svg
        .append('path')
        .style('fill', CUSTOM_POINT_COLOR)
        .style('stroke', 'none')
        .attr('d', () => {
          return 'M5 4L8 1L11 4L8 7L5 4Z'
        })

      svg
        .append('path')
        .style('fill', CUSTOM_POINT_COLOR)
        .style('stroke', 'none')
        .attr('d', () => {
          return 'M5 12L8 9L11 12L8 15L5 12Z'
        })

      svg
        .append('path')
        .style('fill', CUSTOM_POINT_COLOR)
        .style('stroke', 'none')
        .attr('d', () => {
          return 'M1 8L4 5L7 8L4 11L1 8Z'
        })

      svg
        .append('path')
        .style('fill', CUSTOM_POINT_COLOR)
        .style('stroke', 'none')
        .attr('d', () => {
          return 'M9 8L12 5L15 8L12 11L9 8Z'
        })
    },
    reCalcX: (d: DataPoint, cx: (d: DataPoint) => number) => {
      return cx(d) - WE_DELTA_X
    },
    reCalcY: (d: DataPoint, cy: (d: DataPoint) => number) => {
      return cy(d) - WE_DELTA_Y
    },
  },
  [CustomPointTag.S]: {
    append: (context: CustomPointContext) => {
      const { chartInternal, d, cx, cy, containerClass, customPointClass, customPointClasses, getTag } = context
      const svg = chartInternal.main
        .select('.' + containerClass)
        .selectAll('.' + customPointClass)
        .data([d])
        .enter()
        .append('svg')
        .attr('class', customPointClasses)
        .attr('x', (d: DataPoint) => customPointsConfig[CustomPointTag.S].reCalcX(d, cx))
        .attr('y', (d: DataPoint) => customPointsConfig[CustomPointTag.S].reCalcY(d, cy))
        .attr('width', S_WIDTH)
        .attr('height', S_HEIGHT)
        .attr('viewBox', '0 0 16 16')

      svg
        .append('path')
        .style('fill', CUSTOM_POINT_COLOR)
        .style('stroke', 'none')
        .attr('d', () => {
          return 'M0 7L7 0L14 7L7 14L0 7Z'
        })
    },
    reCalcX: (d: DataPoint, cx: (d: DataPoint) => number) => {
      return cx(d) - S_DELTA_X
    },
    reCalcY: (d: DataPoint, cy: (d: DataPoint) => number) => {
      return cy(d) - S_DELTA_Y
    },
  },
  [CustomPointTag.CL]: {
    append: (context: CustomPointContext) => {
      const { chartInternal, d, cx, cy, containerClass, customPointClass, customPointClasses, getTag } = context
      const svg = chartInternal.main
        .select('.' + containerClass)
        .selectAll('.' + customPointClass)
        .data([d])
        .enter()
        .append('svg')
        .attr('class', customPointClasses)
        .attr('x', (d: DataPoint) => customPointsConfig[CustomPointTag.CL].reCalcX(d, cx))
        .attr('y', (d: DataPoint) => customPointsConfig[CustomPointTag.CL].reCalcY(d, cy))
        .attr('width', CL_WIDTH)
        .attr('height', CL_HEIGHT)
        .attr('viewBox', '0 0 12 10')

      svg
        .append('circle')
        .attr('cx', CL_CIRCLE_X)
        .attr('cy', CL_CIRCLE_Y)
        .style('stroke', CUSTOM_POINT_BG_COLOR)
        .style('fill', CUSTOM_POINT_BG_COLOR)
        .attr('r', CL_CIRCLE_R)
      svg
        .append('path')
        .style('fill', CUSTOM_POINT_COLOR)
        .style('stroke', 'none')
        .attr('d', () => {
          return 'M0 10L6 0L12 10H0Z'
        })
    },
    reCalcX: (d: DataPoint, cx: (d: DataPoint) => number) => {
      return cx(d) - CL_DELTA_X
    },
    reCalcY: (d: DataPoint, cy: (d: DataPoint) => number) => {
      return cy(d) - CL_DELTA_Y
    },
  },
}

export const customPointsHandler: CustomPointsHandler = {
  append: (context: CustomPointContext) => {
    customPointsConfig[context.getTag()].append(context)
  },
  redraw: (context: CustomPointContext) => {
    const { selection, cx, cy, getTag } = context
    return selection
      .attr('x', (d: DataPoint) => {
        return customPointsConfig[context.getTag(d)].reCalcX(d, cx)
      })
      .attr('y', (d: DataPoint) => {
        return customPointsConfig[context.getTag(d)].reCalcY(d, cy)
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
