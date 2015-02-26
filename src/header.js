c3_chart_internal_fn.initHeader = function() {
  var $$ = this;
  if ($$.config.header_show) {
      $$.header = $$.svg.append("rect")
            .attr("class", "c3-chart-header")
            .attr("style", "fill: " + $$.config.header_color)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", $$.getCurrentWidth())
            .attr("height", $$.config.header_height);

      if ($$.config.header_border_show) {
          $$.headerBorder = $$.svg.append("line")
                .attr("class", "c3-chart-header-border")
                .attr("style", "stroke-width: " + $$.config.header_border_width +
                      "; stroke: " + $$.config.header_border_color)
                .attr("x1", 0)
                .attr("x2", $$.getCurrentWidth())
                .attr("y1", $$.config.header_height)
                .attr("y2", $$.config.header_height);
      }
  }
};
c3_chart_internal_fn.redrawHeader = function () {
    var $$ = this;
    if ($$.header) {
        $$.header
            .attr("width", $$.getCurrentWidth())
            .attr("height", $$.config.header_height);
    }

    if ($$.headerBorder) {
        $$.headerBorder
            .attr("x2", $$.getCurrentWidth());
    }
};
