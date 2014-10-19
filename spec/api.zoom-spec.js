var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 api zoom', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25],
                ['data3', 150, 120, 110, 140, 115, 125]
            ]
        },
        zoom: {
            enabled: true
        }
    };

    beforeEach(function (done) {
        if (typeof chart === 'undefined') {
            window.initDom();
        }
        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
//        chart.internal.d3.select('.jasmine_html-reporter').style('display', 'none');

        window.setTimeout(function () {
            done();
        }, 10);
    });

    describe('zoom', function () {

        it('should be zoomed properly', function () {
            chart.zoom([3, 5]);
            var domain = chart.internal.x.domain();
            expect(domain[0]).toBe(3);
            expect(domain[1]).toBe(5);
        });

        it('should be zoomed properly again', function () {
            chart.zoom([1, 4]);
            var domain = chart.internal.x.domain();
            expect(domain[0]).toBe(1);
            expect(domain[1]).toBe(4);
        });

    });

    describe('unzoom', function () {

        it('should be unzoomed properly', function () {
            var domain;

            chart.zoom([1, 4]);
            domain = chart.internal.x.domain();
            expect(domain[0]).toBe(1);
            expect(domain[1]).toBe(4);

            chart.unzoom();
            domain = chart.internal.x.domain();
            expect(domain[0]).toBe(-0.05);
            expect(domain[1]).toBe(5.05);
        });

    });

});
