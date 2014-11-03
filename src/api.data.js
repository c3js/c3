c3_chart_fn.data = function (targetIds) {
    var targets = this.internal.data.targets;
    return typeof targetIds === 'undefined' ? targets : targets.filter(function (t) {
        return [].concat(targetIds).indexOf(t.id) >= 0;
    });
};
c3_chart_fn.data.shown = function (targetId) {
    return this.internal.filterTargetsToShow(this.data(targetId));
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
