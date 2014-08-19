c3_chart_fn.focus = function (targetId) {
    var $$ = this.internal,
        candidates = $$.svg.selectAll($$.selectorTarget(targetId)),
        candidatesForNoneArc = candidates.filter($$.isNoneArc.bind($$)),
        candidatesForArc = candidates.filter($$.isArc.bind($$));
    function focus(targets) {
        $$.filterTargetsToShow(targets).transition().duration(100).style('opacity', 1);
    }
    this.revert();
    this.defocus();
    focus(candidatesForNoneArc.classed(CLASS.focused, true));
    focus(candidatesForArc);
    if ($$.hasArcType()) {
        $$.expandArc(targetId, true);
    }
    $$.toggleFocusLegend(targetId, true);
};

c3_chart_fn.defocus = function (targetId) {
    var $$ = this.internal,
        candidates = $$.svg.selectAll($$.selectorTarget(targetId)),
        candidatesForNoneArc = candidates.filter($$.isNoneArc.bind($$)),
        candidatesForArc = candidates.filter($$.isArc.bind($$));
    function defocus(targets) {
        $$.filterTargetsToShow(targets).transition().duration(100).style('opacity', 0.3);
    }
    this.revert();
    defocus(candidatesForNoneArc.classed(CLASS.focused, false));
    defocus(candidatesForArc);
    if ($$.hasArcType()) {
        $$.unexpandArc(targetId);
    }
    $$.toggleFocusLegend(targetId, false);
};

c3_chart_fn.revert = function (targetId) {
    var $$ = this.internal,
        candidates = $$.svg.selectAll($$.selectorTarget(targetId)),
        candidatesForNoneArc = candidates.filter($$.isNoneArc.bind($$)),
        candidatesForArc = candidates.filter($$.isArc.bind($$));
    function revert(targets) {
        $$.filterTargetsToShow(targets).transition().duration(100).style('opacity', 1);
    }
    revert(candidatesForNoneArc.classed(CLASS.focused, false));
    revert(candidatesForArc);
    if ($$.hasArcType()) {
        $$.unexpandArc(targetId);
    }
    $$.revertLegend();
};
