c3_chart_internal_fn.getShapeIndices = function (typeFilter) {
    var $$ = this, config = $$.config,
        indices = {}, i = 0, j, k;
    $$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$)).forEach(function (d) {
        for (j = 0; j < config[__data_groups].length; j++) {
            if (config[__data_groups][j].indexOf(d.id) < 0) { continue; }
            for (k = 0; k < config[__data_groups][j].length; k++) {
                if (config[__data_groups][j][k] in indices) {
                    indices[d.id] = indices[config[__data_groups][j][k]];
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
    var $$ = this, scale = isSub ? $$.subX : $$.x;
    return function (d) {
        var index = d.id in indices ? indices[d.id] : 0;
        return d.x || d.x === 0 ? scale(d.x) - offset * (targetsNum / 2 - index) : 0;
    };
};
c3_chart_internal_fn.getShapeY = function (isSub) {
    var $$ = this;
    return function (d) {
        var scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id);
        return scale(d.value);
    };
};
c3_chart_internal_fn.getShapeOffset = function (typeFilter, indices, isSub) {
    var $$ = this,
        targets = $$.orderTargets($$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$))),
        targetIds = targets.map(function (t) { return t.id; });
    return function (d, i) {
        var scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id),
            y0 = scale(0), offset = y0;
        targets.forEach(function (t) {
            if (t.id === d.id || indices[t.id] !== indices[d.id]) { return; }
            if (targetIds.indexOf(t.id) < targetIds.indexOf(d.id) && t.values[i].value * d.value >= 0) {
                offset += scale(t.values[i].value) - y0;
            }
        });
        return offset;
    };
};

c3_chart_internal_fn.getInterpolate = function (d) {
    var $$ = this;
    return $$.isSplineType(d) ? "cardinal" : $$.isStepType(d) ? "step-after" : "linear";
};


c3_chart_internal_fn.circleX = function (d) {
    return d.x || d.x === 0 ? this.x(d.x) : null;
};
c3_chart_internal_fn.circleY = function (d, i) {
    var $$ = this,
        lineIndices = $$.getShapeIndices($$.isLineType), getPoint = $$.generateGetLinePoint(lineIndices);
    return $$.config[__data_groups].length > 0 ? getPoint(d, i)[0][1] : $$.getYScale(d.id)(d.value);
};
c3_chart_internal_fn.getCircles = function (i, id) {
    var $$ = this;
    return (id ? $$.main.selectAll('.' + CLASS[_circles] + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS[_circle] + (isValue(i) ? '-' + i : ''));
};
c3_chart_internal_fn.expandCircles = function (i, id) {
    var $$ = this;
    $$.getCircles(i, id)
        .classed(CLASS[_EXPANDED], true)
        .attr('r', generateCall($$.pointExpandedR, $$));
};
c3_chart_internal_fn.unexpandCircles = function (i) {
    var $$ = this;
    $$.getCircles(i)
        .filter(function () { return $$.d3.select(this).classed(CLASS[_EXPANDED]); })
        .classed(CLASS[_EXPANDED], false)
        .attr('r', generateCall($$.pointR, $$));
};
c3_chart_internal_fn.pointR = function (d) {
    var $$ = this, config = $$.config;
    return config[__point_show] && !$$.isStepType(d) ? (isFunction(config[__point_r]) ? config[__point_r](d) : config[__point_r]) : 0;
};
c3_chart_internal_fn.pointExpandedR = function (d) {
    var $$ = this, config = $$.config;
    return config[__point_focus_expand_enabled] ? (config[__point_focus_expand_r] ? config[__point_focus_expand_r] : $$.pointR(d) * 1.75) : $$.pointR(d);
};
c3_chart_internal_fn.pointSelectR = function (d) {
    var $$ = this, config = $$.config;
    return config[__point_select_r] ? config[__point_select_r] : $$.pointR(d) * 4;
};



c3_chart_internal_fn.getBarW = function (axis, barTargetsNum) {
    var $$ = this, config = $$.config,
        w = typeof config[__bar_width] === 'number' ? config[__bar_width] : barTargetsNum ? (axis.tickOffset() * 2 * config[__bar_width_ratio]) / barTargetsNum : 0;
    return config[__bar_width_max] && w > config[__bar_width_max] ? config[__bar_width_max] : w;
};
c3_chart_internal_fn.getBars = function (i) {
    var $$ = this;
    return $$.main.selectAll('.' + CLASS[_bar] + (isValue(i) ? '-' + i : ''));
};
c3_chart_internal_fn.expandBars = function (i) {
    var $$ = this;
    $$.getBars(i).classed(CLASS[_EXPANDED], true);
};
c3_chart_internal_fn.unexpandBars = function (i) {
    var $$ = this;
    $$.getBars(i).classed(CLASS[_EXPANDED], false);
};
c3_chart_internal_fn.generateDrawBar = function (barIndices, isSub) {
    var $$ = this, config = $$.config,
        getPoints = $$.generateGetBarPoints(barIndices, isSub);
    return function (d, i) {
        // 4 points that make a bar
        var points = getPoints(d, i);

        // switch points if axis is rotated, not applicable for sub chart
        var indexX = config[__axis_rotated] ? 1 : 0;
        var indexY = config[__axis_rotated] ? 0 : 1;

        var path = 'M ' + points[0][indexX] + ',' + points[0][indexY] + ' ' +
                'L' + points[1][indexX] + ',' + points[1][indexY] + ' ' +
                'L' + points[2][indexX] + ',' + points[2][indexY] + ' ' +
                'L' + points[3][indexX] + ',' + points[3][indexY] + ' ' +
                'z';

        return path;
    };
};
c3_chart_internal_fn.generateGetBarPoints = function (barIndices, isSub) {
    var $$ = this,
        barTargetsNum = barIndices.__max__ + 1,
        barW = $$.getBarW($$.xAxis, barTargetsNum),
        barX = $$.getShapeX(barW, barTargetsNum, barIndices, !!isSub),
        barY = $$.getShapeY(!!isSub),
        barOffset = $$.getShapeOffset($$.isBarType, barIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;
    return function (d, i) {
        var y0 = yScale.call($$, d.id)(0),
            offset = barOffset(d, i) || y0, // offset is for stacked bar chart
            posX = barX(d), posY = barY(d);
        // fix posY not to overflow opposite quadrant
        if ($$.config[__axis_rotated]) {
            if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
        }
        // 4 points that make a bar
        return [
            [posX, offset],
            [posX, posY - (y0 - offset)],
            [posX + barW, posY - (y0 - offset)],
            [posX + barW, offset]
        ];
    };
};

c3_chart_internal_fn.generateDrawArea = function (areaIndices, isSub) {
    var $$ = this, config = $$.config, area = $$.d3.svg.area(),
        getPoint = $$.generateGetAreaPoint(areaIndices, isSub),
        yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
        xValue = function (d) { return (isSub ? $$.subxx : $$.xx).call($$, d); },
        value0 = function (d, i) {
            return config[__data_groups].length > 0 ? getPoint(d, i)[0][1] : yScaleGetter.call($$, d.id)(0);
        },
        value1 = function (d, i) {
            return config[__data_groups].length > 0 ? getPoint(d, i)[1][1] : yScaleGetter.call($$, d.id)(d.value);
        };

    area = config[__axis_rotated] ? area.x0(value0).x1(value1).y(xValue) : area.x(xValue).y0(value0).y1(value1);
    if (!config[__line_connect_null]) {
        area = area.defined(function (d) { return d.value !== null; });
    }

    return function (d) {
        var data = config[__line_connect_null] ? $$.filterRemoveNull(d.values) : d.values, x0 = 0, y0 = 0, path;
        if ($$.isAreaType(d)) {
            path = area.interpolate($$.getInterpolate(d))(data);
        } else {
            if (data[0]) {
                x0 = $$.x(data[0].x);
                y0 = $$.getYScale(d.id)(data[0].value);
            }
            path = config[__axis_rotated] ? "M " + y0 + " " + x0 : "M " + x0 + " " + y0;
        }
        return path ? path : "M 0 0";
    };
};

c3_chart_internal_fn.generateDrawLine = function (lineIndices, isSub) {
    var $$ = this, config = $$.config,
        line = $$.d3.svg.line(),
        getPoint = $$.generateGetLinePoint(lineIndices, isSub),
        yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
        xValue = function (d) { return (isSub ? $$.subxx : $$.xx).call($$, d); },
        yValue = function (d, i) {
            return config[__data_groups].length > 0 ? getPoint(d, i)[0][1] : yScaleGetter.call($$, d.id)(d.value);
        };

    line = config[__axis_rotated] ? line.x(yValue).y(xValue) : line.x(xValue).y(yValue);
    if (!config[__line_connect_null]) { line = line.defined(function (d) { return d.value != null; }); }
    return function (d) {
        var data = config[__line_connect_null] ? $$.filterRemoveNull(d.values) : d.values,
            x = isSub ? $$.x : $$.subX, y = yScaleGetter.call($$, d.id), x0 = 0, y0 = 0, path;
        if ($$.isLineType(d)) {
            if (config[__data_regions][d.id]) {
                path = $$.lineWithRegions(data, x, y, config[__data_regions][d.id]);
            } else {
                path = line.interpolate($$.getInterpolate(d))(data);
            }
        } else {
            if (data[0]) {
                x0 = x(data[0].x);
                y0 = y(data[0].value);
            }
            path = config[__axis_rotated] ? "M " + y0 + " " + x0 : "M " + x0 + " " + y0;
        }
        return path ? path : "M 0 0";
    };
};

c3_chart_internal_fn.generateXYForText = function (barIndices, forX) {
    var $$ = this,
        getPoints = $$.generateGetBarPoints(barIndices, false),
        getter = forX ? $$.getXForText : $$.getYForText;
    return function (d, i) {
        return getter.call($$, getPoints(d, i), d, this);
    };
};
c3_chart_internal_fn.getXForText = function (points, d, textElement) {
    var $$ = this,
        box = textElement.getBoundingClientRect(), xPos, padding;
    if ($$.config[__axis_rotated]) {
        padding = $$.isBarType(d) ? 4 : 6;
        xPos = points[2][1] + padding * (d.value < 0 ? -1 : 1);
    } else {
        xPos = $$.hasType('bar') ? (points[2][0] + points[0][0]) / 2 : points[0][0];
    }
    return xPos > $$.width ? $$.width - box.width : xPos;
};
c3_chart_internal_fn.getYForText = function (points, d, textElement) {
    var $$ = this,
        box = textElement.getBoundingClientRect(), yPos;
    if ($$.config[__axis_rotated]) {
        yPos = (points[0][0] + points[2][0] + box.height * 0.6) / 2;
    } else {
        yPos = points[2][1] + (d.value < 0 ? box.height : $$.isBarType(d) ? -3 : -6);
    }
    return yPos < box.height ? box.height : yPos;
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
        if (config[__axis_rotated]) {
            if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
        }
        // 1 point that marks the area position
        return [
            [posX, offset],
            [posX, posY - (y0 - offset)]
        ];
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
        if (config[__axis_rotated]) {
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
    xValue = config[__axis_rotated] ? function (d) { return y(d.value); } : function (d) { return x(d.x); };
    yValue = config[__axis_rotated] ? function (d) { return x(d.x); } : function (d) { return y(d.value); };

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
        if (isUndefined(regions) || ! $$.isWithinRegions(d[i].x, regions)) {
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
c3_chart_internal_fn.isWithinCircle = function (_this, _r) {
    var d3 = this.d3,
        mouse = d3.mouse(_this), d3_this = d3.select(_this),
        cx = d3_this.attr("cx") * 1, cy = d3_this.attr("cy") * 1;
    return Math.sqrt(Math.pow(cx - mouse[0], 2) + Math.pow(cy - mouse[1], 2)) < _r;
};
c3_chart_internal_fn.isWithinBar = function (_this) {
    var d3 = this.d3,
        mouse = d3.mouse(_this), box = _this.getBoundingClientRect(),
        seg0 = _this.pathSegList.getItem(0), seg1 = _this.pathSegList.getItem(1),
        x = seg0.x, y = Math.min(seg0.y, seg1.y), w = box.width, h = box.height, offset = 2,
        sx = x - offset, ex = x + w + offset, sy = y + h + offset, ey = y - offset;
    return sx < mouse[0] && mouse[0] < ex && ey < mouse[1] && mouse[1] < sy;
};
c3_chart_internal_fn.isWithinRegions = function (x, regions) {
    var i;
    for (i = 0; i < regions.length; i++) {
        if (regions[i].start < x && x <= regions[i].end) { return true; }
    }
    return false;
};
