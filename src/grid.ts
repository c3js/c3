import CLASS from './class'
import { ChartInternal } from './core'
import { isValue } from './util'

ChartInternal.prototype.initGrid = function() {
  var $$ = this,
    config = $$.config,
    d3 = $$.d3
  $$.grid = $$.main
    .append('g')
    .attr('clip-path', $$.clipPathForGrid)
    .attr('class', CLASS.grid)
  if (config.grid_x_show) {
    $$.grid.append('g').attr('class', CLASS.xgrids)
  }
  if (config.grid_y_show) {
    $$.grid.append('g').attr('class', CLASS.ygrids)
  }
  if (config.grid_focus_show) {
    $$.grid
      .append('g')
      .attr('class', CLASS.xgridFocus)
      .append('line')
      .attr('class', CLASS.xgridFocus)
  }
  $$.xgrid = d3.selectAll([])
  if (!config.grid_lines_front) {
    $$.initGridLines()
  }
}
ChartInternal.prototype.initGridLines = function() {
  var $$ = this,
    d3 = $$.d3
  $$.gridLines = $$.main
    .append('g')
    .attr('clip-path', $$.clipPathForGrid)
    .attr('class', CLASS.grid + ' ' + CLASS.gridLines)
  $$.gridLines.append('g').attr('class', CLASS.xgridLines)
  $$.gridLines.append('g').attr('class', CLASS.ygridLines)
  $$.xgridLines = d3.selectAll([])
}
ChartInternal.prototype.updateXGrid = function(withoutUpdate) {
  var $$ = this,
    config = $$.config,
    d3 = $$.d3,
    xgridData = $$.generateGridData(config.grid_x_type, $$.x),
    tickOffset = $$.isCategorized() ? $$.xAxis.tickOffset() : 0

  $$.xgridAttr = config.axis_rotated
    ? {
        x1: 0,
        x2: $$.width,
        y1: function(d) {
          return $$.x(d) - tickOffset
        },
        y2: function(d) {
          return $$.x(d) - tickOffset
        }
      }
    : {
        x1: function(d) {
          return $$.x(d) + tickOffset
        },
        x2: function(d) {
          return $$.x(d) + tickOffset
        },
        y1: 0,
        y2: $$.height
      }
  $$.xgridAttr.opacity = function() {
    var pos = +d3.select(this).attr(config.axis_rotated ? 'y1' : 'x1')
    return pos === (config.axis_rotated ? $$.height : 0) ? 0 : 1
  }

  var xgrid = $$.main
    .select('.' + CLASS.xgrids)
    .selectAll('.' + CLASS.xgrid)
    .data(xgridData)
  var xgridEnter = xgrid
    .enter()
    .append('line')
    .attr('class', CLASS.xgrid)
    .attr('x1', $$.xgridAttr.x1)
    .attr('x2', $$.xgridAttr.x2)
    .attr('y1', $$.xgridAttr.y1)
    .attr('y2', $$.xgridAttr.y2)
    .style('opacity', 0)
  $$.xgrid = xgridEnter.merge(xgrid)
  if (!withoutUpdate) {
    $$.xgrid
      .attr('x1', $$.xgridAttr.x1)
      .attr('x2', $$.xgridAttr.x2)
      .attr('y1', $$.xgridAttr.y1)
      .attr('y2', $$.xgridAttr.y2)
      .style('opacity', $$.xgridAttr.opacity)
  }
  xgrid.exit().remove()
}

ChartInternal.prototype.updateYGrid = function() {
  var $$ = this,
    config = $$.config,
    gridValues = $$.yAxis.tickValues() || $$.y.ticks(config.grid_y_ticks)
  var ygrid = $$.main
    .select('.' + CLASS.ygrids)
    .selectAll('.' + CLASS.ygrid)
    .data(gridValues)
  var ygridEnter = ygrid
    .enter()
    .append('line')
    // TODO: x1, x2, y1, y2, opacity need to be set here maybe
    .attr('class', CLASS.ygrid)
  $$.ygrid = ygridEnter.merge(ygrid)
  $$.ygrid
    .attr('x1', config.axis_rotated ? $$.y : 0)
    .attr('x2', config.axis_rotated ? $$.y : $$.width)
    .attr('y1', config.axis_rotated ? 0 : $$.y)
    .attr('y2', config.axis_rotated ? $$.height : $$.y)
  ygrid.exit().remove()
  $$.smoothLines($$.ygrid, 'grid')
}

ChartInternal.prototype.gridTextAnchor = function(d) {
  return d.position ? d.position : 'end'
}
ChartInternal.prototype.gridTextDx = function(d) {
  return d.position === 'start' ? 4 : d.position === 'middle' ? 0 : -4
}
ChartInternal.prototype.xGridTextX = function(d) {
  return d.position === 'start'
    ? -this.height
    : d.position === 'middle'
    ? -this.height / 2
    : 0
}
ChartInternal.prototype.yGridTextX = function(d) {
  return d.position === 'start'
    ? 0
    : d.position === 'middle'
    ? this.width / 2
    : this.width
}
ChartInternal.prototype.updateGrid = function(duration) {
  var $$ = this,
    main = $$.main,
    config = $$.config,
    xgridLine,
    xgridLineEnter,
    ygridLine,
    ygridLineEnter,
    xv = $$.xv.bind($$),
    yv = $$.yv.bind($$),
    xGridTextX = $$.xGridTextX.bind($$),
    yGridTextX = $$.yGridTextX.bind($$)

  // hide if arc type
  $$.grid.style('visibility', $$.hasArcType() ? 'hidden' : 'visible')

  main.select('line.' + CLASS.xgridFocus).style('visibility', 'hidden')
  if (config.grid_x_show) {
    $$.updateXGrid()
  }
  xgridLine = main
    .select('.' + CLASS.xgridLines)
    .selectAll('.' + CLASS.xgridLine)
    .data(config.grid_x_lines)
  // enter
  xgridLineEnter = xgridLine
    .enter()
    .append('g')
    .attr('class', function(d) {
      return CLASS.xgridLine + (d['class'] ? ' ' + d['class'] : '')
    })
  xgridLineEnter
    .append('line')
    .attr('x1', config.axis_rotated ? 0 : xv)
    .attr('x2', config.axis_rotated ? $$.width : xv)
    .attr('y1', config.axis_rotated ? xv : 0)
    .attr('y2', config.axis_rotated ? xv : $$.height)
    .style('opacity', 0)
  xgridLineEnter
    .append('text')
    .attr('text-anchor', $$.gridTextAnchor)
    .attr('transform', config.axis_rotated ? '' : 'rotate(-90)')
    .attr('x', config.axis_rotated ? yGridTextX : xGridTextX)
    .attr('y', xv)
    .attr('dx', $$.gridTextDx)
    .attr('dy', -5)
    .style('opacity', 0)
  // udpate
  $$.xgridLines = xgridLineEnter.merge(xgridLine)
  // done in d3.transition() of the end of this function
  // exit
  xgridLine
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove()

  // Y-Grid
  if (config.grid_y_show) {
    $$.updateYGrid()
  }
  ygridLine = main
    .select('.' + CLASS.ygridLines)
    .selectAll('.' + CLASS.ygridLine)
    .data(config.grid_y_lines)
  // enter
  ygridLineEnter = ygridLine
    .enter()
    .append('g')
    .attr('class', function(d) {
      return CLASS.ygridLine + (d['class'] ? ' ' + d['class'] : '')
    })
  ygridLineEnter
    .append('line')
    .attr('x1', config.axis_rotated ? yv : 0)
    .attr('x2', config.axis_rotated ? yv : $$.width)
    .attr('y1', config.axis_rotated ? 0 : yv)
    .attr('y2', config.axis_rotated ? $$.height : yv)
    .style('opacity', 0)
  ygridLineEnter
    .append('text')
    .attr('text-anchor', $$.gridTextAnchor)
    .attr('transform', config.axis_rotated ? 'rotate(-90)' : '')
    .attr('x', config.axis_rotated ? xGridTextX : yGridTextX)
    .attr('y', yv)
    .attr('dx', $$.gridTextDx)
    .attr('dy', -5)
    .style('opacity', 0)
  // update
  $$.ygridLines = ygridLineEnter.merge(ygridLine)
  $$.ygridLines
    .select('line')
    .transition()
    .duration(duration)
    .attr('x1', config.axis_rotated ? yv : 0)
    .attr('x2', config.axis_rotated ? yv : $$.width)
    .attr('y1', config.axis_rotated ? 0 : yv)
    .attr('y2', config.axis_rotated ? $$.height : yv)
    .style('opacity', 1)
  $$.ygridLines
    .select('text')
    .transition()
    .duration(duration)
    .attr(
      'x',
      config.axis_rotated ? $$.xGridTextX.bind($$) : $$.yGridTextX.bind($$)
    )
    .attr('y', yv)
    .text(function(d) {
      return d.text
    })
    .style('opacity', 1)
  // exit
  ygridLine
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove()
}
ChartInternal.prototype.redrawGrid = function(withTransition, transition) {
  var $$ = this,
    config = $$.config,
    xv = $$.xv.bind($$),
    lines = $$.xgridLines.select('line'),
    texts = $$.xgridLines.select('text')
  return [
    (withTransition ? lines.transition(transition) : lines)
      .attr('x1', config.axis_rotated ? 0 : xv)
      .attr('x2', config.axis_rotated ? $$.width : xv)
      .attr('y1', config.axis_rotated ? xv : 0)
      .attr('y2', config.axis_rotated ? xv : $$.height)
      .style('opacity', 1),
    (withTransition ? texts.transition(transition) : texts)
      .attr(
        'x',
        config.axis_rotated ? $$.yGridTextX.bind($$) : $$.xGridTextX.bind($$)
      )
      .attr('y', xv)
      .text(function(d) {
        return d.text
      })
      .style('opacity', 1)
  ]
}
ChartInternal.prototype.showXGridFocus = function(selectedData) {
  var $$ = this,
    config = $$.config,
    dataToShow = selectedData.filter(function(d) {
      return d && isValue(d.value)
    }),
    focusEl = $$.main.selectAll('line.' + CLASS.xgridFocus),
    xx = $$.xx.bind($$)
  if (!config.tooltip_show) {
    return
  }
  // Hide when stanford plot exists
  if ($$.hasType('stanford') || $$.hasArcType()) {
    return
  }
  focusEl
    .style('visibility', 'visible')
    .data([dataToShow[0]])
    .attr(config.axis_rotated ? 'y1' : 'x1', xx)
    .attr(config.axis_rotated ? 'y2' : 'x2', xx)
  $$.smoothLines(focusEl, 'grid')
}
ChartInternal.prototype.hideXGridFocus = function() {
  this.main.select('line.' + CLASS.xgridFocus).style('visibility', 'hidden')
}
ChartInternal.prototype.updateXgridFocus = function() {
  var $$ = this,
    config = $$.config
  $$.main
    .select('line.' + CLASS.xgridFocus)
    .attr('x1', config.axis_rotated ? 0 : -10)
    .attr('x2', config.axis_rotated ? $$.width : -10)
    .attr('y1', config.axis_rotated ? -10 : 0)
    .attr('y2', config.axis_rotated ? -10 : $$.height)
}
ChartInternal.prototype.generateGridData = function(type, scale) {
  var $$ = this,
    gridData = [],
    xDomain,
    firstYear,
    lastYear,
    i,
    tickNum = $$.main
      .select('.' + CLASS.axisX)
      .selectAll('.tick')
      .size()
  if (type === 'year') {
    xDomain = $$.getXDomain()
    firstYear = xDomain[0].getFullYear()
    lastYear = xDomain[1].getFullYear()
    for (i = firstYear; i <= lastYear; i++) {
      gridData.push(new Date(i + '-01-01 00:00:00'))
    }
  } else {
    gridData = scale.ticks(10)
    if (gridData.length > tickNum) {
      // use only int
      gridData = gridData.filter(function(d) {
        return ('' + d).indexOf('.') < 0
      })
    }
  }
  return gridData
}
ChartInternal.prototype.getGridFilterToRemove = function(params) {
  return params
    ? function(line) {
        var found = false
        ;[].concat(params).forEach(function(param) {
          if (
            ('value' in param && line.value === param.value) ||
            ('class' in param && line['class'] === param['class'])
          ) {
            found = true
          }
        })
        return found
      }
    : function() {
        return true
      }
}
ChartInternal.prototype.removeGridLines = function(params, forX) {
  var $$ = this,
    config = $$.config,
    toRemove = $$.getGridFilterToRemove(params),
    toShow = function(line) {
      return !toRemove(line)
    },
    classLines = forX ? CLASS.xgridLines : CLASS.ygridLines,
    classLine = forX ? CLASS.xgridLine : CLASS.ygridLine
  $$.main
    .select('.' + classLines)
    .selectAll('.' + classLine)
    .filter(toRemove)
    .transition()
    .duration(config.transition_duration)
    .style('opacity', 0)
    .remove()
  if (forX) {
    config.grid_x_lines = config.grid_x_lines.filter(toShow)
  } else {
    config.grid_y_lines = config.grid_y_lines.filter(toShow)
  }
}
