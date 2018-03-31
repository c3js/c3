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
            padding: {top: 200, bottom: 0}
        },
        y2: {
            padding: {top: 100, bottom: 100},
            show: true
        }
    }
});
