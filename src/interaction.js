import CLASS from './class';
import { c3_chart_internal_fn } from './core';

c3_chart_internal_fn.initEventRect = function () {
    var $$ = this, config = $$.config;

    $$.main.select('.' + CLASS.chart).append("g")
        .attr("class", CLASS.eventRects)
        .style('fill-opacity', 0);
    $$.eventRect = $$.main.select('.' + CLASS.eventRects).append('rect')
        .attr('class', CLASS.eventRect);

    // event rect handle zoom event as well
    if (config.zoom_enabled && $$.zoom) {
        $$.eventRect.call($$.zoom).on("dblclick.zoom", null);
        if (config.zoom_initialRange) {
            // WORKAROUND: Add transition to apply transform immediately when no subchart
            $$.eventRect.transition().duration(0).call(
                $$.zoom.transform, $$.zoomTransform(config.zoom_initialRange)
            );
        }
    }

    eventRectUpdate
        .attr('class', $$.classEvent.bind($$))
        .attr("x", x)
        .attr("y", y)
        .attr("width", w)
        .attr("height", h);
};
c3_chart_internal_fn.generateEventRectsForSingleX = function (eventRectEnter) {
    var $$ = this, d3 = $$.d3, config = $$.config,
        tap = false, tapX;

    function click(shape, d) {
        var index = d.index;
        if ($$.hasArcType() || !$$.toggleShape) { return; }
        if ($$.cancelClick) {
            $$.cancelClick = false;
            return;
        }
        if ($$.isStepType(d) && config.line_step_type === 'step-after' && d3.mouse(shape)[0] < $$.x($$.getXValue(d.id, index))) {
            index -= 1;
        }
        $$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
            if (config.data_selection_grouped || $$.isWithinShape(this, d)) {
                $$.toggleShape(this, d, index);
                $$.config.data_onclick.call($$.api, d, this);
            }
        });
    }

    eventRectEnter.append("rect")
        .attr("class", $$.classEvent.bind($$))
        .style("cursor", config.data_selection_enabled && config.data_selection_grouped ? "pointer" : null)
        .on('mouseover', function (d) {
            var index = d.index;

            if ($$.dragging || $$.flowing) { return; } // do nothing while dragging/flowing
            if ($$.hasArcType()) { return; }

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
            if (!$$.config) { return; } // chart is destroyed
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
                $$.showTooltip(selectedData, this);
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
                        $$.showTooltip([d], this);
                        $$.showXGridFocus([d]);
                        if (config.point_focus_expand_enabled) { $$.expandCircles(index, d.id, true); }
                        $$.expandBars(index, d.id, true);
                    }
                });
        })
        .on('click', function (d) {
            //click event was simulated via a 'tap' touch event, cancel regular click
            if (tap) {
                return;
            }

            click(this, d);

        })
        .on('touchstart', function(d) {
            //store current X selection for comparison during touch end event
            tapX = d.x;
        })
        .on('touchend', function(d) {
            var finalX = d.x;

            //If end is not the same as the start, event doesn't count as a tap
            if (tapX !== finalX) {
                return;
            }


            click(this, d);

            //indictate tap event fired to prevent click;
            tap = true;
            setTimeout(function() { tap = false; }, config.touch_tap_delay);
        })

        .call(
            config.data_selection_draggable && $$.drag ? (
                d3.behavior.drag().origin(Object)
                    .on('drag', function () { $$.drag(d3.mouse(this)); })
                    .on('dragstart', function () { $$.dragstart(d3.mouse(this)); })
                    .on('dragend', function () { $$.dragend(); })
            ) : function () {}
        );
};
c3_chart_internal_fn.redrawEventRect = function () {
    var $$ = this, d3 = $$.d3, config = $$.config,
        x, y, w, h;

c3_chart_internal_fn.generateEventRectsForMultipleXs = function (eventRectEnter) {
    var $$ = this, d3 = $$.d3, config = $$.config,
        tap = false, tapX, tapY;

    function mouseout() {
        $$.svg.select('.' + CLASS.eventRect).style('cursor', null);
        $$.hideXGridFocus();
        $$.hideTooltip();
        $$.unexpandCircles();
        $$.unexpandBars();
    }

    function click(shape) {
        var targetsToShow = $$.filterTargetsToShow($$.data.targets);
        var mouse, closest;
        if ($$.hasArcType(targetsToShow)) { return; }

        mouse = d3.mouse(shape);
        closest = $$.findClosestFromTargets(targetsToShow, mouse);
        if (! closest) { return; }
        // select if selection enabled
        if ($$.isBarType(closest.id) || $$.dist(closest, mouse) < config.point_sensitivity) {
            $$.main.selectAll('.' + CLASS.shapes + $$.getTargetSelectorSuffix(closest.id)).selectAll('.' + CLASS.shape + '-' + closest.index).each(function () {
                if (config.data_selection_grouped || $$.isWithinShape(this, closest)) {
                    $$.toggleShape(this, closest, closest.index);
                    $$.config.data_onclick.call($$.api, closest, this);
                }
            });
        }
    }

    eventRectEnter.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', $$.width)
        .attr('height', $$.height)
        .attr('class', CLASS.eventRect)
        .on('mouseout', function () {
            if (!$$.config) { return; } // chart is destroyed
            if ($$.hasArcType()) { return; }
            mouseout();
        } : null)
        .on('mousemove', config.interaction_enabled ? function () {
            var targetsToShow, mouse, closest, sameXData, selectedData;

            if ($$.dragging) { return; } // do nothing when dragging
            if ($$.hasArcType(targetsToShow)) { return; }

            targetsToShow = $$.filterTargetsToShow($$.data.targets);
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
            $$.showTooltip(selectedData, this);

            // expand points
            if (config.point_focus_expand_enabled) {
                $$.unexpandCircles();
                selectedData.forEach(function (d) {
                    $$.expandCircles(d.index, d.id, false);
                });
            }
            $$.expandBars(closest.index, closest.id, true);

            // Show xgrid focus line
            $$.showXGridFocus(selectedData);

            // Show cursor as pointer if point is close to mouse position
            if ($$.isBarType(closest.id) || $$.dist(closest, mouse) < config.point_sensitivity) {
                $$.svg.select('.' + CLASS.eventRect).style('cursor', 'pointer');
                if (!$$.mouseover) {
                    config.data_onmouseover.call($$.api, closest);
                    $$.mouseover = closest;
                }
            }
        })
        .on('click', function () {
            //click event was simulated via a 'tap' touch event, cancel regular click
            if (tap) {
                return;
            }

            click(this);
        })
        .on('touchstart', function(){
            var mouse = d3.mouse(this);
            //store starting coordinates for distance comparision during touch end event
            tapX = mouse[0];
            tapY = mouse[1];

        })
        .on('touchend', function(){
            var mouse = d3.mouse(this),
                x = mouse[0],
                y = mouse[1];

            //If end is too far from start, event doesn't count as a tap
            if (Math.abs(x - tapX) > config.touch_tap_radius || Math.abs(y - tapY) > config.touch_tap_radius) {
                return;
            }

            click(this);

            //indictate tap event fired to prevent click;
            tap = true;
            setTimeout(function() { tap = false; }, config.touch_tap_delay);
        })
        .call(
            config.interaction_enabled && config.data_selection_draggable && $$.drag ? (
                d3.drag()
                    .on('drag', function () { $$.drag(d3.mouse(this)); })
                    .on('start', function () { $$.dragstart(d3.mouse(this)); })
                    .on('end', function () { $$.dragend(); })
            ) : function () {}
        );
};
c3_chart_internal_fn.getMousePosition = function (data) {
    var $$ = this;
    return [$$.x(data.x), $$.getYScale(data.id)(data.value)];
};
c3_chart_internal_fn.dispatchEvent = function (type, mouse) {
    var $$ = this,
        selector = '.' + CLASS.eventRect,
        eventRect = $$.main.select(selector).node(),
        box = eventRect.getBoundingClientRect(),
        x = box.left + (mouse ? mouse[0] : 0),
        y = box.top + (mouse ? mouse[1] : 0),
        event = document.createEvent("MouseEvents");

    event.initMouseEvent(type, true, true, window, 0, x, y, x, y,
                         false, false, false, false, 0, null);
    eventRect.dispatchEvent(event);
};
