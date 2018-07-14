import CLASS from './class';
import { ChartInternal } from './core';


ChartInternal.prototype.generateTargetClass = function (targetId) {
    return targetId || targetId === 0 ? ('-' + targetId).replace(/\s/g, '-') : '';
};
ChartInternal.prototype.generateClass = function (prefix, targetId) {
    return " " + prefix + " " + prefix + this.generateTargetClass(targetId);
};
ChartInternal.prototype.classText = function (d) {
    return this.generateClass(CLASS.text, d.index);
};
ChartInternal.prototype.classTexts = function (d) {
    return this.generateClass(CLASS.texts, d.id);
};
ChartInternal.prototype.classShape = function (d) {
    return this.generateClass(CLASS.shape, d.index);
};
ChartInternal.prototype.classShapes = function (d) {
    return this.generateClass(CLASS.shapes, d.id);
};
ChartInternal.prototype.classLine = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.line, d.id);
};
ChartInternal.prototype.classLines = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.lines, d.id);
};
ChartInternal.prototype.classCircle = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.circle, d.index);
};
ChartInternal.prototype.classCircles = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.circles, d.id);
};
ChartInternal.prototype.classBar = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.bar, d.index);
};
ChartInternal.prototype.classBars = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.bars, d.id);
};
ChartInternal.prototype.classArc = function (d) {
    return this.classShape(d.data) + this.generateClass(CLASS.arc, d.data.id);
};
ChartInternal.prototype.classArcs = function (d) {
    return this.classShapes(d.data) + this.generateClass(CLASS.arcs, d.data.id);
};
ChartInternal.prototype.classArea = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.area, d.id);
};
ChartInternal.prototype.classAreas = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.areas, d.id);
};
ChartInternal.prototype.classRegion = function (d, i) {
    return this.generateClass(CLASS.region, i) + ' ' + ('class' in d ? d['class'] : '');
};
ChartInternal.prototype.classEvent = function (d) {
    return this.generateClass(CLASS.eventRect, d.index);
};
ChartInternal.prototype.classTarget = function (id) {
    var $$ = this;
    var additionalClassSuffix = $$.config.data_classes[id], additionalClass = '';
    if (additionalClassSuffix) {
        additionalClass = ' ' + CLASS.target + '-' + additionalClassSuffix;
    }
    return $$.generateClass(CLASS.target, id) + additionalClass;
};
ChartInternal.prototype.classFocus = function (d) {
    return this.classFocused(d) + this.classDefocused(d);
};
ChartInternal.prototype.classFocused = function (d) {
    return ' ' + (this.focusedTargetIds.indexOf(d.id) >= 0 ? CLASS.focused : '');
};
ChartInternal.prototype.classDefocused = function (d) {
    return ' ' + (this.defocusedTargetIds.indexOf(d.id) >= 0 ? CLASS.defocused : '');
};
ChartInternal.prototype.classChartText = function (d) {
    return CLASS.chartText + this.classTarget(d.id);
};
ChartInternal.prototype.classChartLine = function (d) {
    return CLASS.chartLine + this.classTarget(d.id);
};
ChartInternal.prototype.classChartBar = function (d) {
    return CLASS.chartBar + this.classTarget(d.id);
};
ChartInternal.prototype.classChartArc = function (d) {
    return CLASS.chartArc + this.classTarget(d.data.id);
};
ChartInternal.prototype.getTargetSelectorSuffix = function (targetId) {
    return this.generateTargetClass(targetId)
        .replace(/([?!@#$%^&*()_=+,.<>'":;\[\]\/|~`{}\\])/g, '\\$1');
};
ChartInternal.prototype.selectorTarget = function (id, prefix) {
    return (prefix || '') + '.' + CLASS.target + this.getTargetSelectorSuffix(id);
};
ChartInternal.prototype.selectorTargets = function (ids, prefix) {
    var $$ = this;
    ids = ids || [];
    return ids.length ? ids.map(function (id) { return $$.selectorTarget(id, prefix); }) : null;
};
ChartInternal.prototype.selectorLegend = function (id) {
    return '.' + CLASS.legendItem + this.getTargetSelectorSuffix(id);
};
ChartInternal.prototype.selectorLegends = function (ids) {
    var $$ = this;
    return ids && ids.length ? ids.map(function (id) { return $$.selectorLegend(id); }) : null;
};
