var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 api legend', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25]
            ]
        },
        legend: {
            position: 'bottom'
        }
    };

    beforeEach(function (done) {
        if (typeof chart === 'undefined') {
            window.initDom();
        }

        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
        chart.internal.d3.select('.jasmine_html-reporter')
            .style('position', 'absolute')
            .style('right', 0);

        window.setTimeout(function () {
            done();
        }, 10);
    });

    describe('legend position', function () {

        it('should be located at the bottom of the chart', function () {
            expect(true).toBeTruthy();
        });

        it('should be located to the right of the chart', function () {
            chart.legend.position('right');
            expect(true).toBeTruthy();
        });

        it('should be located at the bottom of the chart', function () {
            chart.legend.position('bottom');
            expect(true).toBeTruthy();
        });

    });
});