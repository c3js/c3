import {
    CLASS,
    isValue,
    isFunction,
    isString,
    isUndefined,
    isDefined,
    ceil10,
    asHalfPixel,
    diffDomain,
    isEmpty,
    notEmpty,
    getOption,
    hasValue,
    sanitise,
    getPathBox,
    ChartInternal
} from '../chartinternal.js';

const data = function (targetIds) {
    const targets = this.internal.data.targets;
    return typeof targetIds === 'undefined' ? targets : targets.filter((t) => {
        return [].concat(targetIds).indexOf(t.id) >= 0;
    });
};

data.shown = function (targetIds) {
    return this.internal.filterTargetsToShow(this.data(targetIds));
};

data.values = function (targetId) {
    let targets, values = null;
    if (targetId) {
        targets = this.data(targetId);
        values = targets[0] ? targets[0].values.map((d) => { return d.value; }) : null;
    }
    return values;
};

data.names = function (names) {
    this.internal.clearLegendItemTextBoxCache();
    return this.internal.updateDataAttributes('names', names);
};

data.colors = function (colors) {
    return this.internal.updateDataAttributes('colors', colors);
};

data.axes = function (axes) {
    return this.internal.updateDataAttributes('axes', axes);
};

export { data };
