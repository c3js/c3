import { isString } from './util';

const setTargetType = function (targetIds, type) {
    let $$ = this, config = $$.config;
    $$.mapToTargetIds(targetIds).forEach((id) => {
        $$.withoutFadeIn[id] = (type === config.data_types[id]);
        config.data_types[id] = type;
    });
    if (!targetIds) {
        config.data_type = type;
    }
};
const hasType = function (type, targets) {
    let $$ = this, types = $$.config.data_types, has = false;
    targets = targets || $$.data.targets;
    if (targets && targets.length) {
        targets.forEach((target) => {
            const t = types[target.id];
            if ((t && t.indexOf(type) >= 0) || (!t && type === 'line')) {
                has = true;
            }
        });
    } else if (Object.keys(types).length) {
        Object.keys(types).forEach((id) => {
            if (types[id] === type) { has = true; }
        });
    } else {
        has = $$.config.data_type === type;
    }
    return has;
};
const hasArcType = function (targets) {
    return this.hasType('pie', targets) || this.hasType('donut', targets) || this.hasType('gauge', targets);
};
const isLineType = function (d) {
    let config = this.config, id = isString(d) ? d : d.id;
    return !config.data_types[id] || ['line', 'spline', 'area', 'area-spline', 'step', 'area-step'].indexOf(config.data_types[id]) >= 0;
};
const isStepType = function (d) {
    const id = isString(d) ? d : d.id;
    return ['step', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
const isSplineType = function (d) {
    const id = isString(d) ? d : d.id;
    return ['spline', 'area-spline'].indexOf(this.config.data_types[id]) >= 0;
};
const isAreaType = function (d) {
    const id = isString(d) ? d : d.id;
    return ['area', 'area-spline', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
const isBarType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'bar';
};
const isScatterType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'scatter';
};
const isPieType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'pie';
};
const isGaugeType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'gauge';
};
const isDonutType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'donut';
};
const isArcType = function (d) {
    return this.isPieType(d) || this.isDonutType(d) || this.isGaugeType(d);
};
const lineData = function (d) {
    return this.isLineType(d) ? [d] : [];
};
const arcData = function (d) {
    return this.isArcType(d.data) ? [d] : [];
};
/* not used
 function scatterData(d) {
 return isScatterType(d) ? d.values : [];
 }
 */
const barData = function (d) {
    return this.isBarType(d) ? d.values : [];
};
const lineOrScatterData = function (d) {
    return this.isLineType(d) || this.isScatterType(d) ? d.values : [];
};
const barOrLineData = function (d) {
    return this.isBarType(d) || this.isLineType(d) ? d.values : [];
};
const isInterpolationType = function (type) {
    return ['linear', 'linear-closed', 'basis', 'basis-open', 'basis-closed', 'bundle', 'cardinal', 'cardinal-open', 'cardinal-closed', 'monotone'].indexOf(type) >= 0;
};

export {
    setTargetType,
    hasType,
    hasArcType,
    isLineType,
    isStepType,
    isSplineType,
    isAreaType,
    isBarType,
    isScatterType,
    isPieType,
    isGaugeType,
    isDonutType,
    isArcType,
    lineData,
    arcData,
    barData,
    lineOrScatterData,
    barOrLineData,
    isInterpolationType,
};
