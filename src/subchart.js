c3_chart_internal_fn.initBrush = function () {
    var $$ = this, d3 = $$.d3;
    $$.brush = d3.svg.brush().on("brush", function () { $$.redrawForBrush(); });
    $$.brush.update = function () {
        if ($$.context) { $$.context.select('.' + $$.CLASS[_brush]).call(this); }
        return this;
    };
    $$.brush.scale = function (scale) {
        return $$.config[__axis_rotated] ? this.y(scale) : this.x(scale);
    };
};
c3_chart_internal_fn.initSubchart = function () {
    var $$ = this, config = $$.config,
        context = $$.context = $$.svg.append("g").attr("transform", $$.getTranslate('context'));

    if (!config[__subchart_show]) {
        context.style('visibility', 'hidden');
    }

    // Define g for chart area
    context.append('g')
        .attr("clip-path", $$.clipPath)
        .attr('class', CLASS[_chart]);

    // Define g for bar chart area
    context.select('.' + CLASS[_chart]).append("g")
        .attr("class", CLASS[_chartBars]);

    // Define g for line chart area
    context.select('.' + CLASS[_chart]).append("g")
        .attr("class", CLASS[_chartLines]);

    // Add extent rect for Brush
    context.append("g")
        .attr("clip-path", $$.clipPath)
        .attr("class", CLASS[_brush])
        .call($$.brush)
        .selectAll("rect")
        .attr(config[__axis_rotated] ? "width" : "height", config[__axis_rotated] ? $$.width2 : $$.height2);

    // ATTENTION: This must be called AFTER chart added
    // Add Axis
    $$.axes.subx = context.append("g")
        .attr("class", CLASS[_axisX])
        .attr("transform", $$.getTranslate('subx'))
        .attr("clip-path", config[__axis_rotated] ? "" : $$.clipPathForXAxis);
};
c3_chart_internal_fn.updateTargetsForSubchart = function (targets) {
    var $$ = this, context = $$.context, config = $$.config,
        contextLineEnter, contextLineUpdate, contextBarEnter, contextBarUpdate;

    if (config[__subchart_show]) {

        contextBarUpdate = context.select('.' + CLASS[_chartBars]).selectAll('.' + CLASS[_chartBar])
            .data(targets)
            .attr('class', generateCall($$.classChartBar, $$));
        contextBarEnter = contextBarUpdate.enter().append('g')
            .style('opacity', 0)
            .attr('class', generateCall($$.classChartBar, $$));
        // Bars for each data
        contextBarEnter.append('g')
            .attr("class", generateCall($$.classBars, $$));

        //-- Line --//
        contextLineUpdate = context.select('.' + CLASS[_chartLines]).selectAll('.' + CLASS[_chartLine])
            .data(targets)
            .attr('class', generateCall($$.classChartLine, $$));
        contextLineEnter = contextLineUpdate.enter().append('g')
            .style('opacity', 0)
            .attr('class', generateCall($$.classChartLine, $$));
        // Lines for each data
        contextLineEnter.append("g")
            .attr("class", generateCall($$.classLines, $$));
        // Area
        contextLineEnter.append("g")
            .attr("class", generateCall($$.classAreas, $$));
    }
};
c3_chart_internal_fn.redrawSubchart = function (withSubchart, transitions, duration, durationForExit, areaIndices, barIndices, lineIndices) {
    var $$ = this, d3 = $$.d3, context = $$.context, config = $$.config,
        contextLine,  contextArea, contextBar, drawAreaOnSub, drawBarOnSub, drawLineOnSub;

    // subchart
    if (config[__subchart_show]) {
        // reflect main chart to extent on subchart if zoomed
        if (d3.event && d3.event.type === 'zoom') {
            $$.brush.extent($$.x.orgDomain()).update();
        }
        // update subchart elements if needed
        if (withSubchart) {

            // rotate tick text if needed
            if (!config[__axis_rotated] && config[__axis_x_tick_rotate]) {
                $$.rotateTickText($$.axes.subx, transitions.axisSubX, config[__axis_x_tick_rotate]);
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
            contextBar = context.selectAll('.' + CLASS[_bars]).selectAll('.' + CLASS[_bar])
                .data(generateCall($$.barData, $$));
            contextBar.enter().append('path')
                .attr("class", generateCall($$.classBar, $$))
                .style("stroke", 'none')
                .style("fill", $$.color);
            contextBar
                .style("opacity", generateCall($$.initialOpacity, $$))
                .transition().duration(duration)
                .attr('d', drawBarOnSub)
                .style('opacity', 1);
            contextBar.exit().transition().duration(duration)
                .style('opacity', 0)
                .remove();
            // lines
            contextLine = context.selectAll('.' + CLASS[_lines]).selectAll('.' + CLASS[_line])
                .data(generateCall($$.lineData, $$));
            contextLine.enter().append('path')
                .attr('class', generateCall($$.classLine, $$))
                .style('stroke', $$.color);
            contextLine
                .style("opacity", generateCall($$.initialOpacity, $$))
                .transition().duration(duration)
                .attr("d", drawLineOnSub)
                .style('opacity', 1);
            contextLine.exit().transition().duration(duration)
                .style('opacity', 0)
                .remove();
            // area
            contextArea = context.selectAll('.' + CLASS[_areas]).selectAll('.' + CLASS[_area])
                .data(generateCall($$.lineData, $$));
            contextArea.enter().append('path')
                .attr("class", generateCall($$.classArea, $$))
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
    $$.config[__subchart_onbrush].call($$.api, x.orgDomain());
};
c3_chart_internal_fn.transformContext = function (withTransition, transitions) {
    var $$ = this, subXAxis;
    if (transitions && transitions.axisSubX) {
        subXAxis = transitions.axisSubX;
    } else {
        subXAxis = $$.context.select('.' + CLASS[_axisX]);
        if (withTransition) { subXAxis = subXAxis.transition(); }
    }
    $$.context.attr("transform", $$.getTranslate('context'));
    subXAxis.attr("transform", $$.getTranslate('subx'));
};
