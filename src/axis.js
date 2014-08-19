c3_chart_internal_fn.initAxis = function () {
    var $$ = this, config = $$.config, main = $$.main;
    $$.axes.x = main.append("g")
        .attr("class", CLASS.axis + ' ' + CLASS.axisX)
        .attr("clip-path", $$.clipPathForXAxis)
        .attr("transform", $$.getTranslate('x'))
        .style("visibility", config.axis_x_show ? 'visible' : 'hidden');
    $$.axes.x.append("text")
        .attr("class", CLASS.axisXLabel)
        .attr("transform", config.axis_rotated ? "rotate(-90)" : "")
        .style("text-anchor", $$.textAnchorForXAxisLabel.bind($$));

    $$.axes.y = main.append("g")
        .attr("class", CLASS.axis + ' ' + CLASS.axisY)
        .attr("clip-path", $$.clipPathForYAxis)
        .attr("transform", $$.getTranslate('y'))
        .style("visibility", config.axis_y_show ? 'visible' : 'hidden');
    $$.axes.y.append("text")
        .attr("class", CLASS.axisYLabel)
        .attr("transform", config.axis_rotated ? "" : "rotate(-90)")
        .style("text-anchor", $$.textAnchorForYAxisLabel.bind($$));

    $$.axes.y2 = main.append("g")
        .attr("class", CLASS.axis + ' ' + CLASS.axisY2)
        // clip-path?
        .attr("transform", $$.getTranslate('y2'))
        .style("visibility", config.axis_y2_show ? 'visible' : 'hidden');
    $$.axes.y2.append("text")
        .attr("class", CLASS.axisY2Label)
        .attr("transform", config.axis_rotated ? "" : "rotate(-90)")
        .style("text-anchor", $$.textAnchorForY2AxisLabel.bind($$));
};
c3_chart_internal_fn.getXAxis = function (scale, orient, tickFormat, tickValues) {
    var $$ = this, config = $$.config,
        axis = c3_axis($$.d3, $$.isCategorized()).scale(scale).orient(orient);

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
            var edgeX = $$.getEdgeX($$.data.targets), diff = $$.x(edgeX[1]) - $$.x(edgeX[0]),
                base = diff ? diff : (config.axis_rotated ? $$.height : $$.width);
            return (base / $$.getMaxDataCount()) / 2;
        };
    }

    return axis;
};
c3_chart_internal_fn.getYAxis = function (scale, orient, tickFormat, ticks) {
    return c3_axis(this.d3).scale(scale).orient(orient).tickFormat(tickFormat).ticks(ticks);
};
c3_chart_internal_fn.getAxisId = function (id) {
    var config = this.config;
    return id in config.data_axes ? config.data_axes[id] : 'y';
};
c3_chart_internal_fn.getXAxisTickFormat = function () {
    var $$ = this, config = $$.config,
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
c3_chart_internal_fn.getAxisLabelOptionByAxisId = function (axisId) {
    var $$ = this, config = $$.config, option;
    if (axisId === 'y') {
        option = config.axis_y_label;
    } else if (axisId === 'y2') {
        option = config.axis_y2_label;
    } else if (axisId === 'x') {
        option = config.axis_x_label;
    }
    return option;
};
c3_chart_internal_fn.getAxisLabelText = function (axisId) {
    var option = this.getAxisLabelOptionByAxisId(axisId);
    return isString(option) ? option : option ? option.text : null;
};
c3_chart_internal_fn.setAxisLabelText = function (axisId, text) {
    var $$ = this, config = $$.config,
        option = $$.getAxisLabelOptionByAxisId(axisId);
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
c3_chart_internal_fn.getAxisLabelPosition = function (axisId, defaultPosition) {
    var option = this.getAxisLabelOptionByAxisId(axisId),
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
};
c3_chart_internal_fn.getXAxisLabelPosition = function () {
    return this.getAxisLabelPosition('x', this.config.axis_rotated ? 'inner-top' : 'inner-right');
};
c3_chart_internal_fn.getYAxisLabelPosition = function () {
    return this.getAxisLabelPosition('y', this.config.axis_rotated ? 'inner-right' : 'inner-top');
};
c3_chart_internal_fn.getY2AxisLabelPosition = function () {
    return this.getAxisLabelPosition('y2', this.config.axis_rotated ? 'inner-right' : 'inner-top');
};
c3_chart_internal_fn.getAxisLabelPositionById = function (id) {
    return id === 'y2' ? this.getY2AxisLabelPosition() : id === 'y' ? this.getYAxisLabelPosition() : this.getXAxisLabelPosition();
};
c3_chart_internal_fn.textForXAxisLabel = function () {
    return this.getAxisLabelText('x');
};
c3_chart_internal_fn.textForYAxisLabel = function () {
    return this.getAxisLabelText('y');
};
c3_chart_internal_fn.textForY2AxisLabel = function () {
    return this.getAxisLabelText('y2');
};
c3_chart_internal_fn.xForAxisLabel = function (forHorizontal, position) {
    var $$ = this;
    if (forHorizontal) {
        return position.isLeft ? 0 : position.isCenter ? $$.width / 2 : $$.width;
    } else {
        return position.isBottom ? -$$.height : position.isMiddle ? -$$.height / 2 : 0;
    }
};
c3_chart_internal_fn.dxForAxisLabel = function (forHorizontal, position) {
    if (forHorizontal) {
        return position.isLeft ? "0.5em" : position.isRight ? "-0.5em" : "0";
    } else {
        return position.isTop ? "-0.5em" : position.isBottom ? "0.5em" : "0";
    }
};
c3_chart_internal_fn.textAnchorForAxisLabel = function (forHorizontal, position) {
    if (forHorizontal) {
        return position.isLeft ? 'start' : position.isCenter ? 'middle' : 'end';
    } else {
        return position.isBottom ? 'start' : position.isMiddle ? 'middle' : 'end';
    }
};
c3_chart_internal_fn.xForXAxisLabel = function () {
    return this.xForAxisLabel(!this.config.axis_rotated, this.getXAxisLabelPosition());
};
c3_chart_internal_fn.xForYAxisLabel = function () {
    return this.xForAxisLabel(this.config.axis_rotated, this.getYAxisLabelPosition());
};
c3_chart_internal_fn.xForY2AxisLabel = function () {
    return this.xForAxisLabel(this.config.axis_rotated, this.getY2AxisLabelPosition());
};
c3_chart_internal_fn.dxForXAxisLabel = function () {
    return this.dxForAxisLabel(!this.config.axis_rotated, this.getXAxisLabelPosition());
};
c3_chart_internal_fn.dxForYAxisLabel = function () {
    return this.dxForAxisLabel(this.config.axis_rotated, this.getYAxisLabelPosition());
};
c3_chart_internal_fn.dxForY2AxisLabel = function () {
    return this.dxForAxisLabel(this.config.axis_rotated, this.getY2AxisLabelPosition());
};
c3_chart_internal_fn.dyForXAxisLabel = function () {
    var $$ = this, config = $$.config,
        position = $$.getXAxisLabelPosition();
    if (config.axis_rotated) {
        return position.isInner ? "1.2em" : -25 - $$.getMaxTickWidth('x');
    } else {
        return position.isInner ? "-0.5em" : config.axis_x_height ? config.axis_x_height - 10 : "3em";
    }
};
c3_chart_internal_fn.dyForYAxisLabel = function () {
    var $$ = this,
        position = $$.getYAxisLabelPosition();
    if ($$.config.axis_rotated) {
        return position.isInner ? "-0.5em" : "3em";
    } else {
        return position.isInner ? "1.2em" : -20 - $$.getMaxTickWidth('y');
    }
};
c3_chart_internal_fn.dyForY2AxisLabel = function () {
    var $$ = this,
        position = $$.getY2AxisLabelPosition();
    if ($$.config.axis_rotated) {
        return position.isInner ? "1.2em" : "-2.2em";
    } else {
        return position.isInner ? "-0.5em" : 30 + this.getMaxTickWidth('y2');
    }
};
c3_chart_internal_fn.textAnchorForXAxisLabel = function () {
    var $$ = this;
    return $$.textAnchorForAxisLabel(!$$.config.axis_rotated, $$.getXAxisLabelPosition());
};
c3_chart_internal_fn.textAnchorForYAxisLabel = function () {
    var $$ = this;
    return $$.textAnchorForAxisLabel($$.config.axis_rotated, $$.getYAxisLabelPosition());
};
c3_chart_internal_fn.textAnchorForY2AxisLabel = function () {
    var $$ = this;
    return $$.textAnchorForAxisLabel($$.config.axis_rotated, $$.getY2AxisLabelPosition());
};

c3_chart_internal_fn.xForRotatedTickText = function (r) {
    return 10 * Math.sin(Math.PI * (r / 180));
};
c3_chart_internal_fn.yForRotatedTickText = function (r) {
    return 11.5 - 2.5 * (r / 15);
};
c3_chart_internal_fn.rotateTickText = function (axis, transition, rotate) {
    axis.selectAll('.tick text')
        .style("text-anchor", "start");
    transition.selectAll('.tick text')
        .attr("y", this.yForRotatedTickText(rotate))
        .attr("x", this.xForRotatedTickText(rotate))
        .attr("transform", "rotate(" + rotate + ")");
};

c3_chart_internal_fn.getMaxTickWidth = function (id) {
    var $$ = this, config = $$.config,
        maxWidth = 0, targetsToShow, scale, axis;
    if ($$.svg) {
        targetsToShow = $$.filterTargetsToShow($$.data.targets);
        if (id === 'y') {
            scale = $$.y.copy().domain($$.getYDomain(targetsToShow, 'y'));
            axis = $$.getYAxis(scale, $$.yOrient, config.axis_y_tick_format, config.axis_y_ticks);
        } else if (id === 'y2') {
            scale = $$.y2.copy().domain($$.getYDomain(targetsToShow, 'y2'));
            axis = $$.getYAxis(scale, $$.y2Orient, config.axis_y2_tick_format, config.axis_y2_ticks);
        } else {
            scale = $$.x.copy().domain($$.getXDomain(targetsToShow));
            axis = $$.getXAxis(scale, $$.xOrient, $$.getXAxisTickFormat(), config.axis_x_tick_values ? config.axis_x_tick_values : $$.xAxis.tickValues());
        }
        $$.main.append("g").call(axis).each(function () {
            $$.d3.select(this).selectAll('text').each(function () {
                var box = this.getBoundingClientRect();
                if (maxWidth < box.width) { maxWidth = box.width; }
            });
        }).remove();
    }
    $$.currentMaxTickWidth = maxWidth <= 0 ? $$.currentMaxTickWidth : maxWidth;
    return $$.currentMaxTickWidth;
};

c3_chart_internal_fn.updateAxisLabels = function (withTransition) {
    var $$ = this;
    var axisXLabel = $$.main.select('.' + CLASS.axisX + ' .' + CLASS.axisXLabel),
        axisYLabel = $$.main.select('.' + CLASS.axisY + ' .' + CLASS.axisYLabel),
        axisY2Label = $$.main.select('.' + CLASS.axisY2 + ' .' + CLASS.axisY2Label);
    (withTransition ? axisXLabel.transition() : axisXLabel)
        .attr("x", $$.xForXAxisLabel.bind($$))
        .attr("dx", $$.dxForXAxisLabel.bind($$))
        .attr("dy", $$.dyForXAxisLabel.bind($$))
        .text($$.textForXAxisLabel.bind($$));
    (withTransition ? axisYLabel.transition() : axisYLabel)
        .attr("x", $$.xForYAxisLabel.bind($$))
        .attr("dx", $$.dxForYAxisLabel.bind($$))
        .attr("dy", $$.dyForYAxisLabel.bind($$))
        .text($$.textForYAxisLabel.bind($$));
    (withTransition ? axisY2Label.transition() : axisY2Label)
        .attr("x", $$.xForY2AxisLabel.bind($$))
        .attr("dx", $$.dxForY2AxisLabel.bind($$))
        .attr("dy", $$.dyForY2AxisLabel.bind($$))
        .text($$.textForY2AxisLabel.bind($$));
};

c3_chart_internal_fn.getAxisPadding = function (padding, key, defaultValue, all) {
    var ratio = padding.unit === 'ratio' ? all : 1;
    return isValue(padding[key]) ? padding[key] * ratio : defaultValue;
};

c3_chart_internal_fn.generateTickValues = function (xs, tickCount) {
    var $$ = this;
    var tickValues = xs, targetCount, start, end, count, interval, i, tickValue;
    if (tickCount) {
        targetCount = isFunction(tickCount) ? tickCount() : tickCount;
        // compute ticks according to $$.config.axis_x_tick_count
        if (targetCount === 1) {
            tickValues = [xs[0]];
        } else if (targetCount === 2) {
            tickValues = [xs[0], xs[xs.length - 1]];
        } else if (targetCount > 2) {
            count = targetCount - 2;
            start = xs[0];
            end = xs[xs.length - 1];
            interval = (end - start) / (count + 1);
            // re-construct uniqueXs
            tickValues = [start];
            for (i = 0; i < count; i++) {
                tickValue = +start + interval * (i + 1);
                tickValues.push($$.isTimeSeries() ? new Date(tickValue) : tickValue);
            }
            tickValues.push(end);
        }
    }
    if (!$$.isTimeSeries()) { tickValues = tickValues.sort(function (a, b) { return a - b; }); }
    return tickValues;
};
c3_chart_internal_fn.generateAxisTransitions = function (duration) {
    var $$ = this, axes = $$.axes;
    return {
        axisX: duration ? axes.x.transition().duration(duration) : axes.x,
        axisY: duration ? axes.y.transition().duration(duration) : axes.y,
        axisY2: duration ? axes.y2.transition().duration(duration) : axes.y2,
        axisSubX: duration ? axes.subx.transition().duration(duration) : axes.subx
    };
};
c3_chart_internal_fn.redrawAxis = function (transitions, isHidden) {
    var $$ = this;
    $$.axes.x.style("opacity", isHidden ? 0 : 1);
    $$.axes.y.style("opacity", isHidden ? 0 : 1);
    $$.axes.y2.style("opacity", isHidden ? 0 : 1);
    $$.axes.subx.style("opacity", isHidden ? 0 : 1);
    transitions.axisX.call($$.xAxis);
    transitions.axisY.call($$.yAxis);
    transitions.axisY2.call($$.y2Axis);
    transitions.axisSubX.call($$.subXAxis);
};
