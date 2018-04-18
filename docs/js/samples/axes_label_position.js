var chart = c3.generate({
    data: {
        columns: [
            ['sample1', 30, 200, 100, 400, 150, 250],
            ['sample2', 430, 300, 500, 400, 650, 250]
        ],
        axes: {
            sample1: 'y',
            sample2: 'y2'
        }
    },
    axis: {
        x: {
            label: {
                text: 'X Label',
                position: 'outer-center'
                // inner-right : default
                // inner-center
                // inner-left
                // outer-right
                // outer-center
                // outer-left
            }
        },
        y: {
            label: {
                text: 'Y Label',
                position: 'outer-middle'
                // inner-top : default
                // inner-middle
                // inner-bottom
                // outer-top
                // outer-middle
                // outer-bottom
            }
        },
        y2: {
            show: true,
            label: {
                text: 'Y2 Label',
                position: 'outer-middle'
                // inner-top : default
                // inner-middle
                // inner-bottom
                // outer-top
                // outer-middle
                // outer-bottom
            }
        }
    }
});
