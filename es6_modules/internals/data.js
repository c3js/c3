import {
    notEmpty,
    hasValue,
    isValue,
    isFunction,
} from './util';

import { CLASS } from './class';

const isX = function (key) {
    let $$ = this, config = $$.config;
    return (config.data_x && key === config.data_x) || (notEmpty(config.data_xs) && hasValue(config.data_xs, key));
};
const isNotX = function (key) {
    return !this.isX(key);
};
const getXKey = function (id) {
    let $$ = this, config = $$.config;
    return config.data_x ? config.data_x : notEmpty(config.data_xs) ? config.data_xs[id] : null;
};
const getXValuesOfXKey = function (key, targets) {
    let $$ = this,
        xValues, ids = targets && notEmpty(targets) ? $$.mapToIds(targets) : [];
    ids.forEach((id) => {
        if ($$.getXKey(id) === key) {
            xValues = $$.data.xs[id];
        }
    });
    return xValues;
};
const getIndexByX = function (x) {
    let $$ = this,
        data = $$.filterByX($$.data.targets, x);
    return data.length ? data[0].index : null;
};
const getXValue = function (id, i) {
    const $$ = this;
    return id in $$.data.xs && $$.data.xs[id] && isValue($$.data.xs[id][i]) ? $$.data.xs[id][i] : i;
};
const getOtherTargetXs = function () {
    let $$ = this,
        idsForX = Object.keys($$.data.xs);
    return idsForX.length ? $$.data.xs[idsForX[0]] : null;
};
const getOtherTargetX = function (index) {
    const xs = this.getOtherTargetXs();
    return xs && index < xs.length ? xs[index] : null;
};
const addXs = function (xs) {
    const $$ = this;
    Object.keys(xs).forEach((id) => {
        $$.config.data_xs[id] = xs[id];
    });
};
const hasMultipleX = function (xs) {
    return this.d3.set(Object.keys(xs).map((id) => { return xs[id]; })).size() > 1;
};
const isMultipleX = function () {
    return notEmpty(this.config.data_xs) || !this.config.data_xSort || this.hasType('scatter');
};
const addName = function (data) {
    let $$ = this, name;
    if (data) {
        name = $$.config.data_names[data.id];
        data.name = name !== undefined ? name : data.id;
    }
    return data;
};
const getValueOnIndex = function (values, index) {
    const valueOnIndex = values.filter((v) => { return v.index === index; });
    return valueOnIndex.length ? valueOnIndex[0] : null;
};
const updateTargetX = function (targets, x) {
    const $$ = this;
    targets.forEach((t) => {
        t.values.forEach((v, i) => {
            v.x = $$.generateTargetX(x[i], t.id, i);
        });
        $$.data.xs[t.id] = x;
    });
};
const updateTargetXs = function (targets, xs) {
    const $$ = this;
    targets.forEach((t) => {
        if (xs[t.id]) {
            $$.updateTargetX([t], xs[t.id]);
        }
    });
};
const generateTargetX = function (rawX, id, index) {
    let $$ = this, x;
    if ($$.isTimeSeries()) {
        x = rawX ? $$.parseDate(rawX) : $$.parseDate($$.getXValue(id, index));
    }
    else if ($$.isCustomX() && !$$.isCategorized()) {
        x = isValue(rawX) ? +rawX : $$.getXValue(id, index);
    }
    else {
        x = index;
    }
    return x;
};
const cloneTarget = function (target) {
    return {
        id: target.id,
        id_org: target.id_org,
        values: target.values.map((d) => {
            return { x: d.x, value: d.value, id: d.id };
        }),
    };
};
const updateXs = function () {
    const $$ = this;
    if ($$.data.targets.length) {
        $$.xs = [];
        $$.data.targets[0].values.forEach((v) => {
            $$.xs[v.index] = v.x;
        });
    }
};
const getPrevX = function (i) {
    const x = this.xs[i - 1];
    return typeof x !== 'undefined' ? x : null;
};
const getNextX = function (i) {
    const x = this.xs[i + 1];
    return typeof x !== 'undefined' ? x : null;
};
const getMaxDataCount = function () {
    const $$ = this;
    return $$.d3.max($$.data.targets, (t) => { return t.values.length; });
};
const getMaxDataCountTarget = function (targets) {
    let length = targets.length, max = 0, maxTarget;
    if (length > 1) {
        targets.forEach((t) => {
            if (t.values.length > max) {
                maxTarget = t;
                max = t.values.length;
            }
        });
    } else {
        maxTarget = length ? targets[0] : null;
    }
    return maxTarget;
};
const getEdgeX = function (targets) {
    const $$ = this;
    return !targets.length ? [0, 0] : [
        $$.d3.min(targets, (t) => { return t.values[0].x; }),
        $$.d3.max(targets, (t) => { return t.values[t.values.length - 1].x; }),
    ];
};
const mapToIds = function (targets) {
    return targets.map((d) => { return d.id; });
};
const mapToTargetIds = function (ids) {
    const $$ = this;
    return ids ? [].concat(ids) : $$.mapToIds($$.data.targets);
};
const hasTarget = function (targets, id) {
    let ids = this.mapToIds(targets), i;
    for (i = 0; i < ids.length; i++) {
        if (ids[i] === id) {
            return true;
        }
    }
    return false;
};
const isTargetToShow = function (targetId) {
    return this.hiddenTargetIds.indexOf(targetId) < 0;
};
const isLegendToShow = function (targetId) {
    return this.hiddenLegendIds.indexOf(targetId) < 0;
};
const filterTargetsToShow = function (targets) {
    const $$ = this;
    return targets.filter((t) => { return $$.isTargetToShow(t.id); });
};
const mapTargetsToUniqueXs = function (targets) {
    const $$ = this;
    let xs = $$.d3.set($$.d3.merge(targets.map((t) => { return t.values.map((v) => { return +v.x; }); }))).values();
    xs = $$.isTimeSeries() ? xs.map((x) => { return new Date(+x); }) : xs.map((x) => { return +x; });
    return xs.sort((a, b) => { return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN; });
};
const addHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.concat(targetIds);
};
const removeHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.filter((id) => { return targetIds.indexOf(id) < 0; });
};
const addHiddenLegendIds = function (targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.concat(targetIds);
};
const removeHiddenLegendIds = function (targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.filter((id) => { return targetIds.indexOf(id) < 0; });
};
const getValuesAsIdKeyed = function (targets) {
    const ys = {};
    targets.forEach((t) => {
        ys[t.id] = [];
        t.values.forEach((v) => {
            ys[t.id].push(v.value);
        });
    });
    return ys;
};
const checkValueInTargets = function (targets, checker) {
    let ids = Object.keys(targets), i, j, values;
    for (i = 0; i < ids.length; i++) {
        values = targets[ids[i]].values;
        for (j = 0; j < values.length; j++) {
            if (checker(values[j].value)) {
                return true;
            }
        }
    }
    return false;
};
const hasNegativeValueInTargets = function (targets) {
    return this.checkValueInTargets(targets, (v) => { return v < 0; });
};
const hasPositiveValueInTargets = function (targets) {
    return this.checkValueInTargets(targets, (v) => { return v > 0; });
};
const isOrderDesc = function () {
    const config = this.config;
    return typeof (config.data_order) === 'string' && config.data_order.toLowerCase() === 'desc';
};
const isOrderAsc = function () {
    const config = this.config;
    return typeof (config.data_order) === 'string' && config.data_order.toLowerCase() === 'asc';
};
const orderTargets = function (targets) {
    let $$ = this, config = $$.config, orderAsc = $$.isOrderAsc(), orderDesc = $$.isOrderDesc();
    if (orderAsc || orderDesc) {
        targets.sort((t1, t2) => {
            const reducer = function (p, c) { return p + Math.abs(c.value); };
            let t1Sum = t1.values.reduce(reducer, 0),
                t2Sum = t2.values.reduce(reducer, 0);
            return orderAsc ? t2Sum - t1Sum : t1Sum - t2Sum;
        });
    } else if (isFunction(config.data_order)) {
        targets.sort(config.data_order);
    } // TODO: accept name array for order
    return targets;
};
const filterByX = function (targets, x) {
    return this.d3.merge(targets.map((t) => { return t.values; })).filter((v) => { return v.x - x === 0; });
};
const filterRemoveNull = function (data) {
    return data.filter((d) => { return isValue(d.value); });
};
const filterByXDomain = function (targets, xDomain) {
    return targets.map((t) => {
        return {
            id: t.id,
            id_org: t.id_org,
            values: t.values.filter((v) => {
                return xDomain[0] <= v.x && v.x <= xDomain[1];
            }),
        };
    });
};
const hasDataLabel = function () {
    const config = this.config;
    if (typeof config.data_labels === 'boolean' && config.data_labels) {
        return true;
    } else if (typeof config.data_labels === 'object' && notEmpty(config.data_labels)) {
        return true;
    }
    return false;
};
const getDataLabelLength = function (min, max, key) {
    let $$ = this,
        lengths = [0, 0], paddingCoef = 1.3;
    $$.selectChart.select('svg').selectAll('.dummy')
        .data([min, max])
        .enter().append('text')
        .text((d) => { return $$.dataLabelFormat(d.id)(d); })
        .each(function (d, i) {
            lengths[i] = this.getBoundingClientRect()[key] * paddingCoef;
        })
        .remove();
    return lengths;
};
const isNoneArc = function (d) {
    return this.hasTarget(this.data.targets, d.id);
};
const isArc = function (d) {
    return 'data' in d && this.hasTarget(this.data.targets, d.data.id);
};
const findSameXOfValues = function (values, index) {
    let i, targetX = values[index].x, sames = [];
    for (i = index - 1; i >= 0; i--) {
        if (targetX !== values[i].x) { break; }
        sames.push(values[i]);
    }
    for (i = index; i < values.length; i++) {
        if (targetX !== values[i].x) { break; }
        sames.push(values[i]);
    }
    return sames;
};

const findClosestFromTargets = function (targets, pos) {
    let $$ = this, candidates;

    // map to array of closest points of each target
    candidates = targets.map((target) => {
        return $$.findClosest(target.values, pos);
    });

    // decide closest point and return
    return $$.findClosest(candidates, pos);
};
const findClosest = function (values, pos) {
    let $$ = this, minDist = $$.config.point_sensitivity, closest;

    // find mouseovering bar
    values.filter((v) => { return v && $$.isBarType(v.id); }).forEach((v) => {
        const shape = $$.main.select('.' + CLASS.bars + $$.getTargetSelectorSuffix(v.id) + ' .' + CLASS.bar + '-' + v.index).node();
        if (!closest && $$.isWithinBar(shape)) {
            closest = v;
        }
    });

    // find closest point from non-bar
    values.filter((v) => { return v && !$$.isBarType(v.id); }).forEach((v) => {
        const d = $$.dist(v, pos);
        if (d < minDist) {
            minDist = d;
            closest = v;
        }
    });

    return closest;
};
const dist = function (data, pos) {
    let $$ = this, config = $$.config,
        xIndex = config.axis_rotated ? 1 : 0,
        yIndex = config.axis_rotated ? 0 : 1,
        y = $$.circleY(data, data.index),
        x = $$.x(data.x);
    return Math.sqrt(Math.pow(x - pos[xIndex], 2) + Math.pow(y - pos[yIndex], 2));
};
const convertValuesToStep = function (values) {
    let converted = [].concat(values), i;

    if (!this.isCategorized()) {
        return values;
    }

    for (i = values.length + 1; 0 < i; i--) {
        converted[i] = converted[i - 1];
    }

    converted[0] = {
        x: converted[0].x - 1,
        value: converted[0].value,
        id: converted[0].id,
    };
    converted[values.length + 1] = {
        x: converted[values.length].x + 1,
        value: converted[values.length].value,
        id: converted[values.length].id,
    };

    return converted;
};
const updateDataAttributes = function (name, attrs) {
    let $$ = this, config = $$.config, current = config['data_' + name];
    if (typeof attrs === 'undefined') { return current; }
    Object.keys(attrs).forEach((id) => {
        current[id] = attrs[id];
    });
    $$.redraw({ withLegend: true });
    return current;
};

export {
    isX,
    isNotX,
    getXKey,
    getXValuesOfXKey,
    getIndexByX,
    getXValue,
    getOtherTargetXs,
    getOtherTargetX,
    addXs,
    hasMultipleX,
    isMultipleX,
    addName,
    getValueOnIndex,
    updateTargetX,
    updateTargetXs,
    generateTargetX,
    cloneTarget,
    updateXs,
    getPrevX,
    getNextX,
    getMaxDataCount,
    getMaxDataCountTarget,
    getEdgeX,
    mapToIds,
    mapToTargetIds,
    hasTarget,
    isTargetToShow,
    isLegendToShow,
    filterTargetsToShow,
    mapTargetsToUniqueXs,
    addHiddenTargetIds,
    removeHiddenTargetIds,
    addHiddenLegendIds,
    removeHiddenLegendIds,
    getValuesAsIdKeyed,
    checkValueInTargets,
    hasNegativeValueInTargets,
    hasPositiveValueInTargets,
    isOrderDesc,
    isOrderAsc,
    orderTargets,
    filterByX,
    filterRemoveNull,
    filterByXDomain,
    hasDataLabel,
    getDataLabelLength,
    isNoneArc,
    isArc,
    findSameXOfValues,
    findClosestFromTargets,
    findClosest,
    dist,
    convertValuesToStep,
    updateDataAttributes,
};
