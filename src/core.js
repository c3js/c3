import {
    ChartInternal
} from './chart-internal';
import {
    Chart
} from './chart';
import {
    AxisInternal
} from './axis-internal';
import Axis from './axis';
import CLASS from './class';

import {
    asHalfPixel,
    getOption,
    getPathBox,
    isFunction,
    isValue,
    notEmpty
} from './util';

var c3 = {
    version: "0.6.8",
    chart: {
        fn: Chart.prototype,
        internal: {
            fn: ChartInternal.prototype,
            axis: {
                fn: Axis.prototype,
                internal: {
                    fn: AxisInternal.prototype
                }
            }
        }
    },
    generate: function(config) {
        return new Chart(config);
    }
};

export {
    c3
};

ChartInternal.prototype.beforeInit = function() {
    // can do something
};
ChartInternal.prototype.afterInit = function() {
    // can do something
};
ChartInternal.prototype.init = function() {
    var $$ = this,
        config = $$.config;

    $$.initParams();

    if (config.data_url) {
        $$.convertUrlToData(config.data_url, config.data_mimeType, config.data_headers, config.data_keys, $$.initWithData);
    } else if (config.data_json) {
        $$.initWithData($$.convertJsonToData(config.data_json, config.data_keys));
    } else if (config.data_rows) {
        $$.initWithData($$.convertRowsToData(config.data_rows));
    } else if (config.data_columns) {
        $$.initWithData($$.convertColumnsToData(config.data_columns));
    } else {
        throw Error('url or json or rows or columns is required.');
    }
};

ChartInternal.prototype.initParams = function() {
    var $$ = this,
        d3 = $$.d3,
        config = $$.config;

    // MEMO: clipId needs to be unique because it conflicts when multiple charts exist
    $$.clipId = "c3-" + (+new Date()) + '-clip';
    $$.clipIdForXAxis = $$.clipId + '-xaxis';
    $$.clipIdForYAxis = $$.clipId + '-yaxis';
    $$.clipIdForGrid = $$.clipId + '-grid';
    $$.clipIdForSubchart = $$.clipId + '-subchart';
    $$.clipPath = $$.getClipPath($$.clipId);
    $$.clipPathForXAxis = $$.getClipPath($$.clipIdForXAxis);
    $$.clipPathForYAxis = $$.getClipPath($$.clipIdForYAxis);
    $$.clipPathForGrid = $$.getClipPath($$.clipIdForGrid);
    $$.clipPathForSubchart = $$.getClipPath($$.clipIdForSubchart);

    $$.dragStart = null;
    $$.dragging = false;
    $$.flowing = false;
    $$.cancelClick = false;
    $$.mouseover = false;
    $$.transiting = false;

    $$.color = $$.generateColor();
    $$.levelColor = $$.generateLevelColor();

    $$.dataTimeParse = (config.data_xLocaltime ? d3.timeParse : d3.utcParse)($$.config.data_xFormat);
    $$.axisTimeFormat = config.axis_x_localtime ? d3.timeFormat : d3.utcFormat;
    $$.defaultAxisTimeFormat = function(date) {
        if (date.getMilliseconds()) {
            return d3.timeFormat(".%L")(date);
        }
        if (date.getSeconds()) {
            return d3.timeFormat(":%S")(date);
        }
        if (date.getMinutes()) {
            return d3.timeFormat("%I:%M")(date);
        }
        if (date.getHours()) {
            return d3.timeFormat("%I %p")(date);
        }
        if (date.getDay() && date.getDate() !== 1) {
            return d3.timeFormat("%-m/%-d")(date);
        }
        if (date.getDate() !== 1) {
            return d3.timeFormat("%-m/%-d")(date);
        }
        if (date.getMonth()) {
            return d3.timeFormat("%-m/%-d")(date);
        }
        return d3.timeFormat("%Y/%-m/%-d")(date);
    };
    $$.hiddenTargetIds = [];
    $$.hiddenLegendIds = [];
    $$.focusedTargetIds = [];
    $$.defocusedTargetIds = [];

    $$.xOrient = config.axis_rotated ? (config.axis_x_inner ? "right" : "left") : (config.axis_x_inner ? "top" : "bottom");
    $$.yOrient = config.axis_rotated ? (config.axis_y_inner ? "top" : "bottom") : (config.axis_y_inner ? "right" : "left");
    $$.y2Orient = config.axis_rotated ? (config.axis_y2_inner ? "bottom" : "top") : (config.axis_y2_inner ? "left" : "right");
    $$.subXOrient = config.axis_rotated ? "left" : "bottom";

    $$.isLegendRight = config.legend_position === 'right';
    $$.isLegendInset = config.legend_position === 'inset';
    $$.isLegendTop = config.legend_inset_anchor === 'top-left' || config.legend_inset_anchor === 'top-right';
    $$.isLegendLeft = config.legend_inset_anchor === 'top-left' || config.legend_inset_anchor === 'bottom-left';
    $$.legendStep = 0;
    $$.legendItemWidth = 0;
    $$.legendItemHeight = 0;

    $$.currentMaxTickWidths = {
        x: 0,
        y: 0,
        y2: 0
    };

    $$.rotated_padding_left = 30;
    $$.rotated_padding_right = config.axis_rotated && !config.axis_x_show ? 0 : 30;
    $$.rotated_padding_top = 5;

    $$.withoutFadeIn = {};

    $$.intervalForObserveInserted = undefined;

    $$.axes.subx = d3.selectAll([]); // needs when excluding subchart.js
};

ChartInternal.prototype.initChartElements = function() {
    if (this.initBar) {
        this.initBar();
    }
    if (this.initLine) {
        this.initLine();
    }
    if (this.initArc) {
        this.initArc();
    }
    if (this.initGauge) {
        this.initGauge();
    }
    if (this.initText) {
        this.initText();
    }
};

ChartInternal.prototype.initWithData = function(data) {
    var $$ = this,
        d3 = $$.d3,
        config = $$.config;
    var defs, main, binding = true;

    $$.axis = new Axis($$);

    if (!config.bindto) {
        $$.selectChart = d3.selectAll([]);
    } else if (typeof config.bindto.node === 'function') {
        $$.selectChart = config.bindto;
    } else {
        $$.selectChart = d3.select(config.bindto);
    }
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
    if (config.legend_hide) {
        $$.addHiddenLegendIds(config.legend_hide === true ? $$.mapToIds($$.data.targets) : config.legend_hide);
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

    /*-- Basic Elements --*/

    // Define svgs
    $$.svg = $$.selectChart.append("svg")
        .style("overflow", "hidden")
        .on('mouseenter', function() {
            return config.onmouseover.call($$);
        })
        .on('mouseleave', function() {
            return config.onmouseout.call($$);
        });

    if ($$.config.svg_classname) {
        $$.svg.attr('class', $$.config.svg_classname);
    }

    // Define defs
    defs = $$.svg.append("defs");
    $$.clipChart = $$.appendClip(defs, $$.clipId);
    $$.clipXAxis = $$.appendClip(defs, $$.clipIdForXAxis);
    $$.clipYAxis = $$.appendClip(defs, $$.clipIdForYAxis);
    $$.clipGrid = $$.appendClip(defs, $$.clipIdForGrid);
    $$.clipSubchart = $$.appendClip(defs, $$.clipIdForSubchart);
    $$.updateSvgSize();

    // Define regions
    main = $$.main = $$.svg.append("g").attr("transform", $$.getTranslate('main'));

    if ($$.initPie) {
        $$.initPie();
    }
    if ($$.initDragZoom) {
        $$.initDragZoom();
    }
    if ($$.initSubchart) {
        $$.initSubchart();
    }
    if ($$.initTooltip) {
        $$.initTooltip();
    }
    if ($$.initLegend) {
        $$.initLegend();
    }
    if ($$.initTitle) {
        $$.initTitle();
    }
    if ($$.initZoom) {
        $$.initZoom();
    }

    // Update selection based on size and scale
    // TODO: currently this must be called after initLegend because of update of sizes, but it should be done in initSubchart.
    if ($$.initSubchartBrush) {
        $$.initSubchartBrush();
    }

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

    // Grid lines
    if (config.grid_lines_front) {
        $$.initGridLines();
    }

    // Cover whole with rects for events
    $$.initEventRect();

    // Define g for chart
    $$.initChartElements();

    // Add Axis
    $$.axis.init();

    // Set targets
    $$.updateTargets($$.data.targets);

    // Set default extent if defined
    if (config.axis_x_selection) {
        $$.brush.selectionAsValue($$.getDefaultSelection());
    }

    // Draw with targets
    if (binding) {
        $$.updateDimension();
        $$.config.oninit.call($$);
        $$.redraw({
            withTransition: false,
            withTransform: true,
            withUpdateXDomain: true,
            withUpdateOrgXDomain: true,
            withTransitionForAxis: false
        });
    }

    // Bind resize event
    $$.bindResize();

    // export element of the chart
    $$.api.element = $$.selectChart.node();
};

ChartInternal.prototype.smoothLines = function(el, type) {
    var $$ = this;
    if (type === 'grid') {
        el.each(function() {
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

ChartInternal.prototype.updateSizes = function() {
    var $$ = this,
        config = $$.config;
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
    if ($$.updateSizeForLegend) {
        $$.updateSizeForLegend(legendHeight, legendWidth);
    }

    $$.width = $$.currentWidth - $$.margin.left - $$.margin.right;
    $$.height = $$.currentHeight - $$.margin.top - $$.margin.bottom;
    if ($$.width < 0) {
        $$.width = 0;
    }
    if ($$.height < 0) {
        $$.height = 0;
    }

    $$.width2 = config.axis_rotated ? $$.margin.left - $$.rotated_padding_left - $$.rotated_padding_right : $$.width;
    $$.height2 = config.axis_rotated ? $$.height : $$.currentHeight - $$.margin2.top - $$.margin2.bottom;
    if ($$.width2 < 0) {
        $$.width2 = 0;
    }
    if ($$.height2 < 0) {
        $$.height2 = 0;
    }

    // for arc
    $$.arcWidth = $$.width - ($$.isLegendRight ? legendWidth + 10 : 0);
    $$.arcHeight = $$.height - ($$.isLegendRight ? 0 : 10);
    if ($$.hasType('gauge') && !config.gauge_fullCircle) {
        $$.arcHeight += $$.height - $$.getGaugeLabelHeight();
    }
    if ($$.updateRadius) {
        $$.updateRadius();
    }

    if ($$.isLegendRight && hasArc) {
        $$.margin3.left = $$.arcWidth / 2 + $$.radiusExpanded * 1.1;
    }
};

ChartInternal.prototype.updateTargets = function(targets) {
    var $$ = this;

    /*-- Main --*/

    //-- Text --//
    $$.updateTargetsForText(targets);

    //-- Bar --//
    $$.updateTargetsForBar(targets);

    //-- Line --//
    $$.updateTargetsForLine(targets);

    //-- Arc --//
    if ($$.hasArcType() && $$.updateTargetsForArc) {
        $$.updateTargetsForArc(targets);
    }

    /*-- Sub --*/

    if ($$.updateTargetsForSubchart) {
        $$.updateTargetsForSubchart(targets);
    }

    // Fade-in each chart
    $$.showTargets();
};
ChartInternal.prototype.showTargets = function() {
    var $$ = this;
    $$.svg.selectAll('.' + CLASS.target).filter(function(d) {
            return $$.isTargetToShow(d.id);
        })
        .transition().duration($$.config.transition_duration)
        .style("opacity", 1);
};

ChartInternal.prototype.redraw = function(options, transitions) {
    var $$ = this,
        main = $$.main,
        d3 = $$.d3,
        config = $$.config;
    var areaIndices = $$.getShapeIndices($$.isAreaType),
        barIndices = $$.getShapeIndices($$.isBarType),
        lineIndices = $$.getShapeIndices($$.isLineType);
    var withY, withSubchart, withTransition, withTransitionForExit, withTransitionForAxis,
        withTransform, withUpdateXDomain, withUpdateOrgXDomain, withTrimXDomain, withLegend,
        withEventRect, withDimension, withUpdateXAxis;
    var hideAxis = $$.hasArcType();
    var drawArea, drawBar, drawLine, xForText, yForText;
    var duration, durationForExit, durationForAxis;
    var transitionsToWait, waitForDraw, flow, transition;
    var targetsToShow = $$.filterTargetsToShow($$.data.targets),
        tickValues, i, intervalForCulling, xDomainForZoom;
    var xv = $$.xv.bind($$),
        cx, cy;

    options = options || {};
    withY = getOption(options, "withY", true);
    withSubchart = getOption(options, "withSubchart", true);
    withTransition = getOption(options, "withTransition", true);
    withTransform = getOption(options, "withTransform", false);
    withUpdateXDomain = getOption(options, "withUpdateXDomain", false);
    withUpdateOrgXDomain = getOption(options, "withUpdateOrgXDomain", false);
    withTrimXDomain = getOption(options, "withTrimXDomain", true);
    withUpdateXAxis = getOption(options, "withUpdateXAxis", withUpdateXDomain);
    withLegend = getOption(options, "withLegend", false);
    withEventRect = getOption(options, "withEventRect", true);
    withDimension = getOption(options, "withDimension", true);
    withTransitionForExit = getOption(options, "withTransitionForExit", withTransition);
    withTransitionForAxis = getOption(options, "withTransitionForAxis", withTransition);

    duration = withTransition ? config.transition_duration : 0;
    durationForExit = withTransitionForExit ? duration : 0;
    durationForAxis = withTransitionForAxis ? duration : 0;

    transitions = transitions || $$.axis.generateTransitions(durationForAxis);

    // update legend and transform each g
    if (withLegend && config.legend_show) {
        $$.updateLegend($$.mapToIds($$.data.targets), options, transitions);
    } else if (withDimension) {
        // need to update dimension (e.g. axis.y.tick.values) because y tick values should change
        // no need to update axis in it because they will be updated in redraw()
        $$.updateDimension(true);
    }

    // MEMO: needed for grids calculation
    if ($$.isCategorized() && targetsToShow.length === 0) {
        $$.x.domain([0, $$.axes.x.selectAll('.tick').size()]);
    }

    if (targetsToShow.length) {
        $$.updateXDomain(targetsToShow, withUpdateXDomain, withUpdateOrgXDomain, withTrimXDomain);
        if (!config.axis_x_tick_values) {
            tickValues = $$.axis.updateXAxisTickValues(targetsToShow);
        }
    } else {
        $$.xAxis.tickValues([]);
        $$.subXAxis.tickValues([]);
    }

    if (config.zoom_rescale && !options.flow) {
        xDomainForZoom = $$.x.orgDomain();
    }

    $$.y.domain($$.getYDomain(targetsToShow, 'y', xDomainForZoom));
    $$.y2.domain($$.getYDomain(targetsToShow, 'y2', xDomainForZoom));

    if (!config.axis_y_tick_values && config.axis_y_tick_count) {
        $$.yAxis.tickValues($$.axis.generateTickValues($$.y.domain(), config.axis_y_tick_count));
    }
    if (!config.axis_y2_tick_values && config.axis_y2_tick_count) {
        $$.y2Axis.tickValues($$.axis.generateTickValues($$.y2.domain(), config.axis_y2_tick_count));
    }

    // axes
    $$.axis.redraw(durationForAxis, hideAxis);

    // Update axis label
    $$.axis.updateLabels(withTransition);

    // show/hide if manual culling needed
    if ((withUpdateXDomain || withUpdateXAxis) && targetsToShow.length) {
        if (config.axis_x_tick_culling && tickValues) {
            for (i = 1; i < tickValues.length; i++) {
                if (tickValues.length / i < config.axis_x_tick_culling_max) {
                    intervalForCulling = i;
                    break;
                }
            }
            $$.svg.selectAll('.' + CLASS.axisX + ' .tick text').each(function(e) {
                var index = tickValues.indexOf(e);
                if (index >= 0) {
                    d3.select(this).style('display', index % intervalForCulling ? 'none' : 'block');
                }
            });
        } else {
            $$.svg.selectAll('.' + CLASS.axisX + ' .tick text').style('display', 'block');
        }
    }

    // setup drawer - MEMO: these must be called after axis updated
    drawArea = $$.generateDrawArea ? $$.generateDrawArea(areaIndices, false) : undefined;
    drawBar = $$.generateDrawBar ? $$.generateDrawBar(barIndices) : undefined;
    drawLine = $$.generateDrawLine ? $$.generateDrawLine(lineIndices, false) : undefined;
    xForText = $$.generateXYForText(areaIndices, barIndices, lineIndices, true);
    yForText = $$.generateXYForText(areaIndices, barIndices, lineIndices, false);

    // update circleY based on updated parameters
    $$.updateCircleY();
    // generate circle x/y functions depending on updated params
    cx = ($$.config.axis_rotated ? $$.circleY : $$.circleX).bind($$);
    cy = ($$.config.axis_rotated ? $$.circleX : $$.circleY).bind($$);

    // Update sub domain
    if (withY) {
        $$.subY.domain($$.getYDomain(targetsToShow, 'y'));
        $$.subY2.domain($$.getYDomain(targetsToShow, 'y2'));
    }

    // xgrid focus
    $$.updateXgridFocus();

    // Data empty label positioning and text.
    main.select("text." + CLASS.text + '.' + CLASS.empty)
        .attr("x", $$.width / 2)
        .attr("y", $$.height / 2)
        .text(config.data_empty_label_text)
        .transition()
        .style('opacity', targetsToShow.length ? 0 : 1);

    // event rect
    if (withEventRect) {
        $$.redrawEventRect();
    }

    // grid
    $$.updateGrid(duration);

    // rect for regions
    $$.updateRegion(duration);

    // bars
    $$.updateBar(durationForExit);

    // lines, areas and cricles
    $$.updateLine(durationForExit);
    $$.updateArea(durationForExit);
    $$.updateCircle(cx, cy);

    // text
    if ($$.hasDataLabel()) {
        $$.updateText(xForText, yForText, durationForExit);
    }

    // title
    if ($$.redrawTitle) {
        $$.redrawTitle();
    }

    // arc
    if ($$.redrawArc) {
        $$.redrawArc(duration, durationForExit, withTransform);
    }

    // subchart
    if ($$.redrawSubchart) {
        $$.redrawSubchart(withSubchart, transitions, duration, durationForExit, areaIndices, barIndices, lineIndices);
    }

    // circles for select
    main.selectAll('.' + CLASS.selectedCircles)
        .filter($$.isBarType.bind($$))
        .selectAll('circle')
        .remove();

    if (options.flow) {
        flow = $$.generateFlow({
            targets: targetsToShow,
            flow: options.flow,
            duration: options.flow.duration,
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

    if ($$.isTabVisible()) { // Only use transition if tab visible. See #938.
        if (duration) {
            // transition should be derived from one transition
            transition = d3.transition().duration(duration);
            transitionsToWait = [];
            [
                $$.redrawBar(drawBar, true, transition),
                $$.redrawLine(drawLine, true, transition),
                $$.redrawArea(drawArea, true, transition),
                $$.redrawCircle(cx, cy, true, transition),
                $$.redrawText(xForText, yForText, options.flow, true, transition),
                $$.redrawRegion(true, transition),
                $$.redrawGrid(true, transition),
            ].forEach(function(transitions) {
                transitions.forEach(function(transition) {
                    transitionsToWait.push(transition);
                });
            });
            // Wait for end of transitions to call flow and onrendered callback
            waitForDraw = $$.generateWait();
            transitionsToWait.forEach(function(t) {
                waitForDraw.add(t);
            });
            waitForDraw(function() {
                if (flow) {
                    flow();
                }
                if (config.onrendered) {
                    config.onrendered.call($$);
                }
            });
        } else {
            $$.redrawBar(drawBar);
            $$.redrawLine(drawLine);
            $$.redrawArea(drawArea);
            $$.redrawCircle(cx, cy);
            $$.redrawText(xForText, yForText, options.flow);
            $$.redrawRegion();
            $$.redrawGrid();
            if (flow) {
                flow();
            }
            if (config.onrendered) {
                config.onrendered.call($$);
            }
        }
    }

    // update fadein condition
    $$.mapToIds($$.data.targets).forEach(function(id) {
        $$.withoutFadeIn[id] = true;
    });
};

ChartInternal.prototype.updateAndRedraw = function(options) {
    var $$ = this,
        config = $$.config,
        transitions;
    options = options || {};
    // same with redraw
    options.withTransition = getOption(options, "withTransition", true);
    options.withTransform = getOption(options, "withTransform", false);
    options.withLegend = getOption(options, "withLegend", false);
    // NOT same with redraw
    options.withUpdateXDomain = getOption(options, "withUpdateXDomain", true);
    options.withUpdateOrgXDomain = getOption(options, "withUpdateOrgXDomain", true);
    options.withTransitionForExit = false;
    options.withTransitionForTransform = getOption(options, "withTransitionForTransform", options.withTransition);
    // MEMO: this needs to be called before updateLegend and it means this ALWAYS needs to be called)
    $$.updateSizes();
    // MEMO: called in updateLegend in redraw if withLegend
    if (!(options.withLegend && config.legend_show)) {
        transitions = $$.axis.generateTransitions(options.withTransitionForAxis ? config.transition_duration : 0);
        // Update scales
        $$.updateScales();
        $$.updateSvgSize();
        // Update g positions
        $$.transformAll(options.withTransitionForTransform, transitions);
    }
    // Draw with new sizes & scales
    $$.redraw(options, transitions);
};
ChartInternal.prototype.redrawWithoutRescale = function() {
    this.redraw({
        withY: false,
        withSubchart: false,
        withEventRect: false,
        withTransitionForAxis: false
    });
};

ChartInternal.prototype.isTimeSeries = function() {
    return this.config.axis_x_type === 'timeseries';
};
ChartInternal.prototype.isCategorized = function() {
    return this.config.axis_x_type.indexOf('categor') >= 0;
};
ChartInternal.prototype.isCustomX = function() {
    var $$ = this,
        config = $$.config;
    return !$$.isTimeSeries() && (config.data_x || notEmpty(config.data_xs));
};

ChartInternal.prototype.isTimeSeriesY = function() {
    return this.config.axis_y_type === 'timeseries';
};

ChartInternal.prototype.getTranslate = function(target) {
    var $$ = this,
        config = $$.config,
        x, y;
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
        y = $$.arcHeight / 2 - ($$.hasType('gauge') ? 6 : 0); // to prevent wrong display of min and max label
    }
    return "translate(" + x + "," + y + ")";
};
ChartInternal.prototype.initialOpacity = function(d) {
    return d.value !== null && this.withoutFadeIn[d.id] ? 1 : 0;
};
ChartInternal.prototype.initialOpacityForCircle = function(d) {
    return d.value !== null && this.withoutFadeIn[d.id] ? this.opacityForCircle(d) : 0;
};
ChartInternal.prototype.opacityForCircle = function(d) {
    var isPointShouldBeShown = isFunction(this.config.point_show) ? this.config.point_show(d) : this.config.point_show;
    var opacity = isPointShouldBeShown ? 1 : 0;
    return isValue(d.value) ? (this.isScatterType(d) ? 0.5 : opacity) : 0;
};
ChartInternal.prototype.opacityForText = function() {
    return this.hasDataLabel() ? 1 : 0;
};
ChartInternal.prototype.xx = function(d) {
    return d ? this.x(d.x) : null;
};
ChartInternal.prototype.xv = function(d) {
    var $$ = this,
        value = d.value;
    if ($$.isTimeSeries()) {
        value = $$.parseDate(d.value);
    } else if ($$.isCategorized() && typeof d.value === 'string') {
        value = $$.config.axis_x_categories.indexOf(d.value);
    }
    return Math.ceil($$.x(value));
};
ChartInternal.prototype.yv = function(d) {
    var $$ = this,
        yScale = d.axis && d.axis === 'y2' ? $$.y2 : $$.y;
    return Math.ceil(yScale(d.value));
};
ChartInternal.prototype.subxx = function(d) {
    return d ? this.subX(d.x) : null;
};

ChartInternal.prototype.transformMain = function(withTransition, transitions) {
    var $$ = this,
        xAxis, yAxis, y2Axis;
    if (transitions && transitions.axisX) {
        xAxis = transitions.axisX;
    } else {
        xAxis = $$.main.select('.' + CLASS.axisX);
        if (withTransition) {
            xAxis = xAxis.transition();
        }
    }
    if (transitions && transitions.axisY) {
        yAxis = transitions.axisY;
    } else {
        yAxis = $$.main.select('.' + CLASS.axisY);
        if (withTransition) {
            yAxis = yAxis.transition();
        }
    }
    if (transitions && transitions.axisY2) {
        y2Axis = transitions.axisY2;
    } else {
        y2Axis = $$.main.select('.' + CLASS.axisY2);
        if (withTransition) {
            y2Axis = y2Axis.transition();
        }
    }
    (withTransition ? $$.main.transition() : $$.main).attr("transform", $$.getTranslate('main'));
    xAxis.attr("transform", $$.getTranslate('x'));
    yAxis.attr("transform", $$.getTranslate('y'));
    y2Axis.attr("transform", $$.getTranslate('y2'));
    $$.main.select('.' + CLASS.chartArcs).attr("transform", $$.getTranslate('arc'));
};
ChartInternal.prototype.transformAll = function(withTransition, transitions) {
    var $$ = this;
    $$.transformMain(withTransition, transitions);
    if ($$.config.subchart_show) {
        $$.transformContext(withTransition, transitions);
    }
    if ($$.legend) {
        $$.transformLegend(withTransition);
    }
};

ChartInternal.prototype.updateSvgSize = function() {
    var $$ = this,
        brush = $$.svg.select(".c3-brush .overlay");
    $$.svg.attr('width', $$.currentWidth).attr('height', $$.currentHeight);
    $$.svg.selectAll(['#' + $$.clipId, '#' + $$.clipIdForGrid]).select('rect')
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
    $$.svg.select('#' + $$.clipIdForSubchart).select('rect')
        .attr('width', $$.width)
        .attr('height', brush.size() ? brush.attr('height') : 0);
    // MEMO: parent div's height will be bigger than svg when <!DOCTYPE html>
    $$.selectChart.style('max-height', $$.currentHeight + "px");
};

ChartInternal.prototype.updateDimension = function(withoutAxis) {
    var $$ = this;
    if (!withoutAxis) {
        if ($$.config.axis_rotated) {
            $$.axes.x.call($$.xAxis);
            $$.axes.subx.call($$.subXAxis);
        } else {
            $$.axes.y.call($$.yAxis);
            $$.axes.y2.call($$.y2Axis);
        }
    }
    $$.updateSizes();
    $$.updateScales();
    $$.updateSvgSize();
    $$.transformAll(false);
};

ChartInternal.prototype.observeInserted = function(selection) {
    var $$ = this,
        observer;
    if (typeof MutationObserver === 'undefined') {
        window.console.error("MutationObserver not defined.");
        return;
    }
    observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.previousSibling) {
                observer.disconnect();
                // need to wait for completion of load because size calculation requires the actual sizes determined after that completion
                $$.intervalForObserveInserted = window.setInterval(function() {
                    // parentNode will NOT be null when completed
                    if (selection.node().parentNode) {
                        window.clearInterval($$.intervalForObserveInserted);
                        $$.updateDimension();
                        if ($$.brush) {
                            $$.brush.update();
                        }
                        $$.config.oninit.call($$);
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
    observer.observe(selection.node(), {
        attributes: true,
        childList: true,
        characterData: true
    });
};

ChartInternal.prototype.bindResize = function() {
    var $$ = this,
        config = $$.config;

    $$.resizeFunction = $$.generateResize(); // need to call .remove

    $$.resizeFunction.add(function() {
        config.onresize.call($$);
    });
    if (config.resize_auto) {
        $$.resizeFunction.add(function() {
            if ($$.resizeTimeout !== undefined) {
                window.clearTimeout($$.resizeTimeout);
            }
            $$.resizeTimeout = window.setTimeout(function() {
                delete $$.resizeTimeout;
                $$.updateAndRedraw({
                    withUpdateXDomain: false,
                    withUpdateOrgXDomain: false,
                    withTransition: false,
                    withTransitionForTransform: false,
                    withLegend: true,
                });
                if ($$.brush) {
                    $$.brush.update();
                }
            }, 100);
        });
    }
    $$.resizeFunction.add(function() {
        config.onresized.call($$);
    });

    $$.resizeIfElementDisplayed = function() {
        // if element not displayed skip it
        if ($$.api == null || !$$.api.element.offsetParent) {
            return;
        }

        $$.resizeFunction();
    };

    if (window.attachEvent) {
        window.attachEvent('onresize', $$.resizeIfElementDisplayed);
    } else if (window.addEventListener) {
        window.addEventListener('resize', $$.resizeIfElementDisplayed, false);
    } else {
        // fallback to this, if this is a very old browser
        var wrapper = window.onresize;
        if (!wrapper) {
            // create a wrapper that will call all charts
            wrapper = $$.generateResize();
        } else if (!wrapper.add || !wrapper.remove) {
            // there is already a handler registered, make sure we call it too
            wrapper = $$.generateResize();
            wrapper.add(window.onresize);
        }
        // add this graph to the wrapper, we will be removed if the user calls destroy
        wrapper.add($$.resizeFunction);
        window.onresize = function() {
            // if element not displayed skip it
            if (!$$.api.element.offsetParent) {
                return;
            }

            wrapper();
        };
    }
};

ChartInternal.prototype.generateResize = function() {
    var resizeFunctions = [];

    function callResizeFunctions() {
        resizeFunctions.forEach(function(f) {
            f();
        });
    }
    callResizeFunctions.add = function(f) {
        resizeFunctions.push(f);
    };
    callResizeFunctions.remove = function(f) {
        for (var i = 0; i < resizeFunctions.length; i++) {
            if (resizeFunctions[i] === f) {
                resizeFunctions.splice(i, 1);
                break;
            }
        }
    };
    return callResizeFunctions;
};

ChartInternal.prototype.endall = function(transition, callback) {
    var n = 0;
    transition
        .each(function() {
            ++n;
        })
        .on("end", function() {
            if (!--n) {
                callback.apply(this, arguments);
            }
        });
};
ChartInternal.prototype.generateWait = function() {
    var transitionsToWait = [],
        f = function(callback) {
            var timer = setInterval(function() {
                var done = 0;
                transitionsToWait.forEach(function(t) {
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
                    if (callback) {
                        callback();
                    }
                }
            }, 50);
        };
    f.add = function(transition) {
        transitionsToWait.push(transition);
    };
    return f;
};

ChartInternal.prototype.parseDate = function(date) {
    var $$ = this,
        parsedDate;
    if (date instanceof Date) {
        parsedDate = date;
    } else if (typeof date === 'string') {
        parsedDate = $$.dataTimeParse(date);
    } else if (typeof date === 'object') {
        parsedDate = new Date(+date);
    } else if (typeof date === 'number' && !isNaN(date)) {
        parsedDate = new Date(+date);
    }
    if (!parsedDate || isNaN(+parsedDate)) {
        window.console.error("Failed to parse x '" + date + "' to Date object");
    }
    return parsedDate;
};

ChartInternal.prototype.isTabVisible = function() {
    var hidden;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
    }

    return document[hidden] ? false : true;
};

ChartInternal.prototype.getPathBox = getPathBox;
ChartInternal.prototype.CLASS = CLASS;

export {
    Chart
};
export {
    ChartInternal
};
