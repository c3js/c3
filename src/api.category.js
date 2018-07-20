import { Chart } from './core';

Chart.prototype.category = function (i, category) {
    var $$ = this.internal, config = $$.config;
    if (arguments.length > 1) {
        config.axis_x_categories[i] = category;
        $$.redraw();
    }
    return config.axis_x_categories[i];
};
Chart.prototype.categories = function (categories) {
    var $$ = this.internal, config = $$.config;
    if (!arguments.length) { return config.axis_x_categories; }
    config.axis_x_categories = categories;
    $$.redraw();
    return config.axis_x_categories;
};
