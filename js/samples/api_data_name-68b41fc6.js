var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ],
        names: {
            data1: 'Name 1',
            data2: 'Name 2'
        }
    }
});

setTimeout(function () {
    chart.data.names({data1: 'New name for data1', data2: 'New name for data2'});
}, 1000);

setTimeout(function () {
    chart.data.names({data1: 'New name for data1 again'});
}, 2000);

