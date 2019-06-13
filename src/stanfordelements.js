import {ChartInternal} from "./chart-internal";
import CLASS from "./class";

ChartInternal.prototype.initStanfordElements = function () {
    var $$ = this;

    // Avoid blocking eventRect
    $$.stanfordElements = $$.main.select('.' + CLASS.chart)
        .append('g').attr('class', CLASS.stanfordElements);

    $$.stanfordElements.append('g').attr('class', CLASS.stanfordLines);
    $$.stanfordElements.append('g').attr('class', CLASS.stanfordTexts);
    $$.stanfordElements.append('g').attr('class', CLASS.stanfordRegions);
};

ChartInternal.prototype.updateStanfordElements = function (duration) {
    var $$ = this, main = $$.main, config = $$.config,
        stanfordLine, stanfordLineEnter, stanfordRegion, stanfordRegionEnter, stanfordText, stanfordTextEnter,
        xvCustom = $$.xvCustom.bind($$), yvCustom = $$.yvCustom.bind($$), countPointsInRegion = $$.countEpochsInRegion.bind($$);

    // Stanford-Lines
    stanfordLine = main.select('.' + CLASS.stanfordLines)
        .style('shape-rendering', 'geometricprecision')
        .selectAll('.' + CLASS.stanfordLine)
        .data(config.stanford_lines);

    // enter
    stanfordLineEnter = stanfordLine.enter().append('g')
        .attr("class", function (d) { return CLASS.stanfordLine + (d['class'] ? ' ' + d['class'] : ''); });
    stanfordLineEnter.append('line')
        .attr("x1", (d) => config.axis_rotated ? yvCustom(d, 'value_y1') : xvCustom(d, 'value_x1'))
        .attr("x2", (d) => config.axis_rotated ? yvCustom(d, 'value_y2') : xvCustom(d, 'value_x2'))
        .attr("y1", (d) => config.axis_rotated ? xvCustom(d, 'value_x1') : yvCustom(d, 'value_y1'))
        .attr("y2", (d) => config.axis_rotated ? xvCustom(d, 'value_x2') : yvCustom(d, 'value_y2'))
        .style("opacity", 0);

    // update
    $$.stanfordLines = stanfordLineEnter.merge(stanfordLine);
    $$.stanfordLines.select('line')
        .transition().duration(duration)
        .attr("x1", (d) => config.axis_rotated ? yvCustom(d, 'value_y1') : xvCustom(d, 'value_x1'))
        .attr("x2", (d) => config.axis_rotated ? yvCustom(d, 'value_y2') : xvCustom(d, 'value_x2'))
        .attr("y1", (d) => config.axis_rotated ? xvCustom(d, 'value_x1') : yvCustom(d, 'value_y1'))
        .attr("y2", (d) => config.axis_rotated ? xvCustom(d, 'value_x2') : yvCustom(d, 'value_y2'))
        .style("opacity", 1);

    // exit
    stanfordLine.exit().transition().duration(duration)
        .style("opacity", 0)
        .remove();

    // Stanford-Text
    stanfordText = main.select('.' + CLASS.stanfordTexts).selectAll('.' + CLASS.stanfordText)
        .data(config.stanford_texts);

    // enter
    stanfordTextEnter = stanfordText.enter().append('g')
        .attr("class", function (d) { return CLASS.stanfordText + (d['class'] ? ' ' + d['class'] : ''); });
    stanfordTextEnter.append('text')
        .attr("x", (d) => config.axis_rotated ? yvCustom(d, 'y') : xvCustom(d, 'x'))
        .attr("y", (d) => config.axis_rotated ? xvCustom(d, 'x') : yvCustom(d, 'y'))
        .style("opacity", 0);

    // update
    $$.stanfordTexts = stanfordTextEnter.merge(stanfordText);
    $$.stanfordTexts.select('text')
        .transition().duration(duration)
        .attr("x", (d) => config.axis_rotated ? yvCustom(d, 'y') : xvCustom(d, 'x'))
        .attr("y", (d) => config.axis_rotated ? xvCustom(d, 'x') : yvCustom(d, 'y'))
        .text(function (d) { return d.content; })
        .style("opacity", 1);

    // exit
    stanfordText.exit().transition().duration(duration)
        .style("opacity", 0)
        .remove();

    // Stanford-Regions
    stanfordRegion = main.select('.' + CLASS.stanfordRegions).selectAll('.' + CLASS.stanfordRegion)
        .data(config.stanford_regions);

    // enter
    stanfordRegionEnter = stanfordRegion.enter().append('g')
        .attr("class", function (d) { return CLASS.stanfordRegion + (d['class'] ? ' ' + d['class'] : ''); });
    stanfordRegionEnter.append('polygon')
        .attr("points", (d) => {
            return d.points.map(value => {
                return [
                    config.axis_rotated ? yvCustom(value, 'y') : xvCustom(value, 'x'),
                    config.axis_rotated ? xvCustom(value, 'x') : yvCustom(value, 'y')
                ].join(",");
            }).join(" ");
        })
        .style("opacity", 0);
    stanfordRegionEnter.append('text')
        .attr("x", (d) => $$.getCentroid(d.points).x)
        .attr("y", (d) => $$.getCentroid(d.points).y)
        .style("opacity", 0);

    // update
    $$.stanfordRegions = stanfordRegionEnter.merge(stanfordRegion);
    $$.stanfordRegions.select('polygon')
        .transition().duration(duration)
        .attr("points", (d) => {
            return d.points.map(value => {
                return [
                    config.axis_rotated ? yvCustom(value, 'y') : xvCustom(value, 'x'),
                    config.axis_rotated ? xvCustom(value, 'x') : yvCustom(value, 'y')
                ].join(",");
            }).join(" ");
        })
        .style("opacity", (d) => { return d.opacity ? d.opacity : 0.2; });
    $$.stanfordRegions.select('text')
        .transition().duration(duration)
        .attr("x", (d) => config.axis_rotated ? yvCustom($$.getCentroid(d.points), 'y') : xvCustom($$.getCentroid(d.points), 'x'))
        .attr("y", (d) => config.axis_rotated ? xvCustom($$.getCentroid(d.points), 'x') : yvCustom($$.getCentroid(d.points), 'y'))
        .text(function (d) {
            if(d.text) {
                var value, percentage, temp;

                if($$.isStanfordGraphType()) {
                    temp = countPointsInRegion(d.points);
                    value = temp.value;
                    percentage = temp.percentage;
                }

                return d.text(value, percentage);
            }

            return "";
        })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("opacity", 1);
    // exit
    stanfordRegion.exit().transition().duration(duration)
        .style("opacity", 0)
        .remove();
};
