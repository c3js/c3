c3_chart_internal_fn.initTitle = function () {
    var $$ = this;
    $$.title = $$.svg.append("text")
          .text($$.config.title_text)
          .attr("class", $$.CLASS.title);
};
c3_chart_internal_fn.redrawTitle = function () {
    var $$ = this;
    $$.title
          .attr("x", $$.xForTitle.bind($$))
          .attr("y", $$.yForTitle.bind($$));
};
c3_chart_internal_fn.xForTitle = function () {
    var $$ = this, config = $$.config, position = config.title_position || 'left', x;
    if (position.indexOf('right') >= 0) {
        x = $$.currentWidth - $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).width - config.title_padding.right;
    } else if (position.indexOf('center') >= 0) {
        x = ($$.currentWidth - $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).width) / 2;
    } else { // left
        x = config.title_padding.left;
    }
    return x;
};
c3_chart_internal_fn.yForTitle = function () {
    var $$ = this, position = $$.config.title_position || 'left';
    if (position.indexOf('bottom') >= 0) {
      return $$.getCurrentHeight() - ($$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).height + ($$.config.title_padding.bottom || 0));
    }
    return ($$.config.title_padding.top || 0) + $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).height;
};
c3_chart_internal_fn.getTitlePadding = function() {
    var $$ = this, position = $$.config.title_position || 'left';
    if (position.indexOf('bottom') !== -1) {
      return ($$.config.title_padding.bottom || 0) + ($$.config.title_padding.top || 0);
    }
    return $$.yForTitle() + ($$.config.title_padding.bottom || 0);
};
