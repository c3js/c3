c3_chart_internal_fn.initTitle = function () {
    var $$ = this;
    $$.title = $$.svg.append("text")
          .attr("class", $$.CLASS.title);
    $$.titleText = $$.title.append("tspan")
          .text($$.config.title_text)
          .attr("class", $$.CLASS.titleText);
    if ($$.config.title_author) {
        $$.titleAuthor = $$.title.append("tspan")
              .text($$.config.title_author)
              .attr("class", $$.CLASS.titleAuthor)
              .attr("dx", $$.config.title_spacing);
    }
    if ($$.config.title_source) {
        $$.titleSource = $$.title.append("tspan")
              .text($$.config.title_source)
              .attr("class", $$.CLASS.titleSource)
              .attr("dx", $$.config.title_spacing);
    }
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
        x = $$.currentWidth - $$.title.node().getBBox().width - config.title_padding.right;
    } else if (position.indexOf('center') >= 0) {
        x = ($$.currentWidth - $$.title.node().getBBox().width) / 2;
    } else { // left
        x = config.title_padding.left;
    }
    return x;
};
c3_chart_internal_fn.yForTitle = function () {
    var $$ = this;
    return $$.config.title_padding.top + $$.title.node().getBBox().height;
};
c3_chart_internal_fn.getTitlePadding = function() {
    var $$ = this;
    return $$.yForTitle() + $$.config.title_padding.bottom;
};
