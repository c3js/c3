import { Chart } from './core'

Chart.prototype.subchart = function() {}

Chart.prototype.subchart.isShown = function() {
  const $$ = this.internal

  return $$.config.subchart_show
}

Chart.prototype.subchart.show = function() {
  const $$ = this.internal

  if ($$.config.subchart_show) {
    return
  }

  $$.config.subchart_show = true

  // insert DOM
  $$.initSubchart()

  // update dimensions with sub chart now visible
  $$.updateDimension()

  // insert brush (depends on sizes previously updated)
  $$.initSubchartBrush()

  // attach data
  $$.updateTargetsForSubchart($$.getTargets())

  // reset fade-in state
  $$.mapToIds($$.data.targets).forEach(function(id) {
    $$.withoutFadeIn[id] = false
  })

  // redraw chart !
  $$.updateAndRedraw()

  // update visible targets !
  $$.showTargets()
}

Chart.prototype.subchart.hide = function() {
  const $$ = this.internal

  if (!$$.config.subchart_show) {
    return
  }

  $$.config.subchart_show = false

  // remove DOM
  $$.removeSubchart()

  // re-render chart
  $$.redraw()
}
