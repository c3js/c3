// Features:
// 1. category axis
// 2. ceil values of translate/x/y to int for half pixel antialiasing
// 3. multiline tick text
var tickTextCharSize;
function c3_axis(d3, params) {
    var scale = d3.scale.linear(), orient = "bottom", innerTickSize = 6, outerTickSize, tickPadding = 3, tickValues = null, tickFormat, tickArguments;

    var tickOffset = 0, tickCulling = true, tickCentered;

    params = params || {};
    outerTickSize = params.withOuterTick ? 6 : 0;

    function axisX(selection, x) {
        selection.attr("transform", function (d) {
            return "translate(" + Math.ceil(x(d) + tickOffset) + ", 0)";
        });
    }
    function axisY(selection, y) {
        selection.attr("transform", function (d) {
            return "translate(0," + Math.ceil(y(d)) + ")";
        });
    }
    function scaleExtent(domain) {
        var start = domain[0], stop = domain[domain.length - 1];
        return start < stop ? [ start, stop ] : [ stop, start ];
    }
    function generateTicks(scale) {
        var i, domain, ticks = [];
        if (scale.ticks) {
            return scale.ticks.apply(scale, tickArguments);
        }
        domain = scale.domain();
        for (i = Math.ceil(domain[0]); i < domain[1]; i++) {
            ticks.push(i);
        }
        if (ticks.length > 0 && ticks[0] > 0) {
            ticks.unshift(ticks[0] - (ticks[1] - ticks[0]));
        }
        return ticks;
    }
    function copyScale() {
        var newScale = scale.copy(), domain;
        if (params.isCategory) {
            domain = scale.domain();
            newScale.domain([domain[0], domain[1] - 1]);
        }
        return newScale;
    }
    function textFormatted(v) {
        var formatted = tickFormat ? tickFormat(v) : v;
        return typeof formatted !== 'undefined' ? formatted : '';
    }
    function getSizeFor1Char(tick) {
        if (tickTextCharSize) {
            return tickTextCharSize;
        }
        var size = {
            h: 11.5,
            w: 5.5
        };
        tick.select('text').text(textFormatted).each(function (d) {
            var box = this.getBoundingClientRect(),
                text = textFormatted(d),
                h = box.height,
                w = text ? (box.width / text.length) : undefined;
            if (h && w) {
                size.h = h;
                size.w = w;
            }
        }).text('');
        tickTextCharSize = size;
        return size;
    }
    function transitionise(selection) {
        return params.withoutTransition ? selection : d3.transition(selection);
    }
    function axis(g) {
        g.each(function () {
            var g = axis.g = d3.select(this);

            var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = copyScale();

            var ticks = tickValues ? tickValues : generateTicks(scale1),
                tick = g.selectAll(".tick").data(ticks, scale1),
                tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", 1e-6),
                // MEMO: No exit transition. The reason is this transition affects max tick width calculation because old tick will be included in the ticks.
                tickExit = tick.exit().remove(),
                tickUpdate = transitionise(tick).style("opacity", 1),
                tickTransform, tickX, tickY;

            var range = scale.rangeExtent ? scale.rangeExtent() : scaleExtent(scale.range()),
                path = g.selectAll(".domain").data([ 0 ]),
                pathUpdate = (path.enter().append("path").attr("class", "domain"), transitionise(path));
            tickEnter.append("line");
            tickEnter.append("text");

            var lineEnter = tickEnter.select("line"),
                lineUpdate = tickUpdate.select("line"),
                textEnter = tickEnter.select("text"),
                textUpdate = tickUpdate.select("text");

            if (params.isCategory) {
                tickOffset = Math.ceil((scale1(1) - scale1(0)) / 2);
                tickX = tickCentered ? 0 : tickOffset;
                tickY = tickCentered ? tickOffset : 0;
            } else {
                tickOffset = tickX = 0;
            }

            var text, tspan, sizeFor1Char = getSizeFor1Char(g.select('.tick')), counts = [];
            var tickLength = Math.max(innerTickSize, 0) + tickPadding,
                isVertical = orient === 'left' || orient === 'right';

            // this should be called only when category axis
            function splitTickText(d, maxWidth) {
                var tickText = textFormatted(d),
                    subtext, spaceIndex, textWidth, splitted = [];

                if (Object.prototype.toString.call(tickText) === "[object Array]") {
                    return tickText;
                }

                if (!maxWidth || maxWidth <= 0) {
                    maxWidth = isVertical ? 95 : params.isCategory ? (Math.ceil(scale1(ticks[1]) - scale1(ticks[0])) - 12) : 110;
                }

                function split(splitted, text) {
                    spaceIndex = undefined;
                    for (var i = 1; i < text.length; i++) {
                        if (text.charAt(i) === ' ') {
                            spaceIndex = i;
                        }
                        subtext = text.substr(0, i + 1);
                        textWidth = sizeFor1Char.w * subtext.length;
                        // if text width gets over tick width, split by space index or crrent index
                        if (maxWidth < textWidth) {
                            return split(
                                splitted.concat(text.substr(0, spaceIndex ? spaceIndex : i)),
                                text.slice(spaceIndex ? spaceIndex + 1 : i)
                            );
                        }
                    }
                    return splitted.concat(text);
                }

                return split(splitted, tickText + "");
            }

            function tspanDy(d, i) {
                var dy = sizeFor1Char.h;
                if (i === 0) {
                    if (orient === 'left' || orient === 'right') {
                        dy = -((counts[d.index] - 1) * (sizeFor1Char.h / 2) - 3);
                    } else {
                        dy = ".71em";
                    }
                }
                return dy;
            }

            function tickSize(d) {
                var tickPosition = scale(d) + (tickCentered ? 0 : tickOffset);
                return range[0] < tickPosition && tickPosition < range[1] ? innerTickSize : 0;
            }

            text = tick.select("text");
            tspan = text.selectAll('tspan')
                .data(function (d, i) {
                    var splitted = params.tickMultiline ? splitTickText(d, params.tickWidth) : [].concat(textFormatted(d));
                    counts[i] = splitted.length;
                    return splitted.map(function (s) {
                        return { index: i, splitted: s };
                    });
                });
            tspan.enter().append('tspan');
            tspan.exit().remove();
            tspan.text(function (d) { return d.splitted; });

            var rotate = params.tickTextRotate;

            function textAnchorForText(rotate) {
                if (!rotate) {
                    return 'middle';
                }
                return rotate > 0 ? "start" : "end";
            }
            function textTransform(rotate) {
                if (!rotate) {
                    return '';
                }
                return "rotate(" + rotate + ")";
            }
            function dxForText(rotate) {
                if (!rotate) {
                    return 0;
                }
                return 8 * Math.sin(Math.PI * (rotate / 180));
            }
            function yForText(rotate) {
                if (!rotate) {
                    return tickLength;
                }
                return 11.5 - 2.5 * (rotate / 15) * (rotate > 0 ? 1 : -1);
            }

            switch (orient) {
            case "bottom":
                {
                    tickTransform = axisX;
                    lineEnter.attr("y2", innerTickSize);
                    textEnter.attr("y", tickLength);
                    lineUpdate.attr("x1", tickX).attr("x2", tickX).attr("y2", tickSize);
                    textUpdate.attr("x", 0).attr("y", yForText(rotate))
                        .style("text-anchor", textAnchorForText(rotate))
                        .attr("transform", textTransform(rotate));
                    tspan.attr('x', 0).attr("dy", tspanDy).attr('dx', dxForText(rotate));
                    pathUpdate.attr("d", "M" + range[0] + "," + outerTickSize + "V0H" + range[1] + "V" + outerTickSize);
                    break;
                }
            case "top":
                {
                    // TODO: rotated tick text
                    tickTransform = axisX;
                    lineEnter.attr("y2", -innerTickSize);
                    textEnter.attr("y", -tickLength);
                    lineUpdate.attr("x2", 0).attr("y2", -innerTickSize);
                    textUpdate.attr("x", 0).attr("y", -tickLength);
                    text.style("text-anchor", "middle");
                    tspan.attr('x', 0).attr("dy", "0em");
                    pathUpdate.attr("d", "M" + range[0] + "," + -outerTickSize + "V0H" + range[1] + "V" + -outerTickSize);
                    break;
                }
            case "left":
                {
                    tickTransform = axisY;
                    lineEnter.attr("x2", -innerTickSize);
                    textEnter.attr("x", -tickLength);
                    lineUpdate.attr("x2", -innerTickSize).attr("y1", tickY).attr("y2", tickY);
                    textUpdate.attr("x", -tickLength).attr("y", tickOffset);
                    text.style("text-anchor", "end");
                    tspan.attr('x', -tickLength).attr("dy", tspanDy);
                    pathUpdate.attr("d", "M" + -outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + -outerTickSize);
                    break;
                }
            case "right":
                {
                    tickTransform = axisY;
                    lineEnter.attr("x2", innerTickSize);
                    textEnter.attr("x", tickLength);
                    lineUpdate.attr("x2", innerTickSize).attr("y2", 0);
                    textUpdate.attr("x", tickLength).attr("y", 0);
                    text.style("text-anchor", "start");
                    tspan.attr('x', tickLength).attr("dy", tspanDy);
                    pathUpdate.attr("d", "M" + outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + outerTickSize);
                    break;
                }
            }
            if (scale1.rangeBand) {
                var x = scale1, dx = x.rangeBand() / 2;
                scale0 = scale1 = function (d) {
                    return x(d) + dx;
                };
            } else if (scale0.rangeBand) {
                scale0 = scale1;
            } else {
                tickExit.call(tickTransform, scale1);
            }
            tickEnter.call(tickTransform, scale0);
            tickUpdate.call(tickTransform, scale1);
        });
    }
    axis.scale = function (x) {
        if (!arguments.length) { return scale; }
        scale = x;
        return axis;
    };
    axis.orient = function (x) {
        if (!arguments.length) { return orient; }
        orient = x in {top: 1, right: 1, bottom: 1, left: 1} ? x + "" : "bottom";
        return axis;
    };
    axis.tickFormat = function (format) {
        if (!arguments.length) { return tickFormat; }
        tickFormat = format;
        return axis;
    };
    axis.tickCentered = function (isCentered) {
        if (!arguments.length) { return tickCentered; }
        tickCentered = isCentered;
        return axis;
    };
    axis.tickOffset = function () {
        return tickOffset;
    };
    axis.tickInterval = function () {
        var interval, length;
        if (params.isCategory) {
            interval = tickOffset * 2;
        }
        else {
            length = axis.g.select('path.domain').node().getTotalLength() - outerTickSize * 2;
            interval = length / axis.g.selectAll('line').size();
        }
        return interval === Infinity ? 0 : interval;
    };
    axis.ticks = function () {
        if (!arguments.length) { return tickArguments; }
        tickArguments = arguments;
        return axis;
    };
    axis.tickCulling = function (culling) {
        if (!arguments.length) { return tickCulling; }
        tickCulling = culling;
        return axis;
    };
    axis.tickValues = function (x) {
        if (typeof x === 'function') {
            tickValues = function () {
                return x(scale.domain());
            };
        }
        else {
            if (!arguments.length) { return tickValues; }
            tickValues = x;
        }
        return axis;
    };
    return axis;
}
