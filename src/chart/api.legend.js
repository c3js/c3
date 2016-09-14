c3_chart_fn.legend = function () {};
c3_chart_fn.legend.show = function (targetIds) {
    const $$ = this.internal;
    $$.showLegend($$.mapToTargetIds(targetIds));
    $$.updateAndRedraw({ withLegend: true });
};
c3_chart_fn.legend.hide = function (targetIds) {
    const $$ = this.internal;
    $$.hideLegend($$.mapToTargetIds(targetIds));
    $$.updateAndRedraw({ withLegend: true });
};
