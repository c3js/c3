c3_chart_fn.data = function (targetIds) {
    var targets = this.internal.data.targets;
    return typeof targetIds === 'undefined' ? targets : targets.filter(function (t) {
        return [].concat(targetIds).indexOf(t.id) >= 0;
    });
};
c3_chart_fn.data.shown = function (targetId) {
    return this.internal.filterTargetsToShow(this.data(targetId));
};
c3_chart_fn.data.values = function (targetId) {
    var target = this.data(targetId);
    return target ? target.values.map(function (d) { return d.value; }) : null;
};
c3_chart_fn.data.names = function (names) {
    return this.internal.updateDataAttributes('names', names);
};
c3_chart_fn.data.colors = function (colors) {
    return this.internal.updateDataAttributes('colors', colors);
};
c3_chart_fn.data.axes = function (axes) {
    return this.internal.updateDataAttributes('axes', axes);
};
