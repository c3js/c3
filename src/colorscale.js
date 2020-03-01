import { ChartInternal } from './core'
import CLASS from './class'
import { isFunction, getBBox } from './util'

function powerOfTen(d) {
  return d / Math.pow(10, Math.ceil(Math.log(d) / Math.LN10 - 1e-12)) === 1
}

ChartInternal.prototype.drawColorScale = function() {
  var $$ = this,
    d3 = $$.d3,
    config = $$.config,
    target = $$.data.targets[0],
    barWidth,
    barHeight,
    axis,
    points,
    legendAxis,
    axisScale,
    inverseScale,
    height

  barWidth = !isNaN(config.stanford_scaleWidth)
    ? config.stanford_scaleWidth
    : 20
  barHeight = 5

  if (barHeight < 0 || barWidth < 0) {
    throw Error("Colorscale's barheight and barwidth must be greater than 0.")
  }

  height =
    $$.height - config.stanford_padding.bottom - config.stanford_padding.top

  points = d3.range(config.stanford_padding.bottom, height, barHeight)

  inverseScale = d3
    .scaleSequential(target.colors)
    .domain([points[points.length - 1], points[0]])

  if ($$.colorScale) {
    $$.colorScale.remove()
  }

  $$.colorScale = $$.svg
    .append('g')
    .attr('width', 50)
    .attr('height', height)
    .attr('class', CLASS.colorScale)

  $$.colorScale
    .append('g')
    .attr('transform', `translate(0, ${config.stanford_padding.top})`)
    .selectAll('bars')
    .data(points)
    .enter()
    .append('rect')
    .attr('y', (d, i) => i * barHeight)
    .attr('x', 0)
    .attr('width', barWidth)
    .attr('height', barHeight)
    .attr('fill', function(d) {
      return inverseScale(d)
    })

  // Legend Axis
  axisScale = d3
    .scaleLog()
    .domain([target.minEpochs, target.maxEpochs])
    .range([
      points[0] +
        config.stanford_padding.top +
        points[points.length - 1] +
        barHeight -
        1,
      points[0] + config.stanford_padding.top
    ])

  legendAxis = d3.axisRight(axisScale)

  if (config.stanford_scaleFormat === 'pow10') {
    legendAxis.tickValues([1, 10, 100, 1000, 10000, 100000, 1000000, 10000000])
  } else if (isFunction(config.stanford_scaleFormat)) {
    legendAxis.tickFormat(config.stanford_scaleFormat)
  } else {
    legendAxis.tickFormat(d3.format('d'))
  }

  if (isFunction(config.stanford_scaleValues)) {
    legendAxis.tickValues(
      config.stanford_scaleValues(target.minEpochs, target.maxEpochs)
    )
  }

  // Draw Axis
  axis = $$.colorScale
    .append('g')
    .attr('class', 'legend axis')
    .attr('transform', `translate(${barWidth},0)`)
    .call(legendAxis)

  if (config.stanford_scaleFormat === 'pow10') {
    axis
      .selectAll('.tick text')
      .text(null)
      .filter(powerOfTen)
      .text(10)
      .append('tspan')
      .attr('dy', '-.7em') // https://bl.ocks.org/mbostock/6738229
      .text(function(d) {
        return Math.round(Math.log(d) / Math.LN10)
      })
  }

  $$.colorScale.attr(
    'transform',
    `translate(${$$.currentWidth - $$.xForColorScale()}, 0)`
  )
}

ChartInternal.prototype.xForColorScale = function() {
  var $$ = this

  return $$.config.stanford_padding.right + getBBox($$.colorScale.node()).width
}

ChartInternal.prototype.getColorScalePadding = function() {
  var $$ = this
  return $$.xForColorScale() + $$.config.stanford_padding.left + 20
}
