var chart = c3.generate({
    data: {
        columns: [
            ['sample', 30, 200, 100, 400, 150, 250, 30, 200, 100, 400, 150, 250, 30, 200, 100, 400, 150, 250, 200, 100, 400, 150, 250]
        ]
    },
    axis: {
        x: {
            type: 'category',
            tick: {
                culling: {
                    max: 4 // the number of tick texts will be adjusted to less than this value
                }
                // for normal axis, default on
                // for category axis, default off
            }
        }
    }
});
