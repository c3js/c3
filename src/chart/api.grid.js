c3_chart_fn.xgrids = function (grids) {
    let $$ = this.internal, config = $$.config;
    if (!grids) { return config.grid_x_lines; }
    config.grid_x_lines = grids;
    $$.redrawWithoutRescale();
    return config.grid_x_lines;
};
c3_chart_fn.xgrids.add = function (grids) {
    const $$ = this.internal;
    return this.xgrids($$.config.grid_x_lines.concat(grids ? grids : []));
};
c3_chart_fn.xgrids.remove = function (params) { // TODO: multiple
    const $$ = this.internal;
    $$.removeGridLines(params, true);
};

c3_chart_fn.ygrids = function (grids) {
    let $$ = this.internal, config = $$.config;
    if (!grids) { return config.grid_y_lines; }
    config.grid_y_lines = grids;
    $$.redrawWithoutRescale();
    return config.grid_y_lines;
};
c3_chart_fn.ygrids.add = function (grids) {
    const $$ = this.internal;
    return this.ygrids($$.config.grid_y_lines.concat(grids ? grids : []));
};
c3_chart_fn.ygrids.remove = function (params) { // TODO: multiple
    const $$ = this.internal;
    $$.removeGridLines(params, false);
};
