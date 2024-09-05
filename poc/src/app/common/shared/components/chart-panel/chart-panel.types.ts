import {
  BarChartDataSet,
  CustomPoint,
  GridLine,
  SelectedPoint,
} from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import { ChartType, Domain } from 'c3'

export type ChartId = string | number

export enum ChartWrapperType {
  LINE = 'line',
  BAR = 'bar',
}

export interface ChartPanelData {
  id: ChartId
  panelHeight: number
  isVisible?: boolean
  disabled?: boolean
  dataSet?: number[] | BarChartDataSet
  selectedPoints?: SelectedPoint[]
  customPoints?: CustomPoint[]
  yGridLines?: GridLine[]
  xGridLines?: GridLine[]
  domain?: Domain
  rendered?: boolean
  chartType?: ChartWrapperType
}

export enum ChartPanelInnerEvent {}
export enum ChartPanelOuterEvent {
  SHOW_CHART = 'showChart',
  HIDE_CHART = 'hideChart',
}

export interface ChartPanelEvent {
  type: ChartPanelInnerEvent | ChartPanelOuterEvent
  id: ChartId
  payload?: any
}
