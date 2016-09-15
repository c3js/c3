import { CLASS } from './class';
import { isUndefined } from './util';

const getShapeIndices = function (typeFilter) {
    let $$ = this, config = $$.config,
        indices = {}, i = 0, j, k;
    $$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$)).forEach((d) => {
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
const getShapeX = function (offset, targetsNum, indices, isSub) {
    let $$ = this, scale = isSub ? $$.subX : $$.x;
    return function (d) {
        const index = d.id in indices ? indices[d.id] : 0;
        return d.x || d.x === 0 ? scale(d.x) - offset * (targetsNum / 2 - index) : 0;
    };
};
const getShapeY = function (isSub) {
    const $$ = this;
    return function (d) {
        const scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id);
        return scale(d.value);
    };
};
const getShapeOffset = function (typeFilter, indices, isSub) {
    let $$ = this,
        targets = $$.orderTargets($$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$))),
        targetIds = targets.map((t) => { return t.id; });
    return function (d, i) {
        let scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id),
            y0 = scale(0), offset = y0;
        targets.forEach((t) => {
            const values = $$.isStepType(d) ? $$.convertValuesToStep(t.values) : t.values;
            if (t.id === d.id || indices[t.id] !== indices[d.id]) { return; }
            if (targetIds.indexOf(t.id) < targetIds.indexOf(d.id)) {
                // check if the x values line up
                if (typeof values[i] === 'undefined' || +values[i].x !== +d.x) {  // "+" for timeseries
                    // if not, try to find the value that does line up
                    i = -1;
                    values.forEach((v, j) => {
                        if (v.x === d.x) {
                            i = j;
                        }
                    });
                }
                if (i in values && values[i].value * d.value >= 0) {
                    offset += scale(values[i].value) - y0;
                }
            }
        });
        return offset;
    };
};
const isWithinShape = function (that, d) {
    let $$ = this,
        shape = $$.d3.select(that), isWithin;
    if (!$$.isTargetToShow(d.id)) {
        isWithin = false;
    }
    else if (that.nodeName === 'circle') {
        isWithin = $$.isStepType(d) ? $$.isWithinStep(that, $$.getYScale(d.id)(d.value)) : $$.isWithinCircle(that, $$.pointSelectR(d) * 1.5);
    }
    else if (that.nodeName === 'path') {
        isWithin = shape.classed(CLASS.bar) ? $$.isWithinBar(that) : true;
    }
    return isWithin;
};


const getInterpolate = function (d) {
    let $$ = this,
        interpolation = $$.isInterpolationType($$.config.spline_interpolation_type) ? $$.config.spline_interpolation_type : 'cardinal';
    return $$.isSplineType(d) ? interpolation : $$.isStepType(d) ? $$.config.line_step_type : 'linear';
};

export {
    getShapeIndices,
    getShapeX,
    getShapeY,
    getShapeOffset,
    isWithinShape,
    getInterpolate,
};
