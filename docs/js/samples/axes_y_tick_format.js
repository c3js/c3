var chart = c3.generate({
    data: {
        columns: [
            ['sample', 30, 200, 100, 400, 150, 2500]
        ]
    },
    axis : {
        y : {
            tick: {
                format: d3.format("$,")
//                format: function (d) { return "$" + d; }
            }
        }
    }
});
