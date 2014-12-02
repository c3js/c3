c3_chart_internal_fn.initEventRect = function () {
    var $$ = this;
    $$.main.select('.' + CLASS.chart).append("g")
        .attr("class", CLASS.eventRects)
        .style('fill-opacity', 0);
};
c3_chart_internal_fn.redrawEventRect = function () {
    var $$ = this, config = $$.config,
        eventRectUpdate, maxDataCountTarget,
        isMultipleX = $$.isMultipleX();

    // rects for mouseover
    var eventRects = $$.main.select('.' + CLASS.eventRects)
            .style('cursor', config.zoom_enabled ? config.axis_rotated ? 'ns-resize' : 'ew-resize' : null)
            .classed(CLASS.eventRectsMultiple, isMultipleX)
            .classed(CLASS.eventRectsSingle, !isMultipleX);

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
    }
    else {
        // Set data and update $$.eventRect
        maxDataCountTarget = $$.getMaxDataCountTarget($$.data.targets);
        eventRects.datum(maxDataCountTarget ? maxDataCountTarget.values : []);
        $$.eventRect = eventRects.selectAll('.' + CLASS.eventRect);
        eventRectUpdate = $$.eventRect.data(function (d) { return d; });
        // enter
        $$.generateEventRectsForSingleX(eventRectUpdate.enter());
        // update
        $$.updateEventRect(eventRectUpdate);
        // exit
        eventRectUpdate.exit().remove();
    }
};
c3_chart_internal_fn.updateEventRect = function (eventRectUpdate) {
    var $$ = this, config = $$.config,
        x, y, w, h, rectW, rectX;

    // set update selection if null
    eventRectUpdate = eventRectUpdate || $$.eventRect.data(function (d) { return d; });

    if ($$.isMultipleX()) {
        // TODO: rotated not supported yet
        x = 0;
        y = 0;
        w = $$.width;
        h = $$.height;
    }
    else {
        if (($$.isCustomX() || $$.isTimeSeries()) && !$$.isCategorized()) {

            // update index for x that is used by prevX and nextX
            $$.updateXs();

            rectW = function (d) {
                var prevX = $$.getPrevX(d.index), nextX = $$.getNextX(d.index);

                // if there this is a single data point make the eventRect full width (or height)
                if (prevX === null && nextX === null) {
                    return config.axis_rotated ? $$.height : $$.width;
                }

                if (prevX === null) { prevX = $$.x.domain()[0]; }
                if (nextX === null) { nextX = $$.x.domain()[1]; }

                return Math.max(0, ($$.x(nextX) - $$.x(prevX)) / 2);
            };
            rectX = function (d) {
                var prevX = $$.getPrevX(d.index), nextX = $$.getNextX(d.index),
                    thisX = $$.data.xs[d.id][d.index];

                // if there this is a single data point position the eventRect at 0
                if (prevX === null && nextX === null) {
                    return 0;
                }

                if (prevX === null) { prevX = $$.x.domain()[0]; }

                return ($$.x(thisX) + $$.x(prevX)) / 2;
            };
        } else {
            rectW = $$.getEventRectWidth();
            rectX = function (d) {
                return $$.x(d.x) - (rectW / 2);
            };
        }
        x = config.axis_rotated ? 0 : rectX;
        y = config.axis_rotated ? rectX : 0;
        w = config.axis_rotated ? $$.width : rectW;
        h = config.axis_rotated ? rectW : $$.height;
    }

    eventRectUpdate
        .attr('class', $$.classEvent.bind($$))
        .attr("x", x)
        .attr("y", y)
        .attr("width", w)
        .attr("height", h);
};
c3_chart_internal_fn.generateEventRectsForSingleX = function (eventRectEnter) {
    var $$ = this, d3 = $$.d3, config = $$.config;
    eventRectEnter.append("rect")
        .attr("class", $$.classEvent.bind($$))
        .style("cursor", config.data_selection_enabled && config.data_selection_grouped ? "pointer" : null)
        .on('mouseover', function (d) {
            var index = d.index, selectedData, newData;

            if ($$.dragging || $$.flowing) { return; } // do nothing while dragging/flowing
            if ($$.hasArcType()) { return; }

            selectedData = $$.data.targets.map(function (t) {
                return $$.addName($$.getValueOnIndex(t.values, index));
            });

            // Sort selectedData as names order
            newData = [];
            Object.keys(config.data_names).forEach(function (id) {
                for (var j = 0; j < selectedData.length; j++) {
                    if (selectedData[j] && selectedData[j].id === id) {
                        newData.push(selectedData[j]);
                        selectedData.shift(j);
                        break;
                    }
                }
            });
            selectedData = newData.concat(selectedData); // Add remained

            // Expand shapes for selection
            if (config.point_focus_expand_enabled) { $$.expandCircles(index, null, true); }
            $$.expandBars(index, null, true);

            // Call event handler
            $$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
                config.data_onmouseover.call($$.api, d);
            });
        })
        .on('mouseout', function (d) {
            var index = d.index;
            if ($$.hasArcType()) { return; }
            $$.hideXGridFocus();
            $$.hideTooltip();
            // Undo expanded shapes
            $$.unexpandCircles();
            $$.unexpandBars();
            // Call event handler
            $$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
                config.data_onmouseout.call($$.api, d);
            });
        })
        .on('mousemove', function (d) {
            var selectedData, index = d.index,
                eventRect = $$.svg.select('.' + CLASS.eventRect + '-' + index);

            if ($$.dragging || $$.flowing) { return; } // do nothing while dragging/flowing
            if ($$.hasArcType()) { return; }

            if ($$.isStepType(d) && $$.config.line_step_type === 'step-after' && d3.mouse(this)[0] < $$.x($$.getXValue(d.id, index))) {
                index -= 1;
            }

            // Show tooltip
            selectedData = $$.filterTargetsToShow($$.data.targets).map(function (t) {
                return $$.addName($$.getValueOnIndex(t.values, index));
            });

            if (config.tooltip_grouped) {
                $$.showTooltip(selectedData, d3.mouse(this));
                $$.showXGridFocus(selectedData);
            }

            if (config.tooltip_grouped && (!config.data_selection_enabled || config.data_selection_grouped)) {
                return;
            }

            $$.main.selectAll('.' + CLASS.shape + '-' + index)
                .each(function () {
                    d3.select(this).classed(CLASS.EXPANDED, true);
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
                })
                .filter(function (d) {
                    return $$.isWithinShape(this, d);
                })
                .each(function (d) {
                    if (config.data_selection_enabled && (config.data_selection_grouped || config.data_selection_isselectable(d))) {
                        eventRect.style('cursor', 'pointer');
                    }
                    if (!config.tooltip_grouped) {
                        $$.showTooltip([d], d3.mouse(this));
                        $$.showXGridFocus([d]);
                        if (config.point_focus_expand_enabled) { $$.expandCircles(index, d.id, true); }
                        $$.expandBars(index, d.id, true);
                    }
                });
        })
        .on('click', function (d) {
            var index = d.index;
            if ($$.hasArcType() || !$$.toggleShape) { return; }
            if ($$.cancelClick) {
                $$.cancelClick = false;
                return;
            }
            if ($$.isStepType(d) && config.line_step_type === 'step-after' && d3.mouse(this)[0] < $$.x($$.getXValue(d.id, index))) {
                index -= 1;
            }
            $$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
                if (config.data_selection_grouped || $$.isWithinShape(this, d)) {
                    $$.toggleShape(this, d, index);
                    $$.config.data_onclick.call($$.api, d, this);
                }
            });
        })
        .call(
            d3.behavior.drag().origin(Object)
                .on('drag', function () { $$.drag(d3.mouse(this)); })
                .on('dragstart', function () { $$.dragstart(d3.mouse(this)); })
                .on('dragend', function () { $$.dragend(); })
        );
};

c3_chart_internal_fn.generateEventRectsForMultipleXs = function (eventRectEnter) {
    var $$ = this, d3 = $$.d3, config = $$.config;

    function mouseout() {
        $$.svg.select('.' + CLASS.eventRect).style('cursor', null);
        $$.hideXGridFocus();
        $$.hideTooltip();
        $$.unexpandCircles();
        $$.unexpandBars();
    }

    eventRectEnter.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', $$.width)
        .attr('height', $$.height)
        .attr('class', CLASS.eventRect)
        .on('mouseout', function () {
            if ($$.hasArcType()) { return; }
            mouseout();
        })
        .on('mousemove', function () {
            var targetsToShow = $$.filterTargetsToShow($$.data.targets);
            var mouse, closest, sameXData, selectedData;

            if ($$.dragging) { return; } // do nothing when dragging
            if ($$.hasArcType(targetsToShow)) { return; }

            mouse = d3.mouse(this);
            closest = $$.findClosestFromTargets(targetsToShow, mouse);

            if ($$.mouseover && (!closest || closest.id !== $$.mouseover.id)) {
                config.data_onmouseout.call($$.api, $$.mouseover);
                $$.mouseover = undefined;
            }

            if (! closest) {
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
            $$.showTooltip(selectedData, mouse);

            // expand points
            if (config.point_focus_expand_enabled) {
                $$.expandCircles(closest.index, closest.id, true);
            }
            $$.expandBars(closest.index, closest.id, true);

            // Show xgrid focus line
            $$.showXGridFocus(selectedData);

            // Show cursor as pointer if point is close to mouse position
            if ($$.isBarType(closest.id) || $$.dist(closest, mouse) < 100) {
                $$.svg.select('.' + CLASS.eventRect).style('cursor', 'pointer');
                if (!$$.mouseover) {
                    config.data_onmouseover.call($$.api, closest);
                    $$.mouseover = closest;
                }
            }
        })
        .on('click', function () {
            var targetsToShow = $$.filterTargetsToShow($$.data.targets);
            var mouse, closest;

            if ($$.hasArcType(targetsToShow)) { return; }

            mouse = d3.mouse(this);
            closest = $$.findClosestFromTargets(targetsToShow, mouse);

            if (! closest) { return; }

            // select if selection enabled
            if ($$.isBarType(closest.id) || $$.dist(closest, mouse) < 100) {
                $$.main.selectAll('.' + CLASS.shapes + $$.getTargetSelectorSuffix(closest.id)).select('.' + CLASS.shape + '-' + closest.index).each(function () {
                    if (config.data_selection_grouped || $$.isWithinShape(this, closest)) {
                        $$.toggleShape(this, closest, closest.index);
                        $$.config.data_onclick.call($$.api, closest, this);
                    }
                });
            }
        })
        .call(
            d3.behavior.drag().origin(Object)
                .on('drag', function () { $$.drag(d3.mouse(this)); })
                .on('dragstart', function () { $$.dragstart(d3.mouse(this)); })
                .on('dragend', function () { $$.dragend(); })
        );
};
c3_chart_internal_fn.dispatchEvent = function (type, index, mouse) {
    var $$ = this,
        selector = '.' + CLASS.eventRect + (!$$.isMultipleX() ? '-' + index : ''),
        eventRect = $$.main.select(selector).node(),
        box = eventRect.getBoundingClientRect(),
        x = box.left + (mouse ? mouse[0] : 0),
        y = box.top + (mouse ? mouse[1] : 0),
        event = document.createEvent("MouseEvents");

    event.initMouseEvent(type, true, true, window, 0, x, y, x, y,
                         false, false, false, false, 0, null);
    eventRect.dispatchEvent(event);
};
