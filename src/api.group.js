import { Chart } from './core';
import { isUndefined } from './util';

Chart.prototype.groups = function (groups) {
    var $$ = this.internal, config = $$.config;
    if (isUndefined(groups)) { return config.data_groups; }
    config.data_groups = groups;
    $$.redraw();
    return config.data_groups;
};
