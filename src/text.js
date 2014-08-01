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
