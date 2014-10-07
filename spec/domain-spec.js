var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

var initDom = window.initDom;

describe('c3 chart axis', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25]
            ]
        },
        axis: {
            y: {},
            y2: {}
        }
    };

    beforeEach(function (done) {
        if (typeof chart === 'undefined') {
            initDom();
        }
        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
        chart.internal.d3.select('.jasmine_html-reporter').style('display', 'none');

        window.setTimeout(function () {
            done();
        }, 10);
    });

    describe('axis.y.min', function () {

        it('should change axis.y.min to -100', function () {
            args.axis.y.min = -100;
            expect(true).toBeTruthy();
        });

        it('should be set properly when smaller than max of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).toBe(-150);
            expect(domain[1]).toBe(450);
        });

        it('should change axis.y.min to 500', function () {
            args.axis.y.min = 500;
            expect(true).toBeTruthy();
        });

        it('should be set properly when bigger than max of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).toBe(499);
            expect(domain[1]).toBe(511);
        });

        it('should change axis.y.min to undefined', function () {
            args.axis.y.min = undefined;
            expect(true).toBeTruthy();
        });

    });

    describe('axis.y.max', function () {

        it('should change axis.y.max to 1000', function () {
            args.axis.y.max = 1000;
            expect(true).toBeTruthy();
        });

        it('should be set properly when bigger than min of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).toBe(-89);
            expect(domain[1]).toBe(1099);
        });

        it('should change axis.y.max to 0', function () {
            args.axis.y.max = 0;
            expect(true).toBeTruthy();
        });

        it('should be set properly when smaller than min of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).toBe(-11);
            expect(domain[1]).toBe(1);
        });

    });

});
