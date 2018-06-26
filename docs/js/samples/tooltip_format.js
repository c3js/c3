var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30000, 20000, 10000, 40000, 15000, 250000],
            ['data2', 100, 200, 100, 40, 150, 250]
        ],
        axes: {
            data2: 'y2'
        }
    },
    axis : {
        y : {
            tick: {
                format: d3.format("s")
            }
        },
        y2: {
            show: true,
            tick: {
                format: d3.format("$")
            }
        }
    },
    tooltip: {
        format: {
            title: function (d) { return 'Data ' + d; },
            value: function (value, ratio, id) {
                var format = id === 'data1' ? d3.format(',') : d3.format('$');
                return format(value);
            }
//            value: d3.format(',') // apply this format to both y and y2
        }
    }
});
