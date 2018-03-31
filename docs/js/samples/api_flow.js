var chart = c3.generate({
    data: {
        x: 'x',
        columns: [
            ['x', '2012-12-29', '2012-12-30', '2012-12-31'],
            ['data1', 230, 300, 330],
            ['data2', 190, 230, 200],
            ['data3', 90, 130, 180],
        ]
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%m/%d',
            }
        }
    }
});

setTimeout(function () {
    chart.flow({
        columns: [
            ['x', '2013-01-11', '2013-01-21'],
            ['data1', 500, 200],
            ['data2', 100, 300],
            ['data3', 200, 120],
        ],
        duration: 1500,
        done: function () {
            chart.flow({
                columns: [
                    ['x', '2013-02-11', '2013-02-12', '2013-02-13', '2013-02-14'],
                    ['data1', 200, 300, 100, 250],
                    ['data2', 100, 90, 40, 120],
                    ['data3', 100, 100, 300, 500]
                ],
                length: 0,
                duration: 1500,
                done: function () {
                    chart.flow({
                        columns: [
                            ['x', '2013-03-01', '2013-03-02'],
                            ['data1', 200, 300],
                            ['data2', 150, 250],
                            ['data3', 100, 100]
                        ],
                        length: 2,
                        duration: 1500,
                        done: function () {
                            chart.flow({
                                columns: [
                                    ['x', '2013-03-21', '2013-04-01'],
                                    ['data1', 500, 200],
                                    ['data2', 100, 150],
                                    ['data3', 200, 400]
                                ],
                                to: '2013-03-01',
                                duration: 1500,
                            });
                        }
                    });
                }
            });
        },
    });
}, 1000);
