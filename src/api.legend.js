c3_chart_fn.legend = function () {};
c3_chart_fn.legend.show = function (targetIds) {
    var $$ = this.internal;
    $$.showLegend($$.mapToTargetIds(targetIds));
    $$.updateAndRedraw({withLegend: true});
};
c3_chart_fn.legend.hide = function (targetIds) {
    var $$ = this.internal;
    $$.hideLegend($$.mapToTargetIds(targetIds));
    $$.updateAndRedraw({withLegend: true});
};
c3_chart_fn.legend.position = function (position) {
    var $$ = this.internal;
    $$.config.legend_position = position;
    $$.isLegendRight = $$.config.legend_position === 'right';
    $$.updateAndRedraw({withLegend: true});
};
