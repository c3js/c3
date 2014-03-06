(function (window) {
    'use strict';

    var c3 = window.c3 = {};
    var d3 = window.d3;

    /*
     * Generate chart according to config
     */
    c3.generate = function (config) {

        var c3 = { data : {} },
            cache = {};

        var EXPANDED = '_expanded_', SELECTED = '_selected_', INCLUDED = '_included_';

        /*-- Handle Config --*/

        function checkConfig(key, message) {
            if (! (key in config)) { throw Error(message); }
        }

        function getConfig(keys, defaultValue) {
            var target = config;
            for (var i = 0; i < keys.length; i++) {
                if (! (keys[i] in target)) { return defaultValue; }
                target = target[keys[i]];
            }
            return target;
        }

        // bindto - id to bind the chart
        var __bindto = getConfig(['bindto'], '#chart');

        var __size_width = getConfig(['size', 'width'], null),
            __size_height = getConfig(['size', 'height'], null);

        var __padding_left = getConfig(['padding', 'left'], null),
            __padding_right = getConfig(['padding', 'right'], null);

        var __zoom_enabled = getConfig(['zoom', 'enabled'], false),
            __zoom_extent = getConfig(['zoom', 'extent'], null),
            __zoom_privileged = getConfig(['zoom', 'privileged'], false);

        var __onenter = getConfig(['onenter'], function () {}),
            __onleave = getConfig(['onleave'], function () {});

        var __transition_duration = getConfig(['transition', 'duration'], 350);

        // data - data configuration
        checkConfig('data', 'data is required in config');

        var __data_x = getConfig(['data', 'x'], null),
            __data_xs = getConfig(['data', 'xs'], null),
            __data_x_format = getConfig(['data', 'x_format'], '%Y-%m-%d'),
            __data_id_converter = getConfig(['data', 'id_converter'], function (id) { return id; }),
            __data_names = getConfig(['data', 'names'], {}),
            __data_groups = getConfig(['data', 'groups'], []),
            __data_axes = getConfig(['data', 'axes'], {}),
            __data_type = getConfig(['data', 'type'], null),
            __data_types = getConfig(['data', 'types'], {}),
            __data_labels = getConfig(['data', 'labels'], {}),
            __data_order = getConfig(['data', 'order'], null),
            __data_regions = getConfig(['data', 'regions'], {}),
            __data_colors = getConfig(['data', 'colors'], {}),
            __data_selection_enabled = getConfig(['data', 'selection', 'enabled'], false),
            __data_selection_grouped = getConfig(['data', 'selection', 'grouped'], false),
            __data_selection_isselectable = getConfig(['data', 'selection', 'isselectable'], function () { return true; });

        // subchart
        var __subchart_show = getConfig(['subchart', 'show'], false),
            __subchart_size_height = __subchart_show ? getConfig(['subchart', 'size', 'height'], 60) : 0;

        // color
        var __color_pattern = getConfig(['color', 'pattern'], null);

        // legend
        var __legend_show = getConfig(['legend', 'show'], true),
            __legend_position = getConfig(['legend', 'position'], 'bottom'),
            __legend_item_onclick = getConfig(['legend', 'item', 'onclick'], function () {});

        // axis
        var __axis_rotated = getConfig(['axis', 'rotated'], false),
            __axis_x_type = getConfig(['axis', 'x', 'type'], 'indexed'),
            __axis_x_categories = getConfig(['axis', 'x', 'categories'], []),
            __axis_x_tick_centered = getConfig(['axis', 'x', 'tick', 'centered'], false),
            __axis_x_tick_format = getConfig(['axis', 'x', 'tick', 'format'], null),
            __axis_x_tick_culling = getConfig(['axis', 'x', 'tick', 'culling'], __axis_rotated || __axis_x_type === 'categorized' ? false : true),
            __axis_x_tick_count = getConfig(['axis', 'x', 'tick', 'count'], 10),
            __axis_x_default = getConfig(['axis', 'x', 'default'], null),
            __axis_x_label = getConfig(['axis', 'x', 'label'], null),
            __axis_x_label_position_dy = getConfig(['axis', 'x', 'label_position', 'dy'], "-.5em"),
            __axis_y_max = getConfig(['axis', 'y', 'max'], null),
            __axis_y_min = getConfig(['axis', 'y', 'min'], null),
            __axis_y_center = getConfig(['axis', 'y', 'center'], null),
            __axis_y_label = getConfig(['axis', 'y', 'label'], null),
            __axis_y_label_position_dx = getConfig(['axis', 'y', 'label_position', 'dx'], "-.5em"),
            __axis_y_label_position_dy = getConfig(['axis', 'y', 'label_position', 'dy'], "1.2em"),
            __axis_y_inner = getConfig(['axis', 'y', 'inner'], false),
            __axis_y_tick_format = getConfig(['axis', 'y', 'tick', 'format'], null),
            __axis_y_padding = getConfig(['axis', 'y', 'padding'], null),
            __axis_y_ticks = getConfig(['axis', 'y', 'ticks'], 10),
            __axis_y2_show = getConfig(['axis', 'y2', 'show'], false),
            __axis_y2_max = getConfig(['axis', 'y2', 'max'], null),
            __axis_y2_min = getConfig(['axis', 'y2', 'min'], null),
            __axis_y2_center = getConfig(['axis', 'y2', 'center'], null),
            // not used
            // __axis_y2_label = getConfig(['axis', 'y2', 'text'], null),
            __axis_y2_inner = getConfig(['axis', 'y2', 'inner'], false),
            __axis_y2_tick_format = getConfig(['axis', 'y2', 'tick', 'format'], null),
            __axis_y2_padding = getConfig(['axis', 'y2', 'padding'], null),
            __axis_y2_ticks = getConfig(['axis', 'y2', 'ticks'], 10);

        // grid
        var __grid_x_show = getConfig(['grid', 'x', 'show'], false),
            __grid_x_type = getConfig(['grid', 'x', 'type'], 'tick'),
            __grid_x_lines = getConfig(['grid', 'x', 'lines'], null),
            __grid_y_show = getConfig(['grid', 'y', 'show'], false),
            // not used
            // __grid_y_type = getConfig(['grid', 'y', 'type'], 'tick'),
            __grid_y_lines = getConfig(['grid', 'y', 'lines'], null);

        // point - point of each data
        var __point_show = getConfig(['point', 'show'], true),
            __point_r = __point_show ? getConfig(['point', 'r'], 2.5) : 0,
            __point_focus_line_enabled = getConfig(['point', 'focus', 'line', 'enabled'], true),
            __point_focus_expand_enabled = getConfig(['point', 'focus', 'expand', 'enabled'], true),
            __point_focus_expand_r = getConfig(['point', 'focus', 'expand', 'r'], __point_focus_expand_enabled ? 4 : __point_r),
            __point_select_r = getConfig(['point', 'focus', 'select', 'r'], 8),
            __point_onclick = getConfig(['point', 'onclick'], function () {}),
            __point_onselected = getConfig(['point', 'onselected'], function () {}),
            __point_onunselected = getConfig(['point', 'onunselected'], function () {});

        // arc
        var __arc_label_fomat = getConfig(['arc', 'label', 'format'], function (d, ratio) { return (100 * ratio).toFixed(1) + "%"; }),
            __arc_title = getConfig(['arc', 'title'], "");

        // region - region to change style
        var __regions = getConfig(['regions'], []);

        // tooltip - show when mouseover on each data
        var __tooltip_enabled = getConfig(['tooltip', 'enabled'], true),
            __tooltip_format_title = getConfig(['tooltip', 'format', 'title'], null),
            __tooltip_format_value = getConfig(['tooltip', 'format', 'value'], null),
            __tooltip_contents = getConfig(['tooltip', 'contents'], function (d, defaultTitleFormat, defaultValueFormat, color) {
            var titleFormat = __tooltip_format_title ? __tooltip_format_title : defaultTitleFormat,
                valueFormat = __tooltip_format_value ? __tooltip_format_value : defaultValueFormat,
                text, i, title, value, name;
            for (i = 0; i < d.length; i++) {
                if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

                if (! text) {
                    title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                    text = "<table class='-tooltip'><tr><th colspan='2'>" + title + "</th></tr>";
                }

                name = d[i].name;
                value = valueFormat(d[i].value);

                text += "<tr class='-tooltip-name-" + d[i].id + "'><td class='name'><span style='background-color:" + color(d[i].id) + "'></span>" + name + "</td><td class='value'>" + value + "</td></tr>";
            }
            return text + "</table>";
        }),
            __tooltip_init_show = getConfig(['tooltip', 'init', 'show'], false),
            __tooltip_init_x = getConfig(['tooltip', 'init', 'x'], 0),
            __tooltip_init_position = getConfig(['tooltip', 'init', 'position'], {top: '0px', left: '50px'});

        /*-- Set Variables --*/

        var clipId = __bindto.replace('#', '') + '-clip',
            clipPath = "url(" + document.URL + "#" + clipId + ")";

        var isTimeSeries = (__axis_x_type === 'timeseries'),
            isCategorized = (__axis_x_type === 'categorized'),
            isCustomX = !isTimeSeries && (__data_x || __data_xs);

        var dragStart = null, dragging = false, cancelClick = false;

        var color = generateColor(__data_colors, __color_pattern);

        var defaultTimeFormat = (function () {
            var formats = [
                [d3.time.format("%Y/%-m/%-d"), function () { return true; }],
                [d3.time.format("%-m/%-d"), function (d) { return d.getMonth(); }],
                [d3.time.format("%-m/%-d"), function (d) { return d.getDate() !== 1; }],
                [d3.time.format("%-m/%-d"), function (d) { return d.getDay() && d.getDate() !== 1; }],
                [d3.time.format("%I %p"), function (d) { return d.getHours(); }],
                [d3.time.format("%I:%M"), function (d) { return d.getMinutes(); }],
                [d3.time.format(":%S"), function (d) { return d.getSeconds(); }],
                [d3.time.format(".%L"), function (d) { return d.getMilliseconds(); }]
            ];
            return function (date) {
                var i = formats.length - 1, f = formats[i];
                while (!f[1](date)) { f = formats[--i]; }
                return f[0](date);
            };
        })();

        /*-- Set Chart Params --*/

        var margin, margin2, margin3, width, width2, height, height2, currentWidth, currentHeight, legendHeight, legendWidth;
        var radius, radiusExpanded, innerRadius, svgArc, svgArcExpanded, svgArcExpandedSub, pie;
        var xMin, xMax, yMin, yMax, subXMin, subXMax, subYMin, subYMax;
        var x, y, y2, subX, subY, subY2, xAxis, yAxis, yAxis2, subXAxis;

        var xOrient = __axis_rotated ? "left" : "bottom",
            yOrient = __axis_rotated ? (__axis_y_inner ? "top" : "bottom") : (__axis_y_inner ? "right" : "left"),
            y2Orient = __axis_rotated ? (__axis_y2_inner ? "bottom" : "top") : (__axis_y2_inner ? "left" : "right"),
            subXOrient = __axis_rotated ? "left" : "bottom";

        var translate = {
            main : function () { return "translate(" + margin.left + "," + margin.top + ")"; },
            context : function () { return "translate(" + margin2.left + "," + margin2.top + ")"; },
            legend : function () { return "translate(" + margin3.left + "," + margin3.top + ")"; },
            y2 : function () { return "translate(" + (__axis_rotated ? 0 : width) + "," + (__axis_rotated ? 1 : 0) + ")"; },
            x : function () { return "translate(0," + height + ")"; },
            subx : function () { return "translate(0," + (__axis_rotated ? 0 : height2) + ")"; },
            arc: function () { return "translate(" + width / 2 + "," + height / 2 + ")"; }
        };

        var isLegendRight = __legend_position === 'right';

        /*-- Define Functions --*/

        function transformMain() {
            main.attr("transform", translate.main);
            main.select('.x.axis').attr("transform", translate.x);
            main.select('.y2.axis').attr("transform", translate.y2);
            main.select('.chart-arcs').attr("transform", translate.arc);
        }
        function transformContext() {
            if (__subchart_show) {
                context.attr("transform", translate.context);
                context.select('.x.axis').attr("transform", translate.subx);
            }
        }
        function transformLegend(withTransition) {
            var duration = withTransition !== false ? 250 : 0;
            if (__legend_show) {
                legend.transition().duration(duration).attr("transform", translate.legend);
            }
        }
        function transformAll(withTransition) {
            transformMain(withTransition);
            transformContext(withTransition);
            transformLegend(withTransition);
        }

        //-- Sizes --//

        // TODO: configurabale
        var rotated_padding_left = 40, rotated_padding_right = 20;

        function updateSizes() {
            currentWidth = getCurrentWidth();
            currentHeight = getCurrentHeight();
            legendHeight = getLegendHeight();
            legendWidth = getLegendWidth();

            // for main
            margin = {
                top: __axis_rotated && __axis_y2_show ? 20 : 0,
                right: getCurrentPaddingRight(),
                bottom: 20 + (__axis_rotated ? 0 : __subchart_size_height) + (isLegendRight ? 0 : legendHeight),
                left: (__axis_rotated ? __subchart_size_height + rotated_padding_right : 0) + getCurrentPaddingLeft()
            };
            width = currentWidth - margin.left - margin.right;
            height = currentHeight - margin.top - margin.bottom;

            // for context
            margin2 = {
                top: __axis_rotated ? margin.top : (currentHeight - __subchart_size_height - (isLegendRight ? 0 : legendHeight)),
                right: NaN,
                bottom: 20 + (isLegendRight ? 0 : legendHeight),
                left: __axis_rotated ? rotated_padding_left : margin.left
            };
            width2 = __axis_rotated ? margin.left - rotated_padding_left - rotated_padding_right : width;
            height2 = __axis_rotated ? height : currentHeight - margin2.top - margin2.bottom;

            // for legend
            margin3 = {
                top: isLegendRight ? margin.top : currentHeight - legendHeight,
                right: NaN,
                bottom: 0,
                left: isLegendRight ? currentWidth - legendWidth : 0
            };

            // for arc
            updateRadius();

            if (isLegendRight && hasArcType(c3.data.targets)) {
                margin3.left = width / 2 + radiusExpanded;
            }
        }
        function updateRadius() {
            radiusExpanded = height / 2;
            radius = radiusExpanded * 0.95;
            innerRadius = hasDonutType(c3.data.targets) ? radius * 0.6 : 0;
        }
        function getSvgLeft() {
            var svgLeft = svg.property('offsetLeft');
            return svgLeft ? svgLeft : 0;
        }
        function getCurrentWidth() {
            return __size_width ? __size_width : getParentWidth();
        }
        function getCurrentHeight() {
            var h = __size_height ? __size_height : getParentHeight();
            return h > 0 ? h : 320;
        }
        function getCurrentPaddingLeft() {
            if (hasArcType(c3.data.targets)) {
                return 0;
            } else if (__padding_left) {
                return __padding_left;
            } else {
                return __axis_y_inner ? 1 : getDefaultPaddingWithAxisId('y');
            }
        }
        function getCurrentPaddingRight() {
            if (hasArcType(c3.data.targets)) {
                return 0;
            } else if (__padding_right) {
                return __padding_right;
            } else if (isLegendRight) {
                return legendWidth * (__axis_y2_show && !__axis_rotated ? 1.25 : 1);
            } else if (__axis_y2_show) {
                return __axis_y2_inner || __axis_rotated ? 1 : getDefaultPaddingWithAxisId('y2');
            } else {
                return 1;
            }
        }
        function getDefaultPaddingWithAxisId() {
            return 40; // TODO: calc automatically
        }
        function getParentWidth() {
            return +d3.select(__bindto).style("width").replace('px', ''); // TODO: if rotated, use height
        }
        function getParentHeight() {
            return +d3.select(__bindto).style('height').replace('px', ''); // TODO: if rotated, use width
        }
        function getXAxisClipWidth() {
            return width + 2;
        }
        function getXAxisClipHeight() {
            return 40;
        }
        function getYAxisClipWidth() {
            return margin.left + 20;
        }
        function getYAxisClipHeight() {
            return height + 2;
        }
        function getEventRectWidth() {
            var base = __axis_rotated ? height : width,
                ratio = getXDomainRatio(),
                maxDataCount = getMaxDataCount();
            return maxDataCount > 1 ? (base * ratio) / (maxDataCount - 1) : base;
        }
        function getLegendWidth() {
            return __legend_show ? isLegendRight ? 150 : currentWidth : 0;
        }
        function getLegendHeight() {
            return __legend_show ? isLegendRight ? currentHeight : 40 : 0;
        }

        //-- Scales --//

        function updateScales() {
            var xAxisTickFormat, xAxisTicks;
            // update edges
            xMin = __axis_rotated ? 1 : 0;
            xMax = __axis_rotated ? height : width;
            yMin = __axis_rotated ? 0 : height;
            yMax = __axis_rotated ? width : 1;
            subXMin = xMin;
            subXMax = xMax;
            subYMin = __axis_rotated ? 0 : height2;
            subYMax = __axis_rotated ? width2 : 1;
            // update scales
            x = getX(xMin, xMax, x ? x.domain() : undefined, function () { return xAxis.tickOffset(); });
            y = getY(yMin, yMax, y ? y.domain() : undefined);
            y2 = getY(yMin, yMax, y2 ? y2.domain() : undefined);
            subX = getX(xMin, xMax, orgXDomain, function (d) { return d % 1 ? 0 : subXAxis.tickOffset(); });
            subY = getY(subYMin, subYMax);
            subY2 = getY(subYMin, subYMax);
            // update axes
            xAxisTickFormat = getXAxisTickFormat();
            xAxisTicks = getXAxisTicks();
            xAxis = getXAxis(x, xOrient, xAxisTickFormat, xAxisTicks);
            subXAxis = getXAxis(subX, subXOrient, xAxisTickFormat, xAxisTicks);
            yAxis = getYAxis(y, yOrient, __axis_y_tick_format, __axis_y_ticks);
            yAxis2 = getYAxis(y2, y2Orient, __axis_y2_tick_format, __axis_y2_ticks);
            // update for arc
            updateArc();
        }
        function updateArc() {
            svgArc = getSvgArc();
            svgArcExpanded = getSvgArcExpanded();
            svgArcExpandedSub = getSvgArcExpanded(0.98);
        }
        function getX(min, max, domain, offset) {
            var scale = ((isTimeSeries) ? d3.time.scale() : d3.scale.linear()).range([min, max]);
            // Set function and values for c3
            scale.orgDomain = function () { return scale.domain(); };
            if (isDefined(domain)) { scale.domain(domain); }
            if (isUndefined(offset)) { offset = function () { return 0; }; }
            // Define customized scale if categorized axis
            if (isCategorized) {
                var _scale = scale, key;
                scale = function (d) { return _scale(d) + offset(d); };
                for (key in _scale) {
                    scale[key] = _scale[key];
                }
                scale.orgDomain = function () {
                    return _scale.domain();
                };
                scale.domain = function (domain) {
                    if (!arguments.length) {
                        domain = _scale.domain();
                        return [domain[0], domain[1] + 1];
                    }
                    _scale.domain(domain);
                    return scale;
                };
            }
            return scale;
        }
        function getY(min, max) {
            return d3.scale.linear().range([min, max]);
        }
        function getYScale(id) {
            return getAxisId(id) === 'y2' ? y2 : y;
        }
        function getSubYScale(id) {
            return getAxisId(id) === 'y2' ? subY2 : subY;
        }

        //-- Axes --//

        function getXAxis(scale, orient, tickFormat, ticks) {
            var axis = (isCategorized ? categoryAxis() : d3.svg.axis()).scale(scale).orient(orient);

            // Set tick
            axis.tickFormat(tickFormat).ticks(ticks);
            if (isCategorized) {
                axis.tickCentered(__axis_x_tick_centered);
            } else {
                axis.tickOffset = function () {
                    var base = __axis_rotated ? height : width;
                    return ((base * getXDomainRatio()) / getMaxDataCount()) / 2;
                };
            }

            // Set categories
            if (isCategorized) {
                axis.categories(__axis_x_categories);
            }

            return axis;
        }
        function getYAxis(scale, orient, tickFormat, ticks) {
            return d3.svg.axis().scale(scale).orient(orient).tickFormat(tickFormat).ticks(ticks).outerTickSize(0);
        }
        function getAxisId(id) {
            return id in __data_axes ? __data_axes[id] : 'y';
        }
        function getXAxisTickFormat() {
            var format = isTimeSeries ? defaultTimeFormat : isCategorized ? category : null;
            if (__axis_x_tick_format) {
                if (typeof __axis_x_tick_format === 'function') {
                    format = __axis_x_tick_format;
                } else if (isTimeSeries) {
                    format = function (date) { return d3.time.format(__axis_x_tick_format)(date); };
                }
            }
            return format;
        }
        function getXAxisTicks() {
            var maxDataCount = getMaxDataCount();
            return __axis_x_tick_culling && maxDataCount > __axis_x_tick_count ? __axis_x_tick_count : maxDataCount;
        }

        //-- Arc --//

        pie = d3.layout.pie().value(function (d) {
            return d.values.reduce(function (a, b) { return a + b.value; }, 0);
        });

        function updateAngle(d) {
            var found = false;
            pie(c3.data.targets).forEach(function (t) {
                if (! found && t.data.id === d.data.id) {
                    found = true;
                    d = t;
                    return;
                }
            });
            return found ? d : null;
        }

        function getSvgArc() {
            var arc = d3.svg.arc().outerRadius(radius).innerRadius(innerRadius),
                newArc = function (d, withoutUpdate) {
                    var updated;
                    if (withoutUpdate) { return arc(d); } // for interpolate
                    updated = updateAngle(d);
                    return updated ? arc(updated) : "M 0 0";
                };
            // TODO: extends all function
            newArc.centroid = arc.centroid;
            return newArc;
        }
        function getSvgArcExpanded(rate) {
            var arc = d3.svg.arc().outerRadius(radiusExpanded * (rate ? rate : 1)).innerRadius(innerRadius);
            return function (d) {
                var updated = updateAngle(d);
                return updated ? arc(updated) : "M 0 0";
            };
        }
        function getArc(d, withoutUpdate) {
            return isArcType(d.data) ? svgArc(d, withoutUpdate) : "M 0 0";
        }
        function transformForArcLable(d) {
            var updated = updateAngle(d), c, x, y, h, translate = "";
            if (updated) {
                c = svgArc.centroid(updated);
                x = c[0], y = c[1], h = Math.sqrt(x * x + y * y);
                translate = "translate(" + ((x / h) * radius * 0.8) +  ',' + ((y / h) * radius * 0.8) +  ")";
            }
            return translate;
        }
        function getArcRatio(d) {
            return (d.endAngle - d.startAngle) / (Math.PI * 2);
        }
        function textForArcLable(d) {
            return __arc_label_fomat(d, getArcRatio(d));
        }
        function expandArc(id, withoutFadeOut) {
            var target = svg.selectAll('.chart-arc' + getTargetSelector(id)),
                noneTargets = svg.selectAll('.-arc').filter(function (data) { return data.data.id !== id; });
            target.selectAll('path')
              .transition().duration(50)
                .attr("d", svgArcExpanded)
              .transition().duration(100)
                .attr("d", svgArcExpandedSub)
                .each(function (d) {
                    if (isDonutType(d.data)) {
                        // callback here
                    }
                });
            if (!withoutFadeOut) {
                noneTargets.style("opacity", 0.3);
            }
        }
        function unexpandArc(id) {
            var target = svg.selectAll('.chart-arc' + getTargetSelector(id));
            target.selectAll('path')
              .transition().duration(50)
                .attr("d", svgArc);
            svg.selectAll('.-arc')
                .style("opacity", 1);
        }

        //-- Domain --//

        function getYDomainMin(targets) {
            var ys = getValuesAsIdKeyed(targets), j, k, baseId, id, hasNegativeValue;
            if (__data_groups.length > 0) {
                hasNegativeValue = hasNegativeValueInTargets(targets);
                for (j = 0; j < __data_groups.length; j++) {
                    baseId = __data_groups[j][0];
                    if (hasNegativeValue && ys[baseId]) {
                        ys[baseId].forEach(function (v, i) {
                            ys[baseId][i] = v < 0 ? v : 0;
                        });
                    }
                    for (k = 1; k < __data_groups[j].length; k++) {
                        id = __data_groups[j][k];
                        if (! ys[id]) { continue; }
                        ys[id].forEach(function (v, i) {
                            if (getAxisId(id) === getAxisId(baseId) && ys[baseId] && !(hasNegativeValue && +v > 0)) {
                                ys[baseId][i] += +v;
                            }
                        });
                    }
                }
            }
            return d3.min(Object.keys(ys).map(function (key) { return d3.min(ys[key]); }));
        }
        function getYDomainMax(targets) {
            var ys = getValuesAsIdKeyed(targets), j, k, baseId, id, hasPositiveValue;
            if (__data_groups.length > 0) {
                hasPositiveValue = hasPositiveValueInTargets(targets);
                for (j = 0; j < __data_groups.length; j++) {
                    baseId = __data_groups[j][0];
                    if (hasPositiveValue && ys[baseId]) {
                        ys[baseId].forEach(function (v, i) {
                            ys[baseId][i] = v > 0 ? v : 0;
                        });
                    }
                    for (k = 1; k < __data_groups[j].length; k++) {
                        id = __data_groups[j][k];
                        if (! ys[id]) { continue; }
                        ys[id].forEach(function (v, i) {
                            if (getAxisId(id) === getAxisId(baseId) && ys[baseId] && !(hasPositiveValue && +v < 0)) {
                                ys[baseId][i] += +v;
                            }
                        });
                    }
                }
            }
            return d3.max(Object.keys(ys).map(function (key) { return d3.max(ys[key]); }));
        }
        function getYDomain(axisId) {
            var yTargets = getTargets(function (d) { return getAxisId(d.id) === axisId; }),
                yMin = axisId === 'y2' ? __axis_y2_min : __axis_y_min,
                yMax = axisId === 'y2' ? __axis_y2_max : __axis_y_max,
                yDomainMin = (yMin) ? yMin : getYDomainMin(yTargets),
                yDomainMax = (yMax) ? yMax : getYDomainMax(yTargets),
                padding = Math.abs(yDomainMax - yDomainMin) * 0.22, //0.1 -> 0.22 - 23.2.2014 - fiery-
                padding_top = padding, padding_bottom = padding,
                center = axisId === 'y2' ? __axis_y2_center : __axis_y_center;
            if (center) {
                var yDomainAbs = Math.max(Math.abs(yDomainMin), Math.abs(yDomainMax));
                yDomainMax = yDomainAbs - center;
                yDomainMin = center - yDomainAbs;
            }
            if (axisId === 'y' && __axis_y_padding) {
                padding_top = isValue(__axis_y_padding.top) ? __axis_y_padding.top : padding;
                padding_bottom = isValue(__axis_y_padding.bottom) ? __axis_y_padding.bottom : padding;
            }
            if (axisId === 'y2' && __axis_y2_padding) {
                padding_top = isValue(__axis_y2_padding.top) ? __axis_y2_padding.top : padding;
                padding_bottom = isValue(__axis_y2_padding.bottom) ? __axis_y2_padding.bottom : padding;
            }
            // Bar chart with only positive values should be 0-based
            if (hasBarType(yTargets) && !hasNegativeValueInTargets(yTargets)) {
                padding_bottom = yDomainMin;
            }
            return [yDomainMin - padding_bottom, yDomainMax + padding_top];
        }
        function getXDomainRatio(isSub) {
            return isSub ? 1 : diffDomain(orgXDomain) / diffDomain(x.domain());
        }
        function getXDomainMin(targets) {
            return d3.min(targets, function (t) { return d3.min(t.values, function (v) { return v.x; }); });
        }
        function getXDomainMax(targets) {
            return d3.max(targets, function (t) { return d3.max(t.values, function (v) { return v.x; }); });
        }
        function getXDomainPadding(targets, domain) {
            var firstX = domain[0], lastX = domain[1], diff = Math.abs(firstX - lastX), padding;
            if (isCategorized) {
                padding = 0;
            } else if (hasBarType(targets)) {
                padding = (diff / (getMaxDataCount() - 1)) / 2;
            } else {
                padding = diff * 0.01;
            }
            return padding;
        }
        function getXDomain(targets) {
            var xDomain = [getXDomainMin(targets), getXDomainMax(targets)],
                firstX = xDomain[0], lastX = xDomain[1],
                padding = getXDomainPadding(targets, xDomain),
                min = isTimeSeries ? new Date(firstX.getTime() - padding) : firstX - padding,
                max = isTimeSeries ? new Date(lastX.getTime() + padding) : lastX + padding;
            return [min, max];
        }
        function diffDomain(d) {
            return d[1] - d[0];
        }

        //-- Cache --//

        function hasCaches(ids) {
            for (var i = 0; i < ids.length; i++) {
                if (! (ids[i] in cache)) { return false; }
            }
            return true;
        }
        function addCache(id, target) {
            cache[id] = cloneTarget(target);
        }
        function getCaches(ids) {
            var targets = [];
            for (var i = 0; i < ids.length; i++) {
                if (ids[i] in cache) { targets.push(cloneTarget(cache[ids[i]])); }
            }
            return targets;
        }

        //-- Regions --//

        function regionStart(d) {
            return ('start' in d) ? x(isTimeSeries ? parseDate(d.start) : d.start) : 0;
        }

        function regionWidth(d) {
            var start = regionStart(d),
                end = ('end' in d) ? x(isTimeSeries ? parseDate(d.end) : d.end) : width,
                w = end - start;
            return (w < 0) ? 0 : w;
        }

        //-- Data --//

        function isX(key) {
            return (__data_x && key === __data_x) || (__data_xs && hasValue(__data_xs, key));
        }
        function isNotX(key) {
            return !isX(key);
        }
        function getXKey(id) {
            return __data_x ? __data_x : __data_xs ? __data_xs[id] : null;
        }
        function getXValue(id, i) {
            return id in c3.data.x && c3.data.x[id] && c3.data.x[id][i] ? c3.data.x[id][i] : i;
        }
        function addXs(xs) {
            Object.keys(xs).forEach(function (id) {
                __data_xs[id] = xs[id];
            });
        }

        function addName(data) {
            var name;
            if (data) {
                name = __data_names[data.id];
                data.name = name ? name : data.id;
            }
            return data;
        }

        function convertRowsToData(rows) {
            var keys = rows[0], new_row = {}, new_rows = [], i, j;
            for (i = 1; i < rows.length; i++) {
                new_row = {};
                for (j = 0; j < rows[i].length; j++) {
                    new_row[keys[j]] = rows[i][j];
                }
                new_rows.push(new_row);
            }
            return new_rows;
        }
        function convertColumnsToData(columns) {
            var new_rows = [], i, j, key;
            for (i = 0; i < columns.length; i++) {
                key = columns[i][0];
                for (j = 1; j < columns[i].length; j++) {
                    if (isUndefined(new_rows[j - 1])) {
                        new_rows[j - 1] = {};
                    }
                    new_rows[j - 1][key] = columns[i][j];
                }
            }
            return new_rows;
        }
        function convertDataToTargets(data) {
            var ids = d3.keys(data[0]).filter(isNotX), xs = d3.keys(data[0]).filter(isX), targets;

            // check "x" is defined if timeseries
            if (isTimeSeries && xs.length === 0) {
                window.alert('data.x or data.xs must be specified when axis.x.type == "timeseries"');
                return [];
            }

            // save x for update data by load
            if (isCustomX) {
                ids.forEach(function (id) {
                    var xKey = getXKey(id);
                    if (xs.indexOf(xKey) >= 0) {
                        c3.data.x[id] = data.map(function (d) { return d[xKey]; });
                    } else { // if no x included, use same x of current will be used
                        c3.data.x[id] = c3.data.x[Object.keys(c3.data.x)[0]];
                    }
                });
            }

            // convert to target
            targets = ids.map(function (id) {
                var convertedId = __data_id_converter(id);
                return {
                    id: convertedId,
                    id_org: id,
                    values: data.map(function (d, i) {
                        var x, xKey = getXKey(id);

                        if (isTimeSeries) {
                            x = parseDate(d[xKey]);
                        }
                        else if (isCustomX) {
                            x = d[xKey] ? +d[xKey] : getXValue(id, i);
                        }
                        else {
                            x = i;
                        }
                        d.x = x; // used by event-rect

                        return {x: x, value: d[id] !== null && !isNaN(d[id]) ? +d[id] : null, id: convertedId};
                    })
                };
            });

            // finish targets
            targets.forEach(function (t) {
                var i;
                // sort values by its x
                t.values = t.values.sort(function (v1, v2) {
                    var x1 = v1.x || v1.x === 0 ? v1.x : Infinity,
                        x2 = v2.x || v2.x === 0 ? v2.x : Infinity;
                    return x1 - x2;
                });
                // indexing each value
                i = 0;
                t.values.forEach(function (v) {
                    v.index = i++;
                });
            });

            // set target types
            if (__data_type) {
                setTargetType(getTargetIds(targets).filter(function (id) { return ! (id in __data_types); }), __data_type);
            }

            // cache as original id keyed
            targets.forEach(function (d) {
                addCache(d.id_org, d);
            });

            return targets;
        }
        function cloneTarget(target) {
            return {
                id : target.id,
                id_org : target.id_org,
                values : target.values.map(function (d) {
                    return {x: d.x, value: d.value, id: d.id};
                })
            };
        }
        function getPrevX(i) {
            return i > 0 && c3.data.targets[0].values[i - 1] ? c3.data.targets[0].values[i - 1].x : undefined;
        }
        function getNextX(i) {
            return i < getMaxDataCount() - 1 ? c3.data.targets[0].values[i + 1].x : undefined;
        }
        function getMaxDataCount() {
            return d3.max(c3.data.targets, function (t) { return t.values.length; });
        }
        function getMaxDataCountTarget() {
            var length = c3.data.targets.length, max = 0, maxTarget;
            if (length > 1) {
                c3.data.targets.forEach(function (t) {
                    if (t.values.length > max) {
                        maxTarget = t;
                        max = t.values.length;
                    }
                });
            } else {
                maxTarget = length ? c3.data.targets[0] : null;
            }
            return maxTarget;
        }
        function getTargetIds(targets) {
            targets = isUndefined(targets) ? c3.data.targets : targets;
            return targets.map(function (d) { return d.id; });
        }
        function hasTarget(id) {
            var ids = getTargetIds(), i;
            for (i = 0; i < ids.length; i++) {
                if (ids[i] === id) {
                    return true;
                }
            }
            return false;
        }
        function getTargets(filter) {
            return isDefined(filter) ? c3.data.targets.filter(filter) : c3.data.targets;
        }
        function getValuesAsIdKeyed(targets) {
            var ys = {};
            targets.forEach(function (t) {
                ys[t.id] = [];
                t.values.forEach(function (v) {
                    ys[t.id].push(v.value);
                });
            });
            return ys;
        }
        function checkValueInTargets(targets, checker) {
            var ids = Object.keys(targets), i, j, values;
            for (i = 0; i < ids.length; i++) {
                values = targets[ids[i]].values;
                for (j = 0; j < values.length; j++) {
                    if (checker(values[j].value)) {
                        return true;
                    }
                }
            }
            return false;
        }
        function hasNegativeValueInTargets(targets) {
            return checkValueInTargets(targets, function (v) { return v < 0; });
        }
        function hasPositiveValueInTargets(targets) {
            return checkValueInTargets(targets, function (v) { return v > 0; });
        }
        function category(i) {
            return i < __axis_x_categories.length ? __axis_x_categories[i] : i;
        }
        function classText(d) { return "-text -text-" + d.id; }
        function classTexts(d) { return "-texts -texts-" + d.id; }
        function classShapes(d) { return "-shapes -shapes-" + d.id; }
        function classLine(d) { return classShapes(d) + " -line -line-" + d.id; }
        function classCircles(d) { return classShapes(d) + " -circles -circles-" + d.id; }
        function classBars(d) { return classShapes(d) + " -bars -bars-" + d.id; }
        function classArc(d) { return classShapes(d.data) + " -arc -arc-" + d.data.id; }
        function classArea(d) { return classShapes(d) + " -area -area-" + d.id; }
        function classShape(d, i) { return "-shape -shape-" + i; }
        function classCircle(d, i) { return classShape(d, i) + " -circle -circle-" + i; }
        function classBar(d, i) { return classShape(d, i) + " -bar -bar-" + i; }
        function classRegion(d, i) { return 'region region-' + i + ' ' + ('classes' in d ? [].concat(d.classes).join(' ') : ''); }
        function classEvent(d, i) { return "event-rect event-rect-" + i; }

        function initialOpacity(d) {
            return withoutFadeIn[d.id] ? 1 : 0;
        }
        function initialOpacityForText(d) {
            var targetOpacity = opacityForText(d);
            return initialOpacity(d) * targetOpacity;
        }
        function opacityForCircle(d) {
            return isValue(d.value) ? isScatterType(d) ? 0.5 : 1 : 0;
        }
        function opacityForText(d) {
            if (typeof __data_labels === 'boolean' && __data_labels) {
                return 1;
            } else if (__data_labels[d.id] === 'boolean' && __data_labels[d.id]) {
                return 1;
            } else if (__data_labels[d.id] && __data_labels[d.id].show) {
                return 1;
            }
            return 0;
        }

        function xx(d) {
            return d ? x(d.x) : null;
        }
        function xv(d) {
            return x(isTimeSeries ? parseDate(d.value) : d.value);
        }
        function yv(d) {
            return y(d.value);
        }
        function subxx(d) {
            return subX(d.x);
        }
        function defaultValueFormat(v) {
            var yFormat = __axis_y_tick_format ? __axis_y_tick_format : function (v) { return +v; };
            return yFormat(v);
        }

        function findSameXOfValues(values, index) {
            var i, targetX = values[index].x, sames = [];
            for (i = index - 1; i >= 0; i--) {
                if (targetX !== values[i].x) { break; }
                sames.push(values[i]);
            }
            for (i = index; i < values.length; i++) {
                if (targetX !== values[i].x) { break; }
                sames.push(values[i]);
            }
            return sames;
        }

        function findClosestOfValues(values, pos, _min, _max) { // MEMO: values must be sorted by x
            var min = _min ? _min : 0,
                max = _max ? _max : values.length - 1,
                med = Math.floor((max - min) / 2) + min,
                value = values[med],
                diff = x(value.x) - pos[0],
                candidates;

            // Update range for search
            diff > 0 ? max = med : min = med;

            // if candidates are two closest min and max, stop recursive call
            if ((max - min) === 1) {

                // Get candidates that has same min and max index
                candidates = [];
                if (values[min].x) {
                    candidates = candidates.concat(findSameXOfValues(values, min));
                }
                if (values[max].x) {
                    candidates = candidates.concat(findSameXOfValues(values, max));
                }

                // Determine the closest and return
                return findClosest(candidates, pos);
            }

            return findClosestOfValues(values, pos, min, max);
        }
        function findClosestFromTargets(targets, pos) {
            var candidates;

            // map to array of closest points of each target
            candidates = targets.map(function (target) {
                return findClosestOfValues(target.values, pos);
            });

            // decide closest point and return
            return findClosest(candidates, pos);
        }
        function findClosest(values, pos) {
            var minDist, closest;
            values.forEach(function (v) {
                var d = dist(v, pos);
                if (d < minDist || ! minDist) {
                    minDist = d;
                    closest = v;
                }
            });
            return closest;
        }

        function isOrderDesc() {
            return __data_order && __data_order.toLowerCase() === 'desc';
        }
        function isOrderAsc() {
            return __data_order && __data_order.toLowerCase() === 'asc';
        }
        function orderTargets(targets) {
            var orderAsc = isOrderAsc(), orderDesc = isOrderDesc();
            if (orderAsc || orderDesc) {
                targets.sort(function (t1, t2) {
                    var reducer = function (p, c) { return p + Math.abs(c.value); };
                    var t1Sum = t1.values.reduce(reducer, 0),
                        t2Sum = t2.values.reduce(reducer, 0);
                    return orderAsc ? t2Sum - t1Sum : t1Sum - t2Sum;
                });
            } else if (typeof __data_order === 'function') {
                targets.sort(__data_order);
            } // TODO: accept name array for order
            return targets;
        }

        //-- Tooltip --//

        function showTooltip(selectedData, mouse) {
            var tWidth, tHeight;
            var svgLeft, tooltipLeft, tooltipRight, tooltipTop, chartRight;
            var dataToShow = selectedData.filter(function (d) { return d && isValue(d.value); });
            if (! __tooltip_enabled) { return; }
            // don't show tooltip when no data
            if (dataToShow.length === 0) { return; }
            // Construct tooltip
            tooltip.html(__tooltip_contents(selectedData, getXAxisTickFormat(), defaultValueFormat, color))
                .style("visibility", "hidden")
                .style("display", "block");
            // Get tooltip dimensions
            tWidth = tooltip.property('offsetWidth');
            tHeight = tooltip.property('offsetHeight');
            // Determin tooltip position
            if (__axis_rotated) {
                tooltipLeft = mouse[0] + 100;
                tooltipRight = tooltipLeft + tWidth;
                chartRight = getCurrentWidth() - getCurrentPaddingRight();
                tooltipTop = x(dataToShow[0].x) + 20;
            } else {
                svgLeft = getSvgLeft();
                tooltipLeft = svgLeft + getCurrentPaddingLeft() + x(dataToShow[0].x) + 20;
                tooltipRight = tooltipLeft + tWidth;
                chartRight = svgLeft + getCurrentWidth() - getCurrentPaddingRight();
                tooltipTop = mouse[1] + 15;
            }
            if (tooltipRight > chartRight) {
                tooltipLeft -= tWidth + 60;
            }
            if (tooltipTop + tHeight > getCurrentHeight()) {
                tooltipTop -= tHeight + 30;
            }
            // Set tooltip
            // todo get rid of magic numbers
            tooltip
                .style("top", tooltipTop + "px")
                .style("left", tooltipLeft + 'px')
                .style("visibility", "visible");
        }
        function hideTooltip() {
            tooltip.style("display", "none");
        }

        function showXGridFocus(selectedData) {
            var dataToShow = selectedData.filter(function (d) { return d && isValue(d.value); });
            if (! __tooltip_enabled) { return; }
            // Hide when scatter plot exists
            if (hasScatterType(c3.data.targets) || hasArcType(c3.data.targets)) { return; }
            main.selectAll('line.xgrid-focus')
                .style("visibility", "visible")
                .data([dataToShow[0]])
                .attr(__axis_rotated ? 'y1' : 'x1', xx)
                .attr(__axis_rotated ? 'y2' : 'x2', xx);
        }
        function hideXGridFocus() {
            main.select('line.xgrid-focus').style("visibility", "hidden");
        }

        //-- Circle --//

        function circleX(d) {
            return d.x || d.x === 0 ? x(d.x) : null;
        }
        function circleY(d) {
            return getYScale(d.id)(d.value);
        }

        //-- Bar --//

        function getBarIndices() {
            var indices = {}, i = 0, j, k;
            getTargets(isBarType).forEach(function (d) {
                for (j = 0; j < __data_groups.length; j++) {
                    if (__data_groups[j].indexOf(d.id) < 0) { continue; }
                    for (k = 0; k < __data_groups[j].length; k++) {
                        if (__data_groups[j][k] in indices) {
                            indices[d.id] = indices[__data_groups[j][k]];
                            break;
                        }
                    }
                }
                if (isUndefined(indices[d.id])) { indices[d.id] = i++; }
            });
            indices.__max__ = i - 1;
            return indices;
        }
        function getBarX(barW, barTargetsNum, barIndices, isSub) {
            var scale = isSub ? subX : x;
            return function (d) {
                var barIndex = d.id in barIndices ? barIndices[d.id] : 0;
                return d.x || d.x === 0 ? scale(d.x) - barW * (barTargetsNum / 2 - barIndex) : 0;
            };
        }
        function getBarY(isSub) {
            return function (d) {
                var scale = isSub ? getSubYScale(d.id) : getYScale(d.id);
                return scale(d.value);
            };
        }
        function getBarOffset(barIndices, isSub) {
            var targets = orderTargets(getTargets(isBarType)),
                targetIds = targets.map(function (t) { return t.id; });
            return function (d, i) {
                var scale = isSub ? getSubYScale(d.id) : getYScale(d.id),
                    y0 = scale(0), offset = y0;
                targets.forEach(function (t) {
                    if (t.id === d.id || barIndices[t.id] !== barIndices[d.id]) { return; }
                    if (targetIds.indexOf(t.id) < targetIds.indexOf(d.id) && t.values[i].value * d.value > 0) {
                        offset += scale(t.values[i].value) - y0;
                    }
                });
                return offset;
            };
        }
        function getBarW(axis, barTargetsNum) {
            return barTargetsNum ? (axis.tickOffset() * 2 * 0.6) / barTargetsNum : 0;
        }

        //-- Type --//

        function setTargetType(targets, type) {
            var targetIds = isUndefined(targets) ? getTargetIds() : targets;
            if (typeof targetIds === 'string') { targetIds = [targetIds]; }
            for (var i = 0; i < targetIds.length; i++) {
                withoutFadeIn[targetIds[i]] = (type === __data_types[targetIds[i]]);
                __data_types[targetIds[i]] = type;
            }
        }
        function hasType(targets, type) {
            var has = false;
            targets.forEach(function (t) {
                if (__data_types[t.id] === type) { has = true; }
                if (!(t.id in __data_types) && type === 'line') { has = true; }
            });
            return has;
        }

        /* not used
        function hasLineType(targets) {
            return hasType(targets, 'line');
        }
        */
        function hasBarType(targets) {
            return hasType(targets, 'bar');
        }
        function hasScatterType(targets) {
            return hasType(targets, 'scatter');
        }
        function hasPieType(targets) {
            return hasType(targets, 'pie');
        }
        function hasDonutType(targets) {
            return hasType(targets, 'donut');
        }
        function hasArcType(targets) {
            return hasPieType(targets) || hasDonutType(targets);
        }
        function isLineType(d) {
            var id = (typeof d === 'string') ? d : d.id;
            return !(id in __data_types) || __data_types[id] === 'line' || __data_types[id] === 'spline' || __data_types[id] === 'area' || __data_types[id] === 'area-spline';
        }
        function isSplineType(d) {
            var id = (typeof d === 'string') ? d : d.id;
            return __data_types[id] === 'spline' || __data_types[id] === 'area-spline';
        }
        function isBarType(d) {
            var id = (typeof d === 'string') ? d : d.id;
            return __data_types[id] === 'bar';
        }
        function isScatterType(d) {
            var id = (typeof d === 'string') ? d : d.id;
            return __data_types[id] === 'scatter';
        }
        function isPieType(d) {
            var id = (typeof d === 'string') ? d : d.id;
            return __data_types[id] === 'pie';
        }
        function isDonutType(d) {
            var id = (typeof d === 'string') ? d : d.id;
            return __data_types[id] === 'donut';
        }
        function isArcType(d) {
            return isPieType(d) || isDonutType(d);
        }
        /* not used
        function lineData(d) {
            return isLineType(d) ? d.values : [];
        }
        function scatterData(d) {
            return isScatterType(d) ? d.values : [];
        }
        */
        function barData(d) {
            return isBarType(d) ? d.values : [];
        }
        function lineOrScatterData(d) {
            return isLineType(d) || isScatterType(d) ? d.values : [];
        }
        function barOrLineData(d) {
            return isBarType(d) || isLineType(d) ? d.values : [];
        }

        //-- Color --//

        function generateColor(_colors, _pattern) {
            var ids = [],
                colors = _colors,
                pattern = (_pattern !== null) ? _pattern : ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']; //same as d3.scale.category10()

            return function (id) {
                // if specified, choose that color
                if (id in colors) { return _colors[id]; }

                // if not specified, choose from pattern
                if (ids.indexOf(id) === -1) {
                    ids.push(id);
                }
                return pattern[ids.indexOf(id) % pattern.length];
            };
        }

        //-- Date --//

        function parseDate(date) {
            var parsedDate;
            if (!date) { throw Error(date + " can not be parsed as d3.time with format " + __data_x_format + ". Maybe 'x' of this data is not defined. See data.x or data.xs option."); }
            parsedDate = d3.time.format(__data_x_format).parse(date);
            if (!parsedDate) { throw Error("Failed to parse '" + date + "' with format " + __data_x_format); }
            return parsedDate;
        }

        //-- Util --//

        function isWithinCircle(_this, _r) {
            var mouse = d3.mouse(_this), d3_this = d3.select(_this);
            var cx = d3_this.attr("cx") * 1, cy = d3_this.attr("cy") * 1;
            return Math.sqrt(Math.pow(cx - mouse[0], 2) + Math.pow(cy - mouse[1], 2)) < _r;
        }
        function isWithinBar(_this) {
            var mouse = d3.mouse(_this), d3_this = d3.select(_this);
            var x = d3_this.attr("x") * 1, y = d3_this.attr("y") * 1, w = d3_this.attr("width") * 1;
            var sx = x - 10, ex = x + w + 10, ey = y - 10;
            return sx < mouse[0] && mouse[0] < ex && ey < mouse[1];
        }
        function isWithinRegions(x, regions) {
            var i;
            for (i = 0; i < regions.length; i++) {
                if (regions[i].start < x && x <= regions[i].end) { return true; }
            }
            return false;
        }

        function hasValue(dict, value) {
            var found = false;
            Object.keys(dict).forEach(function (key) {
                if (dict[key] === value) { found = true; }
            });
            return found;
        }

        function dist(data, pos) {
            return Math.pow(x(data.x) - pos[0], 2) + Math.pow(y(data.value) - pos[1], 2);
        }

        //-- Selection --//

        function selectPoint(target, d, i) {
            __point_onselected(target, d);
            // add selected-circle on low layer g
            main.select(".selected-circles-" + d.id).selectAll('.selected-circle-' + i)
                .data([d])
              .enter().append('circle')
                .attr("class", function () { return "selected-circle selected-circle-" + i; })
                .attr("cx", __axis_rotated ? circleY : circleX)
                .attr("cy", __axis_rotated ? circleX : circleY)
                .attr("stroke", function () { return color(d.id); })
                .attr("r", __point_select_r * 1.4)
              .transition().duration(100)
                .attr("r", __point_select_r);
        }
        function unselectPoint(target, d, i) {
            __point_onunselected(target, d);
            // remove selected-circle from low layer g
            main.select(".selected-circles-" + d.id).selectAll(".selected-circle-" + i)
              .transition().duration(100).attr('r', 0)
                .remove();
        }
        function togglePoint(selected, target, d, i) {
            (selected) ? selectPoint(target, d, i) : unselectPoint(target, d, i);
        }

        function selectBar() {
        }
        function unselectBar() {
        }
        function toggleBar(selected, target, d, i) {
            (selected) ? selectBar(target, d, i) : unselectBar(target, d, i);
        }

        function filterRemoveNull(data) {
            return data.filter(function (d) { return isValue(d.value); });
        }

        //-- Shape --//

        function getCircles(i, id) {
            return (id ? main.selectAll('.-circles-' + id) : main).selectAll('.-circle' + (isValue(i) ? '-' + i : ''));
        }
        function expandCircles(i, id) {
            getCircles(i, id)
                .classed(EXPANDED, true)
                .attr('r', __point_focus_expand_r);
        }
        function unexpandCircles(i) {
            getCircles(i)
                .filter(function () { return d3.select(this).classed(EXPANDED); })
                .classed(EXPANDED, false)
                .attr('r', __point_r);
        }
        function getBars(i) {
            return main.selectAll(".-bar" + (isValue(i) ? '-' + i : ''));
        }
        function expandBars(i) {
            getBars(i).classed(EXPANDED, false);
        }
        function unexpandBars(i) {
            getBars(i).classed(EXPANDED, false);
        }

        // For main region
        var lineOnMain = (function () {
            var line = d3.svg.line()
                .x(__axis_rotated ? function (d) { return getYScale(d.id)(d.value); } : xx)
                .y(__axis_rotated ? xx : function (d) { return getYScale(d.id)(d.value); });
            return function (d) {
                var data = filterRemoveNull(d.values), x0, y0;
                if (isLineType(d)) {
                    isSplineType(d) ? line.interpolate("cardinal") : line.interpolate("linear");
                    return __data_regions[d.id] ? lineWithRegions(data, x, getYScale(d.id), __data_regions[d.id]) : line(data);
                } else {
                    x0 = x(data[0].x);
                    y0 = getYScale(d.id)(data[0].value);
                    return __axis_rotated ? "M " + y0 + " " + x0 : "M " + x0 + " " + y0;
                }
            };
        })();

        var areaOnMain = (function () {
            var area;

            if (__axis_rotated) {
                area = d3.svg.area()
                    .x0(function (d) { return getYScale(d.id)(0); })
                    .x1(function (d) { return getYScale(d.id)(d.value); })
                    .y(xx);
            } else {
                area = d3.svg.area()
                    .x(xx)
                    .y0(function (d) { return getYScale(d.id)(0); })
                    .y1(function (d) { return getYScale(d.id)(d.value); });
            }

            return function (d) {
                var data = filterRemoveNull(d.values), x0, y0;

                if (hasType([d], 'area') || hasType([d], 'area-spline')) {
                    isSplineType(d) ? area.interpolate("cardinal") : area.interpolate("linear");
                    return area(data);
                } else {
                    x0 = x(data[0].x);
                    y0 = getYScale(d.id)(data[0].value);
                    return __axis_rotated ? "M " + y0 + " " + x0 : "M " + x0 + " " + y0;
                }
            };
        })();

        function generateDrawBar(barIndices, isSub) {
            var getPoints = generateGetBarPoints(barIndices, isSub);
            return function (d, i) {
                // 4 points that make a bar
                var points = getPoints(d, i);

                // switch points if axis is rotated, not applicable for sub chart
                var indexX = __axis_rotated ? 1 : 0;
                var indexY = __axis_rotated ? 0 : 1;

                var path = 'M ' + points[0][indexX] + ',' + points[0][indexY] + ' ' +
                        'L' + points[1][indexX] + ',' + points[1][indexY] + ' ' +
                        'L' + points[2][indexX] + ',' + points[2][indexY] + ' ' +
                        'L' + points[3][indexX] + ',' + points[3][indexY] + ' ' +
                        'z';

                return path;
            };
        }
        function generateXYForText(barIndices, forX) {
            var getPoints = generateGetBarPoints(barIndices, false),
                getter = forX ? getXForText : getYForText;
            return function (d, i) {
                return getter(getPoints(d, i), d, this);
            };
        }
        function getXForText(points, d) {
            var padding;
            if (__axis_rotated) {
                padding = isBarType(d) ? 4 : 6;
                return points[2][1] + padding * (d.value < 0 ? -1 : 1);
            } else {
                return points[0][0] + (points[2][0] - points[0][0]) / 2;
            }
        }
        function getYForText(points, d, textElement) {
            var box = textElement.getBBox();
            if (__axis_rotated) {
                return (points[0][0] + points[2][0] + box.height * 0.6) / 2;
            } else {
                return points[2][1] + (d.value < 0 ? box.height : isBarType(d) ? -3 : -6);
            }
        }

        function generateGetBarPoints(barIndices, isSub) {
            var barTargetsNum = barIndices.__max__ + 1,
                barW = getBarW(xAxis, barTargetsNum),
                x = getBarX(barW, barTargetsNum, barIndices, !!isSub),
                y = getBarY(!!isSub),
                barOffset = getBarOffset(barIndices, !!isSub),
                yScale = isSub ? getSubYScale : getYScale;
            return function (d, i) {
                var y0 = yScale(d.id)(0),
                    offset = barOffset(d, i) || y0; // offset is for stacked bar chart
                // 4 points that make a bar
                return [
                    [x(d), offset],
                    [x(d), y(d) - (y0 - offset)],
                    [x(d) + barW, y(d) - (y0 - offset)],
                    [x(d) + barW, offset]
                ];
            };
        }

        // For brush region
        var lineOnSub = (function () {
            var line = d3.svg.line()
                .x(__axis_rotated ? function (d) { return getSubYScale(d.id)(d.value); } : subxx)
                .y(__axis_rotated ? subxx : function (d) { return getSubYScale(d.id)(d.value); });
            return function (d) {
                var data = filterRemoveNull(d.values);
                return isLineType(d) ? line(data) : "M " + subX(data[0].x) + " " + getSubYScale(d.id)(data[0].value);
            };
        })();

        function lineWithRegions(d, x, y, _regions) {
            var prev = -1, i, j;
            var s = "M", sWithRegion;
            var xp, yp, dx, dy, dd, diff;
            var xValue, yValue;
            var regions = [];

            // Check start/end of regions
            if (isDefined(_regions)) {
                for (i = 0; i < _regions.length; i++) {
                    regions[i] = {};
                    if (isUndefined(_regions[i].start)) {
                        regions[i].start = d[0].x;
                    } else {
                        regions[i].start = isTimeSeries ? parseDate(_regions[i].start) : _regions[i].start;
                    }
                    if (isUndefined(_regions[i].end)) {
                        regions[i].end = d[d.length - 1].x;
                    } else {
                        regions[i].end = isTimeSeries ? parseDate(_regions[i].end) : _regions[i].end;
                    }
                }
            }

            // Set scales
            xValue = __axis_rotated ? function (d) { return y(d.value); } : function (d) { return x(d.x); };
            yValue = __axis_rotated ? function (d) { return x(d.x); } : function (d) { return y(d.value); };

            // Define svg generator function for region
            if (isTimeSeries) {
                sWithRegion = function (d0, d1, j, diff) {
                    var x0 = d0.x.getTime(), x_diff = d1.x - d0.x,
                        xv0 = new Date(x0 + x_diff * j),
                        xv1 = new Date(x0 + x_diff * (j + diff));
                    return "M" + x(xv0) + " " + y(yp(j)) + " " + x(xv1) + " " + y(yp(j + diff));
                };
            } else {
                sWithRegion = function (d0, d1, j, diff) {
                    return "M" + x(xp(j)) + " " + y(yp(j)) + " " + x(xp(j + diff)) + " " + y(yp(j + diff));
                };
            }

            // Generate
            for (i = 0; i < d.length; i++) {
                // Draw as normal
                if (isUndefined(regions) || ! isWithinRegions(d[i].x, regions)) {
                    s += " " + xValue(d[i]) + " " + yValue(d[i]);
                }
                // Draw with region // TODO: Fix for horizotal charts
                else {
                    xp = getX(d[i - 1].x, d[i].x);
                    yp = getY(d[i - 1].value, d[i].value);

                    dx = x(d[i].x) - x(d[i - 1].x);
                    dy = y(d[i].value) - y(d[i - 1].value);
                    dd = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    diff = 2 / dd;
                    var diffx2 = diff * 2;

                    for (j = diff; j <= 1; j += diffx2) {
                        s += sWithRegion(d[i - 1], d[i], j, diff);
                    }
                }
                prev = d[i].x;
            }

            return s;
        }

        //-- Define brush/zoom -//

        var brush, zoom = function () {};

        brush = d3.svg.brush().on("brush", redrawForBrush);
        brush.update = function () {
            if (context) { context.select('.x.brush').call(this); }
            return this;
        };
        brush.scale = function (scale) {
            return __axis_rotated ? this.y(scale) : this.x(scale);
        };

        if (__zoom_enabled) {
            zoom = d3.behavior.zoom()
                .on("zoomstart", function () { zoom.altDomain = d3.event.sourceEvent.altKey ? x.orgDomain() : null; })
                .on("zoom", __zoom_enabled ? redrawForZoom : null);
            zoom.scale = function (scale) {
                return __axis_rotated ? this.y(scale) : this.x(scale);
            };
            zoom.orgScaleExtent = function () {
                var extent = __zoom_extent ? __zoom_extent : [1, 10];
                return [extent[0], Math.max(getMaxDataCount() / extent[1], extent[1])];
            };
            zoom.updateScaleExtent = function () {
                var ratio = diffDomain(x.orgDomain()) / diffDomain(orgXDomain), extent = this.orgScaleExtent();
                this.scaleExtent([extent[0] * ratio, extent[1] * ratio]);
                return this;
            };
        }

        /*-- Draw Chart --*/

        // for svg elements
        var svg, defs, main, context, legend, tooltip, selectChart;

        // for brush area culculation
        var orgXDomain;

        // for save value
        var orgAreaOpacity, withoutFadeIn = {};

        function init(data) {
            var eventRect, grid, xgridLines, ygridLines;
            var i;

            selectChart = d3.select(__bindto);
            if (selectChart.empty()) {
                window.alert('No bind element found. Check the selector specified by "bindto" and existance of that element. Default "bindto" is "#chart".');
                return;
            } else {
                selectChart.html("");
            }

            // Init data as targets
            c3.data.x = {};
            c3.data.targets = convertDataToTargets(data);

            // TODO: set names if names not specified

            // Init sizes and scales
            updateSizes();
            updateScales();

            // Set domains for each scale
            x.domain(d3.extent(getXDomain(c3.data.targets)));
            y.domain(getYDomain('y'));
            y2.domain(getYDomain('y2'));
            subX.domain(x.domain());
            subY.domain(y.domain());
            subY2.domain(y2.domain());

            // Save original x domain for zoom update
            orgXDomain = x.domain();

            // Set initialized scales to brush and zoom
            brush.scale(subX);
            if (__zoom_enabled) { zoom.scale(x); }

            /*-- Basic Elements --*/

            // Define svgs
            svg = d3.select(__bindto).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .on('mouseenter', __onenter)
                .on('mouseleave', __onleave);

            // Define defs
            defs = svg.append("defs");
            defs.append("clipPath")
                .attr("id", clipId)
              .append("rect")
                .attr("width", width)
                .attr("height", height);
            defs.append("clipPath")
                .attr("id", "xaxis-clip")
              .append("rect")
                .attr("x", -1)
                .attr("y", -20)
                .attr("width", getXAxisClipWidth)
                .attr("height", getXAxisClipHeight);
            defs.append("clipPath")
                .attr("id", "yaxis-clip")
              .append("rect")
                .attr("x", -margin.left + 1)
                .attr("width", getYAxisClipWidth)
                .attr("height", getYAxisClipHeight);

            // Define regions
            main = svg.append("g").attr("transform", translate.main);
            context = __subchart_show ? svg.append("g").attr("transform", translate.context) : null;
            legend = __legend_show ? svg.append("g").attr("transform", translate.legend) : null;

            // Define tooltip
            tooltip = d3.select(__bindto)
                .style("position", "relative")
              .append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("display", "none");

            /*-- Main Region --*/

            // Add Axis
            main.append("g")
                .attr("class", "x axis")
                .attr("clip-path", __axis_rotated ? "" : "url(" + document.URL + "#xaxis-clip)")
                .attr("transform", translate.x)
              .append("text")
                .attr("class", "-axis-x-label")
                .attr("x", width)
                .attr("dy", __axis_x_label_position_dy)
                .style("text-anchor", "end")
                .text(__axis_x_label);
            main.append("g")
                .attr("class", "y axis")
                .attr("clip-path", __axis_rotated ? "url(" + document.URL + "#yaxis-clip)" : "")
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("dy",  __axis_y_label_position_dy)
                .attr("dx",  __axis_y_label_position_dx)
                .style("text-anchor", "end")
                .text(__axis_y_label);

            if (__axis_y2_show) {
                main.append("g")
                    .attr("class", "y2 axis")
                    .attr("transform", translate.y2);
            }

            // Grids
            grid = main.append('g')
                .attr("clip-path", clipPath)
                .attr('class', 'grid');

            // X-Grid
            if (__grid_x_show) {
                grid.append("g").attr("class", "xgrids");
            }
            if (__grid_x_lines) {
                xgridLines = grid.append('g')
                    .attr("class", "xgrid-lines")
                  .selectAll('.xgrid-line')
                    .data(__grid_x_lines)
                  .enter().append('g')
                    .attr("class", "xgrid-line");
                xgridLines.append('line')
                    .attr("class", function (d) { return "" + d['class']; });
                xgridLines.append('text')
                    .attr("class", function (d) { return "" + d['class']; })
                    .attr("text-anchor", "end")
                    .attr("transform", __axis_rotated ? "" : "rotate(-90)")
                    .attr('dx', __axis_rotated ? 0 : -margin.top)
                    .attr('dy', -5)
                    .text(function (d) { return d.text; });
            }
            if (__point_focus_line_enabled) {
                grid.append('g')
                    .attr("class", "xgrid-focus")
                  .append('line')
                    .attr('class', 'xgrid-focus')
                    .attr("x1", __axis_rotated ? 0 : -10)
                    .attr("x2", __axis_rotated ? width : -10)
                    .attr("y1", __axis_rotated ? -10 : margin.top)
                    .attr("y2", __axis_rotated ? -10 : height);
            }

            // Y-Grid
            if (__grid_y_show) {
                grid.append('g').attr('class', 'ygrids');
            }
            if (__grid_y_lines) {
                ygridLines = grid.append('g')
                    .attr('class', 'ygrid-lines')
                  .selectAll('ygrid-line')
                    .data(__grid_y_lines)
                  .enter().append('g')
                    .attr("class", "ygrid-line");
                ygridLines.append('line')
                    .attr("class", function (d) { return "" + d['class']; });
                ygridLines.append('text')
                    .attr("class", function (d) { return "" + d['class']; })
                    .attr("text-anchor", "end")
                    .attr("transform", __axis_rotated ? "rotate(-90)" : "")
                    .attr('dx', __axis_rotated ? 0 : -margin.top)
                    .attr('dy', -5)
                    .text(function (d) { return d.text; });
            }

            // Regions
            main.append('g')
                .attr("clip-path", clipPath)
                .attr("class", "regions");

            // Define g for chart area
            main.append('g')
                .attr("clip-path", clipPath)
                .attr('class', 'chart');

            // Cover whole with rects for events
            eventRect = main.select('.chart').append("g")
                .attr("class", "event-rects")
                .style('fill-opacity', 0)
                .style('cursor', __zoom_enabled ? __axis_rotated ? 'ns-resize' : 'ew-resize' : null);

            // Define g for bar chart area
            main.select(".chart").append("g")
                .attr("class", "chart-bars");

            // Define g for line chart area
            main.select(".chart").append("g")
                .attr("class", "chart-lines");

            // Define g for arc chart area
            main.select(".chart").append("g")
                .attr("class", "chart-arcs")
                .attr("transform", translate.arc)
              .append('text')
                .attr('class', 'chart-arcs-title')
                .style("text-anchor", "middle")
                .text(__arc_title);

            main.select(".chart").append("g")
                .attr("class", "chart-texts");

            if (__zoom_enabled) { // TODO: __zoom_privileged here?
                // if zoom privileged, insert rect to forefront
                main.insert('rect', __zoom_privileged ? null : 'g.grid')
                    .attr('class', 'zoom-rect')
                    .attr('width', width)
                    .attr('height', height)
                    .style('opacity', 0)
                    .style('cursor', __axis_rotated ? 'ns-resize' : 'ew-resize')
                    .call(zoom).on("dblclick.zoom", null);
            }

            // Set default extent if defined
            if (__axis_x_default !== null) {
                brush.extent(typeof __axis_x_default !== 'function' ? __axis_x_default : __axis_x_default(getXDomain()));
            }

            /*-- Context Region --*/

            if (__subchart_show) {
                // Define g for chart area
                context.append('g')
                    .attr("clip-path", clipPath)
                    .attr('class', 'chart');

                // Define g for bar chart area
                context.select(".chart").append("g")
                    .attr("class", "chart-bars");

                // Define g for line chart area
                context.select(".chart").append("g")
                    .attr("class", "chart-lines");

                // Add extent rect for Brush
                context.append("g")
                    .attr("clip-path", clipPath)
                    .attr("class", "x brush")
                    .call(brush)
                  .selectAll("rect")
                    .attr(__axis_rotated ? "width" : "height", __axis_rotated ? width2 : height2);

                // ATTENTION: This must be called AFTER chart added
                // Add Axis
                context.append("g")
                    .attr("class", "x axis")
                    .attr("transform", translate.subx)
                    .attr("clip-path", __axis_rotated ? "url(" + document.URL + "#yaxis-clip)" : "");
            }

            /*-- Legend Region --*/

            if (__legend_show) {
                updateLegend(c3.data.targets);
            }

            // Set targets
            updateTargets(c3.data.targets);

            // Draw with targets
            redraw({withTransform: true, withUpdateXDomain: true});

            // Show tooltip if needed
            if (__tooltip_init_show) {
                if (isTimeSeries && typeof __tooltip_init_x === 'string') {
                    __tooltip_init_x = parseDate(__tooltip_init_x);
                    for (i = 0; i < c3.data.targets[0].values.length; i++) {
                        if ((c3.data.targets[0].values[i].x - __tooltip_init_x) === 0) { break; }
                    }
                    __tooltip_init_x = i;
                }
                tooltip.html(__tooltip_contents(c3.data.targets.map(function (d) {
                    return addName(d.values[__tooltip_init_x]);
                }), getXAxisTickFormat(), defaultValueFormat, color));
                tooltip.style("top", __tooltip_init_position.top)
                       .style("left", __tooltip_init_position.left)
                       .style("display", "block");
            }

            // Bind resize event
            if (window.onresize == null) {
                window.onresize = generateResize();
            }
            if (window.onresize.add) {
                window.onresize.add(updateAndRedraw);
            }
        }

        function generateEventRectsForSingleX(eventRectEnter) {
            eventRectEnter.append("rect")
                .attr("class", classEvent)
                .style("cursor", __data_selection_enabled && __data_selection_grouped ? "pointer" : null)
                .on('mouseover', function (_, i) {
                    if (dragging) { return; } // do nothing if dragging
                    if (hasArcType(c3.data.targets)) { return; }

                    var selectedData = c3.data.targets.map(function (d) { return addName(d.values[i]); });
                    var j, newData;

                    // Sort selectedData as names order
                    if (Object.keys(__data_names).length > 0) {
                        newData = [];
                        for (var id in __data_names) {
                            for (j = 0; j < selectedData.length; j++) {
                                if (selectedData[j].id === id) {
                                    newData.push(selectedData[j]);
                                    selectedData.shift(j);
                                    break;
                                }
                            }
                        }
                        selectedData = newData.concat(selectedData); // Add remained
                    }

                    // Expand shapes if needed
                    if (__point_focus_expand_enabled) { expandCircles(i); }
                    expandBars(i);

                    // Show xgrid focus line
                    showXGridFocus(selectedData);
                })
                .on('mouseout', function (_, i) {
                    if (hasArcType(c3.data.targets)) { return; }
                    hideXGridFocus();
                    hideTooltip();
                    // Undo expanded shapes
                    unexpandCircles(i);
                    unexpandBars();
                })
                .on('mousemove', function (_, i) {
                    var selectedData;

                    if (dragging) { return; } // do nothing when dragging
                    if (hasArcType(c3.data.targets)) { return; }

                    // Show tooltip
                    selectedData = c3.data.targets.map(function (d) {
                        return addName(d.values[i]);
                    });
                    showTooltip(selectedData, d3.mouse(this));

                    if (! __data_selection_enabled) { return; }
                    if (__data_selection_grouped) { return; } // nothing to do when grouped

                    main.selectAll('.-shape-' + i)
                        .filter(function (d) { return __data_selection_isselectable(d); })
                        .each(function () {
                            var _this = d3.select(this).classed(EXPANDED, true);
                            if (this.nodeName === 'circle') { _this.attr('r', __point_focus_expand_r); }
                            svg.select('.event-rect-' + i).style('cursor', null);
                        })
                        .filter(function () {
                            var _this = d3.select(this);
                            if (this.nodeName === 'circle') {
                                return isWithinCircle(this, __point_select_r);
                            }
                            else if (this.nodeName === 'rect') {
                                return isWithinBar(this, _this.attr('x'), _this.attr('y'));
                            }
                        })
                        .each(function () {
                            var _this = d3.select(this);
                            if (! _this.classed(EXPANDED)) {
                                _this.classed(EXPANDED, true);
                                if (this.nodeName === 'circle') { _this.attr('r', __point_select_r); }
                            }
                            svg.select('.event-rect-' + i).style('cursor', 'pointer');
                        });
                })
                .on('click', function (_, i) {
                    if (hasArcType(c3.data.targets)) { return; }
                    if (cancelClick) {
                        cancelClick = false;
                        return;
                    }
                    main.selectAll('.-shape-' + i).each(function (d) { selectShape(this, d, i); });
                })
                .call(
                    d3.behavior.drag().origin(Object)
                        .on('drag', function () { drag(d3.mouse(this)); })
                        .on('dragstart', function () { dragstart(d3.mouse(this)); })
                        .on('dragend', function () { dragend(); })
                )
                .call(zoom).on("dblclick.zoom", null);
        }

        function generateEventRectsForMultipleXs(eventRectEnter) {
            eventRectEnter.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', width)
                .attr('height', height)
                .attr('class', "event-rect")
                .on('mouseout', function () {
                    if (hasArcType(c3.data.targets)) { return; }
                    hideXGridFocus();
                    hideTooltip();
                    unexpandCircles();
                })
                .on('mousemove', function () {
                    var mouse, closest, selectedData;

                    if (dragging) { return; } // do nothing when dragging
                    if (hasArcType(c3.data.targets)) { return; }

                    mouse = d3.mouse(this);
                    closest = findClosestFromTargets(c3.data.targets, mouse);

                    // show tooltip when cursor is close to some point
                    selectedData = [addName(closest)];
                    showTooltip(selectedData, mouse);

                    // expand points
                    if (__point_focus_expand_enabled) {
                        unexpandCircles();
                        expandCircles(closest.index, closest.id);
                    }

                    // Show xgrid focus line
                    showXGridFocus(selectedData);

                    // Show cursor as pointer if point is close to mouse position
                    if (dist(closest, mouse) < 100) {
                        svg.select('.event-rect').style('cursor', 'pointer');
                    } else {
                        svg.select('.event-rect').style('cursor', null);
                    }
                })
                .on('click', function () {
                    var mouse, closest;

                    if (hasArcType(c3.data.targets)) { return; }

                    mouse = d3.mouse(this);
                    closest = findClosestFromTargets(c3.data.targets, mouse);

                    // select if selection enabled
                    if (dist(closest, mouse) < 100) {
                        main.select('.-circles-' + closest.id).select('.-circle-' + closest.index).each(function () {
                            selectShape(this, closest, closest.index);
                        });
                    }
                })
                .call(
                    d3.behavior.drag().origin(Object)
                        .on('drag', function () { drag(d3.mouse(this)); })
                        .on('dragstart', function () { dragstart(d3.mouse(this)); })
                        .on('dragend', function () { dragend(); })
                )
                .call(zoom).on("dblclick.zoom", null);
        }

        function selectShape(target, d, i) {
            var _this = d3.select(target),
                isSelected = _this.classed(SELECTED);
            var isWithin = false, toggle;
            if (target.nodeName === 'circle') {
                isWithin = isWithinCircle(target, __point_select_r * 1.5);
                toggle = togglePoint;
            }
            else if (target.nodeName === 'rect') {
                isWithin = isWithinBar(target);
                toggle = toggleBar;
            }
            if (__data_selection_grouped || isWithin) {
                if (__data_selection_enabled && __data_selection_isselectable(d)) {
                    _this.classed(SELECTED, !isSelected);
                    toggle(!isSelected, _this, d, i);
                }
                __point_onclick(d, _this); // TODO: should be __data_onclick
            }
        }

        function drag(mouse) {
            var sx, sy, mx, my, minX, maxX, minY, maxY;

            if (hasArcType(c3.data.targets)) { return; }
            if (! __data_selection_enabled) { return; } // do nothing if not selectable
            if (__zoom_enabled && ! zoom.altDomain) { return; } // skip if zoomable because of conflict drag dehavior

            sx = dragStart[0];
            sy = dragStart[1];
            mx = mouse[0];
            my = mouse[1];
            minX = Math.min(sx, mx);
            maxX = Math.max(sx, mx);
            minY = (__data_selection_grouped) ? margin.top : Math.min(sy, my);
            maxY = (__data_selection_grouped) ? height : Math.max(sy, my);

            main.select('.dragarea')
                .attr('x', minX)
                .attr('y', minY)
                .attr('width', maxX - minX)
                .attr('height', maxY - minY);
            // TODO: binary search when multiple xs
            main.selectAll('.-shapes').selectAll('.-shape')
                .filter(function (d) { return __data_selection_isselectable(d); })
                .each(function (d, i) {
                    var _this = d3.select(this),
                        isSelected = _this.classed(SELECTED),
                        isIncluded = _this.classed(INCLUDED),
                        _x, _y, _w, toggle, isWithin = false;
                    if (this.nodeName === 'circle') {
                        _x = _this.attr("cx") * 1;
                        _y = _this.attr("cy") * 1;
                        toggle = togglePoint;
                        isWithin = minX < _x && _x < maxX && minY < _y && _y < maxY;
                    }
                    else if (this.nodeName === 'rect') {
                        _x = _this.attr("x") * 1;
                        _y = _this.attr("y") * 1;
                        _w = _this.attr('width') * 1;
                        toggle = toggleBar;
                        isWithin = minX < _x + _w && _x < maxX && _y < maxY;
                    }
                    if (isWithin ^ isIncluded) {
                        _this.classed(INCLUDED, !isIncluded);
                        // TODO: included/unincluded callback here
                        _this.classed(SELECTED, !isSelected);
                        toggle(!isSelected, _this, d, i);
                    }
                });
        }

        function dragstart(mouse) {
            if (hasArcType(c3.data.targets)) { return; }
            if (! __data_selection_enabled) { return; } // do nothing if not selectable
            dragStart = mouse;
            main.select('.chart').append('rect')
                .attr('class', 'dragarea')
                .style('opacity', 0.1);
            dragging = true;
            // TODO: add callback here
        }

        function dragend() {
            if (hasArcType(c3.data.targets)) { return; }
            if (! __data_selection_enabled) { return; } // do nothing if not selectable
            main.select('.dragarea')
                .transition().duration(100)
                .style('opacity', 0)
                .remove();
            main.selectAll('.-shape')
                .classed(INCLUDED, false);
            dragging = false;
            // TODO: add callback here

        }

        function redraw(options) {
            var xgrid, xgridData, xgridLines, ygrid, ygridLines;
            var mainCircle, mainBar, mainRegion, mainText, contextBar, eventRectUpdate;
            var barIndices = getBarIndices(), maxDataCountTarget;
            var rectX, rectW;
            var withY, withSubchart, withTransition, withTransform, withUpdateXDomain, withUpdateOrgXDomain;
            var hideAxis = hasArcType(c3.data.targets);
            var drawBar, drawBarOnSub, xForText, yForText;
            var duration, durationForExit;

            options = isDefined(options) ? options : {};
            withY = isDefined(options.withY) ? options.withY : true;
            withSubchart = isDefined(options.withSubchart) ? options.withSubchart : true;
            withTransition = isDefined(options.withTransition) ? options.withTransition : true;
            withTransform = isDefined(options.withTransform) ? options.withTransform : false;
            withUpdateXDomain = isDefined(options.withUpdateXDomain) ? options.withUpdateXDomain : false;
            withUpdateOrgXDomain = isDefined(options.withUpdateOrgXDomain) ? options.withUpdateOrgXDomain : false;

            duration = withTransition ? __transition_duration : 0;
            durationForExit = isDefined(options.durationForExit) ? options.durationForExit : duration;

            if (withUpdateOrgXDomain) {
                x.domain(d3.extent(getXDomain(c3.data.targets)));
                orgXDomain = x.domain();
                if (__zoom_enabled) { zoom.scale(x).updateScaleExtent(); }
                subX.domain(x.domain());
                brush.scale(subX);
            }

            // ATTENTION: call here to update tickOffset
            if (withUpdateXDomain) {
                x.domain(brush.empty() ? orgXDomain : brush.extent());
                if (__zoom_enabled) { zoom.scale(x).updateScaleExtent(); }
            }
            y.domain(getYDomain('y'));
            y2.domain(getYDomain('y2'));

            // axis
            main.select(".x.axis").style("opacity", hideAxis ? 0 : 1).transition().duration(duration).call(__axis_rotated ? yAxis : xAxis);
            main.select(".y.axis").style("opacity", hideAxis ? 0 : 1).transition().duration(duration).call(__axis_rotated ? xAxis : yAxis);
            main.select(".y2.axis").style("opacity", hideAxis ? 0 : 1).transition().call(yAxis2);

            // setup drawer - MEMO: these must be called after axis updated
            drawBar = generateDrawBar(barIndices);
            xForText = generateXYForText(barIndices, true);
            yForText = generateXYForText(barIndices, false);

            // Update label position
            main.select(".x.axis .-axis-x-label").attr("x", width);

            // Update sub domain
            subY.domain(y.domain());
            subY2.domain(y2.domain());

            // tooltip
            tooltip.style("display", "none");

            // grid
            main.select('line.xgrid-focus')
                .style("visibility", "hidden")
                .attr('y2', height);
            if (__grid_x_show) {
                if (__grid_x_type === 'year') {
                    xgridData = [];
                    var xDomain = getXDomain();
                    var firstYear = xDomain[0].getFullYear();
                    var lastYear = xDomain[1].getFullYear();
                    for (var year = firstYear; year <= lastYear; year++) {
                        xgridData.push(new Date(year + '-01-01 00:00:00'));
                    }
                } else {
                    xgridData = x.ticks(10);
                }

                xgrid = main.select('.xgrids').selectAll(".xgrid")
                    .data(xgridData);
                xgrid.enter().append('line').attr("class", "xgrid");
                xgrid.attr("x1", __axis_rotated ? 0 : function (d) { return x(d) - xAxis.tickOffset(); })
                    .attr("x2", __axis_rotated ? width : function (d) { return x(d) - xAxis.tickOffset(); })
                    .attr("y1", __axis_rotated ? function (d) { return x(d) - xAxis.tickOffset(); } : margin.top)
                    .attr("y2", __axis_rotated ? function (d) { return x(d) - xAxis.tickOffset(); } : height)
                    .style("opacity", function () { return +d3.select(this).attr(__axis_rotated ? 'y1' : 'x1') === (__axis_rotated ? height : 0) ? 0 : 1; });
                xgrid.exit().remove();
            }
            if (__grid_x_lines) {
                xgridLines = main.selectAll(".xgrid-lines");
                xgridLines.selectAll('line')
                  .transition().duration(duration)
                    .attr("x1", __axis_rotated ? 0 : xv)
                    .attr("x2", __axis_rotated ? width : xv)
                    .attr("y1", __axis_rotated ? xv : margin.top)
                    .attr("y2", __axis_rotated ? xv : height);
                xgridLines.selectAll('text')
                    .attr("x", __axis_rotated ? width : 0)
                    .attr("y", xv);
            }
            // Y-Grid
            if (withY && __grid_y_show) {
                ygrid = main.select('.ygrids').selectAll(".ygrid")
                    .data(y.ticks(10));
                ygrid.enter().append('line')
                    .attr('class', 'ygrid');
                ygrid.attr("x1", __axis_rotated ? y : 0)
                     .attr("x2", __axis_rotated ? y : width)
                     .attr("y1", __axis_rotated ? 0 : y)
                     .attr("y2", __axis_rotated ? height : y);
                ygrid.exit().remove();
            }
            if (withY && __grid_y_lines) {
                ygridLines = main.select('.ygrid-lines');
                ygridLines.selectAll('line')
                  .transition().duration(duration)
                    .attr("x1", __axis_rotated ? yv : 0)
                    .attr("x2", __axis_rotated ? yv : width)
                    .attr("y1", __axis_rotated ? 0 : yv)
                    .attr("y2", __axis_rotated ? height : yv);
                ygridLines.selectAll('text')
                    .attr("x", __axis_rotated ? 0 : width)
                    .attr("y", yv);
            }

            // bars
            mainBar = main.selectAll('.-bars').selectAll('.-bar')
                .data(barData);
            mainBar.enter().append('path')
                .attr('d', drawBar)
                .style("stroke", 'none')
                .style("opacity", 0)
                .style("fill", function (d) { return color(d.id); })
                .attr("class", classBar);
            mainBar
                .style("opacity", initialOpacity)
              .transition().duration(duration)
                .attr('d', drawBar)
                .style("opacity", 1);
            mainBar.exit().transition().duration(durationForExit)
                .style('opacity', 0)
                .remove();
            
            mainText = main.selectAll('.-texts').selectAll('.-text')
                .data(barOrLineData);
            mainText.enter().append('text')
                .attr("class", classText)
                .attr('text-anchor', function (d) { return __axis_rotated ? (d.value < 0 ? 'end' : 'start') : 'middle'; })
                .style("stroke", 'none')
                .style("fill-opacity", 0)
                .text(function (d) { return defaultValueFormat(d.value); });
            mainText
                .style("fill-opacity", initialOpacityForText)
              .transition().duration(duration)
                .attr('x', xForText)
                .attr('y', yForText)
                .style("fill-opacity", opacityForText);
            mainText.exit()
              .transition().duration(durationForExit)
                .style('fill-opacity', 0)
                .remove();

            // lines and cricles
            main.selectAll('.-line')
                .style("opacity", initialOpacity)
              .transition().duration(duration)
                .attr("d", lineOnMain)
                .style("opacity", 1);
            main.selectAll('.-area')
                .style("opacity", 0)
              .transition().duration(duration)
                .attr("d", areaOnMain)
                .style("opacity", orgAreaOpacity);
            mainCircle = main.selectAll('.-circles').selectAll('.-circle')
                .data(lineOrScatterData);
            mainCircle.enter().append("circle")
                .attr("class", classCircle)
                .style('opacity', 0)
                .attr("r", __point_r);
            mainCircle
                .style("opacity", initialOpacity)
              .transition().duration(duration)
                .style('opacity', opacityForCircle)
                .attr("cx", __axis_rotated ? circleY : circleX)
                .attr("cy", __axis_rotated ? circleX : circleY);
            mainCircle.exit().remove();

            // arc
            main.selectAll('.chart-arc').select('.-arc')
                .attr("transform", withTransform ? "scale(0)" : "")
                .style("opacity", function (d) { return d === this._current ? 0 : 1; })
              .transition().duration(duration)
                .attrTween("d", function (d) {
                    var updated = updateAngle(d);
                    if (! updated) {
                        return function () { return "M 0 0"; };
                    }
/*
                    if (this._current === d) {
                        this._current = {
                            startAngle: Math.PI*2,
                            endAngle: Math.PI*2,
                        };
                    }
*/
                    var i = d3.interpolate(this._current, updated);
                    this._current = i(0);
                    return function (t) { return getArc(i(t), true); };
                })
                .attr("transform", withTransform ? "scale(1)" : "")
                .style("opacity", 1);
            main.selectAll('.chart-arc').select('text')
                .attr("transform", transformForArcLable)
                .style("opacity", 0)
              .transition().duration(duration)
                .text(textForArcLable)
                .style("opacity", function (d) { return isArcType(d.data) ? 1 : 0; });
            main.select('.chart-arcs-title')
                .style("opacity", hasDonutType(c3.data.targets) ? 1 : 0);

            // subchart
            if (__subchart_show) {
                // reflect main chart to extent on subchart if zoomed
                if (d3.event !== null && d3.event.type === 'zoom') {
                    brush.extent(x.orgDomain()).update();
                }
                // update subchart elements if needed
                if (withSubchart) {
                    // axes
                    context.select('.x.axis').style("opacity", hideAxis ? 0 : 1).transition().duration(duration).call(subXAxis);
                    // extent rect
                    if (!brush.empty()) {
                        brush.extent(x.orgDomain()).update();
                    }
                    // setup drawer - MEMO: this must be called after axis updated
                    drawBarOnSub = generateDrawBar(barIndices, true);
                    // bars
                    contextBar = context.selectAll('.-bars').selectAll('.-bar')
                        .data(barData);
                    contextBar.enter().append('path')
                        .attr('d', drawBarOnSub)
                        .style("stroke", 'none')
                        .style("fill", function (d) { return color(d.id); })
                        .attr("class", classBar);
                    contextBar
                        .style("opacity", initialOpacity)
                      .transition().duration(duration)
                        .attr('d', drawBarOnSub)
                        .style('opacity', 1);
                    contextBar.exit().transition().duration(duration)
                        .style('opacity', 0)
                        .remove();
                    // lines
                    context.selectAll('.-line')
                        .style("opacity", initialOpacity)
                      .transition().duration(duration)
                        .attr("d", lineOnSub)
                        .style('opacity', 1);
                }
            }

            // circles for select
            main.selectAll('.selected-circles')
                .filter(function (d) { return isBarType(d); })
                .selectAll('circle')
                .remove();
            main.selectAll('.selected-circle')
              .transition().duration(duration)
                .attr("cx", __axis_rotated ? circleY : circleX)
                .attr("cy", __axis_rotated ? circleX : circleY);

            // rect for mouseover
            if (__data_xs) {
                eventRectUpdate = main.select('.event-rects').selectAll('.event-rect')
                    .data([0]);
                // enter : only one rect will be added
                generateEventRectsForMultipleXs(eventRectUpdate.enter());
                // update
                eventRectUpdate
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', width)
                    .attr('height', height);
                // exit : not needed becuase always only one rect exists
            } else {
                if (isCustomX) {
                    rectW = function (d, i) {
                        var prevX = getPrevX(i), nextX = getNextX(i);
                        return (x(nextX ? nextX : d.x + 50) - x(prevX ? prevX : d.x - 50)) / 2;
                    };
                    rectX = function (d, i) {
                        var prevX = getPrevX(i);
                        return (x(d.x) + x(prevX ? prevX : d.x - 50)) / 2;
                    };
                } else {
                    rectW = getEventRectWidth();
                    rectX = function (d) { return x(d.x) - (rectW / 2); };
                }
                // Set data
                maxDataCountTarget = getMaxDataCountTarget();
                main.select(".event-rects")
                    .datum(maxDataCountTarget ? maxDataCountTarget.values : []);
                // Update rects
                eventRectUpdate = main.select('.event-rects').selectAll('.event-rect')
                    .data(function (d) { return d; });
                // enter
                generateEventRectsForSingleX(eventRectUpdate.enter());
                // update
                eventRectUpdate
                    .attr('class', classEvent)
                    .attr("x", __axis_rotated ? 0 : rectX)
                    .attr("y", __axis_rotated ? rectX : 0)
                    .attr("width", __axis_rotated ? width : rectW)
                    .attr("height", __axis_rotated ? rectW : height);
                // exit
                eventRectUpdate.exit().remove();
            }

            // rect for regions
            mainRegion = main.select('.regions').selectAll('rect.region')
                .data(__regions);
            mainRegion.enter().append('rect')
                .style("fill-opacity", 0);
            mainRegion
                .attr('class', classRegion)
                .attr("x", __axis_rotated ? 0 : regionStart)
                .attr("y", __axis_rotated ? regionStart : margin.top)
                .attr("width", __axis_rotated ? width : regionWidth)
                .attr("height", __axis_rotated ? regionWidth : height)
              .transition().duration(duration)
                .style("fill-opacity", function (d) { return isValue(d.opacity) ? d.opacity : 0.1; });
            mainRegion.exit().transition().duration(duration)
                .style("fill-opacity", 0)
                .remove();

            // update legend
            if (__legend_show) {
                updateLegend(c3.data.targets, {withTransition: withTransition});
            }

            // update fadein condition
            getTargetIds().forEach(function (id) {
                withoutFadeIn[id] = true;
            });
        }
        function redrawForBrush() {
            redraw({
                withTransition: false,
                withY: false,
                withSubchart: false,
                withUpdateXDomain: true
            });
        }
        function redrawForZoom() {
            if (d3.event.sourceEvent.type === 'mousemove' && zoom.altDomain) {
                x.domain(zoom.altDomain);
                zoom.scale(x).updateScaleExtent();
                return;
            }
            if (isCategorized && x.orgDomain()[0] === orgXDomain[0]) {
                x.domain([orgXDomain[0] - 1e-10, x.orgDomain()[1]]);
            }
            redraw({
                withTransition: false,
                withY: false,
                withSubchart: false
            });
            if (d3.event.sourceEvent.type === 'mousemove') {
                cancelClick = true;
            }
        }

        function generateResize() {
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
        }
        function updateAndRedraw(options) {
            var withTransition, withTransform;
            options = isDefined(options) ? options : {};
            withTransition = isDefined(options.withTransition) ? options.withTransition : false;
            withTransform = isDefined(options.withTransform) ? options.withTransform : false;
            // Update sizes and scales
            updateSizes();
            updateScales();
            // Set x for brush again because of scale update
            brush.scale(subX);
            // Set x for zoom again because of scale update
            if (__zoom_enabled) { zoom.scale(x); }
            // Update sizes
            svg.attr('width', currentWidth).attr('height', currentHeight);
            svg.select('#' + clipId).select('rect').attr('width', width).attr('height', height);
            svg.select('#xaxis-clip').select('rect').attr('width', getXAxisClipWidth);
            svg.select('.zoom-rect').attr('width', width).attr('height', height);
            // Update g positions
            transformAll(withTransition);
            // Draw with new sizes & scales
            redraw({
                withTransition: withTransition,
                withUpdateXDomain: true,
                withTransform: withTransform,
                durationForExit: 0
            });
        }

        function updateTargets(targets) {
            var mainLineEnter, mainLineUpdate, mainBarEnter, mainBarUpdate, mainPieEnter, mainPieUpdate, mainTextUpdate, mainTextEnter;
            var contextLineEnter, contextLineUpdate, contextBarEnter, contextBarUpdate;

            /*-- Main --*/

            //-- Text --//
            mainTextUpdate = main.select('.chart-texts')
                  .selectAll('.chart-text')
                    .data(targets);
            mainTextEnter = mainTextUpdate.enter().append('g')
                .attr('class', function (d) { return 'chart-text target target-' + d.id; })
                .style("pointer-events", "none");
            mainTextEnter.append('g')
                .attr('class', classTexts)
                .style("fill", function (d) { return color(d.id); });

            //-- Bar --//
            mainBarUpdate = main.select('.chart-bars')
              .selectAll('.chart-bar')
                .data(targets);
            mainBarEnter = mainBarUpdate.enter().append('g')
                .attr('class', function (d) { return 'chart-bar target target-' + d.id; })
                .style("pointer-events", "none");
            // Bars for each data
            mainBarEnter.append('g')
                .attr("class", classBars)
                .style("fill", function (d) { return color(d.id); })
                .style("stroke", "none")
                .style("cursor", function (d) { return __data_selection_isselectable(d) ? "pointer" : null; });

            //-- Line --//
            mainLineUpdate = main.select('.chart-lines')
              .selectAll('.chart-line')
                .data(targets);
            mainLineEnter = mainLineUpdate.enter().append('g')
                .attr('class', function (d) { return 'chart-line target target-' + d.id; })
                .style("pointer-events", "none");
            // Lines for each data
            mainLineEnter.append("path")
                .attr("class", classLine)
                .style("opacity", 0)
                .style("stroke", function (d) { return color(d.id); });
            // Areas
            mainLineEnter.append("path")
                .attr("class", classArea)
                .style("opacity", function () { orgAreaOpacity = +d3.select(this).style('opacity'); return 0; })
                .style("fill", function (d) { return color(d.id); });
            // Circles for each data point on lines
            mainLineEnter.append('g')
                .attr("class", function (d) { return "selected-circles selected-circles-" + d.id; });
            mainLineEnter.append('g')
                .attr("class", classCircles)
                .style("fill", function (d) { return color(d.id); })
                .style("cursor", function (d) { return __data_selection_isselectable(d) ? "pointer" : null; });
            // Update date for selected circles
            targets.forEach(function (t) {
                var suffix = getTargetSelectorSuffix(t.id);
                main.selectAll('.selected-circles' + suffix).selectAll('.selected-circle').each(function (d) {
                    d.value = t.values[d.x].value;
                });
            });
            // MEMO: can not keep same color...
            //mainLineUpdate.exit().remove();

            //-- Pie --//
            mainPieUpdate = main.select('.chart-arcs')
              .selectAll(".chart-arc")
                .data(pie(targets));
            mainPieEnter = mainPieUpdate.enter().append("g")
                .attr("class", function (d) { return 'chart-arc target target-' + d.data.id; });
            mainPieEnter.append("path")
                .attr("class", classArc)
                .style("opacity", 0)
                .style("fill", function (d) { return color(d.data.id); })
                .style("cursor", function (d) { return __data_selection_isselectable(d) ? "pointer" : null; })
                .each(function (d) { this._current = d; })
                .on('mouseover', function (d) {
                    expandArc(d.data.id);
                    focusLegend(d.data.id);
                })
                .on('mouseout', function (d) {
                    unexpandArc(d.data.id);
                    revertLegend();
                });
            mainPieEnter.append("text")
                .attr("dy", ".35em")
                .style("opacity", 0)
                .style("text-anchor", "middle")
                .style("pointer-events", "none");
            // MEMO: can not keep same color..., but not bad to update color in redraw
            //mainPieUpdate.exit().remove();

            /*-- Context --*/

            if (__subchart_show) {

                contextBarUpdate = context.select('.chart-bars')
                  .selectAll('.chart-bar')
                    .data(targets);
                contextBarEnter = contextBarUpdate.enter().append('g')
                    .attr('class', function (d) { return 'chart-bar target target-' + d.id; });
                // Bars for each data
                contextBarEnter.append('g')
                    .attr("class", classBars)
                    .style("fill", function (d) { return color(d.id); });

                //-- Line --//
                contextLineUpdate = context.select('.chart-lines')
                  .selectAll('.chart-line')
                    .data(targets);
                contextLineEnter = contextLineUpdate.enter().append('g')
                    .attr('class', function (d) { return 'chart-line target target-' + d.id; });
                // Lines for each data
                contextLineEnter.append("path")
                    .attr("class", classLine)
                    .style("opacity", 0)
                    .style("stroke", function (d) { return color(d.id); });
            }

            /*-- Legend --*/

            if (__legend_show) {
                updateLegend(targets);
            }

            /*-- Show --*/

            // Fade-in each chart
            svg.selectAll('.target')
                .transition()
                .style("opacity", 1);
        }

        function load(targets, done) {
            // Update/Add data
            c3.data.targets.forEach(function (d) {
                for (var i = 0; i < targets.length; i++) {
                    if (d.id === targets[i].id) {
                        d.values = targets[i].values;
                        targets.splice(i, 1);
                        break;
                    }
                }
            });
            c3.data.targets = c3.data.targets.concat(targets); // add remained

            // Set targets
            updateTargets(c3.data.targets);

            // Redraw with new targets
            redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});

            done();
        }

        /*-- Draw Legend --*/

        function focusLegend(id) {
            var legendItem = svg.selectAll('.legend-item'),
                isTarget = function (d) { return !id || d === id; },
                notTarget = function (d) { return !isTarget(d); };
            legendItem.filter(notTarget).transition().duration(100).style('opacity', 0.3);
            legendItem.filter(isTarget).transition().duration(100).style('opacity', 1);
        }
        function defocusLegend(id) {
            var legendItem = svg.selectAll('.legend-item'),
                isTarget = function (d) { return !id || d === id; },
                notTarget = function (d) { return !isTarget(d); };
            legendItem.filter(notTarget).transition().duration(100).style('opacity', 1);
            legendItem.filter(isTarget).transition().duration(100).style('opacity', 0.3);
        }
        function revertLegend() {
            svg.selectAll('.legend-item')
              .transition().duration(100)
                .style('opacity', 1);
        }
        
        function updateLegend(targets, options) {
            var ids = getTargetIds(targets), l;
            var xForLegend, xForLegendText, xForLegendRect, yForLegend, yForLegendText, yForLegendRect;
            var item_height = 0, item_width = 0, paddingTop = 4, paddingRight = 30, margin, updateSizes;
            var withTransition;

            options = isUndefined(options) ? {} : options;
            withTransition = isDefined(options.withTransition) ? options.withTransition : true;

            if (isLegendRight) {
                xForLegend = function () { return legendWidth * 0.2; };
                yForLegend = function (d, i) { return margin + item_height * i; };
            } else {
                xForLegend = function (d, i) { return margin + item_width * i; };
                yForLegend = function () { return legendHeight * 0.2; };
            }
            xForLegendText = function (d, i) { return xForLegend(d, i) + 14; };
            yForLegendText = function (d, i) { return yForLegend(d, i) + 9; };
            xForLegendRect = function (d, i) { return xForLegend(d, i) - 4; };
            yForLegendRect = function (d, i) { return yForLegend(d, i) - 7; };
            updateSizes = function (textElement) {
                var box = textElement.getBBox(),
                    width = Math.ceil((box.width + paddingRight) / 10) * 10,
                    height = Math.ceil((box.height + paddingTop) / 10) * 10;
                if (width > item_width) {
                    item_width = width;
                    if (! isLegendRight) {
                        margin = (legendWidth - item_width * Object.keys(targets).length) / 2;
                    }
                }
                if (height > item_height) {
                    item_height = height;
                    if (isLegendRight) {
                        margin = (legendHeight - item_height * Object.keys(targets).length) / 2;
                    }
                }
            };

            // Define g for legend area
            l = legend.selectAll('.legend-item')
                .data(ids)
              .enter().append('g')
                .attr('class', function (d) { return 'legend-item legend-item-' + d; })
                .style('cursor', 'pointer')
                .on('click', function (d) {
                    __legend_item_onclick(d);
                })
                .on('mouseover', function (d) {
                    focusLegend(d);
                    c3.focus(d);
                })
                .on('mouseout', function () {
                    revertLegend();
                    c3.revert();
                });
            l.append('text')
                .text(function (d) { return isDefined(__data_names[d]) ? __data_names[d] : d; })
                .each(function () { updateSizes(this); })
                .style("pointer-events", "none")
                .attr('x', isLegendRight ? xForLegendText : -200)
                .attr('y', isLegendRight ? -200 : yForLegend);
            l.append('rect')
                .attr("class", "legend-item-event")
                .style('fill-opacity', 0)
                .attr('x', isLegendRight ? xForLegendRect : -200)
                .attr('y', isLegendRight ? -200 : yForLegendRect)
                .attr('width', item_width + 14)
                .attr('height', 24);
            l.append('rect')
                .attr("class", "legend-item-tile")
                .style("pointer-events", "none")
                .style('fill', function (d) { return color(d); })
                .attr('x', isLegendRight ? xForLegendText : -200)
                .attr('y', isLegendRight ? -200 : yForLegendText)
                .attr('width', 10)
                .attr('height', 10);

            legend.selectAll('text')
                .data(ids)
                .each(function () { updateSizes(this); })
              .transition().duration(withTransition ? 250 : 0)
                .attr('x', xForLegendText)
                .attr('y', yForLegendText);

            legend.selectAll('rect.legend-item-event')
                .data(ids)
              .transition().duration(withTransition ? 250 : 0)
                .attr('x', xForLegendRect)
                .attr('y', yForLegendRect);

            legend.selectAll('rect.legend-item-tile')
                .data(ids)
              .transition().duration(withTransition ? 250 : 0)
                .attr('x', xForLegend)
                .attr('y', yForLegend);

        }

        /*-- Event Handling --*/

        function getTargetSelectorSuffix(targetId) {
            return targetId ? '-' + targetId.replace(/\./g, '\\.') : '';
        }
        function getTargetSelector(targetId) {
            return '.target' + getTargetSelectorSuffix(targetId);
        }
        function isNoneArc(d) {
            return hasTarget(d.id);
        }
        function isArc(d) {
            return 'data' in d && hasTarget(d.data.id);
        }

        c3.focus = function (targetId) {
            var candidates = svg.selectAll(getTargetSelector(targetId)),
                candidatesForNoneArc = candidates.filter(isNoneArc),
                candidatesForArc = candidates.filter(isArc);
            function focus(targets) {
                targets.transition().duration(100).style('opacity', 1);
            }
            c3.revert();
            c3.defocus();
            focus(candidatesForNoneArc.classed('focused', true));
            focus(candidatesForArc);
            if (hasArcType(c3.data.targets)) {
                expandArc(targetId, true);
            }
            focusLegend(targetId);
        };

        c3.defocus = function (targetId) {
            var candidates = svg.selectAll(getTargetSelector(targetId)),
                candidatesForNoneArc = candidates.filter(isNoneArc),
                candidatesForArc = candidates.filter(isArc);
            function defocus(targets) {
                targets.transition().duration(100).style('opacity', 0.3);
            }
            c3.revert();
            defocus(candidatesForNoneArc.classed('focused', false));
            defocus(candidatesForArc);
            if (hasArcType(c3.data.targets)) {
                unexpandArc(targetId);
            }
            defocusLegend(targetId);
        };

        c3.revert = function (targetId) {
            var candidates = svg.selectAll(getTargetSelector(targetId)),
                candidatesForNoneArc = candidates.filter(isNoneArc),
                candidatesForArc = candidates.filter(isArc);
            function revert(targets) {
                targets.transition().duration(100).style('opacity', 1);
            }
            revert(candidatesForNoneArc.classed('focused', false));
            revert(candidatesForArc);
            if (hasArcType(c3.data.targets)) {
                unexpandArc(targetId);
            }
            revertLegend();
        };

        c3.show = function (targetId) {
            svg.selectAll(getTargetSelector(targetId))
                .transition()
                .style('opacity', 1);
        };

        c3.hide = function (targetId) {
            svg.selectAll(getTargetSelector(targetId))
                .transition()
                .style('opacity', 0);
        };

        c3.unzoom = function () {
            brush.clear().update();
            redraw({withUpdateXDomain: true});
        };

        c3.load = function (args) {
            // check args
            if (typeof args.done !== 'function') {
                args.done = function () {};
            }
            // update xs if exists
            if (args.xs) {
                addXs(args.xs);
            }
            // update categories if exists
            if ('categories' in args && isCategorized) {
                __axis_x_categories = args.categories;
                xAxis.categories(__axis_x_categories);
            }
            // use cache if exists
            if ('cacheIds' in args && hasCaches(args.cacheIds)) {
                load(getCaches(args.cacheIds), args.done);
                return;
            }
            // load data
            if ('data' in args) {
                load(convertDataToTargets(args.data), args.done);
            }
            else if ('url' in args) {
                d3.csv(args.url, function (error, data) {
                    load(convertDataToTargets(data), args.done);
                });
            }
            else if ('rows' in args) {
                load(convertDataToTargets(convertRowsToData(args.rows)), args.done);
            }
            else if ('columns' in args) {
                load(convertDataToTargets(convertColumnsToData(args.columns)), args.done);
            }
            else {
                throw Error('url or rows or columns is required.');
            }
        };

        c3.unload = function (targetId) {
            c3.data.targets = c3.data.targets.filter(function (t) {
                return t.id !== targetId;
            });
            svg.selectAll(getTargetSelector(targetId))
              .transition()
                .style('opacity', 0)
                .remove();

            if (__legend_show) {
                svg.selectAll('.legend-item' + getTargetSelectorSuffix(targetId)).remove();
                updateLegend(c3.data.targets);
            }

            if (c3.data.targets.length > 0) {
                redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});
            }
        };

        c3.selected = function (targetId) {
            var suffix = getTargetSelectorSuffix(targetId);
            return d3.merge(
                main.selectAll('.-shapes' + suffix).selectAll('.-shape')
                    .filter(function () { return d3.select(this).classed(SELECTED); })
                    .map(function (d) { return d.map(function (_d) { return _d.__data__; }); })
            );
        };

        c3.select = function (ids, indices, resetOther) {
            if (! __data_selection_enabled) { return; }
            main.selectAll('.-shapes').selectAll('.-shape').each(function (d, i) {
                var selectShape = (this.nodeName === 'circle') ? selectPoint : selectBar,
                    unselectShape = (this.nodeName === 'circle') ? unselectPoint : unselectBar;
                if (indices.indexOf(i) >= 0) {
                    if (__data_selection_isselectable(d) && (__data_selection_grouped || isUndefined(ids) || ids.indexOf(d.id) >= 0)) {
                        selectShape(d3.select(this).classed(SELECTED, true), d, i);
                    }
                } else if (isDefined(resetOther) && resetOther) {
                    unselectShape(d3.select(this).classed(SELECTED, false), d, i);
                }
            });
        };

        c3.unselect = function (ids, indices) {
            if (! __data_selection_enabled) { return; }
            main.selectAll('.-shapes').selectAll('.-shape').each(function (d, i) {
                var unselectShape = (this.nodeName === 'circle') ? unselectPoint : unselectBar;
                if (isUndefined(indices) || indices.indexOf(i) >= 0) {
                    if (__data_selection_isselectable(d) && (__data_selection_grouped || isUndefined(ids) || ids.indexOf(d.id) >= 0)) {
                        unselectShape(d3.select(this).classed(SELECTED, false), d, i);
                    }
                }
            });
        };

        c3.toLine = function (targets) {
            setTargetType(targets, 'line');
            updateAndRedraw({withTransition: true});
        };

        c3.toSpline = function (targets) {
            setTargetType(targets, 'spline');
            updateAndRedraw({withTransition: true});
        };

        c3.toBar = function (targets) {
            setTargetType(targets, 'bar');
            updateAndRedraw({withTransition: true});
        };

        c3.toScatter = function (targets) {
            setTargetType(targets, 'scatter');
            updateAndRedraw({withTransition: true});
        };

        c3.toArea = function (targets) {
            setTargetType(targets, 'area');
            updateAndRedraw({withTransition: true});
        };

        c3.toAreaSpline = function (targets) {
            setTargetType(targets, 'area-spline');
            updateAndRedraw({withTransition: true});
        };

        c3.toPie = function (targets) {
            setTargetType(targets, 'pie');
            updateAndRedraw({withTransition: true, withTransform: true});
        };

        c3.toDonut = function (targets) {
            setTargetType(targets, 'donut');
            updateAndRedraw({withTransition: true, withTransform: true});
        };

        c3.groups = function (groups) {
            if (isUndefined(groups)) { return __data_groups; }
            __data_groups = groups;
            redraw();
            return __data_groups;
        };

        c3.regions = function (regions) {
            if (isUndefined(regions)) { return __regions; }
            __regions = regions;
            redraw();
            return __regions;
        };
        c3.regions.add = function (regions) {
            if (isUndefined(regions)) { return __regions; }
            __regions = __regions.concat(regions);
            redraw();
            return __regions;
        };
        c3.regions.remove = function (classes, options) {
            var regionClasses = [].concat(classes);
            options = isDefined(options) ? options : {};
            regionClasses.forEach(function (cls) {
                var duration = isValue(options.duration) ? options.duration : 0;
                svg.selectAll('.' + cls)
                  .transition().duration(duration)
                    .style('fill-opacity', 0)
                    .remove();
                __regions = __regions.filter(function (region) {
                    return region.classes.indexOf(cls) < 0;
                });
            });
            return __regions;
        };

        c3.data.get = function (targetId) {
            var target = c3.data.getAsTarget(targetId);
            return isDefined(target) ? target.values.map(function (d) { return d.value; }) : undefined;
        };
        c3.data.getAsTarget = function (targetId) {
            var targets = getTargets(function (t) { return t.id === targetId; });
            return targets.length > 0 ? targets[0] : undefined;
        };

        c3.resize = function (size) {
            __size_width = size ? size.width : null;
            __size_height = size ? size.height : null;
            updateAndRedraw();
        };

        c3.destroy = function () {
            c3.data.targets = undefined;
            c3.data.x = {};
            selectChart.html("");
            window.onresize = null;
        };

        /*-- Load data and init chart with defined functions --*/

        if ('url' in config.data) {
            d3.csv(config.data.url, function (error, data) { init(data); });
        }
        else if ('rows' in config.data) {
            init(convertRowsToData(config.data.rows));
        }
        else if ('columns' in config.data) {
            init(convertColumnsToData(config.data.columns));
        }
        else {
            throw Error('url or rows or columns is required.');
        }

        return c3;
    };

    function categoryAxis() {
        var scale = d3.scale.linear(), orient = "bottom";
        var tickMajorSize = 6, /*tickMinorSize = 6,*/ tickEndSize = 6, tickPadding = 3, tickCentered = false, tickTextNum = 10, tickOffset = 0, tickFormat = null, tickCulling = true;
        var categories = [];
        function axisX(selection, x) {
            selection.attr("transform", function (d) {
                return "translate(" + (x(d) + tickOffset) + ", 0)";
            });
        }
        function axisY(selection, y) {
            selection.attr("transform", function (d) {
                return "translate(0," + y(d) + ")";
            });
        }
        function scaleExtent(domain) {
            var start = domain[0], stop = domain[domain.length - 1];
            return start < stop ? [ start, stop ] : [ stop, start ];
        }
        function generateTicks(domain) {
            var ticks = [];
            for (var i = Math.ceil(domain[0]); i < domain[1]; i++) {
                ticks.push(i);
            }
            if (ticks.length > 0 && ticks[0] > 0) {
                ticks.unshift(ticks[0] - (ticks[1] - ticks[0]));
            }
            return ticks;
        }
        function shouldShowTickText(ticks, i) {
            var length = ticks.length - 1;
            return length <= tickTextNum || i % Math.ceil(length / tickTextNum) === 0;
        }
        function category(i) {
            return i < categories.length ? categories[i] : i;
        }
        function formattedCategory(i) {
            var c = category(i);
            return tickFormat ? tickFormat(c) : c;
        }
        function axis(g) {
            g.each(function () {
                var g = d3.select(this);
                var ticks = generateTicks(scale.domain());
                var tick = g.selectAll(".tick.major").data(ticks, String),
                    tickEnter = tick.enter().insert("g", "path").attr("class", "tick major").style("opacity", 1e-6),
                    tickExit = d3.transition(tick.exit()).style("opacity", 1e-6).remove(),
                    tickUpdate = d3.transition(tick).style("opacity", 1),
                    tickTransform,
                    tickX;
                var range = scale.rangeExtent ? scale.rangeExtent() : scaleExtent(scale.range()),
                    path = g.selectAll(".domain").data([ 0 ]);

                path.enter().append("path").attr("class", "domain");

                var pathUpdate = d3.transition(path);

                var scale1 = scale.copy(), scale0 = this.__chart__ || scale1;
                this.__chart__ = scale1;
                tickEnter.append("line");
                tickEnter.append("text");
                var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text"), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text");

                tickOffset = (scale1(1) - scale1(0)) / 2;
                tickX = tickCentered ? 0 : tickOffset;

                switch (orient) {
                case "bottom":
                    {
                        tickTransform = axisX;
                        lineEnter.attr("y2", tickMajorSize);
                        textEnter.attr("y", Math.max(tickMajorSize, 0) + tickPadding);
                        lineUpdate.attr("x1", tickX).attr("x2", tickX).attr("y2", tickMajorSize);
                        textUpdate.attr("x", 0).attr("y", Math.max(tickMajorSize, 0) + tickPadding);
                        text.attr("dy", ".71em").style("text-anchor", "middle");
                        text.text(function (i) { return shouldShowTickText(ticks, i) ? formattedCategory(i) : ""; });
                        pathUpdate.attr("d", "M" + range[0] + "," + tickEndSize + "V0H" + range[1] + "V" + tickEndSize);
                    }

                    break;
/* TODO: implement
                case "top":
                    {
                        tickTransform = axisX
                        lineEnter.attr("y2", -tickMajorSize)
                        textEnter.attr("y", -(Math.max(tickMajorSize, 0) + tickPadding))
                        lineUpdate.attr("x2", 0).attr("y2", -tickMajorSize)
                        textUpdate.attr("x", 0).attr("y", -(Math.max(tickMajorSize, 0) + tickPadding))
                        text.attr("dy", "0em").style("text-anchor", "middle")
                        pathUpdate.attr("d", "M" + range[0] + "," + -tickEndSize + "V0H" + range[1] + "V" + -tickEndSize)
                        break
                    }
*/
                case "left":
                    {
                        tickTransform = axisY;
                        lineEnter.attr("x2", -tickMajorSize);
                        textEnter.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding));
                        lineUpdate.attr("x2", -tickMajorSize).attr("y2", 0);
                        textUpdate.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding)).attr("y", tickOffset);
                        text.attr("dy", ".32em").style("text-anchor", "end");
                        text.text(function (i) { return shouldShowTickText(ticks, i) ? formattedCategory(i) : ""; });
                        pathUpdate.attr("d", "M" + -tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + -tickEndSize);
                        break;
                    }
/*
                case "right":
                    {
                        tickTransform = axisY
                        lineEnter.attr("x2", tickMajorSize)
                        textEnter.attr("x", Math.max(tickMajorSize, 0) + tickPadding)
                        lineUpdate.attr("x2", tickMajorSize).attr("y2", 0)
                        textUpdate.attr("x", Math.max(tickMajorSize, 0) + tickPadding).attr("y", 0)
                        text.attr("dy", ".32em").style("text-anchor", "start")
                        pathUpdate.attr("d", "M" + tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + tickEndSize)
                        break
                    }
*/
                }
                if (scale.ticks) {
                    tickEnter.call(tickTransform, scale0);
                    tickUpdate.call(tickTransform, scale1);
                    tickExit.call(tickTransform, scale1);
                } else {
                    var dx = scale1.rangeBand() / 2, x = function (d) {
                        return scale1(d) + dx;
                    };
                    tickEnter.call(tickTransform, x);
                    tickUpdate.call(tickTransform, x);
                }
            });
        }
        axis.scale = function (x) {
            if (!arguments.length) { return scale; }
            scale = x;
            return axis;
        };
        axis.orient = function (x) {
            if (!arguments.length) { return orient; }
            orient = x in {top: 1, right: 1, bottom: 1, left: 1} ? x + "" : "bottom";
            return axis;
        };
        axis.categories = function (x) {
            if (!arguments.length) { return categories; }
            categories = x;
            return axis;
        };
        axis.tickCentered = function (x) {
            if (!arguments.length) { return tickCentered; }
            tickCentered = x;
            return axis;
        };
        axis.tickFormat = function (format) {
            if (!arguments.length) { return tickFormat; }
            tickFormat = format;
            return axis;
        };
        axis.tickOffset = function () {
            return tickOffset;
        };
        axis.ticks = function (n) {
            if (!arguments.length) { return tickTextNum; }
            tickTextNum = n;
            return axis;
        };
        axis.tickCulling = function (culling) {
            if (!arguments.length) { return tickCulling; }
            tickCulling = culling;
            return axis;
        };
        return axis;
    }

    function isValue(v) {
        return v || v === 0;
    }
    function isUndefined(v) {
        return typeof v === 'undefined';
    }
    function isDefined(v) {
        return typeof v !== 'undefined';
    }

})(window);
