import { Chart } from './core'

// TODO: fix
Chart.prototype.color = function(id) {
  var $$ = this.internal
  return $$.color(id) // more patterns
}
