c3_chart_internal_fn.initText = function () {
    var $$ = this, CLASS = $$.CLASS;
    $$.main.select('.' + CLASS[_chart]).append("g")
        .attr("class", CLASS[_chartTexts]);
    $$.mainText = $$.d3.selectAll([]);
};
c3_chart_internal_fn.updateTargetsForText = function (targets) {
    var $$ = this, CLASS = $$.CLASS, mainTextUpdate, mainTextEnter,
        classChartText = $$.classChartText.bind($$),
        classTexts = $$.classTexts.bind($$);
    mainTextUpdate = $$.main.select('.' + CLASS[_chartTexts]).selectAll('.' + CLASS[_chartText])
        .data(targets)
        .attr('class', classChartText);
    mainTextEnter = mainTextUpdate.enter().append('g')
        .attr('class', classChartText)
        .style('opacity', 0)
        .style("pointer-events", "none");
    mainTextEnter.append('g')
        .attr('class', classTexts);
};
c3_chart_internal_fn.redrawText = function (durationForExit) {
    var $$ = this, config = $$.config, CLASS = $$.CLASS;
    $$.mainText = $$.main.selectAll('.' + CLASS[_texts]).selectAll('.' + CLASS[_text])
        .data(generateCall($$.barOrLineData, $$));
    $$.mainText.enter().append('text')
        .attr("class", generateCall($$.classText, $$))
        .attr('text-anchor', function (d) { return config[__axis_rotated] ? (d.value < 0 ? 'end' : 'start') : 'middle'; })
        .style("stroke", 'none')
        .style("fill", function (d) { return $$.color(d); })
        .style("fill-opacity", 0);
    $$.mainText
        .text(function (d) { return $$.formatByAxisId($$.getAxisId(d.id))(d.value, d.id); });
    $$.mainText.exit()
        .transition().duration(durationForExit)
        .style('fill-opacity', 0)
        .remove();
};
c3_chart_internal_fn.addTransitionForText = function (transitions, xForText, yForText, forFlow) {
    var $$ = this;
    transitions.push($$.mainText.transition()
                     .attr('x', xForText)
                     .attr('y', yForText)
                     .style("fill", $$.color)
                     .style("fill-opacity", forFlow ? 0 : generateCall($$.opacityForText, $$)));
};
c3_chart_internal_fn.getTextRect = function (text, cls) {
    var rect;
    this.d3.select('body').selectAll('.dummy')
        .data([text])
      .enter().append('text')
        .classed(cls ? cls : "", true)
        .text(text)
      .each(function () { rect = this.getBoundingClientRect(); })
        .remove();
    return rect;
};
