import {ChartInternal} from './chart-internal';

/**
 * The Chart class
 *
 * The methods of this class is the public APIs of the chart object.
 */
export function Chart(config) {
    this.internal = new ChartInternal(this);
    this.internal.loadConfig(config);

    this.internal.beforeInit(config);
    this.internal.init();
    this.internal.afterInit(config);

    // bind "this" to nested API
    (function bindThis(fn, target, argThis) {
        Object.keys(fn).forEach(function (key) {
            target[key] = fn[key].bind(argThis);
            if (Object.keys(fn[key]).length > 0) {
                bindThis(fn[key], target[key], argThis);
            }
        });
    })(Chart.prototype, this, this);
}
