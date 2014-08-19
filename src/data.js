c3_chart_internal_fn.isX = function (key) {
    var $$ = this, config = $$.config;
    return (config.data_x && key === config.data_x) || (notEmpty(config.data_xs) && hasValue(config.data_xs, key));
};
c3_chart_internal_fn.isNotX = function (key) {
    return !this.isX(key);
};
c3_chart_internal_fn.getXKey = function (id) {
    var $$ = this, config = $$.config;
    return config.data_x ? config.data_x : notEmpty(config.data_xs) ? config.data_xs[id] : null;
};
c3_chart_internal_fn.getXValuesOfXKey = function (key, targets) {
    var $$ = this,
        xValues, ids = targets && notEmpty(targets) ? $$.mapToIds(targets) : [];
    ids.forEach(function (id) {
        if ($$.getXKey(id) === key) {
            xValues = $$.data.xs[id];
        }
    });
    return xValues;
};
c3_chart_internal_fn.getXValue = function (id, i) {
    var $$ = this;
    return id in $$.data.xs && $$.data.xs[id] && isValue($$.data.xs[id][i]) ? $$.data.xs[id][i] : i;
};
c3_chart_internal_fn.getOtherTargetXs = function () {
    var $$ = this,
        idsForX = Object.keys($$.data.xs);
    return idsForX.length ? $$.data.xs[idsForX[0]] : null;
};
c3_chart_internal_fn.getOtherTargetX = function (index) {
    var xs = this.getOtherTargetXs();
    return xs && index < xs.length ? xs[index] : null;
};
c3_chart_internal_fn.addXs = function (xs) {
    var $$ = this;
    Object.keys(xs).forEach(function (id) {
        $$.config.data_xs[id] = xs[id];
    });
};
c3_chart_internal_fn.hasMultipleX = function (xs) {
    return this.d3.set(Object.keys(xs).map(function (id) { return xs[id]; })).size() > 1;
};
c3_chart_internal_fn.isMultipleX = function () {
    var $$ = this, config = $$.config;
    return notEmpty(config.data_xs) && $$.hasMultipleX(config.data_xs);
};
c3_chart_internal_fn.addName = function (data) {
    var $$ = this, name;
    if (data) {
        name = $$.config.data_names[data.id];
        data.name = name ? name : data.id;
    }
    return data;
};
c3_chart_internal_fn.getValueOnIndex = function (values, index) {
    var valueOnIndex = values.filter(function (v) { return v.index === index; });
    return valueOnIndex.length ? valueOnIndex[0] : null;
};
c3_chart_internal_fn.updateTargetX = function (targets, x) {
    var $$ = this;
    targets.forEach(function (t) {
        t.values.forEach(function (v, i) {
            v.x = $$.generateTargetX(x[i], t.id, i);
        });
        $$.data.xs[t.id] = x;
    });
};
c3_chart_internal_fn.updateTargetXs = function (targets, xs) {
    var $$ = this;
    targets.forEach(function (t) {
        if (xs[t.id]) {
            $$.updateTargetX([t], xs[t.id]);
        }
    });
};
c3_chart_internal_fn.generateTargetX = function (rawX, id, index) {
    var $$ = this, x;
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
        id : target.id,
        id_org : target.id_org,
        values : target.values.map(function (d) {
            return {x: d.x, value: d.value, id: d.id};
        })
    };
};
c3_chart_internal_fn.getPrevX = function (i) {
    var $$ = this, value = $$.getValueOnIndex($$.data.targets[0].values, i - 1);
    return value ? value.x : null;
};
c3_chart_internal_fn.getNextX = function (i) {
    var $$ = this, value = $$.getValueOnIndex($$.data.targets[0].values, i + 1);
    return value ? value.x : null;
};
c3_chart_internal_fn.getMaxDataCount = function () {
    var $$ = this;
    return $$.d3.max($$.data.targets, function (t) { return t.values.length; });
};
c3_chart_internal_fn.getMaxDataCountTarget = function (targets) {
    var length = targets.length, max = 0, maxTarget;
    if (length > 1) {
        targets.forEach(function (t) {
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
    var target = this.getMaxDataCountTarget(targets), firstData, lastData;
    if (!target) {
        return [0, 0];
    }
    firstData = target.values[0], lastData = target.values[target.values.length - 1];
    return [firstData.x, lastData.x];
};
c3_chart_internal_fn.mapToIds = function (targets) {
    return targets.map(function (d) { return d.id; });
};
c3_chart_internal_fn.mapToTargetIds = function (ids) {
    var $$ = this;
    return ids ? (isString(ids) ? [ids] : ids) : $$.mapToIds($$.data.targets);
};
c3_chart_internal_fn.hasTarget = function (targets, id) {
    var ids = this.mapToIds(targets), i;
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
    var $$ = this;
    return targets.filter(function (t) { return $$.isTargetToShow(t.id); });
};
c3_chart_internal_fn.mapTargetsToUniqueXs = function (targets) {
    var $$ = this;
    var xs = $$.d3.set($$.d3.merge(targets.map(function (t) { return t.values.map(function (v) { return v.x; }); }))).values();
    return $$.isTimeSeries() ? xs.map(function (x) { return new Date(x); }) : xs.map(function (x) { return +x; });
};
c3_chart_internal_fn.addHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.concat(targetIds);
};
c3_chart_internal_fn.removeHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.filter(function (id) { return targetIds.indexOf(id) < 0; });
};
c3_chart_internal_fn.addHiddenLegendIds = function (targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.concat(targetIds);
};
c3_chart_internal_fn.removeHiddenLegendIds = function (targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.filter(function (id) { return targetIds.indexOf(id) < 0; });
};
c3_chart_internal_fn.getValuesAsIdKeyed = function (targets) {
    var ys = {};
    targets.forEach(function (t) {
        ys[t.id] = [];
        t.values.forEach(function (v) {
            ys[t.id].push(v.value);
        });
    });
    return ys;
};
c3_chart_internal_fn.checkValueInTargets = function (targets, checker) {
    var ids = Object.keys(targets), i, j, values;
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
    return this.checkValueInTargets(targets, function (v) { return v < 0; });
};
c3_chart_internal_fn.hasPositiveValueInTargets = function (targets) {
    return this.checkValueInTargets(targets, function (v) { return v > 0; });
};
c3_chart_internal_fn.isOrderDesc = function () {
    var config = this.config;
    return config.data_order && config.data_order.toLowerCase() === 'desc';
};
c3_chart_internal_fn.isOrderAsc = function () {
    var config = this.config;
    return config.data_order && config.data_order.toLowerCase() === 'asc';
};
c3_chart_internal_fn.orderTargets = function (targets) {
    var $$ = this, config = $$.config, orderAsc = $$.isOrderAsc(), orderDesc = $$.isOrderDesc();
    if (orderAsc || orderDesc) {
        targets.sort(function (t1, t2) {
            var reducer = function (p, c) { return p + Math.abs(c.value); };
            var t1Sum = t1.values.reduce(reducer, 0),
                t2Sum = t2.values.reduce(reducer, 0);
            return orderAsc ? t2Sum - t1Sum : t1Sum - t2Sum;
        });
    } else if (isFunction(config.data_order)) {
        targets.sort(config.data_order);
    } // TODO: accept name array for order
    return targets;
};
c3_chart_internal_fn.filterSameX = function (targets, x) {
    return this.d3.merge(targets.map(function (t) { return t.values; })).filter(function (v) { return v.x - x === 0; });
};
c3_chart_internal_fn.filterRemoveNull = function (data) {
    return data.filter(function (d) { return isValue(d.value); });
};
c3_chart_internal_fn.hasDataLabel = function () {
    var config = this.config;
    if (typeof config.data_labels === 'boolean' && config.data_labels) {
        return true;
    } else if (typeof config.data_labels === 'object' && notEmpty(config.data_labels)) {
        return true;
    }
    return false;
};
c3_chart_internal_fn.getDataLabelLength = function (min, max, axisId, key) {
    var $$ = this,
        lengths = [0, 0], paddingCoef = 1.3;
    $$.selectChart.select('svg').selectAll('.dummy')
        .data([min, max])
        .enter().append('text')
        .text(function (d) { return $$.formatByAxisId(axisId)(d); })
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
    var i, targetX = values[index].x, sames = [];
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

c3_chart_internal_fn.findClosestOfValues = function (values, pos, _min, _max) { // MEMO: values must be sorted by x
    var $$ = this,
        min = _min ? _min : 0,
        max = _max ? _max : values.length - 1,
        med = Math.floor((max - min) / 2) + min,
        value = values[med],
        diff = $$.x(value.x) - pos[$$.config.axis_rotated ? 1 : 0],
        candidates;

    // Update range for search
    diff > 0 ? max = med : min = med;

    // if candidates are two closest min and max, stop recursive call
    if ((max - min) === 1 || (min === 0 && max === 0)) {

        // Get candidates that has same min and max index
        candidates = [];
        if (values[min].x || values[min].x === 0) {
            candidates = candidates.concat($$.findSameXOfValues(values, min));
        }
        if (values[max].x || values[max].x === 0) {
            candidates = candidates.concat($$.findSameXOfValues(values, max));
        }

        // Determine the closest and return
        return $$.findClosest(candidates, pos);
    }

    return $$.findClosestOfValues(values, pos, min, max);
};
c3_chart_internal_fn.findClosestFromTargets = function (targets, pos) {
    var $$ = this, candidates;

    // map to array of closest points of each target
    candidates = targets.map(function (target) {
        return $$.findClosestOfValues(target.values, pos);
    });

    // decide closest point and return
    return $$.findClosest(candidates, pos);
};
c3_chart_internal_fn.findClosest = function (values, pos) {
    var $$ = this, minDist, closest;
    values.forEach(function (v) {
        var d = $$.dist(v, pos);
        if (d < minDist || ! minDist) {
            minDist = d;
            closest = v;
        }
    });
    return closest;
};
c3_chart_internal_fn.dist = function (data, pos) {
    var $$ = this, config = $$.config,
        yScale = $$.getAxisId(data.id) === 'y' ? $$.y : $$.y2,
        xIndex = config.axis_rotated ? 1 : 0,
        yIndex = config.axis_rotated ? 0 : 1;
    return Math.pow($$.x(data.x) - pos[xIndex], 2) + Math.pow(yScale(data.value) - pos[yIndex], 2);
};
