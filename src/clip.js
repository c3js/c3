c3_chart_internal_fn.getClipPath = function (id) {
    var isIE9 = window.navigator.appVersion.toLowerCase().indexOf("msie 9.") >= 0;
    return "url(" + (isIE9 ? "" : document.URL.split('#')[0]) + "#" + id + ")";
};
c3_chart_internal_fn.appendClip = function (parent, id) {
    return parent.append("clipPath").attr("id", id).append("rect");
};
c3_chart_internal_fn.getAxisClipX = function (forHorizontal) {
    var $$ = this;
    // axis line width + padding for left
    var left = Math.max(30, this.margin.left);
    if (forHorizontal) {
        return $$.config.axis_x_clip ? 0 : -(1 + left);
    } else {
        return -(left - 1);
    }
};
c3_chart_internal_fn.getAxisClipY = function (forHorizontal) {
    return forHorizontal ? -20 : -this.margin.top;
};
c3_chart_internal_fn.getXAxisClipX = function () {
    var $$ = this;
    return $$.getAxisClipX(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getXAxisClipY = function () {
    var $$ = this;
    return $$.getAxisClipY(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipX = function () {
    var $$ = this;
    return $$.config.axis_y_inner ? -1 : $$.getAxisClipX($$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipY = function () {
    var $$ = this;
    return $$.getAxisClipY($$.config.axis_rotated);
};
c3_chart_internal_fn.getAxisClipWidth = function (forHorizontal) {
    var $$ = this,
        left = Math.max(30, $$.margin.left),
        right = Math.max(30, $$.margin.right);
    // width + axis line width + padding for left/right
    if (forHorizontal) {
        return $$.config.axis_x_clip ? $$.width : $$.width + 2 + left + right;
    } else {
        return $$.margin.left + 20;
    }
};
c3_chart_internal_fn.getAxisClipHeight = function (forHorizontal) {
    // less than 20 is not enough to show the axis label 'outer' without legend
    return (forHorizontal ? this.margin.bottom : (this.margin.top + this.height)) + 20;
};
c3_chart_internal_fn.getXAxisClipWidth = function () {
    var $$ = this;
    return $$.getAxisClipWidth(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getXAxisClipHeight = function () {
    var $$ = this;
    return $$.getAxisClipHeight(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipWidth = function () {
    var $$ = this;
    return $$.getAxisClipWidth($$.config.axis_rotated) + ($$.config.axis_y_inner ? 20 : 0);
};
c3_chart_internal_fn.getYAxisClipHeight = function () {
    var $$ = this;
    return $$.getAxisClipHeight($$.config.axis_rotated);
};
