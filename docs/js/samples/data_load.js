var chart = c3.generate({
    data: {
        url: '/data/c3_test.csv',
        type: 'line'
    }
});

setTimeout(function () {
    chart.load({
        url: '/data/c3_test2.csv'
    });
}, 1000);

setTimeout(function () {
    chart.load({
        columns: [
            ['data1', 130, 120, 150, 140, 160, 150],
            ['data4', 30, 20, 50, 40, 60, 50],
        ],
        unload: ['data2', 'data3'],
    });
}, 2000);

setTimeout(function () {
    chart.load({
        rows: [
            ['data2', 'data3'],
            [120, 300],
            [160, 240],
            [200, 290],
            [160, 230],
            [130, 300],
            [220, 320],
        ],
        unload: 'data4',
    });
}, 3000);

setTimeout(function () {
    chart.load({
        columns:[
            ['data4', 30, 20, 50, 40, 60, 50,100,200]
        ],
        type: 'bar'
    });
}, 4000);

setTimeout(function () {
    chart.unload({
        ids: 'data4'
    });
}, 5000);

setTimeout(function () {
    chart.load({
        columns:[
            ['data2', null, 30, 20, 50, 40, 60, 50]
        ]
    });
}, 6000);

setTimeout(function () {
    chart.unload();
}, 7000);

setTimeout(function () {
    chart.load({
        rows: [
            ['data4', 'data2', 'data3'],
            [90, 120, 300],
            [40, 160, 240],
            [50, 200, 290],
            [120, 160, 230],
            [80, 130, 300],
            [90, 220, 320],
        ],
        type: 'bar'
    });
}, 8000);

setTimeout(function () {
    chart.load({
        rows: [
            ['data5', 'data6'],
            [190, 420],
            [140, 460],
            [150, 500],
            [220, 460],
            [180, 430],
            [190, 520],
        ],
        type: 'line'
    });
}, 9000);

setTimeout(function () {
    chart.unload({
        ids: ['data2', 'data3']
    });
}, 10000);
