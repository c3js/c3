var chart = c3.generate({
    data: {
        x: 'x',
        columns: [
            ['x', '2013-10-31', '2013-12-31', '2014-01-31', '2014-02-28'],
            ['sample', 30, 100, 400, 150],
        ]
    },
    axis : {
        x : {
            type : 'timeseries',
            tick: {
                fit: true,
                format: "%e %b %y"
            }
        }
    }
});
