import { Chart } from './core'

Chart.prototype.x = function(x) {
  const $$ = this.internal
  if (arguments.length) {
    $$.updateTargetX($$.data.targets, x)
    $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true })
  }
  return $$.data.xs
}
Chart.prototype.xs = function(xs) {
  const $$ = this.internal
  if (arguments.length) {
    $$.updateTargetXs($$.data.targets, xs)
    $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true })
  }
  return $$.data.xs
}
