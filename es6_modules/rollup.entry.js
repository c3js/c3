// This file is only the entry point for rollup
import {
    ChartInternal
} from './chartinternal.js';
import {
    Chart
} from './chart.js';
import {
    Axis
} from './axis.js';


var version = "0.4.11",
    generate = function(config) {
        return new Chart(config);
    },
    chart = {
        fn: Chart.prototype,
        internal: {
            fn: ChartInternal.prototype,
            axis: {
                fn: Axis.prototype
            }
        }
    };

export {
    version,
    generate,
    chart
}
