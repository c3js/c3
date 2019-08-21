import CLASS from './class';
import { ChartInternal } from './core';
import { isValue, ceil10 } from './util';

ChartInternal.prototype.getCurrentWidth = function () {
    var $$ = this, config = $$.config;
    return config.size_width ? config.size_width : $$.getParentWidth();
};
ChartInternal.prototype.getCurrentHeight = function () {
    var $$ = this, config = $$.config,
        h = config.size_height ? config.size_height : $$.getParentHeight();
    return h > 0 ? h : 320 / ($$.hasType('gauge') && !config.gauge_fullCircle ? 2 : 1);
};
ChartInternal.prototype.getCurrentPaddingTop = function () {
    var $$ = this,
        config = $$.config,
        padding = isValue(config.padding_top) ? config.padding_top : 0;
    if ($$.title && $$.title.node()) {
        padding += $$.getTitlePadding();
    }
    return padding;
};
ChartInternal.prototype.getCurrentPaddingBottom = function () {
    var config = this.config;
    return isValue(config.padding_bottom) ? config.padding_bottom : 0;
};
ChartInternal.prototype.getCurrentPaddingLeft = function () {
    var $$ = this, config = $$.config;
    if (isValue(config.padding_left)) {
        return config.padding_left;
    } else if (config.axis_rotated) {
        return (!config.axis_x_show || config.axis_x_inner) ? 1 : Math.max(ceil10($$.getAxisWidthByAxisId('x')), 40);
    } else if (!config.axis_y_show || config.axis_y_inner) { // && !config.axis_rotated
        return $$.axis.getYAxisLabelPosition().isOuter ? 30 : 1;
    } else {
        return ceil10($$.getAxisWidthByAxisId('y'));
    }
};
ChartInternal.prototype.getCurrentPaddingRight = function () {
    var $$ = this, config = $$.config, padding = 0,
        defaultPadding = 10, legendWidthOnRight = $$.isLegendRight ? $$.getLegendWidth() + 20 : 0;

    if (isValue(config.padding_right)) {
        padding = config.padding_right + 1; // 1 is needed not to hide tick line
    } else if (config.axis_rotated) {
        padding = defaultPadding + legendWidthOnRight;
    } else if (!config.axis_y2_show || config.axis_y2_inner) { // && !config.axis_rotated
        padding = 2 + legendWidthOnRight + ($$.axis.getY2AxisLabelPosition().isOuter ? 20 : 0);
    } else {
        padding = ceil10($$.getAxisWidthByAxisId('y2')) + legendWidthOnRight;
    }

    if ($$.colorScale && $$.colorScale.node()) {
        padding += $$.getColorScalePadding();
    }

    return padding;
};

ChartInternal.prototype.getParentRectValue = function (key) {
    var parent = this.selectChart.node(), v;
    while (parent && parent.tagName !== 'BODY') {
        try {
            v = parent.getBoundingClientRect()[key];
        } catch(e) {
            if (key === 'width') {
                // In IE in certain cases getBoundingClientRect
                // will cause an "unspecified error"
                v = parent.offsetWidth;
            }
        }
        if (v) {
            break;
        }
        parent = parent.parentNode;
    }
    return v;
};
ChartInternal.prototype.getParentWidth = function () {
    return this.getParentRectValue('width');
};
ChartInternal.prototype.getParentHeight = function () {
    var h = this.selectChart.style('height');
    return h.indexOf('px') > 0 ? +h.replace('px', '') : 0;
};


ChartInternal.prototype.getSvgLeft = function () {
    var $$ = this, config = $$.config,
        hasLeftAxisRect = config.axis_rotated || (!config.axis_rotated && !config.axis_y_inner),
        leftAxisClass = config.axis_rotated ? CLASS.axisX : CLASS.axisY,
        leftAxis = $$.main.select('.' + leftAxisClass).node(),
        svgRect = leftAxis && hasLeftAxisRect ? leftAxis.getBoundingClientRect() : {right: 0},
        chartRect = $$.selectChart.node().getBoundingClientRect(),
        hasArc = $$.hasArcType(),
        svgLeft = svgRect.right - chartRect.left - (hasArc ? 0 : $$.getCurrentPaddingLeft());
    return svgLeft > 0 ? svgLeft : 0;
};


ChartInternal.prototype.getAxisWidthByAxisId = function (id) {
    var $$ = this, position = $$.axis.getLabelPositionById(id);
    return $$.axis.getMaxTickWidth(id) + (position.isInner ? 20 : 40);
};
ChartInternal.prototype.getHorizontalAxisHeight = function (axisId) {
    var $$ = this, config = $$.config, h = 30;
    if (axisId === 'x' && !config.axis_x_show) { return 8; }
    if (axisId === 'x' && config.axis_x_height) { return config.axis_x_height; }
    if (axisId === 'y' && !config.axis_y_show) {
        return config.legend_show && !$$.isLegendRight && !$$.isLegendInset ? 10 : 1;
    }
    if (axisId === 'y2' && !config.axis_y2_show) { return $$.rotated_padding_top; }
    // Calculate x axis height when tick rotated
    if (axisId === 'x' && !config.axis_rotated && config.axis_x_tick_rotate) {
        h = 30 + $$.axis.getMaxTickWidth(axisId) * Math.cos(Math.PI * (90 - Math.abs(config.axis_x_tick_rotate)) / 180);
    }
    // Calculate y axis height when tick rotated
    if (axisId === 'y' && config.axis_rotated && config.axis_y_tick_rotate) {
        h = 30 + $$.axis.getMaxTickWidth(axisId) * Math.cos(Math.PI * (90 - Math.abs(config.axis_y_tick_rotate)) / 180);
    }
    return h + ($$.axis.getLabelPositionById(axisId).isInner ? 0 : 10) + (axisId === 'y2' ? -10 : 0);
};

