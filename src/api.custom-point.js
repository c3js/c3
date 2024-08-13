import { Chart } from './chart'
import CLASS from './class'

Chart.prototype.setCustomPoint = function (ids, indices) {
  const $$ = this.internal, d3 = $$.d3;
  $$.main.selectAll('.' + CLASS.shapes).selectAll('.' + CLASS.shape).each(function (d, i) {
    const shape = d3.select(this), id = d.data ? d.data.id : d.id,
      isTargetId = !ids || ids.indexOf(id) >= 0,
      isTargetIndex = !indices || indices.indexOf(i) >= 0,
      isCustomPoint = shape.classed(CLASS.CUSTOM)

    if (shape.classed(CLASS.line) || shape.classed(CLASS.area)) {
      return;
    }
    if (isTargetId && isTargetIndex) {
      if (isCustomPoint) {
        $$.removeCustomPoint(d)
      }
      shape.classed(CLASS.CUSTOM, true)
      $$.setCustomPoint(d, i)
    } else {
      if (isCustomPoint) {
        shape.classed(CLASS.CUSTOM, false)
        $$.removeCustomPoint(d)
      }
    }
  });
};
