import { c3_chart_internal_fn } from './core';

c3_chart_internal_fn.initZoom = function () {
    var $$ = this, d3 = $$.d3, config = $$.config, startEvent;

    $$.zoom = d3.zoom()
        .on("start", function () {
            var e = d3.event.sourceEvent;
            if (e && e.type === "brush") { return; }
            startEvent = e;
            config.zoom_onzoomstart.call($$.api, e);
        })
        .on("zoom", function () {
            var e = d3.event.sourceEvent;
            if (e && e.type === "brush") { return; }
            $$.redrawForZoom.call($$);
        })
        .on('end', function () {
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
c3_chart_internal_fn.zoomTransform = function (range) {
    var $$ = this, s = [$$.x(range[0]), $$.x(range[1])];
    return $$.d3.zoomIdentity.scale($$.width / (s[1] - s[0])).translate(-s[0], 0);
};

c3_chart_internal_fn.getZoomDomain = function () {
    var $$ = this, config = $$.config, d3 = $$.d3,
        min = d3.min([$$.orgXDomain[0], config.zoom_x_min]),
        max = d3.max([$$.orgXDomain[1], config.zoom_x_max]);
    return [min, max];
};
c3_chart_internal_fn.redrawForZoom = function () {
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
