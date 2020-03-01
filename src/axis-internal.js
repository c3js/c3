import { getBBox } from './util'

function AxisInternal(component, params) {
  var internal = this
  internal.component = component
  internal.params = params || {}

  internal.d3 = component.d3
  internal.scale = internal.d3.scaleLinear()
  internal.range
  internal.orient = 'bottom'
  internal.innerTickSize = 6
  internal.outerTickSize = this.params.withOuterTick ? 6 : 0
  internal.tickPadding = 3
  internal.tickValues = null
  internal.tickFormat
  internal.tickArguments

  internal.tickOffset = 0
  internal.tickCulling = true
  internal.tickCentered
  internal.tickTextCharSize
  internal.tickTextRotate = internal.params.tickTextRotate
  internal.tickLength

  internal.axis = internal.generateAxis()
}

AxisInternal.prototype.axisX = function(selection, x, tickOffset) {
  selection.attr('transform', function(d) {
    return 'translate(' + Math.ceil(x(d) + tickOffset) + ', 0)'
  })
}
AxisInternal.prototype.axisY = function(selection, y) {
  selection.attr('transform', function(d) {
    return 'translate(0,' + Math.ceil(y(d)) + ')'
  })
}
AxisInternal.prototype.scaleExtent = function(domain) {
  var start = domain[0],
    stop = domain[domain.length - 1]
  return start < stop ? [start, stop] : [stop, start]
}
AxisInternal.prototype.generateTicks = function(scale) {
  var internal = this
  var i,
    domain,
    ticks = []
  if (scale.ticks) {
    return scale.ticks.apply(scale, internal.tickArguments)
  }
  domain = scale.domain()
  for (i = Math.ceil(domain[0]); i < domain[1]; i++) {
    ticks.push(i)
  }
  if (ticks.length > 0 && ticks[0] > 0) {
    ticks.unshift(ticks[0] - (ticks[1] - ticks[0]))
  }
  return ticks
}
AxisInternal.prototype.copyScale = function() {
  var internal = this
  var newScale = internal.scale.copy(),
    domain
  if (internal.params.isCategory) {
    domain = internal.scale.domain()
    newScale.domain([domain[0], domain[1] - 1])
  }
  return newScale
}
AxisInternal.prototype.textFormatted = function(v) {
  var internal = this,
    formatted = internal.tickFormat ? internal.tickFormat(v) : v
  return typeof formatted !== 'undefined' ? formatted : ''
}
AxisInternal.prototype.updateRange = function() {
  var internal = this
  internal.range = internal.scale.rangeExtent
    ? internal.scale.rangeExtent()
    : internal.scaleExtent(internal.scale.range())
  return internal.range
}
AxisInternal.prototype.updateTickTextCharSize = function(tick) {
  var internal = this
  if (internal.tickTextCharSize) {
    return internal.tickTextCharSize
  }
  var size = {
    h: 11.5,
    w: 5.5
  }
  tick
    .select('text')
    .text(function(d) {
      return internal.textFormatted(d)
    })
    .each(function(d) {
      var box = getBBox(this),
        text = internal.textFormatted(d),
        h = box.height,
        w = text ? box.width / text.length : undefined
      if (h && w) {
        size.h = h
        size.w = w
      }
    })
    .text('')
  internal.tickTextCharSize = size
  return size
}
AxisInternal.prototype.isVertical = function() {
  return this.orient === 'left' || this.orient === 'right'
}
AxisInternal.prototype.tspanData = function(d, i, scale) {
  var internal = this
  var splitted = internal.params.tickMultiline
    ? internal.splitTickText(d, scale)
    : [].concat(internal.textFormatted(d))

  if (internal.params.tickMultiline && internal.params.tickMultilineMax > 0) {
    splitted = internal.ellipsify(splitted, internal.params.tickMultilineMax)
  }

  return splitted.map(function(s) {
    return { index: i, splitted: s, length: splitted.length }
  })
}
AxisInternal.prototype.splitTickText = function(d, scale) {
  var internal = this,
    tickText = internal.textFormatted(d),
    maxWidth = internal.params.tickWidth,
    subtext,
    spaceIndex,
    textWidth,
    splitted = []

  if (Object.prototype.toString.call(tickText) === '[object Array]') {
    return tickText
  }

  if (!maxWidth || maxWidth <= 0) {
    maxWidth = internal.isVertical()
      ? 95
      : internal.params.isCategory
      ? Math.ceil(scale(1) - scale(0)) - 12
      : 110
  }

  function split(splitted, text) {
    spaceIndex = undefined
    for (var i = 1; i < text.length; i++) {
      if (text.charAt(i) === ' ') {
        spaceIndex = i
      }
      subtext = text.substr(0, i + 1)
      textWidth = internal.tickTextCharSize.w * subtext.length
      // if text width gets over tick width, split by space index or crrent index
      if (maxWidth < textWidth) {
        return split(
          splitted.concat(text.substr(0, spaceIndex ? spaceIndex : i)),
          text.slice(spaceIndex ? spaceIndex + 1 : i)
        )
      }
    }
    return splitted.concat(text)
  }

  return split(splitted, tickText + '')
}
AxisInternal.prototype.ellipsify = function(splitted, max) {
  if (splitted.length <= max) {
    return splitted
  }

  var ellipsified = splitted.slice(0, max)
  var remaining = 3
  for (var i = max - 1; i >= 0; i--) {
    var available = ellipsified[i].length

    ellipsified[i] = ellipsified[i]
      .substr(0, available - remaining)
      .padEnd(available, '.')

    remaining -= available

    if (remaining <= 0) {
      break
    }
  }

  return ellipsified
}
AxisInternal.prototype.updateTickLength = function() {
  var internal = this
  internal.tickLength =
    Math.max(internal.innerTickSize, 0) + internal.tickPadding
}
AxisInternal.prototype.lineY2 = function(d) {
  var internal = this,
    tickPosition =
      internal.scale(d) + (internal.tickCentered ? 0 : internal.tickOffset)
  return internal.range[0] < tickPosition && tickPosition < internal.range[1]
    ? internal.innerTickSize
    : 0
}
AxisInternal.prototype.textY = function() {
  var internal = this,
    rotate = internal.tickTextRotate
  return rotate
    ? 11.5 - 2.5 * (rotate / 15) * (rotate > 0 ? 1 : -1)
    : internal.tickLength
}
AxisInternal.prototype.textTransform = function() {
  var internal = this,
    rotate = internal.tickTextRotate
  return rotate ? 'rotate(' + rotate + ')' : ''
}
AxisInternal.prototype.textTextAnchor = function() {
  var internal = this,
    rotate = internal.tickTextRotate
  return rotate ? (rotate > 0 ? 'start' : 'end') : 'middle'
}
AxisInternal.prototype.tspanDx = function() {
  var internal = this,
    rotate = internal.tickTextRotate
  return rotate ? 8 * Math.sin(Math.PI * (rotate / 180)) : 0
}
AxisInternal.prototype.tspanDy = function(d, i) {
  var internal = this,
    dy = internal.tickTextCharSize.h
  if (i === 0) {
    if (internal.isVertical()) {
      dy = -((d.length - 1) * (internal.tickTextCharSize.h / 2) - 3)
    } else {
      dy = '.71em'
    }
  }
  return dy
}

AxisInternal.prototype.generateAxis = function() {
  var internal = this,
    d3 = internal.d3,
    params = internal.params
  function axis(g, transition) {
    var self
    g.each(function() {
      var g = (axis.g = d3.select(this))

      var scale0 = this.__chart__ || internal.scale,
        scale1 = (this.__chart__ = internal.copyScale())

      var ticksValues = internal.tickValues
          ? internal.tickValues
          : internal.generateTicks(scale1),
        ticks = g.selectAll('.tick').data(ticksValues, scale1),
        tickEnter = ticks
          .enter()
          .insert('g', '.domain')
          .attr('class', 'tick')
          .style('opacity', 1e-6),
        // MEMO: No exit transition. The reason is this transition affects max tick width calculation because old tick will be included in the ticks.
        tickExit = ticks.exit().remove(),
        tickUpdate = ticks.merge(tickEnter),
        tickTransform,
        tickX,
        tickY

      if (params.isCategory) {
        internal.tickOffset = Math.ceil((scale1(1) - scale1(0)) / 2)
        tickX = internal.tickCentered ? 0 : internal.tickOffset
        tickY = internal.tickCentered ? internal.tickOffset : 0
      } else {
        internal.tickOffset = tickX = 0
      }

      internal.updateRange()
      internal.updateTickLength()
      internal.updateTickTextCharSize(g.select('.tick'))

      var lineUpdate = tickUpdate
          .select('line')
          .merge(tickEnter.append('line')),
        textUpdate = tickUpdate.select('text').merge(tickEnter.append('text'))

      var tspans = tickUpdate
          .selectAll('text')
          .selectAll('tspan')
          .data(function(d, i) {
            return internal.tspanData(d, i, scale1)
          }),
        tspanEnter = tspans.enter().append('tspan'),
        tspanUpdate = tspanEnter.merge(tspans).text(function(d) {
          return d.splitted
        })
      tspans.exit().remove()

      var path = g.selectAll('.domain').data([0]),
        pathUpdate = path
          .enter()
          .append('path')
          .merge(path)
          .attr('class', 'domain')

      // TODO: each attr should be one function and change its behavior by internal.orient, probably
      switch (internal.orient) {
        case 'bottom': {
          tickTransform = internal.axisX
          lineUpdate
            .attr('x1', tickX)
            .attr('x2', tickX)
            .attr('y2', function(d, i) {
              return internal.lineY2(d, i)
            })
          textUpdate
            .attr('x', 0)
            .attr('y', function(d, i) {
              return internal.textY(d, i)
            })
            .attr('transform', function(d, i) {
              return internal.textTransform(d, i)
            })
            .style('text-anchor', function(d, i) {
              return internal.textTextAnchor(d, i)
            })
          tspanUpdate
            .attr('x', 0)
            .attr('dy', function(d, i) {
              return internal.tspanDy(d, i)
            })
            .attr('dx', function(d, i) {
              return internal.tspanDx(d, i)
            })
          pathUpdate.attr(
            'd',
            'M' +
              internal.range[0] +
              ',' +
              internal.outerTickSize +
              'V0H' +
              internal.range[1] +
              'V' +
              internal.outerTickSize
          )
          break
        }
        case 'top': {
          // TODO: rotated tick text
          tickTransform = internal.axisX
          lineUpdate
            .attr('x1', tickX)
            .attr('x2', tickX)
            .attr('y2', function(d, i) {
              return -1 * internal.lineY2(d, i)
            })
          textUpdate
            .attr('x', 0)
            .attr('y', function(d, i) {
              return (
                -1 * internal.textY(d, i) -
                (params.isCategory ? 2 : internal.tickLength - 2)
              )
            })
            .attr('transform', function(d, i) {
              return internal.textTransform(d, i)
            })
            .style('text-anchor', function(d, i) {
              return internal.textTextAnchor(d, i)
            })
          tspanUpdate
            .attr('x', 0)
            .attr('dy', function(d, i) {
              return internal.tspanDy(d, i)
            })
            .attr('dx', function(d, i) {
              return internal.tspanDx(d, i)
            })
          pathUpdate.attr(
            'd',
            'M' +
              internal.range[0] +
              ',' +
              -internal.outerTickSize +
              'V0H' +
              internal.range[1] +
              'V' +
              -internal.outerTickSize
          )
          break
        }
        case 'left': {
          tickTransform = internal.axisY
          lineUpdate
            .attr('x2', -internal.innerTickSize)
            .attr('y1', tickY)
            .attr('y2', tickY)
          textUpdate
            .attr('x', -internal.tickLength)
            .attr('y', internal.tickOffset)
            .style('text-anchor', 'end')
          tspanUpdate
            .attr('x', -internal.tickLength)
            .attr('dy', function(d, i) {
              return internal.tspanDy(d, i)
            })
          pathUpdate.attr(
            'd',
            'M' +
              -internal.outerTickSize +
              ',' +
              internal.range[0] +
              'H0V' +
              internal.range[1] +
              'H' +
              -internal.outerTickSize
          )
          break
        }
        case 'right': {
          tickTransform = internal.axisY
          lineUpdate
            .attr('x2', internal.innerTickSize)
            .attr('y1', tickY)
            .attr('y2', tickY)
          textUpdate
            .attr('x', internal.tickLength)
            .attr('y', internal.tickOffset)
            .style('text-anchor', 'start')
          tspanUpdate.attr('x', internal.tickLength).attr('dy', function(d, i) {
            return internal.tspanDy(d, i)
          })
          pathUpdate.attr(
            'd',
            'M' +
              internal.outerTickSize +
              ',' +
              internal.range[0] +
              'H0V' +
              internal.range[1] +
              'H' +
              internal.outerTickSize
          )
          break
        }
      }
      if (scale1.rangeBand) {
        var x = scale1,
          dx = x.rangeBand() / 2
        scale0 = scale1 = function(d) {
          return x(d) + dx
        }
      } else if (scale0.rangeBand) {
        scale0 = scale1
      } else {
        tickExit.call(tickTransform, scale1, internal.tickOffset)
      }
      tickEnter.call(tickTransform, scale0, internal.tickOffset)
      self = (transition ? tickUpdate.transition(transition) : tickUpdate)
        .style('opacity', 1)
        .call(tickTransform, scale1, internal.tickOffset)
    })
    return self
  }
  axis.scale = function(x) {
    if (!arguments.length) {
      return internal.scale
    }
    internal.scale = x
    return axis
  }
  axis.orient = function(x) {
    if (!arguments.length) {
      return internal.orient
    }
    internal.orient =
      x in { top: 1, right: 1, bottom: 1, left: 1 } ? x + '' : 'bottom'
    return axis
  }
  axis.tickFormat = function(format) {
    if (!arguments.length) {
      return internal.tickFormat
    }
    internal.tickFormat = format
    return axis
  }
  axis.tickCentered = function(isCentered) {
    if (!arguments.length) {
      return internal.tickCentered
    }
    internal.tickCentered = isCentered
    return axis
  }
  axis.tickOffset = function() {
    return internal.tickOffset
  }
  axis.tickInterval = function() {
    var interval, length
    if (params.isCategory) {
      interval = internal.tickOffset * 2
    } else {
      length =
        axis.g
          .select('path.domain')
          .node()
          .getTotalLength() -
        internal.outerTickSize * 2
      interval = length / axis.g.selectAll('line').size()
    }
    return interval === Infinity ? 0 : interval
  }
  axis.ticks = function() {
    if (!arguments.length) {
      return internal.tickArguments
    }
    internal.tickArguments = arguments
    return axis
  }
  axis.tickCulling = function(culling) {
    if (!arguments.length) {
      return internal.tickCulling
    }
    internal.tickCulling = culling
    return axis
  }
  axis.tickValues = function(x) {
    if (typeof x === 'function') {
      internal.tickValues = function() {
        return x(internal.scale.domain())
      }
    } else {
      if (!arguments.length) {
        return internal.tickValues
      }
      internal.tickValues = x
    }
    return axis
  }
  return axis
}

export { AxisInternal }
