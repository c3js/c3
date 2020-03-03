import CLASS from './class'
import { ChartInternal } from './core'
import { isValue } from './util'

ChartInternal.prototype.initRegion = function() {
  var $$ = this
  $$.region = $$.main
    .append('g')
    .attr('clip-path', $$.clipPath)
    .attr('class', CLASS.regions)
}
ChartInternal.prototype.updateRegion = function(duration) {
  var $$ = this,
    config = $$.config

  // hide if arc type
  $$.region.style('visibility', $$.hasArcType() ? 'hidden' : 'visible')

  var mainRegion = $$.main
    .select('.' + CLASS.regions)
    .selectAll('.' + CLASS.region)
    .data(config.regions)
  var g = mainRegion.enter().append('g')
  g.append('rect')
    .attr('x', $$.regionX.bind($$))
    .attr('y', $$.regionY.bind($$))
    .attr('width', $$.regionWidth.bind($$))
    .attr('height', $$.regionHeight.bind($$))
    .style('fill-opacity', function(d) {
      return isValue(d.opacity) ? d.opacity : 0.1
    })
  g.append('text').text($$.labelRegion.bind($$))
  $$.mainRegion = g.merge(mainRegion).attr('class', $$.classRegion.bind($$))
  mainRegion
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove()
}
ChartInternal.prototype.redrawRegion = function(withTransition, transition) {
  var $$ = this,
    regions = $$.mainRegion,
    regionLabels = $$.mainRegion.selectAll('text')
  return [
    (withTransition ? regions.transition(transition) : regions)
      .attr('x', $$.regionX.bind($$))
      .attr('y', $$.regionY.bind($$))
      .attr('width', $$.regionWidth.bind($$))
      .attr('height', $$.regionHeight.bind($$))
      .style('fill-opacity', function(d) {
        return isValue(d.opacity) ? d.opacity : 0.1
      }),
    (withTransition ? regionLabels.transition(transition) : regionLabels)
      .attr('x', $$.labelOffsetX.bind($$))
      .attr('y', $$.labelOffsetY.bind($$))
      .attr('transform', $$.labelTransform.bind($$))
      .attr('style', 'text-anchor: left;')
  ]
}
ChartInternal.prototype.regionX = function(d) {
  var $$ = this,
    config = $$.config,
    xPos,
    yScale = d.axis === 'y' ? $$.y : $$.y2
  if (d.axis === 'y' || d.axis === 'y2') {
    xPos = config.axis_rotated ? ('start' in d ? yScale(d.start) : 0) : 0
  } else {
    xPos = config.axis_rotated
      ? 0
      : 'start' in d
      ? $$.x($$.isTimeSeries() ? $$.parseDate(d.start) : d.start)
      : 0
  }
  return xPos
}
ChartInternal.prototype.regionY = function(d) {
  var $$ = this,
    config = $$.config,
    yPos,
    yScale = d.axis === 'y' ? $$.y : $$.y2
  if (d.axis === 'y' || d.axis === 'y2') {
    yPos = config.axis_rotated ? 0 : 'end' in d ? yScale(d.end) : 0
  } else {
    yPos = config.axis_rotated
      ? 'start' in d
        ? $$.x($$.isTimeSeries() ? $$.parseDate(d.start) : d.start)
        : 0
      : 0
  }
  return yPos
}
ChartInternal.prototype.regionWidth = function(d) {
  var $$ = this,
    config = $$.config,
    start = $$.regionX(d),
    end,
    yScale = d.axis === 'y' ? $$.y : $$.y2
  if (d.axis === 'y' || d.axis === 'y2') {
    end = config.axis_rotated
      ? 'end' in d
        ? yScale(d.end)
        : $$.width
      : $$.width
  } else {
    end = config.axis_rotated
      ? $$.width
      : 'end' in d
      ? $$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end)
      : $$.width
  }
  return end < start ? 0 : end - start
}
ChartInternal.prototype.regionHeight = function(d) {
  var $$ = this,
    config = $$.config,
    start = this.regionY(d),
    end,
    yScale = d.axis === 'y' ? $$.y : $$.y2
  if (d.axis === 'y' || d.axis === 'y2') {
    end = config.axis_rotated
      ? $$.height
      : 'start' in d
      ? yScale(d.start)
      : $$.height
  } else {
    end = config.axis_rotated
      ? 'end' in d
        ? $$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end)
        : $$.height
      : $$.height
  }
  return end < start ? 0 : end - start
}
ChartInternal.prototype.isRegionOnX = function(d) {
  return !d.axis || d.axis === 'x'
}
ChartInternal.prototype.labelRegion = function(d) {
  return 'label' in d ? d.label : ''
}
ChartInternal.prototype.labelTransform = function(d) {
  return 'vertical' in d && d.vertical ? 'rotate(90)' : ''
}
ChartInternal.prototype.labelOffsetX = function(d) {
  var paddingX = 'paddingX' in d ? d.paddingX : 3
  var paddingY = 'paddingY' in d ? d.paddingY : 3
  return 'vertical' in d && d.vertical
    ? this.regionY(d) + paddingY
    : this.regionX(d) + paddingX
}
ChartInternal.prototype.labelOffsetY = function(d) {
  var paddingX = 'paddingX' in d ? d.paddingX : 3
  var paddingY = 'paddingY' in d ? d.paddingY : 3
  return 'vertical' in d && d.vertical
    ? -(this.regionX(d) + paddingX)
    : this.regionY(d) + 10 + paddingY
}
