import { ChartInternal } from './core';
import { isString } from './util';

ChartInternal.prototype.setTargetType = function (targetIds, type) {
    var $$ = this, config = $$.config;
    $$.mapToTargetIds(targetIds).forEach(function (id) {
        $$.withoutFadeIn[id] = (type === config.data_types[id]);
        config.data_types[id] = type;
    });
    if (!targetIds) {
        config.data_type = type;
    }
};
ChartInternal.prototype.hasType = function (type, targets) {
    var $$ = this, types = $$.config.data_types, has = false;
    targets = targets || $$.data.targets;
    if (targets && targets.length) {
        targets.forEach(function (target) {
            var t = types[target.id];
            if ((t && t.indexOf(type) >= 0) || (!t && type === 'line')) {
                has = true;
            }
        });
    } else if (Object.keys(types).length) {
        Object.keys(types).forEach(function (id) {
            if (types[id] === type) { has = true; }
        });
    } else {
        has = $$.config.data_type === type;
    }
    return has;
};
ChartInternal.prototype.hasArcType = function (targets) {
    return this.hasType('pie', targets) || this.hasType('donut', targets) || this.hasType('gauge', targets);
};
ChartInternal.prototype.isLineType = function (d) {
    var config = this.config, id = isString(d) ? d : d.id;
    return !config.data_types[id] || ['line', 'spline', 'area', 'area-spline', 'step', 'area-step'].indexOf(config.data_types[id]) >= 0;
};
ChartInternal.prototype.isStepType = function (d) {
    var id = isString(d) ? d : d.id;
    return ['step', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
ChartInternal.prototype.isSplineType = function (d) {
    var id = isString(d) ? d : d.id;
    return ['spline', 'area-spline'].indexOf(this.config.data_types[id]) >= 0;
};
ChartInternal.prototype.isAreaType = function (d) {
    var id = isString(d) ? d : d.id;
    return ['area', 'area-spline', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
ChartInternal.prototype.isBarType = function (d) {
    var id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'bar';
};
ChartInternal.prototype.isScatterType = function (d) {
    var id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'scatter';
};
ChartInternal.prototype.isStanfordType = function (d) {
    var id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'stanford';
};
ChartInternal.prototype.isScatterOrStanfordType = function (d) {
    return this.isScatterType(d) || this.isStanfordType(d);
};
ChartInternal.prototype.isPieType = function (d) {
    var id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'pie';
};
ChartInternal.prototype.isGaugeType = function (d) {
    var id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'gauge';
};
ChartInternal.prototype.isDonutType = function (d) {
    var id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'donut';
};
ChartInternal.prototype.isArcType = function (d) {
    return this.isPieType(d) || this.isDonutType(d) || this.isGaugeType(d);
};
ChartInternal.prototype.lineData = function (d) {
    return this.isLineType(d) ? [d] : [];
};
ChartInternal.prototype.arcData = function (d) {
    return this.isArcType(d.data) ? [d] : [];
};
/* not used
 function scatterData(d) {
 return isScatterType(d) ? d.values : [];
 }
 */
ChartInternal.prototype.barData = function (d) {
    return this.isBarType(d) ? d.values : [];
};
ChartInternal.prototype.lineOrScatterOrStanfordData = function (d) {
    return this.isLineType(d) || this.isScatterType(d) || this.isStanfordType(d) ? d.values : [];
};
ChartInternal.prototype.barOrLineData = function (d) {
    return this.isBarType(d) || this.isLineType(d) ? d.values : [];
};
