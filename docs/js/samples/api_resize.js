var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ]
    }
});

setTimeout(function () {
    chart.resize({height:100, width:300})
}, 1000);

setTimeout(function () {
    chart.resize({height:200})
}, 2000);

setTimeout(function () {
    chart.resize();
}, 3000);