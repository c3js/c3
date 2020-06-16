import { Chart } from './core'

Chart.prototype.legend = function() {}
Chart.prototype.legend.show = function(targetIds) {
  const $$ = this.internal
  $$.showLegend($$.mapToTargetIds(targetIds))
  $$.updateAndRedraw({ withLegend: true })
}
Chart.prototype.legend.hide = function(targetIds) {
  const $$ = this.internal
  $$.hideLegend($$.mapToTargetIds(targetIds))
  $$.updateAndRedraw({ withLegend: false })
}
