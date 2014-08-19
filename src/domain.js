c3_chart_internal_fn.getYDomainMin = function (targets) {
    var $$ = this, config = $$.config,
        ids = $$.mapToIds(targets), ys = $$.getValuesAsIdKeyed(targets),
        j, k, baseId, idsInGroup, id, hasNegativeValue;
    if (config.data_groups.length > 0) {
        hasNegativeValue = $$.hasNegativeValueInTargets(targets);
        for (j = 0; j < config.data_groups.length; j++) {
            // Determine baseId
            idsInGroup = config.data_groups[j].filter(function (id) { return ids.indexOf(id) >= 0; });
            if (idsInGroup.length === 0) { continue; }
            baseId = idsInGroup[0];
            // Consider negative values
            if (hasNegativeValue && ys[baseId]) {
                ys[baseId].forEach(function (v, i) {
                    ys[baseId][i] = v < 0 ? v : 0;
                });
            }
            // Compute min
            for (k = 1; k < idsInGroup.length; k++) {
                id = idsInGroup[k];
                if (! ys[id]) { continue; }
                ys[id].forEach(function (v, i) {
                    if ($$.getAxisId(id) === $$.getAxisId(baseId) && ys[baseId] && !(hasNegativeValue && +v > 0)) {
                        ys[baseId][i] += +v;
                    }
                });
            }
        }
    }
    return $$.d3.min(Object.keys(ys).map(function (key) { return $$.d3.min(ys[key]); }));
};
c3_chart_internal_fn.getYDomainMax = function (targets) {
    var $$ = this, config = $$.config,
        ids = $$.mapToIds(targets), ys = $$.getValuesAsIdKeyed(targets),
        j, k, baseId, idsInGroup, id, hasPositiveValue;
    if (config.data_groups.length > 0) {
        hasPositiveValue = $$.hasPositiveValueInTargets(targets);
        for (j = 0; j < config.data_groups.length; j++) {
            // Determine baseId
            idsInGroup = config.data_groups[j].filter(function (id) { return ids.indexOf(id) >= 0; });
            if (idsInGroup.length === 0) { continue; }
            baseId = idsInGroup[0];
            // Consider positive values
            if (hasPositiveValue && ys[baseId]) {
                ys[baseId].forEach(function (v, i) {
                    ys[baseId][i] = v > 0 ? v : 0;
                });
            }
            // Compute max
            for (k = 1; k < idsInGroup.length; k++) {
                id = idsInGroup[k];
                if (! ys[id]) { continue; }
                ys[id].forEach(function (v, i) {
                    if ($$.getAxisId(id) === $$.getAxisId(baseId) && ys[baseId] && !(hasPositiveValue && +v < 0)) {
                        ys[baseId][i] += +v;
                    }
                });
            }
        }
    }
    return $$.d3.max(Object.keys(ys).map(function (key) { return $$.d3.max(ys[key]); }));
};
c3_chart_internal_fn.getYDomain = function (targets, axisId) {
    var $$ = this, config = $$.config,
        yTargets = targets.filter(function (d) { return $$.getAxisId(d.id) === axisId; }),
        yMin = axisId === 'y2' ? config.axis_y2_min : config.axis_y_min,
        yMax = axisId === 'y2' ? config.axis_y2_max : config.axis_y_max,
        yDomainMin = isValue(yMin) ? yMin : $$.getYDomainMin(yTargets),
        yDomainMax = isValue(yMax) ? yMax : $$.getYDomainMax(yTargets),
        domainLength, padding, padding_top, padding_bottom,
        center = axisId === 'y2' ? config.axis_y2_center : config.axis_y_center,
        yDomainAbs, lengths, diff, ratio, isAllPositive, isAllNegative,
        isZeroBased = ($$.hasType('bar', yTargets) && config.bar_zerobased) || ($$.hasType('area', yTargets) && config.area_zerobased),
        showHorizontalDataLabel = $$.hasDataLabel() && config.axis_rotated,
        showVerticalDataLabel = $$.hasDataLabel() && !config.axis_rotated;
    if (yTargets.length === 0) { // use current domain if target of axisId is none
        return axisId === 'y2' ? $$.y2.domain() : $$.y.domain();
    }
    if (yDomainMin === yDomainMax) {
        yDomainMin < 0 ? yDomainMax = 0 : yDomainMin = 0;
    }
    isAllPositive = yDomainMin >= 0 && yDomainMax >= 0;
    isAllNegative = yDomainMin <= 0 && yDomainMax <= 0;

    // Bar/Area chart should be 0-based if all positive|negative
    if (isZeroBased) {
        if (isAllPositive) { yDomainMin = 0; }
        if (isAllNegative) { yDomainMax = 0; }
    }

    domainLength = Math.abs(yDomainMax - yDomainMin);
    padding = padding_top = padding_bottom = domainLength * 0.1;

    if (center) {
        yDomainAbs = Math.max(Math.abs(yDomainMin), Math.abs(yDomainMax));
        yDomainMax = yDomainAbs - center;
        yDomainMin = center - yDomainAbs;
    }
    // add padding for data label
    if (showHorizontalDataLabel) {
        lengths = $$.getDataLabelLength(yDomainMin, yDomainMax, axisId, 'width');
        diff = diffDomain($$.y.range());
        ratio = [lengths[0] / diff, lengths[1] / diff];
        padding_top += domainLength * (ratio[1] / (1 - ratio[0] - ratio[1]));
        padding_bottom += domainLength * (ratio[0] / (1 - ratio[0] - ratio[1]));
    } else if (showVerticalDataLabel) {
        lengths = $$.getDataLabelLength(yDomainMin, yDomainMax, axisId, 'height');
        padding_top += lengths[1];
        padding_bottom += lengths[0];
    }
    if (axisId === 'y' && config.axis_y_padding) {
        padding_top = $$.getAxisPadding(config.axis_y_padding, 'top', padding, domainLength);
        padding_bottom = $$.getAxisPadding(config.axis_y_padding, 'bottom', padding, domainLength);
    }
    if (axisId === 'y2' && config.axis_y2_padding) {
        padding_top = $$.getAxisPadding(config.axis_y2_padding, 'top', padding, domainLength);
        padding_bottom = $$.getAxisPadding(config.axis_y2_padding, 'bottom', padding, domainLength);
    }
    // Bar/Area chart should be 0-based if all positive|negative
    if (isZeroBased) {
        if (isAllPositive) { padding_bottom = yDomainMin; }
        if (isAllNegative) { padding_top = -yDomainMax; }
    }
    return [yDomainMin - padding_bottom, yDomainMax + padding_top];
};
c3_chart_internal_fn.getXDomainMin = function (targets) {
    var $$ = this, config = $$.config;
    return config.axis_x_min ?
        ($$.isTimeSeries() ? this.parseDate(config.axis_x_min) : config.axis_x_min) :
    $$.d3.min(targets, function (t) { return $$.d3.min(t.values, function (v) { return v.x; }); });
};
c3_chart_internal_fn.getXDomainMax = function (targets) {
    var $$ = this, config = $$.config;
    return config.axis_x_max ?
        ($$.isTimeSeries() ? this.parseDate(config.axis_x_max) : config.axis_x_max) :
    $$.d3.max(targets, function (t) { return $$.d3.max(t.values, function (v) { return v.x; }); });
};
c3_chart_internal_fn.getXDomainPadding = function (targets) {
    var $$ = this, config = $$.config,
        edgeX = this.getEdgeX(targets), diff = edgeX[1] - edgeX[0],
        maxDataCount, padding, paddingLeft, paddingRight;
    if ($$.isCategorized()) {
        padding = 0;
    } else if ($$.hasType('bar', targets)) {
        maxDataCount = $$.getMaxDataCount();
        padding = maxDataCount > 1 ? (diff / (maxDataCount - 1)) / 2 : 0.5;
    } else {
        padding = diff * 0.01;
    }
    if (typeof config.axis_x_padding === 'object' && notEmpty(config.axis_x_padding)) {
        paddingLeft = isValue(config.axis_x_padding.left) ? config.axis_x_padding.left : padding;
        paddingRight = isValue(config.axis_x_padding.right) ? config.axis_x_padding.right : padding;
    } else if (typeof config.axis_x_padding === 'number') {
        paddingLeft = paddingRight = config.axis_x_padding;
    } else {
        paddingLeft = paddingRight = padding;
    }
    return {left: paddingLeft, right: paddingRight};
};
c3_chart_internal_fn.getXDomain = function (targets) {
    var $$ = this,
        xDomain = [$$.getXDomainMin(targets), $$.getXDomainMax(targets)],
        firstX = xDomain[0], lastX = xDomain[1],
        padding = $$.getXDomainPadding(targets),
        min = 0, max = 0;
    // show center of x domain if min and max are the same
    if ((firstX - lastX) === 0 && !$$.isCategorized()) {
        firstX = $$.isTimeSeries() ? new Date(firstX.getTime() * 0.5) : -0.5;
        lastX = $$.isTimeSeries() ? new Date(lastX.getTime() * 1.5) : 0.5;
    }
    if (firstX || firstX === 0) {
        min = $$.isTimeSeries() ? new Date(firstX.getTime() - padding.left) : firstX - padding.left;
    }
    if (lastX || lastX === 0) {
        max = $$.isTimeSeries() ? new Date(lastX.getTime() + padding.right) : lastX + padding.right;
    }
    return [min, max];
};
c3_chart_internal_fn.updateXDomain = function (targets, withUpdateXDomain, withUpdateOrgXDomain, domain) {
    var $$ = this, config = $$.config;
    if (withUpdateOrgXDomain) {
        $$.x.domain(domain ? domain : $$.d3.extent($$.getXDomain(targets)));
        $$.orgXDomain = $$.x.domain();
        if (config.zoom_enabled) { $$.zoom.scale($$.x).updateScaleExtent(); }
        $$.subX.domain($$.x.domain());
        if ($$.brush) { $$.brush.scale($$.subX); }
    }
    if (withUpdateXDomain) {
        $$.x.domain(domain ? domain : (!$$.brush || $$.brush.empty()) ? $$.orgXDomain : $$.brush.extent());
        if (config.zoom_enabled) { $$.zoom.scale($$.x).updateScaleExtent(); }
    }
    return $$.x.domain();
};
