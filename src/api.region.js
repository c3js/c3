import CLASS from './class'
import { Chart } from './core'
import { getOption } from './util'

Chart.prototype.regions = function(regions) {
  var $$ = this.internal,
    config = $$.config
  if (!regions) {
    return config.regions
  }
  config.regions = regions
  $$.redrawWithoutRescale()
  return config.regions
}
Chart.prototype.regions.add = function(regions) {
  var $$ = this.internal,
    config = $$.config
  if (!regions) {
    return config.regions
  }
  config.regions = config.regions.concat(regions)
  $$.redrawWithoutRescale()
  return config.regions
}
Chart.prototype.regions.remove = function(options) {
  var $$ = this.internal,
    config = $$.config,
    duration,
    classes,
    regions

  options = options || {}
  duration = getOption(options, 'duration', config.transition_duration)
  classes = getOption(options, 'classes', [CLASS.region])

  regions = $$.main.select('.' + CLASS.regions).selectAll(
    classes.map(function(c) {
      return '.' + c
    })
  )
  ;(duration ? regions.transition().duration(duration) : regions)
    .style('opacity', 0)
    .remove()

  config.regions = config.regions.filter(function(region) {
    var found = false
    if (!region['class']) {
      return true
    }
    region['class'].split(' ').forEach(function(c) {
      if (classes.indexOf(c) >= 0) {
        found = true
      }
    })
    return !found
  })

  return config.regions
}
