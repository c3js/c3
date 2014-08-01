c3_chart_internal_fn.getYFormat = function (forArc) {
    var $$ = this,
        formatForY = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.yFormat,
        formatForY2 = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.y2Format;
    return function (v, ratio, id) {
        var format = $$.getAxisId(id) === 'y2' ? formatForY2 : formatForY;
        return format.call($$, v, ratio);
    };
};
c3_chart_internal_fn.yFormat = function (v) {
    var $$ = this, config = $$.config,
        format = config[__axis_y_tick_format] ? config[__axis_y_tick_format] : $$.defaultValueFormat;
    return format(v);
};
c3_chart_internal_fn.y2Format = function (v) {
    var $$ = this, config = $$.config,
        format = config[__axis_y2_tick_format] ? config[__axis_y2_tick_format] : $$.defaultValueFormat;
    return format(v);
};
c3_chart_internal_fn.defaultValueFormat = function (v) {
    return isValue(v) ? +v : "";
};
c3_chart_internal_fn.defaultArcValueFormat = function (v, ratio) {
    return (ratio * 100).toFixed(1) + '%';
};
c3_chart_internal_fn.formatByAxisId = function (axisId) {
    var $$ = this.internal, data_labels = $$.config[__data_labels],
        format = function (v) { return isValue(v) ? +v : ""; };
    // find format according to axis id
    if (isFunction(data_labels.format)) {
        format = data_labels.format;
    } else if (typeof data_labels.format === 'object') {
        if (isFunction(data_labels.format[axisId])) {
            format = data_labels.format[axisId];
        }
    }
    return format;
};
