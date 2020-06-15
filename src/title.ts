import { ChartInternal } from './core'

ChartInternal.prototype.initTitle = function() {
  var $$ = this
  $$.title = $$.svg
    .append('text')
    .text($$.config.title_text)
    .attr('class', $$.CLASS.title)
}
ChartInternal.prototype.redrawTitle = function() {
  var $$ = this
  $$.title.attr('x', $$.xForTitle.bind($$)).attr('y', $$.yForTitle.bind($$))
}
ChartInternal.prototype.xForTitle = function() {
  var $$ = this,
    config = $$.config,
    position = config.title_position || 'left',
    x
  if (position.indexOf('right') >= 0) {
    x =
      $$.currentWidth -
      $$.getTextRect(
        $$.title.node().textContent,
        $$.CLASS.title,
        $$.title.node()
      ).width -
      config.title_padding.right
  } else if (position.indexOf('center') >= 0) {
    x = Math.max(
      ($$.currentWidth -
        $$.getTextRect(
          $$.title.node().textContent,
          $$.CLASS.title,
          $$.title.node()
        ).width) /
        2,
      0
    )
  } else {
    // left
    x = config.title_padding.left
  }
  return x
}
ChartInternal.prototype.yForTitle = function() {
  var $$ = this
  return (
    $$.config.title_padding.top +
    $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node())
      .height
  )
}
ChartInternal.prototype.getTitlePadding = function() {
  var $$ = this
  return $$.yForTitle() + $$.config.title_padding.bottom
}
