var chart = c3.generate({
    data: {
        url: '/data/c3_test.csv'
    },
    transition: {
        duration: 100
    }
});

setTimeout(function () {
    chart.load({
        url: '/data/c3_test2.csv'
    });
}, 500);

setTimeout(function () {
    chart.load({
        columns: [
            ['data1', 30, 20, 50, 40, 60, 50],
            ['data2', 200, 130, 90, 240, 130, 220],
            ['data3', 300, 200, 160, 400, 250, 250]
        ]
    });
}, 1000);

setTimeout(function () {
    chart.load({
        rows: [
            ['data1', 'data2', 'data3'],
            [90, 120, 300],
            [40, 160, 240],
            [50, 200, 290],
            [120, 160, 230],
            [80, 130, 300],
            [90, 220, 320],
        ]
    });
}, 1500);

setTimeout(function () {
    chart.load({
        columns:[
            ['data1', null, 30, 20, 50, 40, 60, 50, 100, 200]
        ]
    });
}, 2000);
