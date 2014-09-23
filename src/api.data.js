c3_chart_fn.data = function (targetId) {
    var targets = this.internal.data.targets.filter(function (t) { return t.id === targetId; });
    return targets.length > 0 ? targets[0] : null;
};
c3_chart_fn.data.values = function (targetId) {
    var target = this.data(targetId);
    return target ? target.values.map(function (d) { return d.value; }) : null;
};
c3_chart_fn.data.names = function (names) {
    var $$ = this.internal, config = $$.config;
    if (!arguments.length) { return config.data_names; }
    Object.keys(names).forEach(function (id) {
        config.data_names[id] = names[id];
    });
    $$.redraw({withLegend: true});
    return config.data_names;
};
c3_chart_fn.data.colors = function (colors) {
    var $$ = this.internal, config = $$.config;
    if (!arguments.length) { return config.data_colors; }
    Object.keys(colors).forEach(function (id) {
        config.data_colors[id] = colors[id];
    });
    $$.redraw({withLegend: true});
    return config.data_colors;
};
