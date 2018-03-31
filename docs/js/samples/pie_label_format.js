var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30],
            ['data2', 50]
        ],
        type: 'pie'
    },
    pie: {
        label: {
            format: function (value, ratio, id) {
                return d3.format('$')(value);
            }
        }
    }
});
