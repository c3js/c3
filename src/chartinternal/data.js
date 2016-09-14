c3_chart_internal_fn.isX = function (key) {
    let $$ = this, config = $$.config;
    return (config.data_x && key === config.data_x) || (notEmpty(config.data_xs) && hasValue(config.data_xs, key));
};
c3_chart_internal_fn.isNotX = function (key) {
    return !this.isX(key);
};
c3_chart_internal_fn.getXKey = function (id) {
    let $$ = this, config = $$.config;
    return config.data_x ? config.data_x : notEmpty(config.data_xs) ? config.data_xs[id] : null;
};
c3_chart_internal_fn.getXValuesOfXKey = function (key, targets) {
    let $$ = this,
        xValues, ids = targets && notEmpty(targets) ? $$.mapToIds(targets) : [];
    ids.forEach((id) => {
        if ($$.getXKey(id) === key) {
            xValues = $$.data.xs[id];
        }
    });
    return xValues;
};
c3_chart_internal_fn.getIndexByX = function (x) {
    let $$ = this,
        data = $$.filterByX($$.data.targets, x);
    return data.length ? data[0].index : null;
};
c3_chart_internal_fn.getXValue = function (id, i) {
    const $$ = this;
    return id in $$.data.xs && $$.data.xs[id] && isValue($$.data.xs[id][i]) ? $$.data.xs[id][i] : i;
};
c3_chart_internal_fn.getOtherTargetXs = function () {
    let $$ = this,
        idsForX = Object.keys($$.data.xs);
    return idsForX.length ? $$.data.xs[idsForX[0]] : null;
};
c3_chart_internal_fn.getOtherTargetX = function (index) {
    const xs = this.getOtherTargetXs();
    return xs && index < xs.length ? xs[index] : null;
};
c3_chart_internal_fn.addXs = function (xs) {
    const $$ = this;
    Object.keys(xs).forEach((id) => {
        $$.config.data_xs[id] = xs[id];
    });
};
c3_chart_internal_fn.hasMultipleX = function (xs) {
    return this.d3.set(Object.keys(xs).map((id) => { return xs[id]; })).size() > 1;
};
c3_chart_internal_fn.isMultipleX = function () {
    return notEmpty(this.config.data_xs) || !this.config.data_xSort || this.hasType('scatter');
};
c3_chart_internal_fn.addName = function (data) {
    let $$ = this, name;
    if (data) {
        name = $$.config.data_names[data.id];
        data.name = name !== undefined ? name : data.id;
    }
    return data;
};
c3_chart_internal_fn.getValueOnIndex = function (values, index) {
    const valueOnIndex = values.filter((v) => { return v.index === index; });
    return valueOnIndex.length ? valueOnIndex[0] : null;
};
c3_chart_internal_fn.updateTargetX = function (targets, x) {
    const $$ = this;
    targets.forEach((t) => {
        t.values.forEach((v, i) => {
            v.x = $$.generateTargetX(x[i], t.id, i);
        });
        $$.data.xs[t.id] = x;
    });
};
c3_chart_internal_fn.updateTargetXs = function (targets, xs) {
    const $$ = this;
    targets.forEach((t) => {
        if (xs[t.id]) {
            $$.updateTargetX([t], xs[t.id]);
        }
    });
};
c3_chart_internal_fn.generateTargetX = function (rawX, id, index) {
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
c3_chart_internal_fn.cloneTarget = function (target) {
    return {
        id: target.id,
        id_org: target.id_org,
        values: target.values.map((d) => {
            return { x: d.x, value: d.value, id: d.id };
        }),
    };
};
c3_chart_internal_fn.updateXs = function () {
    const $$ = this;
    if ($$.data.targets.length) {
        $$.xs = [];
        $$.data.targets[0].values.forEach((v) => {
            $$.xs[v.index] = v.x;
        });
    }
};
c3_chart_internal_fn.getPrevX = function (i) {
    const x = this.xs[i - 1];
    return typeof x !== 'undefined' ? x : null;
};
c3_chart_internal_fn.getNextX = function (i) {
    const x = this.xs[i + 1];
    return typeof x !== 'undefined' ? x : null;
};
c3_chart_internal_fn.getMaxDataCount = function () {
    const $$ = this;
    return $$.d3.max($$.data.targets, (t) => { return t.values.length; });
};
c3_chart_internal_fn.getMaxDataCountTarget = function (targets) {
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
c3_chart_internal_fn.getEdgeX = function (targets) {
    const $$ = this;
    return !targets.length ? [0, 0] : [
        $$.d3.min(targets, (t) => { return t.values[0].x; }),
        $$.d3.max(targets, (t) => { return t.values[t.values.length - 1].x; }),
    ];
};
c3_chart_internal_fn.mapToIds = function (targets) {
    return targets.map((d) => { return d.id; });
};
c3_chart_internal_fn.mapToTargetIds = function (ids) {
    const $$ = this;
    return ids ? [].concat(ids) : $$.mapToIds($$.data.targets);
};
c3_chart_internal_fn.hasTarget = function (targets, id) {
    let ids = this.mapToIds(targets), i;
    for (i = 0; i < ids.length; i++) {
        if (ids[i] === id) {
            return true;
        }
    }
    return false;
};
c3_chart_internal_fn.isTargetToShow = function (targetId) {
    return this.hiddenTargetIds.indexOf(targetId) < 0;
};
c3_chart_internal_fn.isLegendToShow = function (targetId) {
    return this.hiddenLegendIds.indexOf(targetId) < 0;
};
c3_chart_internal_fn.filterTargetsToShow = function (targets) {
    const $$ = this;
    return targets.filter((t) => { return $$.isTargetToShow(t.id); });
};
c3_chart_internal_fn.mapTargetsToUniqueXs = function (targets) {
    const $$ = this;
    let xs = $$.d3.set($$.d3.merge(targets.map((t) => { return t.values.map((v) => { return +v.x; }); }))).values();
    xs = $$.isTimeSeries() ? xs.map((x) => { return new Date(+x); }) : xs.map((x) => { return +x; });
    return xs.sort((a, b) => { return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN; });
};
c3_chart_internal_fn.addHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.concat(targetIds);
};
c3_chart_internal_fn.removeHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.filter((id) => { return targetIds.indexOf(id) < 0; });
};
c3_chart_internal_fn.addHiddenLegendIds = function (targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.concat(targetIds);
};
c3_chart_internal_fn.removeHiddenLegendIds = function (targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.filter((id) => { return targetIds.indexOf(id) < 0; });
};
c3_chart_internal_fn.getValuesAsIdKeyed = function (targets) {
    const ys = {};
    targets.forEach((t) => {
        ys[t.id] = [];
        t.values.forEach((v) => {
            ys[t.id].push(v.value);
        });
    });
    return ys;
};
c3_chart_internal_fn.checkValueInTargets = function (targets, checker) {
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
c3_chart_internal_fn.hasNegativeValueInTargets = function (targets) {
    return this.checkValueInTargets(targets, (v) => { return v < 0; });
};
c3_chart_internal_fn.hasPositiveValueInTargets = function (targets) {
    return this.checkValueInTargets(targets, (v) => { return v > 0; });
};
c3_chart_internal_fn.isOrderDesc = function () {
    const config = this.config;
    return typeof (config.data_order) === 'string' && config.data_order.toLowerCase() === 'desc';
};
c3_chart_internal_fn.isOrderAsc = function () {
    const config = this.config;
    return typeof (config.data_order) === 'string' && config.data_order.toLowerCase() === 'asc';
};
c3_chart_internal_fn.orderTargets = function (targets) {
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
c3_chart_internal_fn.filterByX = function (targets, x) {
    return this.d3.merge(targets.map((t) => { return t.values; })).filter((v) => { return v.x - x === 0; });
};
c3_chart_internal_fn.filterRemoveNull = function (data) {
    return data.filter((d) => { return isValue(d.value); });
};
c3_chart_internal_fn.filterByXDomain = function (targets, xDomain) {
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
c3_chart_internal_fn.hasDataLabel = function () {
    const config = this.config;
    if (typeof config.data_labels === 'boolean' && config.data_labels) {
        return true;
    } else if (typeof config.data_labels === 'object' && notEmpty(config.data_labels)) {
        return true;
    }
    return false;
};
c3_chart_internal_fn.getDataLabelLength = function (min, max, key) {
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
c3_chart_internal_fn.isNoneArc = function (d) {
    return this.hasTarget(this.data.targets, d.id);
},
c3_chart_internal_fn.isArc = function (d) {
    return 'data' in d && this.hasTarget(this.data.targets, d.data.id);
};
c3_chart_internal_fn.findSameXOfValues = function (values, index) {
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

c3_chart_internal_fn.findClosestFromTargets = function (targets, pos) {
    let $$ = this, candidates;

    // map to array of closest points of each target
    candidates = targets.map((target) => {
        return $$.findClosest(target.values, pos);
    });

    // decide closest point and return
    return $$.findClosest(candidates, pos);
};
c3_chart_internal_fn.findClosest = function (values, pos) {
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
c3_chart_internal_fn.dist = function (data, pos) {
    let $$ = this, config = $$.config,
        xIndex = config.axis_rotated ? 1 : 0,
        yIndex = config.axis_rotated ? 0 : 1,
        y = $$.circleY(data, data.index),
        x = $$.x(data.x);
    return Math.sqrt(Math.pow(x - pos[xIndex], 2) + Math.pow(y - pos[yIndex], 2));
};
c3_chart_internal_fn.convertValuesToStep = function (values) {
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
c3_chart_internal_fn.updateDataAttributes = function (name, attrs) {
    let $$ = this, config = $$.config, current = config['data_' + name];
    if (typeof attrs === 'undefined') { return current; }
    Object.keys(attrs).forEach((id) => {
        current[id] = attrs[id];
    });
    $$.redraw({ withLegend: true });
    return current;
};
