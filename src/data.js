import CLASS from './class';
import {
    ChartInternal
} from './core';
import {
    isValue,
    isFunction,
    isArray,
    notEmpty,
    hasValue
} from './util';

ChartInternal.prototype.isX = function (key) {
    var $$ = this,
        config = $$.config;
    return (config.data_x && key === config.data_x) || (notEmpty(config.data_xs) && hasValue(config.data_xs, key));
};
ChartInternal.prototype.isNotX = function (key) {
    return !this.isX(key);
};
ChartInternal.prototype.getXKey = function (id) {
    var $$ = this,
        config = $$.config;
    return config.data_x ? config.data_x : notEmpty(config.data_xs) ? config.data_xs[id] : null;
};
ChartInternal.prototype.getXValuesOfXKey = function (key, targets) {
    var $$ = this,
        xValues, ids = targets && notEmpty(targets) ? $$.mapToIds(targets) : [];
    ids.forEach(function (id) {
        if ($$.getXKey(id) === key) {
            xValues = $$.data.xs[id];
        }
    });
    return xValues;
};
ChartInternal.prototype.getXValue = function (id, i) {
    var $$ = this;
    return id in $$.data.xs && $$.data.xs[id] && isValue($$.data.xs[id][i]) ? $$.data.xs[id][i] : i;
};
ChartInternal.prototype.getOtherTargetXs = function () {
    var $$ = this,
        idsForX = Object.keys($$.data.xs);
    return idsForX.length ? $$.data.xs[idsForX[0]] : null;
};
ChartInternal.prototype.getOtherTargetX = function (index) {
    var xs = this.getOtherTargetXs();
    return xs && index < xs.length ? xs[index] : null;
};
ChartInternal.prototype.addXs = function (xs) {
    var $$ = this;
    Object.keys(xs).forEach(function (id) {
        $$.config.data_xs[id] = xs[id];
    });
};
ChartInternal.prototype.addName = function (data) {
    var $$ = this,
        name;
    if (data) {
        name = $$.config.data_names[data.id];
        data.name = name !== undefined ? name : data.id;
    }
    return data;
};
ChartInternal.prototype.getValueOnIndex = function (values, index) {
    var valueOnIndex = values.filter(function (v) {
        return v.index === index;
    });
    return valueOnIndex.length ? valueOnIndex[0] : null;
};
ChartInternal.prototype.updateTargetX = function (targets, x) {
    var $$ = this;
    targets.forEach(function (t) {
        t.values.forEach(function (v, i) {
            v.x = $$.generateTargetX(x[i], t.id, i);
        });
        $$.data.xs[t.id] = x;
    });
};
ChartInternal.prototype.updateTargetXs = function (targets, xs) {
    var $$ = this;
    targets.forEach(function (t) {
        if (xs[t.id]) {
            $$.updateTargetX([t], xs[t.id]);
        }
    });
};
ChartInternal.prototype.generateTargetX = function (rawX, id, index) {
    var $$ = this,
        x;
    if ($$.isTimeSeries()) {
        x = rawX ? $$.parseDate(rawX) : $$.parseDate($$.getXValue(id, index));
    } else if ($$.isCustomX() && !$$.isCategorized()) {
        x = isValue(rawX) ? +rawX : $$.getXValue(id, index);
    } else {
        x = index;
    }
    return x;
};
ChartInternal.prototype.cloneTarget = function (target) {
    return {
        id: target.id,
        id_org: target.id_org,
        values: target.values.map(function (d) {
            return {
                x: d.x,
                value: d.value,
                id: d.id
            };
        })
    };
};
ChartInternal.prototype.getMaxDataCount = function () {
    var $$ = this;
    return $$.d3.max($$.data.targets, function (t) {
        return t.values.length;
    });
};
ChartInternal.prototype.mapToIds = function (targets) {
    return targets.map(function (d) {
        return d.id;
    });
};
ChartInternal.prototype.mapToTargetIds = function (ids) {
    var $$ = this;
    return ids ? [].concat(ids) : $$.mapToIds($$.data.targets);
};
ChartInternal.prototype.hasTarget = function (targets, id) {
    var ids = this.mapToIds(targets),
        i;
    for (i = 0; i < ids.length; i++) {
        if (ids[i] === id) {
            return true;
        }
    }
    return false;
};
ChartInternal.prototype.isTargetToShow = function (targetId) {
    return this.hiddenTargetIds.indexOf(targetId) < 0;
};
ChartInternal.prototype.isLegendToShow = function (targetId) {
    return this.hiddenLegendIds.indexOf(targetId) < 0;
};
ChartInternal.prototype.filterTargetsToShow = function (targets) {
    var $$ = this;
    return targets.filter(function (t) {
        return $$.isTargetToShow(t.id);
    });
};
ChartInternal.prototype.mapTargetsToUniqueXs = function (targets) {
    var $$ = this;
    var xs = $$.d3.set($$.d3.merge(targets.map(function (t) {
        return t.values.map(function (v) {
            return +v.x;
        });
    }))).values();
    xs = $$.isTimeSeries() ? xs.map(function (x) {
        return new Date(+x);
    }) : xs.map(function (x) {
        return +x;
    });
    return xs.sort(function (a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    });
};
ChartInternal.prototype.addHiddenTargetIds = function (targetIds) {
    targetIds = (targetIds instanceof Array) ? targetIds : new Array(targetIds);
    for (var i = 0; i < targetIds.length; i++) {
        if (this.hiddenTargetIds.indexOf(targetIds[i]) < 0) {
            this.hiddenTargetIds = this.hiddenTargetIds.concat(targetIds[i]);
        }
    }
};
ChartInternal.prototype.removeHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.filter(function (id) {
        return targetIds.indexOf(id) < 0;
    });
};
ChartInternal.prototype.addHiddenLegendIds = function (targetIds) {
    targetIds = (targetIds instanceof Array) ? targetIds : new Array(targetIds);
    for (var i = 0; i < targetIds.length; i++) {
        if (this.hiddenLegendIds.indexOf(targetIds[i]) < 0) {
            this.hiddenLegendIds = this.hiddenLegendIds.concat(targetIds[i]);
        }
    }
};
ChartInternal.prototype.removeHiddenLegendIds = function (targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.filter(function (id) {
        return targetIds.indexOf(id) < 0;
    });
};
ChartInternal.prototype.getValuesAsIdKeyed = function (targets) {
    var ys = {};
    targets.forEach(function (t) {
        ys[t.id] = [];
        t.values.forEach(function (v) {
            ys[t.id].push(v.value);
        });
    });
    return ys;
};
ChartInternal.prototype.checkValueInTargets = function (targets, checker) {
    var ids = Object.keys(targets),
        i, j, values;
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
ChartInternal.prototype.hasNegativeValueInTargets = function (targets) {
    return this.checkValueInTargets(targets, function (v) {
        return v < 0;
    });
};
ChartInternal.prototype.hasPositiveValueInTargets = function (targets) {
    return this.checkValueInTargets(targets, function (v) {
        return v > 0;
    });
};
ChartInternal.prototype.isOrderDesc = function () {
    var config = this.config;
    return typeof (config.data_order) === 'string' && config.data_order.toLowerCase() === 'desc';
};
ChartInternal.prototype.isOrderAsc = function () {
    var config = this.config;
    return typeof (config.data_order) === 'string' && config.data_order.toLowerCase() === 'asc';
};
ChartInternal.prototype.getOrderFunction = function () {
    var $$ = this,
        config = $$.config,
        orderAsc = $$.isOrderAsc(),
        orderDesc = $$.isOrderDesc();
    if (orderAsc || orderDesc) {
        var reducer = function (p, c) {
            return p + Math.abs(c.value);
        };
        return function (t1, t2) {
            var t1Sum = t1.values.reduce(reducer, 0),
                t2Sum = t2.values.reduce(reducer, 0);
            return orderAsc ? t2Sum - t1Sum : t1Sum - t2Sum;
        };
    } else if (isFunction(config.data_order)) {
        return config.data_order;
    } else if (isArray(config.data_order)) {
        var order = config.data_order;
        return function (t1, t2) {
            return order.indexOf(t1.id) - order.indexOf(t2.id);
        };
    }
};
ChartInternal.prototype.orderTargets = function (targets) {
    var fct = this.getOrderFunction();
    if (fct) {
        targets.sort(fct);
    }
    return targets;
};
ChartInternal.prototype.filterByX = function (targets, x) {
    return this.d3.merge(targets.map(function (t) {
        return t.values;
    })).filter(function (v) {
        return v.x - x === 0;
    });
};
ChartInternal.prototype.filterRemoveNull = function (data) {
    return data.filter(function (d) {
        return isValue(d.value);
    });
};
ChartInternal.prototype.filterByXDomain = function (targets, xDomain) {
    return targets.map(function (t) {
        return {
            id: t.id,
            id_org: t.id_org,
            values: t.values.filter(function (v) {
                return xDomain[0] <= v.x && v.x <= xDomain[1];
            })
        };
    });
};
ChartInternal.prototype.hasDataLabel = function () {
    var config = this.config;
    if (typeof config.data_labels === 'boolean' && config.data_labels) {
        return true;
    } else if (typeof config.data_labels === 'object' && notEmpty(config.data_labels)) {
        return true;
    }
    return false;
};
ChartInternal.prototype.getDataLabelLength = function (min, max, key) {
    var $$ = this,
        lengths = [0, 0],
        paddingCoef = 1.3;
    $$.selectChart.select('svg').selectAll('.dummy')
        .data([min, max])
        .enter().append('text')
        .text(function (d) {
            return $$.dataLabelFormat(d.id)(d);
        })
        .each(function (d, i) {
            lengths[i] = this.getBoundingClientRect()[key] * paddingCoef;
        })
        .remove();
    return lengths;
};
/**
 * Returns true if the given data point is not arc type, otherwise false.
 * @param {Object} d The data point
 * @return {boolean}
 */
ChartInternal.prototype.isNoneArc = function (d) {
    return this.hasTarget(this.data.targets, d.id);
};

/**
 * Returns true if the given data point is arc type, otherwise false.
 * @param {Object} d The data point
 * @return {boolean}
 */
ChartInternal.prototype.isArc = function (d) {
    return 'data' in d && this.hasTarget(this.data.targets, d.data.id);
};

ChartInternal.prototype.findClosestFromTargets = function (targets, pos) {
    var $$ = this,
        candidates;

    // map to array of closest points of each target
    candidates = targets.map(function (target) {
        return $$.findClosest(target.values, pos);
    });

    // decide closest point and return
    return $$.findClosest(candidates, pos);
};
ChartInternal.prototype.findClosest = function (values, pos) {
    var $$ = this,
        minDist = $$.config.point_sensitivity,
        closest;

    // find mouseovering bar
    values.filter(function (v) {
        return v && $$.isBarType(v.id);
    }).forEach(function (v) {
        var shape = $$.main.select('.' + CLASS.bars + $$.getTargetSelectorSuffix(v.id) + ' .' + CLASS.bar + '-' + v.index).node();
        if (!closest && $$.isWithinBar($$.d3.mouse(shape), shape)) {
            closest = v;
        }
    });

    // find closest point from non-bar
    values.filter(function (v) {
        return v && !$$.isBarType(v.id);
    }).forEach(function (v) {
        var d = $$.dist(v, pos);
        if (d < minDist) {
            minDist = d;
            closest = v;
        }
    });

    return closest;
};
ChartInternal.prototype.dist = function (data, pos) {
    var $$ = this,
        config = $$.config,
        xIndex = config.axis_rotated ? 1 : 0,
        yIndex = config.axis_rotated ? 0 : 1,
        y = $$.circleY(data, data.index),
        x = $$.x(data.x);
    return Math.sqrt(Math.pow(x - pos[xIndex], 2) + Math.pow(y - pos[yIndex], 2));
};
ChartInternal.prototype.convertValuesToStep = function (values) {
    var converted = [].concat(values),
        i;

    if (!this.isCategorized()) {
        return values;
    }

    for (i = values.length + 1; 0 < i; i--) {
        converted[i] = converted[i - 1];
    }

    converted[0] = {
        x: converted[0].x - 1,
        value: converted[0].value,
        id: converted[0].id
    };
    converted[values.length + 1] = {
        x: converted[values.length].x + 1,
        value: converted[values.length].value,
        id: converted[values.length].id
    };

    return converted;
};
ChartInternal.prototype.updateDataAttributes = function (name, attrs) {
    var $$ = this,
        config = $$.config,
        current = config['data_' + name];
    if (typeof attrs === 'undefined') {
        return current;
    }
    Object.keys(attrs).forEach(function (id) {
        current[id] = attrs[id];
    });
    $$.redraw({
        withLegend: true
    });
    return current;
};
