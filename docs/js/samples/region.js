var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250, 400],
            ['data2', 830, 1200, 1100, 1400, 1150, 1250, 1500],
        ],
        axes: {
            data2: 'y2'
        }
    },
    axis: {
        y2: {
            show: true
        }
    },
    regions: [
        {axis: 'x', end: 1, class: 'regionX'},
        {axis: 'x', start: 2, end: 4, class: 'regionX'},
        {axis: 'x', start: 5, class: 'regionX'},
        {axis: 'y', end: 50, class: 'regionY'},
        {axis: 'y', start: 80, end: 140, class: 'regionY'},
        {axis: 'y', start: 400, class: 'regionY'},
        {axis: 'y2', end: 900, class: 'regionY2'},
        {axis: 'y2', start: 1150, end: 1250, class: 'regionY2'},
        {axis: 'y2', start: 1300, class: 'regionY2'},
    ]
});
