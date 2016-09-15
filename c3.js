(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
  (factory((global.c3 = global.c3 || {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

d3 = 'default' in d3 ? d3['default'] : d3;

var tickTextCharSize = void 0;
function c3_axis(d3$$1, params) {
    var scale = d3$$1.scale.linear();
    var orient = 'bottom';
    var innerTickSize = 6;
    var tickPadding = 3;
    var tickValues = null;
    var tickFormat = void 0;
    var tickArguments = void 0;

    var tickOffset = 0;
    var tickCulling = true;
    var tickCentered = void 0;

    params = params || {};

    var outerTickSize = params.withOuterTick ? 6 : 0;

    function axisX(selection, x) {
        selection.attr('transform', function (d) {
            return 'translate(' + Math.ceil(x(d) + tickOffset) + ', 0)';
        });
    }
    function axisY(selection, y) {
        selection.attr('transform', function (d) {
            return 'translate(0,' + Math.ceil(y(d)) + ')';
        });
    }
    function scaleExtent(domain) {
        var start = domain[0];
        var stop = domain[domain.length - 1];
        return start < stop ? [start, stop] : [stop, start];
    }
    function generateTicks(scale) {
        // eslint-disable-line no-shadow
        var i = void 0;
        var ticks = [];
        if (scale.ticks) {
            return scale.ticks.apply(scale, tickArguments);
        }
        var domain = scale.domain();
        for (i = Math.ceil(domain[0]); i < domain[1]; i++) {
            ticks.push(i);
        }
        if (ticks.length > 0 && ticks[0] > 0) {
            ticks.unshift(ticks[0] - (ticks[1] - ticks[0]));
        }
        return ticks;
    }
    function copyScale() {
        var newScale = scale.copy();
        var domain = void 0;
        if (params.isCategory) {
            domain = scale.domain();
            newScale.domain([domain[0], domain[1] - 1]);
        }
        return newScale;
    }
    function textFormatted(v) {
        var formatted = tickFormat ? tickFormat(v) : v;
        return typeof formatted !== 'undefined' ? formatted : '';
    }
    function getSizeFor1Char(tick) {
        if (tickTextCharSize) {
            return tickTextCharSize;
        }
        var size = {
            h: 11.5,
            w: 5.5
        };
        tick.select('text').text(textFormatted).each(function (d) {
            var box = this.getBoundingClientRect(),
                text = textFormatted(d),
                h = box.height,
                w = text ? box.width / text.length : undefined;
            if (h && w) {
                size.h = h;
                size.w = w;
            }
        }).text('');
        tickTextCharSize = size;
        return size;
    }
    function transitionise(selection) {
        return params.withoutTransition ? selection : d3$$1.transition(selection);
    }
    function axis(g) {
        g.each(function () {
            var g = axis.g = d3$$1.select(this);

            var scale0 = this.__chart__ || scale,
                scale1 = this.__chart__ = copyScale();

            var ticks = tickValues || generateTicks(scale1),
                tick = g.selectAll('.tick').data(ticks, scale1),
                tickEnter = tick.enter().insert('g', '.domain').attr('class', 'tick').style('opacity', 1e-6),

            // MEMO: No exit transition. The reason is this transition affects max tick width
            // calculation because old tick will be included in the ticks.
            tickExit = tick.exit().remove(),
                tickUpdate = transitionise(tick).style('opacity', 1),
                tickTransform = void 0,
                tickX = void 0,
                tickY = void 0;

            var range = scale.rangeExtent ? scale.rangeExtent() : scaleExtent(scale.range()),
                path = g.selectAll('.domain').data([0]),
                pathUpdate = (path.enter().append('path').attr('class', 'domain'), transitionise(path));
            tickEnter.append('line');
            tickEnter.append('text');

            var lineEnter = tickEnter.select('line'),
                lineUpdate = tickUpdate.select('line'),
                textEnter = tickEnter.select('text'),
                textUpdate = tickUpdate.select('text');

            if (params.isCategory) {
                tickOffset = Math.ceil((scale1(1) - scale1(0)) / 2);
                tickX = tickCentered ? 0 : tickOffset;
                tickY = tickCentered ? tickOffset : 0;
            } else {
                tickOffset = tickX = 0;
            }

            var text = void 0,
                tspan = void 0,
                sizeFor1Char = getSizeFor1Char(g.select('.tick')),
                counts = [];

            var tickLength = Math.max(innerTickSize, 0) + tickPadding,
                isVertical = orient === 'left' || orient === 'right';

            // this should be called only when category axis
            function splitTickText(d, maxWidth) {
                var tickText = textFormatted(d),
                    subtext = void 0,
                    spaceIndex = void 0,
                    textWidth = void 0,
                    splitted = [];

                if (Object.prototype.toString.call(tickText) === '[object Array]') {
                    return tickText;
                }

                if (!maxWidth || maxWidth <= 0) {
                    maxWidth = isVertical ? 95 : params.isCategory ? Math.ceil(scale1(ticks[1]) - scale1(ticks[0])) - 12 : 110;
                }

                function split(splitted, text) {
                    spaceIndex = undefined;
                    for (var i = 1; i < text.length; i++) {
                        if (text.charAt(i) === ' ') {
                            spaceIndex = i;
                        }
                        subtext = text.substr(0, i + 1);
                        textWidth = sizeFor1Char.w * subtext.length;
                        // if text width gets over tick width, split by space index or crrent index
                        if (maxWidth < textWidth) {
                            return split(splitted.concat(text.substr(0, spaceIndex || i)), text.slice(spaceIndex ? spaceIndex + 1 : i));
                        }
                    }
                    return splitted.concat(text);
                }

                return split(splitted, tickText + '');
            }

            function tspanDy(d, i) {
                var dy = sizeFor1Char.h;
                if (i === 0) {
                    if (orient === 'left' || orient === 'right') {
                        dy = -((counts[d.index] - 1) * (sizeFor1Char.h / 2) - 3);
                    } else {
                        dy = '.71em';
                    }
                }
                return dy;
            }

            function tickSize(d) {
                var tickPosition = scale(d) + (tickCentered ? 0 : tickOffset);
                return range[0] < tickPosition && tickPosition < range[1] ? innerTickSize : 0;
            }

            text = tick.select('text');
            tspan = text.selectAll('tspan').data(function (d, i) {
                var splitted = params.tickMultiline ? splitTickText(d, params.tickWidth) : [].concat(textFormatted(d));
                counts[i] = splitted.length;
                return splitted.map(function (s) {
                    return { index: i, splitted: s };
                });
            });
            tspan.enter().append('tspan');
            tspan.exit().remove();
            tspan.text(function (d) {
                return d.splitted;
            });

            var rotate = params.tickTextRotate;

            function textAnchorForText(rotate) {
                if (!rotate) {
                    return 'middle';
                }
                return rotate > 0 ? 'start' : 'end';
            }
            function textTransform(rotate) {
                if (!rotate) {
                    return '';
                }
                return 'rotate(' + rotate + ')';
            }
            function dxForText(rotate) {
                if (!rotate) {
                    return 0;
                }
                return 8 * Math.sin(Math.PI * (rotate / 180));
            }
            function yForText(rotate) {
                if (!rotate) {
                    return tickLength;
                }
                return 11.5 - 2.5 * (rotate / 15) * (rotate > 0 ? 1 : -1);
            }

            switch (orient) {
                case 'bottom':
                    {
                        tickTransform = axisX;
                        lineEnter.attr('y2', innerTickSize);
                        textEnter.attr('y', tickLength);
                        lineUpdate.attr('x1', tickX).attr('x2', tickX).attr('y2', tickSize);
                        textUpdate.attr('x', 0).attr('y', yForText(rotate)).style('text-anchor', textAnchorForText(rotate)).attr('transform', textTransform(rotate));
                        tspan.attr('x', 0).attr('dy', tspanDy).attr('dx', dxForText(rotate));
                        pathUpdate.attr('d', 'M' + range[0] + ',' + outerTickSize + 'V0H' + range[1] + 'V' + outerTickSize);
                        break;
                    }
                case 'top':
                    {
                        // TODO: rotated tick text
                        tickTransform = axisX;
                        lineEnter.attr('y2', -innerTickSize);
                        textEnter.attr('y', -tickLength);
                        lineUpdate.attr('x2', 0).attr('y2', -innerTickSize);
                        textUpdate.attr('x', 0).attr('y', -tickLength);
                        text.style('text-anchor', 'middle');
                        tspan.attr('x', 0).attr('dy', '0em');
                        pathUpdate.attr('d', 'M' + range[0] + ',' + -outerTickSize + 'V0H' + range[1] + 'V' + -outerTickSize);
                        break;
                    }
                case 'left':
                    {
                        tickTransform = axisY;
                        lineEnter.attr('x2', -innerTickSize);
                        textEnter.attr('x', -tickLength);
                        lineUpdate.attr('x2', -innerTickSize).attr('y1', tickY).attr('y2', tickY);
                        textUpdate.attr('x', -tickLength).attr('y', tickOffset);
                        text.style('text-anchor', 'end');
                        tspan.attr('x', -tickLength).attr('dy', tspanDy);
                        pathUpdate.attr('d', 'M' + -outerTickSize + ',' + range[0] + 'H0V' + range[1] + 'H' + -outerTickSize);
                        break;
                    }
                case 'right':
                    {
                        tickTransform = axisY;
                        lineEnter.attr('x2', innerTickSize);
                        textEnter.attr('x', tickLength);
                        lineUpdate.attr('x2', innerTickSize).attr('y2', 0);
                        textUpdate.attr('x', tickLength).attr('y', 0);
                        text.style('text-anchor', 'start');
                        tspan.attr('x', tickLength).attr('dy', tspanDy);
                        pathUpdate.attr('d', 'M' + outerTickSize + ',' + range[0] + 'H0V' + range[1] + 'H' + outerTickSize);
                        break;
                    }
                default:
                    break;
            }
            if (scale1.rangeBand) {
                (function () {
                    var x = scale1,
                        dx = x.rangeBand() / 2;
                    scale0 = scale1 = function scale1(d) {
                        return x(d) + dx;
                    };
                })();
            } else if (scale0.rangeBand) {
                scale0 = scale1;
            } else {
                tickExit.call(tickTransform, scale1);
            }
            tickEnter.call(tickTransform, scale0);
            tickUpdate.call(tickTransform, scale1);
        });
    }
    axis.scale = function (x) {
        if (!arguments.length) {
            return scale;
        }
        scale = x;
        return axis;
    };
    axis.orient = function (x) {
        if (!arguments.length) {
            return orient;
        }
        orient = x in { top: 1, right: 1, bottom: 1, left: 1 } ? x + '' : 'bottom';
        return axis;
    };
    axis.tickFormat = function (format) {
        if (!arguments.length) {
            return tickFormat;
        }
        tickFormat = format;
        return axis;
    };
    axis.tickCentered = function (isCentered) {
        if (!arguments.length) {
            return tickCentered;
        }
        tickCentered = isCentered;
        return axis;
    };
    axis.tickOffset = function () {
        return tickOffset;
    };
    axis.tickInterval = function () {
        var interval = void 0,
            length = void 0;
        if (params.isCategory) {
            interval = tickOffset * 2;
        } else {
            length = axis.g.select('path.domain').node().getTotalLength() - outerTickSize * 2;
            interval = length / axis.g.selectAll('line').size();
        }
        return interval === Infinity ? 0 : interval;
    };
    axis.ticks = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (!arguments.length) {
            return tickArguments;
        }
        tickArguments = args;
        return axis;
    };
    axis.tickCulling = function (culling) {
        if (!arguments.length) {
            return tickCulling;
        }
        tickCulling = culling;
        return axis;
    };
    axis.tickValues = function (x) {
        if (typeof x === 'function') {
            tickValues = function tickValues() {
                return x(scale.domain());
            };
        } else {
            if (!arguments.length) {
                return tickValues;
            }
            tickValues = x;
        }
        return axis;
    };
    return axis;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

































var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

function Axis$$1(owner) {
    API.call(this, owner);
}

inherit(API, Axis$$1);

Axis$$1.prototype.init = function init() {
    var $$ = this.owner;
    var config = $$.config;
    var main = $$.main;
    $$.axes.x = main.append('g').attr('class', CLASS$1.axis + ' ' + CLASS$1.axisX).attr('clip-path', $$.clipPathForXAxis).attr('transform', $$.getTranslate('x')).style('visibility', config.axis_x_show ? 'visible' : 'hidden');
    $$.axes.x.append('text').attr('class', CLASS$1.axisXLabel).attr('transform', config.axis_rotated ? 'rotate(-90)' : '').style('text-anchor', this.textAnchorForXAxisLabel.bind(this));
    $$.axes.y = main.append('g').attr('class', CLASS$1.axis + ' ' + CLASS$1.axisY).attr('clip-path', config.axis_y_inner ? '' : $$.clipPathForYAxis).attr('transform', $$.getTranslate('y')).style('visibility', config.axis_y_show ? 'visible' : 'hidden');
    $$.axes.y.append('text').attr('class', CLASS$1.axisYLabel).attr('transform', config.axis_rotated ? '' : 'rotate(-90)').style('text-anchor', this.textAnchorForYAxisLabel.bind(this));

    $$.axes.y2 = main.append('g').attr('class', CLASS$1.axis + ' ' + CLASS$1.axisY2)
    // clip-path?
    .attr('transform', $$.getTranslate('y2')).style('visibility', config.axis_y2_show ? 'visible' : 'hidden');
    $$.axes.y2.append('text').attr('class', CLASS$1.axisY2Label).attr('transform', config.axis_rotated ? '' : 'rotate(-90)').style('text-anchor', this.textAnchorForY2AxisLabel.bind(this));
};
Axis$$1.prototype.getXAxis = function getXAxis(scale, orient, tickFormat, tickValues, withOuterTick, withoutTransition, withoutRotateTickText) {
    var $$ = this.owner;
    var config = $$.config;
    var axisParams = {
        isCategory: $$.isCategorized(),
        withOuterTick: withOuterTick,
        tickMultiline: config.axis_x_tick_multiline,
        tickWidth: config.axis_x_tick_width,
        tickTextRotate: withoutRotateTickText ? 0 : config.axis_x_tick_rotate,
        withoutTransition: withoutTransition
    };
    var axis = c3_axis($$.d3, axisParams).scale(scale).orient(orient);

    if ($$.isTimeSeries() && tickValues && typeof tickValues !== 'function') {
        tickValues = tickValues.map(function (v) {
            return $$.parseDate(v);
        });
    }

    // Set tick
    axis.tickFormat(tickFormat).tickValues(tickValues);
    if ($$.isCategorized()) {
        axis.tickCentered(config.axis_x_tick_centered);
        if (isEmpty$1(config.axis_x_tick_culling)) {
            config.axis_x_tick_culling = false;
        }
    }

    return axis;
};
Axis$$1.prototype.updateXAxisTickValues = function updateXAxisTickValues(targets, axis) {
    var $$ = this.owner;
    var config = $$.config;
    var tickValues = void 0;
    if (config.axis_x_tick_fit || config.axis_x_tick_count) {
        tickValues = this.generateTickValues($$.mapTargetsToUniqueXs(targets), config.axis_x_tick_count, $$.isTimeSeries());
    }
    if (axis) {
        axis.tickValues(tickValues);
    } else {
        $$.xAxis.tickValues(tickValues);
        $$.subXAxis.tickValues(tickValues);
    }
    return tickValues;
};
Axis$$1.prototype.getYAxis = function getYAxis(scale, orient, tickFormat, tickValues, withOuterTick, withoutTransition, withoutRotateTickText) {
    var $$ = this.owner;
    var config = $$.config;
    var axisParams = {
        withOuterTick: withOuterTick,
        withoutTransition: withoutTransition,
        tickTextRotate: withoutRotateTickText ? 0 : config.axis_y_tick_rotate
    };
    var axis = c3_axis($$.d3, axisParams).scale(scale).orient(orient).tickFormat(tickFormat);
    if ($$.isTimeSeriesY()) {
        axis.ticks($$.d3.time[config.axis_y_tick_time_value], config.axis_y_tick_time_interval);
    } else {
        axis.tickValues(tickValues);
    }
    return axis;
};
Axis$$1.prototype.getId = function getId(id) {
    var config = this.owner.config;
    return id in config.data_axes ? config.data_axes[id] : 'y';
};
Axis$$1.prototype.getXAxisTickFormat = function getXAxisTickFormat() {
    var $$ = this.owner;
    var config = $$.config;
    var format = $$.isTimeSeries() ? // eslint-disable-line no-nested-ternary
    $$.defaultAxisTimeFormat : $$.isCategorized() ? $$.categoryName : function (v) {
        return v < 0 ? v.toFixed(0) : v;
    };
    if (config.axis_x_tick_format) {
        if (isFunction$$1(config.axis_x_tick_format)) {
            format = config.axis_x_tick_format;
        } else if ($$.isTimeSeries()) {
            format = function format(date) {
                return date ? $$.axisTimeFormat(config.axis_x_tick_format)(date) : '';
            };
        }
    }
    return isFunction$$1(format) ? function (v) {
        return format.call($$, v);
    } : format;
};
Axis$$1.prototype.getTickValues = function getTickValues(tickValues, axis) {
    return tickValues ? tickValues : // eslint-disable-line no-nested-ternary,no-unneeded-ternary
    axis ? axis.tickValues() : undefined;
};
Axis$$1.prototype.getXAxisTickValues = function getXAxisTickValues() {
    return this.getTickValues(this.owner.config.axis_x_tick_values, this.owner.xAxis);
};
Axis$$1.prototype.getYAxisTickValues = function getYAxisTickValues() {
    return this.getTickValues(this.owner.config.axis_y_tick_values, this.owner.yAxis);
};
Axis$$1.prototype.getY2AxisTickValues = function getY2AxisTickValues() {
    return this.getTickValues(this.owner.config.axis_y2_tick_values, this.owner.y2Axis);
};
Axis$$1.prototype.getLabelOptionByAxisId = function getLabelOptionByAxisId(axisId) {
    var $$ = this.owner;
    var config = $$.config;
    var option = void 0;
    if (axisId === 'y') {
        option = config.axis_y_label;
    } else if (axisId === 'y2') {
        option = config.axis_y2_label;
    } else if (axisId === 'x') {
        option = config.axis_x_label;
    }
    return option;
};
Axis$$1.prototype.getLabelText = function getLabelText(axisId) {
    var option = this.getLabelOptionByAxisId(axisId);
    return isString$$1(option) ? option : option ? option.text : null; // eslint-disable-line no-nested-ternary,max-len
};
Axis$$1.prototype.setLabelText = function setLabelText(axisId, text) {
    var $$ = this.owner;
    var config = $$.config;
    var option = this.getLabelOptionByAxisId(axisId);
    if (isString$$1(option)) {
        if (axisId === 'y') {
            config.axis_y_label = text;
        } else if (axisId === 'y2') {
            config.axis_y2_label = text;
        } else if (axisId === 'x') {
            config.axis_x_label = text;
        }
    } else if (option) {
        option.text = text;
    }
};
Axis$$1.prototype.getLabelPosition = function getLabelPosition(axisId, defaultPosition) {
    var option = this.getLabelOptionByAxisId(axisId);
    var position = option && (typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object' && option.position ? option.position : defaultPosition;
    return {
        isInner: position.indexOf('inner') >= 0,
        isOuter: position.indexOf('outer') >= 0,
        isLeft: position.indexOf('left') >= 0,
        isCenter: position.indexOf('center') >= 0,
        isRight: position.indexOf('right') >= 0,
        isTop: position.indexOf('top') >= 0,
        isMiddle: position.indexOf('middle') >= 0,
        isBottom: position.indexOf('bottom') >= 0
    };
};
Axis$$1.prototype.getXAxisLabelPosition = function getXAxisLabelPosition() {
    return this.getLabelPosition('x', this.owner.config.axis_rotated ? 'inner-top' : 'inner-right');
};
Axis$$1.prototype.getYAxisLabelPosition = function getYAxisLabelPosition() {
    return this.getLabelPosition('y', this.owner.config.axis_rotated ? 'inner-right' : 'inner-top');
};
Axis$$1.prototype.getY2AxisLabelPosition = function getY2AxisLabelPosition() {
    return this.getLabelPosition('y2', this.owner.config.axis_rotated ? 'inner-right' : 'inner-top');
};
Axis$$1.prototype.getLabelPositionById = function getLabelPositionById(id) {
    return id === 'y2' ? this.getY2AxisLabelPosition() : id === 'y' ? this.getYAxisLabelPosition() : this.getXAxisLabelPosition();
};
Axis$$1.prototype.textForXAxisLabel = function textForXAxisLabel() {
    return this.getLabelText('x');
};
Axis$$1.prototype.textForYAxisLabel = function textForYAxisLabel() {
    return this.getLabelText('y');
};
Axis$$1.prototype.textForY2AxisLabel = function textForY2AxisLabel() {
    return this.getLabelText('y2');
};
Axis$$1.prototype.xForAxisLabel = function xForAxisLabel(forHorizontal, position) {
    var $$ = this.owner;
    if (forHorizontal) {
        return position.isLeft ? 0 : position.isCenter ? $$.width / 2 : $$.width;
    } else {
        return position.isBottom ? -$$.height : position.isMiddle ? -$$.height / 2 : 0;
    }
};
Axis$$1.prototype.dxForAxisLabel = function dxForAxisLabel(forHorizontal, position) {
    if (forHorizontal) {
        return position.isLeft ? '0.5em' : position.isRight ? '-0.5em' : '0';
    } else {
        return position.isTop ? '-0.5em' : position.isBottom ? '0.5em' : '0';
    }
};
Axis$$1.prototype.textAnchorForAxisLabel = function textAnchorForAxisLabel(forHorizontal, position) {
    if (forHorizontal) {
        return position.isLeft ? 'start' : position.isCenter ? 'middle' : 'end';
    } else {
        return position.isBottom ? 'start' : position.isMiddle ? 'middle' : 'end';
    }
};
Axis$$1.prototype.xForXAxisLabel = function xForXAxisLabel() {
    return this.xForAxisLabel(!this.owner.config.axis_rotated, this.getXAxisLabelPosition());
};
Axis$$1.prototype.xForYAxisLabel = function xForYAxisLabel() {
    return this.xForAxisLabel(this.owner.config.axis_rotated, this.getYAxisLabelPosition());
};
Axis$$1.prototype.xForY2AxisLabel = function xForY2AxisLabel() {
    return this.xForAxisLabel(this.owner.config.axis_rotated, this.getY2AxisLabelPosition());
};
Axis$$1.prototype.dxForXAxisLabel = function dxForXAxisLabel() {
    return this.dxForAxisLabel(!this.owner.config.axis_rotated, this.getXAxisLabelPosition());
};
Axis$$1.prototype.dxForYAxisLabel = function dxForYAxisLabel() {
    return this.dxForAxisLabel(this.owner.config.axis_rotated, this.getYAxisLabelPosition());
};
Axis$$1.prototype.dxForY2AxisLabel = function dxForY2AxisLabel() {
    return this.dxForAxisLabel(this.owner.config.axis_rotated, this.getY2AxisLabelPosition());
};
Axis$$1.prototype.dyForXAxisLabel = function dyForXAxisLabel() {
    var $$ = this.owner;
    var config = $$.config;
    var position = this.getXAxisLabelPosition();
    if (config.axis_rotated) {
        return position.isInner ? '1.2em' : -25 - this.getMaxTickWidth('x');
    } else {
        return position.isInner ? '-0.5em' : config.axis_x_height ? config.axis_x_height - 10 : '3em';
    }
};
Axis$$1.prototype.dyForYAxisLabel = function dyForYAxisLabel() {
    var $$ = this.owner;
    var position = this.getYAxisLabelPosition();
    if ($$.config.axis_rotated) {
        return position.isInner ? '-0.5em' : '3em';
    } else {
        return position.isInner ? '1.2em' : -10 - ($$.config.axis_y_inner ? 0 : this.getMaxTickWidth('y') + 10);
    }
};
Axis$$1.prototype.dyForY2AxisLabel = function dyForY2AxisLabel() {
    var $$ = this.owner;
    var position = this.getY2AxisLabelPosition();
    if ($$.config.axis_rotated) {
        return position.isInner ? '1.2em' : '-2.2em';
    } else {
        return position.isInner ? '-0.5em' : 15 + ($$.config.axis_y2_inner ? 0 : this.getMaxTickWidth('y2') + 15);
    }
};
Axis$$1.prototype.textAnchorForXAxisLabel = function textAnchorForXAxisLabel() {
    var $$ = this.owner;
    return this.textAnchorForAxisLabel(!$$.config.axis_rotated, this.getXAxisLabelPosition());
};
Axis$$1.prototype.textAnchorForYAxisLabel = function textAnchorForYAxisLabel() {
    var $$ = this.owner;
    return this.textAnchorForAxisLabel($$.config.axis_rotated, this.getYAxisLabelPosition());
};
Axis$$1.prototype.textAnchorForY2AxisLabel = function textAnchorForY2AxisLabel() {
    var $$ = this.owner;
    return this.textAnchorForAxisLabel($$.config.axis_rotated, this.getY2AxisLabelPosition());
};
Axis$$1.prototype.getMaxTickWidth = function getMaxTickWidth(id, withoutRecompute) {
    var $$ = this.owner;
    var config = $$.config;
    var maxWidth = 0;
    var targetsToShow = void 0;
    var scale = void 0;
    var axis = void 0;
    var dummy = void 0;
    var svg = void 0;
    if (withoutRecompute && $$.currentMaxTickWidths[id]) {
        return $$.currentMaxTickWidths[id];
    }
    if ($$.svg) {
        targetsToShow = $$.filterTargetsToShow($$.data.targets);
        if (id === 'y') {
            scale = $$.y.copy().domain($$.getYDomain(targetsToShow, 'y'));
            axis = this.getYAxis(scale, $$.yOrient, config.axis_y_tick_format, $$.yAxisTickValues, false, true, true);
        } else if (id === 'y2') {
            scale = $$.y2.copy().domain($$.getYDomain(targetsToShow, 'y2'));
            axis = this.getYAxis(scale, $$.y2Orient, config.axis_y2_tick_format, $$.y2AxisTickValues, false, true, true);
        } else {
            scale = $$.x.copy().domain($$.getXDomain(targetsToShow));
            axis = this.getXAxis(scale, $$.xOrient, $$.xAxisTickFormat, $$.xAxisTickValues, false, true, true);
            this.updateXAxisTickValues(targetsToShow, axis);
        }
        dummy = $$.d3.select('body').append('div').classed('c3', true);
        svg = dummy.append('svg').style('visibility', 'hidden').style('position', 'fixed').style('top', 0).style('left', 0);
        svg.append('g').call(axis).each(function () {
            $$.d3.select(this).selectAll('text').each(function () {
                var box = this.getBoundingClientRect();
                if (maxWidth < box.width) {
                    maxWidth = box.width;
                }
            });
            dummy.remove();
        });
    }
    $$.currentMaxTickWidths[id] = maxWidth <= 0 ? $$.currentMaxTickWidths[id] : maxWidth;
    return $$.currentMaxTickWidths[id];
};

Axis$$1.prototype.updateLabels = function updateLabels(withTransition) {
    var $$ = this.owner;
    var axisXLabel = $$.main.select('.' + CLASS$1.axisX + ' .' + CLASS$1.axisXLabel);
    var axisYLabel = $$.main.select('.' + CLASS$1.axisY + ' .' + CLASS$1.axisYLabel);
    var axisY2Label = $$.main.select('.' + CLASS$1.axisY2 + ' .' + CLASS$1.axisY2Label);
    (withTransition ? axisXLabel.transition() : axisXLabel).attr('x', this.xForXAxisLabel.bind(this)).attr('dx', this.dxForXAxisLabel.bind(this)).attr('dy', this.dyForXAxisLabel.bind(this)).text(this.textForXAxisLabel.bind(this));
    (withTransition ? axisYLabel.transition() : axisYLabel).attr('x', this.xForYAxisLabel.bind(this)).attr('dx', this.dxForYAxisLabel.bind(this)).attr('dy', this.dyForYAxisLabel.bind(this)).text(this.textForYAxisLabel.bind(this));
    (withTransition ? axisY2Label.transition() : axisY2Label).attr('x', this.xForY2AxisLabel.bind(this)).attr('dx', this.dxForY2AxisLabel.bind(this)).attr('dy', this.dyForY2AxisLabel.bind(this)).text(this.textForY2AxisLabel.bind(this));
};
Axis$$1.prototype.getPadding = function getPadding(padding, key, defaultValue, domainLength) {
    var p = typeof padding === 'number' ? padding : padding[key];
    if (!isValue$1(p)) {
        return defaultValue;
    }
    if (padding.unit === 'ratio') {
        return padding[key] * domainLength;
    }
    // assume padding is pixels if unit is not specified
    return this.convertPixelsToAxisPadding(p, domainLength);
};
Axis$$1.prototype.convertPixelsToAxisPadding = function convertPixelsToAxisPadding(pixels, domainLength) {
    // eslint-disable-line max-len
    var $$ = this.owner;
    var length = $$.config.axis_rotated ? $$.width : $$.height;
    return domainLength * (pixels / length);
};
Axis$$1.prototype.generateTickValues = function generateTickValues(values, tickCount, forTimeSeries) {
    var tickValues = values;
    var targetCount = void 0;
    var start = void 0;
    var end = void 0;
    var count = void 0;
    var interval = void 0;
    var i = void 0;
    var tickValue = void 0;
    if (tickCount) {
        targetCount = isFunction$$1(tickCount) ? tickCount() : tickCount;
        // compute ticks according to tickCount
        if (targetCount === 1) {
            tickValues = [values[0]];
        } else if (targetCount === 2) {
            tickValues = [values[0], values[values.length - 1]];
        } else if (targetCount > 2) {
            count = targetCount - 2;
            start = values[0];
            end = values[values.length - 1];
            interval = (end - start) / (count + 1);
            // re-construct unique values
            tickValues = [start];
            for (i = 0; i < count; i++) {
                tickValue = +start + interval * (i + 1);
                tickValues.push(forTimeSeries ? new Date(tickValue) : tickValue);
            }
            tickValues.push(end);
        }
    }
    if (!forTimeSeries) {
        tickValues = tickValues.sort(function (a, b) {
            return a - b;
        });
    }
    return tickValues;
};
Axis$$1.prototype.generateTransitions = function generateTransitions(duration) {
    var $$ = this.owner;
    var axes = $$.axes;
    return {
        axisX: duration ? axes.x.transition().duration(duration) : axes.x,
        axisY: duration ? axes.y.transition().duration(duration) : axes.y,
        axisY2: duration ? axes.y2.transition().duration(duration) : axes.y2,
        axisSubX: duration ? axes.subx.transition().duration(duration) : axes.subx
    };
};
Axis$$1.prototype.redraw = function redraw(transitions, isHidden) {
    var $$ = this.owner;
    $$.axes.x.style('opacity', isHidden ? 0 : 1);
    $$.axes.y.style('opacity', isHidden ? 0 : 1);
    $$.axes.y2.style('opacity', isHidden ? 0 : 1);
    $$.axes.subx.style('opacity', isHidden ? 0 : 1);
    transitions.axisX.call($$.xAxis);
    transitions.axisY.call($$.yAxis);
    transitions.axisY2.call($$.y2Axis);
    transitions.axisSubX.call($$.subXAxis);
};

// import {
//     CLASS,
//     isValue,
//     isFunction,
//     isString,
//     isUndefined,
//     isDefined,
//     ceil10,
//     asHalfPixel,
//     diffDomain,
//     isEmpty,
//     notEmpty,
//     getOption,
//     hasValue,
//     sanitise,
//     getPathBox,
//     ChartInternal } from '../chartinternal';

function API(owner) {
    this.owner = owner;
}

/* eslint-disable */
function inherit(base, derived) {
    if (Object.create) {
        derived.prototype = Object.create(base.prototype);
    } else {
        var f = function f() {};
        f.prototype = base.prototype;
        derived.prototype = new f();
    }

    derived.prototype.constructor = derived;

    return derived;
}

var CLASS$1 = {
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
    INCLUDED: '_included_'
};
var generateClass = function generateClass(prefix, targetId) {
    return ' ' + prefix + ' ' + prefix + this.getTargetSelectorSuffix(targetId);
};
var classText = function classText(d) {
    return this.generateClass(CLASS$1.text, d.index);
};
var classTexts = function classTexts(d) {
    return this.generateClass(CLASS$1.texts, d.id);
};
var classShape = function classShape(d) {
    return this.generateClass(CLASS$1.shape, d.index);
};
var classShapes = function classShapes(d) {
    return this.generateClass(CLASS$1.shapes, d.id);
};
var classLine = function classLine(d) {
    return this.classShape(d) + this.generateClass(CLASS$1.line, d.id);
};
var classLines = function classLines(d) {
    return this.classShapes(d) + this.generateClass(CLASS$1.lines, d.id);
};
var classCircle = function classCircle(d) {
    return this.classShape(d) + this.generateClass(CLASS$1.circle, d.index);
};
var classCircles = function classCircles(d) {
    return this.classShapes(d) + this.generateClass(CLASS$1.circles, d.id);
};
var classBar = function classBar(d) {
    return this.classShape(d) + this.generateClass(CLASS$1.bar, d.index);
};
var classBars = function classBars(d) {
    return this.classShapes(d) + this.generateClass(CLASS$1.bars, d.id);
};
var classArc = function classArc(d) {
    return this.classShape(d.data) + this.generateClass(CLASS$1.arc, d.data.id);
};
var classArcs = function classArcs(d) {
    return this.classShapes(d.data) + this.generateClass(CLASS$1.arcs, d.data.id);
};
var classArea = function classArea(d) {
    return this.classShape(d) + this.generateClass(CLASS$1.area, d.id);
};
var classAreas = function classAreas(d) {
    return this.classShapes(d) + this.generateClass(CLASS$1.areas, d.id);
};
var classRegion = function classRegion(d, i) {
    return this.generateClass(CLASS$1.region, i) + ' ' + ('class' in d ? d.class : '');
};
var classEvent = function classEvent(d) {
    return this.generateClass(CLASS$1.eventRect, d.index);
};
var classTarget = function classTarget(id) {
    var $$ = this;
    var additionalClassSuffix = $$.config.data_classes[id],
        additionalClass = '';
    if (additionalClassSuffix) {
        additionalClass = ' ' + CLASS$1.target + '-' + additionalClassSuffix;
    }
    return $$.generateClass(CLASS$1.target, id) + additionalClass;
};
var classFocus = function classFocus(d) {
    return this.classFocused(d) + this.classDefocused(d);
};
var classFocused = function classFocused(d) {
    return ' ' + (this.focusedTargetIds.indexOf(d.id) >= 0 ? CLASS$1.focused : '');
};
var classDefocused = function classDefocused(d) {
    return ' ' + (this.defocusedTargetIds.indexOf(d.id) >= 0 ? CLASS$1.defocused : '');
};
var classChartText = function classChartText(d) {
    return CLASS$1.chartText + this.classTarget(d.id);
};
var classChartLine = function classChartLine(d) {
    return CLASS$1.chartLine + this.classTarget(d.id);
};
var classChartBar = function classChartBar(d) {
    return CLASS$1.chartBar + this.classTarget(d.id);
};
var classChartArc = function classChartArc(d) {
    return CLASS$1.chartArc + this.classTarget(d.data.id);
};
var getTargetSelectorSuffix = function getTargetSelectorSuffix(targetId) {
    return targetId || targetId === 0 ? ('-' + targetId).replace(/[\s?!@#$%^&*()_=+,.<>'":;\[\]\/|~`{}\\]/g, '-') : '';
};
var selectorTarget = function selectorTarget(id, prefix) {
    return (prefix || '') + '.' + CLASS$1.target + this.getTargetSelectorSuffix(id);
};
var selectorTargets = function selectorTargets(ids, prefix) {
    var $$ = this;
    ids = ids || [];
    return ids.length ? ids.map(function (id) {
        return $$.selectorTarget(id, prefix);
    }) : null;
};
var selectorLegend = function selectorLegend(id) {
    return '.' + CLASS$1.legendItem + this.getTargetSelectorSuffix(id);
};
var selectorLegends = function selectorLegends(ids) {
    var $$ = this;
    return ids && ids.length ? ids.map(function (id) {
        return $$.selectorLegend(id);
    }) : null;
};

var isValue$2 = function isValue$2(v) {
    return v || v === 0;
};
var isFunction$1 = function isFunction$1(o) {
    return typeof o === 'function';
};
var isString$1 = function isString$1(o) {
    return typeof o === 'string';
};
var isUndefined$1 = function isUndefined$1(v) {
    return typeof v === 'undefined';
};
var isDefined$2 = function isDefined$2(v) {
    return typeof v !== 'undefined';
};
var ceil10$1 = function ceil10$1(v) {
    return Math.ceil(v / 10) * 10;
};
var asHalfPixel$1 = function asHalfPixel$1(n) {
    return Math.ceil(n) + 0.5;
};
var diffDomain$2 = function diffDomain$2(d) {
    return d[1] - d[0];
};
var isEmpty$2 = function isEmpty$2(o) {
    return typeof o === 'undefined' || o === null || isString$1(o) && o.length === 0 || (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && Object.keys(o).length === 0;
};
var notEmpty$2 = function notEmpty$2(o) {
    isEmpty$2(o);
};
var getOption$2 = function getOption$2(options, key, defaultValue) {
    return isDefined$2(options[key]) ? options[key] : defaultValue;
};
var hasValue$1 = function hasValue$1(dict, value) {
    var found = false;
    Object.keys(dict).forEach(function (key) {
        if (dict[key] === value) {
            found = true;
        }
    });
    return found;
};
var sanitise$1 = function sanitise$1(str) {
    return typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str;
};

var initPie = function initPie() {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config;
    $$.pie = d3$$1.layout.pie().value(function (d) {
        return d.values.reduce(function (a, b) {
            return a + b.value;
        }, 0);
    });
    if (!config.data_order) {
        $$.pie.sort(null);
    }
};

var updateRadius = function updateRadius() {
    var $$ = this,
        config = $$.config,
        w = config.gauge_width || config.donut_width;
    $$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
    $$.radius = $$.radiusExpanded * 0.95;
    $$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
    $$.innerRadius = $$.hasType('donut') || $$.hasType('gauge') ? $$.radius * $$.innerRadiusRatio : 0;
};

var updateArc = function updateArc() {
    var $$ = this;
    $$.svgArc = $$.getSvgArc();
    $$.svgArcExpanded = $$.getSvgArcExpanded();
    $$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);
};

var updateAngle = function updateAngle(d) {
    var $$ = this,
        config = $$.config,
        found = false,
        index = 0,
        gMin = void 0,
        gMax = void 0,
        gTic = void 0,
        gValue = void 0;

    if (!config) {
        return null;
    }

    $$.pie($$.filterTargetsToShow($$.data.targets)).forEach(function (t) {
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
        gTic = Math.PI * (config.gauge_fullCircle ? 2 : 1) / (gMax - gMin);
        gValue = d.value < gMin ? 0 : d.value < gMax ? d.value - gMin : gMax - gMin;
        d.startAngle = config.gauge_startingAngle;
        d.endAngle = d.startAngle + gTic * gValue;
    }
    return found ? d : null;
};

var getSvgArc = function getSvgArc() {
    var $$ = this,
        arc = $$.d3.svg.arc().outerRadius($$.radius).innerRadius($$.innerRadius),
        newArc = function newArc(d, withoutUpdate) {
        var updated = void 0;
        if (withoutUpdate) {
            return arc(d);
        } // for interpolate
        updated = $$.updateAngle(d);
        return updated ? arc(updated) : 'M 0 0';
    };
    // TODO: extends all function
    newArc.centroid = arc.centroid;
    return newArc;
};

var getSvgArcExpanded = function getSvgArcExpanded(rate) {
    var $$ = this,
        arc = $$.d3.svg.arc().outerRadius($$.radiusExpanded * (rate ? rate : 1)).innerRadius($$.innerRadius);
    return function (d) {
        var updated = $$.updateAngle(d);
        return updated ? arc(updated) : 'M 0 0';
    };
};

var getArc = function getArc(d, withoutUpdate, force) {
    return force || this.isArcType(d.data) ? this.svgArc(d, withoutUpdate) : 'M 0 0';
};

var transformForArcLabel = function transformForArcLabel(d) {
    var $$ = this,
        config = $$.config,
        updated = $$.updateAngle(d),
        c = void 0,
        x = void 0,
        y = void 0,
        h = void 0,
        ratio = void 0,
        translate = '';
    if (updated && !$$.hasType('gauge')) {
        c = this.svgArc.centroid(updated);
        x = isNaN(c[0]) ? 0 : c[0];
        y = isNaN(c[1]) ? 0 : c[1];
        h = Math.sqrt(x * x + y * y);
        if ($$.hasType('donut') && config.donut_label_ratio) {
            ratio = isFunction$1(config.donut_label_ratio) ? config.donut_label_ratio(d, $$.radius, h) : config.donut_label_ratio;
        } else if ($$.hasType('pie') && config.pie_label_ratio) {
            ratio = isFunction$1(config.pie_label_ratio) ? config.pie_label_ratio(d, $$.radius, h) : config.pie_label_ratio;
        } else {
            ratio = $$.radius && h ? (36 / $$.radius > 0.375 ? 1.175 - 36 / $$.radius : 0.8) * $$.radius / h : 0;
        }
        translate = 'translate(' + x * ratio + ',' + y * ratio + ')';
    }
    return translate;
};

var getArcRatio = function getArcRatio(d) {
    var $$ = this,
        config = $$.config,
        whole = Math.PI * ($$.hasType('gauge') && !config.gauge_fullCircle ? 1 : 2);
    return d ? (d.endAngle - d.startAngle) / whole : null;
};

var convertToArcData = function convertToArcData(d) {
    return this.addName({
        id: d.data.id,
        value: d.value,
        ratio: this.getArcRatio(d),
        index: d.index
    });
};

var textForArcLabel = function textForArcLabel(d) {
    var $$ = this,
        updated = void 0,
        value = void 0,
        ratio = void 0,
        id = void 0,
        format = void 0;
    if (!$$.shouldShowArcLabel()) {
        return '';
    }
    updated = $$.updateAngle(d);
    value = updated ? updated.value : null;
    ratio = $$.getArcRatio(updated);
    id = d.data.id;
    if (!$$.hasType('gauge') && !$$.meetsArcLabelThreshold(ratio)) {
        return '';
    }
    format = $$.getArcLabelFormat();
    return format ? format(value, ratio, id) : $$.defaultArcValueFormat(value, ratio);
};

var expandArc = function expandArc(targetIds) {
    var $$ = this,
        interval = void 0;

    // MEMO: avoid to cancel transition
    if ($$.transiting) {
        interval = window.setInterval(function () {
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

    $$.svg.selectAll($$.selectorTargets(targetIds, '.' + CLASS$1.chartArc)).each(function (d) {
        if (!$$.shouldExpand(d.data.id)) {
            return;
        }
        $$.d3.select(this).selectAll('path').transition().duration($$.expandDuration(d.data.id)).attr('d', $$.svgArcExpanded).transition().duration($$.expandDuration(d.data.id) * 2).attr('d', $$.svgArcExpandedSub).each(function (d) {
            if ($$.isDonutType(d.data)) {
                // callback here
            }
        });
    });
};

var unexpandArc = function unexpandArc(targetIds) {
    var $$ = this;

    if ($$.transiting) {
        return;
    }

    targetIds = $$.mapToTargetIds(targetIds);

    $$.svg.selectAll($$.selectorTargets(targetIds, '.' + CLASS$1.chartArc)).selectAll('path').transition().duration(function (d) {
        return $$.expandDuration(d.data.id);
    }).attr('d', $$.svgArc);
    $$.svg.selectAll('.' + CLASS$1.arc).style('opacity', 1);
};

var expandDuration = function expandDuration(id) {
    var $$ = this,
        config = $$.config;

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

var shouldExpand = function shouldExpand(id) {
    var $$ = this,
        config = $$.config;
    return $$.isDonutType(id) && config.donut_expand || $$.isGaugeType(id) && config.gauge_expand || $$.isPieType(id) && config.pie_expand;
};

var shouldShowArcLabel = function shouldShowArcLabel() {
    var $$ = this,
        config = $$.config,
        shouldShow = true;
    if ($$.hasType('donut')) {
        shouldShow = config.donut_label_show;
    } else if ($$.hasType('pie')) {
        shouldShow = config.pie_label_show;
    }
    // when gauge, always true
    return shouldShow;
};

var meetsArcLabelThreshold = function meetsArcLabelThreshold(ratio) {
    var $$ = this,
        config = $$.config,
        threshold = $$.hasType('donut') ? config.donut_label_threshold : config.pie_label_threshold;
    return ratio >= threshold;
};

var getArcLabelFormat = function getArcLabelFormat() {
    var $$ = this,
        config = $$.config,
        format = config.pie_label_format;
    if ($$.hasType('gauge')) {
        format = config.gauge_label_format;
    } else if ($$.hasType('donut')) {
        format = config.donut_label_format;
    }
    return format;
};

var getArcTitle = function getArcTitle() {
    var $$ = this;
    return $$.hasType('donut') ? $$.config.donut_title : '';
};

var updateTargetsForArc = function updateTargetsForArc(targets) {
    var $$ = this,
        main = $$.main,
        mainPieUpdate = void 0,
        mainPieEnter = void 0,
        classChartArc$$1 = $$.classChartArc.bind($$),
        classArcs$$1 = $$.classArcs.bind($$),
        classFocus$$1 = $$.classFocus.bind($$);
    mainPieUpdate = main.select('.' + CLASS$1.chartArcs).selectAll('.' + CLASS$1.chartArc).data($$.pie(targets)).attr('class', function (d) {
        return classChartArc$$1(d) + classFocus$$1(d.data);
    });
    mainPieEnter = mainPieUpdate.enter().append('g').attr('class', classChartArc$$1);
    mainPieEnter.append('g').attr('class', classArcs$$1);
    mainPieEnter.append('text').attr('dy', $$.hasType('gauge') ? '-.1em' : '.35em').style('opacity', 0).style('text-anchor', 'middle').style('pointer-events', 'none');
    // MEMO: can not keep same color..., but not bad to update color in redraw
    // mainPieUpdate.exit().remove();
};

var initArc = function initArc() {
    var $$ = this;
    $$.arcs = $$.main.select('.' + CLASS$1.chart).append('g').attr('class', CLASS$1.chartArcs).attr('transform', $$.getTranslate('arc'));
    $$.arcs.append('text').attr('class', CLASS$1.chartArcsTitle).style('text-anchor', 'middle').text($$.getArcTitle());
};

var redrawArc = function redrawArc(duration, durationForExit, withTransform) {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config,
        main = $$.main,
        mainArc = void 0;
    mainArc = main.selectAll('.' + CLASS$1.arcs).selectAll('.' + CLASS$1.arc).data($$.arcData.bind($$));
    mainArc.enter().append('path').attr('class', $$.classArc.bind($$)).style('fill', function (d) {
        return $$.color(d.data);
    }).style('cursor', function (d) {
        return config.interaction_enabled && config.data_selection_isselectable(d) ? 'pointer' : null;
    }).style('opacity', 0).each(function (d) {
        if ($$.isGaugeType(d.data)) {
            d.startAngle = d.endAngle = config.gauge_startingAngle;
        }
        this._current = d;
    });
    mainArc.attr('transform', function (d) {
        return !$$.isGaugeType(d.data) && withTransform ? 'scale(0)' : '';
    }).style('opacity', function (d) {
        return d === this._current ? 0 : 1;
    }).on('mouseover', config.interaction_enabled ? function (d) {
        var updated = void 0,
            arcData = void 0;
        if ($$.transiting) {
            // skip while transiting
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
    } : null).on('mousemove', config.interaction_enabled ? function (d) {
        var updated = $$.updateAngle(d),
            arcData = void 0,
            selectedData = void 0;
        if (updated) {
            arcData = $$.convertToArcData(updated), selectedData = [arcData];
            $$.showTooltip(selectedData, this);
        }
    } : null).on('mouseout', config.interaction_enabled ? function (d) {
        var updated = void 0,
            arcData = void 0;
        if ($$.transiting) {
            // skip while transiting
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
    } : null).on('click', config.interaction_enabled ? function (d, i) {
        var updated = $$.updateAngle(d),
            arcData = void 0;
        if (updated) {
            arcData = $$.convertToArcData(updated);
            if ($$.toggleShape) {
                $$.toggleShape(this, arcData, i);
            }
            $$.config.data_onclick.call($$.api, arcData, this);
        }
    } : null).each(function () {
        $$.transiting = true;
    }).transition().duration(duration).attrTween('d', function (d) {
        var updated = $$.updateAngle(d),
            interpolate = void 0;
        if (!updated) {
            return function () {
                return 'M 0 0';
            };
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
        interpolate = d3$$1.interpolate(this._current, updated);
        this._current = interpolate(0);
        return function (t) {
            var interpolated = interpolate(t);
            interpolated.data = d.data; // data.id will be updated by interporator
            return $$.getArc(interpolated, true);
        };
    }).attr('transform', withTransform ? 'scale(1)' : '').style('fill', function (d) {
        return $$.levelColor ? $$.levelColor(d.data.values[0].value) : $$.color(d.data.id);
    }) // Where gauge reading color would receive customization.
    .style('opacity', 1).call($$.endall, function () {
        $$.transiting = false;
    });
    mainArc.exit().transition().duration(durationForExit).style('opacity', 0).remove();
    main.selectAll('.' + CLASS$1.chartArc).select('text').style('opacity', 0).attr('class', function (d) {
        return $$.isGaugeType(d.data) ? CLASS$1.gaugeValue : '';
    }).text($$.textForArcLabel.bind($$)).attr('transform', $$.transformForArcLabel.bind($$)).style('font-size', function (d) {
        return $$.isGaugeType(d.data) ? Math.round($$.radius / 5) + 'px' : '';
    }).transition().duration(duration).style('opacity', function (d) {
        return $$.isTargetToShow(d.data.id) && $$.isArcType(d.data) ? 1 : 0;
    });
    main.select('.' + CLASS$1.chartArcsTitle).style('opacity', $$.hasType('donut') || $$.hasType('gauge') ? 1 : 0);

    if ($$.hasType('gauge')) {
        $$.arcs.select('.' + CLASS$1.chartArcsBackground).attr('d', function () {
            var d = {
                data: [{ value: config.gauge_max }],
                startAngle: config.gauge_startingAngle,
                endAngle: -1 * config.gauge_startingAngle
            };
            return $$.getArc(d, true, true);
        });
        $$.arcs.select('.' + CLASS$1.chartArcsGaugeUnit).attr('dy', '.75em').text(config.gauge_label_show ? config.gauge_units : '');
        $$.arcs.select('.' + CLASS$1.chartArcsGaugeMin).attr('dx', -1 * ($$.innerRadius + ($$.radius - $$.innerRadius) / (config.gauge_fullCircle ? 1 : 2)) + 'px').attr('dy', '1.2em').text(config.gauge_label_show ? config.gauge_min : '');
        $$.arcs.select('.' + CLASS$1.chartArcsGaugeMax).attr('dx', $$.innerRadius + ($$.radius - $$.innerRadius) / (config.gauge_fullCircle ? 1 : 2) + 'px').attr('dy', '1.2em').text(config.gauge_label_show ? config.gauge_max : '');
    }
};
var initGauge = function initGauge() {
    var arcs = this.arcs;
    if (this.hasType('gauge')) {
        arcs.append('path').attr('class', CLASS$1.chartArcsBackground);
        arcs.append('text').attr('class', CLASS$1.chartArcsGaugeUnit).style('text-anchor', 'middle').style('pointer-events', 'none');
        arcs.append('text').attr('class', CLASS$1.chartArcsGaugeMin).style('text-anchor', 'middle').style('pointer-events', 'none');
        arcs.append('text').attr('class', CLASS$1.chartArcsGaugeMax).style('text-anchor', 'middle').style('pointer-events', 'none');
    }
};
var getGaugeLabelHeight = function getGaugeLabelHeight() {
    return this.config.gauge_label_show ? 20 : 0;
};

var hasCaches = function hasCaches(ids) {
    for (var i = 0; i < ids.length; i++) {
        if (!(ids[i] in this.cache)) {
            return false;
        }
    }
    return true;
};

var addCache = function addCache(id, target) {
    this.cache[id] = this.cloneTarget(target);
};

var getCaches = function getCaches(ids) {
    var targets = [],
        i = void 0;
    for (i = 0; i < ids.length; i++) {
        if (ids[i] in this.cache) {
            targets.push(this.cloneTarget(this.cache[ids[i]]));
        }
    }
    return targets;
};

var categoryName = function categoryName(i) {
    var config = this.config;
    return i < config.axis_x_categories.length ? config.axis_x_categories[i] : i;
};

var getClipPath = function getClipPath(id) {
    var isIE9 = window.navigator.appVersion.toLowerCase().indexOf('msie 9.') >= 0;
    return 'url(' + (isIE9 ? '' : document.URL.split('#')[0]) + '#' + id + ')';
};
var appendClip = function appendClip(parent, id) {
    return parent.append('clipPath').attr('id', id).append('rect');
};
var getAxisClipX = function getAxisClipX(forHorizontal) {
    // axis line width + padding for left
    var left = Math.max(30, this.margin.left);
    return forHorizontal ? -(1 + left) : -(left - 1);
};
var getAxisClipY = function getAxisClipY(forHorizontal) {
    return forHorizontal ? -20 : -this.margin.top;
};
var getXAxisClipX = function getXAxisClipX() {
    var $$ = this;
    return $$.getAxisClipX(!$$.config.axis_rotated);
};
var getXAxisClipY = function getXAxisClipY() {
    var $$ = this;
    return $$.getAxisClipY(!$$.config.axis_rotated);
};
var getYAxisClipX = function getYAxisClipX() {
    var $$ = this;
    return $$.config.axis_y_inner ? -1 : $$.getAxisClipX($$.config.axis_rotated);
};
var getYAxisClipY = function getYAxisClipY() {
    var $$ = this;
    return $$.getAxisClipY($$.config.axis_rotated);
};
var getAxisClipWidth = function getAxisClipWidth(forHorizontal) {
    var $$ = this,
        left = Math.max(30, $$.margin.left),
        right = Math.max(30, $$.margin.right);
    // width + axis line width + padding for left/right
    return forHorizontal ? $$.width + 2 + left + right : $$.margin.left + 20;
};
var getAxisClipHeight = function getAxisClipHeight(forHorizontal) {
    // less than 20 is not enough to show the axis label 'outer' without legend
    return (forHorizontal ? this.margin.bottom : this.margin.top + this.height) + 20;
};
var getXAxisClipWidth = function getXAxisClipWidth() {
    var $$ = this;
    return $$.getAxisClipWidth(!$$.config.axis_rotated);
};
var getXAxisClipHeight = function getXAxisClipHeight() {
    var $$ = this;
    return $$.getAxisClipHeight(!$$.config.axis_rotated);
};
var getYAxisClipWidth = function getYAxisClipWidth() {
    var $$ = this;
    return $$.getAxisClipWidth($$.config.axis_rotated) + ($$.config.axis_y_inner ? 20 : 0);
};
var getYAxisClipHeight = function getYAxisClipHeight() {
    var $$ = this;
    return $$.getAxisClipHeight($$.config.axis_rotated);
};

var generateColor = function generateColor() {
    var $$ = this,
        config = $$.config,
        d3$$1 = $$.d3,
        colors = config.data_colors,
        pattern = notEmpty$2(config.color_pattern) ? config.color_pattern : d3$$1.scale.category10().range(),
        callback = config.data_color,
        ids = [];

    return function (d) {
        var id = d.id || d.data && d.data.id || d,
            color = void 0;

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
                    if (ids.indexOf(id) < 0) {
                        ids.push(id);
                    }
                    color = pattern[ids.indexOf(id) % pattern.length];
                    colors[id] = color;
                }
        return callback instanceof Function ? callback(color, d) : color;
    };
};
var generateLevelColor = function generateLevelColor() {
    var $$ = this,
        config = $$.config,
        colors = config.color_pattern,
        threshold = config.color_threshold,
        asValue = threshold.unit === 'value',
        values = threshold.values && threshold.values.length ? threshold.values : [],
        max = threshold.max || 100;
    return notEmpty$2(config.color_threshold) ? function (value) {
        var i = void 0,
            v = void 0,
            color = colors[colors.length - 1];
        for (i = 0; i < values.length; i++) {
            v = asValue ? value : value * 100 / max;
            if (v < values[i]) {
                color = colors[i];
                break;
            }
        }
        return color;
    } : null;
};

var getDefaultConfig = function getDefaultConfig() {
    var config = {
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
        zoom_onzoom: function zoom_onzoom() {},
        zoom_onzoomstart: function zoom_onzoomstart() {},
        zoom_onzoomend: function zoom_onzoomend() {},

        zoom_x_min: undefined,
        zoom_x_max: undefined,
        interaction_brighten: true,
        interaction_enabled: true,
        onmouseover: function onmouseover() {},
        onmouseout: function onmouseout() {},
        onresize: function onresize() {},
        onresized: function onresized() {},
        oninit: function oninit() {},
        onrendered: function onrendered() {},

        transition_duration: 350,
        data_x: undefined,
        data_xs: {},
        data_xFormat: '%Y-%m-%d',
        data_xLocaltime: true,
        data_xSort: true,
        data_idConverter: function data_idConverter(id) {
            return id;
        },

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
        data_selection_isselectable: function data_selection_isselectable() {
            return true;
        },

        data_selection_multiple: true,
        data_selection_draggable: false,
        data_onclick: function data_onclick() {},
        data_onmouseover: function data_onmouseover() {},
        data_onmouseout: function data_onmouseout() {},
        data_onselected: function data_onselected() {},
        data_onunselected: function data_onunselected() {},

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
        subchart_onbrush: function subchart_onbrush() {},

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
        tooltip_contents: function tooltip_contents(d, defaultTitleFormat, defaultValueFormat, color) {
            return this.getTooltipContent ? this.getTooltipContent(d, defaultTitleFormat, defaultValueFormat, color) : '';
        },

        tooltip_init_show: false,
        tooltip_init_x: 0,
        tooltip_init_position: { top: '0px', left: '50px' },
        tooltip_onshow: function tooltip_onshow() {},
        tooltip_onhide: function tooltip_onhide() {},

        // title
        title_text: undefined,
        title_padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
        title_position: 'top-center',
        // TouchEvent configuration
        touch_tap_radius: 20, // touch movement must be less than this to be a 'tap'
        touch_tap_delay: 500 };

    Object.keys(this.additionalConfig).forEach(function (key) {
        config[key] = this.additionalConfig[key];
    }, this);

    return config;
};
var additionalConfig = {};

var loadConfig = function loadConfig(config) {
    var this_config = this.config,
        target = void 0,
        keys = void 0,
        read = void 0;
    function find() {
        var key = keys.shift();
        //        console.log("key =>", key, ", target =>", target);
        if (key && target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && key in target) {
            target = target[key];
            return find();
        } else if (!key) {
            return target;
        } else {
            return undefined;
        }
    }
    Object.keys(this_config).forEach(function (key) {
        target = config;
        keys = key.split('_');
        read = find();
        //        console.log("CONFIG : ", key, read);
        if (isDefined$2(read)) {
            this_config[key] = read;
        }
    });
};

var convertUrlToData = function convertUrlToData(url, mimeType, headers, keys, done) {
    var $$ = this,
        type = mimeType ? mimeType : 'csv';
    var req = $$.d3.xhr(url);
    if (headers) {
        Object.keys(headers).forEach(function (header) {
            req.header(header, headers[header]);
        });
    }
    req.get(function (error, data) {
        var d = void 0;
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
var convertXsvToData = function convertXsvToData(xsv, parser) {
    var rows = parser.parseRows(xsv),
        d = void 0;
    if (rows.length === 1) {
        d = [{}];
        rows[0].forEach(function (id) {
            d[0][id] = null;
        });
    } else {
        d = parser.parse(xsv);
    }
    return d;
};
var convertCsvToData = function convertCsvToData(csv) {
    return this.convertXsvToData(csv, this.d3.csv);
};
var convertTsvToData = function convertTsvToData(tsv) {
    return this.convertXsvToData(tsv, this.d3.tsv);
};
var convertJsonToData = function convertJsonToData(json, keys) {
    var $$ = this,
        new_rows = [],
        targetKeys = void 0,
        data = void 0;
    if (keys) {
        // when keys specified, json would be an array that includes objects
        if (keys.x) {
            targetKeys = keys.value.concat(keys.x);
            $$.config.data_x = keys.x;
        } else {
            targetKeys = keys.value;
        }
        new_rows.push(targetKeys);
        json.forEach(function (o) {
            var new_row = [];
            targetKeys.forEach(function (key) {
                // convert undefined to null because undefined data will be removed in convertDataToTargets()
                var v = $$.findValueInJson(o, key);
                if (isUndefined$1(v)) {
                    v = null;
                }
                new_row.push(v);
            });
            new_rows.push(new_row);
        });
        data = $$.convertRowsToData(new_rows);
    } else {
        Object.keys(json).forEach(function (key) {
            new_rows.push([key].concat(json[key]));
        });
        data = $$.convertColumnsToData(new_rows);
    }
    return data;
};
var findValueInJson = function findValueInJson(object, path) {
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties (replace [] with .)
    path = path.replace(/^\./, ''); // strip a leading dot
    var pathArray = path.split('.');
    for (var i = 0; i < pathArray.length; ++i) {
        var k = pathArray[i];
        if (k in object) {
            object = object[k];
        } else {
            return;
        }
    }
    return object;
};
var convertRowsToData = function convertRowsToData(rows) {
    var keys = rows[0],
        new_row = {},
        new_rows = [],
        i = void 0,
        j = void 0;
    for (i = 1; i < rows.length; i++) {
        new_row = {};
        for (j = 0; j < rows[i].length; j++) {
            if (isUndefined$1(rows[i][j])) {
                throw new Error('Source data is missing a component at (' + i + ',' + j + ')!');
            }
            new_row[keys[j]] = rows[i][j];
        }
        new_rows.push(new_row);
    }
    return new_rows;
};
var convertColumnsToData = function convertColumnsToData(columns) {
    var new_rows = [],
        i = void 0,
        j = void 0,
        key = void 0;
    for (i = 0; i < columns.length; i++) {
        key = columns[i][0];
        for (j = 1; j < columns[i].length; j++) {
            if (isUndefined$1(new_rows[j - 1])) {
                new_rows[j - 1] = {};
            }
            if (isUndefined$1(columns[i][j])) {
                throw new Error('Source data is missing a component at (' + i + ',' + j + ')!');
            }
            new_rows[j - 1][key] = columns[i][j];
        }
    }
    return new_rows;
};
var convertDataToTargets = function convertDataToTargets(data, appendXs) {
    var $$ = this,
        config = $$.config,
        ids = $$.d3.keys(data[0]).filter($$.isNotX, $$),
        xs = $$.d3.keys(data[0]).filter($$.isX, $$),
        targets = void 0;

    // save x for update data by load when custom x and c3.x API
    ids.forEach(function (id) {
        var xKey = $$.getXKey(id);

        if ($$.isCustomX() || $$.isTimeSeries()) {
            // if included in input data
            if (xs.indexOf(xKey) >= 0) {
                $$.data.xs[id] = (appendXs && $$.data.xs[id] ? $$.data.xs[id] : []).concat(data.map(function (d) {
                    return d[xKey];
                }).filter(isValue$2).map(function (rawX, i) {
                    return $$.generateTargetX(rawX, id, i);
                }));
            }
            // if not included in input data, find from preloaded data of other id's x
            else if (config.data_x) {
                    $$.data.xs[id] = $$.getOtherTargetXs();
                }
                // if not included in input data, find from preloaded data
                else if (notEmpty$2(config.data_xs)) {
                        $$.data.xs[id] = $$.getXValuesOfXKey(xKey, $$.data.targets);
                    }
            // MEMO: if no x included, use same x of current will be used
        } else {
            $$.data.xs[id] = data.map(function (d, i) {
                return i;
            });
        }
    });

    // check x is defined
    ids.forEach(function (id) {
        if (!$$.data.xs[id]) {
            throw new Error('x is not defined for id = "' + id + '".');
        }
    });

    // convert to target
    targets = ids.map(function (id, index) {
        var convertedId = config.data_idConverter(id);
        return {
            id: convertedId,
            id_org: id,
            values: data.map(function (d, i) {
                var xKey = $$.getXKey(id),
                    rawX = d[xKey],
                    value = d[id] !== null && !isNaN(d[id]) ? +d[id] : null,
                    x = void 0;
                // use x as categories if custom x and categorized
                if ($$.isCustomX() && $$.isCategorized() && index === 0 && !isUndefined$1(rawX)) {
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
                if (isUndefined$1(d[id]) || $$.data.xs[id].length <= i) {
                    x = undefined;
                }
                return { x: x, value: value, id: convertedId };
            }).filter(function (v) {
                return isDefined$2(v.x);
            })
        };
    });

    // finish targets
    targets.forEach(function (t) {
        var i = void 0;
        // sort values by its x
        if (config.data_xSort) {
            t.values = t.values.sort(function (v1, v2) {
                var x1 = v1.x || v1.x === 0 ? v1.x : Infinity,
                    x2 = v2.x || v2.x === 0 ? v2.x : Infinity;
                return x1 - x2;
            });
        }
        // indexing each value
        i = 0;
        t.values.forEach(function (v) {
            v.index = i++;
        });
        // this needs to be sorted because its index and value.index is identical
        $$.data.xs[t.id].sort(function (v1, v2) {
            return v1 - v2;
        });
    });

    // cache information about values
    $$.hasNegativeValue = $$.hasNegativeValueInTargets(targets);
    $$.hasPositiveValue = $$.hasPositiveValueInTargets(targets);

    // set target types
    if (config.data_type) {
        $$.setTargetType($$.mapToIds(targets).filter(function (id) {
            return !(id in config.data_types);
        }), config.data_type);
    }

    // cache as original id keyed
    targets.forEach(function (d) {
        $$.addCache(d.id_org, d);
    });

    return targets;
};

var isX = function isX(key) {
    var $$ = this,
        config = $$.config;
    return config.data_x && key === config.data_x || notEmpty$2(config.data_xs) && hasValue$1(config.data_xs, key);
};
var isNotX = function isNotX(key) {
    return !this.isX(key);
};
var getXKey = function getXKey(id) {
    var $$ = this,
        config = $$.config;
    return config.data_x ? config.data_x : notEmpty$2(config.data_xs) ? config.data_xs[id] : null;
};
var getXValuesOfXKey = function getXValuesOfXKey(key, targets) {
    var $$ = this,
        xValues = void 0,
        ids = targets && notEmpty$2(targets) ? $$.mapToIds(targets) : [];
    ids.forEach(function (id) {
        if ($$.getXKey(id) === key) {
            xValues = $$.data.xs[id];
        }
    });
    return xValues;
};
var getIndexByX = function getIndexByX(x) {
    var $$ = this,
        data = $$.filterByX($$.data.targets, x);
    return data.length ? data[0].index : null;
};
var getXValue = function getXValue(id, i) {
    var $$ = this;
    return id in $$.data.xs && $$.data.xs[id] && isValue$2($$.data.xs[id][i]) ? $$.data.xs[id][i] : i;
};
var getOtherTargetXs = function getOtherTargetXs() {
    var $$ = this,
        idsForX = Object.keys($$.data.xs);
    return idsForX.length ? $$.data.xs[idsForX[0]] : null;
};
var getOtherTargetX = function getOtherTargetX(index) {
    var xs = this.getOtherTargetXs();
    return xs && index < xs.length ? xs[index] : null;
};
var addXs = function addXs(xs) {
    var $$ = this;
    Object.keys(xs).forEach(function (id) {
        $$.config.data_xs[id] = xs[id];
    });
};
var hasMultipleX = function hasMultipleX(xs) {
    return this.d3.set(Object.keys(xs).map(function (id) {
        return xs[id];
    })).size() > 1;
};
var isMultipleX = function isMultipleX() {
    return notEmpty$2(this.config.data_xs) || !this.config.data_xSort || this.hasType('scatter');
};
var addName = function addName(data) {
    var $$ = this,
        name = void 0;
    if (data) {
        name = $$.config.data_names[data.id];
        data.name = name !== undefined ? name : data.id;
    }
    return data;
};
var getValueOnIndex = function getValueOnIndex(values, index) {
    var valueOnIndex = values.filter(function (v) {
        return v.index === index;
    });
    return valueOnIndex.length ? valueOnIndex[0] : null;
};
var updateTargetX = function updateTargetX(targets, x) {
    var $$ = this;
    targets.forEach(function (t) {
        t.values.forEach(function (v, i) {
            v.x = $$.generateTargetX(x[i], t.id, i);
        });
        $$.data.xs[t.id] = x;
    });
};
var updateTargetXs = function updateTargetXs(targets, xs) {
    var $$ = this;
    targets.forEach(function (t) {
        if (xs[t.id]) {
            $$.updateTargetX([t], xs[t.id]);
        }
    });
};
var generateTargetX = function generateTargetX(rawX, id, index) {
    var $$ = this,
        x = void 0;
    if ($$.isTimeSeries()) {
        x = rawX ? $$.parseDate(rawX) : $$.parseDate($$.getXValue(id, index));
    } else if ($$.isCustomX() && !$$.isCategorized()) {
        x = isValue$2(rawX) ? +rawX : $$.getXValue(id, index);
    } else {
        x = index;
    }
    return x;
};
var cloneTarget = function cloneTarget(target) {
    return {
        id: target.id,
        id_org: target.id_org,
        values: target.values.map(function (d) {
            return { x: d.x, value: d.value, id: d.id };
        })
    };
};
var updateXs = function updateXs() {
    var $$ = this;
    if ($$.data.targets.length) {
        $$.xs = [];
        $$.data.targets[0].values.forEach(function (v) {
            $$.xs[v.index] = v.x;
        });
    }
};
var getPrevX = function getPrevX(i) {
    var x = this.xs[i - 1];
    return typeof x !== 'undefined' ? x : null;
};
var getNextX = function getNextX(i) {
    var x = this.xs[i + 1];
    return typeof x !== 'undefined' ? x : null;
};
var getMaxDataCount = function getMaxDataCount() {
    var $$ = this;
    return $$.d3.max($$.data.targets, function (t) {
        return t.values.length;
    });
};
var getMaxDataCountTarget = function getMaxDataCountTarget(targets) {
    var length = targets.length,
        max = 0,
        maxTarget = void 0;
    if (length > 1) {
        targets.forEach(function (t) {
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
var getEdgeX = function getEdgeX(targets) {
    var $$ = this;
    return !targets.length ? [0, 0] : [$$.d3.min(targets, function (t) {
        return t.values[0].x;
    }), $$.d3.max(targets, function (t) {
        return t.values[t.values.length - 1].x;
    })];
};
var mapToIds = function mapToIds(targets) {
    return targets.map(function (d) {
        return d.id;
    });
};
var mapToTargetIds = function mapToTargetIds(ids) {
    var $$ = this;
    return ids ? [].concat(ids) : $$.mapToIds($$.data.targets);
};
var hasTarget = function hasTarget(targets, id) {
    var ids = this.mapToIds(targets),
        i = void 0;
    for (i = 0; i < ids.length; i++) {
        if (ids[i] === id) {
            return true;
        }
    }
    return false;
};
var isTargetToShow = function isTargetToShow(targetId) {
    return this.hiddenTargetIds.indexOf(targetId) < 0;
};
var isLegendToShow = function isLegendToShow(targetId) {
    return this.hiddenLegendIds.indexOf(targetId) < 0;
};
var filterTargetsToShow = function filterTargetsToShow(targets) {
    var $$ = this;
    return targets.filter(function (t) {
        return $$.isTargetToShow(t.id);
    });
};
var mapTargetsToUniqueXs = function mapTargetsToUniqueXs(targets) {
    var $$ = this;
    var xs = $$.d3.set($$.d3.merge(targets.map(function (t) {
        return t.values.map(function (v) {
            return +v.x;
        });
    }))).values();
    xs = $$.isTimeSeries() ? xs.map(function (x) {
        return new Date(+x);
    }) : xs.map(function (x) {
        return +x;
    });
    return xs.sort(function (a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    });
};
var addHiddenTargetIds = function addHiddenTargetIds(targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.concat(targetIds);
};
var removeHiddenTargetIds = function removeHiddenTargetIds(targetIds) {
    this.hiddenTargetIds = this.hiddenTargetIds.filter(function (id) {
        return targetIds.indexOf(id) < 0;
    });
};
var addHiddenLegendIds = function addHiddenLegendIds(targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.concat(targetIds);
};
var removeHiddenLegendIds = function removeHiddenLegendIds(targetIds) {
    this.hiddenLegendIds = this.hiddenLegendIds.filter(function (id) {
        return targetIds.indexOf(id) < 0;
    });
};
var getValuesAsIdKeyed = function getValuesAsIdKeyed(targets) {
    var ys = {};
    targets.forEach(function (t) {
        ys[t.id] = [];
        t.values.forEach(function (v) {
            ys[t.id].push(v.value);
        });
    });
    return ys;
};
var checkValueInTargets = function checkValueInTargets(targets, checker) {
    var ids = Object.keys(targets),
        i = void 0,
        j = void 0,
        values = void 0;
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
var hasNegativeValueInTargets = function hasNegativeValueInTargets(targets) {
    return this.checkValueInTargets(targets, function (v) {
        return v < 0;
    });
};
var hasPositiveValueInTargets = function hasPositiveValueInTargets(targets) {
    return this.checkValueInTargets(targets, function (v) {
        return v > 0;
    });
};
var isOrderDesc = function isOrderDesc() {
    var config = this.config;
    return typeof config.data_order === 'string' && config.data_order.toLowerCase() === 'desc';
};
var isOrderAsc = function isOrderAsc() {
    var config = this.config;
    return typeof config.data_order === 'string' && config.data_order.toLowerCase() === 'asc';
};
var orderTargets = function orderTargets(targets) {
    var $$ = this,
        config = $$.config,
        orderAsc = $$.isOrderAsc(),
        orderDesc = $$.isOrderDesc();
    if (orderAsc || orderDesc) {
        targets.sort(function (t1, t2) {
            var reducer = function reducer(p, c) {
                return p + Math.abs(c.value);
            };
            var t1Sum = t1.values.reduce(reducer, 0),
                t2Sum = t2.values.reduce(reducer, 0);
            return orderAsc ? t2Sum - t1Sum : t1Sum - t2Sum;
        });
    } else if (isFunction$1(config.data_order)) {
        targets.sort(config.data_order);
    } // TODO: accept name array for order
    return targets;
};
var filterByX = function filterByX(targets, x) {
    return this.d3.merge(targets.map(function (t) {
        return t.values;
    })).filter(function (v) {
        return v.x - x === 0;
    });
};
var filterRemoveNull = function filterRemoveNull(data) {
    return data.filter(function (d) {
        return isValue$2(d.value);
    });
};
var filterByXDomain = function filterByXDomain(targets, xDomain) {
    return targets.map(function (t) {
        return {
            id: t.id,
            id_org: t.id_org,
            values: t.values.filter(function (v) {
                return xDomain[0] <= v.x && v.x <= xDomain[1];
            })
        };
    });
};
var hasDataLabel = function hasDataLabel() {
    var config = this.config;
    if (typeof config.data_labels === 'boolean' && config.data_labels) {
        return true;
    } else if (_typeof(config.data_labels) === 'object' && notEmpty$2(config.data_labels)) {
        return true;
    }
    return false;
};
var getDataLabelLength = function getDataLabelLength(min, max, key) {
    var $$ = this,
        lengths = [0, 0],
        paddingCoef = 1.3;
    $$.selectChart.select('svg').selectAll('.dummy').data([min, max]).enter().append('text').text(function (d) {
        return $$.dataLabelFormat(d.id)(d);
    }).each(function (d, i) {
        lengths[i] = this.getBoundingClientRect()[key] * paddingCoef;
    }).remove();
    return lengths;
};
var isNoneArc = function isNoneArc(d) {
    return this.hasTarget(this.data.targets, d.id);
};
var isArc = function isArc(d) {
    return 'data' in d && this.hasTarget(this.data.targets, d.data.id);
};
var findSameXOfValues = function findSameXOfValues(values, index) {
    var i = void 0,
        targetX = values[index].x,
        sames = [];
    for (i = index - 1; i >= 0; i--) {
        if (targetX !== values[i].x) {
            break;
        }
        sames.push(values[i]);
    }
    for (i = index; i < values.length; i++) {
        if (targetX !== values[i].x) {
            break;
        }
        sames.push(values[i]);
    }
    return sames;
};

var findClosestFromTargets = function findClosestFromTargets(targets, pos) {
    var $$ = this,
        candidates = void 0;

    // map to array of closest points of each target
    candidates = targets.map(function (target) {
        return $$.findClosest(target.values, pos);
    });

    // decide closest point and return
    return $$.findClosest(candidates, pos);
};
var findClosest = function findClosest(values, pos) {
    var $$ = this,
        minDist = $$.config.point_sensitivity,
        closest = void 0;

    // find mouseovering bar
    values.filter(function (v) {
        return v && $$.isBarType(v.id);
    }).forEach(function (v) {
        var shape = $$.main.select('.' + CLASS$1.bars + $$.getTargetSelectorSuffix(v.id) + ' .' + CLASS$1.bar + '-' + v.index).node();
        if (!closest && $$.isWithinBar(shape)) {
            closest = v;
        }
    });

    // find closest point from non-bar
    values.filter(function (v) {
        return v && !$$.isBarType(v.id);
    }).forEach(function (v) {
        var d = $$.dist(v, pos);
        if (d < minDist) {
            minDist = d;
            closest = v;
        }
    });

    return closest;
};
var dist = function dist(data, pos) {
    var $$ = this,
        config = $$.config,
        xIndex = config.axis_rotated ? 1 : 0,
        yIndex = config.axis_rotated ? 0 : 1,
        y = $$.circleY(data, data.index),
        x = $$.x(data.x);
    return Math.sqrt(Math.pow(x - pos[xIndex], 2) + Math.pow(y - pos[yIndex], 2));
};
var convertValuesToStep = function convertValuesToStep(values) {
    var converted = [].concat(values),
        i = void 0;

    if (!this.isCategorized()) {
        return values;
    }

    for (i = values.length + 1; 0 < i; i--) {
        converted[i] = converted[i - 1];
    }

    converted[0] = {
        x: converted[0].x - 1,
        value: converted[0].value,
        id: converted[0].id
    };
    converted[values.length + 1] = {
        x: converted[values.length].x + 1,
        value: converted[values.length].value,
        id: converted[values.length].id
    };

    return converted;
};
var updateDataAttributes = function updateDataAttributes(name, attrs) {
    var $$ = this,
        config = $$.config,
        current = config['data_' + name];
    if (typeof attrs === 'undefined') {
        return current;
    }
    Object.keys(attrs).forEach(function (id) {
        current[id] = attrs[id];
    });
    $$.redraw({ withLegend: true });
    return current;
};

var load = function load(targets, args) {
    var $$ = this;
    if (targets) {
        // filter loading targets if needed
        if (args.filter) {
            targets = targets.filter(args.filter);
        }
        // set type if args.types || args.type specified
        if (args.type || args.types) {
            targets.forEach(function (t) {
                var type = args.types && args.types[t.id] ? args.types[t.id] : args.type;
                $$.setTargetType(t.id, type);
            });
        }
        // Update/Add data
        $$.data.targets.forEach(function (d) {
            for (var i = 0; i < targets.length; i++) {
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

    if (args.done) {
        args.done();
    }
};
var loadFromArgs = function loadFromArgs(args) {
    var $$ = this;
    if (args.data) {
        $$.load($$.convertDataToTargets(args.data), args);
    } else if (args.url) {
        $$.convertUrlToData(args.url, args.mimeType, args.headers, args.keys, function (data) {
            $$.load($$.convertDataToTargets(data), args);
        });
    } else if (args.json) {
        $$.load($$.convertDataToTargets($$.convertJsonToData(args.json, args.keys)), args);
    } else if (args.rows) {
        $$.load($$.convertDataToTargets($$.convertRowsToData(args.rows)), args);
    } else if (args.columns) {
        $$.load($$.convertDataToTargets($$.convertColumnsToData(args.columns)), args);
    } else {
        $$.load(null, args);
    }
};
var unload = function unload(targetIds, done) {
    var $$ = this;
    if (!done) {
        done = function done() {};
    }
    // filter existing target
    targetIds = targetIds.filter(function (id) {
        return $$.hasTarget($$.data.targets, id);
    });
    // If no target, call done and return
    if (!targetIds || targetIds.length === 0) {
        done();
        return;
    }
    $$.svg.selectAll(targetIds.map(function (id) {
        return $$.selectorTarget(id);
    })).transition().style('opacity', 0).remove().call($$.endall, done);
    targetIds.forEach(function (id) {
        // Reset fadein for future load
        $$.withoutFadeIn[id] = false;
        // Remove target's elements
        if ($$.legend) {
            $$.legend.selectAll('.' + CLASS$1.legendItem + $$.getTargetSelectorSuffix(id)).remove();
        }
        // Remove target
        $$.data.targets = $$.data.targets.filter(function (t) {
            return t.id !== id;
        });
    });
};

var getYDomainMin = function getYDomainMin(targets) {
    var $$ = this,
        config = $$.config,
        ids = $$.mapToIds(targets),
        ys = $$.getValuesAsIdKeyed(targets),
        j = void 0,
        k = void 0,
        baseId = void 0,
        idsInGroup = void 0,
        id = void 0,
        hasNegativeValue = void 0;
    if (config.data_groups.length > 0) {
        hasNegativeValue = $$.hasNegativeValueInTargets(targets);
        for (j = 0; j < config.data_groups.length; j++) {
            // Determine baseId
            idsInGroup = config.data_groups[j].filter(function (id) {
                return ids.indexOf(id) >= 0;
            });
            if (idsInGroup.length === 0) {
                continue;
            }
            baseId = idsInGroup[0];
            // Consider negative values
            if (hasNegativeValue && ys[baseId]) {
                ys[baseId].forEach(function (v, i) {
                    ys[baseId][i] = v < 0 ? v : 0;
                });
            }
            // Compute min
            for (k = 1; k < idsInGroup.length; k++) {
                id = idsInGroup[k];
                if (!ys[id]) {
                    continue;
                }
                ys[id].forEach(function (v, i) {
                    if ($$.axis.getId(id) === $$.axis.getId(baseId) && ys[baseId] && !(hasNegativeValue && +v > 0)) {
                        ys[baseId][i] += +v;
                    }
                });
            }
        }
    }
    return $$.d3.min(Object.keys(ys).map(function (key) {
        return $$.d3.min(ys[key]);
    }));
};
var getYDomainMax = function getYDomainMax(targets) {
    var $$ = this,
        config = $$.config,
        ids = $$.mapToIds(targets),
        ys = $$.getValuesAsIdKeyed(targets),
        j = void 0,
        k = void 0,
        baseId = void 0,
        idsInGroup = void 0,
        id = void 0,
        hasPositiveValue = void 0;
    if (config.data_groups.length > 0) {
        hasPositiveValue = $$.hasPositiveValueInTargets(targets);
        for (j = 0; j < config.data_groups.length; j++) {
            // Determine baseId
            idsInGroup = config.data_groups[j].filter(function (id) {
                return ids.indexOf(id) >= 0;
            });
            if (idsInGroup.length === 0) {
                continue;
            }
            baseId = idsInGroup[0];
            // Consider positive values
            if (hasPositiveValue && ys[baseId]) {
                ys[baseId].forEach(function (v, i) {
                    ys[baseId][i] = v > 0 ? v : 0;
                });
            }
            // Compute max
            for (k = 1; k < idsInGroup.length; k++) {
                id = idsInGroup[k];
                if (!ys[id]) {
                    continue;
                }
                ys[id].forEach(function (v, i) {
                    if ($$.axis.getId(id) === $$.axis.getId(baseId) && ys[baseId] && !(hasPositiveValue && +v < 0)) {
                        ys[baseId][i] += +v;
                    }
                });
            }
        }
    }
    return $$.d3.max(Object.keys(ys).map(function (key) {
        return $$.d3.max(ys[key]);
    }));
};
var getYDomain = function getYDomain(targets, axisId, xDomain) {
    var $$ = this,
        config = $$.config,
        targetsByAxisId = targets.filter(function (t) {
        return $$.axis.getId(t.id) === axisId;
    }),
        yTargets = xDomain ? $$.filterByXDomain(targetsByAxisId, xDomain) : targetsByAxisId,
        yMin = axisId === 'y2' ? config.axis_y2_min : config.axis_y_min,
        yMax = axisId === 'y2' ? config.axis_y2_max : config.axis_y_max,
        yDomainMin = $$.getYDomainMin(yTargets),
        yDomainMax = $$.getYDomainMax(yTargets),
        domain = void 0,
        domainLength = void 0,
        padding = void 0,
        padding_top = void 0,
        padding_bottom = void 0,
        center = axisId === 'y2' ? config.axis_y2_center : config.axis_y_center,
        yDomainAbs = void 0,
        lengths = void 0,
        diff = void 0,
        ratio = void 0,
        isAllPositive = void 0,
        isAllNegative = void 0,
        isZeroBased = $$.hasType('bar', yTargets) && config.bar_zerobased || $$.hasType('area', yTargets) && config.area_zerobased,
        isInverted = axisId === 'y2' ? config.axis_y2_inverted : config.axis_y_inverted,
        showHorizontalDataLabel = $$.hasDataLabel() && config.axis_rotated,
        showVerticalDataLabel = $$.hasDataLabel() && !config.axis_rotated;

    // MEMO: avoid inverting domain unexpectedly
    yDomainMin = isValue(yMin) ? yMin : isValue(yMax) ? yDomainMin < yMax ? yDomainMin : yMax - 10 : yDomainMin;
    yDomainMax = isValue(yMax) ? yMax : isValue(yMin) ? yMin < yDomainMax ? yDomainMax : yMin + 10 : yDomainMax;

    if (yTargets.length === 0) {
        // use current domain if target of axisId is none
        return axisId === 'y2' ? $$.y2.domain() : $$.y.domain();
    }
    if (isNaN(yDomainMin)) {
        // set minimum to zero when not number
        yDomainMin = 0;
    }
    if (isNaN(yDomainMax)) {
        // set maximum to have same value as yDomainMin
        yDomainMax = yDomainMin;
    }
    if (yDomainMin === yDomainMax) {
        yDomainMin < 0 ? yDomainMax = 0 : yDomainMin = 0;
    }
    isAllPositive = yDomainMin >= 0 && yDomainMax >= 0;
    isAllNegative = yDomainMin <= 0 && yDomainMax <= 0;

    // Cancel zerobased if axis_*_min / axis_*_max specified
    if (isValue(yMin) && isAllPositive || isValue(yMax) && isAllNegative) {
        isZeroBased = false;
    }

    // Bar/Area chart should be 0-based if all positive|negative
    if (isZeroBased) {
        if (isAllPositive) {
            yDomainMin = 0;
        }
        if (isAllNegative) {
            yDomainMax = 0;
        }
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
        if (isAllPositive) {
            padding_bottom = yDomainMin;
        }
        if (isAllNegative) {
            padding_top = -yDomainMax;
        }
    }
    domain = [yDomainMin - padding_bottom, yDomainMax + padding_top];
    return isInverted ? domain.reverse() : domain;
};
var getXDomainMin = function getXDomainMin(targets) {
    var $$ = this,
        config = $$.config;
    return isDefined(config.axis_x_min) ? $$.isTimeSeries() ? this.parseDate(config.axis_x_min) : config.axis_x_min : $$.d3.min(targets, function (t) {
        return $$.d3.min(t.values, function (v) {
            return v.x;
        });
    });
};
var getXDomainMax = function getXDomainMax(targets) {
    var $$ = this,
        config = $$.config;
    return isDefined(config.axis_x_max) ? $$.isTimeSeries() ? this.parseDate(config.axis_x_max) : config.axis_x_max : $$.d3.max(targets, function (t) {
        return $$.d3.max(t.values, function (v) {
            return v.x;
        });
    });
};
var getXDomainPadding = function getXDomainPadding(domain) {
    var $$ = this,
        config = $$.config,
        diff = domain[1] - domain[0],
        maxDataCount = void 0,
        padding = void 0,
        paddingLeft = void 0,
        paddingRight = void 0;
    if ($$.isCategorized()) {
        padding = 0;
    } else if ($$.hasType('bar')) {
        maxDataCount = $$.getMaxDataCount();
        padding = maxDataCount > 1 ? diff / (maxDataCount - 1) / 2 : 0.5;
    } else {
        padding = diff * 0.01;
    }
    if (_typeof(config.axis_x_padding) === 'object' && notEmpty(config.axis_x_padding)) {
        paddingLeft = isValue(config.axis_x_padding.left) ? config.axis_x_padding.left : padding;
        paddingRight = isValue(config.axis_x_padding.right) ? config.axis_x_padding.right : padding;
    } else if (typeof config.axis_x_padding === 'number') {
        paddingLeft = paddingRight = config.axis_x_padding;
    } else {
        paddingLeft = paddingRight = padding;
    }
    return { left: paddingLeft, right: paddingRight };
};
var getXDomain = function getXDomain(targets) {
    var $$ = this,
        xDomain = [$$.getXDomainMin(targets), $$.getXDomainMax(targets)],
        firstX = xDomain[0],
        lastX = xDomain[1],
        padding = $$.getXDomainPadding(xDomain),
        min = 0,
        max = 0;
    // show center of x domain if min and max are the same
    if (firstX - lastX === 0 && !$$.isCategorized()) {
        if ($$.isTimeSeries()) {
            firstX = new Date(firstX.getTime() * 0.5);
            lastX = new Date(lastX.getTime() * 1.5);
        } else {
            firstX = firstX === 0 ? 1 : firstX * 0.5;
            lastX = lastX === 0 ? -1 : lastX * 1.5;
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
var updateXDomain = function updateXDomain(targets, withUpdateXDomain, withUpdateOrgXDomain, withTrim, domain) {
    var $$ = this,
        config = $$.config;

    if (withUpdateOrgXDomain) {
        $$.x.domain(domain ? domain : $$.d3.extent($$.getXDomain(targets)));
        $$.orgXDomain = $$.x.domain();
        if (config.zoom_enabled) {
            $$.zoom.scale($$.x).updateScaleExtent();
        }
        $$.subX.domain($$.x.domain());
        if ($$.brush) {
            $$.brush.scale($$.subX);
        }
    }
    if (withUpdateXDomain) {
        $$.x.domain(domain ? domain : !$$.brush || $$.brush.empty() ? $$.orgXDomain : $$.brush.extent());
        if (config.zoom_enabled) {
            $$.zoom.scale($$.x).updateScaleExtent();
        }
    }

    // Trim domain when too big by zoom mousemove event
    if (withTrim) {
        $$.x.domain($$.trimXDomain($$.x.orgDomain()));
    }

    return $$.x.domain();
};
var trimXDomain = function trimXDomain(domain) {
    var zoomDomain = this.getZoomDomain(),
        min = zoomDomain[0],
        max = zoomDomain[1];
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

var drag = function drag(mouse) {
    var $$ = this,
        config = $$.config,
        main = $$.main,
        d3$$1 = $$.d3;
    var sx = void 0,
        sy = void 0,
        mx = void 0,
        my = void 0,
        minX = void 0,
        maxX = void 0,
        minY = void 0,
        maxY = void 0;

    if ($$.hasArcType()) {
        return;
    }
    if (!config.data_selection_enabled) {
        return;
    } // do nothing if not selectable
    if (config.zoom_enabled && !$$.zoom.altDomain) {
        return;
    } // skip if zoomable because of conflict drag dehavior
    if (!config.data_selection_multiple) {
        return;
    } // skip when single selection because drag is used for multiple selection

    sx = $$.dragStart[0];
    sy = $$.dragStart[1];
    mx = mouse[0];
    my = mouse[1];
    minX = Math.min(sx, mx);
    maxX = Math.max(sx, mx);
    minY = config.data_selection_grouped ? $$.margin.top : Math.min(sy, my);
    maxY = config.data_selection_grouped ? $$.height : Math.max(sy, my);

    main.select('.' + CLASS.dragarea).attr('x', minX).attr('y', minY).attr('width', maxX - minX).attr('height', maxY - minY);
    // TODO: binary search when multiple xs
    main.selectAll('.' + CLASS.shapes).selectAll('.' + CLASS.shape).filter(function (d) {
        return config.data_selection_isselectable(d);
    }).each(function (d, i) {
        var shape = d3$$1.select(this),
            isSelected = shape.classed(CLASS.SELECTED),
            isIncluded = shape.classed(CLASS.INCLUDED),
            _x = void 0,
            _y = void 0,
            _w = void 0,
            _h = void 0,
            toggle = void 0,
            isWithin = false,
            box = void 0;
        if (shape.classed(CLASS.circle)) {
            _x = shape.attr('cx') * 1;
            _y = shape.attr('cy') * 1;
            toggle = $$.togglePoint;
            isWithin = minX < _x && _x < maxX && minY < _y && _y < maxY;
        } else if (shape.classed(CLASS.bar)) {
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

var dragstart = function dragstart(mouse) {
    var $$ = this,
        config = $$.config;
    if ($$.hasArcType()) {
        return;
    }
    if (!config.data_selection_enabled) {
        return;
    } // do nothing if not selectable
    $$.dragStart = mouse;
    $$.main.select('.' + CLASS.chart).append('rect').attr('class', CLASS.dragarea).style('opacity', 0.1);
    $$.dragging = true;
};

var dragend = function dragend() {
    var $$ = this,
        config = $$.config;
    if ($$.hasArcType()) {
        return;
    }
    if (!config.data_selection_enabled) {
        return;
    } // do nothing if not selectable
    $$.main.select('.' + CLASS.dragarea).transition().duration(100).style('opacity', 0).remove();
    $$.main.selectAll('.' + CLASS.shape).classed(CLASS.INCLUDED, false);
    $$.dragging = false;
};

var generateFlow = function generateFlow(args) {
    var $$ = this,
        config = $$.config,
        d3$$1 = $$.d3;

    return function () {
        var targets = args.targets,
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

        var translateX = void 0,
            scaleX = 1,
            transform = void 0,
            flowIndex = flow.index,
            flowLength = flow.length,
            flowStart = $$.getValueOnIndex($$.data.targets[0].values, flowIndex),
            flowEnd = $$.getValueOnIndex($$.data.targets[0].values, flowIndex + flowLength),
            orgDomain = $$.x.domain(),
            domain = void 0,
            durationForFlow = flow.duration || duration,
            done = flow.done || function () {},
            wait = $$.generateWait();

        var xgrid = $$.xgrid || d3$$1.selectAll([]),
            xgridLines = $$.xgridLines || d3$$1.selectAll([]),
            mainRegion = $$.mainRegion || d3$$1.selectAll([]),
            mainText = $$.mainText || d3$$1.selectAll([]),
            mainBar = $$.mainBar || d3$$1.selectAll([]),
            mainLine = $$.mainLine || d3$$1.selectAll([]),
            mainArea = $$.mainArea || d3$$1.selectAll([]),
            mainCircle = $$.mainCircle || d3$$1.selectAll([]);

        // set flag
        $$.flowing = true;

        // remove head data after rendered
        $$.data.targets.forEach(function (d) {
            d.values.splice(0, flowLength);
        });

        // update x domain to generate axis elements for flow
        domain = $$.updateXDomain(targets, true, true);
        // update elements related to x scale
        if ($$.updateXGrid) {
            $$.updateXGrid(true);
        }

        // generate transform to flow
        if (!flow.orgDataCount) {
            // if empty
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
                translateX = $$.x(orgDomain[0]) - $$.x(domain[0]);
            } else {
                translateX = $$.x(flowStart.x) - $$.x(flowEnd.x);
            }
        }
        scaleX = diffDomain(orgDomain) / diffDomain(domain);
        transform = 'translate(' + translateX + ',0) scale(' + scaleX + ',1)';

        $$.hideXGridFocus();

        d3$$1.transition().ease('linear').duration(durationForFlow).each(function () {
            wait.add($$.axes.x.transition().call($$.xAxis));
            wait.add(mainBar.transition().attr('transform', transform));
            wait.add(mainLine.transition().attr('transform', transform));
            wait.add(mainArea.transition().attr('transform', transform));
            wait.add(mainCircle.transition().attr('transform', transform));
            wait.add(mainText.transition().attr('transform', transform));
            wait.add(mainRegion.filter($$.isRegionOnX).transition().attr('transform', transform));
            wait.add(xgrid.transition().attr('transform', transform));
            wait.add(xgridLines.transition().attr('transform', transform));
        }).call(wait, function () {
            var i = void 0,
                shapes = [],
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
            xgrid.attr('transform', null).attr($$.xgridAttr);
            xgridLines.attr('transform', null);
            xgridLines.select('line').attr('x1', config.axis_rotated ? 0 : xv).attr('x2', config.axis_rotated ? $$.width : xv);
            xgridLines.select('text').attr('x', config.axis_rotated ? $$.width : 0).attr('y', xv);
            mainBar.attr('transform', null).attr('d', drawBar);
            mainLine.attr('transform', null).attr('d', drawLine);
            mainArea.attr('transform', null).attr('d', drawArea);
            mainCircle.attr('transform', null).attr('cx', cx).attr('cy', cy);
            mainText.attr('transform', null).attr('x', xForText).attr('y', yForText).style('fill-opacity', $$.opacityForText.bind($$));
            mainRegion.attr('transform', null);
            mainRegion.select('rect').filter($$.isRegionOnX).attr('x', $$.regionX.bind($$)).attr('width', $$.regionWidth.bind($$));

            if (config.interaction_enabled) {
                $$.redrawEventRect();
            }

            // callback for end of flow
            done();

            $$.flowing = false;
        });
    };
};

var getYFormat = function getYFormat(forArc) {
    var $$ = this,
        formatForY = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.yFormat,
        formatForY2 = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.y2Format;
    return function (v, ratio, id) {
        var format = $$.axis.getId(id) === 'y2' ? formatForY2 : formatForY;
        return format.call($$, v, ratio);
    };
};
var yFormat = function yFormat(v) {
    var $$ = this,
        config = $$.config,
        format = config.axis_y_tick_format ? config.axis_y_tick_format : $$.defaultValueFormat;
    return format(v);
};
var y2Format = function y2Format(v) {
    var $$ = this,
        config = $$.config,
        format = config.axis_y2_tick_format ? config.axis_y2_tick_format : $$.defaultValueFormat;
    return format(v);
};
var defaultValueFormat = function defaultValueFormat(v) {
    return isValue(v) ? +v : '';
};
var defaultArcValueFormat = function defaultArcValueFormat(v, ratio) {
    return (ratio * 100).toFixed(1) + '%';
};
var dataLabelFormat = function dataLabelFormat(targetId) {
    var $$ = this,
        data_labels = $$.config.data_labels,
        format = void 0,
        defaultFormat = function defaultFormat(v) {
        return isValue(v) ? +v : '';
    };
    // find format according to axis id
    if (typeof data_labels.format === 'function') {
        format = data_labels.format;
    } else if (_typeof(data_labels.format) === 'object') {
        if (data_labels.format[targetId]) {
            format = data_labels.format[targetId] === true ? defaultFormat : data_labels.format[targetId];
        } else {
            format = function format() {
                return '';
            };
        }
    } else {
        format = defaultFormat;
    }
    return format;
};

var initGrid = function initGrid() {
    var $$ = this,
        config = $$.config,
        d3$$1 = $$.d3;
    $$.grid = $$.main.append('g').attr('clip-path', $$.clipPathForGrid).attr('class', CLASS.grid);
    if (config.grid_x_show) {
        $$.grid.append('g').attr('class', CLASS.xgrids);
    }
    if (config.grid_y_show) {
        $$.grid.append('g').attr('class', CLASS.ygrids);
    }
    if (config.grid_focus_show) {
        $$.grid.append('g').attr('class', CLASS.xgridFocus).append('line').attr('class', CLASS.xgridFocus);
    }
    $$.xgrid = d3$$1.selectAll([]);
    if (!config.grid_lines_front) {
        $$.initGridLines();
    }
};
var initGridLines = function initGridLines() {
    var $$ = this,
        d3$$1 = $$.d3;
    $$.gridLines = $$.main.append('g').attr('clip-path', $$.clipPathForGrid).attr('class', CLASS.grid + ' ' + CLASS.gridLines);
    $$.gridLines.append('g').attr('class', CLASS.xgridLines);
    $$.gridLines.append('g').attr('class', CLASS.ygridLines);
    $$.xgridLines = d3$$1.selectAll([]);
};
var updateXGrid = function updateXGrid(withoutUpdate) {
    var $$ = this,
        config = $$.config,
        d3$$1 = $$.d3,
        xgridData = $$.generateGridData(config.grid_x_type, $$.x),
        tickOffset = $$.isCategorized() ? $$.xAxis.tickOffset() : 0;

    $$.xgridAttr = config.axis_rotated ? {
        'x1': 0,
        'x2': $$.width,
        'y1': function y1(d) {
            return $$.x(d) - tickOffset;
        },
        'y2': function y2(d) {
            return $$.x(d) - tickOffset;
        }
    } : {
        'x1': function x1(d) {
            return $$.x(d) + tickOffset;
        },
        'x2': function x2(d) {
            return $$.x(d) + tickOffset;
        },
        'y1': 0,
        'y2': $$.height
    };

    $$.xgrid = $$.main.select('.' + CLASS.xgrids).selectAll('.' + CLASS.xgrid).data(xgridData);
    $$.xgrid.enter().append('line').attr('class', CLASS.xgrid);
    if (!withoutUpdate) {
        $$.xgrid.attr($$.xgridAttr).style('opacity', function () {
            return +d3$$1.select(this).attr(config.axis_rotated ? 'y1' : 'x1') === (config.axis_rotated ? $$.height : 0) ? 0 : 1;
        });
    }
    $$.xgrid.exit().remove();
};

var updateYGrid = function updateYGrid() {
    var $$ = this,
        config = $$.config,
        gridValues = $$.yAxis.tickValues() || $$.y.ticks(config.grid_y_ticks);
    $$.ygrid = $$.main.select('.' + CLASS.ygrids).selectAll('.' + CLASS.ygrid).data(gridValues);
    $$.ygrid.enter().append('line').attr('class', CLASS.ygrid);
    $$.ygrid.attr('x1', config.axis_rotated ? $$.y : 0).attr('x2', config.axis_rotated ? $$.y : $$.width).attr('y1', config.axis_rotated ? 0 : $$.y).attr('y2', config.axis_rotated ? $$.height : $$.y);
    $$.ygrid.exit().remove();
    $$.smoothLines($$.ygrid, 'grid');
};

var gridTextAnchor = function gridTextAnchor(d) {
    return d.position ? d.position : 'end';
};
var gridTextDx = function gridTextDx(d) {
    return d.position === 'start' ? 4 : d.position === 'middle' ? 0 : -4;
};
var xGridTextX = function xGridTextX(d) {
    return d.position === 'start' ? -this.height : d.position === 'middle' ? -this.height / 2 : 0;
};
var yGridTextX = function yGridTextX(d) {
    return d.position === 'start' ? 0 : d.position === 'middle' ? this.width / 2 : this.width;
};
var updateGrid = function updateGrid(duration) {
    var $$ = this,
        main = $$.main,
        config = $$.config,
        xgridLine = void 0,
        ygridLine = void 0,
        yv = void 0;

    // hide if arc type
    $$.grid.style('visibility', $$.hasArcType() ? 'hidden' : 'visible');

    main.select('line.' + CLASS.xgridFocus).style('visibility', 'hidden');
    if (config.grid_x_show) {
        $$.updateXGrid();
    }
    $$.xgridLines = main.select('.' + CLASS.xgridLines).selectAll('.' + CLASS.xgridLine).data(config.grid_x_lines);
    // enter
    xgridLine = $$.xgridLines.enter().append('g').attr('class', function (d) {
        return CLASS.xgridLine + (d.class ? ' ' + d.class : '');
    });
    xgridLine.append('line').style('opacity', 0);
    xgridLine.append('text').attr('text-anchor', $$.gridTextAnchor).attr('transform', config.axis_rotated ? '' : 'rotate(-90)').attr('dx', $$.gridTextDx).attr('dy', -5).style('opacity', 0);
    // udpate
    // done in d3.transition() of the end of this function
    // exit
    $$.xgridLines.exit().transition().duration(duration).style('opacity', 0).remove();

    // Y-Grid
    if (config.grid_y_show) {
        $$.updateYGrid();
    }
    $$.ygridLines = main.select('.' + CLASS.ygridLines).selectAll('.' + CLASS.ygridLine).data(config.grid_y_lines);
    // enter
    ygridLine = $$.ygridLines.enter().append('g').attr('class', function (d) {
        return CLASS.ygridLine + (d.class ? ' ' + d.class : '');
    });
    ygridLine.append('line').style('opacity', 0);
    ygridLine.append('text').attr('text-anchor', $$.gridTextAnchor).attr('transform', config.axis_rotated ? 'rotate(-90)' : '').attr('dx', $$.gridTextDx).attr('dy', -5).style('opacity', 0);
    // update
    yv = $$.yv.bind($$);
    $$.ygridLines.select('line').transition().duration(duration).attr('x1', config.axis_rotated ? yv : 0).attr('x2', config.axis_rotated ? yv : $$.width).attr('y1', config.axis_rotated ? 0 : yv).attr('y2', config.axis_rotated ? $$.height : yv).style('opacity', 1);
    $$.ygridLines.select('text').transition().duration(duration).attr('x', config.axis_rotated ? $$.xGridTextX.bind($$) : $$.yGridTextX.bind($$)).attr('y', yv).text(function (d) {
        return d.text;
    }).style('opacity', 1);
    // exit
    $$.ygridLines.exit().transition().duration(duration).style('opacity', 0).remove();
};
var redrawGrid = function redrawGrid(withTransition) {
    var $$ = this,
        config = $$.config,
        xv = $$.xv.bind($$),
        lines = $$.xgridLines.select('line'),
        texts = $$.xgridLines.select('text');
    return [(withTransition ? lines.transition() : lines).attr('x1', config.axis_rotated ? 0 : xv).attr('x2', config.axis_rotated ? $$.width : xv).attr('y1', config.axis_rotated ? xv : 0).attr('y2', config.axis_rotated ? xv : $$.height).style('opacity', 1), (withTransition ? texts.transition() : texts).attr('x', config.axis_rotated ? $$.yGridTextX.bind($$) : $$.xGridTextX.bind($$)).attr('y', xv).text(function (d) {
        return d.text;
    }).style('opacity', 1)];
};
var showXGridFocus = function showXGridFocus(selectedData) {
    var $$ = this,
        config = $$.config,
        dataToShow = selectedData.filter(function (d) {
        return d && isValue(d.value);
    }),
        focusEl = $$.main.selectAll('line.' + CLASS.xgridFocus),
        xx = $$.xx.bind($$);
    if (!config.tooltip_show) {
        return;
    }
    // Hide when scatter plot exists
    if ($$.hasType('scatter') || $$.hasArcType()) {
        return;
    }
    focusEl.style('visibility', 'visible').data([dataToShow[0]]).attr(config.axis_rotated ? 'y1' : 'x1', xx).attr(config.axis_rotated ? 'y2' : 'x2', xx);
    $$.smoothLines(focusEl, 'grid');
};
var hideXGridFocus = function hideXGridFocus() {
    this.main.select('line.' + CLASS.xgridFocus).style('visibility', 'hidden');
};
var updateXgridFocus = function updateXgridFocus() {
    var $$ = this,
        config = $$.config;
    $$.main.select('line.' + CLASS.xgridFocus).attr('x1', config.axis_rotated ? 0 : -10).attr('x2', config.axis_rotated ? $$.width : -10).attr('y1', config.axis_rotated ? -10 : 0).attr('y2', config.axis_rotated ? -10 : $$.height);
};
var generateGridData = function generateGridData(type, scale) {
    var $$ = this,
        gridData = [],
        xDomain = void 0,
        firstYear = void 0,
        lastYear = void 0,
        i = void 0,
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
        if (gridData.length > tickNum) {
            // use only int
            gridData = gridData.filter(function (d) {
                return ('' + d).indexOf('.') < 0;
            });
        }
    }
    return gridData;
};
var getGridFilterToRemove = function getGridFilterToRemove(params) {
    return params ? function (line) {
        var found = false;
        [].concat(params).forEach(function (param) {
            if ('value' in param && line.value === param.value || 'class' in param && line.class === param.class) {
                found = true;
            }
        });
        return found;
    } : function () {
        return true;
    };
};
var removeGridLines = function removeGridLines(params, forX) {
    var $$ = this,
        config = $$.config,
        toRemove = $$.getGridFilterToRemove(params),
        toShow = function toShow(line) {
        return !toRemove(line);
    },
        classLines = forX ? CLASS.xgridLines : CLASS.ygridLines,
        classLine = forX ? CLASS.xgridLine : CLASS.ygridLine;
    $$.main.select('.' + classLines).selectAll('.' + classLine).filter(toRemove).transition().duration(config.transition_duration).style('opacity', 0).remove();
    if (forX) {
        config.grid_x_lines = config.grid_x_lines.filter(toShow);
    } else {
        config.grid_y_lines = config.grid_y_lines.filter(toShow);
    }
};

var initEventRect = function initEventRect() {
    var $$ = this;
    $$.main.select('.' + CLASS.chart).append('g').attr('class', CLASS.eventRects).style('fill-opacity', 0);
};
var redrawEventRect = function redrawEventRect() {
    var $$ = this,
        config = $$.config,
        eventRectUpdate = void 0,
        maxDataCountTarget = void 0,
        isMultipleX = $$.isMultipleX();

    // rects for mouseover
    var eventRects = $$.main.select('.' + CLASS.eventRects).style('cursor', config.zoom_enabled ? config.axis_rotated ? 'ns-resize' : 'ew-resize' : null).classed(CLASS.eventRectsMultiple, isMultipleX).classed(CLASS.eventRectsSingle, !isMultipleX);

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
    } else {
        // Set data and update $$.eventRect
        maxDataCountTarget = $$.getMaxDataCountTarget($$.data.targets);
        eventRects.datum(maxDataCountTarget ? maxDataCountTarget.values : []);
        $$.eventRect = eventRects.selectAll('.' + CLASS.eventRect);
        eventRectUpdate = $$.eventRect.data(function (d) {
            return d;
        });
        // enter
        $$.generateEventRectsForSingleX(eventRectUpdate.enter());
        // update
        $$.updateEventRect(eventRectUpdate);
        // exit
        eventRectUpdate.exit().remove();
    }
};
var updateEventRect = function updateEventRect(eventRectUpdate) {
    var $$ = this,
        config = $$.config,
        x = void 0,
        y = void 0,
        w = void 0,
        h = void 0,
        rectW = void 0,
        rectX = void 0;

    // set update selection if null
    eventRectUpdate = eventRectUpdate || $$.eventRect.data(function (d) {
        return d;
    });

    if ($$.isMultipleX()) {
        // TODO: rotated not supported yet
        x = 0;
        y = 0;
        w = $$.width;
        h = $$.height;
    } else {
        if (($$.isCustomX() || $$.isTimeSeries()) && !$$.isCategorized()) {
            // update index for x that is used by prevX and nextX
            $$.updateXs();

            rectW = function rectW(d) {
                var prevX = $$.getPrevX(d.index),
                    nextX = $$.getNextX(d.index);

                // if there this is a single data point make the eventRect full width (or height)
                if (prevX === null && nextX === null) {
                    return config.axis_rotated ? $$.height : $$.width;
                }

                if (prevX === null) {
                    prevX = $$.x.domain()[0];
                }
                if (nextX === null) {
                    nextX = $$.x.domain()[1];
                }

                return Math.max(0, ($$.x(nextX) - $$.x(prevX)) / 2);
            };
            rectX = function rectX(d) {
                var prevX = $$.getPrevX(d.index),
                    nextX = $$.getNextX(d.index),
                    thisX = $$.data.xs[d.id][d.index];

                // if there this is a single data point position the eventRect at 0
                if (prevX === null && nextX === null) {
                    return 0;
                }

                if (prevX === null) {
                    prevX = $$.x.domain()[0];
                }

                return ($$.x(thisX) + $$.x(prevX)) / 2;
            };
        } else {
            rectW = $$.getEventRectWidth();
            rectX = function rectX(d) {
                return $$.x(d.x) - rectW / 2;
            };
        }
        x = config.axis_rotated ? 0 : rectX;
        y = config.axis_rotated ? rectX : 0;
        w = config.axis_rotated ? $$.width : rectW;
        h = config.axis_rotated ? rectW : $$.height;
    }

    eventRectUpdate.attr('class', $$.classEvent.bind($$)).attr('x', x).attr('y', y).attr('width', w).attr('height', h);
};
var generateEventRectsForSingleX = function generateEventRectsForSingleX(eventRectEnter) {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config,
        tap = false,
        tapX = void 0;

    function click(shape, d) {
        var index = d.index;
        if ($$.hasArcType() || !$$.toggleShape) {
            return;
        }
        if ($$.cancelClick) {
            $$.cancelClick = false;
            return;
        }
        if ($$.isStepType(d) && config.line_step_type === 'step-after' && d3$$1.mouse(shape)[0] < $$.x($$.getXValue(d.id, index))) {
            index -= 1;
        }
        $$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
            if (config.data_selection_grouped || $$.isWithinShape(this, d)) {
                $$.toggleShape(this, d, index);
                $$.config.data_onclick.call($$.api, d, this);
            }
        });
    }

    eventRectEnter.append('rect').attr('class', $$.classEvent.bind($$)).style('cursor', config.data_selection_enabled && config.data_selection_grouped ? 'pointer' : null).on('mouseover', function (d) {
        var index = d.index;

        if ($$.dragging || $$.flowing) {
            return;
        } // do nothing while dragging/flowing
        if ($$.hasArcType()) {
            return;
        }

        // Expand shapes for selection
        if (config.point_focus_expand_enabled) {
            $$.expandCircles(index, null, true);
        }
        $$.expandBars(index, null, true);

        // Call event handler
        $$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
            config.data_onmouseover.call($$.api, d);
        });
    }).on('mouseout', function (d) {
        var index = d.index;
        if (!$$.config) {
            return;
        } // chart is destroyed
        if ($$.hasArcType()) {
            return;
        }
        $$.hideXGridFocus();
        $$.hideTooltip();
        // Undo expanded shapes
        $$.unexpandCircles();
        $$.unexpandBars();
        // Call event handler
        $$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
            config.data_onmouseout.call($$.api, d);
        });
    }).on('mousemove', function (d) {
        var selectedData = void 0,
            index = d.index,
            eventRect = $$.svg.select('.' + CLASS.eventRect + '-' + index);

        if ($$.dragging || $$.flowing) {
            return;
        } // do nothing while dragging/flowing
        if ($$.hasArcType()) {
            return;
        }

        if ($$.isStepType(d) && $$.config.line_step_type === 'step-after' && d3$$1.mouse(this)[0] < $$.x($$.getXValue(d.id, index))) {
            index -= 1;
        }

        // Show tooltip
        selectedData = $$.filterTargetsToShow($$.data.targets).map(function (t) {
            return $$.addName($$.getValueOnIndex(t.values, index));
        });

        if (config.tooltip_grouped) {
            $$.showTooltip(selectedData, this);
            $$.showXGridFocus(selectedData);
        }

        if (config.tooltip_grouped && (!config.data_selection_enabled || config.data_selection_grouped)) {
            return;
        }

        $$.main.selectAll('.' + CLASS.shape + '-' + index).each(function () {
            d3$$1.select(this).classed(CLASS.EXPANDED, true);
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
        }).filter(function (d) {
            return $$.isWithinShape(this, d);
        }).each(function (d) {
            if (config.data_selection_enabled && (config.data_selection_grouped || config.data_selection_isselectable(d))) {
                eventRect.style('cursor', 'pointer');
            }
            if (!config.tooltip_grouped) {
                $$.showTooltip([d], this);
                $$.showXGridFocus([d]);
                if (config.point_focus_expand_enabled) {
                    $$.expandCircles(index, d.id, true);
                }
                $$.expandBars(index, d.id, true);
            }
        });
    }).on('click', function (d) {
        // click event was simulated via a 'tap' touch event, cancel regular click
        if (tap) {
            return;
        }

        click(this, d);
    }).on('touchstart', function (d) {
        // store current X selection for comparison during touch end event
        tapX = d.x;
    }).on('touchend', function (d) {
        var finalX = d.x;

        // If end is not the same as the start, event doesn't count as a tap
        if (tapX !== finalX) {
            return;
        }

        click(this, d);

        // indictate tap event fired to prevent click;
        tap = true;
        setTimeout(function () {
            tap = false;
        }, config.touch_tap_delay);
    }).call(config.data_selection_draggable && $$.drag ? d3$$1.behavior.drag().origin(Object).on('drag', function () {
        $$.drag(d3$$1.mouse(this));
    }).on('dragstart', function () {
        $$.dragstart(d3$$1.mouse(this));
    }).on('dragend', function () {
        $$.dragend();
    }) : function () {});
};

var generateEventRectsForMultipleXs = function generateEventRectsForMultipleXs(eventRectEnter) {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config,
        tap = false,
        tapX = void 0,
        tapY = void 0;

    function mouseout() {
        $$.svg.select('.' + CLASS.eventRect).style('cursor', null);
        $$.hideXGridFocus();
        $$.hideTooltip();
        $$.unexpandCircles();
        $$.unexpandBars();
    }

    function click(shape) {
        var targetsToShow = $$.filterTargetsToShow($$.data.targets);
        var mouse = void 0,
            closest = void 0;
        if ($$.hasArcType(targetsToShow)) {
            return;
        }

        mouse = d3$$1.mouse(shape);
        closest = $$.findClosestFromTargets(targetsToShow, mouse);
        if (!closest) {
            return;
        }
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

    eventRectEnter.append('rect').attr('x', 0).attr('y', 0).attr('width', $$.width).attr('height', $$.height).attr('class', CLASS.eventRect).on('mouseout', function () {
        if (!$$.config) {
            return;
        } // chart is destroyed
        if ($$.hasArcType()) {
            return;
        }
        mouseout();
    }).on('mousemove', function () {
        var targetsToShow = $$.filterTargetsToShow($$.data.targets);
        var mouse = void 0,
            closest = void 0,
            sameXData = void 0,
            selectedData = void 0;

        if ($$.dragging) {
            return;
        } // do nothing when dragging
        if ($$.hasArcType(targetsToShow)) {
            return;
        }

        mouse = d3$$1.mouse(this);
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
        selectedData = sameXData.map(function (d) {
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
    }).on('click', function () {
        // click event was simulated via a 'tap' touch event, cancel regular click
        if (tap) {
            return;
        }

        click(this);
    }).on('touchstart', function () {
        var mouse = d3$$1.mouse(this);
        // store starting coordinates for distance comparision during touch end event
        tapX = mouse[0];
        tapY = mouse[1];
    }).on('touchend', function () {
        var mouse = d3$$1.mouse(this),
            x = mouse[0],
            y = mouse[1];

        // If end is too far from start, event doesn't count as a tap
        if (Math.abs(x - tapX) > config.touch_tap_radius || Math.abs(y - tapY) > config.touch_tap_radius) {
            return;
        }

        click(this);

        // indictate tap event fired to prevent click;
        tap = true;
        setTimeout(function () {
            tap = false;
        }, config.touch_tap_delay);
    }).call(config.data_selection_draggable && $$.drag ? d3$$1.behavior.drag().origin(Object).on('drag', function () {
        $$.drag(d3$$1.mouse(this));
    }).on('dragstart', function () {
        $$.dragstart(d3$$1.mouse(this));
    }).on('dragend', function () {
        $$.dragend();
    }) : function () {});
};
var dispatchEvent = function dispatchEvent(type, index, mouse) {
    var $$ = this,
        selector = '.' + CLASS.eventRect + (!$$.isMultipleX() ? '-' + index : ''),
        eventRect = $$.main.select(selector).node(),
        box = eventRect.getBoundingClientRect(),
        x = box.left + (mouse ? mouse[0] : 0),
        y = box.top + (mouse ? mouse[1] : 0),
        event = document.createEvent('MouseEvents');

    event.initMouseEvent(type, true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
    eventRect.dispatchEvent(event);
};

var initLegend = function initLegend() {
    var $$ = this;
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
var updateLegendWithDefaults = function updateLegendWithDefaults() {
    var $$ = this;
    $$.updateLegend($$.mapToIds($$.data.targets), { withTransform: false, withTransitionForTransform: false, withTransition: false });
};
var updateSizeForLegend = function updateSizeForLegend(legendHeight, legendWidth) {
    var $$ = this,
        config = $$.config,
        insetLegendPosition = {
        top: $$.isLegendTop ? $$.getCurrentPaddingTop() + config.legend_inset_y + 5.5 : $$.currentHeight - legendHeight - $$.getCurrentPaddingBottom() - config.legend_inset_y,
        left: $$.isLegendLeft ? $$.getCurrentPaddingLeft() + config.legend_inset_x + 0.5 : $$.currentWidth - legendWidth - $$.getCurrentPaddingRight() - config.legend_inset_x + 0.5
    };

    $$.margin3 = {
        top: $$.isLegendRight ? 0 : $$.isLegendInset ? insetLegendPosition.top : $$.currentHeight - legendHeight,
        right: NaN,
        bottom: 0,
        left: $$.isLegendRight ? $$.currentWidth - legendWidth : $$.isLegendInset ? insetLegendPosition.left : 0
    };
};
var transformLegend = function transformLegend(withTransition) {
    var $$ = this;
    (withTransition ? $$.legend.transition() : $$.legend).attr('transform', $$.getTranslate('legend'));
};
var updateLegendStep = function updateLegendStep(step) {
    this.legendStep = step;
};
var updateLegendItemWidth = function updateLegendItemWidth(w) {
    this.legendItemWidth = w;
};
var updateLegendItemHeight = function updateLegendItemHeight(h) {
    this.legendItemHeight = h;
};
var getLegendWidth = function getLegendWidth() {
    var $$ = this;
    return $$.config.legend_show ? $$.isLegendRight || $$.isLegendInset ? $$.legendItemWidth * ($$.legendStep + 1) : $$.currentWidth : 0;
};
var getLegendHeight = function getLegendHeight() {
    var $$ = this,
        h = 0;
    if ($$.config.legend_show) {
        if ($$.isLegendRight) {
            h = $$.currentHeight;
        } else {
            h = Math.max(20, $$.legendItemHeight) * ($$.legendStep + 1);
        }
    }
    return h;
};
var opacityForLegend = function opacityForLegend(legendItem) {
    return legendItem.classed(CLASS.legendItemHidden) ? null : 1;
};
var opacityForUnfocusedLegend = function opacityForUnfocusedLegend(legendItem) {
    return legendItem.classed(CLASS.legendItemHidden) ? null : 0.3;
};
var toggleFocusLegend = function toggleFocusLegend(targetIds, focus) {
    var $$ = this;
    targetIds = $$.mapToTargetIds(targetIds);
    $$.legend.selectAll('.' + CLASS.legendItem).filter(function (id) {
        return targetIds.indexOf(id) >= 0;
    }).classed(CLASS.legendItemFocused, focus).transition().duration(100).style('opacity', function () {
        var opacity = focus ? $$.opacityForLegend : $$.opacityForUnfocusedLegend;
        return opacity.call($$, $$.d3.select(this));
    });
};
var revertLegend = function revertLegend() {
    var $$ = this,
        d3$$1 = $$.d3;
    $$.legend.selectAll('.' + CLASS.legendItem).classed(CLASS.legendItemFocused, false).transition().duration(100).style('opacity', function () {
        return $$.opacityForLegend(d3$$1.select(this));
    });
};
var showLegend = function showLegend(targetIds) {
    var $$ = this,
        config = $$.config;
    if (!config.legend_show) {
        config.legend_show = true;
        $$.legend.style('visibility', 'visible');
        if (!$$.legendHasRendered) {
            $$.updateLegendWithDefaults();
        }
    }
    $$.removeHiddenLegendIds(targetIds);
    $$.legend.selectAll($$.selectorLegends(targetIds)).style('visibility', 'visible').transition().style('opacity', function () {
        return $$.opacityForLegend($$.d3.select(this));
    });
};
var hideLegend = function hideLegend(targetIds) {
    var $$ = this,
        config = $$.config;
    if (config.legend_show && isEmpty(targetIds)) {
        config.legend_show = false;
        $$.legend.style('visibility', 'hidden');
    }
    $$.addHiddenLegendIds(targetIds);
    $$.legend.selectAll($$.selectorLegends(targetIds)).style('opacity', 0).style('visibility', 'hidden');
};
var clearLegendItemTextBoxCache = function clearLegendItemTextBoxCache() {
    this.legendItemTextBox = {};
};
var updateLegend = function updateLegend(targetIds, options, transitions) {
    var $$ = this,
        config = $$.config;
    var xForLegend = void 0,
        xForLegendText = void 0,
        xForLegendRect = void 0,
        yForLegend = void 0,
        yForLegendText = void 0,
        yForLegendRect = void 0,
        x1ForLegendTile = void 0,
        x2ForLegendTile = void 0,
        yForLegendTile = void 0;
    var paddingTop = 4,
        paddingRight = 10,
        maxWidth = 0,
        maxHeight = 0,
        posMin = 10,
        tileWidth = config.legend_item_tile_width + 5;
    var l = void 0,
        totalLength = 0,
        offsets = {},
        widths = {},
        heights = {},
        margins = [0],
        steps = {},
        step = 0;
    var withTransition = void 0,
        withTransitionForTransform = void 0;
    var texts = void 0,
        rects = void 0,
        tiles = void 0,
        background = void 0;

    // Skip elements when their name is set to null
    targetIds = targetIds.filter(function (id) {
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
        var reset = index === 0,
            isLast = index === targetIds.length - 1,
            box = getTextBox(textElement, id),
            itemWidth = box.width + tileWidth + (isLast && !($$.isLegendRight || $$.isLegendInset) ? 0 : paddingRight) + config.legend_padding,
            itemHeight = box.height + paddingTop,
            itemLength = $$.isLegendRight || $$.isLegendInset ? itemHeight : itemWidth,
            areaLength = $$.isLegendRight || $$.isLegendInset ? $$.getLegendHeight() : $$.getLegendWidth(),
            margin = void 0,
            maxLength = void 0;

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

        if (!maxWidth || itemWidth >= maxWidth) {
            maxWidth = itemWidth;
        }
        if (!maxHeight || itemHeight >= maxHeight) {
            maxHeight = itemHeight;
        }
        maxLength = $$.isLegendRight || $$.isLegendInset ? maxHeight : maxWidth;

        if (config.legend_equally) {
            Object.keys(widths).forEach(function (id) {
                widths[id] = maxWidth;
            });
            Object.keys(heights).forEach(function (id) {
                heights[id] = maxHeight;
            });
            margin = (areaLength - maxLength * targetIds.length) / 2;
            if (margin < posMin) {
                totalLength = 0;
                step = 0;
                targetIds.forEach(function (id) {
                    updateValues(id);
                });
            } else {
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
        xForLegend = function xForLegend(id) {
            return maxWidth * steps[id];
        };
        yForLegend = function yForLegend(id) {
            return margins[steps[id]] + offsets[id];
        };
    } else if ($$.isLegendInset) {
        xForLegend = function xForLegend(id) {
            return maxWidth * steps[id] + 10;
        };
        yForLegend = function yForLegend(id) {
            return margins[steps[id]] + offsets[id];
        };
    } else {
        xForLegend = function xForLegend(id) {
            return margins[steps[id]] + offsets[id];
        };
        yForLegend = function yForLegend(id) {
            return maxHeight * steps[id];
        };
    }
    xForLegendText = function xForLegendText(id, i) {
        return xForLegend(id, i) + 4 + config.legend_item_tile_width;
    };
    yForLegendText = function yForLegendText(id, i) {
        return yForLegend(id, i) + 9;
    };
    xForLegendRect = function xForLegendRect(id, i) {
        return xForLegend(id, i);
    };
    yForLegendRect = function yForLegendRect(id, i) {
        return yForLegend(id, i) - 5;
    };
    x1ForLegendTile = function x1ForLegendTile(id, i) {
        return xForLegend(id, i) - 2;
    };
    x2ForLegendTile = function x2ForLegendTile(id, i) {
        return xForLegend(id, i) - 2 + config.legend_item_tile_width;
    };
    yForLegendTile = function yForLegendTile(id, i) {
        return yForLegend(id, i) + 4;
    };

    // Define g for legend area
    l = $$.legend.selectAll('.' + CLASS.legendItem).data(targetIds).enter().append('g').attr('class', function (id) {
        return $$.generateClass(CLASS.legendItem, id);
    }).style('visibility', function (id) {
        return $$.isLegendToShow(id) ? 'visible' : 'hidden';
    }).style('cursor', 'pointer').on('click', function (id) {
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
    }).on('mouseover', function (id) {
        if (config.legend_item_onmouseover) {
            config.legend_item_onmouseover.call($$, id);
        } else {
            $$.d3.select(this).classed(CLASS.legendItemFocused, true);
            if (!$$.transiting && $$.isTargetToShow(id)) {
                $$.api.focus(id);
            }
        }
    }).on('mouseout', function (id) {
        if (config.legend_item_onmouseout) {
            config.legend_item_onmouseout.call($$, id);
        } else {
            $$.d3.select(this).classed(CLASS.legendItemFocused, false);
            $$.api.revert();
        }
    });
    l.append('text').text(function (id) {
        return isDefined(config.data_names[id]) ? config.data_names[id] : id;
    }).each(function (id, i) {
        updatePositions(this, id, i);
    }).style('pointer-events', 'none').attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendText : -200).attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendText);
    l.append('rect').attr('class', CLASS.legendItemEvent).style('fill-opacity', 0).attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendRect : -200).attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendRect);
    l.append('line').attr('class', CLASS.legendItemTile).style('stroke', $$.color).style('pointer-events', 'none').attr('x1', $$.isLegendRight || $$.isLegendInset ? x1ForLegendTile : -200).attr('y1', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile).attr('x2', $$.isLegendRight || $$.isLegendInset ? x2ForLegendTile : -200).attr('y2', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile).attr('stroke-width', config.legend_item_tile_height);

    // Set background for inset legend
    background = $$.legend.select('.' + CLASS.legendBackground + ' rect');
    if ($$.isLegendInset && maxWidth > 0 && background.size() === 0) {
        background = $$.legend.insert('g', '.' + CLASS.legendItem).attr('class', CLASS.legendBackground).append('rect');
    }

    texts = $$.legend.selectAll('text').data(targetIds).text(function (id) {
        return isDefined(config.data_names[id]) ? config.data_names[id] : id;
    }) // MEMO: needed for update
    .each(function (id, i) {
        updatePositions(this, id, i);
    });
    (withTransition ? texts.transition() : texts).attr('x', xForLegendText).attr('y', yForLegendText);

    rects = $$.legend.selectAll('rect.' + CLASS.legendItemEvent).data(targetIds);
    (withTransition ? rects.transition() : rects).attr('width', function (id) {
        return widths[id];
    }).attr('height', function (id) {
        return heights[id];
    }).attr('x', xForLegendRect).attr('y', yForLegendRect);

    tiles = $$.legend.selectAll('line.' + CLASS.legendItemTile).data(targetIds);
    (withTransition ? tiles.transition() : tiles).style('stroke', $$.color).attr('x1', x1ForLegendTile).attr('y1', yForLegendTile).attr('x2', x2ForLegendTile).attr('y2', yForLegendTile);

    if (background) {
        (withTransition ? background.transition() : background).attr('height', $$.getLegendHeight() - 12).attr('width', maxWidth * (step + 1) + 10);
    }

    // toggle legend state
    $$.legend.selectAll('.' + CLASS.legendItem).classed(CLASS.legendItemHidden, function (id) {
        return !$$.isTargetToShow(id);
    });

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

var initRegion = function initRegion() {
    var $$ = this;
    $$.region = $$.main.append('g').attr('clip-path', $$.clipPath).attr('class', CLASS.regions);
};
var updateRegion = function updateRegion(duration) {
    var $$ = this,
        config = $$.config;

    // hide if arc type
    $$.region.style('visibility', $$.hasArcType() ? 'hidden' : 'visible');

    $$.mainRegion = $$.main.select('.' + CLASS.regions).selectAll('.' + CLASS.region).data(config.regions);
    $$.mainRegion.enter().append('g').append('rect').style('fill-opacity', 0);
    $$.mainRegion.attr('class', $$.classRegion.bind($$));
    $$.mainRegion.exit().transition().duration(duration).style('opacity', 0).remove();
};
var redrawRegion = function redrawRegion(withTransition) {
    var $$ = this,
        regions = $$.mainRegion.selectAll('rect').each(function () {
        // data is binded to g and it's not transferred to rect (child node) automatically,
        // then data of each rect has to be updated manually.
        // TODO: there should be more efficient way to solve this?
        var parentData = $$.d3.select(this.parentNode).datum();
        $$.d3.select(this).datum(parentData);
    }),
        x = $$.regionX.bind($$),
        y = $$.regionY.bind($$),
        w = $$.regionWidth.bind($$),
        h = $$.regionHeight.bind($$);
    return [(withTransition ? regions.transition() : regions).attr('x', x).attr('y', y).attr('width', w).attr('height', h).style('fill-opacity', function (d) {
        return isValue(d.opacity) ? d.opacity : 0.1;
    })];
};
var regionX = function regionX(d) {
    var $$ = this,
        config = $$.config,
        xPos = void 0,
        yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        xPos = config.axis_rotated ? 'start' in d ? yScale(d.start) : 0 : 0;
    } else {
        xPos = config.axis_rotated ? 0 : 'start' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.start) : d.start) : 0;
    }
    return xPos;
};
var regionY = function regionY(d) {
    var $$ = this,
        config = $$.config,
        yPos = void 0,
        yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        yPos = config.axis_rotated ? 0 : 'end' in d ? yScale(d.end) : 0;
    } else {
        yPos = config.axis_rotated ? 'start' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.start) : d.start) : 0 : 0;
    }
    return yPos;
};
var regionWidth = function regionWidth(d) {
    var $$ = this,
        config = $$.config,
        start = $$.regionX(d),
        end = void 0,
        yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        end = config.axis_rotated ? 'end' in d ? yScale(d.end) : $$.width : $$.width;
    } else {
        end = config.axis_rotated ? $$.width : 'end' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end) : $$.width;
    }
    return end < start ? 0 : end - start;
};
var regionHeight = function regionHeight(d) {
    var $$ = this,
        config = $$.config,
        start = this.regionY(d),
        end = void 0,
        yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        end = config.axis_rotated ? $$.height : 'start' in d ? yScale(d.start) : $$.height;
    } else {
        end = config.axis_rotated ? 'end' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end) : $$.height : $$.height;
    }
    return end < start ? 0 : end - start;
};
var isRegionOnX = function isRegionOnX(d) {
    return !d.axis || d.axis === 'x';
};

var getScale = function getScale(min, max, forTimeseries) {
    return (forTimeseries ? this.d3.time.scale() : this.d3.scale.linear()).range([min, max]);
};
var getX = function getX(min, max, domain, offset) {
    var $$ = this,
        scale = $$.getScale(min, max, $$.isTimeSeries()),
        _scale = domain ? scale.domain(domain) : scale,
        key = void 0;
    // Define customized scale if categorized axis
    if ($$.isCategorized()) {
        offset = offset || function () {
            return 0;
        };
        scale = function scale(d, raw) {
            var v = _scale(d) + offset(d);
            return raw ? v : Math.ceil(v);
        };
    } else {
        scale = function scale(d, raw) {
            var v = _scale(d);
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
var getY = function getY(min, max, domain) {
    var scale = this.getScale(min, max, this.isTimeSeriesY());
    if (domain) {
        scale.domain(domain);
    }
    return scale;
};
var getYScale = function getYScale(id) {
    return this.axis.getId(id) === 'y2' ? this.y2 : this.y;
};
var getSubYScale = function getSubYScale(id) {
    return this.axis.getId(id) === 'y2' ? this.subY2 : this.subY;
};
var updateScales = function updateScales() {
    var $$ = this,
        config = $$.config,
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
    $$.x = $$.getX($$.xMin, $$.xMax, forInit ? undefined : $$.x.orgDomain(), function () {
        return $$.xAxis.tickOffset();
    });
    $$.y = $$.getY($$.yMin, $$.yMax, forInit ? config.axis_y_default : $$.y.domain());
    $$.y2 = $$.getY($$.yMin, $$.yMax, forInit ? config.axis_y2_default : $$.y2.domain());
    $$.subX = $$.getX($$.xMin, $$.xMax, $$.orgXDomain, function (d) {
        return d % 1 ? 0 : $$.subXAxis.tickOffset();
    });
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
        if ($$.brush) {
            $$.brush.scale($$.subX);
        }
        if (config.zoom_enabled) {
            $$.zoom.scale($$.x);
        }
    }
    // update for arc
    if ($$.updateArc) {
        $$.updateArc();
    }
};

var selectPoint = function selectPoint(target, d, i) {
    var $$ = this,
        config = $$.config,
        cx = (config.axis_rotated ? $$.circleY : $$.circleX).bind($$),
        cy = (config.axis_rotated ? $$.circleX : $$.circleY).bind($$),
        r = $$.pointSelectR.bind($$);
    config.data_onselected.call($$.api, d, target.node());
    // add selected-circle on low layer g
    $$.main.select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.selectedCircle + '-' + i).data([d]).enter().append('circle').attr('class', function () {
        return $$.generateClass(CLASS.selectedCircle, i);
    }).attr('cx', cx).attr('cy', cy).attr('stroke', function () {
        return $$.color(d);
    }).attr('r', function (d) {
        return $$.pointSelectR(d) * 1.4;
    }).transition().duration(100).attr('r', r);
};
var unselectPoint = function unselectPoint(target, d, i) {
    var $$ = this;
    $$.config.data_onunselected.call($$.api, d, target.node());
    // remove selected-circle from low layer g
    $$.main.select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.selectedCircle + '-' + i).transition().duration(100).attr('r', 0).remove();
};
var togglePoint = function togglePoint(selected, target, d, i) {
    selected ? this.selectPoint(target, d, i) : this.unselectPoint(target, d, i);
};
var selectPath = function selectPath(target, d) {
    var $$ = this;
    $$.config.data_onselected.call($$, d, target.node());
    if ($$.config.interaction_brighten) {
        target.transition().duration(100).style('fill', function () {
            return $$.d3.rgb($$.color(d)).brighter(0.75);
        });
    }
};
var unselectPath = function unselectPath(target, d) {
    var $$ = this;
    $$.config.data_onunselected.call($$, d, target.node());
    if ($$.config.interaction_brighten) {
        target.transition().duration(100).style('fill', function () {
            return $$.color(d);
        });
    }
};
var togglePath = function togglePath(selected, target, d, i) {
    selected ? this.selectPath(target, d, i) : this.unselectPath(target, d, i);
};
var getToggle = function getToggle(that, d) {
    var $$ = this,
        toggle = void 0;
    if (that.nodeName === 'circle') {
        if ($$.isStepType(d)) {
            // circle is hidden in step chart, so treat as within the click area
            toggle = function toggle() {}; // TODO: how to select step chart?
        } else {
            toggle = $$.togglePoint;
        }
    } else if (that.nodeName === 'path') {
        toggle = $$.togglePath;
    }
    return toggle;
};
var toggleShape = function toggleShape(that, d, i) {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config,
        shape = d3$$1.select(that),
        isSelected = shape.classed(CLASS.SELECTED),
        toggle = $$.getToggle(that, d).bind($$);

    if (config.data_selection_enabled && config.data_selection_isselectable(d)) {
        if (!config.data_selection_multiple) {
            $$.main.selectAll('.' + CLASS.shapes + (config.data_selection_grouped ? $$.getTargetSelectorSuffix(d.id) : '')).selectAll('.' + CLASS.shape).each(function (d, i) {
                var shape = d3$$1.select(this);
                if (shape.classed(CLASS.SELECTED)) {
                    toggle(false, shape.classed(CLASS.SELECTED, false), d, i);
                }
            });
        }
        shape.classed(CLASS.SELECTED, !isSelected);
        toggle(!isSelected, shape, d, i);
    }
};

var initBar = function initBar() {
    var $$ = this;
    $$.main.select('.' + CLASS$1.chart).append('g').attr('class', CLASS$1.chartBars);
};
var updateTargetsForBar = function updateTargetsForBar(targets) {
    var $$ = this,
        config = $$.config,
        mainBarUpdate = void 0,
        mainBarEnter = void 0,
        classChartBar$$1 = $$.classChartBar.bind($$),
        classBars$$1 = $$.classBars.bind($$),
        classFocus$$1 = $$.classFocus.bind($$);
    mainBarUpdate = $$.main.select('.' + CLASS$1.chartBars).selectAll('.' + CLASS$1.chartBar).data(targets).attr('class', function (d) {
        return classChartBar$$1(d) + classFocus$$1(d);
    });
    mainBarEnter = mainBarUpdate.enter().append('g').attr('class', classChartBar$$1).style('opacity', 0).style('pointer-events', 'none');
    // Bars for each data
    mainBarEnter.append('g').attr('class', classBars$$1).style('cursor', function (d) {
        return config.data_selection_isselectable(d) ? 'pointer' : null;
    });
};
var updateBar = function updateBar(durationForExit) {
    var $$ = this,
        barData = $$.barData.bind($$),
        classBar$$1 = $$.classBar.bind($$),
        initialOpacity = $$.initialOpacity.bind($$),
        color = function color(d) {
        return $$.color(d.id);
    };
    $$.mainBar = $$.main.selectAll('.' + CLASS$1.bars).selectAll('.' + CLASS$1.bar).data(barData);
    $$.mainBar.enter().append('path').attr('class', classBar$$1).style('stroke', color).style('fill', color);
    $$.mainBar.style('opacity', initialOpacity);
    $$.mainBar.exit().transition().duration(durationForExit).style('opacity', 0).remove();
};
var redrawBar = function redrawBar(drawBar, withTransition) {
    return [(withTransition ? this.mainBar.transition(Math.random().toString()) : this.mainBar).attr('d', drawBar).style('fill', this.color).style('opacity', 1)];
};
var getBarW = function getBarW(axis, barTargetsNum) {
    var $$ = this,
        config = $$.config,
        w = typeof config.bar_width === 'number' ? config.bar_width : barTargetsNum ? axis.tickInterval() * config.bar_width_ratio / barTargetsNum : 0;
    return config.bar_width_max && w > config.bar_width_max ? config.bar_width_max : w;
};
var getBars = function getBars(i, id) {
    var $$ = this;
    return (id ? $$.main.selectAll('.' + CLASS$1.bars + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS$1.bar + (isValue$2(i) ? '-' + i : ''));
};
var expandBars = function expandBars(i, id, reset) {
    var $$ = this;
    if (reset) {
        $$.unexpandBars();
    }
    $$.getBars(i, id).classed(CLASS$1.EXPANDED, true);
};
var unexpandBars = function unexpandBars(i) {
    var $$ = this;
    $$.getBars(i).classed(CLASS$1.EXPANDED, false);
};
var generateDrawBar = function generateDrawBar(barIndices, isSub) {
    var $$ = this,
        config = $$.config,
        getPoints = $$.generateGetBarPoints(barIndices, isSub);
    return function (d, i) {
        // 4 points that make a bar
        var points = getPoints(d, i);

        // switch points if axis is rotated, not applicable for sub chart
        var indexX = config.axis_rotated ? 1 : 0;
        var indexY = config.axis_rotated ? 0 : 1;

        var path = 'M ' + points[0][indexX] + ',' + points[0][indexY] + ' ' + 'L' + points[1][indexX] + ',' + points[1][indexY] + ' ' + 'L' + points[2][indexX] + ',' + points[2][indexY] + ' ' + 'L' + points[3][indexX] + ',' + points[3][indexY] + ' ' + 'z';

        return path;
    };
};
var generateGetBarPoints = function generateGetBarPoints(barIndices, isSub) {
    var $$ = this,
        axis = isSub ? $$.subXAxis : $$.xAxis,
        barTargetsNum = barIndices.__max__ + 1,
        barW = $$.getBarW(axis, barTargetsNum),
        barX = $$.getShapeX(barW, barTargetsNum, barIndices, !!isSub),
        barY = $$.getShapeY(!!isSub),
        barOffset = $$.getShapeOffset($$.isBarType, barIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        var y0 = yScale.call($$, d.id)(0),
            offset = barOffset(d, i) || y0,
            // offset is for stacked bar chart
        posX = barX(d),
            posY = barY(d);
        // fix posY not to overflow opposite quadrant
        if ($$.config.axis_rotated) {
            if (0 < d.value && posY < y0 || d.value < 0 && y0 < posY) {
                posY = y0;
            }
        }
        // 4 points that make a bar
        return [[posX, offset], [posX, posY - (y0 - offset)], [posX + barW, posY - (y0 - offset)], [posX + barW, offset]];
    };
};
var isWithinBar = function isWithinBar(that) {
    var mouse = this.d3.mouse(that),
        box = that.getBoundingClientRect(),
        seg0 = that.pathSegList.getItem(0),
        seg1 = that.pathSegList.getItem(1),
        x = Math.min(seg0.x, seg1.x),
        y = Math.min(seg0.y, seg1.y),
        w = box.width,
        h = box.height,
        offset = 2,
        sx = x - offset,
        ex = x + w + offset,
        sy = y + h + offset,
        ey = y - offset;
    return sx < mouse[0] && mouse[0] < ex && ey < mouse[1] && mouse[1] < sy;
};

var getShapeIndices = function getShapeIndices(typeFilter) {
    var $$ = this,
        config = $$.config,
        indices = {},
        i = 0,
        j = void 0,
        k = void 0;
    $$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$)).forEach(function (d) {
        for (j = 0; j < config.data_groups.length; j++) {
            if (config.data_groups[j].indexOf(d.id) < 0) {
                continue;
            }
            for (k = 0; k < config.data_groups[j].length; k++) {
                if (config.data_groups[j][k] in indices) {
                    indices[d.id] = indices[config.data_groups[j][k]];
                    break;
                }
            }
        }
        if (isUndefined$1(indices[d.id])) {
            indices[d.id] = i++;
        }
    });
    indices.__max__ = i - 1;
    return indices;
};
var getShapeX = function getShapeX(offset, targetsNum, indices, isSub) {
    var $$ = this,
        scale = isSub ? $$.subX : $$.x;
    return function (d) {
        var index = d.id in indices ? indices[d.id] : 0;
        return d.x || d.x === 0 ? scale(d.x) - offset * (targetsNum / 2 - index) : 0;
    };
};
var getShapeY = function getShapeY(isSub) {
    var $$ = this;
    return function (d) {
        var scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id);
        return scale(d.value);
    };
};
var getShapeOffset = function getShapeOffset(typeFilter, indices, isSub) {
    var $$ = this,
        targets = $$.orderTargets($$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$))),
        targetIds = targets.map(function (t) {
        return t.id;
    });
    return function (d, i) {
        var scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id),
            y0 = scale(0),
            offset = y0;
        targets.forEach(function (t) {
            var values = $$.isStepType(d) ? $$.convertValuesToStep(t.values) : t.values;
            if (t.id === d.id || indices[t.id] !== indices[d.id]) {
                return;
            }
            if (targetIds.indexOf(t.id) < targetIds.indexOf(d.id)) {
                // check if the x values line up
                if (typeof values[i] === 'undefined' || +values[i].x !== +d.x) {
                    // "+" for timeseries
                    // if not, try to find the value that does line up
                    i = -1;
                    values.forEach(function (v, j) {
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
var isWithinShape = function isWithinShape(that, d) {
    var $$ = this,
        shape = $$.d3.select(that),
        isWithin = void 0;
    if (!$$.isTargetToShow(d.id)) {
        isWithin = false;
    } else if (that.nodeName === 'circle') {
        isWithin = $$.isStepType(d) ? $$.isWithinStep(that, $$.getYScale(d.id)(d.value)) : $$.isWithinCircle(that, $$.pointSelectR(d) * 1.5);
    } else if (that.nodeName === 'path') {
        isWithin = shape.classed(CLASS$1.bar) ? $$.isWithinBar(that) : true;
    }
    return isWithin;
};

var getInterpolate = function getInterpolate(d) {
    var $$ = this,
        interpolation = $$.isInterpolationType($$.config.spline_interpolation_type) ? $$.config.spline_interpolation_type : 'cardinal';
    return $$.isSplineType(d) ? interpolation : $$.isStepType(d) ? $$.config.line_step_type : 'linear';
};

var initLine = function initLine() {
    var $$ = this;
    $$.main.select('.' + CLASS$1.chart).append('g').attr('class', CLASS$1.chartLines);
};
var updateTargetsForLine = function updateTargetsForLine(targets) {
    var $$ = this,
        config = $$.config,
        mainLineUpdate = void 0,
        mainLineEnter = void 0,
        classChartLine$$1 = $$.classChartLine.bind($$),
        classLines$$1 = $$.classLines.bind($$),
        classAreas$$1 = $$.classAreas.bind($$),
        classCircles$$1 = $$.classCircles.bind($$),
        classFocus$$1 = $$.classFocus.bind($$);
    mainLineUpdate = $$.main.select('.' + CLASS$1.chartLines).selectAll('.' + CLASS$1.chartLine).data(targets).attr('class', function (d) {
        return classChartLine$$1(d) + classFocus$$1(d);
    });
    mainLineEnter = mainLineUpdate.enter().append('g').attr('class', classChartLine$$1).style('opacity', 0).style('pointer-events', 'none');
    // Lines for each data
    mainLineEnter.append('g').attr('class', classLines$$1);
    // Areas
    mainLineEnter.append('g').attr('class', classAreas$$1);
    // Circles for each data point on lines
    mainLineEnter.append('g').attr('class', function (d) {
        return $$.generateClass(CLASS$1.selectedCircles, d.id);
    });
    mainLineEnter.append('g').attr('class', classCircles$$1).style('cursor', function (d) {
        return config.data_selection_isselectable(d) ? 'pointer' : null;
    });
    // Update date for selected circles
    targets.forEach(function (t) {
        $$.main.selectAll('.' + CLASS$1.selectedCircles + $$.getTargetSelectorSuffix(t.id)).selectAll('.' + CLASS$1.selectedCircle).each(function (d) {
            d.value = t.values[d.index].value;
        });
    });
    // MEMO: can not keep same color...
    // mainLineUpdate.exit().remove();
};
var updateLine = function updateLine(durationForExit) {
    var $$ = this;
    $$.mainLine = $$.main.selectAll('.' + CLASS$1.lines).selectAll('.' + CLASS$1.line).data($$.lineData.bind($$));
    $$.mainLine.enter().append('path').attr('class', $$.classLine.bind($$)).style('stroke', $$.color);
    $$.mainLine.style('opacity', $$.initialOpacity.bind($$)).style('shape-rendering', function (d) {
        return $$.isStepType(d) ? 'crispEdges' : '';
    }).attr('transform', null);
    $$.mainLine.exit().transition().duration(durationForExit).style('opacity', 0).remove();
};
var redrawLine = function redrawLine(drawLine, withTransition) {
    return [(withTransition ? this.mainLine.transition(Math.random().toString()) : this.mainLine).attr('d', drawLine).style('stroke', this.color).style('opacity', 1)];
};
var generateDrawLine = function generateDrawLine(lineIndices, isSub) {
    var $$ = this,
        config = $$.config,
        line = $$.d3.svg.line(),
        getPoints = $$.generateGetLinePoints(lineIndices, isSub),
        yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
        xValue = function xValue(d) {
        return (isSub ? $$.subxx : $$.xx).call($$, d);
    },
        yValue = function yValue(d, i) {
        return config.data_groups.length > 0 ? getPoints(d, i)[0][1] : yScaleGetter.call($$, d.id)(d.value);
    };

    line = config.axis_rotated ? line.x(yValue).y(xValue) : line.x(xValue).y(yValue);
    if (!config.line_connectNull) {
        line = line.defined(function (d) {
            return d.value != null;
        });
    }
    return function (d) {
        var values = config.line_connectNull ? $$.filterRemoveNull(d.values) : d.values,
            x = isSub ? $$.x : $$.subX,
            y = yScaleGetter.call($$, d.id),
            x0 = 0,
            y0 = 0,
            path = void 0;
        if ($$.isLineType(d)) {
            if (config.data_regions[d.id]) {
                path = $$.lineWithRegions(values, x, y, config.data_regions[d.id]);
            } else {
                if ($$.isStepType(d)) {
                    values = $$.convertValuesToStep(values);
                }
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
var generateGetLinePoints = function generateGetLinePoints(lineIndices, isSub) {
    // partial duplication of generateGetBarPoints
    var $$ = this,
        config = $$.config,
        lineTargetsNum = lineIndices.__max__ + 1,
        x = $$.getShapeX(0, lineTargetsNum, lineIndices, !!isSub),
        y = $$.getShapeY(!!isSub),
        lineOffset = $$.getShapeOffset($$.isLineType, lineIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        var y0 = yScale.call($$, d.id)(0),
            offset = lineOffset(d, i) || y0,
            // offset is for stacked area chart
        posX = x(d),
            posY = y(d);
        // fix posY not to overflow opposite quadrant
        if (config.axis_rotated) {
            if (0 < d.value && posY < y0 || d.value < 0 && y0 < posY) {
                posY = y0;
            }
        }
        // 1 point that marks the line position
        return [[posX, posY - (y0 - offset)], [posX, posY - (y0 - offset)], // needed for compatibility
        [posX, posY - (y0 - offset)], // needed for compatibility
        [posX, posY - (y0 - offset)]];
    };
};

var lineWithRegions = function lineWithRegions(d, x, y, _regions) {
    var $$ = this,
        config = $$.config,
        prev = -1,
        i = void 0,
        j = void 0,
        s = 'M',
        sWithRegion = void 0,
        xp = void 0,
        yp = void 0,
        dx = void 0,
        dy = void 0,
        dd = void 0,
        diff = void 0,
        diffx2 = void 0,
        xOffset = $$.isCategorized() ? 0.5 : 0,
        xValue = void 0,
        yValue = void 0,
        regions = [];

    function isWithinRegions(x, regions) {
        var i = void 0;
        for (i = 0; i < regions.length; i++) {
            if (regions[i].start < x && x <= regions[i].end) {
                return true;
            }
        }
        return false;
    }

    // Check start/end of regions
    if (isDefined$2(_regions)) {
        for (i = 0; i < _regions.length; i++) {
            regions[i] = {};
            if (isUndefined$1(_regions[i].start)) {
                regions[i].start = d[0].x;
            } else {
                regions[i].start = $$.isTimeSeries() ? $$.parseDate(_regions[i].start) : _regions[i].start;
            }
            if (isUndefined$1(_regions[i].end)) {
                regions[i].end = d[d.length - 1].x;
            } else {
                regions[i].end = $$.isTimeSeries() ? $$.parseDate(_regions[i].end) : _regions[i].end;
            }
        }
    }

    // Set scales
    xValue = config.axis_rotated ? function (d) {
        return y(d.value);
    } : function (d) {
        return x(d.x);
    };
    yValue = config.axis_rotated ? function (d) {
        return x(d.x);
    } : function (d) {
        return y(d.value);
    };

    // Define svg generator function for region
    function generateM(points) {
        return 'M' + points[0][0] + ' ' + points[0][1] + ' ' + points[1][0] + ' ' + points[1][1];
    }
    if ($$.isTimeSeries()) {
        sWithRegion = function sWithRegion(d0, d1, j, diff) {
            var x0 = d0.x.getTime(),
                x_diff = d1.x - d0.x,
                xv0 = new Date(x0 + x_diff * j),
                xv1 = new Date(x0 + x_diff * (j + diff)),
                points = void 0;
            if (config.axis_rotated) {
                points = [[y(yp(j)), x(xv0)], [y(yp(j + diff)), x(xv1)]];
            } else {
                points = [[x(xv0), y(yp(j))], [x(xv1), y(yp(j + diff))]];
            }
            return generateM(points);
        };
    } else {
        sWithRegion = function sWithRegion(d0, d1, j, diff) {
            var points = void 0;
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
        if (isUndefined$1(regions) || !isWithinRegions(d[i].x, regions)) {
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

var updateArea = function updateArea(durationForExit) {
    var $$ = this,
        d3$$1 = $$.d3;
    $$.mainArea = $$.main.selectAll('.' + CLASS$1.areas).selectAll('.' + CLASS$1.area).data($$.lineData.bind($$));
    $$.mainArea.enter().append('path').attr('class', $$.classArea.bind($$)).style('fill', $$.color).style('opacity', function () {
        $$.orgAreaOpacity = +d3$$1.select(this).style('opacity');return 0;
    });
    $$.mainArea.style('opacity', $$.orgAreaOpacity);
    $$.mainArea.exit().transition().duration(durationForExit).style('opacity', 0).remove();
};
var redrawArea = function redrawArea(drawArea, withTransition) {
    return [(withTransition ? this.mainArea.transition(Math.random().toString()) : this.mainArea).attr('d', drawArea).style('fill', this.color).style('opacity', this.orgAreaOpacity)];
};
var generateDrawArea = function generateDrawArea(areaIndices, isSub) {
    var $$ = this,
        config = $$.config,
        area = $$.d3.svg.area(),
        getPoints = $$.generateGetAreaPoints(areaIndices, isSub),
        yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
        xValue = function xValue(d) {
        return (isSub ? $$.subxx : $$.xx).call($$, d);
    },
        value0 = function value0(d, i) {
        return config.data_groups.length > 0 ? getPoints(d, i)[0][1] : yScaleGetter.call($$, d.id)($$.getAreaBaseValue(d.id));
    },
        value1 = function value1(d, i) {
        return config.data_groups.length > 0 ? getPoints(d, i)[1][1] : yScaleGetter.call($$, d.id)(d.value);
    };

    area = config.axis_rotated ? area.x0(value0).x1(value1).y(xValue) : area.x(xValue).y0(config.area_above ? 0 : value0).y1(value1);
    if (!config.line_connectNull) {
        area = area.defined(function (d) {
            return d.value !== null;
        });
    }

    return function (d) {
        var values = config.line_connectNull ? $$.filterRemoveNull(d.values) : d.values,
            x0 = 0,
            y0 = 0,
            path = void 0;
        if ($$.isAreaType(d)) {
            if ($$.isStepType(d)) {
                values = $$.convertValuesToStep(values);
            }
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
var getAreaBaseValue = function getAreaBaseValue() {
    return 0;
};
var generateGetAreaPoints = function generateGetAreaPoints(areaIndices, isSub) {
    // partial duplication of generateGetBarPoints
    var $$ = this,
        config = $$.config,
        areaTargetsNum = areaIndices.__max__ + 1,
        x = $$.getShapeX(0, areaTargetsNum, areaIndices, !!isSub),
        y = $$.getShapeY(!!isSub),
        areaOffset = $$.getShapeOffset($$.isAreaType, areaIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        var y0 = yScale.call($$, d.id)(0),
            offset = areaOffset(d, i) || y0,
            // offset is for stacked area chart
        posX = x(d),
            posY = y(d);
        // fix posY not to overflow opposite quadrant
        if (config.axis_rotated) {
            if (0 < d.value && posY < y0 || d.value < 0 && y0 < posY) {
                posY = y0;
            }
        }
        // 1 point that marks the area position
        return [[posX, offset], [posX, posY - (y0 - offset)], [posX, posY - (y0 - offset)], // needed for compatibility
        [posX, offset]];
    };
};

var updateCircle = function updateCircle() {
    var $$ = this;
    $$.mainCircle = $$.main.selectAll('.' + CLASS$1.circles).selectAll('.' + CLASS$1.circle).data($$.lineOrScatterData.bind($$));
    $$.mainCircle.enter().append('circle').attr('class', $$.classCircle.bind($$)).attr('r', $$.pointR.bind($$)).style('fill', $$.color);
    $$.mainCircle.style('opacity', $$.initialOpacityForCircle.bind($$));
    $$.mainCircle.exit().remove();
};
var redrawCircle = function redrawCircle(cx, cy, withTransition) {
    var selectedCircles = this.main.selectAll('.' + CLASS$1.selectedCircle);
    return [(withTransition ? this.mainCircle.transition(Math.random().toString()) : this.mainCircle).style('opacity', this.opacityForCircle.bind(this)).style('fill', this.color).attr('cx', cx).attr('cy', cy), (withTransition ? selectedCircles.transition(Math.random().toString()) : selectedCircles).attr('cx', cx).attr('cy', cy)];
};
var circleX = function circleX(d) {
    return d.x || d.x === 0 ? this.x(d.x) : null;
};
var updateCircleY = function updateCircleY() {
    var $$ = this,
        lineIndices = void 0,
        getPoints = void 0;
    if ($$.config.data_groups.length > 0) {
        lineIndices = $$.getShapeIndices($$.isLineType), getPoints = $$.generateGetLinePoints(lineIndices);
        $$.circleY = function (d, i) {
            return getPoints(d, i)[0][1];
        };
    } else {
        $$.circleY = function (d) {
            return $$.getYScale(d.id)(d.value);
        };
    }
};
var getCircles = function getCircles(i, id) {
    var $$ = this;
    return (id ? $$.main.selectAll('.' + CLASS$1.circles + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS$1.circle + (isValue$2(i) ? '-' + i : ''));
};
var expandCircles = function expandCircles(i, id, reset) {
    var $$ = this,
        r = $$.pointExpandedR.bind($$);
    if (reset) {
        $$.unexpandCircles();
    }
    $$.getCircles(i, id).classed(CLASS$1.EXPANDED, true).attr('r', r);
};
var unexpandCircles = function unexpandCircles(i) {
    var $$ = this,
        r = $$.pointR.bind($$);
    $$.getCircles(i).filter(function () {
        return $$.d3.select(this).classed(CLASS$1.EXPANDED);
    }).classed(CLASS$1.EXPANDED, false).attr('r', r);
};
var pointR = function pointR(d) {
    var $$ = this,
        config = $$.config;
    return $$.isStepType(d) ? 0 : isFunction$1(config.point_r) ? config.point_r(d) : config.point_r;
};
var pointExpandedR = function pointExpandedR(d) {
    var $$ = this,
        config = $$.config;
    return config.point_focus_expand_enabled ? config.point_focus_expand_r ? config.point_focus_expand_r : $$.pointR(d) * 1.75 : $$.pointR(d);
};
var pointSelectR = function pointSelectR(d) {
    var $$ = this,
        config = $$.config;
    return isFunction$1(config.point_select_r) ? config.point_select_r(d) : config.point_select_r ? config.point_select_r : $$.pointR(d) * 4;
};
var isWithinCircle = function isWithinCircle(that, r) {
    var d3$$1 = this.d3,
        mouse = d3$$1.mouse(that),
        d3_this = d3$$1.select(that),
        cx = +d3_this.attr('cx'),
        cy = +d3_this.attr('cy');
    return Math.sqrt(Math.pow(cx - mouse[0], 2) + Math.pow(cy - mouse[1], 2)) < r;
};
var isWithinStep = function isWithinStep(that, y) {
    return Math.abs(y - this.d3.mouse(that)[1]) < 30;
};

var getCurrentWidth = function getCurrentWidth() {
    var $$ = this,
        config = $$.config;
    return config.size_width ? config.size_width : $$.getParentWidth();
};
var getCurrentHeight = function getCurrentHeight() {
    var $$ = this,
        config = $$.config,
        h = config.size_height ? config.size_height : $$.getParentHeight();
    return h > 0 ? h : 320 / ($$.hasType('gauge') && !config.gauge_fullCircle ? 2 : 1);
};
var getCurrentPaddingTop = function getCurrentPaddingTop() {
    var $$ = this,
        config = $$.config,
        padding = isValue$2(config.padding_top) ? config.padding_top : 0;
    if ($$.title && $$.title.node()) {
        padding += $$.getTitlePadding();
    }
    return padding;
};
var getCurrentPaddingBottom = function getCurrentPaddingBottom() {
    var config = this.config;
    return isValue$2(config.padding_bottom) ? config.padding_bottom : 0;
};
var getCurrentPaddingLeft = function getCurrentPaddingLeft(withoutRecompute) {
    var $$ = this,
        config = $$.config;
    if (isValue$2(config.padding_left)) {
        return config.padding_left;
    } else if (config.axis_rotated) {
        return !config.axis_x_show ? 1 : Math.max(ceil10$1($$.getAxisWidthByAxisId('x', withoutRecompute)), 40);
    } else if (!config.axis_y_show || config.axis_y_inner) {
        // && !config.axis_rotated
        return $$.axis.getYAxisLabelPosition().isOuter ? 30 : 1;
    } else {
        return ceil10$1($$.getAxisWidthByAxisId('y', withoutRecompute));
    }
};
var getCurrentPaddingRight = function getCurrentPaddingRight() {
    var $$ = this,
        config = $$.config,
        defaultPadding = 10,
        legendWidthOnRight = $$.isLegendRight ? $$.getLegendWidth() + 20 : 0;
    if (isValue$2(config.padding_right)) {
        return config.padding_right + 1; // 1 is needed not to hide tick line
    } else if (config.axis_rotated) {
        return defaultPadding + legendWidthOnRight;
    } else if (!config.axis_y2_show || config.axis_y2_inner) {
        // && !config.axis_rotated
        return 2 + legendWidthOnRight + ($$.axis.getY2AxisLabelPosition().isOuter ? 20 : 0);
    } else {
        return ceil10$1($$.getAxisWidthByAxisId('y2')) + legendWidthOnRight;
    }
};

var getParentRectValue = function getParentRectValue(key) {
    var parent = this.selectChart.node(),
        v = void 0;
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
var getParentWidth = function getParentWidth() {
    return this.getParentRectValue('width');
};
var getParentHeight = function getParentHeight() {
    var h = this.selectChart.style('height');
    return h.indexOf('px') > 0 ? +h.replace('px', '') : 0;
};

var getSvgLeft = function getSvgLeft(withoutRecompute) {
    var $$ = this,
        config = $$.config,
        hasLeftAxisRect = config.axis_rotated || !config.axis_rotated && !config.axis_y_inner,
        leftAxisClass = config.axis_rotated ? CLASS$1.axisX : CLASS$1.axisY,
        leftAxis = $$.main.select('.' + leftAxisClass).node(),
        svgRect = leftAxis && hasLeftAxisRect ? leftAxis.getBoundingClientRect() : { right: 0 },
        chartRect = $$.selectChart.node().getBoundingClientRect(),
        hasArc = $$.hasArcType(),
        svgLeft = svgRect.right - chartRect.left - (hasArc ? 0 : $$.getCurrentPaddingLeft(withoutRecompute));
    return svgLeft > 0 ? svgLeft : 0;
};

var getAxisWidthByAxisId = function getAxisWidthByAxisId(id, withoutRecompute) {
    var $$ = this,
        position = $$.axis.getLabelPositionById(id);
    return $$.axis.getMaxTickWidth(id, withoutRecompute) + (position.isInner ? 20 : 40);
};
var getHorizontalAxisHeight = function getHorizontalAxisHeight(axisId) {
    var $$ = this,
        config = $$.config,
        h = 30;
    if (axisId === 'x' && !config.axis_x_show) {
        return 8;
    }
    if (axisId === 'x' && config.axis_x_height) {
        return config.axis_x_height;
    }
    if (axisId === 'y' && !config.axis_y_show) {
        return config.legend_show && !$$.isLegendRight && !$$.isLegendInset ? 10 : 1;
    }
    if (axisId === 'y2' && !config.axis_y2_show) {
        return $$.rotated_padding_top;
    }
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

var getEventRectWidth = function getEventRectWidth() {
    return Math.max(0, this.xAxis.tickInterval());
};

var initBrush = function initBrush() {
    var $$ = this,
        d3$$1 = $$.d3;
    $$.brush = d3$$1.svg.brush().on('brush', function () {
        $$.redrawForBrush();
    });
    $$.brush.update = function () {
        if ($$.context) {
            $$.context.select('.' + CLASS$1.brush).call(this);
        }
        return this;
    };
    $$.brush.scale = function (scale) {
        return $$.config.axis_rotated ? this.y(scale) : this.x(scale);
    };
};
var initSubchart = function initSubchart() {
    var $$ = this,
        config = $$.config,
        context = $$.context = $$.svg.append('g').attr('transform', $$.getTranslate('context')),
        visibility = config.subchart_show ? 'visible' : 'hidden';

    context.style('visibility', visibility);

    // Define g for chart area
    context.append('g').attr('clip-path', $$.clipPathForSubchart).attr('class', CLASS$1.chart);

    // Define g for bar chart area
    context.select('.' + CLASS$1.chart).append('g').attr('class', CLASS$1.chartBars);

    // Define g for line chart area
    context.select('.' + CLASS$1.chart).append('g').attr('class', CLASS$1.chartLines);

    // Add extent rect for Brush
    context.append('g').attr('clip-path', $$.clipPath).attr('class', CLASS$1.brush).call($$.brush);

    // ATTENTION: This must be called AFTER chart added
    // Add Axis
    $$.axes.subx = context.append('g').attr('class', CLASS$1.axisX).attr('transform', $$.getTranslate('subx')).attr('clip-path', config.axis_rotated ? '' : $$.clipPathForXAxis).style('visibility', config.subchart_axis_x_show ? visibility : 'hidden');
};
var updateTargetsForSubchart = function updateTargetsForSubchart(targets) {
    var $$ = this,
        context = $$.context,
        config = $$.config,
        contextLineEnter = void 0,
        contextLineUpdate = void 0,
        contextBarEnter = void 0,
        contextBarUpdate = void 0,
        classChartBar$$1 = $$.classChartBar.bind($$),
        classBars$$1 = $$.classBars.bind($$),
        classChartLine$$1 = $$.classChartLine.bind($$),
        classLines$$1 = $$.classLines.bind($$),
        classAreas$$1 = $$.classAreas.bind($$);

    if (config.subchart_show) {
        // -- Bar --//
        contextBarUpdate = context.select('.' + CLASS$1.chartBars).selectAll('.' + CLASS$1.chartBar).data(targets).attr('class', classChartBar$$1);
        contextBarEnter = contextBarUpdate.enter().append('g').style('opacity', 0).attr('class', classChartBar$$1);
        // Bars for each data
        contextBarEnter.append('g').attr('class', classBars$$1);

        // -- Line --//
        contextLineUpdate = context.select('.' + CLASS$1.chartLines).selectAll('.' + CLASS$1.chartLine).data(targets).attr('class', classChartLine$$1);
        contextLineEnter = contextLineUpdate.enter().append('g').style('opacity', 0).attr('class', classChartLine$$1);
        // Lines for each data
        contextLineEnter.append('g').attr('class', classLines$$1);
        // Area
        contextLineEnter.append('g').attr('class', classAreas$$1);

        // -- Brush --//
        context.selectAll('.' + CLASS$1.brush + ' rect').attr(config.axis_rotated ? 'width' : 'height', config.axis_rotated ? $$.width2 : $$.height2);
    }
};
var updateBarForSubchart = function updateBarForSubchart(durationForExit) {
    var $$ = this;
    $$.contextBar = $$.context.selectAll('.' + CLASS$1.bars).selectAll('.' + CLASS$1.bar).data($$.barData.bind($$));
    $$.contextBar.enter().append('path').attr('class', $$.classBar.bind($$)).style('stroke', 'none').style('fill', $$.color);
    $$.contextBar.style('opacity', $$.initialOpacity.bind($$));
    $$.contextBar.exit().transition().duration(durationForExit).style('opacity', 0).remove();
};
var redrawBarForSubchart = function redrawBarForSubchart(drawBarOnSub, withTransition, duration) {
    (withTransition ? this.contextBar.transition(Math.random().toString()).duration(duration) : this.contextBar).attr('d', drawBarOnSub).style('opacity', 1);
};
var updateLineForSubchart = function updateLineForSubchart(durationForExit) {
    var $$ = this;
    $$.contextLine = $$.context.selectAll('.' + CLASS$1.lines).selectAll('.' + CLASS$1.line).data($$.lineData.bind($$));
    $$.contextLine.enter().append('path').attr('class', $$.classLine.bind($$)).style('stroke', $$.color);
    $$.contextLine.style('opacity', $$.initialOpacity.bind($$));
    $$.contextLine.exit().transition().duration(durationForExit).style('opacity', 0).remove();
};
var redrawLineForSubchart = function redrawLineForSubchart(drawLineOnSub, withTransition, duration) {
    (withTransition ? this.contextLine.transition(Math.random().toString()).duration(duration) : this.contextLine).attr('d', drawLineOnSub).style('opacity', 1);
};
var updateAreaForSubchart = function updateAreaForSubchart(durationForExit) {
    var $$ = this,
        d3$$1 = $$.d3;
    $$.contextArea = $$.context.selectAll('.' + CLASS$1.areas).selectAll('.' + CLASS$1.area).data($$.lineData.bind($$));
    $$.contextArea.enter().append('path').attr('class', $$.classArea.bind($$)).style('fill', $$.color).style('opacity', function () {
        $$.orgAreaOpacity = +d3$$1.select(this).style('opacity');return 0;
    });
    $$.contextArea.style('opacity', 0);
    $$.contextArea.exit().transition().duration(durationForExit).style('opacity', 0).remove();
};
var redrawAreaForSubchart = function redrawAreaForSubchart(drawAreaOnSub, withTransition, duration) {
    (withTransition ? this.contextArea.transition(Math.random().toString()).duration(duration) : this.contextArea).attr('d', drawAreaOnSub).style('fill', this.color).style('opacity', this.orgAreaOpacity);
};
var redrawSubchart = function redrawSubchart(withSubchart, transitions, duration, durationForExit, areaIndices, barIndices, lineIndices) {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config,
        drawAreaOnSub = void 0,
        drawBarOnSub = void 0,
        drawLineOnSub = void 0;

    $$.context.style('visibility', config.subchart_show ? 'visible' : 'hidden');

    // subchart
    if (config.subchart_show) {
        // reflect main chart to extent on subchart if zoomed
        if (d3$$1.event && d3$$1.event.type === 'zoom') {
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
var redrawForBrush = function redrawForBrush() {
    var $$ = this,
        x = $$.x;
    $$.redraw({
        withTransition: false,
        withY: $$.config.zoom_rescale,
        withSubchart: false,
        withUpdateXDomain: true,
        withDimension: false
    });
    $$.config.subchart_onbrush.call($$.api, x.orgDomain());
};
var transformContext = function transformContext(withTransition, transitions) {
    var $$ = this,
        subXAxis = void 0;
    if (transitions && transitions.axisSubX) {
        subXAxis = transitions.axisSubX;
    } else {
        subXAxis = $$.context.select('.' + CLASS$1.axisX);
        if (withTransition) {
            subXAxis = subXAxis.transition();
        }
    }
    $$.context.attr('transform', $$.getTranslate('context'));
    subXAxis.attr('transform', $$.getTranslate('subx'));
};
var getDefaultExtent = function getDefaultExtent() {
    var $$ = this,
        config = $$.config,
        extent = isFunction$1(config.axis_x_extent) ? config.axis_x_extent($$.getXDomain($$.data.targets)) : config.axis_x_extent;
    if ($$.isTimeSeries()) {
        extent = [$$.parseDate(extent[0]), $$.parseDate(extent[1])];
    }
    return extent;
};

var initText = function initText() {
    var $$ = this;
    $$.main.select('.' + CLASS$1.chart).append('g').attr('class', CLASS$1.chartTexts);
    $$.mainText = $$.d3.selectAll([]);
};
var updateTargetsForText = function updateTargetsForText(targets) {
    var $$ = this,
        mainTextUpdate = void 0,
        mainTextEnter = void 0,
        classChartText$$1 = $$.classChartText.bind($$),
        classTexts$$1 = $$.classTexts.bind($$),
        classFocus$$1 = $$.classFocus.bind($$);
    mainTextUpdate = $$.main.select('.' + CLASS$1.chartTexts).selectAll('.' + CLASS$1.chartText).data(targets).attr('class', function (d) {
        return classChartText$$1(d) + classFocus$$1(d);
    });
    mainTextEnter = mainTextUpdate.enter().append('g').attr('class', classChartText$$1).style('opacity', 0).style('pointer-events', 'none');
    mainTextEnter.append('g').attr('class', classTexts$$1);
};
var updateText = function updateText(durationForExit) {
    var $$ = this,
        config = $$.config,
        barOrLineData = $$.barOrLineData.bind($$),
        classText$$1 = $$.classText.bind($$);
    $$.mainText = $$.main.selectAll('.' + CLASS$1.texts).selectAll('.' + CLASS$1.text).data(barOrLineData);
    $$.mainText.enter().append('text').attr('class', classText$$1).attr('text-anchor', function (d) {
        return config.axis_rotated ? d.value < 0 ? 'end' : 'start' : 'middle';
    }).style('stroke', 'none').style('fill', function (d) {
        return $$.color(d);
    }).style('fill-opacity', 0);
    $$.mainText.text(function (d, i, j) {
        return $$.dataLabelFormat(d.id)(d.value, d.id, i, j);
    });
    $$.mainText.exit().transition().duration(durationForExit).style('fill-opacity', 0).remove();
};
var redrawText = function redrawText(xForText, yForText, forFlow, withTransition) {
    return [(withTransition ? this.mainText.transition() : this.mainText).attr('x', xForText).attr('y', yForText).style('fill', this.color).style('fill-opacity', forFlow ? 0 : this.opacityForText.bind(this))];
};
var getTextRect = function getTextRect(text, cls, element) {
    var dummy = this.d3.select('body').append('div').classed('c3', true),
        svg = dummy.append('svg').style('visibility', 'hidden').style('position', 'fixed').style('top', 0).style('left', 0),
        font = this.d3.select(element).style('font'),
        rect = void 0;
    svg.selectAll('.dummy').data([text]).enter().append('text').classed(cls ? cls : '', true).style('font', font).text(text).each(function () {
        rect = this.getBoundingClientRect();
    });
    dummy.remove();
    return rect;
};
var generateXYForText = function generateXYForText(areaIndices, barIndices, lineIndices, forX) {
    var $$ = this,
        getAreaPoints = $$.generateGetAreaPoints(areaIndices, false),
        getBarPoints = $$.generateGetBarPoints(barIndices, false),
        getLinePoints = $$.generateGetLinePoints(lineIndices, false),
        getter = forX ? $$.getXForText : $$.getYForText;
    return function (d, i) {
        var getPoints = $$.isAreaType(d) ? getAreaPoints : $$.isBarType(d) ? getBarPoints : getLinePoints;
        return getter.call($$, getPoints(d, i), d, this);
    };
};
var getXForText = function getXForText(points, d, textElement) {
    var $$ = this,
        box = textElement.getBoundingClientRect(),
        xPos = void 0,
        padding = void 0;
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
var getYForText = function getYForText(points, d, textElement) {
    var $$ = this,
        box = textElement.getBoundingClientRect(),
        yPos = void 0;
    if ($$.config.axis_rotated) {
        yPos = (points[0][0] + points[2][0] + box.height * 0.6) / 2;
    } else {
        yPos = points[2][1];
        if (d.value < 0 || d.value === 0 && !$$.hasPositiveValue) {
            yPos += box.height;
            if ($$.isBarType(d) && $$.isSafari()) {
                yPos -= 3;
            } else if (!$$.isBarType(d) && $$.isChrome()) {
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

var initTitle = function initTitle() {
    var $$ = this;
    $$.title = $$.svg.append('text').text($$.config.title_text).attr('class', $$.CLASS.title);
};
var redrawTitle = function redrawTitle() {
    var $$ = this;
    $$.title.attr('x', $$.xForTitle.bind($$)).attr('y', $$.yForTitle.bind($$));
};
var xForTitle = function xForTitle() {
    var $$ = this,
        config = $$.config,
        position = config.title_position || 'left',
        x = void 0;
    if (position.indexOf('right') >= 0) {
        x = $$.currentWidth - $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).width - config.title_padding.right;
    } else if (position.indexOf('center') >= 0) {
        x = ($$.currentWidth - $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).width) / 2;
    } else {
        // left
        x = config.title_padding.left;
    }
    return x;
};
var yForTitle = function yForTitle() {
    var $$ = this;
    return $$.config.title_padding.top + $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).height;
};
var getTitlePadding = function getTitlePadding() {
    var $$ = this;
    return $$.yForTitle() + $$.config.title_padding.bottom;
};

var initTooltip = function initTooltip() {
    var $$ = this,
        config = $$.config,
        i = void 0;
    $$.tooltip = $$.selectChart.style('position', 'relative').append('div').attr('class', CLASS$1.tooltipContainer).style('position', 'absolute').style('pointer-events', 'none').style('display', 'none');
    // Show tooltip if needed
    if (config.tooltip_init_show) {
        if ($$.isTimeSeries() && isString$1(config.tooltip_init_x)) {
            config.tooltip_init_x = $$.parseDate(config.tooltip_init_x);
            for (i = 0; i < $$.data.targets[0].values.length; i++) {
                if ($$.data.targets[0].values[i].x - config.tooltip_init_x === 0) {
                    break;
                }
            }
            config.tooltip_init_x = i;
        }
        $$.tooltip.html(config.tooltip_contents.call($$, $$.data.targets.map(function (d) {
            return $$.addName(d.values[config.tooltip_init_x]);
        }), $$.axis.getXAxisTickFormat(), $$.getYFormat($$.hasArcType()), $$.color));
        $$.tooltip.style('top', config.tooltip_init_position.top).style('left', config.tooltip_init_position.left).style('display', 'block');
    }
};
var getTooltipContent = function getTooltipContent(d, defaultTitleFormat, defaultValueFormat, color) {
    var $$ = this,
        config = $$.config,
        titleFormat = config.tooltip_format_title || defaultTitleFormat,
        nameFormat = config.tooltip_format_name || function (name) {
        return name;
    },
        valueFormat = config.tooltip_format_value || defaultValueFormat,
        text = void 0,
        i = void 0,
        title = void 0,
        value = void 0,
        name = void 0,
        bgcolor = void 0,
        orderAsc = $$.isOrderAsc();

    if (config.data_groups.length === 0) {
        d.sort(function (a, b) {
            var v1 = a ? a.value : null,
                v2 = b ? b.value : null;
            return orderAsc ? v1 - v2 : v2 - v1;
        });
    } else {
        (function () {
            var ids = $$.orderTargets($$.data.targets).map(function (i) {
                return i.id;
            });
            d.sort(function (a, b) {
                var v1 = a ? a.value : null,
                    v2 = b ? b.value : null;
                if (v1 > 0 && v2 > 0) {
                    v1 = a ? ids.indexOf(a.id) : null;
                    v2 = b ? ids.indexOf(b.id) : null;
                }
                return orderAsc ? v1 - v2 : v2 - v1;
            });
        })();
    }

    for (i = 0; i < d.length; i++) {
        if (!(d[i] && (d[i].value || d[i].value === 0))) {
            continue;
        }

        if (!text) {
            title = sanitise$1(titleFormat ? titleFormat(d[i].x) : d[i].x);
            text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + '</th></tr>' : '');
        }

        value = sanitise$1(valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index, d));
        if (value !== undefined) {
            // Skip elements when their name is set to null
            if (d[i].name === null) {
                continue;
            }
            name = sanitise$1(nameFormat(d[i].name, d[i].ratio, d[i].id, d[i].index));
            bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

            text += "<tr class='" + $$.CLASS.tooltipName + '-' + $$.getTargetSelectorSuffix(d[i].id) + "'>";
            text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + '</td>';
            text += "<td class='value'>" + value + '</td>';
            text += '</tr>';
        }
    }
    return text + '</table>';
};
var tooltipPosition = function tooltipPosition(dataToShow, tWidth, tHeight, element) {
    var $$ = this,
        config = $$.config,
        d3$$1 = $$.d3;
    var svgLeft = void 0,
        tooltipLeft = void 0,
        tooltipRight = void 0,
        tooltipTop = void 0,
        chartRight = void 0;
    var forArc = $$.hasArcType(),
        mouse = d3$$1.mouse(element);
    // Determin tooltip position
    if (forArc) {
        tooltipLeft = ($$.width - ($$.isLegendRight ? $$.getLegendWidth() : 0)) / 2 + mouse[0];
        tooltipTop = $$.height / 2 + mouse[1] + 20;
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
var showTooltip = function showTooltip(selectedData, element) {
    var $$ = this,
        config = $$.config;
    var tWidth = void 0,
        tHeight = void 0,
        position = void 0;
    var forArc = $$.hasArcType(),
        dataToShow = selectedData.filter(function (d) {
        return d && isValue$2(d.value);
    }),
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
    $$.tooltip.style('top', position.top + 'px').style('left', position.left + 'px');
};
var hideTooltip = function hideTooltip() {
    this.tooltip.style('display', 'none');
};

var transformTo = function transformTo(targetIds, type, optionsForRedraw) {
    var $$ = this,
        withTransitionForAxis = !$$.hasArcType(),
        options = optionsForRedraw || { withTransitionForAxis: withTransitionForAxis };
    options.withTransitionForTransform = false;
    $$.transiting = false;
    $$.setTargetType(targetIds, type);
    $$.updateTargets($$.data.targets); // this is needed when transforming to arc
    $$.updateAndRedraw(options);
};

var setTargetType = function setTargetType(targetIds, type) {
    var $$ = this,
        config = $$.config;
    $$.mapToTargetIds(targetIds).forEach(function (id) {
        $$.withoutFadeIn[id] = type === config.data_types[id];
        config.data_types[id] = type;
    });
    if (!targetIds) {
        config.data_type = type;
    }
};
var hasType = function hasType(type, targets) {
    var $$ = this,
        types = $$.config.data_types,
        has = false;
    targets = targets || $$.data.targets;
    if (targets && targets.length) {
        targets.forEach(function (target) {
            var t = types[target.id];
            if (t && t.indexOf(type) >= 0 || !t && type === 'line') {
                has = true;
            }
        });
    } else if (Object.keys(types).length) {
        Object.keys(types).forEach(function (id) {
            if (types[id] === type) {
                has = true;
            }
        });
    } else {
        has = $$.config.data_type === type;
    }
    return has;
};
var hasArcType = function hasArcType(targets) {
    return this.hasType('pie', targets) || this.hasType('donut', targets) || this.hasType('gauge', targets);
};
var isLineType = function isLineType(d) {
    var config = this.config,
        id = isString$1(d) ? d : d.id;
    return !config.data_types[id] || ['line', 'spline', 'area', 'area-spline', 'step', 'area-step'].indexOf(config.data_types[id]) >= 0;
};
var isStepType = function isStepType(d) {
    var id = isString$1(d) ? d : d.id;
    return ['step', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
var isSplineType = function isSplineType(d) {
    var id = isString$1(d) ? d : d.id;
    return ['spline', 'area-spline'].indexOf(this.config.data_types[id]) >= 0;
};
var isAreaType = function isAreaType(d) {
    var id = isString$1(d) ? d : d.id;
    return ['area', 'area-spline', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
var isBarType = function isBarType(d) {
    var id = isString$1(d) ? d : d.id;
    return this.config.data_types[id] === 'bar';
};
var isScatterType = function isScatterType(d) {
    var id = isString$1(d) ? d : d.id;
    return this.config.data_types[id] === 'scatter';
};
var isPieType = function isPieType(d) {
    var id = isString$1(d) ? d : d.id;
    return this.config.data_types[id] === 'pie';
};
var isGaugeType = function isGaugeType(d) {
    var id = isString$1(d) ? d : d.id;
    return this.config.data_types[id] === 'gauge';
};
var isDonutType = function isDonutType(d) {
    var id = isString$1(d) ? d : d.id;
    return this.config.data_types[id] === 'donut';
};
var isArcType = function isArcType(d) {
    return this.isPieType(d) || this.isDonutType(d) || this.isGaugeType(d);
};
var lineData = function lineData(d) {
    return this.isLineType(d) ? [d] : [];
};
var arcData = function arcData(d) {
    return this.isArcType(d.data) ? [d] : [];
};
/* not used
 function scatterData(d) {
 return isScatterType(d) ? d.values : [];
 }
 */
var barData = function barData(d) {
    return this.isBarType(d) ? d.values : [];
};
var lineOrScatterData = function lineOrScatterData(d) {
    return this.isLineType(d) || this.isScatterType(d) ? d.values : [];
};
var barOrLineData = function barOrLineData(d) {
    return this.isBarType(d) || this.isLineType(d) ? d.values : [];
};
var isInterpolationType = function isInterpolationType(type) {
    return ['linear', 'linear-closed', 'basis', 'basis-open', 'basis-closed', 'bundle', 'cardinal', 'cardinal-open', 'cardinal-closed', 'monotone'].indexOf(type) >= 0;
};

var isSafari = function isSafari() {
    var ua = window.navigator.userAgent;
    return ua.indexOf('Safari') >= 0 && ua.indexOf('Chrome') < 0;
};
var isChrome = function isChrome() {
    var ua = window.navigator.userAgent;
    return ua.indexOf('Chrome') >= 0;
};

var initZoom = function initZoom() {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config,
        startEvent = void 0;

    $$.zoom = d3$$1.behavior.zoom().on('zoomstart', function () {
        startEvent = d3$$1.event.sourceEvent;
        $$.zoom.altDomain = d3$$1.event.sourceEvent.altKey ? $$.x.orgDomain() : null;
        config.zoom_onzoomstart.call($$.api, d3$$1.event.sourceEvent);
    }).on('zoom', function () {
        $$.redrawForZoom.call($$);
    }).on('zoomend', function () {
        var event = d3$$1.event.sourceEvent;
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
        var extent = config.zoom_extent ? config.zoom_extent : [1, 10];
        return [extent[0], Math.max($$.getMaxDataCount() / extent[1], extent[1])];
    };
    $$.zoom.updateScaleExtent = function () {
        var ratio = diffDomain$2($$.x.orgDomain()) / diffDomain$2($$.getZoomDomain()),
            extent = this.orgScaleExtent();
        this.scaleExtent([extent[0] * ratio, extent[1] * ratio]);
        return this;
    };
};
var getZoomDomain = function getZoomDomain() {
    var $$ = this,
        config = $$.config,
        d3$$1 = $$.d3,
        min = d3$$1.min([$$.orgXDomain[0], config.zoom_x_min]),
        max = d3$$1.max([$$.orgXDomain[1], config.zoom_x_max]);
    return [min, max];
};
var updateZoom = function updateZoom() {
    var $$ = this,
        z = $$.config.zoom_enabled ? $$.zoom : function () {};
    $$.main.select('.' + CLASS$1.zoomRect).call(z).on('dblclick.zoom', null);
    $$.main.selectAll('.' + CLASS$1.eventRect).call(z).on('dblclick.zoom', null);
};
var redrawForZoom = function redrawForZoom() {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config,
        zoom = $$.zoom,
        x = $$.x;
    if (!config.zoom_enabled) {
        return;
    }
    if ($$.filterTargetsToShow($$.data.targets).length === 0) {
        return;
    }
    if (d3$$1.event.sourceEvent.type === 'mousemove' && zoom.altDomain) {
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
        withDimension: false
    });
    if (d3$$1.event.sourceEvent.type === 'mousemove') {
        $$.cancelClick = true;
    }
    config.zoom_onzoom.call($$.api, x.orgDomain());
};

/**
 * This file is seriously in need of some reorganization.
 */

var isValue$1 = isValue$2;
var isFunction$$1 = isFunction$1;
var isString$$1 = isString$1;
var isUndefined$$1 = isUndefined$1;
var isDefined$1 = isDefined$2;
var asHalfPixel$$1 = asHalfPixel$1;
var isEmpty$1 = isEmpty$2;
var notEmpty$1 = notEmpty$2;
var getOption$1 = getOption$2;
function ChartInternal(api) {
    var $$ = this;
    $$.d3 = d3;
    $$.api = api;
    $$.config = $$.getDefaultConfig();
    $$.data = {};
    $$.cache = {};
    $$.axes = {};
}

var c3_chart_internal_fn = ChartInternal.prototype;

c3_chart_internal_fn.beforeInit = function () {
    // can do something
};
c3_chart_internal_fn.afterInit = function () {
    // can do something
};
c3_chart_internal_fn.init = function () {
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

c3_chart_internal_fn.initParams = function () {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config;

    // MEMO: clipId needs to be unique because it conflicts when multiple charts exist
    $$.clipId = 'c3-' + +new Date() + '-clip', $$.clipIdForXAxis = $$.clipId + '-xaxis', $$.clipIdForYAxis = $$.clipId + '-yaxis', $$.clipIdForGrid = $$.clipId + '-grid', $$.clipIdForSubchart = $$.clipId + '-subchart', $$.clipPath = $$.getClipPath($$.clipId), $$.clipPathForXAxis = $$.getClipPath($$.clipIdForXAxis), $$.clipPathForYAxis = $$.getClipPath($$.clipIdForYAxis);
    $$.clipPathForGrid = $$.getClipPath($$.clipIdForGrid), $$.clipPathForSubchart = $$.getClipPath($$.clipIdForSubchart), $$.dragStart = null;
    $$.dragging = false;
    $$.flowing = false;
    $$.cancelClick = false;
    $$.mouseover = false;
    $$.transiting = false;

    $$.color = $$.generateColor();
    $$.levelColor = $$.generateLevelColor();

    $$.dataTimeFormat = config.data_xLocaltime ? d3$$1.time.format : d3$$1.time.format.utc;
    $$.axisTimeFormat = config.axis_x_localtime ? d3$$1.time.format : d3$$1.time.format.utc;
    $$.defaultAxisTimeFormat = $$.axisTimeFormat.multi([['.%L', function (d) {
        return d.getMilliseconds();
    }], [':%S', function (d) {
        return d.getSeconds();
    }], ['%I:%M', function (d) {
        return d.getMinutes();
    }], ['%I %p', function (d) {
        return d.getHours();
    }], ['%-m/%-d', function (d) {
        return d.getDay() && d.getDate() !== 1;
    }], ['%-m/%-d', function (d) {
        return d.getDate() !== 1;
    }], ['%-m/%-d', function (d) {
        return d.getMonth();
    }], ['%Y/%-m/%-d', function () {
        return true;
    }]]);

    $$.hiddenTargetIds = [];
    $$.hiddenLegendIds = [];
    $$.focusedTargetIds = [];
    $$.defocusedTargetIds = [];

    $$.xOrient = config.axis_rotated ? 'left' : 'bottom';
    $$.yOrient = config.axis_rotated ? config.axis_y_inner ? 'top' : 'bottom' : config.axis_y_inner ? 'right' : 'left';
    $$.y2Orient = config.axis_rotated ? config.axis_y2_inner ? 'bottom' : 'top' : config.axis_y2_inner ? 'left' : 'right';
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
        y2: 0
    };

    $$.rotated_padding_left = 30;
    $$.rotated_padding_right = config.axis_rotated && !config.axis_x_show ? 0 : 30;
    $$.rotated_padding_top = 5;

    $$.withoutFadeIn = {};

    $$.intervalForObserveInserted = undefined;

    $$.axes.subx = d3$$1.selectAll([]); // needs when excluding subchart.js
};

c3_chart_internal_fn.initChartElements = function () {
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

c3_chart_internal_fn.initWithData = function (data) {
    var $$ = this,
        d3$$1 = $$.d3,
        config = $$.config;
    var defs = void 0,
        main = void 0,
        binding = true;

    $$.axis = new Axis$$1($$);

    if ($$.initPie) {
        $$.initPie();
    }
    if ($$.initBrush) {
        $$.initBrush();
    }
    if ($$.initZoom) {
        $$.initZoom();
    }

    if (!config.bindto) {
        $$.selectChart = d3$$1.selectAll([]);
    } else if (typeof config.bindto.node === 'function') {
        $$.selectChart = config.bindto;
    } else {
        $$.selectChart = d3$$1.select(config.bindto);
    }
    if ($$.selectChart.empty()) {
        $$.selectChart = d3$$1.select(document.createElement('div')).style('opacity', 0);
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
    $$.x.domain(d3$$1.extent($$.getXDomain($$.data.targets)));
    $$.y.domain($$.getYDomain($$.data.targets, 'y'));
    $$.y2.domain($$.getYDomain($$.data.targets, 'y2'));
    $$.subX.domain($$.x.domain());
    $$.subY.domain($$.y.domain());
    $$.subY2.domain($$.y2.domain());

    // Save original x domain for zoom update
    $$.orgXDomain = $$.x.domain();

    // Set initialized scales to brush and zoom
    if ($$.brush) {
        $$.brush.scale($$.subX);
    }
    if (config.zoom_enabled) {
        $$.zoom.scale($$.x);
    }

    /* -- Basic Elements --*/

    // Define svgs
    $$.svg = $$.selectChart.append('svg').style('overflow', 'hidden').on('mouseenter', function () {
        return config.onmouseover.call($$);
    }).on('mouseleave', function () {
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

    /* -- Main Region --*/

    // text when empty
    main.append('text').attr('class', CLASS$1.text + ' ' + CLASS$1.empty).attr('text-anchor', 'middle') // horizontal centering of text at x position in all browsers.
    .attr('dominant-baseline', 'middle'); // vertical centering of text at y position in all browsers, except IE.

    // Regions
    $$.initRegion();

    // Grids
    $$.initGrid();

    // Define g for chart area
    main.append('g').attr('clip-path', $$.clipPath).attr('class', CLASS$1.chart);

    // Grid lines
    if (config.grid_lines_front) {
        $$.initGridLines();
    }

    // Cover whole with rects for events
    $$.initEventRect();

    // Define g for chart
    $$.initChartElements();

    // if zoom privileged, insert rect to forefront
    // TODO: is this needed?
    main.insert('rect', config.zoom_privileged ? null : 'g.' + CLASS$1.regions).attr('class', CLASS$1.zoomRect).attr('width', $$.width).attr('height', $$.height).style('opacity', 0).on('dblclick.zoom', null);

    // Set default extent if defined
    if (config.axis_x_extent) {
        $$.brush.extent($$.getDefaultExtent());
    }

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
            withTransitionForAxis: false
        });
    }

    // Bind resize event
    $$.bindResize();

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
    var $$ = this,
        config = $$.config;
    var legendHeight = $$.legend ? $$.getLegendHeight() : 0,
        legendWidth = $$.legend ? $$.getLegendWidth() : 0,
        legendHeightForBottom = $$.isLegendRight || $$.isLegendInset ? 0 : legendHeight,
        hasArc = $$.hasArcType(),
        xAxisHeight = config.axis_rotated || hasArc ? 0 : $$.getHorizontalAxisHeight('x'),
        subchartHeight = config.subchart_show && !hasArc ? config.subchart_size_height + xAxisHeight : 0;

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

c3_chart_internal_fn.updateTargets = function (targets) {
    var $$ = this;

    /* -- Main --*/

    // -- Text --//
    $$.updateTargetsForText(targets);

    // -- Bar --//
    $$.updateTargetsForBar(targets);

    // -- Line --//
    $$.updateTargetsForLine(targets);

    // -- Arc --//
    if ($$.hasArcType() && $$.updateTargetsForArc) {
        $$.updateTargetsForArc(targets);
    }

    /* -- Sub --*/

    if ($$.updateTargetsForSubchart) {
        $$.updateTargetsForSubchart(targets);
    }

    // Fade-in each chart
    $$.showTargets();
};
c3_chart_internal_fn.showTargets = function () {
    var $$ = this;
    $$.svg.selectAll('.' + CLASS$1.target).filter(function (d) {
        return $$.isTargetToShow(d.id);
    }).transition().duration($$.config.transition_duration).style('opacity', 1);
};

c3_chart_internal_fn.redraw = function (options, transitions) {
    var $$ = this,
        main = $$.main,
        d3$$1 = $$.d3,
        config = $$.config;
    var areaIndices = $$.getShapeIndices($$.isAreaType),
        barIndices = $$.getShapeIndices($$.isBarType),
        lineIndices = $$.getShapeIndices($$.isLineType);
    var withY = void 0,
        withSubchart = void 0,
        withTransition = void 0,
        withTransitionForExit = void 0,
        withTransitionForAxis = void 0,
        withTransform = void 0,
        withUpdateXDomain = void 0,
        withUpdateOrgXDomain = void 0,
        withTrimXDomain = void 0,
        withLegend = void 0,
        withEventRect = void 0,
        withDimension = void 0,
        withUpdateXAxis = void 0;
    var hideAxis = $$.hasArcType();
    var drawArea = void 0,
        drawBar = void 0,
        drawLine = void 0,
        xForText = void 0,
        yForText = void 0;
    var duration = void 0,
        durationForExit = void 0,
        durationForAxis = void 0;
    var waitForDraw = void 0,
        flow = void 0;
    var targetsToShow = $$.filterTargetsToShow($$.data.targets),
        tickValues = void 0,
        i = void 0,
        intervalForCulling = void 0,
        xDomainForZoom = void 0;
    var xv = $$.xv.bind($$),
        cx = void 0,
        cy = void 0;

    options = options || {};
    withY = getOption$1(options, 'withY', true);
    withSubchart = getOption$1(options, 'withSubchart', true);
    withTransition = getOption$1(options, 'withTransition', true);
    withTransform = getOption$1(options, 'withTransform', false);
    withUpdateXDomain = getOption$1(options, 'withUpdateXDomain', false);
    withUpdateOrgXDomain = getOption$1(options, 'withUpdateOrgXDomain', false);
    withTrimXDomain = getOption$1(options, 'withTrimXDomain', true);
    withUpdateXAxis = getOption$1(options, 'withUpdateXAxis', withUpdateXDomain);
    withLegend = getOption$1(options, 'withLegend', false);
    withEventRect = getOption$1(options, 'withEventRect', true);
    withDimension = getOption$1(options, 'withDimension', true);
    withTransitionForExit = getOption$1(options, 'withTransitionForExit', withTransition);
    withTransitionForAxis = getOption$1(options, 'withTransitionForAxis', withTransition);

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
            $$.svg.selectAll('.' + CLASS$1.axisX + ' .tick text').each(function (e) {
                var index = tickValues.indexOf(e);
                if (index >= 0) {
                    d3$$1.select(this).style('display', index % intervalForCulling ? 'none' : 'block');
                }
            });
        } else {
            $$.svg.selectAll('.' + CLASS$1.axisX + ' .tick text').style('display', 'block');
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
    main.select('text.' + CLASS$1.text + '.' + CLASS$1.empty).attr('x', $$.width / 2).attr('y', $$.height / 2).text(config.data_empty_label_text).transition().style('opacity', targetsToShow.length ? 0 : 1);

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
    main.selectAll('.' + CLASS$1.selectedCircles).filter($$.isBarType.bind($$)).selectAll('circle').remove();

    // event rects will redrawn when flow called
    if (config.interaction_enabled && !options.flow && withEventRect) {
        $$.redrawEventRect();
        if ($$.updateZoom) {
            $$.updateZoom();
        }
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

    if ((duration || flow) && $$.isTabVisible()) {
        // Only use transition if tab visible. See #938.
        // transition should be derived from one transition
        d3$$1.transition().duration(duration).each(function () {
            var transitionsToWait = [];

            // redraw and gather transitions
            [$$.redrawBar(drawBar, true), $$.redrawLine(drawLine, true), $$.redrawArea(drawArea, true), $$.redrawCircle(cx, cy, true), $$.redrawText(xForText, yForText, options.flow, true), $$.redrawRegion(true), $$.redrawGrid(true)].forEach(function (transitions) {
                transitions.forEach(function (transition) {
                    transitionsToWait.push(transition);
                });
            });

            // Wait for end of transitions to call flow and onrendered callback
            waitForDraw = $$.generateWait();
            transitionsToWait.forEach(function (t) {
                waitForDraw.add(t);
            });
        }).call(waitForDraw, function () {
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
    $$.mapToIds($$.data.targets).forEach(function (id) {
        $$.withoutFadeIn[id] = true;
    });
};

c3_chart_internal_fn.updateAndRedraw = function (options) {
    var $$ = this,
        config = $$.config,
        transitions = void 0;
    options = options || {};
    // same with redraw
    options.withTransition = getOption$1(options, 'withTransition', true);
    options.withTransform = getOption$1(options, 'withTransform', false);
    options.withLegend = getOption$1(options, 'withLegend', false);
    // NOT same with redraw
    options.withUpdateXDomain = true;
    options.withUpdateOrgXDomain = true;
    options.withTransitionForExit = false;
    options.withTransitionForTransform = getOption$1(options, 'withTransitionForTransform', options.withTransition);
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
        withTransitionForAxis: false
    });
};

c3_chart_internal_fn.isTimeSeries = function () {
    return this.config.axis_x_type === 'timeseries';
};
c3_chart_internal_fn.isCategorized = function () {
    return this.config.axis_x_type.indexOf('categor') >= 0;
};
c3_chart_internal_fn.isCustomX = function () {
    var $$ = this,
        config = $$.config;
    return !$$.isTimeSeries() && (config.data_x || notEmpty$1(config.data_xs));
};

c3_chart_internal_fn.isTimeSeriesY = function () {
    return this.config.axis_y_type === 'timeseries';
};

c3_chart_internal_fn.getTranslate = function (target) {
    var $$ = this,
        config = $$.config,
        x = void 0,
        y = void 0;
    if (target === 'main') {
        x = asHalfPixel$$1($$.margin.left);
        y = asHalfPixel$$1($$.margin.top);
    } else if (target === 'context') {
        x = asHalfPixel$$1($$.margin2.left);
        y = asHalfPixel$$1($$.margin2.top);
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
    var opacity = this.config.point_show ? 1 : 0;
    return isValue$1(d.value) ? this.isScatterType(d) ? 0.5 : opacity : 0;
};
c3_chart_internal_fn.opacityForText = function () {
    return this.hasDataLabel() ? 1 : 0;
};
c3_chart_internal_fn.xx = function (d) {
    return d ? this.x(d.x) : null;
};
c3_chart_internal_fn.xv = function (d) {
    var $$ = this,
        value = d.value;
    if ($$.isTimeSeries()) {
        value = $$.parseDate(d.value);
    } else if ($$.isCategorized() && typeof d.value === 'string') {
        value = $$.config.axis_x_categories.indexOf(d.value);
    }
    return Math.ceil($$.x(value));
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
        xAxis = void 0,
        yAxis = void 0,
        y2Axis = void 0;
    if (transitions && transitions.axisX) {
        xAxis = transitions.axisX;
    } else {
        xAxis = $$.main.select('.' + CLASS$1.axisX);
        if (withTransition) {
            xAxis = xAxis.transition();
        }
    }
    if (transitions && transitions.axisY) {
        yAxis = transitions.axisY;
    } else {
        yAxis = $$.main.select('.' + CLASS$1.axisY);
        if (withTransition) {
            yAxis = yAxis.transition();
        }
    }
    if (transitions && transitions.axisY2) {
        y2Axis = transitions.axisY2;
    } else {
        y2Axis = $$.main.select('.' + CLASS$1.axisY2);
        if (withTransition) {
            y2Axis = y2Axis.transition();
        }
    }
    (withTransition ? $$.main.transition() : $$.main).attr('transform', $$.getTranslate('main'));
    xAxis.attr('transform', $$.getTranslate('x'));
    yAxis.attr('transform', $$.getTranslate('y'));
    y2Axis.attr('transform', $$.getTranslate('y2'));
    $$.main.select('.' + CLASS$1.chartArcs).attr('transform', $$.getTranslate('arc'));
};
c3_chart_internal_fn.transformAll = function (withTransition, transitions) {
    var $$ = this;
    $$.transformMain(withTransition, transitions);
    if ($$.config.subchart_show) {
        $$.transformContext(withTransition, transitions);
    }
    if ($$.legend) {
        $$.transformLegend(withTransition);
    }
};

c3_chart_internal_fn.updateSvgSize = function () {
    var $$ = this,
        brush = $$.svg.select('.c3-brush .background');
    $$.svg.attr('width', $$.currentWidth).attr('height', $$.currentHeight);
    $$.svg.selectAll(['#' + $$.clipId, '#' + $$.clipIdForGrid]).select('rect').attr('width', $$.width).attr('height', $$.height);
    $$.svg.select('#' + $$.clipIdForXAxis).select('rect').attr('x', $$.getXAxisClipX.bind($$)).attr('y', $$.getXAxisClipY.bind($$)).attr('width', $$.getXAxisClipWidth.bind($$)).attr('height', $$.getXAxisClipHeight.bind($$));
    $$.svg.select('#' + $$.clipIdForYAxis).select('rect').attr('x', $$.getYAxisClipX.bind($$)).attr('y', $$.getYAxisClipY.bind($$)).attr('width', $$.getYAxisClipWidth.bind($$)).attr('height', $$.getYAxisClipHeight.bind($$));
    $$.svg.select('#' + $$.clipIdForSubchart).select('rect').attr('width', $$.width).attr('height', brush.size() ? brush.attr('height') : 0);
    $$.svg.select('.' + CLASS$1.zoomRect).attr('width', $$.width).attr('height', $$.height);
    // MEMO: parent div's height will be bigger than svg when <!DOCTYPE html>
    $$.selectChart.style('max-height', $$.currentHeight + 'px');
};

c3_chart_internal_fn.updateDimension = function (withoutAxis) {
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

c3_chart_internal_fn.observeInserted = function (selection) {
    var $$ = this,
        observer = void 0;
    if (typeof MutationObserver === 'undefined') {
        window.console.error('MutationObserver not defined.');
        return;
    }
    observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' && mutation.previousSibling) {
                observer.disconnect();
                // need to wait for completion of load because size calculation requires the actual sizes determined after that completion
                $$.intervalForObserveInserted = window.setInterval(function () {
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
    observer.observe(selection.node(), { attributes: true, childList: true, characterData: true });
};

c3_chart_internal_fn.bindResize = function () {
    var $$ = this,
        config = $$.config;

    $$.resizeFunction = $$.generateResize();

    $$.resizeFunction.add(function () {
        config.onresize.call($$);
    });
    if (config.resize_auto) {
        $$.resizeFunction.add(function () {
            if ($$.resizeTimeout !== undefined) {
                window.clearTimeout($$.resizeTimeout);
            }
            $$.resizeTimeout = window.setTimeout(function () {
                delete $$.resizeTimeout;
                $$.api.flush();
            }, 100);
        });
    }
    $$.resizeFunction.add(function () {
        config.onresized.call($$);
    });

    if (window.attachEvent) {
        window.attachEvent('onresize', $$.resizeFunction);
    } else if (window.addEventListener) {
        window.addEventListener('resize', $$.resizeFunction, false);
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
        window.onresize = wrapper;
    }
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
    callResizeFunctions.remove = function (f) {
        for (var i = 0; i < resizeFunctions.length; i++) {
            if (resizeFunctions[i] === f) {
                resizeFunctions.splice(i, 1);
                break;
            }
        }
    };
    return callResizeFunctions;
};

c3_chart_internal_fn.endall = function (transition, callback) {
    var n = 0;
    transition.each(function () {
        ++n;
    }).each('end', function () {
        if (! --n) {
            callback.apply(this, arguments);
        }
    });
};
c3_chart_internal_fn.generateWait = function () {
    var transitionsToWait = [],
        f = function f(transition, callback) {
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
                if (callback) {
                    callback();
                }
            }
        }, 10);
    };
    f.add = function (transition) {
        transitionsToWait.push(transition);
    };
    return f;
};

c3_chart_internal_fn.parseDate = function (date) {
    var $$ = this,
        parsedDate = void 0;
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
    var hidden = void 0;
    if (typeof document.hidden !== 'undefined') {
        // Opera 12.10 and Firefox 18 and later support
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
c3_chart_internal_fn.CLASS = CLASS$1;
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

var axis = function axis() {};
axis.labels = function (labels) {
    var $$ = this.internal;
    if (arguments.length) {
        Object.keys(labels).forEach(function (axisId) {
            $$.axis.setLabelText(axisId, labels[axisId]);
        });
        $$.axis.updateLabels();
    }
    // TODO: return some values?
};
axis.max = function (max) {
    var $$ = this.internal,
        config = $$.config;
    if (arguments.length) {
        if ((typeof max === 'undefined' ? 'undefined' : _typeof(max)) === 'object') {
            if (isValue$1(max.x)) {
                config.axis_x_max = max.x;
            }
            if (isValue$1(max.y)) {
                config.axis_y_max = max.y;
            }
            if (isValue$1(max.y2)) {
                config.axis_y2_max = max.y2;
            }
        } else {
            config.axis_y_max = config.axis_y2_max = max;
        }
        $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true });
    } else {
        return {
            x: config.axis_x_max,
            y: config.axis_y_max,
            y2: config.axis_y2_max
        };
    }
};
axis.min = function (min) {
    var $$ = this.internal,
        config = $$.config;
    if (arguments.length) {
        if ((typeof min === 'undefined' ? 'undefined' : _typeof(min)) === 'object') {
            if (isValue$1(min.x)) {
                config.axis_x_min = min.x;
            }
            if (isValue$1(min.y)) {
                config.axis_y_min = min.y;
            }
            if (isValue$1(min.y2)) {
                config.axis_y2_min = min.y2;
            }
        } else {
            config.axis_y_min = config.axis_y2_min = min;
        }
        $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true });
    } else {
        return {
            x: config.axis_x_min,
            y: config.axis_y_min,
            y2: config.axis_y2_min
        };
    }
};
axis.range = function (range) {
    if (arguments.length) {
        if (isDefined$1(range.max)) {
            this.axis.max(range.max);
        }
        if (isDefined$1(range.min)) {
            this.axis.min(range.min);
        }
    } else {
        return {
            max: this.axis.max(),
            min: this.axis.min()
        };
    }
};

var category = function category(i, _category) {
    var $$ = this.internal,
        config = $$.config;
    if (arguments.length > 1) {
        config.axis_x_categories[i] = _category;
        $$.redraw();
    }
    return config.axis_x_categories[i];
};
var categories = function categories(_categories) {
    var $$ = this.internal,
        config = $$.config;
    if (!arguments.length) {
        return config.axis_x_categories;
    }
    config.axis_x_categories = _categories;
    $$.redraw();
    return config.axis_x_categories;
};

var resize = function resize(size) {
    var $$ = this.internal,
        config = $$.config;
    config.size_width = size ? size.width : null;
    config.size_height = size ? size.height : null;
    this.flush();
};

var flush = function flush() {
    var $$ = this.internal;
    $$.updateAndRedraw({ withLegend: true, withTransition: false, withTransitionForTransform: false });
};

var destroy = function destroy() {
    var $$ = this.internal;

    window.clearInterval($$.intervalForObserveInserted);

    if ($$.resizeTimeout !== undefined) {
        window.clearTimeout($$.resizeTimeout);
    }

    if (window.detachEvent) {
        window.detachEvent('onresize', $$.resizeFunction);
    } else if (window.removeEventListener) {
        window.removeEventListener('resize', $$.resizeFunction);
    } else {
        var wrapper = window.onresize;
        // check if no one else removed our wrapper and remove our resizeFunction from it
        if (wrapper && wrapper.add && wrapper.remove) {
            wrapper.remove($$.resizeFunction);
        }
    }

    $$.selectChart.classed('c3', false).html('');

    // MEMO: this is needed because the reference of some elements will not be released,
    // then memory leak will happen.
    Object.keys($$).forEach(function (key) {
        $$[key] = null;
    });

    return null;
};

// TODO: fix
var color = function color(id) {
    var $$ = this.internal;
    return $$.color(id); // more patterns
};

var data = function data(targetIds) {
    var targets = this.internal.data.targets;
    return typeof targetIds === 'undefined' ? targets : targets.filter(function (t) {
        return [].concat(targetIds).indexOf(t.id) >= 0;
    });
};

data.shown = function (targetIds) {
    return this.internal.filterTargetsToShow(this.data(targetIds));
};

data.values = function (targetId) {
    var targets = void 0,
        values = null;
    if (targetId) {
        targets = this.data(targetId);
        values = targets[0] ? targets[0].values.map(function (d) {
            return d.value;
        }) : null;
    }
    return values;
};

data.names = function (names) {
    this.internal.clearLegendItemTextBoxCache();
    return this.internal.updateDataAttributes('names', names);
};

data.colors = function (colors) {
    return this.internal.updateDataAttributes('colors', colors);
};

data.axes = function (axes) {
    return this.internal.updateDataAttributes('axes', axes);
};

var flow = function flow(args) {
    var $$ = this.internal,
        targets = void 0,
        data = void 0,
        notfoundIds = [],
        orgDataCount = $$.getMaxDataCount(),
        dataCount = void 0,
        domain = void 0,
        baseTarget = void 0,
        baseValue = void 0,
        length = 0,
        tail = 0,
        diff = void 0,
        to = void 0;

    if (args.json) {
        data = $$.convertJsonToData(args.json, args.keys);
    } else if (args.rows) {
        data = $$.convertRowsToData(args.rows);
    } else if (args.columns) {
        data = $$.convertColumnsToData(args.columns);
    } else {
        return;
    }
    targets = $$.convertDataToTargets(data, true);

    // Update/Add data
    $$.data.targets.forEach(function (t) {
        var found = false,
            i = void 0,
            j = void 0;
        for (i = 0; i < targets.length; i++) {
            if (t.id === targets[i].id) {
                found = true;

                if (t.values[t.values.length - 1]) {
                    tail = t.values[t.values.length - 1].index + 1;
                }
                length = targets[i].values.length;

                for (j = 0; j < length; j++) {
                    targets[i].values[j].index = tail + j;
                    if (!$$.isTimeSeries()) {
                        targets[i].values[j].x = tail + j;
                    }
                }
                t.values = t.values.concat(targets[i].values);

                targets.splice(i, 1);
                break;
            }
        }
        if (!found) {
            notfoundIds.push(t.id);
        }
    });

    // Append null for not found targets
    $$.data.targets.forEach(function (t) {
        var i = void 0,
            j = void 0;
        for (i = 0; i < notfoundIds.length; i++) {
            if (t.id === notfoundIds[i]) {
                tail = t.values[t.values.length - 1].index + 1;
                for (j = 0; j < length; j++) {
                    t.values.push({
                        id: t.id,
                        index: tail + j,
                        x: $$.isTimeSeries() ? $$.getOtherTargetX(tail + j) : tail + j,
                        value: null
                    });
                }
            }
        }
    });

    // Generate null values for new target
    if ($$.data.targets.length) {
        targets.forEach(function (t) {
            var i = void 0,
                missing = [];
            for (i = $$.data.targets[0].values[0].index; i < tail; i++) {
                missing.push({
                    id: t.id,
                    index: i,
                    x: $$.isTimeSeries() ? $$.getOtherTargetX(i) : i,
                    value: null
                });
            }
            t.values.forEach(function (v) {
                v.index += tail;
                if (!$$.isTimeSeries()) {
                    v.x += tail;
                }
            });
            t.values = missing.concat(t.values);
        });
    }
    $$.data.targets = $$.data.targets.concat(targets); // add remained

    // check data count because behavior needs to change when it's only one
    dataCount = $$.getMaxDataCount();
    baseTarget = $$.data.targets[0];
    baseValue = baseTarget.values[0];

    // Update length to flow if needed
    if (isDefined$1(args.to)) {
        length = 0;
        to = $$.isTimeSeries() ? $$.parseDate(args.to) : args.to;
        baseTarget.values.forEach(function (v) {
            if (v.x < to) {
                length++;
            }
        });
    } else if (isDefined$1(args.length)) {
        length = args.length;
    }

    // If only one data, update the domain to flow from left edge of the chart
    if (!orgDataCount) {
        if ($$.isTimeSeries()) {
            if (baseTarget.values.length > 1) {
                diff = baseTarget.values[baseTarget.values.length - 1].x - baseValue.x;
            } else {
                diff = baseValue.x - $$.getXDomain($$.data.targets)[0];
            }
        } else {
            diff = 1;
        }
        domain = [baseValue.x - diff, baseValue.x];
        $$.updateXDomain(null, true, true, false, domain);
    } else if (orgDataCount === 1) {
        if ($$.isTimeSeries()) {
            diff = (baseTarget.values[baseTarget.values.length - 1].x - baseValue.x) / 2;
            domain = [new Date(+baseValue.x - diff), new Date(+baseValue.x + diff)];
            $$.updateXDomain(null, true, true, false, domain);
        }
    }

    // Set targets
    $$.updateTargets($$.data.targets);

    // Redraw with new targets
    $$.redraw({
        flow: {
            index: baseValue.index,
            length: length,
            duration: isValue$1(args.duration) ? args.duration : $$.config.transition_duration,
            done: args.done,
            orgDataCount: orgDataCount
        },
        withLegend: true,
        withTransition: orgDataCount > 1,
        withTrimXDomain: false,
        withUpdateXAxis: true
    });
};

var focus = function focus(targetIds) {
    var $$ = this.internal,
        candidates = void 0;

    targetIds = $$.mapToTargetIds(targetIds);
    candidates = $$.svg.selectAll($$.selectorTargets(targetIds.filter($$.isTargetToShow, $$))), this.revert();
    this.defocus();
    candidates.classed(CLASS$1.focused, true).classed(CLASS$1.defocused, false);
    if ($$.hasArcType()) {
        $$.expandArc(targetIds);
    }
    $$.toggleFocusLegend(targetIds, true);

    $$.focusedTargetIds = targetIds;
    $$.defocusedTargetIds = $$.defocusedTargetIds.filter(function (id) {
        return targetIds.indexOf(id) < 0;
    });
};

var defocus = function defocus(targetIds) {
    var $$ = this.internal,
        candidates = void 0;

    targetIds = $$.mapToTargetIds(targetIds);
    candidates = $$.svg.selectAll($$.selectorTargets(targetIds.filter($$.isTargetToShow, $$))), candidates.classed(CLASS$1.focused, false).classed(CLASS$1.defocused, true);
    if ($$.hasArcType()) {
        $$.unexpandArc(targetIds);
    }
    $$.toggleFocusLegend(targetIds, false);

    $$.focusedTargetIds = $$.focusedTargetIds.filter(function (id) {
        return targetIds.indexOf(id) < 0;
    });
    $$.defocusedTargetIds = targetIds;
};

var revert = function revert(targetIds) {
    var $$ = this.internal,
        candidates = void 0;

    targetIds = $$.mapToTargetIds(targetIds);
    candidates = $$.svg.selectAll($$.selectorTargets(targetIds)); // should be for all targets

    candidates.classed(CLASS$1.focused, false).classed(CLASS$1.defocused, false);
    if ($$.hasArcType()) {
        $$.unexpandArc(targetIds);
    }
    if ($$.config.legend_show) {
        $$.showLegend(targetIds.filter($$.isLegendToShow.bind($$)));
        $$.legend.selectAll($$.selectorLegends(targetIds)).filter(function () {
            return $$.d3.select(this).classed(CLASS$1.legendItemFocused);
        }).classed(CLASS$1.legendItemFocused, false);
    }

    $$.focusedTargetIds = [];
    $$.defocusedTargetIds = [];
};

var xgrids = function xgrids(grids) {
    var $$ = this.internal,
        config = $$.config;
    if (!grids) {
        return config.grid_x_lines;
    }
    config.grid_x_lines = grids;
    $$.redrawWithoutRescale();
    return config.grid_x_lines;
};

xgrids.add = function (grids) {
    var $$ = this.internal;
    return this.xgrids($$.config.grid_x_lines.concat(grids ? grids : []));
};

xgrids.remove = function (params) {
    // TODO: multiple
    var $$ = this.internal;
    $$.removeGridLines(params, true);
};

var ygrids = function ygrids(grids) {
    var $$ = this.internal,
        config = $$.config;
    if (!grids) {
        return config.grid_y_lines;
    }
    config.grid_y_lines = grids;
    $$.redrawWithoutRescale();
    return config.grid_y_lines;
};

ygrids.add = function (grids) {
    var $$ = this.internal;
    return this.ygrids($$.config.grid_y_lines.concat(grids ? grids : []));
};

ygrids.remove = function (params) {
    // TODO: multiple
    var $$ = this.internal;
    $$.removeGridLines(params, false);
};

var groups = function groups(_groups) {
    var $$ = this.internal,
        config = $$.config;
    if (isUndefined$$1(_groups)) {
        return config.data_groups;
    }
    config.data_groups = _groups;
    $$.redraw();
    return config.data_groups;
};

var legend = function legend() {};

legend.show = function (targetIds) {
    var $$ = this.internal;
    $$.showLegend($$.mapToTargetIds(targetIds));
    $$.updateAndRedraw({ withLegend: true });
};

legend.hide = function (targetIds) {
    var $$ = this.internal;
    $$.hideLegend($$.mapToTargetIds(targetIds));
    $$.updateAndRedraw({ withLegend: true });
};

var load$1 = function load$1(args) {
    var $$ = this.internal,
        config = $$.config;
    // update xs if specified
    if (args.xs) {
        $$.addXs(args.xs);
    }
    // update names if exists
    if ('names' in args) {
        c3_chart_fn.data.names.bind(this)(args.names);
    }
    // update classes if exists
    if ('classes' in args) {
        Object.keys(args.classes).forEach(function (id) {
            config.data_classes[id] = args.classes[id];
        });
    }
    // update categories if exists
    if ('categories' in args && $$.isCategorized()) {
        config.axis_x_categories = args.categories;
    }
    // update axes if exists
    if ('axes' in args) {
        Object.keys(args.axes).forEach(function (id) {
            config.data_axes[id] = args.axes[id];
        });
    }
    // update colors if exists
    if ('colors' in args) {
        Object.keys(args.colors).forEach(function (id) {
            config.data_colors[id] = args.colors[id];
        });
    }
    // use cache if exists
    if ('cacheIds' in args && $$.hasCaches(args.cacheIds)) {
        $$.load($$.getCaches(args.cacheIds), args.done);
        return;
    }
    // unload if needed
    if ('unload' in args) {
        // TODO: do not unload if target will load (included in url/rows/columns)
        $$.unload($$.mapToTargetIds(typeof args.unload === 'boolean' && args.unload ? null : args.unload), function () {
            $$.loadFromArgs(args);
        });
    } else {
        $$.loadFromArgs(args);
    }
};

var unload$1 = function unload$1(args) {
    var $$ = this.internal;
    args = args || {};
    if (args instanceof Array) {
        args = { ids: args };
    } else if (typeof args === 'string') {
        args = { ids: [args] };
    }
    $$.unload($$.mapToTargetIds(args.ids), function () {
        $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true });
        if (args.done) {
            args.done();
        }
    });
};

var regions = function regions(_regions) {
    var $$ = this.internal,
        config = $$.config;
    if (!_regions) {
        return config.regions;
    }
    config.regions = _regions;
    $$.redrawWithoutRescale();
    return config.regions;
};

regions.add = function (regions) {
    var $$ = this.internal,
        config = $$.config;
    if (!regions) {
        return config.regions;
    }
    config.regions = config.regions.concat(regions);
    $$.redrawWithoutRescale();
    return config.regions;
};

regions.remove = function (options) {
    var $$ = this.internal,
        config = $$.config,
        duration = void 0,
        classes = void 0,
        regions = void 0;

    options = options || {};
    duration = $$.getOption(options, 'duration', config.transition_duration);
    classes = $$.getOption(options, 'classes', [CLASS$1.region]);

    regions = $$.main.select('.' + CLASS$1.regions).selectAll(classes.map(function (c) {
        return '.' + c;
    }));
    (duration ? regions.transition().duration(duration) : regions).style('opacity', 0).remove();

    config.regions = config.regions.filter(function (region) {
        var found = false;
        if (!region.class) {
            return true;
        }
        region.class.split(' ').forEach(function (c) {
            if (classes.indexOf(c) >= 0) {
                found = true;
            }
        });
        return !found;
    });

    return config.regions;
};

var selected = function selected(targetId) {
    var $$ = this.internal,
        d3$$1 = $$.d3;
    return d3$$1.merge($$.main.selectAll('.' + CLASS$1.shapes + $$.getTargetSelectorSuffix(targetId)).selectAll('.' + CLASS$1.shape).filter(function () {
        return d3$$1.select(this).classed(CLASS$1.SELECTED);
    }).map(function (d) {
        return d.map(function (d) {
            var data = d.__data__;return data.data ? data.data : data;
        });
    }));
};

var select = function select(ids, indices, resetOther) {
    var $$ = this.internal,
        d3$$1 = $$.d3,
        config = $$.config;
    if (!config.data_selection_enabled) {
        return;
    }
    $$.main.selectAll('.' + CLASS$1.shapes).selectAll('.' + CLASS$1.shape).each(function (d, i) {
        var shape = d3$$1.select(this),
            id = d.data ? d.data.id : d.id,
            toggle = $$.getToggle(this, d).bind($$),
            isTargetId = config.data_selection_grouped || !ids || ids.indexOf(id) >= 0,
            isTargetIndex = !indices || indices.indexOf(i) >= 0,
            isSelected = shape.classed(CLASS$1.SELECTED);
        // line/area selection not supported yet
        if (shape.classed(CLASS$1.line) || shape.classed(CLASS$1.area)) {
            return;
        }
        if (isTargetId && isTargetIndex) {
            if (config.data_selection_isselectable(d) && !isSelected) {
                toggle(true, shape.classed(CLASS$1.SELECTED, true), d, i);
            }
        } else if (isDefined$1(resetOther) && resetOther) {
            if (isSelected) {
                toggle(false, shape.classed(CLASS$1.SELECTED, false), d, i);
            }
        }
    });
};

var unselect = function unselect(ids, indices) {
    var $$ = this.internal,
        d3$$1 = $$.d3,
        config = $$.config;
    if (!config.data_selection_enabled) {
        return;
    }
    $$.main.selectAll('.' + CLASS$1.shapes).selectAll('.' + CLASS$1.shape).each(function (d, i) {
        var shape = d3$$1.select(this),
            id = d.data ? d.data.id : d.id,
            toggle = $$.getToggle(this, d).bind($$),
            isTargetId = config.data_selection_grouped || !ids || ids.indexOf(id) >= 0,
            isTargetIndex = !indices || indices.indexOf(i) >= 0,
            isSelected = shape.classed(CLASS$1.SELECTED);
        // line/area selection not supported yet
        if (shape.classed(CLASS$1.line) || shape.classed(CLASS$1.area)) {
            return;
        }
        if (isTargetId && isTargetIndex) {
            if (config.data_selection_isselectable(d)) {
                if (isSelected) {
                    toggle(false, shape.classed(CLASS$1.SELECTED, false), d, i);
                }
            }
        }
    });
};

var show = function show(targetIds, options) {
    var $$ = this.internal,
        targets = void 0;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.removeHiddenTargetIds(targetIds);
    targets = $$.svg.selectAll($$.selectorTargets(targetIds));

    targets.transition().style('opacity', 1, 'important').call($$.endall, function () {
        targets.style('opacity', null).style('opacity', 1);
    });

    if (options.withLegend) {
        $$.showLegend(targetIds);
    }

    $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true });
};

var hide = function hide(targetIds, options) {
    var $$ = this.internal,
        targets = void 0;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.addHiddenTargetIds(targetIds);
    targets = $$.svg.selectAll($$.selectorTargets(targetIds));

    targets.transition().style('opacity', 0, 'important').call($$.endall, function () {
        targets.style('opacity', null).style('opacity', 0);
    });

    if (options.withLegend) {
        $$.hideLegend(targetIds);
    }

    $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true });
};

var toggle = function toggle(targetIds, options) {
    var that = this,
        $$ = this.internal;
    $$.mapToTargetIds(targetIds).forEach(function (targetId) {
        $$.isTargetToShow(targetId) ? that.hide(targetId, options) : that.show(targetId, options);
    });
};

var tooltip = function tooltip() {};

tooltip.show = function (args) {
    var $$ = this.internal,
        index = void 0,
        mouse = void 0;

    // determine mouse position on the chart
    if (args.mouse) {
        mouse = args.mouse;
    }

    // determine focus data
    if (args.data) {
        if ($$.isMultipleX()) {
            // if multiple xs, target point will be determined by mouse
            mouse = [$$.x(args.data.x), $$.getYScale(args.data.id)(args.data.value)];
            index = null;
        } else {
            // TODO: when tooltip_grouped = false
            index = isValue$1(args.data.index) ? args.data.index : $$.getIndexByX(args.data.x);
        }
    } else if (typeof args.x !== 'undefined') {
        index = $$.getIndexByX(args.x);
    } else if (typeof args.index !== 'undefined') {
        index = args.index;
    }

    // emulate mouse events to show
    $$.dispatchEvent('mouseover', index, mouse);
    $$.dispatchEvent('mousemove', index, mouse);

    $$.config.tooltip_onshow.call($$, args.data);
};

tooltip.hide = function () {
    // TODO: get target data by checking the state of focus
    this.internal.dispatchEvent('mouseout', 0);

    this.internal.config.tooltip_onhide.call(this);
};

var transform = function transform(type, targetIds) {
    var $$ = this.internal,
        options = ['pie', 'donut'].indexOf(type) >= 0 ? { withTransform: true } : null;
    $$.transformTo(targetIds, type, options);
};

var x = function x(_x) {
    var $$ = this.internal;
    if (arguments.length) {
        $$.updateTargetX($$.data.targets, _x);
        $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true });
    }
    return $$.data.xs;
};

var xs = function xs(_xs) {
    var $$ = this.internal;
    if (arguments.length) {
        $$.updateTargetXs($$.data.targets, _xs);
        $$.redraw({ withUpdateOrgXDomain: true, withUpdateXDomain: true });
    }
    return $$.data.xs;
};

var zoom = function zoom(domain) {
    var $$ = this.internal;
    if (domain) {
        if ($$.isTimeSeries()) {
            domain = domain.map(function (x) {
                return $$.parseDate(x);
            });
        }
        $$.brush.extent(domain);
        $$.redraw({ withUpdateXDomain: true, withY: $$.config.zoom_rescale });
        $$.config.zoom_onzoom.call(this, $$.x.orgDomain());
    }
    return $$.brush.extent();
};

var unzoom = function unzoom() {
    var $$ = this.internal;
    $$.brush.clear().update();
    $$.redraw({ withUpdateXDomain: true });
};

zoom.enable = function (enabled) {
    var $$ = this.internal;
    $$.config.zoom_enabled = enabled;
    $$.updateAndRedraw();
};

zoom.max = function (max) {
    var $$ = this.internal,
        config = $$.config,
        d3$$1 = $$.d3;
    if (max === 0 || max) {
        config.zoom_x_max = d3$$1.max([$$.orgXDomain[1], max]);
    } else {
        return config.zoom_x_max;
    }
};

zoom.min = function (min) {
    var $$ = this.internal,
        config = $$.config,
        d3$$1 = $$.d3;
    if (min === 0 || min) {
        config.zoom_x_min = d3$$1.min([$$.orgXDomain[0], min]);
    } else {
        return config.zoom_x_min;
    }
};

zoom.range = function (range) {
    if (arguments.length) {
        if (isDefined$1(range.max)) {
            this.domain.max(range.max);
        }
        if (isDefined$1(range.min)) {
            this.domain.min(range.min);
        }
    } else {
        return {
            max: this.domain.max(),
            min: this.domain.min()
        };
    }
};

var c3_chart_fn$1 = void 0;

function Chart(config) {
    var $$ = this.internal = new ChartInternal(this);
    $$.loadConfig(config);

    $$.beforeInit(config);
    $$.init();
    $$.afterInit(config);

    // bind "this" to nested API
    (function bindThis(fn, target, argThis) {
        Object.keys(fn).forEach(function (key) {
            target[key] = fn[key].bind(argThis);
            if (Object.keys(fn[key]).length > 0) {
                bindThis(fn[key], target[key], argThis);
            }
        });
    })(c3_chart_fn$1, this, this);
}

c3_chart_fn$1 = Chart.prototype;

c3_chart_fn$1.axis = axis;
c3_chart_fn$1.category = category;
c3_chart_fn$1.categories = categories;
c3_chart_fn$1.resize = resize;
c3_chart_fn$1.flush = flush;
c3_chart_fn$1.destroy = destroy;
c3_chart_fn$1.color = color;
c3_chart_fn$1.data = data;
c3_chart_fn$1.flow = flow;
c3_chart_fn$1.focus = focus;
c3_chart_fn$1.defocus = defocus;
c3_chart_fn$1.revert = revert;
c3_chart_fn$1.xgrids = xgrids;
c3_chart_fn$1.ygrids = ygrids;
c3_chart_fn$1.groups = groups;
c3_chart_fn$1.legend = legend;
c3_chart_fn$1.load = load$1;
c3_chart_fn$1.unload = unload$1;
c3_chart_fn$1.regions = regions;
c3_chart_fn$1.selected = selected;
c3_chart_fn$1.select = select;
c3_chart_fn$1.unselect = unselect;
c3_chart_fn$1.show = show;
c3_chart_fn$1.hide = hide;
c3_chart_fn$1.toggle = toggle;
c3_chart_fn$1.tooltip = tooltip;
c3_chart_fn$1.transform = transform;
c3_chart_fn$1.x = x;
c3_chart_fn$1.xs = xs;
c3_chart_fn$1.zoom = zoom;
c3_chart_fn$1.unzoom = unzoom;

/**
 * C3.js
 * (c) 2016 Masayuki Tanaka and the C3.js contributors (See package.json)
 * License: MIT
 */

var version = '0.4.11';

var generate = function generate(config) {
    return new Chart(config);
};

var chart = {
    fn: Chart.prototype,
    internal: {
        fn: ChartInternal.prototype,
        axis: {
            fn: Axis$$1.prototype
        }
    }
};

exports.version = version;
exports.generate = generate;
exports.chart = chart;

Object.defineProperty(exports, '__esModule', { value: true });

})));