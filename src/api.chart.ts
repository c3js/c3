import { Chart } from './core'

Chart.prototype.resize = function(size) {
  var $$ = this.internal,
    config = $$.config
  config.size_width = size ? size.width : null
  config.size_height = size ? size.height : null
  this.flush()
}

Chart.prototype.flush = function() {
  var $$ = this.internal
  $$.updateAndRedraw({
    withLegend: true,
    withTransition: false,
    withTransitionForTransform: false
  })
}

Chart.prototype.destroy = function() {
  var $$ = this.internal

  window.clearInterval($$.intervalForObserveInserted)

  if ($$.resizeTimeout !== undefined) {
    window.clearTimeout($$.resizeTimeout)
  }

  window.removeEventListener('resize', $$.resizeIfElementDisplayed)

  // Removes the inner resize functions
  $$.resizeFunction.remove()

  // Unbinds from the window focus event
  $$.unbindWindowFocus()

  $$.selectChart.classed('c3', false).html('')

  // MEMO: this is needed because the reference of some elements will not be released, then memory leak will happen.
  Object.keys($$).forEach(function(key) {
    $$[key] = null
  })

  return null
}
