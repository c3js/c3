var chart = c3.generate({
    data: {
        x: 'date',
        columns: [
            ['date', '2014-01-01', '2014-01-10', '2014-01-20', '2014-01-30', '2014-02-01'],
            ['sample', 30, 200, 100, 400, 150, 250]
        ]
    },
    axis: {
        x: {
            type: 'timeseries'
        }
    },
    regions: [
        {start: '2014-01-05', end: '2014-01-10'},
        {start: new Date('2014/01/15'), end: new Date('20 Jan 2014')},
        {start: 1390575600000, end: 1391007600000} // start => 2014-01-25 00:00:00, end => 2014-01-30 00:00:00
    ]
});
