import { Chart } from './core';

Chart.prototype.tooltip = function () {};
Chart.prototype.tooltip.show = function (args) {
    var $$ = this.internal, targets, data, mouse = {};

    // determine mouse position on the chart
    if (args.mouse) {
        mouse = args.mouse;
    }
    else {
        // determine focus data
        if (args.data) {
            data = args.data;
        }
        else if (typeof args.x !== 'undefined') {
            if (args.id) {
                targets = $$.data.targets.filter(function(t){ return t.id === args.id; });
            } else {
                targets = $$.data.targets;
            }
            data = $$.filterByX(targets, args.x).slice(0,1)[0];
        }
        mouse = data ? $$.getMousePosition(data) : null;
    }

    // emulate mouse events to show
    $$.dispatchEvent('mousemove', mouse);

    $$.config.tooltip_onshow.call($$, data);
};
Chart.prototype.tooltip.hide = function () {
    // TODO: get target data by checking the state of focus
    this.internal.dispatchEvent('mouseout', 0);

    this.internal.config.tooltip_onhide.call(this);
};
