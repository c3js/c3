import {Axis} from './axis.js';
import d3 from 'd3';
function ChartInternal(api) {
    const $$ = this;
    $$.d3 = window.d3 ? window.d3 : typeof require !== 'undefined' ? require('d3') : undefined;
    $$.api = api;
    $$.config = $$.getDefaultConfig();
    $$.data = {};
    $$.cache = {};
    $$.axes = {};
}

const c3_chart_internal_fn = ChartInternal.prototype;

c3_chart_internal_fn.beforeInit = function () {
    // can do something
};
c3_chart_internal_fn.afterInit = function () {
    // can do something
};
c3_chart_internal_fn.init = function () {
    let $$ = this,
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

c3_chart_internal_fn.initParams = function () {
    let $$ = this,
        d3 = $$.d3,
        config = $$.config;

    // MEMO: clipId needs to be unique because it conflicts when multiple charts exist
    $$.clipId = 'c3-' + (+new Date()) + '-clip',
        $$.clipIdForXAxis = $$.clipId + '-xaxis',
        $$.clipIdForYAxis = $$.clipId + '-yaxis',
        $$.clipIdForGrid = $$.clipId + '-grid',
        $$.clipIdForSubchart = $$.clipId + '-subchart',
        $$.clipPath = $$.getClipPath($$.clipId),
        $$.clipPathForXAxis = $$.getClipPath($$.clipIdForXAxis),
        $$.clipPathForYAxis = $$.getClipPath($$.clipIdForYAxis);
    $$.clipPathForGrid = $$.getClipPath($$.clipIdForGrid),
        $$.clipPathForSubchart = $$.getClipPath($$.clipIdForSubchart),

        $$.dragStart = null;
    $$.dragging = false;
    $$.flowing = false;
    $$.cancelClick = false;
    $$.mouseover = false;
    $$.transiting = false;

    $$.color = $$.generateColor();
    $$.levelColor = $$.generateLevelColor();

    $$.dataTimeFormat = config.data_xLocaltime ? d3.time.format : d3.time.format.utc;
    $$.axisTimeFormat = config.axis_x_localtime ? d3.time.format : d3.time.format.utc;
    $$.defaultAxisTimeFormat = $$.axisTimeFormat.multi([
        ['.%L', function (d) {
            return d.getMilliseconds();
        }],
        [':%S', function (d) {
            return d.getSeconds();
        }],
        ['%I:%M', function (d) {
            return d.getMinutes();
        }],
        ['%I %p', function (d) {
            return d.getHours();
        }],
        ['%-m/%-d', function (d) {
            return d.getDay() && d.getDate() !== 1;
        }],
        ['%-m/%-d', function (d) {
            return d.getDate() !== 1;
        }],
        ['%-m/%-d', function (d) {
            return d.getMonth();
        }],
        ['%Y/%-m/%-d', function () {
            return true;
        }],
    ]);

    $$.hiddenTargetIds = [];
    $$.hiddenLegendIds = [];
    $$.focusedTargetIds = [];
    $$.defocusedTargetIds = [];

    $$.xOrient = config.axis_rotated ? 'left' : 'bottom';
    $$.yOrient = config.axis_rotated ? (config.axis_y_inner ? 'top' : 'bottom') : (config.axis_y_inner ? 'right' : 'left');
    $$.y2Orient = config.axis_rotated ? (config.axis_y2_inner ? 'bottom' : 'top') : (config.axis_y2_inner ? 'left' : 'right');
    $$.subXOrient = config.axis_rotated ? 'left' : 'bottom';

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
        y2: 0,
    };

    $$.rotated_padding_left = 30;
    $$.rotated_padding_right = config.axis_rotated && !config.axis_x_show ? 0 : 30;
    $$.rotated_padding_top = 5;

    $$.withoutFadeIn = {};

    $$.intervalForObserveInserted = undefined;

    $$.axes.subx = d3.selectAll([]); // needs when excluding subchart.js
};

c3_chart_internal_fn.initChartElements = function () {
    if (this.initBar) { this.initBar(); }
    if (this.initLine) { this.initLine(); }
    if (this.initArc) { this.initArc(); }
    if (this.initGauge) { this.initGauge(); }
    if (this.initText) { this.initText(); }
};

c3_chart_internal_fn.initWithData = function (data) {
    let $$ = this,
        d3 = $$.d3,
        config = $$.config;
    let defs, main, binding = true;

    $$.axis = new Axis($$);

    if ($$.initPie) { $$.initPie(); }
    if ($$.initBrush) { $$.initBrush(); }
    if ($$.initZoom) { $$.initZoom(); }

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
    $$.selectChart.html('').classed('c3', true);

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

    /* -- Basic Elements --*/

    // Define svgs
    $$.svg = $$.selectChart.append('svg')
        .style('overflow', 'hidden')
        .on('mouseenter', () => {
            return config.onmouseover.call($$);
        })
        .on('mouseleave', () => {
            return config.onmouseout.call($$);
        });

    if ($$.config.svg_classname) {
        $$.svg.attr('class', $$.config.svg_classname);
    }

    // Define defs
    defs = $$.svg.append('defs');
    $$.clipChart = $$.appendClip(defs, $$.clipId);
    $$.clipXAxis = $$.appendClip(defs, $$.clipIdForXAxis);
    $$.clipYAxis = $$.appendClip(defs, $$.clipIdForYAxis);
    $$.clipGrid = $$.appendClip(defs, $$.clipIdForGrid);
    $$.clipSubchart = $$.appendClip(defs, $$.clipIdForSubchart);
    $$.updateSvgSize();

    // Define regions
    main = $$.main = $$.svg.append('g').attr('transform', $$.getTranslate('main'));

    if ($$.initSubchart) { $$.initSubchart(); }
    if ($$.initTooltip) { $$.initTooltip(); }
    if ($$.initLegend) { $$.initLegend(); }
    if ($$.initTitle) { $$.initTitle(); }

    /* -- Main Region --*/

    // text when empty
    main.append('text')
        .attr('class', CLASS.text + ' ' + CLASS.empty)
        .attr('text-anchor', 'middle') // horizontal centering of text at x position in all browsers.
        .attr('dominant-baseline', 'middle'); // vertical centering of text at y position in all browsers, except IE.

    // Regions
    $$.initRegion();

    // Grids
    $$.initGrid();

    // Define g for chart area
    main.append('g')
        .attr('clip-path', $$.clipPath)
        .attr('class', CLASS.chart);

    // Grid lines
    if (config.grid_lines_front) { $$.initGridLines(); }

    // Cover whole with rects for events
    $$.initEventRect();

    // Define g for chart
    $$.initChartElements();

    // if zoom privileged, insert rect to forefront
    // TODO: is this needed?
    main.insert('rect', config.zoom_privileged ? null : 'g.' + CLASS.regions)
        .attr('class', CLASS.zoomRect)
        .attr('width', $$.width)
        .attr('height', $$.height)
        .style('opacity', 0)
        .on('dblclick.zoom', null);

    // Set default extent if defined
    if (config.axis_x_extent) { $$.brush.extent($$.getDefaultExtent()); }

    // Add Axis
    $$.axis.init();

    // Set targets
    $$.updateTargets($$.data.targets);

    // Draw with targets
    if (binding) {
        $$.updateDimension();
        $$.config.oninit.call($$);
        $$.redraw({
            withTransition: false,
            withTransform: true,
            withUpdateXDomain: true,
            withUpdateOrgXDomain: true,
            withTransitionForAxis: false,
        });
    }

    // Bind resize event
    $$.bindResize();

    // export element of the chart
    $$.api.element = $$.selectChart.node();
};

c3_chart_internal_fn.smoothLines = function (el, type) {
    const $$ = this;
    if (type === 'grid') {
        el.each(function () {
            let g = $$.d3.select(this),
                x1 = g.attr('x1'),
                x2 = g.attr('x2'),
                y1 = g.attr('y1'),
                y2 = g.attr('y2');
            g.attr({
                'x1': Math.ceil(x1),
                'x2': Math.ceil(x2),
                'y1': Math.ceil(y1),
                'y2': Math.ceil(y2),
            });
        });
    }
};


c3_chart_internal_fn.updateSizes = function () {
    let $$ = this,
        config = $$.config;
    let legendHeight = $$.legend ? $$.getLegendHeight() : 0,
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
        left: subchartHeight + (hasArc ? 0 : $$.getCurrentPaddingLeft()),
    } : {
        top: 4 + $$.getCurrentPaddingTop(), // for top tick text
        right: hasArc ? 0 : $$.getCurrentPaddingRight(),
        bottom: xAxisHeight + subchartHeight + legendHeightForBottom + $$.getCurrentPaddingBottom(),
        left: hasArc ? 0 : $$.getCurrentPaddingLeft(),
    };

    // for subchart
    $$.margin2 = config.axis_rotated ? {
        top: $$.margin.top,
        right: NaN,
        bottom: 20 + legendHeightForBottom,
        left: $$.rotated_padding_left,
    } : {
        top: $$.currentHeight - subchartHeight - legendHeightForBottom,
        right: NaN,
        bottom: xAxisHeight + legendHeightForBottom,
        left: $$.margin.left,
    };

    // for legend
    $$.margin3 = {
        top: 0,
        right: NaN,
        bottom: 0,
        left: 0,
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
    if ($$.hasType('gauge') && !config.gauge_fullCircle) {
        $$.arcHeight += $$.height - $$.getGaugeLabelHeight();
    }
    if ($$.updateRadius) { $$.updateRadius(); }

    if ($$.isLegendRight && hasArc) {
        $$.margin3.left = $$.arcWidth / 2 + $$.radiusExpanded * 1.1;
    }
};

c3_chart_internal_fn.updateTargets = function (targets) {
    const $$ = this;

    /* -- Main --*/

    // -- Text --//
    $$.updateTargetsForText(targets);

    // -- Bar --//
    $$.updateTargetsForBar(targets);

    // -- Line --//
    $$.updateTargetsForLine(targets);

    // -- Arc --//
    if ($$.hasArcType() && $$.updateTargetsForArc) { $$.updateTargetsForArc(targets); }

    /* -- Sub --*/

    if ($$.updateTargetsForSubchart) { $$.updateTargetsForSubchart(targets); }

    // Fade-in each chart
    $$.showTargets();
};
c3_chart_internal_fn.showTargets = function () {
    const $$ = this;
    $$.svg.selectAll('.' + CLASS.target).filter((d) => {
        return $$.isTargetToShow(d.id);
    })
        .transition().duration($$.config.transition_duration)
        .style('opacity', 1);
};

c3_chart_internal_fn.redraw = function (options, transitions) {
    let $$ = this,
        main = $$.main,
        d3 = $$.d3,
        config = $$.config;
    let areaIndices = $$.getShapeIndices($$.isAreaType),
        barIndices = $$.getShapeIndices($$.isBarType),
        lineIndices = $$.getShapeIndices($$.isLineType);
    let withY, withSubchart, withTransition, withTransitionForExit, withTransitionForAxis,
        withTransform, withUpdateXDomain, withUpdateOrgXDomain, withTrimXDomain, withLegend,
        withEventRect, withDimension, withUpdateXAxis;
    const hideAxis = $$.hasArcType();
    let drawArea, drawBar, drawLine, xForText, yForText;
    let duration, durationForExit, durationForAxis;
    let waitForDraw, flow;
    let targetsToShow = $$.filterTargetsToShow($$.data.targets),
        tickValues, i, intervalForCulling, xDomainForZoom;
    let xv = $$.xv.bind($$),
        cx, cy;

    options = options || {};
    withY = getOption(options, 'withY', true);
    withSubchart = getOption(options, 'withSubchart', true);
    withTransition = getOption(options, 'withTransition', true);
    withTransform = getOption(options, 'withTransform', false);
    withUpdateXDomain = getOption(options, 'withUpdateXDomain', false);
    withUpdateOrgXDomain = getOption(options, 'withUpdateOrgXDomain', false);
    withTrimXDomain = getOption(options, 'withTrimXDomain', true);
    withUpdateXAxis = getOption(options, 'withUpdateXAxis', withUpdateXDomain);
    withLegend = getOption(options, 'withLegend', false);
    withEventRect = getOption(options, 'withEventRect', true);
    withDimension = getOption(options, 'withDimension', true);
    withTransitionForExit = getOption(options, 'withTransitionForExit', withTransition);
    withTransitionForAxis = getOption(options, 'withTransitionForAxis', withTransition);

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
    $$.axis.redraw(transitions, hideAxis);

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
            $$.svg.selectAll('.' + CLASS.axisX + ' .tick text').each(function (e) {
                const index = tickValues.indexOf(e);
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

    // Update sub domain
    if (withY) {
        $$.subY.domain($$.getYDomain(targetsToShow, 'y'));
        $$.subY2.domain($$.getYDomain(targetsToShow, 'y2'));
    }

    // xgrid focus
    $$.updateXgridFocus();

    // Data empty label positioning and text.
    main.select('text.' + CLASS.text + '.' + CLASS.empty)
        .attr('x', $$.width / 2)
        .attr('y', $$.height / 2)
        .text(config.data_empty_label_text)
        .transition()
        .style('opacity', targetsToShow.length ? 0 : 1);

    // grid
    $$.updateGrid(duration);

    // rect for regions
    $$.updateRegion(duration);

    // bars
    $$.updateBar(durationForExit);

    // lines, areas and cricles
    $$.updateLine(durationForExit);
    $$.updateArea(durationForExit);
    $$.updateCircle();

    // text
    if ($$.hasDataLabel()) {
        $$.updateText(durationForExit);
    }

    // title
    if ($$.redrawTitle) { $$.redrawTitle(); }

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

    // event rects will redrawn when flow called
    if (config.interaction_enabled && !options.flow && withEventRect) {
        $$.redrawEventRect();
        if ($$.updateZoom) { $$.updateZoom(); }
    }

    // update circleY based on updated parameters
    $$.updateCircleY();

    // generate circle x/y functions depending on updated params
    cx = ($$.config.axis_rotated ? $$.circleY : $$.circleX).bind($$);
    cy = ($$.config.axis_rotated ? $$.circleX : $$.circleY).bind($$);

    if (options.flow) {
        flow = $$.generateFlow({
            targets: targetsToShow,
            flow: options.flow,
            duration: options.flow.duration,
            drawBar,
            drawLine,
            drawArea,
            cx,
            cy,
            xv,
            xForText,
            yForText,
        });
    }

    if ((duration || flow) && $$.isTabVisible()) { // Only use transition if tab visible. See #938.
        // transition should be derived from one transition
        d3.transition().duration(duration).each(() => {
            const transitionsToWait = [];

                // redraw and gather transitions
            [
                $$.redrawBar(drawBar, true),
                $$.redrawLine(drawLine, true),
                $$.redrawArea(drawArea, true),
                $$.redrawCircle(cx, cy, true),
                $$.redrawText(xForText, yForText, options.flow, true),
                $$.redrawRegion(true),
                $$.redrawGrid(true),
            ].forEach((transitions) => {
                transitions.forEach((transition) => {
                    transitionsToWait.push(transition);
                });
            });

                // Wait for end of transitions to call flow and onrendered callback
            waitForDraw = $$.generateWait();
            transitionsToWait.forEach((t) => {
                waitForDraw.add(t);
            });
        })
            .call(waitForDraw, () => {
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
        if (config.onrendered) {
            config.onrendered.call($$);
        }
    }

    // update fadein condition
    $$.mapToIds($$.data.targets).forEach((id) => {
        $$.withoutFadeIn[id] = true;
    });
};

c3_chart_internal_fn.updateAndRedraw = function (options) {
    let $$ = this,
        config = $$.config,
        transitions;
    options = options || {};
    // same with redraw
    options.withTransition = getOption(options, 'withTransition', true);
    options.withTransform = getOption(options, 'withTransform', false);
    options.withLegend = getOption(options, 'withLegend', false);
    // NOT same with redraw
    options.withUpdateXDomain = true;
    options.withUpdateOrgXDomain = true;
    options.withTransitionForExit = false;
    options.withTransitionForTransform = getOption(options, 'withTransitionForTransform', options.withTransition);
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
c3_chart_internal_fn.redrawWithoutRescale = function () {
    this.redraw({
        withY: false,
        withSubchart: false,
        withEventRect: false,
        withTransitionForAxis: false,
    });
};

c3_chart_internal_fn.isTimeSeries = function () {
    return this.config.axis_x_type === 'timeseries';
};
c3_chart_internal_fn.isCategorized = function () {
    return this.config.axis_x_type.indexOf('categor') >= 0;
};
c3_chart_internal_fn.isCustomX = function () {
    let $$ = this,
        config = $$.config;
    return !$$.isTimeSeries() && (config.data_x || notEmpty(config.data_xs));
};

c3_chart_internal_fn.isTimeSeriesY = function () {
    return this.config.axis_y_type === 'timeseries';
};

c3_chart_internal_fn.getTranslate = function (target) {
    let $$ = this,
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
        y = $$.arcHeight / 2;
    }
    return 'translate(' + x + ',' + y + ')';
};
c3_chart_internal_fn.initialOpacity = function (d) {
    return d.value !== null && this.withoutFadeIn[d.id] ? 1 : 0;
};
c3_chart_internal_fn.initialOpacityForCircle = function (d) {
    return d.value !== null && this.withoutFadeIn[d.id] ? this.opacityForCircle(d) : 0;
};
c3_chart_internal_fn.opacityForCircle = function (d) {
    const opacity = this.config.point_show ? 1 : 0;
    return isValue(d.value) ? (this.isScatterType(d) ? 0.5 : opacity) : 0;
};
c3_chart_internal_fn.opacityForText = function () {
    return this.hasDataLabel() ? 1 : 0;
};
c3_chart_internal_fn.xx = function (d) {
    return d ? this.x(d.x) : null;
};
c3_chart_internal_fn.xv = function (d) {
    let $$ = this,
        value = d.value;
    if ($$.isTimeSeries()) {
        value = $$.parseDate(d.value);
    } else if ($$.isCategorized() && typeof d.value === 'string') {
        value = $$.config.axis_x_categories.indexOf(d.value);
    }
    return Math.ceil($$.x(value));
};
c3_chart_internal_fn.yv = function (d) {
    let $$ = this,
        yScale = d.axis && d.axis === 'y2' ? $$.y2 : $$.y;
    return Math.ceil(yScale(d.value));
};
c3_chart_internal_fn.subxx = function (d) {
    return d ? this.subX(d.x) : null;
};

c3_chart_internal_fn.transformMain = function (withTransition, transitions) {
    let $$ = this,
        xAxis, yAxis, y2Axis;
    if (transitions && transitions.axisX) {
        xAxis = transitions.axisX;
    } else {
        xAxis = $$.main.select('.' + CLASS.axisX);
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
    (withTransition ? $$.main.transition() : $$.main).attr('transform', $$.getTranslate('main'));
    xAxis.attr('transform', $$.getTranslate('x'));
    yAxis.attr('transform', $$.getTranslate('y'));
    y2Axis.attr('transform', $$.getTranslate('y2'));
    $$.main.select('.' + CLASS.chartArcs).attr('transform', $$.getTranslate('arc'));
};
c3_chart_internal_fn.transformAll = function (withTransition, transitions) {
    const $$ = this;
    $$.transformMain(withTransition, transitions);
    if ($$.config.subchart_show) { $$.transformContext(withTransition, transitions); }
    if ($$.legend) { $$.transformLegend(withTransition); }
};

c3_chart_internal_fn.updateSvgSize = function () {
    let $$ = this,
        brush = $$.svg.select('.c3-brush .background');
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
    $$.svg.select('.' + CLASS.zoomRect)
        .attr('width', $$.width)
        .attr('height', $$.height);
    // MEMO: parent div's height will be bigger than svg when <!DOCTYPE html>
    $$.selectChart.style('max-height', $$.currentHeight + 'px');
};


c3_chart_internal_fn.updateDimension = function (withoutAxis) {
    const $$ = this;
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

c3_chart_internal_fn.observeInserted = function (selection) {
    let $$ = this,
        observer;
    if (typeof MutationObserver === 'undefined') {
        window.console.error('MutationObserver not defined.');
        return;
    }
    observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.previousSibling) {
                observer.disconnect();
                // need to wait for completion of load because size calculation requires the actual sizes determined after that completion
                $$.intervalForObserveInserted = window.setInterval(() => {
                    // parentNode will NOT be null when completed
                    if (selection.node().parentNode) {
                        window.clearInterval($$.intervalForObserveInserted);
                        $$.updateDimension();
                        if ($$.brush) { $$.brush.update(); }
                        $$.config.oninit.call($$);
                        $$.redraw({
                            withTransform: true,
                            withUpdateXDomain: true,
                            withUpdateOrgXDomain: true,
                            withTransition: false,
                            withTransitionForTransform: false,
                            withLegend: true,
                        });
                        selection.transition().style('opacity', 1);
                    }
                }, 10);
            }
        });
    });
    observer.observe(selection.node(), { attributes: true, childList: true, characterData: true });
};

c3_chart_internal_fn.bindResize = function () {
    let $$ = this,
        config = $$.config;

    $$.resizeFunction = $$.generateResize();

    $$.resizeFunction.add(() => {
        config.onresize.call($$);
    });
    if (config.resize_auto) {
        $$.resizeFunction.add(() => {
            if ($$.resizeTimeout !== undefined) {
                window.clearTimeout($$.resizeTimeout);
            }
            $$.resizeTimeout = window.setTimeout(() => {
                delete $$.resizeTimeout;
                $$.api.flush();
            }, 100);
        });
    }
    $$.resizeFunction.add(() => {
        config.onresized.call($$);
    });

    if (window.attachEvent) {
        window.attachEvent('onresize', $$.resizeFunction);
    } else if (window.addEventListener) {
        window.addEventListener('resize', $$.resizeFunction, false);
    } else {
        // fallback to this, if this is a very old browser
        let wrapper = window.onresize;
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
        window.onresize = wrapper;
    }
};

c3_chart_internal_fn.generateResize = function () {
    const resizeFunctions = [];

    function callResizeFunctions() {
        resizeFunctions.forEach((f) => {
            f();
        });
    }
    callResizeFunctions.add = function (f) {
        resizeFunctions.push(f);
    };
    callResizeFunctions.remove = function (f) {
        for (let i = 0; i < resizeFunctions.length; i++) {
            if (resizeFunctions[i] === f) {
                resizeFunctions.splice(i, 1);
                break;
            }
        }
    };
    return callResizeFunctions;
};

c3_chart_internal_fn.endall = function (transition, callback) {
    let n = 0;
    transition
        .each(() => { ++n; })
        .each('end', function () {
            if (!--n) { callback.apply(this, arguments); }
        });
};
c3_chart_internal_fn.generateWait = function () {
    let transitionsToWait = [],
        f = function (transition, callback) {
            const timer = setInterval(() => {
                let done = 0;
                transitionsToWait.forEach((t) => {
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
    let $$ = this,
        parsedDate;
    if (date instanceof Date) {
        parsedDate = date;
    } else if (typeof date === 'string') {
        parsedDate = $$.dataTimeFormat($$.config.data_xFormat).parse(date);
    } else if (typeof date === 'number' && !isNaN(date)) {
        parsedDate = new Date(+date);
    }
    if (!parsedDate || isNaN(+parsedDate)) {
        window.console.error("Failed to parse x '" + date + "' to Date object");
    }
    return parsedDate;
};

c3_chart_internal_fn.isTabVisible = function () {
    let hidden;
    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
        hidden = 'hidden';
    } else if (typeof document.mozHidden !== 'undefined') {
        hidden = 'mozHidden';
    } else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
    } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
    }

    return document[hidden] ? false : true;
};

c3_chart_internal_fn.getDefaultConfig = function () {
    const config = {
        bindto: '#chart',
        svg_classname: undefined,
        size_width: undefined,
        size_height: undefined,
        padding_left: undefined,
        padding_right: undefined,
        padding_top: undefined,
        padding_bottom: undefined,
        resize_auto: true,
        zoom_enabled: false,
        zoom_extent: undefined,
        zoom_privileged: false,
        zoom_rescale: false,
        zoom_onzoom() {},
        zoom_onzoomstart() {},
        zoom_onzoomend() {},
        zoom_x_min: undefined,
        zoom_x_max: undefined,
        interaction_brighten: true,
        interaction_enabled: true,
        onmouseover() {},
        onmouseout() {},
        onresize() {},
        onresized() {},
        oninit() {},
        onrendered() {},
        transition_duration: 350,
        data_x: undefined,
        data_xs: {},
        data_xFormat: '%Y-%m-%d',
        data_xLocaltime: true,
        data_xSort: true,
        data_idConverter(id) { return id; },
        data_names: {},
        data_classes: {},
        data_groups: [],
        data_axes: {},
        data_type: undefined,
        data_types: {},
        data_labels: {},
        data_order: 'desc',
        data_regions: {},
        data_color: undefined,
        data_colors: {},
        data_hide: false,
        data_filter: undefined,
        data_selection_enabled: false,
        data_selection_grouped: false,
        data_selection_isselectable() { return true; },
        data_selection_multiple: true,
        data_selection_draggable: false,
        data_onclick() {},
        data_onmouseover() {},
        data_onmouseout() {},
        data_onselected() {},
        data_onunselected() {},
        data_url: undefined,
        data_headers: undefined,
        data_json: undefined,
        data_rows: undefined,
        data_columns: undefined,
        data_mimeType: undefined,
        data_keys: undefined,
        // configuration for no plot-able data supplied.
        data_empty_label_text: '',
        // subchart
        subchart_show: false,
        subchart_size_height: 60,
        subchart_axis_x_show: true,
        subchart_onbrush() {},
        // color
        color_pattern: [],
        color_threshold: {},
        // legend
        legend_show: true,
        legend_hide: false,
        legend_position: 'bottom',
        legend_inset_anchor: 'top-left',
        legend_inset_x: 10,
        legend_inset_y: 0,
        legend_inset_step: undefined,
        legend_item_onclick: undefined,
        legend_item_onmouseover: undefined,
        legend_item_onmouseout: undefined,
        legend_equally: false,
        legend_padding: 0,
        legend_item_tile_width: 10,
        legend_item_tile_height: 10,
        // axis
        axis_rotated: false,
        axis_x_show: true,
        axis_x_type: 'indexed',
        axis_x_localtime: true,
        axis_x_categories: [],
        axis_x_tick_centered: false,
        axis_x_tick_format: undefined,
        axis_x_tick_culling: {},
        axis_x_tick_culling_max: 10,
        axis_x_tick_count: undefined,
        axis_x_tick_fit: true,
        axis_x_tick_values: null,
        axis_x_tick_rotate: 0,
        axis_x_tick_outer: true,
        axis_x_tick_multiline: true,
        axis_x_tick_width: null,
        axis_x_max: undefined,
        axis_x_min: undefined,
        axis_x_padding: {},
        axis_x_height: undefined,
        axis_x_extent: undefined,
        axis_x_label: {},
        axis_y_show: true,
        axis_y_type: undefined,
        axis_y_max: undefined,
        axis_y_min: undefined,
        axis_y_inverted: false,
        axis_y_center: undefined,
        axis_y_inner: undefined,
        axis_y_label: {},
        axis_y_tick_format: undefined,
        axis_y_tick_outer: true,
        axis_y_tick_values: null,
        axis_y_tick_rotate: 0,
        axis_y_tick_count: undefined,
        axis_y_tick_time_value: undefined,
        axis_y_tick_time_interval: undefined,
        axis_y_padding: {},
        axis_y_default: undefined,
        axis_y2_show: false,
        axis_y2_max: undefined,
        axis_y2_min: undefined,
        axis_y2_inverted: false,
        axis_y2_center: undefined,
        axis_y2_inner: undefined,
        axis_y2_label: {},
        axis_y2_tick_format: undefined,
        axis_y2_tick_outer: true,
        axis_y2_tick_values: null,
        axis_y2_tick_count: undefined,
        axis_y2_padding: {},
        axis_y2_default: undefined,
        // grid
        grid_x_show: false,
        grid_x_type: 'tick',
        grid_x_lines: [],
        grid_y_show: false,
        // not used
        // grid_y_type: 'tick',
        grid_y_lines: [],
        grid_y_ticks: 10,
        grid_focus_show: true,
        grid_lines_front: true,
        // point - point of each data
        point_show: true,
        point_r: 2.5,
        point_sensitivity: 10,
        point_focus_expand_enabled: true,
        point_focus_expand_r: undefined,
        point_select_r: undefined,
        // line
        line_connectNull: false,
        line_step_type: 'step',
        // bar
        bar_width: undefined,
        bar_width_ratio: 0.6,
        bar_width_max: undefined,
        bar_zerobased: true,
        // area
        area_zerobased: true,
        area_above: false,
        // pie
        pie_label_show: true,
        pie_label_format: undefined,
        pie_label_threshold: 0.05,
        pie_label_ratio: undefined,
        pie_expand: {},
        pie_expand_duration: 50,
        // gauge
        gauge_fullCircle: false,
        gauge_label_show: true,
        gauge_label_format: undefined,
        gauge_min: 0,
        gauge_max: 100,
        gauge_startingAngle: -1 * Math.PI / 2,
        gauge_units: undefined,
        gauge_width: undefined,
        gauge_expand: {},
        gauge_expand_duration: 50,
        // donut
        donut_label_show: true,
        donut_label_format: undefined,
        donut_label_threshold: 0.05,
        donut_label_ratio: undefined,
        donut_width: undefined,
        donut_title: '',
        donut_expand: {},
        donut_expand_duration: 50,
        // spline
        spline_interpolation_type: 'cardinal',
        // region - region to change style
        regions: [],
        // tooltip - show when mouseover on each data
        tooltip_show: true,
        tooltip_grouped: true,
        tooltip_format_title: undefined,
        tooltip_format_name: undefined,
        tooltip_format_value: undefined,
        tooltip_position: undefined,
        tooltip_contents(d, defaultTitleFormat, defaultValueFormat, color) {
            return this.getTooltipContent ? this.getTooltipContent(d, defaultTitleFormat, defaultValueFormat, color) : '';
        },
        tooltip_init_show: false,
        tooltip_init_x: 0,
        tooltip_init_position: { top: '0px', left: '50px' },
        tooltip_onshow() {},
        tooltip_onhide() {},
        // title
        title_text: undefined,
        title_padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        title_position: 'top-center',
        // TouchEvent configuration
        touch_tap_radius: 20,  // touch movement must be less than this to be a 'tap'
        touch_tap_delay: 500,  //clicks are suppressed for this many ms after a tap
    };

    Object.keys(this.additionalConfig).forEach(function (key) {
        config[key] = this.additionalConfig[key];
    }, this);

    return config;
};
c3_chart_internal_fn.additionalConfig = {};

c3_chart_internal_fn.loadConfig = function (config) {
    let this_config = this.config, target, keys, read;
    function find() {
        const key = keys.shift();
//        console.log("key =>", key, ", target =>", target);
        if (key && target && typeof target === 'object' && key in target) {
            target = target[key];
            return find();
        }
        else if (!key) {
            return target;
        }
        else {
            return undefined;
        }
    }
    Object.keys(this_config).forEach((key) => {
        target = config;
        keys = key.split('_');
        read = find();
//        console.log("CONFIG : ", key, read);
        if (isDefined(read)) {
            this_config[key] = read;
        }
    });
};

c3_chart_internal_fn.getScale = function (min, max, forTimeseries) {
    return (forTimeseries ? this.d3.time.scale() : this.d3.scale.linear()).range([min, max]);
};
c3_chart_internal_fn.getX = function (min, max, domain, offset) {
    let $$ = this,
        scale = $$.getScale(min, max, $$.isTimeSeries()),
        _scale = domain ? scale.domain(domain) : scale, key;
    // Define customized scale if categorized axis
    if ($$.isCategorized()) {
        offset = offset || function () { return 0; };
        scale = function (d, raw) {
            const v = _scale(d) + offset(d);
            return raw ? v : Math.ceil(v);
        };
    } else {
        scale = function (d, raw) {
            const v = _scale(d);
            return raw ? v : Math.ceil(v);
        };
    }
    // define functions
    for (key in _scale) {
        scale[key] = _scale[key];
    }
    scale.orgDomain = function () {
        return _scale.domain();
    };
    // define custom domain() for categorized axis
    if ($$.isCategorized()) {
        scale.domain = function (domain) {
            if (!arguments.length) {
                domain = this.orgDomain();
                return [domain[0], domain[1] + 1];
            }
            _scale.domain(domain);
            return scale;
        };
    }
    return scale;
};
c3_chart_internal_fn.getY = function (min, max, domain) {
    const scale = this.getScale(min, max, this.isTimeSeriesY());
    if (domain) { scale.domain(domain); }
    return scale;
};
c3_chart_internal_fn.getYScale = function (id) {
    return this.axis.getId(id) === 'y2' ? this.y2 : this.y;
};
c3_chart_internal_fn.getSubYScale = function (id) {
    return this.axis.getId(id) === 'y2' ? this.subY2 : this.subY;
};
c3_chart_internal_fn.updateScales = function () {
    let $$ = this, config = $$.config,
        forInit = !$$.x;
    // update edges
    $$.xMin = config.axis_rotated ? 1 : 0;
    $$.xMax = config.axis_rotated ? $$.height : $$.width;
    $$.yMin = config.axis_rotated ? 0 : $$.height;
    $$.yMax = config.axis_rotated ? $$.width : 1;
    $$.subXMin = $$.xMin;
    $$.subXMax = $$.xMax;
    $$.subYMin = config.axis_rotated ? 0 : $$.height2;
    $$.subYMax = config.axis_rotated ? $$.width2 : 1;
    // update scales
    $$.x = $$.getX($$.xMin, $$.xMax, forInit ? undefined : $$.x.orgDomain(), () => { return $$.xAxis.tickOffset(); });
    $$.y = $$.getY($$.yMin, $$.yMax, forInit ? config.axis_y_default : $$.y.domain());
    $$.y2 = $$.getY($$.yMin, $$.yMax, forInit ? config.axis_y2_default : $$.y2.domain());
    $$.subX = $$.getX($$.xMin, $$.xMax, $$.orgXDomain, (d) => { return d % 1 ? 0 : $$.subXAxis.tickOffset(); });
    $$.subY = $$.getY($$.subYMin, $$.subYMax, forInit ? config.axis_y_default : $$.subY.domain());
    $$.subY2 = $$.getY($$.subYMin, $$.subYMax, forInit ? config.axis_y2_default : $$.subY2.domain());
    // update axes
    $$.xAxisTickFormat = $$.axis.getXAxisTickFormat();
    $$.xAxisTickValues = $$.axis.getXAxisTickValues();
    $$.yAxisTickValues = $$.axis.getYAxisTickValues();
    $$.y2AxisTickValues = $$.axis.getY2AxisTickValues();

    $$.xAxis = $$.axis.getXAxis($$.x, $$.xOrient, $$.xAxisTickFormat, $$.xAxisTickValues, config.axis_x_tick_outer);
    $$.subXAxis = $$.axis.getXAxis($$.subX, $$.subXOrient, $$.xAxisTickFormat, $$.xAxisTickValues, config.axis_x_tick_outer);
    $$.yAxis = $$.axis.getYAxis($$.y, $$.yOrient, config.axis_y_tick_format, $$.yAxisTickValues, config.axis_y_tick_outer);
    $$.y2Axis = $$.axis.getYAxis($$.y2, $$.y2Orient, config.axis_y2_tick_format, $$.y2AxisTickValues, config.axis_y2_tick_outer);

    // Set initialized scales to brush and zoom
    if (!forInit) {
        if ($$.brush) { $$.brush.scale($$.subX); }
        if (config.zoom_enabled) { $$.zoom.scale($$.x); }
    }
    // update for arc
    if ($$.updateArc) { $$.updateArc(); }
};

c3_chart_internal_fn.getYDomainMin = function (targets) {
    let $$ = this, config = $$.config,
        ids = $$.mapToIds(targets), ys = $$.getValuesAsIdKeyed(targets),
        j, k, baseId, idsInGroup, id, hasNegativeValue;
    if (config.data_groups.length > 0) {
        hasNegativeValue = $$.hasNegativeValueInTargets(targets);
        for (j = 0; j < config.data_groups.length; j++) {
            // Determine baseId
            idsInGroup = config.data_groups[j].filter((id) => { return ids.indexOf(id) >= 0; });
            if (idsInGroup.length === 0) { continue; }
            baseId = idsInGroup[0];
            // Consider negative values
            if (hasNegativeValue && ys[baseId]) {
                ys[baseId].forEach((v, i) => {
                    ys[baseId][i] = v < 0 ? v : 0;
                });
            }
            // Compute min
            for (k = 1; k < idsInGroup.length; k++) {
                id = idsInGroup[k];
                if (!ys[id]) { continue; }
                ys[id].forEach((v, i) => {
                    if ($$.axis.getId(id) === $$.axis.getId(baseId) && ys[baseId] && !(hasNegativeValue && +v > 0)) {
                        ys[baseId][i] += +v;
                    }
                });
            }
        }
    }
    return $$.d3.min(Object.keys(ys).map((key) => { return $$.d3.min(ys[key]); }));
};
c3_chart_internal_fn.getYDomainMax = function (targets) {
    let $$ = this, config = $$.config,
        ids = $$.mapToIds(targets), ys = $$.getValuesAsIdKeyed(targets),
        j, k, baseId, idsInGroup, id, hasPositiveValue;
    if (config.data_groups.length > 0) {
        hasPositiveValue = $$.hasPositiveValueInTargets(targets);
        for (j = 0; j < config.data_groups.length; j++) {
            // Determine baseId
            idsInGroup = config.data_groups[j].filter((id) => { return ids.indexOf(id) >= 0; });
            if (idsInGroup.length === 0) { continue; }
            baseId = idsInGroup[0];
            // Consider positive values
            if (hasPositiveValue && ys[baseId]) {
                ys[baseId].forEach((v, i) => {
                    ys[baseId][i] = v > 0 ? v : 0;
                });
            }
            // Compute max
            for (k = 1; k < idsInGroup.length; k++) {
                id = idsInGroup[k];
                if (!ys[id]) { continue; }
                ys[id].forEach((v, i) => {
                    if ($$.axis.getId(id) === $$.axis.getId(baseId) && ys[baseId] && !(hasPositiveValue && +v < 0)) {
                        ys[baseId][i] += +v;
                    }
                });
            }
        }
    }
    return $$.d3.max(Object.keys(ys).map((key) => { return $$.d3.max(ys[key]); }));
};
c3_chart_internal_fn.getYDomain = function (targets, axisId, xDomain) {
    let $$ = this, config = $$.config,
        targetsByAxisId = targets.filter((t) => { return $$.axis.getId(t.id) === axisId; }),
        yTargets = xDomain ? $$.filterByXDomain(targetsByAxisId, xDomain) : targetsByAxisId,
        yMin = axisId === 'y2' ? config.axis_y2_min : config.axis_y_min,
        yMax = axisId === 'y2' ? config.axis_y2_max : config.axis_y_max,
        yDomainMin = $$.getYDomainMin(yTargets),
        yDomainMax = $$.getYDomainMax(yTargets),
        domain, domainLength, padding, padding_top, padding_bottom,
        center = axisId === 'y2' ? config.axis_y2_center : config.axis_y_center,
        yDomainAbs, lengths, diff, ratio, isAllPositive, isAllNegative,
        isZeroBased = ($$.hasType('bar', yTargets) && config.bar_zerobased) || ($$.hasType('area', yTargets) && config.area_zerobased),
        isInverted = axisId === 'y2' ? config.axis_y2_inverted : config.axis_y_inverted,
        showHorizontalDataLabel = $$.hasDataLabel() && config.axis_rotated,
        showVerticalDataLabel = $$.hasDataLabel() && !config.axis_rotated;

    // MEMO: avoid inverting domain unexpectedly
    yDomainMin = isValue(yMin) ? yMin : isValue(yMax) ? (yDomainMin < yMax ? yDomainMin : yMax - 10) : yDomainMin;
    yDomainMax = isValue(yMax) ? yMax : isValue(yMin) ? (yMin < yDomainMax ? yDomainMax : yMin + 10) : yDomainMax;

    if (yTargets.length === 0) { // use current domain if target of axisId is none
        return axisId === 'y2' ? $$.y2.domain() : $$.y.domain();
    }
    if (isNaN(yDomainMin)) { // set minimum to zero when not number
        yDomainMin = 0;
    }
    if (isNaN(yDomainMax)) { // set maximum to have same value as yDomainMin
        yDomainMax = yDomainMin;
    }
    if (yDomainMin === yDomainMax) {
        yDomainMin < 0 ? yDomainMax = 0 : yDomainMin = 0;
    }
    isAllPositive = yDomainMin >= 0 && yDomainMax >= 0;
    isAllNegative = yDomainMin <= 0 && yDomainMax <= 0;

    // Cancel zerobased if axis_*_min / axis_*_max specified
    if ((isValue(yMin) && isAllPositive) || (isValue(yMax) && isAllNegative)) {
        isZeroBased = false;
    }

    // Bar/Area chart should be 0-based if all positive|negative
    if (isZeroBased) {
        if (isAllPositive) { yDomainMin = 0; }
        if (isAllNegative) { yDomainMax = 0; }
    }

    domainLength = Math.abs(yDomainMax - yDomainMin);
    padding = padding_top = padding_bottom = domainLength * 0.1;

    if (typeof center !== 'undefined') {
        yDomainAbs = Math.max(Math.abs(yDomainMin), Math.abs(yDomainMax));
        yDomainMax = center + yDomainAbs;
        yDomainMin = center - yDomainAbs;
    }
    // add padding for data label
    if (showHorizontalDataLabel) {
        lengths = $$.getDataLabelLength(yDomainMin, yDomainMax, 'width');
        diff = diffDomain($$.y.range());
        ratio = [lengths[0] / diff, lengths[1] / diff];
        padding_top += domainLength * (ratio[1] / (1 - ratio[0] - ratio[1]));
        padding_bottom += domainLength * (ratio[0] / (1 - ratio[0] - ratio[1]));
    } else if (showVerticalDataLabel) {
        lengths = $$.getDataLabelLength(yDomainMin, yDomainMax, 'height');
        padding_top += $$.axis.convertPixelsToAxisPadding(lengths[1], domainLength);
        padding_bottom += $$.axis.convertPixelsToAxisPadding(lengths[0], domainLength);
    }
    if (axisId === 'y' && notEmpty(config.axis_y_padding)) {
        padding_top = $$.axis.getPadding(config.axis_y_padding, 'top', padding_top, domainLength);
        padding_bottom = $$.axis.getPadding(config.axis_y_padding, 'bottom', padding_bottom, domainLength);
    }
    if (axisId === 'y2' && notEmpty(config.axis_y2_padding)) {
        padding_top = $$.axis.getPadding(config.axis_y2_padding, 'top', padding_top, domainLength);
        padding_bottom = $$.axis.getPadding(config.axis_y2_padding, 'bottom', padding_bottom, domainLength);
    }
    // Bar/Area chart should be 0-based if all positive|negative
    if (isZeroBased) {
        if (isAllPositive) { padding_bottom = yDomainMin; }
        if (isAllNegative) { padding_top = -yDomainMax; }
    }
    domain = [yDomainMin - padding_bottom, yDomainMax + padding_top];
    return isInverted ? domain.reverse() : domain;
};
c3_chart_internal_fn.getXDomainMin = function (targets) {
    let $$ = this, config = $$.config;
    return isDefined(config.axis_x_min) ?
        ($$.isTimeSeries() ? this.parseDate(config.axis_x_min) : config.axis_x_min) :
    $$.d3.min(targets, (t) => { return $$.d3.min(t.values, (v) => { return v.x; }); });
};
c3_chart_internal_fn.getXDomainMax = function (targets) {
    let $$ = this, config = $$.config;
    return isDefined(config.axis_x_max) ?
        ($$.isTimeSeries() ? this.parseDate(config.axis_x_max) : config.axis_x_max) :
    $$.d3.max(targets, (t) => { return $$.d3.max(t.values, (v) => { return v.x; }); });
};
c3_chart_internal_fn.getXDomainPadding = function (domain) {
    let $$ = this, config = $$.config,
        diff = domain[1] - domain[0],
        maxDataCount, padding, paddingLeft, paddingRight;
    if ($$.isCategorized()) {
        padding = 0;
    } else if ($$.hasType('bar')) {
        maxDataCount = $$.getMaxDataCount();
        padding = maxDataCount > 1 ? (diff / (maxDataCount - 1)) / 2 : 0.5;
    } else {
        padding = diff * 0.01;
    }
    if (typeof config.axis_x_padding === 'object' && notEmpty(config.axis_x_padding)) {
        paddingLeft = isValue(config.axis_x_padding.left) ? config.axis_x_padding.left : padding;
        paddingRight = isValue(config.axis_x_padding.right) ? config.axis_x_padding.right : padding;
    } else if (typeof config.axis_x_padding === 'number') {
        paddingLeft = paddingRight = config.axis_x_padding;
    } else {
        paddingLeft = paddingRight = padding;
    }
    return { left: paddingLeft, right: paddingRight };
};
c3_chart_internal_fn.getXDomain = function (targets) {
    let $$ = this,
        xDomain = [$$.getXDomainMin(targets), $$.getXDomainMax(targets)],
        firstX = xDomain[0], lastX = xDomain[1],
        padding = $$.getXDomainPadding(xDomain),
        min = 0, max = 0;
    // show center of x domain if min and max are the same
    if ((firstX - lastX) === 0 && !$$.isCategorized()) {
        if ($$.isTimeSeries()) {
            firstX = new Date(firstX.getTime() * 0.5);
            lastX = new Date(lastX.getTime() * 1.5);
        } else {
            firstX = firstX === 0 ? 1 : (firstX * 0.5);
            lastX = lastX === 0 ? -1 : (lastX * 1.5);
        }
    }
    if (firstX || firstX === 0) {
        min = $$.isTimeSeries() ? new Date(firstX.getTime() - padding.left) : firstX - padding.left;
    }
    if (lastX || lastX === 0) {
        max = $$.isTimeSeries() ? new Date(lastX.getTime() + padding.right) : lastX + padding.right;
    }
    return [min, max];
};
c3_chart_internal_fn.updateXDomain = function (targets, withUpdateXDomain, withUpdateOrgXDomain, withTrim, domain) {
    let $$ = this, config = $$.config;

    if (withUpdateOrgXDomain) {
        $$.x.domain(domain ? domain : $$.d3.extent($$.getXDomain(targets)));
        $$.orgXDomain = $$.x.domain();
        if (config.zoom_enabled) { $$.zoom.scale($$.x).updateScaleExtent(); }
        $$.subX.domain($$.x.domain());
        if ($$.brush) { $$.brush.scale($$.subX); }
    }
    if (withUpdateXDomain) {
        $$.x.domain(domain ? domain : (!$$.brush || $$.brush.empty()) ? $$.orgXDomain : $$.brush.extent());
        if (config.zoom_enabled) { $$.zoom.scale($$.x).updateScaleExtent(); }
    }

    // Trim domain when too big by zoom mousemove event
    if (withTrim) { $$.x.domain($$.trimXDomain($$.x.orgDomain())); }

    return $$.x.domain();
};
c3_chart_internal_fn.trimXDomain = function (domain) {
    let zoomDomain = this.getZoomDomain(),
        min = zoomDomain[0], max = zoomDomain[1];
    if (domain[0] <= min) {
        domain[1] = +domain[1] + (min - domain[0]);
        domain[0] = min;
    }
    if (max <= domain[1]) {
        domain[0] = +domain[0] - (domain[1] - max);
        domain[1] = max;
    }
    return domain;
};

c3_chart_internal_fn.isX = function (key) {
    let $$ = this, config = $$.config;
    return (config.data_x && key === config.data_x) || (notEmpty(config.data_xs) && hasValue(config.data_xs, key));
};
c3_chart_internal_fn.isNotX = function (key) {
    return !this.isX(key);
};
c3_chart_internal_fn.getXKey = function (id) {
    let $$ = this, config = $$.config;
    return config.data_x ? config.data_x : notEmpty(config.data_xs) ? config.data_xs[id] : null;
};
c3_chart_internal_fn.getXValuesOfXKey = function (key, targets) {
    let $$ = this,
        xValues, ids = targets && notEmpty(targets) ? $$.mapToIds(targets) : [];
    ids.forEach((id) => {
        if ($$.getXKey(id) === key) {
            xValues = $$.data.xs[id];
        }
    });
    return xValues;
};
c3_chart_internal_fn.getIndexByX = function (x) {
    let $$ = this,
        data = $$.filterByX($$.data.targets, x);
    return data.length ? data[0].index : null;
};
c3_chart_internal_fn.getXValue = function (id, i) {
    const $$ = this;
    return id in $$.data.xs && $$.data.xs[id] && isValue($$.data.xs[id][i]) ? $$.data.xs[id][i] : i;
};
c3_chart_internal_fn.getOtherTargetXs = function () {
    let $$ = this,
        idsForX = Object.keys($$.data.xs);
    return idsForX.length ? $$.data.xs[idsForX[0]] : null;
};
c3_chart_internal_fn.getOtherTargetX = function (index) {
    const xs = this.getOtherTargetXs();
    return xs && index < xs.length ? xs[index] : null;
};
c3_chart_internal_fn.addXs = function (xs) {
    const $$ = this;
    Object.keys(xs).forEach((id) => {
        $$.config.data_xs[id] = xs[id];
    });
};
c3_chart_internal_fn.hasMultipleX = function (xs) {
    return this.d3.set(Object.keys(xs).map((id) => { return xs[id]; })).size() > 1;
};
c3_chart_internal_fn.isMultipleX = function () {
    return notEmpty(this.config.data_xs) || !this.config.data_xSort || this.hasType('scatter');
};
c3_chart_internal_fn.addName = function (data) {
    let $$ = this, name;
    if (data) {
        name = $$.config.data_names[data.id];
        data.name = name !== undefined ? name : data.id;
    }
    return data;
};
c3_chart_internal_fn.getValueOnIndex = function (values, index) {
    const valueOnIndex = values.filter((v) => { return v.index === index; });
    return valueOnIndex.length ? valueOnIndex[0] : null;
};
c3_chart_internal_fn.updateTargetX = function (targets, x) {
    const $$ = this;
    targets.forEach((t) => {
        t.values.forEach((v, i) => {
            v.x = $$.generateTargetX(x[i], t.id, i);
        });
        $$.data.xs[t.id] = x;
    });
};
c3_chart_internal_fn.updateTargetXs = function (targets, xs) {
    const $$ = this;
    targets.forEach((t) => {
        if (xs[t.id]) {
            $$.updateTargetX([t], xs[t.id]);
        }
    });
};
c3_chart_internal_fn.generateTargetX = function (rawX, id, index) {
    let $$ = this, x;
    if ($$.isTimeSeries()) {
        x = rawX ? $$.parseDate(rawX) : $$.parseDate($$.getXValue(id, index));
    }
    else if ($$.isCustomX() && !$$.isCategorized()) {
        x = isValue(rawX) ? +rawX : $$.getXValue(id, index);
    }
    else {
        x = index;
    }
    return x;
};
c3_chart_internal_fn.cloneTarget = function (target) {
    return {
        id: target.id,
        id_org: target.id_org,
        values: target.values.map((d) => {
            return { x: d.x, value: d.value, id: d.id };
        }),
    };
};
c3_chart_internal_fn.updateXs = function () {
    const $$ = this;
    if ($$.data.targets.length) {
        $$.xs = [];
        $$.data.targets[0].values.forEach((v) => {
            $$.xs[v.index] = v.x;
        });
    }
};
c3_chart_internal_fn.getPrevX = function (i) {
    const x = this.xs[i - 1];
    return typeof x !== 'undefined' ? x : null;
};
c3_chart_internal_fn.getNextX = function (i) {
    const x = this.xs[i + 1];
    return typeof x !== 'undefined' ? x : null;
};
c3_chart_internal_fn.getMaxDataCount = function () {
    const $$ = this;
    return $$.d3.max($$.data.targets, (t) => { return t.values.length; });
};
c3_chart_internal_fn.getMaxDataCountTarget = function (targets) {
    let length = targets.length, max = 0, maxTarget;
    if (length > 1) {
        targets.forEach((t) => {
            if (t.values.length > max) {
                maxTarget = t;
                max = t.values.length;
            }
        });
    } else {
        maxTarget = length ? targets[0] : null;
    }
    return maxTarget;
};
c3_chart_internal_fn.getEdgeX = function (targets) {
    const $$ = this;
    return !targets.length ? [0, 0] : [
        $$.d3.min(targets, (t) => { return t.values[0].x; }),
        $$.d3.max(targets, (t) => { return t.values[t.values.length - 1].x; }),
    ];
};
c3_chart_internal_fn.mapToIds = function (targets) {
    return targets.map((d) => { return d.id; });
};
c3_chart_internal_fn.mapToTargetIds = function (ids) {
    const $$ = this;
    return ids ? [].concat(ids) : $$.mapToIds($$.data.targets);
};
c3_chart_internal_fn.hasTarget = function (targets, id) {
    let ids = this.mapToIds(targets), i;
    for (i = 0; i < ids.length; i++) {
        if (ids[i] === id) {
            return true;
        }
    }
    return false;
};
c3_chart_internal_fn.isTargetToShow = function (targetId) {
    return this.hiddenTargetIds.indexOf(targetId) < 0;
};
c3_chart_internal_fn.isLegendToShow = function (targetId) {
    return this.hiddenLegendIds.indexOf(targetId) < 0;
};
c3_chart_internal_fn.filterTargetsToShow = function (targets) {
    const $$ = this;
    return targets.filter((t) => { return $$.isTargetToShow(t.id); });
};
c3_chart_internal_fn.mapTargetsToUniqueXs = function (targets) {
    const $$ = this;
    let xs = $$.d3.set($$.d3.merge(targets.map((t) => { return t.values.map((v) => { return +v.x; }); }))).values();
    xs = $$.isTimeSeries() ? xs.map((x) => { return new Date(+x); }) : xs.map((x) => { return +x; });
    return xs.sort((a, b) => { return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN; });
};
c3_chart_internal_fn.addHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.concat(targetIds);
};
c3_chart_internal_fn.removeHiddenTargetIds = function (targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.filter((id) => { return targetIds.indexOf(id) < 0; });
};
c3_chart_internal_fn.addHiddenLegendIds = function (targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.concat(targetIds);
};
c3_chart_internal_fn.removeHiddenLegendIds = function (targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.filter((id) => { return targetIds.indexOf(id) < 0; });
};
c3_chart_internal_fn.getValuesAsIdKeyed = function (targets) {
    const ys = {};
    targets.forEach((t) => {
        ys[t.id] = [];
        t.values.forEach((v) => {
            ys[t.id].push(v.value);
        });
    });
    return ys;
};
c3_chart_internal_fn.checkValueInTargets = function (targets, checker) {
    let ids = Object.keys(targets), i, j, values;
    for (i = 0; i < ids.length; i++) {
        values = targets[ids[i]].values;
        for (j = 0; j < values.length; j++) {
            if (checker(values[j].value)) {
                return true;
            }
        }
    }
    return false;
};
c3_chart_internal_fn.hasNegativeValueInTargets = function (targets) {
    return this.checkValueInTargets(targets, (v) => { return v < 0; });
};
c3_chart_internal_fn.hasPositiveValueInTargets = function (targets) {
    return this.checkValueInTargets(targets, (v) => { return v > 0; });
};
c3_chart_internal_fn.isOrderDesc = function () {
    const config = this.config;
    return typeof (config.data_order) === 'string' && config.data_order.toLowerCase() === 'desc';
};
c3_chart_internal_fn.isOrderAsc = function () {
    const config = this.config;
    return typeof (config.data_order) === 'string' && config.data_order.toLowerCase() === 'asc';
};
c3_chart_internal_fn.orderTargets = function (targets) {
    let $$ = this, config = $$.config, orderAsc = $$.isOrderAsc(), orderDesc = $$.isOrderDesc();
    if (orderAsc || orderDesc) {
        targets.sort((t1, t2) => {
            const reducer = function (p, c) { return p + Math.abs(c.value); };
            let t1Sum = t1.values.reduce(reducer, 0),
                t2Sum = t2.values.reduce(reducer, 0);
            return orderAsc ? t2Sum - t1Sum : t1Sum - t2Sum;
        });
    } else if (isFunction(config.data_order)) {
        targets.sort(config.data_order);
    } // TODO: accept name array for order
    return targets;
};
c3_chart_internal_fn.filterByX = function (targets, x) {
    return this.d3.merge(targets.map((t) => { return t.values; })).filter((v) => { return v.x - x === 0; });
};
c3_chart_internal_fn.filterRemoveNull = function (data) {
    return data.filter((d) => { return isValue(d.value); });
};
c3_chart_internal_fn.filterByXDomain = function (targets, xDomain) {
    return targets.map((t) => {
        return {
            id: t.id,
            id_org: t.id_org,
            values: t.values.filter((v) => {
                return xDomain[0] <= v.x && v.x <= xDomain[1];
            }),
        };
    });
};
c3_chart_internal_fn.hasDataLabel = function () {
    const config = this.config;
    if (typeof config.data_labels === 'boolean' && config.data_labels) {
        return true;
    } else if (typeof config.data_labels === 'object' && notEmpty(config.data_labels)) {
        return true;
    }
    return false;
};
c3_chart_internal_fn.getDataLabelLength = function (min, max, key) {
    let $$ = this,
        lengths = [0, 0], paddingCoef = 1.3;
    $$.selectChart.select('svg').selectAll('.dummy')
        .data([min, max])
        .enter().append('text')
        .text((d) => { return $$.dataLabelFormat(d.id)(d); })
        .each(function (d, i) {
            lengths[i] = this.getBoundingClientRect()[key] * paddingCoef;
        })
        .remove();
    return lengths;
};
c3_chart_internal_fn.isNoneArc = function (d) {
    return this.hasTarget(this.data.targets, d.id);
},
c3_chart_internal_fn.isArc = function (d) {
    return 'data' in d && this.hasTarget(this.data.targets, d.data.id);
};
c3_chart_internal_fn.findSameXOfValues = function (values, index) {
    let i, targetX = values[index].x, sames = [];
    for (i = index - 1; i >= 0; i--) {
        if (targetX !== values[i].x) { break; }
        sames.push(values[i]);
    }
    for (i = index; i < values.length; i++) {
        if (targetX !== values[i].x) { break; }
        sames.push(values[i]);
    }
    return sames;
};

c3_chart_internal_fn.findClosestFromTargets = function (targets, pos) {
    let $$ = this, candidates;

    // map to array of closest points of each target
    candidates = targets.map((target) => {
        return $$.findClosest(target.values, pos);
    });

    // decide closest point and return
    return $$.findClosest(candidates, pos);
};
c3_chart_internal_fn.findClosest = function (values, pos) {
    let $$ = this, minDist = $$.config.point_sensitivity, closest;

    // find mouseovering bar
    values.filter((v) => { return v && $$.isBarType(v.id); }).forEach((v) => {
        const shape = $$.main.select('.' + CLASS.bars + $$.getTargetSelectorSuffix(v.id) + ' .' + CLASS.bar + '-' + v.index).node();
        if (!closest && $$.isWithinBar(shape)) {
            closest = v;
        }
    });

    // find closest point from non-bar
    values.filter((v) => { return v && !$$.isBarType(v.id); }).forEach((v) => {
        const d = $$.dist(v, pos);
        if (d < minDist) {
            minDist = d;
            closest = v;
        }
    });

    return closest;
};
c3_chart_internal_fn.dist = function (data, pos) {
    let $$ = this, config = $$.config,
        xIndex = config.axis_rotated ? 1 : 0,
        yIndex = config.axis_rotated ? 0 : 1,
        y = $$.circleY(data, data.index),
        x = $$.x(data.x);
    return Math.sqrt(Math.pow(x - pos[xIndex], 2) + Math.pow(y - pos[yIndex], 2));
};
c3_chart_internal_fn.convertValuesToStep = function (values) {
    let converted = [].concat(values), i;

    if (!this.isCategorized()) {
        return values;
    }

    for (i = values.length + 1; 0 < i; i--) {
        converted[i] = converted[i - 1];
    }

    converted[0] = {
        x: converted[0].x - 1,
        value: converted[0].value,
        id: converted[0].id,
    };
    converted[values.length + 1] = {
        x: converted[values.length].x + 1,
        value: converted[values.length].value,
        id: converted[values.length].id,
    };

    return converted;
};
c3_chart_internal_fn.updateDataAttributes = function (name, attrs) {
    let $$ = this, config = $$.config, current = config['data_' + name];
    if (typeof attrs === 'undefined') { return current; }
    Object.keys(attrs).forEach((id) => {
        current[id] = attrs[id];
    });
    $$.redraw({ withLegend: true });
    return current;
};

c3_chart_internal_fn.convertUrlToData = function (url, mimeType, headers, keys, done) {
    let $$ = this, type = mimeType ? mimeType : 'csv';
    const req = $$.d3.xhr(url);
    if (headers) {
        Object.keys(headers).forEach((header) => {
            req.header(header, headers[header]);
        });
    }
    req.get((error, data) => {
        let d;
        if (!data) {
            throw new Error(error.responseURL + ' ' + error.status + ' (' + error.statusText + ')');
        }
        if (type === 'json') {
            d = $$.convertJsonToData(JSON.parse(data.response), keys);
        } else if (type === 'tsv') {
            d = $$.convertTsvToData(data.response);
        } else {
            d = $$.convertCsvToData(data.response);
        }
        done.call($$, d);
    });
};
c3_chart_internal_fn.convertXsvToData = function (xsv, parser) {
    let rows = parser.parseRows(xsv), d;
    if (rows.length === 1) {
        d = [{}];
        rows[0].forEach((id) => {
            d[0][id] = null;
        });
    } else {
        d = parser.parse(xsv);
    }
    return d;
};
c3_chart_internal_fn.convertCsvToData = function (csv) {
    return this.convertXsvToData(csv, this.d3.csv);
};
c3_chart_internal_fn.convertTsvToData = function (tsv) {
    return this.convertXsvToData(tsv, this.d3.tsv);
};
c3_chart_internal_fn.convertJsonToData = function (json, keys) {
    let $$ = this,
        new_rows = [], targetKeys, data;
    if (keys) { // when keys specified, json would be an array that includes objects
        if (keys.x) {
            targetKeys = keys.value.concat(keys.x);
            $$.config.data_x = keys.x;
        } else {
            targetKeys = keys.value;
        }
        new_rows.push(targetKeys);
        json.forEach((o) => {
            const new_row = [];
            targetKeys.forEach((key) => {
                // convert undefined to null because undefined data will be removed in convertDataToTargets()
                let v = $$.findValueInJson(o, key);
                if (isUndefined(v)) {
                    v = null;
                }
                new_row.push(v);
            });
            new_rows.push(new_row);
        });
        data = $$.convertRowsToData(new_rows);
    } else {
        Object.keys(json).forEach((key) => {
            new_rows.push([key].concat(json[key]));
        });
        data = $$.convertColumnsToData(new_rows);
    }
    return data;
};
c3_chart_internal_fn.findValueInJson = function (object, path) {
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties (replace [] with .)
    path = path.replace(/^\./, '');           // strip a leading dot
    const pathArray = path.split('.');
    for (let i = 0; i < pathArray.length; ++i) {
        const k = pathArray[i];
        if (k in object) {
            object = object[k];
        } else {
            return;
        }
    }
    return object;
};
c3_chart_internal_fn.convertRowsToData = function (rows) {
    let keys = rows[0], new_row = {}, new_rows = [], i, j;
    for (i = 1; i < rows.length; i++) {
        new_row = {};
        for (j = 0; j < rows[i].length; j++) {
            if (isUndefined(rows[i][j])) {
                throw new Error('Source data is missing a component at (' + i + ',' + j + ')!');
            }
            new_row[keys[j]] = rows[i][j];
        }
        new_rows.push(new_row);
    }
    return new_rows;
};
c3_chart_internal_fn.convertColumnsToData = function (columns) {
    let new_rows = [], i, j, key;
    for (i = 0; i < columns.length; i++) {
        key = columns[i][0];
        for (j = 1; j < columns[i].length; j++) {
            if (isUndefined(new_rows[j - 1])) {
                new_rows[j - 1] = {};
            }
            if (isUndefined(columns[i][j])) {
                throw new Error('Source data is missing a component at (' + i + ',' + j + ')!');
            }
            new_rows[j - 1][key] = columns[i][j];
        }
    }
    return new_rows;
};
c3_chart_internal_fn.convertDataToTargets = function (data, appendXs) {
    let $$ = this, config = $$.config,
        ids = $$.d3.keys(data[0]).filter($$.isNotX, $$),
        xs = $$.d3.keys(data[0]).filter($$.isX, $$),
        targets;

    // save x for update data by load when custom x and c3.x API
    ids.forEach((id) => {
        const xKey = $$.getXKey(id);

        if ($$.isCustomX() || $$.isTimeSeries()) {
            // if included in input data
            if (xs.indexOf(xKey) >= 0) {
                $$.data.xs[id] = (appendXs && $$.data.xs[id] ? $$.data.xs[id] : []).concat(
                    data.map((d) => { return d[xKey]; })
                        .filter(isValue)
                        .map((rawX, i) => { return $$.generateTargetX(rawX, id, i); })
                );
            }
            // if not included in input data, find from preloaded data of other id's x
            else if (config.data_x) {
                $$.data.xs[id] = $$.getOtherTargetXs();
            }
            // if not included in input data, find from preloaded data
            else if (notEmpty(config.data_xs)) {
                $$.data.xs[id] = $$.getXValuesOfXKey(xKey, $$.data.targets);
            }
            // MEMO: if no x included, use same x of current will be used
        } else {
            $$.data.xs[id] = data.map((d, i) => { return i; });
        }
    });


    // check x is defined
    ids.forEach((id) => {
        if (!$$.data.xs[id]) {
            throw new Error('x is not defined for id = "' + id + '".');
        }
    });

    // convert to target
    targets = ids.map((id, index) => {
        const convertedId = config.data_idConverter(id);
        return {
            id: convertedId,
            id_org: id,
            values: data.map((d, i) => {
                let xKey = $$.getXKey(id), rawX = d[xKey],
                    value = d[id] !== null && !isNaN(d[id]) ? +d[id] : null, x;
                // use x as categories if custom x and categorized
                if ($$.isCustomX() && $$.isCategorized() && index === 0 && !isUndefined(rawX)) {
                    if (index === 0 && i === 0) {
                        config.axis_x_categories = [];
                    }
                    x = config.axis_x_categories.indexOf(rawX);
                    if (x === -1) {
                        x = config.axis_x_categories.length;
                        config.axis_x_categories.push(rawX);
                    }
                } else {
                    x = $$.generateTargetX(rawX, id, i);
                }
                // mark as x = undefined if value is undefined and filter to remove after mapped
                if (isUndefined(d[id]) || $$.data.xs[id].length <= i) {
                    x = undefined;
                }
                return { x, value, id: convertedId };
            }).filter((v) => { return isDefined(v.x); }),
        };
    });

    // finish targets
    targets.forEach((t) => {
        let i;
        // sort values by its x
        if (config.data_xSort) {
            t.values = t.values.sort((v1, v2) => {
                let x1 = v1.x || v1.x === 0 ? v1.x : Infinity,
                    x2 = v2.x || v2.x === 0 ? v2.x : Infinity;
                return x1 - x2;
            });
        }
        // indexing each value
        i = 0;
        t.values.forEach((v) => {
            v.index = i++;
        });
        // this needs to be sorted because its index and value.index is identical
        $$.data.xs[t.id].sort((v1, v2) => {
            return v1 - v2;
        });
    });

    // cache information about values
    $$.hasNegativeValue = $$.hasNegativeValueInTargets(targets);
    $$.hasPositiveValue = $$.hasPositiveValueInTargets(targets);

    // set target types
    if (config.data_type) {
        $$.setTargetType($$.mapToIds(targets).filter((id) => { return !(id in config.data_types); }), config.data_type);
    }

    // cache as original id keyed
    targets.forEach((d) => {
        $$.addCache(d.id_org, d);
    });

    return targets;
};

c3_chart_internal_fn.load = function (targets, args) {
    const $$ = this;
    if (targets) {
        // filter loading targets if needed
        if (args.filter) {
            targets = targets.filter(args.filter);
        }
        // set type if args.types || args.type specified
        if (args.type || args.types) {
            targets.forEach((t) => {
                const type = args.types && args.types[t.id] ? args.types[t.id] : args.type;
                $$.setTargetType(t.id, type);
            });
        }
        // Update/Add data
        $$.data.targets.forEach((d) => {
            for (let i = 0; i < targets.length; i++) {
                if (d.id === targets[i].id) {
                    d.values = targets[i].values;
                    targets.splice(i, 1);
                    break;
                }
            }
        });
        $$.data.targets = $$.data.targets.concat(targets); // add remained
    }

    // Set targets
    $$.updateTargets($$.data.targets);

    // Redraw with new targets
    $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true });

    if (args.done) { args.done(); }
};
c3_chart_internal_fn.loadFromArgs = function (args) {
    const $$ = this;
    if (args.data) {
        $$.load($$.convertDataToTargets(args.data), args);
    }
    else if (args.url) {
        $$.convertUrlToData(args.url, args.mimeType, args.headers, args.keys, (data) => {
            $$.load($$.convertDataToTargets(data), args);
        });
    }
    else if (args.json) {
        $$.load($$.convertDataToTargets($$.convertJsonToData(args.json, args.keys)), args);
    }
    else if (args.rows) {
        $$.load($$.convertDataToTargets($$.convertRowsToData(args.rows)), args);
    }
    else if (args.columns) {
        $$.load($$.convertDataToTargets($$.convertColumnsToData(args.columns)), args);
    }
    else {
        $$.load(null, args);
    }
};
c3_chart_internal_fn.unload = function (targetIds, done) {
    const $$ = this;
    if (!done) {
        done = function () {};
    }
    // filter existing target
    targetIds = targetIds.filter((id) => { return $$.hasTarget($$.data.targets, id); });
    // If no target, call done and return
    if (!targetIds || targetIds.length === 0) {
        done();
        return;
    }
    $$.svg.selectAll(targetIds.map((id) => { return $$.selectorTarget(id); }))
        .transition()
        .style('opacity', 0)
        .remove()
        .call($$.endall, done);
    targetIds.forEach((id) => {
        // Reset fadein for future load
        $$.withoutFadeIn[id] = false;
        // Remove target's elements
        if ($$.legend) {
            $$.legend.selectAll('.' + CLASS.legendItem + $$.getTargetSelectorSuffix(id)).remove();
        }
        // Remove target
        $$.data.targets = $$.data.targets.filter((t) => {
            return t.id !== id;
        });
    });
};

c3_chart_internal_fn.categoryName = function (i) {
    const config = this.config;
    return i < config.axis_x_categories.length ? config.axis_x_categories[i] : i;
};

c3_chart_internal_fn.initEventRect = function () {
    const $$ = this;
    $$.main.select('.' + CLASS.chart).append('g')
        .attr('class', CLASS.eventRects)
        .style('fill-opacity', 0);
};
c3_chart_internal_fn.redrawEventRect = function () {
    let $$ = this, config = $$.config,
        eventRectUpdate, maxDataCountTarget,
        isMultipleX = $$.isMultipleX();

    // rects for mouseover
    const eventRects = $$.main.select('.' + CLASS.eventRects)
            .style('cursor', config.zoom_enabled ? config.axis_rotated ? 'ns-resize' : 'ew-resize' : null)
            .classed(CLASS.eventRectsMultiple, isMultipleX)
            .classed(CLASS.eventRectsSingle, !isMultipleX);

    // clear old rects
    eventRects.selectAll('.' + CLASS.eventRect).remove();

    // open as public variable
    $$.eventRect = eventRects.selectAll('.' + CLASS.eventRect);

    if (isMultipleX) {
        eventRectUpdate = $$.eventRect.data([0]);
        // enter : only one rect will be added
        $$.generateEventRectsForMultipleXs(eventRectUpdate.enter());
        // update
        $$.updateEventRect(eventRectUpdate);
        // exit : not needed because always only one rect exists
    }
    else {
        // Set data and update $$.eventRect
        maxDataCountTarget = $$.getMaxDataCountTarget($$.data.targets);
        eventRects.datum(maxDataCountTarget ? maxDataCountTarget.values : []);
        $$.eventRect = eventRects.selectAll('.' + CLASS.eventRect);
        eventRectUpdate = $$.eventRect.data((d) => { return d; });
        // enter
        $$.generateEventRectsForSingleX(eventRectUpdate.enter());
        // update
        $$.updateEventRect(eventRectUpdate);
        // exit
        eventRectUpdate.exit().remove();
    }
};
c3_chart_internal_fn.updateEventRect = function (eventRectUpdate) {
    let $$ = this, config = $$.config,
        x, y, w, h, rectW, rectX;

    // set update selection if null
    eventRectUpdate = eventRectUpdate || $$.eventRect.data((d) => { return d; });

    if ($$.isMultipleX()) {
        // TODO: rotated not supported yet
        x = 0;
        y = 0;
        w = $$.width;
        h = $$.height;
    }
    else {
        if (($$.isCustomX() || $$.isTimeSeries()) && !$$.isCategorized()) {
            // update index for x that is used by prevX and nextX
            $$.updateXs();

            rectW = function (d) {
                let prevX = $$.getPrevX(d.index), nextX = $$.getNextX(d.index);

                // if there this is a single data point make the eventRect full width (or height)
                if (prevX === null && nextX === null) {
                    return config.axis_rotated ? $$.height : $$.width;
                }

                if (prevX === null) { prevX = $$.x.domain()[0]; }
                if (nextX === null) { nextX = $$.x.domain()[1]; }

                return Math.max(0, ($$.x(nextX) - $$.x(prevX)) / 2);
            };
            rectX = function (d) {
                let prevX = $$.getPrevX(d.index), nextX = $$.getNextX(d.index),
                    thisX = $$.data.xs[d.id][d.index];

                // if there this is a single data point position the eventRect at 0
                if (prevX === null && nextX === null) {
                    return 0;
                }

                if (prevX === null) { prevX = $$.x.domain()[0]; }

                return ($$.x(thisX) + $$.x(prevX)) / 2;
            };
        } else {
            rectW = $$.getEventRectWidth();
            rectX = function (d) {
                return $$.x(d.x) - (rectW / 2);
            };
        }
        x = config.axis_rotated ? 0 : rectX;
        y = config.axis_rotated ? rectX : 0;
        w = config.axis_rotated ? $$.width : rectW;
        h = config.axis_rotated ? rectW : $$.height;
    }

    eventRectUpdate
        .attr('class', $$.classEvent.bind($$))
        .attr('x', x)
        .attr('y', y)
        .attr('width', w)
        .attr('height', h);
};
c3_chart_internal_fn.generateEventRectsForSingleX = function (eventRectEnter) {
    let $$ = this, d3 = $$.d3, config = $$.config,
        tap = false, tapX;

    function click(shape, d) {
        let index = d.index;
        if ($$.hasArcType() || !$$.toggleShape) { return; }
        if ($$.cancelClick) {
            $$.cancelClick = false;
            return;
        }
        if ($$.isStepType(d) && config.line_step_type === 'step-after' && d3.mouse(shape)[0] < $$.x($$.getXValue(d.id, index))) {
            index -= 1;
        }
        $$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
            if (config.data_selection_grouped || $$.isWithinShape(this, d)) {
                $$.toggleShape(this, d, index);
                $$.config.data_onclick.call($$.api, d, this);
            }
        });
    }

    eventRectEnter.append('rect')
        .attr('class', $$.classEvent.bind($$))
        .style('cursor', config.data_selection_enabled && config.data_selection_grouped ? 'pointer' : null)
        .on('mouseover', (d) => {
            const index = d.index;

            if ($$.dragging || $$.flowing) { return; } // do nothing while dragging/flowing
            if ($$.hasArcType()) { return; }

            // Expand shapes for selection
            if (config.point_focus_expand_enabled) { $$.expandCircles(index, null, true); }
            $$.expandBars(index, null, true);

            // Call event handler
            $$.main.selectAll('.' + CLASS.shape + '-' + index).each((d) => {
                config.data_onmouseover.call($$.api, d);
            });
        })
        .on('mouseout', (d) => {
            const index = d.index;
            if (!$$.config) { return; } // chart is destroyed
            if ($$.hasArcType()) { return; }
            $$.hideXGridFocus();
            $$.hideTooltip();
            // Undo expanded shapes
            $$.unexpandCircles();
            $$.unexpandBars();
            // Call event handler
            $$.main.selectAll('.' + CLASS.shape + '-' + index).each((d) => {
                config.data_onmouseout.call($$.api, d);
            });
        })
        .on('mousemove', function (d) {
            let selectedData, index = d.index,
                eventRect = $$.svg.select('.' + CLASS.eventRect + '-' + index);

            if ($$.dragging || $$.flowing) { return; } // do nothing while dragging/flowing
            if ($$.hasArcType()) { return; }

            if ($$.isStepType(d) && $$.config.line_step_type === 'step-after' && d3.mouse(this)[0] < $$.x($$.getXValue(d.id, index))) {
                index -= 1;
            }

            // Show tooltip
            selectedData = $$.filterTargetsToShow($$.data.targets).map((t) => {
                return $$.addName($$.getValueOnIndex(t.values, index));
            });

            if (config.tooltip_grouped) {
                $$.showTooltip(selectedData, this);
                $$.showXGridFocus(selectedData);
            }

            if (config.tooltip_grouped && (!config.data_selection_enabled || config.data_selection_grouped)) {
                return;
            }

            $$.main.selectAll('.' + CLASS.shape + '-' + index)
                .each(function () {
                    d3.select(this).classed(CLASS.EXPANDED, true);
                    if (config.data_selection_enabled) {
                        eventRect.style('cursor', config.data_selection_grouped ? 'pointer' : null);
                    }
                    if (!config.tooltip_grouped) {
                        $$.hideXGridFocus();
                        $$.hideTooltip();
                        if (!config.data_selection_grouped) {
                            $$.unexpandCircles(index);
                            $$.unexpandBars(index);
                        }
                    }
                })
                .filter(function (d) {
                    return $$.isWithinShape(this, d);
                })
                .each(function (d) {
                    if (config.data_selection_enabled && (config.data_selection_grouped || config.data_selection_isselectable(d))) {
                        eventRect.style('cursor', 'pointer');
                    }
                    if (!config.tooltip_grouped) {
                        $$.showTooltip([d], this);
                        $$.showXGridFocus([d]);
                        if (config.point_focus_expand_enabled) { $$.expandCircles(index, d.id, true); }
                        $$.expandBars(index, d.id, true);
                    }
                });
        })
        .on('click', function (d) {
            // click event was simulated via a 'tap' touch event, cancel regular click
            if (tap) {
                return;
            }

            click(this, d);
        })
        .on('touchstart', (d) => {
            // store current X selection for comparison during touch end event
            tapX = d.x;
        })
        .on('touchend', function (d) {
            const finalX = d.x;

            // If end is not the same as the start, event doesn't count as a tap
            if (tapX !== finalX) {
                return;
            }


            click(this, d);

            // indictate tap event fired to prevent click;
            tap = true;
            setTimeout(() => { tap = false; }, config.touch_tap_delay);
        })

        .call(
            config.data_selection_draggable && $$.drag ? (
                d3.behavior.drag().origin(Object)
                    .on('drag', function () { $$.drag(d3.mouse(this)); })
                    .on('dragstart', function () { $$.dragstart(d3.mouse(this)); })
                    .on('dragend', () => { $$.dragend(); })
            ) : () => {}
        );
};

c3_chart_internal_fn.generateEventRectsForMultipleXs = function (eventRectEnter) {
    let $$ = this, d3 = $$.d3, config = $$.config,
        tap = false, tapX, tapY;

    function mouseout() {
        $$.svg.select('.' + CLASS.eventRect).style('cursor', null);
        $$.hideXGridFocus();
        $$.hideTooltip();
        $$.unexpandCircles();
        $$.unexpandBars();
    }

    function click(shape) {
        const targetsToShow = $$.filterTargetsToShow($$.data.targets);
        let mouse, closest;
        if ($$.hasArcType(targetsToShow)) { return; }

        mouse = d3.mouse(shape);
        closest = $$.findClosestFromTargets(targetsToShow, mouse);
        if (!closest) { return; }
        // select if selection enabled
        if ($$.isBarType(closest.id) || $$.dist(closest, mouse) < config.point_sensitivity) {
            $$.main.selectAll('.' + CLASS.shapes + $$.getTargetSelectorSuffix(closest.id)).selectAll('.' + CLASS.shape + '-' + closest.index).each(function () {
                if (config.data_selection_grouped || $$.isWithinShape(this, closest)) {
                    $$.toggleShape(this, closest, closest.index);
                    $$.config.data_onclick.call($$.api, closest, this);
                }
            });
        }
    }

    eventRectEnter.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', $$.width)
        .attr('height', $$.height)
        .attr('class', CLASS.eventRect)
        .on('mouseout', () => {
            if (!$$.config) { return; } // chart is destroyed
            if ($$.hasArcType()) { return; }
            mouseout();
        })
        .on('mousemove', function () {
            const targetsToShow = $$.filterTargetsToShow($$.data.targets);
            let mouse, closest, sameXData, selectedData;

            if ($$.dragging) { return; } // do nothing when dragging
            if ($$.hasArcType(targetsToShow)) { return; }

            mouse = d3.mouse(this);
            closest = $$.findClosestFromTargets(targetsToShow, mouse);

            if ($$.mouseover && (!closest || closest.id !== $$.mouseover.id)) {
                config.data_onmouseout.call($$.api, $$.mouseover);
                $$.mouseover = undefined;
            }

            if (!closest) {
                mouseout();
                return;
            }

            if ($$.isScatterType(closest) || !config.tooltip_grouped) {
                sameXData = [closest];
            } else {
                sameXData = $$.filterByX(targetsToShow, closest.x);
            }

            // show tooltip when cursor is close to some point
            selectedData = sameXData.map((d) => {
                return $$.addName(d);
            });
            $$.showTooltip(selectedData, this);

            // expand points
            if (config.point_focus_expand_enabled) {
                $$.expandCircles(closest.index, closest.id, true);
            }
            $$.expandBars(closest.index, closest.id, true);

            // Show xgrid focus line
            $$.showXGridFocus(selectedData);

            // Show cursor as pointer if point is close to mouse position
            if ($$.isBarType(closest.id) || $$.dist(closest, mouse) < config.point_sensitivity) {
                $$.svg.select('.' + CLASS.eventRect).style('cursor', 'pointer');
                if (!$$.mouseover) {
                    config.data_onmouseover.call($$.api, closest);
                    $$.mouseover = closest;
                }
            }
        })
        .on('click', function () {
            // click event was simulated via a 'tap' touch event, cancel regular click
            if (tap) {
                return;
            }

            click(this);
        })
        .on('touchstart', function () {
            const mouse = d3.mouse(this);
            // store starting coordinates for distance comparision during touch end event
            tapX = mouse[0];
            tapY = mouse[1];
        })
        .on('touchend', function () {
            let mouse = d3.mouse(this),
                x = mouse[0],
                y = mouse[1];

            // If end is too far from start, event doesn't count as a tap
            if (Math.abs(x - tapX) > config.touch_tap_radius || Math.abs(y - tapY) > config.touch_tap_radius) {
                return;
            }

            click(this);

            // indictate tap event fired to prevent click;
            tap = true;
            setTimeout(() => { tap = false; }, config.touch_tap_delay);
        })
        .call(
            config.data_selection_draggable && $$.drag ? (
                d3.behavior.drag().origin(Object)
                    .on('drag', function () { $$.drag(d3.mouse(this)); })
                    .on('dragstart', function () { $$.dragstart(d3.mouse(this)); })
                    .on('dragend', () => { $$.dragend(); })
            ) : () => {}
        );
};
c3_chart_internal_fn.dispatchEvent = function (type, index, mouse) {
    let $$ = this,
        selector = '.' + CLASS.eventRect + (!$$.isMultipleX() ? '-' + index : ''),
        eventRect = $$.main.select(selector).node(),
        box = eventRect.getBoundingClientRect(),
        x = box.left + (mouse ? mouse[0] : 0),
        y = box.top + (mouse ? mouse[1] : 0),
        event = document.createEvent('MouseEvents');

    event.initMouseEvent(type, true, true, window, 0, x, y, x, y,
                         false, false, false, false, 0, null);
    eventRect.dispatchEvent(event);
};

c3_chart_internal_fn.getCurrentWidth = function () {
    let $$ = this, config = $$.config;
    return config.size_width ? config.size_width : $$.getParentWidth();
};
c3_chart_internal_fn.getCurrentHeight = function () {
    let $$ = this, config = $$.config,
        h = config.size_height ? config.size_height : $$.getParentHeight();
    return h > 0 ? h : 320 / ($$.hasType('gauge') && !config.gauge_fullCircle ? 2 : 1);
};
c3_chart_internal_fn.getCurrentPaddingTop = function () {
    let $$ = this,
        config = $$.config,
        padding = isValue(config.padding_top) ? config.padding_top : 0;
    if ($$.title && $$.title.node()) {
        padding += $$.getTitlePadding();
    }
    return padding;
};
c3_chart_internal_fn.getCurrentPaddingBottom = function () {
    const config = this.config;
    return isValue(config.padding_bottom) ? config.padding_bottom : 0;
};
c3_chart_internal_fn.getCurrentPaddingLeft = function (withoutRecompute) {
    let $$ = this, config = $$.config;
    if (isValue(config.padding_left)) {
        return config.padding_left;
    } else if (config.axis_rotated) {
        return !config.axis_x_show ? 1 : Math.max(ceil10($$.getAxisWidthByAxisId('x', withoutRecompute)), 40);
    } else if (!config.axis_y_show || config.axis_y_inner) { // && !config.axis_rotated
        return $$.axis.getYAxisLabelPosition().isOuter ? 30 : 1;
    } else {
        return ceil10($$.getAxisWidthByAxisId('y', withoutRecompute));
    }
};
c3_chart_internal_fn.getCurrentPaddingRight = function () {
    let $$ = this, config = $$.config,
        defaultPadding = 10, legendWidthOnRight = $$.isLegendRight ? $$.getLegendWidth() + 20 : 0;
    if (isValue(config.padding_right)) {
        return config.padding_right + 1; // 1 is needed not to hide tick line
    } else if (config.axis_rotated) {
        return defaultPadding + legendWidthOnRight;
    } else if (!config.axis_y2_show || config.axis_y2_inner) { // && !config.axis_rotated
        return 2 + legendWidthOnRight + ($$.axis.getY2AxisLabelPosition().isOuter ? 20 : 0);
    } else {
        return ceil10($$.getAxisWidthByAxisId('y2')) + legendWidthOnRight;
    }
};

c3_chart_internal_fn.getParentRectValue = function (key) {
    let parent = this.selectChart.node(), v;
    while (parent && parent.tagName !== 'BODY') {
        try {
            v = parent.getBoundingClientRect()[key];
        } catch (e) {
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
c3_chart_internal_fn.getParentWidth = function () {
    return this.getParentRectValue('width');
};
c3_chart_internal_fn.getParentHeight = function () {
    const h = this.selectChart.style('height');
    return h.indexOf('px') > 0 ? +h.replace('px', '') : 0;
};


c3_chart_internal_fn.getSvgLeft = function (withoutRecompute) {
    let $$ = this, config = $$.config,
        hasLeftAxisRect = config.axis_rotated || (!config.axis_rotated && !config.axis_y_inner),
        leftAxisClass = config.axis_rotated ? CLASS.axisX : CLASS.axisY,
        leftAxis = $$.main.select('.' + leftAxisClass).node(),
        svgRect = leftAxis && hasLeftAxisRect ? leftAxis.getBoundingClientRect() : { right: 0 },
        chartRect = $$.selectChart.node().getBoundingClientRect(),
        hasArc = $$.hasArcType(),
        svgLeft = svgRect.right - chartRect.left - (hasArc ? 0 : $$.getCurrentPaddingLeft(withoutRecompute));
    return svgLeft > 0 ? svgLeft : 0;
};


c3_chart_internal_fn.getAxisWidthByAxisId = function (id, withoutRecompute) {
    let $$ = this, position = $$.axis.getLabelPositionById(id);
    return $$.axis.getMaxTickWidth(id, withoutRecompute) + (position.isInner ? 20 : 40);
};
c3_chart_internal_fn.getHorizontalAxisHeight = function (axisId) {
    let $$ = this, config = $$.config, h = 30;
    if (axisId === 'x' && !config.axis_x_show) { return 8; }
    if (axisId === 'x' && config.axis_x_height) { return config.axis_x_height; }
    if (axisId === 'y' && !config.axis_y_show) {
        return config.legend_show && !$$.isLegendRight && !$$.isLegendInset ? 10 : 1;
    }
    if (axisId === 'y2' && !config.axis_y2_show) { return $$.rotated_padding_top; }
    // Calculate x axis height when tick rotated
    if (axisId === 'x' && !config.axis_rotated && config.axis_x_tick_rotate) {
        h = 30 + $$.axis.getMaxTickWidth(axisId) * Math.cos(Math.PI * (90 - config.axis_x_tick_rotate) / 180);
    }
    // Calculate y axis height when tick rotated
    if (axisId === 'y' && config.axis_rotated && config.axis_y_tick_rotate) {
        h = 30 + $$.axis.getMaxTickWidth(axisId) * Math.cos(Math.PI * (90 - config.axis_y_tick_rotate) / 180);
    }
    return h + ($$.axis.getLabelPositionById(axisId).isInner ? 0 : 10) + (axisId === 'y2' ? -10 : 0);
};

c3_chart_internal_fn.getEventRectWidth = function () {
    return Math.max(0, this.xAxis.tickInterval());
};

c3_chart_internal_fn.getShapeIndices = function (typeFilter) {
    let $$ = this, config = $$.config,
        indices = {}, i = 0, j, k;
    $$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$)).forEach((d) => {
        for (j = 0; j < config.data_groups.length; j++) {
            if (config.data_groups[j].indexOf(d.id) < 0) { continue; }
            for (k = 0; k < config.data_groups[j].length; k++) {
                if (config.data_groups[j][k] in indices) {
                    indices[d.id] = indices[config.data_groups[j][k]];
                    break;
                }
            }
        }
        if (isUndefined(indices[d.id])) { indices[d.id] = i++; }
    });
    indices.__max__ = i - 1;
    return indices;
};
c3_chart_internal_fn.getShapeX = function (offset, targetsNum, indices, isSub) {
    let $$ = this, scale = isSub ? $$.subX : $$.x;
    return function (d) {
        const index = d.id in indices ? indices[d.id] : 0;
        return d.x || d.x === 0 ? scale(d.x) - offset * (targetsNum / 2 - index) : 0;
    };
};
c3_chart_internal_fn.getShapeY = function (isSub) {
    const $$ = this;
    return function (d) {
        const scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id);
        return scale(d.value);
    };
};
c3_chart_internal_fn.getShapeOffset = function (typeFilter, indices, isSub) {
    let $$ = this,
        targets = $$.orderTargets($$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$))),
        targetIds = targets.map((t) => { return t.id; });
    return function (d, i) {
        let scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id),
            y0 = scale(0), offset = y0;
        targets.forEach((t) => {
            const values = $$.isStepType(d) ? $$.convertValuesToStep(t.values) : t.values;
            if (t.id === d.id || indices[t.id] !== indices[d.id]) { return; }
            if (targetIds.indexOf(t.id) < targetIds.indexOf(d.id)) {
                // check if the x values line up
                if (typeof values[i] === 'undefined' || +values[i].x !== +d.x) {  // "+" for timeseries
                    // if not, try to find the value that does line up
                    i = -1;
                    values.forEach((v, j) => {
                        if (v.x === d.x) {
                            i = j;
                        }
                    });
                }
                if (i in values && values[i].value * d.value >= 0) {
                    offset += scale(values[i].value) - y0;
                }
            }
        });
        return offset;
    };
};
c3_chart_internal_fn.isWithinShape = function (that, d) {
    let $$ = this,
        shape = $$.d3.select(that), isWithin;
    if (!$$.isTargetToShow(d.id)) {
        isWithin = false;
    }
    else if (that.nodeName === 'circle') {
        isWithin = $$.isStepType(d) ? $$.isWithinStep(that, $$.getYScale(d.id)(d.value)) : $$.isWithinCircle(that, $$.pointSelectR(d) * 1.5);
    }
    else if (that.nodeName === 'path') {
        isWithin = shape.classed(CLASS.bar) ? $$.isWithinBar(that) : true;
    }
    return isWithin;
};


c3_chart_internal_fn.getInterpolate = function (d) {
    let $$ = this,
        interpolation = $$.isInterpolationType($$.config.spline_interpolation_type) ? $$.config.spline_interpolation_type : 'cardinal';
    return $$.isSplineType(d) ? interpolation : $$.isStepType(d) ? $$.config.line_step_type : 'linear';
};

c3_chart_internal_fn.initLine = function () {
    const $$ = this;
    $$.main.select('.' + CLASS.chart).append('g')
        .attr('class', CLASS.chartLines);
};
c3_chart_internal_fn.updateTargetsForLine = function (targets) {
    let $$ = this, config = $$.config,
        mainLineUpdate, mainLineEnter,
        classChartLine = $$.classChartLine.bind($$),
        classLines = $$.classLines.bind($$),
        classAreas = $$.classAreas.bind($$),
        classCircles = $$.classCircles.bind($$),
        classFocus = $$.classFocus.bind($$);
    mainLineUpdate = $$.main.select('.' + CLASS.chartLines).selectAll('.' + CLASS.chartLine)
        .data(targets)
        .attr('class', (d) => { return classChartLine(d) + classFocus(d); });
    mainLineEnter = mainLineUpdate.enter().append('g')
        .attr('class', classChartLine)
        .style('opacity', 0)
        .style('pointer-events', 'none');
    // Lines for each data
    mainLineEnter.append('g')
        .attr('class', classLines);
    // Areas
    mainLineEnter.append('g')
        .attr('class', classAreas);
    // Circles for each data point on lines
    mainLineEnter.append('g')
        .attr('class', (d) => { return $$.generateClass(CLASS.selectedCircles, d.id); });
    mainLineEnter.append('g')
        .attr('class', classCircles)
        .style('cursor', (d) => { return config.data_selection_isselectable(d) ? 'pointer' : null; });
    // Update date for selected circles
    targets.forEach((t) => {
        $$.main.selectAll('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(t.id)).selectAll('.' + CLASS.selectedCircle).each((d) => {
            d.value = t.values[d.index].value;
        });
    });
    // MEMO: can not keep same color...
    // mainLineUpdate.exit().remove();
};
c3_chart_internal_fn.updateLine = function (durationForExit) {
    const $$ = this;
    $$.mainLine = $$.main.selectAll('.' + CLASS.lines).selectAll('.' + CLASS.line)
        .data($$.lineData.bind($$));
    $$.mainLine.enter().append('path')
        .attr('class', $$.classLine.bind($$))
        .style('stroke', $$.color);
    $$.mainLine
        .style('opacity', $$.initialOpacity.bind($$))
        .style('shape-rendering', (d) => { return $$.isStepType(d) ? 'crispEdges' : ''; })
        .attr('transform', null);
    $$.mainLine.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawLine = function (drawLine, withTransition) {
    return [
        (withTransition ? this.mainLine.transition(Math.random().toString()) : this.mainLine)
            .attr('d', drawLine)
            .style('stroke', this.color)
            .style('opacity', 1),
    ];
};
c3_chart_internal_fn.generateDrawLine = function (lineIndices, isSub) {
    let $$ = this, config = $$.config,
        line = $$.d3.svg.line(),
        getPoints = $$.generateGetLinePoints(lineIndices, isSub),
        yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
        xValue = function (d) { return (isSub ? $$.subxx : $$.xx).call($$, d); },
        yValue = function (d, i) {
            return config.data_groups.length > 0 ? getPoints(d, i)[0][1] : yScaleGetter.call($$, d.id)(d.value);
        };

    line = config.axis_rotated ? line.x(yValue).y(xValue) : line.x(xValue).y(yValue);
    if (!config.line_connectNull) { line = line.defined((d) => { return d.value != null; }); }
    return function (d) {
        let values = config.line_connectNull ? $$.filterRemoveNull(d.values) : d.values,
            x = isSub ? $$.x : $$.subX, y = yScaleGetter.call($$, d.id), x0 = 0, y0 = 0, path;
        if ($$.isLineType(d)) {
            if (config.data_regions[d.id]) {
                path = $$.lineWithRegions(values, x, y, config.data_regions[d.id]);
            } else {
                if ($$.isStepType(d)) { values = $$.convertValuesToStep(values); }
                path = line.interpolate($$.getInterpolate(d))(values);
            }
        } else {
            if (values[0]) {
                x0 = x(values[0].x);
                y0 = y(values[0].value);
            }
            path = config.axis_rotated ? 'M ' + y0 + ' ' + x0 : 'M ' + x0 + ' ' + y0;
        }
        return path ? path : 'M 0 0';
    };
};
c3_chart_internal_fn.generateGetLinePoints = function (lineIndices, isSub) { // partial duplication of generateGetBarPoints
    let $$ = this, config = $$.config,
        lineTargetsNum = lineIndices.__max__ + 1,
        x = $$.getShapeX(0, lineTargetsNum, lineIndices, !!isSub),
        y = $$.getShapeY(!!isSub),
        lineOffset = $$.getShapeOffset($$.isLineType, lineIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        let y0 = yScale.call($$, d.id)(0),
            offset = lineOffset(d, i) || y0, // offset is for stacked area chart
            posX = x(d), posY = y(d);
        // fix posY not to overflow opposite quadrant
        if (config.axis_rotated) {
            if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
        }
        // 1 point that marks the line position
        return [
            [posX, posY - (y0 - offset)],
            [posX, posY - (y0 - offset)], // needed for compatibility
            [posX, posY - (y0 - offset)], // needed for compatibility
            [posX, posY - (y0 - offset)],  // needed for compatibility
        ];
    };
};


c3_chart_internal_fn.lineWithRegions = function (d, x, y, _regions) {
    let $$ = this, config = $$.config,
        prev = -1, i, j,
        s = 'M', sWithRegion,
        xp, yp, dx, dy, dd, diff, diffx2,
        xOffset = $$.isCategorized() ? 0.5 : 0,
        xValue, yValue,
        regions = [];

    function isWithinRegions(x, regions) {
        let i;
        for (i = 0; i < regions.length; i++) {
            if (regions[i].start < x && x <= regions[i].end) { return true; }
        }
        return false;
    }

    // Check start/end of regions
    if (isDefined(_regions)) {
        for (i = 0; i < _regions.length; i++) {
            regions[i] = {};
            if (isUndefined(_regions[i].start)) {
                regions[i].start = d[0].x;
            } else {
                regions[i].start = $$.isTimeSeries() ? $$.parseDate(_regions[i].start) : _regions[i].start;
            }
            if (isUndefined(_regions[i].end)) {
                regions[i].end = d[d.length - 1].x;
            } else {
                regions[i].end = $$.isTimeSeries() ? $$.parseDate(_regions[i].end) : _regions[i].end;
            }
        }
    }

    // Set scales
    xValue = config.axis_rotated ? function (d) { return y(d.value); } : function (d) { return x(d.x); };
    yValue = config.axis_rotated ? function (d) { return x(d.x); } : function (d) { return y(d.value); };

    // Define svg generator function for region
    function generateM(points) {
        return 'M' + points[0][0] + ' ' + points[0][1] + ' ' + points[1][0] + ' ' + points[1][1];
    }
    if ($$.isTimeSeries()) {
        sWithRegion = function (d0, d1, j, diff) {
            let x0 = d0.x.getTime(), x_diff = d1.x - d0.x,
                xv0 = new Date(x0 + x_diff * j),
                xv1 = new Date(x0 + x_diff * (j + diff)),
                points;
            if (config.axis_rotated) {
                points = [[y(yp(j)), x(xv0)], [y(yp(j + diff)), x(xv1)]];
            } else {
                points = [[x(xv0), y(yp(j))], [x(xv1), y(yp(j + diff))]];
            }
            return generateM(points);
        };
    } else {
        sWithRegion = function (d0, d1, j, diff) {
            let points;
            if (config.axis_rotated) {
                points = [[y(yp(j), true), x(xp(j))], [y(yp(j + diff), true), x(xp(j + diff))]];
            } else {
                points = [[x(xp(j), true), y(yp(j))], [x(xp(j + diff), true), y(yp(j + diff))]];
            }
            return generateM(points);
        };
    }

    // Generate
    for (i = 0; i < d.length; i++) {
        // Draw as normal
        if (isUndefined(regions) || !isWithinRegions(d[i].x, regions)) {
            s += ' ' + xValue(d[i]) + ' ' + yValue(d[i]);
        }
        // Draw with region // TODO: Fix for horizotal charts
        else {
            xp = $$.getScale(d[i - 1].x + xOffset, d[i].x + xOffset, $$.isTimeSeries());
            yp = $$.getScale(d[i - 1].value, d[i].value);

            dx = x(d[i].x) - x(d[i - 1].x);
            dy = y(d[i].value) - y(d[i - 1].value);
            dd = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            diff = 2 / dd;
            diffx2 = diff * 2;

            for (j = diff; j <= 1; j += diffx2) {
                s += sWithRegion(d[i - 1], d[i], j, diff);
            }
        }
        prev = d[i].x;
    }

    return s;
};


c3_chart_internal_fn.updateArea = function (durationForExit) {
    let $$ = this, d3 = $$.d3;
    $$.mainArea = $$.main.selectAll('.' + CLASS.areas).selectAll('.' + CLASS.area)
        .data($$.lineData.bind($$));
    $$.mainArea.enter().append('path')
        .attr('class', $$.classArea.bind($$))
        .style('fill', $$.color)
        .style('opacity', function () { $$.orgAreaOpacity = +d3.select(this).style('opacity'); return 0; });
    $$.mainArea
        .style('opacity', $$.orgAreaOpacity);
    $$.mainArea.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawArea = function (drawArea, withTransition) {
    return [
        (withTransition ? this.mainArea.transition(Math.random().toString()) : this.mainArea)
            .attr('d', drawArea)
            .style('fill', this.color)
            .style('opacity', this.orgAreaOpacity),
    ];
};
c3_chart_internal_fn.generateDrawArea = function (areaIndices, isSub) {
    let $$ = this, config = $$.config, area = $$.d3.svg.area(),
        getPoints = $$.generateGetAreaPoints(areaIndices, isSub),
        yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
        xValue = function (d) { return (isSub ? $$.subxx : $$.xx).call($$, d); },
        value0 = function (d, i) {
            return config.data_groups.length > 0 ? getPoints(d, i)[0][1] : yScaleGetter.call($$, d.id)($$.getAreaBaseValue(d.id));
        },
        value1 = function (d, i) {
            return config.data_groups.length > 0 ? getPoints(d, i)[1][1] : yScaleGetter.call($$, d.id)(d.value);
        };

    area = config.axis_rotated ? area.x0(value0).x1(value1).y(xValue) : area.x(xValue).y0(config.area_above ? 0 : value0).y1(value1);
    if (!config.line_connectNull) {
        area = area.defined((d) => { return d.value !== null; });
    }

    return function (d) {
        let values = config.line_connectNull ? $$.filterRemoveNull(d.values) : d.values,
            x0 = 0, y0 = 0, path;
        if ($$.isAreaType(d)) {
            if ($$.isStepType(d)) { values = $$.convertValuesToStep(values); }
            path = area.interpolate($$.getInterpolate(d))(values);
        } else {
            if (values[0]) {
                x0 = $$.x(values[0].x);
                y0 = $$.getYScale(d.id)(values[0].value);
            }
            path = config.axis_rotated ? 'M ' + y0 + ' ' + x0 : 'M ' + x0 + ' ' + y0;
        }
        return path ? path : 'M 0 0';
    };
};
c3_chart_internal_fn.getAreaBaseValue = function () {
    return 0;
};
c3_chart_internal_fn.generateGetAreaPoints = function (areaIndices, isSub) { // partial duplication of generateGetBarPoints
    let $$ = this, config = $$.config,
        areaTargetsNum = areaIndices.__max__ + 1,
        x = $$.getShapeX(0, areaTargetsNum, areaIndices, !!isSub),
        y = $$.getShapeY(!!isSub),
        areaOffset = $$.getShapeOffset($$.isAreaType, areaIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        let y0 = yScale.call($$, d.id)(0),
            offset = areaOffset(d, i) || y0, // offset is for stacked area chart
            posX = x(d), posY = y(d);
        // fix posY not to overflow opposite quadrant
        if (config.axis_rotated) {
            if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
        }
        // 1 point that marks the area position
        return [
            [posX, offset],
            [posX, posY - (y0 - offset)],
            [posX, posY - (y0 - offset)], // needed for compatibility
            [posX, offset], // needed for compatibility
        ];
    };
};


c3_chart_internal_fn.updateCircle = function () {
    const $$ = this;
    $$.mainCircle = $$.main.selectAll('.' + CLASS.circles).selectAll('.' + CLASS.circle)
        .data($$.lineOrScatterData.bind($$));
    $$.mainCircle.enter().append('circle')
        .attr('class', $$.classCircle.bind($$))
        .attr('r', $$.pointR.bind($$))
        .style('fill', $$.color);
    $$.mainCircle
        .style('opacity', $$.initialOpacityForCircle.bind($$));
    $$.mainCircle.exit().remove();
};
c3_chart_internal_fn.redrawCircle = function (cx, cy, withTransition) {
    const selectedCircles = this.main.selectAll('.' + CLASS.selectedCircle);
    return [
        (withTransition ? this.mainCircle.transition(Math.random().toString()) : this.mainCircle)
            .style('opacity', this.opacityForCircle.bind(this))
            .style('fill', this.color)
            .attr('cx', cx)
            .attr('cy', cy),
        (withTransition ? selectedCircles.transition(Math.random().toString()) : selectedCircles)
            .attr('cx', cx)
            .attr('cy', cy),
    ];
};
c3_chart_internal_fn.circleX = function (d) {
    return d.x || d.x === 0 ? this.x(d.x) : null;
};
c3_chart_internal_fn.updateCircleY = function () {
    let $$ = this, lineIndices, getPoints;
    if ($$.config.data_groups.length > 0) {
        lineIndices = $$.getShapeIndices($$.isLineType),
        getPoints = $$.generateGetLinePoints(lineIndices);
        $$.circleY = function (d, i) {
            return getPoints(d, i)[0][1];
        };
    } else {
        $$.circleY = function (d) {
            return $$.getYScale(d.id)(d.value);
        };
    }
};
c3_chart_internal_fn.getCircles = function (i, id) {
    const $$ = this;
    return (id ? $$.main.selectAll('.' + CLASS.circles + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS.circle + (isValue(i) ? '-' + i : ''));
};
c3_chart_internal_fn.expandCircles = function (i, id, reset) {
    let $$ = this,
        r = $$.pointExpandedR.bind($$);
    if (reset) { $$.unexpandCircles(); }
    $$.getCircles(i, id)
        .classed(CLASS.EXPANDED, true)
        .attr('r', r);
};
c3_chart_internal_fn.unexpandCircles = function (i) {
    let $$ = this,
        r = $$.pointR.bind($$);
    $$.getCircles(i)
        .filter(function () { return $$.d3.select(this).classed(CLASS.EXPANDED); })
        .classed(CLASS.EXPANDED, false)
        .attr('r', r);
};
c3_chart_internal_fn.pointR = function (d) {
    let $$ = this, config = $$.config;
    return $$.isStepType(d) ? 0 : (isFunction(config.point_r) ? config.point_r(d) : config.point_r);
};
c3_chart_internal_fn.pointExpandedR = function (d) {
    let $$ = this, config = $$.config;
    return config.point_focus_expand_enabled ? (config.point_focus_expand_r ? config.point_focus_expand_r : $$.pointR(d) * 1.75) : $$.pointR(d);
};
c3_chart_internal_fn.pointSelectR = function (d) {
    let $$ = this, config = $$.config;
    return isFunction(config.point_select_r) ? config.point_select_r(d) : ((config.point_select_r) ? config.point_select_r : $$.pointR(d) * 4);
};
c3_chart_internal_fn.isWithinCircle = function (that, r) {
    let d3 = this.d3,
        mouse = d3.mouse(that), d3_this = d3.select(that),
        cx = +d3_this.attr('cx'), cy = +d3_this.attr('cy');
    return Math.sqrt(Math.pow(cx - mouse[0], 2) + Math.pow(cy - mouse[1], 2)) < r;
};
c3_chart_internal_fn.isWithinStep = function (that, y) {
    return Math.abs(y - this.d3.mouse(that)[1]) < 30;
};

c3_chart_internal_fn.initBar = function () {
    const $$ = this;
    $$.main.select('.' + CLASS.chart).append('g')
        .attr('class', CLASS.chartBars);
};
c3_chart_internal_fn.updateTargetsForBar = function (targets) {
    let $$ = this, config = $$.config,
        mainBarUpdate, mainBarEnter,
        classChartBar = $$.classChartBar.bind($$),
        classBars = $$.classBars.bind($$),
        classFocus = $$.classFocus.bind($$);
    mainBarUpdate = $$.main.select('.' + CLASS.chartBars).selectAll('.' + CLASS.chartBar)
        .data(targets)
        .attr('class', (d) => { return classChartBar(d) + classFocus(d); });
    mainBarEnter = mainBarUpdate.enter().append('g')
        .attr('class', classChartBar)
        .style('opacity', 0)
        .style('pointer-events', 'none');
    // Bars for each data
    mainBarEnter.append('g')
        .attr('class', classBars)
        .style('cursor', (d) => { return config.data_selection_isselectable(d) ? 'pointer' : null; });
};
c3_chart_internal_fn.updateBar = function (durationForExit) {
    let $$ = this,
        barData = $$.barData.bind($$),
        classBar = $$.classBar.bind($$),
        initialOpacity = $$.initialOpacity.bind($$),
        color = function (d) { return $$.color(d.id); };
    $$.mainBar = $$.main.selectAll('.' + CLASS.bars).selectAll('.' + CLASS.bar)
        .data(barData);
    $$.mainBar.enter().append('path')
        .attr('class', classBar)
        .style('stroke', color)
        .style('fill', color);
    $$.mainBar
        .style('opacity', initialOpacity);
    $$.mainBar.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawBar = function (drawBar, withTransition) {
    return [
        (withTransition ? this.mainBar.transition(Math.random().toString()) : this.mainBar)
            .attr('d', drawBar)
            .style('fill', this.color)
            .style('opacity', 1),
    ];
};
c3_chart_internal_fn.getBarW = function (axis, barTargetsNum) {
    let $$ = this, config = $$.config,
        w = typeof config.bar_width === 'number' ? config.bar_width : barTargetsNum ? (axis.tickInterval() * config.bar_width_ratio) / barTargetsNum : 0;
    return config.bar_width_max && w > config.bar_width_max ? config.bar_width_max : w;
};
c3_chart_internal_fn.getBars = function (i, id) {
    const $$ = this;
    return (id ? $$.main.selectAll('.' + CLASS.bars + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS.bar + (isValue(i) ? '-' + i : ''));
};
c3_chart_internal_fn.expandBars = function (i, id, reset) {
    const $$ = this;
    if (reset) { $$.unexpandBars(); }
    $$.getBars(i, id).classed(CLASS.EXPANDED, true);
};
c3_chart_internal_fn.unexpandBars = function (i) {
    const $$ = this;
    $$.getBars(i).classed(CLASS.EXPANDED, false);
};
c3_chart_internal_fn.generateDrawBar = function (barIndices, isSub) {
    let $$ = this, config = $$.config,
        getPoints = $$.generateGetBarPoints(barIndices, isSub);
    return function (d, i) {
        // 4 points that make a bar
        const points = getPoints(d, i);

        // switch points if axis is rotated, not applicable for sub chart
        const indexX = config.axis_rotated ? 1 : 0;
        const indexY = config.axis_rotated ? 0 : 1;

        const path = 'M ' + points[0][indexX] + ',' + points[0][indexY] + ' ' +
                'L' + points[1][indexX] + ',' + points[1][indexY] + ' ' +
                'L' + points[2][indexX] + ',' + points[2][indexY] + ' ' +
                'L' + points[3][indexX] + ',' + points[3][indexY] + ' ' +
                'z';

        return path;
    };
};
c3_chart_internal_fn.generateGetBarPoints = function (barIndices, isSub) {
    let $$ = this,
        axis = isSub ? $$.subXAxis : $$.xAxis,
        barTargetsNum = barIndices.__max__ + 1,
        barW = $$.getBarW(axis, barTargetsNum),
        barX = $$.getShapeX(barW, barTargetsNum, barIndices, !!isSub),
        barY = $$.getShapeY(!!isSub),
        barOffset = $$.getShapeOffset($$.isBarType, barIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        let y0 = yScale.call($$, d.id)(0),
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
            [posX + barW, offset],
        ];
    };
};
c3_chart_internal_fn.isWithinBar = function (that) {
    let mouse = this.d3.mouse(that), box = that.getBoundingClientRect(),
        seg0 = that.pathSegList.getItem(0), seg1 = that.pathSegList.getItem(1),
        x = Math.min(seg0.x, seg1.x), y = Math.min(seg0.y, seg1.y),
        w = box.width, h = box.height, offset = 2,
        sx = x - offset, ex = x + w + offset, sy = y + h + offset, ey = y - offset;
    return sx < mouse[0] && mouse[0] < ex && ey < mouse[1] && mouse[1] < sy;
};

c3_chart_internal_fn.initText = function () {
    const $$ = this;
    $$.main.select('.' + CLASS.chart).append('g')
        .attr('class', CLASS.chartTexts);
    $$.mainText = $$.d3.selectAll([]);
};
c3_chart_internal_fn.updateTargetsForText = function (targets) {
    let $$ = this, mainTextUpdate, mainTextEnter,
        classChartText = $$.classChartText.bind($$),
        classTexts = $$.classTexts.bind($$),
        classFocus = $$.classFocus.bind($$);
    mainTextUpdate = $$.main.select('.' + CLASS.chartTexts).selectAll('.' + CLASS.chartText)
        .data(targets)
        .attr('class', (d) => { return classChartText(d) + classFocus(d); });
    mainTextEnter = mainTextUpdate.enter().append('g')
        .attr('class', classChartText)
        .style('opacity', 0)
        .style('pointer-events', 'none');
    mainTextEnter.append('g')
        .attr('class', classTexts);
};
c3_chart_internal_fn.updateText = function (durationForExit) {
    let $$ = this, config = $$.config,
        barOrLineData = $$.barOrLineData.bind($$),
        classText = $$.classText.bind($$);
    $$.mainText = $$.main.selectAll('.' + CLASS.texts).selectAll('.' + CLASS.text)
        .data(barOrLineData);
    $$.mainText.enter().append('text')
        .attr('class', classText)
        .attr('text-anchor', (d) => { return config.axis_rotated ? (d.value < 0 ? 'end' : 'start') : 'middle'; })
        .style('stroke', 'none')
        .style('fill', (d) => { return $$.color(d); })
        .style('fill-opacity', 0);
    $$.mainText
        .text((d, i, j) => { return $$.dataLabelFormat(d.id)(d.value, d.id, i, j); });
    $$.mainText.exit()
        .transition().duration(durationForExit)
        .style('fill-opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawText = function (xForText, yForText, forFlow, withTransition) {
    return [
        (withTransition ? this.mainText.transition() : this.mainText)
            .attr('x', xForText)
            .attr('y', yForText)
            .style('fill', this.color)
            .style('fill-opacity', forFlow ? 0 : this.opacityForText.bind(this)),
    ];
};
c3_chart_internal_fn.getTextRect = function (text, cls, element) {
    let dummy = this.d3.select('body').append('div').classed('c3', true),
        svg = dummy.append('svg').style('visibility', 'hidden').style('position', 'fixed').style('top', 0).style('left', 0),
        font = this.d3.select(element).style('font'),
        rect;
    svg.selectAll('.dummy')
        .data([text])
      .enter().append('text')
        .classed(cls ? cls : '', true)
        .style('font', font)
        .text(text)
      .each(function () { rect = this.getBoundingClientRect(); });
    dummy.remove();
    return rect;
};
c3_chart_internal_fn.generateXYForText = function (areaIndices, barIndices, lineIndices, forX) {
    let $$ = this,
        getAreaPoints = $$.generateGetAreaPoints(areaIndices, false),
        getBarPoints = $$.generateGetBarPoints(barIndices, false),
        getLinePoints = $$.generateGetLinePoints(lineIndices, false),
        getter = forX ? $$.getXForText : $$.getYForText;
    return function (d, i) {
        const getPoints = $$.isAreaType(d) ? getAreaPoints : $$.isBarType(d) ? getBarPoints : getLinePoints;
        return getter.call($$, getPoints(d, i), d, this);
    };
};
c3_chart_internal_fn.getXForText = function (points, d, textElement) {
    let $$ = this,
        box = textElement.getBoundingClientRect(), xPos, padding;
    if ($$.config.axis_rotated) {
        padding = $$.isBarType(d) ? 4 : 6;
        xPos = points[2][1] + padding * (d.value < 0 ? -1 : 1);
    } else {
        xPos = $$.hasType('bar') ? (points[2][0] + points[0][0]) / 2 : points[0][0];
    }
    // show labels regardless of the domain if value is null
    if (d.value === null) {
        if (xPos > $$.width) {
            xPos = $$.width - box.width;
        } else if (xPos < 0) {
            xPos = 4;
        }
    }
    return xPos;
};
c3_chart_internal_fn.getYForText = function (points, d, textElement) {
    let $$ = this,
        box = textElement.getBoundingClientRect(),
        yPos;
    if ($$.config.axis_rotated) {
        yPos = (points[0][0] + points[2][0] + box.height * 0.6) / 2;
    } else {
        yPos = points[2][1];
        if (d.value < 0 || (d.value === 0 && !$$.hasPositiveValue)) {
            yPos += box.height;
            if ($$.isBarType(d) && $$.isSafari()) {
                yPos -= 3;
            }
            else if (!$$.isBarType(d) && $$.isChrome()) {
                yPos += 3;
            }
        } else {
            yPos += $$.isBarType(d) ? -3 : -6;
        }
    }
    // show labels regardless of the domain if value is null
    if (d.value === null && !$$.config.axis_rotated) {
        if (yPos < box.height) {
            yPos = box.height;
        } else if (yPos > this.height) {
            yPos = this.height - 4;
        }
    }
    return yPos;
};

c3_chart_internal_fn.setTargetType = function (targetIds, type) {
    let $$ = this, config = $$.config;
    $$.mapToTargetIds(targetIds).forEach((id) => {
        $$.withoutFadeIn[id] = (type === config.data_types[id]);
        config.data_types[id] = type;
    });
    if (!targetIds) {
        config.data_type = type;
    }
};
c3_chart_internal_fn.hasType = function (type, targets) {
    let $$ = this, types = $$.config.data_types, has = false;
    targets = targets || $$.data.targets;
    if (targets && targets.length) {
        targets.forEach((target) => {
            const t = types[target.id];
            if ((t && t.indexOf(type) >= 0) || (!t && type === 'line')) {
                has = true;
            }
        });
    } else if (Object.keys(types).length) {
        Object.keys(types).forEach((id) => {
            if (types[id] === type) { has = true; }
        });
    } else {
        has = $$.config.data_type === type;
    }
    return has;
};
c3_chart_internal_fn.hasArcType = function (targets) {
    return this.hasType('pie', targets) || this.hasType('donut', targets) || this.hasType('gauge', targets);
};
c3_chart_internal_fn.isLineType = function (d) {
    let config = this.config, id = isString(d) ? d : d.id;
    return !config.data_types[id] || ['line', 'spline', 'area', 'area-spline', 'step', 'area-step'].indexOf(config.data_types[id]) >= 0;
};
c3_chart_internal_fn.isStepType = function (d) {
    const id = isString(d) ? d : d.id;
    return ['step', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
c3_chart_internal_fn.isSplineType = function (d) {
    const id = isString(d) ? d : d.id;
    return ['spline', 'area-spline'].indexOf(this.config.data_types[id]) >= 0;
};
c3_chart_internal_fn.isAreaType = function (d) {
    const id = isString(d) ? d : d.id;
    return ['area', 'area-spline', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
c3_chart_internal_fn.isBarType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'bar';
};
c3_chart_internal_fn.isScatterType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'scatter';
};
c3_chart_internal_fn.isPieType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'pie';
};
c3_chart_internal_fn.isGaugeType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'gauge';
};
c3_chart_internal_fn.isDonutType = function (d) {
    const id = isString(d) ? d : d.id;
    return this.config.data_types[id] === 'donut';
};
c3_chart_internal_fn.isArcType = function (d) {
    return this.isPieType(d) || this.isDonutType(d) || this.isGaugeType(d);
};
c3_chart_internal_fn.lineData = function (d) {
    return this.isLineType(d) ? [d] : [];
};
c3_chart_internal_fn.arcData = function (d) {
    return this.isArcType(d.data) ? [d] : [];
};
/* not used
 function scatterData(d) {
 return isScatterType(d) ? d.values : [];
 }
 */
c3_chart_internal_fn.barData = function (d) {
    return this.isBarType(d) ? d.values : [];
};
c3_chart_internal_fn.lineOrScatterData = function (d) {
    return this.isLineType(d) || this.isScatterType(d) ? d.values : [];
};
c3_chart_internal_fn.barOrLineData = function (d) {
    return this.isBarType(d) || this.isLineType(d) ? d.values : [];
};
c3_chart_internal_fn.isInterpolationType = function (type) {
    return ['linear', 'linear-closed', 'basis', 'basis-open', 'basis-closed', 'bundle', 'cardinal', 'cardinal-open', 'cardinal-closed', 'monotone'].indexOf(type) >= 0;
};

c3_chart_internal_fn.initGrid = function () {
    let $$ = this, config = $$.config, d3 = $$.d3;
    $$.grid = $$.main.append('g')
        .attr('clip-path', $$.clipPathForGrid)
        .attr('class', CLASS.grid);
    if (config.grid_x_show) {
        $$.grid.append('g').attr('class', CLASS.xgrids);
    }
    if (config.grid_y_show) {
        $$.grid.append('g').attr('class', CLASS.ygrids);
    }
    if (config.grid_focus_show) {
        $$.grid.append('g')
            .attr('class', CLASS.xgridFocus)
            .append('line')
            .attr('class', CLASS.xgridFocus);
    }
    $$.xgrid = d3.selectAll([]);
    if (!config.grid_lines_front) { $$.initGridLines(); }
};
c3_chart_internal_fn.initGridLines = function () {
    let $$ = this, d3 = $$.d3;
    $$.gridLines = $$.main.append('g')
        .attr('clip-path', $$.clipPathForGrid)
        .attr('class', CLASS.grid + ' ' + CLASS.gridLines);
    $$.gridLines.append('g').attr('class', CLASS.xgridLines);
    $$.gridLines.append('g').attr('class', CLASS.ygridLines);
    $$.xgridLines = d3.selectAll([]);
};
c3_chart_internal_fn.updateXGrid = function (withoutUpdate) {
    let $$ = this, config = $$.config, d3 = $$.d3,
        xgridData = $$.generateGridData(config.grid_x_type, $$.x),
        tickOffset = $$.isCategorized() ? $$.xAxis.tickOffset() : 0;

    $$.xgridAttr = config.axis_rotated ? {
        'x1': 0,
        'x2': $$.width,
        'y1': function (d) { return $$.x(d) - tickOffset; },
        'y2': function (d) { return $$.x(d) - tickOffset; },
    } : {
        'x1': function (d) { return $$.x(d) + tickOffset; },
        'x2': function (d) { return $$.x(d) + tickOffset; },
        'y1': 0,
        'y2': $$.height,
    };

    $$.xgrid = $$.main.select('.' + CLASS.xgrids).selectAll('.' + CLASS.xgrid)
        .data(xgridData);
    $$.xgrid.enter().append('line').attr('class', CLASS.xgrid);
    if (!withoutUpdate) {
        $$.xgrid.attr($$.xgridAttr)
            .style('opacity', function () { return +d3.select(this).attr(config.axis_rotated ? 'y1' : 'x1') === (config.axis_rotated ? $$.height : 0) ? 0 : 1; });
    }
    $$.xgrid.exit().remove();
};

c3_chart_internal_fn.updateYGrid = function () {
    let $$ = this, config = $$.config,
        gridValues = $$.yAxis.tickValues() || $$.y.ticks(config.grid_y_ticks);
    $$.ygrid = $$.main.select('.' + CLASS.ygrids).selectAll('.' + CLASS.ygrid)
        .data(gridValues);
    $$.ygrid.enter().append('line')
        .attr('class', CLASS.ygrid);
    $$.ygrid.attr('x1', config.axis_rotated ? $$.y : 0)
        .attr('x2', config.axis_rotated ? $$.y : $$.width)
        .attr('y1', config.axis_rotated ? 0 : $$.y)
        .attr('y2', config.axis_rotated ? $$.height : $$.y);
    $$.ygrid.exit().remove();
    $$.smoothLines($$.ygrid, 'grid');
};

c3_chart_internal_fn.gridTextAnchor = function (d) {
    return d.position ? d.position : 'end';
};
c3_chart_internal_fn.gridTextDx = function (d) {
    return d.position === 'start' ? 4 : d.position === 'middle' ? 0 : -4;
};
c3_chart_internal_fn.xGridTextX = function (d) {
    return d.position === 'start' ? -this.height : d.position === 'middle' ? -this.height / 2 : 0;
};
c3_chart_internal_fn.yGridTextX = function (d) {
    return d.position === 'start' ? 0 : d.position === 'middle' ? this.width / 2 : this.width;
};
c3_chart_internal_fn.updateGrid = function (duration) {
    let $$ = this, main = $$.main, config = $$.config,
        xgridLine, ygridLine, yv;

    // hide if arc type
    $$.grid.style('visibility', $$.hasArcType() ? 'hidden' : 'visible');

    main.select('line.' + CLASS.xgridFocus).style('visibility', 'hidden');
    if (config.grid_x_show) {
        $$.updateXGrid();
    }
    $$.xgridLines = main.select('.' + CLASS.xgridLines).selectAll('.' + CLASS.xgridLine)
        .data(config.grid_x_lines);
    // enter
    xgridLine = $$.xgridLines.enter().append('g')
        .attr('class', (d) => { return CLASS.xgridLine + (d.class ? ' ' + d.class : ''); });
    xgridLine.append('line')
        .style('opacity', 0);
    xgridLine.append('text')
        .attr('text-anchor', $$.gridTextAnchor)
        .attr('transform', config.axis_rotated ? '' : 'rotate(-90)')
        .attr('dx', $$.gridTextDx)
        .attr('dy', -5)
        .style('opacity', 0);
    // udpate
    // done in d3.transition() of the end of this function
    // exit
    $$.xgridLines.exit().transition().duration(duration)
        .style('opacity', 0)
        .remove();

    // Y-Grid
    if (config.grid_y_show) {
        $$.updateYGrid();
    }
    $$.ygridLines = main.select('.' + CLASS.ygridLines).selectAll('.' + CLASS.ygridLine)
        .data(config.grid_y_lines);
    // enter
    ygridLine = $$.ygridLines.enter().append('g')
        .attr('class', (d) => { return CLASS.ygridLine + (d.class ? ' ' + d.class : ''); });
    ygridLine.append('line')
        .style('opacity', 0);
    ygridLine.append('text')
        .attr('text-anchor', $$.gridTextAnchor)
        .attr('transform', config.axis_rotated ? 'rotate(-90)' : '')
        .attr('dx', $$.gridTextDx)
        .attr('dy', -5)
        .style('opacity', 0);
    // update
    yv = $$.yv.bind($$);
    $$.ygridLines.select('line')
      .transition().duration(duration)
        .attr('x1', config.axis_rotated ? yv : 0)
        .attr('x2', config.axis_rotated ? yv : $$.width)
        .attr('y1', config.axis_rotated ? 0 : yv)
        .attr('y2', config.axis_rotated ? $$.height : yv)
        .style('opacity', 1);
    $$.ygridLines.select('text')
      .transition().duration(duration)
        .attr('x', config.axis_rotated ? $$.xGridTextX.bind($$) : $$.yGridTextX.bind($$))
        .attr('y', yv)
        .text((d) => { return d.text; })
        .style('opacity', 1);
    // exit
    $$.ygridLines.exit().transition().duration(duration)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawGrid = function (withTransition) {
    let $$ = this, config = $$.config, xv = $$.xv.bind($$),
        lines = $$.xgridLines.select('line'),
        texts = $$.xgridLines.select('text');
    return [
        (withTransition ? lines.transition() : lines)
            .attr('x1', config.axis_rotated ? 0 : xv)
            .attr('x2', config.axis_rotated ? $$.width : xv)
            .attr('y1', config.axis_rotated ? xv : 0)
            .attr('y2', config.axis_rotated ? xv : $$.height)
            .style('opacity', 1),
        (withTransition ? texts.transition() : texts)
            .attr('x', config.axis_rotated ? $$.yGridTextX.bind($$) : $$.xGridTextX.bind($$))
            .attr('y', xv)
            .text((d) => { return d.text; })
            .style('opacity', 1),
    ];
};
c3_chart_internal_fn.showXGridFocus = function (selectedData) {
    let $$ = this, config = $$.config,
        dataToShow = selectedData.filter((d) => { return d && isValue(d.value); }),
        focusEl = $$.main.selectAll('line.' + CLASS.xgridFocus),
        xx = $$.xx.bind($$);
    if (!config.tooltip_show) { return; }
    // Hide when scatter plot exists
    if ($$.hasType('scatter') || $$.hasArcType()) { return; }
    focusEl
        .style('visibility', 'visible')
        .data([dataToShow[0]])
        .attr(config.axis_rotated ? 'y1' : 'x1', xx)
        .attr(config.axis_rotated ? 'y2' : 'x2', xx);
    $$.smoothLines(focusEl, 'grid');
};
c3_chart_internal_fn.hideXGridFocus = function () {
    this.main.select('line.' + CLASS.xgridFocus).style('visibility', 'hidden');
};
c3_chart_internal_fn.updateXgridFocus = function () {
    let $$ = this, config = $$.config;
    $$.main.select('line.' + CLASS.xgridFocus)
        .attr('x1', config.axis_rotated ? 0 : -10)
        .attr('x2', config.axis_rotated ? $$.width : -10)
        .attr('y1', config.axis_rotated ? -10 : 0)
        .attr('y2', config.axis_rotated ? -10 : $$.height);
};
c3_chart_internal_fn.generateGridData = function (type, scale) {
    let $$ = this,
        gridData = [], xDomain, firstYear, lastYear, i,
        tickNum = $$.main.select('.' + CLASS.axisX).selectAll('.tick').size();
    if (type === 'year') {
        xDomain = $$.getXDomain();
        firstYear = xDomain[0].getFullYear();
        lastYear = xDomain[1].getFullYear();
        for (i = firstYear; i <= lastYear; i++) {
            gridData.push(new Date(i + '-01-01 00:00:00'));
        }
    } else {
        gridData = scale.ticks(10);
        if (gridData.length > tickNum) { // use only int
            gridData = gridData.filter((d) => { return ('' + d).indexOf('.') < 0; });
        }
    }
    return gridData;
};
c3_chart_internal_fn.getGridFilterToRemove = function (params) {
    return params ? function (line) {
        let found = false;
        [].concat(params).forEach((param) => {
            if ((('value' in param && line.value === param.value) || ('class' in param && line.class === param.class))) {
                found = true;
            }
        });
        return found;
    } : function () { return true; };
};
c3_chart_internal_fn.removeGridLines = function (params, forX) {
    let $$ = this, config = $$.config,
        toRemove = $$.getGridFilterToRemove(params),
        toShow = function (line) { return !toRemove(line); },
        classLines = forX ? CLASS.xgridLines : CLASS.ygridLines,
        classLine = forX ? CLASS.xgridLine : CLASS.ygridLine;
    $$.main.select('.' + classLines).selectAll('.' + classLine).filter(toRemove)
        .transition().duration(config.transition_duration)
        .style('opacity', 0).remove();
    if (forX) {
        config.grid_x_lines = config.grid_x_lines.filter(toShow);
    } else {
        config.grid_y_lines = config.grid_y_lines.filter(toShow);
    }
};

c3_chart_internal_fn.initTooltip = function () {
    let $$ = this, config = $$.config, i;
    $$.tooltip = $$.selectChart
        .style('position', 'relative')
      .append('div')
        .attr('class', CLASS.tooltipContainer)
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('display', 'none');
    // Show tooltip if needed
    if (config.tooltip_init_show) {
        if ($$.isTimeSeries() && isString(config.tooltip_init_x)) {
            config.tooltip_init_x = $$.parseDate(config.tooltip_init_x);
            for (i = 0; i < $$.data.targets[0].values.length; i++) {
                if (($$.data.targets[0].values[i].x - config.tooltip_init_x) === 0) { break; }
            }
            config.tooltip_init_x = i;
        }
        $$.tooltip.html(config.tooltip_contents.call($$, $$.data.targets.map((d) => {
            return $$.addName(d.values[config.tooltip_init_x]);
        }), $$.axis.getXAxisTickFormat(), $$.getYFormat($$.hasArcType()), $$.color));
        $$.tooltip.style('top', config.tooltip_init_position.top)
            .style('left', config.tooltip_init_position.left)
            .style('display', 'block');
    }
};
c3_chart_internal_fn.getTooltipContent = function (d, defaultTitleFormat, defaultValueFormat, color) {
    let $$ = this, config = $$.config,
        titleFormat = config.tooltip_format_title || defaultTitleFormat,
        nameFormat = config.tooltip_format_name || function (name) { return name; },
        valueFormat = config.tooltip_format_value || defaultValueFormat,
        text, i, title, value, name, bgcolor,
        orderAsc = $$.isOrderAsc();

    if (config.data_groups.length === 0) {
        d.sort((a, b) => {
            let v1 = a ? a.value : null, v2 = b ? b.value : null;
            return orderAsc ? v1 - v2 : v2 - v1;
        });
    } else {
        const ids = $$.orderTargets($$.data.targets).map((i) => {
            return i.id;
        });
        d.sort((a, b) => {
            let v1 = a ? a.value : null, v2 = b ? b.value : null;
            if (v1 > 0 && v2 > 0) {
                v1 = a ? ids.indexOf(a.id) : null;
                v2 = b ? ids.indexOf(b.id) : null;
            }
            return orderAsc ? v1 - v2 : v2 - v1;
        });
    }

    for (i = 0; i < d.length; i++) {
        if (!(d[i] && (d[i].value || d[i].value === 0))) { continue; }

        if (!text) {
            title = sanitise(titleFormat ? titleFormat(d[i].x) : d[i].x);
            text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + '</th></tr>' : '');
        }

        value = sanitise(valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index, d));
        if (value !== undefined) {
            // Skip elements when their name is set to null
            if (d[i].name === null) { continue; }
            name = sanitise(nameFormat(d[i].name, d[i].ratio, d[i].id, d[i].index));
            bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

            text += "<tr class='" + $$.CLASS.tooltipName + '-' + $$.getTargetSelectorSuffix(d[i].id) + "'>";
            text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + '</td>';
            text += "<td class='value'>" + value + '</td>';
            text += '</tr>';
        }
    }
    return text + '</table>';
};
c3_chart_internal_fn.tooltipPosition = function (dataToShow, tWidth, tHeight, element) {
    let $$ = this, config = $$.config, d3 = $$.d3;
    let svgLeft, tooltipLeft, tooltipRight, tooltipTop, chartRight;
    let forArc = $$.hasArcType(),
        mouse = d3.mouse(element);
  // Determin tooltip position
    if (forArc) {
        tooltipLeft = (($$.width - ($$.isLegendRight ? $$.getLegendWidth() : 0)) / 2) + mouse[0];
        tooltipTop = ($$.height / 2) + mouse[1] + 20;
    } else {
        svgLeft = $$.getSvgLeft(true);
        if (config.axis_rotated) {
            tooltipLeft = svgLeft + mouse[0] + 100;
            tooltipRight = tooltipLeft + tWidth;
            chartRight = $$.currentWidth - $$.getCurrentPaddingRight();
            tooltipTop = $$.x(dataToShow[0].x) + 20;
        } else {
            tooltipLeft = svgLeft + $$.getCurrentPaddingLeft(true) + $$.x(dataToShow[0].x) + 20;
            tooltipRight = tooltipLeft + tWidth;
            chartRight = svgLeft + $$.currentWidth - $$.getCurrentPaddingRight();
            tooltipTop = mouse[1] + 15;
        }

        if (tooltipRight > chartRight) {
            // 20 is needed for Firefox to keep tooltip width
            tooltipLeft -= tooltipRight - chartRight + 20;
        }
        if (tooltipTop + tHeight > $$.currentHeight) {
            tooltipTop -= tHeight + 30;
        }
    }
    if (tooltipTop < 0) {
        tooltipTop = 0;
    }
    return { top: tooltipTop, left: tooltipLeft };
};
c3_chart_internal_fn.showTooltip = function (selectedData, element) {
    let $$ = this, config = $$.config;
    let tWidth, tHeight, position;
    let forArc = $$.hasArcType(),
        dataToShow = selectedData.filter((d) => { return d && isValue(d.value); }),
        positionFunction = config.tooltip_position || c3_chart_internal_fn.tooltipPosition;
    if (dataToShow.length === 0 || !config.tooltip_show) {
        return;
    }
    $$.tooltip.html(config.tooltip_contents.call($$, selectedData, $$.axis.getXAxisTickFormat(), $$.getYFormat(forArc), $$.color)).style('display', 'block');

    // Get tooltip dimensions
    tWidth = $$.tooltip.property('offsetWidth');
    tHeight = $$.tooltip.property('offsetHeight');

    position = positionFunction.call(this, dataToShow, tWidth, tHeight, element);
    // Set tooltip
    $$.tooltip
        .style('top', position.top + 'px')
        .style('left', position.left + 'px');
};
c3_chart_internal_fn.hideTooltip = function () {
    this.tooltip.style('display', 'none');
};

c3_chart_internal_fn.initLegend = function () {
    const $$ = this;
    $$.legendItemTextBox = {};
    $$.legendHasRendered = false;
    $$.legend = $$.svg.append('g').attr('transform', $$.getTranslate('legend'));
    if (!$$.config.legend_show) {
        $$.legend.style('visibility', 'hidden');
        $$.hiddenLegendIds = $$.mapToIds($$.data.targets);
        return;
    }
    // MEMO: call here to update legend box and tranlate for all
    // MEMO: translate will be upated by this, so transform not needed in updateLegend()
    $$.updateLegendWithDefaults();
};
c3_chart_internal_fn.updateLegendWithDefaults = function () {
    const $$ = this;
    $$.updateLegend($$.mapToIds($$.data.targets), { withTransform: false, withTransitionForTransform: false, withTransition: false });
};
c3_chart_internal_fn.updateSizeForLegend = function (legendHeight, legendWidth) {
    let $$ = this, config = $$.config, insetLegendPosition = {
            top: $$.isLegendTop ? $$.getCurrentPaddingTop() + config.legend_inset_y + 5.5 : $$.currentHeight - legendHeight - $$.getCurrentPaddingBottom() - config.legend_inset_y,
            left: $$.isLegendLeft ? $$.getCurrentPaddingLeft() + config.legend_inset_x + 0.5 : $$.currentWidth - legendWidth - $$.getCurrentPaddingRight() - config.legend_inset_x + 0.5,
        };

    $$.margin3 = {
        top: $$.isLegendRight ? 0 : $$.isLegendInset ? insetLegendPosition.top : $$.currentHeight - legendHeight,
        right: NaN,
        bottom: 0,
        left: $$.isLegendRight ? $$.currentWidth - legendWidth : $$.isLegendInset ? insetLegendPosition.left : 0,
    };
};
c3_chart_internal_fn.transformLegend = function (withTransition) {
    const $$ = this;
    (withTransition ? $$.legend.transition() : $$.legend).attr('transform', $$.getTranslate('legend'));
};
c3_chart_internal_fn.updateLegendStep = function (step) {
    this.legendStep = step;
};
c3_chart_internal_fn.updateLegendItemWidth = function (w) {
    this.legendItemWidth = w;
};
c3_chart_internal_fn.updateLegendItemHeight = function (h) {
    this.legendItemHeight = h;
};
c3_chart_internal_fn.getLegendWidth = function () {
    const $$ = this;
    return $$.config.legend_show ? $$.isLegendRight || $$.isLegendInset ? $$.legendItemWidth * ($$.legendStep + 1) : $$.currentWidth : 0;
};
c3_chart_internal_fn.getLegendHeight = function () {
    let $$ = this, h = 0;
    if ($$.config.legend_show) {
        if ($$.isLegendRight) {
            h = $$.currentHeight;
        } else {
            h = Math.max(20, $$.legendItemHeight) * ($$.legendStep + 1);
        }
    }
    return h;
};
c3_chart_internal_fn.opacityForLegend = function (legendItem) {
    return legendItem.classed(CLASS.legendItemHidden) ? null : 1;
};
c3_chart_internal_fn.opacityForUnfocusedLegend = function (legendItem) {
    return legendItem.classed(CLASS.legendItemHidden) ? null : 0.3;
};
c3_chart_internal_fn.toggleFocusLegend = function (targetIds, focus) {
    const $$ = this;
    targetIds = $$.mapToTargetIds(targetIds);
    $$.legend.selectAll('.' + CLASS.legendItem)
        .filter((id) => { return targetIds.indexOf(id) >= 0; })
        .classed(CLASS.legendItemFocused, focus)
      .transition().duration(100)
        .style('opacity', function () {
            const opacity = focus ? $$.opacityForLegend : $$.opacityForUnfocusedLegend;
            return opacity.call($$, $$.d3.select(this));
        });
};
c3_chart_internal_fn.revertLegend = function () {
    let $$ = this, d3 = $$.d3;
    $$.legend.selectAll('.' + CLASS.legendItem)
        .classed(CLASS.legendItemFocused, false)
        .transition().duration(100)
        .style('opacity', function () { return $$.opacityForLegend(d3.select(this)); });
};
c3_chart_internal_fn.showLegend = function (targetIds) {
    let $$ = this, config = $$.config;
    if (!config.legend_show) {
        config.legend_show = true;
        $$.legend.style('visibility', 'visible');
        if (!$$.legendHasRendered) {
            $$.updateLegendWithDefaults();
        }
    }
    $$.removeHiddenLegendIds(targetIds);
    $$.legend.selectAll($$.selectorLegends(targetIds))
        .style('visibility', 'visible')
        .transition()
        .style('opacity', function () { return $$.opacityForLegend($$.d3.select(this)); });
};
c3_chart_internal_fn.hideLegend = function (targetIds) {
    let $$ = this, config = $$.config;
    if (config.legend_show && isEmpty(targetIds)) {
        config.legend_show = false;
        $$.legend.style('visibility', 'hidden');
    }
    $$.addHiddenLegendIds(targetIds);
    $$.legend.selectAll($$.selectorLegends(targetIds))
        .style('opacity', 0)
        .style('visibility', 'hidden');
};
c3_chart_internal_fn.clearLegendItemTextBoxCache = function () {
    this.legendItemTextBox = {};
};
c3_chart_internal_fn.updateLegend = function (targetIds, options, transitions) {
    let $$ = this, config = $$.config;
    let xForLegend, xForLegendText, xForLegendRect, yForLegend, yForLegendText, yForLegendRect, x1ForLegendTile, x2ForLegendTile, yForLegendTile;
    let paddingTop = 4, paddingRight = 10, maxWidth = 0, maxHeight = 0, posMin = 10, tileWidth = config.legend_item_tile_width + 5;
    let l, totalLength = 0, offsets = {}, widths = {}, heights = {}, margins = [0], steps = {}, step = 0;
    let withTransition, withTransitionForTransform;
    let texts, rects, tiles, background;

    // Skip elements when their name is set to null
    targetIds = targetIds.filter((id) => {
        return !isDefined(config.data_names[id]) || config.data_names[id] !== null;
    });

    options = options || {};
    withTransition = getOption(options, 'withTransition', true);
    withTransitionForTransform = getOption(options, 'withTransitionForTransform', true);

    function getTextBox(textElement, id) {
        if (!$$.legendItemTextBox[id]) {
            $$.legendItemTextBox[id] = $$.getTextRect(textElement.textContent, CLASS.legendItem, textElement);
        }
        return $$.legendItemTextBox[id];
    }

    function updatePositions(textElement, id, index) {
        let reset = index === 0, isLast = index === targetIds.length - 1,
            box = getTextBox(textElement, id),
            itemWidth = box.width + tileWidth + (isLast && !($$.isLegendRight || $$.isLegendInset) ? 0 : paddingRight) + config.legend_padding,
            itemHeight = box.height + paddingTop,
            itemLength = $$.isLegendRight || $$.isLegendInset ? itemHeight : itemWidth,
            areaLength = $$.isLegendRight || $$.isLegendInset ? $$.getLegendHeight() : $$.getLegendWidth(),
            margin, maxLength;

        // MEMO: care about condifion of step, totalLength
        function updateValues(id, withoutStep) {
            if (!withoutStep) {
                margin = (areaLength - totalLength - itemLength) / 2;
                if (margin < posMin) {
                    margin = (areaLength - itemLength) / 2;
                    totalLength = 0;
                    step++;
                }
            }
            steps[id] = step;
            margins[step] = $$.isLegendInset ? 10 : margin;
            offsets[id] = totalLength;
            totalLength += itemLength;
        }

        if (reset) {
            totalLength = 0;
            step = 0;
            maxWidth = 0;
            maxHeight = 0;
        }

        if (config.legend_show && !$$.isLegendToShow(id)) {
            widths[id] = heights[id] = steps[id] = offsets[id] = 0;
            return;
        }

        widths[id] = itemWidth;
        heights[id] = itemHeight;

        if (!maxWidth || itemWidth >= maxWidth) { maxWidth = itemWidth; }
        if (!maxHeight || itemHeight >= maxHeight) { maxHeight = itemHeight; }
        maxLength = $$.isLegendRight || $$.isLegendInset ? maxHeight : maxWidth;

        if (config.legend_equally) {
            Object.keys(widths).forEach((id) => { widths[id] = maxWidth; });
            Object.keys(heights).forEach((id) => { heights[id] = maxHeight; });
            margin = (areaLength - maxLength * targetIds.length) / 2;
            if (margin < posMin) {
                totalLength = 0;
                step = 0;
                targetIds.forEach((id) => { updateValues(id); });
            }
            else {
                updateValues(id, true);
            }
        } else {
            updateValues(id);
        }
    }

    if ($$.isLegendInset) {
        step = config.legend_inset_step ? config.legend_inset_step : targetIds.length;
        $$.updateLegendStep(step);
    }

    if ($$.isLegendRight) {
        xForLegend = function (id) { return maxWidth * steps[id]; };
        yForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
    } else if ($$.isLegendInset) {
        xForLegend = function (id) { return maxWidth * steps[id] + 10; };
        yForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
    } else {
        xForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
        yForLegend = function (id) { return maxHeight * steps[id]; };
    }
    xForLegendText = function (id, i) { return xForLegend(id, i) + 4 + config.legend_item_tile_width; };
    yForLegendText = function (id, i) { return yForLegend(id, i) + 9; };
    xForLegendRect = function (id, i) { return xForLegend(id, i); };
    yForLegendRect = function (id, i) { return yForLegend(id, i) - 5; };
    x1ForLegendTile = function (id, i) { return xForLegend(id, i) - 2; };
    x2ForLegendTile = function (id, i) { return xForLegend(id, i) - 2 + config.legend_item_tile_width; };
    yForLegendTile = function (id, i) { return yForLegend(id, i) + 4; };

    // Define g for legend area
    l = $$.legend.selectAll('.' + CLASS.legendItem)
        .data(targetIds)
        .enter().append('g')
        .attr('class', (id) => { return $$.generateClass(CLASS.legendItem, id); })
        .style('visibility', (id) => { return $$.isLegendToShow(id) ? 'visible' : 'hidden'; })
        .style('cursor', 'pointer')
        .on('click', (id) => {
            if (config.legend_item_onclick) {
                config.legend_item_onclick.call($$, id);
            } else {
                if ($$.d3.event.altKey) {
                    $$.api.hide();
                    $$.api.show(id);
                } else {
                    $$.api.toggle(id);
                    $$.isTargetToShow(id) ? $$.api.focus(id) : $$.api.revert();
                }
            }
        })
        .on('mouseover', function (id) {
            if (config.legend_item_onmouseover) {
                config.legend_item_onmouseover.call($$, id);
            }
            else {
                $$.d3.select(this).classed(CLASS.legendItemFocused, true);
                if (!$$.transiting && $$.isTargetToShow(id)) {
                    $$.api.focus(id);
                }
            }
        })
        .on('mouseout', function (id) {
            if (config.legend_item_onmouseout) {
                config.legend_item_onmouseout.call($$, id);
            }
            else {
                $$.d3.select(this).classed(CLASS.legendItemFocused, false);
                $$.api.revert();
            }
        });
    l.append('text')
        .text((id) => { return isDefined(config.data_names[id]) ? config.data_names[id] : id; })
        .each(function (id, i) { updatePositions(this, id, i); })
        .style('pointer-events', 'none')
        .attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendText : -200)
        .attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendText);
    l.append('rect')
        .attr('class', CLASS.legendItemEvent)
        .style('fill-opacity', 0)
        .attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendRect : -200)
        .attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendRect);
    l.append('line')
        .attr('class', CLASS.legendItemTile)
        .style('stroke', $$.color)
        .style('pointer-events', 'none')
        .attr('x1', $$.isLegendRight || $$.isLegendInset ? x1ForLegendTile : -200)
        .attr('y1', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile)
        .attr('x2', $$.isLegendRight || $$.isLegendInset ? x2ForLegendTile : -200)
        .attr('y2', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile)
        .attr('stroke-width', config.legend_item_tile_height);

    // Set background for inset legend
    background = $$.legend.select('.' + CLASS.legendBackground + ' rect');
    if ($$.isLegendInset && maxWidth > 0 && background.size() === 0) {
        background = $$.legend.insert('g', '.' + CLASS.legendItem)
            .attr('class', CLASS.legendBackground)
            .append('rect');
    }

    texts = $$.legend.selectAll('text')
        .data(targetIds)
        .text((id) => { return isDefined(config.data_names[id]) ? config.data_names[id] : id; }) // MEMO: needed for update
        .each(function (id, i) { updatePositions(this, id, i); });
    (withTransition ? texts.transition() : texts)
        .attr('x', xForLegendText)
        .attr('y', yForLegendText);

    rects = $$.legend.selectAll('rect.' + CLASS.legendItemEvent)
        .data(targetIds);
    (withTransition ? rects.transition() : rects)
        .attr('width', (id) => { return widths[id]; })
        .attr('height', (id) => { return heights[id]; })
        .attr('x', xForLegendRect)
        .attr('y', yForLegendRect);

    tiles = $$.legend.selectAll('line.' + CLASS.legendItemTile)
            .data(targetIds);
    (withTransition ? tiles.transition() : tiles)
            .style('stroke', $$.color)
            .attr('x1', x1ForLegendTile)
            .attr('y1', yForLegendTile)
            .attr('x2', x2ForLegendTile)
            .attr('y2', yForLegendTile);

    if (background) {
        (withTransition ? background.transition() : background)
            .attr('height', $$.getLegendHeight() - 12)
            .attr('width', maxWidth * (step + 1) + 10);
    }

    // toggle legend state
    $$.legend.selectAll('.' + CLASS.legendItem)
        .classed(CLASS.legendItemHidden, (id) => { return !$$.isTargetToShow(id); });

    // Update all to reflect change of legend
    $$.updateLegendItemWidth(maxWidth);
    $$.updateLegendItemHeight(maxHeight);
    $$.updateLegendStep(step);
    // Update size and scale
    $$.updateSizes();
    $$.updateScales();
    $$.updateSvgSize();
    // Update g positions
    $$.transformAll(withTransitionForTransform, transitions);
    $$.legendHasRendered = true;
};

c3_chart_internal_fn.initTitle = function () {
    const $$ = this;
    $$.title = $$.svg.append('text')
          .text($$.config.title_text)
          .attr('class', $$.CLASS.title);
};
c3_chart_internal_fn.redrawTitle = function () {
    const $$ = this;
    $$.title
          .attr('x', $$.xForTitle.bind($$))
          .attr('y', $$.yForTitle.bind($$));
};
c3_chart_internal_fn.xForTitle = function () {
    let $$ = this, config = $$.config, position = config.title_position || 'left', x;
    if (position.indexOf('right') >= 0) {
        x = $$.currentWidth - $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).width - config.title_padding.right;
    } else if (position.indexOf('center') >= 0) {
        x = ($$.currentWidth - $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).width) / 2;
    } else { // left
        x = config.title_padding.left;
    }
    return x;
};
c3_chart_internal_fn.yForTitle = function () {
    const $$ = this;
    return $$.config.title_padding.top + $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).height;
};
c3_chart_internal_fn.getTitlePadding = function () {
    const $$ = this;
    return $$.yForTitle() + $$.config.title_padding.bottom;
};

c3_chart_internal_fn.getClipPath = function (id) {
    const isIE9 = window.navigator.appVersion.toLowerCase().indexOf('msie 9.') >= 0;
    return 'url(' + (isIE9 ? '' : document.URL.split('#')[0]) + '#' + id + ')';
};
c3_chart_internal_fn.appendClip = function (parent, id) {
    return parent.append('clipPath').attr('id', id).append('rect');
};
c3_chart_internal_fn.getAxisClipX = function (forHorizontal) {
    // axis line width + padding for left
    const left = Math.max(30, this.margin.left);
    return forHorizontal ? -(1 + left) : -(left - 1);
};
c3_chart_internal_fn.getAxisClipY = function (forHorizontal) {
    return forHorizontal ? -20 : -this.margin.top;
};
c3_chart_internal_fn.getXAxisClipX = function () {
    const $$ = this;
    return $$.getAxisClipX(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getXAxisClipY = function () {
    const $$ = this;
    return $$.getAxisClipY(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipX = function () {
    const $$ = this;
    return $$.config.axis_y_inner ? -1 : $$.getAxisClipX($$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipY = function () {
    const $$ = this;
    return $$.getAxisClipY($$.config.axis_rotated);
};
c3_chart_internal_fn.getAxisClipWidth = function (forHorizontal) {
    let $$ = this,
        left = Math.max(30, $$.margin.left),
        right = Math.max(30, $$.margin.right);
    // width + axis line width + padding for left/right
    return forHorizontal ? $$.width + 2 + left + right : $$.margin.left + 20;
};
c3_chart_internal_fn.getAxisClipHeight = function (forHorizontal) {
    // less than 20 is not enough to show the axis label 'outer' without legend
    return (forHorizontal ? this.margin.bottom : (this.margin.top + this.height)) + 20;
};
c3_chart_internal_fn.getXAxisClipWidth = function () {
    const $$ = this;
    return $$.getAxisClipWidth(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getXAxisClipHeight = function () {
    const $$ = this;
    return $$.getAxisClipHeight(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipWidth = function () {
    const $$ = this;
    return $$.getAxisClipWidth($$.config.axis_rotated) + ($$.config.axis_y_inner ? 20 : 0);
};
c3_chart_internal_fn.getYAxisClipHeight = function () {
    const $$ = this;
    return $$.getAxisClipHeight($$.config.axis_rotated);
};

c3_chart_internal_fn.initPie = function () {
    let $$ = this, d3 = $$.d3, config = $$.config;
    $$.pie = d3.layout.pie().value((d) => {
        return d.values.reduce((a, b) => { return a + b.value; }, 0);
    });
    if (!config.data_order) {
        $$.pie.sort(null);
    }
};

c3_chart_internal_fn.updateRadius = function () {
    let $$ = this, config = $$.config,
        w = config.gauge_width || config.donut_width;
    $$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
    $$.radius = $$.radiusExpanded * 0.95;
    $$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
    $$.innerRadius = $$.hasType('donut') || $$.hasType('gauge') ? $$.radius * $$.innerRadiusRatio : 0;
};

c3_chart_internal_fn.updateArc = function () {
    const $$ = this;
    $$.svgArc = $$.getSvgArc();
    $$.svgArcExpanded = $$.getSvgArcExpanded();
    $$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);
};

c3_chart_internal_fn.updateAngle = function (d) {
    let $$ = this, config = $$.config,
        found = false, index = 0,
        gMin, gMax, gTic, gValue;

    if (!config) {
        return null;
    }

    $$.pie($$.filterTargetsToShow($$.data.targets)).forEach((t) => {
        if (!found && t.data.id === d.data.id) {
            found = true;
            d = t;
            d.index = index;
        }
        index++;
    });
    if (isNaN(d.startAngle)) {
        d.startAngle = 0;
    }
    if (isNaN(d.endAngle)) {
        d.endAngle = d.startAngle;
    }
    if ($$.isGaugeType(d.data)) {
        gMin = config.gauge_min;
        gMax = config.gauge_max;
        gTic = (Math.PI * (config.gauge_fullCircle ? 2 : 1)) / (gMax - gMin);
        gValue = d.value < gMin ? 0 : d.value < gMax ? d.value - gMin : (gMax - gMin);
        d.startAngle = config.gauge_startingAngle;
        d.endAngle = d.startAngle + gTic * gValue;
    }
    return found ? d : null;
};

c3_chart_internal_fn.getSvgArc = function () {
    let $$ = this,
        arc = $$.d3.svg.arc().outerRadius($$.radius).innerRadius($$.innerRadius),
        newArc = function (d, withoutUpdate) {
            let updated;
            if (withoutUpdate) { return arc(d); } // for interpolate
            updated = $$.updateAngle(d);
            return updated ? arc(updated) : 'M 0 0';
        };
    // TODO: extends all function
    newArc.centroid = arc.centroid;
    return newArc;
};

c3_chart_internal_fn.getSvgArcExpanded = function (rate) {
    let $$ = this,
        arc = $$.d3.svg.arc().outerRadius($$.radiusExpanded * (rate ? rate : 1)).innerRadius($$.innerRadius);
    return function (d) {
        const updated = $$.updateAngle(d);
        return updated ? arc(updated) : 'M 0 0';
    };
};

c3_chart_internal_fn.getArc = function (d, withoutUpdate, force) {
    return force || this.isArcType(d.data) ? this.svgArc(d, withoutUpdate) : 'M 0 0';
};


c3_chart_internal_fn.transformForArcLabel = function (d) {
    let $$ = this, config = $$.config,
        updated = $$.updateAngle(d), c, x, y, h, ratio, translate = '';
    if (updated && !$$.hasType('gauge')) {
        c = this.svgArc.centroid(updated);
        x = isNaN(c[0]) ? 0 : c[0];
        y = isNaN(c[1]) ? 0 : c[1];
        h = Math.sqrt(x * x + y * y);
        if ($$.hasType('donut') && config.donut_label_ratio) {
            ratio = isFunction(config.donut_label_ratio) ? config.donut_label_ratio(d, $$.radius, h) : config.donut_label_ratio;
        } else if ($$.hasType('pie') && config.pie_label_ratio) {
            ratio = isFunction(config.pie_label_ratio) ? config.pie_label_ratio(d, $$.radius, h) : config.pie_label_ratio;
        } else {
            ratio = $$.radius && h ? (36 / $$.radius > 0.375 ? 1.175 - 36 / $$.radius : 0.8) * $$.radius / h : 0;
        }
        translate = 'translate(' + (x * ratio) + ',' + (y * ratio) + ')';
    }
    return translate;
};

c3_chart_internal_fn.getArcRatio = function (d) {
    let $$ = this,
        config = $$.config,
        whole = Math.PI * ($$.hasType('gauge') && !config.gauge_fullCircle ? 1 : 2);
    return d ? (d.endAngle - d.startAngle) / whole : null;
};

c3_chart_internal_fn.convertToArcData = function (d) {
    return this.addName({
        id: d.data.id,
        value: d.value,
        ratio: this.getArcRatio(d),
        index: d.index,
    });
};

c3_chart_internal_fn.textForArcLabel = function (d) {
    let $$ = this,
        updated, value, ratio, id, format;
    if (!$$.shouldShowArcLabel()) { return ''; }
    updated = $$.updateAngle(d);
    value = updated ? updated.value : null;
    ratio = $$.getArcRatio(updated);
    id = d.data.id;
    if (!$$.hasType('gauge') && !$$.meetsArcLabelThreshold(ratio)) { return ''; }
    format = $$.getArcLabelFormat();
    return format ? format(value, ratio, id) : $$.defaultArcValueFormat(value, ratio);
};

c3_chart_internal_fn.expandArc = function (targetIds) {
    let $$ = this, interval;

    // MEMO: avoid to cancel transition
    if ($$.transiting) {
        interval = window.setInterval(() => {
            if (!$$.transiting) {
                window.clearInterval(interval);
                if ($$.legend.selectAll('.c3-legend-item-focused').size() > 0) {
                    $$.expandArc(targetIds);
                }
            }
        }, 10);
        return;
    }

    targetIds = $$.mapToTargetIds(targetIds);

    $$.svg.selectAll($$.selectorTargets(targetIds, '.' + CLASS.chartArc)).each(function (d) {
        if (!$$.shouldExpand(d.data.id)) { return; }
        $$.d3.select(this).selectAll('path')
            .transition().duration($$.expandDuration(d.data.id))
            .attr('d', $$.svgArcExpanded)
            .transition().duration($$.expandDuration(d.data.id) * 2)
            .attr('d', $$.svgArcExpandedSub)
            .each((d) => {
                if ($$.isDonutType(d.data)) {
                    // callback here
                }
            });
    });
};

c3_chart_internal_fn.unexpandArc = function (targetIds) {
    const $$ = this;

    if ($$.transiting) { return; }

    targetIds = $$.mapToTargetIds(targetIds);

    $$.svg.selectAll($$.selectorTargets(targetIds, '.' + CLASS.chartArc)).selectAll('path')
        .transition().duration((d) => {
            return $$.expandDuration(d.data.id);
        })
        .attr('d', $$.svgArc);
    $$.svg.selectAll('.' + CLASS.arc)
        .style('opacity', 1);
};

c3_chart_internal_fn.expandDuration = function (id) {
    let $$ = this, config = $$.config;

    if ($$.isDonutType(id)) {
        return config.donut_expand_duration;
    } else if ($$.isGaugeType(id)) {
        return config.gauge_expand_duration;
    } else if ($$.isPieType(id)) {
        return config.pie_expand_duration;
    } else {
        return 50;
    }
};

c3_chart_internal_fn.shouldExpand = function (id) {
    let $$ = this, config = $$.config;
    return ($$.isDonutType(id) && config.donut_expand) ||
           ($$.isGaugeType(id) && config.gauge_expand) ||
           ($$.isPieType(id) && config.pie_expand);
};

c3_chart_internal_fn.shouldShowArcLabel = function () {
    let $$ = this, config = $$.config, shouldShow = true;
    if ($$.hasType('donut')) {
        shouldShow = config.donut_label_show;
    } else if ($$.hasType('pie')) {
        shouldShow = config.pie_label_show;
    }
    // when gauge, always true
    return shouldShow;
};

c3_chart_internal_fn.meetsArcLabelThreshold = function (ratio) {
    let $$ = this, config = $$.config,
        threshold = $$.hasType('donut') ? config.donut_label_threshold : config.pie_label_threshold;
    return ratio >= threshold;
};

c3_chart_internal_fn.getArcLabelFormat = function () {
    let $$ = this, config = $$.config,
        format = config.pie_label_format;
    if ($$.hasType('gauge')) {
        format = config.gauge_label_format;
    } else if ($$.hasType('donut')) {
        format = config.donut_label_format;
    }
    return format;
};

c3_chart_internal_fn.getArcTitle = function () {
    const $$ = this;
    return $$.hasType('donut') ? $$.config.donut_title : '';
};

c3_chart_internal_fn.updateTargetsForArc = function (targets) {
    let $$ = this, main = $$.main,
        mainPieUpdate, mainPieEnter,
        classChartArc = $$.classChartArc.bind($$),
        classArcs = $$.classArcs.bind($$),
        classFocus = $$.classFocus.bind($$);
    mainPieUpdate = main.select('.' + CLASS.chartArcs).selectAll('.' + CLASS.chartArc)
        .data($$.pie(targets))
        .attr('class', (d) => { return classChartArc(d) + classFocus(d.data); });
    mainPieEnter = mainPieUpdate.enter().append('g')
        .attr('class', classChartArc);
    mainPieEnter.append('g')
        .attr('class', classArcs);
    mainPieEnter.append('text')
        .attr('dy', $$.hasType('gauge') ? '-.1em' : '.35em')
        .style('opacity', 0)
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none');
    // MEMO: can not keep same color..., but not bad to update color in redraw
    // mainPieUpdate.exit().remove();
};

c3_chart_internal_fn.initArc = function () {
    const $$ = this;
    $$.arcs = $$.main.select('.' + CLASS.chart).append('g')
        .attr('class', CLASS.chartArcs)
        .attr('transform', $$.getTranslate('arc'));
    $$.arcs.append('text')
        .attr('class', CLASS.chartArcsTitle)
        .style('text-anchor', 'middle')
        .text($$.getArcTitle());
};

c3_chart_internal_fn.redrawArc = function (duration, durationForExit, withTransform) {
    let $$ = this, d3 = $$.d3, config = $$.config, main = $$.main,
        mainArc;
    mainArc = main.selectAll('.' + CLASS.arcs).selectAll('.' + CLASS.arc)
        .data($$.arcData.bind($$));
    mainArc.enter().append('path')
        .attr('class', $$.classArc.bind($$))
        .style('fill', (d) => { return $$.color(d.data); })
        .style('cursor', (d) => { return config.interaction_enabled && config.data_selection_isselectable(d) ? 'pointer' : null; })
        .style('opacity', 0)
        .each(function (d) {
            if ($$.isGaugeType(d.data)) {
                d.startAngle = d.endAngle = config.gauge_startingAngle;
            }
            this._current = d;
        });
    mainArc
        .attr('transform', (d) => { return !$$.isGaugeType(d.data) && withTransform ? 'scale(0)' : ''; })
        .style('opacity', function (d) { return d === this._current ? 0 : 1; })
        .on('mouseover', config.interaction_enabled ? function (d) {
            let updated, arcData;
            if ($$.transiting) { // skip while transiting
                return;
            }
            updated = $$.updateAngle(d);
            if (updated) {
                arcData = $$.convertToArcData(updated);
                // transitions
                $$.expandArc(updated.data.id);
                $$.api.focus(updated.data.id);
                $$.toggleFocusLegend(updated.data.id, true);
                $$.config.data_onmouseover(arcData, this);
            }
        } : null)
        .on('mousemove', config.interaction_enabled ? function (d) {
            let updated = $$.updateAngle(d), arcData, selectedData;
            if (updated) {
                arcData = $$.convertToArcData(updated),
                selectedData = [arcData];
                $$.showTooltip(selectedData, this);
            }
        } : null)
        .on('mouseout', config.interaction_enabled ? function (d) {
            let updated, arcData;
            if ($$.transiting) { // skip while transiting
                return;
            }
            updated = $$.updateAngle(d);
            if (updated) {
                arcData = $$.convertToArcData(updated);
                // transitions
                $$.unexpandArc(updated.data.id);
                $$.api.revert();
                $$.revertLegend();
                $$.hideTooltip();
                $$.config.data_onmouseout(arcData, this);
            }
        } : null)
        .on('click', config.interaction_enabled ? function (d, i) {
            let updated = $$.updateAngle(d), arcData;
            if (updated) {
                arcData = $$.convertToArcData(updated);
                if ($$.toggleShape) {
                    $$.toggleShape(this, arcData, i);
                }
                $$.config.data_onclick.call($$.api, arcData, this);
            }
        } : null)
        .each(() => { $$.transiting = true; })
        .transition().duration(duration)
        .attrTween('d', function (d) {
            let updated = $$.updateAngle(d), interpolate;
            if (!updated) {
                return function () { return 'M 0 0'; };
            }
            //                if (this._current === d) {
            //                    this._current = {
            //                        startAngle: Math.PI*2,
            //                        endAngle: Math.PI*2,
            //                    };
            //                }
            if (isNaN(this._current.startAngle)) {
                this._current.startAngle = 0;
            }
            if (isNaN(this._current.endAngle)) {
                this._current.endAngle = this._current.startAngle;
            }
            interpolate = d3.interpolate(this._current, updated);
            this._current = interpolate(0);
            return function (t) {
                const interpolated = interpolate(t);
                interpolated.data = d.data; // data.id will be updated by interporator
                return $$.getArc(interpolated, true);
            };
        })
        .attr('transform', withTransform ? 'scale(1)' : '')
        .style('fill', (d) => {
            return $$.levelColor ? $$.levelColor(d.data.values[0].value) : $$.color(d.data.id);
        }) // Where gauge reading color would receive customization.
        .style('opacity', 1)
        .call($$.endall, () => {
            $$.transiting = false;
        });
    mainArc.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
    main.selectAll('.' + CLASS.chartArc).select('text')
        .style('opacity', 0)
        .attr('class', (d) => { return $$.isGaugeType(d.data) ? CLASS.gaugeValue : ''; })
        .text($$.textForArcLabel.bind($$))
        .attr('transform', $$.transformForArcLabel.bind($$))
        .style('font-size', (d) => { return $$.isGaugeType(d.data) ? Math.round($$.radius / 5) + 'px' : ''; })
      .transition().duration(duration)
        .style('opacity', (d) => { return $$.isTargetToShow(d.data.id) && $$.isArcType(d.data) ? 1 : 0; });
    main.select('.' + CLASS.chartArcsTitle)
        .style('opacity', $$.hasType('donut') || $$.hasType('gauge') ? 1 : 0);

    if ($$.hasType('gauge')) {
        $$.arcs.select('.' + CLASS.chartArcsBackground)
            .attr('d', () => {
                const d = {
                    data: [{ value: config.gauge_max }],
                    startAngle: config.gauge_startingAngle,
                    endAngle: -1 * config.gauge_startingAngle,
                };
                return $$.getArc(d, true, true);
            });
        $$.arcs.select('.' + CLASS.chartArcsGaugeUnit)
            .attr('dy', '.75em')
            .text(config.gauge_label_show ? config.gauge_units : '');
        $$.arcs.select('.' + CLASS.chartArcsGaugeMin)
            .attr('dx', -1 * ($$.innerRadius + (($$.radius - $$.innerRadius) / (config.gauge_fullCircle ? 1 : 2))) + 'px')
            .attr('dy', '1.2em')
            .text(config.gauge_label_show ? config.gauge_min : '');
        $$.arcs.select('.' + CLASS.chartArcsGaugeMax)
            .attr('dx', $$.innerRadius + (($$.radius - $$.innerRadius) / (config.gauge_fullCircle ? 1 : 2)) + 'px')
            .attr('dy', '1.2em')
            .text(config.gauge_label_show ? config.gauge_max : '');
    }
};
c3_chart_internal_fn.initGauge = function () {
    const arcs = this.arcs;
    if (this.hasType('gauge')) {
        arcs.append('path')
            .attr('class', CLASS.chartArcsBackground);
        arcs.append('text')
            .attr('class', CLASS.chartArcsGaugeUnit)
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none');
        arcs.append('text')
            .attr('class', CLASS.chartArcsGaugeMin)
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none');
        arcs.append('text')
            .attr('class', CLASS.chartArcsGaugeMax)
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none');
    }
};
c3_chart_internal_fn.getGaugeLabelHeight = function () {
    return this.config.gauge_label_show ? 20 : 0;
};

c3_chart_internal_fn.initRegion = function () {
    const $$ = this;
    $$.region = $$.main.append('g')
        .attr('clip-path', $$.clipPath)
        .attr('class', CLASS.regions);
};
c3_chart_internal_fn.updateRegion = function (duration) {
    let $$ = this, config = $$.config;

    // hide if arc type
    $$.region.style('visibility', $$.hasArcType() ? 'hidden' : 'visible');

    $$.mainRegion = $$.main.select('.' + CLASS.regions).selectAll('.' + CLASS.region)
        .data(config.regions);
    $$.mainRegion.enter().append('g')
      .append('rect')
        .style('fill-opacity', 0);
    $$.mainRegion
        .attr('class', $$.classRegion.bind($$));
    $$.mainRegion.exit().transition().duration(duration)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawRegion = function (withTransition) {
    let $$ = this,
        regions = $$.mainRegion.selectAll('rect').each(function () {
            // data is binded to g and it's not transferred to rect (child node) automatically,
            // then data of each rect has to be updated manually.
            // TODO: there should be more efficient way to solve this?
            const parentData = $$.d3.select(this.parentNode).datum();
            $$.d3.select(this).datum(parentData);
        }),
        x = $$.regionX.bind($$),
        y = $$.regionY.bind($$),
        w = $$.regionWidth.bind($$),
        h = $$.regionHeight.bind($$);
    return [
        (withTransition ? regions.transition() : regions)
            .attr('x', x)
            .attr('y', y)
            .attr('width', w)
            .attr('height', h)
            .style('fill-opacity', (d) => { return isValue(d.opacity) ? d.opacity : 0.1; }),
    ];
};
c3_chart_internal_fn.regionX = function (d) {
    let $$ = this, config = $$.config,
        xPos, yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        xPos = config.axis_rotated ? ('start' in d ? yScale(d.start) : 0) : 0;
    } else {
        xPos = config.axis_rotated ? 0 : ('start' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.start) : d.start) : 0);
    }
    return xPos;
};
c3_chart_internal_fn.regionY = function (d) {
    let $$ = this, config = $$.config,
        yPos, yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        yPos = config.axis_rotated ? 0 : ('end' in d ? yScale(d.end) : 0);
    } else {
        yPos = config.axis_rotated ? ('start' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.start) : d.start) : 0) : 0;
    }
    return yPos;
};
c3_chart_internal_fn.regionWidth = function (d) {
    let $$ = this, config = $$.config,
        start = $$.regionX(d), end, yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        end = config.axis_rotated ? ('end' in d ? yScale(d.end) : $$.width) : $$.width;
    } else {
        end = config.axis_rotated ? $$.width : ('end' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end) : $$.width);
    }
    return end < start ? 0 : end - start;
};
c3_chart_internal_fn.regionHeight = function (d) {
    let $$ = this, config = $$.config,
        start = this.regionY(d), end, yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        end = config.axis_rotated ? $$.height : ('start' in d ? yScale(d.start) : $$.height);
    } else {
        end = config.axis_rotated ? ('end' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end) : $$.height) : $$.height;
    }
    return end < start ? 0 : end - start;
};
c3_chart_internal_fn.isRegionOnX = function (d) {
    return !d.axis || d.axis === 'x';
};

c3_chart_internal_fn.drag = function (mouse) {
    let $$ = this, config = $$.config, main = $$.main, d3 = $$.d3;
    let sx, sy, mx, my, minX, maxX, minY, maxY;

    if ($$.hasArcType()) { return; }
    if (!config.data_selection_enabled) { return; } // do nothing if not selectable
    if (config.zoom_enabled && !$$.zoom.altDomain) { return; } // skip if zoomable because of conflict drag dehavior
    if (!config.data_selection_multiple) { return; } // skip when single selection because drag is used for multiple selection

    sx = $$.dragStart[0];
    sy = $$.dragStart[1];
    mx = mouse[0];
    my = mouse[1];
    minX = Math.min(sx, mx);
    maxX = Math.max(sx, mx);
    minY = (config.data_selection_grouped) ? $$.margin.top : Math.min(sy, my);
    maxY = (config.data_selection_grouped) ? $$.height : Math.max(sy, my);

    main.select('.' + CLASS.dragarea)
        .attr('x', minX)
        .attr('y', minY)
        .attr('width', maxX - minX)
        .attr('height', maxY - minY);
    // TODO: binary search when multiple xs
    main.selectAll('.' + CLASS.shapes).selectAll('.' + CLASS.shape)
        .filter((d) => { return config.data_selection_isselectable(d); })
        .each(function (d, i) {
            let shape = d3.select(this),
                isSelected = shape.classed(CLASS.SELECTED),
                isIncluded = shape.classed(CLASS.INCLUDED),
                _x, _y, _w, _h, toggle, isWithin = false, box;
            if (shape.classed(CLASS.circle)) {
                _x = shape.attr('cx') * 1;
                _y = shape.attr('cy') * 1;
                toggle = $$.togglePoint;
                isWithin = minX < _x && _x < maxX && minY < _y && _y < maxY;
            }
            else if (shape.classed(CLASS.bar)) {
                box = getPathBox(this);
                _x = box.x;
                _y = box.y;
                _w = box.width;
                _h = box.height;
                toggle = $$.togglePath;
                isWithin = !(maxX < _x || _x + _w < minX) && !(maxY < _y || _y + _h < minY);
            } else {
                // line/area selection not supported yet
                return;
            }
            if (isWithin ^ isIncluded) {
                shape.classed(CLASS.INCLUDED, !isIncluded);
                // TODO: included/unincluded callback here
                shape.classed(CLASS.SELECTED, !isSelected);
                toggle.call($$, !isSelected, shape, d, i);
            }
        });
};

c3_chart_internal_fn.dragstart = function (mouse) {
    let $$ = this, config = $$.config;
    if ($$.hasArcType()) { return; }
    if (!config.data_selection_enabled) { return; } // do nothing if not selectable
    $$.dragStart = mouse;
    $$.main.select('.' + CLASS.chart).append('rect')
        .attr('class', CLASS.dragarea)
        .style('opacity', 0.1);
    $$.dragging = true;
};

c3_chart_internal_fn.dragend = function () {
    let $$ = this, config = $$.config;
    if ($$.hasArcType()) { return; }
    if (!config.data_selection_enabled) { return; } // do nothing if not selectable
    $$.main.select('.' + CLASS.dragarea)
        .transition().duration(100)
        .style('opacity', 0)
        .remove();
    $$.main.selectAll('.' + CLASS.shape)
        .classed(CLASS.INCLUDED, false);
    $$.dragging = false;
};

c3_chart_internal_fn.selectPoint = function (target, d, i) {
    let $$ = this, config = $$.config,
        cx = (config.axis_rotated ? $$.circleY : $$.circleX).bind($$),
        cy = (config.axis_rotated ? $$.circleX : $$.circleY).bind($$),
        r = $$.pointSelectR.bind($$);
    config.data_onselected.call($$.api, d, target.node());
    // add selected-circle on low layer g
    $$.main.select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.selectedCircle + '-' + i)
        .data([d])
        .enter().append('circle')
        .attr('class', () => { return $$.generateClass(CLASS.selectedCircle, i); })
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('stroke', () => { return $$.color(d); })
        .attr('r', (d) => { return $$.pointSelectR(d) * 1.4; })
        .transition().duration(100)
        .attr('r', r);
};
c3_chart_internal_fn.unselectPoint = function (target, d, i) {
    const $$ = this;
    $$.config.data_onunselected.call($$.api, d, target.node());
    // remove selected-circle from low layer g
    $$.main.select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.selectedCircle + '-' + i)
        .transition().duration(100).attr('r', 0)
        .remove();
};
c3_chart_internal_fn.togglePoint = function (selected, target, d, i) {
    selected ? this.selectPoint(target, d, i) : this.unselectPoint(target, d, i);
};
c3_chart_internal_fn.selectPath = function (target, d) {
    const $$ = this;
    $$.config.data_onselected.call($$, d, target.node());
    if ($$.config.interaction_brighten) {
        target.transition().duration(100)
            .style('fill', () => { return $$.d3.rgb($$.color(d)).brighter(0.75); });
    }
};
c3_chart_internal_fn.unselectPath = function (target, d) {
    const $$ = this;
    $$.config.data_onunselected.call($$, d, target.node());
    if ($$.config.interaction_brighten) {
        target.transition().duration(100)
            .style('fill', () => { return $$.color(d); });
    }
};
c3_chart_internal_fn.togglePath = function (selected, target, d, i) {
    selected ? this.selectPath(target, d, i) : this.unselectPath(target, d, i);
};
c3_chart_internal_fn.getToggle = function (that, d) {
    let $$ = this, toggle;
    if (that.nodeName === 'circle') {
        if ($$.isStepType(d)) {
            // circle is hidden in step chart, so treat as within the click area
            toggle = function () {}; // TODO: how to select step chart?
        } else {
            toggle = $$.togglePoint;
        }
    }
    else if (that.nodeName === 'path') {
        toggle = $$.togglePath;
    }
    return toggle;
};
c3_chart_internal_fn.toggleShape = function (that, d, i) {
    let $$ = this, d3 = $$.d3, config = $$.config,
        shape = d3.select(that), isSelected = shape.classed(CLASS.SELECTED),
        toggle = $$.getToggle(that, d).bind($$);

    if (config.data_selection_enabled && config.data_selection_isselectable(d)) {
        if (!config.data_selection_multiple) {
            $$.main.selectAll('.' + CLASS.shapes + (config.data_selection_grouped ? $$.getTargetSelectorSuffix(d.id) : '')).selectAll('.' + CLASS.shape).each(function (d, i) {
                const shape = d3.select(this);
                if (shape.classed(CLASS.SELECTED)) { toggle(false, shape.classed(CLASS.SELECTED, false), d, i); }
            });
        }
        shape.classed(CLASS.SELECTED, !isSelected);
        toggle(!isSelected, shape, d, i);
    }
};

c3_chart_internal_fn.initBrush = function () {
    let $$ = this, d3 = $$.d3;
    $$.brush = d3.svg.brush().on('brush', () => { $$.redrawForBrush(); });
    $$.brush.update = function () {
        if ($$.context) { $$.context.select('.' + CLASS.brush).call(this); }
        return this;
    };
    $$.brush.scale = function (scale) {
        return $$.config.axis_rotated ? this.y(scale) : this.x(scale);
    };
};
c3_chart_internal_fn.initSubchart = function () {
    let $$ = this, config = $$.config,
        context = $$.context = $$.svg.append('g').attr('transform', $$.getTranslate('context')),
        visibility = config.subchart_show ? 'visible' : 'hidden';

    context.style('visibility', visibility);

    // Define g for chart area
    context.append('g')
        .attr('clip-path', $$.clipPathForSubchart)
        .attr('class', CLASS.chart);

    // Define g for bar chart area
    context.select('.' + CLASS.chart).append('g')
        .attr('class', CLASS.chartBars);

    // Define g for line chart area
    context.select('.' + CLASS.chart).append('g')
        .attr('class', CLASS.chartLines);

    // Add extent rect for Brush
    context.append('g')
        .attr('clip-path', $$.clipPath)
        .attr('class', CLASS.brush)
        .call($$.brush);

    // ATTENTION: This must be called AFTER chart added
    // Add Axis
    $$.axes.subx = context.append('g')
        .attr('class', CLASS.axisX)
        .attr('transform', $$.getTranslate('subx'))
        .attr('clip-path', config.axis_rotated ? '' : $$.clipPathForXAxis)
        .style('visibility', config.subchart_axis_x_show ? visibility : 'hidden');
};
c3_chart_internal_fn.updateTargetsForSubchart = function (targets) {
    let $$ = this, context = $$.context, config = $$.config,
        contextLineEnter, contextLineUpdate, contextBarEnter, contextBarUpdate,
        classChartBar = $$.classChartBar.bind($$),
        classBars = $$.classBars.bind($$),
        classChartLine = $$.classChartLine.bind($$),
        classLines = $$.classLines.bind($$),
        classAreas = $$.classAreas.bind($$);

    if (config.subchart_show) {
        // -- Bar --//
        contextBarUpdate = context.select('.' + CLASS.chartBars).selectAll('.' + CLASS.chartBar)
            .data(targets)
            .attr('class', classChartBar);
        contextBarEnter = contextBarUpdate.enter().append('g')
            .style('opacity', 0)
            .attr('class', classChartBar);
        // Bars for each data
        contextBarEnter.append('g')
            .attr('class', classBars);

        // -- Line --//
        contextLineUpdate = context.select('.' + CLASS.chartLines).selectAll('.' + CLASS.chartLine)
            .data(targets)
            .attr('class', classChartLine);
        contextLineEnter = contextLineUpdate.enter().append('g')
            .style('opacity', 0)
            .attr('class', classChartLine);
        // Lines for each data
        contextLineEnter.append('g')
            .attr('class', classLines);
        // Area
        contextLineEnter.append('g')
            .attr('class', classAreas);

        // -- Brush --//
        context.selectAll('.' + CLASS.brush + ' rect')
            .attr(config.axis_rotated ? 'width' : 'height', config.axis_rotated ? $$.width2 : $$.height2);
    }
};
c3_chart_internal_fn.updateBarForSubchart = function (durationForExit) {
    const $$ = this;
    $$.contextBar = $$.context.selectAll('.' + CLASS.bars).selectAll('.' + CLASS.bar)
        .data($$.barData.bind($$));
    $$.contextBar.enter().append('path')
        .attr('class', $$.classBar.bind($$))
        .style('stroke', 'none')
        .style('fill', $$.color);
    $$.contextBar
        .style('opacity', $$.initialOpacity.bind($$));
    $$.contextBar.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawBarForSubchart = function (drawBarOnSub, withTransition, duration) {
    (withTransition ? this.contextBar.transition(Math.random().toString()).duration(duration) : this.contextBar)
        .attr('d', drawBarOnSub)
        .style('opacity', 1);
};
c3_chart_internal_fn.updateLineForSubchart = function (durationForExit) {
    const $$ = this;
    $$.contextLine = $$.context.selectAll('.' + CLASS.lines).selectAll('.' + CLASS.line)
        .data($$.lineData.bind($$));
    $$.contextLine.enter().append('path')
        .attr('class', $$.classLine.bind($$))
        .style('stroke', $$.color);
    $$.contextLine
        .style('opacity', $$.initialOpacity.bind($$));
    $$.contextLine.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawLineForSubchart = function (drawLineOnSub, withTransition, duration) {
    (withTransition ? this.contextLine.transition(Math.random().toString()).duration(duration) : this.contextLine)
        .attr('d', drawLineOnSub)
        .style('opacity', 1);
};
c3_chart_internal_fn.updateAreaForSubchart = function (durationForExit) {
    let $$ = this, d3 = $$.d3;
    $$.contextArea = $$.context.selectAll('.' + CLASS.areas).selectAll('.' + CLASS.area)
        .data($$.lineData.bind($$));
    $$.contextArea.enter().append('path')
        .attr('class', $$.classArea.bind($$))
        .style('fill', $$.color)
        .style('opacity', function () { $$.orgAreaOpacity = +d3.select(this).style('opacity'); return 0; });
    $$.contextArea
        .style('opacity', 0);
    $$.contextArea.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawAreaForSubchart = function (drawAreaOnSub, withTransition, duration) {
    (withTransition ? this.contextArea.transition(Math.random().toString()).duration(duration) : this.contextArea)
        .attr('d', drawAreaOnSub)
        .style('fill', this.color)
        .style('opacity', this.orgAreaOpacity);
};
c3_chart_internal_fn.redrawSubchart = function (withSubchart, transitions, duration, durationForExit, areaIndices, barIndices, lineIndices) {
    let $$ = this, d3 = $$.d3, config = $$.config,
        drawAreaOnSub, drawBarOnSub, drawLineOnSub;

    $$.context.style('visibility', config.subchart_show ? 'visible' : 'hidden');

    // subchart
    if (config.subchart_show) {
        // reflect main chart to extent on subchart if zoomed
        if (d3.event && d3.event.type === 'zoom') {
            $$.brush.extent($$.x.orgDomain()).update();
        }
        // update subchart elements if needed
        if (withSubchart) {
            // extent rect
            if (!$$.brush.empty()) {
                $$.brush.extent($$.x.orgDomain()).update();
            }
            // setup drawer - MEMO: this must be called after axis updated
            drawAreaOnSub = $$.generateDrawArea(areaIndices, true);
            drawBarOnSub = $$.generateDrawBar(barIndices, true);
            drawLineOnSub = $$.generateDrawLine(lineIndices, true);

            $$.updateBarForSubchart(duration);
            $$.updateLineForSubchart(duration);
            $$.updateAreaForSubchart(duration);

            $$.redrawBarForSubchart(drawBarOnSub, duration, duration);
            $$.redrawLineForSubchart(drawLineOnSub, duration, duration);
            $$.redrawAreaForSubchart(drawAreaOnSub, duration, duration);
        }
    }
};
c3_chart_internal_fn.redrawForBrush = function () {
    let $$ = this, x = $$.x;
    $$.redraw({
        withTransition: false,
        withY: $$.config.zoom_rescale,
        withSubchart: false,
        withUpdateXDomain: true,
        withDimension: false,
    });
    $$.config.subchart_onbrush.call($$.api, x.orgDomain());
};
c3_chart_internal_fn.transformContext = function (withTransition, transitions) {
    let $$ = this, subXAxis;
    if (transitions && transitions.axisSubX) {
        subXAxis = transitions.axisSubX;
    } else {
        subXAxis = $$.context.select('.' + CLASS.axisX);
        if (withTransition) { subXAxis = subXAxis.transition(); }
    }
    $$.context.attr('transform', $$.getTranslate('context'));
    subXAxis.attr('transform', $$.getTranslate('subx'));
};
c3_chart_internal_fn.getDefaultExtent = function () {
    let $$ = this, config = $$.config,
        extent = isFunction(config.axis_x_extent) ? config.axis_x_extent($$.getXDomain($$.data.targets)) : config.axis_x_extent;
    if ($$.isTimeSeries()) {
        extent = [$$.parseDate(extent[0]), $$.parseDate(extent[1])];
    }
    return extent;
};

c3_chart_internal_fn.initZoom = function () {
    let $$ = this, d3 = $$.d3, config = $$.config, startEvent;

    $$.zoom = d3.behavior.zoom()
        .on('zoomstart', () => {
            startEvent = d3.event.sourceEvent;
            $$.zoom.altDomain = d3.event.sourceEvent.altKey ? $$.x.orgDomain() : null;
            config.zoom_onzoomstart.call($$.api, d3.event.sourceEvent);
        })
        .on('zoom', () => {
            $$.redrawForZoom.call($$);
        })
        .on('zoomend', () => {
            const event = d3.event.sourceEvent;
            // if click, do nothing. otherwise, click interaction will be canceled.
            if (event && startEvent.clientX === event.clientX && startEvent.clientY === event.clientY) {
                return;
            }
            $$.redrawEventRect();
            $$.updateZoom();
            config.zoom_onzoomend.call($$.api, $$.x.orgDomain());
        });
    $$.zoom.scale = function (scale) {
        return config.axis_rotated ? this.y(scale) : this.x(scale);
    };
    $$.zoom.orgScaleExtent = function () {
        const extent = config.zoom_extent ? config.zoom_extent : [1, 10];
        return [extent[0], Math.max($$.getMaxDataCount() / extent[1], extent[1])];
    };
    $$.zoom.updateScaleExtent = function () {
        let ratio = diffDomain($$.x.orgDomain()) / diffDomain($$.getZoomDomain()),
            extent = this.orgScaleExtent();
        this.scaleExtent([extent[0] * ratio, extent[1] * ratio]);
        return this;
    };
};
c3_chart_internal_fn.getZoomDomain = function () {
    let $$ = this, config = $$.config, d3 = $$.d3,
        min = d3.min([$$.orgXDomain[0], config.zoom_x_min]),
        max = d3.max([$$.orgXDomain[1], config.zoom_x_max]);
    return [min, max];
};
c3_chart_internal_fn.updateZoom = function () {
    let $$ = this, z = $$.config.zoom_enabled ? $$.zoom : function () {};
    $$.main.select('.' + CLASS.zoomRect).call(z).on('dblclick.zoom', null);
    $$.main.selectAll('.' + CLASS.eventRect).call(z).on('dblclick.zoom', null);
};
c3_chart_internal_fn.redrawForZoom = function () {
    let $$ = this, d3 = $$.d3, config = $$.config, zoom = $$.zoom, x = $$.x;
    if (!config.zoom_enabled) {
        return;
    }
    if ($$.filterTargetsToShow($$.data.targets).length === 0) {
        return;
    }
    if (d3.event.sourceEvent.type === 'mousemove' && zoom.altDomain) {
        x.domain(zoom.altDomain);
        zoom.scale(x).updateScaleExtent();
        return;
    }
    if ($$.isCategorized() && x.orgDomain()[0] === $$.orgXDomain[0]) {
        x.domain([$$.orgXDomain[0] - 1e-10, x.orgDomain()[1]]);
    }
    $$.redraw({
        withTransition: false,
        withY: config.zoom_rescale,
        withSubchart: false,
        withEventRect: false,
        withDimension: false,
    });
    if (d3.event.sourceEvent.type === 'mousemove') {
        $$.cancelClick = true;
    }
    config.zoom_onzoom.call($$.api, x.orgDomain());
};

c3_chart_internal_fn.generateColor = function () {
    let $$ = this, config = $$.config, d3 = $$.d3,
        colors = config.data_colors,
        pattern = notEmpty(config.color_pattern) ? config.color_pattern : d3.scale.category10().range(),
        callback = config.data_color,
        ids = [];

    return function (d) {
        let id = d.id || (d.data && d.data.id) || d, color;

        // if callback function is provided
        if (colors[id] instanceof Function) {
            color = colors[id](d);
        }
        // if specified, choose that color
        else if (colors[id]) {
            color = colors[id];
        }
        // if not specified, choose from pattern
        else {
            if (ids.indexOf(id) < 0) { ids.push(id); }
            color = pattern[ids.indexOf(id) % pattern.length];
            colors[id] = color;
        }
        return callback instanceof Function ? callback(color, d) : color;
    };
};
c3_chart_internal_fn.generateLevelColor = function () {
    let $$ = this, config = $$.config,
        colors = config.color_pattern,
        threshold = config.color_threshold,
        asValue = threshold.unit === 'value',
        values = threshold.values && threshold.values.length ? threshold.values : [],
        max = threshold.max || 100;
    return notEmpty(config.color_threshold) ? function (value) {
        let i, v, color = colors[colors.length - 1];
        for (i = 0; i < values.length; i++) {
            v = asValue ? value : (value * 100 / max);
            if (v < values[i]) {
                color = colors[i];
                break;
            }
        }
        return color;
    } : null;
};

c3_chart_internal_fn.getYFormat = function (forArc) {
    let $$ = this,
        formatForY = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.yFormat,
        formatForY2 = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.y2Format;
    return function (v, ratio, id) {
        const format = $$.axis.getId(id) === 'y2' ? formatForY2 : formatForY;
        return format.call($$, v, ratio);
    };
};
c3_chart_internal_fn.yFormat = function (v) {
    let $$ = this, config = $$.config,
        format = config.axis_y_tick_format ? config.axis_y_tick_format : $$.defaultValueFormat;
    return format(v);
};
c3_chart_internal_fn.y2Format = function (v) {
    let $$ = this, config = $$.config,
        format = config.axis_y2_tick_format ? config.axis_y2_tick_format : $$.defaultValueFormat;
    return format(v);
};
c3_chart_internal_fn.defaultValueFormat = function (v) {
    return isValue(v) ? +v : '';
};
c3_chart_internal_fn.defaultArcValueFormat = function (v, ratio) {
    return (ratio * 100).toFixed(1) + '%';
};
c3_chart_internal_fn.dataLabelFormat = function (targetId) {
    let $$ = this, data_labels = $$.config.data_labels,
        format, defaultFormat = function (v) { return isValue(v) ? +v : ''; };
    // find format according to axis id
    if (typeof data_labels.format === 'function') {
        format = data_labels.format;
    } else if (typeof data_labels.format === 'object') {
        if (data_labels.format[targetId]) {
            format = data_labels.format[targetId] === true ? defaultFormat : data_labels.format[targetId];
        } else {
            format = function () { return ''; };
        }
    } else {
        format = defaultFormat;
    }
    return format;
};

c3_chart_internal_fn.hasCaches = function (ids) {
    for (let i = 0; i < ids.length; i++) {
        if (!(ids[i] in this.cache)) { return false; }
    }
    return true;
};
c3_chart_internal_fn.addCache = function (id, target) {
    this.cache[id] = this.cloneTarget(target);
};
c3_chart_internal_fn.getCaches = function (ids) {
    let targets = [], i;
    for (i = 0; i < ids.length; i++) {
        if (ids[i] in this.cache) { targets.push(this.cloneTarget(this.cache[ids[i]])); }
    }
    return targets;
};

const CLASS = c3_chart_internal_fn.CLASS = {
    target: 'c3-target',
    chart: 'c3-chart',
    chartLine: 'c3-chart-line',
    chartLines: 'c3-chart-lines',
    chartBar: 'c3-chart-bar',
    chartBars: 'c3-chart-bars',
    chartText: 'c3-chart-text',
    chartTexts: 'c3-chart-texts',
    chartArc: 'c3-chart-arc',
    chartArcs: 'c3-chart-arcs',
    chartArcsTitle: 'c3-chart-arcs-title',
    chartArcsBackground: 'c3-chart-arcs-background',
    chartArcsGaugeUnit: 'c3-chart-arcs-gauge-unit',
    chartArcsGaugeMax: 'c3-chart-arcs-gauge-max',
    chartArcsGaugeMin: 'c3-chart-arcs-gauge-min',
    selectedCircle: 'c3-selected-circle',
    selectedCircles: 'c3-selected-circles',
    eventRect: 'c3-event-rect',
    eventRects: 'c3-event-rects',
    eventRectsSingle: 'c3-event-rects-single',
    eventRectsMultiple: 'c3-event-rects-multiple',
    zoomRect: 'c3-zoom-rect',
    brush: 'c3-brush',
    focused: 'c3-focused',
    defocused: 'c3-defocused',
    region: 'c3-region',
    regions: 'c3-regions',
    title: 'c3-title',
    tooltipContainer: 'c3-tooltip-container',
    tooltip: 'c3-tooltip',
    tooltipName: 'c3-tooltip-name',
    shape: 'c3-shape',
    shapes: 'c3-shapes',
    line: 'c3-line',
    lines: 'c3-lines',
    bar: 'c3-bar',
    bars: 'c3-bars',
    circle: 'c3-circle',
    circles: 'c3-circles',
    arc: 'c3-arc',
    arcs: 'c3-arcs',
    area: 'c3-area',
    areas: 'c3-areas',
    empty: 'c3-empty',
    text: 'c3-text',
    texts: 'c3-texts',
    gaugeValue: 'c3-gauge-value',
    grid: 'c3-grid',
    gridLines: 'c3-grid-lines',
    xgrid: 'c3-xgrid',
    xgrids: 'c3-xgrids',
    xgridLine: 'c3-xgrid-line',
    xgridLines: 'c3-xgrid-lines',
    xgridFocus: 'c3-xgrid-focus',
    ygrid: 'c3-ygrid',
    ygrids: 'c3-ygrids',
    ygridLine: 'c3-ygrid-line',
    ygridLines: 'c3-ygrid-lines',
    axis: 'c3-axis',
    axisX: 'c3-axis-x',
    axisXLabel: 'c3-axis-x-label',
    axisY: 'c3-axis-y',
    axisYLabel: 'c3-axis-y-label',
    axisY2: 'c3-axis-y2',
    axisY2Label: 'c3-axis-y2-label',
    legendBackground: 'c3-legend-background',
    legendItem: 'c3-legend-item',
    legendItemEvent: 'c3-legend-item-event',
    legendItemTile: 'c3-legend-item-tile',
    legendItemHidden: 'c3-legend-item-hidden',
    legendItemFocused: 'c3-legend-item-focused',
    dragarea: 'c3-dragarea',
    EXPANDED: '_expanded_',
    SELECTED: '_selected_',
    INCLUDED: '_included_',
};
c3_chart_internal_fn.generateClass = function (prefix, targetId) {
    return ' ' + prefix + ' ' + prefix + this.getTargetSelectorSuffix(targetId);
};
c3_chart_internal_fn.classText = function (d) {
    return this.generateClass(CLASS.text, d.index);
};
c3_chart_internal_fn.classTexts = function (d) {
    return this.generateClass(CLASS.texts, d.id);
};
c3_chart_internal_fn.classShape = function (d) {
    return this.generateClass(CLASS.shape, d.index);
};
c3_chart_internal_fn.classShapes = function (d) {
    return this.generateClass(CLASS.shapes, d.id);
};
c3_chart_internal_fn.classLine = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.line, d.id);
};
c3_chart_internal_fn.classLines = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.lines, d.id);
};
c3_chart_internal_fn.classCircle = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.circle, d.index);
};
c3_chart_internal_fn.classCircles = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.circles, d.id);
};
c3_chart_internal_fn.classBar = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.bar, d.index);
};
c3_chart_internal_fn.classBars = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.bars, d.id);
};
c3_chart_internal_fn.classArc = function (d) {
    return this.classShape(d.data) + this.generateClass(CLASS.arc, d.data.id);
};
c3_chart_internal_fn.classArcs = function (d) {
    return this.classShapes(d.data) + this.generateClass(CLASS.arcs, d.data.id);
};
c3_chart_internal_fn.classArea = function (d) {
    return this.classShape(d) + this.generateClass(CLASS.area, d.id);
};
c3_chart_internal_fn.classAreas = function (d) {
    return this.classShapes(d) + this.generateClass(CLASS.areas, d.id);
};
c3_chart_internal_fn.classRegion = function (d, i) {
    return this.generateClass(CLASS.region, i) + ' ' + ('class' in d ? d.class : '');
};
c3_chart_internal_fn.classEvent = function (d) {
    return this.generateClass(CLASS.eventRect, d.index);
};
c3_chart_internal_fn.classTarget = function (id) {
    const $$ = this;
    let additionalClassSuffix = $$.config.data_classes[id], additionalClass = '';
    if (additionalClassSuffix) {
        additionalClass = ' ' + CLASS.target + '-' + additionalClassSuffix;
    }
    return $$.generateClass(CLASS.target, id) + additionalClass;
};
c3_chart_internal_fn.classFocus = function (d) {
    return this.classFocused(d) + this.classDefocused(d);
};
c3_chart_internal_fn.classFocused = function (d) {
    return ' ' + (this.focusedTargetIds.indexOf(d.id) >= 0 ? CLASS.focused : '');
};
c3_chart_internal_fn.classDefocused = function (d) {
    return ' ' + (this.defocusedTargetIds.indexOf(d.id) >= 0 ? CLASS.defocused : '');
};
c3_chart_internal_fn.classChartText = function (d) {
    return CLASS.chartText + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartLine = function (d) {
    return CLASS.chartLine + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartBar = function (d) {
    return CLASS.chartBar + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartArc = function (d) {
    return CLASS.chartArc + this.classTarget(d.data.id);
};
c3_chart_internal_fn.getTargetSelectorSuffix = function (targetId) {
    return targetId || targetId === 0 ? ('-' + targetId).replace(/[\s?!@#$%^&*()_=+,.<>'":;\[\]\/|~`{}\\]/g, '-') : '';
};
c3_chart_internal_fn.selectorTarget = function (id, prefix) {
    return (prefix || '') + '.' + CLASS.target + this.getTargetSelectorSuffix(id);
};
c3_chart_internal_fn.selectorTargets = function (ids, prefix) {
    const $$ = this;
    ids = ids || [];
    return ids.length ? ids.map((id) => { return $$.selectorTarget(id, prefix); }) : null;
};
c3_chart_internal_fn.selectorLegend = function (id) {
    return '.' + CLASS.legendItem + this.getTargetSelectorSuffix(id);
};
c3_chart_internal_fn.selectorLegends = function (ids) {
    const $$ = this;
    return ids && ids.length ? ids.map((id) => { return $$.selectorLegend(id); }) : null;
};

let isValue = c3_chart_internal_fn.isValue = function (v) {
        return v || v === 0;
    },
    isFunction = c3_chart_internal_fn.isFunction = function (o) {
        return typeof o === 'function';
    },
    isString = c3_chart_internal_fn.isString = function (o) {
        return typeof o === 'string';
    },
    isUndefined = c3_chart_internal_fn.isUndefined = function (v) {
        return typeof v === 'undefined';
    },
    isDefined = c3_chart_internal_fn.isDefined = function (v) {
        return typeof v !== 'undefined';
    },
    ceil10 = c3_chart_internal_fn.ceil10 = function (v) {
        return Math.ceil(v / 10) * 10;
    },
    asHalfPixel = c3_chart_internal_fn.asHalfPixel = function (n) {
        return Math.ceil(n) + 0.5;
    },
    diffDomain = c3_chart_internal_fn.diffDomain = function (d) {
        return d[1] - d[0];
    },
    isEmpty = c3_chart_internal_fn.isEmpty = function (o) {
        return typeof o === 'undefined' || o === null || (isString(o) && o.length === 0) || (typeof o === 'object' && Object.keys(o).length === 0);
    },
    notEmpty = c3_chart_internal_fn.notEmpty = function (o) {
        return !c3_chart_internal_fn.isEmpty(o);
    },
    getOption = c3_chart_internal_fn.getOption = function (options, key, defaultValue) {
        return isDefined(options[key]) ? options[key] : defaultValue;
    },
    hasValue = c3_chart_internal_fn.hasValue = function (dict, value) {
        let found = false;
        Object.keys(dict).forEach((key) => {
            if (dict[key] === value) { found = true; }
        });
        return found;
    },
    sanitise = c3_chart_internal_fn.sanitise = function (str) {
        return typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str;
    },
    getPathBox = c3_chart_internal_fn.getPathBox = function (path) {
        let box = path.getBoundingClientRect(),
            items = [path.pathSegList.getItem(0), path.pathSegList.getItem(1)],
            minX = items[0].x, minY = Math.min(items[0].y, items[1].y);
        return { x: minX, y: minY, width: box.width, height: box.height };
    };

c3_chart_internal_fn.transformTo = function (targetIds, type, optionsForRedraw) {
    let $$ = this,
        withTransitionForAxis = !$$.hasArcType(),
        options = optionsForRedraw || { withTransitionForAxis };
    options.withTransitionForTransform = false;
    $$.transiting = false;
    $$.setTargetType(targetIds, type);
    $$.updateTargets($$.data.targets); // this is needed when transforming to arc
    $$.updateAndRedraw(options);
};

c3_chart_internal_fn.generateFlow = function (args) {
    let $$ = this,
        config = $$.config,
        d3 = $$.d3;

    return function () {
        let targets = args.targets,
            flow = args.flow,
            drawBar = args.drawBar,
            drawLine = args.drawLine,
            drawArea = args.drawArea,
            cx = args.cx,
            cy = args.cy,
            xv = args.xv,
            xForText = args.xForText,
            yForText = args.yForText,
            duration = args.duration;

        let translateX, scaleX = 1,
            transform,
            flowIndex = flow.index,
            flowLength = flow.length,
            flowStart = $$.getValueOnIndex($$.data.targets[0].values, flowIndex),
            flowEnd = $$.getValueOnIndex($$.data.targets[0].values, flowIndex + flowLength),
            orgDomain = $$.x.domain(),
            domain,
            durationForFlow = flow.duration || duration,
            done = flow.done || function () {},
            wait = $$.generateWait();

        let xgrid = $$.xgrid || d3.selectAll([]),
            xgridLines = $$.xgridLines || d3.selectAll([]),
            mainRegion = $$.mainRegion || d3.selectAll([]),
            mainText = $$.mainText || d3.selectAll([]),
            mainBar = $$.mainBar || d3.selectAll([]),
            mainLine = $$.mainLine || d3.selectAll([]),
            mainArea = $$.mainArea || d3.selectAll([]),
            mainCircle = $$.mainCircle || d3.selectAll([]);

        // set flag
        $$.flowing = true;

        // remove head data after rendered
        $$.data.targets.forEach((d) => {
            d.values.splice(0, flowLength);
        });

        // update x domain to generate axis elements for flow
        domain = $$.updateXDomain(targets, true, true);
        // update elements related to x scale
        if ($$.updateXGrid) { $$.updateXGrid(true); }

        // generate transform to flow
        if (!flow.orgDataCount) { // if empty
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
        } else if (flow.orgDataCount === 1 || (flowStart && flowStart.x) === (flowEnd && flowEnd.x)) {
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

        $$.hideXGridFocus();

        d3.transition().ease('linear').duration(durationForFlow).each(() => {
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
            .call(wait, () => {
                let i, shapes = [],
                    texts = [],
                    eventRects = [];

                // remove flowed elements
                if (flowLength) {
                    for (i = 0; i < flowLength; i++) {
                        shapes.push('.' + CLASS.shape + '-' + (flowIndex + i));
                        texts.push('.' + CLASS.text + '-' + (flowIndex + i));
                        eventRects.push('.' + CLASS.eventRect + '-' + (flowIndex + i));
                    }
                    $$.svg.selectAll('.' + CLASS.shapes).selectAll(shapes).remove();
                    $$.svg.selectAll('.' + CLASS.texts).selectAll(texts).remove();
                    $$.svg.selectAll('.' + CLASS.eventRects).selectAll(eventRects).remove();
                    $$.svg.select('.' + CLASS.xgrid).remove();
                }

                // draw again for removing flowed elements and reverting attr
                xgrid
                    .attr('transform', null)
                    .attr($$.xgridAttr);
                xgridLines
                    .attr('transform', null);
                xgridLines.select('line')
                    .attr('x1', config.axis_rotated ? 0 : xv)
                    .attr('x2', config.axis_rotated ? $$.width : xv);
                xgridLines.select('text')
                    .attr('x', config.axis_rotated ? $$.width : 0)
                    .attr('y', xv);
                mainBar
                    .attr('transform', null)
                    .attr('d', drawBar);
                mainLine
                    .attr('transform', null)
                    .attr('d', drawLine);
                mainArea
                    .attr('transform', null)
                    .attr('d', drawArea);
                mainCircle
                    .attr('transform', null)
                    .attr('cx', cx)
                    .attr('cy', cy);
                mainText
                    .attr('transform', null)
                    .attr('x', xForText)
                    .attr('y', yForText)
                    .style('fill-opacity', $$.opacityForText.bind($$));
                mainRegion
                    .attr('transform', null);
                mainRegion.select('rect').filter($$.isRegionOnX)
                    .attr('x', $$.regionX.bind($$))
                    .attr('width', $$.regionWidth.bind($$));

                if (config.interaction_enabled) {
                    $$.redrawEventRect();
                }

                // callback for end of flow
                done();

                $$.flowing = false;
            });
    };
};

c3_chart_internal_fn.isSafari = function () {
    const ua = window.navigator.userAgent;
    return ua.indexOf('Safari') >= 0 && ua.indexOf('Chrome') < 0;
};
c3_chart_internal_fn.isChrome = function () {
    const ua = window.navigator.userAgent;
    return ua.indexOf('Chrome') >= 0;
};
export {CLASS,isValue,isFunction,isString,isUndefined,isDefined,ceil10,asHalfPixel,diffDomain,isEmpty,notEmpty,getOption,hasValue,sanitise,getPathBox, ChartInternal};
export default ChartIntenal;