// Features:
// 1. category axis
// 2. ceil values of translate/x/y to int for half pixel antialiasing
function c3_axis(d3, isCategory) {
    var scale = d3.scale.linear(), orient = "bottom", innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickValues = null, tickFormat, tickArguments;

    var tickOffset = 0, tickCulling = true, tickCentered;

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
        if (isCategory) {
            domain = scale.domain();
            newScale.domain([domain[0], domain[1] - 1]);
        }
        return newScale;
    }
    function textFormatted(v) {
        return tickFormat ? tickFormat(v) : v;
    }
    function axis(g) {
        g.each(function () {
            var g = d3.select(this);
            var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = copyScale();

            var ticks = tickValues ? tickValues : generateTicks(scale1),
                tick = g.selectAll(".tick").data(ticks, scale1),
                tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", 1e-6),
                // MEMO: No exit transition. The reason is this transition affects max tick width calculation because old tick will be included in the ticks.
                tickExit = tick.exit().remove(),
                tickUpdate = d3.transition(tick).style("opacity", 1),
                tickTransform, tickX;

            var range = scale.rangeExtent ? scale.rangeExtent() : scaleExtent(scale.range()),
                path = g.selectAll(".domain").data([ 0 ]),
                pathUpdate = (path.enter().append("path").attr("class", "domain"), d3.transition(path));
            tickEnter.append("line");
            tickEnter.append("text");

            var lineEnter = tickEnter.select("line"),
                lineUpdate = tickUpdate.select("line"),
                text = tick.select("text").text(textFormatted),
                textEnter = tickEnter.select("text"),
                textUpdate = tickUpdate.select("text");

            if (isCategory) {
                tickOffset = Math.ceil((scale1(1) - scale1(0)) / 2);
                tickX = tickCentered ? 0 : tickOffset;
            } else {
                tickOffset = tickX = 0;
            }

            function tickSize(d) {
                var tickPosition = scale(d) + tickOffset;
                return range[0] < tickPosition && tickPosition < range[1] ? innerTickSize : 0;
            }

            switch (orient) {
            case "bottom":
                {
                    tickTransform = axisX;
                    lineEnter.attr("y2", innerTickSize);
                    textEnter.attr("y", Math.max(innerTickSize, 0) + tickPadding);
                    lineUpdate.attr("x1", tickX).attr("x2", tickX).attr("y2", tickSize);
                    textUpdate.attr("x", 0).attr("y", Math.max(innerTickSize, 0) + tickPadding);
                    text.attr("dy", ".71em").style("text-anchor", "middle");
                    pathUpdate.attr("d", "M" + range[0] + "," + outerTickSize + "V0H" + range[1] + "V" + outerTickSize);
                    break;
                }
            case "top":
                {
                    tickTransform = axisX;
                    lineEnter.attr("y2", -innerTickSize);
                    textEnter.attr("y", -(Math.max(innerTickSize, 0) + tickPadding));
                    lineUpdate.attr("x2", 0).attr("y2", -innerTickSize);
                    textUpdate.attr("x", 0).attr("y", -(Math.max(innerTickSize, 0) + tickPadding));
                    text.attr("dy", "0em").style("text-anchor", "middle");
                    pathUpdate.attr("d", "M" + range[0] + "," + -outerTickSize + "V0H" + range[1] + "V" + -outerTickSize);
                    break;
                }
            case "left":
                {
                    tickTransform = axisY;
                    lineEnter.attr("x2", -innerTickSize);
                    textEnter.attr("x", -(Math.max(innerTickSize, 0) + tickPadding));
                    lineUpdate.attr("x2", -innerTickSize).attr("y2", 0);
                    textUpdate.attr("x", -(Math.max(innerTickSize, 0) + tickPadding)).attr("y", tickOffset);
                    text.attr("dy", ".32em").style("text-anchor", "end");
                    pathUpdate.attr("d", "M" + -outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + -outerTickSize);
                    break;
                }
            case "right":
                {
                    tickTransform = axisY;
                    lineEnter.attr("x2", innerTickSize);
                    textEnter.attr("x", Math.max(innerTickSize, 0) + tickPadding);
                    lineUpdate.attr("x2", innerTickSize).attr("y2", 0);
                    textUpdate.attr("x", Math.max(innerTickSize, 0) + tickPadding).attr("y", 0);
                    text.attr("dy", ".32em").style("text-anchor", "start");
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
    axis.tickOffset = function () { // This will be overwritten when normal x axis
        return tickOffset;
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
