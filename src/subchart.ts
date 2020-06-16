import CLASS from './class'
import { ChartInternal } from './core'
import { isFunction } from './util'

ChartInternal.prototype.initBrush = function(scale) {
  const $$ = this,
    d3 = $$.d3
  // TODO: dynamically change brushY/brushX according to axis_rotated.
  $$.brush = ($$.config.axis_rotated ? d3.brushY() : d3.brushX())
    .on('brush', function() {
      const event = d3.event.sourceEvent
      if (event && event.type === 'zoom') {
        return
      }
      $$.redrawForBrush()
    })
    .on('end', function() {
      const event = d3.event.sourceEvent
      if (event && event.type === 'zoom') {
        return
      }
      if ($$.brush.empty() && event && event.type !== 'end') {
        $$.brush.clear()
      }
    })
  $$.brush.updateExtent = function() {
    const range = this.scale.range()
    let extent
    if ($$.config.axis_rotated) {
      extent = [
        [0, range[0]],
        [$$.width2, range[1]]
      ]
    } else {
      extent = [
        [range[0], 0],
        [range[1], $$.height2]
      ]
    }
    this.extent(extent)
    return this
  }
  $$.brush.updateScale = function(scale) {
    this.scale = scale
    return this
  }
  $$.brush.update = function(scale) {
    this.updateScale(scale || $$.subX).updateExtent()
    $$.context.select('.' + CLASS.brush).call(this)
  }
  $$.brush.clear = function() {
    $$.context.select('.' + CLASS.brush).call($$.brush.move, null)
  }
  $$.brush.selection = function() {
    return d3.brushSelection($$.context.select('.' + CLASS.brush).node())
  }
  $$.brush.selectionAsValue = function(selectionAsValue, withTransition) {
    let selection, brush
    if (selectionAsValue) {
      if ($$.context) {
        selection = [
          this.scale(selectionAsValue[0]),
          this.scale(selectionAsValue[1])
        ]
        brush = $$.context.select('.' + CLASS.brush)
        if (withTransition) {
          brush = brush.transition()
        }
        $$.brush.move(brush, selection)
      }
      return []
    }
    selection = $$.brush.selection() || [0, 0]
    return [this.scale.invert(selection[0]), this.scale.invert(selection[1])]
  }
  $$.brush.empty = function() {
    const selection = $$.brush.selection()
    return !selection || selection[0] === selection[1]
  }
  return $$.brush.updateScale(scale)
}
ChartInternal.prototype.initSubchart = function() {
  const $$ = this,
    config = $$.config,
    context = ($$.context = $$.svg
      .append('g')
      .attr('transform', $$.getTranslate('context')))

  // set style
  context.style('visibility', 'visible')

  // Define g for chart area
  context
    .append('g')
    .attr('clip-path', $$.clipPathForSubchart)
    .attr('class', CLASS.chart)

  // Define g for bar chart area
  context
    .select('.' + CLASS.chart)
    .append('g')
    .attr('class', CLASS.chartBars)

  // Define g for line chart area
  context
    .select('.' + CLASS.chart)
    .append('g')
    .attr('class', CLASS.chartLines)

  // Add extent rect for Brush
  context
    .append('g')
    .attr('clip-path', $$.clipPath)
    .attr('class', CLASS.brush)

  // ATTENTION: This must be called AFTER chart added
  // Add Axis
  $$.axes.subx = context
    .append('g')
    .attr('class', CLASS.axisX)
    .attr('transform', $$.getTranslate('subx'))
    .attr('clip-path', config.axis_rotated ? '' : $$.clipPathForXAxis)
}
ChartInternal.prototype.initSubchartBrush = function() {
  const $$ = this
  // Add extent rect for Brush
  $$.initBrush($$.subX).updateExtent()
  $$.context.select('.' + CLASS.brush).call($$.brush)
}
ChartInternal.prototype.updateTargetsForSubchart = function(targets) {
  const $$ = this
  const context = $$.context
  const config = $$.config
  const classChartBar = $$.classChartBar.bind($$)
  const classBars = $$.classBars.bind($$)
  const classChartLine = $$.classChartLine.bind($$)
  const classLines = $$.classLines.bind($$)
  const classAreas = $$.classAreas.bind($$)

  //-- Bar --//
  const contextBar = context
    .select('.' + CLASS.chartBars)
    .selectAll('.' + CLASS.chartBar)
    .data(targets)
  const contextBarEnter = contextBar
    .enter()
    .append('g')
    .style('opacity', 0)
  contextBarEnter.merge(contextBar).attr('class', classChartBar)
  // Bars for each data
  contextBarEnter.append('g').attr('class', classBars)

  //-- Line --//
  const contextLine = context
    .select('.' + CLASS.chartLines)
    .selectAll('.' + CLASS.chartLine)
    .data(targets)
  const contextLineEnter = contextLine
    .enter()
    .append('g')
    .style('opacity', 0)
  contextLineEnter.merge(contextLine).attr('class', classChartLine)
  // Lines for each data
  contextLineEnter.append('g').attr('class', classLines)
  // Area
  contextLineEnter.append('g').attr('class', classAreas)

  //-- Brush --//
  context
    .selectAll('.' + CLASS.brush + ' rect')
    .attr(
      config.axis_rotated ? 'width' : 'height',
      config.axis_rotated ? $$.width2 : $$.height2
    )
}
ChartInternal.prototype.updateBarForSubchart = function(durationForExit) {
  const $$ = this
  const contextBar = $$.context
    .selectAll('.' + CLASS.bars)
    .selectAll('.' + CLASS.bar)
    .data($$.barData.bind($$))
  const contextBarEnter = contextBar
    .enter()
    .append('path')
    .attr('class', $$.classBar.bind($$))
    .style('stroke', 'none')
    .style('fill', $$.color)
  contextBar
    .exit()
    .transition()
    .duration(durationForExit)
    .style('opacity', 0)
    .remove()
  $$.contextBar = contextBarEnter
    .merge(contextBar)
    .style('opacity', $$.initialOpacity.bind($$))
}
ChartInternal.prototype.redrawBarForSubchart = function(
  drawBarOnSub,
  withTransition,
  duration
) {
  (withTransition
    ? this.contextBar.transition(Math.random().toString()).duration(duration)
    : this.contextBar
  )
    .attr('d', drawBarOnSub)
    .style('opacity', 1)
}
ChartInternal.prototype.updateLineForSubchart = function(durationForExit) {
  const $$ = this
  const contextLine = $$.context
    .selectAll('.' + CLASS.lines)
    .selectAll('.' + CLASS.line)
    .data($$.lineData.bind($$))
  const contextLineEnter = contextLine
    .enter()
    .append('path')
    .attr('class', $$.classLine.bind($$))
    .style('stroke', $$.color)
  contextLine
    .exit()
    .transition()
    .duration(durationForExit)
    .style('opacity', 0)
    .remove()
  $$.contextLine = contextLineEnter
    .merge(contextLine)
    .style('opacity', $$.initialOpacity.bind($$))
}
ChartInternal.prototype.redrawLineForSubchart = function(
  drawLineOnSub,
  withTransition,
  duration
) {
  (withTransition
    ? this.contextLine.transition(Math.random().toString()).duration(duration)
    : this.contextLine
  )
    .attr('d', drawLineOnSub)
    .style('opacity', 1)
}
ChartInternal.prototype.updateAreaForSubchart = function(durationForExit) {
  const $$ = this,
    d3 = $$.d3
  const contextArea = $$.context
    .selectAll('.' + CLASS.areas)
    .selectAll('.' + CLASS.area)
    .data($$.lineData.bind($$))
  const contextAreaEnter = contextArea
    .enter()
    .append('path')
    .attr('class', $$.classArea.bind($$))
    .style('fill', $$.color)
    .style('opacity', function() {
      $$.orgAreaOpacity = +d3.select(this).style('opacity')
      return 0
    })
  contextArea
    .exit()
    .transition()
    .duration(durationForExit)
    .style('opacity', 0)
    .remove()
  $$.contextArea = contextAreaEnter.merge(contextArea).style('opacity', 0)
}
ChartInternal.prototype.redrawAreaForSubchart = function(
  drawAreaOnSub,
  withTransition,
  duration
) {
  (withTransition
    ? this.contextArea.transition(Math.random().toString()).duration(duration)
    : this.contextArea
  )
    .attr('d', drawAreaOnSub)
    .style('fill', this.color)
    .style('opacity', this.orgAreaOpacity)
}
ChartInternal.prototype.redrawSubchart = function(
  withSubchart,
  transitions,
  duration,
  durationForExit,
  areaIndices,
  barIndices,
  lineIndices
) {
  const $$ = this
  const d3 = $$.d3
  let drawAreaOnSub,
    drawBarOnSub,
    drawLineOnSub

  // reflect main chart to extent on subchart if zoomed
  if (d3.event && d3.event.type === 'zoom') {
    $$.brush.selectionAsValue($$.x.orgDomain())
  }
  // update subchart elements if needed
  if (withSubchart) {
    // extent rect
    if (!$$.brush.empty()) {
      $$.brush.selectionAsValue($$.x.orgDomain())
    }
    // setup drawer - MEMO: this must be called after axis updated
    drawAreaOnSub = $$.generateDrawArea(areaIndices, true)
    drawBarOnSub = $$.generateDrawBar(barIndices, true)
    drawLineOnSub = $$.generateDrawLine(lineIndices, true)

    $$.updateBarForSubchart(duration)
    $$.updateLineForSubchart(duration)
    $$.updateAreaForSubchart(duration)

    $$.redrawBarForSubchart(drawBarOnSub, duration, duration)
    $$.redrawLineForSubchart(drawLineOnSub, duration, duration)
    $$.redrawAreaForSubchart(drawAreaOnSub, duration, duration)
  }
}
ChartInternal.prototype.redrawForBrush = function() {
  const $$ = this
  const x = $$.x
  const d3 = $$.d3
  $$.redraw({
    withTransition: false,
    withY: $$.config.zoom_rescale,
    withSubchart: false,
    withUpdateXDomain: true,
    withEventRect: false,
    withDimension: false
  })
  // update zoom transation binded to event rect
  const s = d3.event.selection || $$.brush.scale.range()
  $$.main
    .select('.' + CLASS.eventRect)
    .call(
      $$.zoom.transform,
      d3.zoomIdentity.scale($$.width / (s[1] - s[0])).translate(-s[0], 0)
    )
  $$.config.subchart_onbrush.call($$.api, x.orgDomain())
}
ChartInternal.prototype.transformContext = function(
  withTransition,
  transitions
) {
  const $$ = this
  let subXAxis
  if (transitions && transitions.axisSubX) {
    subXAxis = transitions.axisSubX
  } else {
    subXAxis = $$.context.select('.' + CLASS.axisX)
    if (withTransition) {
      subXAxis = subXAxis.transition()
    }
  }
  $$.context.attr('transform', $$.getTranslate('context'))
  subXAxis.attr('transform', $$.getTranslate('subx'))
}
ChartInternal.prototype.getDefaultSelection = function() {
  const $$ = this
  const config = $$.config
  let selection = isFunction(config.axis_x_selection)
      ? config.axis_x_selection($$.getXDomain($$.data.targets))
      : config.axis_x_selection
  if ($$.isTimeSeries()) {
    selection = [$$.parseDate(selection[0]), $$.parseDate(selection[1])]
  }
  return selection
}

ChartInternal.prototype.removeSubchart = function() {
  const $$ = this

  $$.brush = null
  $$.context.remove()
  $$.context = null
}
