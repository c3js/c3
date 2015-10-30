c3_chart_internal_fn.initFooter = function() {
  var $$ = this;
  if ($$.config.footer_show) {
      var padding_for_bottom_title = ($$.config.title_position.indexOf('bottom') !== -1 ? ($$.config.title_padding.top || 0) - ($$.config.title_padding.bottom || 0) : 0);
      $$.footer = $$.svg.append("rect")
            .attr("class", "c3-chart-footer")
            .attr("style", "fill: " + $$.config.footer_color)
            .attr("x", 0)
            .attr("y", $$.getCurrentHeight() - $$.config.footer_height - padding_for_bottom_title)
            .attr("width", $$.getCurrentWidth())
            .attr("height", $$.config.footer_height + padding_for_bottom_title);

      if ($$.config.footer_border_show) {
          $$.footerBorder = $$.svg.append("line")
                .attr("class", "c3-chart-footer-border")
                .attr("style", "stroke-width: " + $$.config.footer_border_width +
                      "; stroke: " + $$.config.footer_border_color)
                .attr("x1", 0)
                .attr("x2", $$.getCurrentWidth())
                .attr("y1", $$.getCurrentHeight() - $$.config.footer_height - padding_for_bottom_title)
                .attr("y2", $$.getCurrentHeight() - $$.config.footer_height - padding_for_bottom_title);
      }
  }
};
c3_chart_internal_fn.redrawFooter = function () {
    var $$ = this;
    if ($$.footer) {
        var padding_for_bottom_title = ($$.config.title_position.indexOf('bottom') !== -1 ? ($$.config.title_padding.top || 0) - ($$.config.title_padding.bottom || 0) : 0);
        $$.footer
            .attr("width", $$.getCurrentWidth())
            .attr("height", $$.config.footer_height + padding_for_bottom_title);
    }

    if ($$.footerBorder) {
        $$.footerBorder
            .attr("x2", $$.getCurrentWidth());
    }
};
