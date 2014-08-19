c3_chart_internal_fn.initBrush = function () {
    var $$ = this, d3 = $$.d3;
    $$.brush = d3.svg.brush().on("brush", function () { $$.redrawForBrush(); });
    $$.brush.update = function () {
        if ($$.context) { $$.context.select('.' + CLASS.brush).call(this); }
        return this;
    };
    $$.brush.scale = function (scale) {
        return $$.config.axis_rotated ? this.y(scale) : this.x(scale);
    };
};
c3_chart_internal_fn.initSubchart = function () {
    var $$ = this, config = $$.config,
        context = $$.context = $$.svg.append("g").attr("transform", $$.getTranslate('context'));

    if (!config.subchart_show) {
        context.style('visibility', 'hidden');
    }

    // Define g for chart area
    context.append('g')
        .attr("clip-path", $$.clipPath)
        .attr('class', CLASS.chart);

    // Define g for bar chart area
    context.select('.' + CLASS.chart).append("g")
        .attr("class", CLASS.chartBars);

    // Define g for line chart area
    context.select('.' + CLASS.chart).append("g")
        .attr("class", CLASS.chartLines);

    // Add extent rect for Brush
    context.append("g")
        .attr("clip-path", $$.clipPath)
        .attr("class", CLASS.brush)
        .call($$.brush)
        .selectAll("rect")
        .attr(config.axis_rotated ? "width" : "height", config.axis_rotated ? $$.width2 : $$.height2);

    // ATTENTION: This must be called AFTER chart added
    // Add Axis
    $$.axes.subx = context.append("g")
        .attr("class", CLASS.axisX)
        .attr("transform", $$.getTranslate('subx'))
        .attr("clip-path", config.axis_rotated ? "" : $$.clipPathForXAxis);
};
c3_chart_internal_fn.updateTargetsForSubchart = function (targets) {
    var $$ = this, context = $$.context, config = $$.config,
        contextLineEnter, contextLineUpdate, contextBarEnter, contextBarUpdate,
        classChartBar = $$.classChartBar.bind($$),
        classBars = $$.classBars.bind($$),
        classChartLine = $$.classChartLine.bind($$),
        classLines = $$.classLines.bind($$),
        classAreas = $$.classAreas.bind($$);

    if (config.subchart_show) {
        contextBarUpdate = context.select('.' + CLASS.chartBars).selectAll('.' + CLASS.chartBar)
            .data(targets)
            .attr('class', classChartBar);
        contextBarEnter = contextBarUpdate.enter().append('g')
            .style('opacity', 0)
            .attr('class', classChartBar);
        // Bars for each data
        contextBarEnter.append('g')
            .attr("class", classBars);

        //-- Line --//
        contextLineUpdate = context.select('.' + CLASS.chartLines).selectAll('.' + CLASS.chartLine)
            .data(targets)
            .attr('class', classChartLine);
        contextLineEnter = contextLineUpdate.enter().append('g')
            .style('opacity', 0)
            .attr('class', classChartLine);
        // Lines for each data
        contextLineEnter.append("g")
            .attr("class", classLines);
        // Area
        contextLineEnter.append("g")
            .attr("class", classAreas);
    }
};
c3_chart_internal_fn.redrawSubchart = function (withSubchart, transitions, duration, durationForExit, areaIndices, barIndices, lineIndices) {
    var $$ = this, d3 = $$.d3, context = $$.context, config = $$.config,
        contextLine,  contextArea, contextBar, drawAreaOnSub, drawBarOnSub, drawLineOnSub,
        barData = $$.barData.bind($$),
        lineData = $$.lineData.bind($$),
        classBar = $$.classBar.bind($$),
        classLine = $$.classLine.bind($$),
        classArea = $$.classArea.bind($$),
        initialOpacity = $$.initialOpacity.bind($$);

    // subchart
    if (config.subchart_show) {
        // reflect main chart to extent on subchart if zoomed
        if (d3.event && d3.event.type === 'zoom') {
            $$.brush.extent($$.x.orgDomain()).update();
        }
        // update subchart elements if needed
        if (withSubchart) {

            // rotate tick text if needed
            if (!config.axis_rotated && config.axis_x_tick_rotate) {
                $$.rotateTickText($$.axes.subx, transitions.axisSubX, config.axis_x_tick_rotate);
            }

            // extent rect
            if (!$$.brush.empty()) {
                $$.brush.extent($$.x.orgDomain()).update();
            }
            // setup drawer - MEMO: this must be called after axis updated
            drawAreaOnSub = $$.generateDrawArea(areaIndices, true);
            drawBarOnSub = $$.generateDrawBar(barIndices, true);
            drawLineOnSub = $$.generateDrawLine(lineIndices, true);
            // bars
            contextBar = context.selectAll('.' + CLASS.bars).selectAll('.' + CLASS.bar)
                .data(barData);
            contextBar.enter().append('path')
                .attr("class", classBar)
                .style("stroke", 'none')
                .style("fill", $$.color);
            contextBar
                .style("opacity", initialOpacity)
                .transition().duration(duration)
                .attr('d', drawBarOnSub)
                .style('opacity', 1);
            contextBar.exit().transition().duration(duration)
                .style('opacity', 0)
                .remove();
            // lines
            contextLine = context.selectAll('.' + CLASS.lines).selectAll('.' + CLASS.line)
                .data(lineData);
            contextLine.enter().append('path')
                .attr('class', classLine)
                .style('stroke', $$.color);
            contextLine
                .style("opacity", initialOpacity)
                .transition().duration(duration)
                .attr("d", drawLineOnSub)
                .style('opacity', 1);
            contextLine.exit().transition().duration(duration)
                .style('opacity', 0)
                .remove();
            // area
            contextArea = context.selectAll('.' + CLASS.areas).selectAll('.' + CLASS.area)
                .data(lineData);
            contextArea.enter().append('path')
                .attr("class", classArea)
                .style("fill", $$.color)
                .style("opacity", function () { $$.orgAreaOpacity = +d3.select(this).style('opacity'); return 0; });
            contextArea
                .style("opacity", 0)
                .transition().duration(duration)
                .attr("d", drawAreaOnSub)
                .style("fill", $$.color)
                .style("opacity", $$.orgAreaOpacity);
            contextArea.exit().transition().duration(durationForExit)
                .style('opacity', 0)
                .remove();
        }
    }
};
c3_chart_internal_fn.redrawForBrush = function () {
    var $$ = this, x = $$.x;
    $$.redraw({
        withTransition: false,
        withY: false,
        withSubchart: false,
        withUpdateXDomain: true
    });
    $$.config.subchart_onbrush.call($$.api, x.orgDomain());
};
c3_chart_internal_fn.transformContext = function (withTransition, transitions) {
    var $$ = this, subXAxis;
    if (transitions && transitions.axisSubX) {
        subXAxis = transitions.axisSubX;
    } else {
        subXAxis = $$.context.select('.' + CLASS.axisX);
        if (withTransition) { subXAxis = subXAxis.transition(); }
    }
    $$.context.attr("transform", $$.getTranslate('context'));
    subXAxis.attr("transform", $$.getTranslate('subx'));
};
