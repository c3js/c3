c3_chart_internal_fn.transformTo = function (targetIds, type, optionsForRedraw) {
    let $$ = this,
        withTransitionForAxis = !$$.hasArcType(),
        options = optionsForRedraw || { withTransitionForAxis };
    options.withTransitionForTransform = false;
    $$.transiting = false;
    $$.setTargetType(targetIds, type);
    $$.updateTargets($$.data.targets); // this is needed when transforming to arc
    $$.updateAndRedraw(options);
};
