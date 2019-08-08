describe('c3 api donut', function () {
    'use strict';

    var chart, args;

    args = {
        data: {
            columns: [
                ['data1', 60],
                ['data2', 40]
            ],
            type: 'donut'
        },
        donut: {
            padAngle: 0.5
        }
    };

    beforeAll(function (done) {
        chart = window.initChart(chart, args, done);
    });

    it('can configure padAngle', function (done) {
        expect(chart.donut.padAngle()).toBe(0.5);

        const path = chart.internal.main.select('.c3-arc-data1').attr('d');

        chart.donut.padAngle(0.2);

        setTimeout(function () {
            expect(chart.donut.padAngle()).toBe(0.2);
            expect(chart.internal.main.select('.c3-arc-data1').attr('d')).not.toBe(path);
            done();
        }, 500);
    });

});
