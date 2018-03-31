var chart = c3.generate({
    data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250, 50, 100, 250]
        ]
    },
    axis: {
        x: {
            type: 'category',
            categories: ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6', 'cat7', 'cat8', 'cat9']
        }
    }
});
