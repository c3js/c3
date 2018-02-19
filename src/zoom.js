import CLASS from './class';
import { c3_chart_internal_fn } from './core';
import { diffDomain } from './util';

c3_chart_internal_fn.initZoom = function () {
    var $$ = this, d3 = $$.d3, config = $$.config, startEvent;

    $$.zoom = d3.behavior.zoom()
        .on("zoomstart", function () {
            if (config.zoom_type !== 'scroll') {
                return;
            }

            startEvent = d3.event.sourceEvent;
            $$.zoom.altDomain = d3.event.sourceEvent.altKey ? $$.x.orgDomain() : null;
            config.zoom_onzoomstart.call($$.api, d3.event.sourceEvent);
        })
        .on("zoom", function () {
            if (config.zoom_type !== 'scroll') {
                return;
            }

            $$.redrawForZoom.call($$);
        })
        .on('zoomend', function () {
            if (config.zoom_type !== 'scroll') {
                return;
            }

            var event = d3.event.sourceEvent;
            // if click, do nothing. otherwise, click interaction will be canceled.
            if (event && startEvent.clientX === event.clientX && startEvent.clientY === event.clientY) {
                return;
            }
            $$.redrawEventRect();
            $$.updateZoom();
            config.zoom_onzoomend.call($$.api, $$.x.orgDomain());
        });

    $$.zoom.scale = function (scale) {
        return config.axis_rotated ? this.y(scale) : this.x(scale);
    };
    $$.zoom.orgScaleExtent = function () {
        var extent = config.zoom_extent ? config.zoom_extent : [1, 10];
        return [extent[0], Math.max($$.getMaxDataCount() / extent[1], extent[1])];
    };
    $$.zoom.updateScaleExtent = function () {
        var ratio = diffDomain($$.x.orgDomain()) / diffDomain($$.getZoomDomain()),
            extent = this.orgScaleExtent();
        this.scaleExtent([extent[0] * ratio, extent[1] * ratio]);
        return this;
    };
};

c3_chart_internal_fn.initDragZoom = function () {
    if (this.config.zoom_type === 'drag' && this.config.zoom_enabled) {
        var $$ = this, d3 = $$.d3, config = $$.config,
            context = $$.context = $$.svg,
            brushXPos, brushYPos;

        $$.dragZoomBrush = d3.svg.brush()
            .x($$.x)
            .y($$.y)
            .on("brushstart", function () {
                config.zoom_onzoomstart.call($$.api, $$.x.orgDomain());
            })
            .on("brush", function () {
                var extent = $$.dragZoomBrush.extent(),
                    ar1 = [extent[0][0], $$.y.domain()[0]],
                    ar2 = [extent[1][0], $$.y.domain()[1]];

                $$.dragZoomBrush.extent([ar1, ar2]);
                $$.svg.select("." + CLASS.dragZoom).call($$.dragZoomBrush);


                config.zoom_onzoom.call($$.api, $$.x.orgDomain());
            })
            .on("brushend", function () {
                var extent = $$.dragZoomBrush.extent();

                if (!config.zoom_disableDefaultBehavior) {
                    $$.api.zoom([extent[0][0], extent[1][0]]);
                }
                else {
                    var ar1 = [$$.x.domain()[0], $$.y.domain()[0]],
                        ar2 = [$$.x.domain()[1], $$.y.domain()[1]];
                    $$.dragZoomBrush.extent([ar1, ar2]);
                    $$.api.zoom([$$.x.domain()[0], $$.x.domain()[1]]);
                }

                d3.selectAll("." + CLASS.dragZoom)
                    .attr("class", CLASS.dragZoom + " disabled");

                $$.dragZoomBrush.clear();
                $$.svg.select("." + CLASS.dragZoom).call($$.dragZoomBrush);

                config.zoom_onzoomend.call($$.api, [extent[0][0], extent[1][0]]);
            });

        brushXPos = $$.margin.left + 20.5;
        brushYPos = $$.margin.top + 0.5;
        context.append("g")
            .attr("clip-path", $$.clipPath)
            .attr("class", CLASS.dragZoom + " disabled")
            .attr("transform", "translate(" + brushXPos + "," + brushYPos + ")")
            .call($$.dragZoomBrush);

        $$.svg.on("mousedown", function () {
            d3.selectAll("." + CLASS.dragZoom)
                .attr("class", CLASS.dragZoom + " enabled");

            var brush_elm = $$.svg.select("." + CLASS.dragZoom).node();
            var new_click_event = new Event('mousedown');
            new_click_event.pageX = d3.event.pageX;
            new_click_event.clientX = d3.event.clientX;
            new_click_event.pageY = d3.event.pageY;
            new_click_event.clientY = d3.event.clientY;
            brush_elm.dispatchEvent(new_click_event);
        });
    }
};

c3_chart_internal_fn.getZoomDomain = function () {
    var $$ = this, config = $$.config, d3 = $$.d3,
        min = d3.min([$$.orgXDomain[0], config.zoom_x_min]),
        max = d3.max([$$.orgXDomain[1], config.zoom_x_max]);
    return [min, max];
};
c3_chart_internal_fn.updateZoom = function () {
    var $$ = this, z = $$.config.zoom_enabled && $$.config.zoom_type === 'scroll' ? $$.zoom : function () {};
    $$.main.select('.' + CLASS.zoomRect).call(z).on("dblclick.zoom", null);
    $$.main.selectAll('.' + CLASS.eventRect).call(z).on("dblclick.zoom", null);
};
c3_chart_internal_fn.redrawForZoom = function () {
    var $$ = this, d3 = $$.d3, config = $$.config, zoom = $$.zoom, x = $$.x;
    if (!config.zoom_enabled) {
        return;
    }
    if ($$.filterTargetsToShow($$.data.targets).length === 0) {
        return;
    }

    if (config.zoom_type === 'scroll' && !config.zoom_disableDefaultBehavior) {
        if (d3.event.sourceEvent.type === 'mousemove' && zoom.altDomain) {
            x.domain(zoom.altDomain);
            zoom.scale(x).updateScaleExtent();
            return;
        }
        if ($$.isCategorized() && x.orgDomain()[0] === $$.orgXDomain[0]) {
            x.domain([$$.orgXDomain[0] - 1e-10, x.orgDomain()[1]]);
        }
        $$.redraw({
            withTransition: false,
            withY: config.zoom_rescale,
            withSubchart: false,
            withEventRect: false,
            withDimension: false
        });
        if (d3.event.sourceEvent.type === 'mousemove') {
            $$.cancelClick = true;
        }
    }
    config.zoom_onzoom.call($$.api, x.orgDomain());
};
