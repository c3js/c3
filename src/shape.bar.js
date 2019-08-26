import CLASS from './class';
import { ChartInternal } from './core';
import { getBBox, isValue, isWithinBox } from './util';

ChartInternal.prototype.initBar = function () {
    var $$ = this;
    $$.main.select('.' + CLASS.chart).append("g")
        .attr("class", CLASS.chartBars);
};
ChartInternal.prototype.updateTargetsForBar = function (targets) {
    var $$ = this, config = $$.config,
        mainBars, mainBarEnter,
        classChartBar = $$.classChartBar.bind($$),
        classBars = $$.classBars.bind($$),
        classFocus = $$.classFocus.bind($$);
    mainBars = $$.main.select('.' + CLASS.chartBars).selectAll('.' + CLASS.chartBar)
        .data(targets)
        .attr('class', function (d) { return classChartBar(d) + classFocus(d); });
    mainBarEnter = mainBars.enter().append('g')
        .attr('class', classChartBar)
        .style("pointer-events", "none");
    // Bars for each data
    mainBarEnter.append('g')
        .attr("class", classBars)
        .style("cursor", function (d) { return config.data_selection_isselectable(d) ? "pointer" : null; });

};
ChartInternal.prototype.updateBar = function (durationForExit) {
    var $$ = this,
        barData = $$.barData.bind($$),
        classBar = $$.classBar.bind($$),
        initialOpacity = $$.initialOpacity.bind($$),
        color = function (d) { return $$.color(d.id); };
    var mainBar = $$.main.selectAll('.' + CLASS.bars).selectAll('.' + CLASS.bar)
        .data(barData);
    var mainBarEnter = mainBar.enter().append('path')
        .attr("class", classBar)
        .style("stroke", color)
        .style("fill", color);
    $$.mainBar = mainBarEnter.merge(mainBar)
        .style("opacity", initialOpacity);
    mainBar.exit().transition().duration(durationForExit)
        .style("opacity", 0);
};
ChartInternal.prototype.redrawBar = function (drawBar, withTransition, transition) {
    return [
        (withTransition ? this.mainBar.transition(transition) : this.mainBar)
            .attr('d', drawBar)
            .style("stroke", this.color)
            .style("fill", this.color)
            .style("opacity", 1)
    ];
};
ChartInternal.prototype.getBarW = function (axis, barTargetsNum) {
    var $$ = this, config = $$.config,
        w = typeof config.bar_width === 'number' ? config.bar_width : barTargetsNum ? (axis.tickInterval() * config.bar_width_ratio) / barTargetsNum : 0;
    return config.bar_width_max && w > config.bar_width_max ? config.bar_width_max : w;
};
ChartInternal.prototype.getBars = function (i, id) {
    var $$ = this;
    return (id ? $$.main.selectAll('.' + CLASS.bars + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS.bar + (isValue(i) ? '-' + i : ''));
};
ChartInternal.prototype.expandBars = function (i, id, reset) {
    var $$ = this;
    if (reset) { $$.unexpandBars(); }
    $$.getBars(i, id).classed(CLASS.EXPANDED, true);
};
ChartInternal.prototype.unexpandBars = function (i) {
    var $$ = this;
    $$.getBars(i).classed(CLASS.EXPANDED, false);
};
ChartInternal.prototype.generateDrawBar = function (barIndices, isSub) {
    var $$ = this, config = $$.config,
        getPoints = $$.generateGetBarPoints(barIndices, isSub);
    return function (d, i) {
        // 4 points that make a bar
        var points = getPoints(d, i);

        // switch points if axis is rotated, not applicable for sub chart
        var indexX = config.axis_rotated ? 1 : 0;
        var indexY = config.axis_rotated ? 0 : 1;

        var path = 'M ' + points[0][indexX] + ',' + points[0][indexY] + ' ' +
                'L' + points[1][indexX] + ',' + points[1][indexY] + ' ' +
                'L' + points[2][indexX] + ',' + points[2][indexY] + ' ' +
                'L' + points[3][indexX] + ',' + points[3][indexY] + ' ' +
                'z';

        return path;
    };
};
ChartInternal.prototype.generateGetBarPoints = function (barIndices, isSub) {
    var $$ = this,
        axis = isSub ? $$.subXAxis : $$.xAxis,
        barTargetsNum = barIndices.__max__ + 1,
        barW = $$.getBarW(axis, barTargetsNum),
        barX = $$.getShapeX(barW, barTargetsNum, barIndices, !!isSub),
        barY = $$.getShapeY(!!isSub),
        barOffset = $$.getShapeOffset($$.isBarType, barIndices, !!isSub),
        barSpaceOffset = barW * ($$.config.bar_space / 2),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        var y0 = yScale.call($$, d.id)(0),
            offset = barOffset(d, i) || y0, // offset is for stacked bar chart
            posX = barX(d), posY = barY(d);
        // fix posY not to overflow opposite quadrant
        if ($$.config.axis_rotated) {
            if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
        }

        posY -= (y0 - offset);

        // 4 points that make a bar
        return [
            [posX + barSpaceOffset, offset],
            [posX + barSpaceOffset, posY],
            [posX + barW - barSpaceOffset, posY],
            [posX + barW - barSpaceOffset, offset]
        ];
    };
};

/**
 * Returns whether the data point is within the given bar shape.
 *
 * @param mouse
 * @param barShape
 * @return {boolean}
 */
ChartInternal.prototype.isWithinBar = function (mouse, barShape) {
    return isWithinBox(mouse, getBBox(barShape), 2);
};
