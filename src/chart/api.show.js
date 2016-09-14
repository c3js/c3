c3_chart_fn.show = function (targetIds, options) {
    let $$ = this.internal, targets;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.removeHiddenTargetIds(targetIds);
    targets = $$.svg.selectAll($$.selectorTargets(targetIds));

    targets.transition()
        .style('opacity', 1, 'important')
        .call($$.endall, () => {
            targets.style('opacity', null).style('opacity', 1);
        });

    if (options.withLegend) {
        $$.showLegend(targetIds);
    }

    $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true });
};

c3_chart_fn.hide = function (targetIds, options) {
    let $$ = this.internal, targets;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.addHiddenTargetIds(targetIds);
    targets = $$.svg.selectAll($$.selectorTargets(targetIds));

    targets.transition()
        .style('opacity', 0, 'important')
        .call($$.endall, () => {
            targets.style('opacity', null).style('opacity', 0);
        });

    if (options.withLegend) {
        $$.hideLegend(targetIds);
    }

    $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true });
};

c3_chart_fn.toggle = function (targetIds, options) {
    let that = this, $$ = this.internal;
    $$.mapToTargetIds(targetIds).forEach((targetId) => {
        $$.isTargetToShow(targetId) ? that.hide(targetId, options) : that.show(targetId, options);
    });
};
