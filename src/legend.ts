import CLASS from './class'
import { ChartInternal } from './core'
import { isDefined, isEmpty, getOption } from './util'

ChartInternal.prototype.initLegend = function() {
  var $$ = this
  $$.legendItemTextBox = {}
  $$.legendHasRendered = false
  $$.legend = $$.svg.append('g').attr('transform', $$.getTranslate('legend'))
  if (!$$.config.legend_show) {
    $$.legend.style('visibility', 'hidden')
    $$.hiddenLegendIds = $$.mapToIds($$.data.targets)
    return
  }
  // MEMO: call here to update legend box and tranlate for all
  // MEMO: translate will be updated by this, so transform not needed in updateLegend()
  $$.updateLegendWithDefaults()
}
ChartInternal.prototype.updateLegendWithDefaults = function() {
  var $$ = this
  $$.updateLegend($$.mapToIds($$.data.targets), {
    withTransform: false,
    withTransitionForTransform: false,
    withTransition: false
  })
}
ChartInternal.prototype.updateSizeForLegend = function(
  legendHeight,
  legendWidth
) {
  var $$ = this,
    config = $$.config,
    insetLegendPosition = {
      top: $$.isLegendTop
        ? $$.getCurrentPaddingTop() + config.legend_inset_y + 5.5
        : $$.currentHeight -
          legendHeight -
          $$.getCurrentPaddingBottom() -
          config.legend_inset_y,
      left: $$.isLegendLeft
        ? $$.getCurrentPaddingLeft() + config.legend_inset_x + 0.5
        : $$.currentWidth -
          legendWidth -
          $$.getCurrentPaddingRight() -
          config.legend_inset_x +
          0.5
    }

  $$.margin3 = {
    top: $$.isLegendRight
      ? 0
      : $$.isLegendInset
      ? insetLegendPosition.top
      : $$.currentHeight - legendHeight,
    right: NaN,
    bottom: 0,
    left: $$.isLegendRight
      ? $$.currentWidth - legendWidth
      : $$.isLegendInset
      ? insetLegendPosition.left
      : 0
  }
}
ChartInternal.prototype.transformLegend = function(withTransition) {
  var $$ = this
  ;(withTransition ? $$.legend.transition() : $$.legend).attr(
    'transform',
    $$.getTranslate('legend')
  )
}
ChartInternal.prototype.updateLegendStep = function(step) {
  this.legendStep = step
}
ChartInternal.prototype.updateLegendItemWidth = function(w) {
  this.legendItemWidth = w
}
ChartInternal.prototype.updateLegendItemHeight = function(h) {
  this.legendItemHeight = h
}
ChartInternal.prototype.getLegendWidth = function() {
  var $$ = this
  return $$.config.legend_show
    ? $$.isLegendRight || $$.isLegendInset
      ? $$.legendItemWidth * ($$.legendStep + 1)
      : $$.currentWidth
    : 0
}
ChartInternal.prototype.getLegendHeight = function() {
  var $$ = this,
    h = 0
  if ($$.config.legend_show) {
    if ($$.isLegendRight) {
      h = $$.currentHeight
    } else {
      h = Math.max(20, $$.legendItemHeight) * ($$.legendStep + 1)
    }
  }
  return h
}
ChartInternal.prototype.opacityForLegend = function(legendItem) {
  return legendItem.classed(CLASS.legendItemHidden) ? null : 1
}
ChartInternal.prototype.opacityForUnfocusedLegend = function(legendItem) {
  return legendItem.classed(CLASS.legendItemHidden) ? null : 0.3
}
ChartInternal.prototype.toggleFocusLegend = function(targetIds, focus) {
  var $$ = this
  targetIds = $$.mapToTargetIds(targetIds)
  $$.legend
    .selectAll('.' + CLASS.legendItem)
    .filter(function(id) {
      return targetIds.indexOf(id) >= 0
    })
    .classed(CLASS.legendItemFocused, focus)
    .transition()
    .duration(100)
    .style('opacity', function() {
      var opacity = focus ? $$.opacityForLegend : $$.opacityForUnfocusedLegend
      return opacity.call($$, $$.d3.select(this))
    })
}
ChartInternal.prototype.revertLegend = function() {
  var $$ = this,
    d3 = $$.d3
  $$.legend
    .selectAll('.' + CLASS.legendItem)
    .classed(CLASS.legendItemFocused, false)
    .transition()
    .duration(100)
    .style('opacity', function() {
      return $$.opacityForLegend(d3.select(this))
    })
}
ChartInternal.prototype.showLegend = function(targetIds) {
  var $$ = this,
    config = $$.config
  if (!config.legend_show) {
    config.legend_show = true
    $$.legend.style('visibility', 'visible')
    if (!$$.legendHasRendered) {
      $$.updateLegendWithDefaults()
    }
  }
  $$.removeHiddenLegendIds(targetIds)
  $$.legend
    .selectAll($$.selectorLegends(targetIds))
    .style('visibility', 'visible')
    .transition()
    .style('opacity', function() {
      return $$.opacityForLegend($$.d3.select(this))
    })
}
ChartInternal.prototype.hideLegend = function(targetIds) {
  var $$ = this,
    config = $$.config
  if (config.legend_show && isEmpty(targetIds)) {
    config.legend_show = false
    $$.legend.style('visibility', 'hidden')
  }
  $$.addHiddenLegendIds(targetIds)
  $$.legend
    .selectAll($$.selectorLegends(targetIds))
    .style('opacity', 0)
    .style('visibility', 'hidden')
}
ChartInternal.prototype.clearLegendItemTextBoxCache = function() {
  this.legendItemTextBox = {}
}
ChartInternal.prototype.updateLegend = function(
  targetIds,
  options,
  transitions
) {
  var $$ = this,
    config = $$.config
  var xForLegend,
    xForLegendText,
    xForLegendRect,
    yForLegend,
    yForLegendText,
    yForLegendRect,
    x1ForLegendTile,
    x2ForLegendTile,
    yForLegendTile
  var paddingTop = 4,
    paddingRight = 10,
    maxWidth = 0,
    maxHeight = 0,
    posMin = 10,
    tileWidth = config.legend_item_tile_width + 5
  var l,
    totalLength = 0,
    offsets = {},
    widths = {},
    heights = {},
    margins = [0],
    steps = {},
    step = 0
  var withTransition, withTransitionForTransform
  var texts, rects, tiles, background

  // Skip elements when their name is set to null
  targetIds = targetIds.filter(function(id) {
    return !isDefined(config.data_names[id]) || config.data_names[id] !== null
  })

  options = options || {}
  withTransition = getOption(options, 'withTransition', true)
  withTransitionForTransform = getOption(
    options,
    'withTransitionForTransform',
    true
  )

  function getTextBox(textElement, id) {
    if (!$$.legendItemTextBox[id]) {
      $$.legendItemTextBox[id] = $$.getTextRect(
        textElement.textContent,
        CLASS.legendItem,
        textElement
      )
    }
    return $$.legendItemTextBox[id]
  }

  function updatePositions(textElement, id, index) {
    var reset = index === 0,
      isLast = index === targetIds.length - 1,
      box = getTextBox(textElement, id),
      itemWidth =
        box.width +
        tileWidth +
        (isLast && !($$.isLegendRight || $$.isLegendInset) ? 0 : paddingRight) +
        config.legend_padding,
      itemHeight = box.height + paddingTop,
      itemLength =
        $$.isLegendRight || $$.isLegendInset ? itemHeight : itemWidth,
      areaLength =
        $$.isLegendRight || $$.isLegendInset
          ? $$.getLegendHeight()
          : $$.getLegendWidth(),
      margin,
      maxLength

    // MEMO: care about condifion of step, totalLength
    function updateValues(id, withoutStep?: boolean) {
      if (!withoutStep) {
        margin = (areaLength - totalLength - itemLength) / 2
        if (margin < posMin) {
          margin = (areaLength - itemLength) / 2
          totalLength = 0
          step++
        }
      }
      steps[id] = step
      margins[step] = $$.isLegendInset ? 10 : margin
      offsets[id] = totalLength
      totalLength += itemLength
    }

    if (reset) {
      totalLength = 0
      step = 0
      maxWidth = 0
      maxHeight = 0
    }

    if (config.legend_show && !$$.isLegendToShow(id)) {
      widths[id] = heights[id] = steps[id] = offsets[id] = 0
      return
    }

    widths[id] = itemWidth
    heights[id] = itemHeight

    if (!maxWidth || itemWidth >= maxWidth) {
      maxWidth = itemWidth
    }
    if (!maxHeight || itemHeight >= maxHeight) {
      maxHeight = itemHeight
    }
    maxLength = $$.isLegendRight || $$.isLegendInset ? maxHeight : maxWidth

    if (config.legend_equally) {
      Object.keys(widths).forEach(function(id) {
        widths[id] = maxWidth
      })
      Object.keys(heights).forEach(function(id) {
        heights[id] = maxHeight
      })
      margin = (areaLength - maxLength * targetIds.length) / 2
      if (margin < posMin) {
        totalLength = 0
        step = 0
        targetIds.forEach(function(id) {
          updateValues(id)
        })
      } else {
        updateValues(id, true)
      }
    } else {
      updateValues(id)
    }
  }

  if ($$.isLegendInset) {
    step = config.legend_inset_step
      ? config.legend_inset_step
      : targetIds.length
    $$.updateLegendStep(step)
  }

  if ($$.isLegendRight) {
    xForLegend = function(id) {
      return maxWidth * steps[id]
    }
    yForLegend = function(id) {
      return margins[steps[id]] + offsets[id]
    }
  } else if ($$.isLegendInset) {
    xForLegend = function(id) {
      return maxWidth * steps[id] + 10
    }
    yForLegend = function(id) {
      return margins[steps[id]] + offsets[id]
    }
  } else {
    xForLegend = function(id) {
      return margins[steps[id]] + offsets[id]
    }
    yForLegend = function(id) {
      return maxHeight * steps[id]
    }
  }
  xForLegendText = function(id, i) {
    return xForLegend(id, i) + 4 + config.legend_item_tile_width
  }
  yForLegendText = function(id, i) {
    return yForLegend(id, i) + 9
  }
  xForLegendRect = function(id, i) {
    return xForLegend(id, i)
  }
  yForLegendRect = function(id, i) {
    return yForLegend(id, i) - 5
  }
  x1ForLegendTile = function(id, i) {
    return xForLegend(id, i) - 2
  }
  x2ForLegendTile = function(id, i) {
    return xForLegend(id, i) - 2 + config.legend_item_tile_width
  }
  yForLegendTile = function(id, i) {
    return yForLegend(id, i) + 4
  }

  // Define g for legend area
  l = $$.legend
    .selectAll('.' + CLASS.legendItem)
    .data(targetIds)
    .enter()
    .append('g')
    .attr('class', function(id) {
      return $$.generateClass(CLASS.legendItem, id)
    })
    .style('visibility', function(id) {
      return $$.isLegendToShow(id) ? 'visible' : 'hidden'
    })
    .style('cursor', function() {
      return config.interaction_enabled ? 'pointer' : 'auto'
    })
    .on(
      'click',
      config.interaction_enabled
        ? function(id) {
            if (config.legend_item_onclick) {
              config.legend_item_onclick.call($$, id)
            } else {
              if ($$.d3.event.altKey) {
                $$.api.hide()
                $$.api.show(id)
              } else {
                $$.api.toggle(id)
                $$.isTargetToShow(id) ? $$.api.focus(id) : $$.api.revert()
              }
            }
          }
        : null
    )
    .on(
      'mouseover',
      config.interaction_enabled
        ? function(id) {
            if (config.legend_item_onmouseover) {
              config.legend_item_onmouseover.call($$, id)
            } else {
              $$.d3.select(this).classed(CLASS.legendItemFocused, true)
              if (!$$.transiting && $$.isTargetToShow(id)) {
                $$.api.focus(id)
              }
            }
          }
        : null
    )
    .on(
      'mouseout',
      config.interaction_enabled
        ? function(id) {
            if (config.legend_item_onmouseout) {
              config.legend_item_onmouseout.call($$, id)
            } else {
              $$.d3.select(this).classed(CLASS.legendItemFocused, false)
              $$.api.revert()
            }
          }
        : null
    )

  l.append('text')
    .text(function(id) {
      return isDefined(config.data_names[id]) ? config.data_names[id] : id
    })
    .each(function(id, i) {
      updatePositions(this, id, i)
    })
    .style('pointer-events', 'none')
    .attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendText : -200)
    .attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendText)

  l.append('rect')
    .attr('class', CLASS.legendItemEvent)
    .style('fill-opacity', 0)
    .attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendRect : -200)
    .attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendRect)

  l.append('line')
    .attr('class', CLASS.legendItemTile)
    .style('stroke', $$.color)
    .style('pointer-events', 'none')
    .attr('x1', $$.isLegendRight || $$.isLegendInset ? x1ForLegendTile : -200)
    .attr('y1', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile)
    .attr('x2', $$.isLegendRight || $$.isLegendInset ? x2ForLegendTile : -200)
    .attr('y2', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile)
    .attr('stroke-width', config.legend_item_tile_height)

  // Set background for inset legend
  background = $$.legend.select('.' + CLASS.legendBackground + ' rect')
  if ($$.isLegendInset && maxWidth > 0 && background.size() === 0) {
    background = $$.legend
      .insert('g', '.' + CLASS.legendItem)
      .attr('class', CLASS.legendBackground)
      .append('rect')
  }

  texts = $$.legend
    .selectAll('text')
    .data(targetIds)
    .text(function(id) {
      return isDefined(config.data_names[id]) ? config.data_names[id] : id
    }) // MEMO: needed for update
    .each(function(id, i) {
      updatePositions(this, id, i)
    })
  ;(withTransition ? texts.transition() : texts)
    .attr('x', xForLegendText)
    .attr('y', yForLegendText)

  rects = $$.legend.selectAll('rect.' + CLASS.legendItemEvent).data(targetIds)
  ;(withTransition ? rects.transition() : rects)
    .attr('width', function(id) {
      return widths[id]
    })
    .attr('height', function(id) {
      return heights[id]
    })
    .attr('x', xForLegendRect)
    .attr('y', yForLegendRect)

  tiles = $$.legend.selectAll('line.' + CLASS.legendItemTile).data(targetIds)
  ;(withTransition ? tiles.transition() : tiles)
    .style(
      'stroke',
      $$.levelColor
        ? function(id) {
            return $$.levelColor(
              $$.cache[id].values.reduce(function(total, item) {
                return total + item.value
              }, 0)
            )
          }
        : $$.color
    )
    .attr('x1', x1ForLegendTile)
    .attr('y1', yForLegendTile)
    .attr('x2', x2ForLegendTile)
    .attr('y2', yForLegendTile)

  if (background) {
    ;(withTransition ? background.transition() : background)
      .attr('height', $$.getLegendHeight() - 12)
      .attr('width', maxWidth * (step + 1) + 10)
  }

  // toggle legend state
  $$.legend
    .selectAll('.' + CLASS.legendItem)
    .classed(CLASS.legendItemHidden, function(id) {
      return !$$.isTargetToShow(id)
    })

  // Update all to reflect change of legend
  $$.updateLegendItemWidth(maxWidth)
  $$.updateLegendItemHeight(maxHeight)
  $$.updateLegendStep(step)
  // Update size and scale
  $$.updateSizes()
  $$.updateScales()
  $$.updateSvgSize()
  // Update g positions
  $$.transformAll(withTransitionForTransform, transitions)
  $$.legendHasRendered = true
}
