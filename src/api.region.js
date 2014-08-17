c3_chart_fn.regions = function (regions) {
    var $$ = this.internal, config = $$.config;
    if (!regions) { return config[__regions]; }
    config[__regions] = regions;
    $$.redraw();
    return config[__regions];
};
c3_chart_fn.regions.add = function (regions) {
    var $$ = this.internal, config = $$.config;
    if (!regions) { return config[__regions]; }
    config[__regions] = config[__regions].concat(regions);
    $$.redraw();
    return config[__regions];
};
c3_chart_fn.regions.remove = function (options) {
    var $$ = this.internal, config = $$.config,
        duration, classes, regions;

    options = options || {};
    duration = $$.getOption(options, "duration", config[__transition_duration]);
    classes = $$.getOption(options, "classes", [CLASS[_region]]);

    regions = $$.main.select('.' + CLASS[_regions]).selectAll(classes.map(function (c) { return '.' + c; }));
    (duration ? regions.transition().duration(duration) : regions)
        .style('opacity', 0)
        .remove();

    config[__regions] = config[__regions].filter(function (region) {
        var found = false;
        if (!region.class) {
            return true;
        }
        region.class.split(' ').forEach(function (c) {
            if (classes.indexOf(c) >= 0) { found = true; }
        });
        return !found;
    });

    return config[__regions];
};
