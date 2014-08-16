var c3 = { version: "0.3.0" };

var c3_chart_fn, c3_chart_internal_fn;

function Chart(config) {
    var $$ = this.internal = new ChartInternal(this);
    $$.loadConfig(config);
    $$.init();

    // bind "this" to nested API
    (function bindThis(fn, target, argThis) {
        for (var key in fn) {
            target[key] = fn[key].bind(argThis);
            if (Object.keys(fn[key]).length > 0) {
                bindThis(fn[key], target[key], argThis);
            }
        }
    })(c3_chart_fn, this, this);
}

function ChartInternal(api) {
    var $$ = this;
    $$.d3 = window.d3 ? window.d3 : typeof require !== 'undefined' ? require("d3") : undefined;
    $$.api = api;
    $$.config = $$.getDefaultConfig();
    $$.data = {};
    $$.cache = {};
    $$.axes = {};
}

c3.generate = function (config) {
    return new Chart(config);
};

c3.chart = {
    fn: Chart.prototype,
    internal: {
        fn: ChartInternal.prototype
    }
};
c3_chart_fn = c3.chart.fn;
c3_chart_internal_fn = c3.chart.internal.fn;


c3_chart_internal_fn.init = function () {
    var $$ = this, config = $$.config;

    $$.initParams();

    if (config[__data_url]) {
        $$.convertUrlToData(config[__data_url], config[__data_mimeType], config[__data_keys], $$.initWithData);
    }
    else if (config[__data_json]) {
        $$.initWithData($$.convertJsonToData(config[__data_json], config[__data_keys]));
    }
    else if (config[__data_rows]) {
        $$.initWithData($$.convertRowsToData(config[__data_rows]));
    }
    else if (config[__data_columns]) {
        $$.initWithData($$.convertColumnsToData(config[__data_columns]));
    }
    else {
        throw Error('url or json or rows or columns is required.');
    }
};

c3_chart_internal_fn.initParams = function () {
    var $$ = this, d3 = $$.d3, config = $$.config;

    // MEMO: clipId needs to be unique because it conflicts when multiple charts exist
    $$.clipId = "c3-" + (+new Date()) + '-clip',
    $$.clipIdForXAxis = $$.clipId + '-xaxis',
    $$.clipIdForYAxis = $$.clipId + '-yaxis',
    $$.clipPath = $$.getClipPath($$.clipId),
    $$.clipPathForXAxis = $$.getClipPath($$.clipIdForXAxis),
    $$.clipPathForYAxis = $$.getClipPath($$.clipIdForYAxis);

    $$.dragStart = null;
    $$.dragging = false;
    $$.cancelClick = false;
    $$.mouseover = false;
    $$.transiting = false;

    $$.color = $$.generateColor();
    $$.levelColor = $$.generateLevelColor();

    $$.dataTimeFormat = config[__data_xLocaltime] ? d3.time.format : d3.time.format.utc;
    $$.axisTimeFormat = config[__axis_x_localtime] ? d3.time.format : d3.time.format.utc;
    $$.defaultAxisTimeFormat = $$.axisTimeFormat.multi([
        [".%L", function (d) { return d.getMilliseconds(); }],
        [":%S", function (d) { return d.getSeconds(); }],
        ["%I:%M", function (d) { return d.getMinutes(); }],
        ["%I %p", function (d) { return d.getHours(); }],
        ["%-m/%-d", function (d) { return d.getDay() && d.getDate() !== 1; }],
        ["%-m/%-d", function (d) { return d.getDate() !== 1; }],
        ["%-m/%-d", function (d) { return d.getMonth(); }],
        ["%Y/%-m/%-d", function () { return true; }]
    ]);

    $$.hiddenTargetIds = [];
    $$.hiddenLegendIds = [];

    $$.xOrient = config[__axis_rotated] ? "left" : "bottom";
    $$.yOrient = config[__axis_rotated] ? "bottom" : "left";
    $$.y2Orient = config[__axis_rotated] ? "top" : "right";
    $$.subXOrient = config[__axis_rotated] ? "left" : "bottom";

    $$.isLegendRight = config[__legend_position] === 'right';
    $$.isLegendInset = config[__legend_position] === 'inset';
    $$.isLegendTop = config[__legend_inset_anchor] === 'top-left' || config[__legend_inset_anchor] === 'top-right';
    $$.isLegendLeft = config[__legend_inset_anchor] === 'top-left' || config[__legend_inset_anchor] === 'bottom-left';
    $$.legendStep = 0;
    $$.legendItemWidth = 0;
    $$.legendItemHeight = 0;
    $$.legendOpacityForHidden = 0.15;

    $$.currentMaxTickWidth = 0;

    $$.rotated_padding_left = 30;
    $$.rotated_padding_right = config[__axis_rotated] && !config[__axis_x_show] ? 0 : 30;
    $$.rotated_padding_top = 5;

    $$.withoutFadeIn = {};

    $$.axes.subx = d3.selectAll([]); // needs when excluding subchart.js
};

c3_chart_internal_fn.initWithData = function (data) {
    var $$ = this, d3 = $$.d3, config = $$.config;
    var main, eventRect, binding = true;

    if ($$.initPie) { $$.initPie(); }
    if ($$.initBrush) { $$.initBrush(); }
    if ($$.initZoom) { $$.initZoom(); }

    $$.selectChart = d3.select(config[__bindto]);
    if ($$.selectChart.empty()) {
        $$.selectChart = d3.select(document.createElement('div')).style('opacity', 0);
        $$.observeInserted($$.selectChart);
        binding = false;
    }
    $$.selectChart.html("").classed("c3", true);

    // Init data as targets
    $$.data.xs = {};
    $$.data.targets = $$.convertDataToTargets(data);

    if (config[__data_filter]) {
        $$.data.targets = $$.data.targets.filter(config[__data_filter]);
    }

    // Set targets to hide if needed
    if (config[__data_hide]) {
        $$.addHiddenTargetIds(config[__data_hide] === true ? $$.mapToIds($$.data.targets) : config[__data_hide]);
    }

    // when gauge, hide legend // TODO: fix
    if ($$.hasType('gauge')) {
        config[__legend_show] = false;
    }

    // Init sizes and scales
    $$.updateSizes();
    $$.updateScales();

    // Set domains for each scale
    $$.x.domain(d3.extent($$.getXDomain($$.data.targets)));
    $$.y.domain($$.getYDomain($$.data.targets, 'y'));
    $$.y2.domain($$.getYDomain($$.data.targets, 'y2'));
    $$.subX.domain($$.x.domain());
    $$.subY.domain($$.y.domain());
    $$.subY2.domain($$.y2.domain());

    // Save original x domain for zoom update
    $$.orgXDomain = $$.x.domain();

    // Set initialized scales to brush and zoom
    if ($$.brush) { $$.brush.scale($$.subX); }
    if (config[__zoom_enabled]) { $$.zoom.scale($$.x); }

    /*-- Basic Elements --*/

    // Define svgs
    $$.svg = $$.selectChart.append("svg")
        .style("overflow", "hidden")
        .on('mouseenter', function () { return config[__onmouseover].call($$); })
        .on('mouseleave', function () { return config[__onmouseout].call($$); });

    // Define defs
    $$.defs = $$.svg.append("defs");
    $$.defs.append("clipPath").attr("id", $$.clipId).append("rect");
    $$.defs.append("clipPath").attr("id", $$.clipIdForXAxis).append("rect");
    $$.defs.append("clipPath").attr("id", $$.clipIdForYAxis).append("rect");
    $$.updateSvgSize();

    // Define regions
    main = $$.main = $$.svg.append("g").attr("transform", $$.getTranslate('main'));

    if ($$.initSubchart) { $$.initSubchart(); }
    if ($$.initTooltip) { $$.initTooltip(); }
    if ($$.initLegend) { $$.initLegend(); }

    /*-- Main Region --*/

    // text when empty
    main.append("text")
        .attr("class", CLASS[_text] + ' ' + CLASS[_empty])
        .attr("text-anchor", "middle") // horizontal centering of text at x position in all browsers.
        .attr("dominant-baseline", "middle"); // vertical centering of text at y position in all browsers, except IE.

    // Regions
    $$.initRegion();

    // Grids
    $$.initGrid();

    // Define g for chart area
    main.append('g')
        .attr("clip-path", $$.clipPath)
        .attr('class', CLASS[_chart]);

    // Cover whole with rects for events
    eventRect = main.select('.' + CLASS[_chart]).append("g")
        .attr("class", CLASS[_eventRects])
        .style('fill-opacity', 0);

    // Define g for bar chart area
    main.select('.' + CLASS[_chart]).append("g")
        .attr("class", CLASS[_chartBars]);

    // Define g for line chart area
    main.select('.' + CLASS[_chart]).append("g")
        .attr("class", CLASS[_chartLines]);

    // Define g for arc chart area
    if ($$.initArc) { $$.initArc(); }
    if ($$.initGauge) { $$.initGauge(); }

    main.select('.' + CLASS[_chart]).append("g")
        .attr("class", CLASS[_chartTexts]);

    // if zoom privileged, insert rect to forefront
    // TODO: is this needed?
    main.insert('rect', config[__zoom_privileged] ? null : 'g.' + CLASS[_regions])
        .attr('class', CLASS[_zoomRect])
        .attr('width', $$.width)
        .attr('height', $$.height)
        .style('opacity', 0)
        .on("dblclick.zoom", null);

    // Set default extent if defined
    if (config[__axis_x_default]) {
        $$.brush.extent(isFunction(config[__axis_x_default]) ? config[__axis_x_default]($$.getXDomain()) : config[__axis_x_default]);
    }

    // Add Axis
    $$.initAxis();

    // Set targets
    $$.updateTargets($$.data.targets);

    // Draw with targets
    if (binding) {
        $$.updateDimension();
        $$.redraw({
            withTransform: true,
            withUpdateXDomain: true,
            withUpdateOrgXDomain: true,
            withTransitionForAxis: false
        });
    }

    // Bind resize event
    if (window.onresize == null) {
        window.onresize = $$.generateResize();
    }
    if (window.onresize.add) {
        window.onresize.add(function () {
            config[__onresize].call($$);
        });
        window.onresize.add(function () {
            $$.api.flush();
        });
        window.onresize.add(function () {
            config[__onresized].call($$);
        });
    }

    // export element of the chart
    $$.api.element = $$.selectChart.node();
};

c3_chart_internal_fn.smoothLines = function (el, type) {
    var $$ = this;
    if (type === 'grid') {
        el.each(function () {
            var g = $$.d3.select(this),
                x1 = g.attr('x1'),
                x2 = g.attr('x2'),
                y1 = g.attr('y1'),
                y2 = g.attr('y2');
            g.attr({
                'x1': Math.ceil(x1),
                'x2': Math.ceil(x2),
                'y1': Math.ceil(y1),
                'y2': Math.ceil(y2)
            });
        });
    }
};


c3_chart_internal_fn.updateSizes = function () {
    var $$ = this, config = $$.config;
    var legendHeight = $$.legend ? $$.getLegendHeight() : 0,
        legendWidth = $$.legend ? $$.getLegendWidth() : 0,
        legendHeightForBottom = $$.isLegendRight || $$.isLegendInset ? 0 : legendHeight,
        hasArc = $$.hasArcType(),
        xAxisHeight = config[__axis_rotated] || hasArc ? 0 : $$.getHorizontalAxisHeight('x'),
        subchartHeight = config[__subchart_show] && !hasArc ? (config[__subchart_size_height] + xAxisHeight) : 0;

    $$.currentWidth = $$.getCurrentWidth();
    $$.currentHeight = $$.getCurrentHeight();

    // for main, context
    if (config[__axis_rotated]) {
        $$.margin = {
            top: $$.getHorizontalAxisHeight('y2') + $$.getCurrentPaddingTop(),
            right: hasArc ? 0 : $$.getCurrentPaddingRight(),
            bottom: $$.getHorizontalAxisHeight('y') + legendHeightForBottom + $$.getCurrentPaddingBottom(),
            left: subchartHeight + (hasArc ? 0 : $$.getCurrentPaddingLeft())
        };
        $$.margin2 = {
            top: $$.margin.top,
            right: NaN,
            bottom: 20 + legendHeightForBottom,
            left: $$.rotated_padding_left
        };
    } else {
        $$.margin = {
            top: 4 + $$.getCurrentPaddingTop(), // for top tick text
            right: hasArc ? 0 : $$.getCurrentPaddingRight(),
            bottom: xAxisHeight + subchartHeight + legendHeightForBottom + $$.getCurrentPaddingBottom(),
            left: hasArc ? 0 : $$.getCurrentPaddingLeft()
        };
        $$.margin2 = {
            top: $$.currentHeight - subchartHeight - legendHeightForBottom,
            right: NaN,
            bottom: xAxisHeight + legendHeightForBottom,
            left: $$.margin.left
        };
    }

    // for legend
    if ($$.updateSizeForLegend) { $$.updateSizeForLegend(legendHeight, legendWidth); }

    $$.width = $$.currentWidth - $$.margin.left - $$.margin.right;
    $$.height = $$.currentHeight - $$.margin.top - $$.margin.bottom;
    if ($$.width < 0) { $$.width = 0; }
    if ($$.height < 0) { $$.height = 0; }

    $$.width2 = config[__axis_rotated] ? $$.margin.left - $$.rotated_padding_left - $$.rotated_padding_right : $$.width;
    $$.height2 = config[__axis_rotated] ? $$.height : $$.currentHeight - $$.margin2.top - $$.margin2.bottom;
    if ($$.width2 < 0) { $$.width2 = 0; }
    if ($$.height2 < 0) { $$.height2 = 0; }

    // for arc
    $$.arcWidth = $$.width - ($$.isLegendRight ? legendWidth + 10 : 0);
    $$.arcHeight = $$.height - ($$.isLegendRight ? 0 : 10);
    if ($$.updateRadius) { $$.updateRadius(); }

    if ($$.isLegendRight && hasArc) {
        $$.margin3.left = $$.arcWidth / 2 + $$.radiusExpanded * 1.1;
    }
};

c3_chart_internal_fn.updateTargets = function (targets) {
    var mainLineEnter, mainLineUpdate, mainBarEnter, mainBarUpdate, mainTextUpdate, mainTextEnter;
    var $$ = this, config = $$.config, main = $$.main;

    /*-- Main --*/

    //-- Text --//
    mainTextUpdate = main.select('.' + CLASS[_chartTexts]).selectAll('.' + CLASS[_chartText])
        .data(targets)
        .attr('class', generateCall($$.classChartText, $$));
    mainTextEnter = mainTextUpdate.enter().append('g')
        .attr('class', generateCall($$.classChartText, $$))
        .style('opacity', 0)
        .style("pointer-events", "none");
    mainTextEnter.append('g')
        .attr('class', generateCall($$.classTexts, $$));

    //-- Bar --//
    mainBarUpdate = main.select('.' + CLASS[_chartBars]).selectAll('.' + CLASS[_chartBar])
        .data(targets)
        .attr('class', generateCall($$.classChartBar, $$));
    mainBarEnter = mainBarUpdate.enter().append('g')
        .attr('class', generateCall($$.classChartBar, $$))
        .style('opacity', 0)
        .style("pointer-events", "none");
    // Bars for each data
    mainBarEnter.append('g')
        .attr("class", generateCall($$.classBars, $$))
        .style("cursor", function (d) { return config[__data_selection_isselectable](d) ? "pointer" : null; });

    //-- Line --//
    mainLineUpdate = main.select('.' + CLASS[_chartLines]).selectAll('.' + CLASS[_chartLine])
        .data(targets)
        .attr('class', generateCall($$.classChartLine, $$));
    mainLineEnter = mainLineUpdate.enter().append('g')
        .attr('class', generateCall($$.classChartLine, $$))
        .style('opacity', 0)
        .style("pointer-events", "none");
    // Lines for each data
    mainLineEnter.append('g')
        .attr("class", generateCall($$.classLines, $$));
    // Areas
    mainLineEnter.append('g')
        .attr('class', generateCall($$.classAreas, $$));
    // Circles for each data point on lines
    mainLineEnter.append('g')
        .attr("class", function (d) { return $$.generateClass(CLASS[_selectedCircles], d.id); });
    mainLineEnter.append('g')
        .attr("class", generateCall($$.classCircles, $$))
        .style("cursor", function (d) { return config[__data_selection_isselectable](d) ? "pointer" : null; });
    // Update date for selected circles
    targets.forEach(function (t) {
        main.selectAll('.' + CLASS[_selectedCircles] + $$.getTargetSelectorSuffix(t.id)).selectAll('.' + CLASS[_selectedCircle]).each(function (d) {
            d.value = t.values[d.index].value;
        });
    });
    // MEMO: can not keep same color...
    //mainLineUpdate.exit().remove();

    if ($$.updateTargetsForArc) { $$.updateTargetsForArc(targets); }
    if ($$.updateTargetsForSubchart) { $$.updateTargetsForSubchart(targets); }

    /*-- Show --*/

    // Fade-in each chart
    $$.svg.selectAll('.' + CLASS[_target]).filter(function (d) { return $$.isTargetToShow(d.id); })
      .transition().duration(config[__transition_duration])
        .style("opacity", 1);
};

c3_chart_internal_fn.redraw = function (options, transitions) {
    var $$ = this, main = $$.main, d3 = $$.d3, config = $$.config;
    var mainLine, mainArea, mainCircle, mainBar, mainText, eventRect, eventRectUpdate;
    var areaIndices = $$.getShapeIndices($$.isAreaType), barIndices = $$.getShapeIndices($$.isBarType), lineIndices = $$.getShapeIndices($$.isLineType), maxDataCountTarget;
    var rectX, rectW;
    var withY, withSubchart, withTransition, withTransitionForExit, withTransitionForAxis, withTransform, withUpdateXDomain, withUpdateOrgXDomain, withLegend;
    var hideAxis = $$.hasArcType();
    var drawArea, drawBar, drawLine, xForText, yForText;
    var duration, durationForExit, durationForAxis, waitForDraw;
    var targetsToShow = $$.filterTargetsToShow($$.data.targets), tickValues, i, intervalForCulling;
    var xv = generateCall($$.xv, $$),
        cx = generateCall($$.config[__axis_rotated] ? $$.circleY : $$.circleX, $$),
        cy = generateCall($$.config[__axis_rotated] ? $$.circleX : $$.circleY, $$);

    mainCircle = mainText = d3.selectAll([]);

    options = options || {};
    withY = getOption(options, "withY", true);
    withSubchart = getOption(options, "withSubchart", true);
    withTransition = getOption(options, "withTransition", true);
    withTransform = getOption(options, "withTransform", false);
    withUpdateXDomain = getOption(options, "withUpdateXDomain", false);
    withUpdateOrgXDomain = getOption(options, "withUpdateOrgXDomain", false);
    withLegend = getOption(options, "withLegend", false);
    withTransitionForExit = getOption(options, "withTransitionForExit", withTransition);
    withTransitionForAxis = getOption(options, "withTransitionForAxis", withTransition);

    duration = withTransition ? config[__transition_duration] : 0;
    durationForExit = withTransitionForExit ? duration : 0;
    durationForAxis = withTransitionForAxis ? duration : 0;

    transitions = transitions || $$.generateAxisTransitions(durationForAxis);

    // update legend and transform each g
    if (withLegend && config[__legend_show]) {
        $$.updateLegend($$.mapToIds($$.data.targets), options, transitions);
    }

    // MEMO: needed for grids calculation
    if ($$.isCategorized() && targetsToShow.length === 0) {
        $$.x.domain([0, $$.axes.x.selectAll('.tick').size()]);
    }

    if (targetsToShow.length) {
        $$.updateXDomain(targetsToShow, withUpdateXDomain, withUpdateOrgXDomain);
        // update axis tick values according to options
        if (!config[__axis_x_tick_values] && (config[__axis_x_tick_fit] || config[__axis_x_tick_count])) {
            tickValues = $$.generateTickValues($$.mapTargetsToUniqueXs(targetsToShow), config[__axis_x_tick_count]);
            $$.xAxis.tickValues(tickValues);
            $$.subXAxis.tickValues(tickValues);
        }
    } else {
        $$.xAxis.tickValues([]);
        $$.subXAxis.tickValues([]);
    }

    $$.y.domain($$.getYDomain(targetsToShow, 'y'));
    $$.y2.domain($$.getYDomain(targetsToShow, 'y2'));

    // axes
    $$.redrawAxis(transitions, hideAxis);

    // Update axis label
    $$.updateAxisLabels(withTransition);

    // show/hide if manual culling needed
    if (withUpdateXDomain && targetsToShow.length) {
        if (config[__axis_x_tick_culling] && tickValues) {
            for (i = 1; i < tickValues.length; i++) {
                if (tickValues.length / i < config[__axis_x_tick_culling_max]) {
                    intervalForCulling = i;
                    break;
                }
            }
            $$.svg.selectAll('.' + CLASS[_axisX] + ' .tick text').each(function (e) {
                var index = tickValues.indexOf(e);
                if (index >= 0) {
                    d3.select(this).style('display', index % intervalForCulling ? 'none' : 'block');
                }
            });
        } else {
            $$.svg.selectAll('.' + CLASS[_axisX] + ' .tick text').style('display', 'block');
        }
    }

    // rotate tick text if needed
    if (!config[__axis_rotated] && config[__axis_x_tick_rotate]) {
        $$.rotateTickText($$.axes.x, transitions.axisX, config[__axis_x_tick_rotate]);
    }

    // setup drawer - MEMO: these must be called after axis updated
    drawArea = $$.generateDrawArea(areaIndices, false);
    drawBar = $$.generateDrawBar(barIndices);
    drawLine = $$.generateDrawLine(lineIndices, false);
    xForText = $$.generateXYForText(barIndices, true);
    yForText = $$.generateXYForText(barIndices, false);

    // Update sub domain
    $$.subY.domain($$.y.domain());
    $$.subY2.domain($$.y2.domain());

    // tooltip
    $$.tooltip.style("display", "none");

    // xgrid focus
    $$.updateXgridFocus();

    // Data empty label positioning and text.
    main.select("text." + CLASS[_text] + '.' + CLASS[_empty])
        .attr("x", $$.width / 2)
        .attr("y", $$.height / 2)
        .text(config[__data_empty_label_text])
      .transition()
        .style('opacity', targetsToShow.length ? 0 : 1);

    // grid
    $$.redrawGrid(duration, withY);

    // rect for regions
    $$.redrawRegion(duration);

    // bars
    mainBar = main.selectAll('.' + CLASS[_bars]).selectAll('.' + CLASS[_bar])
        .data(generateCall($$.barData, $$));
    mainBar.enter().append('path')
        .attr("class", generateCall($$.classBar, $$))
        .style("stroke", function (d) { return $$.color(d.id); })
        .style("fill", function (d) { return $$.color(d.id); });
    mainBar
        .style("opacity", generateCall($$.initialOpacity, $$));
    mainBar.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();

    // lines, areas and cricles
    mainLine = main.selectAll('.' + CLASS[_lines]).selectAll('.' + CLASS[_line])
        .data(generateCall($$.lineData, $$));
    mainLine.enter().append('path')
        .attr('class', generateCall($$.classLine, $$))
        .style("stroke", $$.color);
    mainLine
        .style("opacity", generateCall($$.initialOpacity, $$))
        .attr('transform', null);
    mainLine.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();

    mainArea = main.selectAll('.' + CLASS[_areas]).selectAll('.' + CLASS[_area])
        .data(generateCall($$.lineData, $$));
    mainArea.enter().append('path')
        .attr("class", generateCall($$.classArea, $$))
        .style("fill", $$.color)
        .style("opacity", function () { $$.orgAreaOpacity = +d3.select(this).style('opacity'); return 0; });
    mainArea
        .style("opacity", $$.orgAreaOpacity);
    mainArea.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();

    if (config[__point_show]) {
        mainCircle = main.selectAll('.' + CLASS[_circles]).selectAll('.' + CLASS[_circle])
            .data(generateCall($$.lineOrScatterData, $$));
        mainCircle.enter().append("circle")
            .attr("class", generateCall($$.classCircle, $$))
            .attr("r", generateCall($$.pointR, $$))
            .style("fill", $$.color);
        mainCircle
            .style("opacity", generateCall($$.initialOpacity, $$));
        mainCircle.exit().remove();
    }

    if ($$.hasDataLabel()) {
        mainText = main.selectAll('.' + CLASS[_texts]).selectAll('.' + CLASS[_text])
            .data(generateCall($$.barOrLineData, $$));
        mainText.enter().append('text')
            .attr("class", generateCall($$.classText, $$))
            .attr('text-anchor', function (d) { return config[__axis_rotated] ? (d.value < 0 ? 'end' : 'start') : 'middle'; })
            .style("stroke", 'none')
            .style("fill", function (d) { return $$.color(d); })
            .style("fill-opacity", 0);
        mainText
            .text(function (d) { return $$.formatByAxisId($$.getAxisId(d.id))(d.value, d.id); });
        mainText.exit()
            .transition().duration(durationForExit)
            .style('fill-opacity', 0)
            .remove();
    }

    // arc
    if ($$.redrawArc) { $$.redrawArc(duration, durationForExit, withTransform); }

    // subchart
    if ($$.redrawSubchart) {
        $$.redrawSubchart(withSubchart, transitions, duration, durationForExit, areaIndices, barIndices, lineIndices);
    }

    // circles for select
    main.selectAll('.' + CLASS[_selectedCircles])
        .filter(generateCall($$.isBarType, $$))
        .selectAll('circle')
        .remove();

    if (config[__interaction_enabled]) {
        // rect for mouseover
        eventRect = main.select('.' + CLASS[_eventRects])
            .style('cursor', config[__zoom_enabled] ? config[__axis_rotated] ? 'ns-resize' : 'ew-resize' : null);
        if (notEmpty(config[__data_xs]) && !$$.isSingleX(config[__data_xs])) {

            if (!eventRect.classed(CLASS[_eventRectsMultiple])) {
                eventRect.classed(CLASS[_eventRectsMultiple], true).classed(CLASS[_eventRectsSingle], false)
                    .selectAll('.' + CLASS[_eventRect]).remove();
            }

            eventRectUpdate = main.select('.' + CLASS[_eventRects]).selectAll('.' + CLASS[_eventRect])
                .data([0]);
            // enter : only one rect will be added
            $$.generateEventRectsForMultipleXs(eventRectUpdate.enter());
            // update
            eventRectUpdate
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', $$.width)
                .attr('height', $$.height);
            // exit : not needed because always only one rect exists
        } else {

            if (!eventRect.classed(CLASS[_eventRectsSingle])) {
                eventRect.classed(CLASS[_eventRectsMultiple], false).classed(CLASS[_eventRectsSingle], true)
                    .selectAll('.' + CLASS[_eventRect]).remove();
            }

            if (($$.isCustomX() || $$.isTimeSeries()) && !$$.isCategorized()) {
                rectW = function (d) {
                    var prevX = $$.getPrevX(d.index), nextX = $$.getNextX(d.index), dx = $$.data.xs[d.id][d.index],
                        w = ($$.x(nextX ? nextX : dx) - $$.x(prevX ? prevX : dx)) / 2;
                    return w < 0 ? 0 : w;
                };
                rectX = function (d) {
                    var prevX = $$.getPrevX(d.index), dx = $$.data.xs[d.id][d.index];
                    return ($$.x(dx) + $$.x(prevX ? prevX : dx)) / 2;
                };
            } else {
                rectW = $$.getEventRectWidth();
                rectX = function (d) {
                    return $$.x(d.x) - (rectW / 2);
                };
            }
            // Set data
            maxDataCountTarget = $$.getMaxDataCountTarget($$.data.targets);
            main.select('.' + CLASS[_eventRects])
                .datum(maxDataCountTarget ? maxDataCountTarget.values : []);
            // Update rects
            eventRectUpdate = main.select('.' + CLASS[_eventRects]).selectAll('.' + CLASS[_eventRect])
                .data(function (d) { return d; });
            // enter
            $$.generateEventRectsForSingleX(eventRectUpdate.enter());
            // update
            eventRectUpdate
                .attr('class', generateCall($$.classEvent, $$))
                .attr("x", config[__axis_rotated] ? 0 : rectX)
                .attr("y", config[__axis_rotated] ? rectX : 0)
                .attr("width", config[__axis_rotated] ? $$.width : rectW)
                .attr("height", config[__axis_rotated] ? rectW : $$.height);
            // exit
            eventRectUpdate.exit().remove();
        }
    }

    // transition should be derived from one transition
    d3.transition().duration(duration).each(function () {
        var transitions = [];

        transitions.push(mainBar.transition()
                         .attr('d', drawBar)
                         .style("fill", $$.color)
                         .style("opacity", 1));
        transitions.push(mainLine.transition()
                         .attr("d", drawLine)
                         .style("stroke", $$.color)
                         .style("opacity", 1));
        transitions.push(mainArea.transition()
                         .attr("d", drawArea)
                         .style("fill", $$.color)
                         .style("opacity", $$.orgAreaOpacity));
        transitions.push(mainCircle.transition()
                         .style('opacity', generateCall($$.opacityForCircle, $$))
                         .style("fill", $$.color)
                         .attr("cx", cx)
                         .attr("cy", cy));
        transitions.push(main.selectAll('.' + CLASS[_selectedCircle]).transition()
                         .attr("cx", cx)
                         .attr("cy", cy));
        transitions.push(mainText.transition()
                         .attr('x', xForText)
                         .attr('y', yForText)
                         .style("fill", $$.color)
                         .style("fill-opacity", options.flow ? 0 : generateCall($$.opacityForText, $$)));
        $$.addTransitionForRegion(transitions);
        $$.addTransitionForGrid(transitions);

        // Wait for end of transitions if called from flow API
        if (options.flow) {
            waitForDraw = $$.generateWait();
            transitions.forEach(function (t) {
                waitForDraw.add(t);
            });
        }
    })
    .call(waitForDraw ? waitForDraw : function () {}, function () { // only for flow
        var translateX, scaleX = 1, transform,
            flowIndex = options.flow.index,
            flowLength = options.flow.length,
            flowStart = $$.getValueOnIndex($$.data.targets[0].values, flowIndex),
            flowEnd = $$.getValueOnIndex($$.data.targets[0].values, flowIndex + flowLength),
            orgDomain = $$.x.domain(), domain,
            durationForFlow = options.flow.duration || duration,
            done = options.flow.done || function () {},
            wait = $$.generateWait();

        var xgrid = $$.xgrid || d3.selectAll([]),
            xgridLines = $$.xgridLines || d3.selectAll([]),
            mainRegion = $$.mainRegion || d3.selectAll([]);

        // remove head data after rendered
        $$.data.targets.forEach(function (d) {
            d.values.splice(0, flowLength);
        });

        // update x domain to generate axis elements for flow
        domain = $$.updateXDomain(targetsToShow, true, true);
        // update elements related to x scale
        if ($$.updateXGrid) { $$.updateXGrid(true); }

        // generate transform to flow
        if (!options.flow.orgDataCount) { // if empty
            if ($$.data.targets[0].values.length !== 1) {
                translateX = $$.x(orgDomain[0]) - $$.x(domain[0]);
            } else {
                if ($$.isTimeSeries()) {
                    flowStart = $$.getValueOnIndex($$.data.targets[0].values, 0);
                    flowEnd = $$.getValueOnIndex($$.data.targets[0].values, $$.data.targets[0].values.length - 1);
                    translateX = $$.x(flowStart.x) - $$.x(flowEnd.x);
                } else {
                    translateX = diffDomain(domain) / 2;
                }
            }
        } else if (options.flow.orgDataCount === 1 || flowStart.x === flowEnd.x) {
            translateX = $$.x(orgDomain[0]) - $$.x(domain[0]);
        } else {
            if ($$.isTimeSeries()) {
                translateX = ($$.x(orgDomain[0]) - $$.x(domain[0]));
            } else {
                translateX = ($$.x(flowStart.x) - $$.x(flowEnd.x));
            }
        }
        scaleX = (diffDomain(orgDomain) / diffDomain(domain));
        transform = 'translate(' + translateX + ',0) scale(' + scaleX + ',1)';

        d3.transition().ease('linear').duration(durationForFlow).each(function () {
            wait.add($$.axes.x.transition().call($$.xAxis));
            wait.add(mainBar.transition().attr('transform', transform));
            wait.add(mainLine.transition().attr('transform', transform));
            wait.add(mainArea.transition().attr('transform', transform));
            wait.add(mainCircle.transition().attr('transform', transform));
            wait.add(mainText.transition().attr('transform', transform));
            wait.add(mainRegion.filter($$.isRegionOnX).transition().attr('transform', transform));
            wait.add(xgrid.transition().attr('transform', transform));
            wait.add(xgridLines.transition().attr('transform', transform));
        })
        .call(wait, function () {
            var i, shapes = [], texts = [], eventRects = [];

            // remove flowed elements
            if (flowLength) {
                for (i = 0; i < flowLength; i++) {
                    shapes.push('.' + CLASS[_shape] + '-' + (flowIndex + i));
                    texts.push('.' + CLASS[_text] + '-' + (flowIndex + i));
                    eventRects.push('.' + CLASS[_eventRect] + '-' + (flowIndex + i));
                }
                $$.svg.selectAll('.' + CLASS[_shapes]).selectAll(shapes).remove();
                $$.svg.selectAll('.' + CLASS[_texts]).selectAll(texts).remove();
                $$.svg.selectAll('.' + CLASS[_eventRects]).selectAll(eventRects).remove();
                $$.svg.select('.' + CLASS[_xgrid]).remove();
            }

            // draw again for removing flowed elements and reverting attr
            xgrid
                .attr('transform', null)
                .attr($$.xgridAttr);
            xgridLines
                .attr('transform', null);
            xgridLines.select('line')
                .attr("x1", config[__axis_rotated] ? 0 : xv)
                .attr("x2", config[__axis_rotated] ? $$.width : xv);
            xgridLines.select('text')
                .attr("x", config[__axis_rotated] ? $$.width : 0)
                .attr("y", xv);
            mainBar
                .attr('transform', null)
                .attr("d", drawBar);
            mainLine
                .attr('transform', null)
                .attr("d", drawLine);
            mainArea
                .attr('transform', null)
                .attr("d", drawArea);
            mainCircle
                .attr('transform', null)
                .attr("cx", cx)
                .attr("cy", cy);
            mainText
                .attr('transform', null)
                .attr('x', xForText)
                .attr('y', yForText)
                .style('fill-opacity', generateCall($$.opacityForText, $$));
            mainRegion
                .attr('transform', null);
            mainRegion.select('rect').filter($$.isRegionOnX)
                .attr("x", generateCall($$.regionX, $$))
                .attr("width", generateCall($$.regionWidth, $$));
            eventRectUpdate
                .attr("x", config[__axis_rotated] ? 0 : rectX)
                .attr("y", config[__axis_rotated] ? rectX : 0)
                .attr("width", config[__axis_rotated] ? $$.width : rectW)
                .attr("height", config[__axis_rotated] ? rectW : $$.height);

            // callback for end of flow
            done();
        });
    });

    // update fadein condition
    $$.mapToIds($$.data.targets).forEach(function (id) {
        $$.withoutFadeIn[id] = true;
    });

    if ($$.updateZoom) { $$.updateZoom(); }
};

c3_chart_internal_fn.updateAndRedraw = function (options) {
    var $$ = this, config = $$.config, transitions;
    options = options || {};
    // same with redraw
    options.withTransition = getOption(options, "withTransition", true);
    options.withTransform = getOption(options, "withTransform", false);
    options.withLegend = getOption(options, "withLegend", false);
    // NOT same with redraw
    options.withUpdateXDomain = true;
    options.withUpdateOrgXDomain = true;
    options.withTransitionForExit = false;
    options.withTransitionForTransform = getOption(options, "withTransitionForTransform", options.withTransition);
    // MEMO: this needs to be called before updateLegend and it means this ALWAYS needs to be called)
    $$.updateSizes();
    // MEMO: called in updateLegend in redraw if withLegend
    if (!(options.withLegend && config[__legend_show])) {
        transitions = $$.generateAxisTransitions(options.withTransitionForAxis ? config[__transition_duration] : 0);
        // Update scales
        $$.updateScales();
        $$.updateSvgSize();
        // Update g positions
        $$.transformAll(options.withTransitionForTransform, transitions);
    }
    // Draw with new sizes & scales
    $$.redraw(options, transitions);
};

c3_chart_internal_fn.generateEventRectsForSingleX = function (eventRectEnter) {
    var $$ = this, d3 = $$.d3, config = $$.config;
    eventRectEnter.append("rect")
        .attr("class", generateCall($$.classEvent, $$))
        .style("cursor", config[__data_selection_enabled] && config[__data_selection_grouped] ? "pointer" : null)
        .on('mouseover', function (d) {
            var index = d.index, selectedData, newData;

            if ($$.dragging) { return; } // do nothing if dragging
            if ($$.hasArcType()) { return; }

            selectedData = $$.data.targets.map(function (t) {
                return $$.addName($$.getValueOnIndex(t.values, index));
            });

            // Sort selectedData as names order
            newData = [];
            Object.keys(config[__data_names]).forEach(function (id) {
                for (var j = 0; j < selectedData.length; j++) {
                    if (selectedData[j] && selectedData[j].id === id) {
                        newData.push(selectedData[j]);
                        selectedData.shift(j);
                        break;
                    }
                }
            });
            selectedData = newData.concat(selectedData); // Add remained

            // Expand shapes for selection
            if (config[__point_focus_expand_enabled]) { $$.expandCircles(index); }
            $$.expandBars(index);

            // Call event handler
            $$.main.selectAll('.' + CLASS[_shape] + '-' + index).each(function (d) {
                config[__data_onmouseover].call(c3, d);
            });
        })
        .on('mouseout', function (d) {
            var index = d.index;
            if ($$.hasArcType()) { return; }
            $$.hideXGridFocus();
            $$.hideTooltip();
            // Undo expanded shapes
            $$.unexpandCircles(index);
            $$.unexpandBars();
            // Call event handler
            $$.main.selectAll('.' + CLASS[_shape] + '-' + index).each(function (d) {
                config[__data_onmouseout].call($$, d);
            });
        })
        .on('mousemove', function (d) {
            var selectedData, index = d.index,
                eventRect = $$.svg.select('.' + CLASS[_eventRect] + '-' + index);

            if ($$.dragging) { return; } // do nothing when dragging
            if ($$.hasArcType()) { return; }

            // Show tooltip
            selectedData = $$.filterTargetsToShow($$.data.targets).map(function (t) {
                return $$.addName($$.getValueOnIndex(t.values, index));
            });

            if (config[__tooltip_grouped]) {
                $$.showTooltip(selectedData, d3.mouse(this));
                $$.showXGridFocus(selectedData);
            }

            if (config[__tooltip_grouped] && (!config[__data_selection_enabled] || config[__data_selection_grouped])) {
                return;
            }

            $$.main.selectAll('.' + CLASS[_shape] + '-' + index)
                .each(function () {
                    d3.select(this).classed(CLASS[_EXPANDED], true);
                    if (config[__data_selection_enabled]) {
                        eventRect.style('cursor', config[__data_selection_grouped] ? 'pointer' : null);
                    }
                    if (!config[__tooltip_grouped]) {
                        $$.hideXGridFocus();
                        $$.hideTooltip();
                        if (!config[__data_selection_grouped]) {
                            $$.unexpandCircles(index);
                            $$.unexpandBars();
                        }
                    }
                })
                .filter(function (d) {
                    if (this.nodeName === 'circle') {
                        return $$.isWithinCircle(this, $$.pointSelectR(d));
                    }
                    else if (this.nodeName === 'path') {
                        return $$.isWithinBar(this);
                    }
                })
                .each(function (d) {
                    if (config[__data_selection_enabled] && (config[__data_selection_grouped] || config[__data_selection_isselectable](d))) {
                        eventRect.style('cursor', 'pointer');
                    }
                    if (!config[__tooltip_grouped]) {
                        $$.showTooltip([d], d3.mouse(this));
                        $$.showXGridFocus([d]);
                        if (config[__point_focus_expand_enabled]) { $$.expandCircles(index, d.id); }
                        $$.expandBars(index, d.id);
                    }
                });
        })
        .on('click', function (d) {
            var index = d.index;
            if ($$.hasArcType() || !$$.toggleShape) { return; }
            if ($$.cancelClick) {
                $$.cancelClick = false;
                return;
            }
            $$.main.selectAll('.' + CLASS[_shape] + '-' + index).each(function (d) {
                $$.toggleShape(this, d, index);
            });
        })
        .call(
            d3.behavior.drag().origin(Object)
                .on('drag', function () { $$.drag(d3.mouse(this)); })
                .on('dragstart', function () { $$.dragstart(d3.mouse(this)); })
                .on('dragend', function () { $$.dragend(); })
        )
        .on("dblclick.zoom", null);
};

c3_chart_internal_fn.generateEventRectsForMultipleXs = function (eventRectEnter) {
    var $$ = this, d3 = $$.d3, config = $$.config;
    eventRectEnter.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', $$.width)
        .attr('height', $$.height)
        .attr('class', CLASS[_eventRect])
        .on('mouseout', function () {
            if ($$.hasArcType()) { return; }
            $$.hideXGridFocus();
            $$.hideTooltip();
            $$.unexpandCircles();
        })
        .on('mousemove', function () {
            var targetsToShow = $$.filterTargetsToShow($$.data.targets);
            var mouse, closest, sameXData, selectedData;

            if ($$.dragging) { return; } // do nothing when dragging
            if ($$.hasArcType(targetsToShow)) { return; }

            mouse = d3.mouse(this);
            closest = $$.findClosestFromTargets(targetsToShow, mouse);

            if (! closest) { return; }

            if ($$.isScatterType(closest)) {
                sameXData = [closest];
            } else {
                sameXData = $$.filterSameX(targetsToShow, closest.x);
            }

            // show tooltip when cursor is close to some point
            selectedData = sameXData.map(function (d) {
                return $$.addName(d);
            });
            $$.showTooltip(selectedData, mouse);

            // expand points
            if (config[__point_focus_expand_enabled]) {
                $$.unexpandCircles();
                $$.expandCircles(closest.index, closest.id);
            }

            // Show xgrid focus line
            $$.showXGridFocus(selectedData);

            // Show cursor as pointer if point is close to mouse position
            if ($$.dist(closest, mouse) < 100) {
                $$.svg.select('.' + CLASS[_eventRect]).style('cursor', 'pointer');
                if (!$$.mouseover) {
                    config[__data_onmouseover].call($$, closest);
                    $$.mouseover = true;
                }
            } else if ($$.mouseover) {
                $$.svg.select('.' + CLASS[_eventRect]).style('cursor', null);
                config[__data_onmouseout].call($$, closest);
                $$.mouseover = false;
            }
        })
        .on('click', function () {
            var targetsToShow = $$.filterTargetsToShow($$.data.targets);
            var mouse, closest;

            if ($$.hasArcType(targetsToShow)) { return; }

            mouse = d3.mouse(this);
            closest = $$.findClosestFromTargets(targetsToShow, mouse);

            if (! closest) { return; }

            // select if selection enabled
            if ($$.dist(closest, mouse) < 100 && $$.toggleShape) {
                $$.main.select('.' + CLASS[_circles] + $$.getTargetSelectorSuffix(closest.id)).select('.' + CLASS[_circle] + '-' + closest.index).each(function () {
                    $$.toggleShape(this, closest, closest.index);
                });
            }
        })
        .call(
            d3.behavior.drag().origin(Object)
                .on('drag', function () { $$.drag(d3.mouse(this)); })
                .on('dragstart', function () { $$.dragstart(d3.mouse(this)); })
                .on('dragend', function () { $$.dragend(); })
        )
        .on("dblclick.zoom", null);
};

c3_chart_internal_fn.isTimeSeries = function () {
    return this.config[__axis_x_type] === 'timeseries';
};
c3_chart_internal_fn.isCategorized = function () {
    return this.config[__axis_x_type].indexOf('categor') >= 0;
};
c3_chart_internal_fn.isCustomX = function () {
    var $$ = this, config = $$.config;
    return !$$.isTimeSeries() && (config[__data_x] || notEmpty(config[__data_xs]));
};

c3_chart_internal_fn.getTranslate = function (target) {
    var $$ = this, config = $$.config, x, y;
    if (target === 'main') {
        x = asHalfPixel($$.margin.left);
        y = asHalfPixel($$.margin.top);
    } else if (target === 'context') {
        x = asHalfPixel($$.margin2.left);
        y = asHalfPixel($$.margin2.top);
    } else if (target === 'legend') {
        x = $$.margin3.left;
        y = $$.margin3.top;
    } else if (target === 'x') {
        x = 0;
        y = config[__axis_rotated] ? 0 : $$.height;
    } else if (target === 'y') {
        x = 0;
        y = config[__axis_rotated] ? $$.height : 0;
    } else if (target === 'y2') {
        x = config[__axis_rotated] ? 0 : $$.width;
        y = config[__axis_rotated] ? 1 : 0;
    } else if (target === 'subx') {
        x = 0;
        y = config[__axis_rotated] ? 0 : $$.height2;
    } else if (target === 'arc') {
        x = $$.arcWidth / 2;
        y = $$.arcHeight / 2;
    }
    return "translate(" + x + "," + y + ")";
};
c3_chart_internal_fn.initialOpacity = function (d) {
    return d.value !== null && this.withoutFadeIn[d.id] ? 1 : 0;
};
c3_chart_internal_fn.opacityForCircle = function (d) {
    var $$ = this;
    return isValue(d.value) ? $$.isScatterType(d) ? 0.5 : 1 : 0;
};
c3_chart_internal_fn.opacityForText = function () {
    return this.hasDataLabel() ? 1 : 0;
};
c3_chart_internal_fn.xx = function (d) {
    return d ? this.x(d.x) : null;
};
c3_chart_internal_fn.xv = function (d) {
    var $$ = this;
    return Math.ceil($$.x($$.isTimeSeries() ? $$.parseDate(d.value) : d.value));
};
c3_chart_internal_fn.yv = function (d) {
    var $$ = this,
        yScale = d.axis && d.axis === 'y2' ? $$.y2 : $$.y;
    return Math.ceil(yScale(d.value));
};
c3_chart_internal_fn.subxx = function (d) {
    return d ? this.subX(d.x) : null;
};

c3_chart_internal_fn.transformMain = function (withTransition, transitions) {
    var $$ = this,
        xAxis, yAxis, y2Axis;
    if (transitions && transitions.axisX) {
        xAxis = transitions.axisX;
    } else {
        xAxis  = $$.main.select('.' + CLASS[_axisX]);
        if (withTransition) { xAxis = xAxis.transition(); }
    }
    if (transitions && transitions.axisY) {
        yAxis = transitions.axisY;
    } else {
        yAxis = $$.main.select('.' + CLASS[_axisY]);
        if (withTransition) { yAxis = yAxis.transition(); }
    }
    if (transitions && transitions.axisY2) {
        y2Axis = transitions.axisY2;
    } else {
        y2Axis = $$.main.select('.' + CLASS[_axisY2]);
        if (withTransition) { y2Axis = y2Axis.transition(); }
    }
    (withTransition ? $$.main.transition() : $$.main).attr("transform", $$.getTranslate('main'));
    xAxis.attr("transform", $$.getTranslate('x'));
    yAxis.attr("transform", $$.getTranslate('y'));
    y2Axis.attr("transform", $$.getTranslate('y2'));
    $$.main.select('.' + CLASS[_chartArcs]).attr("transform", $$.getTranslate('arc'));
};
c3_chart_internal_fn.transformAll = function (withTransition, transitions) {
    var $$ = this;
    $$.transformMain(withTransition, transitions);
    if ($$.config[__subchart_show]) { $$.transformContext(withTransition, transitions); }
    if ($$.legend) { $$.transformLegend(withTransition); }
};

c3_chart_internal_fn.updateSvgSize = function () {
    var $$ = this;
    $$.svg.attr('width', $$.currentWidth).attr('height', $$.currentHeight);
    $$.svg.select('#' + $$.clipId).select('rect')
        .attr('width', $$.width)
        .attr('height', $$.height);
    $$.svg.select('#' + $$.clipIdForXAxis).select('rect')
        .attr('x', generateCall($$.getXAxisClipX, $$))
        .attr('y', generateCall($$.getXAxisClipY, $$))
        .attr('width', generateCall($$.getXAxisClipWidth, $$))
        .attr('height', generateCall($$.getXAxisClipHeight, $$));
    $$.svg.select('#' + $$.clipIdForYAxis).select('rect')
        .attr('x', generateCall($$.getYAxisClipX, $$))
        .attr('y', generateCall($$.getYAxisClipY, $$))
        .attr('width', generateCall($$.getYAxisClipWidth, $$))
        .attr('height', generateCall($$.getYAxisClipHeight, $$));
    $$.svg.select('.' + CLASS[_zoomRect])
        .attr('width', $$.width)
        .attr('height', $$.height);
    // MEMO: parent div's height will be bigger than svg when <!DOCTYPE html>
    $$.selectChart.style('max-height', $$.currentHeight + "px");
};


c3_chart_internal_fn.updateDimension = function () {
    var $$ = this;
    if ($$.config[__axis_rotated]) {
        $$.axes.x.call($$.xAxis);
        $$.axes.subx.call($$.subXAxis);
    } else {
        $$.axes.y.call($$.yAxis);
        $$.axes.y2.call($$.y2Axis);
    }
    $$.updateSizes();
    $$.updateScales();
    $$.updateSvgSize();
    $$.transformAll(false);
};

c3_chart_internal_fn.observeInserted = function (selection) {
    var $$ = this, observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' && mutation.previousSibling) {
                observer.disconnect();
                // need to wait for completion of load because size calculation requires the actual sizes determined after that completion
                var interval = window.setInterval(function () {
                    // parentNode will NOT be null when completed
                    if (selection.node().parentNode) {
                        window.clearInterval(interval);
                        $$.updateDimension();
                        $$.redraw({
                            withTransform: true,
                            withUpdateXDomain: true,
                            withUpdateOrgXDomain: true,
                            withTransition: false,
                            withTransitionForTransform: false,
                            withLegend: true
                        });
                        selection.transition().style('opacity', 1);
                    }
                }, 10);
            }
        });
    });
    observer.observe(selection.node(), {attributes: true, childList: true, characterData: true});
};


c3_chart_internal_fn.generateResize = function () {
    var resizeFunctions = [];
    function callResizeFunctions() {
        resizeFunctions.forEach(function (f) {
            f();
        });
    }
    callResizeFunctions.add = function (f) {
        resizeFunctions.push(f);
    };
    return callResizeFunctions;
};

c3_chart_internal_fn.transformTo = function (targetIds, type, optionsForRedraw) {
    var $$ = this,
        withTransitionForAxis = !$$.hasArcType(),
        options = optionsForRedraw || {withTransitionForAxis: withTransitionForAxis};
    options.withTransitionForTransform = false;
    $$.transiting = false;
    $$.setTargetType(targetIds, type);
    $$.updateAndRedraw(options);
};

c3_chart_internal_fn.endall = function (transition, callback) {
    var n = 0;
    transition
        .each(function () { ++n; })
        .each("end", function () {
            if (!--n) { callback.apply(this, arguments); }
        });
};
c3_chart_internal_fn.generateWait = function () {
    var transitionsToWait = [],
        f = function (transition, callback) {
            var timer = setInterval(function () {
                var done = 0;
                transitionsToWait.forEach(function (t) {
                    if (t.empty()) {
                        done += 1;
                        return;
                    }
                    try {
                        t.transition();
                    } catch (e) {
                        done += 1;
                    }
                });
                if (done === transitionsToWait.length) {
                    clearInterval(timer);
                    if (callback) { callback(); }
                }
            }, 10);
        };
    f.add = function (transition) {
        transitionsToWait.push(transition);
    };
    return f;
};

c3_chart_internal_fn.parseDate = function (date) {
    var $$ = this, parsedDate;
    if (date instanceof Date) {
        parsedDate = date;
    } else if (typeof date === 'number') {
        parsedDate = new Date(date);
    } else {
        parsedDate = $$.dataTimeFormat($$.config[__data_xFormat]).parse(date);
    }
    if (!parsedDate || isNaN(+parsedDate)) {
        window.console.error("Failed to parse x '" + date + "' to Date object");
    }
    return parsedDate;
};
