var chart = c3.generate({
    data: {
        x : 'x',
        columns: [
            ['x', 'www.somesitename1.com', 'www.somesitename2.com', 'www.somesitename3.com', 'www.somesitename4.com', 'www.somesitename5.com', 'www.somesitename6.com', 'www.somesitename7.com', 'www.somesitename8.com', 'www.somesitename9.com', 'www.somesitename10.com', 'www.somesitename11.com', 'www.somesitename12.com'],
            ['pv', 90, 100, 140, 200, 100, 400, 90, 100, 140, 200, 100, 400],
        ],
        type: 'bar'
    },
    axis: {
        x: {
            type: 'category',
            tick: {
                rotate: 75,
                multiline: false
            },
            height: 130
        }
    }
});
