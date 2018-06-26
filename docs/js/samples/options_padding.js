var chart = c3.generate({
    padding: {
        top: 40,
        right: 100,
        bottom: 40,
        left: 100,
    },
    data: {
        columns: [
            ['sample', 30, 200, 100, 400, 150, 250000000000]
        ]
    }
});
