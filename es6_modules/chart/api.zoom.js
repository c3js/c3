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
} from '../internals/index';

const zoom = function (domain) {
    const $$ = this.internal;
    if (domain) {
        if ($$.isTimeSeries()) {
            domain = domain.map((x) => { return $$.parseDate(x); });
        }
        $$.brush.extent(domain);
        $$.redraw({ withUpdateXDomain: true, withY: $$.config.zoom_rescale });
        $$.config.zoom_onzoom.call(this, $$.x.orgDomain());
    }
    return $$.brush.extent();
};

const unzoom = function () {
    const $$ = this.internal;
    $$.brush.clear().update();
    $$.redraw({ withUpdateXDomain: true });
};

zoom.enable = function (enabled) {
    const $$ = this.internal;
    $$.config.zoom_enabled = enabled;
    $$.updateAndRedraw();
};

zoom.max = function (max) {
    let $$ = this.internal, config = $$.config, d3 = $$.d3;
    if (max === 0 || max) {
        config.zoom_x_max = d3.max([$$.orgXDomain[1], max]);
    }
    else {
        return config.zoom_x_max;
    }
};

zoom.min = function (min) {
    let $$ = this.internal, config = $$.config, d3 = $$.d3;
    if (min === 0 || min) {
        config.zoom_x_min = d3.min([$$.orgXDomain[0], min]);
    }
    else {
        return config.zoom_x_min;
    }
};

zoom.range = function (range) {
    if (arguments.length) {
        if (isDefined(range.max)) { this.domain.max(range.max); }
        if (isDefined(range.min)) { this.domain.min(range.min); }
    } else {
        return {
            max: this.domain.max(),
            min: this.domain.min(),
        };
    }
};

export { zoom, unzoom };
