var chart = c3.generate({
    data: {
        x: 'x',
        xFormat: '%Y',
        columns: [
//            ['x', '2012-12-31', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05'],
            ['x', '2010', '2011', '2012', '2013', '2014', '2015'],
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 130, 340, 200, 500, 250, 350]
        ]
    },
    axis: {
        x: {
            type: 'timeseries',
            // if true, treat x value as localtime (Default)
            // if false, convert to UTC internally
            localtime: false,
            tick: {
                format: '%Y-%m-%d %H:%M:%S'
            }
        }
    }
});
