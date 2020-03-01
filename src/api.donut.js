import { Chart } from './core'

Chart.prototype.donut = function() {}

Chart.prototype.donut.padAngle = function(padAngle) {
  if (padAngle === undefined) {
    return this.internal.config.donut_padAngle
  }
  this.internal.config.donut_padAngle = padAngle
  this.flush()
}
