c3_chart_internal_fn.initTitle = function () {
    const $$ = this;
    $$.title = $$.svg.append('text')
          .text($$.config.title_text)
          .attr('class', $$.CLASS.title);
};
c3_chart_internal_fn.redrawTitle = function () {
    const $$ = this;
    $$.title
          .attr('x', $$.xForTitle.bind($$))
          .attr('y', $$.yForTitle.bind($$));
};
c3_chart_internal_fn.xForTitle = function () {
    let $$ = this, config = $$.config, position = config.title_position || 'left', x;
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
    const $$ = this;
    return $$.config.title_padding.top + $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).height;
};
c3_chart_internal_fn.getTitlePadding = function () {
    const $$ = this;
    return $$.yForTitle() + $$.config.title_padding.bottom;
};
