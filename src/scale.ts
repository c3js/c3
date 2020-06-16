import { ChartInternal } from './core'

function c3LogScale(d3, linearScale?, logScale?) {
  var PROJECTION = [0.01, 10]

  if (!linearScale) {
    linearScale = d3.scaleLinear()
    linearScale.range(PROJECTION)
  }

  if (!logScale) {
    logScale = d3.scaleLog()
    logScale.domain(PROJECTION)
    logScale.nice()
  }

  // copied from https://github.com/compute-io/logspace
  function logspace(a, b, len) {
    var arr, end, tmp, d

    if (arguments.length < 3) {
      len = 10
    } else {
      if (len === 0) {
        return []
      }
    }
    // Calculate the increment:
    end = len - 1
    d = (b - a) / end

    // Build the output array...
    arr = new Array(len)
    tmp = a
    arr[0] = Math.pow(10, tmp)
    for (var i = 1; i < end; i++) {
      tmp += d
      arr[i] = Math.pow(10, tmp)
    }
    arr[end] = Math.pow(10, b)
    return arr
  }

  function scale(x) {
    return logScale(linearScale(x))
  }

  scale.domain = function(x) {
    if (!arguments.length) {
      return linearScale.domain()
    }
    linearScale.domain(x)
    return scale
  }

  scale.range = function(x) {
    if (!arguments.length) {
      return logScale.range()
    }
    logScale.range(x)
    return scale
  }

  scale.ticks = function(m) {
    return logspace(-2, 1, m || 10).map(function(v) {
      return linearScale.invert(v)
    })
  }

  scale.copy = function() {
    return c3LogScale(d3, linearScale.copy(), logScale.copy())
  }

  return scale
}

ChartInternal.prototype.getScale = function(min, max, forTimeseries) {
  return (forTimeseries ? this.d3.scaleTime() : this.d3.scaleLinear()).range([
    min,
    max
  ])
}
ChartInternal.prototype.getX = function(min, max, domain, offset) {
  var $$ = this,
    scale = $$.getScale(min, max, $$.isTimeSeries()),
    _scale = domain ? scale.domain(domain) : scale,
    key
  // Define customized scale if categorized axis
  if ($$.isCategorized()) {
    offset =
      offset ||
      function() {
        return 0
      }
    scale = function(d, raw) {
      var v = _scale(d) + offset(d)
      return raw ? v : Math.ceil(v)
    }
  } else {
    scale = function(d, raw) {
      var v = _scale(d)
      return raw ? v : Math.ceil(v)
    }
  }
  // define functions
  for (key in _scale) {
    scale[key] = _scale[key]
  }
  scale.orgDomain = function() {
    return _scale.domain()
  }
  // define custom domain() for categorized axis
  if ($$.isCategorized()) {
    scale.domain = function(domain) {
      if (!arguments.length) {
        domain = this.orgDomain()
        return [domain[0], domain[1] + 1]
      }
      _scale.domain(domain)
      return scale
    }
  }
  return scale
}

/**
 * Creates and configures a D3 scale instance for the given type.
 *
 * By defaults it returns a Linear scale.
 *
 * @param {String} type Type of d3-scale to create. Type can be 'linear', 'time', 'timeseries' or 'log'.
 * @param {Array} domain The scale domain such as [from, to]
 * @param {Array} range The scale's range such as [from, to]
 *
 * @return A d3-scale instance
 */
ChartInternal.prototype.getY = function(type, domain, range) {
  let scale
  if (type === 'timeseries' || type === 'time') {
    scale = this.d3.scaleTime()
  } else if (type === 'log') {
    scale = c3LogScale(this.d3)
  } else if (type === 'linear' || type === undefined) {
    scale = this.d3.scaleLinear()
  } else {
    throw new Error(`Invalid Y axis type: "${type}"`)
  }

  if (domain) {
    scale.domain(domain)
  }

  if (range) {
    scale.range(range)
  }

  return scale
}
ChartInternal.prototype.getYScale = function(id) {
  return this.axis.getId(id) === 'y2' ? this.y2 : this.y
}
ChartInternal.prototype.getSubYScale = function(id) {
  return this.axis.getId(id) === 'y2' ? this.subY2 : this.subY
}
ChartInternal.prototype.updateScales = function() {
  var $$ = this,
    config = $$.config,
    forInit = !$$.x
  // update edges
  $$.xMin = config.axis_rotated ? 1 : 0
  $$.xMax = config.axis_rotated ? $$.height : $$.width
  $$.yMin = config.axis_rotated ? 0 : $$.height
  $$.yMax = config.axis_rotated ? $$.width : 1
  $$.subXMin = $$.xMin
  $$.subXMax = $$.xMax
  $$.subYMin = config.axis_rotated ? 0 : $$.height2
  $$.subYMax = config.axis_rotated ? $$.width2 : 1
  // update scales
  $$.x = $$.getX(
    $$.xMin,
    $$.xMax,
    forInit ? undefined : $$.x.orgDomain(),
    function() {
      return $$.xAxis.tickOffset()
    }
  )
  $$.y = $$.getY(
    config.axis_y_type,
    forInit ? config.axis_y_default : $$.y.domain(),
    [$$.yMin, $$.yMax]
  )
  $$.y2 = $$.getY(
    config.axis_y2_type,
    forInit ? config.axis_y2_default : $$.y2.domain(),
    [$$.yMin, $$.yMax]
  )
  $$.subX = $$.getX($$.xMin, $$.xMax, $$.orgXDomain, function(d) {
    return d % 1 ? 0 : $$.subXAxis.tickOffset()
  })
  $$.subY = $$.getY(
    config.axis_y_type,
    forInit ? config.axis_y_default : $$.subY.domain(),
    [$$.subYMin, $$.subYMax]
  )
  $$.subY2 = $$.getY(
    config.axis_y2_type,
    forInit ? config.axis_y2_default : $$.subY2.domain(),
    [$$.subYMin, $$.subYMax]
  )
  // update axes
  $$.xAxisTickFormat = $$.axis.getXAxisTickFormat()
  $$.xAxisTickValues = $$.axis.getXAxisTickValues()
  $$.yAxisTickValues = $$.axis.getYAxisTickValues()
  $$.y2AxisTickValues = $$.axis.getY2AxisTickValues()

  $$.xAxis = $$.axis.getXAxis(
    $$.x,
    $$.xOrient,
    $$.xAxisTickFormat,
    $$.xAxisTickValues,
    config.axis_x_tick_outer
  )
  $$.subXAxis = $$.axis.getXAxis(
    $$.subX,
    $$.subXOrient,
    $$.xAxisTickFormat,
    $$.xAxisTickValues,
    config.axis_x_tick_outer
  )
  $$.yAxis = $$.axis.getYAxis(
    'y',
    $$.y,
    $$.yOrient,
    $$.yAxisTickValues,
    config.axis_y_tick_outer
  )
  $$.y2Axis = $$.axis.getYAxis(
    'y2',
    $$.y2,
    $$.y2Orient,
    $$.y2AxisTickValues,
    config.axis_y2_tick_outer
  )

  // Set initialized scales to brush and zoom
  if (!forInit) {
    if ($$.brush) {
      $$.brush.updateScale($$.subX)
    }
  }
  // update for arc
  if ($$.updateArc) {
    $$.updateArc()
  }
}
