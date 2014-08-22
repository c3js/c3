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

    if (config.data_url) {
        $$.convertUrlToData(config.data_url, config.data_mimeType, config.data_keys, $$.initWithData);
    }
    else if (config.data_json) {
        $$.initWithData($$.convertJsonToData(config.data_json, config.data_keys));
    }
    else if (config.data_rows) {
        $$.initWithData($$.convertRowsToData(config.data_rows));
    }
    else if (config.data_columns) {
        $$.initWithData($$.convertColumnsToData(config.data_columns));
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

    $$.dataTimeFormat = config.data_xLocaltime ? d3.time.format : d3.time.format.utc;
    $$.axisTimeFormat = config.axis_x_localtime ? d3.time.format : d3.time.format.utc;
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

    $$.xOrient = config.axis_rotated ? "left" : "bottom";
    $$.yOrient = config.axis_rotated ? "bottom" : "left";
    $$.y2Orient = config.axis_rotated ? "top" : "right";
    $$.subXOrient = config.axis_rotated ? "left" : "bottom";

    $$.isLegendRight = config.legend_position === 'right';
    $$.isLegendInset = config.legend_position === 'inset';
    $$.isLegendTop = config.legend_inset_anchor === 'top-left' || config.legend_inset_anchor === 'top-right';
    $$.isLegendLeft = config.legend_inset_anchor === 'top-left' || config.legend_inset_anchor === 'bottom-left';
    $$.legendStep = 0;
    $$.legendItemWidth = 0;
    $$.legendItemHeight = 0;
    $$.legendOpacityForHidden = 0.15;

    $$.currentMaxTickWidth = 0;

    $$.rotated_padding_left = 30;
    $$.rotated_padding_right = config.axis_rotated && !config.axis_x_show ? 0 : 30;
    $$.rotated_padding_top = 5;

    $$.withoutFadeIn = {};

    $$.axes.subx = d3.selectAll([]); // needs when excluding subchart.js
};

c3_chart_internal_fn.initWithData = function (data) {
    var $$ = this, d3 = $$.d3, config = $$.config;
    var main, binding = true;

    if ($$.initPie) { $$.initPie(); }
    if ($$.initBrush) { $$.initBrush(); }
    if ($$.initZoom) { $$.initZoom(); }

    $$.selectChart = d3.select(config.bindto);
    if ($$.selectChart.empty()) {
        $$.selectChart = d3.select(document.createElement('div')).style('opacity', 0);
        $$.observeInserted($$.selectChart);
        binding = false;
    }
    $$.selectChart.html("").classed("c3", true);

    // Init data as targets
    $$.data.xs = {};
    $$.data.targets = $$.convertDataToTargets(data);

    if (config.data_filter) {
        $$.data.targets = $$.data.targets.filter(config.data_filter);
    }

    // Set targets to hide if needed
    if (config.data_hide) {
        $$.addHiddenTargetIds(config.data_hide === true ? $$.mapToIds($$.data.targets) : config.data_hide);
    }

    // when gauge, hide legend // TODO: fix
    if ($$.hasType('gauge')) {
        config.legend_show = false;
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
    if (config.zoom_enabled) { $$.zoom.scale($$.x); }

    /*-- Basic Elements --*/

    // Define svgs
    $$.svg = $$.selectChart.append("svg")
        .style("overflow", "hidden")
        .on('mouseenter', function () { return config.onmouseover.call($$); })
        .on('mouseleave', function () { return config.onmouseout.call($$); });

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
        .attr("class", CLASS.text + ' ' + CLASS.empty)
        .attr("text-anchor", "middle") // horizontal centering of text at x position in all browsers.
        .attr("dominant-baseline", "middle"); // vertical centering of text at y position in all browsers, except IE.

    // Regions
    $$.initRegion();

    // Grids
    $$.initGrid();

    // Define g for chart area
    main.append('g')
        .attr("clip-path", $$.clipPath)
        .attr('class', CLASS.chart);

    // Cover whole with rects for events
    $$.initEventRect();

    // Define g for bar chart area
    if ($$.initBar) { $$.initBar(); }

    // Define g for line chart area
    if ($$.initLine) { $$.initLine(); }

    // Define g for arc chart area
    if ($$.initArc) { $$.initArc(); }
    if ($$.initGauge) { $$.initGauge(); }

    // Define g for text area
    if ($$.initText) { $$.initText(); }

    // if zoom privileged, insert rect to forefront
    // TODO: is this needed?
    main.insert('rect', config.zoom_privileged ? null : 'g.' + CLASS.regions)
        .attr('class', CLASS.zoomRect)
        .attr('width', $$.width)
        .attr('height', $$.height)
        .style('opacity', 0)
        .on("dblclick.zoom", null);

    // Set default extent if defined
    if (config.axis_x_default) {
        $$.brush.extent(isFunction(config.axis_x_default) ? config.axis_x_default($$.getXDomain()) : config.axis_x_default);
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
            config.onresize.call($$);
        });
        window.onresize.add(function () {
            $$.api.flush();
        });
        window.onresize.add(function () {
            config.onresized.call($$);
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
        xAxisHeight = config.axis_rotated || hasArc ? 0 : $$.getHorizontalAxisHeight('x'),
        subchartHeight = config.subchart_show && !hasArc ? (config.subchart_size_height + xAxisHeight) : 0;

    $$.currentWidth = $$.getCurrentWidth();
    $$.currentHeight = $$.getCurrentHeight();

    // for main
    $$.margin = config.axis_rotated ? {
        top: $$.getHorizontalAxisHeight('y2') + $$.getCurrentPaddingTop(),
        right: hasArc ? 0 : $$.getCurrentPaddingRight(),
        bottom: $$.getHorizontalAxisHeight('y') + legendHeightForBottom + $$.getCurrentPaddingBottom(),
        left: subchartHeight + (hasArc ? 0 : $$.getCurrentPaddingLeft())
    } : {
        top: 4 + $$.getCurrentPaddingTop(), // for top tick text
        right: hasArc ? 0 : $$.getCurrentPaddingRight(),
        bottom: xAxisHeight + subchartHeight + legendHeightForBottom + $$.getCurrentPaddingBottom(),
        left: hasArc ? 0 : $$.getCurrentPaddingLeft()
    };

    // for subchart
    $$.margin2 = config.axis_rotated ? {
        top: $$.margin.top,
        right: NaN,
        bottom: 20 + legendHeightForBottom,
        left: $$.rotated_padding_left
    } : {
        top: $$.currentHeight - subchartHeight - legendHeightForBottom,
        right: NaN,
        bottom: xAxisHeight + legendHeightForBottom,
        left: $$.margin.left
    };

    // for legend
    $$.margin3 = {
        top: 0,
        right: NaN,
        bottom: 0,
        left: 0
    };
    if ($$.updateSizeForLegend) { $$.updateSizeForLegend(legendHeight, legendWidth); }

    $$.width = $$.currentWidth - $$.margin.left - $$.margin.right;
    $$.height = $$.currentHeight - $$.margin.top - $$.margin.bottom;
    if ($$.width < 0) { $$.width = 0; }
    if ($$.height < 0) { $$.height = 0; }

    $$.width2 = config.axis_rotated ? $$.margin.left - $$.rotated_padding_left - $$.rotated_padding_right : $$.width;
    $$.height2 = config.axis_rotated ? $$.height : $$.currentHeight - $$.margin2.top - $$.margin2.bottom;
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
    var $$ = this, config = $$.config;

    /*-- Main --*/

    //-- Text --//
    $$.updateTargetsForText(targets);

    //-- Bar --//
    $$.updateTargetsForBar(targets);

    //-- Line --//
    $$.updateTargetsForLine(targets);

    //-- Arc --//
    if ($$.updateTargetsForArc) { $$.updateTargetsForArc(targets); }
    if ($$.updateTargetsForSubchart) { $$.updateTargetsForSubchart(targets); }

    /*-- Show --*/

    // Fade-in each chart
    $$.svg.selectAll('.' + CLASS.target).filter(function (d) { return $$.isTargetToShow(d.id); })
      .transition().duration(config.transition_duration)
        .style("opacity", 1);
};

c3_chart_internal_fn.redraw = function (options, transitions) {
    var $$ = this, main = $$.main, d3 = $$.d3, config = $$.config;
    var areaIndices = $$.getShapeIndices($$.isAreaType), barIndices = $$.getShapeIndices($$.isBarType), lineIndices = $$.getShapeIndices($$.isLineType);
    var withY, withSubchart, withTransition, withTransitionForExit, withTransitionForAxis, withTransform, withUpdateXDomain, withUpdateOrgXDomain, withLegend;
    var hideAxis = $$.hasArcType();
    var drawArea, drawBar, drawLine, xForText, yForText;
    var duration, durationForExit, durationForAxis;
    var waitForDraw, flow;
    var targetsToShow = $$.filterTargetsToShow($$.data.targets), tickValues, i, intervalForCulling;
    var xv = $$.xv.bind($$),
        cx = ($$.config.axis_rotated ? $$.circleY : $$.circleX).bind($$),
        cy = ($$.config.axis_rotated ? $$.circleX : $$.circleY).bind($$);

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

    duration = withTransition ? config.transition_duration : 0;
    durationForExit = withTransitionForExit ? duration : 0;
    durationForAxis = withTransitionForAxis ? duration : 0;

    transitions = transitions || $$.generateAxisTransitions(durationForAxis);

    // update legend and transform each g
    if (withLegend && config.legend_show) {
        $$.updateLegend($$.mapToIds($$.data.targets), options, transitions);
    }

    // MEMO: needed for grids calculation
    if ($$.isCategorized() && targetsToShow.length === 0) {
        $$.x.domain([0, $$.axes.x.selectAll('.tick').size()]);
    }

    if (targetsToShow.length) {
        $$.updateXDomain(targetsToShow, withUpdateXDomain, withUpdateOrgXDomain);
        // update axis tick values according to options
        if (!config.axis_x_tick_values && (config.axis_x_tick_fit || config.axis_x_tick_count)) {
            tickValues = $$.generateTickValues($$.mapTargetsToUniqueXs(targetsToShow), config.axis_x_tick_count);
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
        if (config.axis_x_tick_culling && tickValues) {
            for (i = 1; i < tickValues.length; i++) {
                if (tickValues.length / i < config.axis_x_tick_culling_max) {
                    intervalForCulling = i;
                    break;
                }
            }
            $$.svg.selectAll('.' + CLASS.axisX + ' .tick text').each(function (e) {
                var index = tickValues.indexOf(e);
                if (index >= 0) {
                    d3.select(this).style('display', index % intervalForCulling ? 'none' : 'block');
                }
            });
        } else {
            $$.svg.selectAll('.' + CLASS.axisX + ' .tick text').style('display', 'block');
        }
    }

    // rotate tick text if needed
    if (!config.axis_rotated && config.axis_x_tick_rotate) {
        $$.rotateTickText($$.axes.x, transitions.axisX, config.axis_x_tick_rotate);
    }

    // setup drawer - MEMO: these must be called after axis updated
    drawArea = $$.generateDrawArea ? $$.generateDrawArea(areaIndices, false) : undefined;
    drawBar = $$.generateDrawBar ? $$.generateDrawBar(barIndices) : undefined;
    drawLine = $$.generateDrawLine ? $$.generateDrawLine(lineIndices, false) : undefined;
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
    main.select("text." + CLASS.text + '.' + CLASS.empty)
        .attr("x", $$.width / 2)
        .attr("y", $$.height / 2)
        .text(config.data_empty_label_text)
      .transition()
        .style('opacity', targetsToShow.length ? 0 : 1);

    // grid
    $$.redrawGrid(duration, withY);

    // rect for regions
    $$.redrawRegion(duration);

    // bars
    $$.redrawBar(durationForExit);

    // lines, areas and cricles
    $$.redrawLine(durationForExit);
    $$.redrawArea(durationForExit);
    if (config.point_show) { $$.redrawCircle(); }

    // text
    if ($$.hasDataLabel()) {
        $$.redrawText(durationForExit);
    }

    // arc
    if ($$.redrawArc) { $$.redrawArc(duration, durationForExit, withTransform); }

    // subchart
    if ($$.redrawSubchart) {
        $$.redrawSubchart(withSubchart, transitions, duration, durationForExit, areaIndices, barIndices, lineIndices);
    }

    // circles for select
    main.selectAll('.' + CLASS.selectedCircles)
        .filter($$.isBarType.bind($$))
        .selectAll('circle')
        .remove();

    // event rect
    if (config.interaction_enabled) {
        $$.redrawEventRect();
    }

    // transition should be derived from one transition
    d3.transition().duration(duration).each(function () {
        var transitions = [];

        $$.addTransitionForBar(transitions, drawBar);
        $$.addTransitionForLine(transitions, drawLine);
        $$.addTransitionForArea(transitions, drawArea);
        if (config.point_show) { $$.addTransitionForCircle(transitions, cx, cy); }
        $$.addTransitionForText(transitions, xForText, yForText, options.flow);
        $$.addTransitionForRegion(transitions);
        $$.addTransitionForGrid(transitions);

        // Wait for end of transitions if called from flow API
        if (options.flow) {
            waitForDraw = $$.generateWait();
            transitions.forEach(function (t) {
                waitForDraw.add(t);
            });
            flow = $$.generateFlow({
                targets: targetsToShow,
                flow: options.flow,
                duration: duration,
                drawBar: drawBar,
                drawLine: drawLine,
                drawArea: drawArea,
                cx: cx,
                cy: cy,
                xv: xv,
                xForText: xForText,
                yForText: yForText
            });
        }
    })
    .call(waitForDraw || function () {}, flow || function () {});

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
    if (!(options.withLegend && config.legend_show)) {
        transitions = $$.generateAxisTransitions(options.withTransitionForAxis ? config.transition_duration : 0);
        // Update scales
        $$.updateScales();
        $$.updateSvgSize();
        // Update g positions
        $$.transformAll(options.withTransitionForTransform, transitions);
    }
    // Draw with new sizes & scales
    $$.redraw(options, transitions);
};

c3_chart_internal_fn.isTimeSeries = function () {
    return this.config.axis_x_type === 'timeseries';
};
c3_chart_internal_fn.isCategorized = function () {
    return this.config.axis_x_type.indexOf('categor') >= 0;
};
c3_chart_internal_fn.isCustomX = function () {
    var $$ = this, config = $$.config;
    return !$$.isTimeSeries() && (config.data_x || notEmpty(config.data_xs));
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
        y = config.axis_rotated ? 0 : $$.height;
    } else if (target === 'y') {
        x = 0;
        y = config.axis_rotated ? $$.height : 0;
    } else if (target === 'y2') {
        x = config.axis_rotated ? 0 : $$.width;
        y = config.axis_rotated ? 1 : 0;
    } else if (target === 'subx') {
        x = 0;
        y = config.axis_rotated ? 0 : $$.height2;
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
        xAxis  = $$.main.select('.' + CLASS.axisX);
        if (withTransition) { xAxis = xAxis.transition(); }
    }
    if (transitions && transitions.axisY) {
        yAxis = transitions.axisY;
    } else {
        yAxis = $$.main.select('.' + CLASS.axisY);
        if (withTransition) { yAxis = yAxis.transition(); }
    }
    if (transitions && transitions.axisY2) {
        y2Axis = transitions.axisY2;
    } else {
        y2Axis = $$.main.select('.' + CLASS.axisY2);
        if (withTransition) { y2Axis = y2Axis.transition(); }
    }
    (withTransition ? $$.main.transition() : $$.main).attr("transform", $$.getTranslate('main'));
    xAxis.attr("transform", $$.getTranslate('x'));
    yAxis.attr("transform", $$.getTranslate('y'));
    y2Axis.attr("transform", $$.getTranslate('y2'));
    $$.main.select('.' + CLASS.chartArcs).attr("transform", $$.getTranslate('arc'));
};
c3_chart_internal_fn.transformAll = function (withTransition, transitions) {
    var $$ = this;
    $$.transformMain(withTransition, transitions);
    if ($$.config.subchart_show) { $$.transformContext(withTransition, transitions); }
    if ($$.legend) { $$.transformLegend(withTransition); }
};

c3_chart_internal_fn.updateSvgSize = function () {
    var $$ = this;
    $$.svg.attr('width', $$.currentWidth).attr('height', $$.currentHeight);
    $$.svg.select('#' + $$.clipId).select('rect')
        .attr('width', $$.width)
        .attr('height', $$.height);
    $$.svg.select('#' + $$.clipIdForXAxis).select('rect')
        .attr('x', $$.getXAxisClipX.bind($$))
        .attr('y', $$.getXAxisClipY.bind($$))
        .attr('width', $$.getXAxisClipWidth.bind($$))
        .attr('height', $$.getXAxisClipHeight.bind($$));
    $$.svg.select('#' + $$.clipIdForYAxis).select('rect')
        .attr('x', $$.getYAxisClipX.bind($$))
        .attr('y', $$.getYAxisClipY.bind($$))
        .attr('width', $$.getYAxisClipWidth.bind($$))
        .attr('height', $$.getYAxisClipHeight.bind($$));
    $$.svg.select('.' + CLASS.zoomRect)
        .attr('width', $$.width)
        .attr('height', $$.height);
    // MEMO: parent div's height will be bigger than svg when <!DOCTYPE html>
    $$.selectChart.style('max-height', $$.currentHeight + "px");
};


c3_chart_internal_fn.updateDimension = function () {
    var $$ = this;
    if ($$.config.axis_rotated) {
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
        parsedDate = $$.dataTimeFormat($$.config.data_xFormat).parse(date);
    }
    if (!parsedDate || isNaN(+parsedDate)) {
        window.console.error("Failed to parse x '" + date + "' to Date object");
    }
    return parsedDate;
};
