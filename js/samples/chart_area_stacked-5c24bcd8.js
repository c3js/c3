var chart = c3.generate({
    data: {
        columns: [
            ['data1', 300, 350, 300, 0, 0, 120],
            ['data2', 130, 100, 140, 200, 150, 50]
        ],
        types: {
            data1: 'area-spline',
            data2: 'area-spline'
            // 'line', 'spline', 'step', 'area', 'area-step' are also available to stack
        },
        groups: [['data1', 'data2']]
    }
});
