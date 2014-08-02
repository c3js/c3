c3_chart_internal_fn.showXGridFocus = function (selectedData) {
    var $$ = this, config = $$.config,
        dataToShow = selectedData.filter(function (d) { return d && isValue(d.value); });
    if (! config[__tooltip_show]) { return; }
    // Hide when scatter plot exists
    if ($$.hasType('scatter') || $$.hasArcType()) { return; }
    var focusEl = $$.main.selectAll('line.' + CLASS[_xgridFocus]);
    focusEl
        .style("visibility", "visible")
        .data([dataToShow[0]])
        .attr(config[__axis_rotated] ? 'y1' : 'x1', generateCall($$.xx, $$))
        .attr(config[__axis_rotated] ? 'y2' : 'x2', generateCall($$.xx, $$));
    $$.smoothLines(focusEl, 'grid');
};
c3_chart_internal_fn.hideXGridFocus = function () {
    this.main.select('line.' + CLASS[_xgridFocus]).style("visibility", "hidden");
};
c3_chart_internal_fn.updateXgridFocus = function () {
    var $$ = this, config = $$.config;
    $$.main.select('line.' + CLASS[_xgridFocus])
        .attr("x1", config[__axis_rotated] ? 0 : -10)
        .attr("x2", config[__axis_rotated] ? $$.width : -10)
        .attr("y1", config[__axis_rotated] ? -10 : 0)
        .attr("y2", config[__axis_rotated] ? -10 : $$.height);
};
c3_chart_internal_fn.generateGridData = function (type, scale) {
    var $$ = this,
        gridData = [], xDomain, firstYear, lastYear, i,
        tickNum = $$.main.select("." + CLASS[_axisX]).selectAll('.tick').size();
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
            gridData = gridData.filter(function (d) { return ("" + d).indexOf('.') < 0; });
        }
    }
    return gridData;
};
c3_chart_internal_fn.getGridFilterToRemove = function (params) {
    return params ? function (line) {
        var found = false;
        [].concat(params).forEach(function (param) {
            if ((('value' in param && line.value === params.value) || ('class' in param && line.class === params.class))) {
                found = true;
            }
        });
        return found;
    } : function () { return true; };
};
c3_chart_internal_fn.removeGridLines = function (params, forX) {
    var $$ = this, config = $$.config,
        toRemove = $$.getGridFilterToRemove(params),
        toShow = function (line) { return !toRemove(line); },
        classLines = forX ? CLASS[_xgridLines] : CLASS[_ygridLines],
        classLine = forX ? CLASS[_xgridLine] : CLASS.ygridLine;
    $$.main.select('.' + classLines).selectAll('.' + classLine).filter(toRemove)
        .transition().duration(config[__transition_duration])
        .style('opacity', 0).remove();
    if (forX) {
        config[__grid_x_lines] = config[__grid_x_lines].filter(toShow);
    } else {
        config[__grid_y_lines] = config[__grid_y_lines].filter(toShow);
    }
};
