import CLASS from './class';
import {
    ChartInternal
} from './core';
import {
    isValue,
    isFunction,
    isNumber,
    isArray,
    notEmpty,
    hasValue,
    flattenArray,
    getBBox
} from './util';

ChartInternal.prototype.isEpochs = function (key) {
    var $$ = this,
        config = $$.config;
    return (config.data_epochs && key === config.data_epochs);
};
ChartInternal.prototype.isX = function (key) {
    var $$ = this,
        config = $$.config;
    return (config.data_x && key === config.data_x) || (notEmpty(config.data_xs) && hasValue(config.data_xs, key));
};
ChartInternal.prototype.isNotX = function (key) {
    return !this.isX(key);
};
ChartInternal.prototype.isNotXAndNotEpochs = function (key) {
    return !this.isX(key) && !this.isEpochs(key);
};

/**
 * Returns whether the normalized stack option is enabled or not.
 *
 * To be enabled it must also have data.groups defined.
 *
 * @return {boolean}
 */
ChartInternal.prototype.isStackNormalized = function() {
  return this.config.data_stack_normalize && this.config.data_groups.length > 0;
};

/**
 * Returns whether the axis is normalized or not.
 *
 * An axis is normalized as long as one of its associated target
 * is normalized.
 *
 * @param axisId Axis ID (y or y2)
 * @return {Boolean}
 */
ChartInternal.prototype.isAxisNormalized = function(axisId) {
    const $$ = this;

    if (!$$.isStackNormalized()) { // shortcut
        return false;
    }

    return $$.data.targets
        .filter((target) => $$.axis.getId(target.id) === axisId)
        .some((target) => $$.isTargetNormalized(target.id));
};

/**
 * Returns whether the values for this target ID is normalized or not.
 *
 * To be normalized the option needs to be enabled and target needs
 * to be defined in `data.groups`.
 *
 * @param targetId ID of the target
 * @return {Boolean} True if the target is normalized, false otherwise.
 */
ChartInternal.prototype.isTargetNormalized = function(targetId) {
    const $$ = this;

    return $$.isStackNormalized() && $$.config.data_groups.some((group) => group.includes(targetId));
};

ChartInternal.prototype.getXKey = function (id) {
    var $$ = this,
        config = $$.config;
    return config.data_x ? config.data_x : notEmpty(config.data_xs) ? config.data_xs[id] : null;
};

/**
 * Get sum of visible data per index for given axis.
 *
 * Expect axisId to be either 'y' or 'y2'.
 *
 * @private
 * @param axisId Compute sum for data associated to given axis.
 * @return {Array}
 */
ChartInternal.prototype.getTotalPerIndex = function(axisId) {
    const $$ = this;

    if (!$$.isStackNormalized()) {
        return null;
    }

    const cached = $$.getFromCache('getTotalPerIndex');
    if (cached !== undefined) {
        return cached[axisId];
    }

    const sum = { y: [], y2: [] };

    $$.data.targets
        // keep only target that are normalized
        .filter((target) => $$.isTargetNormalized(target.id))

        // keep only target that are visible
        .filter((target) => $$.isTargetToShow(target.id))

        // compute sum per axis
        .forEach(target => {
            const sumByAxis = sum[$$.axis.getId(target.id)];

            target.values.forEach((v, i) => {
                if (!sumByAxis[i]) {
                    sumByAxis[i] = 0;
                }
                sumByAxis[i] += isNumber(v.value) ? v.value : 0;
            });
        });

    $$.addToCache('getTotalPerIndex', sum);

    return sum[axisId];
};

/**
 * Get sum of visible data.
 *
 * Should be used for normalised data only since all values
 * are expected to be positive.
 *
 * @private
 * @return {Number}
 */
ChartInternal.prototype.getTotalDataSum = function() {
    const $$ = this;

    const cached = $$.getFromCache('getTotalDataSum');
    if (cached !== undefined) {
        return cached;
    }

    const totalDataSum = flattenArray($$.data.targets
        .filter(target => $$.isTargetToShow(target.id))
        .map(target => target.values)
    )
        .map(d => d.value)
        .reduce((p, c) => p + c, 0);

    $$.addToCache('getTotalDataSum', totalDataSum);

    return totalDataSum;
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

/**
 * Returns only visible targets.
 *
 * This is the same as calling {@link filterTargetsToShow} on $$.data.targets.
 *
 * @return {Array}
 */
ChartInternal.prototype.getTargetsToShow = function() {
    const $$ = this;
    return $$.filterTargetsToShow($$.data.targets);
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
    this.resetCache();
};
ChartInternal.prototype.removeHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.filter(function (id) {
        return targetIds.indexOf(id) < 0;
    });
    this.resetCache();
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

/**
 * Returns all the values from the given targets at the given index.
 *
 * @param {Array} targets
 * @param {Number} index
 * @return {Array}
 */
ChartInternal.prototype.filterByIndex = function (targets, index) {
    return this.d3.merge(targets.map((t) => t.values.filter((v) => v.index === index)));
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
            lengths[i] = getBBox(this)[key] * paddingCoef;
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

/**
 * Find the closest point from the given pos among the given targets or
 * undefined if none satisfies conditions.
 *
 * @param {Array} targets
 * @param {Array} pos An [x,y] coordinate
 * @return {Object|undefined}
 */
ChartInternal.prototype.findClosestFromTargets = function (targets, pos) {
    const $$ = this;

    // for each target, find the closest point
    const candidates = targets
        .map((t) => $$.findClosest(t.values, pos, $$.config.tooltip_horizontal ? $$.horizontalDistance.bind($$) : $$.dist.bind($$), $$.config.point_sensitivity))
        .filter((v) => v);

    // returns the closest of candidates
    if (candidates.length === 0) {
        return undefined;
    } else if (candidates.length === 1) {
        return candidates[0];
    } else {
        return $$.findClosest(candidates, pos, $$.dist.bind($$));
    }
};

/**
 * Find the closest point from the x value or undefined if none satisfies conditions.
 *
 * @param {Array} targets
 * @param {Array} x A value on X axis
 * @return {Object|undefined}
 */
ChartInternal.prototype.findClosestFromTargetsByX = function (targets, x) {
    let closest;
    let diff;

    targets
        .forEach((t) => {
            t.values.forEach((d) => {
                let newDiff = Math.abs(x - d.x);

                if (diff === undefined || newDiff < diff) {
                    closest = d;
                    diff = newDiff;
                }
            });
        });

    return closest;
};

/**
 * Using given compute distance method, returns the closest data point from the
 * given position.
 *
 * Giving optionally a minimum distance to satisfy.
 *
 * @param {Array} dataPoints List of DataPoints
 * @param {Array} pos An [x,y] coordinate
 * @param {Function} computeDist Function to compute distance between 2 points
 * @param {Number} minDist Minimal distance to satisfy
 * @return {Object|undefined} Closest data point
 */
ChartInternal.prototype.findClosest = function (dataPoints, pos, computeDist, minDist = Infinity) {
    const $$ = this;

    let closest;

    // find closest bar
    dataPoints
        .filter((v) => v && $$.isBarType(v.id))
        .forEach(function (v) {
            if (!closest) {
                const shape = $$.main.select('.' + CLASS.bars + $$.getTargetSelectorSuffix(v.id) + ' .' + CLASS.bar + '-' + v.index).node();
                if ($$.isWithinBar(pos, shape)) {
                    closest = v;
                }
            }
        });

    // find closest point from non-bar
    dataPoints
        .filter((v) => v && !$$.isBarType(v.id))
        .forEach((v) => {
            let d = computeDist(v, pos);
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
ChartInternal.prototype.horizontalDistance = function(data, pos) {
    var $$ = this,
        config = $$.config,
        xIndex = config.axis_rotated ? 1 : 0,
        x = $$.x(data.x);

    return Math.abs(x - pos[xIndex]);
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

/**
 * Get ratio value
 *
 * @param {String} type Ratio for given type
 * @param {Object} d Data value object
 * @param {Boolean} asPercent Convert the return as percent or not
 * @return {Number} Ratio value
 * @private
 */
ChartInternal.prototype.getRatio = function(type, d, asPercent = false) {
    const $$ = this;
    const api = $$.api;
    let ratio = 0;

    if (d && api.data.shown.call(api).length) {
        ratio = d.ratio || d.value;

        if (type === "arc") {
            if ($$.hasType('gauge')) {
                ratio = (d.endAngle - d.startAngle) / (Math.PI * ($$.config.gauge_fullCircle ? 2 : 1));
            } else {
                const total = $$.getTotalDataSum();

                ratio = d.value / total;
            }
        } else if (type === "index") {
            const total = $$.getTotalPerIndex($$.axis.getId(d.id));

            d.ratio = isNumber(d.value) && total && total[d.index] > 0 ?
                d.value / total[d.index] : 0;

            ratio = d.ratio;
        }
    }

    return asPercent && ratio ? ratio * 100 : ratio;
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
