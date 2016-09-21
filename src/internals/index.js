/**
 * This file is seriously in need of some reorganization.
 */

import d3 from 'd3';
import { Axis } from '../axis/index';

import {
    initPie,
    updateRadius,
    updateArc,
    updateAngle,
    getSvgArc,
    getSvgArcExpanded,
    getArc,
    transformForArcLabel,
    getArcRatio,
    convertToArcData,
    textForArcLabel,
    expandArc,
    unexpandArc,
    expandDuration,
    shouldExpand,
    shouldShowArcLabel,
    meetsArcLabelThreshold,
    getArcLabelFormat,
    getArcTitle,
    updateTargetsForArc,
    initArc,
    redrawArc,
    initGauge,
    getGaugeLabelHeight,
} from './arc';

import {
    hasCaches,
    addCache,
    getCaches,
} from './cache';

import { categoryName } from './category';

import {
    CLASS,
    generateClass,
    classText,
    classTexts,
    classShape,
    classShapes,
    classLine,
    classLines,
    classCircle,
    classCircles,
    classBar,
    classBars,
    classArc,
    classArcs,
    classArea,
    classAreas,
    classRegion,
    classEvent,
    classTarget,
    classFocus,
    classFocused,
    classDefocused,
    classChartText,
    classChartLine,
    classChartBar,
    classChartArc,
    getTargetSelectorSuffix,
    selectorTarget,
    selectorTargets,
    selectorLegend,
    selectorLegends,
} from './class';

import {
    getClipPath,
    appendClip,
    getAxisClipX,
    getAxisClipY,
    getXAxisClipX,
    getXAxisClipY,
    getYAxisClipX,
    getYAxisClipY,
    getAxisClipWidth,
    getAxisClipHeight,
    getXAxisClipWidth,
    getXAxisClipHeight,
    getYAxisClipWidth,
    getYAxisClipHeight,
} from './clip';

import {
    generateColor,
    generateLevelColor
} from './color';

import {
    getDefaultConfig,
    additionalConfig,
    loadConfig,
} from './config';

import {
    convertUrlToData,
    convertXsvToData,
    convertCsvToData,
    convertTsvToData,
    convertJsonToData,
    findValueInJson,
    convertRowsToData,
    convertColumnsToData,
    convertDataToTargets,
} from './data.convert';

import {
    isX,
    isNotX,
    getXKey,
    getXValuesOfXKey,
    getIndexByX,
    getXValue,
    getOtherTargetXs,
    getOtherTargetX,
    addXs,
    hasMultipleX,
    isMultipleX,
    addName,
    getValueOnIndex,
    updateTargetX,
    updateTargetXs,
    generateTargetX,
    cloneTarget,
    updateXs,
    getPrevX,
    getNextX,
    getMaxDataCount,
    getMaxDataCountTarget,
    getEdgeX,
    mapToIds,
    mapToTargetIds,
    hasTarget,
    isTargetToShow,
    isLegendToShow,
    filterTargetsToShow,
    mapTargetsToUniqueXs,
    addHiddenTargetIds,
    removeHiddenTargetIds,
    addHiddenLegendIds,
    removeHiddenLegendIds,
    getValuesAsIdKeyed,
    checkValueInTargets,
    hasNegativeValueInTargets,
    hasPositiveValueInTargets,
    isOrderDesc,
    isOrderAsc,
    orderTargets,
    filterByX,
    filterRemoveNull,
    filterByXDomain,
    hasDataLabel,
    getDataLabelLength,
    isNoneArc,
    isArc,
    findSameXOfValues,
    findClosestFromTargets,
    findClosest,
    dist,
    convertValuesToStep,
    updateDataAttributes,
} from './data';

import {
    load,
    loadFromArgs,
    unload,
} from './data.load';

import {
    getYDomainMin,
    getYDomainMax,
    getYDomain,
    getXDomainMin,
    getXDomainMax,
    getXDomainPadding,
    getXDomain,
    updateXDomain,
    trimXDomain,
} from './domain';

import {
    drag,
    dragstart,
    dragend,
} from './drag';

import { generateFlow } from './flow';

import {
    getYFormat,
    yFormat,
    y2Format,
    defaultValueFormat,
    defaultArcValueFormat,
    dataLabelFormat,
} from './format';

import {
    initGrid,
    initGridLines,
    updateXGrid,
    updateYGrid,
    gridTextAnchor,
    gridTextDx,
    xGridTextX,
    yGridTextX,
    updateGrid,
    redrawGrid,
    showXGridFocus,
    hideXGridFocus,
    updateXgridFocus,
    generateGridData,
    getGridFilterToRemove,
    removeGridLines,
} from './grid';

import {
    initEventRect,
    redrawEventRect,
    updateEventRect,
    generateEventRectsForSingleX,
    generateEventRectsForMultipleXs,
    dispatchEvent,
} from './interaction';

import {
    initLegend,
    updateLegendWithDefaults,
    updateSizeForLegend,
    transformLegend,
    updateLegendStep,
    updateLegendItemWidth,
    updateLegendItemHeight,
    getLegendWidth,
    getLegendHeight,
    opacityForLegend,
    opacityForUnfocusedLegend,
    toggleFocusLegend,
    revertLegend,
    showLegend,
    hideLegend,
    clearLegendItemTextBoxCache,
    updateLegend,
} from './legend';

import {
    initRegion,
    updateRegion,
    redrawRegion,
    regionX,
    regionY,
    regionWidth,
    regionHeight,
    isRegionOnX,
} from './region';

import {
    getScale,
    getX,
    getY,
    getYScale,
    getSubYScale,
    updateScales,
} from './scale';

import {
    selectPoint,
    unselectPoint,
    togglePoint,
    selectPath,
    unselectPath,
    togglePath,
    getToggle,
    toggleShape,
} from './selection';

import {
    initBar,
    updateTargetsForBar,
    updateBar,
    redrawBar,
    getBarW,
    getBars,
    expandBars,
    unexpandBars,
    generateDrawBar,
    generateGetBarPoints,
    isWithinBar,
} from './shape.bar';

import {
    getShapeIndices,
    getShapeX,
    getShapeY,
    getShapeOffset,
    isWithinShape,
    getInterpolate,
} from './shape';

import {
    initLine,
    updateTargetsForLine,
    updateLine,
    redrawLine,
    generateDrawLine,
    generateGetLinePoints,
    lineWithRegions,
    updateArea,
    redrawArea,
    generateDrawArea,
    getAreaBaseValue,
    generateGetAreaPoints,
    updateCircle,
    redrawCircle,
    circleX,
    updateCircleY,
    getCircles,
    expandCircles,
    unexpandCircles,
    pointR,
    pointExpandedR,
    pointSelectR,
    isWithinCircle,
    isWithinStep,
} from './shape.line';

import {
    getCurrentWidth,
    getCurrentHeight,
    getCurrentPaddingTop,
    getCurrentPaddingBottom,
    getCurrentPaddingLeft,
    getCurrentPaddingRight,
    getParentRectValue,
    getParentWidth,
    getParentHeight,
    getSvgLeft,
    getAxisWidthByAxisId,
    getHorizontalAxisHeight,
    getEventRectWidth,
} from './size';

import {
    initBrush,
    initSubchart,
    updateTargetsForSubchart,
    updateBarForSubchart,
    redrawBarForSubchart,
    updateLineForSubchart,
    redrawLineForSubchart,
    updateAreaForSubchart,
    redrawAreaForSubchart,
    redrawSubchart,
    redrawForBrush,
    transformContext,
    getDefaultExtent,
} from './subchart';

import {
    initText,
    updateTargetsForText,
    updateText,
    redrawText,
    getTextRect,
    generateXYForText,
    getXForText,
    getYForText,
} from './text';

import {
    initTitle,
    redrawTitle,
    xForTitle,
    yForTitle,
    getTitlePadding,
} from './title';

import {
    initTooltip,
    getTooltipContent,
    tooltipPosition,
    showTooltip,
    hideTooltip,
} from './tooltip';

import { transformTo } from './transform';

import {
    setTargetType,
    hasType,
    hasArcType,
    isLineType,
    isStepType,
    isSplineType,
    isAreaType,
    isBarType,
    isScatterType,
    isPieType,
    isGaugeType,
    isDonutType,
    isArcType,
    lineData,
    arcData,
    barData,
    lineOrScatterData,
    barOrLineData,
    isInterpolationType,
} from './type';

import {
    isSafari,
    isChrome
} from './ua';

import {
    initZoom,
    getZoomDomain,
    updateZoom,
    redrawForZoom,
} from './zoom';

import * as util from './util';

export const {
    isValue,
    isFunction,
    isString,
    isUndefined,
    isDefined,
    ceil10,
    asHalfPixel,
    diffDomain,
    isEmpty,
    notEmpty,
    getOption,
    hasValue,
    sanitise,
    getPathBox,
} = util;

if (!window) {
    const window = global;
}

// Start ChartInternal!!!!
function ChartInternal(api) {
    const $$ = this;
    $$.d3 = d3;
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

//  There might be a better way of doing this...
c3_chart_internal_fn.isSafari = isSafari;
c3_chart_internal_fn.isChrome = isChrome;
c3_chart_internal_fn.initPie = initPie;
c3_chart_internal_fn.updateRadius = updateRadius;
c3_chart_internal_fn.updateArc = updateArc;
c3_chart_internal_fn.updateAngle = updateAngle;
c3_chart_internal_fn.getSvgArc = getSvgArc;
c3_chart_internal_fn.getSvgArcExpanded = getSvgArcExpanded;
c3_chart_internal_fn.getArc = getArc;
c3_chart_internal_fn.transformForArcLabel = transformForArcLabel;
c3_chart_internal_fn.getArcRatio = getArcRatio;
c3_chart_internal_fn.convertToArcData = convertToArcData;
c3_chart_internal_fn.textForArcLabel = textForArcLabel;
c3_chart_internal_fn.expandArc = expandArc;
c3_chart_internal_fn.unexpandArc = unexpandArc;
c3_chart_internal_fn.expandDuration = expandDuration;
c3_chart_internal_fn.shouldExpand = shouldExpand;
c3_chart_internal_fn.shouldShowArcLabel = shouldShowArcLabel;
c3_chart_internal_fn.meetsArcLabelThreshold = meetsArcLabelThreshold;
c3_chart_internal_fn.getArcLabelFormat = getArcLabelFormat;
c3_chart_internal_fn.getArcTitle = getArcTitle;
c3_chart_internal_fn.updateTargetsForArc = updateTargetsForArc;
c3_chart_internal_fn.initArc = initArc;
c3_chart_internal_fn.redrawArc = redrawArc;
c3_chart_internal_fn.initGauge = initGauge;
c3_chart_internal_fn.getGaugeLabelHeight = getGaugeLabelHeight;
c3_chart_internal_fn.hasCaches = hasCaches;
c3_chart_internal_fn.addCache = addCache;
c3_chart_internal_fn.getCaches = getCaches;
c3_chart_internal_fn.categoryName = categoryName;
c3_chart_internal_fn.CLASS = CLASS;
c3_chart_internal_fn.generateClass = generateClass;
c3_chart_internal_fn.classText = classText;
c3_chart_internal_fn.classTexts = classTexts;
c3_chart_internal_fn.classShape = classShape;
c3_chart_internal_fn.classShapes = classShapes;
c3_chart_internal_fn.classLine = classLine;
c3_chart_internal_fn.classLines = classLines;
c3_chart_internal_fn.classCircle = classCircle;
c3_chart_internal_fn.classCircles = classCircles;
c3_chart_internal_fn.classBar = classBar;
c3_chart_internal_fn.classBars = classBars;
c3_chart_internal_fn.classArc = classArc;
c3_chart_internal_fn.classArcs = classArcs;
c3_chart_internal_fn.classArea = classArea;
c3_chart_internal_fn.classAreas = classAreas;
c3_chart_internal_fn.classRegion = classRegion;
c3_chart_internal_fn.classEvent = classEvent;
c3_chart_internal_fn.classTarget = classTarget;
c3_chart_internal_fn.classFocus = classFocus;
c3_chart_internal_fn.classFocused = classFocused;
c3_chart_internal_fn.classDefocused = classDefocused;
c3_chart_internal_fn.classChartText = classChartText;
c3_chart_internal_fn.classChartLine = classChartLine;
c3_chart_internal_fn.classChartBar = classChartBar;
c3_chart_internal_fn.classChartArc = classChartArc;
c3_chart_internal_fn.getTargetSelectorSuffix = getTargetSelectorSuffix;
c3_chart_internal_fn.selectorTarget = selectorTarget;
c3_chart_internal_fn.selectorTargets = selectorTargets;
c3_chart_internal_fn.selectorLegend = selectorLegend;
c3_chart_internal_fn.selectorLegends = selectorLegends;
c3_chart_internal_fn.getClipPath = getClipPath;
c3_chart_internal_fn.appendClip = appendClip;
c3_chart_internal_fn.getAxisClipX = getAxisClipX;
c3_chart_internal_fn.getAxisClipY = getAxisClipY;
c3_chart_internal_fn.getXAxisClipX = getXAxisClipX;
c3_chart_internal_fn.getXAxisClipY = getXAxisClipY;
c3_chart_internal_fn.getYAxisClipX = getYAxisClipX;
c3_chart_internal_fn.getYAxisClipY = getYAxisClipY;
c3_chart_internal_fn.getAxisClipWidth = getAxisClipWidth;
c3_chart_internal_fn.getAxisClipHeight = getAxisClipHeight;
c3_chart_internal_fn.getXAxisClipWidth = getXAxisClipWidth;
c3_chart_internal_fn.getXAxisClipHeight = getXAxisClipHeight;
c3_chart_internal_fn.getYAxisClipWidth = getYAxisClipWidth;
c3_chart_internal_fn.getYAxisClipHeight = getYAxisClipHeight;
c3_chart_internal_fn.generateColor = generateColor;
c3_chart_internal_fn.generateLevelColor = generateLevelColor;
c3_chart_internal_fn.getDefaultConfig = getDefaultConfig;
c3_chart_internal_fn.additionalConfig = additionalConfig;
c3_chart_internal_fn.loadConfig = loadConfig;
c3_chart_internal_fn.convertUrlToData = convertUrlToData;
c3_chart_internal_fn.convertXsvToData = convertXsvToData;
c3_chart_internal_fn.convertCsvToData = convertCsvToData;
c3_chart_internal_fn.convertTsvToData = convertTsvToData;
c3_chart_internal_fn.convertJsonToData = convertJsonToData;
c3_chart_internal_fn.findValueInJson = findValueInJson;
c3_chart_internal_fn.convertRowsToData = convertRowsToData;
c3_chart_internal_fn.convertColumnsToData = convertColumnsToData;
c3_chart_internal_fn.convertDataToTargets = convertDataToTargets;
c3_chart_internal_fn.isX = isX;
c3_chart_internal_fn.isNotX = isNotX;
c3_chart_internal_fn.getXKey = getXKey;
c3_chart_internal_fn.getXValuesOfXKey = getXValuesOfXKey;
c3_chart_internal_fn.getIndexByX = getIndexByX;
c3_chart_internal_fn.getXValue = getXValue;
c3_chart_internal_fn.getOtherTargetXs = getOtherTargetXs;
c3_chart_internal_fn.getOtherTargetX = getOtherTargetX;
c3_chart_internal_fn.addXs = addXs;
c3_chart_internal_fn.hasMultipleX = hasMultipleX;
c3_chart_internal_fn.isMultipleX = isMultipleX;
c3_chart_internal_fn.addName = addName;
c3_chart_internal_fn.getValueOnIndex = getValueOnIndex;
c3_chart_internal_fn.updateTargetX = updateTargetX;
c3_chart_internal_fn.updateTargetXs = updateTargetXs;
c3_chart_internal_fn.generateTargetX = generateTargetX;
c3_chart_internal_fn.cloneTarget = cloneTarget;
c3_chart_internal_fn.updateXs = updateXs;
c3_chart_internal_fn.getPrevX = getPrevX;
c3_chart_internal_fn.getNextX = getNextX;
c3_chart_internal_fn.getMaxDataCount = getMaxDataCount;
c3_chart_internal_fn.getMaxDataCountTarget = getMaxDataCountTarget;
c3_chart_internal_fn.getEdgeX = getEdgeX;
c3_chart_internal_fn.mapToIds = mapToIds;
c3_chart_internal_fn.mapToTargetIds = mapToTargetIds;
c3_chart_internal_fn.hasTarget = hasTarget;
c3_chart_internal_fn.isTargetToShow = isTargetToShow;
c3_chart_internal_fn.isLegendToShow = isLegendToShow;
c3_chart_internal_fn.filterTargetsToShow = filterTargetsToShow;
c3_chart_internal_fn.mapTargetsToUniqueXs = mapTargetsToUniqueXs;
c3_chart_internal_fn.addHiddenTargetIds = addHiddenTargetIds;
c3_chart_internal_fn.removeHiddenTargetIds = removeHiddenTargetIds;
c3_chart_internal_fn.addHiddenLegendIds = addHiddenLegendIds;
c3_chart_internal_fn.removeHiddenLegendIds = removeHiddenLegendIds;
c3_chart_internal_fn.getValuesAsIdKeyed = getValuesAsIdKeyed;
c3_chart_internal_fn.checkValueInTargets = checkValueInTargets;
c3_chart_internal_fn.hasNegativeValueInTargets = hasNegativeValueInTargets;
c3_chart_internal_fn.hasPositiveValueInTargets = hasPositiveValueInTargets;
c3_chart_internal_fn.isOrderDesc = isOrderDesc;
c3_chart_internal_fn.isOrderAsc = isOrderAsc;
c3_chart_internal_fn.orderTargets = orderTargets;
c3_chart_internal_fn.filterByX = filterByX;
c3_chart_internal_fn.filterRemoveNull = filterRemoveNull;
c3_chart_internal_fn.filterByXDomain = filterByXDomain;
c3_chart_internal_fn.hasDataLabel = hasDataLabel;
c3_chart_internal_fn.getDataLabelLength = getDataLabelLength;
c3_chart_internal_fn.isNoneArc = isNoneArc;
c3_chart_internal_fn.isArc = isArc;
c3_chart_internal_fn.findSameXOfValues = findSameXOfValues;
c3_chart_internal_fn.findClosestFromTargets = findClosestFromTargets;
c3_chart_internal_fn.findClosest = findClosest;
c3_chart_internal_fn.dist = dist;
c3_chart_internal_fn.convertValuesToStep = convertValuesToStep;
c3_chart_internal_fn.updateDataAttributes = updateDataAttributes;
c3_chart_internal_fn.load = load;
c3_chart_internal_fn.loadFromArgs = loadFromArgs;
c3_chart_internal_fn.unload = unload;
c3_chart_internal_fn.getYDomainMin = getYDomainMin;
c3_chart_internal_fn.getYDomainMax = getYDomainMax;
c3_chart_internal_fn.getYDomain = getYDomain;
c3_chart_internal_fn.getXDomainMin = getXDomainMin;
c3_chart_internal_fn.getXDomainMax = getXDomainMax;
c3_chart_internal_fn.getXDomainPadding = getXDomainPadding;
c3_chart_internal_fn.getXDomain = getXDomain;
c3_chart_internal_fn.updateXDomain = updateXDomain;
c3_chart_internal_fn.trimXDomain = trimXDomain;
c3_chart_internal_fn.drag = drag;
c3_chart_internal_fn.dragstart = dragstart;
c3_chart_internal_fn.dragend = dragend;
c3_chart_internal_fn.generateFlow = generateFlow;
c3_chart_internal_fn.getYFormat = getYFormat;
c3_chart_internal_fn.yFormat = yFormat;
c3_chart_internal_fn.y2Format = y2Format;
c3_chart_internal_fn.defaultValueFormat = defaultValueFormat;
c3_chart_internal_fn.defaultArcValueFormat = defaultArcValueFormat;
c3_chart_internal_fn.dataLabelFormat = dataLabelFormat;
c3_chart_internal_fn.initGrid = initGrid;
c3_chart_internal_fn.initGridLines = initGridLines;
c3_chart_internal_fn.updateXGrid = updateXGrid;
c3_chart_internal_fn.updateYGrid = updateYGrid;
c3_chart_internal_fn.gridTextAnchor = gridTextAnchor;
c3_chart_internal_fn.gridTextDx = gridTextDx;
c3_chart_internal_fn.xGridTextX = xGridTextX;
c3_chart_internal_fn.yGridTextX = yGridTextX;
c3_chart_internal_fn.updateGrid = updateGrid;
c3_chart_internal_fn.redrawGrid = redrawGrid;
c3_chart_internal_fn.showXGridFocus = showXGridFocus;
c3_chart_internal_fn.hideXGridFocus = hideXGridFocus;
c3_chart_internal_fn.updateXgridFocus = updateXgridFocus;
c3_chart_internal_fn.generateGridData = generateGridData;
c3_chart_internal_fn.getGridFilterToRemove = getGridFilterToRemove;
c3_chart_internal_fn.removeGridLines = removeGridLines;
c3_chart_internal_fn.initEventRect = initEventRect;
c3_chart_internal_fn.redrawEventRect = redrawEventRect;
c3_chart_internal_fn.updateEventRect = updateEventRect;
c3_chart_internal_fn.generateEventRectsForSingleX = generateEventRectsForSingleX;
c3_chart_internal_fn.generateEventRectsForMultipleXs = generateEventRectsForMultipleXs;
c3_chart_internal_fn.dispatchEvent = dispatchEvent;
c3_chart_internal_fn.initLegend = initLegend;
c3_chart_internal_fn.updateLegendWithDefaults = updateLegendWithDefaults;
c3_chart_internal_fn.updateSizeForLegend = updateSizeForLegend;
c3_chart_internal_fn.transformLegend = transformLegend;
c3_chart_internal_fn.updateLegendStep = updateLegendStep;
c3_chart_internal_fn.updateLegendItemWidth = updateLegendItemWidth;
c3_chart_internal_fn.updateLegendItemHeight = updateLegendItemHeight;
c3_chart_internal_fn.getLegendWidth = getLegendWidth;
c3_chart_internal_fn.getLegendHeight = getLegendHeight;
c3_chart_internal_fn.opacityForLegend = opacityForLegend;
c3_chart_internal_fn.opacityForUnfocusedLegend = opacityForUnfocusedLegend;
c3_chart_internal_fn.toggleFocusLegend = toggleFocusLegend;
c3_chart_internal_fn.revertLegend = revertLegend;
c3_chart_internal_fn.showLegend = showLegend;
c3_chart_internal_fn.hideLegend = hideLegend;
c3_chart_internal_fn.clearLegendItemTextBoxCache = clearLegendItemTextBoxCache;
c3_chart_internal_fn.updateLegend = updateLegend;
c3_chart_internal_fn.initRegion = initRegion;
c3_chart_internal_fn.updateRegion = updateRegion;
c3_chart_internal_fn.redrawRegion = redrawRegion;
c3_chart_internal_fn.regionX = regionX;
c3_chart_internal_fn.regionY = regionY;
c3_chart_internal_fn.regionWidth = regionWidth;
c3_chart_internal_fn.regionHeight = regionHeight;
c3_chart_internal_fn.isRegionOnX = isRegionOnX;
c3_chart_internal_fn.getScale = getScale;
c3_chart_internal_fn.getX = getX;
c3_chart_internal_fn.getY = getY;
c3_chart_internal_fn.getYScale = getYScale;
c3_chart_internal_fn.getSubYScale = getSubYScale;
c3_chart_internal_fn.updateScales = updateScales;
c3_chart_internal_fn.selectPoint = selectPoint;
c3_chart_internal_fn.unselectPoint = unselectPoint;
c3_chart_internal_fn.togglePoint = togglePoint;
c3_chart_internal_fn.selectPath = selectPath;
c3_chart_internal_fn.unselectPath = unselectPath;
c3_chart_internal_fn.togglePath = togglePath;
c3_chart_internal_fn.getToggle = getToggle;
c3_chart_internal_fn.toggleShape = toggleShape;
c3_chart_internal_fn.initBar = initBar;
c3_chart_internal_fn.updateTargetsForBar = updateTargetsForBar;
c3_chart_internal_fn.updateBar = updateBar;
c3_chart_internal_fn.redrawBar = redrawBar;
c3_chart_internal_fn.getBarW = getBarW;
c3_chart_internal_fn.getBars = getBars;
c3_chart_internal_fn.expandBars = expandBars;
c3_chart_internal_fn.unexpandBars = unexpandBars;
c3_chart_internal_fn.generateDrawBar = generateDrawBar;
c3_chart_internal_fn.generateGetBarPoints = generateGetBarPoints;
c3_chart_internal_fn.isWithinBar = isWithinBar;
c3_chart_internal_fn.getShapeIndices = getShapeIndices;
c3_chart_internal_fn.getShapeX = getShapeX;
c3_chart_internal_fn.getShapeY = getShapeY;
c3_chart_internal_fn.getShapeOffset = getShapeOffset;
c3_chart_internal_fn.isWithinShape = isWithinShape;
c3_chart_internal_fn.getInterpolate = getInterpolate;
c3_chart_internal_fn.initLine = initLine;
c3_chart_internal_fn.updateTargetsForLine = updateTargetsForLine;
c3_chart_internal_fn.updateLine = updateLine;
c3_chart_internal_fn.redrawLine = redrawLine;
c3_chart_internal_fn.generateDrawLine = generateDrawLine;
c3_chart_internal_fn.generateGetLinePoints = generateGetLinePoints;
c3_chart_internal_fn.lineWithRegions = lineWithRegions;
c3_chart_internal_fn.updateArea = updateArea;
c3_chart_internal_fn.redrawArea = redrawArea;
c3_chart_internal_fn.generateDrawArea = generateDrawArea;
c3_chart_internal_fn.getAreaBaseValue = getAreaBaseValue;
c3_chart_internal_fn.generateGetAreaPoints = generateGetAreaPoints;
c3_chart_internal_fn.updateCircle = updateCircle;
c3_chart_internal_fn.redrawCircle = redrawCircle;
c3_chart_internal_fn.circleX = circleX;
c3_chart_internal_fn.updateCircleY = updateCircleY;
c3_chart_internal_fn.getCircles = getCircles;
c3_chart_internal_fn.expandCircles = expandCircles;
c3_chart_internal_fn.unexpandCircles = unexpandCircles;
c3_chart_internal_fn.pointR = pointR;
c3_chart_internal_fn.pointExpandedR = pointExpandedR;
c3_chart_internal_fn.pointSelectR = pointSelectR;
c3_chart_internal_fn.isWithinCircle = isWithinCircle;
c3_chart_internal_fn.isWithinStep = isWithinStep;
c3_chart_internal_fn.getCurrentWidth = getCurrentWidth;
c3_chart_internal_fn.getCurrentHeight = getCurrentHeight;
c3_chart_internal_fn.getCurrentPaddingTop = getCurrentPaddingTop;
c3_chart_internal_fn.getCurrentPaddingBottom = getCurrentPaddingBottom;
c3_chart_internal_fn.getCurrentPaddingLeft = getCurrentPaddingLeft;
c3_chart_internal_fn.getCurrentPaddingRight = getCurrentPaddingRight;
c3_chart_internal_fn.getParentRectValue = getParentRectValue;
c3_chart_internal_fn.getParentWidth = getParentWidth;
c3_chart_internal_fn.getParentHeight = getParentHeight;
c3_chart_internal_fn.getSvgLeft = getSvgLeft;
c3_chart_internal_fn.getAxisWidthByAxisId = getAxisWidthByAxisId;
c3_chart_internal_fn.getHorizontalAxisHeight = getHorizontalAxisHeight;
c3_chart_internal_fn.getEventRectWidth = getEventRectWidth;
c3_chart_internal_fn.initBrush = initBrush;
c3_chart_internal_fn.initSubchart = initSubchart;
c3_chart_internal_fn.updateTargetsForSubchart = updateTargetsForSubchart;
c3_chart_internal_fn.updateBarForSubchart = updateBarForSubchart;
c3_chart_internal_fn.redrawBarForSubchart = redrawBarForSubchart;
c3_chart_internal_fn.updateLineForSubchart = updateLineForSubchart;
c3_chart_internal_fn.redrawLineForSubchart = redrawLineForSubchart;
c3_chart_internal_fn.updateAreaForSubchart = updateAreaForSubchart;
c3_chart_internal_fn.redrawAreaForSubchart = redrawAreaForSubchart;
c3_chart_internal_fn.redrawSubchart = redrawSubchart;
c3_chart_internal_fn.redrawForBrush = redrawForBrush;
c3_chart_internal_fn.transformContext = transformContext;
c3_chart_internal_fn.getDefaultExtent = getDefaultExtent;
c3_chart_internal_fn.initText = initText;
c3_chart_internal_fn.updateTargetsForText = updateTargetsForText;
c3_chart_internal_fn.updateText = updateText;
c3_chart_internal_fn.redrawText = redrawText;
c3_chart_internal_fn.getTextRect = getTextRect;
c3_chart_internal_fn.generateXYForText = generateXYForText;
c3_chart_internal_fn.getXForText = getXForText;
c3_chart_internal_fn.getYForText = getYForText;
c3_chart_internal_fn.initTitle = initTitle;
c3_chart_internal_fn.redrawTitle = redrawTitle;
c3_chart_internal_fn.xForTitle = xForTitle;
c3_chart_internal_fn.yForTitle = yForTitle;
c3_chart_internal_fn.getTitlePadding = getTitlePadding;
c3_chart_internal_fn.initTooltip = initTooltip;
c3_chart_internal_fn.getTooltipContent = getTooltipContent;
c3_chart_internal_fn.tooltipPosition = tooltipPosition;
c3_chart_internal_fn.showTooltip = showTooltip;
c3_chart_internal_fn.hideTooltip = hideTooltip;
c3_chart_internal_fn.transformTo = transformTo;
c3_chart_internal_fn.setTargetType = setTargetType;
c3_chart_internal_fn.hasType = hasType;
c3_chart_internal_fn.hasArcType = hasArcType;
c3_chart_internal_fn.isLineType = isLineType;
c3_chart_internal_fn.isStepType = isStepType;
c3_chart_internal_fn.isSplineType = isSplineType;
c3_chart_internal_fn.isAreaType = isAreaType;
c3_chart_internal_fn.isBarType = isBarType;
c3_chart_internal_fn.isScatterType = isScatterType;
c3_chart_internal_fn.isPieType = isPieType;
c3_chart_internal_fn.isGaugeType = isGaugeType;
c3_chart_internal_fn.isDonutType = isDonutType;
c3_chart_internal_fn.isArcType = isArcType;
c3_chart_internal_fn.lineData = lineData;
c3_chart_internal_fn.arcData = arcData;
c3_chart_internal_fn.barData = barData;
c3_chart_internal_fn.lineOrScatterData = lineOrScatterData;
c3_chart_internal_fn.barOrLineData = barOrLineData;
c3_chart_internal_fn.isInterpolationType = isInterpolationType;
c3_chart_internal_fn.initZoom = initZoom;
c3_chart_internal_fn.getZoomDomain = getZoomDomain;
c3_chart_internal_fn.updateZoom = updateZoom;
c3_chart_internal_fn.redrawForZoom = redrawForZoom;

export { ChartInternal, c3_chart_internal_fn };
export { CLASS };
