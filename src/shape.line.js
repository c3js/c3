import CLASS from './class'
import { ChartInternal } from './core'
import { isValue, isFunction, isUndefined, isDefined } from './util'

ChartInternal.prototype.initLine = function() {
  var $$ = this
  $$.main
    .select('.' + CLASS.chart)
    .append('g')
    .attr('class', CLASS.chartLines)
}
ChartInternal.prototype.updateTargetsForLine = function(targets) {
  var $$ = this,
    config = $$.config,
    mainLines,
    mainLineEnter,
    classChartLine = $$.classChartLine.bind($$),
    classLines = $$.classLines.bind($$),
    classAreas = $$.classAreas.bind($$),
    classCircles = $$.classCircles.bind($$),
    classFocus = $$.classFocus.bind($$)
  mainLines = $$.main
    .select('.' + CLASS.chartLines)
    .selectAll('.' + CLASS.chartLine)
    .data(targets)
    .attr('class', function(d) {
      return classChartLine(d) + classFocus(d)
    })
  mainLineEnter = mainLines
    .enter()
    .append('g')
    .attr('class', classChartLine)
    .style('opacity', 0)
    .style('pointer-events', 'none')
  // Lines for each data
  mainLineEnter.append('g').attr('class', classLines)
  // Areas
  mainLineEnter.append('g').attr('class', classAreas)
  // Circles for each data point on lines
  mainLineEnter.append('g').attr('class', function(d) {
    return $$.generateClass(CLASS.selectedCircles, d.id)
  })
  mainLineEnter
    .append('g')
    .attr('class', classCircles)
    .style('cursor', function(d) {
      return config.data_selection_isselectable(d) ? 'pointer' : null
    })
  // Update date for selected circles
  targets.forEach(function(t) {
    $$.main
      .selectAll('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(t.id))
      .selectAll('.' + CLASS.selectedCircle)
      .each(function(d) {
        d.value = t.values[d.index].value
      })
  })
  // MEMO: can not keep same color...
  //mainLineUpdate.exit().remove();
}
ChartInternal.prototype.updateLine = function(durationForExit) {
  var $$ = this
  var mainLine = $$.main
    .selectAll('.' + CLASS.lines)
    .selectAll('.' + CLASS.line)
    .data($$.lineData.bind($$))
  var mainLineEnter = mainLine
    .enter()
    .append('path')
    .attr('class', $$.classLine.bind($$))
    .style('stroke', $$.color)
  $$.mainLine = mainLineEnter
    .merge(mainLine)
    .style('opacity', $$.initialOpacity.bind($$))
    .style('shape-rendering', function(d) {
      return $$.isStepType(d) ? 'crispEdges' : ''
    })
    .attr('transform', null)
  mainLine
    .exit()
    .transition()
    .duration(durationForExit)
    .style('opacity', 0)
}
ChartInternal.prototype.redrawLine = function(
  drawLine,
  withTransition,
  transition
) {
  return [
    (withTransition ? this.mainLine.transition(transition) : this.mainLine)
      .attr('d', drawLine)
      .style('stroke', this.color)
      .style('opacity', 1)
  ]
}
ChartInternal.prototype.generateDrawLine = function(lineIndices, isSub) {
  var $$ = this,
    config = $$.config,
    line = $$.d3.line(),
    getPoints = $$.generateGetLinePoints(lineIndices, isSub),
    yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
    xValue = function(d) {
      return (isSub ? $$.subxx : $$.xx).call($$, d)
    },
    yValue = function(d, i) {
      return config.data_groups.length > 0
        ? getPoints(d, i)[0][1]
        : yScaleGetter.call($$, d.id)(d.value)
    }

  line = config.axis_rotated
    ? line.x(yValue).y(xValue)
    : line.x(xValue).y(yValue)
  if (!config.line_connectNull) {
    line = line.defined(function(d) {
      return d.value != null
    })
  }
  return function(d) {
    var values = config.line_connectNull
        ? $$.filterRemoveNull(d.values)
        : d.values,
      x = isSub ? $$.subX : $$.x,
      y = yScaleGetter.call($$, d.id),
      x0 = 0,
      y0 = 0,
      path
    if ($$.isLineType(d)) {
      if (config.data_regions[d.id]) {
        path = $$.lineWithRegions(values, x, y, config.data_regions[d.id])
      } else {
        if ($$.isStepType(d)) {
          values = $$.convertValuesToStep(values)
        }
        path = line.curve($$.getInterpolate(d))(values)
      }
    } else {
      if (values[0]) {
        x0 = x(values[0].x)
        y0 = y(values[0].value)
      }
      path = config.axis_rotated ? 'M ' + y0 + ' ' + x0 : 'M ' + x0 + ' ' + y0
    }
    return path ? path : 'M 0 0'
  }
}
ChartInternal.prototype.generateGetLinePoints = function(lineIndices, isSub) {
  // partial duplication of generateGetBarPoints
  var $$ = this,
    config = $$.config,
    lineTargetsNum = lineIndices.__max__ + 1,
    x = $$.getShapeX(0, lineTargetsNum, lineIndices, !!isSub),
    y = $$.getShapeY(!!isSub),
    lineOffset = $$.getShapeOffset($$.isLineType, lineIndices, !!isSub),
    yScale = isSub ? $$.getSubYScale : $$.getYScale
  return function(d, i) {
    var y0 = yScale.call($$, d.id)(0),
      offset = lineOffset(d, i) || y0, // offset is for stacked area chart
      posX = x(d),
      posY = y(d)
    // fix posY not to overflow opposite quadrant
    if (config.axis_rotated) {
      if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) {
        posY = y0
      }
    }
    // 1 point that marks the line position
    return [
      [posX, posY - (y0 - offset)],
      [posX, posY - (y0 - offset)], // needed for compatibility
      [posX, posY - (y0 - offset)], // needed for compatibility
      [posX, posY - (y0 - offset)] // needed for compatibility
    ]
  }
}

ChartInternal.prototype.lineWithRegions = function(d, x, y, _regions) {
  var $$ = this,
    config = $$.config,
    prev = -1,
    i,
    j,
    s = 'M',
    sWithRegion,
    xp,
    yp,
    dx,
    dy,
    dd,
    diff,
    diffx2,
    xOffset = $$.isCategorized() ? 0.5 : 0,
    xValue,
    yValue,
    regions = []

  function isWithinRegions(x, regions) {
    var i
    for (i = 0; i < regions.length; i++) {
      if (regions[i].start < x && x <= regions[i].end) {
        return true
      }
    }
    return false
  }

  // Check start/end of regions
  if (isDefined(_regions)) {
    for (i = 0; i < _regions.length; i++) {
      regions[i] = {}
      if (isUndefined(_regions[i].start)) {
        regions[i].start = d[0].x
      } else {
        regions[i].start = $$.isTimeSeries()
          ? $$.parseDate(_regions[i].start)
          : _regions[i].start
      }
      if (isUndefined(_regions[i].end)) {
        regions[i].end = d[d.length - 1].x
      } else {
        regions[i].end = $$.isTimeSeries()
          ? $$.parseDate(_regions[i].end)
          : _regions[i].end
      }
    }
  }

  // Set scales
  xValue = config.axis_rotated
    ? function(d) {
        return y(d.value)
      }
    : function(d) {
        return x(d.x)
      }
  yValue = config.axis_rotated
    ? function(d) {
        return x(d.x)
      }
    : function(d) {
        return y(d.value)
      }

  // Define svg generator function for region
  function generateM(points) {
    return (
      'M' +
      points[0][0] +
      ' ' +
      points[0][1] +
      ' ' +
      points[1][0] +
      ' ' +
      points[1][1]
    )
  }
  if ($$.isTimeSeries()) {
    sWithRegion = function(d0, d1, j, diff) {
      var x0 = d0.x.getTime(),
        x_diff = d1.x - d0.x,
        xv0 = new Date(x0 + x_diff * j),
        xv1 = new Date(x0 + x_diff * (j + diff)),
        points
      if (config.axis_rotated) {
        points = [
          [y(yp(j)), x(xv0)],
          [y(yp(j + diff)), x(xv1)]
        ]
      } else {
        points = [
          [x(xv0), y(yp(j))],
          [x(xv1), y(yp(j + diff))]
        ]
      }
      return generateM(points)
    }
  } else {
    sWithRegion = function(d0, d1, j, diff) {
      var points
      if (config.axis_rotated) {
        points = [
          [y(yp(j), true), x(xp(j))],
          [y(yp(j + diff), true), x(xp(j + diff))]
        ]
      } else {
        points = [
          [x(xp(j), true), y(yp(j))],
          [x(xp(j + diff), true), y(yp(j + diff))]
        ]
      }
      return generateM(points)
    }
  }

  // Generate
  for (i = 0; i < d.length; i++) {
    // Draw as normal
    if (isUndefined(regions) || !isWithinRegions(d[i].x, regions)) {
      s += ' ' + xValue(d[i]) + ' ' + yValue(d[i])
    }
    // Draw with region // TODO: Fix for horizotal charts
    else {
      xp = $$.getScale(
        d[i - 1].x + xOffset,
        d[i].x + xOffset,
        $$.isTimeSeries()
      )
      yp = $$.getScale(d[i - 1].value, d[i].value)

      dx = x(d[i].x) - x(d[i - 1].x)
      dy = y(d[i].value) - y(d[i - 1].value)
      dd = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
      diff = 2 / dd
      diffx2 = diff * 2

      for (j = diff; j <= 1; j += diffx2) {
        s += sWithRegion(d[i - 1], d[i], j, diff)
      }
    }
    prev = d[i].x
  }

  return s
}

ChartInternal.prototype.updateArea = function(durationForExit) {
  var $$ = this,
    d3 = $$.d3
  var mainArea = $$.main
    .selectAll('.' + CLASS.areas)
    .selectAll('.' + CLASS.area)
    .data($$.lineData.bind($$))
  var mainAreaEnter = mainArea
    .enter()
    .append('path')
    .attr('class', $$.classArea.bind($$))
    .style('fill', $$.color)
    .style('opacity', function() {
      $$.orgAreaOpacity = +d3.select(this).style('opacity')
      return 0
    })
  $$.mainArea = mainAreaEnter
    .merge(mainArea)
    .style('opacity', $$.orgAreaOpacity)
  mainArea
    .exit()
    .transition()
    .duration(durationForExit)
    .style('opacity', 0)
}
ChartInternal.prototype.redrawArea = function(
  drawArea,
  withTransition,
  transition
) {
  return [
    (withTransition ? this.mainArea.transition(transition) : this.mainArea)
      .attr('d', drawArea)
      .style('fill', this.color)
      .style('opacity', this.orgAreaOpacity)
  ]
}
ChartInternal.prototype.generateDrawArea = function(areaIndices, isSub) {
  var $$ = this,
    config = $$.config,
    area = $$.d3.area(),
    getPoints = $$.generateGetAreaPoints(areaIndices, isSub),
    yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
    xValue = function(d) {
      return (isSub ? $$.subxx : $$.xx).call($$, d)
    },
    value0 = function(d, i) {
      return config.data_groups.length > 0
        ? getPoints(d, i)[0][1]
        : yScaleGetter.call($$, d.id)($$.getAreaBaseValue(d.id))
    },
    value1 = function(d, i) {
      return config.data_groups.length > 0
        ? getPoints(d, i)[1][1]
        : yScaleGetter.call($$, d.id)(d.value)
    }

  area = config.axis_rotated
    ? area
        .x0(value0)
        .x1(value1)
        .y(xValue)
    : area
        .x(xValue)
        .y0(config.area_above ? 0 : value0)
        .y1(value1)
  if (!config.line_connectNull) {
    area = area.defined(function(d) {
      return d.value !== null
    })
  }

  return function(d) {
    var values = config.line_connectNull
        ? $$.filterRemoveNull(d.values)
        : d.values,
      x0 = 0,
      y0 = 0,
      path
    if ($$.isAreaType(d)) {
      if ($$.isStepType(d)) {
        values = $$.convertValuesToStep(values)
      }
      path = area.curve($$.getInterpolate(d))(values)
    } else {
      if (values[0]) {
        x0 = $$.x(values[0].x)
        y0 = $$.getYScale(d.id)(values[0].value)
      }
      path = config.axis_rotated ? 'M ' + y0 + ' ' + x0 : 'M ' + x0 + ' ' + y0
    }
    return path ? path : 'M 0 0'
  }
}
ChartInternal.prototype.getAreaBaseValue = function() {
  return 0
}
ChartInternal.prototype.generateGetAreaPoints = function(areaIndices, isSub) {
  // partial duplication of generateGetBarPoints
  var $$ = this,
    config = $$.config,
    areaTargetsNum = areaIndices.__max__ + 1,
    x = $$.getShapeX(0, areaTargetsNum, areaIndices, !!isSub),
    y = $$.getShapeY(!!isSub),
    areaOffset = $$.getShapeOffset($$.isAreaType, areaIndices, !!isSub),
    yScale = isSub ? $$.getSubYScale : $$.getYScale
  return function(d, i) {
    var y0 = yScale.call($$, d.id)(0),
      offset = areaOffset(d, i) || y0, // offset is for stacked area chart
      posX = x(d),
      posY = y(d)
    // fix posY not to overflow opposite quadrant
    if (config.axis_rotated) {
      if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) {
        posY = y0
      }
    }
    // 1 point that marks the area position
    return [
      [posX, offset],
      [posX, posY - (y0 - offset)],
      [posX, posY - (y0 - offset)], // needed for compatibility
      [posX, offset] // needed for compatibility
    ]
  }
}

ChartInternal.prototype.updateCircle = function(cx, cy) {
  var $$ = this
  var mainCircle = $$.main
    .selectAll('.' + CLASS.circles)
    .selectAll('.' + CLASS.circle)
    .data($$.lineOrScatterOrStanfordData.bind($$))

  var mainCircleEnter = mainCircle
    .enter()
    .append('circle')
    .attr('shape-rendering', $$.isStanfordGraphType() ? 'crispEdges' : '')
    .attr('class', $$.classCircle.bind($$))
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', $$.pointR.bind($$))
    .style(
      'color',
      $$.isStanfordGraphType() ? $$.getStanfordPointColor.bind($$) : $$.color
    )

  $$.mainCircle = mainCircleEnter
    .merge(mainCircle)
    .style(
      'opacity',
      $$.isStanfordGraphType() ? 1 : $$.initialOpacityForCircle.bind($$)
    )

  mainCircle.exit().style('opacity', 0)
}
ChartInternal.prototype.redrawCircle = function(
  cx,
  cy,
  withTransition,
  transition
) {
  var $$ = this,
    selectedCircles = $$.main.selectAll('.' + CLASS.selectedCircle)
  return [
    (withTransition ? $$.mainCircle.transition(transition) : $$.mainCircle)
      .style('opacity', this.opacityForCircle.bind($$))
      .style(
        'color',
        $$.isStanfordGraphType() ? $$.getStanfordPointColor.bind($$) : $$.color
      )
      .attr('cx', cx)
      .attr('cy', cy),
    (withTransition ? selectedCircles.transition(transition) : selectedCircles)
      .attr('cx', cx)
      .attr('cy', cy)
  ]
}
ChartInternal.prototype.circleX = function(d) {
  return d.x || d.x === 0 ? this.x(d.x) : null
}
ChartInternal.prototype.updateCircleY = function() {
  var $$ = this,
    lineIndices,
    getPoints
  if ($$.config.data_groups.length > 0) {
    ;(lineIndices = $$.getShapeIndices($$.isLineType)),
      (getPoints = $$.generateGetLinePoints(lineIndices))
    $$.circleY = function(d, i) {
      return getPoints(d, i)[0][1]
    }
  } else {
    $$.circleY = function(d) {
      return $$.getYScale(d.id)(d.value)
    }
  }
}
ChartInternal.prototype.getCircles = function(i, id) {
  var $$ = this
  return (id
    ? $$.main.selectAll('.' + CLASS.circles + $$.getTargetSelectorSuffix(id))
    : $$.main
  ).selectAll('.' + CLASS.circle + (isValue(i) ? '-' + i : ''))
}
ChartInternal.prototype.expandCircles = function(i, id, reset) {
  var $$ = this,
    r = $$.pointExpandedR.bind($$)
  if (reset) {
    $$.unexpandCircles()
  }
  $$.getCircles(i, id)
    .classed(CLASS.EXPANDED, true)
    .attr('r', r)
}
ChartInternal.prototype.unexpandCircles = function(i) {
  var $$ = this,
    r = $$.pointR.bind($$)
  $$.getCircles(i)
    .filter(function() {
      return $$.d3.select(this).classed(CLASS.EXPANDED)
    })
    .classed(CLASS.EXPANDED, false)
    .attr('r', r)
}
ChartInternal.prototype.pointR = function(d) {
  var $$ = this,
    config = $$.config
  return $$.isStepType(d)
    ? 0
    : isFunction(config.point_r)
    ? config.point_r(d)
    : config.point_r
}
ChartInternal.prototype.pointExpandedR = function(d) {
  var $$ = this,
    config = $$.config
  if (config.point_focus_expand_enabled) {
    return isFunction(config.point_focus_expand_r)
      ? config.point_focus_expand_r(d)
      : config.point_focus_expand_r
      ? config.point_focus_expand_r
      : $$.pointR(d) * 1.75
  } else {
    return $$.pointR(d)
  }
}
ChartInternal.prototype.pointSelectR = function(d) {
  var $$ = this,
    config = $$.config
  return isFunction(config.point_select_r)
    ? config.point_select_r(d)
    : config.point_select_r
    ? config.point_select_r
    : $$.pointR(d) * 4
}
ChartInternal.prototype.isWithinCircle = function(that, r) {
  var d3 = this.d3,
    mouse = d3.mouse(that),
    d3_this = d3.select(that),
    cx = +d3_this.attr('cx'),
    cy = +d3_this.attr('cy')
  return Math.sqrt(Math.pow(cx - mouse[0], 2) + Math.pow(cy - mouse[1], 2)) < r
}
ChartInternal.prototype.isWithinStep = function(that, y) {
  return Math.abs(y - this.d3.mouse(that)[1]) < 30
}
