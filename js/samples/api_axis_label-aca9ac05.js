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
        y: {
            label: 'Y Axis Label'
        },
        y2: {
            show: true,
            label: 'Y2 Axis Label'
        }
    }
});

setTimeout(function () {
    chart.axis.labels({y2: 'New Y2 Axis Label'});
}, 1000);

setTimeout(function () {
    chart.axis.labels({y: 'New Y Axis Label', y2: 'New Y2 Axis Label Again'});
}, 2000);
