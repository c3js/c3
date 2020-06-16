import { Chart } from './core'
import { isDefined } from './util'

Chart.prototype.zoom = function(domain) {
  var $$ = this.internal
  if (domain) {
    if ($$.isTimeSeries()) {
      domain = domain.map(function(x) {
        return $$.parseDate(x)
      })
    }
    if ($$.config.subchart_show) {
      $$.brush.selectionAsValue(domain, true)
    } else {
      $$.updateXDomain(null, true, false, false, domain)
      $$.redraw({ withY: $$.config.zoom_rescale, withSubchart: false })
    }
    $$.config.zoom_onzoom.call(this, $$.x.orgDomain())
    return domain
  } else {
    return $$.x.domain()
  }
}
Chart.prototype.zoom.enable = function(enabled) {
  var $$ = this.internal
  $$.config.zoom_enabled = enabled
  $$.updateAndRedraw()
}
Chart.prototype.unzoom = function() {
  var $$ = this.internal
  if ($$.config.subchart_show) {
    $$.brush.clear()
  } else {
    $$.updateXDomain(null, true, false, false, $$.subX.domain())
    $$.redraw({ withY: $$.config.zoom_rescale, withSubchart: false })
  }
}

Chart.prototype.zoom.max = function(max) {
  var $$ = this.internal,
    config = $$.config,
    d3 = $$.d3
  if (max === 0 || max) {
    config.zoom_x_max = d3.max([$$.orgXDomain[1], max])
  } else {
    return config.zoom_x_max
  }
}

Chart.prototype.zoom.min = function(min) {
  var $$ = this.internal,
    config = $$.config,
    d3 = $$.d3
  if (min === 0 || min) {
    config.zoom_x_min = d3.min([$$.orgXDomain[0], min])
  } else {
    return config.zoom_x_min
  }
}

Chart.prototype.zoom.range = function(range) {
  if (arguments.length) {
    if (isDefined(range.max)) {
      this.domain.max(range.max)
    }
    if (isDefined(range.min)) {
      this.domain.min(range.min)
    }
  } else {
    return {
      max: this.domain.max(),
      min: this.domain.min()
    }
  }
}
