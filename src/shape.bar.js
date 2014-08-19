c3_chart_internal_fn.initBar = function () {
    var $$ = this;
    $$.main.select('.' + CLASS.chart).append("g")
        .attr("class", CLASS.chartBars);
};
c3_chart_internal_fn.updateTargetsForBar = function (targets) {
    var $$ = this, config = $$.config,
        mainBarUpdate, mainBarEnter,
        classChartBar = $$.classChartBar.bind($$),
        classBars = $$.classBars.bind($$);
    mainBarUpdate = $$.main.select('.' + CLASS.chartBars).selectAll('.' + CLASS.chartBar)
        .data(targets)
        .attr('class', classChartBar);
    mainBarEnter = mainBarUpdate.enter().append('g')
        .attr('class', classChartBar)
        .style('opacity', 0)
        .style("pointer-events", "none");
    // Bars for each data
    mainBarEnter.append('g')
        .attr("class", classBars)
        .style("cursor", function (d) { return config.data_selection_isselectable(d) ? "pointer" : null; });

};
c3_chart_internal_fn.redrawBar = function (durationForExit) {
    var $$ = this,
        barData = $$.barData.bind($$),
        classBar = $$.classBar.bind($$),
        initialOpacity = $$.initialOpacity.bind($$),
        color = function (d) { return $$.color(d.id); };
    $$.mainBar = $$.main.selectAll('.' + CLASS.bars).selectAll('.' + CLASS.bar)
        .data(barData);
    $$.mainBar.enter().append('path')
        .attr("class", classBar)
        .style("stroke", color)
        .style("fill", color);
    $$.mainBar
        .style("opacity", initialOpacity);
    $$.mainBar.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.addTransitionForBar = function (transitions, drawBar) {
    var $$ = this;
    transitions.push($$.mainBar.transition()
                     .attr('d', drawBar)
                     .style("fill", $$.color)
                     .style("opacity", 1));
};
c3_chart_internal_fn.getBarW = function (axis, barTargetsNum) {
    var $$ = this, config = $$.config,
        w = typeof config.bar_width === 'number' ? config.bar_width : barTargetsNum ? (axis.tickOffset() * 2 * config.bar_width_ratio) / barTargetsNum : 0;
    return config.bar_width_max && w > config.bar_width_max ? config.bar_width_max : w;
};
c3_chart_internal_fn.getBars = function (i) {
    var $$ = this;
    return $$.main.selectAll('.' + CLASS.bar + (isValue(i) ? '-' + i : ''));
};
c3_chart_internal_fn.expandBars = function (i) {
    var $$ = this;
    $$.getBars(i).classed(CLASS.EXPANDED, true);
};
c3_chart_internal_fn.unexpandBars = function (i) {
    var $$ = this;
    $$.getBars(i).classed(CLASS.EXPANDED, false);
};
c3_chart_internal_fn.generateDrawBar = function (barIndices, isSub) {
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
c3_chart_internal_fn.generateGetBarPoints = function (barIndices, isSub) {
    var $$ = this,
        barTargetsNum = barIndices.__max__ + 1,
        barW = $$.getBarW($$.xAxis, barTargetsNum),
        barX = $$.getShapeX(barW, barTargetsNum, barIndices, !!isSub),
        barY = $$.getShapeY(!!isSub),
        barOffset = $$.getShapeOffset($$.isBarType, barIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        var y0 = yScale.call($$, d.id)(0),
            offset = barOffset(d, i) || y0, // offset is for stacked bar chart
            posX = barX(d), posY = barY(d);
        // fix posY not to overflow opposite quadrant
        if ($$.config.axis_rotated) {
            if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
        }
        // 4 points that make a bar
        return [
            [posX, offset],
            [posX, posY - (y0 - offset)],
            [posX + barW, posY - (y0 - offset)],
            [posX + barW, offset]
        ];
    };
};
c3_chart_internal_fn.isWithinBar = function (_this) {
    var d3 = this.d3,
        mouse = d3.mouse(_this), box = _this.getBoundingClientRect(),
        seg0 = _this.pathSegList.getItem(0), seg1 = _this.pathSegList.getItem(1),
        x = seg0.x, y = Math.min(seg0.y, seg1.y), w = box.width, h = box.height, offset = 2,
        sx = x - offset, ex = x + w + offset, sy = y + h + offset, ey = y - offset;
    return sx < mouse[0] && mouse[0] < ex && ey < mouse[1] && mouse[1] < sy;
};
