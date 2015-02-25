c3_chart_internal_fn.initTitle = function () {
    var $$ = this;
    $$.title = $$.svg.append("text")
          .text($$.config.title_text)
          .attr("class", "c3-chart-title")
          .attr("x", $$.config.title_x)
          .attr("y", $$.config.title_y);
};

c3_chart_internal_fn.redrawTitle = function () {
    var $$ = this;
    $$.title
          .attr("x", $$.config.title_x)
          .attr("y", $$.config.title_y || $$.title.node().getBBox().height);
};