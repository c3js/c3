c3_chart_internal_fn.selectPoint = function (target, d, i) {
    var $$ = this, config = $$.config,
        cx = (config.axis_rotated ? $$.circleY : $$.circleX).bind($$),
        cy = (config.axis_rotated ? $$.circleX : $$.circleY).bind($$),
        r = $$.pointSelectR.bind($$);
    config.data_onselected.call($$.api, d, target.node());
    // add selected-circle on low layer g
    $$.main.select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.selectedCircle + '-' + i)
        .data([d])
        .enter().append('circle')
        .attr("class", function () { return $$.generateClass(CLASS.selectedCircle, i); })
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("stroke", function () { return $$.color(d); })
        .attr("r", function (d) { return $$.pointSelectR(d) * 1.4; })
        .transition().duration(100)
        .attr("r", r);
};
c3_chart_internal_fn.unselectPoint = function (target, d, i) {
    var $$ = this;
    $$.config.data_onunselected(d, target.node());
    // remove selected-circle from low layer g
    $$.main.select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.selectedCircle + '-' + i)
        .transition().duration(100).attr('r', 0)
        .remove();
};
c3_chart_internal_fn.togglePoint = function (selected, target, d, i) {
    selected ? this.selectPoint(target, d, i) : this.unselectPoint(target, d, i);
};
c3_chart_internal_fn.selectBar = function (target, d) {
    var $$ = this;
    $$.config.data_onselected.call($$, d, target.node());
    target.transition().duration(100)
        .style("fill", function () { return $$.d3.rgb($$.color(d)).brighter(0.75); });
};
c3_chart_internal_fn.unselectBar = function (target, d) {
    var $$ = this;
    $$.config.data_onunselected.call($$, d, target.node());
    target.transition().duration(100)
        .style("fill", function () { return $$.color(d); });
};
c3_chart_internal_fn.toggleBar = function (selected, target, d, i) {
    selected ? this.selectBar(target, d, i) : this.unselectBar(target, d, i);
};
c3_chart_internal_fn.toggleArc = function (selected, target, d, i) {
    this.toggleBar(selected, target, d.data, i);
};
c3_chart_internal_fn.getToggle = function (that) {
    var $$ = this;
    // path selection not supported yet
    return that.nodeName === 'circle' ? $$.togglePoint : ($$.d3.select(that).classed(CLASS.bar) ? $$.toggleBar : $$.toggleArc);
};
c3_chart_internal_fn.toggleShape = function (that, d, i) {
    var $$ = this, d3 = $$.d3, config = $$.config,
        shape = d3.select(that), isSelected = shape.classed(CLASS.SELECTED), isWithin, toggle;
    if (that.nodeName === 'circle') {
        isWithin = $$.isWithinCircle(that, $$.pointSelectR(d) * 1.5);
        toggle = $$.togglePoint;
    }
    else if (that.nodeName === 'path') {
        if (shape.classed(CLASS.bar)) {
            isWithin = $$.isWithinBar(that);
            toggle = $$.toggleBar;
        } else { // would be arc
            isWithin = true;
            toggle = $$.toggleArc;
        }
    }
    if (config.data_selection_grouped || isWithin) {
        if (config.data_selection_enabled && config.data_selection_isselectable(d)) {
            if (!config.data_selection_multiple) {
                $$.main.selectAll('.' + CLASS.shapes + (config.data_selection_grouped ? $$.getTargetSelectorSuffix(d.id) : "")).selectAll('.' + CLASS.shape).each(function (d, i) {
                    var shape = d3.select(this);
                    if (shape.classed(CLASS.SELECTED)) { toggle.call($$, false, shape.classed(CLASS.SELECTED, false), d, i); }
                });
            }
            shape.classed(CLASS.SELECTED, !isSelected);
            toggle.call($$, !isSelected, shape, d, i);
        }
        $$.config.data_onclick.call($$.api, d, that);
    }
};
