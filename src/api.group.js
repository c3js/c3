c3_chart_fn.groups = function (groups) {
    var $$ = this.internal, config = $$.config;
    if (isUndefined(groups)) { return config[__data_groups]; }
    config[__data_groups] = groups;
    $$.redraw();
    return config[__data_groups];
};
