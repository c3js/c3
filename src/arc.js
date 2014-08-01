c3_chart_internal_fn.initPie = function () {
    var $$ = this, d3 = $$.d3, config = $$.config;
    $$.pie = d3.layout.pie().value(function (d) {
        return d.values.reduce(function (a, b) { return a + b.value; }, 0);
    });
    if (!config[__data_order] || !config[__pie_sort] || !config[__donut_sort]) {
        $$.pie.sort(null);
    }
};

c3_chart_internal_fn.updateRadius = function () {
    var $$ = this, config = $$.config,
        w = config[__gauge_width] || config[__donut_width];
    $$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
    $$.radius = $$.radiusExpanded * 0.95;
    $$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
    $$.innerRadius = $$.hasType('donut') || $$.hasType('gauge') ? $$.radius * $$.innerRadiusRatio : 0;
};

c3_chart_internal_fn.updateArc = function () {
    var $$ = this;
    $$.svgArc = $$.getSvgArc();
    $$.svgArcExpanded = $$.getSvgArcExpanded();
    $$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);
};

c3_chart_internal_fn.updateAngle = function (d) {
    var $$ = this, config = $$.config,
        found = false, index = 0;
    $$.pie($$.filterTargetsToShow($$.data.targets)).sort($$.descByStartAngle).forEach(function (t) {
        if (! found && t.data.id === d.data.id) {
            found = true;
            d = t;
            d.index = index;
        }
        index++;
    });
    if (isNaN(d.endAngle)) {
        d.endAngle = d.startAngle;
    }
    if ($$.isGaugeType(d.data)) {
        var gMin = config[__gauge_min], gMax = config[__gauge_max],
            gF = Math.abs(gMin) + gMax,
            aTic = (Math.PI) / gF;
        d.startAngle = (-1 * (Math.PI / 2)) + (aTic * Math.abs(gMin));
        d.endAngle = d.startAngle + (aTic * ((d.value > gMax) ? gMax : d.value));
    }
    return found ? d : null;
};

c3_chart_internal_fn.getSvgArc = function () {
    var $$ = this,
        arc = $$.d3.svg.arc().outerRadius($$.radius).innerRadius($$.innerRadius),
        newArc = function (d, withoutUpdate) {
            var updated;
            if (withoutUpdate) { return arc(d); } // for interpolate
            updated = $$.updateAngle(d);
            return updated ? arc(updated) : "M 0 0";
        };
    // TODO: extends all function
    newArc.centroid = arc.centroid;
    return newArc;
};

c3_chart_internal_fn.getSvgArcExpanded = function (rate) {
    var $$ = this,
        arc = $$.d3.svg.arc().outerRadius($$.radiusExpanded * (rate ? rate : 1)).innerRadius($$.innerRadius);
    return function (d) {
        var updated = $$.updateAngle(d);
        return updated ? arc(updated) : "M 0 0";
    };
};

c3_chart_internal_fn.getArc = function (d, withoutUpdate, force) {
    return force || this.isArcType(d.data) ? this.svgArc(d, withoutUpdate) : "M 0 0";
};


c3_chart_internal_fn.transformForArcLabel = function (d) {
    var $$ = this,
        updated = $$.updateAngle(d), c, x, y, h, ratio, translate = "";
    if (updated && !$$.hasType('gauge')) {
        c = this.svgArc.centroid(updated);
        x = isNaN(c[0]) ? 0 : c[0];
        y = isNaN(c[1]) ? 0 : c[1];
        h = Math.sqrt(x * x + y * y);
        // TODO: ratio should be an option?
        ratio = $$.radius && h ? (36 / $$.radius > 0.375 ? 1.175 - 36 / $$.radius : 0.8) * $$.radius / h : 0;
        translate = "translate(" + (x * ratio) +  ',' + (y * ratio) +  ")";
    }
    return translate;
};

c3_chart_internal_fn.getArcRatio = function (d) {
    var $$ = this,
        whole = $$.hasType('gauge') ? Math.PI : (Math.PI * 2);
    return d ? (d.endAngle - d.startAngle) / whole : null;
};

c3_chart_internal_fn.convertToArcData = function (d) {
    return this.addName({
        id: d.data.id,
        value: d.value,
        ratio: this.getArcRatio(d),
        index: d.index
    });
};

c3_chart_internal_fn.textForArcLabel = function (d) {
    var $$ = this,
        updated, value, ratio, format;
    if (! $$.shouldShowArcLabel()) { return ""; }
    updated = $$.updateAngle(d);
    value = updated ? updated.value : null;
    ratio = $$.getArcRatio(updated);
    if (! $$.hasType('gauge') && ! $$.meetsArcLabelThreshold(ratio)) { return ""; }
    format = $$.getArcLabelFormat();
    return format ? format(value, ratio) : $$.defaultArcValueFormat(value, ratio);
};

c3_chart_internal_fn.expandArc = function (id, withoutFadeOut) {
    var $$ = this,
        target = $$.svg.selectAll('.' + CLASS[_chartArc] + $$.selectorTarget(id)),
        noneTargets = $$.svg.selectAll('.' + CLASS[_arc]).filter(function (data) { return data.data.id !== id; });

    if ($$.shouldExpand(id)) {
        target.selectAll('path')
            .transition().duration(50)
            .attr("d", $$.svgArcExpanded)
            .transition().duration(100)
            .attr("d", $$.svgArcExpandedSub)
            .each(function (d) {
                if ($$.isDonutType(d.data)) {
                    // callback here
                }
            });
    }
    if (!withoutFadeOut) {
        noneTargets.style("opacity", 0.3);
    }
};

c3_chart_internal_fn.unexpandArc = function (id) {
    var $$ = this,
        target = $$.svg.selectAll('.' + CLASS[_chartArc] + $$.selectorTarget(id));
    target.selectAll('path.' + CLASS[_arc])
        .transition().duration(50)
        .attr("d", $$.svgArc);
    $$.svg.selectAll('.' + CLASS[_arc])
        .style("opacity", 1);
};

c3_chart_internal_fn.shouldExpand = function (id) {
    var $$ = this, config = $$.config;
    return ($$.isDonutType(id) && config[__donut_expand]) || ($$.isGaugeType(id) && config[__gauge_expand]) || ($$.isPieType(id) && config[__pie_expand]);
};

c3_chart_internal_fn.shouldShowArcLabel = function () {
    var $$ = this, config = $$.config, shouldShow = true;
    if ($$.hasType('donut')) {
        shouldShow = config[__donut_label_show];
    } else if ($$.hasType('pie')) {
        shouldShow = config[__pie_label_show];
    }
    // when gauge, always true
    return shouldShow;
};

c3_chart_internal_fn.meetsArcLabelThreshold = function (ratio) {
    var $$ = this, config = $$.config,
        threshold = $$.hasType('donut') ? config[__donut_label_threshold] : config[__pie_label_threshold];
    return ratio >= threshold;
};

c3_chart_internal_fn.getArcLabelFormat = function () {
    var $$ = this, config = $$.config,
        format = config[__pie_label_format];
    if ($$.hasType('gauge')) {
        format = config[__gauge_label_format];
    } else if ($$.hasType('donut')) {
        format = config[__donut_label_format];
    }
    return format;
};

c3_chart_internal_fn.getArcTitle = function () {
    var $$ = this;
    return $$.hasType('donut') ? $$.config[__donut_title] : "";
};

c3_chart_internal_fn.descByStartAngle = function (a, b) {
    return a.startAngle - b.startAngle;
};

c3_chart_internal_fn.updateTargetsForArc = function (targets) {
    var $$ = this, main = $$.main, mainPieUpdate, mainPieEnter;
    mainPieUpdate = main.select('.' + CLASS[_chartArcs]).selectAll('.' + CLASS[_chartArc])
        .data($$.pie(targets))
        .attr("class", generateCall($$.classChartArc, $$));
    mainPieEnter = mainPieUpdate.enter().append("g")
        .attr("class", generateCall($$.classChartArc, $$));
    mainPieEnter.append('g')
        .attr('class', generateCall($$.classArcs, $$));
    mainPieEnter.append("text")
        .attr("dy", $$.hasType('gauge') ? "-0.35em" : ".35em")
        .style("opacity", 0)
        .style("text-anchor", "middle")
        .style("pointer-events", "none");
    // MEMO: can not keep same color..., but not bad to update color in redraw
    //mainPieUpdate.exit().remove();
};

c3_chart_internal_fn.initArc = function () {
    var $$ = this;
    $$.arcs = $$.main.select('.' + CLASS[_chart]).append("g")
        .attr("class", CLASS[_chartArcs])
        .attr("transform", $$.getTranslate('arc'));
    $$.arcs.append('text')
        .attr('class', CLASS[_chartArcsTitle])
        .style("text-anchor", "middle")
        .text($$.getArcTitle());
};

c3_chart_internal_fn.redrawArc = function (duration, durationForExit, withTransform) {
    var $$ = this, d3 = $$.d3, config = $$.config, main = $$.main,
        mainArc;
    mainArc = main.selectAll('.' + CLASS[_arcs]).selectAll('.' + CLASS[_arc])
        .data(generateCall($$.arcData, $$));
    mainArc.enter().append('path')
        .attr("class", generateCall($$.classArc, $$))
        .style("fill", function (d) { return $$.color(d.data); })
        .style("cursor", function (d) { return config[__data_selection_isselectable](d) ? "pointer" : null; })
        .style("opacity", 0)
        .each(function (d) {
            if ($$.isGaugeType(d.data)) {
                d.startAngle = d.endAngle = -1 * (Math.PI / 2);
            }
            this._current = d;
        })
        .on('mouseover', function (d) {
            var updated, arcData;
            if ($$.transiting) { // skip while transiting
                return;
            }
            updated = $$.updateAngle(d);
            arcData = $$.convertToArcData(updated);
            // transitions
            $$.expandArc(updated.data.id);
            $$.toggleFocusLegend(updated.data.id, true);
            $$.config[__data_onmouseover](arcData, this);
        })
        .on('mousemove', function (d) {
            var updated = $$.updateAngle(d),
                arcData = $$.convertToArcData(updated),
                selectedData = [arcData];
            $$.showTooltip(selectedData, d3.mouse(this));
        })
        .on('mouseout', function (d) {
            var updated, arcData;
            if ($$.transiting) { // skip while transiting
                return;
            }
            updated = $$.updateAngle(d);
            arcData = $$.convertToArcData(updated);
            // transitions
            $$.unexpandArc(updated.data.id);
            $$.revertLegend();
            $$.hideTooltip();
            $$.config[__data_onmouseout](arcData, this);
        })
        .on('click', function (d, i) {
            var updated, arcData;
            if (!$$.toggleShape) {
                return;
            }
            updated = $$.updateAngle(d);
            arcData = $$.convertToArcData(updated);
            $$.toggleShape(this, arcData, i); // onclick called in toogleShape()
        });
    mainArc
        .attr("transform", function (d) { return !$$.isGaugeType(d.data) && withTransform ? "scale(0)" : ""; })
        .style("opacity", function (d) { return d === this._current ? 0 : 1; })
        .each(function () { $$.transiting = true; })
        .transition().duration(duration)
        .attrTween("d", function (d) {
            var updated = $$.updateAngle(d), interpolate;
            if (! updated) {
                return function () { return "M 0 0"; };
            }
            //                if (this._current === d) {
            //                    this._current = {
            //                        startAngle: Math.PI*2,
            //                        endAngle: Math.PI*2,
            //                    };
            //                }
            if (isNaN(this._current.endAngle)) {
                this._current.endAngle = this._current.startAngle;
            }
            interpolate = d3.interpolate(this._current, updated);
            this._current = interpolate(0);
            return function (t) { return $$.getArc(interpolate(t), true); };
        })
        .attr("transform", withTransform ? "scale(1)" : "")
        .style("fill", function (d) {
            return $$.levelColor ? $$.levelColor(d.data.values[0].value) : $$.color(d.data.id);
        }) // Where gauge reading color would receive customization.
        .style("opacity", 1)
        .call($$.endall, function () {
            $$.transiting = false;
        });
    mainArc.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
    main.selectAll('.' + CLASS[_chartArc]).select('text')
        .style("opacity", 0)
        .attr('class', function (d) { return $$.isGaugeType(d.data) ? CLASS[_gaugeValue] : ''; })
        .text(generateCall($$.textForArcLabel, $$))
        .attr("transform", generateCall($$.transformForArcLabel, $$))
        .transition().duration(duration)
        .style("opacity", function (d) { return $$.isTargetToShow(d.data.id) && $$.isArcType(d.data) ? 1 : 0; });
    main.select('.' + CLASS[_chartArcsTitle])
        .style("opacity", $$.hasType('donut') || $$.hasType('gauge') ? 1 : 0);

};
c3_chart_internal_fn.initGauge = function () {
    var $$ = this, config = $$.config, arcs = $$.arcs;
    if ($$.hasType('gauge')) {
        arcs.append('path')
            .attr("class", CLASS[_chartArcsBackground])
            .attr("d", function () {
                var d = {
                    data: [{value: config[__gauge_max]}],
                    startAngle: -1 * (Math.PI / 2),
                    endAngle: Math.PI / 2
                };
                return $$.getArc(d, true, true);
            });
        arcs.append("text")
            .attr("dy", ".75em")
            .attr("class", CLASS[_chartArcsGaugeUnit])
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .text(config[__gauge_label_show] ? config[__gauge_units] : '');
        arcs.append("text")
            .attr("dx", -1 * ($$.innerRadius + (($$.radius - $$.innerRadius) / 2)) + "px")
            .attr("dy", "1.2em")
            .attr("class", CLASS[_chartArcsGaugeMin])
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .text(config[__gauge_label_show] ? config[__gauge_min] : '');
        arcs.append("text")
            .attr("dx", $$.innerRadius + (($$.radius - $$.innerRadius) / 2) + "px")
            .attr("dy", "1.2em")
            .attr("class", CLASS[_chartArcsGaugeMax])
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .text(config[__gauge_label_show] ? config[__gauge_max] : '');
    }
};
