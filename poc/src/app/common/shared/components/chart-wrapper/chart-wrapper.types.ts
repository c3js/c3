import { ChartInternal, DataPoint, Domain } from 'c3'
import { Selection } from 'd3'

export interface GridLine {
  value: number
  text: string
  class?: string
  color?: string
}

export interface SelectedPoint {
  index: number
  color?: string
}

export interface CustomPoint {
  index: number
  tag: string
}

export interface ChartSize {
  width?: number
  height?: number
}

export interface CustomPointContext {
  chartInternal?: ChartInternal
  d?: DataPoint
  cx?: (d: DataPoint) => number
  cy?: (d: DataPoint) => number
  containerClass?: string
  customPointClass?: string
  customPointClasses?: string
  selection?: Selection<any, any, any, any>
  getTag?: (d?: DataPoint) => string
}

export interface CustomPointsHandler {
  append: (context: CustomPointContext) => void
  redraw: (context: CustomPointContext) => void
  remove: (context: CustomPointContext) => void
}

export type CheckDomainPredicate = (domain: Domain) => boolean
