import {
    CLASS,
    isValue,
    isFunction,
    isString,
    isUndefined,
    isDefined,
    ceil10,
    asHalfPixel,
    diffDomain,
    isEmpty,
    notEmpty,
    getOption,
    hasValue,
    sanitise,
    getPathBox,
    ChartInternal
} from '../chartinternal.js';

const axis = function () {};
axis.labels = function (labels) {
    const $$ = this.internal;
    if (arguments.length) {
        Object.keys(labels).forEach((axisId) => {
            $$.axis.setLabelText(axisId, labels[axisId]);
        });
        $$.axis.updateLabels();
    }
    // TODO: return some values?
};
axis.max = function (max) {
    let $$ = this.internal, config = $$.config;
    if (arguments.length) {
        if (typeof max === 'object') {
            if (isValue(max.x)) { config.axis_x_max = max.x; }
            if (isValue(max.y)) { config.axis_y_max = max.y; }
            if (isValue(max.y2)) { config.axis_y2_max = max.y2; }
        } else {
            config.axis_y_max = config.axis_y2_max = max;
        }
        $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true });
    } else {
        return {
            x: config.axis_x_max,
            y: config.axis_y_max,
            y2: config.axis_y2_max,
        };
    }
};
axis.min = function (min) {
    let $$ = this.internal, config = $$.config;
    if (arguments.length) {
        if (typeof min === 'object') {
            if (isValue(min.x)) { config.axis_x_min = min.x; }
            if (isValue(min.y)) { config.axis_y_min = min.y; }
            if (isValue(min.y2)) { config.axis_y2_min = min.y2; }
        } else {
            config.axis_y_min = config.axis_y2_min = min;
        }
        $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true });
    } else {
        return {
            x: config.axis_x_min,
            y: config.axis_y_min,
            y2: config.axis_y2_min,
        };
    }
};
axis.range = function (range) {
    if (arguments.length) {
        if (isDefined(range.max)) { this.axis.max(range.max); }
        if (isDefined(range.min)) { this.axis.min(range.min); }
    } else {
        return {
            max: this.axis.max(),
            min: this.axis.min(),
        };
    }
};

export { axis };
