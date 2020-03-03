import { ChartInternal } from './core'
import { isIE } from './util'

ChartInternal.prototype.getClipPath = function(id) {
  return 'url(' + (isIE(9) ? '' : document.URL.split('#')[0]) + '#' + id + ')'
}
ChartInternal.prototype.appendClip = function(parent, id) {
  return parent
    .append('clipPath')
    .attr('id', id)
    .append('rect')
}
ChartInternal.prototype.getAxisClipX = function(forHorizontal) {
  // axis line width + padding for left
  var left = Math.max(30, this.margin.left)
  return forHorizontal ? -(1 + left) : -(left - 1)
}
ChartInternal.prototype.getAxisClipY = function(forHorizontal) {
  return forHorizontal ? -20 : -this.margin.top
}
ChartInternal.prototype.getXAxisClipX = function() {
  var $$ = this
  return $$.getAxisClipX(!$$.config.axis_rotated)
}
ChartInternal.prototype.getXAxisClipY = function() {
  var $$ = this
  return $$.getAxisClipY(!$$.config.axis_rotated)
}
ChartInternal.prototype.getYAxisClipX = function() {
  var $$ = this
  return $$.config.axis_y_inner ? -1 : $$.getAxisClipX($$.config.axis_rotated)
}
ChartInternal.prototype.getYAxisClipY = function() {
  var $$ = this
  return $$.getAxisClipY($$.config.axis_rotated)
}
ChartInternal.prototype.getAxisClipWidth = function(forHorizontal) {
  var $$ = this,
    left = Math.max(30, $$.margin.left),
    right = Math.max(30, $$.margin.right)
  // width + axis line width + padding for left/right
  return forHorizontal ? $$.width + 2 + left + right : $$.margin.left + 20
}
ChartInternal.prototype.getAxisClipHeight = function(forHorizontal) {
  // less than 20 is not enough to show the axis label 'outer' without legend
  return (
    (forHorizontal ? this.margin.bottom : this.margin.top + this.height) + 20
  )
}
ChartInternal.prototype.getXAxisClipWidth = function() {
  var $$ = this
  return $$.getAxisClipWidth(!$$.config.axis_rotated)
}
ChartInternal.prototype.getXAxisClipHeight = function() {
  var $$ = this
  return $$.getAxisClipHeight(!$$.config.axis_rotated)
}
ChartInternal.prototype.getYAxisClipWidth = function() {
  var $$ = this
  return (
    $$.getAxisClipWidth($$.config.axis_rotated) +
    ($$.config.axis_y_inner ? 20 : 0)
  )
}
ChartInternal.prototype.getYAxisClipHeight = function() {
  var $$ = this
  return $$.getAxisClipHeight($$.config.axis_rotated)
}
