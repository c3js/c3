var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, -200, -100, 400, 150, 250],
            ['data2', -50, 150, -150, 150, -50, -150],
            ['data3', -100, 100, -40, 100, -150, -50]
        ],
        groups: [
            ['data1', 'data2']
        ],
        type: 'bar',
        labels: true
    },
    grid: {
        y: {
            lines: [{value: 0}]
        }
    }
});
