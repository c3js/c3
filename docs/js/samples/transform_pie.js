var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 130, 100, 140, 200, 150, 50]
        ]
    }
});

setTimeout(function () {
    chart.transform('pie');
}, 1000);

setTimeout(function () {
    chart.transform('line');
}, 2000);

setTimeout(function () {
    chart.transform('pie');
}, 3000);
