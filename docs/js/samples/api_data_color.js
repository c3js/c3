var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, 20, 50, 40, 60, 50],
            ['data2', 200, 130, 90, 240, 130, 220],
            ['data3', 300, 200, 160, 400, 250, 250]
        ],
        type: 'bar',
        colors: {
            data1: '#ff0000',
            data2: '#00ff00',
            data3: '#0000ff'
        },
        labels: true
    }
});

setTimeout(function () {
    chart.data.colors({
        data1: d3.rgb('#ff0000').darker(1),
        data2: d3.rgb('#00ff00').darker(1),
        data3: d3.rgb('#0000ff').darker(1),
    });
}, 1000);

setTimeout(function () {
    chart.data.colors({
        data1: d3.rgb('#ff0000').darker(2),
        data2: d3.rgb('#00ff00').darker(2),
        data3: d3.rgb('#0000ff').darker(2),
    });
}, 2000);
