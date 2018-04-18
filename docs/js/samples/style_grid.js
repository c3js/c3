var chart = c3.generate({
    data: {
        columns: [
            ['data1', 100, 200, 1000, 900, 500]
        ]
    },
    grid: {
        x: {
            lines: [{value: 2}, {value: 4, class: 'grid4', text: 'LABEL 4'}]
        },
        y: {
            lines: [{value: 500}, {value: 800, class: 'grid800', text: 'LABEL 800'}]
        }
    }
});
