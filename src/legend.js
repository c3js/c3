c3_chart_internal_fn.initLegend = function () {
    var $$ = this;
    $$.legend = $$.svg.append("g").attr("transform", $$.getTranslate('legend'));
    if (!$$.config.legend_show) {
        $$.legend.style('visibility', 'hidden');
        $$.hiddenLegendIds = $$.mapToIds($$.data.targets);
    }
    // MEMO: call here to update legend box and tranlate for all
    // MEMO: translate will be upated by this, so transform not needed in updateLegend()
    $$.updateLegend($$.mapToIds($$.data.targets), {withTransform: false, withTransitionForTransform: false, withTransition: false});
};
c3_chart_internal_fn.updateSizeForLegend = function (legendHeight, legendWidth) {
    var $$ = this, config = $$.config, insetLegendPosition = {
        top: $$.isLegendTop ? $$.getCurrentPaddingTop() + config.legend_inset_y + 5.5 : $$.currentHeight - legendHeight - $$.getCurrentPaddingBottom() - config.legend_inset_y,
        left: $$.isLegendLeft ? $$.getCurrentPaddingLeft() + config.legend_inset_x + 0.5 : $$.currentWidth - legendWidth - $$.getCurrentPaddingRight() - config.legend_inset_x + 0.5
    };
    $$.margin3 = {
        top: $$.isLegendRight ? 0 : $$.isLegendInset ? insetLegendPosition.top : $$.currentHeight - legendHeight,
        right: NaN,
        bottom: 0,
        left: $$.isLegendRight ? $$.currentWidth - legendWidth : $$.isLegendInset ? insetLegendPosition.left : 0
    };
};
c3_chart_internal_fn.transformLegend = function (withTransition) {
    var $$ = this;
    (withTransition ? $$.legend.transition() : $$.legend).attr("transform", $$.getTranslate('legend'));
};
c3_chart_internal_fn.updateLegendStep = function (step) {
    this.legendStep = step;
};
c3_chart_internal_fn.updateLegendItemWidth = function (w) {
    this.legendItemWidth = w;
};
c3_chart_internal_fn.updateLegendItemHeight = function (h) {
    this.legendItemHeight = h;
};
c3_chart_internal_fn.getLegendWidth = function () {
    var $$ = this;
    return $$.config.legend_show ? $$.isLegendRight || $$.isLegendInset ? $$.legendItemWidth * ($$.legendStep + 1) : $$.currentWidth : 0;
};
c3_chart_internal_fn.getLegendHeight = function () {
    var $$ = this, config = $$.config, h = 0;
    if (config.legend_show) {
        if ($$.isLegendRight) {
            h = $$.currentHeight;
        } else if ($$.isLegendInset) {
            h = config.legend_inset_step ? Math.max(20, $$.legendItemHeight) * (config.legend_inset_step + 1) : $$.height;
        } else {
            h = Math.max(20, $$.legendItemHeight) * ($$.legendStep + 1);
        }
    }
    return h;
};
c3_chart_internal_fn.opacityForLegend = function (legendItem) {
    var $$ = this;
    return legendItem.classed(CLASS.legendItemHidden) ? $$.legendOpacityForHidden : 1;
};
c3_chart_internal_fn.opacityForUnfocusedLegend = function (legendItem) {
    var $$ = this;
    return legendItem.classed(CLASS.legendItemHidden) ? $$.legendOpacityForHidden : 0.3;
};
c3_chart_internal_fn.toggleFocusLegend = function (id, focus) {
    var $$ = this;
    $$.legend.selectAll('.' + CLASS.legendItem)
        .transition().duration(100)
        .style('opacity', function (_id) {
            var This = $$.d3.select(this);
            if (id && _id !== id) {
                return focus ? $$.opacityForUnfocusedLegend(This) : $$.opacityForLegend(This);
            } else {
                return focus ? $$.opacityForLegend(This) : $$.opacityForUnfocusedLegend(This);
            }
        });
};
c3_chart_internal_fn.revertLegend = function () {
    var $$ = this, d3 = $$.d3;
    $$.legend.selectAll('.' + CLASS.legendItem)
        .transition().duration(100)
        .style('opacity', function () { return $$.opacityForLegend(d3.select(this)); });
};
c3_chart_internal_fn.showLegend = function (targetIds) {
    var $$ = this, config = $$.config;
    if (!config.legend_show) {
        config.legend_show = true;
        $$.legend.style('visibility', 'visible');
    }
    $$.removeHiddenLegendIds(targetIds);
    $$.legend.selectAll($$.selectorLegends(targetIds))
        .style('visibility', 'visible')
        .transition()
        .style('opacity', function () { return $$.opacityForLegend($$.d3.select(this)); });
};
c3_chart_internal_fn.hideLegend = function (targetIds) {
    var $$ = this, config = $$.config;
    if (config.legend_show && isEmpty(targetIds)) {
        config.legend_show = false;
        $$.legend.style('visibility', 'hidden');
    }
    $$.addHiddenLegendIds(targetIds);
    $$.legend.selectAll($$.selectorLegends(targetIds))
        .style('opacity', 0)
        .style('visibility', 'hidden');
};
c3_chart_internal_fn.updateLegend = function (targetIds, options, transitions) {
    var $$ = this, config = $$.config;
    var xForLegend, xForLegendText, xForLegendRect, yForLegend, yForLegendText, yForLegendRect;
    var paddingTop = 4, paddingRight = 36, maxWidth = 0, maxHeight = 0, posMin = 10;
    var l, totalLength = 0, offsets = {}, widths = {}, heights = {}, margins = [0], steps = {}, step = 0;
    var withTransition, withTransitionForTransform;
    var hasFocused = $$.legend.selectAll('.' + CLASS.legendItemFocused).size();
    var texts, rects, tiles;

    options = options || {};
    withTransition = getOption(options, "withTransition", true);
    withTransitionForTransform = getOption(options, "withTransitionForTransform", true);

    function updatePositions(textElement, id, reset) {
        var box = $$.getTextRect(textElement.textContent, CLASS.legendItem),
            itemWidth = Math.ceil((box.width + paddingRight) / 10) * 10,
            itemHeight = Math.ceil((box.height + paddingTop) / 10) * 10,
            itemLength = $$.isLegendRight || $$.isLegendInset ? itemHeight : itemWidth,
            areaLength = $$.isLegendRight || $$.isLegendInset ? $$.getLegendHeight() : $$.getLegendWidth(),
            margin, maxLength;

        // MEMO: care about condifion of step, totalLength
        function updateValues(id, withoutStep) {
            if (!withoutStep) {
                margin = (areaLength - totalLength - itemLength) / 2;
                if (margin < posMin) {
                    margin = (areaLength - itemLength) / 2;
                    totalLength = 0;
                    step++;
                }
            }
            steps[id] = step;
            margins[step] = $$.isLegendInset ? 10 : margin;
            offsets[id] = totalLength;
            totalLength += itemLength;
        }

        if (reset) {
            totalLength = 0;
            step = 0;
            maxWidth = 0;
            maxHeight = 0;
        }

        if (config.legend_show && !$$.isLegendToShow(id)) {
            widths[id] = heights[id] = steps[id] = offsets[id] = 0;
            return;
        }

        widths[id] = itemWidth;
        heights[id] = itemHeight;

        if (!maxWidth || itemWidth >= maxWidth) { maxWidth = itemWidth; }
        if (!maxHeight || itemHeight >= maxHeight) { maxHeight = itemHeight; }
        maxLength = $$.isLegendRight || $$.isLegendInset ? maxHeight : maxWidth;

        if (config.legend_equally) {
            Object.keys(widths).forEach(function (id) { widths[id] = maxWidth; });
            Object.keys(heights).forEach(function (id) { heights[id] = maxHeight; });
            margin = (areaLength - maxLength * targetIds.length) / 2;
            if (margin < posMin) {
                totalLength = 0;
                step = 0;
                targetIds.forEach(function (id) { updateValues(id); });
            }
            else {
                updateValues(id, true);
            }
        } else {
            updateValues(id);
        }
    }

    if ($$.isLegendRight) {
        xForLegend = function (id) { return maxWidth * steps[id]; };
        yForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
    } else if ($$.isLegendInset) {
        xForLegend = function (id) { return maxWidth * steps[id] + 10; };
        yForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
    } else {
        xForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
        yForLegend = function (id) { return maxHeight * steps[id]; };
    }
    xForLegendText = function (id, i) { return xForLegend(id, i) + 14; };
    yForLegendText = function (id, i) { return yForLegend(id, i) + 9; };
    xForLegendRect = function (id, i) { return xForLegend(id, i) - 4; };
    yForLegendRect = function (id, i) { return yForLegend(id, i) - 7; };

    // Define g for legend area
    l = $$.legend.selectAll('.' + CLASS.legendItem)
        .data(targetIds)
        .enter().append('g')
        .attr('class', function (id) { return $$.generateClass(CLASS.legendItem, id); })
        .style('visibility', function (id) { return $$.isLegendToShow(id) ? 'visible' : 'hidden'; })
        .style('cursor', 'pointer')
        .on('click', function (id) {
            config.legend_item_onclick ? config.legend_item_onclick.call($$, id) : $$.api.toggle(id);
        })
        .on('mouseover', function (id) {
            $$.d3.select(this).classed(CLASS.legendItemFocused, true);
            if (!$$.transiting) {
                $$.api.focus(id);
            }
            if (config.legend_item_onmouseover) {
                config.legend_item_onmouseover.call($$, id);
            }
        })
        .on('mouseout', function (id) {
            $$.d3.select(this).classed(CLASS.legendItemFocused, false);
            if (!$$.transiting) {
                $$.api.revert();
            }
            if (config.legend_item_onmouseout) {
                config.legend_item_onmouseout.call($$, id);
            }
        });
    l.append('text')
        .text(function (id) { return isDefined(config.data_names[id]) ? config.data_names[id] : id; })
        .each(function (id, i) { updatePositions(this, id, i === 0); })
        .style("pointer-events", "none")
        .attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendText : -200)
        .attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendText);
    l.append('rect')
        .attr("class", CLASS.legendItemEvent)
        .style('fill-opacity', 0)
        .attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendRect : -200)
        .attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendRect);
    l.append('rect')
        .attr("class", CLASS.legendItemTile)
        .style("pointer-events", "none")
        .style('fill', $$.color)
        .attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendText : -200)
        .attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegend)
        .attr('width', 10)
        .attr('height', 10);
    // Set background for inset legend
    if ($$.isLegendInset && maxWidth !== 0) {
        $$.legend.insert('g', '.' + CLASS.legendItem)
            .attr("class", CLASS.legendBackground)
            .append('rect')
            .attr('height', $$.getLegendHeight() - 10)
            .attr('width', maxWidth * (step + 1) + 10);
    }

    texts = $$.legend.selectAll('text')
        .data(targetIds)
        .text(function (id) { return isDefined(config.data_names[id]) ? config.data_names[id] : id; }) // MEMO: needed for update
        .each(function (id, i) { updatePositions(this, id, i === 0); });
    (withTransition ? texts.transition() : texts)
        .attr('x', xForLegendText)
        .attr('y', yForLegendText);

    rects = $$.legend.selectAll('rect.' + CLASS.legendItemEvent)
        .data(targetIds);
    (withTransition ? rects.transition() : rects)
        .attr('width', function (id) { return widths[id]; })
        .attr('height', function (id) { return heights[id]; })
        .attr('x', xForLegendRect)
        .attr('y', yForLegendRect);

    tiles = $$.legend.selectAll('rect.' + CLASS.legendItemTile)
        .data(targetIds);
    (withTransition ? tiles.transition() : tiles)
        .style('fill', $$.color)
        .attr('x', xForLegend)
        .attr('y', yForLegend);

    // toggle legend state
    $$.legend.selectAll('.' + CLASS.legendItem)
        .classed(CLASS.legendItemHidden, function (id) { return !$$.isTargetToShow(id); })
        .transition()
        .style('opacity', function (id) {
            var This = $$.d3.select(this);
            if ($$.isTargetToShow(id)) {
                return !hasFocused || This.classed(CLASS.legendItemFocused) ? $$.opacityForLegend(This) : $$.opacityForUnfocusedLegend(This);
            } else {
                return $$.legendOpacityForHidden;
            }
        });

    // Update all to reflect change of legend
    $$.updateLegendItemWidth(maxWidth);
    $$.updateLegendItemHeight(maxHeight);
    $$.updateLegendStep(step);
    // Update size and scale
    $$.updateSizes();
    $$.updateScales();
    $$.updateSvgSize();
    // Update g positions
    $$.transformAll(withTransitionForTransform, transitions);
};
