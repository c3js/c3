import { Chart } from './core'

// TODO: fix
Chart.prototype.color = function(id) {
  const $$ = this.internal
  return $$.color(id) // more patterns
}
