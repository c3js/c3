import {ChartInternal} from './core';
import {isFunction, sanitise} from "./util";

ChartInternal.prototype.isStanfordGraphType = function () {
    var $$ = this;

    return $$.config.data_type === 'stanford';
};

ChartInternal.prototype.initStanfordData = function () {
    var $$ = this,
        d3 = $$.d3,
        config = $$.config,
        target = $$.data.targets[0],
        epochs,
        maxEpochs,
        minEpochs;

    // Make larger values appear on top
    target.values.sort(compareEpochs);

    // Get array of epochs
    epochs = target.values.map(a => a.epochs);

    minEpochs = !isNaN(config.stanford_scaleMin) ? config.stanford_scaleMin : d3.min(epochs);
    maxEpochs = !isNaN(config.stanford_scaleMax) ? config.stanford_scaleMax : d3.max(epochs);

    if (minEpochs > maxEpochs) {
        throw Error("Number of minEpochs has to be smaller than maxEpochs");
    }

    target.colors = isFunction(config.stanford_colors) ? config.stanford_colors : d3.interpolateHslLong(d3.hsl(250, 1, 0.5), d3.hsl(0, 1, 0.5));

    target.colorscale = d3.scaleSequentialLog(target.colors)
        .domain([minEpochs, maxEpochs]);

    target.minEpochs = minEpochs;
    target.maxEpochs = maxEpochs;
};

ChartInternal.prototype.getStanfordPointColor = function (d) {
    var $$ = this,
        target = $$.data.targets[0];

    return target.colorscale(d.epochs);
};

// http://jsfiddle.net/Xotic750/KtzLq/
ChartInternal.prototype.getCentroid = function (points) {
    var area = getRegionArea(points);

    var x = 0,
        y = 0,
        i,
        j,
        f,
        point1,
        point2;

    for (i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        point1 = points[i];
        point2 = points[j];
        f = point1.x * point2.y - point2.x * point1.y;
        x += (point1.x + point2.x) * f;
        y += (point1.y + point2.y) * f;
    }

    f = area * 6;

    return {
        x: x / f,
        y: y / f
    };
};

ChartInternal.prototype.getStanfordTooltipTitle = function (d) {
    var $$ = this,
        labelX = $$.axis.getLabelText('x'),
        labelY = $$.axis.getLabelText('y');

    return `
      <tr><th>${labelX ? sanitise(labelX) : "x"}</th><th class='value'>${d.x}</th></tr>
      <tr><th>${labelY ? sanitise(labelY) : "y"}</th><th class='value'>${d.value}</th></tr>
    `;
};

ChartInternal.prototype.countEpochsInRegion = function (region) {
    var $$ = this,
        target = $$.data.targets[0],
        total, count;

    total = target.values.reduce((accumulator, currentValue) => accumulator + Number(currentValue.epochs), 0);

    count = target.values.reduce((accumulator, currentValue) => {
        if(pointInRegion(currentValue, region)) {
            return accumulator + Number(currentValue.epochs);
        }

        return accumulator;
    }, 0);

    return {
        value: count,
        percentage: count !== 0 ? (count / total * 100).toFixed(1) : 0
    };
};

export var getRegionArea = function(points) { // thanks to: https://stackoverflow.com/questions/16282330/find-centerpoint-of-polygon-in-javascript
    var area = 0,
        i,
        j,
        point1,
        point2;

    for (i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        point1 = points[i];
        point2 = points[j];
        area += point1.x * point2.y;
        area -= point1.y * point2.x;
    }

    area /= 2;

    return area;
};

export var pointInRegion = function(point, region) { // thanks to: http://bl.ocks.org/bycoffe/5575904
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    let xi, yi, yj, xj, intersect,
        x = point.x,
        y = point.value,
        inside = false;

    for (let i = 0, j = region.length - 1; i < region.length; j = i++) {

        xi = region[i].x;
        yi = region[i].y;

        xj = region[j].x;
        yj = region[j].y;

        intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
};

export var compareEpochs = function(a, b) {
    if (a.epochs < b.epochs) {
        return -1;
    }
    if (a.epochs > b.epochs) {
        return 1;
    }

    return 0;
};
