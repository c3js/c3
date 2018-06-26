var chart = c3.generate({
    data: {
        columns: [
            ['data1', 130, 200, 320, 400, 530, 750],
            ['data2', -130, 10, 130, 200, 150, 250],
            ['data3', -130, -50, -10, -200, -250, -150]
        ],
        type: 'bar',
        groups: [
            ['data1', 'data2', 'data3']
        ],
        order: 'desc' // stack order by sum of values descendantly. this is default.
//      order: 'asc'  // stack order by sum of values ascendantly.
//      order: null   // stack order by data definition.
    },
    grid: {
        y: {
            lines: [{value:0}]
        }
    }
});

setTimeout(function () {
    chart.load({
        columns: [
            ['data4', 1200, 1300, 1450, 1600, 1520, 1820],
        ]
    });
}, 1000);

setTimeout(function () {
    chart.load({
        columns: [
            ['data5', 200, 300, 450, 600, 520, 820],
        ]
    });
}, 2000);

setTimeout(function () {
    chart.groups([['data1', 'data2', 'data3', 'data4', 'data5']])
}, 3000);
