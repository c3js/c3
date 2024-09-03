import { CustomPoint, GridLine, SelectedPoint } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import { Domain } from 'c3'

export type ChartId = string | number
export interface ChartPanelData {
  id: ChartId
  height: number
  isVisible?: boolean
  disabled?: boolean
  dataSet?: number[]
  selectedPoints?: SelectedPoint[]
  customPoints?: CustomPoint[]
  yGridLines?: GridLine[]
  domain?: Domain
  rendered?: boolean
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
