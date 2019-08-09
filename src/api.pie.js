import { Chart } from './core';

Chart.prototype.pie = function() {};

Chart.prototype.pie.padAngle = function (padAngle) {
    if (padAngle === undefined) {
        return this.internal.config.pie_padAngle;
    }
    this.internal.config.pie_padAngle = padAngle;
    this.flush();
};
