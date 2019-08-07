describe('c3 api pie', function () {
    'use strict';

    var chart, args;

    args = {
        data: {
            columns: [
                ['data1', 60],
                ['data2', 40]
            ],
            type: 'pie'
        },
        pie: {
            padAngle: 0.5
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    it('can configure padAngle', function (done) {
        expect(chart.pie.padAngle()).toBe(0.5);

        const path = d3.select('.c3-arc-data1').attr('d');

        chart.pie.padAngle(0.2);

        setTimeout(function () {
            expect(chart.pie.padAngle()).toBe(0.2);
            expect(d3.select('.c3-arc-data1').attr('d')).not.toBe(path);
            done();
        }, 500);
    });

});
