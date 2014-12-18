c3_chart_internal_fn.getCurrentWidth = function () {
    var $$ = this, config = $$.config;
    return config.size_width ? config.size_width : $$.getParentWidth();
};
c3_chart_internal_fn.getCurrentHeight = function () {
    var $$ = this, config = $$.config,
        h = config.size_height ? config.size_height : $$.getParentHeight();
    return h > 0 ? h : 320 / ($$.hasType('gauge') ? 2 : 1);
};
c3_chart_internal_fn.getCurrentPaddingTop = function () {
    var config = this.config;
    return isValue(config.padding_top) ? config.padding_top : 0;
};
c3_chart_internal_fn.getCurrentPaddingBottom = function () {
    var config = this.config;
    return isValue(config.padding_bottom) ? config.padding_bottom : 0;
};
c3_chart_internal_fn.getCurrentPaddingLeft = function (withoutRecompute) {
    var $$ = this, config = $$.config;
    if (isValue(config.padding_left)) {
        return config.padding_left;
    } else if (config.axis_rotated) {
        return !config.axis_x_show ? 1 : Math.max(ceil10($$.getAxisWidthByAxisId('x', withoutRecompute)), 40);
    } else if (!config.axis_y_show || config.axis_y_inner) { // && !config.axis_rotated
        return $$.getYAxisLabelPosition().isOuter ? 30 : 1;
    } else {
        return ceil10($$.getAxisWidthByAxisId('y', withoutRecompute));
    }
};
c3_chart_internal_fn.getCurrentPaddingRight = function () {
    var $$ = this, config = $$.config,
        defaultPadding = 10, legendWidthOnRight = $$.isLegendRight ? $$.getLegendWidth() + 20 : 0;
    if (isValue(config.padding_right)) {
        return config.padding_right + 1; // 1 is needed not to hide tick line
    } else if (config.axis_rotated) {
        return defaultPadding + legendWidthOnRight;
    } else if (!config.axis_y2_show || config.axis_y2_inner) { // && !config.axis_rotated
        return 2 + legendWidthOnRight + ($$.getY2AxisLabelPosition().isOuter ? 20 : 0);
    } else {
        return ceil10($$.getAxisWidthByAxisId('y2')) + legendWidthOnRight;
    }
};

c3_chart_internal_fn.getParentRectValue = function (key) {
    var parent = this.selectChart.node(), v;
    while (parent && parent.tagName !== 'BODY') {
        v = parent.getBoundingClientRect()[key];
        if (v) {
            break;
        }
        parent = parent.parentNode;
    }
    return v;
};
c3_chart_internal_fn.getParentWidth = function () {
    return this.getParentRectValue('width');
};
c3_chart_internal_fn.getParentHeight = function () {
    var h = this.selectChart.style('height');
    return h.indexOf('px') > 0 ? +h.replace('px', '') : 0;
};


c3_chart_internal_fn.getSvgLeft = function (withoutRecompute) {
    var $$ = this, config = $$.config,
        hasLeftAxisRect = config.axis_rotated || (!config.axis_rotated && !config.axis_y_inner),
        leftAxisClass = config.axis_rotated ? CLASS.axisX : CLASS.axisY,
        leftAxis = $$.main.select('.' + leftAxisClass).node(),
        svgRect = leftAxis && hasLeftAxisRect ? leftAxis.getBoundingClientRect() : {right: 0},
        chartRect = $$.selectChart.node().getBoundingClientRect(),
        hasArc = $$.hasArcType(),
        svgLeft = svgRect.right - chartRect.left - (hasArc ? 0 : $$.getCurrentPaddingLeft(withoutRecompute));
    return svgLeft > 0 ? svgLeft : 0;
};


c3_chart_internal_fn.getAxisWidthByAxisId = function (id, withoutRecompute) {
    var $$ = this, position = $$.getAxisLabelPositionById(id);
    return $$.getMaxTickWidth(id, withoutRecompute) + (position.isInner ? 20 : 40);
};
c3_chart_internal_fn.getHorizontalAxisHeight = function (axisId) {
    var $$ = this, config = $$.config, h = 30;
    if (axisId === 'x' && !config.axis_x_show) { return 8; }
    if (axisId === 'x' && config.axis_x_height) { return config.axis_x_height; }
    if (axisId === 'y' && !config.axis_y_show) { return config.legend_show && !$$.isLegendRight && !$$.isLegendInset ? 10 : 1; }
    if (axisId === 'y2' && !config.axis_y2_show) { return $$.rotated_padding_top; }
    // Calculate x axis height when tick rotated
    if (axisId === 'x' && !config.axis_rotated && config.axis_x_tick_rotate) {
        h = $$.getMaxTickWidth(axisId) * Math.cos(Math.PI * (90 - config.axis_x_tick_rotate) / 180);
    }
    return h + ($$.getAxisLabelPositionById(axisId).isInner ? 0 : 10) + (axisId === 'y2' ? -10 : 0);
};

c3_chart_internal_fn.getEventRectWidth = function () {
    var $$ = this;
    var target = $$.getMaxDataCountTarget($$.data.targets),
        firstData, lastData, base, maxDataCount, ratio, w;
    if (!target) {
        return 0;
    }
    firstData = target.values[0], lastData = target.values[target.values.length - 1];
    base = $$.x(lastData.x) - $$.x(firstData.x);
    if (base === 0) {
        return $$.config.axis_rotated ? $$.height : $$.width;
    }
    maxDataCount = $$.getMaxDataCount();
    ratio = ($$.hasType('bar') ? (maxDataCount - ($$.isCategorized() ? 0.25 : 1)) / maxDataCount : 1);
    w = maxDataCount > 1 ? (base * ratio) / (maxDataCount - 1) : base;
    return w < 1 ? 1 : w;
};
