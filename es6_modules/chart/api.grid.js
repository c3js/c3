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

const xgrids = function (grids) {
    let $$ = this.internal, config = $$.config;
    if (!grids) { return config.grid_x_lines; }
    config.grid_x_lines = grids;
    $$.redrawWithoutRescale();
    return config.grid_x_lines;
};

xgrids.add = function (grids) {
    const $$ = this.internal;
    return this.xgrids($$.config.grid_x_lines.concat(grids ? grids : []));
};

xgrids.remove = function (params) { // TODO: multiple
    const $$ = this.internal;
    $$.removeGridLines(params, true);
};

const ygrids = function (grids) {
    let $$ = this.internal, config = $$.config;
    if (!grids) { return config.grid_y_lines; }
    config.grid_y_lines = grids;
    $$.redrawWithoutRescale();
    return config.grid_y_lines;
};

ygrids.add = function (grids) {
    const $$ = this.internal;
    return this.ygrids($$.config.grid_y_lines.concat(grids ? grids : []));
};

ygrids.remove = function (params) { // TODO: multiple
    const $$ = this.internal;
    $$.removeGridLines(params, false);
};

export { xgrids, ygrids };
