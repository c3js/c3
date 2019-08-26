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
    const $$ = this, d3 = $$.d3, config = $$.config;

    function mouseout() {
        $$.svg.select('.' + CLASS.eventRect).style('cursor', null);
        $$.hideXGridFocus();
        $$.hideTooltip();
        $$.unexpandCircles();
        $$.unexpandBars();
    }

    const isHoveringDataPoint = (mouse, closest) =>
        closest && ($$.isBarType(closest.id) || $$.dist(closest, mouse) < config.point_sensitivity);

    // converts 'x' position (in pixel) to category index
    const maxDataCount = $$.getMaxDataCount();

    const xEventScale = d3.scaleQuantize()
        // use X range (in pixel) as domain
        .domain([0, config.axis_rotated ? $$.height : $$.width])
        // 0 to N evenly distributed
        .range(maxDataCount ? Array.apply(null, { length: maxDataCount }).map(Function.call, Number) : [0]);

    const withName = (d) =>
        d ? $$.addName(Object.assign({}, d)) : null;

    // rects for mouseover
    $$.main.select('.' + CLASS.eventRects)
        .style('cursor', config.zoom_enabled ? config.axis_rotated ? 'ns-resize' : 'ew-resize' : null);

    $$.eventRect
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', $$.width)
        .attr('height', $$.height)
        .on('mouseout',  config.interaction_enabled ? function () {
            if (!config) { return; } // chart is destroyed
            if ($$.hasArcType()) { return; }
            if ($$.mouseover){
              config.data_onmouseout.call($$.api, $$.mouseover);
              $$.mouseover = undefined;
            }
            mouseout();
        } : null)
        .on('mousemove', config.interaction_enabled ? function () {
            // do nothing when dragging
            if ($$.dragging) {
                return;
            }

            const targetsToShow = $$.getTargetsToShow();

            // do nothing if arc type
            if ($$.hasArcType(targetsToShow)) {
                return;
            }

            const mouse = d3.mouse(this);
            const closest = withName($$.findClosestFromTargets(targetsToShow, mouse));
            const isMouseCloseToDataPoint = isHoveringDataPoint(mouse, closest);

            // ensure onmouseout is always called if mousemove switch between 2 targets
            if ($$.mouseover && (!closest || closest.id !== $$.mouseover.id || closest.index !== $$.mouseover.index)) {
                config.data_onmouseout.call($$.api, $$.mouseover);
                $$.mouseover = undefined;
            }
            if (closest && !$$.mouseover) {
                config.data_onmouseover.call($$.api, closest);
                $$.mouseover = closest;
            }

            // show cursor as pointer if we're hovering a data point close enough
            $$.svg.select('.' + CLASS.eventRect).style('cursor', isMouseCloseToDataPoint ? 'pointer' :  null);

            // if tooltip not grouped, we want to display only data from closest data point
            const showSingleDataPoint = !config.tooltip_grouped || $$.hasType('stanford', targetsToShow);

            // find data to highlight
            let selectedData;
            if (showSingleDataPoint) {
                if (!closest) {
                    return mouseout();
                }

                selectedData = [closest];
            } else {
                const mouseX = config.axis_rotated ? mouse[1] : mouse[0];

                selectedData = $$.filterByIndex(targetsToShow, xEventScale(mouseX));
            }

            // inject names for each point
            selectedData = selectedData.map(withName);

            // show tooltip
            $$.showTooltip(selectedData, this);

            // expand points
            if (config.point_focus_expand_enabled) {
                $$.unexpandCircles();
                selectedData.forEach(function (d) {
                    $$.expandCircles(d.index, d.id, false);
                });
            }

            // expand bars
            $$.unexpandBars();
            selectedData.forEach(function (d) {
                $$.expandBars(d.index, d.id, false);
            });

            // Show xgrid focus line
            $$.showXGridFocus(selectedData);
        } : null)
        .on('click', config.interaction_enabled ? function () {
            const targetsToShow = $$.getTargetsToShow();

            if ($$.hasArcType(targetsToShow)) {
                return;
            }

            const mouse = d3.mouse(this);
            const closest = withName($$.findClosestFromTargets(targetsToShow, mouse));

            if (!isHoveringDataPoint(mouse, closest)) {
                return;
            }

            // select if selection enabled
            let sameXData;
            if (!config.data_selection_grouped || $$.isStanfordType(closest)) {
                sameXData = [closest];
            } else {
                sameXData = $$.filterByX(targetsToShow, closest.x);
            }

            // toggle selected state
            sameXData.forEach(function (d) {
                $$.main.selectAll('.' + CLASS.shapes + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.shape + '-' + d.index).each(function () {
                    if (config.data_selection_grouped || $$.isWithinShape(this, d)) {
                        $$.toggleShape(this, d, d.index);
                    }
                });
            });

            // call data_onclick on the closest data point
            if (closest) {
                const shape = $$.main.selectAll('.' + CLASS.shapes + $$.getTargetSelectorSuffix(closest.id)).select('.' + CLASS.shape + '-' + closest.index);
                config.data_onclick.call($$.api, closest, shape.node());
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
