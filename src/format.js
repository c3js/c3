import { ChartInternal } from './core';
import { isValue } from './util';

ChartInternal.prototype.getYFormat = function (forArc) {
    var $$ = this,
        formatForY = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.yFormat,
        formatForY2 = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.y2Format;
    return function (v, ratio, id) {
        var format = $$.axis.getId(id) === 'y2' ? formatForY2 : formatForY;
        return format.call($$, v, ratio);
    };
};
ChartInternal.prototype.yFormat = function (v) {
    var $$ = this, config = $$.config,
        format = config.axis_y_tick_format ? config.axis_y_tick_format : $$.defaultValueFormat;
    return format(v);
};
ChartInternal.prototype.y2Format = function (v) {
    var $$ = this, config = $$.config,
        format = config.axis_y2_tick_format ? config.axis_y2_tick_format : $$.defaultValueFormat;
    return format(v);
};
ChartInternal.prototype.defaultValueFormat = function (v) {
    return isValue(v) ? +v : "";
};
ChartInternal.prototype.defaultArcValueFormat = function (v, ratio) {
    return (ratio * 100).toFixed(1) + '%';
};
ChartInternal.prototype.dataLabelFormat = function (targetId) {
    var $$ = this, data_labels = $$.config.data_labels,
        format, defaultFormat = function (v) { return isValue(v) ? +v : ""; };
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
