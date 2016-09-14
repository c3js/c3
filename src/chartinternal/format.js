c3_chart_internal_fn.getYFormat = function (forArc) {
    let $$ = this,
        formatForY = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.yFormat,
        formatForY2 = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.y2Format;
    return function (v, ratio, id) {
        const format = $$.axis.getId(id) === 'y2' ? formatForY2 : formatForY;
        return format.call($$, v, ratio);
    };
};
c3_chart_internal_fn.yFormat = function (v) {
    let $$ = this, config = $$.config,
        format = config.axis_y_tick_format ? config.axis_y_tick_format : $$.defaultValueFormat;
    return format(v);
};
c3_chart_internal_fn.y2Format = function (v) {
    let $$ = this, config = $$.config,
        format = config.axis_y2_tick_format ? config.axis_y2_tick_format : $$.defaultValueFormat;
    return format(v);
};
c3_chart_internal_fn.defaultValueFormat = function (v) {
    return isValue(v) ? +v : '';
};
c3_chart_internal_fn.defaultArcValueFormat = function (v, ratio) {
    return (ratio * 100).toFixed(1) + '%';
};
c3_chart_internal_fn.dataLabelFormat = function (targetId) {
    let $$ = this, data_labels = $$.config.data_labels,
        format, defaultFormat = function (v) { return isValue(v) ? +v : ''; };
    // find format according to axis id
    if (typeof data_labels.format === 'function') {
        format = data_labels.format;
    } else if (typeof data_labels.format === 'object') {
        if (data_labels.format[targetId]) {
            format = data_labels.format[targetId] === true ? defaultFormat : data_labels.format[targetId];
        } else {
            format = function () { return ''; };
        }
    } else {
        format = defaultFormat;
    }
    return format;
};
