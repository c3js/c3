c3_chart_internal_fn.initTooltip = function () {
    var $$ = this, config = $$.config, i;
    $$.tooltip = $$.selectChart
        .style("position", "relative")
        .append("div")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("z-index", "10")
        .style("display", "none");
    // Show tooltip if needed
    if (config.tooltip_init_show) {
        if ($$.isTimeSeries() && isString(config.tooltip_init_x)) {
            config.tooltip_init_x = $$.parseDate(config.tooltip_init_x);
            for (i = 0; i < $$.data.targets[0].values.length; i++) {
                if (($$.data.targets[0].values[i].x - config.tooltip_init_x) === 0) { break; }
            }
            config.tooltip_init_x = i;
        }
        $$.tooltip.html(config.tooltip_contents.call($$, $$.data.targets.map(function (d) {
            return $$.addName(d.values[config.tooltip_init_x]);
        }), $$.getXAxisTickFormat(), $$.getYFormat($$.hasArcType()), $$.color));
        $$.tooltip.style("top", config.tooltip_init_position.top)
            .style("left", config.tooltip_init_position.left)
            .style("display", "block");
    }
};
c3_chart_internal_fn.getTooltipContent = function (d, defaultTitleFormat, defaultValueFormat, color) {
    var $$ = this, config = $$.config,
        titleFormat = config.tooltip_format_title || defaultTitleFormat,
        nameFormat = config.tooltip_format_name || function (name) { return name; },
        valueFormat = config.tooltip_format_value || defaultValueFormat,
        text, i, title, value, name, bgcolor;
    for (i = 0; i < d.length; i++) {
        if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

        if (! text) {
            title = titleFormat ? titleFormat(d[i].x) : d[i].x;
            text = "<table class='" + CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
        }

        name = nameFormat(d[i].name);
        value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
        bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

        text += "<tr class='" + CLASS.tooltipName + "-" + d[i].id + "'>";
        text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
        text += "<td class='value'>" + value + "</td>";
        text += "</tr>";
    }
    return text + "</table>";
};
c3_chart_internal_fn.showTooltip = function (selectedData, mouse) {
    var $$ = this, config = $$.config;
    var tWidth, tHeight, svgLeft, tooltipLeft, tooltipRight, tooltipTop, chartRight;
    var forArc = $$.hasArcType(),
        dataToShow = selectedData.filter(function (d) { return d && isValue(d.value); });
    if (dataToShow.length === 0 || !config.tooltip_show) {
        return;
    }
    $$.tooltip.html(config.tooltip_contents.call($$, selectedData, $$.getXAxisTickFormat(), $$.getYFormat(forArc), $$.color)).style("display", "block");

    // Get tooltip dimensions
    tWidth = $$.tooltip.property('offsetWidth');
    tHeight = $$.tooltip.property('offsetHeight');
    // Determin tooltip position
    if (forArc) {
        tooltipLeft = ($$.width / 2) + mouse[0];
        tooltipTop = ($$.height / 2) + mouse[1] + 20;
    } else {
        if (config.axis_rotated) {
            svgLeft = $$.getSvgLeft();
            tooltipLeft = svgLeft + mouse[0] + 100;
            tooltipRight = tooltipLeft + tWidth;
            chartRight = $$.getCurrentWidth() - $$.getCurrentPaddingRight();
            tooltipTop = $$.x(dataToShow[0].x) + 20;
        } else {
            svgLeft = $$.getSvgLeft();
            tooltipLeft = svgLeft + $$.getCurrentPaddingLeft() + $$.x(dataToShow[0].x) + 20;
            tooltipRight = tooltipLeft + tWidth;
            chartRight = svgLeft + $$.getCurrentWidth() - $$.getCurrentPaddingRight();
            tooltipTop = mouse[1] + 15;
        }

        if (tooltipRight > chartRight) {
            tooltipLeft -= tooltipRight - chartRight;
        }
        if (tooltipTop + tHeight > $$.getCurrentHeight() && tooltipTop > tHeight + 30) {
            tooltipTop -= tHeight + 30;
        }
    }
    // Set tooltip
    $$.tooltip
        .style("top", tooltipTop + "px")
        .style("left", tooltipLeft + 'px');
};
c3_chart_internal_fn.hideTooltip = function () {
    this.tooltip.style("display", "none");
};
