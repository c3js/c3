import CLASS from './class'
import { ChartInternal } from './core'

ChartInternal.prototype.selectPoint = function(target, d, i) {
  var $$ = this,
    config = $$.config,
    cx = (config.axis_rotated ? $$.circleY : $$.circleX).bind($$),
    cy = (config.axis_rotated ? $$.circleX : $$.circleY).bind($$),
    r = $$.pointSelectR.bind($$)
  config.data_onselected.call($$.api, d, target.node())
  // add selected-circle on low layer g
  $$.main
    .select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id))
    .selectAll('.' + CLASS.selectedCircle + '-' + i)
    .data([d])
    .enter()
    .append('circle')
    .attr('class', function() {
      return $$.generateClass(CLASS.selectedCircle, i)
    })
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('stroke', function() {
      return $$.color(d)
    })
    .attr('r', function(d) {
      return $$.pointSelectR(d) * 1.4
    })
    .transition()
    .duration(100)
    .attr('r', r)
}
ChartInternal.prototype.unselectPoint = function(target, d, i) {
  var $$ = this
  $$.config.data_onunselected.call($$.api, d, target.node())
  // remove selected-circle from low layer g
  $$.main
    .select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id))
    .selectAll('.' + CLASS.selectedCircle + '-' + i)
    .transition()
    .duration(100)
    .attr('r', 0)
    .remove()
}
ChartInternal.prototype.togglePoint = function(selected, target, d, i) {
  selected ? this.selectPoint(target, d, i) : this.unselectPoint(target, d, i)
}
ChartInternal.prototype.selectPath = function(target, d) {
  var $$ = this
  $$.config.data_onselected.call($$, d, target.node())
  if ($$.config.interaction_brighten) {
    target
      .transition()
      .duration(100)
      .style('fill', function() {
        return $$.d3.rgb($$.color(d)).brighter(0.75)
      })
  }
}
ChartInternal.prototype.unselectPath = function(target, d) {
  var $$ = this
  $$.config.data_onunselected.call($$, d, target.node())
  if ($$.config.interaction_brighten) {
    target
      .transition()
      .duration(100)
      .style('fill', function() {
        return $$.color(d)
      })
  }
}
ChartInternal.prototype.togglePath = function(selected, target, d, i) {
  selected ? this.selectPath(target, d, i) : this.unselectPath(target, d, i)
}
ChartInternal.prototype.getToggle = function(that, d) {
  var $$ = this,
    toggle
  if (that.nodeName === 'circle') {
    if ($$.isStepType(d)) {
      // circle is hidden in step chart, so treat as within the click area
      toggle = function() {} // TODO: how to select step chart?
    } else {
      toggle = $$.togglePoint
    }
  } else if (that.nodeName === 'path') {
    toggle = $$.togglePath
  }
  return toggle
}
ChartInternal.prototype.toggleShape = function(that, d, i) {
  var $$ = this,
    d3 = $$.d3,
    config = $$.config,
    shape = d3.select(that),
    isSelected = shape.classed(CLASS.SELECTED),
    toggle = $$.getToggle(that, d).bind($$)

  if (config.data_selection_enabled && config.data_selection_isselectable(d)) {
    if (!config.data_selection_multiple) {
      $$.main
        .selectAll(
          '.' +
            CLASS.shapes +
            (config.data_selection_grouped
              ? $$.getTargetSelectorSuffix(d.id)
              : '')
        )
        .selectAll('.' + CLASS.shape)
        .each(function(d, i) {
          var shape = d3.select(this)
          if (shape.classed(CLASS.SELECTED)) {
            toggle(false, shape.classed(CLASS.SELECTED, false), d, i)
          }
        })
    }
    shape.classed(CLASS.SELECTED, !isSelected)
    toggle(!isSelected, shape, d, i)
  }
}
