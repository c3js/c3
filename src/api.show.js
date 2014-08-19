c3_chart_fn.show = function (targetIds, options) {
    var $$ = this.internal;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.removeHiddenTargetIds(targetIds);
    $$.svg.selectAll($$.selectorTargets(targetIds))
        .transition()
        .style('opacity', 1);

    if (options.withLegend) {
        $$.showLegend(targetIds);
    }

    $$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true});
};

c3_chart_fn.hide = function (targetIds, options) {
    var $$ = this.internal;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.addHiddenTargetIds(targetIds);
    $$.svg.selectAll($$.selectorTargets(targetIds))
        .transition()
        .style('opacity', 0);

    if (options.withLegend) {
        $$.hideLegend(targetIds);
    }

    $$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true});
};

c3_chart_fn.toggle = function (targetId) {
    var $$ = this.internal;
    $$.isTargetToShow(targetId) ? this.hide(targetId) : this.show(targetId);
};
