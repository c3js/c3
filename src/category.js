c3_chart_internal_fn.categoryName = function (i) {
    var config = this.config, categoryIndex = Math.ceil(i);
    return i < config.axis_x_categories.length ? config.axis_x_categories[categoryIndex] : i;
};
