import CLASS from './class';
import { ChartInternal } from './core';

ChartInternal.prototype.initEventRect = function () {
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
};
ChartInternal.prototype.redrawEventRect = function () {
    var $$ = this, d3 = $$.d3, config = $$.config,
        x, y, w, h;

    // TODO: rotated not supported yet
    x = 0;
    y = 0;
    w = $$.width;
    h = $$.height;

    function mouseout() {
        $$.svg.select('.' + CLASS.eventRect).style('cursor', null);
        $$.hideXGridFocus();
        $$.hideTooltip();
        $$.unexpandCircles();
        $$.unexpandBars();
    }

    // rects for mouseover
    $$.main.select('.' + CLASS.eventRects)
        .style('cursor', config.zoom_enabled ? config.axis_rotated ? 'ns-resize' : 'ew-resize' : null);

    $$.eventRect
        .attr('x', x)
        .attr('y', y)
        .attr('width', w)
        .attr('height', h)
        .on('mouseout',  config.interaction_enabled ? function () {
            if (!config) { return; } // chart is destroyed
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

            if (!closest) {
                mouseout();
                return;
            }

            if ($$.isScatterOrStanfordType(closest) || !config.tooltip_grouped) {
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
        } : null)
        .on('click', config.interaction_enabled ? function () {
            var targetsToShow, mouse, closest, sameXData;
            if ($$.hasArcType(targetsToShow)) { return; }

            targetsToShow = $$.filterTargetsToShow($$.data.targets);
            mouse = d3.mouse(this);
            closest = $$.findClosestFromTargets(targetsToShow, mouse);
            if (! closest) { return; }
            // select if selection enabled
            if ($$.isBarType(closest.id) || $$.dist(closest, mouse) < config.point_sensitivity) {
                if ($$.isScatterOrStanfordType(closest) || !config.data_selection_grouped) {
                    sameXData = [closest];
                } else {
                    sameXData = $$.filterByX(targetsToShow, closest.x);
                }
                sameXData.forEach(function (d) {
                    $$.main.selectAll('.' + CLASS.shapes + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.shape + '-' + d.index).each(function () {
                        if (config.data_selection_grouped || $$.isWithinShape(this, d)) {
                            $$.toggleShape(this, d, d.index);
                            config.data_onclick.call($$.api, d, this);
                        }
                    });
                });
            }
        } : null)
        .call(
            config.interaction_enabled && config.data_selection_draggable && $$.drag ? (
                d3.drag()
                    .on('drag', function () { $$.drag(d3.mouse(this)); })
                    .on('start', function () { $$.dragstart(d3.mouse(this)); })
                    .on('end', function () { $$.dragend(); })
            ) : function () {}
        );
};
ChartInternal.prototype.getMousePosition = function (data) {
    var $$ = this;
    return [$$.x(data.x), $$.getYScale(data.id)(data.value)];
};
ChartInternal.prototype.dispatchEvent = function (type, mouse) {
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
