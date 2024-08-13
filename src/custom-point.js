import { ChartInternal } from './chart-internal';
import CLASS from './class';

ChartInternal.prototype.setCustomPoint = function (d) {
  const $$ = this, config = $$.config,
    cx = (config.axis_rotated ? $$.circleY : $$.circleX).bind($$),
    cy = (config.axis_rotated ? $$.circleX : $$.circleY).bind($$);

  if (config.context.customPointsHandler && config.context.customPointsHandler.append) {
    const containerClass = CLASS.customPoints + $$.getTargetSelectorSuffix(d.id);
    const customPointClass = CLASS.customPoint + '-' + d.index;
    const customPointClasses = $$.generateClass(CLASS.customPoint, d.index);
    config.context.customPointsHandler.append({ chartInternal: $$, d, cx, cy, containerClass, customPointClass, customPointClasses });
  }
};

ChartInternal.prototype.removeCustomPoint = function(d) {
  const $$ = this, config = $$.config;
  const containerClass = CLASS.customPoints + $$.getTargetSelectorSuffix(d.id);
  const customPointClass = CLASS.customPoint + '-' + d.index;

  if (config.context.customPointsHandler && config.context.customPointsHandler.remove) {
    config.context.customPointsHandler.remove({ chartInternal: $$, d, containerClass, customPointClass });
  }
};
