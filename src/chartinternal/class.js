var CLASS = c3_chart_internal_fn.CLASS = {
    target: 'c3-target',
    chart: 'c3-chart',
    chartLine: 'c3-chart-line',
    chartLines: 'c3-chart-lines',
    chartBar: 'c3-chart-bar',
    chartBars: 'c3-chart-bars',
    chartText: 'c3-chart-text',
    chartTexts: 'c3-chart-texts',
    chartArc: 'c3-chart-arc',
    chartArcs: 'c3-chart-arcs',
    chartArcsTitle: 'c3-chart-arcs-title',
    chartArcsBackground: 'c3-chart-arcs-background',
    chartArcsGaugeUnit: 'c3-chart-arcs-gauge-unit',
    chartArcsGaugeMax: 'c3-chart-arcs-gauge-max',
    chartArcsGaugeMin: 'c3-chart-arcs-gauge-min',
    selectedCircle: 'c3-selected-circle',
    selectedCircles: 'c3-selected-circles',
    eventRect: 'c3-event-rect',
    eventRects: 'c3-event-rects',
    eventRectsSingle: 'c3-event-rects-single',
    eventRectsMultiple: 'c3-event-rects-multiple',
    zoomRect: 'c3-zoom-rect',
    brush: 'c3-brush',
    focused: 'c3-focused',
    defocused: 'c3-defocused',
    region: 'c3-region',
    regions: 'c3-regions',
    title: 'c3-title',
    tooltipContainer: 'c3-tooltip-container',
    tooltip: 'c3-tooltip',
    tooltipName: 'c3-tooltip-name',
    shape: 'c3-shape',
    shapes: 'c3-shapes',
    line: 'c3-line',
    lines: 'c3-lines',
    bar: 'c3-bar',
    bars: 'c3-bars',
    circle: 'c3-circle',
    circles: 'c3-circles',
    arc: 'c3-arc',
    arcs: 'c3-arcs',
    area: 'c3-area',
    areas: 'c3-areas',
    empty: 'c3-empty',
    text: 'c3-text',
    texts: 'c3-texts',
    gaugeValue: 'c3-gauge-value',
    grid: 'c3-grid',
    gridLines: 'c3-grid-lines',
    xgrid: 'c3-xgrid',
    xgrids: 'c3-xgrids',
    xgridLine: 'c3-xgrid-line',
    xgridLines: 'c3-xgrid-lines',
    xgridFocus: 'c3-xgrid-focus',
    ygrid: 'c3-ygrid',
    ygrids: 'c3-ygrids',
    ygridLine: 'c3-ygrid-line',
    ygridLines: 'c3-ygrid-lines',
    axis: 'c3-axis',
    axisX: 'c3-axis-x',
    axisXLabel: 'c3-axis-x-label',
    axisY: 'c3-axis-y',
    axisYLabel: 'c3-axis-y-label',
    axisY2: 'c3-axis-y2',
    axisY2Label: 'c3-axis-y2-label',
    legendBackground: 'c3-legend-background',
    legendItem: 'c3-legend-item',
    legendItemEvent: 'c3-legend-item-event',
    legendItemTile: 'c3-legend-item-tile',
    legendItemHidden: 'c3-legend-item-hidden',
    legendItemFocused: 'c3-legend-item-focused',
    dragarea: 'c3-dragarea',
    EXPANDED: '_expanded_',
    SELECTED: '_selected_',
    INCLUDED: '_included_'
};
c3_chart_internal_fn.generateClass = function (prefix, targetId) {
    return " " + prefix + " " + prefix + this.getTargetSelectorSuffix(targetId);
};
c3_chart_internal_fn.classText = function (d) {
    return this.generateClass(CLASS.text, d.index);
};
c3_chart_internal_fn.classTexts = function (d) {
    return this.generateClass(CLASS.texts, d.id);
};
c3_chart_internal_fn.classShape = function (d) {
    return this.generateClass(CLASS.shape, d.index);
};
c3_chart_internal_fn.classShapes = function (d) {
    return this.generateClass(CLASS.shapes, d.id);
};
c3_chart_internal_fn.classLine = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.line, d.id);
};
c3_chart_internal_fn.classLines = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.lines, d.id);
};
c3_chart_internal_fn.classCircle = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.circle, d.index);
};
c3_chart_internal_fn.classCircles = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.circles, d.id);
};
c3_chart_internal_fn.classBar = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.bar, d.index);
};
c3_chart_internal_fn.classBars = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.bars, d.id);
};
c3_chart_internal_fn.classArc = function (d) {
    return this.classShape(d.data) + this.generateClass(CLASS.arc, d.data.id);
};
c3_chart_internal_fn.classArcs = function (d) {
    return this.classShapes(d.data) + this.generateClass(CLASS.arcs, d.data.id);
};
c3_chart_internal_fn.classArea = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.area, d.id);
};
c3_chart_internal_fn.classAreas = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.areas, d.id);
};
c3_chart_internal_fn.classRegion = function (d, i) {
    return this.generateClass(CLASS.region, i) + ' ' + ('class' in d ? d['class'] : '');
};
c3_chart_internal_fn.classEvent = function (d) {
    return this.generateClass(CLASS.eventRect, d.index);
};
c3_chart_internal_fn.classTarget = function (id) {
    var $$ = this;
    var additionalClassSuffix = $$.config.data_classes[id], additionalClass = '';
    if (additionalClassSuffix) {
        additionalClass = ' ' + CLASS.target + '-' + additionalClassSuffix;
    }
    return $$.generateClass(CLASS.target, id) + additionalClass;
};
c3_chart_internal_fn.classFocus = function (d) {
    return this.classFocused(d) + this.classDefocused(d);
};
c3_chart_internal_fn.classFocused = function (d) {
    return ' ' + (this.focusedTargetIds.indexOf(d.id) >= 0 ? CLASS.focused : '');
};
c3_chart_internal_fn.classDefocused = function (d) {
    return ' ' + (this.defocusedTargetIds.indexOf(d.id) >= 0 ? CLASS.defocused : '');
};
c3_chart_internal_fn.classChartText = function (d) {
    return CLASS.chartText + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartLine = function (d) {
    return CLASS.chartLine + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartBar = function (d) {
    return CLASS.chartBar + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartArc = function (d) {
    return CLASS.chartArc + this.classTarget(d.data.id);
};
c3_chart_internal_fn.getTargetSelectorSuffix = function (targetId) {
    return targetId || targetId === 0 ? ('-' + targetId).replace(/[\s?!@#$%^&*()_=+,.<>'":;\[\]\/|~`{}\\]/g, '-') : '';
};
c3_chart_internal_fn.selectorTarget = function (id, prefix) {
    return (prefix || '') + '.' + CLASS.target + this.getTargetSelectorSuffix(id);
};
c3_chart_internal_fn.selectorTargets = function (ids, prefix) {
    var $$ = this;
    ids = ids || [];
    return ids.length ? ids.map(function (id) { return $$.selectorTarget(id, prefix); }) : null;
};
c3_chart_internal_fn.selectorLegend = function (id) {
    return '.' + CLASS.legendItem + this.getTargetSelectorSuffix(id);
};
c3_chart_internal_fn.selectorLegends = function (ids) {
    var $$ = this;
    return ids && ids.length ? ids.map(function (id) { return $$.selectorLegend(id); }) : null;
};
