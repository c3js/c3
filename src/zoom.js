c3_chart_internal_fn.initZoom = function () {
    var $$ = this, d3 = $$.d3, config = $$.config;
    $$.zoom = d3.behavior.zoom()
        .on("zoomstart", function () {
            $$.zoom.altDomain = d3.event.sourceEvent.altKey ? $$.x.orgDomain() : null;
        })
        .on("zoom", function () { $$.redrawForZoom.call($$); });
    $$.zoom.scale = function (scale) {
        return config.axis_rotated ? this.y(scale) : this.x(scale);
    };
    $$.zoom.orgScaleExtent = function () {
        var extent = config.zoom_extent ? config.zoom_extent : [1, 10];
        return [extent[0], Math.max($$.getMaxDataCount() / extent[1], extent[1])];
    };
    $$.zoom.updateScaleExtent = function () {
        var ratio = diffDomain($$.x.orgDomain()) / diffDomain($$.orgXDomain),
            extent = this.orgScaleExtent();
        this.scaleExtent([extent[0] * ratio, extent[1] * ratio]);
        return this;
    };
};
c3_chart_internal_fn.updateZoom = function () {
    var $$ = this, z = $$.config.zoom_enabled ? $$.zoom : function () {};
    $$.main.select('.' + CLASS.zoomRect).call(z);
    $$.main.selectAll('.' + CLASS.eventRect).call(z);
};
c3_chart_internal_fn.redrawForZoom = function () {
    var $$ = this, d3 = $$.d3, config = $$.config, zoom = $$.zoom, x = $$.x, orgXDomain = $$.orgXDomain;
    if (!config.zoom_enabled) {
        return;
    }
    if ($$.filterTargetsToShow($$.data.targets).length === 0) {
        return;
    }
    if (d3.event.sourceEvent.type === 'mousemove' && zoom.altDomain) {
        x.domain(zoom.altDomain);
        zoom.scale(x).updateScaleExtent();
        return;
    }
    if ($$.isCategorized() && x.orgDomain()[0] === orgXDomain[0]) {
        x.domain([orgXDomain[0] - 1e-10, x.orgDomain()[1]]);
    }
    $$.redraw({
        withTransition: false,
        withY: false,
        withSubchart: false
    });
    if (d3.event.sourceEvent.type === 'mousemove') {
        $$.cancelClick = true;
    }
    config.zoom_onzoom.call($$.api, x.orgDomain());
};
