import { CLASS } from './class';
import { isFunction } from './util';

const initPie = function () {
    let $$ = this, d3 = $$.d3, config = $$.config;
    $$.pie = d3.layout.pie().value((d) => {
        return d.values.reduce((a, b) => { return a + b.value; }, 0);
    });
    if (!config.data_order) {
        $$.pie.sort(null);
    }
};

const updateRadius = function () {
    let $$ = this, config = $$.config,
        w = config.gauge_width || config.donut_width;
    $$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
    $$.radius = $$.radiusExpanded * 0.95;
    $$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
    $$.innerRadius = $$.hasType('donut') || $$.hasType('gauge') ? $$.radius * $$.innerRadiusRatio : 0;
};

const updateArc = function () {
    const $$ = this;
    $$.svgArc = $$.getSvgArc();
    $$.svgArcExpanded = $$.getSvgArcExpanded();
    $$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);
};

const updateAngle = function (d) {
    let $$ = this, config = $$.config,
        found = false, index = 0,
        gMin, gMax, gTic, gValue;

    if (!config) {
        return null;
    }

    $$.pie($$.filterTargetsToShow($$.data.targets)).forEach((t) => {
        if (!found && t.data.id === d.data.id) {
            found = true;
            d = t;
            d.index = index;
        }
        index++;
    });
    if (isNaN(d.startAngle)) {
        d.startAngle = 0;
    }
    if (isNaN(d.endAngle)) {
        d.endAngle = d.startAngle;
    }
    if ($$.isGaugeType(d.data)) {
        gMin = config.gauge_min;
        gMax = config.gauge_max;
        gTic = (Math.PI * (config.gauge_fullCircle ? 2 : 1)) / (gMax - gMin);
        gValue = d.value < gMin ? 0 : d.value < gMax ? d.value - gMin : (gMax - gMin);
        d.startAngle = config.gauge_startingAngle;
        d.endAngle = d.startAngle + gTic * gValue;
    }
    return found ? d : null;
};

const getSvgArc = function () {
    let $$ = this,
        arc = $$.d3.svg.arc().outerRadius($$.radius).innerRadius($$.innerRadius),
        newArc = function (d, withoutUpdate) {
            let updated;
            if (withoutUpdate) { return arc(d); } // for interpolate
            updated = $$.updateAngle(d);
            return updated ? arc(updated) : 'M 0 0';
        };
    // TODO: extends all function
    newArc.centroid = arc.centroid;
    return newArc;
};

const getSvgArcExpanded = function (rate) {
    let $$ = this,
        arc = $$.d3.svg.arc().outerRadius($$.radiusExpanded * (rate ? rate : 1)).innerRadius($$.innerRadius);
    return function (d) {
        const updated = $$.updateAngle(d);
        return updated ? arc(updated) : 'M 0 0';
    };
};

const getArc = function (d, withoutUpdate, force) {
    return force || this.isArcType(d.data) ? this.svgArc(d, withoutUpdate) : 'M 0 0';
};


const transformForArcLabel = function (d) {
    let $$ = this, config = $$.config,
        updated = $$.updateAngle(d), c, x, y, h, ratio, translate = '';
    if (updated && !$$.hasType('gauge')) {
        c = this.svgArc.centroid(updated);
        x = isNaN(c[0]) ? 0 : c[0];
        y = isNaN(c[1]) ? 0 : c[1];
        h = Math.sqrt(x * x + y * y);
        if ($$.hasType('donut') && config.donut_label_ratio) {
            ratio = isFunction(config.donut_label_ratio) ? config.donut_label_ratio(d, $$.radius, h) : config.donut_label_ratio;
        } else if ($$.hasType('pie') && config.pie_label_ratio) {
            ratio = isFunction(config.pie_label_ratio) ? config.pie_label_ratio(d, $$.radius, h) : config.pie_label_ratio;
        } else {
            ratio = $$.radius && h ? (36 / $$.radius > 0.375 ? 1.175 - 36 / $$.radius : 0.8) * $$.radius / h : 0;
        }
        translate = 'translate(' + (x * ratio) + ',' + (y * ratio) + ')';
    }
    return translate;
};

const getArcRatio = function (d) {
    let $$ = this,
        config = $$.config,
        whole = Math.PI * ($$.hasType('gauge') && !config.gauge_fullCircle ? 1 : 2);
    return d ? (d.endAngle - d.startAngle) / whole : null;
};

const convertToArcData = function (d) {
    return this.addName({
        id: d.data.id,
        value: d.value,
        ratio: this.getArcRatio(d),
        index: d.index,
    });
};

const textForArcLabel = function (d) {
    let $$ = this,
        updated, value, ratio, id, format;
    if (!$$.shouldShowArcLabel()) { return ''; }
    updated = $$.updateAngle(d);
    value = updated ? updated.value : null;
    ratio = $$.getArcRatio(updated);
    id = d.data.id;
    if (!$$.hasType('gauge') && !$$.meetsArcLabelThreshold(ratio)) { return ''; }
    format = $$.getArcLabelFormat();
    return format ? format(value, ratio, id) : $$.defaultArcValueFormat(value, ratio);
};

const expandArc = function (targetIds) {
    let $$ = this, interval;

    // MEMO: avoid to cancel transition
    if ($$.transiting) {
        interval = window.setInterval(() => {
            if (!$$.transiting) {
                window.clearInterval(interval);
                if ($$.legend.selectAll('.c3-legend-item-focused').size() > 0) {
                    $$.expandArc(targetIds);
                }
            }
        }, 10);
        return;
    }

    targetIds = $$.mapToTargetIds(targetIds);

    $$.svg.selectAll($$.selectorTargets(targetIds, '.' + CLASS.chartArc)).each(function (d) {
        if (!$$.shouldExpand(d.data.id)) { return; }
        $$.d3.select(this).selectAll('path')
            .transition().duration($$.expandDuration(d.data.id))
            .attr('d', $$.svgArcExpanded)
            .transition().duration($$.expandDuration(d.data.id) * 2)
            .attr('d', $$.svgArcExpandedSub)
            .each((d) => {
                if ($$.isDonutType(d.data)) {
                    // callback here
                }
            });
    });
};

const unexpandArc = function (targetIds) {
    const $$ = this;

    if ($$.transiting) { return; }

    targetIds = $$.mapToTargetIds(targetIds);

    $$.svg.selectAll($$.selectorTargets(targetIds, '.' + CLASS.chartArc)).selectAll('path')
        .transition().duration((d) => {
            return $$.expandDuration(d.data.id);
        })
        .attr('d', $$.svgArc);
    $$.svg.selectAll('.' + CLASS.arc)
        .style('opacity', 1);
};

const expandDuration = function (id) {
    let $$ = this, config = $$.config;

    if ($$.isDonutType(id)) {
        return config.donut_expand_duration;
    } else if ($$.isGaugeType(id)) {
        return config.gauge_expand_duration;
    } else if ($$.isPieType(id)) {
        return config.pie_expand_duration;
    } else {
        return 50;
    }
};

const shouldExpand = function (id) {
    let $$ = this, config = $$.config;
    return ($$.isDonutType(id) && config.donut_expand) ||
           ($$.isGaugeType(id) && config.gauge_expand) ||
           ($$.isPieType(id) && config.pie_expand);
};

const shouldShowArcLabel = function () {
    let $$ = this, config = $$.config, shouldShow = true;
    if ($$.hasType('donut')) {
        shouldShow = config.donut_label_show;
    } else if ($$.hasType('pie')) {
        shouldShow = config.pie_label_show;
    }
    // when gauge, always true
    return shouldShow;
};

const meetsArcLabelThreshold = function (ratio) {
    let $$ = this, config = $$.config,
        threshold = $$.hasType('donut') ? config.donut_label_threshold : config.pie_label_threshold;
    return ratio >= threshold;
};

const getArcLabelFormat = function () {
    let $$ = this, config = $$.config,
        format = config.pie_label_format;
    if ($$.hasType('gauge')) {
        format = config.gauge_label_format;
    } else if ($$.hasType('donut')) {
        format = config.donut_label_format;
    }
    return format;
};

const getArcTitle = function () {
    const $$ = this;
    return $$.hasType('donut') ? $$.config.donut_title : '';
};

const updateTargetsForArc = function (targets) {
    let $$ = this, main = $$.main,
        mainPieUpdate, mainPieEnter,
        classChartArc = $$.classChartArc.bind($$),
        classArcs = $$.classArcs.bind($$),
        classFocus = $$.classFocus.bind($$);
    mainPieUpdate = main.select('.' + CLASS.chartArcs).selectAll('.' + CLASS.chartArc)
        .data($$.pie(targets))
        .attr('class', (d) => { return classChartArc(d) + classFocus(d.data); });
    mainPieEnter = mainPieUpdate.enter().append('g')
        .attr('class', classChartArc);
    mainPieEnter.append('g')
        .attr('class', classArcs);
    mainPieEnter.append('text')
        .attr('dy', $$.hasType('gauge') ? '-.1em' : '.35em')
        .style('opacity', 0)
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none');
    // MEMO: can not keep same color..., but not bad to update color in redraw
    // mainPieUpdate.exit().remove();
};

const initArc = function () {
    const $$ = this;
    $$.arcs = $$.main.select('.' + CLASS.chart).append('g')
        .attr('class', CLASS.chartArcs)
        .attr('transform', $$.getTranslate('arc'));
    $$.arcs.append('text')
        .attr('class', CLASS.chartArcsTitle)
        .style('text-anchor', 'middle')
        .text($$.getArcTitle());
};

const redrawArc = function (duration, durationForExit, withTransform) {
    let $$ = this, d3 = $$.d3, config = $$.config, main = $$.main,
        mainArc;
    mainArc = main.selectAll('.' + CLASS.arcs).selectAll('.' + CLASS.arc)
        .data($$.arcData.bind($$));
    mainArc.enter().append('path')
        .attr('class', $$.classArc.bind($$))
        .style('fill', (d) => { return $$.color(d.data); })
        .style('cursor', (d) => { return config.interaction_enabled && config.data_selection_isselectable(d) ? 'pointer' : null; })
        .style('opacity', 0)
        .each(function (d) {
            if ($$.isGaugeType(d.data)) {
                d.startAngle = d.endAngle = config.gauge_startingAngle;
            }
            this._current = d;
        });
    mainArc
        .attr('transform', (d) => { return !$$.isGaugeType(d.data) && withTransform ? 'scale(0)' : ''; })
        .style('opacity', function (d) { return d === this._current ? 0 : 1; })
        .on('mouseover', config.interaction_enabled ? function (d) {
            let updated, arcData;
            if ($$.transiting) { // skip while transiting
                return;
            }
            updated = $$.updateAngle(d);
            if (updated) {
                arcData = $$.convertToArcData(updated);
                // transitions
                $$.expandArc(updated.data.id);
                $$.api.focus(updated.data.id);
                $$.toggleFocusLegend(updated.data.id, true);
                $$.config.data_onmouseover(arcData, this);
            }
        } : null)
        .on('mousemove', config.interaction_enabled ? function (d) {
            let updated = $$.updateAngle(d), arcData, selectedData;
            if (updated) {
                arcData = $$.convertToArcData(updated),
                selectedData = [arcData];
                $$.showTooltip(selectedData, this);
            }
        } : null)
        .on('mouseout', config.interaction_enabled ? function (d) {
            let updated, arcData;
            if ($$.transiting) { // skip while transiting
                return;
            }
            updated = $$.updateAngle(d);
            if (updated) {
                arcData = $$.convertToArcData(updated);
                // transitions
                $$.unexpandArc(updated.data.id);
                $$.api.revert();
                $$.revertLegend();
                $$.hideTooltip();
                $$.config.data_onmouseout(arcData, this);
            }
        } : null)
        .on('click', config.interaction_enabled ? function (d, i) {
            let updated = $$.updateAngle(d), arcData;
            if (updated) {
                arcData = $$.convertToArcData(updated);
                if ($$.toggleShape) {
                    $$.toggleShape(this, arcData, i);
                }
                $$.config.data_onclick.call($$.api, arcData, this);
            }
        } : null)
        .each(() => { $$.transiting = true; })
        .transition().duration(duration)
        .attrTween('d', function (d) {
            let updated = $$.updateAngle(d), interpolate;
            if (!updated) {
                return function () { return 'M 0 0'; };
            }
            //                if (this._current === d) {
            //                    this._current = {
            //                        startAngle: Math.PI*2,
            //                        endAngle: Math.PI*2,
            //                    };
            //                }
            if (isNaN(this._current.startAngle)) {
                this._current.startAngle = 0;
            }
            if (isNaN(this._current.endAngle)) {
                this._current.endAngle = this._current.startAngle;
            }
            interpolate = d3.interpolate(this._current, updated);
            this._current = interpolate(0);
            return function (t) {
                const interpolated = interpolate(t);
                interpolated.data = d.data; // data.id will be updated by interporator
                return $$.getArc(interpolated, true);
            };
        })
        .attr('transform', withTransform ? 'scale(1)' : '')
        .style('fill', (d) => {
            return $$.levelColor ? $$.levelColor(d.data.values[0].value) : $$.color(d.data.id);
        }) // Where gauge reading color would receive customization.
        .style('opacity', 1)
        .call($$.endall, () => {
            $$.transiting = false;
        });
    mainArc.exit().transition().duration(durationForExit)
        .style('opacity', 0)
        .remove();
    main.selectAll('.' + CLASS.chartArc).select('text')
        .style('opacity', 0)
        .attr('class', (d) => { return $$.isGaugeType(d.data) ? CLASS.gaugeValue : ''; })
        .text($$.textForArcLabel.bind($$))
        .attr('transform', $$.transformForArcLabel.bind($$))
        .style('font-size', (d) => { return $$.isGaugeType(d.data) ? Math.round($$.radius / 5) + 'px' : ''; })
      .transition().duration(duration)
        .style('opacity', (d) => { return $$.isTargetToShow(d.data.id) && $$.isArcType(d.data) ? 1 : 0; });
    main.select('.' + CLASS.chartArcsTitle)
        .style('opacity', $$.hasType('donut') || $$.hasType('gauge') ? 1 : 0);

    if ($$.hasType('gauge')) {
        $$.arcs.select('.' + CLASS.chartArcsBackground)
            .attr('d', () => {
                const d = {
                    data: [{ value: config.gauge_max }],
                    startAngle: config.gauge_startingAngle,
                    endAngle: -1 * config.gauge_startingAngle,
                };
                return $$.getArc(d, true, true);
            });
        $$.arcs.select('.' + CLASS.chartArcsGaugeUnit)
            .attr('dy', '.75em')
            .text(config.gauge_label_show ? config.gauge_units : '');
        $$.arcs.select('.' + CLASS.chartArcsGaugeMin)
            .attr('dx', -1 * ($$.innerRadius + (($$.radius - $$.innerRadius) / (config.gauge_fullCircle ? 1 : 2))) + 'px')
            .attr('dy', '1.2em')
            .text(config.gauge_label_show ? config.gauge_min : '');
        $$.arcs.select('.' + CLASS.chartArcsGaugeMax)
            .attr('dx', $$.innerRadius + (($$.radius - $$.innerRadius) / (config.gauge_fullCircle ? 1 : 2)) + 'px')
            .attr('dy', '1.2em')
            .text(config.gauge_label_show ? config.gauge_max : '');
    }
};
const initGauge = function () {
    const arcs = this.arcs;
    if (this.hasType('gauge')) {
        arcs.append('path')
            .attr('class', CLASS.chartArcsBackground);
        arcs.append('text')
            .attr('class', CLASS.chartArcsGaugeUnit)
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none');
        arcs.append('text')
            .attr('class', CLASS.chartArcsGaugeMin)
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none');
        arcs.append('text')
            .attr('class', CLASS.chartArcsGaugeMax)
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none');
    }
};
const getGaugeLabelHeight = function () {
    return this.config.gauge_label_show ? 20 : 0;
};

export {
    initPie,
    updateRadius,
    updateArc,
    updateAngle,
    getSvgArc,
    getSvgArcExpanded,
    getArc,
    transformForArcLabel,
    getArcRatio,
    convertToArcData,
    textForArcLabel,
    expandArc,
    unexpandArc,
    expandDuration,
    shouldExpand,
    shouldShowArcLabel,
    meetsArcLabelThreshold,
    getArcLabelFormat,
    getArcTitle,
    updateTargetsForArc,
    initArc,
    redrawArc,
    initGauge,
    getGaugeLabelHeight,
};
