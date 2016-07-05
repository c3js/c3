describe('c3 api pie', function () {
    'use strict';

    var chart;

    var args = {
        data: {
            columns: [
                ['data1', 30],
                ['data2', 1000],
                ['data3', 5000]
            ]
        },
        type: 'pie',
        pie: {
            explodeRadius: 10
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('explodeRadius', function(){
        it('should get explode radius', function(){
            expect(chart.pie.explodeRadius()).toBe(10);
        });

        it('should set explode radius', function(){
            chart.pie.explodeRadius(20);
            expect(chart.pie.explodeRadius()).toBe(20);
        });
    });
});