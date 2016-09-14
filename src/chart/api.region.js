c3_chart_fn.regions = function (regions) {
    let $$ = this.internal, config = $$.config;
    if (!regions) { return config.regions; }
    config.regions = regions;
    $$.redrawWithoutRescale();
    return config.regions;
};
c3_chart_fn.regions.add = function (regions) {
    let $$ = this.internal, config = $$.config;
    if (!regions) { return config.regions; }
    config.regions = config.regions.concat(regions);
    $$.redrawWithoutRescale();
    return config.regions;
};
c3_chart_fn.regions.remove = function (options) {
    let $$ = this.internal, config = $$.config,
        duration, classes, regions;

    options = options || {};
    duration = $$.getOption(options, 'duration', config.transition_duration);
    classes = $$.getOption(options, 'classes', [CLASS.region]);

    regions = $$.main.select('.' + CLASS.regions).selectAll(classes.map((c) => { return '.' + c; }));
    (duration ? regions.transition().duration(duration) : regions)
        .style('opacity', 0)
        .remove();

    config.regions = config.regions.filter((region) => {
        let found = false;
        if (!region.class) {
            return true;
        }
        region.class.split(' ').forEach((c) => {
            if (classes.indexOf(c) >= 0) { found = true; }
        });
        return !found;
    });

    return config.regions;
};
