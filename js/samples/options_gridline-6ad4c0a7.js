var chart = c3.generate({
    data: {
        columns: [
            ['sample', 30, 200, 100, 400, 150, 250, 120, 200]
        ]
    },
    grid: {
        x: {
            show: true
        },
        y: {
            show: true
        }
    }
});
