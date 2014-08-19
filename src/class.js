var _target = 'target',
    _chart  = 'chart ',
    _chartLine = 'chartLine',
    _chartLines = 'chartLines',
    _chartBar = 'chartBar',
    _chartBars = 'chartBars',
    _chartText = 'chartText',
    _chartTexts = 'chartTexts',
    _chartArc = 'chartArc',
    _chartArcs = 'chartArcs',
    _chartArcsTitle = 'chartArcsTitle',
    _chartArcsBackground = 'chartArcsBackground',
    _chartArcsGaugeUnit = 'chartArcsGaugeUnit',
    _chartArcsGaugeMax = 'chartArcsGaugeMax',
    _chartArcsGaugeMin = 'chartArcsGaugeMin',
    _selectedCircle = 'selectedCircle',
    _selectedCircles = 'selectedCircles',
    _eventRect = 'eventRect',
    _eventRects = 'eventRects',
    _eventRectsSingle = 'eventRectsSingle',
    _eventRectsMultiple = 'eventRectsMultiple',
    _zoomRect = 'zoomRect',
    _brush = 'brush',
    _focused = 'focused',
    _region = 'region',
    _regions = 'regions',
    _tooltip = 'tooltip',
    _tooltipName = 'tooltipName',
    _shape = 'shape',
    _shapes = 'shapes',
    _line = 'line',
    _lines = 'lines',
    _bar = 'bar',
    _bars = 'bars',
    _circle = 'circle',
    _circles = 'circles',
    _arc = 'arc',
    _arcs = 'arcs',
    _area = 'area',
    _areas = 'areas',
    _empty = 'empty',
    _text = 'text',
    _texts = 'texts',
    _gaugeValue = 'gaugeValue',
    _grid = 'grid',
    _xgrid = 'xgrid',
    _xgrids = 'xgrids',
    _xgridLine = 'xgridLine',
    _xgridLines = 'xgridLines',
    _xgridFocus = 'xgridFocus',
    _ygrid = 'ygrid',
    _ygrids = 'ygrids',
    _ygridLine = 'ygridLine',
    _ygridLines = 'ygridLines',
    _axis = 'axis',
    _axisX = 'axisX',
    _axisXLabel = 'axisXLabel',
    _axisY = 'axisY',
    _axisYLabel = 'axisYLabel',
    _axisY2 = 'axisY2',
    _axisY2Label = 'axisY2Label',
    _legendBackground = 'legendBackground',
    _legendItem = 'legendItem',
    _legendItemEvent = 'legendItemEvent',
    _legendItemTile = 'legendItemTile',
    _legendItemHidden = 'legendItemHidden',
    _legendItemFocused = 'legendItemFocused',
    _dragarea = 'dragarea',
    _EXPANDED = 'EXPANDED',
    _SELECTED = 'SELECTED',
    _INCLUDED = 'INCLUDED';

var CLASS = c3_chart_internal_fn.CLASS = {};
CLASS[_target] = 'c3-target';
CLASS[_chart] = 'c3-chart';
CLASS[_chartLine] = 'c3-chart-line';
CLASS[_chartLines] = 'c3-chart-lines';
CLASS[_chartBar] = 'c3-chart-bar';
CLASS[_chartBars] = 'c3-chart-bars';
CLASS[_chartText] = 'c3-chart-text';
CLASS[_chartTexts] = 'c3-chart-texts';
CLASS[_chartArc] = 'c3-chart-arc';
CLASS[_chartArcs] = 'c3-chart-arcs';
CLASS[_chartArcsTitle] = 'c3-chart-arcs-title';
CLASS[_chartArcsBackground] = 'c3-chart-arcs-background';
CLASS[_chartArcsGaugeUnit] = 'c3-chart-arcs-gauge-unit';
CLASS[_chartArcsGaugeMax] = 'c3-chart-arcs-gauge-max';
CLASS[_chartArcsGaugeMin] = 'c3-chart-arcs-gauge-min';
CLASS[_selectedCircle] = 'c3-selected-circle';
CLASS[_selectedCircles] = 'c3-selected-circles';
CLASS[_eventRect] = 'c3-event-rect';
CLASS[_eventRects] = 'c3-event-rects';
CLASS[_eventRectsSingle] = 'c3-event-rects-single';
CLASS[_eventRectsMultiple] = 'c3-event-rects-multiple';
CLASS[_zoomRect] = 'c3-zoom-rect';
CLASS[_brush] = 'c3-brush';
CLASS[_focused] = 'c3-focused';
CLASS[_region] = 'c3-region';
CLASS[_regions] = 'c3-regions';
CLASS[_tooltip] = 'c3-tooltip';
CLASS[_tooltipName] = 'c3-tooltip-name';
CLASS[_shape] = 'c3-shape';
CLASS[_shapes] = 'c3-shapes';
CLASS[_line] = 'c3-line';
CLASS[_lines] = 'c3-lines';
CLASS[_bar] = 'c3-bar';
CLASS[_bars] = 'c3-bars';
CLASS[_circle] = 'c3-circle';
CLASS[_circles] = 'c3-circles';
CLASS[_arc] = 'c3-arc';
CLASS[_arcs] = 'c3-arcs';
CLASS[_area] = 'c3-area';
CLASS[_areas] = 'c3-areas';
CLASS[_empty] = 'c3-empty';
CLASS[_text] = 'c3-text';
CLASS[_texts] = 'c3-texts';
CLASS[_gaugeValue] = 'c3-gauge-value';
CLASS[_grid] = 'c3-grid';
CLASS[_xgrid] = 'c3-xgrid';
CLASS[_xgrids] = 'c3-xgrids';
CLASS[_xgridLine] = 'c3-xgrid-line';
CLASS[_xgridLines] = 'c3-xgrid-lines';
CLASS[_xgridFocus] = 'c3-xgrid-focus';
CLASS[_ygrid] = 'c3-ygrid';
CLASS[_ygrids] = 'c3-ygrids';
CLASS[_ygridLine] = 'c3-ygrid-line';
CLASS[_ygridLines] = 'c3-ygrid-lines';
CLASS[_axis] = 'c3-axis';
CLASS[_axisX] = 'c3-axis-x';
CLASS[_axisXLabel] = 'c3-axis-x-label';
CLASS[_axisY] = 'c3-axis-y';
CLASS[_axisYLabel] = 'c3-axis-y-label';
CLASS[_axisY2] = 'c3-axis-y2';
CLASS[_axisY2Label] = 'c3-axis-y2-label';
CLASS[_legendBackground] = 'c3-legend-background';
CLASS[_legendItem] = 'c3-legend-item';
CLASS[_legendItemEvent] = 'c3-legend-item-event';
CLASS[_legendItemTile] = 'c3-legend-item-tile';
CLASS[_legendItemHidden] = 'c3-legend-item-hidden';
CLASS[_legendItemFocused] = 'c3-legend-item-focused';
CLASS[_dragarea] = 'c3-dragarea';
CLASS[_EXPANDED] = '_expanded_';
CLASS[_SELECTED] = '_selected_';
CLASS[_INCLUDED] = '_included_';

c3_chart_internal_fn.generateClass = function (prefix, targetId) {
    return " " + prefix + " " + prefix + this.getTargetSelectorSuffix(targetId);
};
c3_chart_internal_fn.classText = function (d) {
    return this.generateClass(CLASS[_text], d.index);
};
c3_chart_internal_fn.classTexts = function (d) {
    return this.generateClass(CLASS[_texts], d.id);
};
c3_chart_internal_fn.classShape = function (d) {
    return this.generateClass(CLASS[_shape], d.index);
};
c3_chart_internal_fn.classShapes = function (d) {
    return this.generateClass(CLASS[_shapes], d.id);
};
c3_chart_internal_fn.classLine = function (d) {
    return this.classShape(d) + this.generateClass(CLASS[_line], d.id);
};
c3_chart_internal_fn.classLines = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS[_lines], d.id);
};
c3_chart_internal_fn.classCircle = function (d) {
    return this.classShape(d) + this.generateClass(CLASS[_circle], d.index);
};
c3_chart_internal_fn.classCircles = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS[_circles], d.id);
};
c3_chart_internal_fn.classBar = function (d) {
    return this.classShape(d) + this.generateClass(CLASS[_bar], d.index);
};
c3_chart_internal_fn.classBars = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS[_bars], d.id);
};
c3_chart_internal_fn.classArc = function (d) {
    return this.classShape(d.data) + this.generateClass(CLASS[_arc], d.data.id);
};
c3_chart_internal_fn.classArcs = function (d) {
    return this.classShapes(d.data) + this.generateClass(CLASS[_arcs], d.data.id);
};
c3_chart_internal_fn.classArea = function (d) {
    return this.classShape(d) + this.generateClass(CLASS[_area], d.id);
};
c3_chart_internal_fn.classAreas = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS[_areas], d.id);
};
c3_chart_internal_fn.classRegion = function (d, i) {
    return this.generateClass(CLASS[_region], i) + ' ' + ('class' in d ? d.class : '');
};
c3_chart_internal_fn.classEvent = function (d) {
    return this.generateClass(CLASS[_eventRect], d.index);
};
c3_chart_internal_fn.classTarget = function (id) {
    var $$ = this;
    var additionalClassSuffix = $$.config.data_classes[id], additionalClass = '';
    if (additionalClassSuffix) {
        additionalClass = ' ' + CLASS[_target] + '-' + additionalClassSuffix;
    }
    return $$.generateClass(CLASS[_target], id) + additionalClass;
};
c3_chart_internal_fn.classChartText = function (d) {
    return CLASS[_chartText] + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartLine = function (d) {
    return CLASS[_chartLine] + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartBar = function (d) {
    return CLASS[_chartBar] + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartArc = function (d) {
    return CLASS[_chartArc] + this.classTarget(d.data.id);
};
c3_chart_internal_fn.getTargetSelectorSuffix = function (targetId) {
    return targetId || targetId === 0 ? '-' + (targetId.replace ? targetId.replace(/([^a-zA-Z0-9-_])/g, '-') : targetId) : '';
};
c3_chart_internal_fn.selectorTarget = function (id) {
    return '.' + CLASS[_target] + this.getTargetSelectorSuffix(id);
};
c3_chart_internal_fn.selectorTargets = function (ids) {
    var $$ = this;
    return ids.length ? ids.map(function (id) { return $$.selectorTarget(id); }) : null;
};
c3_chart_internal_fn.selectorLegend = function (id) {
    return '.' + CLASS[_legendItem] + this.getTargetSelectorSuffix(id);
};
c3_chart_internal_fn.selectorLegends = function (ids) {
    var $$ = this;
    return ids.length ? ids.map(function (id) { return $$.selectorLegend(id); }) : null;
};
