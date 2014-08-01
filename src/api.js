c3_chart_fn.focus = function (targetId) {
    var $$ = this.internal,
        candidates = $$.svg.selectAll($$.selectorTarget(targetId)),
        candidatesForNoneArc = candidates.filter(generateCall($$.isNoneArc, $$)),
        candidatesForArc = candidates.filter(generateCall($$.isArc, $$));
    function focus(targets) {
        $$.filterTargetsToShow(targets).transition().duration(100).style('opacity', 1);
    }
    this.revert();
    this.defocus();
    focus(candidatesForNoneArc.classed(CLASS[_focused], true));
    focus(candidatesForArc);
    if ($$.hasArcType()) {
        $$.expandArc(targetId, true);
    }
    $$.toggleFocusLegend(targetId, true);
};

c3_chart_fn.defocus = function (targetId) {
    var $$ = this.internal,
        candidates = $$.svg.selectAll($$.selectorTarget(targetId)),
        candidatesForNoneArc = candidates.filter(generateCall($$.isNoneArc, $$)),
        candidatesForArc = candidates.filter(generateCall($$.isArc, $$));
    function defocus(targets) {
        $$.filterTargetsToShow(targets).transition().duration(100).style('opacity', 0.3);
    }
    this.revert();
    defocus(candidatesForNoneArc.classed(CLASS[_focused], false));
    defocus(candidatesForArc);
    if ($$.hasArcType()) {
        $$.unexpandArc(targetId);
    }
    $$.toggleFocusLegend(targetId, false);
};

c3_chart_fn.revert = function (targetId) {
    var $$ = this.internal,
        candidates = $$.svg.selectAll($$.selectorTarget(targetId)),
        candidatesForNoneArc = candidates.filter(generateCall($$.isNoneArc, $$)),
        candidatesForArc = candidates.filter(generateCall($$.isArc, $$));
    function revert(targets) {
        $$.filterTargetsToShow(targets).transition().duration(100).style('opacity', 1);
    }
    revert(candidatesForNoneArc.classed(CLASS[_focused], false));
    revert(candidatesForArc);
    if ($$.hasArcType()) {
        $$.unexpandArc(targetId);
    }
    $$.revertLegend();
};

c3_chart_fn.show = function (targetIds, options) {
    var $$ = this.internal;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.removeHiddenTargetIds(targetIds);
    $$.svg.selectAll($$.selectorTargets(targetIds))
        .transition()
        .style('opacity', 1);

    if (options.withLegend) {
        $$.showLegend(targetIds);
    }

    $$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true});
};

c3_chart_fn.hide = function (targetIds, options) {
    var $$ = this.internal;

    targetIds = $$.mapToTargetIds(targetIds);
    options = options || {};

    $$.addHiddenTargetIds(targetIds);
    $$.svg.selectAll($$.selectorTargets(targetIds))
        .transition()
        .style('opacity', 0);

    if (options.withLegend) {
        $$.hideLegend(targetIds);
    }

    $$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true});
};

c3_chart_fn.toggle = function (targetId) {
    var $$ = this.internal;
    $$.isTargetToShow(targetId) ? this.hide(targetId) : this.show(targetId);
};

c3_chart_fn.zoom = function () {
};
c3_chart_fn.zoom.enable = function (enabled) {
    var $$ = this.internal;
    $$.config[__zoom_enabled] = enabled;
    $$.updateAndRedraw();
};
c3_chart_fn.unzoom = function () {
    var $$ = this.internal;
    $$.brush.clear().update();
    $$.redraw({withUpdateXDomain: true});
};

c3_chart_fn.load = function (args) {
    var $$ = this.internal, config = $$.config;
    // update xs if specified
    if (args.xs) {
        $$.addXs(args.xs);
    }
    // update classes if exists
    if ('classes' in args) {
        Object.keys(args.classes).forEach(function (id) {
            config[__data_classes][id] = args.classes[id];
        });
    }
    // update categories if exists
    if ('categories' in args && $$.isCategorized()) {
        config[__axis_x_categories] = args.categories;
    }
    // use cache if exists
    if ('cacheIds' in args && $$.hasCaches(args.cacheIds)) {
        $$.load($$.getCaches(args.cacheIds), args.done);
        return;
    }
    // unload if needed
    if ('unload' in args) {
        // TODO: do not unload if target will load (included in url/rows/columns)
        $$.unload($$.mapToTargetIds((typeof args.unload === 'boolean' && args.unload) ? null : args.unload), function () {
            $$.loadFromArgs(args);
        });
    } else {
        $$.loadFromArgs(args);
    }
};

c3_chart_fn.unload = function (args) {
    var $$ = this.internal;
    args = args || {};
    $$.unload($$.mapToTargetIds(args.ids), function () {
        $$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true});
        if (isFunction(args.done)) { args.done(); }
    });
};

c3_chart_fn.flow = function (args) {
    var $$ = this.internal,
        targets, data, notfoundIds = [], orgDataCount = $$.getMaxDataCount(),
        dataCount, domain, baseTarget, baseValue, length = 0, tail = 0, diff, to;

    if (args.json) {
        data = $$.convertJsonToData(args.json, args.keys);
    }
    else if (args.rows) {
        data = $$.convertRowsToData(args.rows);
    }
    else if (args.columns) {
        data = $$.convertColumnsToData(args.columns);
    }
    else {
        return;
    }
    targets = $$.convertDataToTargets(data, true);

    // Update/Add data
    $$.data.targets.forEach(function (t) {
        var found = false, i, j;
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
        if (!found) { notfoundIds.push(t.id); }
    });

    // Append null for not found targets
    $$.data.targets.forEach(function (t) {
        var i, j;
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
            var i, missing = [];
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
    if (isDefined(args.to)) {
        length = 0;
        to = $$.isTimeSeries() ? $$.parseDate(args.to) : args.to;
        baseTarget.values.forEach(function (v) {
            if (v.x < to) { length++; }
        });
    } else if (isDefined(args.length)) {
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
        $$.updateXDomain(null, true, true, domain);
    } else if (orgDataCount === 1) {
        if ($$.isTimeSeries()) {
            diff = (baseTarget.values[baseTarget.values.length - 1].x - baseValue.x) / 2;
            domain = [new Date(+baseValue.x - diff), new Date(+baseValue.x + diff)];
            $$.updateXDomain(null, true, true, domain);
        }
    }

    // Set targets
    $$.updateTargets($$.data.targets);

    // Redraw with new targets
    $$.redraw({
        flow: {
            index: baseValue.index,
            length: length,
            duration: isValue(args.duration) ? args.duration : $$.config[__transition_duration],
            done: args.done,
            orgDataCount: orgDataCount,
        },
        withLegend: true,
        withTransition: orgDataCount > 1,
    });
};

c3_chart_fn.selected = function (targetId) {
    var $$ = this.internal, d3 = $$.d3;
    return d3.merge(
        $$.main.selectAll('.' + CLASS[_shapes] + $$.getTargetSelectorSuffix(targetId)).selectAll('.' + CLASS[_shape])
            .filter(function () { return d3.select(this).classed(CLASS[_SELECTED]); })
            .map(function (d) { return d.map(function (d) { var data = d.__data__; return data.data ? data.data : data; }); })
    );
};
c3_chart_fn.select = function (ids, indices, resetOther) {
    var $$ = this.internal, d3 = $$.d3, config = $$.config;
    if (! config[__data_selection_enabled]) { return; }
    $$.main.selectAll('.' + CLASS[_shapes]).selectAll('.' + CLASS[_shape]).each(function (d, i) {
        var shape = d3.select(this), id = d.data ? d.data.id : d.id, toggle = $$.getToggle(this),
            isTargetId = config[__data_selection_grouped] || !ids || ids.indexOf(id) >= 0,
            isTargetIndex = !indices || indices.indexOf(i) >= 0,
            isSelected = shape.classed(CLASS[_SELECTED]);
        // line/area selection not supported yet
        if (shape.classed(CLASS[_line]) || shape.classed(CLASS[_area])) {
            return;
        }
        if (isTargetId && isTargetIndex) {
            if (config[__data_selection_isselectable](d) && !isSelected) {
                toggle(true, shape.classed(CLASS[_SELECTED], true), d, i);
            }
        } else if (isDefined(resetOther) && resetOther) {
            if (isSelected) {
                toggle(false, shape.classed(CLASS[_SELECTED], false), d, i);
            }
        }
    });
};
c3_chart_fn.unselect = function (ids, indices) {
    var $$ = this.internal, d3 = $$.d3, config = $$.config;
    if (! config[__data_selection_enabled]) { return; }
    $$.main.selectAll('.' + CLASS[_shapes]).selectAll('.' + CLASS[_shape]).each(function (d, i) {
        var shape = d3.select(this), id = d.data ? d.data.id : d.id, toggle = $$.getToggle(this),
            isTargetId = config[__data_selection_grouped] || !ids || ids.indexOf(id) >= 0,
            isTargetIndex = !indices || indices.indexOf(i) >= 0,
            isSelected = shape.classed(CLASS[_SELECTED]);
        // line/area selection not supported yet
        if (shape.classed(CLASS[_line]) || shape.classed(CLASS[_area])) {
            return;
        }
        if (isTargetId && isTargetIndex) {
            if (config[__data_selection_isselectable](d)) {
                if (isSelected) {
                    toggle(false, shape.classed(CLASS[_SELECTED], false), d, i);
                }
            }
        }
    });
};

c3_chart_fn.transform = function (type, targetIds) {
    var $$ = this.internal,
        options = ['pie', 'donut'].indexOf(type) >= 0 ? {withTransform: true} : null;
    $$.transformTo(targetIds, type, options);
};

c3_chart_fn.groups = function (groups) {
    var $$ = this.internal, config = $$.config;
    if (isUndefined(groups)) { return config[__data_groups]; }
    config[__data_groups] = groups;
    $$.redraw();
    return config[__data_groups];
};

c3_chart_fn.xgrids = function (grids) {
    var $$ = this.internal, config = $$.config;
    if (! grids) { return config[__grid_x_lines]; }
    config[__grid_x_lines] = grids;
    $$.redraw();
    return config[__grid_x_lines];
};
c3_chart_fn.xgrids.add = function (grids) {
    var $$ = this.internal;
    return this.xgrids($$.config[__grid_x_lines].concat(grids ? grids : []));
};
c3_chart_fn.xgrids.remove = function (params) { // TODO: multiple
    var $$ = this.internal;
    $$.removeGridLines(params, true);
};

c3_chart_fn.ygrids = function (grids) {
    var $$ = this.internal, config = $$.config;
    if (! grids) { return config[__grid_y_lines]; }
    config[__grid_y_lines] = grids;
    $$.redraw();
    return config[__grid_y_lines];
};
c3_chart_fn.ygrids.add = function (grids) {
    var $$ = this.internal;
    return c3.ygrids($$.config[__grid_y_lines].concat(grids ? grids : []));
};
c3_chart_fn.ygrids.remove = function (params) { // TODO: multiple
    var $$ = this.internal;
    $$.removeGridLines(params, false);
};

c3_chart_fn.regions = function (regions) {
    var $$ = this.internal, config = $$.config;
    if (!regions) { return config[__regions]; }
    config[__regions] = regions;
    $$.redraw();
    return config[__regions];
};
c3_chart_fn.regions.add = function (regions) {
    var $$ = this.internal, config = $$.config;
    if (!regions) { return config[__regions]; }
    config[__regions] = config[__regions].concat(regions);
    $$.redraw();
    return config[__regions];
};
c3_chart_fn.regions.remove = function (options) {
    var $$ = this.internal, config = $$.config,
        duration, classes, regions;

    options = options || {};
    duration = $$.getOption(options, "duration", config[__transition_duration]);
    classes = $$.getOption(options, "classes", [CLASS[_region]]);

    regions = $$.main.select('.' + CLASS[_regions]).selectAll(classes.map(function (c) { return '.' + c; }));
    (duration ? regions.transition().duration(duration) : regions)
        .style('opacity', 0)
        .remove();

    config[__regions] = config[__regions].filter(function (region) {
        var found = false;
        if (!region.class) {
            return true;
        }
        region.class.split(' ').forEach(function (c) {
            if (classes.indexOf(c) >= 0) { found = true; }
        });
        return !found;
    });

    return config[__regions];
};

c3_chart_fn.data = function () {
};
c3_chart_fn.data.get = function (targetId) {
    var target = this.data.getAsTarget(targetId);
    return isDefined(target) ? target.values.map(function (d) { return d.value; }) : undefined;
};
c3_chart_fn.data.getAsTarget = function (targetId) {
    var targets = this.data.targets.filter(function (t) { return t.id === targetId; });
    return targets.length > 0 ? targets[0] : undefined;
};
c3_chart_fn.data.names = function (names) {
    var $$ = this.internal, config = $$.config;
    if (!arguments.length) { return config[__data_names]; }
    Object.keys(names).forEach(function (id) {
        config[__data_names][id] = names[id];
    });
    $$.redraw({withLegend: true});
    return config[__data_names];
};
c3_chart_fn.data.colors = function (colors) {
    var $$ = this.internal, config = $$.config;
    if (!arguments.length) { return config[__data_colors]; }
    Object.keys(colors).forEach(function (id) {
        config[__data_colors][id] = colors[id];
    });
    $$.redraw({withLegend: true});
    return config[__data_colors];
};
c3_chart_fn.category = function (i, category) {
    var $$ = this.internal, config = $$.config;
    if (arguments.length > 1) {
        config[__axis_x_categories][i] = category;
        $$.redraw();
    }
    return config[__axis_x_categories][i];
};
c3_chart_fn.categories = function (categories) {
    var $$ = this.internal, config = $$.config;
    if (!arguments.length) { return config[__axis_x_categories]; }
    config[__axis_x_categories] = categories;
    $$.redraw();
    return config[__axis_x_categories];
};

// TODO: fix
c3_chart_fn.color = function (id) {
    var $$ = this.internal;
    return $$.color(id); // more patterns
};

c3_chart_fn.x = function (x) {
    var $$ = this.internal;
    if (arguments.length) {
        $$.updateTargetX($$.data.targets, x);
        $$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});
    }
    return $$.data.xs;
};
c3_chart_fn.xs = function (xs) {
    var $$ = this.internal;
    if (arguments.length) {
        $$.updateTargetXs($$.data.targets, xs);
        $$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});
    }
    return $$.data.xs;
};


c3_chart_fn.axis = function () {
};
c3_chart_fn.axis.labels = function (labels) {
    var $$ = this.internal;
    if (arguments.length) {
        Object.keys(labels).forEach(function (axisId) {
            $$.setAxisLabelText(axisId, labels[axisId]);
        });
        $$.updateAxisLabels();
    }
    // TODO: return some values?
};
c3_chart_fn.axis.max = function (max) {
    var $$ = this.internal, config = $$.config;
    if (arguments.length) {
        if (typeof max === 'object') {
            if (isValue(max.x)) { config[__axis_x_max] = max.x; }
            if (isValue(max.y)) { config[__axis_y_max] = max.y; }
            if (isValue(max.y2)) { config[__axis_y2_max] = max.y2; }
        } else {
            config[__axis_y_max] = config[__axis_y2_max] = max;
        }
        $$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});
    }
};
c3_chart_fn.axis.min = function (min) {
    var $$ = this.internal, config = $$.config;
    if (arguments.length) {
        if (typeof min === 'object') {
            if (isValue(min.x)) { config[__axis_x_min] = min.x; }
            if (isValue(min.y)) { config[__axis_y_min] = min.y; }
            if (isValue(min.y2)) { config[__axis_y2_min] = min.y2; }
        } else {
            config[__axis_y_min] = config[__axis_y2_min] = min;
        }
        $$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});
    }
};
c3_chart_fn.axis.range = function (range) {
    if (arguments.length) {
        if (isDefined(range.max)) { this.axis.max(range.max); }
        if (isDefined(range.min)) { this.axis.min(range.min); }
    }
};


c3_chart_fn.legend = function () {
};
c3_chart_fn.legend.show = function (targetIds) {
    var $$ = this.internal;
    $$.showLegend($$.mapToTargetIds(targetIds));
    $$.updateAndRedraw({withLegend: true});
};
c3_chart_fn.legend.hide = function (targetIds) {
    var $$ = this.internal;
    $$.hideLegend($$.mapToTargetIds(targetIds));
    $$.updateAndRedraw({withLegend: true});
};

c3_chart_fn.resize = function (size) {
    var $$ = this.internal, config = $$.config;
    config[__size_width] = size ? size.width : null;
    config[__size_height] = size ? size.height : null;
    this.flush();
};

c3_chart_fn.flush = function () {
    var $$ = this.internal;
    $$.updateAndRedraw({withLegend: true, withTransition: false, withTransitionForTransform: false});
};

c3_chart_fn.destroy = function () {
    var $$ = this.internal;
    $$.data.targets = undefined;
    $$.data.xs = {};
    $$.selectChart.classed('c3', false).html("");
    window.onresize = null;
};
