c3_chart_fn.focus = function (targetIds) {
    var $$ = this.internal, candidates;

    targetIds = $$.mapToTargetIds(targetIds);
    candidates = $$.svg.selectAll($$.selectorTargets(targetIds.filter($$.isTargetToShow, $$))),

    this.revert();
    this.defocus();
    candidates.classed(CLASS.focused, true).classed(CLASS.defocused, false);
    if ($$.hasArcType()) {
        $$.expandArc(targetIds);
    }
    $$.toggleFocusLegend(targetIds, true);

    $$.focusedTargetIds = targetIds;
    $$.defocusedTargetIds = $$.defocusedTargetIds.filter(function (id) {
        return targetIds.indexOf(id) < 0;
    });
};

c3_chart_fn.defocus = function (targetIds) {
    var $$ = this.internal, candidates;

    targetIds = $$.mapToTargetIds(targetIds);
    candidates = $$.svg.selectAll($$.selectorTargets(targetIds.filter($$.isTargetToShow, $$))),

    this.revert();
    candidates.classed(CLASS.focused, false).classed(CLASS.defocused, true);
    if ($$.hasArcType()) {
        $$.unexpandArc(targetIds);
    }
    $$.toggleFocusLegend(targetIds, false);

    $$.focusedTargetIds = $$.focusedTargetIds.filter(function (id) {
        return targetIds.indexOf(id) < 0;
    });
    $$.defocusedTargetIds = targetIds;
};

c3_chart_fn.revert = function (targetIds) {
    var $$ = this.internal, candidates;

    targetIds = $$.mapToTargetIds(targetIds);
    candidates = $$.svg.selectAll($$.selectorTargets(targetIds)); // should be for all targets

    candidates.classed(CLASS.focused, false).classed(CLASS.defocused, false);
    if ($$.hasArcType()) {
        $$.unexpandArc(targetIds);
    }
    $$.revertLegend();

    $$.focusedTargetIds = [];
    $$.defocusedTargetIds = [];
};
