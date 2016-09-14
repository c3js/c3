c3_chart_internal_fn.getClipPath = function (id) {
    const isIE9 = window.navigator.appVersion.toLowerCase().indexOf('msie 9.') >= 0;
    return 'url(' + (isIE9 ? '' : document.URL.split('#')[0]) + '#' + id + ')';
};
c3_chart_internal_fn.appendClip = function (parent, id) {
    return parent.append('clipPath').attr('id', id).append('rect');
};
c3_chart_internal_fn.getAxisClipX = function (forHorizontal) {
    // axis line width + padding for left
    const left = Math.max(30, this.margin.left);
    return forHorizontal ? -(1 + left) : -(left - 1);
};
c3_chart_internal_fn.getAxisClipY = function (forHorizontal) {
    return forHorizontal ? -20 : -this.margin.top;
};
c3_chart_internal_fn.getXAxisClipX = function () {
    const $$ = this;
    return $$.getAxisClipX(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getXAxisClipY = function () {
    const $$ = this;
    return $$.getAxisClipY(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipX = function () {
    const $$ = this;
    return $$.config.axis_y_inner ? -1 : $$.getAxisClipX($$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipY = function () {
    const $$ = this;
    return $$.getAxisClipY($$.config.axis_rotated);
};
c3_chart_internal_fn.getAxisClipWidth = function (forHorizontal) {
    let $$ = this,
        left = Math.max(30, $$.margin.left),
        right = Math.max(30, $$.margin.right);
    // width + axis line width + padding for left/right
    return forHorizontal ? $$.width + 2 + left + right : $$.margin.left + 20;
};
c3_chart_internal_fn.getAxisClipHeight = function (forHorizontal) {
    // less than 20 is not enough to show the axis label 'outer' without legend
    return (forHorizontal ? this.margin.bottom : (this.margin.top + this.height)) + 20;
};
c3_chart_internal_fn.getXAxisClipWidth = function () {
    const $$ = this;
    return $$.getAxisClipWidth(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getXAxisClipHeight = function () {
    const $$ = this;
    return $$.getAxisClipHeight(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipWidth = function () {
    const $$ = this;
    return $$.getAxisClipWidth($$.config.axis_rotated) + ($$.config.axis_y_inner ? 20 : 0);
};
c3_chart_internal_fn.getYAxisClipHeight = function () {
    const $$ = this;
    return $$.getAxisClipHeight($$.config.axis_rotated);
};
