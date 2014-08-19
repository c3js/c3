c3_chart_internal_fn.generateColor = function () {
    var $$ = this, config = $$.config, d3 = $$.d3,
        colors = config[__data_colors],
        pattern = notEmpty(config[__color_pattern]) ? config[__color_pattern] : d3.scale.category10().range(),
        callback = config[__data_color],
        ids = [];

    return function (d) {
        var id = d.id || d, color;

        // if callback function is provided
        if (colors[id] instanceof Function) {
            color = colors[id](d);
        }
        // if specified, choose that color
        else if (colors[id]) {
            color = colors[id];
        }
        // if not specified, choose from pattern
        else {
            if (ids.indexOf(id) < 0) { ids.push(id); }
            color = pattern[ids.indexOf(id) % pattern.length];
            colors[id] = color;
        }
        return callback instanceof Function ? callback(color, d) : color;
    };
};
c3_chart_internal_fn.generateLevelColor = function () {
    var $$ = this, config = $$.config,
        colors = config[__color_pattern],
        threshold = config[__color_threshold],
        asValue = threshold.unit === 'value',
        values = threshold.values && threshold.values.length ? threshold.values : [],
        max = threshold.max || 100;
    return notEmpty(config[__color_threshold]) ? function (value) {
        var i, v, color = colors[colors.length - 1];
        for (i = 0; i < values.length; i++) {
            v = asValue ? value : (value * 100 / max);
            if (v < values[i]) {
                color = colors[i];
                break;
            }
        }
        return color;
    } : null;
};
