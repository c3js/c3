import CLASS from './class';
import { ChartInternal } from './core';
import { isUndefined } from './util';

ChartInternal.prototype.getShapeIndices = function (typeFilter) {
    var $$ = this, config = $$.config,
        indices = {}, i = 0, j, k;
    $$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$)).forEach(function (d) {
        for (j = 0; j < config.data_groups.length; j++) {
            if (config.data_groups[j].indexOf(d.id) < 0) { continue; }
            for (k = 0; k < config.data_groups[j].length; k++) {
                if (config.data_groups[j][k] in indices) {
                    indices[d.id] = indices[config.data_groups[j][k]];
                    break;
                }
            }
        }
        if (isUndefined(indices[d.id])) { indices[d.id] = i++; }
    });
    indices.__max__ = i - 1;
    return indices;
};
ChartInternal.prototype.getShapeX = function (offset, targetsNum, indices, isSub) {
    var $$ = this, scale = isSub ? $$.subX : $$.x;
    return function (d) {
        var index = d.id in indices ? indices[d.id] : 0;
        return d.x || d.x === 0 ? scale(d.x) - offset * (targetsNum / 2 - index) : 0;
    };
};
ChartInternal.prototype.getShapeY = function (isSub) {
    const $$ = this;

    return function (d) {
        const scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id);
        return scale($$.isTargetNormalized(d.id) ? $$.getRatio('index', d, true) : d.value);
    };
};
ChartInternal.prototype.getShapeOffset = function (typeFilter, indices, isSub) {
    var $$ = this,
        targets = $$.orderTargets($$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$))),
        targetIds = targets.map(function (t) { return t.id; });
    return function (d, i) {
        var scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id),
            y0 = scale(0), offset = y0;
        targets.forEach(function (t) {
            const rowValues = $$.isStepType(d) ? $$.convertValuesToStep(t.values) : t.values;
            const isTargetNormalized = $$.isTargetNormalized(d.id);
            const values = rowValues.map(v => (isTargetNormalized ? $$.getRatio("index", v, true) : v.value));

            if (t.id === d.id || indices[t.id] !== indices[d.id]) { return; }
            if (targetIds.indexOf(t.id) < targetIds.indexOf(d.id)) {
                // check if the x values line up
                if (isUndefined(rowValues[i]) || +rowValues[i].x !== +d.x) {  // "+" for timeseries
                    // if not, try to find the value that does line up
                    i = -1;
                    rowValues.forEach(function (v, j) {
                        const x1 = v.x.constructor === Date ? +v.x : v.x;
                        const x2 = d.x.constructor === Date ? +d.x : d.x;

                        if (x1 === x2) {
                            i = j;
                        }
                    });
                }
                if (i in rowValues && rowValues[i].value * d.value >= 0) {
                    offset += scale(values[i]) - y0;
                }
            }
        });
        return offset;
    };
};
ChartInternal.prototype.isWithinShape = function (that, d) {
    var $$ = this,
        shape = $$.d3.select(that), isWithin;
    if (!$$.isTargetToShow(d.id)) {
        isWithin = false;
    }
    else if (that.nodeName === 'circle') {
        isWithin = $$.isStepType(d) ? $$.isWithinStep(that, $$.getYScale(d.id)(d.value)) : $$.isWithinCircle(that, $$.pointSelectR(d) * 1.5);
    }
    else if (that.nodeName === 'path') {
        isWithin = shape.classed(CLASS.bar) ? $$.isWithinBar($$.d3.mouse(that), that) : true;
    }
    return isWithin;
};


ChartInternal.prototype.getInterpolate = function (d) {
    var $$ = this, d3 = $$.d3,
        types = {
            'linear': d3.curveLinear,
            'linear-closed': d3.curveLinearClosed,
            'basis': d3.curveBasis,
            'basis-open': d3.curveBasisOpen,
            'basis-closed': d3.curveBasisClosed,
            'bundle': d3.curveBundle,
            'cardinal': d3.curveCardinal,
            'cardinal-open': d3.curveCardinalOpen,
            'cardinal-closed': d3.curveCardinalClosed,
            'monotone': d3.curveMonotoneX,
            'step': d3.curveStep,
            'step-before': d3.curveStepBefore,
            'step-after': d3.curveStepAfter
        },
        type;

    if ($$.isSplineType(d)) {
        type = types[$$.config.spline_interpolation_type] || types.cardinal;
    }
    else if ($$.isStepType(d)) {
        type = types[$$.config.line_step_type];
    }
    else {
        type = types.linear;
    }
    return type;
};
