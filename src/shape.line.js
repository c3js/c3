c3_chart_internal_fn.initLine = function () {
    var $$ = this;
    $$.main.select('.' + CLASS.chart).append("g")
        .attr("class", CLASS.chartLines);
};
c3_chart_internal_fn.updateTargetsForLine = function (targets) {
    var $$ = this, config = $$.config,
        mainLineUpdate, mainLineEnter,
        classChartLine = $$.classChartLine.bind($$),
        classLines = $$.classLines.bind($$),
        classAreas = $$.classAreas.bind($$),
        classCircles = $$.classCircles.bind($$);
    mainLineUpdate = $$.main.select('.' + CLASS.chartLines).selectAll('.' + CLASS.chartLine)
        .data(targets)
        .attr('class', classChartLine);
    mainLineEnter = mainLineUpdate.enter().append('g')
        .attr('class', classChartLine)
        .style('opacity', 0)
        .style("pointer-events", "none");
    // Lines for each data
    mainLineEnter.append('g')
        .attr("class", classLines);
    // Areas
    mainLineEnter.append('g')
        .attr('class', classAreas);
    // Circles for each data point on lines
    mainLineEnter.append('g')
        .attr("class", function (d) { return $$.generateClass(CLASS.selectedCircles, d.id); });
    mainLineEnter.append('g')
        .attr("class", classCircles)
        .style("cursor", function (d) { return config.data_selection_isselectable(d) ? "pointer" : null; });
    // Update date for selected circles
    targets.forEach(function (t) {
        $$.main.selectAll('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(t.id)).selectAll('.' + CLASS.selectedCircle).each(function (d) {
            d.value = t.values[d.index].value;
        });
    });
    // MEMO: can not keep same color...
    //mainLineUpdate.exit().remove();
};
c3_chart_internal_fn.redrawLine = function (durationForExit) {
    var $$ = this;
    $$.mainLine = $$.main.selectAll('.' + CLASS.lines).selectAll('.' + CLASS.line)
        .data($$.lineData.bind($$));
    $$.mainLine.enter().append('path')
        .attr('class', $$.classLine.bind($$))
        .style("stroke", $$.color);
    $$.mainLine
        .style("opacity", $$.initialOpacity.bind($$))
        .attr('transform', null);
    $$.mainLine.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.addTransitionForLine = function (transitions, drawLine) {
    var $$ = this;
    transitions.push($$.mainLine.transition()
                     .attr("d", drawLine)
                     .style("stroke", $$.color)
                     .style("opacity", 1));
};
c3_chart_internal_fn.generateDrawLine = function (lineIndices, isSub) {
    var $$ = this, config = $$.config,
        line = $$.d3.svg.line(),
        getPoint = $$.generateGetLinePoint(lineIndices, isSub),
        yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
        xValue = function (d) { return (isSub ? $$.subxx : $$.xx).call($$, d); },
        yValue = function (d, i) {
            return config.data_groups.length > 0 ? getPoint(d, i)[0][1] : yScaleGetter.call($$, d.id)(d.value);
        };

    line = config.axis_rotated ? line.x(yValue).y(xValue) : line.x(xValue).y(yValue);
    if (!config.line_connect_null) { line = line.defined(function (d) { return d.value != null; }); }
    return function (d) {
        var data = config.line_connect_null ? $$.filterRemoveNull(d.values) : d.values,
            x = isSub ? $$.x : $$.subX, y = yScaleGetter.call($$, d.id), x0 = 0, y0 = 0, path;
        if ($$.isLineType(d)) {
            if (config.data_regions[d.id]) {
                path = $$.lineWithRegions(data, x, y, config.data_regions[d.id]);
            } else {
                path = line.interpolate($$.getInterpolate(d))(data);
            }
        } else {
            if (data[0]) {
                x0 = x(data[0].x);
                y0 = y(data[0].value);
            }
            path = config.axis_rotated ? "M " + y0 + " " + x0 : "M " + x0 + " " + y0;
        }
        return path ? path : "M 0 0";
    };
};
c3_chart_internal_fn.generateGetLinePoint = function (lineIndices, isSub) { // partial duplication of generateGetBarPoints
    var $$ = this, config = $$.config,
        lineTargetsNum = lineIndices.__max__ + 1,
        x = $$.getShapeX(0, lineTargetsNum, lineIndices, !!isSub),
        y = $$.getShapeY(!!isSub),
        lineOffset = $$.getShapeOffset($$.isLineType, lineIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        var y0 = yScale.call($$, d.id)(0),
            offset = lineOffset(d, i) || y0, // offset is for stacked area chart
            posX = x(d), posY = y(d);
        // fix posY not to overflow opposite quadrant
        if (config.axis_rotated) {
            if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
        }
        // 1 point that marks the line position
        return [
            [posX, posY - (y0 - offset)]
        ];
    };
};


c3_chart_internal_fn.lineWithRegions = function (d, x, y, _regions) {
    var $$ = this, config = $$.config,
        prev = -1, i, j,
        s = "M", sWithRegion,
        xp, yp, dx, dy, dd, diff, diffx2,
        xValue, yValue,
        regions = [];

    function isWithinRegions(x, regions) {
        var i;
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
    if ($$.isTimeSeries()) {
        sWithRegion = function (d0, d1, j, diff) {
            var x0 = d0.x.getTime(), x_diff = d1.x - d0.x,
                xv0 = new Date(x0 + x_diff * j),
                xv1 = new Date(x0 + x_diff * (j + diff));
            return "M" + x(xv0) + " " + y(yp(j)) + " " + x(xv1) + " " + y(yp(j + diff));
        };
    } else {
        sWithRegion = function (d0, d1, j, diff) {
            return "M" + x(xp(j), true) + " " + y(yp(j)) + " " + x(xp(j + diff), true) + " " + y(yp(j + diff));
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
            xp = $$.getScale(d[i - 1].x, d[i].x, $$.isTimeSeries());
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


c3_chart_internal_fn.redrawArea = function (durationForExit) {
    var $$ = this, d3 = $$.d3;
    $$.mainArea = $$.main.selectAll('.' + CLASS.areas).selectAll('.' + CLASS.area)
        .data($$.lineData.bind($$));
    $$.mainArea.enter().append('path')
        .attr("class", $$.classArea.bind($$))
        .style("fill", $$.color)
        .style("opacity", function () { $$.orgAreaOpacity = +d3.select(this).style('opacity'); return 0; });
    $$.mainArea
        .style("opacity", $$.orgAreaOpacity);
    $$.mainArea.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.addTransitionForArea = function (transitions, drawArea) {
    var $$ = this;
    transitions.push($$.mainArea.transition()
                     .attr("d", drawArea)
                     .style("fill", $$.color)
                     .style("opacity", $$.orgAreaOpacity));
};
c3_chart_internal_fn.generateDrawArea = function (areaIndices, isSub) {
    var $$ = this, config = $$.config, area = $$.d3.svg.area(),
        getPoint = $$.generateGetAreaPoint(areaIndices, isSub),
        yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
        xValue = function (d) { return (isSub ? $$.subxx : $$.xx).call($$, d); },
        value0 = function (d, i) {
            return config.data_groups.length > 0 ? getPoint(d, i)[0][1] : yScaleGetter.call($$, d.id)(0);
        },
        value1 = function (d, i) {
            return config.data_groups.length > 0 ? getPoint(d, i)[1][1] : yScaleGetter.call($$, d.id)(d.value);
        };

    area = config.axis_rotated ? area.x0(value0).x1(value1).y(xValue) : area.x(xValue).y0(value0).y1(value1);
    if (!config.line_connect_null) {
        area = area.defined(function (d) { return d.value !== null; });
    }

    return function (d) {
        var data = config.line_connect_null ? $$.filterRemoveNull(d.values) : d.values, x0 = 0, y0 = 0, path;
        if ($$.isAreaType(d)) {
            path = area.interpolate($$.getInterpolate(d))(data);
        } else {
            if (data[0]) {
                x0 = $$.x(data[0].x);
                y0 = $$.getYScale(d.id)(data[0].value);
            }
            path = config.axis_rotated ? "M " + y0 + " " + x0 : "M " + x0 + " " + y0;
        }
        return path ? path : "M 0 0";
    };
};

c3_chart_internal_fn.generateGetAreaPoint = function (areaIndices, isSub) { // partial duplication of generateGetBarPoints
    var $$ = this, config = $$.config,
        areaTargetsNum = areaIndices.__max__ + 1,
        x = $$.getShapeX(0, areaTargetsNum, areaIndices, !!isSub),
        y = $$.getShapeY(!!isSub),
        areaOffset = $$.getShapeOffset($$.isAreaType, areaIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        var y0 = yScale.call($$, d.id)(0),
            offset = areaOffset(d, i) || y0, // offset is for stacked area chart
            posX = x(d), posY = y(d);
        // fix posY not to overflow opposite quadrant
        if (config.axis_rotated) {
            if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
        }
        // 1 point that marks the area position
        return [
            [posX, offset],
            [posX, posY - (y0 - offset)]
        ];
    };
};


c3_chart_internal_fn.redrawCircle = function () {
    var $$ = this;
    $$.mainCircle = $$.main.selectAll('.' + CLASS.circles).selectAll('.' + CLASS.circle)
        .data($$.lineOrScatterData.bind($$));
    $$.mainCircle.enter().append("circle")
        .attr("class", $$.classCircle.bind($$))
        .attr("r", $$.pointR.bind($$))
        .style("fill", $$.color);
    $$.mainCircle
        .style("opacity", $$.initialOpacity.bind($$));
    $$.mainCircle.exit().remove();
};
c3_chart_internal_fn.addTransitionForCircle = function (transitions, cx, cy) {
    var $$ = this;
    transitions.push($$.mainCircle.transition()
                     .style('opacity', $$.opacityForCircle.bind($$))
                     .style("fill", $$.color)
                     .attr("cx", cx)
                     .attr("cy", cy));
    transitions.push($$.main.selectAll('.' + CLASS.selectedCircle).transition()
                     .attr("cx", cx)
                     .attr("cy", cy));
};
c3_chart_internal_fn.circleX = function (d) {
    return d.x || d.x === 0 ? this.x(d.x) : null;
};
c3_chart_internal_fn.circleY = function (d, i) {
    var $$ = this,
        lineIndices = $$.getShapeIndices($$.isLineType), getPoint = $$.generateGetLinePoint(lineIndices);
    return $$.config.data_groups.length > 0 ? getPoint(d, i)[0][1] : $$.getYScale(d.id)(d.value);
};
c3_chart_internal_fn.getCircles = function (i, id) {
    var $$ = this;
    return (id ? $$.main.selectAll('.' + CLASS.circles + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS.circle + (isValue(i) ? '-' + i : ''));
};
c3_chart_internal_fn.expandCircles = function (i, id) {
    var $$ = this,
        r = $$.pointExpandedR.bind($$);
    $$.getCircles(i, id)
        .classed(CLASS.EXPANDED, true)
        .attr('r', r);
};
c3_chart_internal_fn.unexpandCircles = function (i) {
    var $$ = this,
        r = $$.pointR.bind($$);
    $$.getCircles(i)
        .filter(function () { return $$.d3.select(this).classed(CLASS.EXPANDED); })
        .classed(CLASS.EXPANDED, false)
        .attr('r', r);
};
c3_chart_internal_fn.pointR = function (d) {
    var $$ = this, config = $$.config;
    return config.point_show && !$$.isStepType(d) ? (isFunction(config.point_r) ? config.point_r(d) : config.point_r) : 0;
};
c3_chart_internal_fn.pointExpandedR = function (d) {
    var $$ = this, config = $$.config;
    return config.point_focus_expand_enabled ? (config.point_focus_expand_r ? config.point_focus_expand_r : $$.pointR(d) * 1.75) : $$.pointR(d);
};
c3_chart_internal_fn.pointSelectR = function (d) {
    var $$ = this, config = $$.config;
    return config.point_select_r ? config.point_select_r : $$.pointR(d) * 4;
};
c3_chart_internal_fn.isWithinCircle = function (_this, _r) {
    var d3 = this.d3,
        mouse = d3.mouse(_this), d3_this = d3.select(_this),
        cx = d3_this.attr("cx") * 1, cy = d3_this.attr("cy") * 1;
    return Math.sqrt(Math.pow(cx - mouse[0], 2) + Math.pow(cy - mouse[1], 2)) < _r;
};
