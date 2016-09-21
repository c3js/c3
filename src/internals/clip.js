const getClipPath = function (id) {
    const isIE9 = typeof window !== 'undefined' && window.navigator.appVersion.toLowerCase().indexOf('msie 9.') >= 0;
    const isBrowser = typeof document !== 'undefined';
    return 'url(' + (isIE9 ? '' : isBrowser ? document.URL.split('#')[0] : Date.now()) + '#' + id + ')';
};
const appendClip = function (parent, id) {
    return parent.append('clipPath').attr('id', id).append('rect');
};
const getAxisClipX = function (forHorizontal) {
    // axis line width + padding for left
    const left = Math.max(30, this.margin.left);
    return forHorizontal ? -(1 + left) : -(left - 1);
};
const getAxisClipY = function (forHorizontal) {
    return forHorizontal ? -20 : -this.margin.top;
};
const getXAxisClipX = function () {
    const $$ = this;
    return $$.getAxisClipX(!$$.config.axis_rotated);
};
const getXAxisClipY = function () {
    const $$ = this;
    return $$.getAxisClipY(!$$.config.axis_rotated);
};
const getYAxisClipX = function () {
    const $$ = this;
    return $$.config.axis_y_inner ? -1 : $$.getAxisClipX($$.config.axis_rotated);
};
const getYAxisClipY = function () {
    const $$ = this;
    return $$.getAxisClipY($$.config.axis_rotated);
};
const getAxisClipWidth = function (forHorizontal) {
    let $$ = this,
        left = Math.max(30, $$.margin.left),
        right = Math.max(30, $$.margin.right);
    // width + axis line width + padding for left/right
    return forHorizontal ? $$.width + 2 + left + right : $$.margin.left + 20;
};
const getAxisClipHeight = function (forHorizontal) {
    // less than 20 is not enough to show the axis label 'outer' without legend
    return (forHorizontal ? this.margin.bottom : (this.margin.top + this.height)) + 20;
};
const getXAxisClipWidth = function () {
    const $$ = this;
    return $$.getAxisClipWidth(!$$.config.axis_rotated);
};
const getXAxisClipHeight = function () {
    const $$ = this;
    return $$.getAxisClipHeight(!$$.config.axis_rotated);
};
const getYAxisClipWidth = function () {
    const $$ = this;
    return $$.getAxisClipWidth($$.config.axis_rotated) + ($$.config.axis_y_inner ? 20 : 0);
};
const getYAxisClipHeight = function () {
    const $$ = this;
    return $$.getAxisClipHeight($$.config.axis_rotated);
};

export {
    getClipPath,
    appendClip,
    getAxisClipX,
    getAxisClipY,
    getXAxisClipX,
    getXAxisClipY,
    getYAxisClipX,
    getYAxisClipY,
    getAxisClipWidth,
    getAxisClipHeight,
    getXAxisClipWidth,
    getXAxisClipHeight,
    getYAxisClipWidth,
    getYAxisClipHeight,
};
