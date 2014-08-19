c3_chart_fn.xgrids = function (grids) {
    var $$ = this.internal, config = $$.config;
    if (! grids) { return config[__grid_x_lines]; }
    config[__grid_x_lines] = grids;
    $$.redraw();
    return config[__grid_x_lines];
};
c3_chart_fn.xgrids.add = function (grids) {
    var $$ = this.internal;
    return this.xgrids($$.config[__grid_x_lines].concat(grids ? grids : []));
};
c3_chart_fn.xgrids.remove = function (params) { // TODO: multiple
    var $$ = this.internal;
    $$.removeGridLines(params, true);
};

c3_chart_fn.ygrids = function (grids) {
    var $$ = this.internal, config = $$.config;
    if (! grids) { return config[__grid_y_lines]; }
    config[__grid_y_lines] = grids;
    $$.redraw();
    return config[__grid_y_lines];
};
c3_chart_fn.ygrids.add = function (grids) {
    var $$ = this.internal;
    return this.ygrids($$.config[__grid_y_lines].concat(grids ? grids : []));
};
c3_chart_fn.ygrids.remove = function (params) { // TODO: multiple
    var $$ = this.internal;
    $$.removeGridLines(params, false);
};
