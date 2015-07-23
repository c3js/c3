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
    var $$ = this, config = $$.config, position = config.title_position || 'left', x, textWidth;
    try {
			textWidth = $$.title.node().getBBox().width;
		} catch (e) {
			//FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=612118
			if (e.name === 'NS_ERROR_FAILURE') {
				textWidth = $$.title.node().getComputedTextLength();
			} else {
				throw(e);
      }
		}
    if (position.indexOf('right') >= 0) {
        x = $$.currentWidth - textWidth - config.title_padding.right;
    } else if (position.indexOf('center') >= 0) {
        x = ($$.currentWidth - textWidth) / 2;
    } else { // left
        x = config.title_padding.left;
    }
    return x;
};
c3_chart_internal_fn.yForTitle = function () {
    var $$ = this, textHeight;
    try {
			textHeight = $$.title.node().getBBox().height;
		} catch (e) {
			//FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=612118
			if (e.name === 'NS_ERROR_FAILURE') {
				textHeight = 0;
			} else {
				throw(e);
			}
		}
    return $$.config.title_padding.top + textHeight;
};
c3_chart_internal_fn.getTitlePadding = function() {
    var $$ = this;
    return $$.yForTitle() + $$.config.title_padding.bottom;
};
