var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ],
        axes: {
            data1: 'y',
            data2: 'y2'
        }
    },
    axis: {
        y2: {
            show: true,
        }
    }
});

setTimeout(function () {
    chart.axis.max(500);
}, 1000);

setTimeout(function () {
    chart.axis.min(-500);
}, 2000);

setTimeout(function () {
    chart.axis.max({y: 600, y2: 100});
}, 3000);

setTimeout(function () {
    chart.axis.min({y: -600, y2: -100});
}, 4000);

setTimeout(function () {
    chart.axis.range({max: 1000, min: -1000});
}, 5000);

setTimeout(function () {
    chart.axis.range({max: {y: 600, y2: 100}, min: {y: -100, y2: 0}});
}, 6000);

setTimeout(function () {
    chart.axis.max({x: 10});
}, 7000);

setTimeout(function () {
    chart.axis.min({x: -10});
}, 8000);

setTimeout(function () {
    chart.axis.range({max: {x: 5}, min: {x: 0}});
}, 9000);
