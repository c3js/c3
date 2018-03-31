var chart = c3.generate({
    data: {
        columns: [
            ['sample', 30, 200, 100, 400, 150, 250]
        ]
    },
    axis: {
        y: {
            max: 400,
            min: -400,
            // Range includes padding, set 0 if no padding needed
            // padding: {top:0, bottom:0}
        }
    }
});
