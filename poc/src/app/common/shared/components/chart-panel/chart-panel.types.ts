import { CustomPoint, GridLine, SelectedPoint } from '@src/app/common/shared/components/chart-wrapper-base/chart-wrapper.types'
import { Domain } from 'c3'

export interface ChartPanelData {
  id: string | number
  height: number
  isVisible?: boolean
  disabled?: boolean
  dataSet?: number[]
  selectedPoints?: SelectedPoint[]
  customPoints?: CustomPoint[]
  yGridLines?: GridLine[]
  domain?: Domain
}

export enum ChartPanelInnerEvent {}
export enum ChartPanelOuterEvent {
  SHOW_CHART = 'showChart',
  HIDE_CHART = 'hideChart',
}

export interface ChartPanelEvent {
  type: ChartPanelInnerEvent | ChartPanelOuterEvent
  panelId: string | number
  payload?: any
}
