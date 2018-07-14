import { Chart } from './core';

Chart.prototype.data = function (targetIds) {
    var targets = this.internal.data.targets;
    return typeof targetIds === 'undefined' ? targets : targets.filter(function (t) {
        return [].concat(targetIds).indexOf(t.id) >= 0;
    });
};
Chart.prototype.data.shown = function (targetIds) {
    return this.internal.filterTargetsToShow(this.data(targetIds));
};
Chart.prototype.data.values = function (targetId) {
    var targets, values = null;
    if (targetId) {
        targets = this.data(targetId);
        values = targets[0] ? targets[0].values.map(function (d) { return d.value; }) : null;
    }
    return values;
};
Chart.prototype.data.names = function (names) {
    this.internal.clearLegendItemTextBoxCache();
    return this.internal.updateDataAttributes('names', names);
};
Chart.prototype.data.colors = function (colors) {
    return this.internal.updateDataAttributes('colors', colors);
};
Chart.prototype.data.axes = function (axes) {
    return this.internal.updateDataAttributes('axes', axes);
};
