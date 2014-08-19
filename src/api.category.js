c3_chart_fn.category = function (i, category) {
    var $$ = this.internal, config = $$.config;
    if (arguments.length > 1) {
        config[__axis_x_categories][i] = category;
        $$.redraw();
    }
    return config[__axis_x_categories][i];
};
c3_chart_fn.categories = function (categories) {
    var $$ = this.internal, config = $$.config;
    if (!arguments.length) { return config[__axis_x_categories]; }
    config[__axis_x_categories] = categories;
    $$.redraw();
    return config[__axis_x_categories];
};
