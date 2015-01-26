function _Axis(owner) {
    API.call(this, owner);
}

inherit(API, _Axis);

_Axis.prototype.init = function init() {

    var $$ = this.owner, config = $$.config, main = $$.main;
    $$.axes.x = main.append("g")
        .attr("class", CLASS.axis + ' ' + CLASS.axisX)
        .attr("clip-path", $$.clipPathForXAxis)
        .attr("transform", $$.getTranslate('x'))
        .style("visibility", config.axis_x_show ? 'visible' : 'hidden');
    $$.axes.x.append("text")
        .attr("class", CLASS.axisXLabel)
        .attr("transform", config.axis_rotated ? "rotate(-90)" : "")
        .style("text-anchor", _textAnchorForXAxisLabel.bind(this));

    $$.axes.y = main.append("g")
        .attr("class", CLASS.axis + ' ' + CLASS.axisY)
        .attr("clip-path", config.axis_y_inner ? "" : $$.clipPathForYAxis)
        .attr("transform", $$.getTranslate('y'))
        .style("visibility", config.axis_y_show ? 'visible' : 'hidden');
    $$.axes.y.append("text")
        .attr("class", CLASS.axisYLabel)
        .attr("transform", config.axis_rotated ? "" : "rotate(-90)")
        .style("text-anchor", _textAnchorForYAxisLabel.bind(this));

    $$.axes.y2 = main.append("g")
        .attr("class", CLASS.axis + ' ' + CLASS.axisY2)
        // clip-path?
        .attr("transform", $$.getTranslate('y2'))
        .style("visibility", config.axis_y2_show ? 'visible' : 'hidden');
    $$.axes.y2.append("text")
        .attr("class", CLASS.axisY2Label)
        .attr("transform", config.axis_rotated ? "" : "rotate(-90)")
        .style("text-anchor", _textAnchorForY2AxisLabel.bind(this));
};
_Axis.prototype.getXAxis = function getXAxis(scale, orient, tickFormat, tickValues, withOuterTick, withoutTransition) {
    var $$ = this.owner, config = $$.config,
        axisParams = {
            isCategory: $$.isCategorized(),
            withOuterTick: withOuterTick,
            tickMultiline: config.axis_x_tick_multiline,
            tickWidth: config.axis_x_tick_width,
            withoutTransition: withoutTransition,
        },
        axis = c3_axis($$.d3, axisParams).scale(scale).orient(orient);

    if ($$.isTimeSeries() && tickValues) {
        tickValues = tickValues.map(function (v) { return $$.parseDate(v); });
    }

    // Set tick
    axis.tickFormat(tickFormat).tickValues(tickValues);
    if ($$.isCategorized()) {
        axis.tickCentered(config.axis_x_tick_centered);
        if (isEmpty(config.axis_x_tick_culling)) {
            config.axis_x_tick_culling = false;
        }
    } else {
        // TODO: move this to c3_axis
        axis.tickOffset = function () {
            var scale = this.scale(),
                edgeX = $$.getEdgeX($$.data.targets), diff = scale(edgeX[1]) - scale(edgeX[0]),
                base = diff ? diff : (config.axis_rotated ? $$.height : $$.width);
            return (base / $$.getMaxDataCount()) / 2;
        };
    }

    return axis;
};
_Axis.prototype.updateXAxisTickValues = function updateXAxisTickValues(targets, axis) {
    var $$ = this.owner, config = $$.config, tickValues;
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
_Axis.prototype.getYAxis = function getYAxis(scale, orient, tickFormat, tickValues, withOuterTick) {
    var axisParams = {withOuterTick: withOuterTick},
        $$ = this.owner,
        d3 = $$.d3,
        config = $$.config,
        axis = c3_axis(d3, axisParams).scale(scale).orient(orient).tickFormat(tickFormat);
    if ($$.isTimeSeriesY()) {
        axis.ticks(d3.time[config.axis_y_tick_time_value], config.axis_y_tick_time_interval);
    } else {
        axis.tickValues(tickValues);
    }
    return axis;
};
_Axis.prototype.getId = function getId(id) {
    var config = this.owner.config;
    return id in config.data_axes ? config.data_axes[id] : 'y';
};
_Axis.prototype.getXAxisTickFormat = function getXAxisTickFormat() {
    var $$ = this.owner, config = $$.config,
        format = $$.isTimeSeries() ? $$.defaultAxisTimeFormat : $$.isCategorized() ? $$.categoryName : function (v) { return v < 0 ? v.toFixed(0) : v; };
    if (config.axis_x_tick_format) {
        if (isFunction(config.axis_x_tick_format)) {
            format = config.axis_x_tick_format;
        } else if ($$.isTimeSeries()) {
            format = function (date) {
                return date ? $$.axisTimeFormat(config.axis_x_tick_format)(date) : "";
            };
        }
    }
    return isFunction(format) ? function (v) { return format.call($$, v); } : format;
};
_Axis.prototype.getXAxisTickValues = function getXAxisTickValues() {
    return _getTickValues(this.owner.config.axis_x_tick_values, this.owner.xAxis);
};
_Axis.prototype.getYAxisTickValues = function getYAxisTickValues() {
    return _getTickValues(this.owner.config.axis_y_tick_values, this.owner.yAxis);
};
_Axis.prototype.getY2AxisTickValues = function getY2AxisTickValues() {
    return _getTickValues(this.owner.config.axis_y2_tick_values, this.owner.y2Axis);
};
_Axis.prototype.setLabelText = function setLabelText(axisId, text) {
    var $$ = this, config = $$.config,
        option = _getLabelOptionByAxisId.call(this, axisId);
    if (isString(option)) {
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
_Axis.prototype.getYAxisLabelPosition = function getYAxisLabelPosition() {
    return _getLabelPosition.call(this, 'y', this.owner.config.axis_rotated ? 'inner-right' : 'inner-top');
};
_Axis.prototype.getY2AxisLabelPosition = function getY2AxisLabelPosition() {
    return _getLabelPosition.call(this, 'y2', this.owner.config.axis_rotated ? 'inner-right' : 'inner-top');
};
_Axis.prototype.getLabelPositionById = function getLabelPositionById(id) {
    return id === 'y2' ? this.getY2AxisLabelPosition() : id === 'y' ? this.getYAxisLabelPosition() : _getXAxisLabelPosition.call(this);
};

_Axis.prototype.getMaxTickWidth = function getMaxTickWidth(id, withoutRecompute) {
    var $$ = this.owner, config = $$.config,
        maxWidth = 0, targetsToShow, scale, axis, body, svg;
    if (withoutRecompute && $$.currentMaxTickWidths[id]) {
        return $$.currentMaxTickWidths[id];
    }
    if ($$.svg) {
        targetsToShow = $$.filterTargetsToShow($$.data.targets);
        if (id === 'y') {
            scale = $$.y.copy().domain($$.getYDomain(targetsToShow, 'y'));
            axis = this.getYAxis(scale, $$.yOrient, config.axis_y_tick_format, $$.yAxisTickValues);
        } else if (id === 'y2') {
            scale = $$.y2.copy().domain($$.getYDomain(targetsToShow, 'y2'));
            axis = this.getYAxis(scale, $$.y2Orient, config.axis_y2_tick_format, $$.y2AxisTickValues);
        } else {
            scale = $$.x.copy().domain($$.getXDomain(targetsToShow));
            axis = this.getXAxis(scale, $$.xOrient, $$.xAxisTickFormat, $$.xAxisTickValues);
            this.updateXAxisTickValues(targetsToShow, axis);
        }
        body = $$.d3.select('body').classed('c3', true);
        svg = body.append('svg').style('visibility', 'hidden');
        svg.append('g').call(axis).each(function () {
            $$.d3.select(this).selectAll('text tspan').each(function () {
                var box = this.getBoundingClientRect();
                if (box.left >= 0 && maxWidth < box.width) { maxWidth = box.width; }
            });
        });
        // TODO: time lag to get maxWidth
        window.setTimeout(function () {
            svg.remove();
        }, 100);
        body.classed('c3', false);
    }
    $$.currentMaxTickWidths[id] = maxWidth <= 0 ? $$.currentMaxTickWidths[id] : maxWidth;
    return $$.currentMaxTickWidths[id];
};

_Axis.prototype.updateLabels = function updateLabels(withTransition) {
    var $$ = this.owner;
    var axisXLabel = $$.main.select('.' + CLASS.axisX + ' .' + CLASS.axisXLabel),
        axisYLabel = $$.main.select('.' + CLASS.axisY + ' .' + CLASS.axisYLabel),
        axisY2Label = $$.main.select('.' + CLASS.axisY2 + ' .' + CLASS.axisY2Label);
    (withTransition ? axisXLabel.transition() : axisXLabel)
        .attr("x", _xForXAxisLabel.bind(this))
        .attr("dx", _dxForXAxisLabel.bind(this))
        .attr("dy", _dyForXAxisLabel.bind(this))
        .text(_textForXAxisLabel.bind(this));
    (withTransition ? axisYLabel.transition() : axisYLabel)
        .attr("x", _xForYAxisLabel.bind(this))
        .attr("dx", _dxForYAxisLabel.bind(this))
        .attr("dy", _dyForYAxisLabel.bind(this))
        .text(_textForYAxisLabel.bind(this));
    (withTransition ? axisY2Label.transition() : axisY2Label)
        .attr("x", _xForY2AxisLabel.bind(this))
        .attr("dx", _dxForY2AxisLabel.bind(this))
        .attr("dy", _dyForY2AxisLabel.bind(this))
        .text(_textForY2AxisLabel.bind(this));
};

_Axis.prototype.getPadding = function getPadding(padding, key, defaultValue, domainLength) {
    if (!isValue(padding[key])) {
        return defaultValue;
    }
    if (padding.unit === 'ratio') {
        return padding[key] * domainLength;
    }
    // assume padding is pixels if unit is not specified
    return this.convertPixelsToAxisPadding(padding[key], domainLength);
};
_Axis.prototype.convertPixelsToAxisPadding = function convertPixelsToAxisPadding(pixels, domainLength) {
    var $$ = this.owner,
        length = $$.config.axis_rotated ? $$.width : $$.height;
    return domainLength * (pixels / length);
};

_Axis.prototype.generateTickValues = function generateTickValues(values, tickCount, forTimeSeries) {
    var tickValues = values, targetCount, start, end, count, interval, i, tickValue;
    if (tickCount) {
        targetCount = isFunction(tickCount) ? tickCount() : tickCount;
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
    if (!forTimeSeries) { tickValues = tickValues.sort(function (a, b) { return a - b; }); }
    return tickValues;
};
_Axis.prototype.generateTransitions = function generateTransitions(duration) {
    var $$ = this.owner, axes = $$.axes;
    return {
        axisX: duration ? axes.x.transition().duration(duration) : axes.x,
        axisY: duration ? axes.y.transition().duration(duration) : axes.y,
        axisY2: duration ? axes.y2.transition().duration(duration) : axes.y2,
        axisSubX: duration ? axes.subx.transition().duration(duration) : axes.subx
    };
};
_Axis.prototype.redraw = function redraw(transitions, isHidden) {
    var $$ = this.owner, config = $$.config;
    $$.axes.x.style("opacity", isHidden ? 0 : 1);
    $$.axes.y.style("opacity", isHidden ? 0 : 1);
    $$.axes.y2.style("opacity", isHidden ? 0 : 1);
    $$.axes.subx.style("opacity", isHidden ? 0 : 1);
    transitions.axisX.call($$.xAxis);
    transitions.axisY.call($$.yAxis);
    transitions.axisY2.call($$.y2Axis);
    transitions.axisSubX.call($$.subXAxis);
    // rotate tick text if needed
    if (!config.axis_rotated && config.axis_x_tick_rotate) {
        _rotateTickText($$.axes.x, transitions.axisX, config.axis_x_tick_rotate);
        _rotateTickText($$.axes.subx, transitions.axisSubX, config.axis_x_tick_rotate);
    }
};

function _getTickValues(tickValues, axis) {
    return tickValues ? tickValues : axis ? axis.tickValues() : undefined;
}

function _getLabelOptionByAxisId(axisId) {
    var $$ = this.owner, config = $$.config, option;
    if (axisId === 'y') {
        option = config.axis_y_label;
    } else if (axisId === 'y2') {
        option = config.axis_y2_label;
    } else if (axisId === 'x') {
        option = config.axis_x_label;
    }
    return option;
}

function _getLabelText(axisId) {
    var option = _getLabelOptionByAxisId.call(this, axisId);
    return isString(option) ? option : option ? option.text : null;
}

function _getLabelPosition(axisId, defaultPosition) {
    var option = _getLabelOptionByAxisId.call(this, axisId),
        position = (option && typeof option === 'object' && option.position) ? option.position : defaultPosition;
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
}

function _getXAxisLabelPosition() {
    return _getLabelPosition.call(this, 'x', this.owner.config.axis_rotated ? 'inner-top' : 'inner-right');
}

function _textForXAxisLabel() {
    return _getLabelText.call(this, 'x');
}

function _textForYAxisLabel() {
    return _getLabelText.call(this, 'y');
}

function _textForY2AxisLabel() {
    return _getLabelText.call(this, 'y2');
}

function _xForAxisLabel(forHorizontal, position) {
    var $$ = this.owner;
    if (forHorizontal) {
        return position.isLeft ? 0 : position.isCenter ? $$.width / 2 : $$.width;
    } else {
        return position.isBottom ? -$$.height : position.isMiddle ? -$$.height / 2 : 0;
    }
}

function _dxForAxisLabel(forHorizontal, position) {
    if (forHorizontal) {
        return position.isLeft ? "0.5em" : position.isRight ? "-0.5em" : "0";
    } else {
        return position.isTop ? "-0.5em" : position.isBottom ? "0.5em" : "0";
    }
}

function _textAnchorForAxisLabel(forHorizontal, position) {
    if (forHorizontal) {
        return position.isLeft ? 'start' : position.isCenter ? 'middle' : 'end';
    } else {
        return position.isBottom ? 'start' : position.isMiddle ? 'middle' : 'end';
    }
}

function _xForXAxisLabel() {
    return _xForAxisLabel.call(this, !this.owner.config.axis_rotated, _getXAxisLabelPosition.call(this));
}

function _xForYAxisLabel() {
    return _xForAxisLabel.call(this, this.owner.config.axis_rotated, this.getYAxisLabelPosition());
}

function _xForY2AxisLabel() {
    return _xForAxisLabel.call(this, this.owner.config.axis_rotated, this.getY2AxisLabelPosition());
}

function _dxForXAxisLabel() {
    return _dxForAxisLabel(!this.owner.config.axis_rotated, _getXAxisLabelPosition.call(this));
}

function _dxForYAxisLabel() {
    return _dxForAxisLabel(this.owner.config.axis_rotated, this.getYAxisLabelPosition());
}

function _dxForY2AxisLabel() {
    return _dxForAxisLabel(this.owner.config.axis_rotated, this.getY2AxisLabelPosition());
}

function _dyForXAxisLabel() {
    var $$ = this.owner, config = $$.config,
        position = _getXAxisLabelPosition.call(this);
    if (config.axis_rotated) {
        return position.isInner ? "1.2em" : -25 - this.getMaxTickWidth('x');
    } else {
        return position.isInner ? "-0.5em" : config.axis_x_height ? config.axis_x_height - 10 : "3em";
    }
}

function _dyForYAxisLabel() {
    var $$ = this.owner,
        position = this.getYAxisLabelPosition();
    if ($$.config.axis_rotated) {
        return position.isInner ? "-0.5em" : "3em";
    } else {
        return position.isInner ? "1.2em" : -10 - ($$.config.axis_y_inner ? 0 : (this.getMaxTickWidth('y') + 10));
    }
}

function _dyForY2AxisLabel() {
    var $$ = this.owner,
        position = this.getY2AxisLabelPosition();
    if ($$.config.axis_rotated) {
        return position.isInner ? "1.2em" : "-2.2em";
    } else {
        return position.isInner ? "-0.5em" : 15 + ($$.config.axis_y2_inner ? 0 : (this.getMaxTickWidth('y2') + 15));
    }
}

function _textAnchorForXAxisLabel() {
    var $$ = this.owner;
    return _textAnchorForAxisLabel(!$$.config.axis_rotated, _getXAxisLabelPosition.call(this));
}

function _textAnchorForYAxisLabel() {
    var $$ = this.owner;
    return _textAnchorForAxisLabel($$.config.axis_rotated, this.getYAxisLabelPosition());
}

function _textAnchorForY2AxisLabel() {
    var $$ = this.owner;
    return _textAnchorForAxisLabel($$.config.axis_rotated, this.getY2AxisLabelPosition());
}

function _xForRotatedTickText(r) {
    return 8 * Math.sin(Math.PI * (r / 180));
}

function _yForRotatedTickText(r) {
    return 11.5 - 2.5 * (r / 15) * (r > 0 ? 1 : -1);
}

function _rotateTickText(axis, transition, rotate) {
    axis.selectAll('.tick text')
        .style("text-anchor", rotate > 0 ? "start" : "end");
    transition.selectAll('.tick text')
        .attr("y", _yForRotatedTickText(rotate))
        .attr("transform", "rotate(" + rotate + ")")
      .selectAll('tspan')
        .attr('dx', _xForRotatedTickText(rotate));
}
