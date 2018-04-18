var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25],
            ['data3', 500, 320, 210, 340, 215, 125]
        ]
    },
    tooltip: {
        grouped: false // Default true
    }
});