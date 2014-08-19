c3_chart_internal_fn.categoryName = function (i) {
    var config = this.config;
    return i < config[__axis_x_categories].length ? config[__axis_x_categories][i] : i;
};
