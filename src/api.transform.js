c3_chart_fn.transform = function(type, targetIds) {
    var $$ = this.internal,
        options = ['pie', 'donut'].indexOf(type) >= 0 ? { withTransform: true } : null;
    $$.transformTo(targetIds, type, options);
};
