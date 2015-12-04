import { ChartInternal } from './core';

ChartInternal.prototype.initZoom = function () {
    var $$ = this, d3 = $$.d3, config = $$.config, startEvent;

    $$.zoom = d3.zoom()
        .on("start", function () {
            if (config.zoom_type !== 'scroll') {
                return;
            }

            var e = d3.event.sourceEvent;
            if (e && e.type === "brush") { return; }
            startEvent = e;
            config.zoom_onzoomstart.call($$.api, e);
        })
        .on("zoom", function () {
            if (config.zoom_type !== 'scroll') {
                return;
            }

            var e = d3.event.sourceEvent;
            if (e && e.type === "brush") { return; }
            $$.redrawForZoom.call($$);
        })
        .on('end', function () {
            if (config.zoom_type !== 'scroll') {
                return;
            }

            var e = d3.event.sourceEvent;
            if (e && e.type === "brush") { return; }
            // if click, do nothing. otherwise, click interaction will be canceled.
            if (e && startEvent.clientX === e.clientX && startEvent.clientY === e.clientY) {
                return;
            }
            config.zoom_onzoomend.call($$.api, $$.x.orgDomain());
        });

    $$.zoom.updateDomain = function () {
        if (d3.event && d3.event.transform) {
            $$.x.domain(d3.event.transform.rescaleX($$.subX).domain());
        }
        return this;
    };
    $$.zoom.updateExtent = function () {
        this.scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [$$.width, $$.height]])
            .extent([[0, 0], [$$.width, $$.height]]);
        return this;
    };
    $$.zoom.update = function () {
        return this.updateExtent().updateDomain();
    };

    return $$.zoom.updateExtent();
};
ChartInternal.prototype.zoomTransform = function (range) {
    var $$ = this, s = [$$.x(range[0]), $$.x(range[1])];
    return $$.d3.zoomIdentity.scale($$.width / (s[1] - s[0])).translate(-s[0], 0);
};

ChartInternal.prototype.initDragZoom = function () {
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

ChartInternal.prototype.getZoomDomain = function () {
    var $$ = this, config = $$.config, d3 = $$.d3,
        min = d3.min([$$.orgXDomain[0], config.zoom_x_min]),
        max = d3.max([$$.orgXDomain[1], config.zoom_x_max]);
    return [min, max];
};
ChartInternal.prototype.redrawForZoom = function () {
    var $$ = this, d3 = $$.d3, config = $$.config, zoom = $$.zoom, x = $$.x;
    if (!config.zoom_enabled) {
        return;
    }
    if ($$.filterTargetsToShow($$.data.targets).length === 0) {
        return;
    }

    zoom.update();

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
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'mousemove') {
        $$.cancelClick = true;
    }
    config.zoom_onzoom.call($$.api, x.orgDomain());
};
