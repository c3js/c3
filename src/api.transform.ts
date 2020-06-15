import { Chart, ChartInternal } from './core'

Chart.prototype.transform = function(type, targetIds) {
  var $$ = this.internal,
    options =
      ['pie', 'donut'].indexOf(type) >= 0 ? { withTransform: true } : null
  $$.transformTo(targetIds, type, options)
}

ChartInternal.prototype.transformTo = function(
  targetIds,
  type,
  optionsForRedraw
) {
  var $$ = this,
    withTransitionForAxis = !$$.hasArcType(),
    options = optionsForRedraw || {
      withTransitionForAxis: withTransitionForAxis
    }
  options.withTransitionForTransform = false
  $$.transiting = false
  $$.setTargetType(targetIds, type)
  $$.updateTargets($$.data.targets) // this is needed when transforming to arc
  $$.updateAndRedraw(options)
}
