c3_chart_fn.groups = function (groups) {
    let $$ = this.internal, config = $$.config;
    if (isUndefined(groups)) { return config.data_groups; }
    config.data_groups = groups;
    $$.redraw();
    return config.data_groups;
};
