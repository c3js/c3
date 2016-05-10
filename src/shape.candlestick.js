// Candle stick chart initialization
c3_chart_internal_fn.initCandleStick = function() {
    var $$ = this;
    $$.main.select('.' + CLASS.chart).append("g")
        .attr('class', CLASS.chartCandleSticks);
};
// Convert candlestick data
c3_chart_internal_fn.convertTargetsForCandleStick = function (targets) {
    var $$ = this,
        config = $$.config,
        minValues = (targets.filter(function (t) { return t.id === config.candlestick_data_min; })[0] || {}).values,
        maxValues = (targets.filter(function (t) { return t.id === config.candlestick_data_max; })[0] || {}).values,
        startValues = (targets.filter(function (t) { return t.id === config.candlestick_data_start; })[0] || {}).values,
        endValues = (targets.filter(function (t) { return t.id === config.candlestick_data_end; })[0] || {}).values;

    if (!minValues) {
        throw new Error('No min values found at ' + config.candlestick_data_min + ' data property!');
    }

    if (!maxValues) {
        throw new Error('No max values found at ' + config.candlestick_data_max + ' data property!');
    }

    if (!startValues) {
        throw new Error('No start values found at ' + config.candlestick_data_start + ' data property!');
    }

    if (!endValues) {
        throw new Error('No end values found at ' + config.candlestick_data_end + ' data property!');
    }

    var dataNum = Math.max(minValues.length, maxValues.length, startValues.length, endValues.length);

    if (minValues.length !== dataNum) {
        throw new Error('Not enough min values! Required ' + dataNum + ' values');
    }

    if (maxValues.length !== dataNum) {
        throw new Error('Not enough max values! Required ' + dataNum + ' values');
    }

    if (startValues.length !== dataNum) {
        throw new Error('Not enough start values! Required ' + dataNum + ' values');
    }

    if (endValues.length !== dataNum) {
        throw new Error('Not enough end values! Required ' + dataNum + ' values');
    }

    // Saving data to internal var
    var candleStickValues = minValues.map(function(min, index) {
        return {
            id: 'cs-data',
            index: index,
            value: min.value,
            csValue: {
                min: min.value,
                max: maxValues[index].value,
                start: startValues[index].value,
                end: endValues[index].value
            },
            x: min.x
        };
    });

    $$.config.data_types['cs-data'] = 'candle-stick';
    $$.candleStickValues = candleStickValues;

    return $$.candleStickValues;
};
// Updating candle stick chart containers
c3_chart_internal_fn.updateTargetsForCandleStick = function (targets) {
    var $$ = this,
        mainCandleStickUpdate,
        mainCandleStickEnter,
        classChartCandleStick = $$.classChartCandleStick.bind($$),
        classFocus = $$.classFocus.bind($$),
        classCandleStick = $$.classCandleStick.bind($$),
        classCandleSticks = $$.classCandleSticks.bind($$);

    var candleStickValues = $$.convertTargetsForCandleStick(targets);

    mainCandleStickUpdate = $$.main.select('.' + CLASS.chartCandleSticks).selectAll('.' + CLASS.chartCandleStick)
        .data(candleStickValues.length > 0 ? [{id: 'cs-data', values: candleStickValues}] : null)
        .attr('class', function (d) { return classCandleStick(d) + classFocus(d); });
    mainCandleStickEnter = mainCandleStickUpdate.enter().append('g')
        .attr('class', classChartCandleStick)
        .style('opacity', 0)
        .style('pointer-events', 'none');
    // Candlestick for data
    mainCandleStickEnter.append('g')
        .attr('class', classCandleSticks);
};
// Updating one candle stick
c3_chart_internal_fn.updateCandleStick = function (durationForExit) {
    var $$ = this,
        candleStickData = $$.candleStickData.bind($$),
        classCandleStick = $$.classCandleStick.bind($$),
        classCandleStickShadowUpper = $$.classCandleStickShadowUpper.bind($$),
        classCandleStickShadowLower = $$.classCandleStickShadowLower.bind($$);

    $$.mainCandleStick = $$.main.selectAll('.' + CLASS.candleSticks)
        .selectAll('.' + CLASS.candleStick)
        .data(candleStickData);
    $$.mainCandleStick.enter().append('path')
        .attr('class', classCandleStick)
        .style('fill', function(d) {
            return !!d.csValue && d.csValue.start < d.csValue.end ? 'green' : !!d.csValue && d.csValue.start > d.csValue.end ? 'red' : 'gray';
        });
    $$.mainCandleStick.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();

    $$.mainCandleStickShadowsUpper = $$.main.selectAll('.' + CLASS.candleSticks)
        .selectAll('.' + CLASS.candleStickShadowUpper)
        .data(candleStickData);
    $$.mainCandleStickShadowsUpper.enter()
        .append('path')
        .attr('class', classCandleStickShadowUpper);
    $$.mainCandleStickShadowsUpper.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();

    $$.mainCandleStickShadowsLower = $$.main.selectAll('.' + CLASS.candleSticks)
        .selectAll('.' + CLASS.candleStickShadowLower)
        .data(candleStickData);
    $$.mainCandleStickShadowsLower.enter()
        .append('path')
        .attr('class', classCandleStickShadowLower);
    $$.mainCandleStickShadowsLower.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
};
c3_chart_internal_fn.redrawCandleStick = function (drawCandleStick, withTransition) {
    var $$ = this;
    return [
        (withTransition ? this.mainCandleStick.transition(Math.random().toString()) : this.mainCandleStick)
            .attr('d', drawCandleStick)
            .style('opacity', 1),
        (withTransition ? this.mainCandleStickShadowsUpper.transition(Math.random().toString()) : this.mainCandleStickShadowsUpper)
            .attr('d', $$.generateDrawCandleStickUpperShadow())
            .style('opacity', 1),
        (withTransition ? this.mainCandleStickShadowsLower.transition(Math.random().toString()) : this.mainCandleStickShadowsLower)
            .attr('d', $$.generateDrawCandleStickLowerShadow())
            .style('opacity', 1)
    ];
};
c3_chart_internal_fn.getCandleStickW = function (axis) {
    var $$ = this, config = $$.config,
        w = typeof config.candlestick_width === 'number' ? config.candlestick_width : axis.tickInterval() * config.candlestick_width_ratio;
    return config.candlestick_width_max && w > config.candlestick_width_max ? config.candlestick_width_max : w;
};
c3_chart_internal_fn.getCandleStick = function (i, id) {
    var $$ = this;
    return (id ? $$.main.selectAll('.' + CLASS.candleSticks + $$.getTargetSelectorSuffix(id)) : $$.main)
        .selectAll('.' + CLASS.candleSticks + (isValue(i) ? '-' + i : ''));
};
c3_chart_internal_fn.expandCandleStick = function (i, id, reset) {
    var $$ = this;
    if (reset) { $$.unexpandCandleStick(); }
    $$.getCandleStick(i, id).classed(CLASS.EXPANDED, true);
};
c3_chart_internal_fn.unexpandCandleStick = function (i) {
    var $$ = this;
    $$.getCandleStick(i).classed(CLASS.EXPANDED, false);
};
c3_chart_internal_fn.generateDrawCandleStick = function (candleStickIndices) {
    var $$ = this,
        getPoints = $$.generateGetCandleStickPoints(candleStickIndices);
    return function (d, i) {
        // 8 points describing candlestick chart
        var points = getPoints(d, i);

        if (points[0][1] - points[2][1] < 1) {
            points[2][1] -= 1;
            points[3][1] -= 1;
        }

        var path =
            'M ' + points[0][0] + ',' + points[0][1] + ' ' +
                'L' + points[1][0] + ',' + points[1][1] + ' ' +
                'L' + points[2][0] + ',' + points[2][1] + ' ' +
                'L' + points[3][0] + ',' + points[3][1] + ' ' +
                'z';

        return path;
    };
};
c3_chart_internal_fn.generateDrawCandleStickUpperShadow = function (candleStickIndices) {
    var $$ = this,
        getPoints = $$.generateGetCandleStickPoints(candleStickIndices);
    return function (d, i) {
        // 8 points describing candlestick chart
        var points = getPoints(d, i);

        var path =
            'M ' + points[4][0] + ',' + points[4][1] + ' ' +
                'L' + points[5][0] + ',' + points[5][1];

        return path;
    };
};
c3_chart_internal_fn.generateDrawCandleStickLowerShadow = function (candleStickIndices) {
    var $$ = this,
        getPoints = $$.generateGetCandleStickPoints(candleStickIndices);
    return function (d, i) {
        // 8 points describing candlestick chart
        var points = getPoints(d, i);

        var path =
            'M ' + points[6][0] + ',' + points[6][1] + ' ' +
                'L' + points[7][0] + ',' + points[7][1];

        return path;
    };
};
c3_chart_internal_fn.generateGetCandleStickPoints = function (candleStickIndices, isSub) {
    var $$ = this,
        axis = isSub ? $$.subXAxis : $$.xAxis,
        candleStickW = $$.getCandleStickW(axis),
        candleStickX = $$.getShapeX(candleStickW, 1, {data: 0}, false),
        candleStickY = $$.getShapeY(false),
        candleStickValues = $$.candleStickValues;

    return function (d, i) {
        var value = candleStickValues[i];
        var inc = value.csValue.start < value.csValue.end;
        var min = value.csValue.min,
            max = value.csValue.max,
            end = inc ? value.csValue.end : value.csValue.start,
            start = inc ? value.csValue.start : value.csValue.end;
        var posX = candleStickX({id: 'cs-data', x: value.x}),
            posYMax = candleStickY({id: 'cs-data', x: value.x, value: max}),
            posYMin = candleStickY({id: 'cs-data', x: value.x, value: min}),
            posYStart = candleStickY({id: 'cs-data', x: value.x, value: start}),
            posYEnd = candleStickY({id: 'cs-data', x: value.x, value: end});

        // 8 points that make a candle stick
        return [
            // Body
            [posX, posYEnd],
            [posX + candleStickW, posYEnd],
            [posX + candleStickW, posYStart],
            [posX, posYStart],
            // Upper shadow
            [posX + candleStickW / 2, posYMax],
            [posX + candleStickW / 2, posYEnd],
            // Lower shadow
            [posX + candleStickW / 2, posYStart],
            [posX + candleStickW / 2, posYMin]
        ];
    };
};
c3_chart_internal_fn.isWithinCandleStick = function (that) {
    var mouse = this.d3.mouse(that),
        box = that.getBoundingClientRect(),
        seg0 = that.pathSegList.getItem(0), seg1 = that.pathSegList.getItem(1),
        x = Math.min(seg0.x, seg1.x), y = Math.min(seg0.y, seg1.y),
        w = box.width, h = box.height, offset = 2,
        sx = x - offset, ex = x + w + offset, sy = y + h + offset, ey = y - offset;
    return sx < mouse[0] && mouse[0] < ex && ey < mouse[1] && mouse[1] < sy;
};
